import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as D from './data.mjs';
import { fmtQty, fmtText, packs } from './fmt.mjs';

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const here = new URL('.', import.meta.url).pathname;
const R = Object.fromEntries(D.RECIPES.map((r, i) => [r.id, { ...r, num: i + 1 }]));
const TRACK = { pot: 'GRYDE', pan: 'PANDE', air: 'AIRFRYER', you: 'DIG' };
const kr = (n) => Math.round(n) + ' kr';

// ---------- derived numbers (nothing hard-coded below)
const meals = D.WEEK.length * 2;
const dayName = Object.fromEntries(D.WEEK.map((d) => [d.day, d.name]));
const styles = new Set(D.WEEK.flatMap((d) => [R[d.lunch.r].style, R[d.dinner.r].style]));
const styleList = [...styles].map((s) => D.STYLES[s]).join(', ');
const kitCount = (n) => (D.KIT.find((k) => k.n === n) || {}).count || 0;
const boxes = kitCount('Madbokse med låg');
const T = D.PREP_TIME;
const used = new Set(D.WEEK.flatMap((d) => [d.lunch.r, d.dinner.r]));
const fridgeDays = D.WEEK.filter((d) => d.lunch.s === 'fridge' && d.dinner.s === 'fridge').map((d) => d.name);
const freezerDays = D.WEEK.filter((d) => d.lunch.s === 'freezer' || d.dinner.s === 'freezer').map((d) => d.name);
const span = (a) => (a.length > 1 ? `${a[0].toLowerCase()}-${a[a.length - 1].toLowerCase()}` : (a[0] || '').toLowerCase());
const chickenBatches = D.PREP.filter((s) => s.k === 'air' && (s.a === 'IND' || s.a === 'SKIFT')).length;

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
const ing = (x) => '- ' + (x.q == null ? x.n : fmtQty(x.q, x.u) + ' ' + x.n);

// ---------- recipes.md
let md = `# Opskrifter

Doven comfort food. Hver opskrift giver **2 portioner** og tager **højst ${Math.max(...D.RECIPES.map((r) => r.hands))} min med hænderne**.
Alt bygger på ${D.BASES.length} baser, så én prepdag dækker en hel masse retter.

Udstyr: kombi-mikro med airfry, 1 pande, 1 gryde. Ingen ovn. Mikrotider er til 800 W. Airfryertider er med forvarmet kombi på pladen, der fulgte med.
Kylling i retterne er **færdig vægt**: 1 kg rå bryst giver ca. 700 g færdig kylling, 6 portioner a ca. 115 g (ca. 10 stykker).
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
md += '## Retterne\n\n| # | Ret | Stil | Baser | Med hænderne |\n|---|---|---|---|---|\n';
for (const r of Object.values(R)) md += `| ${r.num} | ${r.name} | ${D.STYLES[r.style]} | ${r.bases.join(' + ')} | ${r.hands} min |\n`;
md += '\n';
for (const r of Object.values(R)) {
  md += `### ${r.num}. ${r.name}\n\n**${D.STYLES[r.style]}** · Base ${r.bases.join(' + ')} · ${r.hands} min med hænderne · 2 portioner\n\n`;
  md += r.ingredients.map(ing).join('\n') + '\n\n';
  md += r.steps.map((s, i) => `${i + 1}. ${fmtText(s)}`).join('\n') + '\n\n';
  md += `- **Køleskab:** ${r.fridge}\n- **Fryser:** ${r.freezer}\n- **Opvarmning:** ${fmtText(r.reheat)}\n`;
  if (r.tip) md += `\n> ${fmtText(r.tip)}\n`;
  md += '\n';
}
md += '## Opvarmningsregler\n\n' + D.RULES.map((x) => '- ' + x).join('\n') + '\n';
writeFileSync(OUT + '/recipes.md', md);

// ---------- weekly-plan.md
const cell = (m) => `${R[m.r].name} (${D.STYLES[R[m.r].style]})${m.s === 'freezer' ? ` ❄ tø op ${dayName[m.thaw].toLowerCase()} aften` : ''}`;
md = `# Ugeplan

Én prepdag: ca. **${T.rutine} min** når du har prøvet det, ca. **${T.foersteGang} min** første gang. Ca. ${T.aktiv} min af tiden har du noget i hænderne, resten venter du på airfryeren.
Det giver **${meals} måltider** (${D.WEEK.length} dage, frokost + aftensmad) i ${styles.size} stilarter: ${styleList}.

Prep søndag. ${fridgeDays.map((d) => d.toLowerCase()).join(' og ')} kommer i køleskabet, ${span(freezerDays)} i fryseren. Fødevarestyrelsen siger rester inden for 2-3 dage, så intet står i køleskabet mere end 2 dage.
**Frokost kan altid laves med kun en mikro** (til uni). Retter, der skal i airfryeren, er aftensmad.

## Ugen

| Dag | Frokost (kun mikro) | Aftensmad |
|---|---|---|
`;
for (const d of D.WEEK) md += `| ${d.name} | ${cell(d.lunch)} | ${cell(d.dinner)} |\n`;
md += '\n❄ = frosset på prepdagen. Flyttes til køleskabet aftenen før.\n\n' + D.REMINDERS.map((x) => '- ' + x).join('\n') + '\n\n';
md += '### Når du spiser\n\n';
for (const id of used) md += `- **${R[id].name}:** ${D.EAT[id]}\n`;
md += `
## Udstyr

${D.KIT.map((k) => `- **${k.count ? k.count + ' ' + k.n.toLowerCase() : k.n}**${k.note ? ': ' + k.note : ''}`).join('\n')}

## Prepdag, trin for trin

Fire spor kører samtidig: **GRYDE** (ris, så pasta), **PANDE** (oksekød), **AIRFRYER** (kylling) og **DIG** (klippe, røre, fylde bokse).
Dine hænder laver kun én ting ad gangen. Kombien kan ikke mikro og airfry samtidig, så prepdagen bruger ikke mikroen, kun hvis kyllingen skal optøs i en fart.
Kyllingen kører i ${chickenBatches} hold a ca. 350 g, og det er dem, der sætter tempoet.

| Tid | Spor | Gør | Sådan |
|---|---|---|---|
`;
for (const s of D.PREP) md += `| ${s.t} | ${TRACK[s.k]} | **${s.a}** | ${fmtText(s.x)} |\n`;
md += `
### Laver du mere?

${D.SCALE_NOTES.map((x) => `- Fra x${String(x.min).replace('.', ',')}: ${x.text}`).join('\n')}

## Næste uge

Byt nogle af de andre retter ind, så det ikke bliver kedeligt:
`;
for (const r of Object.values(R)) if (!used.has(r.id)) md += `- ${r.name} (${D.STYLES[r.style]})\n`;
md += '\nSamme baser, samme tidsplan, bare andre saucer, når kyllingen fordeles.\n';
writeFileSync(OUT + '/weekly-plan.md', md);

// ---------- shopping-list.md
let total = 0, optTotal = 0, body = '';
for (const s of D.SHOP) {
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
const glass = kitCount('Madbokse med låg');
md = `# Indkøbsliste

Til ugeplanen: ${meals} måltider, 1 person. Priserne er fra Rema 1000 og Lidl i Svendborg, oktober 2026. Netto ligger typisk på samme niveau. Tilbud gør det tit billigere, så tjek appsene.

**Uge i alt: ca. ${kr(total - optTotal)}** (ca. ${kr((total - optTotal) / meals)} pr. måltid)
<sub>Med alle de valgfrie ting: ca. ${kr(total)}</sub>

${body}Der bliver noget tilovers (ris, pasta, løg, frost, tortillas), så næste uge bliver billigere.

## Basisvarer (købes én gang, holder i ugevis)

| | Vare | Mængde | Pris |
|---|---|---|---|
${D.PANTRY.map((x) => `| ☐ | ${x.n}${x.opt ? ' (valgfri)' : ''}${x.where ? ', ' + x.where : ''} | ${x.label} | ${kr(x.price)} |`).join('\n')}

**Basisvarer i alt: ca. ${kr(pantryNeed)}** uden de valgfrie (${kr(pantryAll)} med). Salt går vi ud fra, at du har.

## Tips

- Lidl: kylling i storpakning, kartoffelbåde, broccoli og ost. Rema: tikka masala-glasset og naan. Netto på Mølmarksvej ligger lige ved Lidl og har tortillas.
- Tikka-glasset findes sikkert i Rema. Det holder et år, så køb et par stykker, når du er forbi.
- Kyllingen er den dyreste vare. Laver du ikke mad samme dag eller dagen efter, så frys den med det samme.
- Gochujang findes kun i Asian Market. Stærk chilisauce + lidt ekstra honning virker fint.
- Du skal bruge ${glass} madbokse. Køb glasbokse med låg: glasset tåler både mikro og airfryer, plastlåget kun mikro. Mindst 2 skal være ovnfaste.
`;
writeFileSync(OUT + '/shopping-list.md', md);

// ---------- starter-list.md
const num = (ids) => ids.map((id) => '#' + R[id].num).join(' ') || 'alt';
const all = D.STARTER.flatMap((g) => g.items);
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
- Holdbarhed er tommelfingerregler. Står der noget andet på pakken, så følg pakken.
- "Bruges i" peger på opskrifterne i \`recipes.md\`.

## Hvor i Svendborg

| Butik | Adresse | Hvorfor |
|---|---|---|
${D.STORES.map((s) => `| ${s.chain} | ${s.where} | ${s.why} |`).join('\n')}

**Nemmeste tur:** Lidl (${lidl.where}) + Netto (${netto.where.split(',')[0]}) ligger på samme vej og dækker det meste. Tikka masala-glasset og sød chilisauce er sikrest i Rema, og de holder et år, så tag dem næste gang du er forbi. Gochujang findes kun i Asian Market, ellers brug stærk chilisauce.

`;
for (const g of D.STARTER) {
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

- Køb hakket oksekød på tilbud og frys det samme dag, fladt i en pose. Det tør på ca. 1 time i koldt vand (i lukket pose).
- Revet ost kan fryses direkte i posen. Brug den frossen, den smelter fint.
- Tortillas og naan: frys dem. Tortillas 20-30 sek. i mikroen, naan 2-3 min i airfryeren, så er de som nye.
- Halve dåser majs og bønner: i en boks i fryseren, ellers skal de bruges inden for 3 dage.
- Kylling i storpakning: frys den samme dag, hvis du ikke laver mad inden for 1-2 dage. Den tør op i køleskabet på ca. 24 timer.
- Skriv datoen på glas, når du åbner dem. En tusch på låget.
`;
writeFileSync(OUT + '/starter-list.md', md);

// ---------- README.md
md = `# Lazy Prep

Doven comfort food med meal prep. Kombi-mikro med airfry, 1 pande, 1 gryde, ingen ovn.

- \`index.html\`: åbn den på mobilen. Plan, opskrifter og indkøbslister på én side. Afkrydsninger gemmes på telefonen, og der er en portions-slider.
- \`weekly-plan.md\`: ${meals} måltider, ${styles.size} stilarter, prepdag på ca. ${T.rutine} min (${T.foersteGang} min første gang) trin for trin.
- \`recipes.md\`: ${D.BASES.length} baser + ${D.RECIPES.length} retter.
- \`shopping-list.md\`: ugens indkøbsliste med priser fra Netto, Rema 1000 og Lidl, ca. ${kr(total - optTotal)}.
- \`starter-list.md\`: alt til alle ${D.RECIPES.length} opskrifter, holdbarhed og hvor i Svendborg.

Kilden ligger i \`src/\`: \`data.mjs\` (alt indhold), \`fmt.mjs\` (mængder), \`template.html\` (siden) og \`build.mjs\`.
Byg med \`node src/build.mjs .\` fra denne mappe.
`;
writeFileSync(OUT + '/README.md', md);

// ---------- index.html
const fmtSrc = readFileSync(here + 'fmt.mjs', 'utf8').replace(/^export /gm, '').replace(/^\/\/.*\n/, '');
const data = JSON.stringify({ STYLES: D.STYLES, BASES: D.BASES, RECIPES: D.RECIPES, WEEK: D.WEEK, EAT: D.EAT, REMINDERS: D.REMINDERS, PREP: D.PREP, RULES: D.RULES, SHOP: D.SHOP, PANTRY: D.PANTRY, STARTER: D.STARTER, STORES: D.STORES, SCALE_NOTES: D.SCALE_NOTES, KIT: D.KIT, PREP_TIME: D.PREP_TIME });
const html = readFileSync(here + 'template.html', 'utf8').replace('/*FMT*/', () => fmtSrc).replace('/*DATA*/', () => 'const DATA = ' + data + ';');
writeFileSync(OUT + '/index.html', html);
console.log('uge', total - optTotal, 'med valgfri', total, 'basis', pantryNeed, 'starter', need);
