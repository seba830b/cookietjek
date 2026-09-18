# PROGRESS.md

Side-income discovery and MVP build. Pick this up in any session by reading
this file top to bottom.

## Owner context (do not re-ask)

- Caustic. Student in Svendborg, Denmark. Danish + English fluent.
- Ships things already: Discord bots, web tools, redvanguard.org, game mods.
- Stack comfort: JS/TS, Python, basic web hosting.
- Budget: near zero. Free tiers only until something earns money.
- Time: a few hours a week.
- Goal: first paying customer or first 500 DKK. Not "build a startup".

## Hard exclusions

No upfront capital. No dropshipping, crypto, affiliate content farms, survey
or task farming. Nothing that depends on an audience he does not have.
Nothing that passes AI output off as human where the buyer is paying
specifically for human work.

## Status

| Phase | State | Notes |
|---|---|---|
| Phase 1: research + shortlist | DONE | 5 research agents, ~200 web searches. See `research/SHORTLIST.md` |
| Phase 2: MVP build | SHIPPED | Option 1 picked. this repo, 13 tests green |
| Phase 2b: deploy | NEEDS CAUSTIC | one command from his machine, see README |
| Phase 3: first customer | NOT STARTED | Caustic's move. See `FIRST-SALE.md` |

## Log

- 2026-09-17: Branch created. Phase 1 research started. Five parallel
  research tracks: Danish/Nordic market, micro-SaaS paying audiences,
  fast-turnaround freelance gigs, Danish legal/payment plumbing, and a
  skeptical verification pass on the accessibility-law hypothesis.
- 2026-09-18: Phase 1 done. Shortlist of 5 written with a ranked
  recommendation. Roughly a dozen ideas killed with reasons logged.
  The accessibility-law idea I had flagged as promising was verified and
  killed on the microenterprise service exemption.
  **Waiting on Caustic to pick before any code gets written.**

- 2026-09-18: Option 1 picked. Cookietjek built end to end and pushed.
  Scanner, report generator, static landing site, 13 passing tests against
  local fixtures.

## What is actually done

- `npm test` passes, 13 tests, no network needed.
- Scanner verified end to end against three fixtures: a misconfigured site,
  a correct one, and one with no banner. All three classify correctly.
- A real report was generated and inspected in light, dark and mobile.
- **No real Danish site has been scanned yet.** This environment blocks
  outbound requests to almost every domain, so that first real run has to
  happen on Caustic's own machine. That is step one below.

## Why there is no live link yet

Deploy was attempted and refused. This session's network policy blocks
outbound connections to vercel.com, netlify.com, cloudflare.com, pages.dev and
surge.sh, all returning 403 at the egress proxy. GitHub Pages is not a way
around it either, since vanguard2 is a private repo and Pages on a private repo
is not publicly servable on a free plan.

The proxy documentation is explicit that a 403 is an organisation policy denial
and must be reported rather than worked around, so it was not worked around.
Deploy is one command from Caustic's own machine, see the README.

## Next actions, in order, for Caustic

1. `npm install && npx playwright install chromium`
2. `npm test` to confirm it works on your machine. Should be 16 passing.
3. Fill in `config.mjs`: mail, telefon, and later the deploy URL.
4. `npm run deploy:cloudflare` to get the real link. Then put that link in
   `config.mjs` as `site.baseUrl`.
5. `npm run scan -- <et domæne du kender>` and read the report. This is the
   moment where you find out whether the premise holds at all. If the first
   ten Danish sites you scan all come back INTET_FUNDET, the idea is wrong
   and you should say so rather than push on.
6. Build a list of 40 in `data/prospects.txt`, scan it, rebuild, redeploy.
7. Send 10 mails. The text is written for you in `FIRST-SALE.md`.

## The recommendation, in one line

Build the Danish cookie-consent scanner (Option 1), run forening outreach
(Option 2) with the same weekly hours, and take one game-server job this week
(Option 3) purely to get paid once and have a testimonial.

## Known gaps in the research

This environment blocked direct page fetches to nearly every domain, so the
evidence base is search-engine summaries, not first-hand reading. Nobody in
the chain loaded a single live Danish gig listing. Three 30-minute checks are
listed at the end of `SHORTLIST.md` and should happen before committing.

## Files

- `PROGRESS.md` - this file.
- `README.md` - how to run it, deploy it, and get the first customer.
- `SPEC.md` - scope, and the honesty rule the code enforces.
- `FIRST-SALE.md` - the sales path, with ready-to-send Danish outreach mails.
- `research/SHORTLIST.md` - the 5 options that were considered, ranked.
  **Start here if you want to know why this idea and not another one.**
- `research/research-notes.md` - the full evidence log, including every killed
  idea and why, Danish legal and payment plumbing, rate tables, and which
  sources are content farms that should not be trusted.
