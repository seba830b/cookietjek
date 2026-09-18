# Raw research notes, phase 1

Own verification pass. Agent briefs are folded into `SHORTLIST.md`. This file
is the scratch evidence log so nothing gets re-researched later.

Everything dated 2026-09-17.

## EVIDENCE QUALITY WARNING, read before trusting anything here

This session's network policy blocks direct page fetches. Nearly every domain
answered 403 at the proxy, including skat.dk, retsinformation.dk, sik.dk,
danskerhverv.dk, dst.dk, webaim.org and deque.com. Web search worked, direct
reading of pages did not.

So: the URLs below are real and are the right pages, but almost nothing here
was read first-hand. It is search-engine summaries of those pages. Search
summaries routinely garble numbers and conflate thresholds. Treat every figure
as a lead to verify, not as a fact. Anything that gates a real decision
(tax, SU, whether a platform accepts you) should be checked against the live
page or by phone before you act on it.

## Danish legal / money plumbing

- CORRECTION to an earlier note in this file's history. I first wrote that a
  CVR number is required above 50.000 DKK/year. That conflates two things.
  The 50.000 DKK figure is the **VAT registration threshold**
  (momsregistreringsgrænsen), measured on turnover over a rolling 12 months,
  not a calendar year, and you must register within 8 days of exceeding it,
  or earlier if you can already see you will cross it.
  The duty to register a *business* is a separate judgement call about
  whether you are running erhvervsmæssig virksomhed, judged on regularity,
  intensity, profit motive and economic risk. A few one-off jobs a year looks
  like honorar. A running dev-for-hire operation with recurring clients looks
  like a business even at low turnover.
  https://virksomhedsguiden.dk/content/ydelser/saadan-bliver-du-momsregistreret/a61b0838-9f45-4404-b8de-714d1dedb9f9/
  https://info.skat.dk/data.aspx?oid=2083457
- Honorar / B-indkomst is a real third category in Danish tax law, separate
  from employment and from self-employment. Taxed net, but a deficit cannot be
  offset against other income. No tax-free threshold, taxable from krone one,
  and the 8 percent AM-bidrag is not covered by personfradrag.
  https://skat.dk/borger/unge-og-studerende/job/honorarindtaegt
  https://info.skat.dk/data.aspx?oid=1976769
- Invoicing as a private person: write your CPR number where a business writes
  CVR, charge no VAT, state explicitly that you are not VAT registered. If the
  payer is a business they report the gross amount to SKAT against your CPR.
  https://skat.dk/borger/unge-og-studerende/job/honorarindtaegt
- PMV (Personligt ejet Mindre Virksomhed) is the useful middle step. Free,
  registered on virk.dk, gives you a real CVR number for credibility and for
  payment platforms, but no ongoing VAT and tax reporting. Conditions: under
  50.000 DKK turnover per 12 months, one owner, no employees, no trade outside
  the EU, and it must be renewed every 3 years.
  https://erhvervsstyrelsen.dk/personligt-ejede-virksomheder
  https://skat.dk/erhverv/egen-virksomhed/er-en-personligt-ejet-mindre-virksomhed-noget-for-dig
- SU fribelob matters and is not a monthly cap, the monthly amounts sum to an
  annual allowance. Reported 2026 figure for videregaaende uddannelse is
  20.749 DKK/month, roughly 249.000 DKK/year. RE-CHECK on su.dk, SU rates
  change every year. Important detail: for your own business it is the
  **profit** that counts toward egenindkomst, not turnover, whereas for a
  salary the gross counts. That makes operating as a business more favourable
  near the ceiling.
  https://www.su.dk/satser
  https://www.su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/saadan-beregner-du-din-indkomst/indkomst-fra-egen-virksomhed
- MobilePay: the private app's terms **prohibit** receiving business payments.
  MyShop and Business both require a CVR and a business bank account. Common
  to ignore, still a terms breach, so do not build on it.
  https://vippsmobilepay.com/terms-and-conditions/dk/private-user
- Stripe supports Denmark, but whether a Danish individual with no CVR can
  onboard was NOT verified. Two minutes in the signup flow settles it.
  https://stripe.com/global
- LOWEST FRICTION PATH TO A FIRST 500 DKK: register nothing, send a PDF
  invoice with your CPR number and bank details, get paid by bank transfer,
  put the expected B-income on your forskudsopgorelse, keep the paperwork 5
  years. Zero cost, no platform terms to breach, no permission needed.
- Invoice must carry: CVR (if you have one), customer name and address,
  sequential invoice number, date, description, amount ex VAT, VAT, total,
  payment terms.
  https://ansogningshjaelpen.dk/fakturering-som-freelancer-komplet-guide/
- For digital products sold internationally, Lemon Squeezy is Merchant of
  Record and handles EU VAT for you. Gumroad is not MoR but still collects and
  remits EU/UK VAT on digital goods. Both accept individual sellers.
  https://www.lemonsqueezy.com/reporting/merchant-of-record
  https://gumroad.com/help/article/10-dealing-with-vat

## Danish price levels (what the market actually pays)

- Freelance web dev in DK: 600-1.000 DKK/hour. Agencies 900-1.500 DKK/hour.
  https://webkonsulent.com/artikler/hvad-koster-hjemmeside-danmark
- Simple 3-5 page website: 5.000-10.000 DKK with a freelancer, 10.000-25.000
  with an agency.
  https://hjemmesiderogmarketing.dk/hvad-koster-en-hjemmeside-i-danmark/
- CRITICAL LOCAL DATA POINT: WebDynamic already advertises websites for
  Svendborg / Sydfyn businesses from 3.499 DKK. Nord Mediedesign explicitly
  covers Svendborg and will meet in person. Advertime and Uptime are both
  Svendborg marketing shops. The "cheap local website" lane on his home turf
  is already occupied by real companies.
  https://webdynamic.dk/blog/webbureau-svendborg
  https://nordmediedesign.dk/ , https://advertime.dk/ , https://uptime.dk/
- Implication: one small paid job is 5-20x the 500 DKK goal. The bottleneck is
  never the price, it is finding a buyer who says yes.

## Danish compliance waves (possible wedges)

- Digital bookkeeping: from 1 Jan 2026, personally owned businesses and
  foreninger with net turnover above 300.000 DKK for two consecutive years
  must use a digital bookkeeping system and keep records digitally 5 years.
  https://www.danskerhverv.dk/presse-og-nyheder/nyheder/2025/april/digital-bogforing-bliver-ogsa-obligatorisk-for-personligt-ejede-virksomheder-og-for-eninger-fra-1.-januar-2026
  Verdict: real deadline, but the demand is captured by Dinero, Billy,
  e-conomic and accountants. No solo-dev wedge.
- E-invoicing / NemHandel / Peppol, and the EU ViDA timeline pushing a full
  B2B e-invoicing mandate around 2027-2030.
  https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/467108882/eInvoicing+in+Denmark
  Verdict: too far out and too infrastructural for a student.
- Tilgængelighedsloven / European Accessibility Act: in force in DK since
  28 June 2025, supervised by Sikkerhedsstyrelsen, applies to e-commerce
  services to consumers, WCAG 2.1 AA, fines reported around 50.000 DKK per
  violation. 2026 is the first full enforcement year.
  https://www.danskerhverv.dk/presse-og-nyheder/nyheder/2024/december/nye-vejledninger-fra-sikkerhedsstyrelsen-her-er-kravene-til--ttilgangelighedsloven-for-webshops/
  https://www.sik.dk/erhverv/produkter/generel-produktsikkerhed/love-og-regler/der-kommer-nye-krav-om-tilgaengelighed-produkter-og-tjenester
  OPEN QUESTIONS sent to a verification agent: the microenterprise exemption
  (under 10 employees AND under 2 mio EUR), and the claim that existing sites
  have until 28 June 2030. Both could gut the urgency.

## Ideas checked and killed

- Foreninger membership/kontingent SaaS. Dead. Conventus is free via
  municipalities, Foreningsstyring from 100 DKK/md, ForeningsAdministrator
  from 69 DKK/md, Klubmodul, Holdsport, ForeningLet all exist.
  https://foreningsstyring.dk/artikler/bedste-foreningssystemer-danmark-2026
- Webshop product feeds to Pricerunner/Prisjagt/Google Shopping. Dead.
  DanDomain and Shoporama ship this natively, Avecdo covers the rest.
  https://webshop-help.dandomain.dk/produkt-feeds/
- Danish media monitoring as a cheap Infomedia/Retriever alternative. Killed
  on two grounds: the low end already exists (overskrift.dk, MyPressWire,
  Hypefactors), and reselling Danish news content runs straight into press
  publishers' rights, which is precisely the licensing business Infomedia is.
  https://www.overskrift.dk/ydelser/overvaagning-af-sociale-medier
  https://mypresswire.com/dk/services/mediamonitoring
- Lead lists built on free CVR open data. Not dead but crowded: the data is
  CC BY 4.0 and free, and at least four Danes already built on it
  (cvrintel.dk, leadlist.dk, datacvrapi.dk, cvr.dev). Free data is not a moat
  when the data is free for everyone.
  https://erhvervsstyrelsen.dk/hent-oplysninger-fra-cvr
- Selling MCP servers / Claude Code plugins. Reported that under 5 percent of
  12.000+ published MCP servers have monetized at all. Hot space, no proven
  willingness to pay yet.
  https://godberrystudios.com/posts/how-to-monetize-mcp-servers-2026/

## Cold-start mechanics (how first customers actually happen)

- Consistent across sources: generic mass cold outreach fails, 15 highly
  specific personal messages per week to people who visibly have the problem
  works. Expect 10-20 percent reply rate, so 50-100 contacts to get 10-15 real
  conversations.
  https://saasranger.com/blog/how-to-get-your-first-micro-saas-customers-6-channels-that-actually-worked/
- Order of channels that works for solo builders: people you already know,
  then niche communities (Reddit, Discord, Facebook groups), then public
  building, then search traffic much later.
  https://newsletter.marclou.com/p/how-to-get-your-1st-customer-for-a-micro-saas
- Danish channels worth trying: Amino Freelancer (task auctions), Worksome,
  Efektive, and Danish Facebook groups for selvstændige and iværksættere.
  https://www.amino.dk/freelancer/ , https://efektive.dk/
  https://www.facebook.com/groups/freelancere/

## Reference price points for products

- Fiverr Discord bot work: 60-380 USD per project is the normal band.
  https://www.fiverr.com/resources/guides/costs/discord-bot-developer
- BuiltByBit: 730.000+ members, 35.000+ products, 5,8 mio USD lifetime sales
  across the whole marketplace. That averages out to very little per product.
  Fee 9,9 percent. SpigotMC takes 0 percent.
  https://mclicense.org/blog/spigotmc-vs-polymart-vs-builtbybit
- n8n templates sell for roughly 29-299 USD, bundles 199-499 USD, but no
  verifiable seller earnings data was found.
  https://www.browseract.com/blog/how-to-make-money-with-n8n-workflow-automation

---

# Product-niche evidence (agent pass 2)

Same caveat: direct page fetches blocked, reddit.com is blocked to the search
crawler entirely, so anything sourced from Reddit is second-hand paraphrase
from SEO blogs and is close to worthless.

## Verified, public, checkable numbers

### BuiltByBit (Minecraft plugins) - best public sales data found anywhere
Purchase counts are displayed publicly on every listing. Real listings:

| Plugin | Price | Purchases | Implied lifetime gross |
|---|---|---|---|
| anti-crash/exploit plugin (#1 on BBB) | 19,99 USD | 4.174 | ~83.000 USD |
| Altar SMP All Arcs | 14,99-19,99 | 772 | ~12-15.000 USD |
| mineLogin | 15,00 | 723 | ~10.800 USD |
| Rival Harvester Hoes | 19,99 | 682 | ~13.600 USD |
| CrownStoreData | 14,99 | 265 | ~4.000 USD |
| ScriptedEssentials | 17,00 | 234 | ~4.000 USD |
| SMCConverter | 19,99 | 32 | ~640 USD |

Fees ~12,4 percent all-in (9,9 platform + gateway).
https://builtbybit.com/resources/minecraft/plugins/paid/
Counterweight, devs' own words: one reports ~100 USD in a year.
https://builtbybit.com/threads/does-anyone-actually-make-decent-money-making-plugins.714129/
COST: Spigot/Paper plugins are Java. Not his stack. A week of ramp-up, minimum.

### Apify Store - strongest stack fit found
- Pays out ~1,4 mio USD/month across ~3.000 community devs, so ~470
  USD/dev/month on average, heavily skewed.
  https://help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store
- Commission 20 percent of profit. Payouts on the 11th. PayPal minimum 20 USD.
  KYC required. Balances under the minimum for 12 months straight are forfeited.
  https://docs.apify.com/platform/actors/publishing/monetize
- EVERY store listing shows its total user count publicly. That is a free,
  real demand signal you can read before writing code. Top actors: Google Maps
  Scraper 571K users, Instagram 371K, TikTok 242K.
  https://apify.com/store
- Honest counterweight: most published actors have 0-5 users, power-law
  distribution, discovery favours incumbents. The named opening is platforms
  where the current leader has under 500 users.
  https://dev.to/agenthustler/the-apify-actor-survival-guide-why-99-of-scrapers-get-zero-users-and-how-to-fix-it-5eoh
- Why it fits: Python/JS native, Apify hosts and bills so no Stripe and no
  company needed, payout to DK via PayPal at a 20 USD floor, one actor is a
  genuine sub-20-hour build.

### Discord monetization - two different products, most blogs conflate them
- App Subscriptions / Premium Apps (bot developers): 85/15 in your favour on
  the first 1 mio USD, then 70/30. Available to devs in US, UK and **EU**, so
  Denmark qualifies. Requires a **verified** app owned by a Team, a privacy
  policy, and 100 USD earned before first payout.
  https://support-dev.discord.com/hc/en-us/articles/17299902720919-Premium-Apps-Payout
- Server Subscriptions / Server Shop (server owners): 90/10 but **requires a US
  bank account and US government ID. Denmark is excluded.**
  https://creator-support.discord.com/hc/en-us/articles/10423011974551-Server-Shop-For-Server-Owners-and-Admins
- Verification is a manual review, 1-3 weeks, and bots cannot exceed 100
  servers unverified. So Premium Apps is a month-3 milestone, not a launch plan.
- Real paying market, via public Patreon patron counts: Mudae 7.896 paid
  members, est. 14-61K USD/month. Dank Memer 582. Median bot: 0 USD.
  https://graphtreon.com/creator/mudae
- Freelance custom bots: 70-380 USD per project is the normal Fiverr band.
  https://www.fiverr.com/resources/guides/costs/discord-bot-developer

### Boring B2B automation - real dated live listings
- One-time scrape of Erli.pl seller list to Excel: **500 USD fixed**, posted
  29 Jun 2026.
  https://www.upwork.com/freelance-jobs/apply/One-time-scrape-Erli-full-seller-merchant-list-Excel-fields_~022071849834767810045/
- Fiverr OCR/PDF invoice extraction gig at 105 USD, live.
  https://www.fiverr.com/zirsha123/custom-digital-and-handwritten-ocr-scanned-documents-to-editable-form-invoices
- Live boards to watch: https://www.upwork.com/freelance-jobs/data-scraping/
  and https://www.fiverr.com/gigs/pdf-data-extraction

### Chrome extensions
- ExtensionPay handles payments with no backend and no upfront cost, open
  source. Best infra match to the free-tier constraint. https://extensionpay.com/
- Chrome Web Store shows user counts and review counts publicly on every
  listing, so same validate-before-building trick as Apify.
- Named earners exist (GMass ~130K USD/month) but the figures are from
  2019-2020, pre-Manifest V3. Treat as directional only.
  https://extensionpay.com/articles/browser-extensions-make-money

## Killed in this pass

- **Roblox.** Requires an active paid Premium subscription to use DevEx at all,
  which is upfront capital. 30.000 Robux (~114 USD) minimum cashout. Median
  DevEx payout in 2024 was 1.575 USD/year.
  https://create.roblox.com/docs/production/monetization/developer-exchange
- **Paradox mods.** No payment rail exists at all. Steam paid mods were pulled
  in 2015 after backlash. Donations only, which needs the audience he lacks.
  https://www.gamedeveloper.com/business/game-mods-can-now-be-sold-on-the-steam-workshop-for-real-money
- **RapidAPI.** Apify dominates it on payout terms, public demand signals and
  hosting. No reason to pick it.
- **Shopify apps.** Terms are genuinely great (keep 100 percent of first 1 mio
  USD from 2025) but this is a 12-18 month build, not 20 hours.
  https://shopify.dev/docs/apps/launch/distribution/revenue-share
- **Acquire.com sub-5k acquisitions.** No capital, and those listings are
  mostly dead assets.

## Sources to distrust

Nearly every "micro-SaaS revenue benchmark" and "Chrome extension revenue by
user count" page is an SEO content farm citing MicroConf without linking the
data, or inventing numbers outright. Named offenders: chromegoldmine.com,
nichecheck.com, 1xapi.com, editorialge.com, saasranger.com's benchmark post.
The directional claim that most indie SaaS earns under 1.000 USD MRR is
probably true. The precise percentages are not evidence.

---

# Danish market evidence (agent pass 3)

Same caveat, every Danish marketplace domain was blocked, so no live gig
listing was read. That is the single biggest hole: nobody in this research
chain has confirmed that a specific paid task exists on Amino, Giig or
Handyhand **today**. Check that yourself in a browser first.

## Danish channels, ranked by accessibility to someone with no track record

- **Handyhand.dk**. Danish TaskRabbit equivalent with a real IT category.
  Average price for IT problems **747,50 DKK**, most technical-support tasks
  get offers in the **700-1.750 DKK** band. Customer pays 13 percent capped at
  119 DKK, helper pays a level-dependent connection fee. **You can operate on
  a CPR number, no CVR needed**, and they encourage self-reporting to SKAT.
  https://handyhand.dk/it/hvad-koster-loesning-af-it-problemer/pris-data
  https://handyhand.dk/platform/hjaelp/hh/faktura-moms-gebyr/cvr-firma
  Honest read: this is consumer PC support at ~750 DKK a task, not software
  engineering. A cash and reputation bootstrap, not the business.
- **Amino Freelancer**. Denmark's largest entrepreneur forum, 280.000+
  entrepreneurs and self-employed. The freelance board is **free for both
  sides**, open tender with bidding, no platform payment in the middle.
  Best free no-gatekeeper Danish channel, and the audience is exactly the
  buyer profile. https://www.amino.dk/freelancer/
- **Giig.dk**. Small pond, roughly 200-300 Danish freelancers total across all
  categories. Payment goes direct, Giig does not intermediate. Low competition
  by headcount, but low buyer traffic is equally likely. Unproven.
  https://www.giig.dk/bliv-freelancer
- **Worksome**. Jobs must be at least 5.000 DKK, which is a good floor, but it
  has repositioned as enterprise external-workforce management. No evidence of
  a low-barrier tier. Weak lead for a beginner.
- **Ageras**. Lead-gen for accountants and bookkeepers, not developers.
  Dismiss as a channel. Its listed bookkeepers are a customer segment though.
- **Jobindex / SCR / freelancit / itkonsulentjobs**. Real, but senior
  enterprise consultant contracts, typically full-time multi-month. Not
  reachable on a few hours a week.
- **freelancer.dk, opgaver.dk, opgaveportalen**. No evidence these exist as
  functioning platforms. Do not plan around them.
- **Factofly** lets you invoice under *their* CVR: they project-employ you,
  settle VAT, tax, ATP, AM-bidrag and holiday pay, and take a fixed fee.
  No income floor or ceiling. Fee percentage NOT verified.
  https://www.factofly.com/konsulent/

## Danish rates, multiple independent sources broadly agreeing

| Segment | Rate |
|---|---|
| Danish agency / professional dev | 900-1.500 DKK/hr |
| Nearshore (PL, PT, Baltics) | 600-900 DKK/hr |
| Offshore (IN, UA) | 300-600 DKK/hr |
| Junior DK freelance | 550-900 DKK/hr |
| Experienced DK specialist | 1.000-1.400 DKK/hr |

https://loenradar.dk/en/guides/freelance-it-hourly-rate-denmark-2026
https://timetrack.dk/blog/freelancer-timepris-2026

Project anchors:
- **e-conomic integration project: 15.000 DKK simple one-way, up to 130.000+
  DKK for complex two-way with error handling, 2-6 weeks.**
  https://www.sanocast.dk/e-conomic-integration/
- WordPress maintenance retainer: 395 DKK/month advertised entry,
  500-1.500 DKK/month realistic for small sites, 1.500-4.000 for mid-size.
  https://netkant.com/blog/hvad-koster-wordpress-vedligeholdelse/

Positioning read: at **400-600 DKK/hr** you undercut every Danish agency, sit
at nearshore pricing, and beat nearshore on the two things Danish SMBs
actually care about, speaking Danish and sharing a timezone. Do not price at
200 DKK/hr, in this market that signals incompetence rather than value.

## The one section read first-hand (GitHub API, not search snippets)

The Danish business-software developer ecosystem on GitHub is close to empty.

- Search across `nemhandel OR oioubl OR "dinero.dk" OR billy.dk` returns
  **28 repos total**, essentially all at 0-2 stars.
- Danish CVR tooling: **3 repos**, all 0-1 stars.
- **e-conomic has no official SDK and no JS/TS SDK at all.** Unofficial
  clients: Morning-Train/economic (PHP, 2 stars), Rackbeat/laravel-economic
  (PHP, 1), Opus-EDB/e-conomic (Go, 1), Pogoe/EConomic.NET (C#, 0, created
  Aug 2026). e-conomic is the dominant Danish accounting system.
  **A good documented TypeScript SDK for the e-conomic API is an open niche.**
- A live 2026 land-grab with no winner: six independent Danish teams building
  AI/MCP tooling for Danish accounting within six months, all at 0-2 stars.
  Thourum/billy-mcp, Cimalys/billy-mcp, markhm/billy-mcp-server,
  lauenborg/dk-bogfoerer-crew, inbound-cph/economic-mcp-byinboundcph (created
  10 Sep 2026), digi-tal-regnskab/dinero-skills. Either a market forming in
  real time or six people chasing the same mirage. Star counts cannot tell you
  which. What it does show: Danish agencies are spending time selling this.
- **Best free asset found: https://github.com/mauran/API-Danmark**, 793 stars,
  updated today. Catalogues 100+ Danish APIs and marks each Public or Private.
  **Public** (no relationship needed): MobilePay/Vipps, CVR lookup, DAWA
  addresses, Bring and GLS parcel shops, DMI weather, Danmarks Statistik,
  energy and fuel prices. **Private** (partner relationship required):
  e-conomic, Dinero, Billy, most payment gateways, payroll. This is the map of
  what can be built on today with zero relationships.

Demand-side counterpart: Dansk Erhverv reports 70 percent of member businesses
now use AI tools, up from 44, but **96 percent of companies with 250+
employees versus only 57 percent of companies under 10 employees**. The gap is
the opportunity.
https://www.danskerhverv.dk/politik-og-analyser/analyser/2026/februar/danske-virksomheders-brug--af-kunstig-intelligens-ai-i-2025/

## Corrections to things I believed earlier in this session

- **OIOUBL 3.0 urgency is CANCELLED.** The mid-2026 deadline was scrapped in a
  strategic review. Nemhandel BIS 4 is now mandatory from **November 2028**,
  OIOUBL 2.1 phased out by May 2029. Anyone selling urgent OIOUBL migration
  today is selling a deadline that no longer exists.
  https://nemhandel.dk/sites/default/files/2026-03/Dokumentstrategi_h%C3%B8ringsnotat_ERST_040326_alirodocs-a_WA.pdf
- **Foreninger are mostly EXEMPT from the 2026 bookkeeping law.** Danmarks
  Idraetsforbund states the great majority of Danish sports associations can
  disregard it. Only associations with *commercial* turnover above 300.000 DKK
  for two consecutive years are caught. My earlier note implied a panicking
  club market. There isn't one.
  https://www.dif.dk/nyheder/2025/08/foreninger-undtaget-krav-om-digital-bogfoering
- **Do not build a bookkeeping system.** The law splits systems into
  *registered* (vendor carries the compliance liability, list published by
  Erhvervsstyrelsen) and *non-registered* (the business itself carries it).
  Building one hands your client a personal compliance liability.
  https://erhvervsstyrelsen.dk/ikke-registrerede-digitale-bogfoeringssystemer
  The opportunity is everything *adjacent*: migration off spreadsheets,
  receipt capture, bank reconciliation, webshop-to-ledger sync, month-end
  reporting.
- **No evidence of Danish paid demand for Discord bots.** The agent looked and
  found Danish Discord communities but zero evidence of anyone in Denmark
  paying for custom bot work. The Discord skills are better reframed as
  generic backend/API/automation ability.

## More killed ideas

- Digital kassesystem law: real and enforced (fines 10/20/30.000 DKK), but
  only ~12.500 businesses in 4 named industries, and it needs a *certified POS
  system*. Hardware/vendor market, not a student software play.
- GDPR tooling. Danish SME GDPR SaaS runs 750-2.250 DKK/month so money does
  move, but it is a legal-liability product and a student has no credibility
  signal. The defensible sub-slice is purely technical: cookie banner and
  consent implementation as a line item on web work.
- MitID Erhverv friction. Organisational, not a missing product. Integration
  requires broker agreements an individual cannot get.
- Shipping-label integrations. Shipmondo, SmartPack and native platform
  support own it completely.
- Booking systems. 21 competitors listed on one Danish comparison site,
  99-800 DKK/month.
- MobilePay as a *product*. Partner status requires a registered company, eID,
  KYC and AML. A private individual cannot become a partner. The workable
  version is per-client integration using **the client's own** merchant
  credentials, and only for clients who need it inside their own site or
  subscription flow, since MyShop and payment links already exist code-free.
  GitHub search for MobilePay integrations returns **4 repos total**, the
  official Vipps Deno SDK has 10 stars. Genuinely thin, but the barrier is
  also what keeps you out.

---

# Accessibility law hypothesis: KILLED

I proposed that tilgaengelighedsloven creates urgent paid demand among Danish
webshops for accessibility audits. A verification agent was told to kill it if
it could. It did.

**Reason 1, the pincer.** Sikkerhedsstyrelsen's own guidance:
"Microenterprises delivering e-commerce services to consumers are **not
obligated** to comply with the accessibility requirements." Microenterprise is
under 10 employees AND (turnover under 2 mio EUR **OR** balance sheet under
2 mio EUR). Services get the full exemption, products get only a paperwork
exemption. E-commerce is structurally low-headcount, so most Danish webshops
are entirely out of scope. The minority above the line already have an agency
or in-house dev. **Too small to be liable, or too big to hire a student.**
https://www.sik.dk/erhverv/tilgaengelighed-produkter-og-tjenester/vejledninger/tilgaengelighed-undtagelser-og-mikrovirksomheder

**Reason 2, no fear driver.** The US and German accessibility-remediation
markets are fear markets, built on ADA serial litigation and on the German
Abmahnung industry, which works because UWG standing plus fee-shifting makes
warning letters profitable. **Denmark has neither.** Administrative regulator,
dialogue-first, no private litigation channel. Strip out the fear and you are
selling a discretionary quality improvement, cold, to businesses that are
mostly exempt.

**Reason 3, you cannot honestly sell what they want to buy.** Automated tools
catch somewhere between ~30 and 57 percent of WCAG issues depending on whose
methodology you trust. The criteria they miss are the ones that matter:
keyboard traps, focus order, alt-text quality, name/role/value on custom
components. So an honest service cannot promise compliance, and a dishonest
one is real liability. The FTC fined accessiBe roughly 1 mio USD in Jan 2025
for exactly this overclaim.

**One true thing worth keeping:** the widely repeated Danish agency claim that
existing sites have until 28 June 2030 is **wrong**. EAA Article 32's
transitional period covers services delivered "using products" lawfully in use
before the date, meaning legacy hardware like payment terminals and kiosks.
A website is not a product used to deliver the service, it is the service.
But being right about this is worthless commercially: the owner forwards your
email to their agency, the agency says "we've got it covered", and you lose.

**The only salvageable variant**, not recommended now: sell remediation hands
B2B to Danish agencies who have the client relationship and the liability, not
to webshop owners. Requires being genuinely good first, with published
before/after work.
