// Lazy Prep engine. Pure, dependency-free, browser-safe. build.mjs inlines it into index.html (export stripped).
// All quantities in returned text are {q|unit} markers with ABSOLUTE amounts for the f passed in:
// render them with fmtText(x, 1). Counts (kit, shop need) are absolute for f too.

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DAY_DA = { Sun: 'Søndag', Mon: 'Mandag', Tue: 'Tirsdag', Wed: 'Onsdag', Thu: 'Torsdag', Fri: 'Fredag', Sat: 'Lørdag' };
const _DAY_GEN = { Mon: 'mandagens', Tue: 'tirsdagens', Wed: 'onsdagens', Thu: 'torsdagens', Fri: 'fredagens' };
export const DEFAULT_MEALS = {
  Mon: { lunch: true, dinner: false },
  Tue: { lunch: true, dinner: false },
  Wed: { lunch: true, dinner: true },
  Thu: { lunch: true, dinner: false },
  Fri: { lunch: true, dinner: true },
};

// Built-in mince variants (Base B). Products are per 100 g RAW mince. x = pan step body (the engine adds the lead-in).
// A recipe that uses a variant not listed here brings its own pan step: its first prepExtra with k 'pan'
// (or recipe.minceVariant = { n, def, x, min }) becomes the variant step.
export const MINCE = {
  taco: {
    n: 'tacokød', def: 'tacokødet', a: 'TACO', min: 4,
    x: '{{0.5*m|bag}} tacokrydderi, {{0.5*m|can}} drænede kidneybønner, {{0.5*m|tbsp}} ketchup og {{0.25*m|krus}} vand. Mos bønnerne lidt. Bobl 4 min.',
    products: [{ id: 'taco', q: 0.5 }, { id: 'kidney', q: 0.5 }, { id: 'ketchup', q: 0.02 }],
  },
  bolognese: {
    n: 'bolognese', def: 'bolognesen', a: 'SIMR', min: 5,
    x: '{{0.5*m|jar}} pastasauce, {{0.5*m|cube}} oksebouillon, {{0.5*m|tsp}} hvidløgspulver, {{0.5*m|tsp}} oregano, {{0.25*m|krus}} vand. Simr 5 min.',
    products: [{ id: 'pastasauce', q: 0.5 }, { id: 'oksebouillon', q: 0.05 }, { id: 'hvidloegspulver', q: 0.01 }, { id: 'oregano', q: 0.01 }],
  },
  cheeseburger: {
    n: 'cheeseburgerkød', def: 'cheeseburgerkødet', a: 'BURGER', min: 1,
    x: '{{0.5*m|tbsp}} ketchup og {{0.5*m|tsp}} sennep i. Rør rundt, 1 min.',
    products: [{ id: 'ketchup', q: 0.02 }, { id: 'sennep', q: 0.02 }],
  },
};

// Pantry use of the bases, so the starter list knows what each base needs. A: per 1000 g raw chicken,
// B: per 100 g raw mince, C: per 100 g dry rice, D: per 100 g dry pasta.
export const BASE_USE = {
  A: [{ id: 'hoensebouillon', q: 0.1 }, { id: 'salt', q: 0.01 }, { id: 'peber', q: 0.02 }, { id: 'hvidloegspulver', q: 0.03 },
    { id: 'paprika', q: 0.03 }, { id: 'majsstivelse', q: 0.06 }, { id: 'bagepulver', q: 0.1 }, { id: 'olie', q: 0.02 }],
  B: [{ id: 'loeg', q: 0.25 }, { id: 'salt', q: 0.003 }, { id: 'olie', q: 0.005 }],
  C: [{ id: 'salt', q: 0.001 }],
  D: [{ id: 'salt', q: 0.002 }],
};
const _BASE_PRODUCT = { chicken: 'kylling', mince: 'oksekoed', rice: 'ris', pasta: 'penne', wedges: 'kartoffelbaade' };

// Prep-day text. {{k*var|unit}} tokens are resolved to {q|unit} markers.
export const PREP_TEXT = {
  thaw: 'Frossen kylling? Læg den i en skål nederst i køleskabet, ca. 24 timer. Frisk kylling: brug den bare før datoen.',
  emergency: 'Er kyllingen stadig frossen? Brug mikroens optøningsprogram, og lav den med det samme. Det er eneste gang, mikroen bruges i dag.',
  emergencyMicro: 'Er kyllingen stadig frossen? Brug mikroens optøningsprogram, og lav den med det samme.',
  klip: 'Klip {{g|g}} kylling i 3 cm stykker direkte ned i en stor skål. Tager ca. {{min}} min.',
  krydr: 'Smuldr {{k|cube}} hønsebouillon over. Plus {{0.5*k|tsp}} salt, {{0.5*k|tsp}} peber, {{k|tsp}} hvidløgspulver og {{k|tsp}} paprika.',
  coat: '{{3*k|dtbsp}} majsstivelse og {{k|tsp}} bagepulver over. Vend, til der ikke er tørt pulver. Til sidst {{k|tbsp}} olie, vend igen.',
  washHands: 'Vask hænder og saks med sæbe. Skålen med rå kylling må ikke røre andet.',
  airOn: 'Airfry-funktion, 200°C. Forvarm, hvis din model beder om det.',
  batchFirst: 'Hold 1 af {{nb}}: ca. {{g|g}} kylling i ét lag med luft imellem. 200°C, 16 min.',
  batchOnly: 'Al kyllingen ({{g|g}}) i ét lag med luft imellem. 200°C, 16 min.',
  batchTurn: 'Vend kyllingen.',
  batchSwap: 'Hold {{prev}} ud i den rene skål. Hvidt hele vejen igennem? Hold {{i}} ind, ca. {{g|g}}, 200°C, 16 min.',
  batchLast: 'Sidste hold ud i den rene skål. Skær det største stykke over: hvidt hele vejen? Så er den færdig. Sluk airfryeren.',
  batchOut: 'Kyllingen ud i den rene skål. Skær det største stykke over: hvidt hele vejen? Så er den færdig. Sluk airfryeren.',
  rawBowl: 'Skålen med rå kylling er tom nu. Vask den og saksen.',
  riceStart: 'Skyl {{k|krus}} ris i gryden, hæld vandet ud med låget på skrå. {{1.375*k|krus}} vand og {{0.25*k|tsp}} salt i. Låg på, fuld varme.',
  riceStart2: 'Anden omgang: skyl {{k|krus}} ris i gryden. {{1.375*k|krus}} vand og {{0.25*k|tsp}} salt i. Låg på, fuld varme.',
  riceLow: 'Koger det? Laveste varme, låg på, 12 min. Løft ikke låget.',
  riceOff: 'Risen af varmen. Låget bliver på, 8 min.',
  riceSplit: 'Fordel risen i {{n|box}}, ca. halvt op. Bred den ud, låg af, så den køler hurtigt.',
  riceSplitRest: 'Fordel risen i {{n|box}}, ca. halvt op. Bred den ud, låg af. Resten bliver i gryden.',
  riceKeep: 'Lad risen blive i gryden med låget af, så den damper af.',
  pastaWater: 'Skyl gryden. Fyld den halvt med vand, {{s|tsp}} salt, låg på, fuld varme.',
  pastaWaterFirst: 'Fyld gryden halvt med vand, {{s|tsp}} salt, låg på, fuld varme.',
  pastaIn: 'Koger vandet? {{k|krus}} penne i. Kog 1 min kortere, end der står på pakken.',
  pastaDrain: 'Låget på skrå, hæld vandet ud i vasken.',
  pastaDrainSplit: 'Låget på skrå, hæld vandet ud i vasken. Regn med ca. 2 krus kogt pasta pr. portion.',
  pastaSplit: 'Fordel pastaen i {{what}} til {{names}}.',
  pastaSplitRest: 'Fordel pasta i {{what}} til {{names}}. Resten bliver i gryden.',
  onion: 'Skær {{o|onion}} groft på en tallerken. Pænt behøver det ikke være.',
  brown: 'Høj varme, lidt olie. {{g|g}} oksekød, løget og {{s|tsp}} salt. Del kødet med stegespaden, brun 8 min.',
  brownHalf: 'Høj varme, lidt olie. Halvdelen: {{g|g}} oksekød, halvdelen af løget, {{s|tsp}} salt. Brun 8 min.',
  brownSecond: 'Første omgang over i en ren boks. Resten af kødet og løget i, brun 8 min. Så alt tilbage i panden.',
  split: '{{frac}} af kødet (ca. {{g|g}}) over i en ren boks. Det bliver {{name}} om lidt.',
  leadOnly: 'I panden: ',
  leadFirst: 'Resten i panden: ',
  leadSecond: 'Kødet fra boksen i panden: ',
  park: '{{Def}} over i {{what}}. Det venter der på {{wait}}.',
  panWash: 'Vask panden. Den er færdig for i dag.',
  cool: 'Låg af, boksene side om side, ikke stablet. Vask {{what}} imens, ca. 10 min.',
};

// ---------- small helpers
const _r3 = (x) => Math.round(x * 1000) / 1000;
const _cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const _lc1 = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const _toMap = (recipes) => (Array.isArray(recipes) ? Object.fromEntries(recipes.map((r) => [r.id, r])) : recipes || {});
const _perOf = (r) => r.per || {};
const _minceOf = (r) => (_perOf(r).mince > 0 ? _perOf(r).minceStyle || 'taco' : null);
const _chickenOf = (r) => _perOf(r).chicken || 0;
const _isTaco = (r) => _minceOf(r) === 'taco' || (r.products || []).some((p) => p.id === 'taco' && !p.opt);
const _CONTAINER_UNIT = { box: 'box', glasboks: 'glasboks', pose: 'fpose', baeger: 'baeger' };
const _CONTAINER_BOX = { box: 'boks', glasboks: 'glasboks', pose: 'pose', baeger: 'boks' };
const _unitOf = (r) => _CONTAINER_UNIT[r.container] || 'box';
const _listDa = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1]);
const _shortName = (r) => String(r.short || r.name || r.id);
const _numDa = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

// Resolve {{k*var|unit}} tokens. Vars: n (portions), c / chicken (chicken portions), m (100 g raw mince), mince (raw g),
// plus anything in vars. With a unit: a {q|unit} marker. Without: plain number (or the string value).
export function tpl(s, vars) {
  return String(s == null ? '' : s).replace(/\{\{\s*(?:([\d.]+)\s*\*\s*)?([A-Za-z]+)\s*(?:\|\s*(\w+))?\s*\}\}/g, (m, k, v, u) => {
    let val = vars[v];
    if (v === 'chicken' && !u) u = 'portion';
    if (v === 'mince' && !u) u = 'g';
    if (val == null) return m;
    if (typeof val === 'string') return val;
    val *= k ? parseFloat(k) : 1;
    return u ? `{${_r3(val)}|${u}}` : _numDa(val);
  });
}

// ---------- dates and seeds
export function isoWeek(date) {
  const src = date instanceof Date ? date : new Date(date == null ? Date.now() : date);
  const d = new Date(Date.UTC(src.getFullYear(), src.getMonth(), src.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d - Date.UTC(year, 0, 1)) / 864e5 + 1) / 7);
  return { year, week };
}
// The week you shop and prep for: Mon-Fri = this week, Sat/Sun = next week.
export function planWeek(date) {
  const d = date instanceof Date ? new Date(date.getTime()) : new Date(date == null ? Date.now() : date);
  const g = d.getDay();
  if (g === 6) d.setDate(d.getDate() + 2);
  else if (g === 0) d.setDate(d.getDate() + 1);
  return isoWeek(d);
}
export const weekKey = (w) => `${w.year}-W${String(w.week).padStart(2, '0')}`;
// Seed string for pickWeek: '2026-W42', or '2026-W42#3' after pressing "Bland igen" 3 times.
export const seedFor = (w, offset) => weekKey(w) + (offset ? '#' + offset : '');

function _hash32(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}
export function rng(seedStr) {
  let a = _hash32(String(seedStr));
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- week picking
const _chickenLimit = (n) => Math.min(1440, 1200 * Math.max(1, n / 7));
const _batchesFor = (g) => (g > 0 ? Math.max(1, Math.ceil(g / 360 - 1e-9)) : 0);
// Rough prep minutes for pickWeek feasibility (buildPrep is the real thing).
function _estPrep(list) {
  let ch = 0, rice = 0, pasta = 0;
  const ids = new Set(), vars = new Set();
  for (const r of list) {
    ch += _chickenOf(r); rice += _perOf(r).rice || 0; pasta += _perOf(r).pasta || 0;
    ids.add(r.id); const v = _minceOf(r); if (v) vars.add(v);
  }
  const nb = _batchesFor(ch);
  const air = nb ? 16 + nb * 17 : 0;
  const pot = (rice ? 30 : 0) + (pasta ? 22 : 0);
  const pan = vars.size ? 20 + vars.size * 7 : 0;
  return Math.max(air, pot + 8, pan + 6, 20) + 2 * ids.size + 14;
}

function _slotsOf(meals) {
  const out = [];
  DAYS.forEach((day, di) => ['lunch', 'dinner'].forEach((slot) => {
    if (meals && meals[day] && meals[day][slot]) out.push({ day, di, slot, key: `${day}:${slot}` });
  }));
  return out;
}

function _hardOk(assigned, s, r, n, level) {
  if (!r) return false;
  const rs = r.slot || 'lunch';
  if (s.slot === 'lunch' && rs !== 'lunch' && rs !== 'both') return false;
  if (r.freezeOk === false && s.di > 1) return false;
  let same = 0;
  for (const k in assigned) {
    if (k === s.key) continue;
    const a = assigned[k];
    if (a.r.id === r.id) { same++; if (a.s.day === s.day) return false; }
  }
  if (same >= 2) return false;
  if (level >= 1) return true;
  const list = [r];
  for (const k in assigned) if (k !== s.key) list.push(assigned[k].r);
  const vars = new Set(list.map(_minceOf).filter(Boolean));
  if (vars.size > 2) return false;
  if (level === 0) {
    if (list.filter(_isTaco).length > 3) return false;
    const sauces = new Set(list.filter((x) => _chickenOf(x) > 0).map((x) => x.id));
    if (sauces.size > 3) return false;
  }
  if (list.reduce((a, x) => a + _chickenOf(x), 0) > _chickenLimit(n) + 1e-6) return false;
  if (_estPrep(list) > 90) return false;
  return true;
}

function _weightOf(assigned, s, r, fresh) {
  const rs = r.slot || 'lunch';
  let w = 1;
  if (s.slot === 'dinner') w *= rs === 'dinner' ? 3 : rs === 'both' ? 2.5 : 0.25;
  let same = 0, sameStyle = 0;
  for (const k in assigned) { const a = assigned[k].r; if (a.id === r.id) same++; if (a.style === r.style) sameStyle++; }
  if (same) w *= 0.45;
  if (sameStyle) w *= Math.pow(0.6, sameStyle);
  if (fresh.has(r.id)) w *= 4;
  return w;
}

function _choose(rand, items, weights) {
  const tot = weights.reduce((a, b) => a + b, 0);
  let x = rand() * tot;
  for (let i = 0; i < items.length; i++) { x -= weights[i]; if (x <= 0) return items[i]; }
  return items[items.length - 1];
}

function _makePlan(slots, assigned, byId, seedStr, wk, fresh) {
  const days = DAYS.map((day, di) => {
    const d = { day, name: DAY_DA[day], lunch: null, dinner: null };
    ['lunch', 'dinner'].forEach((slot) => {
      const a = assigned[`${day}:${slot}`];
      if (!a) return;
      const r = a.r;
      const fridge = di <= 1 || r.freezeOk === false;
      d[slot] = { r: r.id, s: fridge ? 'fridge' : 'freezer', thaw: fridge ? null : DAYS[di - 1], box: _CONTAINER_BOX[r.container] || 'boks', slot };
    });
    return d;
  });
  const ids = [];
  days.forEach((d) => [d.lunch, d.dinner].forEach((m) => { if (m && !ids.includes(m.r)) ids.push(m.r); }));
  const names = {};
  ids.forEach((id) => { names[id] = _shortName(byId[id]); });
  return { days, recipes: ids, count: slots.length, seed: seedStr, week: wk, names, fresh: [...fresh].filter((id) => ids.includes(id)) };
}

export function pickWeek(recipes, meals, seedStr, overrides) {
  const list = (Array.isArray(recipes) ? recipes : Object.values(recipes || {})).filter((r) => r && r.id);
  const byId = _toMap(list);
  meals = meals || DEFAULT_MEALS;
  overrides = overrides || {};
  seedStr = String(seedStr || weekKey(planWeek(new Date())));
  const wk = (/^(\d{4}-W\d{2})/.exec(seedStr) || [])[1] || null;
  const slots = _slotsOf(meals);
  const n = slots.length;
  const fresh = new Set(list.filter((r) => wk && r.added === wk).map((r) => r.id));
  const styleTarget = n >= 5 ? Math.min(3, new Set(list.map((r) => r.style)).size) : 0;
  const forced = {};
  for (const s of slots) { const id = overrides[s.key]; if (id && byId[id]) forced[s.key] = { r: byId[id], s }; }
  const free = slots.filter((s) => !forced[s.key]);
  // lunches first (fewer candidates), then dinners
  const order = free.filter((s) => s.slot === 'lunch').concat(free.filter((s) => s.slot === 'dinner'));
  let best = null;
  for (let attempt = 0; attempt < 120; attempt++) {
    const level = attempt < 100 ? 0 : 1;
    const wantFresh = attempt < 60;
    const rand = rng(seedStr + '|' + attempt);
    const assigned = Object.assign({}, forced);
    let failed = false;
    if (wantFresh) {
      const fr = [...fresh].sort();
      for (let i = fr.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [fr[i], fr[j]] = [fr[j], fr[i]]; }
      for (const id of fr) {
        const r = byId[id];
        if (Object.values(assigned).some((a) => a.r.id === id)) continue;
        const open = order.filter((s) => !assigned[s.key] && _hardOk(assigned, s, r, n, level));
        if (!open.length) { failed = true; break; }
        const pref = open.filter((s) => s.slot === (r.slot === 'dinner' ? 'dinner' : 'lunch'));
        const pool = pref.length ? pref : open;
        const s = pool[Math.floor(rand() * pool.length)];
        assigned[s.key] = { r, s };
      }
      if (failed) continue;
    }
    for (const s of order) {
      if (assigned[s.key]) continue;
      const cands = list.filter((r) => _hardOk(assigned, s, r, n, level));
      if (!cands.length) { failed = true; break; }
      const r = _choose(rand, cands, cands.map((r) => _weightOf(assigned, s, r, fresh)));
      assigned[s.key] = { r, s };
    }
    if (failed) continue;
    const styles = new Set(Object.values(assigned).map((a) => a.r.style));
    if (level === 0 && styles.size < styleTarget) { if (!best) best = assigned; continue; }
    return _makePlan(slots, assigned, byId, seedStr, wk, fresh);
  }
  if (best) return _makePlan(slots, best, byId, seedStr, wk, fresh);
  // Last resort: anything that fits the slot.
  const rand = rng(seedStr + '|fallback');
  const assigned = Object.assign({}, forced);
  for (const s of order) {
    let cands = list.filter((r) => _hardOk(assigned, s, r, n, 1));
    if (!cands.length) cands = list.filter((r) => s.slot === 'dinner' || r.slot !== 'dinner');
    if (!cands.length) cands = list;
    if (cands.length) assigned[s.key] = { r: cands[Math.floor(rand() * cands.length)], s };
  }
  return _makePlan(slots, assigned, byId, seedStr, wk, fresh);
}

function _assignedFromPlan(plan, byId) {
  const assigned = {}, slots = [];
  (plan.days || []).forEach((d) => ['lunch', 'dinner'].forEach((slot) => {
    const m = d[slot];
    if (!m) return;
    const s = { day: d.day, di: DAYS.indexOf(d.day), slot, key: `${d.day}:${slot}` };
    slots.push(s);
    if (byId[m.r]) assigned[s.key] = { r: byId[m.r], s };
  }));
  return { assigned, slots };
}

// Valid swaps for "Byt ret" in slotKey ('Wed:dinner'), best fits first.
export function alternatives(recipes, plan, slotKey) {
  const list = (Array.isArray(recipes) ? recipes : Object.values(recipes || {})).filter((r) => r && r.id);
  const byId = _toMap(list);
  const { assigned, slots } = _assignedFromPlan(plan, byId);
  const [day, slot] = String(slotKey).split(':');
  const s = slots.find((x) => x.key === slotKey) || { day, slot, di: DAYS.indexOf(day), key: slotKey };
  const cur = assigned[slotKey] && assigned[slotKey].r.id;
  const rest = Object.assign({}, assigned);
  delete rest[slotKey];
  const n = Math.max(1, slots.length);
  const rank = (r) => (s.slot === 'dinner' ? (r.slot === 'dinner' ? 0 : r.slot === 'both' ? 1 : 2) : 0);
  // Strict fits first, then ones that only bend the soft limits (4th chicken sauce, 4th taco meal), then anything that fits the slot.
  const sort = (a) => a.sort((x, y) => rank(x) - rank(y) || String(x.name).localeCompare(String(y.name), 'da'));
  const out = [];
  for (const level of [0, 0.5, 1]) {
    if (level === 1 && out.length) break;
    sort(list.filter((r) => r.id !== cur && !out.includes(r) && _hardOk(rest, s, r, n, level))).forEach((r) => out.push(r));
  }
  return out.map((r) => r.id);
}

// ---------- needs
function _variantDef(v, byId, ids) {
  if (MINCE[v]) return Object.assign({ id: v, builtin: true }, MINCE[v]);
  for (const id of ids) {
    const r = byId[id];
    if (!r || _minceOf(r) !== v) continue;
    if (r.minceVariant) return Object.assign({ id: v, a: v.toUpperCase(), min: 4, n: v, def: v }, r.minceVariant, { owner: r.id });
    const pe = (r.prepExtra || []).find((p) => p.k === 'pan');
    if (pe) {
      const lab = _splitLabel(pe.x || '', '');
      const n = lab.a ? lab.a.toLowerCase() : v;
      return { id: v, n, def: 'kødet til ' + n, min: pe.min || 4, x: pe.x, a: pe.a, owner: r.id, extra: pe, raw: true };
    }
  }
  return { id: v, n: v, def: 'kødet til ' + v, min: 3, x: 'Krydr kødet til {{n|portion}}. Rør rundt, 2 min.', a: 'KRYDR', raw: true };
}

export function computeNeeds(plan, recipes, f) {
  f = f || 1;
  const byId = _toMap(recipes);
  const portions = {};
  (plan.days || []).forEach((d) => [d.lunch, d.dinner].forEach((m) => {
    if (m && byId[m.r]) portions[m.r] = _r3((portions[m.r] || 0) + f);
  }));
  const base = { chicken: 0, mince: {}, rice: 0, pasta: 0, wedges: 0 };
  const products = {}, optional = {};
  const add = (id, q, opt) => {
    if (!id || !(q > 0)) return;
    products[id] = _r3((products[id] || 0) + q);
    optional[id] = optional[id] === false ? false : !!opt;
  };
  for (const id in portions) {
    const r = byId[id], n = portions[id], p = _perOf(r);
    base.chicken += (p.chicken || 0) * n;
    const v = _minceOf(r);
    if (v) base.mince[v] = (base.mince[v] || 0) + p.mince * n;
    base.rice += (p.rice || 0) * n;
    base.pasta += (p.pasta || 0) * n;
    base.wedges += (p.wedges || 0) * n;
    (r.products || []).forEach((x) => add(x.id, x.q * n, x.opt));
  }
  const ids = Object.keys(portions);
  for (const v in base.mince) {
    const def = _variantDef(v, byId, ids);
    (def.products || []).forEach((x) => add(x.id, (x.q * base.mince[v]) / 100, false));
  }
  const minceTotal = Object.values(base.mince).reduce((a, b) => a + b, 0);
  for (const k of ['chicken', 'rice', 'pasta', 'wedges']) add(_BASE_PRODUCT[k], base[k], false);
  add(_BASE_PRODUCT.mince, minceTotal, false);
  if (base.chicken) BASE_USE.A.forEach((x) => add(x.id, (x.q * base.chicken) / 1000, false));
  if (minceTotal) BASE_USE.B.forEach((x) => add(x.id, (x.q * minceTotal) / 100, false));
  if (base.rice) BASE_USE.C.forEach((x) => add(x.id, (x.q * base.rice) / 100, false));
  if (base.pasta) BASE_USE.D.forEach((x) => add(x.id, (x.q * base.pasta) / 100, false));
  for (const k of ['chicken', 'rice', 'pasta', 'wedges']) base[k] = _r3(base[k]);
  for (const v in base.mince) base.mince[v] = _r3(base.mince[v]);
  return { base, products, optional, portions, f };
}

// ---------- shopping
export const SHOP_SECS = ['Frugt og grønt', 'Kød og køl', 'Frost', 'Kolonial', 'Brød'];
const _shopItem = (id, p, need, opt) => ({
  id, n: p.n, u: p.u === 'pack' ? undefined : p.u, need: _r3(need), size: p.size || 1, label: p.label, unit: p.unit, plural: p.plural,
  price: p.price || 0, where: p.where || 'Alle', alt: p.alt, opt: opt == null ? !!p.opt : !!opt,
});
const _packCount = (it) => Math.max(1, Math.ceil(it.need / it.size - 1e-9));

export function buildShop(needs, products, f) {
  const secs = {};
  const order = Object.keys(products);
  const ids = Object.keys(needs.products).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  for (const id of ids) {
    const p = products[id];
    if (!p || p.staple || p.gear) continue;
    const sec = SHOP_SECS.includes(p.sec) ? p.sec : 'Kolonial';
    (secs[sec] = secs[sec] || []).push(_shopItem(id, p, needs.products[id], needs.optional[id]));
  }
  const out = SHOP_SECS.filter((s) => secs[s]).map((sec) => ({ sec, items: secs[sec] }));
  out.portions = Object.values(needs.portions).reduce((a, b) => a + b, 0);
  return out;
}

export function priceSummary(shop, portions) {
  let total = 0, withOpt = 0;
  (shop || []).forEach((g) => (g.items || []).forEach((it) => {
    const p = _packCount(it) * (it.price || 0);
    withOpt += p;
    if (!it.opt) total += p;
  }));
  const n = portions || shop.portions || 0;
  return { total, withOpt, perMeal: n ? Math.round(total / n) : 0 };
}

// Starter list: staples + everything this week's recipes use (plan null = every recipe, one portion each).
// secs = DATA.STARTER_SECS ([{ key, sec, note }]) for titles, notes and order.
export function buildStarter(recipes, products, plan, secs) {
  const byId = _toMap(recipes);
  let p = plan;
  if (!p) {
    const ids = Object.keys(byId);
    p = { days: ids.map((id) => ({ lunch: { r: id } })) };
  }
  const needs = computeNeeds(p, byId, 1);
  const use = {};
  const mark = (pid, rid) => { (use[pid] = use[pid] || []).includes(rid) || use[pid].push(rid); };
  const ids = Object.keys(needs.portions);
  for (const rid of ids) {
    const r = byId[rid], pr = _perOf(r);
    (r.products || []).forEach((x) => mark(x.id, rid));
    for (const k of ['chicken', 'rice', 'pasta', 'wedges']) if (pr[k] > 0) mark(_BASE_PRODUCT[k], rid);
    if (pr.mince > 0) {
      mark('oksekoed', rid);
      (_variantDef(_minceOf(r), byId, ids).products || []).forEach((x) => mark(x.id, rid));
      BASE_USE.B.forEach((x) => mark(x.id, rid));
    }
    if (pr.chicken > 0) BASE_USE.A.forEach((x) => mark(x.id, rid));
  }
  const usesGlass = ids.some((id) => byId[id].container === 'glasboks');
  const items = {};
  const order = Object.keys(products);
  for (const id of order) {
    const pr = products[id];
    if (!pr) continue;
    const used = needs.products[id] > 0;
    if (pr.gear ? !usesGlass : !(used || pr.staple)) continue;
    const it = _shopItem(id, pr, used ? needs.products[id] : pr.size || 1, used ? needs.optional[id] : null);
    Object.assign(it, { life: pr.life || '', open: pr.open || '', use: (use[id] || []).filter((x) => byId[x]), tip: pr.tip });
    if (pr.gear) it.need = it.size;
    const key = pr.ssec || (pr.staple ? 'basis' : 'toer');
    (items[key] = items[key] || []).push(it);
  }
  const defs = secs && secs.length ? secs : Object.keys(items).map((key) => ({ key, sec: key, note: '' }));
  const out = defs.filter((s) => items[s.key]).map((s) => ({ sec: s.sec, note: s.note || '', items: items[s.key] }));
  Object.keys(items).forEach((k) => { if (!defs.some((s) => s.key === k)) out.push({ sec: k, note: '', items: items[k] }); });
  return out;
}

// ---------- reminders
export function reminders(plan, recipes) {
  const byId = recipes ? _toMap(recipes) : {};
  const nm = (id) => (plan.names && plan.names[id]) || (byId[id] && _shortName(byId[id])) || id;
  const out = [];
  let anyFreezer = false, anyLunch = false;
  plan.days.forEach((d) => {
    if (d.lunch) anyLunch = true;
    const ms = [d.lunch, d.dinner].filter((m) => m && m.s === 'freezer');
    if (!ms.length) return;
    anyFreezer = true;
    const groups = {};
    ms.forEach((m) => { (groups[m.box] = groups[m.box] || []).push(nm(m.r)); });
    const parts = Object.keys(groups).map((b) => {
      const c = groups[b].length, names = _listDa(groups[b]);
      if (b === 'pose') return c > 1 ? `${c} fryseposer (${names})` : `frysepose (${names})`;
      if (b === 'glasboks') return c > 1 ? `${c} glasbokse (${names})` : `glasboks (${names})`;
      return c > 1 ? `${c} bokse (${names})` : `boks (${names})`;
    });
    const thaw = ms[0].thaw;
    out.push(`${DAY_DA[thaw]} aften: flyt ${_DAY_GEN[d.day]} ${_listDa(parts)} fra fryser til køleskab.`);
  });
  if (anyFreezer) out.push('Optøede bokse: spis dem inden for 24 timer, og frys dem aldrig igen.');
  if (anyLunch) out.push('Frokost på uni: læg boksen i et køleskab, eller tag den med i en køletaske med et køleelement.');
  return out;
}

// ---------- prep day: a small resource scheduler
// Jobs hold a device (pot | pan | air) from their first to their last phase. Each phase needs `hands` minutes
// of you (single-threaded), then `wait` minutes where the device works alone. The airfryer job also covers
// the microwave (it is one combo device), so they can never overlap.
const _fmtT = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const _fracWord = (r) => (r < 0.3 ? 'En fjerdedel' : r < 0.42 ? 'En tredjedel' : r < 0.58 ? 'Halvdelen' : r < 0.72 ? 'To tredjedele' : 'Tre fjerdedele');

function _splitLabel(x, fallback) {
  const m = /^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{1,18}):\s+(.*)$/.exec(x);
  if (m && !/\{/.test(m[1])) return { a: m[1].toUpperCase(), x: _cap(m[2]) };
  return { a: fallback, x };
}
const _actOf = (r) => { const s = _shortName(r).toUpperCase(); return s.length <= 14 ? s : s.split(/\s+/)[0]; };
const _assembleList = (r) => (Array.isArray(r.assemble) ? r.assemble : r.assemble ? [r.assemble] : []).map((x) => (typeof x === 'string' ? { x } : x));

export function buildPrep(plan, needs, recipes, data, f) {
  f = f || needs.f || 1;
  data = data || {};
  const T = Object.assign({}, PREP_TEXT, data.PREP_TEXT || {});
  const byId = _toMap(recipes);
  const ids = Object.keys(needs.portions).filter((id) => byId[id]);
  const P = needs.portions;
  const R = ids.map((id) => byId[id]);
  const cnt = (id) => Math.max(1, Math.ceil(P[id] - 1e-9));
  const base = needs.base;
  const chickenG = base.chicken;
  const variants = Object.keys(base.mince).filter((v) => base.mince[v] > 0).sort((a, b) => base.mince[b] - base.mince[a]);
  const minceG = variants.reduce((a, v) => a + base.mince[v], 0);
  const vdef = Object.fromEntries(variants.map((v) => [v, _variantDef(v, byId, ids)]));
  const absorbed = new Set(variants.map((v) => vdef[v].extra).filter(Boolean));
  const usesMicro = R.some((r) => (r.prepExtra || []).some((p) => p.k === 'micro'));

  const jobs = [];
  const job = (o) => { const j = Object.assign({ deps: [], prio: 5, res: null }, o); jobs.push(j); return j; };
  const ph = (k, a, x, hands, wait, extra) => Object.assign({ k, a, x, hands: hands || 0, wait: wait || 0 }, extra || {});

  // Chicken
  let batches = [], chickenOut = [], batchG = 0, nb = 0, lastBatch = null, rawEmpty = false;
  if (chickenG > 0) {
    const kg = chickenG / 1000;
    const klip = Math.max(3, Math.round(6 * kg));
    const prep = job({ id: 'chickenPrep', prio: 0, phases: [
      ph('you', 'KLIP', tpl(T.klip, { g: chickenG, min: klip }), klip),
      ph('you', 'KRYDR', tpl(T.krydr, { k: kg }), 2),
      ph('you', 'VEND', tpl(T.coat, { k: kg }), 3),
      ph('you', 'VASK', T.washHands, 1),
    ] });
    nb = _batchesFor(chickenG);
    batchG = chickenG / nb;
    let prev = prep;
    for (let i = 0; i < nb; i++) {
      const phases = [];
      if (i === 0) {
        phases.push(ph('air', 'TÆND', T.airOn, 1, 3));
        phases.push(ph('air', 'IND', nb === 1 ? tpl(T.batchOnly, { g: chickenG }) : tpl(T.batchFirst, { nb, g: batchG }), 1, 7,
          { onRun: () => { if (nb === 1) rawEmpty = true; } }));
      } else {
        const idx = i - 1;
        phases.push(ph('air', 'SKIFT', tpl(T.batchSwap, { prev: String(i), i: String(i + 1), g: batchG }), 1, 7,
          { onRun: (t) => { chickenOut[idx] = t + 1; if (i === nb - 1) rawEmpty = true; } }));
      }
      phases.push(ph('air', 'VEND', T.batchTurn, 1, 7));
      if (i === nb - 1) phases.push(ph('air', 'UD', nb === 1 ? T.batchOut : T.batchLast, 1, 0, { onRun: (t) => { chickenOut[i] = t + 1; } }));
      const j = job({ id: 'batch' + i, res: 'air', prio: 0, deps: [prev.id], phases });
      batches.push(j);
      prev = j;
    }
    lastBatch = batches[nb - 1];
    job({ id: 'rawBowl', prio: 7, ready: () => rawEmpty, phases: [ph('you', 'VASK', T.rawBowl, 2)] });
  }
  const chickenAt = (g) => (st) => {
    if (!nb) return true;
    const need = Math.ceil(g / batchG - 1e-6);
    let out = 0;
    for (let i = 0; i < nb; i++) if (chickenOut[i] != null && chickenOut[i] <= st.t) out++;
    return out >= Math.min(nb, need);
  };

  // Which recipes take their base out of the shared pot/pan themselves (in a prepExtra)
  const extrasOf = (r) => (r.prepExtra || []).filter((p) => !absorbed.has(p));
  const mentions = (r, re) => extrasOf(r).some((p) => re.test(p.x || ''));
  const keepsPasta = (r) => _perOf(r).pasta > 0 && (extrasOf(r).some((p) => p.k === 'pot') || mentions(r, /pasta/i));
  const keepsRice = (r) => _perOf(r).rice > 0 && mentions(r, /\bris(en)?\b/i);

  // Rice
  const riceJobs = [];
  if (base.rice > 0) {
    const boxR = R.filter((r) => _perOf(r).rice > 0 && !keepsRice(r));
    const keep = R.some(keepsRice);
    const rounds = base.rice > 1000 ? 2 : 1;
    const totalBoxes = boxR.reduce((a, r) => a + cnt(r.id), 0);
    let prev = null;
    for (let i = 0; i < rounds; i++) {
      const k = base.rice / rounds / 200;
      const boxes = rounds === 1 ? totalBoxes : i === 0 ? Math.ceil(totalBoxes / 2) : totalBoxes - Math.ceil(totalBoxes / 2);
      const phases = [
        ph('pot', 'SKYL', tpl(i ? T.riceStart2 : T.riceStart, { k }), 2, 5),
        ph('pot', 'SKRU NED', T.riceLow, 0, 12),
        ph('pot', 'SLUK', T.riceOff, 0, 8),
      ];
      if (boxes > 0) phases.push(ph('pot', 'FORDEL', tpl(keep && i === rounds - 1 ? T.riceSplitRest : T.riceSplit, { n: boxes }), 2));
      else phases.push(ph('pot', 'DAMP AF', T.riceKeep, 1));
      const j = job({ id: 'rice' + i, res: 'pot', prio: -1, deps: prev ? [prev.id] : [], phases });
      riceJobs.push(j);
      prev = j;
    }
  }

  // Pasta
  let pastaJob = null;
  if (base.pasta > 0) {
    const pastaR = R.filter((r) => _perOf(r).pasta > 0);
    const boxP = pastaR.filter((r) => !keepsPasta(r));
    const keep = pastaR.filter(keepsPasta);
    const phases = [
      ph('pot', 'KOG', tpl(riceJobs.length ? T.pastaWater : T.pastaWaterFirst, { s: Math.max(0.5, base.pasta / 200) }), 1, 7),
      ph('pot', 'PENNE', tpl(T.pastaIn, { k: base.pasta / 100 }), 1, 9),
      ph('pot', 'HÆLD FRA', pastaR.length > 1 && keep.length > 0 ? T.pastaDrainSplit : T.pastaDrain, 1),
    ];
    if (boxP.length && (keep.length || boxP.length > 0)) {
      const units = {};
      boxP.forEach((r) => { const u = _unitOf(r); units[u] = (units[u] || 0) + cnt(r.id); });
      const what = _listDa(Object.keys(units).map((u) => `{${units[u]}|${u}}`));
      phases.push(ph('pot', 'FORDEL', tpl(keep.length ? T.pastaSplitRest : T.pastaSplit, { what, names: _listDa(boxP.map((r) => _lc1(_shortName(r)))) }), 2));
    }
    pastaJob = job({ id: 'pasta', res: 'pot', prio: -1, deps: riceJobs.length ? [riceJobs[riceJobs.length - 1].id] : [], phases });
  }

  // Mince: onion, browning, variants, then fill or park
  let minceJob = null;
  const direct = new Set();
  if (minceG > 0) {
    const onion = job({ id: 'onion', prio: 2, phases: [ph('you', 'HAK', tpl(T.onion, { o: minceG / 400 }), 2)] });
    const phases = [];
    if (minceG > 450) {
      phases.push(ph('pan', 'BRUN', tpl(T.brownHalf, { g: minceG / 2, s: minceG / 800 }), 2, 6));
      phases.push(ph('pan', 'BRUN', T.brownSecond, 2, 6));
    } else phases.push(ph('pan', 'BRUN', tpl(T.brown, { g: minceG, s: minceG / 400 }), 2, 6));
    const two = variants.length > 1;
    if (two) {
      const v2 = variants[1];
      phases.push(ph('pan', 'DEL', tpl(T.split, { frac: _fracWord(base.mince[v2] / minceG), g: base.mince[v2], name: vdef[v2].n }), 1));
    }
    variants.forEach((v, vi) => {
      const d = vdef[v];
      const users = R.filter((r) => _minceOf(r) === v);
      const nV = users.reduce((a, r) => a + P[r.id], 0);
      const vars = { m: base.mince[v] / 100, n: nV, mince: base.mince[v] };
      let x = tpl(d.x, vars), a = d.a;
      if (d.raw) { const s = _splitLabel(x, d.a || 'KRYDR'); a = s.a; x = s.x; }
      else x = (two ? (vi === 0 ? T.leadFirst : T.leadSecond) : T.leadOnly) + _lc1(x);
      const hands = Math.min(2, d.min || 2);
      phases.push(ph('pan', a || 'KRYDR', x, hands, Math.max(0, (d.min || 3) - hands)));
      // meat-only recipes go straight from the pan into their boxes; the rest is parked
      const park = [];
      users.forEach((r) => {
        const pr = _perOf(r);
        const only = !(pr.chicken > 0 || pr.rice > 0 || pr.pasta > 0) && !extrasOf(r).length;
        if (only) {
          direct.add(r.id);
          _assembleList(r).forEach((s) => phases.push(ph('pan', s.a || _actOf(r), tpl(s.x, { n: cnt(r.id), c: P[r.id] * (pr.chicken || 0) / 165 }), 1)));
        } else park.push(r);
      });
      if (park.length) {
        const units = {};
        park.forEach((r) => { const u = _unitOf(r); units[u] = (units[u] || 0) + cnt(r.id); });
        const wait = park.some((r) => _perOf(r).pasta > 0) ? 'pastaen' : park.some((r) => _perOf(r).rice > 0) ? 'risen' : 'resten';
        phases.push(ph('pan', 'PARKÉR', tpl(T.park, { Def: _cap(d.def || d.n), what: _listDa(Object.keys(units).map((u) => `{${units[u]}|${u}}`)), wait }), 1));
      }
    });
    minceJob = job({ id: 'mince', res: 'pan', prio: 2, deps: [onion.id], phases });
  }

  // Recipe extras and assembly. Chicken goes to glazed (pan) recipes first, freezer bags last.
  const chickenOrder = R.filter((r) => _perOf(r).chicken > 0).sort((a, b) => {
    const sa = extrasOf(a).some((p) => p.k === 'pan') ? 0 : a.container === 'pose' ? 2 : 1;
    const sb = extrasOf(b).some((p) => p.k === 'pan') ? 0 : b.container === 'pose' ? 2 : 1;
    return sa - sb || P[b.id] - P[a.id] || (a.id < b.id ? -1 : 1);
  });
  const chickenCum = {};
  let cum = 0;
  chickenOrder.forEach((r) => { cum += _perOf(r).chicken * P[r.id]; chickenCum[r.id] = cum; });
  const panJobs = minceJob ? [minceJob] : [];
  const potBase = riceJobs.map((j) => j.id).concat(pastaJob ? [pastaJob.id] : []);
  for (const r of R) {
    if (direct.has(r.id)) continue;
    const pr = _perOf(r);
    const vars = { n: cnt(r.id), c: (P[r.id] * (pr.chicken || 0)) / 165, chicken: (P[r.id] * (pr.chicken || 0)) / 165, mince: P[r.id] * (pr.mince || 0), m: (P[r.id] * (pr.mince || 0)) / 100 };
    const exJobs = [];
    extrasOf(r).forEach((p, i) => {
      const k = p.k === 'micro' ? 'air' : ['pot', 'pan', 'air', 'you'].includes(p.k) ? p.k : 'you';
      const res = k === 'you' ? null : k;
      const min = Math.max(1, p.min || 2);
      const hands = p.hands != null ? p.hands : min <= 3 ? min : 2;
      const deps = [];
      const text = p.x || '';
      const when = p.when;
      let ready = null;
      if (when === 'chicken' || /\{\{\s*(chicken|c)\b/.test(text)) ready = chickenAt(chickenCum[r.id] || 0);
      if (res === 'pan' && minceJob) deps.push(minceJob.id);
      if (res === 'pot') deps.push(...potBase);
      if (pr.pasta > 0 && pastaJob && (res === 'pot' || when === 'pasta' || /pasta/i.test(text))) deps.push(pastaJob.id);
      if (pr.rice > 0 && riceJobs.length && (when === 'rice' || /\bris(en)?\b/i.test(text))) deps.push(...riceJobs.map((j) => j.id));
      if (pr.mince > 0 && minceJob && !deps.includes(minceJob.id)) deps.push(minceJob.id);
      if (res === 'air' && lastBatch) deps.push(lastBatch.id);
      const lab = _splitLabel(tpl(text, vars), p.a || (k === 'pan' ? 'STEG' : k === 'pot' ? 'RØR' : k === 'air' ? 'MIKRO' : 'RØR'));
      const j = job({ id: `x:${r.id}:${i}`, res, prio: deps.length || ready ? 4 : 3, deps: [...new Set(deps)], ready,
        phases: [ph(k, p.a || lab.a, lab.x, Math.min(hands, min), Math.max(0, min - hands))] });
      exJobs.push(j);
      if (res === 'pan') panJobs.push(j);
    });
    const deps = exJobs.map((j) => j.id);
    if (pr.rice > 0) deps.push(...riceJobs.map((j) => j.id));
    if (pr.pasta > 0 && pastaJob) deps.push(pastaJob.id);
    if (pr.mince > 0 && minceJob) deps.push(minceJob.id);
    const steps = _assembleList(r);
    if (!steps.length) continue;
    const hands = Math.min(3, Math.ceil(cnt(r.id) / 2));
    job({ id: 'asm:' + r.id, prio: 5, deps, ready: pr.chicken > 0 ? chickenAt(chickenCum[r.id]) : null,
      phases: steps.map((s, i) => ph('you', s.a || (i ? 'SAML' : _actOf(r)), tpl(s.x, vars), i ? 1 : hands)) });
  }
  if (panJobs.length) job({ id: 'panWash', res: 'pan', prio: 8, deps: panJobs.map((j) => j.id), phases: [ph('you', 'VASK', T.panWash, 2)] });

  // Final: cool and store
  const fridgeDays = [], freezerDays = [];
  plan.days.forEach((d) => {
    const ms = [d.lunch, d.dinner].filter(Boolean);
    if (!ms.length) return;
    if (ms.some((m) => m.s === 'fridge')) fridgeDays.push(d.name);
    if (ms.some((m) => m.s === 'freezer')) freezerDays.push(d.name);
  });
  const hasPose = R.some((r) => r.container === 'pose');
  let store;
  if (!freezerDays.length) store = 'Alt i køleskabet.';
  else if (!fridgeDays.length) store = 'Alt i fryseren.';
  else store = `${_listDa(fridgeDays.map((d, i) => (i ? _lc1(d) : d)))} i køleskabet, resten i fryseren.`;
  const doneTxt = `Låg på${hasPose ? ', posen lukket' : ''}. ${store} Alt er i køl/frys inden for 1 time.`;
  const allIds = jobs.map((j) => j.id);
  job({ id: 'cool', prio: 9, deps: allIds, phases: [ph('you', 'DAMP AF', tpl(T.cool, { what: riceJobs.length || pastaJob ? (chickenG ? 'skål og gryde' : 'gryden') : chickenG ? 'skålene' : 'op' }), 10), ph('you', 'FÆRDIG', doneTxt, 2)] });

  // ---- simulate, minute by minute
  const st = { t: 0, started: {}, done: {} };
  const resFree = { pot: 0, pan: 0, air: 0 };
  let handsFree = 0, handsTotal = 0;
  const running = [];
  const pending = jobs.slice().sort((a, b) => a.prio - b.prio);
  const steps = [];
  const blocks = [];
  const exec = (run, t) => {
    const p = run.job.phases[run.pi];
    steps.push({ t: _fmtT(t), k: p.k, a: p.a, x: p.x, m: t });
    if (p.onRun) p.onRun(t);
    if (p.hands > 0) { handsFree = t + p.hands; handsTotal += p.hands; blocks.push({ k: 'you', s: t, e: t + p.hands, a: p.a }); }
    run.readyAt = t + p.hands + p.wait;
    run.pi++;
    if (run.pi >= run.job.phases.length) {
      st.done[run.job.id] = run.readyAt;
      if (run.job.res) { resFree[run.job.res] = run.readyAt; blocks.push({ k: run.job.res, s: run.start, e: run.readyAt, a: run.job.id }); }
      running.splice(running.indexOf(run), 1);
    }
  };
  for (let t = 0; t < 2000 && (pending.length || running.length); t++) {
    st.t = t;
    let progress = true;
    while (progress) {
      progress = false;
      running.sort((a, b) => a.job.prio - b.job.prio);
      for (const run of running) {
        if (run.readyAt > t) continue;
        const p = run.job.phases[run.pi];
        if (p.hands > 0 && handsFree > t) continue;
        exec(run, t); progress = true; break;
      }
      if (progress) continue;
      for (let i = 0; i < pending.length; i++) {
        const j = pending[i];
        if (!j.deps.every((d) => st.done[d] != null && st.done[d] <= t)) continue;
        if (j.ready && !j.ready(st)) continue;
        if (j.res && (resFree[j.res] > t || running.some((r) => r.job.res === j.res))) continue;
        if (j.phases[0].hands > 0 && handsFree > t) continue;
        pending.splice(i, 1);
        st.started[j.id] = t;
        const run = { job: j, pi: 0, readyAt: t, start: t };
        running.push(run);
        exec(run, t); progress = true; break;
      }
    }
  }
  const end = Math.max(0, ...Object.values(st.done));

  // ---- kit counts
  const boxes = { box: 0, glasboks: 0, fpose: 0, baeger: 0 };
  const usedFor = { glasboks: [], fpose: [], baeger: [] };
  R.forEach((r) => {
    const u = _unitOf(r);
    boxes[u] += cnt(r.id);
    if (usedFor[u]) usedFor[u].push(_lc1(_shortName(r)));
    if (r.sauceCup) { boxes.baeger += cnt(r.id); usedFor.baeger.includes(_lc1(_shortName(r))) || usedFor.baeger.push(_lc1(_shortName(r))); }
  });
  const totalBoxes = boxes.box + boxes.glasboks;
  const kit = [];
  if (totalBoxes) kit.push({ n: 'Madbokse med låg', count: totalBoxes, u: 'box', pl: 'madbokse med låg',
    note: boxes.glasboks ? `Heraf {${boxes.glasboks}|glasboks} til ${_listDa(usedFor.glasboks)}.` : 'Mikroovnsegnede, med låg.' });
  if (boxes.fpose) kit.push({ n: 'Frysepose', count: boxes.fpose, u: 'fpose', pl: 'fryseposer', note: `Til ${_listDa(usedFor.fpose)}.` });
  if (boxes.baeger) kit.push({ n: 'Små bægre med låg', count: boxes.baeger, u: 'baeger', pl: 'små bægre med låg', note: `Til saucen til ${_listDa(usedFor.baeger)}. Små syltetøjsglas virker fint.` });
  (data.KIT_BASE || []).forEach((k) => kit.push(Object.assign({}, k)));

  // ---- day-before steps
  const pre = [];
  if (chickenG > 0) pre.push({ t: 'Dagen før', k: 'you', a: 'TØ OP', x: T.thaw });
  const extra = [];
  if (boxes.fpose) extra.push(`{${boxes.fpose}|fpose}`);
  if (boxes.baeger) extra.push(`{${boxes.baeger}|baeger} med låg`);
  if (totalBoxes || extra.length) {
    let x;
    if (totalBoxes) {
      x = `Find {${totalBoxes}|box} med låg frem` + (boxes.glasboks ? `, heraf {${boxes.glasboks}|glasboks}` : '') + '.';
      if (extra.length) x += ` Plus ${_listDa(extra)}.`;
    } else x = `Find ${_listDa(extra)} frem.`;
    pre.push({ t: 'Dagen før', k: 'you', a: 'FIND', x });
  }
  if (chickenG > 0) pre.push({ t: 'Nødplan', k: 'you', a: 'TØ OP', opt: true, x: usesMicro ? T.emergencyMicro : T.emergency });

  const notes = [];
  if (nb) notes.push(`Kyllingen kører i ${nb} hold à ca. {${Math.round(batchG / 10) * 10}|g}, og det er dem, der sætter tempoet.`);
  if (minceG > 450) notes.push('Over ca. 450 g oksekød: brun det i 2 omgange, ellers koger det i stedet for at brune.');
  if (base.rice > 1000) notes.push('Over 5 krus ris: kog den i 2 omgange.');
  (data.SCALE_NOTES || []).forEach((s) => { if (f >= s.min) notes.push(s.text); });

  const round5 = (m) => Math.max(5, Math.round(m / 5) * 5);
  return {
    steps: pre.concat(steps.map((s) => ({ t: s.t, k: s.k, a: s.a, x: s.x }))),
    minutes: { rutine: round5(end), foersteGang: round5(end * 1.3), aktiv: round5(handsTotal), end },
    kit, notes, blocks, batches: nb, boxes,
  };
}

// One call for the page: everything from (recipes, meals, seed, overrides, f).
export function computeAll(data, meals, seedStr, overrides, f) {
  f = f || 1;
  const plan = pickWeek(data.RECIPES, meals, seedStr, overrides);
  const needs = computeNeeds(plan, data.RECIPES, f);
  const shop = buildShop(needs, data.PRODUCTS, f);
  return {
    plan, needs, shop,
    price: priceSummary(shop),
    starter: buildStarter(data.RECIPES, data.PRODUCTS, plan, data.STARTER_SECS),
    prep: buildPrep(plan, needs, data.RECIPES, data, f),
    reminders: reminders(plan, data.RECIPES),
  };
}
