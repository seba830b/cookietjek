#!/usr/bin/env node
// Fetch a freely licensed dish photo for a recipe and register it in src/images.mjs.
//
// Usage:
//   node meal-prep/src/tools/fetch-image.mjs <recipeId> "<search terms>" [--pick N] [--list]
//        [--thumbs <dir>] [--wiki <Wikipedia title>]
//
//   --list          print candidates (index, title, author, license, size, url); no download
//   --pick N        download candidate N (default 0); a non-numeric value picks the candidate
//                   whose image or source URL contains it (e.g. a Flickr photo id, 4+ chars)
//   --thumbs <dir>  with --list: also save small preview thumbnails to <dir>/<index>.jpg
//   --wiki <Title>  skip Openverse; use the lead image of that Wikipedia article
//
// Sources: Openverse (photos, commercial use + modification allowed, CC0/BY/BY-SA preferred),
// falling back to the Wikipedia REST summary image (hosted on Wikimedia Commons).
// Output: meal-prep/img/<recipeId>.jpg (max 640px wide, JPEG q~72, no metadata) and an
// IMAGES entry { file, title, by, license, licenseUrl, src } in meal-prep/src/images.mjs.
// Node 22, no npm deps; resizing shells out to python3 + PIL.

import { writeFile, readFile, mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const UA = 'LazyPrepMealPlanner/1.0 (personal student meal-prep project)';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '..');
const ROOT = path.resolve(SRC, '..');
const IMAGES_FILE = path.join(SRC, 'images.mjs');
const IMG_DIR = path.join(ROOT, 'img');
const MAX_W = 640;
const MAX_BYTES = 75 * 1024;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastCall = 0;
async function get(url, { json = true } = {}) {
  const wait = lastCall + 1500 - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: json ? 'application/json' : '*/*' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return json ? res.json() : Buffer.from(await res.arrayBuffer());
}

// ---------- license helpers ----------
const LICENSE_RANK = { cc0: 0, pdm: 1, by: 2, 'by-sa': 3 };
function licenseName(code, version) {
  code = String(code || '').toLowerCase();
  if (code === 'cc0') return 'CC0 1.0';
  if (code === 'pdm') return 'Public Domain';
  return `CC ${code.toUpperCase()}${version ? ' ' + version : ''}`;
}
function licenseUrlFor(code, version) {
  code = String(code || '').toLowerCase();
  if (code === 'cc0') return 'https://creativecommons.org/publicdomain/zero/1.0/';
  if (code === 'pdm') return 'https://creativecommons.org/publicdomain/mark/1.0/';
  return `https://creativecommons.org/licenses/${code}/${version || '4.0'}/`;
}
const clean = (s) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

// ---------- Openverse ----------
async function openverse(terms) {
  const q = new URLSearchParams({
    q: terms,
    license_type: 'commercial,modification',
    category: 'photograph',
    page_size: '20',
    mature: 'false',
  });
  const data = await get(`https://api.openverse.org/v1/images/?${q}`);
  return (data.results || [])
    .filter((r) => r.license in LICENSE_RANK)
    .filter((r) => !r.width || r.width >= 400)
    .map((r) => ({
      source: 'openverse',
      title: clean(r.title).replace(/\s*(\.{3}|…)$/, '') || terms,
      by: clean(r.creator) || `Unknown (via ${r.source || r.provider})`,
      license: licenseName(r.license, r.license_version),
      licenseUrl: r.license_url || licenseUrlFor(r.license, r.license_version),
      src: r.foreign_landing_url,
      url: r.url,
      thumb: r.thumbnail || `https://api.openverse.org/v1/images/${r.id}/thumb/`,
      width: r.width,
      height: r.height,
    })); // keep Openverse relevance order
}

// ---------- Wikipedia / Commons ----------
function parseCommonsRaw(raw) {
  const out = {};
  const author = raw.match(/\|\s*[Aa]uthor\s*=\s*([^\n]*)/);
  if (author) {
    out.by = clean(
      author[1]
        .replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1')
        .replace(/\[\[([^\]]*)\]\]/g, '$1')
        .replace(/\[https?:\S+\s+([^\]]*)\]/g, '$1')
        .replace(/\{\{[^}]*\}\}/g, '')
        .replace(/'''?/g, ''),
    );
  }
  const lic = raw.match(/\{\{\s*(?:self\s*\|\s*)?(cc-zero|cc0|cc-by-sa-[\d.]+|cc-by-[\d.]+|PD-[\w-]+)/i);
  if (lic) {
    const t = lic[1].toLowerCase();
    if (t === 'cc-zero' || t === 'cc0') Object.assign(out, { code: 'cc0' });
    else if (t.startsWith('pd-')) Object.assign(out, { code: 'pdm' });
    else {
      const m = t.match(/^cc-(by(?:-sa)?)-([\d.]+)/);
      Object.assign(out, { code: m[1], version: m[2] });
    }
  }
  return out;
}
async function commonsMeta(fileName) {
  const title = `File:${fileName}`;
  const src = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName.replace(/ /g, '_'))}`;
  // 1) single-title imageinfo query (not search; usually allowed)
  try {
    const q = new URLSearchParams({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'extmetadata', format: 'json', formatversion: '2' });
    const data = await get(`https://commons.wikimedia.org/w/api.php?${q}`);
    const md = data?.query?.pages?.[0]?.imageinfo?.[0]?.extmetadata;
    if (md?.LicenseShortName) {
      return {
        by: clean(md.Artist?.value) || 'Unknown',
        license: clean(md.LicenseShortName.value),
        licenseUrl: md.LicenseUrl?.value || '',
        src,
        ok: /cc0|cc by|cc-by|public domain/i.test(md.LicenseShortName.value) && !/nc|nd/i.test(md.LicenseShortName.value),
      };
    }
  } catch (e) {
    console.error(`  commons api: ${e.message}`);
  }
  // 2) raw wikitext
  try {
    const raw = (await get(`https://commons.wikimedia.org/w/index.php?title=${encodeURIComponent(title)}&action=raw`, { json: false })).toString('utf8');
    const p = parseCommonsRaw(raw);
    if (p.code) {
      return { by: p.by || 'Unknown', license: licenseName(p.code, p.version), licenseUrl: licenseUrlFor(p.code, p.version), src, ok: true };
    }
  } catch (e) {
    console.error(`  commons raw: ${e.message}`);
  }
  return null;
}
async function wikipedia(titleOrTerms) {
  const t = titleOrTerms.trim().replace(/\s+/g, '_');
  const data = await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`);
  const img = data.originalimage || data.thumbnail;
  if (!img?.source || !/upload\.wikimedia\.org\/wikipedia\/commons\//.test(img.source)) return [];
  // file name is the last path segment of the original (or the segment before the "NNNpx-" thumb name)
  const parts = decodeURIComponent(new URL(img.source).pathname).split('/');
  let fileName = parts.at(-1);
  if (parts.includes('thumb')) fileName = parts[parts.indexOf('thumb') + 3];
  const meta = await commonsMeta(fileName);
  if (!meta?.ok) return [];
  return [{
    source: 'wikipedia',
    title: fileName.replace(/\.[a-z]+$/i, '').replace(/_/g, ' '),
    by: meta.by,
    license: meta.license,
    licenseUrl: meta.licenseUrl,
    src: meta.src,
    url: (data.originalimage?.source || img.source).split('?')[0],
    thumb: (data.thumbnail?.source || img.source).split('?')[0],
    width: data.originalimage?.width || img.width,
    height: data.originalimage?.height || img.height,
  }];
}

// ---------- image processing ----------
const PY = `
import sys
from PIL import Image, ImageOps
src, dst, max_w, max_bytes = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src)
im = ImageOps.exif_transpose(im).convert('RGB')
w, h = im.size
if h > w:  # portrait: centre-crop to 4:3 landscape
    nh = int(w * 3 / 4); top = (h - nh) // 2
    im = im.crop((0, top, w, top + nh))
if im.size[0] > max_w:
    im = im.resize((max_w, round(im.size[1] * max_w / im.size[0])), Image.LANCZOS)
q = 72
while True:
    im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True)
    import os
    if os.path.getsize(dst) <= max_bytes or q <= 50: break
    q -= 4
print(im.size[0], im.size[1], q)
`;
function resize(srcPath, dstPath, maxW = MAX_W, maxBytes = MAX_BYTES) {
  return execFileSync('python3', ['-I', '-c', PY, srcPath, dstPath, String(maxW), String(maxBytes)], { encoding: 'utf8' }).trim();
}

// ---------- images.mjs ----------
async function loadImages() {
  if (!existsSync(IMAGES_FILE)) return {};
  const mod = await import(pathToFileURL(IMAGES_FILE).href + `?t=${Date.now()}`);
  return { ...(mod.IMAGES || {}) };
}
const q1 = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
async function saveImages(images) {
  const keys = Object.keys(images).sort();
  const body = keys
    .map((k) => {
      const e = images[k];
      const fields = ['file', 'title', 'by', 'license', 'licenseUrl', 'src'].map((f) => `    ${f}: ${q1(e[f] ?? '')},`).join('\n');
      return `  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : q1(k)}: {\n${fields}\n  },`;
    })
    .join('\n');
  const out = `// Recipe photos and their credits. Generated by src/tools/fetch-image.mjs; keep sorted.
// Every photo is freely licensed (CC0 / CC BY / CC BY-SA / public domain); credit "by" + license on display.
export const IMAGES = {
${body}
};
`;
  await writeFile(IMAGES_FILE, out);
}

// ---------- main ----------
function parseArgs(argv) {
  const a = { pick: 0, list: false, thumbs: null, wiki: null, pos: [] };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--list') a.list = true;
    else if (v === '--pick') { const p = argv[++i]; a.pick = /^\d{1,3}$/.test(p) ? Number(p) : p; }
    else if (v === '--thumbs') a.thumbs = argv[++i];
    else if (v === '--wiki') a.wiki = argv[++i];
    else a.pos.push(v);
  }
  return a;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [id, terms] = args.pos;
  if (!id || !(terms || args.wiki) || !/^[a-z0-9_-]+$/i.test(id)) {
    console.error('usage: node meal-prep/src/tools/fetch-image.mjs <recipeId> "<search terms>" [--pick N] [--list] [--thumbs dir] [--wiki Title]');
    process.exit(2);
  }

  // Openverse matches all words, so long queries often return nothing: relax by dropping
  // trailing words (never below 2 words unless the query was one word).
  const words = (terms || '').trim().split(/\s+/).filter(Boolean);
  const prefixes = [];
  for (let n = words.length; n >= Math.min(2, words.length) && n > 0; n--) prefixes.push(words.slice(0, n).join(' '));
  let cands = [];
  if (!args.wiki) {
    for (const q of prefixes) {
      try { cands = await openverse(q); } catch (e) { console.error(`openverse: ${e.message}`); }
      if (cands.length >= 3 || (cands.length && q === prefixes.at(-1))) {
        if (q !== terms) console.error(`(Openverse query relaxed to "${q}")`);
        break;
      }
    }
  }
  if (!cands.length) {
    const titles = args.wiki ? [args.wiki] : words.map((_, i) => words.slice(0, words.length - i).join(' '));
    for (const t of titles) {
      const title = t.charAt(0).toUpperCase() + t.slice(1);
      console.error(`trying Wikipedia "${title}"`);
      try { cands = await wikipedia(title); } catch (e) { console.error(`  wikipedia: ${e.message}`); }
      if (cands.length) break;
    }
  }
  if (!cands.length) {
    console.error(`no usable image found for "${terms || args.wiki}"`);
    process.exit(1);
  }

  if (args.list) {
    if (args.thumbs) await mkdir(args.thumbs, { recursive: true });
    for (const [i, c] of cands.entries()) {
      console.log(`[${i}] ${c.title} | ${c.by} | ${c.license} | ${c.width ?? '?'}x${c.height ?? '?'} | ${c.url}`);
      if (args.thumbs) {
        try { await writeFile(path.join(args.thumbs, `${i}.jpg`), await get(c.thumb, { json: false })); }
        catch (e) { console.error(`  thumb ${i}: ${e.message}`); }
      }
    }
    return;
  }

  const c = typeof args.pick === 'number' ? cands[args.pick] : cands.find((x) => x.url.includes(args.pick) || x.src.includes(args.pick));
  if (!c) { console.error(`--pick ${args.pick} out of range (0..${cands.length - 1})`); process.exit(2); }
  const work = await mkdtemp(path.join(tmpdir(), 'lazyprep-img-'));
  try {
    const raw = path.join(work, 'download');
    await writeFile(raw, await get(c.url, { json: false }));
    await mkdir(IMG_DIR, { recursive: true });
    const dst = path.join(IMG_DIR, `${id}.jpg`);
    const info = resize(raw, dst);
    const kb = ((await stat(dst)).size / 1024).toFixed(1);
    const images = await loadImages();
    images[id] = { file: `img/${id}.jpg`, title: c.title, by: c.by, license: c.license, licenseUrl: c.licenseUrl, src: c.src };
    await saveImages(images);
    console.log(`saved img/${id}.jpg (${info.split(' ').slice(0, 2).join('x')}, q${info.split(' ')[2]}, ${kb} KB): "${c.title}" by ${c.by}, ${c.license}`);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
