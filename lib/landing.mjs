import { SHARED_CSS, esc, kr } from './styles.mjs';

export function renderLanding(config) {
  const { saelger, priser } = config;
  const mailto = `mailto:${saelger.email}?subject=${encodeURIComponent('Cookietjek')}`;

  return `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cookietjek</title>
<meta name="description" content="Jeg måler om din hjemmeside sætter tracking i gang, før dine besøgende har sagt ja. Fast pris, intet abonnement.">
<style>${SHARED_CSS}</style>
</head>
<body>
<div class="wrap">

  <h1>Sætter din hjemmeside tracking i gang, før folk har sagt ja?</h1>
  <p class="lead">På en stor del af de danske sider jeg måler, gør den det.
  Næsten altid uden at nogen har opdaget det.</p>

  <h2>Hvad der sker</h2>
  <p>De fleste hjemmesider har en cookieboks. Den ser rigtig ud, så man går ud
  fra at den virker. Men tit er Google Analytics og Facebook-pixlen sat op til
  at køre, så snart siden åbnes, uanset hvad den besøgende trykker på bagefter.</p>
  <p>Der er ingen fejlmeddelelse. Intet går i stykker. Man kan ikke se det med
  det blotte øje, og derfor opdager ingen det.</p>

  <h2>Hvad jeg gør</h2>
  <div class="card">
    <ol>
      <li>Jeg åbner din forside i en helt ren browser og <strong>trykker ikke
      på noget</strong>.</li>
      <li>Jeg registrerer hvilke cookies og netværkskald der alligevel går i
      gang, og om der overhovedet er en afvis-mulighed i første trin.</li>
      <li>Du får en rapport med skærmbillede og en liste over præcis hvad der
      blev fundet.</li>
      <li>Er der noget at rette, retter jeg det og måler igen bagefter, så du
      har før og efter på skrift.</li>
    </ol>
  </div>

  <div class="tilbud">
    <div class="pris">${kr(priser.fuldRettelse)} kr.</div>
    <p class="muted small">fast pris, ingen moms, intet abonnement</p>
    <p class="small">Typisk klaret på en til to timer. Det kræver næsten aldrig
    at siden bygges om, for det er som regel en indstilling i det cookieværktøj
    du allerede betaler for.</p>
    <p class="small">Mangler der kun en afvis-mulighed, koster det
    ${kr(priser.kunAfvisKnap)} kr.</p>
    <a class="btn" href="${esc(mailto)}">Skriv til mig</a>
  </div>

  <h2>Hvorfor det er værd at kigge på nu</h2>
  <p>Datatilsynet og Digitaliseringsstyrelsen udsendte i maj 2025 en fælles
  vejledning om cookies, og Datatilsynet har oplyst at netop spørgsmålet om
  brugerne reelt kan afvise, er noget de ser på i 2026. En principiel afgørelse
  har slået fast, at det skal være lige så nemt at afvise som at acceptere.</p>
  <p class="small muted">Jeg sælger ikke skræk, og jeg vurderer ikke om noget er
  lovligt eller ej. Jeg måler hvad der rent faktisk sker på din side, og viser
  dig det. Resten bestemmer du selv.</p>

  <h2>Hvem jeg er</h2>
  <p>Jeg hedder ${esc(saelger.navn)} og er studerende i ${esc(saelger.by)}. Jeg
  har bygget måleværktøjet selv. Jeg er billig fordi jeg er studerende, og
  hurtig fordi målingen er automatiseret.</p>
  <p class="small">Du behøver ikke tage mit ord for noget. Åbn din egen side i
  et privat vindue, tryk <code>F12</code>, vælg fanen Netværk og genindlæs uden
  at røre cookiebonnen. Det du ser der, er det samme jeg måler.</p>

  <footer class="small muted">
    <p>${esc(saelger.navn)} &middot; ${esc(saelger.by)} &middot;
    <a href="mailto:${esc(saelger.email)}">${esc(saelger.email)}</a> &middot;
    ${esc(saelger.telefon)}</p>
    <p>Ikke momsregistreret. Faktura sendes med CPR-nummer, betaling ved
    bankoverførsel.</p>
  </footer>

</div>
</body>
</html>`;
}
