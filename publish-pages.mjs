#!/usr/bin/env node
// Udgiver KUN landingssiden til et offentligt GitHub-repo, til GitHub Pages.
//
//   node publish-pages.mjs git@github.com:seba830b/cookietjek.git
//   node publish-pages.mjs https://github.com/seba830b/cookietjek.git --dry
//
// Rapporter bliver aldrig sendt med. Et offentligt git-repo viser alle filer,
// så rapport-mappen ville blive en offentligt læsbar liste over hvilke danske
// virksomheder du har scannet og hvad du fandt. Det er der en hård spærre for
// nedenfor, og den skal blive der.

import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import config from './config.mjs';
import { renderLanding } from './lib/landing.mjs';

const run = promisify(execFile);

// Kun disse stier må ende i det offentlige repo. Alt andet er en fejl.
export const TILLADTE_FILER = ['index.html', 'README.md', '.gitignore'];

export function tjekFiler(filer) {
  const ulovlige = filer.filter((f) => !TILLADTE_FILER.includes(f));
  if (ulovlige.length) {
    throw new Error(
      `Nægter at udgive. Disse filer hører ikke til i et offentligt repo: ${ulovlige.join(', ')}`,
    );
  }
  if (filer.some((f) => f.startsWith('rapport/') || f.includes('/rapport/'))) {
    throw new Error('Nægter at udgive: rapporter må aldrig i et offentligt repo.');
  }
  return true;
}

const README = `# cookietjek

Landingsside for [Cookietjek](https://github.com/${'seba830b'}/cookietjek).

Siden måler ikke noget her. Den er ren statisk HTML, udgivet via GitHub Pages.
Selve måleværktøjet ligger et andet sted og er ikke offentligt.

Bygget fra config, ikke redigeret i hånden. Lav ikke ændringer direkte her,
de bliver overskrevet ved næste udgivelse.
`;

const GITIGNORE = `# Rapporter maa ALDRIG ligge i dette repo. Det er offentligt.
rapport/
*.png
`;

async function main() {
  const [remote, ...flags] = process.argv.slice(2);
  const dry = flags.includes('--dry');

  if (!remote) {
    console.error('Brug: node publish-pages.mjs <git-remote-url> [--dry]');
    console.error('Fx:   node publish-pages.mjs https://github.com/seba830b/cookietjek.git');
    process.exit(1);
  }

  const filer = ['index.html', 'README.md', '.gitignore'];
  tjekFiler(filer);

  const dir = await mkdtemp(path.join(tmpdir(), 'cookietjek-pages-'));
  try {
    await writeFile(path.join(dir, 'index.html'), renderLanding(config));
    await writeFile(path.join(dir, 'README.md'), README);
    await writeFile(path.join(dir, '.gitignore'), GITIGNORE);

    const size = (await readFile(path.join(dir, 'index.html'))).length;
    console.log(`Landingsside bygget, ${(size / 1024).toFixed(1)} kB.`);
    console.log(`Filer der udgives: ${filer.join(', ')}`);

    if (config.saelger.email.includes('DIN@MAIL')) {
      console.warn('\nADVARSEL: config.mjs har stadig pladsholder-mailen. Ret den foerst.');
    }

    if (dry) {
      console.log(`\n--dry, intet blev sendt. Filerne ligger i ${dir}`);
      return;
    }

    const git = (...args) => run('git', ['-C', dir, ...args]);
    await git('init', '-q', '-b', 'main');
    await git('add', '.');
    await git(
      '-c', 'user.name=cookietjek',
      '-c', 'user.email=noreply@example.com',
      'commit', '-q', '-m', 'Opdater landingsside',
    );
    await git('remote', 'add', 'origin', remote);
    await git('push', '-f', 'origin', 'main');

    console.log('\nUdgivet.');
    console.log('Slaa GitHub Pages til: Settings -> Pages -> Deploy from a branch -> main / (root)');
  } finally {
    if (!dry) await rm(dir, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(`\n${err.message}`); process.exit(1); });
}
