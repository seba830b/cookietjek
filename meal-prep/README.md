# Lazy Prep

Doven comfort food med meal prep. Kombi-mikro med airfry, 1 pande, 1 gryde, ingen ovn.

- `index.html`: åbn den på mobilen. Plan, opskrifter og indkøbslister på én side. Afkrydsninger gemmes på telefonen, og der er en portions-slider.
- `weekly-plan.md`: 10 måltider i 5 stilarter og prepdagen trin for trin, ca. 85 min (110 min første gang).
- `recipes.md`: 5 baser + 10 retter.
- `shopping-list.md`: ugens indkøbsliste med priser fra Netto, Rema 1000 og Lidl, ca. 324 kr.
- `starter-list.md`: alt til alle 10 opskrifter, holdbarhed og hvor du finder det i Svendborg.

Kilden ligger i `src/`: `data.mjs` (alt indhold), `fmt.mjs` (mængder), `template.html` (siden) og `build.mjs`.
Byg med `node src/build.mjs .` fra denne mappe.
