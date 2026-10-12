# Lazy Prep

Doven comfort food med meal prep. Kombi-mikro med airfry, 1 pande, 1 gryde, ingen ovn. Handl lørdag, prep søndag, spis hele ugen.

- `index.html`: åbn den på mobilen. Ugens plan, opskrifter og indkøbslister på én side. Der kommer en ny, varieret uge hver uge. Slå hvert måltid til og fra (fx når du spiser i skolen), byt retter, og indkøbsliste, prepplan og pris regnes ud igen. Afkrydsninger gemmes på telefonen, og der er en portions-slider.
- `weekly-plan.md`: uge 42, 10 måltider i 5 stilarter og prepdagen trin for trin, ca. 75 min (100 min første gang).
- `recipes.md`: 5 baser + 30 retter med fotos.
- `shopping-list.md`: ugens indkøbsliste med priser fra Netto, Rema 1000 og Lidl, ca. 395 kr.
- `starter-list.md`: alt til alle 30 opskrifter, holdbarhed og hvor du finder det i Svendborg.
- `ROUTINE.md`: hver fredag morgen tilføjer en planlagt Claude-session 2-3 nye retter, så puljen vokser.

Kilden ligger i `src/`: `data.mjs` (indhold og varer), `recipes/` (retterne), `engine.mjs` (ugeplan, lister og prepplan), `fmt.mjs` (mængder), `template.html` (siden), `check.mjs` (tjek) og `build.mjs`.
Tjek med `node src/check.mjs` og byg med `node src/build.mjs .` fra denne mappe.
