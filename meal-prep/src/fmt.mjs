// Shared by build.mjs (markdown) and inlined into index.html.
// Units for fmtQty:
//   g, ml      weight/volume. >= 1000 becomes kg / L. Rounded to 5 (under 250) or 10.
//   tsp        spoons, dry or wet. 3 tsp or more becomes "1 tbsp + 1 tsp" style.
//   tbsp       wet/saucy spoons. Over 4 tbsp becomes ml (16 tbsp salsa = 240 ml).
//   dtbsp      dry spoons (cornstarch). Shown as tbsp, never converted to ml.
//   pcs        countable things, shown as a bare number.
//   can, jar, bag, cube   packs. Plural above 1.
const FRAC = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' };
const PLURAL = { can: 'cans', jar: 'jars', bag: 'bags', cube: 'cubes' };

function frac(r) {
  const whole = Math.floor(r);
  return (whole ? whole : '') + FRAC[r - whole];
}

function metric(v, u) {
  if (v >= 1000) return (Math.round(v / 100) / 10).toString() + ' ' + (u === 'g' ? 'kg' : 'L');
  if (v >= 250) return Math.round(v / 10) * 10 + ' ' + u;
  if (v >= 10) return Math.round(v / 5) * 5 + ' ' + u;
  return Math.max(1, Math.round(v)) + ' ' + u;
}

function spoonsTsp(v) {
  if (v < 0.2) return 'a pinch';
  if (v < 3) return frac(Math.max(0.25, Math.round(v * 4) / 4)) + ' tsp';
  const half = Math.round(v * 2) / 2;
  const tb = Math.floor(half / 3);
  const rest = half - tb * 3;
  return tb + ' tbsp' + (rest ? ' + ' + frac(rest) + ' tsp' : '');
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
    return frac(r) + ' tbsp';
  }
  if (u === 'pcs') return v >= 1 ? String(Math.round(v)) : frac(Math.max(0.25, Math.round(v * 4) / 4));
  const r = Math.max(0.25, Math.round(v * 4) / 4);
  const unit = r > 1 && PLURAL[u] ? PLURAL[u] : u || '';
  return (frac(r) + ' ' + unit).trim();
}

export function fmtText(s, f) {
  return s.replace(/\{([\d.]+)\|(\w+)\}/g, (_, q, u) => fmtQty(parseFloat(q), u, f));
}

export function packs(it, f) {
  return Math.max(1, Math.ceil((it.need * (f || 1)) / it.size - 1e-9));
}
