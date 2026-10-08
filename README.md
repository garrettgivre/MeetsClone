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
- **Generation 1:** the quality of your care decides which of 6 original founders your pet becomes: Kitsu the ember fox, Gloop the cherry jelly, Fleece the cloud lamb, Glimmer the lantern jellyfish, Inchy the garden caterpillar or Hoolet the moon owlet. Every pet is hand-pixel art with breathing, blinking and expression animation (see `docs/STYLE.md`).
- **Six body plans:** biped, blob, four-legged, floater, serpent and bird. A pet's form is a gene, and every body part is drawn separately for every form, so a lamb-line child with a jellyfish's body plan still looks hand-made.
- **Founders are the genetic lines:** every body part belongs to exactly one founder, and no two founders share a part. The Pairing Lab shows which line each part comes from.
- **Genetics:** every trait has two alleles with dominance, so recessive traits can skip a generation.
  - Body plans are codominant (a coin flip between the parents), colours can blend or drift around the colour wheel, and rare mutations happen.
  - Base parts every pet has: head, body, eyes, ears, mouth, markings and forehead mark. Optional parts: tail, topper, feet, nose, wings and hair. Plus body, accent, eye and hair colour.
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
src/art/                  all pixel art (sprites as text grids); pets in src/art/pets/forms/
src/game/                 simulation, genetics, rendering, items, saving
src/scenes/               home, menus, status, minigames, family, endings
tests/                    node --test unit tests for game logic
tools/sprite-editor/      in-browser editor for the sprite format
tools/gallery.html        preview growth stages, expressions, poses and every option of each gene (?gene=tail&form=quad)
tools/parts.html          every hand-drawn part: one row per allele, one column per form
tools/lab.html            Pairing Lab: breed any two pets, inspect genes, odds, random pairings, lineages
tools/founders.html       founder review sheets (?f=Name&s=560 for one, ?grid for the set, ?grid&sil for silhouettes)
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
