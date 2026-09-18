// Ligger for sig selv, saa rapport- og udgivelsesdelen kan bruges uden at
// traekke Playwright ind. Landingssiden bygges i CI uden afhaengigheder.

export function normaliseDomain(input) {
  let d = String(input).trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  return d;
}

// Tager enten et bart domaene ("eksempel.dk") eller en fuld URL. Fulde URL'er
// findes for at testene kan pege scanneren paa en lokal fixture-server. I
// normal brug giver man domaener.
export function parseTarget(input) {
  const raw = String(input).trim();
  if (/^https?:\/\//i.test(raw)) {
    const u = new URL(raw);
    // Stien kommer med i navnet, ellers ville to URL'er paa samme vaert skrive
    // til den samme mappe og overskrive hinanden i stilhed.
    const pathSlug = u.pathname.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '_');
    const label = [u.host.replace(/^www\./, '').replace(/:/g, '_'), pathSlug].filter(Boolean).join('_');
    return { url: raw, domain: label, host: u.hostname };
  }
  const domain = normaliseDomain(raw);
  return { url: `https://${domain}/`, domain, host: domain };
}
