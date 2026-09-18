#!/usr/bin/env node
// Bygger en statisk rapportside ud fra en scanning.
//
//   node report.mjs eksempel.dk [flere.dk ...]
//   node report.mjs --alle
//
// Output: site/rapport/<domæne>/index.html + skaermbillede.png

import { mkdir, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { renderReport } from './lib/report.mjs';
import { renderLanding } from './lib/landing.mjs';
import { normaliseDomain } from './scan.mjs';
import config from './config.mjs';

const OUT_DIR = 'out';
const SITE_DIR = path.join('site', 'rapport');

async function buildOne(domain) {
  const src = path.join(OUT_DIR, domain);
  const scan = JSON.parse(await readFile(path.join(src, 'scan.json'), 'utf8'));

  if (!scan.ok) {
    console.log(`  spring over  ${domain}  (scanning fejlede: ${scan.error})`);
    return null;
  }

  const dest = path.join(SITE_DIR, domain);
  await mkdir(dest, { recursive: true });
  await writeFile(path.join(dest, 'index.html'), renderReport(scan));
  await copyFile(path.join(src, 'skaermbillede.png'), path.join(dest, 'skaermbillede.png'));

  const url = `${config.site.baseUrl.replace(/\/$/, '')}/rapport/${domain}/`;
  console.log(`  bygget  ${domain}  ->  ${url}`);
  return { domain, url, findings: scan.findings };
}

async function buildLanding() {
  await mkdir('site', { recursive: true });
  await writeFile(path.join('site', 'index.html'), renderLanding(config));
  console.log('  bygget  landingsside  ->  site/index.html');
}

async function main() {
  const args = process.argv.slice(2);
  let domains;

  // Landingssiden bygges altid, saa dine kontaktoplysninger og priser kun
  // staar et sted, nemlig config.mjs.
  await buildLanding();

  if (args.includes('--kun-forside')) return;

  if (args.includes('--alle')) {
    const entries = await readdir(OUT_DIR, { withFileTypes: true });
    domains = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } else {
    domains = args.map(normaliseDomain).filter(Boolean);
  }

  if (domains.length === 0) {
    console.error('Brug: node report.mjs <domæne> [...]  eller  node report.mjs --alle');
    process.exit(1);
  }

  const built = [];
  for (const d of domains) {
    try {
      const r = await buildOne(d);
      if (r) built.push(r);
    } catch (err) {
      console.error(`  FEJL  ${d}  ${err.message}`);
    }
  }

  console.log(`\n${built.length} rapport(er) bygget i ${SITE_DIR}/`);
  if (config.site.baseUrl.includes('example')) {
    console.log('Husk at sætte site.baseUrl i config.mjs til din rigtige deploy-URL.');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
