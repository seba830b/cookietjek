// Validator: node meal-prep/src/check.mjs   (exit 1 on any error)
// Schema + constraints for every recipe in CORE + POOL, images, and a simulation of 52 weeks x meal configs x f.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as D from './data.mjs';
import * as E from './engine.mjs';
import { POOL_PRODUCTS } from './recipes/index.mjs';
import { fmtText } from './fmt.mjs';

const SRC = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(SRC); // meal-prep/
const errors = [], warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);
const DASH = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']');
const isStr = (x) => typeof x === 'string' && x.trim().length > 0;
const words = (s) => s.split(/\s+/).filter(Boolean).length;

// ---------- products
const PRODUCTS = D.PRODUCTS;
const SECS = ['Frugt og grønt', 'Kød og køl', 'Frost', 'Kolonial', 'Brød', 'Basis', 'Udstyr'];
for (const [id, p] of Object.entries(PRODUCTS)) {
  const at = `product ${id}`;
  if (!/^[a-z0-9]+$/.test(id)) err(`${at}: id must be lowercase ascii`);
  if (!isStr(p.n)) err(`${at}: missing n`);
  if (!SECS.includes(p.sec)) err(`${at}: sec "${p.sec}" not one of ${SECS.join(', ')}`);
  if (!['g', 'ml', 'stk', 'pack'].includes(p.u)) err(`${at}: u "${p.u}" must be g | ml | stk | pack`);
  if (!(p.size > 0)) err(`${at}: size must be > 0`);
  if (!(p.price > 0)) err(`${at}: price must be > 0`);
  for (const k of ['label', 'unit', 'plural', 'where', 'life', 'open']) if (!isStr(p[k])) err(`${at}: missing ${k}`);
  if (/asian/i.test(p.where || '') && !/alle|netto|rema|lidl/i.test(p.where) && !p.opt) err(`${at}: only sold at Asian Market, must be opt`);
  for (const [k, v] of Object.entries(p)) if (typeof v === 'string' && DASH.test(v)) err(`${at}.${k}: em/en dash`);
}

// ---------- recipes
const VARS = new Set(['n', 'c', 'chicken', 'm', 'mince']);
const ids = new Set();
const known = new Set(Object.keys(E.MINCE));
const variantOwner = {};
for (const r of D.RECIPES) {
  const at = `recipe ${r.id || '?'}`;
  if (!/^[a-z0-9]+$/.test(r.id || '')) err(`${at}: id must be lowercase ascii`);
  if (ids.has(r.id)) err(`${at}: duplicate id`);
  ids.add(r.id);
  for (const k of ['name', 'short', 'fridge', 'freezer', 'reheat', 'eat']) if (!isStr(r[k])) err(`${at}: missing ${k}`);
  if (!D.STYLES[r.style]) err(`${at}: style "${r.style}" not in STYLES`);
  if (!Array.isArray(r.bases) || !r.bases.length || r.bases.some((b) => !'ABCDE'.includes(b) || b.length !== 1)) err(`${at}: bases must be a subset of A-E`);
  if (!(typeof r.hands === 'number' && r.hands > 0 && r.hands <= 10)) err(`${at}: hands must be 1-10`);
  if (!['lunch', 'dinner', 'both'].includes(r.slot)) err(`${at}: slot must be lunch | dinner | both`);
  const per = r.per || {};
  const has = (b) => (r.bases || []).includes(b);
  for (const k of ['chicken', 'mince', 'rice', 'pasta', 'wedges']) if (typeof per[k] !== 'number' || per[k] < 0 || Number.isNaN(per[k])) err(`${at}: per.${k} must be a number >= 0`);
  if (has('A') !== per.chicken > 0) err(`${at}: base A <-> per.chicken mismatch`);
  if (has('B') !== per.mince > 0) err(`${at}: base B <-> per.mince mismatch`);
  if (has('C') !== per.rice > 0) err(`${at}: base C <-> per.rice mismatch`);
  if (has('D') !== per.pasta > 0) err(`${at}: base D <-> per.pasta mismatch`);
  if (has('E') !== per.wedges > 0) err(`${at}: base E <-> per.wedges mismatch`);
  if (per.mince > 0 && !/^[a-z]+$/.test(per.minceStyle || '')) err(`${at}: per.minceStyle missing`);
  if (per.chicken > 260 || per.mince > 200 || per.rice > 130 || per.pasta > 150 || per.wedges > 350) warn(`${at}: per amounts look large for one portion`);
  if (per.mince > 0 && !known.has(per.minceStyle)) {
    const pan = (r.prepExtra || []).some((p) => p.k === 'pan') || (r.minceVariant && isStr(r.minceVariant.x));
    if (!pan) err(`${at}: new mince variant "${per.minceStyle}" needs a pan step (prepExtra k 'pan' or minceVariant.x)`);
    (variantOwner[per.minceStyle] = variantOwner[per.minceStyle] || []).push(r.id);
  }
  if (!Array.isArray(r.products)) err(`${at}: products must be an array`);
  else for (const p of r.products) {
    if (!PRODUCTS[p.id] && !(POOL_PRODUCTS || {})[p.id]) err(`${at}: unknown product "${p.id}"`);
    if (!(p.q > 0)) err(`${at}: product ${p.id} q must be > 0`);
    const pr = PRODUCTS[p.id];
    if (pr && pr.u === 'pack' && p.q > 3) warn(`${at}: product ${p.id} q ${p.q} packs per portion looks high`);
  }
  if (!['box', 'glasboks', 'pose', 'baeger'].includes(r.container)) err(`${at}: container must be box | glasboks | pose | baeger`);
  if (typeof r.sauceCup !== 'boolean') err(`${at}: sauceCup must be boolean`);
  if (typeof r.freezeOk !== 'boolean') err(`${at}: freezeOk must be boolean`);
  const asm = Array.isArray(r.assemble) ? r.assemble : [r.assemble];
  if (!asm.length || asm.some((x) => !(isStr(x) || (x && isStr(x.x))))) err(`${at}: assemble missing`);
  if (r.prepExtra != null && !Array.isArray(r.prepExtra)) err(`${at}: prepExtra must be an array`);
  for (const p of r.prepExtra || []) {
    if (!['pan', 'pot', 'you', 'micro'].includes(p.k)) err(`${at}: prepExtra k "${p.k}" must be pan | pot | you | micro`);
    if (!isStr(p.x)) err(`${at}: prepExtra x missing`);
    if (!(p.min > 0 && p.min <= 15)) err(`${at}: prepExtra min must be 1-15`);
  }
  const texts = asm.map((x) => (typeof x === 'string' ? x : x && x.x)).concat((r.prepExtra || []).map((p) => p.x));
  for (const t of texts) for (const m of String(t || '').matchAll(/\{\{\s*(?:[\d.]+\s*\*\s*)?([A-Za-z]+)\s*(?:\|\s*(\w+))?\s*\}\}/g)) {
    if (!VARS.has(m[1])) err(`${at}: unknown token {{${m[1]}}} (use n, c/chicken, m, mince)`);
  }
  if (!Array.isArray(r.ingredients) || !r.ingredients.length) err(`${at}: ingredients missing`);
  if (!Array.isArray(r.steps) || !r.steps.length) err(`${at}: steps missing`);
  if (r.slot === 'lunch' || r.slot === 'both') {
    if (per.wedges > 0) err(`${at}: lunch/both recipe cannot use wedges`);
    if (!/^Kun mikro:/.test(r.eat || '')) err(`${at}: eat must start with "Kun mikro:"`);
    if (/airfry|200°C|180°C|pladen/i.test(r.eat || '')) err(`${at}: eat for lunch must be microwave only`);
  }
  if (r.added != null && !/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(r.added)) err(`${at}: added must look like 2026-W43`);
  const walk = (v, path) => {
    if (typeof v === 'string') { if (DASH.test(v)) err(`${at}.${path}: em/en dash`); if (/undefined|NaN/.test(v)) err(`${at}.${path}: contains undefined/NaN`); }
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === 'object') for (const k in v) if (k !== 'img') walk(v[k], path ? `${path}.${k}` : k);
  };
  walk(r, '');
  // images
  const img = D.IMAGES && D.IMAGES[r.id];
  if (!img) warn(`${at}: no photo in images.mjs`);
  else {
    if (!existsSync(join(ROOT, img.file || ''))) warn(`${at}: photo file ${img.file} missing`);
    if (img.file !== `img/${r.id}.jpg`) warn(`${at}: photo should be img/${r.id}.jpg (relative), got ${img.file}`);
    for (const k of ['by', 'license']) if (!isStr(img[k])) warn(`${at}: photo credit missing ${k}`);
  }
}
for (const [v, owners] of Object.entries(variantOwner)) if (owners.length > 1) warn(`mince variant "${v}" is defined by ${owners.join(', ')}: the first one's pan step is used for all`);

// ---------- simulation
const mealsFrom = (fn) => Object.fromEntries(E.DAYS.map((d, di) => [d, { lunch: fn(di, 'lunch'), dinner: fn(di, 'dinner') }]));
const cfgRng = E.rng('check-configs');
const CONFIGS = [
  ['default', E.DEFAULT_MEALS],
  ['alle 14', mealsFrom(() => true)],
  ['kun frokost', mealsFrom((d, s) => s === 'lunch')],
  ['kun aften', mealsFrom((d, s) => s === 'dinner')],
];
for (let i = 0; i < 3; i++) {
  let m;
  do m = mealsFrom(() => cfgRng() < 0.55); while (!Object.values(m).some((x) => x.lunch || x.dinner));
  CONFIGS.push([`tilfældig ${i + 1}`, m]);
}
const year = E.planWeek(new Date()).year;
let runs = 0, maxMs = 0, sumMs = 0, over90 = 0;
const defaultMinutes = [];
const longSteps = new Map();
const freshMissed = [];
const textOk = (s, where) => {
  const raw = String(s);
  const out = fmtText(raw, 1);
  if (/undefined|NaN|null|\{\{|\}\}|\[object/.test(out)) err(`${where}: bad text "${out}"`);
  if (/\{[\d.]+\|\w+\}/.test(out)) err(`${where}: unresolved marker "${out}"`);
  if (DASH.test(out)) err(`${where}: em/en dash`);
  return out;
};
for (let week = 1; week <= 52; week++) {
  const seed = `${year}-W${String(week).padStart(2, '0')}`;
  for (const [cname, meals] of CONFIGS) {
    for (const f of [0.5, 1, 2]) {
      const at = `${seed} ${cname} x${f}`;
      runs++;
      const t0 = performance.now();
      let A;
      try { A = E.computeAll(D, meals, seed, {}, f); } catch (e) { err(`${at}: engine threw ${e.stack}`); continue; }
      const ms = performance.now() - t0;
      if (runs > 20) { maxMs = Math.max(maxMs, ms); sumMs += ms; }
      const { plan, prep, shop, price } = A;
      // every active meal has a recipe of the right kind
      for (const d of plan.days) for (const s of ['lunch', 'dinner']) {
        const on = meals[d.day] && meals[d.day][s];
        const m = d[s];
        if (on && !m) err(`${at}: ${d.day} ${s} has no recipe`);
        if (!on && m) err(`${at}: ${d.day} ${s} is off but got ${m.r}`);
        if (m) {
          const r = D.RECIPES.find((x) => x.id === m.r);
          if (!r) err(`${at}: unknown recipe ${m.r}`);
          else if (s === 'lunch' && r.slot === 'dinner' && d.day !== 'Sat' && d.day !== 'Sun') err(`${at}: dinner-only ${r.id} at lunch`);
          if (!['fridge', 'freezer'].includes(m.s)) err(`${at}: bad storage ${m.s}`);
          if (m.s === 'freezer' && !m.thaw) err(`${at}: freezer meal without thaw day`);
        }
      }
      // weekly constraints
      const used = plan.days.flatMap((d) => [d.lunch, d.dinner].filter(Boolean).map((m) => ({ d: d.day, r: D.RECIPES.find((x) => x.id === m.r) })));
      const count = {};
      used.forEach((u) => { count[u.r.id] = (count[u.r.id] || 0) + 1; });
      for (const id in count) if (count[id] > 2) err(`${at}: ${id} ${count[id]} times`);
      plan.days.forEach((d) => { if (d.lunch && d.dinner && d.lunch.r === d.dinner.r) err(`${at}: ${d.day} same recipe twice`); });
      const variants = new Set(used.map((u) => u.r.per.mince > 0 && u.r.per.minceStyle).filter(Boolean));
      if (variants.size > 2) err(`${at}: ${variants.size} mince variants`);
      if (f === 1 && used.length >= 5 && new Set(used.map((u) => u.r.style)).size < 3) err(`${at}: fewer than 3 styles`);
      if (f === 1 && cname === 'default') {
        const fresh = D.RECIPES.filter((r) => r.added === seed).map((r) => r.id);
        for (const id of fresh) if (!count[id]) freshMissed.push(`${seed}: ${id}`);
      }
      // prep
      if (!prep.steps.length) err(`${at}: no prep steps`);
      prep.steps.forEach((s, i) => {
        if (!['pot', 'pan', 'air', 'you'].includes(s.k)) err(`${at}: step ${i} bad track ${s.k}`);
        if (!isStr(s.a)) err(`${at}: step ${i} missing action word`);
        if (!/^(\d+:\d\d|Dagen før|Nødplan)$/.test(s.t)) err(`${at}: step ${i} bad time ${s.t}`);
        const out = textOk(s.x, `${at} step ${i} (${s.a})`);
        if (f === 1 && words(out) > 25) longSteps.set(s.a + ': ' + s.x.slice(0, 60), words(out));
      });
      const byK = {};
      prep.blocks.forEach((b) => (byK[b.k] = byK[b.k] || []).push(b));
      for (const k in byK) {
        const bl = byK[k].sort((a, b) => a.s - b.s);
        for (let i = 1; i < bl.length; i++) if (bl[i].s < bl[i - 1].e) err(`${at}: ${k} double-booked at ${bl[i].s} (${bl[i - 1].a} / ${bl[i].a})`);
      }
      const mins = prep.minutes;
      if (!(mins.rutine > 0 && mins.foersteGang >= mins.rutine && mins.aktiv > 0 && mins.aktiv <= mins.end + 1)) err(`${at}: odd minutes ${JSON.stringify(mins)}`);
      if (f === 1 && cname === 'default') defaultMinutes.push(mins.rutine);
      if (f === 1 && mins.rutine > 90) { over90++; if (cname === 'default') err(`${at}: prep ${mins.rutine} min > 90`); }
      prep.kit.forEach((k) => { if (k.note) textOk(k.note, `${at} kit`); if (k.count != null && !(k.count > 0)) err(`${at}: kit ${k.n} count ${k.count}`); });
      prep.notes.forEach((n) => textOk(n, `${at} note`));
      A.reminders.forEach((x) => textOk(x, `${at} reminder`));
      // shop, starter, price
      if (!(price.total > 0)) err(`${at}: shop total ${price.total}`);
      if (!(price.perMeal > 0)) err(`${at}: per meal ${price.perMeal}`);
      for (const list of [shop, A.starter]) for (const g of list) for (const it of g.items) {
        if (!(it.need > 0) || !(it.size > 0) || !(it.price > 0) || !isStr(it.n) || !isStr(it.label)) err(`${at}: bad list item ${JSON.stringify(it)}`);
      }
    }
  }
}
if (sumMs / Math.max(1, runs - 20) > 30) err(`engine too slow: ${(sumMs / (runs - 20)).toFixed(1)} ms avg`);
if (defaultMinutes.length) {
  const lo = Math.min(...defaultMinutes), hi = Math.max(...defaultMinutes);
  if (lo < 60) err(`default week prep only ${lo} min (expected 60-90)`);
}
if (over90) warn(`${over90} non-default configs at x1 take more than 90 min of prep`);
for (const [t, n] of longSteps) warn(`step over 25 words (${n}): ${t}...`);
freshMissed.forEach((x) => warn(`new recipe not in the default plan for its week: ${x}`));

// ---------- dashes in sources and outputs
const scan = (dir, re) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === 'img' || f === 'node_modules' ? [] : scan(p, re);
    return re.test(f) ? [p] : [];
  });
};
for (const p of scan(ROOT, /\.(mjs|html|md|json)$/)) {
  const lines = readFileSync(p, 'utf8').split('\n');
  lines.forEach((l, i) => { if (DASH.test(l)) err(`${p.slice(ROOT.length + 1)}:${i + 1}: em/en dash`); });
}

// ---------- summary
const def = defaultMinutes.length ? `${Math.min(...defaultMinutes)}-${Math.max(...defaultMinutes)}` : '-';
console.log(`Opskrifter: ${D.RECIPES.length} (${D.RECIPES.filter((r) => r.slot !== 'dinner').length} kan være frokost), produkter: ${Object.keys(PRODUCTS).length}, fotos: ${D.RECIPES.filter((r) => D.IMAGES && D.IMAGES[r.id]).length}`);
console.log(`Simulering: ${runs} uger x konfigurationer x f, motor ${(sumMs / Math.max(1, runs - 20)).toFixed(1)} ms i snit (max ${maxMs.toFixed(1)} ms), standarduge prep ${def} min`);
if (warns.length) {
  console.log(`\nAdvarsler (${warns.length}):`);
  warns.slice(0, 60).forEach((w) => console.log('  - ' + w));
  if (warns.length > 60) console.log(`  ... og ${warns.length - 60} mere`);
}
if (errors.length) {
  const uniq = [...new Set(errors)];
  console.log(`\nFEJL (${uniq.length}):`);
  uniq.slice(0, 80).forEach((e) => console.log('  - ' + e));
  if (uniq.length > 80) console.log(`  ... og ${uniq.length - 80} mere`);
  process.exit(1);
}
console.log('\nOK');
