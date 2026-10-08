# CLAUDE.md: handoff notes for agents

MeetsClone is a mobile-first browser virtual pet inspired by *Tamagotchi Meets / On*. It's plain JavaScript (ES modules) on a custom pixel engine, with no build step and no dependencies. It is hosted on GitHub Pages at https://garrettgivre.github.io/MeetsClone/ from the repo `garrettgivre/MeetsClone`. All art and names are original. Start with `README.md` for features and `docs/` for depth.

## Run, test, deploy

```bash
npm test          # node --test tests/*.test.js (Node 22, no deps): 60 tests, all must pass
npm start         # static server on http://localhost:5173 (http-server, cache off)
```

- **Preview:** use the preview tools, not Bash, to run the server. `.claude/` is gitignored, so create `.claude/launch.json` if it's missing:
  ```json
  { "version": "0.0.1", "configurations": [ { "name": "game", "runtimeExecutable": "npx",
    "runtimeArgs": ["-y", "http-server", "-p", "5173", "-c-1", "--silent"], "port": 5173 } ] }
  ```
- **Deploy:** every push to `main` runs the tests and deploys to Pages (`.github/workflows/pages.yml`). The owner wants each finished update **committed and pushed straight to `main`**; no PRs are needed.
- **Version:** bump `src/version.js` with every release (`VERSION` plus the one-line history in the comment above it). Settings shows the version number.
- **Commits:** end every commit message with `Co-Authored-By: Claude <noreply@anthropic.com>` (use the current model name).

## Layout

```
index.html, style.css      device shell (portrait, phone-first, 3 buttons A/B/C)
src/engine/                pixel engine: palette (64 colours, ramps like 'pink.0'..'pink.3'), screen, sprite, font, input, audio
src/game/                  simulation (pet.js), genetics, items, save/migrate, Gene Book (book.js), town state (town.js), pet rendering
src/scenes/                home, menus, status, minigames, family, gene book, wardrobe, town (TownScene / TravelScene / PlaceScene / PhotoScene)
src/art/pets/              pet art: per-form part grids (forms/*.js), face parts, patterns
src/art/props.js           hand-pixelled TOWN props (text grids with colour roles)
src/art/town.js            the 22 town backdrops: a drawing kit + one function per place in SCENES
tests/                     unit tests (art coverage, genetics, pet sim, save, town, book, discipline)
tools/                     review pages + art scripts (see below)
docs/STYLE.md              art rules for pets AND town (read before drawing anything)
docs/PLAN.md               architecture, roadmap and status;  docs/RESEARCH.md  notes on the original device
```

## Screen and coordinates

- **Logical screen:** 128×224. Pets and town art are drawn at double density (HD = 2) on a 256×448 layer.
- **Town backdrops:** each is a 256×312 hi-res bitmap (`RW`, `RH`).
  - `HZ = 172` is the horizon or floor line, and `FEET = 228` is where pets stand.
  - In a place, your pet stands at about x 76 and the resident at about x 188 (hi-res).
  - The action buttons cover roughly y ≥ 250.
  - Keep the middle of the floor clear, and put detail around the edges.
- **Front layer:** `k.layer('front')` … `k.layer('back')` draws over the pets (via `frontdrop(id)`). Use it only for corner framing.

## Town art: how it works

- **Props** (`src/art/props.js`): each prop is a text grid.
  - Colour roles: `1-4` leaf, `5-8` wood, `a-d` accent, `e-h` stone, `A-D` wall, `r s t u` roof, `x y z Z` glass. Each ramp runs from darkest to lightest.
  - Fixed colours: `w` white, `k` ink, `m` mist, `v` silver, `n` grey.
  - Scenes recolour props per role: `k.prop(name, x, y, { accent: 'pink', wood: 'brown', flip, halo: 'white' })`. The anchor is the **bottom centre**.
  - `halo` draws a sticker-style outline.
- **Scenes** (`src/art/town.js`): `SCENES.<id>(k)` draws with a kit `k`.
  - Basic shapes: `rect`, `block`, `ellipse`, `disc`, `puff`, `blob`.
  - Scenery: `field`, `trail`, `canopy`, `pcloud`, `horizonClouds`, `mountain`, `frame`.
  - Interiors: `wall`, `tiles`, `planks`, `shelf`, `counter`, `lightPool`, `beam`, `vignette`.
  - Charm helpers: `sign` (lettering in the game font), `face` (the Tamagotchi face), `bulbs`, `starString` (with a hearts option), `heart`, `sun`, `signpost`.
  - **Draw order matters:** floors (`tiles`, `planks`) paint over everything below the horizon. Anything standing on the floor must be drawn *after* the floor.
- **Review pages** (each needs the local server):
  - `tools/town.html`: every backdrop. Add `?only=park&z=3` to enlarge one place, and `&pets` to see two pets for scale.
  - `tools/props.html`: every prop. `?z=4&only=a,b,c` shows chosen props; a single name shows four colourways.
- **Making props:** draft with `tools/art-scripts/town_kit.py`, which has the `G`, `box`, `ell`, `tline`, `disc`, `outline` and `write_props` helpers (see its docstring), plus mask painters: build a silhouette as a set of cells (`rr_mask`, `ell_mask`, `rect_mask`, set unions) and `shade` it for the house look; `stones` and `bricks` lay irregular masonry and `circle` draws a glinting ball. The v0.12.8 props (cabinet, claw, oven, keep, tent, escalator, bed, window, fans) were drafted this way, then checked in the review pages.
  - On Windows / Git Bash, write Python to a file and run it; complex heredoc quoting breaks.
  - Pass ramp *characters* (e.g. `'7'`) to `px`, `hl` and `vl`, never ramp names: `hl(g, …, 'wood')` corrupts the row.
- **Tests:** `tests/town.test.js` renders every backdrop and runs every place action. A syntax error anywhere in `town.js` fails it with "Unexpected identifier"; run `node --check src/art/town.js`.

## What the owner cares about (art direction)

- **Original but in the spirit of Tamagotchi:** the town maps (UraTama Town, Tama Street, the space town) and the official backgrounds are the quality bar. Match their quality, not their layouts.
- **No clip-art or cheap-feeling pixel art, and no rudimentary shapes.** Objects should be hand-pixelled props, not rectangles and lines drawn in code. Code is fine for light, pattern and sky.
- **Charm:** buildings and objects with faces, lettered signs, marquee bulbs, hanging stars and hearts, sticker halos, mushroom houses and cone trees. Scenes should be dense around the edges but feel natural.
- **Light from the upper left.** Shading is hue-shifted (cool shadows, warm lights), with outlines in a darker shade of the object's own colour.
- **Process:** after art changes, look at the result in the review pages (screenshot and zoom) before pushing. For big redesigns, outline the plan first.

## Status (v0.13.2, October 2026)

- **Done:**
  - Pet life cycle, care, discipline and weight.
  - Genetics with six body plans and six founders. v0.13: an ancillary part paired with `none` is a coin flip whatever its rarity (before, `none` beat every rare part, so wings, plumes and tendrils could never show in a first mixed litter); `randomGenome` (matchmaker partners, residents, the lab) starts from a founder and adds one to three twists, so wild pets look coherent; `resemblance()` says who a child takes after (shown in the lab).
  - Wardrobe, shops and points.
  - Four minigames.
  - Matchmaker, wedding and generations.
  - Gene Book.
  - The town: 22 places in four districts plus a hidden village, with residents, friendship, gifts, travel passes and the Star Isle wish.
  - Many art passes: every town object is now a hand-pixelled prop (about 117 props). v0.12.8 redrew the big buildings and machines (arcade cabinets, claw machine, oven, keep, towers, tent, shop and town-hall fronts), added an escalator, a hospital bed, curtained windows and three concert-hall fans (`fanA`..`fanC`).
- **Next ideas** (from `docs/PLAN.md`): Meet Codes (share a pet by code), twins, seasons and holidays, and room decorations.
- **Pet art notes:** v0.13.1 gave every head allele a signature silhouette in all six forms and every body allele a texture; wings and tendrils are drawn properly for every form. The drafting kit is `tools/art-scripts/pet_kit.py`: `redraw_head(form, allele)` rebuilds a head from its silhouette and sockets (mask -> house shading -> allele mods and details), `paint_body(form, allele)` paints a texture inside an existing body, `restore_body` fetches the git HEAD grid before a repaint. Review in `tools/parts.html?gene=head&z=5`, `tools/founders.html?grid` and `tools/compare.html`. v0.13.2 rounded the lamb crowns (bumps only along the flat top), turned the puff tail into a three-lobed cloud, swept the hair tuft into two spikes and domed the nub ears. Next pet-art candidates: the baby and child shapes (plain blobs with a face), and the egg.
- **Art polish candidates:** the home room in `src/scenes/room.js` (its window, shelf, plant and lamp are still drawn in code), the salon mirrors, the boutique clothes rack and the school blackboard.

## Gotchas

- **Saves:** `src/game/save.js` `migrate` fills in new pet fields. Add defaults there whenever the pet shape changes, and keep old saves loading; `tests/save.test.js` covers this.
- **Fonts:** the pixel font (`src/engine/font.js`, `glyphRows`) has letters, digits, basic punctuation and `★ ♥ ▶ ◀ ♂ ♀`, but no `&`.
- **Town colours:** `rampOf()` in `town.js` maps neutral colours (white, mist, ink…) onto a ramp for prop roles.
- **Accuracy:** don't claim art looks good without viewing it; render it and check at zoom.
