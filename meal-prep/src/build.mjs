import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as D from './data.mjs';
import { fmtQty, fmtText, packs } from './fmt.mjs';
import * as E from './engine.mjs';

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const here = new URL('.', import.meta.url).pathname;
const R = Object.fromEntries(D.RECIPES.map((r, i) => [r.id, { ...r, num: i + 1 }]));
const TRACK = { pot: 'GRYDE', pan: 'PANDE', air: 'AIRFRYER', you: 'DIG' };
const kr = (n) => Math.round(n) + ' kr';
const SLOT = { lunch: 'frokost (kun mikro)', dinner: 'aftensmad (airfryer)', both: 'frokost eller aftensmad' };

// ---------- this week, computed by the engine (current plan week + DEFAULT_MEALS, 1 person)
const WK = E.planWeek(new Date());
const SEED = E.seedFor(WK, 0);
const ALL = E.computeAll(D, D.DEFAULT_MEALS, SEED, {}, 1);
const PLAN = ALL.plan;
const WEEK = PLAN.days;
const PREP = ALL.prep.steps;
const KIT = ALL.prep.kit;
const T = ALL.prep.minutes;
const SHOP = ALL.shop;
const STARTER = E.buildStarter(D.RECIPES, D.PRODUCTS, null, D.STARTER_SECS);
const REMINDERS = ALL.reminders;
const EAT = Object.fromEntries(D.RECIPES.map((r) => [r.id, r.eat]));
const mealsOf = (d) => [d.lunch, d.dinner].filter(Boolean);
const meals = PLAN.count;
const dayName = Object.fromEntries(WEEK.map((d) => [d.day, d.name]));
const styles = new Set(WEEK.flatMap((d) => mealsOf(d).map((m) => R[m.r].style)));
const styleList = [...styles].map((s) => D.STYLES[s].toLowerCase()).join(', ');
const used = new Set(PLAN.recipes);
const fridgeDays = WEEK.filter((d) => mealsOf(d).length && mealsOf(d).every((m) => m.s === 'fridge')).map((d) => d.name);
const freezerDays = WEEK.filter((d) => mealsOf(d).some((m) => m.s === 'freezer')).map((d) => d.name);
const span = (a) => (a.length > 1 ? `${a[0].toLowerCase()}-${a[a.length - 1].toLowerCase()}` : (a[0] || '').toLowerCase());
const chickenBatches = ALL.prep.batches;
const boxes = (KIT.find((k) => k.u === 'box') || {}).count || 0;

// Pack count in Danish: "2 breve", "2 x 500 g".
const packText = (it, n) => {
  if (it.unit && /^1 /.test(it.label)) return n > 1 ? `${n} ${it.plural || it.unit}` + it.label.replace(/^1 [^,]+/, '') : it.label;
  return (n > 1 ? n + ' x ' : '') + it.label;
};
// "bruger ca. 1 kg" with Danish formatting.
const usedText = (it) => {
  if (!it.u) return '';
  if (it.u === 'stk') return `bruger ${Math.ceil(it.need)} stk`;
  return `bruger ca. ${fmtQty(it.need, it.u)}`;
};
const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const ing = (x) => '- ' + (x.q == null ? x.n : fmtQty(x.q, x.u) + ' ' + x.n);

// ---------- recipes.md
let md = `# Opskrifter

Doven comfort food. Hver opskrift giver **2 portioner** og tager **højst ${Math.max(...D.RECIPES.map((r) => r.hands))} min arbejdstid**.
Alt bygger på ${D.BASES.length} baser, så én prepdag dækker en hel masse retter.

Udstyr: kombi-mikro med airfry, 1 pande, 1 gryde. Ingen ovn. Mikrotider er til 800 W. Airfryertider er med forvarmet kombi på airfryer-pladen (crisp-pladen), der fulgte med. Den hedder bare "pladen" herfra.
Kylling i retterne er **færdig vægt**: 1 kg rå kyllingebrystfilet giver ca. 700 g færdig kylling, 6 portioner à ca. 115 g (ca. 10 stykker).
1 krus = ca. 2,4 dl.

## Baser

`;
for (const b of D.BASES) {
  md += `### Base ${b.id}: ${b.name}\n\nGiver ${fmtText(b.makes)}.\n\n${b.ingredients.map(ing).join('\n')}\n\n`;
  md += b.steps.map((s, i) => `${i + 1}. ${fmtText(s)}`).join('\n') + '\n\n';
  md += `- **Køleskab:** ${b.fridge}\n- **Fryser:** ${b.freezer}\n`;
  if (b.note) md += `\n> ${fmtText(b.note)}\n`;
  md += '\n';
}
md += `## Retterne\n\n${D.RECIPES.length} retter. Appen vælger en ny, varieret uge fra listen hver uge, og der kommer nye retter til hver fredag.\n\n| # | Ret | Stil | Baser | Arbejdstid | Til |\n|---|---|---|---|---|---|\n`;
for (const r of Object.values(R)) md += `| ${r.num} | ${r.name} | ${D.STYLES[r.style]} | ${r.bases.join(' + ')} | ${r.hands} min | ${SLOT[r.slot]} |\n`;
md += '\n';
for (const r of Object.values(R)) {
  md += `### ${r.num}. ${r.name}\n\n`;
  if (r.img && r.img.file) md += `![${r.name}](${r.img.file})\n\n<sub>Foto: ${[r.img.by, r.img.license].filter(Boolean).join(', ')}${r.img.src ? ` ([kilde](${r.img.src}))` : ''}</sub>\n\n`;
  md += `**${D.STYLES[r.style]}** · Base ${r.bases.join(' + ')} · ${r.hands} min arbejdstid · 2 portioner · ${SLOT[r.slot]}\n\n`;
  md += r.ingredients.map(ing).join('\n') + '\n\n';
  md += r.steps.map((s, i) => `${i + 1}. ${fmtText(s)}`).join('\n') + '\n\n';
  md += `- **Køleskab:** ${r.fridge}\n- **Fryser:** ${r.freezer}\n- **Opvarmning:** ${fmtText(r.reheat)}\n- **Når du spiser:** ${r.eat}\n`;
  if (r.eatDinner) md += `- **Hjemme til aftensmad:** ${r.eatDinner}\n`;
  if (r.tip) md += `\n> ${fmtText(r.tip)}\n`;
  md += '\n';
}
md += '## Opvarmningsregler\n\n' + D.RULES.map((x) => '- ' + x).join('\n') + '\n';
writeFileSync(OUT + '/recipes.md', md);

// ---------- weekly-plan.md
const cell = (m) => (!m ? '-' : `${R[m.r].name} (${D.STYLES[R[m.r].style]})${m.s === 'freezer' ? ` ❄ tø op ${dayName[m.thaw] ? dayName[m.thaw].toLowerCase() : m.thaw} aften` : ''}`);
md = `# Ugeplan

Én prepdag: ca. **${T.rutine} min**, når du har prøvet det, ca. **${T.foersteGang} min** første gang. Ca. ${T.aktiv} min er arbejdstid, resten venter du på airfryeren.
Uge ${WK.week}: **${meals} måltider** (frokost mandag-fredag + aftensmad onsdag og fredag, du spiser i skolen mandag, tirsdag og torsdag aften) i ${styles.size} stilarter: ${styleList}.
Ugen skifter automatisk hver uge, og i \`index.html\` kan du slå hvert måltid til og fra og bytte retter. Alt herunder regnes ud fra de aktive måltider.

Prep søndag. Boksene til ${fridgeDays.map((d) => d.toLowerCase()).join(' og ')} kommer i køleskabet, ${span(freezerDays)} i fryseren. Fødevarestyrelsen siger, at rester skal spises inden for 2-3 dage, så intet står i køleskabet mere end 2 dage.
**Frokost kan altid laves med kun en mikro** (til uni). Retter, der skal i airfryeren, er aftensmad.

## Ugen

| Dag | Frokost (kun mikro) | Aftensmad |
|---|---|---|
`;
for (const d of WEEK) md += `| ${d.name} | ${cell(d.lunch)} | ${cell(d.dinner)} |\n`;
md += '\n❄ = frosset på prepdagen. Flyttes til køleskabet aftenen før.\n\n' + REMINDERS.map((x) => '- ' + x).join('\n') + '\n\n';
md += '### Når du spiser\n\n';
for (const id of used) md += `- **${R[id].name}:** ${EAT[id]}\n`;
md += `
## Udstyr

${KIT.map((k) => `- **${k.count ? k.count + ' ' + (k.count > 1 && k.pl ? k.pl : k.n.toLowerCase()) : k.n}**${k.note ? ': ' + lc(fmtText(k.note)) : ''}`).join('\n')}

## Prepdag, trin for trin

Fire spor kører samtidig: **GRYDE** (ris, så pasta), **PANDE** (oksekød), **AIRFRYER** (kylling) og **DIG** (klippe, røre, fylde bokse).
Dine hænder laver kun én ting ad gangen. Kombien kan ikke mikro og airfry samtidig, så mikroen bruges ikke på prepdagen, medmindre kyllingen skal tøs op i en fart.
Kyllingen kører i ${chickenBatches} hold à ca. 350 g, og det er dem, der sætter tempoet.

| Tid | Spor | Gør | Sådan |
|---|---|---|---|
`;
for (const s of PREP) md += `| ${s.t} | ${TRACK[s.k]} | **${s.a}** | ${s.opt ? '(Kun hvis det er nødvendigt) ' : ''}${fmtText(s.x)} |\n`;
md += `
### Laver du mad til flere?

${D.SCALE_NOTES.map((x) => `- Fra x${String(x.min).replace('.', ',')}: ${x.text}`).join('\n')}

## Næste uge

Appen laver selv en ny uge hver mandag (Bland igen, hvis du vil have en anden), og der kommer 2-3 nye retter til hver fredag. Andre retter, du kan bytte ind:
`;
for (const r of Object.values(R)) if (!used.has(r.id)) md += `- ${r.name} (${D.STYLES[r.style]}, ${SLOT[r.slot]})\n`;
md += '\nSamme baser, samme tidsplan, bare andre saucer, når kyllingen fordeles.\n';
writeFileSync(OUT + '/weekly-plan.md', md);

// ---------- shopping-list.md
let total = 0, optTotal = 0, body = '';
for (const s of SHOP) {
  body += `## ${s.sec}\n\n| | Vare | Mængde | Butik | Pris |\n|---|---|---|---|---|\n`;
  for (const it of s.items) {
    const p = packs(it), price = p * it.price;
    total += price;
    if (it.opt) optTotal += price;
    body += `| ☐ | ${it.n}${it.opt ? ' (valgfri)' : ''} | ${packText(it, p)}${it.u ? ` (${usedText(it)})` : ''} | ${it.where} | ${kr(price)} |\n`;
  }
  body += '\n';
}
const pantryNeed = D.PANTRY.filter((x) => !x.opt).reduce((a, x) => a + x.price, 0);
const pantryAll = D.PANTRY.reduce((a, x) => a + x.price, 0);
const glass = boxes;
md = `# Indkøbsliste

Til ugeplanen: ${meals} måltider, 1 person. Priserne er fra Rema 1000 og Lidl i Svendborg, oktober 2026. Netto ligger typisk på samme niveau. Tilbud gør det tit billigere, så tjek appsene.

**Uge i alt: ca. ${kr(total - optTotal)}** (ca. ${kr((total - optTotal) / meals)} pr. måltid)
<sub>Med alle de valgfrie ting: ca. ${kr(total)}</sub>

${body}Der bliver noget tilovers (ris, pasta, løg, frost, tortillas), så næste uge bliver billigere.

## Basisvarer (købes én gang, holder i ugevis)

| | Vare | Mængde | Pris |
|---|---|---|---|
${D.PANTRY.map((x) => `| ☐ | ${x.n}${x.opt ? ' (valgfri)' : ''}${x.where ? ', ' + x.where : ''} | ${x.label} | ${kr(x.price)} |`).join('\n')}

**Basisvarer i alt: ca. ${kr(pantryNeed)}** uden de valgfrie (${kr(pantryAll)} med).

## Tips

- Lidl: kylling i storpakning, kartoffelbåde, broccoli og ost. Rema: tikka masala-glasset og naan. Netto på Mølmarksvej ligger lige ved Lidl og har tortillas.
- Rema har altid tikka-glasset. Det holder et år, så køb et par stykker, når du er forbi.
- Kyllingen er den dyreste vare. Laver du ikke mad samme dag eller dagen efter, så frys den med det samme.
- Gochujang findes kun i Asian Market. Stærk chilisauce + lidt ekstra honning virker fint.
- Du skal bruge ${glass} madbokse. Køb glasbokse med låg: glasset tåler både mikro og airfryer, plastlåget kun mikro. Mindst 2 skal være ovnfaste.
`;
writeFileSync(OUT + '/shopping-list.md', md);

// ---------- starter-list.md
const num = (ids) => ids.map((id) => '#' + R[id].num).join(' ') || 'alle';
const all = STARTER.flatMap((g) => g.items);
const need = all.filter((x) => !x.opt).reduce((a, x) => a + packs(x) * x.price, 0);
const allPrice = all.reduce((a, x) => a + packs(x) * x.price, 0);
const wedges = all.find((x) => x.id === 'kartoffelbaade');
const lidl = D.STORES.find((s) => s.chain === 'Lidl');
const netto = D.STORES.find((s) => s.chain === 'Netto');
md = `# Starter-indkøbsliste

Alt du skal bruge til **alle ${D.RECIPES.length} opskrifter**: baser, saucer, krydderier og frost. Køb det én gang, så skal du bagefter kun købe kød, ost og mejeri hver uge.

**I alt ca. ${kr(need)}** uden de valgfrie ting
<sub>Med alt: ca. ${kr(allPrice)}</sub>

- Mængderne er til ${D.RECIPES.length} måltider, én af hver ret. Laver du mere, så brug slideren i \`index.html\`. Den regner pakker og pris ud, fx ${packs(wedges, 4)} poser kartoffelbåde til ${D.RECIPES.length * 4} måltider.
- Holdbarhederne er tommelfingerregler. Står der noget andet på pakken, så følg pakken.
- "Bruges i" peger på opskrifterne i \`recipes.md\`.

## Hvor i Svendborg

| Butik | Adresse | Hvorfor |
|---|---|---|
${D.STORES.map((s) => `| ${s.chain} | ${s.where} | ${s.why} |`).join('\n')}

**Nemmeste tur:** Lidl og Netto på Mølmarksvej (${lidl.where.replace('Mølmarksvej ', 'nr. ')} og ${netto.where.split(',')[0].replace('Mølmarksvej ', '')}), plus et smut i Rema efter tikka masala-saucen (eller Patak's i Føtex). Sød chilisauce er også sikrest i Rema. Begge holder et år, så tag dem, næste gang du er forbi. Gochujang findes kun i Asian Market, ellers brug stærk chilisauce.

`;
for (const g of STARTER) {
  md += `## ${g.sec}\n\n${g.note}\n\n| | Vare | Mængde | Uåbnet | Efter åbning | Hvor | Bruges i | Pris |\n|---|---|---|---|---|---|---|---|\n`;
  for (const x of g.items) {
    const p = packs(x);
    md += `| ☐ | ${x.n}${x.opt ? ' (valgfri)' : ''} | ${packText(x, p)}${x.u ? ` (${usedText(x)})` : ''} | ${x.life} | ${x.open} | ${x.where} | ${num(x.use)} | ${kr(p * x.price)} |\n`;
  }
  const tips = g.items.filter((x) => x.tip);
  md += tips.length ? '\n' + tips.map((x) => `> **${x.n}:** ${x.tip}`).join('\n>\n') + '\n\n' : '\n';
}
md += `## Hvad skal du så købe hver uge?

Kun det friske: kød, ost, cremefraiche og de saucer, du har brugt op. Se \`shopping-list.md\` for ugens liste.

## Smarte holdbarhedstricks

- Køb hakket oksekød på tilbud og frys det samme dag, fladt i en pose. Det tør op på ca. 1 time i koldt vand (i lukket pose).
- Revet ost kan fryses direkte i posen. Brug den frossen, den smelter fint.
- Tortillas og naan: frys dem. Tortillas 20-30 sek. i mikroen, naan 2-3 min i airfryeren, så er de som nye.
- Halve dåser majs og bønner: i en boks i fryseren, ellers skal de bruges inden for 3 dage.
- Kylling i storpakning: frys den samme dag, hvis du ikke laver mad inden for 1-2 dage. Den tør op i køleskabet på ca. 24 timer.
- Skriv datoen på glas, når du åbner dem. En tusch på låget.
`;
writeFileSync(OUT + '/starter-list.md', md);

// ---------- README.md
md = `# Lazy Prep

Doven comfort food med meal prep. Kombi-mikro med airfry, 1 pande, 1 gryde, ingen ovn. Handl lørdag, prep søndag, spis hele ugen.

- \`index.html\`: åbn den på mobilen. Ugens plan, opskrifter og indkøbslister på én side. Der kommer en ny, varieret uge hver uge. Slå hvert måltid til og fra (fx når du spiser i skolen), byt retter, og indkøbsliste, prepplan og pris regnes ud igen. Afkrydsninger gemmes på telefonen, og der er en portions-slider.
- \`weekly-plan.md\`: uge ${WK.week}, ${meals} måltider i ${styles.size} stilarter og prepdagen trin for trin, ca. ${T.rutine} min (${T.foersteGang} min første gang).
- \`recipes.md\`: ${D.BASES.length} baser + ${D.RECIPES.length} retter med fotos.
- \`shopping-list.md\`: ugens indkøbsliste med priser fra Netto, Rema 1000 og Lidl, ca. ${kr(total - optTotal)}.
- \`starter-list.md\`: alt til alle ${D.RECIPES.length} opskrifter, holdbarhed og hvor du finder det i Svendborg.
- \`ROUTINE.md\`: hver fredag morgen tilføjer en planlagt Claude-session 2-3 nye retter, så puljen vokser.

Kilden ligger i \`src/\`: \`data.mjs\` (indhold og varer), \`recipes/\` (retterne), \`engine.mjs\` (ugeplan, lister og prepplan), \`fmt.mjs\` (mængder), \`template.html\` (siden), \`check.mjs\` (tjek) og \`build.mjs\`.
Tjek med \`node src/check.mjs\` og byg med \`node src/build.mjs .\` fra denne mappe.
`;
writeFileSync(OUT + '/README.md', md);

// ---------- index.html
// fmt.mjs, then engine.mjs (export stripped), then DATA. The old keys (WEEK, PREP, SHOP...) are this week's engine
// output, so a template that does not call the engine yet keeps working. Skipped meals become a stub there.
const strip = (f) => readFileSync(here + f, 'utf8').replace(/^export /gm, '').replace(/^\/\/.*\n/, '');
const fmtSrc = strip('fmt.mjs');
const engineSrc = strip('engine.mjs');
const stub = (slot) => ({ r: slot === 'dinner' ? 'Spiser i skolen' : 'Springer over', s: 'fridge', box: 'boks', skip: true });
const LEGACY_WEEK = WEEK.map((d) => ({ ...d, lunch: d.lunch || stub('lunch'), dinner: d.dinner || stub('dinner') }));
const data = JSON.stringify({
  STYLES: D.STYLES, BASES: D.BASES, RECIPES: D.RECIPES, PRODUCTS: D.PRODUCTS, PANTRY: D.PANTRY, PANTRY_IDS: D.PANTRY_IDS,
  STARTER_SECS: D.STARTER_SECS, KIT_BASE: D.KIT_BASE, DEFAULT_MEALS: D.DEFAULT_MEALS, RULES: D.RULES, STORES: D.STORES, SCALE_NOTES: D.SCALE_NOTES,
  BUILT_WEEK: WK, PLAN,
  WEEK: LEGACY_WEEK, EAT, REMINDERS, PREP, SHOP, STARTER, KIT, PREP_TIME: { rutine: T.rutine, foersteGang: T.foersteGang, aktiv: T.aktiv },
});
let html = readFileSync(here + 'template.html', 'utf8').replace('/*FMT*/', () => fmtSrc + '\n/*ENGINE*/');
if (html.split('/*ENGINE*/').length > 2) html = html.replace('/*ENGINE*/', '');
html = html.replace('/*ENGINE*/', () => engineSrc).replace('/*DATA*/', () => 'const DATA = ' + data + ';');
writeFileSync(OUT + '/index.html', html);
console.log('uge', total - optTotal, 'med valgfri', total, 'basis', pantryNeed, 'starter', need);
