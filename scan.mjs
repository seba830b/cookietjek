#!/usr/bin/env node
// Cookietjek scanner.
//
// Loads a site's front page in a clean browser, interacts with NOTHING, and
// records what happens anyway. One page load per domain, same as any visitor.
//
//   node scan.mjs eksempel.dk
//   node scan.mjs --file data/prospects.txt
//
// Output: out/<domain>/scan.json and out/<domain>/skaermbillede.png

import { launchChromium } from './lib/browser.mjs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { matchHost, matchCookie } from './lib/trackers.mjs';
import { detectBanner } from './lib/detect.mjs';

export const SCANNER_VERSION = '0.1.0';

const OUT_DIR = 'out';

function parseArgs(argv) {
  const opts = { domains: [], file: null, delayMs: 2000, timeoutMs: 30000, settleMs: 5000, headed: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file') opts.file = argv[++i];
    else if (a === '--delay') opts.delayMs = Number(argv[++i]);
    else if (a === '--timeout') opts.timeoutMs = Number(argv[++i]);
    else if (a === '--settle') opts.settleMs = Number(argv[++i]);
    else if (a === '--headed') opts.headed = true;
    else if (a.startsWith('--')) throw new Error(`Ukendt flag: ${a}`);
    else opts.domains.push(a);
  }
  return opts;
}

export function normaliseDomain(input) {
  let d = String(input).trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  return d;
}

// Accepts either a bare domain ("eksempel.dk") or a full URL. Full URLs exist
// so the test suite can point the scanner at a local fixture server; in normal
// use you pass domains.
export function parseTarget(input) {
  const raw = String(input).trim();
  if (/^https?:\/\//i.test(raw)) {
    const u = new URL(raw);
    // Include the path in the label, otherwise two URLs on the same host would
    // write to the same output folder and silently overwrite each other.
    const pathSlug = u.pathname.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '_');
    const label = [u.host.replace(/^www\./, '').replace(/:/g, '_'), pathSlug].filter(Boolean).join('_');
    return { url: raw, domain: label, host: u.hostname };
  }
  const domain = normaliseDomain(raw);
  return { url: `https://${domain}/`, domain, host: domain };
}

export function classifyFindings({ banner, trackerRequests, trackerCookies }) {
  const findings = [];
  const trackingFired = trackerRequests.length > 0 || trackerCookies.length > 0;

  if (trackingFired) findings.push('TRACKING_FOER_SAMTYKKE');
  if (!banner.found && trackingFired) findings.push('INGEN_BANNER');
  if (banner.found && banner.accept && !banner.reject) findings.push('INGEN_AFVIS_KNAP');
  if (findings.length === 0) findings.push('INTET_FUNDET');

  return findings;
}

async function scanOne(browser, target, opts) {
  const { url, domain, host } = target;
  const context = await browser.newContext({
    locale: 'da-DK',
    timezoneId: 'Europe/Copenhagen',
    viewport: { width: 1366, height: 900 },
  });

  const trackerRequests = [];
  const otherThirdParty = new Set();
  const seenRequest = new Set();

  context.on('request', (req) => {
    const reqUrl = req.url();
    let reqHost;
    try { reqHost = new URL(reqUrl).hostname; } catch { return; }

    const hit = matchHost(reqUrl);
    if (hit) {
      const key = `${hit.vendor}|${reqHost}`;
      if (!seenRequest.has(key)) {
        seenRequest.add(key);
        trackerRequests.push({ host: reqHost, vendor: hit.vendor, category: hit.category, url: reqUrl.slice(0, 300) });
      }
    } else if (reqHost !== host && !reqHost.endsWith(`.${host}`)) {
      otherThirdParty.add(reqHost);
    }
  });

  const page = await context.newPage();
  const result = {
    domain,
    url,
    scannerVersion: SCANNER_VERSION,
    scannedAt: new Date().toISOString(),
    ok: false,
    error: null,
  };

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: opts.timeoutMs });
    result.status = response?.status() ?? null;
    result.finalUrl = page.url();

    // Let late-firing tags run. Many pixels are injected after load.
    await page.waitForTimeout(opts.settleMs);

    const banner = await detectBanner(page);

    const rawCookies = await context.cookies();
    const trackerCookies = [];
    for (const c of rawCookies) {
      const hit = matchCookie(c.name);
      if (hit) trackerCookies.push({ name: c.name, domain: c.domain, vendor: hit.vendor, category: hit.category });
    }

    const dir = path.join(OUT_DIR, domain);
    await mkdir(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, 'skaermbillede.png'), fullPage: false });

    Object.assign(result, {
      ok: true,
      banner,
      preConsent: {
        trackerRequests,
        trackerCookies,
        otherThirdPartyHosts: [...otherThirdParty].sort().slice(0, 40),
        cookieCount: rawCookies.length,
      },
      findings: classifyFindings({ banner, trackerRequests, trackerCookies }),
      screenshot: 'skaermbillede.png',
    });

    await writeFile(path.join(dir, 'scan.json'), JSON.stringify(result, null, 2));
  } catch (err) {
    result.error = String(err.message || err);
    const dir = path.join(OUT_DIR, domain);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'scan.json'), JSON.stringify(result, null, 2));
  } finally {
    await context.close();
  }

  return result;
}

function summarise(r) {
  if (!r.ok) return `  FEJL  ${r.domain}  ${r.error}`;
  const t = r.preConsent.trackerRequests.map((x) => x.vendor);
  const uniq = [...new Set(t)];
  const bits = [];
  if (r.findings.includes('TRACKING_FOER_SAMTYKKE')) bits.push(`tracking før samtykke: ${uniq.join(', ') || 'cookies'}`);
  if (r.findings.includes('INGEN_AFVIS_KNAP')) bits.push('ingen afvis-knap i første lag');
  if (r.findings.includes('INGEN_BANNER')) bits.push('intet banner fundet');
  if (r.findings.includes('INTET_FUNDET')) bits.push('intet fundet');
  const flag = r.findings.includes('INTET_FUNDET') ? '  ok  ' : ' FUND ';
  return `${flag} ${r.domain}  ${bits.join(' | ')}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.file) {
    const text = await readFile(opts.file, 'utf8');
    for (const line of text.split('\n')) {
      const s = line.trim();
      if (s && !s.startsWith('#')) opts.domains.push(s);
    }
  }

  const targets = [...new Set(opts.domains.map((d) => d.trim()).filter(Boolean))].map(parseTarget);
  const domains = targets;
  if (domains.length === 0) {
    console.error('Brug: node scan.mjs <domæne> [...]  eller  node scan.mjs --file data/prospects.txt');
    process.exit(1);
  }

  const browser = await launchChromium({ headless: !opts.headed });
  console.log(`Scanner ${domains.length} domæne(r)...\n`);

  const results = [];
  for (const [i, target] of targets.entries()) {
    const r = await scanOne(browser, target, opts);
    results.push(r);
    console.log(summarise(r));
    // Deliberately sequential with a pause. These are other people's servers.
    if (i < targets.length - 1) await new Promise((res) => setTimeout(res, opts.delayMs));
  }

  await browser.close();

  const withFindings = results.filter((r) => r.ok && !r.findings.includes('INTET_FUNDET'));
  console.log(`\n${withFindings.length} af ${results.length} har et konkret fund.`);
  if (withFindings.length) {
    console.log(`Byg rapporter:  npm run report -- ${withFindings.map((r) => r.domain).join(' ')}`);
  }
}

export { scanOne };

export async function scanTargets(inputs, overrides = {}) {
  const opts = { delayMs: 0, timeoutMs: 30000, settleMs: 1500, ...overrides };
  const browser = await launchChromium({ headless: true });
  try {
    const out = [];
    for (const input of inputs) out.push(await scanOne(browser, parseTarget(input), opts));
    return out;
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
