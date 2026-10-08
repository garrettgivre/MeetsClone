# MeetsClone (working title)

A mobile-first virtual pet for the browser, inspired by the gameplay of *Tamagotchi Meets / Tamagotchi On*. All characters, art and names are original.

## Play

- **Online:** https://garrettgivre.github.io/MeetsClone/
- **Locally:** run a static server from the project folder, then open http://localhost:5173

```bash
python -m http.server 5173
```

**Settings → Debug** links to the Pairing Lab, Character Gallery and Sprite Editor. Add `?dev` to the URL to also unlock cheats there (time speed-up, free points). The version number is at the bottom of Settings.

**Pairing Lab:** open `tools/lab.html` (also on the live site) to test genetics.
- **One pair:** choose two parents (random or founders), see a litter of children with any new traits starred, inspect any child's genes, and use it as a new parent. Shows the odds of every trait from 500 simulated children.
- **Random pairings:** many random couples and their kids at once.
- **Lineage:** follow one family line across several generations.

The seed makes results repeatable, and "Random clothes" previews outfits.

## Controls

| | Button | Keyboard | Touch |
|---|---|---|---|
| Next / move cursor | **A** | ← / → / Z | tap an icon directly |
| Select | **B** | Enter / Space / X | tap a menu row |
| Back | **C** | Esc / Backspace / C | tap the menu title bar |

Tap your pet to give it a pat, and tap poop to clean it up.

## What's in the first build

- **Custom pixel engine:** a 128×224 portrait screen with a 64-colour palette, a bitmap font, square-wave sound and a 30 Hz loop. Pets are drawn at double pixel density (256×448), so they have finer detail than the room and menus. Faces are hand-drawn at that density; other hand-drawn parts are upscaled with Scale2x and their outlines thinned.
- **Life cycle with the device's timings:** egg (3 min), baby (1 h), child (24 h), teen (24 h), adult. Adults can marry after 24 h.
- **Care:**
  - Hunger and happiness hearts, poop, sickness, bedtime and lights.
  - Attention calls and care mistakes.
  - Toothaches from too many snacks.
- **Pets can die or run away:** from untreated illness or starvation, or from long unhappiness.
- **Generation 1:** the quality of your care decides which of 14 original founder characters your pet becomes (Mogumo the sleepy bear, Kometchi the comet kitty, Ducklet, Pipolin the bunny idol, Lumipom the pom-pom fairy, Spookit the little imp, Fawnly the forest fawn, Pupplo the puppy, Hamuchi the hamster, Gillybop the axolotl, Sproutle the plant sprite, Drakko the baby dragon, Bolto the robot and Nocti the night bat). Every pet is hand-pixel art built from the parts kit, with breathing, blinking and expression animation (see `docs/STYLE.md`).
- **Founders are the genetic lines:** every body part in the game belongs to exactly one founder, and no two founders share a part. The Pairing Lab shows which line each part comes from.
- **Genetics:** every trait has two alleles with dominance, so recessive traits can skip a generation.
  - Size blends (small × large = medium), colours can blend or drift around the colour wheel, and rare mutations happen.
  - Looks: head shape, size, eyes, eye spacing, mouth, nose, forehead mark, hair, ears (drawn to scale with the head), top, back, body build, belly, feet, markings, cheeks, a very rare sparkle aura, and body, accent, eye and hair colour.
  - Temperament genes (appetite, energy, taste) change how the pet plays.
  - The status screen shows the hidden genes a pet carries.
- **Clothing is not genetic:** buy hats, glasses, outfits, a cape and shoes in the shop, and dress teens and adults in the Wardrobe (Items menu).
- **Diet colours:** eating a coloured food 5 times changes body colour, and the new colour is passed on to children.
- **Economy:** Gotchi Points, a food and toy shop, favourite foods and toys, and the Jump Rope minigame.
- **Family:** a matchmaker (3 partners a day), a wedding, the next-generation egg, and a family album.
- **Saving:** automatic saves, catch-up for time spent away, and backup and restore codes.

## Project layout

```
index.html, style.css     device shell (portrait, phone-first)
src/engine/               pixel engine: palette, screen, sprites, font, input, audio
src/art/                  all pixel art (sprites as text grids)
src/game/                 simulation, genetics, rendering, items, saving
src/scenes/               home, menus, status, minigames, family, endings
tests/                    node --test unit tests for game logic
tools/sprite-editor/      in-browser editor for the sprite format
tools/gallery.html        preview growth stages, expressions, poses and every part
tools/lab.html            Pairing Lab: breed any two pets, inspect genes, odds, random pairings, lineages
tools/founders.html       founder review sheets (?f=Name&s=560 for one, ?grid for the set)
tools/compare.html        art review: founders, children, wild pets, growth, expressions
tools/sketch.mjs          silhouette drafts for hand-pixelling new characters
docs/                     research notes and the build plan
```

## Development

```bash
npm test
```

Tests run in Node 22 with no dependencies.

### Deploying

Every push to `main` runs the tests and publishes the site with GitHub Actions. This needs a one-time setup in the GitHub repo: go to **Settings → Pages** and set **Source** to **GitHub Actions**.
