// Single source of truth for content. build.mjs turns it (plus engine.mjs) into the .md files and index.html.
// Recipes live in recipes/core.mjs (original 10) and recipes/pool.mjs (the growing pool).
// All text is Danish. Ids and unit codes stay ASCII.
// Quantities: {q, u, n}. q is for scale x1 (recipes = 2 portions, bases = 1 batch). q null = efter smag / valgfri.
// Unit codes (see fmt.mjs): g, ml, tsp, tbsp (vådt, bliver til dl), dtbsp (tørt), pcs, can, jar, bag, cube,
// pose, krus, portion, box, onion, haandfuld, stk.
// Inline scalable numbers in text: {450|g}. makes, steps, note, tip, reheat and PREP all scale on the page,
// so only mark amounts that grow with the batch (never per-box amounts or times).
// Chicken: 1 kg raw breast = ca. 700 g cooked = 6 portions of ca. 115 g (ca. 10 stykker).
// 1 krus = ca. 2,4 dl.

export const STYLES = {
  mexican: 'Mexicansk',
  korean: 'Koreansk',
  indian: 'Indisk',
  italian: 'Italiensk',
  diner: 'Amerikansk diner',
  takeaway: 'Asiatisk takeaway',
};

export const BASES = [
  {
    id: 'A',
    name: 'Sprød airfryer-kylling',
    makes: '{6|portion}, ca. {700|g} færdig kylling (af {1000|g} rå)',
    ingredients: [
      { q: 1000, u: 'g', n: 'rå kyllingebrystfilet (storpakning, frisk eller optøet)' },
      { q: 1, u: 'cube', n: 'hønsebouillon, smuldret' },
      { q: 0.5, u: 'tsp', n: 'salt' },
      { q: 0.5, u: 'tsp', n: 'sort peber' },
      { q: 1, u: 'tsp', n: 'hvidløgspulver' },
      { q: 1, u: 'tsp', n: 'paprika' },
      { q: 3, u: 'dtbsp', n: 'majsstivelse (Maizena)' },
      { q: 1, u: 'tsp', n: 'bagepulver' },
      { q: 1, u: 'tbsp', n: 'olie, kommer i til sidst' },
    ],
    steps: [
      'Klip kyllingen i 3 cm stykker med en køkkensaks direkte ned i en stor skål. Intet skærebræt.',
      'Smuldr bouillonen over. Salt, peber, hvidløg, paprika, majsstivelse og bagepulver i. Vend, til der ikke er mere tørt pulver.',
      'Hæld olien i til sidst og vend igen.',
      'Vask hænder, saks og alt, den rå kylling har rørt.',
      'Airfry 200°C, forvarmet, hvis din model beder om det. En tredjedel af kyllingen pr. hold (ca. 350 g), ét lag på pladen med luft imellem. 15-18 min, vend halvvejs.',
      'Skær det største stykke over efter 15 min. Hvidt hele vejen igennem (75°C) = færdig. Tag den ud, kyllingebrystfilet bliver hurtigt tør.',
      'Færdig kylling i en ren skål, aldrig i den rå.',
    ],
    fridge: '2-3 dage',
    freezer: '3 mdr. Frys den fladt i en pose, så stykkerne ikke fryser sammen.',
    note: 'Majsstivelse + bagepulver er det sprøde trick, spring det ikke over. Kan der ligge 500 g fladt på din plade, så kør 2 hold i stedet for 3. Kyllingeoverlår virker også, de er saftigere og tørrer ikke så let ud.',
  },
  {
    id: 'B',
    name: 'Krydret oksekød, 2 slags',
    makes: 'ca. {450|g} tacokød + {600|g} bolognese',
    ingredients: [
      { q: 400, u: 'g', n: 'hakket oksekød 8-12%' },
      { q: 1, u: 'onion', n: '(groft hakket)' },
      { q: 1, u: 'tsp', n: 'salt' },
      { q: 1, u: 'jar', n: 'pastasauce (400 g), til bolognese' },
      { q: 1, u: 'cube', n: 'oksebouillon, til bolognese' },
      { q: 1, u: 'tsp', n: 'hvidløgspulver, til bolognese' },
      { q: 1, u: 'tsp', n: 'tørret oregano eller italienske krydderurter, til bolognese' },
      { q: 1, u: 'bag', n: 'tacokrydderi, til tacokødet' },
      { q: 1, u: 'can', n: 'kidneybønner, drænet, til tacokødet' },
      { q: 1, u: 'tbsp', n: 'ketchup, til tacokødet' },
      { q: 1, u: 'krus', n: 'vand (halvdelen til hver)' },
    ],
    steps: [
      'Skær løget groft på en tallerken. Pænt behøver det ikke være, det smelter ind i kødet.',
      'Pande på høj varme med lidt olie. Kød, løg og salt i. Del kødet med stegespaden og brun det i 8 min.',
      'Læg halvdelen over i en af glasboksene. Den bliver til bolognese.',
      'Resten i panden: tacokrydderi, bønner, ketchup og {0.5|krus} vand. Mos bønnerne lidt, det gør det cremet. Lad det boble 4 min.',
      'Tacokødet direkte i bokse. Så kommer det parkerede kød tilbage i panden.',
      'Pastasauce, smuldret bouillon, hvidløg, oregano og {0.5|krus} vand i. Simr 5 min. Det er bolognese.',
    ],
    fridge: '2-3 dage',
    freezer: '3 mdr.',
    note: 'Cheeseburgerkød (ret 10) er til en anden uge: brug det i stedet for taco- eller bolognese-halvdelen. Brun som normalt, og rør så {1|tbsp} ketchup + {1|tsp} sennep i den halvdel. Giver ca. {200|g}.',
  },
  {
    id: 'C',
    name: 'En stor gryde ris',
    makes: '{5|portion}, ca. {1000|g} kogte ris',
    ingredients: [
      { q: 2, u: 'krus', n: 'jasminris (ca. 400 g)' },
      { q: 2.75, u: 'krus', n: 'vand (ca. 6,5 dl)' },
      { q: 0.5, u: 'tsp', n: 'salt' },
    ],
    steps: [
      'Skyl risen én gang i gryden. Hold låget på skrå og hæld vandet ud i vasken.',
      'Vand og salt i, låg på, fuld varme, til det koger.',
      'Laveste varme, 12 min. Løft ikke låget.',
      'Fra varmen, låget bliver på, 8-10 min mere.',
      'Fordel risen direkte i boksene, bred den ud og lad låget være af. Så køler den hurtigt. I køl eller frys inden for 1 time.',
    ],
    fridge: '2 dage. Ris er den, du skal være streng med. Længere tid? Frys den.',
    freezer: '2 mdr.',
    note: 'Varm kun ris op én gang, og til den damper. Genvej: mikroris i pose, 2 min ved 800 W. Dyrere, nul arbejde.',
  },
  {
    id: 'D',
    name: 'Pasta',
    makes: '{2|portion}',
    ingredients: [
      { q: 2, u: 'krus', n: 'penne (ca. 200 g tør vægt)' },
      { q: 1, u: 'tsp', n: 'salt' },
    ],
    steps: [
      'Fyld gryden halvt op med vand, salt i, låg på og bring i kog.',
      'Kog 1 min KORTERE, end der står på pakken. Den bliver blødere, når du varmer op.',
      'Hold låget på skrå og hæld vandet ud i vasken. Vend pastaen i sauce med det samme, så den ikke klistrer sammen.',
    ],
    fridge: '2-3 dage (med sauce)',
    freezer: '3 mdr. (med sauce)',
  },
  {
    id: 'E',
    name: 'Frosne kartoffelbåde',
    makes: '{2|portion}',
    ingredients: [{ q: 500, u: 'g', n: 'frosne kartoffelbåde' }],
    steps: [
      'Prep dem aldrig. Lav dem direkte fra frost, når du skal spise. Det er nul arbejde alligevel.',
      'Ét lag på pladen. Airfry 200°C, 20-25 min, vend 2 gange.',
    ],
    fridge: 'Nej. Altid friske.',
    freezer: 'Det er der, de bor.',
    note: 'Kombi-airfryere er svagere end kurvmodeller. Fyldt plade = bløde både. Mere end ca. 500 g? Så 2 omgange.',
  },
];

// Shown under the timeline when the slider is at or above min.
export const SCALE_NOTES = [
  { min: 1.5, minutes: 110, text: 'Hver ekstra ca. 350 g rå kylling er et hold mere i airfryeren, ca. +16 min.' },
  { min: 2, minutes: 120, text: 'Lav 2 omgange kylling: klip og krydr det hele, men kør 6 hold i stedet for 3. Regn med ca. 2 timer.' },
  { min: 2, text: '800 g oksekød er for meget til én pande. Brun det i 2 omgange, ellers koger det i stedet for at brune.' },
  { min: 2.5, text: 'Over 4 krus ris eller 4 krus pasta: kog i 2 omgange, eller brug mikroris i pose.' },
  { min: 3, text: 'Ærligt: over x2 er det nemmere at dele det op i 2 prepdage.' },
];

export const RULES = [
  'Mikrotider er til 800 W. Ved 1000 W: træk ca. 20% fra.',
  'Varm op til det damper hele vejen igennem (75°C). I tvivl? 1 min mere. Rør halvvejs, mikroen varmer kanterne først.',
  'Ris: 1 spsk vand (eller en isterning) på inden mikro, låg på skrå. Varm kun ris op én gang.',
  'Mikrofunktion: mikroovnsegnede bokse, låg på skrå, ingen folie eller metal, og tag metalpladen ud.',
  'Airfryfunktion: kun ovnfast glas eller keramik, aldrig plastbokse eller plastlåg. Metal er fint.',
  'Sæt aldrig en frossen glasboks direkte ind på 200°C. Tø den op eller mikro den først.',
  'Sprødt: 1 min i mikro, så på pladen ved 200°C i 3-4 min. Kun mikro gør det slapt.',
  'Airfryertider er med forvarmet kombi. Forvarm, hvis din model beder om det. Den kan ikke mikro samtidig.',
  'Tø frosne bokse op i køleskabet natten over. Optøet: spis inden for 24 timer, frys aldrig igen. Glemt det? Optøning 4-5 min, så normal opvarmning.',
];

export const STORES = [
  { chain: 'Lidl', where: 'Mølmarksvej 185', why: 'Billig kylling i storpakning, kartoffelbåde, broccoli og revet ost.' },
  { chain: 'Netto', where: 'Mølmarksvej 50, Ørbækvej 11, Ole Rømers Vej 65', why: 'Mejeri, dåser og tortillas. Mølmarksvej 50 ligger på samme vej som Lidl, så tag begge på én tur.' },
  { chain: 'Rema 1000', where: 'Nyborgvej 99, Vestergade 100 A, Tvedvej 69-75, Bregningevej 58 (Vindeby)', why: 'Det sikre sted til tikka masala på glas, naan, sød chilisauce og stærk chilisauce. Tortillas har de også.' },
  { chain: 'Asian Market', where: 'Indre by, Møllergade/Tinghusgade (er flyttet et par gange, tjek Google Maps)', why: 'Eneste sted med gochujang (ca. 25-40 kr) og billig sojasauce. Ring evt. og spørg først.' },
];


// Equipment that never changes with the plan. The engine adds the counted items (boxes, freezer bags, small cups) in front.
export const KIT_BASE = [
  { n: 'Skåle', count: 2, pl: 'skåle', note: 'Én til rå kylling, én til færdig kylling. Ikke flere.' },
  { n: 'Gryde og pande', note: 'Én af hver.' },
  { n: 'Stegespade eller grydeske', note: 'Til at dele kødet og røre.' },
  { n: 'Køkkensaks', note: 'Til kyllingen. Så slipper du for skærebræt.' },
  { n: 'Kniv og en tallerken', note: 'Til løget. Tallerkenen er dit skærebræt.' },
  { n: 'Et krus', note: 'Dit målebæger: ris, vand, ærter, pasta. Ca. 2,4 dl. Intet dørslag? Hold låget på skrå og hæld vandet ud i vasken.' },
  { n: 'Spiseske og teske', note: 'Til krydderier og saucer.' },
  { n: 'Tusch', note: 'Valgfri. Skriv dag og måltid på låget.' },
  { n: 'Køletaske med køleelement', note: 'Valgfri. Til frokosten på uni.' },
];

// Product catalog. q in recipes and size here use the same unit u: g | ml | stk | pack (a whole jar, can, bag, bottle...).
// sec = section on the weekly shopping list, ssec = section on the starter list (STARTER_SECS).
// staple = bought once, lasts for weeks: never on the weekly list, shown under "Basisvarer". gear = equipment.
// Prices: Rema 1000 catalog + Lidl/Netto offers, Svendborg, Oct 2026.
const LIFE_FROST = { life: '12 mdr.', open: 'Luk posen med en klips' };
export const CORE_PRODUCTS = {
  // Frugt og grønt
  loeg: { n: 'Løg', sec: 'Frugt og grønt', ssec: 'groent', u: 'stk', size: 8, label: '1 kg net', unit: 'net', plural: 'net', price: 12, where: 'Alle', life: '1-2 mdr. mørkt og køligt', open: 'Halvt løg: 3-4 dage i køl, i en boks' },
  lime: { n: 'Lime', sec: 'Frugt og grønt', ssec: 'groent', u: 'stk', size: 1, label: '1 stk', unit: 'stk', plural: 'stk', price: 5, where: 'Alle', opt: true, life: '2-3 uger i køl', open: '3-4 dage, med snitfladen nedad' },
  foraarsloeg: { n: 'Forårsløg', sec: 'Frugt og grønt', ssec: 'groent', u: 'pack', size: 1, label: '1 bundt', unit: 'bundt', plural: 'bundter', price: 8, where: 'Alle', opt: true, life: '1 uge i køl', open: 'Klip i ringe og frys, 3 mdr.' },
  // Kød og køl
  kylling: { n: 'Kyllingebrystfilet, storpakning', sec: 'Kød og køl', ssec: 'koel', u: 'g', size: 1000, label: 'ca. 1 kg', unit: 'pakke', plural: 'pakker', price: 65, where: 'Lidl', life: 'Se datoen, ellers frys samme dag (12 mdr.)', open: 'Optøet: 1-2 dage i køl' },
  oksekoed: { n: 'Hakket oksekød 8-12%', sec: 'Kød og køl', ssec: 'koel', u: 'g', size: 400, label: '400 g', unit: 'bakke', plural: 'bakker', price: 40, where: 'Netto / Rema / Lidl', life: 'Se datoen, ellers frys samme dag (3 mdr.)', open: 'Optøet: 1 dag i køl' },
  ost: { n: 'Revet ost (pizzatopping)', sec: 'Kød og køl', ssec: 'koel', u: 'g', size: 500, label: '500 g', unit: 'pose', plural: 'poser', price: 25, where: 'Rema / Lidl', life: 'Se datoen, typisk 4-6 uger', open: '5-7 dage. Kan fryses i posen, 3 mdr.' },
  cremefraiche: { n: 'Cremefraiche 18%', sec: 'Kød og køl', ssec: 'koel', u: 'g', size: 250, label: '250 g', unit: 'bæger', plural: 'bægre', price: 13, where: 'Alle', life: 'Se datoen', open: '4-5 dage' },
  floedeost: { n: 'Flødeost naturel', sec: 'Kød og køl', ssec: 'koel', u: 'g', size: 200, label: '200 g', unit: 'bæger', plural: 'bægre', price: 15, where: 'Alle', life: 'Se datoen', open: '5 dage' },
  parmesan: { n: 'Revet parmesan / Grana Padano', sec: 'Kød og køl', ssec: 'koel', u: 'g', size: 100, label: '100 g', unit: 'pose', plural: 'poser', price: 16, where: 'Lidl / Netto', life: '2-3 mdr.', open: '3-4 uger i køl' },
  maelk: { n: 'Mælk', sec: 'Kød og køl', ssec: 'koel', u: 'ml', size: 1000, label: '1 L', unit: 'karton', plural: 'kartoner', price: 12, where: 'Alle', life: 'Se datoen', open: '3-5 dage' },
  // Frost
  kartoffelbaade: { n: 'Kartoffelbåde', sec: 'Frost', ssec: 'frost', u: 'g', size: 750, label: '750 g', unit: 'pose', plural: 'poser', price: 14, where: 'Lidl', ...LIFE_FROST },
  aerter: { n: 'Ærter', sec: 'Frost', ssec: 'frost', u: 'g', size: 500, label: '500 g', unit: 'pose', plural: 'poser', price: 13, where: 'Alle', ...LIFE_FROST },
  broccoli: { n: 'Broccolibuketter', sec: 'Frost', ssec: 'frost', u: 'g', size: 750, label: '750 g', unit: 'pose', plural: 'poser', price: 19, where: 'Lidl', ...LIFE_FROST },
  wok: { n: 'Wokgrøntsager', sec: 'Frost', ssec: 'frost', u: 'g', size: 500, label: '500 g', unit: 'pose', plural: 'poser', price: 16, where: 'Lidl / Netto', ...LIFE_FROST },
  spinat: { n: 'Hakket spinat i portioner', sec: 'Frost', ssec: 'frost', u: 'g', size: 750, label: '750 g', unit: 'pose', plural: 'poser', price: 12, where: 'Netto / Rema', life: '12 mdr.', open: 'Tag 2 klumper ad gangen' },
  // Kolonial: tørvarer og dåser
  ris: { n: 'Jasminris', sec: 'Kolonial', ssec: 'toer', u: 'g', size: 1000, label: '1 kg', unit: 'pose', plural: 'poser', price: 15, where: 'Alle', life: '2 år', open: '1 år i skabet, lukket pose' },
  penne: { n: 'Penne', sec: 'Kolonial', ssec: 'toer', u: 'g', size: 500, label: '500 g', unit: 'pose', plural: 'poser', price: 8, where: 'Alle', life: '2 år', open: '1 år i skabet' },
  kidney: { n: 'Kidneybønner', sec: 'Kolonial', ssec: 'toer', u: 'pack', size: 1, label: '1 dåse', unit: 'dåse', plural: 'dåser', price: 7, where: 'Alle', life: '2-3 år', open: '3 dage i køl, i en boks' },
  majs: { n: 'Majs', sec: 'Kolonial', ssec: 'toer', u: 'pack', size: 1, label: '1 dåse', unit: 'dåse', plural: 'dåser', price: 8, where: 'Alle', life: '2-3 år', open: '3 dage i køl, eller frys resten' },
  ananas: { n: 'Ananas i stykker', sec: 'Kolonial', ssec: 'toer', u: 'pack', size: 1, label: '1 lille dåse', unit: 'dåse', plural: 'dåser', price: 8, where: 'Alle', opt: true, life: '2 år', open: '3 dage i køl, i en boks' },
  tortillachips: { n: 'Tortillachips', sec: 'Kolonial', ssec: 'toer', u: 'pack', size: 1, label: '1 pose', unit: 'pose', plural: 'poser', price: 12, where: 'Alle', opt: true, life: '3-6 mdr.', open: '1-2 uger med en klips' },
  ristedeloeg: { n: 'Ristede løg', sec: 'Kolonial', ssec: 'toer', u: 'pack', size: 1, label: '1 bæger', unit: 'bæger', plural: 'bægre', price: 10, where: 'Alle', opt: true, life: '6-12 mdr.', open: '1-2 mdr., låg på' },
  taco: { n: 'Tacokrydderi', sec: 'Kolonial', ssec: 'basis', u: 'pack', size: 1, label: '1 brev', unit: 'brev', plural: 'breve', price: 6, where: 'Alle', life: '1-2 år', open: 'Fold brevet sammen og luk med en klips' },
  // Kolonial: saucer og glas
  pastasauce: { n: 'Pastasauce, tomat og basilikum', sec: 'Kolonial', ssec: 'saucer', u: 'pack', size: 1, label: '1 glas, 400 g', unit: 'glas', plural: 'glas', price: 17, where: 'Alle', life: '1-2 år', open: '5 dage i køl' },
  tikka: { n: 'Tikka masala- eller butter chicken-sauce', sec: 'Kolonial', ssec: 'saucer', u: 'pack', size: 1, label: '1 glas, 350 g', unit: 'glas', plural: 'glas', price: 19, where: 'Rema', alt: 'Patak\'s i Føtex/Bilka', life: '1 år', open: '3-4 dage i køl', tip: 'Kun Rema er tjekket. Glasset holder et år, så køb et par stykker, når du er forbi. Ægte Patak\'s butter chicken koster ca. 40 kr i Føtex/Bilka.' },
  soedchili: { n: 'Sød chilisauce', sec: 'Kolonial', ssec: 'saucer', u: 'ml', size: 500, label: '500 ml', unit: 'flaske', plural: 'flasker', price: 17, where: 'Rema', life: '1-2 år', open: '1-2 mdr. i køl' },
  salsa: { n: 'Salsa / tacosauce', sec: 'Kolonial', ssec: 'saucer', u: 'g', size: 230, label: '1 glas', unit: 'glas', plural: 'glas', price: 11, where: 'Alle', life: '1 år', open: 'Se etiketten, typisk 1-2 uger' },
  hvidloegsdressing: { n: 'Hvidløgsdressing', sec: 'Kolonial', ssec: 'saucer', u: 'ml', size: 500, label: '1 flaske', unit: 'flaske', plural: 'flasker', price: 15, where: 'Alle', life: '3-6 mdr.', open: 'Se etiketten' },
  burgerdressing: { n: 'Burgerdressing', sec: 'Kolonial', ssec: 'saucer', u: 'pack', size: 1, label: '1 flaske', unit: 'flaske', plural: 'flasker', price: 24, where: 'Netto / Rema', life: '6-12 mdr.', open: '4 uger i køl' },
  pickles: { n: 'Syltede agurkeskiver (burgeragurker)', sec: 'Kolonial', ssec: 'saucer', u: 'pack', size: 1, label: '1 glas', unit: 'glas', plural: 'glas', price: 15, where: 'Alle', life: '1-2 år', open: '1-2 mdr. i køl' },
  jalapenos: { n: 'Syltede jalapeños', sec: 'Kolonial', ssec: 'saucer', u: 'pack', size: 1, label: '1 glas', unit: 'glas', plural: 'glas', price: 9, where: 'Rema / Netto', opt: true, life: '1-2 år', open: '1 md. i køl' },
  mayo: { n: 'Mayonnaise', sec: 'Kolonial', ssec: 'saucer', u: 'pack', size: 1, label: '1 tube', unit: 'tube', plural: 'tuber', price: 12, where: 'Alle', opt: true, life: '6-12 mdr.', open: '1-2 mdr. i køl' },
  // Brød
  tortillas: { n: 'Hvedetortillas', sec: 'Brød', ssec: 'toer', u: 'stk', size: 8, label: '8 stk (20 cm)', unit: 'pose', plural: 'poser', price: 11, where: 'Rema / Netto', life: '2-3 mdr.', open: '1 uge. Frys resten, de tør op på 1 min' },
  naan: { n: 'Naanbrød', sec: 'Brød', ssec: 'toer', u: 'pack', size: 1, label: '1 pakke, 260 g', unit: 'pakke', plural: 'pakker', price: 12, where: 'Rema', alt: 'tortillas fra Lidl/Netto', opt: true, life: '1-2 uger', open: 'Frys dem, 3 mdr.' },
  // Basis: købes én gang, holder i ugevis
  salt: { n: 'Salt', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 kg', unit: 'pakke', plural: 'pakker', price: 5, where: 'Alle', life: 'Evigt', open: 'Evigt, tørt' },
  olie: { n: 'Rapsolie', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 L', unit: 'flaske', plural: 'flasker', price: 20, where: 'Alle', life: '1-2 år', open: '6 mdr., mørkt sted' },
  peber: { n: 'Sort peber', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 bøtte', unit: 'bøtte', plural: 'bøtter', price: 12, where: 'Alle', life: '2-3 år', open: '1 år' },
  hvidloegspulver: { n: 'Hvidløgspulver', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 bøtte', unit: 'bøtte', plural: 'bøtter', price: 12, where: 'Alle', life: '2-3 år', open: '1 år med fuld smag' },
  paprika: { n: 'Paprika', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 bøtte', unit: 'bøtte', plural: 'bøtter', price: 10, where: 'Alle', life: '2-3 år', open: '1 år med fuld smag' },
  oregano: { n: 'Oregano eller italienske krydderurter', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 bøtte', unit: 'bøtte', plural: 'bøtter', price: 10, where: 'Alle', life: '2 år', open: '1 år med fuld smag' },
  hoensebouillon: { n: 'Hønsebouillon', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 pakke terninger', unit: 'pakke', plural: 'pakker', price: 10, where: 'Alle', life: '1-2 år', open: '1 år, tørt' },
  oksebouillon: { n: 'Oksebouillon', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 pakke terninger', unit: 'pakke', plural: 'pakker', price: 10, where: 'Alle', life: '1-2 år', open: '1 år, tørt' },
  majsstivelse: { n: 'Majsstivelse (Maizena)', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '400 g', unit: 'pakke', plural: 'pakker', price: 12, where: 'Alle', life: 'Årevis', open: 'Årevis, tørt og lukket' },
  bagepulver: { n: 'Bagepulver', sec: 'Basis', ssec: 'basis', staple: true, u: 'pack', size: 1, label: '1 pakke', unit: 'pakke', plural: 'pakker', price: 8, where: 'Alle', life: '1-2 år', open: '6 mdr., tørt' },
  soja: { n: 'Sojasauce', sec: 'Basis', ssec: 'saucer', staple: true, u: 'pack', size: 1, label: '1 flaske', unit: 'flaske', plural: 'flasker', price: 11, where: 'Alle / Asian Market', life: '2-3 år', open: '1 år' },
  honning: { n: 'Honning', sec: 'Basis', ssec: 'saucer', staple: true, u: 'pack', size: 1, label: '1 glas', unit: 'glas', plural: 'glas', price: 19, where: 'Alle', life: 'Årevis', open: 'Årevis, ikke i køl' },
  ketchup: { n: 'Ketchup', sec: 'Basis', ssec: 'saucer', staple: true, u: 'pack', size: 1, label: '1 flaske', unit: 'flaske', plural: 'flasker', price: 9, where: 'Alle', life: '1 år', open: '1-2 mdr. i køl' },
  eddike: { n: 'Eddike (lagereddike)', sec: 'Basis', ssec: 'saucer', staple: true, u: 'pack', size: 1, label: '1 flaske', unit: 'flaske', plural: 'flasker', price: 8, where: 'Alle', life: 'Årevis', open: 'Årevis' },
  sennep: { n: 'Sennep', sec: 'Basis', ssec: 'saucer', staple: true, u: 'pack', size: 1, label: '1 tube', unit: 'tube', plural: 'tuber', price: 10, where: 'Alle', life: '1 år', open: '3 mdr. i køl' },
  smoer: { n: 'Smør', sec: 'Basis', ssec: 'koel', staple: true, u: 'g', size: 200, label: '200 g', unit: 'pakke', plural: 'pakker', price: 10, where: 'Alle', life: '2-3 mdr.', open: '1 md. i køl' },
  chilisauce: { n: 'Sriracha / stærk chilisauce', sec: 'Basis', ssec: 'saucer', staple: true, u: 'pack', size: 1, label: '1 flaske', unit: 'flaske', plural: 'flasker', price: 10, where: 'Rema (Lidl på tilbud)', life: '1-2 år', open: '6+ mdr., helst i køl', tip: 'Dækker både buffalo og den koreanske sauce. Køb den, hvis du kun vil have én chilisauce.' },
  gochujang: { n: 'Gochujang', sec: 'Basis', ssec: 'saucer', staple: true, opt: true, u: 'pack', size: 1, label: '1 bøtte', unit: 'bøtte', plural: 'bøtter', price: 35, where: 'Asian Market', alt: 'chilisauce + lidt honning', life: '1-2 år', open: '1 år i køl', tip: 'Findes ikke i Netto, Rema eller Lidl. Spring den over og brug chilisauce + lidt ekstra honning.' },
  sesam: { n: 'Sesamfrø', sec: 'Basis', ssec: 'basis', staple: true, opt: true, u: 'pack', size: 1, label: '1 pose', unit: 'pose', plural: 'poser', price: 12, where: 'Alle / Asian Market', life: '1 år', open: '6 mdr.' },
  // Udstyr
  glasbokse: { n: 'Ovnfaste glasbokse med låg', sec: 'Udstyr', ssec: 'udstyr', gear: true, opt: true, u: 'stk', size: 2, label: '2 stk', unit: 'sæt', plural: 'sæt', price: 40, where: 'Lidl / Netto', life: 'Årevis', open: 'Glasset tåler airfryer, plastlåget kun mikro' },
};

// Starter list sections, in order. key = PRODUCTS[id].ssec.
export const STARTER_SECS = [
  { key: 'koel', sec: 'Kød, ost og mejeri (købes friskt hver uge)', note: 'Ikke noget at hamstre. Køb til den uge, du skal bruge det. Kan du ikke nå at lave mad inden datoen, så frys kødet samme dag.' },
  { key: 'frost', sec: 'Frost', note: 'Fryseren er din bedste ven. Alt her holder i månedsvis.' },
  { key: 'groent', sec: 'Grønt', note: 'Løg holder længe i et mørkt skab, ikke i køleskabet.' },
  { key: 'toer', sec: 'Tørvarer og dåser', note: 'Holder i et år eller mere i skabet.' },
  { key: 'saucer', sec: 'Saucer og glas', note: 'Uåbnet holder de i månedsvis. Efter åbning skal de i køleskabet.' },
  { key: 'basis', sec: 'Krydderier og basis', note: 'Købes én gang, holder til mange uger.' },
  { key: 'udstyr', sec: 'Udstyr', note: 'Har du det allerede, så spring over.' },
];

// ---------- recipes (CORE + POOL), new products and photos
import { CORE } from './recipes/core.mjs';
import { POOL, POOL_PRODUCTS } from './recipes/index.mjs';
let IMAGES = {};
try { ({ IMAGES } = await import('./images.mjs')); } catch (e) { IMAGES = {}; }
export { IMAGES };

export const PRODUCTS = { ...CORE_PRODUCTS, ...POOL_PRODUCTS };
for (const p of Object.values(PRODUCTS)) if (!p.ssec) p.ssec = p.staple ? 'basis' : p.sec === 'Kød og køl' ? 'koel' : p.sec === 'Frost' ? 'frost' : p.sec === 'Frugt og grønt' ? 'groent' : 'toer';
export const PANTRY_IDS = Object.keys(PRODUCTS).filter((id) => PRODUCTS[id].staple);
// Pantry as the page renders it ("Basisvarer").
export const PANTRY = PANTRY_IDS.map((id) => {
  const p = PRODUCTS[id];
  return { id, n: p.n, label: p.label, unit: p.unit, plural: p.plural, price: p.price, where: p.where, alt: p.alt, opt: p.opt };
});
export const RECIPES = [...CORE, ...POOL].map((r) => (IMAGES && IMAGES[r.id] ? { ...r, img: IMAGES[r.id] } : { ...r }));
export { DEFAULT_MEALS, MINCE } from './engine.mjs';
