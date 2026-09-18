# Cookietjek, spec

## The one-sentence version

A tool that proves, with a screenshot and a network log, that a specific
Danish company's website sets tracking cookies before the visitor has
consented, so that company pays Caustic a fixed fee to fix it.

## Core user

The person at a Danish SMB who would get in trouble if Datatilsynet wrote to
them. Usually the owner of a 2-20 person company, sometimes a marketing
coordinator. They are not technical. They paid someone to put a cookie banner
on the site two years ago and have assumed since then that it works.

They are **not** looking for this. They have never searched for it. That means
the product has to arrive at them with the evidence already attached, which is
why the scanner and the sales channel are the same thing.

## The single problem solved

**They have no way to know whether their cookie banner actually does anything.**

The banner appears, so it looks handled. Underneath, Google Analytics and the
Meta pixel usually fire on page load regardless of what the visitor clicks. The
owner cannot see this. Their web agency, if they still have one, has no reason
to bring it up. There is no error message, nothing breaks, and nothing tells
them until a complaint or an inspection does.

## What is actually being sold

Not software. **A fixed-fee fix, 1.800 DKK**, delivered in one to two hours:
reconfigure or replace the consent tool so nothing fires before consent and a
reject control sits on the first layer, then re-run the scan and hand over a
before-and-after report they can save as documentation.

The scanner is the marketing. The fix is the product.

## Smallest version someone would pay for

Three pieces, all of which exist in this repo:

1. **`scan.mjs`** - a local CLI. Give it a domain, it loads the front page in a
   clean headless browser, touches nothing, and records what happens anyway:
   cookies set, requests to known tracker hosts, whether a consent banner
   exists, whether a reject control exists on the first layer. Saves raw JSON
   and a screenshot.
2. **`report.mjs`** - turns one scan into a standalone Danish-language HTML
   page showing exactly what was measured, with the screenshot and the list of
   trackers that fired pre-consent.
3. **`site/`** - a static site: a one-page Danish offer, plus the generated
   reports at `/rapport/<domæne>`. Deployed free. This is the link that goes in
   the outreach email.

That is the whole MVP. No accounts, no database, no server.

## Explicitly out of scope

- **No live self-serve scanner on the website.** It would need a hosted
  browser, which is not free, and it invites abuse. The scan runs on Caustic's
  laptop.
- **No automated fixing.** The fix is manual work inside the client's CMS and
  consent tool. That is the part being paid for.
- **No accounts, no login, no database, no backend.** Static files only.
- **No PDF export.** The HTML report prints acceptably. Revisit if a client
  asks twice.
- **No crawling beyond the front page.** One page is enough to prove the point
  and keeps runtime and legal exposure small.
- **No Stripe integration beyond a payment link.** For a first Danish sale
  under the 50.000 DKK threshold, an invoice with a CPR number and a bank
  transfer is lower friction and cleaner than card payments. Stripe test-mode
  link is wired as a placeholder for later.
- **No claim that anyone is breaking the law.** See below, this is a hard rule.

## The honesty rule, non-negotiable

The tool reports **measurements**, never verdicts. It says "these four requests
fired before any interaction with the banner" and shows the screenshot. It does
not say "you are in violation", "you are non-compliant", or "you risk a fine of
X kroner".

Three reasons, in order of importance:

1. It is the truth. A single automated front-page load cannot establish legal
   non-compliance. There are legitimate reasons a request fires, and consent
   state can be stored from a previous visit, geography, or a server-side
   setup the scan cannot see.
2. A measurement is much harder to argue with than an accusation. "Your site
   loaded Google Analytics before I clicked anything, here is the screenshot"
   ends the conversation. "You are breaking the law" starts a different and
   worse one, where a student loses to whoever the company already trusts.
3. Overclaiming compliance outcomes is exactly what the US FTC fined accessiBe
   roughly 1 mio USD for in January 2025. Do not inherit that failure mode.

Every report carries a visible limitations section saying what the scan did
not and could not check.

## Definition of done for the MVP

- `npm run scan -- <domain>` produces JSON plus a PNG.
- `npm run report -- <domain>` produces `site/rapport/<domain>/index.html`.
- `site/` deploys to a free static host and the report link works on a phone.
- One real Danish site has been scanned and its report read end to end.
