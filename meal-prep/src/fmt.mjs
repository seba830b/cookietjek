// Shared by build.mjs (markdown) and inlined into index.html.
// Unit codes for fmtQty (codes are ASCII so the {q|unit} markers work, output is Danish):
//   g, ml      weight/volume. g >= 1000 = kg. ml 100-999 = dl, >= 1000 = L. Decimal comma.
//   tsp        teske (tsk). 3 tsk or more = "1 spsk + 1 tsk". Tiny = "en knivspids".
//   tbsp       spiseske (spsk) for wet stuff. Over 4 spsk turns into ml/dl.
//   dtbsp      spsk for dry stuff (majsstivelse, smør). Never turns into ml.
//   pcs        bare number, halves under 10 ("2½").
//   can jar bag cube pose krus portion box onion haandfuld stk fpose baeger glasboks   counted, Danish singular/plural.
//   box fpose baeger glasboks are containers: always whole, rounded up.
const FRAC = { 0: '', 0.125: '⅛', 0.25: '¼', 0.5: '½', 0.75: '¾' };
const UNITS = {
  tsp: ['tsk', 'tsk'], tbsp: ['spsk', 'spsk'], dtbsp: ['spsk', 'spsk'],
  can: ['dåse', 'dåser'], jar: ['glas', 'glas'], bag: ['brev', 'breve'], cube: ['terning', 'terninger'],
  pose: ['pose', 'poser'], krus: ['krus', 'krus'], portion: ['portion', 'portioner'], box: ['boks', 'bokse'],
  onion: ['løg', 'løg'], haandfuld: ['håndfuld', 'håndfulde'], stk: ['stk', 'stk'],
  fpose: ['frysepose', 'fryseposer'], baeger: ['lille bæger', 'små bægre'], glasboks: ['ovnfast glasboks', 'ovnfaste glasbokse'],
};
// Containers are always whole numbers, rounded up.
const WHOLE = { box: 1, fpose: 1, baeger: 1, glasboks: 1 };

function frac(r) {
  const whole = Math.floor(r);
  return (whole ? whole : '') + FRAC[r - whole];
}

function dec(x) {
  return String(Math.round(x * 10) / 10).replace('.', ',');
}

function metric(v, u) {
  if (u === 'g' && v >= 1000) return dec(v / 1000) + ' kg';
  if (u === 'ml' && v >= 1000) return dec(v / 1000) + ' L';
  if (u === 'ml' && v >= 100) return dec(v / 100) + ' dl';
  if (v >= 250) return Math.round(v / 10) * 10 + ' ' + u;
  if (v >= 10) return Math.round(v / 5) * 5 + ' ' + u;
  return Math.max(1, Math.round(v)) + ' ' + u;
}

function spoonsTsp(v) {
  if (v < 0.2) return 'en knivspids';
  if (v < 3) return frac(Math.max(0.25, Math.round(v * 4) / 4)) + ' tsk';
  const half = Math.round(v * 2) / 2;
  const tb = Math.floor(half / 3);
  const rest = half - tb * 3;
  return tb + ' spsk' + (rest ? ' + ' + frac(rest) + ' tsk' : '');
}

function counted(v) {
  if (v < 0.1) return null;
  if (v < 0.2) return 0.125;
  if (v < 10) return Math.max(0.25, Math.round(v * 4) / 4);
  return Math.round(v);
}

export function fmtQty(q, u, f) {
  if (q == null) return '';
  const v = q * (f || 1);
  if (u === 'g' || u === 'ml') return metric(v, u);
  if (u === 'tsp') return spoonsTsp(v);
  if (u === 'tbsp' || u === 'dtbsp') {
    if (v < 0.5) return spoonsTsp(v * 3);
    if (u === 'tbsp' && v > 4) return metric(v * 15, 'ml');
    const r = v > 4 ? Math.round(v) : Math.round(v * 2) / 2;
    return frac(r) + ' spsk';
  }
  if (u === 'pcs') {
    const r = v < 10 ? Math.max(0.5, Math.round(v * 2) / 2) : Math.round(v);
    return frac(r) || '½';
  }
  const r = WHOLE[u] ? Math.max(1, Math.ceil(v - 1e-9)) : counted(v);
  const names = UNITS[u];
  if (r == null) return names ? 'en smule' : 'lidt';
  if (!names) return (frac(r) + ' ' + (u || '')).trim();
  return frac(r) + ' ' + (r > 1 ? names[1] : names[0]);
}

export function fmtText(s, f) {
  return s.replace(/\{([\d.]+)\|(\w+)\}/g, (_, q, u) => fmtQty(parseFloat(q), u, f));
}

export function packs(it, f) {
  return Math.max(1, Math.ceil((it.need * (f || 1)) / it.size - 1e-9));
}
