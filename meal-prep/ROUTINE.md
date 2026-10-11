# Weekly routine: new recipes every Friday

A scheduled Claude session runs this every Friday morning (Europe/Copenhagen), so the new week is ready before shopping on Saturday.

The app already rotates through the recipe pool by itself (a new varied week every ISO week). This routine grows the pool with 2-3 brand-new dishes and makes sure they show up in the coming week.

## Steps

1. **Branch.** Work on `claude/meal-prep-system-80l94s`. `git fetch origin claude/meal-prep-system-80l94s && git checkout claude/meal-prep-system-80l94s && git pull`. If that branch has been merged into `main` and deleted, use `main` and push to a new branch `claude/meal-prep-week-<YYYY>-W<ww>` instead.
2. **Read** `meal-prep/src/SPEC-v2.md` (recipe schema, constraints, engine notes) and `meal-prep/src/recipes/pool.mjs` (what exists).
3. **Invent 2-3 new recipes** that are NOT near-duplicates of existing ones:
   - Built from the same bases (A chicken, B mince variants, C rice, D pasta, E wedges). Max one new product per recipe unless it is cheap and sold at Netto, Rema or Lidl.
   - At least 2 must be `slot: 'lunch'` or `'both'` (microwave-only at uni, `eat` starts with "Kun mikro:").
   - Pick styles that are least represented in the pool. Comfort food: cheesy, saucy, crispy, savory.
   - Danish, casual, short. Never em dashes or en dashes.
   - Add `added: '<YYYY>-W<ww>'` with the ISO week the recipes are for (the coming Monday's week). The engine favours recipes added for the current week, so they appear in the plan.
   - Add a `search` field (2-4 English photo search terms).
   - Append them to `POOL` in `meal-prep/src/recipes/pool.mjs` (and any new product to `POOL_PRODUCTS`, realistic 2026 DKK price).
4. **Photos.** For each new recipe: `node meal-prep/src/tools/fetch-image.mjs <id> "<search>" --list`, look at the candidates, then run it again with `--pick N`. Never put an email address or personal data in any request.
5. **Validate.** `node meal-prep/src/check.mjs` must pass. Fix your recipes until it does.
6. **Build.** `node meal-prep/src/build.mjs meal-prep`.
7. **Smoke test** the page with Playwright (chromium at `/opt/pw-browsers/chromium`, never `playwright install`): load `meal-prep/index.html` at 390x844, open all four tabs, no console errors, no "NaN"/"undefined" in the text, new recipes visible in Opskrifter.
8. **Commit and push**: message `Ugens nye opskrifter: <names>`.
9. **Republish the live page**: the artifact is `https://claude.ai/artifact/KzKgxKHwYF2nD2MZ5wamDV`. Read it first (Artifact `action: "read"`), then publish `meal-prep/index.html` with `url` set to that link and `files` mapping every `img/<id>.jpg` the page references (`{"img/<id>.jpg": "meal-prep/img/<id>.jpg", ...}`). If publishing isn't possible from the routine session, say so in the final message; the user can ask any Claude session to republish.
10. **Final message** (short, Danish): the new dishes, one line each, and whether the page was republished.
