# CLAUDE.md: handoff notes for agents

MeetsClone is a mobile-first browser virtual pet inspired by *Tamagotchi Meets / On*. It's plain JavaScript (ES modules) on a custom pixel engine, with no build step and no dependencies. It is hosted on GitHub Pages at https://garrettgivre.github.io/MeetsClone/ from the repo `garrettgivre/MeetsClone`. All art and names are original. Start with `README.md` for features and `docs/` for depth.

## Run, test, deploy

```bash
npm test          # node --test tests/*.test.js (Node 22, no deps): 85 tests, all must pass
npm start         # static server on http://localhost:5173 (http-server, cache off)
```

- **Preview:** use the preview tools, not Bash, to run the server. `.claude/` is gitignored, so create `.claude/launch.json` if it's missing:
  ```json
  { "version": "0.0.1", "configurations": [ { "name": "game", "runtimeExecutable": "npx",
    "runtimeArgs": ["-y", "http-server", "-p", "5173", "-c-1", "--silent"], "port": 5173 } ] }
  ```
  If port 5173 is already served by another chat's server, the browser tools in this chat can't reach it: add a second configuration on another port (same command with `-p 5174`, `"port": 5174`) and start that one. A different port has its own `localStorage`, so it starts a fresh game.
- **Deploy:** every push to `main` runs the tests and deploys to Pages (`.github/workflows/pages.yml`). The owner wants each finished update **committed and pushed straight to `main`**; no PRs are needed. The `gh` CLI is not installed here, so check the Actions tab on GitHub if you need the deploy status.
- **Version:** bump `src/version.js` with every release (`VERSION` plus the one-line history in the comment above it). Settings shows the version number. Patch for art and polish, minor for a mechanics change.
- **Commits:** end every commit message with `Co-Authored-By: Claude <noreply@anthropic.com>` (use the current model name). Write the message to a file and use `git commit -F`; see the Git Bash gotcha below.

## Layout

```
index.html, style.css      page shell: the screen flush to the top, a navy strip below with 3 unlabelled buttons (A next, B select, C back; art in src/art/buttons.js)
src/engine/                pixel engine: palette (64 colours, ramps like 'pink.0'..'pink.3'), screen, sprite, font, input, audio
src/game/                  simulation (pet.js), genetics, items, save/migrate, Gene Book (book.js), town state (town.js), pet rendering (pet-art.js), alert wording (alerts.js), debug cheats (cheats.js)
src/scenes/                home, room, menus, status, minigames, family, gene book, wardrobe, debug menu, town (TownScene / TravelScene / PlaceScene / PhotoScene)
src/notify.js, sw.js       care alerts: browser notifications through the service worker
src/update.js, sw.js       update check at start; the service worker fetches files fresh and keeps an offline copy
src/art/pets/              pet art: per-form part grids (forms/*.js), face parts (face.js), patterns, egg
src/art/menu-icons.js      the ten home-screen menu icons: hi-res sprites (28×28 at double density) made with `hdSprite`, with their own colour KEY
src/art/props.js           hand-pixelled TOWN props (text grids with colour roles)
src/art/props-home.js      the home room's props, pixelled by hand (same colour roles)
src/art/town.js            the 22 town backdrops: a drawing kit + one function per place in SCENES
tests/                     unit tests (art coverage, genetics, pet sim, save, town, book, discipline, care: baths, toilet, skills, jobs, alerts, cheats)
tools/                     review pages + art scripts (see below)
docs/STYLE.md              art rules for pets AND town (read before drawing anything)
docs/PLAN.md               architecture, roadmap and status;  docs/RESEARCH.md  notes on the original device
```

## Screen and coordinates

- **Logical screen:** 128×224. The page has no bezel: `resize()` in `main.js` scales the canvas to fill the width (or the height above the button strip, whichever runs out first), so on a short viewport thin strips of shell show at the sides. Pets and town art are drawn at double density (HD = 2) on a 256×448 layer.
- **Pets:** composed on a 64×64 sprite canvas (`PW`, `PH` in `src/game/pet-art.js`), feet 3 rows above the bottom. Adults are roughly 40 to 50 px tall, so a part has very few pixels to make its point.
- **Town backdrops** (and the home room): each is a 256×312 hi-res bitmap (`RW`, `RH`).
  - `HZ = 172` is the horizon or floor line, and `FEET = 228` is where pets stand.
  - In a place, your pet stands at about x 76 and the resident at about x 188 (hi-res).
  - The action buttons cover roughly y ≥ 250.
  - Keep the middle of the floor clear, and put detail around the edges.
- **Front layer:** `k.layer('front')` … `k.layer('back')` draws over the pets (via `frontdrop(id)`). Use it only for corner framing.

## Pet art: how it works

- **Parts are text grids** (`src/art/pets/part.js`): `1-4` body ramp (1 = darkest, the lit outline; 2 shadow; 3 base; 4 light), `5-8` accent ramp, `e E F` eye colour, `- 9 0 +` hair ramp, `o`/`k` ink, `w` white. Socket markers sit in the grid: `@`/`*` face (small/large), `^` top, `=` neck, `[ ]` ears, `< >` arms, `( )` wings, `! ?` feet, `~` tail, `#` the part's own pivot. Left-side parts face left; the right side is mirrored.
- **Every part is drawn for every form** (`src/art/pets/forms/<form>.js`: biped, blob, quad, floater, serpent, avian), so any mix of genes fits. Each form file holds heads, bodies, ears, hair, toppers, tails, feet, wings, arms, the baby and child shapes, and `order` (draw order). Face parts (eyes, mouths, marks, noses) are shared in `face.js` in sizes S and L.
- **The renderer** (`src/game/pet-art.js`) puts the head's neck socket on the body's, hangs every other part on its socket, recolours patterns inside the drawn shading, softens outlines where same-colour parts join (`joinSeams`), moves the forehead mark if hair hides it, then draws the face. It reports `seen` pixels per part, `offFace` and `overflow`, which the art tests use.
- **Shading rules** (full list in `docs/STYLE.md`): light from the upper left; lit outline `1` on the top and left, ink `o` on the bottom and right; a `4` rim just inside the lit edge (deeper near the top), a `2` band inside the dark edge, one `w` glint. Every head allele has its own silhouette in every form (fox cheek tufts and chin, woolly lamb crown and cheek puffs, bug brow ridge, bell scallops, owl flat top and brows, gumdrop double shine) and every body allele its texture (fur ticks, wool curls, feather chevrons, jelly gloss, bell glow, segment bands).
- **Drafting kit:** `tools/art-scripts/pet_kit.py`.
  - `redraw_head(form, allele)` rebuilds a head from its silhouette and sockets: mask → house shading (`shade`) → the allele's silhouette mod (`MODS`) → interior `details`. Run it on the *committed* plain grid, not on an already-modified head, or the mods stack (see `restore_body` for the git-show trick).
  - `paint_body(form, allele)` paints a texture inside an existing body silhouette (sockets and outlines untouched); `restore_body(form, allele)` fetches the git HEAD grid first so a repaint starts clean.
  - `tools/art-scripts/ed.py` has `show`, `rows_of`, `setpart`, `setall`, `widen` and the zone helpers for hand edits; `setpart` must be given a part's options string again (e.g. `"{ pivot: [3, 3] }"`) or they're dropped.
  - `node tools/dump.mjs Kitsu+wings=feathered adult` prints a composed pet as characters, the quickest way to see what a head or arm hides.
- **Review pages:** `tools/parts.html?gene=head&z=6` (every allele × every form), `tools/founders.html?grid` (`&stage=child`, `&sil`, `?f=Kitsu&s=400` for one big), `tools/gallery.html?gene=wings&form=biped` (one gene on a plain pet), `tools/compare.html` (founders, children of founder pairs, wild pets, growth, expressions), `tools/lab.html` (the Pairing Lab, with carried alleles, odds and who a child takes after).
- **Tests** (`tests/art.test.js`): every allele exists in every form; heads and bodies have their sockets; founders, children and wild pets fit the canvas at every stage; every founder part and every optional part shows in every form (≥ 3 px); eyes, nose and mouth never land on an outline; the forehead mark always shows. Run them after any grid change; they catch most mistakes before you look.

## Genetics: how it works

- `src/game/genetics.js`. Each gene has two alleles; dominance follows the `GENES` numbers (3 common … 1 rare); ties are a coin flip made once at conception (`express`). Forms are codominant. An ancillary part paired with `none` is **always** a coin flip, whatever its rarity, so wings, plumes and tendrils can show in a first mixed litter (before v0.13 `none` beat every rare part).
- Colours blend (30%) or drift a step round the wheel; neutrals (brown, cream, slate) don't blend. Accent never equals body colour.
- `randomGenome` (matchmaker partners, town residents, the lab) starts from a founder line, usually in fresh colours, and adds one to three twists, so wild pets look like coherent creatures. `resemblance(child, mom, dad)` counts who a child takes after. `childOdds` simulates a pairing; `carried` lists hidden alleles.
- Generation 1 is a plain starter that grows into a founder chosen by care (`founderFor`); from generation 2 looks come only from genes. Star Isle's wish sets both alleles of a part on the next egg.

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
  - Pass ramp *characters* (e.g. `'7'`) to `px`, `hl` and `vl`, never ramp names: `hl(g, …, 'wood')` corrupts the row.
- **Tests:** `tests/town.test.js` renders every backdrop and runs every place action. A syntax error anywhere in `town.js` fails it with "Unexpected identifier"; run `node --check src/art/town.js`.

## What the owner cares about (art direction)

- **Original but in the spirit of Tamagotchi:** the town maps (UraTama Town, Tama Street, the space town) and the official backgrounds are the quality bar. Match their quality, not their layouts.
- **No clip-art or cheap-feeling pixel art, and no rudimentary shapes.** Objects should be hand-pixelled props, not rectangles and lines drawn in code. Code is fine for light, pattern and sky.
- **Pixel art is drawn by hand, pixel by pixel. Do not use a script to generate or draft it** (the owner, October 2026: "Don't use a script for the pixel art make it yourself pixel by pixel"). Write the text grid row by row in the art file. A check that only reports row lengths is fine. The drafting scripts in `tools/art-scripts/` (`town_kit.py`, `pet_kit.py`, `icon_kit.py`) made earlier art and are kept for reference; don't reach for them for new work. Still drafted by script and not yet redone by hand: the ten menu icons (`src/art/menu-icons.js`) and the three device buttons (`src/art/buttons.js`).
- **Charm:** buildings and objects with faces, lettered signs, marquee bulbs, hanging stars and hearts, sticker halos, mushroom houses and cone trees. Scenes should be dense around the edges but feel natural. Pets should show every gene: a child with a lamb head should look woolly even without wool hair.
- **Light from the upper left.** Shading is hue-shifted (cool shadows, warm lights), with outlines in a darker shade of the object's own colour.
- **Process:** after art changes, look at the result in the review pages (screenshot and zoom) before pushing. For big redesigns, outline the plan first. The owner asks for broad passes ("improve all the art", "continue improving the pet art"): pick the weakest pieces by looking, fix them in batches, verify, push, and say what's left.

## Care, skills and alerts: how it works (v0.14)

- **Hygiene** (`pet.dirt`, 0 to 4): rises while awake, faster with poop about. `isDirty` at 3 (more illness), and at 4 `needs()` returns `'dirty'`, an attention call. `bathe()` clears it. The home screen paints mud splats onto the pet's own silhouette (`drawDirt` in `home.js`) and plays the tub animation (`TUB`, `SUDS`, `BUBBLE` in `icons.js`).
- **Toilet** (`pet.squirm`, `pet.potty`): `TOILET_WARN` minutes before a poop the pet squirms (a `squirm` event). `toilet()` saves the mess and counts a catch; at `POTTY_TRAINED` the pet goes by itself (a `toilet` event, no poop). The Clean icon opens a menu (sweep, bath, toilet); tapping a squirming pet is the shortcut.
- **Skills** (`pet.skills`, four of them, `SKILL_STEP` points per level, `SKILL_MAX` levels): `train(pet, skill, points)`. Sources: school classes (`lesson` in `town.js`, two a day), `finishGame({ skill })`, chatting, swimming, the playground, performing and work shifts. `marry` passes a third to the egg.
- **Jobs** (`JOBS` in `town.js`, `pet.job = { id, shifts }`): `applyJob` checks the skill level, `workShift` pays `jobPay` and promotes every `SHIFTS_PER_RANK` shifts. A pet with no job is a Helper.
- **Alerts:** `alertFor(events, pet)` in `src/game/alerts.js` picks the most urgent event and words it; `src/notify.js` shows it through `sw.js`. `main.js` runs a slow timer while the page is hidden (the frame loop stops then) that advances the pet's clock, sends the alert and flags the tab title. There is no push server, so nothing arrives once the browser has closed or suspended the page.
- **Debug menu** (`src/scenes/debug.js`, logic in `src/game/cheats.js`): cheats are on with `?dev` or the Cheats row (`settings.cheats`); `app.dev` covers both. A cheat that returns events is played on the home screen by `done()`.

## The town's generations: how it works (v0.15)

- `src/game/town.js`, section "residents". Nothing is stepped: who keeps a place and how old they are is worked out from `game.simTime - town.epoch` plus a per-place `phase` (so handovers are spread through the week). `clockOf` gives `{ gen, pos }`.
- A tenure is `TENURE` (14 days; the owner found 6 too short): a teen for `JUNIOR`, a child born at `HEIR_AT` (baby, child, then teen), old from `ELDER_AT`, then the child becomes the next keeper. `AGELESS` places (hidden village, Star Isle, the cottages) never change. The player's own pet has no old age: it stays an adult until it marries or is neglected.
- `keeper(seed, locId, gen)` builds a family forward: generation 0 is the fixed resident every game shares; each later one is `inherit(parent, randomGenome)` from a seed that includes `town.seed`, so families differ per save but never change within one. Titles (`TITLES`) stay with the place.
- `resident(locId)` with no game still returns the first keeper (the art tests and photos rely on it); `resident(locId, game)` returns today's keeper with `stage`, `junior`, `elder`, `heir` and `parent`.
- `townState()` calls `turnTown`, which compares the clock with `town.gens` / `town.born`, files news (`town.news`, last 12, with `town.unread`) and halves the friendship at each handover. `town.met` drives the NEW marker on the map.
- `PlaceScene` draws the keeper at their stage, the heir beside them, and a cane and a doze for elders. Debug > Town has "Age the town" (moves `town.epoch` only).
- **Singles:** `sibling(seed, locId, gen)` is the keeper's brother or sister (same two parents; the out-of-town parent is kept as `spouse` on the keeper). `singles(game)` lists those whose keeper has taken over but has no child yet. `findMatch` (used by `MatchmakerScene`) wraps `findPartner` and swaps in a single about half the time; `weddingBells` (called before `marry`) records `town.wed`, adds two hearts and files news.
- **Cottages:** `retirees(game)` is the previous keeper of every place (so each lives there for one tenure). `resident('cottages', game)` returns Gran Willow or the retiree picked by `town.cottage`; `nextCottager` steps on. The backdrop is `SCENES.cottages`.
- Tests that count days at one place should call a helper like `freshKeeper` in `tests/town.test.js` first, or a handover can land in the middle.

## Updates: how the newest version always shows (v0.14.2)

- There is no build step, so file names never change between releases and browsers would otherwise keep old copies (Pages lets them for ten minutes, and installed apps for longer).
- `sw.js` answers every same-origin GET from the network first with `cache: 'no-cache'`, and keeps the last good copy in the `meetsclone-offline` cache for when there is no connection. It is registered at start-up for everyone.
- `src/update.js` `checkForUpdate()` runs at boot and whenever the page becomes visible: it fetches `src/version.js` uncached, and if `VERSION` differs from the running one it saves the game and reloads once (a `sessionStorage` guard stops loops). After the reload the home screen says "Updated to vX".
- **So every release must bump `src/version.js`**, or open games won't notice it.
- The regex in `latestVersion()` reads the line `export const VERSION = '…';`; keep that line's shape.

## Status (v0.16.2, October 2026)

- **Done:**
  - Pet life cycle, care, discipline, weight, baths and toilet training.
  - Skills, school classes and jobs with promotions.
  - Care alerts (browser notifications) and a debug menu of cheats.
  - A town that grows up: residents age, have children, retire and are succeeded, with town news.
  - Genetics with six body plans and six founders (see "Genetics" above; v0.13 fixed the `none` dominance bug and made wild pets line-based).
  - Wardrobe, shops and points.
  - Four minigames.
  - Matchmaker, wedding and generations.
  - Gene Book.
  - The town: 23 places in four districts plus a hidden village, with residents, friendship, gifts, travel passes and the Star Isle wish.
  - Town art: every town object is a hand-pixelled prop (about 117 props). v0.12.8 redrew the big buildings and machines (arcade cabinets, claw machine, oven, keep, towers, tent, shop and town-hall fronts) and added an escalator, a hospital bed, curtained windows and concert-hall fans.
  - Pet art: v0.13.0 proper wings and tendrils on every form; v0.13.1 signature head silhouettes and body textures in every form; v0.13.2 rounded lamb crowns, cloud-puff tails, swept hair tufts, domed nub ears.
- **Next ideas** (from `docs/PLAN.md`): Meet Codes (share a pet by code), twins, seasons and holidays, and room decorations. Smaller ones: a daycare or sitter, mail and visitors, gardening, daily goals, and job-specific minigames. For the town: shops that change a little with each keeper, visiting a retired keeper who is your pet's in-law, and a family tree per place.
- **Known gap:** clothes from the wardrobe are stored and shown in menus but `pet-art.js` does not draw them on the pet.
- **Confirmed by the owner on Android Chrome (October 2026):** Settings > Install app installs the game, and care alerts arrive. The browser pane here blocks notifications, so alert changes can only be tested with a stand-in; ask the owner to check on the phone.
- **Pet-art candidates:** the baby and child shapes (plain blobs with a face; could carry more of the line), the egg, and the lamb cheeks on the small quad and serpent heads (still a little pointed).
- **Town-art candidates:** the salon mirrors, the boutique clothes rack and the school blackboard.
- **The home room** (v0.16.1) is built like a town place: `homeRoom(sky, dark)` in `src/art/town.js` lays out props (`homeWindow`, `petBed`, `nightLamp`, `wallShelf`, `sproutPot`, `heartFrame`, `toyChest`, hand-pixelled in `src/art/props-home.js`, which registers them with `defineProp`) with the town kit, one cached picture per time of day plus a lights-off version (`dim`). The window panes are holes: `src/scenes/room.js` draws the sky, sun, cloud, moon and stars first and the room over them. Pets stand at `HOME_FEET` (256), lower than in town, and the front layer (toy chest, plant) is drawn over the pet by `drawRoomFront`. Room decorations would slot in here: swap props or colours in `homeScene`.

## Gotchas

- **Saves:** `src/game/save.js` `migrate` fills in new pet fields. Add defaults there whenever the pet shape changes, and keep old saves loading; `tests/save.test.js` covers this.
- **Deploy list:** the Pages workflow copies named files into `_site`. A new top-level file (like `sw.js`) must be added to that `cp` line or it won't be published.
- **Menu icons:** `tools/art-scripts/icon_kit.py` rewrites `src/art/menu-icons.js` from masks (one function per icon). Hand edits made in the JS file are lost if the script is run again, so either edit the script or stop running it. Other UI sprites in `icons.js` are still 1x grids that `scr.draw` upscales; `hdSprite(rows, key)` is the way to draw one at full density.
- **Installing on Android:** the owner also has Room for Two installed from the same site (`garrettgivre.github.io/Room-For-Two/`). Chrome's menu install then says MeetsClone is "already installed" and "could not open app". The likely cause is that Chrome's install sheet checks for an installed app per site, not per app (not confirmed). Changing the manifest `id` to `/MeetsClone/app` (v0.14.5) did not help; leave it as it is now, since a new id makes installed copies look like a different app. v0.14.6 added Settings > Install app, which keeps the `beforeinstallprompt` event (`app.install()` in `main.js`) and shows Chrome's dialog directly. That worked, and the owner prefers it to the browser menu.
- **Full screen:** the manifest asks for `display: fullscreen` (the game has its own clock in the status bar). An installed copy only picks up manifest changes when Chrome next refreshes it, which can take a day or a reinstall. `installState` in `main.js` treats both `fullscreen` and `standalone` as installed.
- **App icons:** installers need PNGs, not the SVG. `badge.png` is the status-bar shape for care alerts: Android uses only its alpha, so it must stay a white silhouette on transparent. `python tools/art-scripts/app_icons.py` regenerates `assets/icon-*.png` and `apple-touch-icon.png` from the 16×16 grid in that script; keep it in step with `assets/icon.svg`.
- **Fonts:** the pixel font (`src/engine/font.js`, `glyphRows`) has letters, digits, basic punctuation and `★ ♥ ▶ ◀ ♂ ♀`, but no `&`.
- **Town colours:** `rampOf()` in `town.js` maps neutral colours (white, mist, ink…) onto a ramp for prop roles.
- **Git Bash heredocs mangle backslashes:** a `python - <<'EOF'` script containing `\\` (Windows paths, regex) fails with a unicode-escape error, and `git commit -m` with a heredoc is unreliable. Write Python scripts and commit messages to files (the scratchpad is fine) and run them by path.
- **Part options:** `setpart` from `ed.py` replaces the whole `key: part([...], opts)`; pass the options string back or pivots, `front`, `under` and `spread` are lost. Heads have no options; ears, tails, hair and the small child shapes do.
- **Don't stack generated mods:** `redraw_head` and `paint_body` add features to whatever grid they're given. Start from the committed grid (`git show HEAD:...`) when regenerating, or the crown grows a crown.
- **Accuracy:** don't claim art looks good without viewing it; render it and check at zoom. `tools/dump.mjs` is the text-level check for pets.
