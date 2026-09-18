import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm, readFile } from 'node:fs/promises';
import { startFixtureServer } from './serve-fixtures.mjs';
import { scanTargets, classifyFindings, parseTarget, normaliseDomain } from '../scan.mjs';
import { matchCookie, matchHost, classifyLabel } from '../lib/trackers.mjs';
import { renderReport } from '../lib/report.mjs';
import { renderLanding } from '../lib/landing.mjs';
import { tjekFiler } from '../publish-pages.mjs';

let server, port, scans;

before(async () => {
  ({ server, port } = await startFixtureServer(0));
  scans = await scanTargets(
    [
      `http://127.0.0.1:${port}/daarlig/`,
      `http://127.0.0.1:${port}/god/`,
      `http://127.0.0.1:${port}/intet-banner/`,
    ],
    { settleMs: 1200 },
  );
});

after(async () => {
  server.close();
  await rm('out/127.0.0.1_' + port, { recursive: true, force: true });
});

const byIndex = (i) => scans[i];

test('alle tre fixtures blev scannet uden fejl', () => {
  for (const s of scans) assert.equal(s.ok, true, s.error ?? 'ukendt fejl');
});

test('daarlig fixture: tracking foer samtykke opdages', () => {
  const s = byIndex(0);
  assert.ok(s.findings.includes('TRACKING_FOER_SAMTYKKE'));
  const vendors = new Set(s.preConsent.trackerRequests.map((r) => r.vendor));
  assert.ok(vendors.has('Google Analytics'), 'Google Analytics skulle vaere fundet');
  assert.ok(vendors.has('Meta Pixel'), 'Meta Pixel skulle vaere fundet');
  const cookieVendors = new Set(s.preConsent.trackerCookies.map((c) => c.vendor));
  assert.ok(cookieVendors.has('Google Analytics'));
  assert.ok(cookieVendors.has('Meta Pixel'));
  assert.ok(cookieVendors.has('Hotjar'), '_hjSessionUser_ praefiks skulle matche');
});

test('daarlig fixture: manglende afvis-knap opdages, og indstillinger taeller ikke som afvis', () => {
  const s = byIndex(0);
  assert.equal(s.banner.found, true);
  assert.equal(s.banner.accept, 'Accepter alle');
  assert.equal(s.banner.reject, null);
  assert.equal(s.banner.settings, 'Indstillinger');
  assert.ok(s.findings.includes('INGEN_AFVIS_KNAP'));
});

test('god fixture: intet at bemaerke', () => {
  const s = byIndex(1);
  assert.deepEqual(s.findings, ['INTET_FUNDET']);
  assert.equal(s.banner.reject, 'Afvis alle');
  assert.equal(s.preConsent.trackerCookies.length, 0, 'PHPSESSID og CookieConsent maa ikke give udslag');
  assert.equal(s.preConsent.trackerRequests.length, 0);
});

test('intet-banner fixture: baade manglende banner og tracking opdages', () => {
  const s = byIndex(2);
  assert.equal(s.banner.found, false);
  assert.ok(s.findings.includes('INGEN_BANNER'));
  assert.ok(s.findings.includes('TRACKING_FOER_SAMTYKKE'));
});

test('der bliver taget et skaermbillede', async () => {
  const s = byIndex(0);
  const png = await readFile(`out/${s.domain}/skaermbillede.png`);
  assert.ok(png.length > 1000, 'skaermbilledet ser tomt ud');
});

test('rapporten kan renderes og naevner de fundne leverandoerer', () => {
  const html = renderReport(byIndex(0));
  assert.match(html, /<html lang="da">/);
  assert.match(html, /Google Analytics/);
  assert.match(html, /Meta Pixel/);
  assert.match(html, /Hvad denne måling ikke kan se/);
  // Aerlighedsreglen: rapporten maa aldrig paastaa en lovovertraedelse.
  assert.doesNotMatch(html, /ulovlig[t]?\b/i);
  assert.doesNotMatch(html, /overtræder/i);
  assert.doesNotMatch(html, /bøde/i);
});

test('rapport for en ren side indeholder ikke et salgstilbud', () => {
  const html = renderReport(byIndex(1));
  assert.doesNotMatch(html, /Hvad jeg tilbyder/);
});

test('cookienavne matcher praefiks og eksakt, og lader noedvendige vaere', () => {
  assert.equal(matchCookie('_ga')?.vendor, 'Google Analytics');
  assert.equal(matchCookie('_ga_ABCDEF')?.vendor, 'Google Analytics');
  assert.equal(matchCookie('_hjSessionUser_9')?.vendor, 'Hotjar');
  assert.equal(matchCookie('PHPSESSID'), null);
  assert.equal(matchCookie('CookieConsent'), null);
  assert.equal(matchCookie('woocommerce_cart_hash'), null);
});

test('vaertsmatch genkender kendte trackere', () => {
  assert.equal(matchHost('https://www.google-analytics.com/g/collect')?.vendor, 'Google Analytics');
  assert.equal(matchHost('https://eksempel.dk/style.css'), null);
});

test('knaptekster klassificeres, ogsaa med danske tegn', () => {
  assert.equal(classifyLabel('Afvis alle'), 'reject');
  assert.equal(classifyLabel('Kun nødvendige'), 'reject');
  assert.equal(classifyLabel('Accepter alle'), 'accept');
  assert.equal(classifyLabel('Indstillinger'), 'settings');
  assert.equal(classifyLabel('Administrer samtykke'), 'settings');
  assert.equal(classifyLabel('Læs mere om vores persondatapolitik og rettigheder'), null);
});

test('domaener og maal parses', () => {
  assert.equal(normaliseDomain('https://www.Eksempel.dk/side?a=1'), 'eksempel.dk');
  assert.equal(parseTarget('eksempel.dk').url, 'https://eksempel.dk/');
  assert.equal(parseTarget('http://127.0.0.1:9/x/').domain, '127.0.0.1_9_x');
  assert.equal(parseTarget('http://127.0.0.1:9/').domain, '127.0.0.1_9');
});

test('klassificering: banner uden accept-knap giver ikke falsk INGEN_AFVIS_KNAP', () => {
  const f = classifyFindings({
    banner: { found: true, accept: null, reject: null },
    trackerRequests: [],
    trackerCookies: [],
  });
  assert.deepEqual(f, ['INTET_FUNDET']);
});

test('landingssiden bygges ud fra config, ikke haardkodet', () => {
  const html = renderLanding({
    saelger: { navn: 'Testperson', by: 'Nyborg', email: 'test@eksempel.dk', telefon: '+45 11 22 33 44' },
    priser: { fuldRettelse: 2500, kunAfvisKnap: 1500 },
  });
  assert.match(html, /test@eksempel\.dk/);
  assert.match(html, /Testperson/);
  assert.match(html, /Nyborg/);
  assert.match(html, /2\.500 kr\./);
  assert.match(html, /1\.500 kr\./);
  // Ingen rester fra den haardkodede udgave.
  assert.doesNotMatch(html, /DIN@MAIL\.DK/);
  assert.doesNotMatch(html, /1\.800 kr\./);
});

test('landingssiden paastaar heller ikke en lovovertraedelse', () => {
  const html = renderLanding({
    saelger: { navn: 'A', by: 'B', email: 'a@b.dk', telefon: '1' },
    priser: { fuldRettelse: 1800, kunAfvisKnap: 1200 },
  });
  assert.doesNotMatch(html, /overtræder/i);
  assert.doesNotMatch(html, /bøde/i);
});

test('rapport og landingsside deler stylesheet', () => {
  const cfg = { saelger: { navn: 'A', by: 'B', email: 'a@b.dk', telefon: '1' }, priser: { fuldRettelse: 1800, kunAfvisKnap: 1200 } };
  const marker = '--warn-line';
  assert.ok(renderLanding(cfg).includes(marker));
  assert.ok(renderReport(byIndex(0)).includes(marker));
});

test('udgivelse til offentligt repo naegter alt andet end landingssiden', () => {
  assert.equal(tjekFiler(['index.html', 'README.md', '.gitignore']), true);
  assert.throws(() => tjekFiler(['index.html', 'rapport/kunde.dk/index.html']), /rapport/);
  assert.throws(() => tjekFiler(['index.html', 'skaermbillede.png']), /hører ikke til/);
  assert.throws(() => tjekFiler(['index.html', 'config.mjs']), /hører ikke til/);
  assert.throws(() => tjekFiler(['index.html', 'data/prospects.txt']), /hører ikke til/);
});
