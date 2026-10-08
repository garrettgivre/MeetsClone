# Build Plan

How we'll recreate the Tamagotchi Meets experience (see [RESEARCH.md](RESEARCH.md)) as a website, hosted free on **GitHub Pages**, using a **custom pixel engine** and **original pixel art**.

## Guiding decisions

| Decision | Choice | Why |
|---|---|---|
| Platform | Static website on GitHub Pages | Free, no server, and every push deploys |
| Language | Plain JavaScript (ES modules), HTML, CSS | No build step. Open `index.html` through a local server and it runs |
| Rendering | Our own engine on one `<canvas>` | Full control of the pixel look. No game framework |
| Screen | **128 × 224 portrait** logical pixels, scaled to fill a phone screen (whole numbers from 3× up) | Mobile-first, with a bigger display than the device |
| Colour | **64-colour indexed palette** (14 four-shade ramps + 7 neutrals) | Gives the device's look and makes colour genes cheap (swap palette entries) |
| Input | 3 buttons: **A** (next), **B** (select), **C** (back) | Same as the device. Mapped to on-screen buttons, keyboard and touch |
| Saving | `localStorage`, plus export/import of a save file | Works offline. Players can back up and move devices |
| Social | **Meet Codes** (a short text code or QR for a pet) | Recreates device-to-device meetings without a server |
| Art & names | 100% original | Bandai owns the characters. Mechanics are free to reuse |

> **Name:** decided later, once more of the game is built. `MeetsClone` is the working title.

## Architecture

```
index.html            device shell (CSS) + canvas + 3 buttons
src/
  main.js             boot, load assets, start the loop
  engine/
    loop.js           fixed 30 Hz update, render on requestAnimationFrame
    screen.js         128×128 indexed framebuffer → canvas (palette lookup)
    palette.js        master palette, palette-swap tables
    sprite.js         sprite + animation format, draw/flip/remap
    font.js           custom bitmap font (5×7) and text boxes
    input.js          A/B/C from keys, clicks, touch, key repeat
    audio.js          WebAudio square-wave "beeper" + sound effects
    scenes.js         scene stack (push/pop/replace)
    rng.js            seeded random (for reproducible genetics/tests)
  game/
    pet.js            pet state, stats, stages
    clock.js          real time, pause, offline catch-up
    care.js           hunger/happy decay, poop, sickness, sleep, death
    genetics.js       genome, inheritance, colour mixing
    characters.js     gen-1 evolution tree (care → character)
    economy.js        Gotchi Points, inventory, shops
    unlocks.js        rule engine for location/theme unlocks
    social.js         residents, friendship, propose, matchmaker
    meetcode.js       encode/decode pets to share codes
    save.js           save/load/migrate versions
  scenes/             home, menu, status, food, toilet, medicine,
                      items, room, travel, location, park, shop,
                      wedding, nursery, album, settings, games/*
  data/               JSON: foods, items, locations, residents,
                      parts, palettes, unlock rules
assets/sprites/       sprite JSON produced by the editor
tools/sprite-editor/  our in-browser pixel art editor
tests/                node --test unit tests for game/ logic
```

**Key engine ideas**
- The **framebuffer is a `Uint8Array` of palette indexes**. Each frame it's converted to RGBA through the current palette and drawn with `putImageData`. The canvas is scaled with CSS `image-rendering: pixelated`.
- **Sprites are text grids** in JSON (one character = one palette index). They're easy to read in diffs, easy to edit by hand, and easy for the editor to produce.
- **Characters are assembled from parts** (body, eyes, headgear, accessory). Each part has anchor points, so any combination lines up. **Body colour is a palette remap**, so one sprite covers every colour.
- **Game logic is separate from drawing**, so the simulation can run in Node for tests and for the offline catch-up.

## Data models (first draft)

```js
Pet = {
  id, name, gender: 'm'|'f', generation,
  stage: 'egg'|'baby'|'child'|'teen'|'adult',
  bornAt, stageStartedAt, adultActiveMs,
  stats: { hunger: 0-4, happy: 0-4, poop: 0-4, sick: bool, criticalCount },
  asleep, paused, droppedOff,
  genome: {
    body:      [alleleA, alleleB],  // part ids, one from each parent
    eyes:      [a, b],
    headgear:  [a, b],
    accessory: [a, b],
    color:     [a, b],              // palette-ramp ids
  },
  phenotype: { body, eyes, headgear, accessory, color }, // what's shown
  diet: { colorFoodCounts, favouriteFoodCounts },
  parents: [petId, petId], family: [...],
}
```

**Inheritance rule:** each part slot holds two alleles. The child gets one random allele from each parent. Which one shows is random, weighted toward the parents' visible parts. This lets grandparent traits come back, as on the device. Colour can be either parent's, a **blend** (a midpoint ramp in the palette), or a rare random colour.

## Roadmap

Each phase ends with something playable that's pushed and live on GitHub Pages.

### Phase 0: Setup (½ day)
- Pick the game's title. Add `index.html`, `src/`, and a dev-server note (`npx serve` or `python -m http.server`).
- Turn on GitHub Pages (Settings → Pages → deploy from `main`). Add `node --test` and a GitHub Actions check that runs the tests.
- **Done when:** a blank device shell is live at `garrettgivre.github.io/MeetsClone`.

### Phase 1: Pixel engine (2–3 days)
- Framebuffer, palette, integer scaling, game loop, scene stack.
- Sprite drawing with animation frames, flipping and palette remap.
- Bitmap font and text boxes, A/B/C input, beeper audio.
- **Done when:** a test sprite bounces around, text renders, and the buttons beep.

### Phase 2: Art pipeline and style guide (2–3 days, then ongoing)
- **Sprite editor** in `tools/sprite-editor/`: palette picker, pencil, fill, frames, onion skin, anchor points, export to JSON.
- Style guide: palette, sizes (egg/baby 16×16, child/teen 24×24, adult part canvas 32×32), 2-frame idle animations, outline rules.
- **First art set:** egg, 2 babies, 1 child, 1 teen, about 4 of each part type, UI icons, home room.

### Phase 3: Pet simulation (3–4 days)
- Real-time clock, pause, and **offline catch-up** (simulate the time the page was closed).
- Stats decay, poop, sickness, sleep schedule, critical state and death.
- Stage changes on the timings in RESEARCH.md. A **developer speed-up** (for example ×60) for testing.
- Saving, loading and save-version upgrades. Unit tests for all of it.

### Phase 4: Home and care menus (3–4 days)
- Home scene: the pet wanders and reacts, with poop, sickness and sleep shown.
- Menu bar: Status, Food, Toilet, Medicine, Items, Room, Travel, Games, Settings.
- Fridge with meals and snacks (snacks capped at 3), eating animations, a "refuse" reaction.
- **Done when:** you can raise a pet from egg to adult in a browser.

### Phase 5: Characters and genetics (4–5 days)
- Assembling characters from parts, and colour remap.
- Gen-1 evolution tree driven by care quality.
- Genome inheritance, colour blending, and diet-based colour changes (5 coloured meals).
- A **fortune-teller preview** of a future child.
- Seeded tests that check the inheritance odds.

### Phase 6: Economy and items (3 days)
- Gotchi Points, a home shop, the item box, toys (with per-pet favourites), accessories worn on the pet, room backgrounds and menu themes.

### Phase 7: Minigames (1–2 days each)
- At launch: **Jump Rope** (timing, aim for 30) and one more original game.
- Later: one game per location (our own versions of sushi, trampoline, surfing and so on).
- Shared minigame framework: intro, play, score, then points earned.

### Phase 8: Travel, locations and residents (5–7 days)
- The location template: Park, Shop, Activity, Propose.
- Start with 3 to 4 original locations: a hotel with **Drop-Off**, a food street, a farm with daily watering, and a toy park.
- Residents with liked items, friendship levels, chat bubbles, and proposing.
- **Unlock rule engine** (data-driven: "ate X N times", "used item Y in gen ≥ 2", "visited after 7 PM"). Each location unlocks a menu theme.

### Phase 9: Marriage and generations (3–4 days)
- **Matchmaker** that brings a partner with a random genome.
- Wedding scene, baby announcement, parents leaving, and starting the next generation.
- **Family album:** a family tree of every generation, with portraits drawn from their genomes.

### Phase 10: Meet Codes (3–4 days)
- Pack a pet's genome and name into a short code (base32, with a checksum) and a QR image.
- Enter a friend's code to have their pet visit: play date, friendship, propose. This replaces Bluetooth meetings.
- *Optional later:* live meetings over WebRTC, or a small backend.

### Phase 11: Polish and launch (ongoing)
- Make it an installable **PWA** that works offline. Add notifications when the pet needs care, if the player allows them.
- Sound settings, a colour-blind–friendly status mode, phone layout.
- More locations, parts, foods and minigames, added as content updates.

**Rough total:** about 6 to 8 weeks part-time for a full first version. Phases 0–4 (a playable virtual pet) take about 2 weeks.

## Decisions made (Oct 2026)
- Portrait 128×224 screen, mobile-first, with a 64-colour palette.
- Timings match the original device.
- Pets can die and can run away.
- All art is original and drawn in the style of colour-screen virtual pets: a big head on a small body, navy outlines, pastel fills, glossy eyes and blush.
- Expanded genetics beyond the device: 13 visible traits + 3 temperament genes, two alleles each, with dominance, colour blending and mutations. An **outfit** gene was added.
- Meet Codes will replace device-to-device meetings.

## Status
- **First build (done):** Phases 0, 1, 3, 4 and 5, most of 6 and 9, and the first minigame from Phase 7.
- **Since then:** Phase 8 (the town: 22 places in four districts plus a hidden village, residents, travel passes), three more minigames, discipline, weight and the Gene Book; then baths and toilet training, skills, school classes and jobs, and care alerts (v0.14).
- **Note:** the Architecture and Data models sections above are the original plan and no longer match the code. `CLAUDE.md` has the current layout.
- **Next:** Meet Codes (Phase 10), twins, seasons and holidays, and room decorations.
