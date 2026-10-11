import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as D from './data.mjs';
import { fmtQty, fmtText, packs } from './fmt.mjs';

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const here = new URL('.', import.meta.url).pathname;
const R = Object.fromEntries(D.RECIPES.map((r, i) => [r.id, { ...r, num: i + 1 }]));
const TRACK = { pot: 'POT', pan: 'PAN', air: 'AIRFRYER', you: 'YOU' };
const kr = (n) => Math.round(n) + ' kr';

const ing = (x) => '- ' + (x.q == null ? x.n : fmtQty(x.q, x.u) + ' ' + x.n);

// ---------- recipes.md
let md = `# Recipes

Lazy comfort food. Every recipe makes **2 portions** (lunch + dinner, or two days) and takes **10 min hands-on or less**.
Everything is built from 5 base components, so one prep session covers a bunch of dishes.

Gear: microwave/airfryer combo, 1 pan, 1 pot. No oven. Microwave times are for 800 W. Airfryer times are for a preheated combo on its crisper tray.
Chicken amounts in the dishes are **cooked** weight: 1 kg raw breast gives about 700 g cooked, 6 portions of 115 g.

## Base components

`;
for (const b of D.BASES) {
  md += `### Base ${b.id}: ${b.name}\n\nMakes ${fmtText(b.makes)}.\n\n${b.ingredients.map(ing).join('\n')}\n\n`;
  md += b.steps.map((s, i) => `${i + 1}. ${fmtText(s)}`).join('\n') + '\n\n';
  md += `- **Fridge:** ${b.fridge}\n- **Freezer:** ${b.freezer}\n`;
  if (b.note) md += `\n> ${fmtText(b.note)}\n`;
  md += '\n';
}
md += '## The dishes\n\n| # | Dish | Style | Bases | Hands-on |\n|---|---|---|---|---|\n';
for (const r of Object.values(R)) md += `| ${r.num} | ${r.name} | ${D.STYLES[r.style]} | ${r.bases.join(' + ')} | ${r.hands} min |\n`;
md += '\n';
for (const r of Object.values(R)) {
  md += `### ${r.num}. ${r.name}\n\n**${D.STYLES[r.style]}** · Bases ${r.bases.join(' + ')} · ${r.hands} min hands-on · 2 portions\n\n`;
  md += r.ingredients.map(ing).join('\n') + '\n\n';
  md += r.steps.map((s, i) => `${i + 1}. ${fmtText(s)}`).join('\n') + '\n\n';
  md += `- **Fridge:** ${r.fridge}\n- **Freezer:** ${r.freezer}\n- **Reheat:** ${fmtText(r.reheat)}\n`;
  if (r.tip) md += `\n> ${fmtText(r.tip)}\n`;
  md += '\n';
}
md += '## Reheat rules\n\n' + D.RULES.map((x) => '- ' + x).join('\n') + '\n';
writeFileSync(OUT + '/recipes.md', md);

// ---------- weekly-plan.md
const styles = new Set(D.WEEK.flatMap((d) => [R[d.lunch.r].style, R[d.dinner.r].style]));
md = `# Weekly plan

One prep session, about **75 min** (about 35 of them hands-on, the rest is waiting on the airfryer). Covers **10 meals** (5 days, lunch + dinner) across ${styles.size} flavor styles: ${[...styles].map((s) => D.STYLES[s]).join(', ')}.

Prep on Sunday. Mon-Tue boxes go in the fridge, Wed-Fri boxes go in the freezer. Fødevarestyrelsen says eat leftovers within 2-3 days, so nothing sits in the fridge longer than 2 days.

## The week

| Day | Lunch | Dinner |
|---|---|---|
`;
const cell = (m) => `${R[m.r].name} (${D.STYLES[R[m.r].style]})${m.s === 'freezer' ? ' ❄' : ''}`;
for (const d of D.WEEK) md += `| ${d.day} | ${cell(d.lunch)} | ${cell(d.dinner)} |\n`;
md += '\n❄ = frozen on prep day, thawed in the fridge the evening before.\n\n' + D.REMINDERS.map((x) => '- ' + x).join('\n') + '\n\n';
md += '### When you eat\n\n';
const seen = new Set();
for (const d of D.WEEK) for (const m of [d.lunch, d.dinner]) {
  if (seen.has(m.r)) continue;
  seen.add(m.r);
  md += `- **${R[m.r].name}:** ${D.EAT[m.r]}\n`;
}
md += `
## Prep day timeline

Four tracks run at the same time: the **POT** (rice, then pasta), the **PAN** (mince), the **AIRFRYER** (chicken) and **YOU** (cutting, mixing, boxing).
The combo can't microwave and airfry at once, so prep day uses no microwave at all. Chicken goes in 3 batches of about 350 g, that is what sets the pace.

| Time | Track | Do this |
|---|---|---|
`;
for (const s of D.PREP) md += `| ${s.t} | ${TRACK[s.k]} | ${fmtText(s.x)} |\n`;
md += `
### Cooking more?

${D.SCALE_NOTES.map((x) => `- From x${x.min}: ${x.text}`).join('\n')}

## Next week

Swap in the other recipes so it stays fun:
`;
for (const r of Object.values(R)) if (!seen.has(r.id)) md += `- ${r.name} (${D.STYLES[r.style]})\n`;
md += '\nSame bases, same timeline, just different sauces at the "split the chicken" step.\n';
writeFileSync(OUT + '/weekly-plan.md', md);

// ---------- shopping-list.md
let total = 0, optTotal = 0;
md = `# Indkøbsliste

Til ugeplanen: 10 måltider, 1 person. Priserne er fra Rema 1000 og Lidl i Svendborg, oktober 2026. Netto ligger typisk på samme niveau. Tilbud gør det tit billigere, så tjek appsene.

`;
for (const s of D.SHOP) {
  md += `## ${s.sec}\n\n| | Vare | Mængde | Butik | Pris |\n|---|---|---|---|---|\n`;
  for (const it of s.items) {
    const p = packs(it);
    total += p * it.price;
    if (it.opt) optTotal += p * it.price;
    md += `| ☐ | ${it.n}${it.opt ? ' (valgfri)' : ''} | ${p > 1 ? p + ' x ' : ''}${it.label} | ${it.where} | ${kr(p * it.price)} |\n`;
  }
  md += '\n';
}
const pantry = D.PANTRY.reduce((a, x) => a + x.price, 0);
md += `**Uge i alt: ca. ${kr(total)}** (ca. ${kr(total / 10)} pr. måltid). Uden de valgfrie ting: ca. ${kr(total - optTotal)}.

Der bliver noget tilovers (ris, pasta, løg, frost, tortillas), så næste uge bliver billigere.

## Basisvarer (købes én gang, holder i ugevis)

| | Vare | Mængde | Pris |
|---|---|---|---|
${D.PANTRY.map((x) => `| ☐ | ${x.n} | ${x.label} | ${kr(x.price)} |`).join('\n')}

**Basisvarer i alt: ca. ${kr(pantry)}** (salt går vi ud fra, at du har)

## Tips

- Lidl: kylling i storpakning, kartoffelbåde, broccoli og ost. Rema: tortillas og tikka masala-glasset. Netto på Mølmarksvej ligger lige ved Lidl.
- Kyllingen er den dyreste vare. Laver du ikke mad samme dag eller dagen efter, så frys den med det samme.
- Gochujang findes kun i Asian Market. Stærk chilisauce + lidt ekstra honning virker fint.
- Mangler du madbokse? Køb glasbokse med låg. Glasset tåler både mikroovn og airfryer, plastiklåget kun mikroovn. Du skal bruge 10, og mindst 2 skal være ovnfaste.
`;
writeFileSync(OUT + '/shopping-list.md', md);

// ---------- starter-list.md
const num = (ids) => ids.map((id) => '#' + R[id].num).join(' ') || 'alt';
const all = D.STARTER.flatMap((g) => g.items);
const need = all.filter((x) => !x.opt).reduce((a, x) => a + packs(x) * x.price, 0);
md = `# Starter-indkøbsliste

Alt du skal bruge til **alle 10 opskrifter**: baser, saucer, krydderier og frost. Køb det her én gang, så skal du bagefter kun købe kød, ost og mejeri hver uge.

- **I alt ca. ${kr(need)}** uden de valgfrie ting (ca. ${kr(all.reduce((a, x) => a + packs(x) * x.price, 0))} med alt).
- Mængderne er til 10 måltider (én af hver ret). Laver du mere, så brug slideren i \`index.html\`. Den regner antal pakker og pris ud, fx 4 poser kartoffelbåde til 40 måltider.
- Holdbarhed er tommelfingerregler. Står der noget andet på pakken, så følg pakken.
- "Bruges i" peger på opskrifterne i \`recipes.md\`.

## Hvor i Svendborg

| Butik | Adresse | Hvorfor |
|---|---|---|
${D.STORES.map((s) => `| ${s.chain} | ${s.where} | ${s.why} |`).join('\n')}

**Nemmeste tur:** Lidl (Mølmarksvej 185) + Netto (Mølmarksvej 50) ligger på samme vej og dækker det meste. Tikka masala-glasset og sød chili sauce er sikrest i Rema. Gochujang findes kun i Asian Market, ellers brug stærk chilisauce.

`;
for (const g of D.STARTER) {
  md += `## ${g.sec}\n\n${g.note}\n\n| | Vare | Mængde | Uåbnet | Efter åbning | Hvor | Bruges i | Pris |\n|---|---|---|---|---|---|---|---|\n`;
  for (const x of g.items) {
    const p = packs(x);
    const used = x.u ? ` (bruger ca. ${x.need} ${x.u})` : '';
    md += `| ☐ | ${x.n} | ${p > 1 ? p + ' x ' : ''}${x.label}${used} | ${x.life} | ${x.open} | ${x.where} | ${num(x.use)} | ${kr(p * x.price)} |\n`;
  }
  const tips = g.items.filter((x) => x.tip);
  md += tips.length ? '\n' + tips.map((x) => `> **${x.n}:** ${x.tip}`).join('\n>\n') + '\n\n' : '\n';
}
md += `## Hvad skal du så købe hver uge?

Kun det friske: kød, ost, cremefraiche og de saucer du har brugt op. Se \`shopping-list.md\` for ugens liste.

## Smarte holdbarhedstricks

- Køb hakket oksekød på tilbud og frys det samme dag, fladt i en pose. Det tør på 1 time i koldt vand.
- Revet ost kan fryses direkte i posen. Brug det frosset, det smelter fint.
- Tortillas og naan: frys dem. Tortillas 20-30 sek. i mikroovnen, naan 2-3 min i airfryeren, så er de som nye.
- Halve dåser majs og bønner: i en boks i fryseren, ellers skal de bruges inden for 3 dage.
- Kylling i storpakning: frys den samme dag, hvis du ikke laver mad inden for 1-2 dage. Den tør i køleskabet på ca. 24 timer.
- Skriv datoen på glas når du åbner dem, med en tusch på låget.
`;
writeFileSync(OUT + '/starter-list.md', md);

// ---------- index.html
const fmtSrc = readFileSync(here + 'fmt.mjs', 'utf8').replace(/^export /gm, '').replace(/^\/\/.*\n/, '');
const data = JSON.stringify({ STYLES: D.STYLES, BASES: D.BASES, RECIPES: D.RECIPES, WEEK: D.WEEK, EAT: D.EAT, REMINDERS: D.REMINDERS, PREP: D.PREP, RULES: D.RULES, SHOP: D.SHOP, PANTRY: D.PANTRY, STARTER: D.STARTER, STORES: D.STORES, SCALE_NOTES: D.SCALE_NOTES });
const html = readFileSync(here + 'template.html', 'utf8').replace('/*FMT*/', () => fmtSrc).replace('/*DATA*/', () => 'const DATA = ' + data + ';');
writeFileSync(OUT + '/index.html', html);
console.log('total', total, 'pantry', pantry);
