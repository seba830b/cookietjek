# Phase 1: shortlist and ranked recommendation

Five options that survived research. Evidence log is in `research-notes.md`,
including roughly a dozen ideas that were killed and why.

## Read this before the options

**Evidence quality is capped.** This environment blocked direct page fetches
to nearly every domain, so almost nothing below was read first-hand. It is
search-engine summaries of real pages plus a first-hand GitHub API survey.
URLs are real. Numbers are leads, not facts. Anything that gates a real
decision, verify yourself. Three specific checks worth 30 minutes each are
listed at the bottom.

**One structural fact that reframes everything.** The generic freelance
marketplace is shrinking, and it is shrinking precisely at the entry point a
newcomer would use. Upwork Q2 2026: revenue down 2 percent year over year,
gross services volume down 3,6 percent, active clients down 4 percent,
full-year guidance cut. Management named AI automation of low-complexity work
as the cause and said conditions would worsen through Q3 and Q4. On the Q1
call they were more specific: AI adoption "degraded the volume of client
activity on the low end, impacting contracts of **500 USD and below**."

Contracts under 500 USD are exactly the contracts a zero-review newcomer wins.
That rung of the ladder is being sawn off while you climb it. "Get on Fiverr,
grind cheap gigs, build reviews" was 2021 advice. Plan around something else.

**Your three real advantages, in order of strength:**
1. You are in Denmark, speak Danish, can invoice in DKK, and can physically
   show up. No amount of AI or offshore pricing replicates that.
2. You are native to Discord and game-server culture, where trust is social
   rather than review-score-based and money moves in hours.
3. AI tooling lets you do in 3 hours what a Danish agency bills 15 for.

**Legal friction is near zero for the first 500 DKK.** Invoice as a private
person with your CPR number where a business puts a CVR, no moms, get paid by
bank transfer, declare it as B-indkomst. Register nothing. The 50.000 DKK
figure everyone quotes is the **VAT registration threshold** over a rolling 12
months, not a licence to earn that much unregistered.

---

## Option 1: Danish cookie-consent compliance sweep

**What it is.** A scanner that crawls Danish business websites, loads each in
a headless browser, and records two specific, legally decisive facts: whether
statistics or marketing cookies fire *before* consent, and whether rejecting
is as easy as accepting at the first layer. You then sell the fix.

**Who pays, and what.** Danish SMBs with a website. 1.500-2.500 DKK per site
as a one-off. Cheap enough to approve without a meeting.

**Evidence of demand.**
- Datatilsynet and Digitaliseringsstyrelsen published joint guidance on
  cookies in May 2025:
  https://www.datatilsynet.dk/Media/638829899950476628/F%C3%A6llesvejledning%20med%20DIGST%20-%20Cookie%20og%20lignende%20teknologier.pdf
- **Datatilsynet has named website tracking, specifically whether users can
  actually reject cookies, an enforcement priority for 2026.**
- A principial Danish decision established the "equally easy to reject" rule
  unambiguously:
  https://www.advodan.dk/da/erhverv/viden-til-dig/principiel-afgorelse-fra-datatilsynet-om-cookies-far-konsekvenser-for-alle-hjemmesider/
- Danish SME GDPR tooling sells at 750-2.250 DKK/month, so money already moves
  in this category: https://www.legiscope.com/blog/bedste-gdpr-software.html

**Time to first revenue.** 1-3 weeks. The scanner is the sales engine, so the
build and the pipeline are the same work.

**Fit.** Very good. Playwright plus a headless crawl is squarely your stack,
the whole thing is a sub-20-hour build, hosting is free-tier, and the output
is a screenshot of *that company's* specific violation. That is the difference
between a 3,43 percent cold-email reply rate (the 2026 average) and the
15-25 percent that personalised, specific outreach achieves.

**Biggest risk.** You are a student telling businesses they are breaking the
law. Mitigated by the fact that the violation is demonstrable in a screenshot
rather than an interpretive legal claim, and the fix is cheap. Secondary risk:
Danish CMP vendors exist (Cookiebot, Cookie Information). But having a CMP and
having it *configured so scripts do not fire pre-consent* are different
things, and the gap between them is exactly what the scanner detects.

---

## Option 2: Forening webmaster, migration plus retainer

**What it is.** Take a Danish forening off its dead 2014 website onto
Conventus or Holdsport, migrate the member list, set up kontingent via
MobilePay Subscriptions, rebuild the content, train the bestyrelse for an
hour. Then stay on as their webmaster.

**Who pays, and what.** Danish foreninger. 3.500-7.000 DKK one-off for the
migration, then 400-800 DKK/month to keep it alive.

**Evidence of demand.**
- **Do not build forening software.** Conventus is free up to 30 users, then
  50 DKK/month Basic and 175 DKK/month Pro, and 3.000+ Danish foreninger
  already use it: https://web.conventus.dk/priser/ . Klubmodul charges
  5.999 DKK setup plus 314 DKK/month at 0-200 members:
  https://klubmodul.dk/priser
- The gap is labour, not software. Danish sources state plainly that
  foreninger neglect their websites "because they lack a web editor or help
  maintaining the content", and systems are marketed as not requiring a web
  developer so volunteers can update them, which is an admission that the
  volunteer does not exist.
- DGI runs a free "digital gennemgang" that tells clubs their site is a
  disaster and then does not rebuild it: https://www.dgi.dk/nyheder/digitalgennemgang
  That is a lead source, not a competitor.
- MobilePay Subscriptions charges kontingent automatically on a fixed annual
  date at 0,99 percent + 1 DKK. Every kasserer chasing 80 members for 400 DKK
  each by bank transfer in February is a customer.

**Time to first revenue.** 2-6 weeks. Bestyrelser decide slowly.

**Fit.** Good, and the Danish language advantage is at its maximum here. Low
technical difficulty, high trust requirement, and you can meet them in person.
Weakness: there is not much to *build*, it is mostly service work.

**Biggest risk.** Thin budgets and slow committee decisions. Offset: churn is
near zero because the alternative is nobody doing it, and bestyrelser in the
same kommune all know each other, so one signed club refers the next.

---

## Option 3: Game-server and Discord community dev work, sold inside the communities

**What it is.** Answer live hiring posts on BuiltByBit's hire-a-developer
feeds and the Cfx.re Server Bazaar. Then differentiate with the thing almost
nobody ships: a bot **plus a hosted web dashboard with OAuth login** so the
server owner configures it without touching code.

**Who pays, and what.** Server owners, personally, from their own pocket.
Minecraft plugin commissions from 10-15 USD trivial up to 100 USD minimums for
experienced devs. FiveM scripts roughly 19 / 37 / 65 USD by size. Fiverr's own
guide puts custom Discord bots at 70-380 USD.

**Evidence of demand.**
- Live hiring feeds: https://builtbybit.com/tags/hire-a-developer/ ,
  https://forum.cfx.re/tag/lookingfordeveloper
- BuiltByBit shows purchase counts publicly on every listing, which is rare
  and lets you validate before building. The top anti-crash plugin: 19,99 USD
  x 4.174 purchases. mineLogin: 15 USD x 723.
  https://builtbybit.com/resources/minecraft/plugins/paid/
- Discord's App Subscriptions pay 85/15 in your favour on the first million
  USD and **are available to EU developers, so Denmark qualifies**. Note the
  trap: Discord's *other* product, Server Subscriptions, requires a US bank
  account and US ID and excludes Denmark.

**Time to first revenue.** Days. This is the fastest path to being paid at all.

**Fit.** Your home turf. But the honest read: **do not sell Discord bots on
Fiverr**, there is an indexed 5 USD gig and you cannot win that price war.
Sell inside the communities where trust is Discord history and a screen-share.

**Biggest risk.** It pays badly per hour and does not compound. Also, the
research found **zero evidence of anyone in Denmark paying for custom Discord
bot work**, so this is a USD-denominated global play, not a local one. Use it
to cross from zero to one, get a quotable testimonial, and not as the business.

---

## Option 4: Apify Store actor

**What it is.** Publish a scraper on Apify's marketplace. They host it, bill
users per result, and pay you out.

**Who pays, and what.** Apify's 130.000+ monthly paying users. Pay-per-result
pricing clusters at 0,002-0,005 USD per result.

**Evidence of demand.**
- Apify pays out roughly 1,4 mio USD per month across about 3.000 community
  developers, so ~470 USD/dev/month on average, heavily skewed:
  https://help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store
- Commission is 20 percent of profit. Payout on the 11th, PayPal minimum
  20 USD, KYC required. Balances under the minimum for 12 straight months are
  forfeited: https://docs.apify.com/platform/actors/publishing/monetize
- **Every listing shows its total user count publicly**, so you can size demand
  before writing code: https://apify.com/store

**Time to first revenue.** 4-12 weeks, and small at first.

**Fit.** The best pure-stack fit of the five. Python and JS native, Apify
handles hosting and billing so no Stripe and no company needed, payout reaches
Denmark via PayPal at a 20 USD floor, and one actor is a genuine sub-20-hour
build. No audience required at all.

**Biggest risk.** Brutal power law. Most published actors have 0-5 users and
discovery favours incumbents. The stated opening is to ignore Google Maps,
Instagram and TikTok entirely (571K, 371K and 242K-user incumbents sit there)
and target platforms where the current leader has under 500 users. Expect to
publish several before one lands.

---

## Option 5: Fix or finish someone's AI-built app

**What it is.** Non-technical founders build something in Lovable, Bolt, v0 or
Replit, it half-works, they are stuck and emotionally committed. You get it
deployed, secured and finished.

**Who pays, and what.** Reported freelance rates of 100-300 USD/hour with
typical packages at 1.500-8.000 USD. Treat those numbers as vendor-flavoured
and inflated.

**Evidence of demand.** The strongest single source in the whole research
chain, because it is a public company telling investors where its money is
going: **Upwork management stated on the Q2 2026 call that clients are
increasingly hiring people to finish or fix projects started with AI**, naming
"turning AI-generated code into production websites" specifically. AI-related
work on Upwork grew over 40 percent year over year to 300M+ USD annualised,
8 percent of marketplace volume and 11 percent of job posts, while everything
else shrank.

**Time to first revenue.** 3-8 weeks.

**Fit.** Good technically. You read AI-generated code faster than an
old-school agency dev because you know what it looks like and where it breaks.
The entry job is small and defined and reliably expands.

**Biggest risk.** Distribution. These buyers are scattered across startup
Slacks, Discords and indie-hacker communities, and finding them without an
audience is the whole problem. The hourly rates quoted are almost certainly
survivorship-biased. This is a real trend, but it is not a channel.

---

# Ranked recommendation

**1. Option 1, the cookie-consent sweep.** It is the only option where the
thing you build *is* the thing that finds your customers. A sub-20-hour
Playwright crawler produces a pre-qualified list where every outreach message
contains a screenshot of that specific company's specific violation, which is
what moves cold outreach from a 3,4 percent reply rate to 15-25 percent. The
urgency is real and externally imposed (Datatilsynet's 2026 enforcement
priority), the rule is binary and machine-checkable rather than a matter of
opinion, the price point needs no meeting, and the job puts you inside the
client's CMS where every other job lives. It also has the best worst case: if
nobody buys, you still own a working scanner and a list of qualified Danish
leads you can point at a different offer.

**2. Option 2, the forening retainer.** Better money and genuinely recurring,
but slower, and there is almost nothing to build. **Run it in parallel with
Option 1, not instead of it.** These are the same weekly hours doing outreach
to two different lists.

**3. Option 3, the game-server work, but only as a day-one unlock.** Answer
three live hiring posts this week, get paid once at any price, get a quotable
testimonial. The money is trivial. The point is crossing from zero to one, and
it is the only option here that can pay you within 48 hours.

**4. Option 4, Apify.** The best pure product bet and the one that compounds
without your hours. But it is a lottery with a good expected value, not a
plan. Worth a weekend once Option 1 is shipped.

**5. Option 5.** Real trend, no channel. Revisit when you have an audience.

## What I am explicitly telling you not to do

- **Do not build a Fiverr or Upwork presence as your first month.** The
  sub-500-USD segment is being automated away, Fiverr takes a flat 20 percent
  with a 14-day hold, and the benchmark is 40-50 Upwork proposals and 24-45 USD
  of Connects before a first job. The one exception where a newcomer genuinely
  competes is "fix my broken website", because buyers there sort by who is
  online now rather than by review count.
- **Do not sell Discord bots on Fiverr.** There is a live 5 USD gig.
- **Do not build forening software, bookkeeping software, a booking system, or
  shipping-label integrations.** All four are owned by incumbents at prices you
  cannot undercut. Details and links in `research-notes.md`.
- **Do not price at 200 DKK/hour.** Danish juniors bill 550-900. Below about
  400 you signal incompetence rather than value.

## One idea I killed after telling you it looked strong

I flagged the tilgængelighedsloven (EU Accessibility Act) angle as promising
and sent an agent to verify it. It came back KILL, and I agree.

Sikkerhedsstyrelsen's own guidance states that **microenterprises delivering
e-commerce services to consumers are not obligated to comply**. Microenterprise
is under 10 employees AND (turnover under 2 mio EUR OR balance sheet under
2 mio EUR). Services get the full exemption; only products get the narrower
paperwork carve-out. E-commerce is structurally low-headcount, so most Danish
webshops are simply out of scope, and the minority above the line already have
an agency. Too small to be liable, or too big to hire a student.

On top of that, the US and German accessibility-remediation markets are *fear*
markets built on ADA litigation and the German Abmahnung industry. Denmark has
neither, so there is no mechanism manufacturing urgency. And an honest version
of the service cannot promise compliance anyway, since automated tools catch
somewhere between 30 and 57 percent of WCAG issues depending on whose
methodology you believe. The US FTC fined accessiBe about 1 mio USD in January
2025 for exactly that overclaim.

**Note a real disagreement between two of my agents**, since you should not
take either on faith. The gig-research agent rated accessibility the strongest
deadline-driven niche and believed pre-2025 webshops get up to 5 years of
transition relief. The verification agent, reading Sikkerhedsstyrelsen's
exemption guidance, says the transition period in EAA Article 32 covers
services delivered "using products" lawfully in use before the date, meaning
legacy hardware like payment terminals, not websites. I side with the
verification agent because the microenterprise exemption is decisive on its
own regardless of who is right about 2030. If you ever want to revisit this,
one call to Sikkerhedsstyrelsen settles it.

Worth keeping from that wreckage: **the cookie rules are a different law with
no microenterprise exemption**, which is part of why Option 1 ranks first.

## Three checks worth 30 minutes each before you commit

1. Open Amino Freelancer and Giig's task boards in a browser and confirm real
   paid tasks are being posted **right now**. Nobody in this research chain
   could load a single live Danish gig listing, and that is the largest hole.
   https://www.amino.dk/freelancer/ and https://www.giig.dk/alle-opgaver
2. Confirm Datatilsynet's 2026 cookie enforcement priority in their own words,
   on datatilsynet.dk. Option 1's urgency rests on it.
3. If you pick Apify, browse https://apify.com/store sorted by users and find
   five target platforms whose leading actor has under 500 users. That is your
   build shortlist, and it takes ten minutes.
