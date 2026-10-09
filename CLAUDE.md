# CLAUDE.md: handoff notes for agents

MeetsClone is a mobile-first browser virtual pet inspired by *Tamagotchi Meets / On*. It's plain JavaScript (ES modules) on a custom pixel engine, with no build step and no dependencies. It is hosted on GitHub Pages at https://garrettgivre.github.io/MeetsClone/ from the repo `garrettgivre/MeetsClone`. All art and names are original. `README.md` lists the features; `docs/STYLE.md` has the art rules.

The owner plays it as an installed app on an Android phone (Chrome, full screen) and sends screenshots from there. Design for that first.

## Where things stand (v0.18.0, 8 October 2026)

Everything is committed, pushed and live. `npm test` passes (88 tests).

**One pixel scale: done.** The owner asked for the whole game to render at a single pixel size ("Yes make it consistent and look nice", then "continue the one pixel scale pass for the rest"). It shipped in four releases:
- v0.16.7: the font and the home-screen symbols.
- v0.17.2: every other small sprite redrawn by hand as an `hdSprite` at twice its old grid: the foods, toys, tub, suds, bubbles, toilet, syringe, sweep wave, cane, ring, the Clean-menu icons (`src/art/icons.js`) and the wardrobe icons.
- v0.17.3: the scenes that were plain rectangles got backdrops built like town places (see "Scenes that aren't places" under Town art), plus a hand-pixelled bus, train, balloon and rope post (`src/art/props-travel.js`).
- v0.17.4: rules and dividers are one fine pixel thick (`scr.rule`); the Status portrait and the wardrobe preview stand on backdrops.

What is left of it, all small:
- The three lens grids in `src/art/wardrobe-icons.js` (glasses, shades, monocle) are still 1x `sprite`s. Nothing draws them. Redraw them when clothes go onto the pet.
- The bus, train and balloon are toy-sized next to a pet (the bus is 72 fine pixels long; a pet's canvas is 128). They never share the screen with one, and I did not ask the owner whether they should be bigger.
- I viewed every new sprite and scene at zoom in the browser pane, not on a phone.

**Other open items**
- **Clothes on the pet: hats and face items are done (v0.18.0); the rest is not.** The owner said "Sure start on the clothing" after I proposed three passes. Done: the six hats and five face items, in `src/art/pets/clothes.js`, drawn by `drawHat` and `drawFaceWear` in `src/game/pet-art.js` (see "Clothes" under Pet art). Still to draw, in the order I proposed:
  1. neckwear on the neck socket: `bowtie`, `tie`, `scarf`, `sash`;
  2. body clothes, the cape and shoes: `sweater`, `overalls`, `dress`, `collar`, `apron`, `cape`, `shoes`. These have to follow each form's body, so expect a drawing per form.
  Items that are not drawn can still be bought and "worn"; nothing tells the player they won't show. Glasses, shades and the monocle have no list icon in the wardrobe.
- **Pets are still drawn in double-size pixels.** A pet is composed on a 64×64 grid and `sprite-pet.js` paints each of its pixels as a 2×2 fine block, so the pet is the one thing on screen at the old pixel size. I told the owner when I found it (8 October); they said to leave the pet as it is for now, then asked for two examples at the smaller scale. Those are a mock-up only: Kitsu and Gloop, each hand-drawn in one piece in `tools/fine-pets.js`, shown beside today's pets by `tools/fine-pets.html`. Nothing in the game uses them. A real redraw would mean every part in every form.
- **Not yet seen on a real phone by me:** the LCD filter's cell grid (it could shimmer at some screen densities) and the care-alert status-bar badge. The owner has confirmed that installing and alerts work.
- **Ideas the owner has heard and not picked up:** a daycare or sitter, room decorations (wallpaper, bedding, furniture; the room is now built to allow it), seasons and holidays, Meet Codes, twins, mail and visitors, gardening, daily goals, a taller screen so short phone viewports have no side strips, a pick-list at the cottages, job-specific minigames.

## What the owner wants (read this before doing anything)

- **Pixel art is drawn by hand, pixel by pixel. Never use a script to generate or draft it.** The owner's words: "Don't use a script for the pixel art make it yourself pixel by pixel". Write the text grid row by row in the art file. A check that only reports row lengths or stray characters is fine, because it draws nothing. Splicing hand-typed rows into a file with a small script is fine too. Code is still fine for sky, light and pattern fills inside scenes.
  - The older drafting scripts (`tools/art-scripts/town_kit.py`, `pet_kit.py`, `draft.py`, `props_draft.py`, `ed.py`) made earlier art and are kept only for reference. Do not use them for new work.
  - The three gold buttons (`src/art/buttons.js`) came from a script that is now deleted. The owner said they are fine as they are.
- **One pixel scale, cohesive look.** Anything new is drawn at the fine size: an `hdSprite`, a prop, or a backdrop built from props. Never add a 1x `sprite`.
- **Original, in the spirit of Tamagotchi.** The official town maps and backgrounds are the quality bar; match their quality, not their layouts. No clip-art, no cheap-looking pixel art, no rudimentary shapes: objects are props, not rectangles drawn in code.
- **Charm:** faces on buildings and objects, lettered signs, marquee bulbs, hanging stars and hearts, sticker halos, mushroom houses, cone trees. Dense around the edges, clear in the middle. Pets should show every gene.
- **Light from the upper left.** Hue-shifted shading (cool shadows, warm lights), outlines in a darker shade of the object's own colour.
- **Think about function before drawing.** For the menu icons the owner asked me to "think about their function and what they contain" and redesign from scratch; the header of `src/art/menu-icons.js` records what each one shows and why.
- **Process:** look at every art change in the browser at zoom before pushing; never say art looks good without viewing it. Commit and push each finished change straight to `main`. Then say plainly what was done, what was checked and what is left. The owner asks for broad passes; do a real chunk, verify it, push it, and list the remainder rather than claiming the whole thing.

## Run, test, deploy

```bash
npm test          # node --test tests/*.test.js (Node 22, no deps): 88 tests, all must pass
npm start         # static server on http://localhost:5173 (http-server, cache off)
```

- **Preview:** use the preview tools, not Bash, to run the server. `.claude/` is gitignored, so create `.claude/launch.json` if it's missing:
  ```json
  { "version": "0.0.1", "configurations": [ { "name": "game", "runtimeExecutable": "npx",
    "runtimeArgs": ["-y", "http-server", "-p", "5173", "-c-1", "--silent"], "port": 5173 } ] }
  ```
  If port 5173 is already served by another chat's server, the browser tools in this chat can't reach it: add a second configuration on another port (same command with `-p 5174`, `"port": 5174`) and start that one. A different port has its own `localStorage`, so it is a separate test save and the owner's game is never touched.
- **Deploy:** every push to `main` runs the tests and deploys to Pages (`.github/workflows/pages.yml`). The owner wants each finished update committed and pushed straight to `main`; no PRs.
  - **Check the deploy after every push.** The `gh` CLI is not installed, but the repo is public:
    ```bash
    curl -s "https://api.github.com/repos/garrettgivre/MeetsClone/actions/runs?per_page=3"   # look at "conclusion"
    curl -s "https://garrettgivre.github.io/MeetsClone/src/version.js?t=$(date +%s)" | tail -1   # the live version
    ```
    A deploy takes about a minute. On 8 October the `deploy-pages` step failed on GitHub's side for v0.16.7 although the tests passed; the site stayed a version behind and the owner reported it as "the update check doesn't work". If a deploy fails, push another commit to run it again.
  - The workflow copies named files into `_site`. A new top-level file (like `sw.js`) must be added to that `cp` line or it won't be published.
- **Version:** bump `src/version.js` with every release (`VERSION`, plus a phrase in the history comment above it). Patch for art and polish, minor for a mechanics change. Open games only notice a release if the version changed (see "Updates").
- **Commits:** end every message with `Co-Authored-By: Claude <noreply@anthropic.com>` (use the current model name). Write the message to a file and use `git commit -F` (see the Git Bash gotcha). The "LF will be replaced by CRLF" warnings are harmless.

## Layout

```
index.html, style.css      page shell: the screen flush to the top and sides, a navy strip below with three gold buttons (A next, B select, C back), the #glass layer for the LCD filter
manifest.webmanifest, sw.js, assets/   the installable app: full-screen display, PNG icons, the service worker
src/main.js                boot, the frame loop, sizing (resize), install, background alerts, app.setFilter
src/update.js              the check for a newer release
src/notify.js              care alerts through the service worker
src/ui.js                  LAYOUT, colours, dialog, ListMenu
src/engine/                palette (64 colours, ramps like 'pink.0'..'pink.3'; mutedLut), screen (framebuffer, LCD filter), sprite (sprite, hdSprite), font, input, audio
src/game/                  pet.js (simulation), genetics, items, save/migrate, book.js (Gene Book), town.js (places, residents, jobs), pet-art.js (pet rendering), alerts.js, cheats.js
src/scenes/                home, room, menus, status, minigames, jumprope, family, genebook, wardrobe, debug, ending, town (TownScene, TravelScene, PlaceScene, NewsScene, PhotoScene)
src/art/pets/              pet art: per-form part grids (forms/*.js), face parts (face.js), patterns, egg, clothes worn on the pet (clothes.js)
src/art/menu-icons.js      the ten home-screen menu icons, hand-pixelled hi-res sprites
src/art/buttons.js         the three gold buttons (UP and DOWN grids) and paintButtons
src/art/icons.js           status symbols, foods, toys, bath and toilet sprites, all hand-pixelled hdSprites (`FINE` adds the colours the shared key lacks)
src/art/wardrobe-icons.js  the clothes' list icons
src/art/props.js           town props (text grids with colour roles)
src/art/props-home.js      the home room's props, hand-pixelled; registers them with defineProp
src/art/props-travel.js    the bus, train engine and carriage, balloon and jump-rope post
src/art/town.js            the drawing kit, the 23 town backdrops (SCENES) and the home room (homeRoom)
tests/                     art, book, care, discipline, font, genetics, pet, save, town
tools/                     review pages (parts, founders, gallery, compare, lab, town, props, icons, wardrobe), dump.mjs, the sprite editor, old art scripts
docs/STYLE.md              art rules;  docs/PLAN.md  the original plan (its Architecture section is out of date);  docs/RESEARCH.md  notes on the device
```

## Screen, sizes and coordinates

- **Two grids in one framebuffer.** Scene code works in normal pixels (128×224). The framebuffer is 256×448 fine pixels. `scr.rect`, `panel`, `rule` and `draw` take normal pixels; `hpset`, `hrect` take fine ones; bitmaps flagged `hd` and `hdSprite`s are drawn one fine pixel per cell. `scr.rule(x, y, w, c, bottom)` is a divider one fine pixel thick, the same weight as a panel outline; the old two-pixel `hline`, `vline`, `box` and `dither` are gone.
- **Sprites:** `hdSprite(rows, key)` is drawn at fine density with no upscaling; its `w` and `h` are in normal pixels, so its grid must have an even width and height. `sprite(rows)` is the old 1x grid that `scr.draw` upscales with Scale2x; only the unused lens grids still use it. `scr.draw` options: `frame`, `flip`, `ctx` (colour context), `solid`, `remap` (a palette-to-palette table such as `mutedLut()`).
- **Font** (`src/engine/font.js`): `FINE` holds each glyph as ten fine rows, hand-drawn; widths are twice the old 3×5 lettering so every layout kept its place (`tests/font.test.js` enforces that). `SMALL` is the old lettering, kept for signs painted into town backdrops (`glyphRows`). A new character needs rows in both. There is no `&`.
- **Screen layout** (`LAYOUT` in `src/ui.js`, normal pixels): status bar 0-12, top icon row 12-34, room 34-190, bottom icon row 190-212, info bar 212-224. The bars are open sky (see "The sky round the room"); an icon is drawn in greys (`MUTED`, or `MUTED_DAY` on a bright sky, in `home.js`) until the cursor is on it. The info bar shows only the highlighted menu's name.
- **Page sizing** (`resize()` in `main.js`): the canvas takes the full width, or the height left above the buttons, whichever runs out first. `--px` is set to the size of one normal game pixel; the buttons (32×36 art pixels), their gap and their offsets are all measured in it, so they match the game's scale. `BUTTON_ROWS` is the strip's height in game pixels. On a short viewport (a phone browser with its toolbars) thin strips show at the sides; removing them would need a taller logical screen.
- **Pets:** composed on a 64×64 sprite canvas (`PW`, `PH` in `pet-art.js`), feet 3 rows above the bottom. Each pet pixel is drawn as a 2×2 block of fine pixels, so pets (and the clothes on them) are at the old pixel size.
- **Town backdrops and the home room:** each is a 256×312 fine bitmap (`RW`, `RH`).
  - Town: `HZ = 172` is the horizon or floor line, `FEET = 228` is where pets stand; your pet is at about x 76, the resident at about x 188, a keeper's child at about x 230; the action buttons cover roughly y ≥ 250.
  - Home: pets stand at `HOME_FEET = 256`.
  - `k.layer('front')` … `k.layer('back')` draws over the pets. Use it only for corner framing.

## The home room

`homeRoom(sky, dark)` in `src/art/town.js` builds it like a town place from the props in `src/art/props-home.js` (`homeWindow`, `petBed`, `nightLamp`, `wallShelf`, `sproutPot`, `heartFrame`, `toyChest`), one cached picture per time of day plus a lights-off version (`dim` keeps the shapes as moonlit half-tones). The window panes are holes: `src/scenes/room.js` draws the sky, sun and cloud, or moon and stars, and then the room over them. The garland is drawn after the window so it hangs in front. The toy chest and plant are on the front layer (`drawRoomFront`). Room decorations would slot in by swapping props or colours in `homeScene`.

## The sky round the room

The owner asked for the dark blue areas outside the room to show the sky the window looks out on (v0.17.5).
- `src/scenes/room.js` holds one sky picture the size of the whole screen per state (`SKY`: four bands, dithered seams at `SEAMS`). `drawRoom` copies the part behind the window panes; `drawSkyBars` copies the parts above and below the room (status bar, icon rows, info bar) and adds twinkling stars at night or small drifting clouds by day. Lights off counts as night.
- `drawSkyBars` returns `{ sky, dark, top, bottom }`. `drawBars` in `home.js` writes in ink on a bright sky and in white at night, and passes the top and bottom colours to `app.pageSky` (`main.js`), which colours the notch area and the button strip (a shade deeper when the LCD filter is on, to match the filtered screen). The navy in `style.css` only shows until the first frame.
- Text or sprites added to the bars must read on both a pale sky and a dark one; check day, dawn, dusk and night by setting `app.game.simTime`.

## Town art

- **Props** are text grids. Colour roles: `1-4` leaf, `5-8` wood, `a-d` accent, `e-h` stone, `A-D` wall, `r s t u` roof, `x y z Z` glass (each darkest to lightest); fixed `w` white, `k` ink, `m` mist, `v` silver, `n` grey; `.` empty. Scenes recolour them: `k.prop(name, x, y, { accent: 'pink', wood: 'brown', flip, halo: 'white' })`, anchored at the bottom centre. `rampOf()` maps neutral colours onto a ramp.
- **New props** go in `props-home.js` or a similar file with `defineProp(name, rows)`, written by hand. Every row of a prop must be the same width (short rows are padded on the right, which shifts nothing but hides mistakes; check lengths).
- **Scenes:** `SCENES.<id>(k)` draws with the kit `k`. Shapes: `rect`, `block`, `ellipse`, `disc`, `puff`, `blob`. Scenery: `field`, `trail`, `canopy`, `pcloud`, `horizonClouds`, `mountain`, `frame`, `tree`, `bush`. Interiors: `wall`, `tiles`, `planks`, `shelf`, `counter`, `lightPool`, `beam`, `vignette`. Charm: `sign`, `face`, `bulbs`, `starString` (hearts option), `heart`, `sun`, `signpost`, `lamp`. Floors paint over everything below the horizon, so draw things that stand on the floor after it.
- **Scenes that aren't places** are in `SCENES` too and are fetched with `backdrop(id)`: `playfield` and `ropefield` (the minigames; pets stand at y 260), `matchmaker` (pets at y 184), `photo0`..`photo3` (the painted backdrops behind studio photos, album pages and the Status portrait), `trip` and `tripSky` (the journey), `farewell` (a pet that died). The wedding uses `chapel`, the wardrobe preview `boutique`, and a runaway's ending the home room with the `LETTER` sprite.
- **Things that move across a scene** (vehicles, passing trees, clouds) are props turned into bitmaps with `propBitmap(name, colours)`; `bm.at` is the anchor. `TravelScene` in `src/scenes/town.js` slides them past with `slide()`; the road, track and path are fine-pixel fills in `drawWay()`.
- **Review pages** (need the local server): `tools/town.html?only=park&z=3&pets`, `tools/town.html?scene=playfield,trip` for scenes that aren't places, `tools/props.html?z=4&only=a,b,c`, `tools/icons.html?z=6&only=TUB,riceball`.
- `tests/town.test.js` renders every backdrop and runs every place action. A syntax error in `town.js` fails it with "Unexpected identifier"; run `node --check src/art/town.js`.

## Pet art

- **Parts are text grids** (`src/art/pets/part.js`): `1-4` body ramp (1 darkest, the lit outline; 2 shadow; 3 base; 4 light), `5-8` accent ramp, `e E F` eye colour, `- 9 0 +` hair ramp, `o`/`k` ink, `w` white. Sockets: `@`/`*` face (small/large), `^` top, `=` neck, `[ ]` ears, `< >` arms, `( )` wings, `! ?` feet, `~` tail, `#` the part's own pivot. Left-side parts face left; the right side is mirrored.
- **Every part is drawn for every form** (`forms/<form>.js`: biped, blob, quad, floater, serpent, avian). Face parts are shared in `face.js` in sizes S and L.
- **The renderer** (`src/game/pet-art.js`) joins head to body at the neck sockets, hangs the other parts on theirs, recolours patterns inside the drawn shading, softens seams between same-colour parts, moves the forehead mark if hair hides it, then draws the face. It reports `seen` pixels per part, `offFace` and `overflow` for the tests.
- **Shading rules** are in `docs/STYLE.md`. Each head allele has its own silhouette in every form and each body allele its own texture.
- **Clothes** (`src/art/pets/clothes.js`) are parts at the pet's own pixel size; `5 6 7 8` take the item's colour from `CLOTHES`. A hat's pivot lands on the top edge of the head (`headTops`, measured before hair and toppers go on) in the column of the head's `top` socket, and goes on over hair and toppers. Glasses are a ring round each eye in three sizes; the renderer picks the smallest that clears the eye and adds the bridge. Shades set `eyesHidden`, so `sprite-pet.js` doesn't redraw the eyes for a blink. The bandage and star sticker go on the brow over one eye and only show where there is pet under them. Babies and children don't dress. Review page: `tools/wardrobe.html?slot=head&s=120` (`&pets=Kitsu,Hoolet`, `&only=cap,shades`); `tests/art.test.js` checks every item on every head, eye and form.
- **Checks:** `node tools/dump.mjs Kitsu+wings=feathered adult` prints a composed pet as characters. Review pages: `tools/parts.html?gene=head&z=6`, `tools/founders.html?grid` (`&stage=child`, `&sil`), `tools/gallery.html?gene=wings&form=biped`, `tools/compare.html`, `tools/lab.html`. `tests/art.test.js` checks every allele in every form, sockets, canvas fit, that every part shows, and that faces never land on an outline; run it after any grid change.
- **Candidates:** the baby and child shapes (plain blobs with a face), the egg, the lamb cheeks on the small quad and serpent heads.

## Genetics

`src/game/genetics.js`. Each gene has two alleles; dominance follows the `GENES` numbers (3 common … 1 rare); ties are a coin flip made once at conception (`express`). Forms are codominant. An ancillary part paired with `none` is always a coin flip. Colours blend (30%) or drift a step round the wheel; neutrals don't blend; accent never equals body colour. `randomGenome` starts from a founder line and adds one to three twists. `resemblance`, `childOdds` and `carried` support the Pairing Lab and Status page. Generation 1 is a plain starter that grows into a founder chosen by care (`founderFor`); from generation 2 looks come only from genes.

## Care, skills, jobs, alerts, cheats

- **Hygiene** (`pet.dirt`, 0-4): rises while awake, faster with poop about. `isDirty` at 3 (more illness); at 4 `needs()` returns `'dirty'`. `bathe()` clears it. `drawDirt` in `home.js` paints mud onto the pet's own silhouette.
- **Toilet** (`pet.squirm`, `pet.potty`): the pet squirms `TOILET_WARN` before a poop; `toilet()` saves the mess; at `POTTY_TRAINED` it goes by itself. The Clean icon opens a menu (sweep, bath, toilet); tapping a squirming pet is the shortcut.
- **Skills** (`pet.skills`: smart, creative, fit, charm): `train(pet, skill, points)`, `SKILL_STEP` points a level, `SKILL_MAX` levels. Sources: school classes (two a day), good minigames (`finishGame({ skill })`), chatting, swimming, the playground, performing, work shifts. `marry` passes a third to the egg.
- **Jobs** (`JOBS` in `town.js`, `pet.job = { id, shifts }`): `applyJob` checks the skill level; a shift pays `jobPay` and promotes every `SHIFTS_PER_RANK` shifts.
- **The player's pet has no old age.** It stays an adult until it marries, or dies or runs away from neglect.
- **Alerts:** `alertFor(events, pet)` in `alerts.js` picks and words the most urgent event; `notify.js` shows it through `sw.js` with `assets/badge.png` as the status-bar shape. While the page is hidden a slow timer in `main.js` advances the clock and sends alerts. There is no push server, so nothing arrives once the browser has closed or suspended the page. The browser pane blocks notifications, so test with a stand-in and ask the owner to check on the phone.
- **Debug menu** (`src/scenes/debug.js`, logic in `src/game/cheats.js`): cheats are on with `?dev` or the Cheats row (`settings.cheats`); `app.dev` covers both. It can grow or change the pet, set needs, illness, dirt and training, skip time, open and age the town, fill the toy box, send a test alert.

## The town's generations

- `src/game/town.js`, section "residents". Nothing is stepped: who keeps a place and how old they are follows from `game.simTime - town.epoch` plus a per-place `phase`. `clockOf` gives `{ gen, pos }`.
- A tenure is `TENURE` (14 days; the owner found 6 too short): a teen for `JUNIOR`, a child born at `HEIR_AT` (baby, child, then teen), old from `ELDER_AT`, then the child takes over. `AGELESS` places (hidden village, Star Isle, the cottages) never change.
- `keeper(seed, locId, gen)` builds a family forward: generation 0 is the fixed resident every game shares; each later one is `inherit(parent, spouse)` from a seed that includes `town.seed`. Titles (`TITLES`) stay with the place. `resident(locId)` with no game still returns the first keeper; `resident(locId, game)` returns today's, with `stage`, `junior`, `elder`, `heir`, `parent`, `inLaw`.
- `townState()` calls `turnTown`, which files news (`town.news`, last 12, `town.unread`) and halves the friendship at each handover. `town.met` drives the NEW marker on the map.
- **Singles:** `sibling()` is the keeper's brother or sister; `singles(game)` lists the free ones; `findMatch` (used by `MatchmakerScene`) swaps one in about half the time; `weddingBells` (called before `marry`) records the match, adds two hearts and files news.
- **Sunset Cottages:** `retirees(game)` is the previous keeper of every place; `resident('cottages', game)` returns Gran Willow or the retiree picked by `town.cottage`.
- Tests that count days at one place should call `freshKeeper` (in `tests/town.test.js`) first, or a handover can land in the middle.

## The LCD screen filter

- Settings > Screen filter (`settings.lcd`, on by default). The owner asked for something that hides the pixels a little and feels like a 90s handheld, "not just blurry", and then for it to cover the buttons too.
- `app.setFilter(on)` in `main.js` is the one switch. It calls `scr.setFilter`, repaints the buttons with the same treatment (`paintButtons(true)`), and sets `body.lcd`.
- `Screen.present()` (`src/engine/screen.js`) keeps the plain 256×448 frame off-screen and composes the visible canvas at three times that size: the frame enlarged with hard edges; the same frame again, offset down and right and multiplied in faintly (dark shapes cast a soft shadow, like LCD segments over their backing); then the grid of cells (`lcdCell`). The canvas's `image-rendering` becomes `auto`, so the browser smooths only the last small step.
- Under `body.lcd`, `style.css` shows `#glass` (a sheen and a vignette over the whole device, taps pass through) and lays the cell grid over the button strip. The page's colour comes from `app.pageSky`, which deepens it the way the filter deepens the screen.
- With the filter off the canvas is the plain frame with `image-rendering: pixelated`. Anything that reads pixels from the visible canvas must allow for both sizes (`scr.canvas.width` is 256 or 768).
- To tune: the shadow's `globalAlpha` (0.2) and offset in `present()`, the grid's two alphas in `lcdCell()`, the gradients on `#glass`.

## Updates, install, offline

- There is no build step, so file names never change and browsers would keep old copies. `sw.js` answers every same-origin GET from the network first with `cache: 'no-cache'` and keeps the last good copy in the `meetsclone-offline` cache for when there is no connection.
- `checkForUpdate()` in `src/update.js` runs at boot, whenever the page becomes visible, and every five minutes: it fetches `src/version.js` uncached, and if `VERSION` differs it saves the game and reloads (not more than once every three minutes for the same version). After the reload the home screen says "Updated to vX". The regex in `latestVersion()` reads the line `export const VERSION = '…';`; keep that line's shape.
- **Install:** Settings > Install app keeps the `beforeinstallprompt` event (`app.install()` in `main.js`) and shows Chrome's dialog directly. Chrome's own menu install fails on the owner's phone ("already installed", then "could not open app"), probably because another of their apps, Room for Two, is installed from the same site; the in-game button works and the owner prefers it. The manifest `id` is `/MeetsClone/app`; don't change it again.
- The manifest asks for `display: fullscreen`. An installed copy picks up manifest changes only when Chrome next refreshes it (up to a day, or a reinstall).
- **App icons:** installers need PNGs. `python tools/art-scripts/app_icons.py` renders `assets/icon-*.png`, `apple-touch-icon.png` and `badge.png` from the 16×16 grid typed in that script (it enlarges a hand grid; it does not draw). `badge.png` must stay a white silhouette on transparent, because Android uses only its alpha.

## Working in this repo: things that cost me time

- **The browser pane is often hidden, and then the game's frame loop doesn't run.** A screenshot or a read of the canvas shows a stale or blank picture. Force a frame first: `app.scenes[0].draw(app.scr); if (app.scenes.length > 1) app.scene.draw(app.scr); app.scr.present();`. `window.app` is exposed for this.
- **To judge art at zoom,** copy part of the game canvas into a larger canvas with smoothing off and screenshot that, or use the review pages. Set states through the cheats: `const C = await import('/src/game/cheats.js')`. Time-skip cheats can kill the test pet; `app.reset()` starts it over.
- **Check at phone size** (`resize_window` to about 412×883 for the owner's phone, and 390×664 for a browser with toolbars), and reset the viewport afterwards.
- **Git Bash heredocs mangle backslashes and quotes.** Write Python scripts and commit messages to files (the scratchpad is fine) and run them by path.
- **Checking hand-typed grids:** a wrong row length shifts nothing visibly but breaks the drawing. A small Node script that reads an art file, groups consecutive quoted rows and prints any row whose length differs from its neighbours (and any `hdSprite` grid with an odd width or height) catches it; it draws nothing, so it is within the owner's rule.
- **A scene left on the stack keeps running** while the browser pane is visible. When forcing frames for a screenshot, set `scene.update = () => {}` first, or a wedding will finish and marry the test pet. For many exact edits I used a small `patch(path, [(old, new), ...])` helper that fails unless each `old` matches exactly once.
- **Saves:** `migrate` in `src/game/save.js` fills in new pet fields and merges new settings from `newGame`. Add defaults there whenever the pet's shape changes; `tests/save.test.js` and `tests/care.test.js` cover it.
- **Seeded tests are sensitive to anything that changes how often a pet falls ill.** A long unattended stretch in a test can kill the pet; top up needs, cure and clean as the helpers in `tests/care.test.js` do.
- **Old script notes, for reading history only:** `setpart` in `ed.py` drops a part's options unless they're passed back; `redraw_head` and `paint_body` in `pet_kit.py` stack their changes if run on an already-modified grid.
