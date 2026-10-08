# MeetsClone (working title)

A mobile-first virtual pet for the browser, inspired by the gameplay of *Tamagotchi Meets / Tamagotchi On*. All characters, art and names are original.

## Play

- **Online:** https://garrettgivre.github.io/MeetsClone/ (once GitHub Pages is turned on, see below)
- **Locally:** run a static server from the project folder, then open http://localhost:5173

```bash
python -m http.server 5173
```

Add `?dev` to the URL for developer options in Settings: a time speed-up and free points.

## Controls

| | Button | Keyboard | Touch |
|---|---|---|---|
| Next / move cursor | **A** | ← / → / Z | tap an icon directly |
| Select | **B** | Enter / Space / X | tap a menu row |
| Back | **C** | Esc / Backspace / C | tap the menu title bar |

Tap your pet to give it a pat, and tap poop to clean it up.

## What's in the first build

- **Custom pixel engine:** a 128×224 portrait screen with a 64-colour palette, a bitmap font, square-wave sound and a 30 Hz loop.
- **Life cycle with the device's timings:** egg (3 min), baby (1 h), child (24 h), teen (24 h), adult. Adults can marry after 24 h.
- **Care:**
  - Hunger and happiness hearts, poop, sickness, bedtime and lights.
  - Attention calls and care mistakes.
  - Toothaches from too many snacks.
- **Pets can die or run away:** from untreated illness or starvation, or from long unhappiness.
- **Generation 1:** the quality of your care decides which of 6 original founder characters your pet becomes.
- **Genetics:** every trait has two alleles with dominance, so recessive traits can skip a generation. Colours can blend and rare mutations happen.
  - Looks: head shape, size, eyes, mouth, ears, top, back, outfit, feet, markings, cheeks, body colour, accent colour and eye colour.
  - Temperament genes (appetite, energy, taste) change how the pet plays.
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
tools/gallery.html        preview founders, growth stages and random genetics
docs/                     research notes and the build plan
```

## Development

```bash
npm test
```

Tests run in Node 22 with no dependencies.

### Deploying

Every push to `main` runs the tests and publishes the site with GitHub Actions. This needs a one-time setup in the GitHub repo: go to **Settings → Pages** and set **Source** to **GitHub Actions**.
