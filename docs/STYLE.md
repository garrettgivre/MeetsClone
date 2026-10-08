# Pet Art Style Guide

Pets are hand-pixelled characters in a classic colour-screen virtual pet style, drawn with the charm of collectible creature games. Every pet, founders included, is assembled from the hand-pixelled **parts kit** (`src/art/kit.js`) by `src/game/render-kit.js`. See "Founders and genetic lines" below.

## Canvas and scale
- **Sprite canvas:** 48 × 52 pixels, feet on row 50. An adult is about 30–40 pixels wide.
- **On screen:** each sprite pixel is one normal screen pixel (2×2 at the game's double density). Small sprites keep every pixel deliberate.
- **Anchors** come from the kit composer: eye centres and box (for closing eyes), face colour, mouth, `neck` (the head bobs above it) and `floats` (hovers with a dotted shadow).

## Proportions
- **Head:** about 70% of the height. **Body:** small and rounded, stubby arms, feet drawn in front of the body.
- **Silhouette:** each founder must read on its own, with one signature feature that's obvious at a glance (Mogumo's muzzle, Kometchi's comet, Pipolin's ears and ribboned tails, Spookit's horns and bandit mask, Fawnly's antlers, Gillybop's gills, Drakko's frill, Nocti's wings, and so on).

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

## Clothes
Clothes are a wardrobe feature, not genes, and aren't drawn on pets yet.

## Workflow for a new character
1. Block in the silhouette with `node tools/sketch.mjs <name>` (layered ellipses and triangles).
2. Paint over it by hand: outline pass, light clusters, signature features, face.
3. Check it large and at game size in `tools/founders.html` (`?f=Name&s=560` for one founder, `?grid` for the set), including the expression sheet.
4. Fix stray pixels, uneven curves and anything that hurts readability at game size.

## Founders and genetic lines
- **Every part belongs to exactly one founder.** The 14 founders are the roots of the genetic lines; every ear, eye, mouth, tail, shape, build, foot, pattern and so on comes down from one of them, and no two founders share a part (`LINEAGE` / `lineOf` in `src/game/genetics.js`, enforced by tests). Colours, size and eye spacing are shared traits, not parts.
- **Parts** are hand-pixelled in role colours (`1-4` body, `5-8` accent, `e E F` eyes, `- 9 0 +` hair) so genes can recolour them; each one is labelled with its founder in `src/art/kit.js`. A part must read on any head, so it's checked on mixed children in `tools/compare.html`, not just on its founder.
- **Heads and bodies** are shaped by genes (`shape`, `size`, `build`) and painted with the founder rules:
  - The lit outline is the darkest shade of the part's own colour, with ink on the shadow side.
  - A small rounded light cluster with a white shine pixel.
  - A one-pixel shadow band on the lower right, and a neck shadow under the head.
- **Hair** sits a pixel beyond the skull for volume and is outlined in its darkest shade, with strand lines and a gloss row. Fringes: pointed bangs, Lumipom's notched bob, Gillybop's swept fringe, spiky, curly.
- **Hand-finishing passes** (applied automatically to every pet, as a pixel artist would by hand):
  - *Joined seams:* where two connected parts in the body or hair colour meet (ears and head, tail and body, shoulders, toppers, cheek fluff, mane), the outline between them becomes a soft crease in the darker shade. Silhouette edges, chins, faces and accent-coloured parts keep their lines. See `joinSeams` in `render-kit.js`.
  - *No doubles:* corner pixels that make a curve's outline two pixels thick are removed, so curves step cleanly.
  - *Rim light:* a crescent of the lightest shade just inside the lit (upper-left) outline of heads and bodies, plus one white glint with a soft halo on the head.
  - *One light direction:* both eyes keep their glint on the upper left; only eyes marked `mirror` (inward-looking pupils) are flipped.
- **No look-alikes:** every part must be clearly different from the others in its category (shape first, then colour). Check with `tools/parts.html` (every kit part side by side, `?cat=EARS` for one category) and `tools/gallery.html?gene=shape,build` for the drawn genes.
- **Arms** are drawn in front of the body with a soft inner edge and a round hand, so every pet has visible arms and hands.
- **Review:** design each founder, then critique and fix it at least five times in `tools/founders.html` before calling it final. Use `tools/compare.html` for children, wild pets, growth stages and expressions after any art change.
