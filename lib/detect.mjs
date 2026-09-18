import { CMPS, classifyLabel } from './trackers.mjs';

// Runs inside the page, so it must be self-contained: everything it needs
// arrives via cmpSelectors. Walks the light DOM and open shadow roots, because
// several CMPs (Usercentrics among them) render into a shadow tree where an
// ordinary querySelectorAll finds nothing.
function findBannerInPage(cmpSelectors) {
  const isVisible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const nodes = [];
  const walk = (root) => {
    let els;
    try { els = root.querySelectorAll('*'); } catch { return; }
    for (const el of els) {
      nodes.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document);

  // Pass 1: a known CMP container.
  let container = null;
  let cmp = null;
  let usedSelector = null;
  for (const entry of cmpSelectors) {
    for (const sel of entry.selector.split(',').map((s) => s.trim())) {
      const hit = nodes.find((el) => { try { return el.matches(sel); } catch { return false; } });
      if (hit) { container = hit; cmp = entry.name; usedSelector = sel; break; }
    }
    if (container) break;
  }

  // Pass 2: generic. A pinned, visible box that talks about cookies.
  if (!container) {
    const KEYWORDS = ['cookie', 'samtykke', 'consent'];
    const candidates = nodes.filter((el) => {
      const s = getComputedStyle(el);
      if (s.position !== 'fixed' && s.position !== 'sticky') return false;
      if (!isVisible(el)) return false;
      const t = (el.textContent || '').toLowerCase();
      return KEYWORDS.some((k) => t.includes(k)) && t.length < 4000;
    });
    // Smallest such box that still holds a control, so we get the banner and
    // not a wrapper that happens to contain the whole page.
    candidates.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
    container =
      candidates.find((el) => el.querySelector('button, a, input[type=button], input[type=submit]')) ||
      candidates[0] ||
      null;
    if (container) usedSelector = 'heuristik: fastgjort boks der nævner cookies';
  }

  if (!container) return { found: false };

  const controls = [];
  const seen = new Set();
  const collect = (root) => {
    let els;
    try {
      els = root.querySelectorAll('button, a, input[type=button], input[type=submit], [role=button]');
    } catch { return; }
    for (const el of els) {
      if (seen.has(el)) continue;
      seen.add(el);
      const text = (el.innerText || el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
      if (text) controls.push({ text, visible: isVisible(el) });
      if (el.shadowRoot) collect(el.shadowRoot);
    }
  };
  collect(container);
  if (container.shadowRoot) collect(container.shadowRoot);

  const rect = container.getBoundingClientRect();
  return {
    found: true,
    cmp,
    selector: usedSelector,
    controls,
    box: {
      x: Math.round(rect.x), y: Math.round(rect.y),
      width: Math.round(rect.width), height: Math.round(rect.height),
    },
    text: (container.innerText || container.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 600),
  };
}

export async function detectBanner(page) {
  const raw = await page.evaluate(findBannerInPage, CMPS);

  if (!raw || !raw.found) {
    return { found: false, cmp: null, selector: null, accept: null, reject: null, settings: null, controls: [] };
  }

  const visible = raw.controls.filter((c) => c.visible);
  const labelled = visible
    .map((c) => ({ ...c, kind: classifyLabel(c.text) }))
    .filter((c) => c.kind);

  const pick = (kind) => labelled.find((c) => c.kind === kind)?.text ?? null;

  return {
    found: true,
    cmp: raw.cmp,
    selector: raw.selector,
    box: raw.box,
    text: raw.text,
    accept: pick('accept'),
    reject: pick('reject'),
    settings: pick('settings'),
    controls: visible.map((c) => c.text),
  };
}
