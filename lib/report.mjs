import config from '../config.mjs';
import { SHARED_CSS, esc, kr } from './styles.mjs';

const daDate = (iso) =>
  new Date(iso).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });

function vendorList(scan) {
  const names = new Set();
  for (const r of scan.preConsent.trackerRequests) names.add(r.vendor);
  for (const c of scan.preConsent.trackerCookies) names.add(c.vendor);
  return [...names];
}

function findingBlocks(scan) {
  const out = [];
  const { findings, banner, preConsent } = scan;

  if (findings.includes('TRACKING_FOER_SAMTYKKE')) {
    const reqRows = preConsent.trackerRequests
      .map((r) => `<tr><td>${esc(r.vendor)}</td><td class="muted">${esc(r.category)}</td><td class="mono">${esc(r.host)}</td></tr>`)
      .join('');
    const cookieRows = preConsent.trackerCookies
      .map((c) => `<tr><td>${esc(c.vendor)}</td><td class="muted">${esc(c.category)}</td><td class="mono">${esc(c.name)}</td></tr>`)
      .join('');

    out.push(`
<section class="finding alvorlig">
  <h2>Der bliver sat tracking i gang, før der er trykket på noget</h2>
  <p>Siden blev åbnet i en ny browser uden historik. Der blev ikke klikket på
  cookiebonnen, hverken accepter eller afvis. Alligevel blev følgende sat i
  gang af sig selv:</p>
  ${reqRows ? `<h3>Netværkskald</h3><table><thead><tr><th>Leverandør</th><th>Type</th><th>Vært</th></tr></thead><tbody>${reqRows}</tbody></table>` : ''}
  ${cookieRows ? `<h3>Cookies der blev gemt</h3><table><thead><tr><th>Leverandør</th><th>Type</th><th>Cookienavn</th></tr></thead><tbody>${cookieRows}</tbody></table>` : ''}
</section>`);
  }

  if (findings.includes('INGEN_AFVIS_KNAP')) {
    out.push(`
<section class="finding alvorlig">
  <h2>Der er ingen afvis-mulighed i første trin</h2>
  <p>I cookiebonnen blev der fundet knappen <strong>&bdquo;${esc(banner.accept)}&ldquo;</strong>,
  men ingen tilsvarende mulighed for at afvise i samme trin.
  ${banner.settings ? `Der er en <strong>&bdquo;${esc(banner.settings)}&ldquo;</strong>, men den ligger et klik dybere.` : ''}</p>
  <p>Datatilsynet har i en principiel afgørelse slået fast, at det skal være
  lige så nemt at afvise som at acceptere.</p>
  <p class="muted">Knapper fundet i bonnen: ${banner.controls.map((c) => `<code>${esc(c)}</code>`).join(' ') || 'ingen'}</p>
</section>`);
  }

  if (findings.includes('INGEN_BANNER')) {
    out.push(`
<section class="finding alvorlig">
  <h2>Der blev ikke fundet nogen cookieboks</h2>
  <p>Scanningen kunne ikke finde et samtykkebanner på forsiden, men der blev
  alligevel sat tracking i gang. Det kan betyde at bonnen ikke vises, at den
  kun vises i bestemte lande, eller at den er bygget på en måde værktøjet ikke
  genkender.</p>
</section>`);
  }

  if (findings.includes('INTET_FUNDET')) {
    out.push(`
<section class="finding ok">
  <h2>Der blev ikke fundet noget at bemærke</h2>
  <p>Ved denne måling blev der ikke registreret tracking før samtykke, og
  bonnen havde en afvis-mulighed i første trin. Det ser fornuftigt ud.</p>
</section>`);
  }

  return out.join('\n');
}

export function renderReport(scan) {
  const { saelger, priser, stripePaymentLink } = config;
  const vendors = vendorList(scan);
  const alvorlig = !scan.findings.includes('INTET_FUNDET');
  const pris = scan.findings.includes('TRACKING_FOER_SAMTYKKE')
    ? priser.fuldRettelse
    : priser.kunAfvisKnap;

  return `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Cookiemåling for ${esc(scan.domain)}</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<div class="wrap">

<header>
  <h1>Cookiemåling for ${esc(scan.domain)}</h1>
  <p class="muted small">Målt ${esc(daDate(scan.scannedAt))} &middot; ${esc(scan.finalUrl || scan.url)}
  ${scan.banner?.cmp ? `&middot; cookieværktøj: ${esc(scan.banner.cmp)}` : ''}</p>
</header>

<section>
  <h2>Hvad der blev målt</h2>
  <p>Forsiden blev åbnet én gang i en ren browser uden tidligere besøg, sat til
  dansk sprog og dansk tidszone. Der blev <strong>ikke klikket på noget</strong>,
  heller ikke på cookiebonnen. Derefter blev det registreret, hvilke
  netværkskald og cookies der alligevel gik i gang af sig selv.</p>
  ${vendors.length ? `<p>Der blev registreret <strong>${vendors.length}</strong> leverandør(er) før samtykke: ${vendors.map((v) => `<strong>${esc(v)}</strong>`).join(', ')}.</p>` : ''}
</section>

${findingBlocks(scan)}

<figure>
  <img src="skaermbillede.png" alt="Skærmbillede af ${esc(scan.domain)} som siden så ud under målingen">
  <figcaption>Skærmbillede taget under målingen, før der blev klikket på noget.</figcaption>
</figure>

<section class="finding">
  <h2>Hvad denne måling ikke kan se</h2>
  <p class="small">Det her er en automatisk måling af én sideindlæsning. Den er
  et udgangspunkt for en samtale, ikke en juridisk vurdering, og den kan tage fejl:</p>
  <ul class="small">
    <li>Kun forsiden er målt. Undersider kan opføre sig anderledes.</li>
    <li>Målingen er lavet ét enkelt tidspunkt fra én enkelt maskine. Opsætninger der afhænger af land, enhed eller A/B-test kan give et andet resultat.</li>
    <li>Værktøjet genkender kendte leverandører. Tracking fra tjenester det ikke kender, eller som kører server-side, bliver ikke opdaget.</li>
    <li>Nogle cookies er nødvendige for at siden virker, og dem er der ingen der brokker sig over. Denne rapport ser kun på analyse og markedsføring.</li>
    <li>Der er lovlige grunde til at et kald kan fyre. Listen ovenfor er en observation, ikke en juridisk konklusion.</li>
  </ul>
  <p class="small muted">Du kan selv se det samme: åbn ${esc(scan.domain)} i et privat vindue,
  tryk F12, vælg fanen Netværk, og genindlæs uden at klikke på cookiebonnen.</p>
</section>

${alvorlig ? `
<section class="tilbud">
  <h2>Hvad jeg tilbyder</h2>
  <p>Jeg retter opsætningen, så der ikke bliver sat analyse- eller
  markedsføringscookies, før brugeren har sagt ja, og så det er lige så nemt at
  afvise som at acceptere. Derefter kører jeg målingen igen, og I får en ny
  rapport der viser før og efter, som I kan gemme som dokumentation.</p>
  <div class="pris">${kr(pris)} kr.</div>
  <p class="muted small">Fast pris, ingen moms (jeg er ikke momsregistreret). Typisk klaret på en til to timer.</p>
  <p class="small">Det kræver normalt ikke at siden bygges om. I langt de fleste
  tilfælde er det en indstilling i det cookieværktøj, I allerede bruger.</p>
  <p>
    <a class="btn" href="mailto:${esc(saelger.email)}?subject=${encodeURIComponent('Cookierettelse for ' + scan.domain)}">Skriv til mig</a>
    ${stripePaymentLink ? `<a class="btn sekundaer" href="${esc(stripePaymentLink)}">Betal online</a>` : ''}
  </p>
  <p class="small muted">${esc(saelger.navn)} &middot; ${esc(saelger.by)} &middot;
  ${esc(saelger.email)} &middot; ${esc(saelger.telefon)}</p>
</section>` : ''}

<footer class="small muted">
  <p>Rapporten er lavet med et værktøj jeg selv har bygget.
  Måling foretaget ${esc(daDate(scan.scannedAt))}, scanner version ${esc(scan.scannerVersion)}.
  Der er hentet én side, som en almindelig besøgende ville gøre.</p>
  <p>Har du fået denne rapport og vil ikke kontaktes igen, så svar på mailen med
  &bdquo;nej tak&ldquo;, så hører du ikke fra mig igen.</p>
</footer>

</div>
</body>
</html>`;
}
