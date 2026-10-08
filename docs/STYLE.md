# Pet Art Style Guide

Pets are hand-pixelled characters in a classic colour-screen virtual pet style, drawn with the charm of collectible creature games. Every founder is drawn by hand in `src/art/founders.js`. Children are assembled from the hand-pixelled **parts kit** (`src/art/kit.js`) in the same style. See "Genetics and the parts kit" below.

## Canvas and scale
- **Sprite size:** about 38–42 × 42–46 pixels for an adult founder.
- **On screen:** each sprite pixel is one normal screen pixel (2×2 at the game's double density). Small sprites keep every pixel deliberate.
- **Anchor points**, set per founder:
  - `eyes`: centre of each eye.
  - `eyeSize`: the eye box, for closing eyes.
  - `face`: skin colour, for covering eyes.
  - `mouth`: mouth position.
  - `neck`: the first body row; the head bobs above it.
  - `floats`: hovers with a dotted shadow.

## Proportions
- **Head:** about 70% of the height, roughly 28–32px wide.
- **Body:** a small rounded body with stubby arms tucked against the sides, and short feet.
- **Silhouette:** must read on its own, with one signature feature that's obvious at a glance. Examples:
  - Mogumo: a big muzzle.
  - Kometchi: a comet.
  - Ducklet: a bill.
  - Pipolin: tall ears.
  - Lumipom: a bob and pom-poms.
  - Spookit: horns.

## Line
- **1px outlines everywhere.**
- **Selective outlining:**
  - `O` (lit outline): a dark shade of the part's own colour, on top and left edges facing the light.
  - `o` (shadow outline): navy ink, on bottom and right edges.
- **Inner lines** (muzzle edges, bib scallops, bangs) use a darker shade of the colour, not ink, so they stay soft.
- **Curves step evenly** (1, 1, 2, 3…), with no doubled corner pixels.

## Light and colour
- **Light comes from the upper left.**
- **Shading per part:**
  - `2` base.
  - `3` a rounded light cluster on the upper left, not a diagonal band.
  - `4` one small shine spot.
  - `1` a shadow band on the lower right and under the head (the "neck shadow").
- **Palette:** each founder has a small curated palette of 2–3 ramps plus ink, white and blush, mapped through the sprite `key`. Keep it tight.
- **Eyes:**
  - Ink with a white glint in the upper left.
  - Coloured eyes fade to the iris colour at the bottom.
  - Girls get a single eyelash pixel at the outer top.

## Expressions (generated from anchors, no extra frames to draw)
| Pose | What happens |
|---|---|
| idle | the drawn sprite |
| breathe | head bobs 1px above `neck` |
| hop | whole sprite up 1px (walking) |
| blink / sleep | eye boxes filled with skin, a content curve drawn |
| happy / wink | ^ eyes; open mouth with a tongue pixel |
| sad / sick | droopy closed eyes |
| dizzy | X eyes |
| eat / chew | open mouth / mouth line |

## Clothes on founders
Hats (at `FIT.top`), glasses (at the eyes) and ties or bowties (at `FIT.neck`) fit any founder. Full outfits (dresses, overalls…) aren't drawn for hand-made bodies yet.

## Workflow for a new character
1. Block in the silhouette with `node tools/sketch.mjs <name>` (layered ellipses and triangles).
2. Paint over it by hand: outline pass, light clusters, signature features, face.
3. Check it at 8× and at game size in `tools/founders.html`, including the expression sheet.
4. Fix stray pixels, uneven curves and anything that hurts readability at game size.

## Genetics and the parts kit
- **Founders** are drawn as whole characters.
- **Children** are built at the same sprite size by `src/game/render-kit.js` from:
  - **Kit parts** (eyes, mouths, noses, marks, cheeks, ears, toppers, tails, wings, arms, feet, hair pieces), each hand-pixelled in role colours (`1-4` body, `5-8` accent, `e E F` eyes, `- 9 0 +` hair) so genes can recolour them.
  - **Founder-only parts transcribed pixel for pixel from the founders:**
    - Mogumo: bear ears, muzzle, droopy eyes, paws.
    - Kometchi: cat ears, comet, star mark, tail, legs.
    - Ducklet: bill, cowlick, flippers.
    - Pipolin: bunny ears, twin tails, tiny feet, heart cheeks.
    - Lumipom: pom-poms, fairy wings, bob.
    - Spookit: horns, spikes, moon mark, devil tail.

    A child that inherits one shows the founder's actual pixels.
- **Heads and bodies** are shaped by genes (`shape`, `size`, `build`) and painted with the founder rules:
  - The lit outline is the darkest shade of the part's own colour, with ink on the shadow side.
  - A rounded light cluster with a white shine pixel.
  - A one-pixel shadow band on the lower right, and a neck shadow under the head.
- **Hair** sits a pixel beyond the skull for volume and is outlined in its darkest shade, with two strand lines and a gloss row.
  - Fringes: pointed bangs, Lumipom's notched blunt bob, spiky, curly.
- **Review tool:** `tools/compare.html` shows each founder next to the kit version of its own genes, plus founder-pair children, wild pets, growth stages and expressions. Use it after any art change.
