import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

// Paa din egen maskine: koer `npx playwright install chromium` een gang, saa
// finder Playwright selv browseren og det her goer ingenting.
//
// I et miljoe hvor browseren allerede ligger et bestemt sted (fx en CI-runner
// eller en cloud-container med en forudinstalleret Chromium), saet
// COOKIETJEK_CHROMIUM til stien, saa bruges den i stedet for at hente en ny.
const FALLBACKS = ['/opt/pw-browsers/chromium'];

export function chromiumExecutablePath() {
  const fromEnv = process.env.COOKIETJEK_CHROMIUM;
  if (fromEnv) return fromEnv;
  return FALLBACKS.find((p) => existsSync(p)) ?? undefined;
}

export function launchChromium({ headless = true } = {}) {
  const executablePath = chromiumExecutablePath();
  return chromium.launch({ headless, ...(executablePath ? { executablePath } : {}) });
}
