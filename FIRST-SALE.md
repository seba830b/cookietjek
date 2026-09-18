# Vejen til det første salg

Konkret plan. Hvor kunden findes, hvad der bliver sagt, hvad de ser.

---

## 1. Hvor den første kunde findes

Rækkefølge efter hvad der konverterer bedst pr. time brugt. Varm kontakt
konverterer 20-45 procent, kold e-mail 3-8 procent, og gennemsnitlig kold
e-mail lander på 3,43 procent svar i 2026. Så start varmt.

### Lag 1, varmt, dag 1 (5-10 navne)
Alle du allerede kender som ejer eller arbejder i en virksomhed med en
hjemmeside. Forældre til venner, din frisør, den lokale cafe, klubben du har
spillet i, dit gymnasiums administration. Du skal ikke sælge til dem. Du skal
sige "jeg har bygget et værktøj, må jeg teste det på jeres side og vise dig
hvad det finder?" Det er en helt anden samtale, og den ender ofte med en
betalende kunde eller en henvisning.

### Lag 2, kvalificeret koldt (30-60 domæner)
Du vil have virksomheder der **allerede har tracking installeret** og
**allerede bruger penge på at se ordentlige ud**. To offentlige kilder:

- **e-mærket.** Virksomheder der har betalt for et tillidsmærke er per
  definition virksomheder der går op i at fremstå lovlige. De har også
  garanteret Meta Pixel og Google Analytics. https://www.emaerket.dk
- **Trustpilot Danmark**, kategorisider. Samme logik, offentlige lister af
  aktive danske webshops.

Filtrer hårdt: spring de helt store over, de har et bureau. Spring de helt
døde over, de har ingen penge. Du vil have 2-20 ansatte.

### Lag 3, lokalt fysisk (Svendborg og Sydfyn)
Det her er din reelle fordel og ingen offshore-konkurrent har den. En
studerende der møder op med et skærmbillede er funktionelt varm kontakt, ikke
kold. 20 butikker, klinikker og restauranter i gåafstand. Se `research-notes.md`
for hvorfor "jeg laver en hjemmeside til dig" ikke virker her (WebDynamic
sælger fra 3.499 kr i Svendborg), men "din cookieboks virker ikke" er noget
helt andet, fordi det er en fejl de ikke vidste de havde.

### Hvad du IKKE gør
Ikke Fiverr. Ikke Upwork. Ikke massemail. Ved 0,215 procent kold konvertering
skal der cirka 465 mails til ét salg, og du har nogle få timer om ugen.

---

## 2. Rækkefølgen i praksis

1. Kør `npm run scan` på 40 domæner. Tager en aften, computeren gør arbejdet.
2. Smid alt væk hvor der ikke blev fundet noget. Du skriver kun til dem hvor
   scanningen viser noget konkret. Det er hele pointen.
3. Byg rapporterne, deploy sitet.
4. Find navn og direkte mail på en rigtig person. Aldrig info@.
5. Send. 10 om dagen, ikke 100.
6. Følg op to gange. Tre eller flere opfølgninger hæver svarsandsynligheden
   med op til 90 procent, og de fleste giver op efter nul.

---

## 3. Mail 1, når trackere fyrer før samtykke

Det er den stærke variant. Brug den når scanningen fandt
`TRACKING_FOER_SAMTYKKE`.

> **Emne:** google analytics kører på [domæne].dk før man trykker accepter
>
> Hej [Fornavn]
>
> Jeg hedder Caustic og er studerende i Svendborg. Jeg har bygget et lille
> værktøj der måler hvad danske hjemmesider sætter i gang, før brugeren har
> trykket på noget i cookiebonnen.
>
> Jeg kørte det på [domæne].dk i går. Den fandt [N] ting der starter med det
> samme, blandt andet [tracker 1] og [tracker 2]. Skærmbillede og hele
> målingen ligger her:
>
> [link til rapporten]
>
> Det er ikke noget I har gjort med vilje. Det er næsten altid en
> fejlindstilling i selve cookieværktøjet, og jeg finder det på omkring
> halvdelen af de sider jeg tester. Datatilsynet har skrevet at netop det her,
> om man reelt kan afvise, er noget de ser på i 2026.
>
> Jeg retter det for 1.800 kr. Det tager typisk en time eller to, og I får en
> ny måling bagefter der viser før og efter, som I kan gemme som dokumentation.
>
> Skal jeg sende et tilbud?
>
> Venlig hilsen
> Caustic
> [tlf] · [mail]

**Hvorfor den er skruet sådan sammen.** Emnefeltet er småt skrevet og
konkret, ikke en overskrift. Beviset kommer før prisen. "Det er ikke noget I
har gjort med vilje" fjerner forsvarsrefleksen med det samme, og det er sandt.
Prisen står i mailen, så de ikke skal booke et møde for at finde ud af om de
har råd. Afslutningen er et lille ja, ikke et stort.

**Bemærk hvad der ikke står.** Ingen bødestørrelser. Ingen påstand om at de
overtræder loven. Se honesty-reglen i `SPEC.md`. Du sælger en måling og en
rettelse, ikke frygt, og du kan ikke dokumentere en lovovertrædelse ud fra én
automatisk sideindlæsning.

---

## 4. Mail 2, når der ikke er nogen afvis-knap

Brug den når scanningen fandt `INGEN_AFVIS_KNAP`. Svagere sag, lavere pris.

> **Emne:** cookiebonnen på [domæne].dk mangler en afvis-knap
>
> Hej [Fornavn]
>
> Jeg hedder Caustic, studerende i Svendborg. Jeg måler danske hjemmesiders
> cookieopsætning med et værktøj jeg har bygget.
>
> På [domæne].dk kan man trykke "accepter" med det samme, men der er ingen
> tilsvarende mulighed for at afvise i første trin. Skærmbillede her:
>
> [link til rapporten]
>
> Datatilsynet har i en principiel afgørelse slået fast at det skal være lige
> så nemt at afvise som at acceptere. Det er en indstilling i cookieværktøjet,
> ikke noget der kræver at siden bygges om.
>
> Jeg retter det for 1.200 kr, typisk på under en time.
>
> Vil du have et tilbud?
>
> Venlig hilsen
> Caustic
> [tlf] · [mail]

---

## 5. Opfølgning 1, efter 4 hverdage

Samme tråd, svar på din egen mail. Kort.

> Hej [Fornavn]
>
> Følger lige op. Rapporten ligger her hvis den er forsvundet i indbakken:
> [link]
>
> Hvis I allerede har nogen på det, så sig endelig til, så lader jeg være med
> at skrive igen.
>
> Caustic

Den sidste sætning gør to ting: den giver dem en nem udvej, hvilket paradoksalt
nok får flere til at svare, og den betyder at du aldrig bliver spam.

---

## 6. Opfølgning 2, efter 10 hverdage, sidste

> Hej [Fornavn]
>
> Jeg lukker den her hos mig. Rapporten bliver liggende på linket et par
> måneder endnu, hvis det bliver aktuelt: [link]
>
> Held og lykke med [firmanavn].
>
> Caustic

Derefter skriver du ikke mere. Nogle af dem vender tilbage om tre måneder.

---

## 7. Hvis de ringer eller svarer ja

Sig ikke ja til at "kigge på det hele". Hold det til den ene ting du solgte.

- **"Hvad koster det så løbende?"** Ingenting. Det er en engangsrettelse. Hvis
  de spørger af sig selv, kan du tilbyde en gentest hver 6. måned til 400 kr,
  men foreslå det ikke først.
- **"Kan du ikke også lige..."** Ja, men som en separat opgave med sin egen
  pris. Skriv den ned, send et nyt tilbud. Det er sådan 1.800 kr bliver til
  8.000 kr over et år.
- **"Hvorfor skal jeg tro på en studerende?"** Det ærlige svar virker: "Det
  skal du heller ikke. Målingen ligger på linket, og du kan selv åbne
  udviklerværktøjerne i Chrome og se det samme. Jeg er billig fordi jeg er
  studerende, og jeg er hurtig fordi jeg har automatiseret målingen."
- **Prisdiskussion.** Gå ikke under 1.200 kr. Danske juniorer fakturerer
  550-900 kr i timen. Under cirka 400 kr i timen signalerer du inkompetence,
  ikke et godt tilbud.

---

## 8. Betaling for det første salg

Simpelt og lovligt, uden at registrere noget:

1. Send en PDF-faktura med dit navn og adresse, **dit CPR-nummer der hvor en
   virksomhed ville skrive CVR**, kundens navn og adresse, fakturanummer,
   dato, beskrivelse af arbejdet, beløb, og dine bankoplysninger.
2. Skriv eksplicit: **"Ikke momsregistreret, der opkræves ikke moms."**
3. De overfører til din konto.
4. Læg det forventede beløb på din forskudsopgørelse som B-indkomst. Sæt
   30-50 procent til side til skat og AM-bidrag.
5. Gem fakturaen i 5 år.

Grænsen på 50.000 kr er **momsregistreringsgrænsen** over 12 rullende måneder,
ikke en fribeløbsgrænse. Se `research/research-notes.md`. Brug ikke privat MobilePay
til det her, det er i strid med deres betingelser.

---

## 9. Hvad "godt nok" ser ud som

- 40 domæner scannet
- 15-20 med et konkret fund
- 15-20 mails sendt over to uger, med to opfølgninger
- Ved 15-25 procent svar på personlig, specifik outreach: 3-5 samtaler
- **1 kunde. 1.800 kr.**

Det er målet. Ikke en forretning endnu, men det er beviset på at nogen betaler,
og det er den eneste information der er noget værd på det her tidspunkt.
