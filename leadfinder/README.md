# Lead finder: web design leads around Svendborg

Finds small local businesses with no website, a broken website or a dated
one, and writes a ranked lead list (`leads.csv` and `leads.xlsx`) with a
one-line Danish pitch for each.

Only official APIs and public pages are used:

- **OpenStreetMap Overpass API** for the businesses (free, no key)
- **Nominatim** (OSM's geocoder), only if you remove `lat`/`lon` from the config
- **The businesses' own websites** for the audit, with robots.txt respected
- **Brave Search API** (optional, free key) to find Facebook/Instagram pages
  and websites that OSM doesn't know about

Google Maps, Google Search and Facebook are never scraped.

## Run it

Needs Python 3.9 or newer.

```bash
cd leadfinder
pip install -r requirements.txt
python3 find_leads.py
```

The first run takes a while (roughly 2 seconds per website, plus the
Overpass queries). Results are cached in `.cache/` for 14 days, so a rerun
takes seconds.

```bash
python3 find_leads.py --limit 20     # quick test on the first 20 businesses
python3 find_leads.py --refresh      # ignore the cache, fetch everything again
python3 find_leads.py --config other.yaml
```

### Optional: social media and missing-website search

OSM often has no website for a business that really does have one, and it
rarely knows about Facebook pages. To check "name + town" against a search
engine, get a free key at <https://brave.com/search/api/> (free plan,
about 2,000 searches a month) and set it before running:

```bash
export BRAVE_API_KEY=your-key-here
python3 find_leads.py
```

Then, for each business without a website in OSM, the tool:

- flags it as "kun Facebook/Instagram" if a matching social page shows up (score 95)
- audits a website it finds whose domain matches the business name, and
  marks it "hjemmeside fundet via søgning" in `info`, so you can check it really is theirs

Without a key this step is skipped. Businesses without a website then get
`ikke søgt på nettet, tjek selv` in `info`. Do a quick search yourself before calling.

## Configure

Everything is in `config.yaml`:

| Setting | What it does |
|---|---|
| `town`, `lat`, `lon` | Centre of the search. Leave `lat`/`lon` empty to look the town up |
| `radius_km` | Search radius (25 km reaches Tåsinge, Gudme, Oure, Stenstrup, Rudkøbing and roughly to Faaborg) |
| `categories` | Name, Danish label and OSM tags for each category. Add or remove freely |
| `skip_chains` | Skip anything with an OSM `brand` tag (Netto, Matas, ...) |
| `user_agent` | Put your own contact email in here, it's polite |
| `min_seconds_between_requests_per_host` | Rate limit per server |
| `cache_days` | How long cached answers are reused |
| `csv_delimiter` | `;` opens correctly in Danish Excel |

OSM tags for other trades are listed at
<https://wiki.openstreetmap.org/wiki/Key:craft> and
<https://wiki.openstreetmap.org/wiki/Key:shop>.

## What gets checked

For each website:

- **Loads?** DNS errors, timeouts, HTTP errors, "under opbygning"/parked pages
- **Speed** over 3 seconds counts as slow
- **HTTPS** missing or invalid certificate
- **Mobile friendly** `<meta name="viewport">` present
- **Looks outdated** copyright year more than 2 years old, no responsive
  CSS (`@media`, also in up to 3 linked stylesheets), Flash, table layout,
  old generators (FrontPage, Word, iWeb, old WordPress), free builder
  branding (Wix, Jimdo, SimpleSite, Webnode, Weebly and more)
- **Contact info and opening hours** visible on the front page or its
  "kontakt" page. Opening hours aren't required for trades
  (electrician, plumber, painter, carpenter)

## Scoring

| Score | Meaning |
|---|---|
| 95 | No website, only Facebook/Instagram |
| 90 | No website found |
| 85 | Website broken, parked or "under opbygning" |
| 10-80 | Working website: 10 + points per problem, capped at 80 |
| 30 | Site blocks automated visits in robots.txt, check it yourself |

Problem points: not mobile friendly 25, no/invalid HTTPS 20, Flash 15, free
builder ads 15, old generator 10, table layout 10, no responsive CSS 10, old
copyright 10, slow 10, no contact info 5, no opening hours 5. A score of
10 means the site is fine, so pitch IT support instead.

Ties are sorted with phone numbers first, since those are easiest to call.

## Output columns

`score, name, category, town, address, phone, website, problems, pitch_angle,
contacted, notes, info`

`contacted` and `notes` are left empty for you. `info` holds extra facts
found along the way: social links, email, opening hours from OSM, and
whether the website was found via search.

In the Excel file the score cell is coloured: red for hot leads (70+), yellow
for maybe (40-69) and green when the site is fine.

## Tests

```bash
python3 -m unittest discover tests
```

These run offline against saved pages in `tests/fixtures/`.

## Files

| File | Step |
|---|---|
| `find_leads.py` | Main script, ties the steps together |
| `osm.py` | 1. Overpass queries and parsing |
| `audit.py` | 2. Website audit |
| `social.py` | 3. Social media and website search |
| `score.py` | 4. Score, problems and Danish pitch |
| `export.py` | 5. CSV, Excel and summary |
| `net.py` | Polite HTTP session, rate limiter, cache |

## Good to know

- OSM coverage of small businesses is good but not complete. Some will be
  missing and some details will be out of date. Check before you call.
- Overpass servers are sometimes busy. The tool tries several mirrors and
  caches each category as it succeeds, so just run it again.
- Data from OpenStreetMap is © OpenStreetMap contributors, ODbL.
- Before emailing leads: Danish marketing law (markedsføringsloven § 10)
  bans unsolicited marketing email, to businesses too. Calling a business
  or sending a letter is generally fine, but respect "reklamebeskyttet" in
  CVR. This is not legal advice.
