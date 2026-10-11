# Lazy Prep v2: shared spec for all agents

Read this fully before touching anything. Never use em dashes (U+2014) or en dashes (U+2013) anywhere. All user-facing text is natural, casual, short Danish ("du"). Dish names may keep the English Danes actually use.

## The user
Danish student in Svendborg. Hates cooking, loves comfort food (cheesy, saucy, crispy, savory; Mexican favourite, plus Korean, Indian, Italian, American diner, Asian takeaway). Gear: ONE microwave/airfryer combo (cannot microwave and airfry at once), one pan, one pot, 2 bowls, scissors, a mug as measure, no scale, no colander, no oven. Shops Lidl + Netto (Mølmarksvej) and sometimes Rema. Budget. Shops Saturday, preps Sunday.

**Gets dinner at school Mon, Tue, Thu.** So the default week is: lunch Mon-Fri + dinner Wed and Fri = 7 meals. But every meal (day x lunch/dinner) must be toggleable in the app, and everything is recomputed from the active meals.

Lunch is eaten at uni with ONLY a microwave. Dinner is at home (microwave + airfryer).

## What v2 adds
1. **Recipe pool**: ~30 recipes built from the same 5 bases, so the app can pick a fresh, varied week every ISO week.
2. **Meal toggles**: per day lunch/dinner on/off. Default above. Saved in localStorage.
3. **Generated week**: `pickWeek` picks recipes for the active meals, seeded by ISO year+week (+ a "Bland igen" offset, + per-meal "Byt ret" overrides).
4. **Everything computed**: shopping list, starter list, prep timeline (with times), kit/box counts, fridge/freezer/thaw reminders, prep minutes, per-meal price. All from active meals x people slider f.
5. **Photos**: one real, freely licensed photo per recipe, with credit.
6. **Weekly routine**: every Friday morning a Claude session adds 2-3 new recipes to the pool (see ROUTINE.md), validates, builds, commits and republishes.

## Files and owners
| File | Owner | What |
|---|---|---|
| `src/engine.mjs` | engine agent | Pure, dependency-free, browser-safe functions (inlined into the page like fmt.mjs: build strips `export`). |
| `src/data.mjs` | engine agent | STYLES, BASES (A-E), PRODUCTS catalog, PANTRY ids, STORES, RULES, KIT, SCALE notes, texts. Imports recipes. |
| `src/recipes/core.mjs` | engine agent | The existing 10 recipes converted to the v2 schema. `export const CORE = [...]` |
| `src/recipes/pool.mjs` | recipe agent (later: weekly routine) | New recipes. `export const POOL = [...]` and `export const POOL_PRODUCTS = {...}` for any new products. |
| `src/images.mjs` | image agent | `export const IMAGES = { recipeId: { file: 'img/<id>.jpg', title, by, license, licenseUrl, src } }` |
| `img/<id>.jpg` | image agent | Photo, 640px wide max, JPEG q~72, under ~70 KB. Lives in `meal-prep/img/`. |
| `src/tools/fetch-image.mjs` | image agent | CLI the routine reuses: `node meal-prep/src/tools/fetch-image.mjs <recipeId> "<search terms>"` downloads, resizes, updates images.mjs. |
| `src/check.mjs` | engine agent | Validator: `node meal-prep/src/check.mjs` exits 1 with a list of errors. |
| `src/build.mjs` | engine agent | Generates md files + index.html (inlines fmt.mjs, engine.mjs, DATA). |
| `src/template.html` | UI agent | The page. |
| `ROUTINE.md` | coordinator | Weekly routine instructions. |

Build: `node meal-prep/src/build.mjs meal-prep` (from repo root /home/user/cookietjek). Validate: `node meal-prep/src/check.mjs`.
Never commit or push; the coordinator does that.

## Bases (unchanged in spirit)
- A Sprød airfryer-kylling (raw chicken breast, bouillon, cornstarch + baking powder). Airfryer batches of ~350 g raw, 200°C ~16 min.
- B Krydret oksekød: browned mince split into **variants** (`taco`, `bolognese`, `cheeseburger`, plus any new variant a recipe introduces, e.g. `korean`, `chili`). Max 2 variants per week (one pan).
- C Ris (pot). D Pasta (pot). E Frosne kartoffelbåde (never prepped, cooked fresh at eating time).

## Recipe schema (v2)
```js
{
  id: 'burrito',                 // unique, lowercase ascii
  name: 'Burrito bowl med kylling', short: 'Burrito bowl',
  style: 'mexican',              // key of STYLES
  bases: ['A', 'C'],
  slot: 'lunch',                 // 'lunch' = box, fully microwave-reheatable (uni). 'dinner' = needs airfryer at eating time. 'both' = works as either.
  hands: 5,                      // minutes of work for assembly + eating-time, <= 10
  per: {                         // consumption PER ONE PORTION from the bases, raw/dry amounts
    chicken: 165,                // g raw chicken breast (Base A). ~165 g raw = ~115 g cooked
    mince: 0, minceStyle: null,  // g raw mince and which variant
    rice: 80,                    // g dry rice (Base C)
    pasta: 0,                    // g dry pasta (Base D)
    wedges: 0,                   // g frozen wedges (Base E), cooked fresh
  },
  products: [                    // non-base shop items PER ONE PORTION, in the product's own unit (PRODUCTS[id].u)
    { id: 'taco', q: 0.125 }, { id: 'majs', q: 0.125 }, { id: 'ost', q: 30 },
    { id: 'salsa', q: 45 }, { id: 'cremefraiche', q: 30 },
    { id: 'lime', q: 0.25, opt: true },
  ],
  container: 'box',              // what the prepped portion lives in: 'box' | 'glasboks' (oven-safe, for airfryer finish) | 'pose' (freezer bag) | 'baeger' (small cup) ; one per portion
  sauceCup: false,               // true if sauce is stored in a small cup to keep chicken crispy
  freezeOk: true,                // can a prepped portion be frozen and thawed?
  assemble: 'I {{n|box}} med ris: taco-kylling, majs og en håndfuld ost pr. boks.',   // prep-day assembly line; {{n}} = portions this week, {{n|unit}} = formatted count
  prepExtra: [ { k: 'pan', min: 2, x: 'Uvasket pande: {{chicken}} kylling, tacokrydderi og vand. Vend 1-2 min.' } ], // optional extra prep-day steps (sauces, glazing). {{chicken}} = this recipe's chicken in portions
  ingredients: [ { q: 230, u: 'g', n: 'færdig kylling (Base A)' } ],   // display list FOR 2 PORTIONS (fmt units), as before
  steps: ['...'],                // how it's made (display)
  fridge: '2 dage (ris)', freezer: '2 mdr.',
  reheat: '...',                 // full reheat text
  eat: '...',                    // SHORT eating-time text. For slot 'lunch'/'both' it MUST start with "Kun mikro:" and use only the microwave.
  eatDinner: '...',              // optional: nicer home version for slot 'both' when used as dinner
  tip: '...',                    // optional
}
```

Constraints every recipe must pass (check.mjs enforces):
- hands <= 10; style in STYLES; bases subset of A-E; every product id exists in PRODUCTS (or POOL_PRODUCTS); per amounts consistent with bases listed.
- slot 'lunch'/'both': no wedges, no airfryer at eat time, `eat` starts with "Kun mikro:".
- Only products available at Netto/Rema/Lidl (Asian Market only as optional).
- Max 1 "new" mince variant per recipe; new variant must define its pan step text in `prepExtra` or in data (engine decides).
- No em/en dashes. Danish text.

## Products catalog
`PRODUCTS[id] = { n, sec, u, size, label, unit, plural, price, where, alt?, life, open, staple?, opt? }`
- `sec`: shop section ('Frugt og grønt' | 'Kød og køl' | 'Frost' | 'Kolonial' | 'Brød' | 'Basis').
- `u`: the unit that `products[].q` and `size` use ('g' | 'ml' | 'stk' | 'pack' for fractional packs like jars, tubes, bags of spice).
- Base items (chicken, mince, rice, penne, wedges, onion, bouillon...) are products too; the engine converts base needs into them.
- Prices: realistic 2026 Danish discount prices (see existing data.mjs which was checked against Rema's live catalog and Lidl/Netto offers).

## Engine API (src/engine.mjs), all pure, browser-safe
```js
isoWeek(date) -> { year, week }
DEFAULT_MEALS = { Mon:{lunch:true,dinner:false}, Tue:{lunch:true,dinner:false}, Wed:{lunch:true,dinner:true}, Thu:{lunch:true,dinner:false}, Fri:{lunch:true,dinner:true} }
pickWeek(recipes, meals, seedStr, overrides) -> { days: [ { day:'Mon', name:'Mandag', lunch: Meal|null, dinner: Meal|null } ], recipes: [ids used] }
   Meal = { r, s:'fridge'|'freezer', thaw:'Tue'|null, box:'boks'|'glasboks'|'pose', slot:'lunch'|'dinner' }
   Rules: lunch slots only get slot 'lunch'|'both' recipes; dinner prefers 'dinner'|'both'.
   Variety: >= 3 styles when >= 5 meals; same recipe max 2 times per week and never twice the same day; max 3 taco-spiced meals;
   feasibility: max 2 mince variants, max 3 different chicken sauces per week, total chicken <= ~1.2 kg at f=1 for 7 meals, prep <= 90 min at f=1.
   Deterministic for the same (seedStr, meals, overrides). overrides = { 'Wed:dinner': 'buffalo' } force a recipe in a slot.
   Fridge Mon-Tue (relative to Sunday prep: eaten within 2 days), Wed+ freezer, thaw the evening before.
alternatives(recipes, plan, slotKey) -> [ids]   // valid swaps for "Byt ret"
computeNeeds(plan, recipes, f) -> { base: { chicken, mince: {taco: g, ...}, rice, pasta, wedges }, products: { id: amount in PRODUCTS[id].u }, portions: { recipeId: n } }
buildShop(needs, products, f) -> [ { sec, items: [ { id, n, u, need, size, label, unit, plural, price, where, alt, opt } ] } ]   // same shape the template already renders
buildStarter(recipes, products, plan) -> sections   // staples + everything this week's recipes need, with life/open/use
buildPrep(plan, needs, recipes, data, f) -> { steps: [ { t:'0:12', k:'pot'|'pan'|'air'|'you', a:'KLIP', x:'...', opt? } ], minutes: { rutine, foersteGang, aktiv }, kit: [ { n, count, u, pl, note } ], notes: [ ... ] }
   A real scheduler: tasks with resource (pot/pan/air) + hands time (you); hands are single-threaded; airfryer is the bottleneck; microwave never while airfrying.
   Text uses fmt units ({450|g} markers already resolved for f, or left as markers: pick one and document it).
reminders(plan) -> [ 'Tirsdag aften: flyt onsdagens boks (koreansk) ...' ]
priceSummary(shop) -> { total, withOpt, perMeal }
```
The page calls these on every change of toggles/slider/seed. Must be fast (< 30 ms).

## check.mjs (validator)
- Schema + constraints above for every recipe in CORE + POOL.
- Every recipe has an image entry in IMAGES and the file exists (warn only if missing).
- Simulate: 52 ISO weeks x several meal configs (default, all 10, lunches only, dinners only, 3 random) x f in {0.5,1,2}: pickWeek succeeds, no NaN/undefined/null in any generated text, prep minutes at f=1 default within 60-90, shop totals > 0, every active meal has a recipe, no device double-booking in prep.
- No em/en dashes in any source or output.
- Exit code 1 on any error. Print a short summary.

## Images
- Source: Openverse API (`https://api.openverse.org/v1/images/?q=...&license_type=commercial,modification`) or Wikipedia/Commons (`https://en.wikipedia.org/api/rest_v1/page/summary/<Title>` gives a Commons image). Prefer CC0, CC BY, CC BY-SA. Record author, license, license URL, source page.
- HTTP User-Agent: `LazyPrepMealPlanner/1.0 (personal student meal-prep project)`. Never put any email address or personal data in requests.
- Commons API search is rate-limited from this network; Wikipedia REST summary and Openverse work. Be gentle: sleep 1-2 s between requests.
- The photo should look like the dish (or very close: e.g. "loaded fries" for taco fries). No people, no logos, no watermarks.
- Resize with Python PIL (installed) to max 640px wide, JPEG quality ~72, strip metadata.

## UI (template.html)
- Plan tab: week header "Uge 42" + "Bland igen" button + toggles. Each meal row: photo thumbnail, name, style chip, state chip, and an on/off switch ("Spiser i skolen"/"Spring over" wording). "Byt ret" per meal opens alternatives.
- Default meals = DEFAULT_MEALS. Toggle state + seed offset + overrides saved per ISO week in localStorage (`lazyprep:v2`, migrate checks from v1).
- Today card, eat sheet, recipe cards: show the photo (lazy-loaded, aspect-ratio box, alt text = dish name). Credits: small "Foto: by, license" link on each photo + a "Fotos" credits list at the bottom of Opskrifter.
- Everything else from v1 keeps working (slider = people, per-recipe steppers, ticks synced by product id, Har jeg, store filter with "Ikke i denne butik", prep clock, mini-bar, thaw chips, Danish UI, dark mode, a11y, no horizontal scroll at 320px).
- The Indkøb/Starter totals: a normal card + a fixed `.minisum` bar when it scrolls away. Never change layout height on scroll (that broke touch scrolling once).
