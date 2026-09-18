# Cookietjek

Måler om en dansk hjemmeside sætter analyse- og markedsføringstracking i gang,
før den besøgende har trykket på noget. Bygger en rapport på dansk du kan sende
til virksomheden.

Værktøjet er markedsføringen. Rettelsen er produktet.

- **Hvad og hvorfor:** `SPEC.md`
- **Hvordan du sælger det, med færdige mails på dansk:** `FIRST-SALE.md`
- **Hvorfor netop den her idé:** `research/SHORTLIST.md` og `research/research-notes.md`

---

## Kom i gang

Kræver Node 20 eller nyere.

```bash
cd cookietjek
npm install
npx playwright install chromium    # engangsdownload, ca. 150 MB
npm test                           # 13 tests, koerer mod lokale fixtures
```

Ligger der allerede en Chromium på maskinen, kan du pege på den i stedet for at
hente en ny:

```bash
export COOKIETJEK_CHROMIUM=/sti/til/chrome
```

Udfyld til sidst `config.mjs` med din mail, dit telefonnummer og din
deploy-URL. Det er **det eneste sted** de står, og de bliver flettet ind i både
landingssiden og alle rapporter, når du kører `npm run build`.

## Sådan bruges det

```bash
# Scan et enkelt domaene
npm run scan -- eksempel.dk

# Scan en hel liste
cp data/prospects.example.txt data/prospects.txt   # og skriv dine egne ind
npm run scan -- --file data/prospects.txt

# Byg rapportsider ud fra scanningerne
npm run report -- eksempel.dk
npm run report -- --alle
```

Scanneren kører ét domæne ad gangen med to sekunders pause. Det er med vilje,
det er andre folks servere. `--delay 5000` hvis du vil være ekstra pæn.

Resultatet:

```
out/eksempel.dk/scan.json            raadata
out/eksempel.dk/skaermbillede.png
site/index.html                      din landingsside
site/rapport/eksempel.dk/index.html  rapporten du linker til i mailen
```

### Hvad scanneren leder efter

| Fund | Betyder |
|---|---|
| `TRACKING_FOER_SAMTYKKE` | Kendte analyse- eller markedsføringsleverandører gik i gang uden at der blev klikket. Den stærke sag. |
| `INGEN_AFVIS_KNAP` | Der er en accepter-knap i bonnen, men ingen tilsvarende afvis-mulighed i samme trin. Et indstillinger-link tæller ikke. |
| `INGEN_BANNER` | Tracking kørte, og der blev ikke fundet nogen cookieboks. |
| `INTET_FUNDET` | Intet at bemærke. Skriv ikke til dem. |

Leverandør- og cookielisterne ligger i `lib/trackers.mjs` og er med vilje
konservative. Et falsk positivt fund i en salgsmail koster langt mere end et
fund man går glip af.

## Ærlighedsreglen

**Rapporten påstår aldrig at nogen bryder loven.** Den siger hvad der blev
målt, og viser skærmbilledet. Én automatisk sideindlæsning kan ikke afgøre om
noget er ulovligt, og en måling er alligevel meget sværere at diskutere med end
en anklage.

Der er en test der håndhæver det: rapporten må ikke indeholde ordene "ulovlig",
"overtræder" eller "bøde". Fjern ikke den test.

Hver rapport har et synligt afsnit om hvad målingen **ikke** kan se, og en
opfordring til selv at åbne udviklerværktøjerne og tjekke efter.

## Deploy

`site/` er rene statiske filer. Ingen server, ingen database, intet byggetrin
ud over at flette `config.mjs` ind i siderne.

Byg først, så dine kontaktoplysninger og priser står rigtigt:

```bash
npm run build
```

Vælg så en. Alle tre er gratis og tager under et minut første gang:

```bash
npm run deploy:cloudflare    # Cloudflare Pages
npm run deploy:netlify       # Netlify
npm run deploy:vercel        # Vercel
```

Første gang beder værktøjet dig logge ind i browseren. Bagefter får du en URL.

Sæt derefter `site.baseUrl` i `config.mjs` til den URL du fik, og kør
`npm run report -- --alle`, så linkene i rapporterne peger rigtigt.

> **Kan ikke deployes fra en Claude Code web-session.** Miljøets netværkspolitik
> blokerer udgående forbindelser til vercel.com, netlify.com, cloudflare.com og
> pages.dev, alle med 403 fra proxyen. Deploy skal derfor køres fra din egen
> maskine. Det er et enkelt kald, se ovenfor.

Rapporterne har `noindex, nofollow`. De skal ikke kunne googles, kun deles med
den virksomhed de handler om.

### GitHub Pages, hvis du hellere vil den vej

Virker, men den løser kun landingssiden. **Rapporter må aldrig i et offentligt
repo**, fordi et offentligt git-repo viser alle filer, og rapportmappen ville
så blive en offentligt læsbar liste over hvilke danske virksomheder du har
scannet og hvad du fandt hos dem. `noindex` hjælper ikke på det.

Der er en spærre i `publish-pages.mjs` som nægter at sende andet end
landingssiden. Lav den ikke om.

1. Opret et **offentligt** repo på github.com, fx `cookietjek`. Tomt, uden
   README.
2. Udgiv landingssiden:
   ```bash
   npm run publish:pages -- https://github.com/DITBRUGERNAVN/cookietjek.git
   ```
   Kør med `--dry` først hvis du vil se hvad der ville blive sendt.
3. Slå Pages til: **Settings -> Pages -> Deploy from a branch -> main / (root)**.
   Efter et minut ligger siden på `https://DITBRUGERNAVN.github.io/cookietjek/`.

Du skal stadig bruge en rigtig host til rapporterne. Cloudflare Pages ovenfor
klarer begge dele på én gang, så hvis du kun gider sætte ét sted op, så tag den.

### Et domæne, hvis du vil se mere professionel ud

Et `.dk`-domæne koster omkring 50 kr om året. Det er ikke nødvendigt for det
første salg, men et link på dit eget domæne i en salgsmail ser markant bedre ud
end et `.pages.dev`. Vent til efter kunde nummer et, så har den betalt for sig
selv mange gange.

## Få den første kunde

Den fulde plan med færdige mails ligger i `FIRST-SALE.md`. Kort udgave:

1. Scan 40 domæner. Det tager en aften, og computeren gør arbejdet.
2. Smid alle `INTET_FUNDET` væk. Du skriver kun til dem hvor der er noget konkret.
3. Byg rapporterne, deploy, og send linket til en navngiven person. Aldrig info@.
4. 10 mails om dagen, ikke 100. To opfølgninger.
5. Realistisk mål: 40 scannet, 15-20 med fund, 3-5 samtaler, **1 kunde, 1.800 kr.**

Faktura med dit CPR-nummer hvor CVR ellers ville stå, ingen moms,
bankoverførsel, og læg beløbet på forskudsopgørelsen som B-indkomst. Du skal
ikke registrere noget for det første salg.

## Hvad der skal bygges næste gang, men kun hvis det sælger

Ingen af de her ting er værd at bygge før nogen har betalt. Rækkefølge efter
hvornår de holder op med at være spild af tid:

- **Efter kunde 1:** en `--foer-efter` tilstand der lægger to scanninger ved
  siden af hinanden i én rapport. Det er dokumentationen kunden faktisk vil
  have, og lige nu laver du den i hånden.
- **Efter kunde 3:** scan undersider, ikke kun forsiden. Kurv og kassen er ofte
  værre end forsiden, og det er et oplagt mersalg.
- **Efter kunde 5:** gentest hver 6. måned til 400 kr. Automatisér kørslen og
  send en mail hvis noget er ændret. Det er det første tilbagevendende beløb.
- **Efter kunde 10, og ikke før:** en selvbetjeningsscanner på sitet hvor folk
  selv taster deres domæne. Det kræver en hostet browser, hvilket koster penge
  og inviterer til misbrug. Byg det når der er indtægter til at betale for det.

Ting jeg bevidst **ikke** har bygget, og hvorfor, står i `SPEC.md` under
"Explicitly out of scope".

## Test

```bash
npm test
```

17 tests mod tre lokale fixtures i `fixtures/`: en fejlkonfigureret side, en
korrekt opsat side, og en uden banner overhovedet. Ingen netværksadgang
nødvendig. Vil du se dem i browseren:

```bash
npm run fixtures     # http://127.0.0.1:8787/daarlig/
```
