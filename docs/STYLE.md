# Pet Art Style Guide

Pets are hand-pixelled characters in a classic colour-screen virtual pet style, drawn with the charm of collectible creature games. Every pet is built from parts drawn **for its body plan**, so any mix of genes still looks like it was drawn on purpose.

## The model

| Group | Genes | Notes |
|---|---|---|
| Form | `form` | the body plan: biped, blob, quad, floater, serpent, avian. Codominant, so lines mix. |
| Base | `head`, `body`, `eyes`, `ears`, `mouth`, `pattern`, `mark` | every pet has all of these |
| Ancillary | `tail`, `topper`, `feet`, `nose`, `wings`, `hair` | optional (`none`) |
| Colour | `color`, `accent`, `eyeColor`, `hairColor` | recolour the role characters in every part |
| Temperament | `appetite`, `energy`, `taste` | not drawn |

- **Every part belongs to one founder's line** (`LINEAGE` / `lineOf` in `src/game/genetics.js`); there is one founder per form.
- **Every part is drawn for every form.** The art lives in `src/art/pets/forms/<form>.js`: heads, bodies, ears, hair, toppers, tails, feet and wings, plus the form's baby and child shapes and its arms. Face parts (eyes, mouths, marks, noses) are shared, drawn in two sizes (S and L) in `src/art/pets/face.js`. Patterns are recolour maps in `src/art/pets/patterns.js` that keep the hand-drawn shading. A part can also carry a hand-painted `zones` grid (same size as the part) that patterns read as `info.zone`, so a marking can follow the drawing; the serpent coil uses it so Inchy's bands wrap round each segment.
- `tests/art.test.js` fails if any allele is missing for any form, if a head or body lacks a socket, if any founder, child or wild pet overflows the canvas, or if a part ends up hidden (the renderer reports visible pixels per part, and every founder part and every optional part in every form must show).

## The founders

| Founder | Form | Theme |
|---|---|---|
| Kitsu | biped | ember fox kit: fox ears, brush tail, sly eyes, fang smile, pale muzzle |
| Gloop | blob | cherry jelly: a wobbly mint gumdrop with a cherry on top and jelly drips |
| Fleece | quad | cloud lamb: woolly body, curled horns, sooty face and legs, hooves |
| Glimmer | floater | lantern jellyfish: a bell head, glowing eyes, a lure light, veils and tendrils |
| Inchy | serpent | garden caterpillar: segmented S-coil, antennae, a leaf hat, banded body |
| Hoolet | avian | moon owlet: feathered egg body, ear tufts, huge owl eyes, beak, talons |

## Drawing format

Parts are text grids (`src/art/pets/part.js`). Role characters recolour with genes: `1-4` body ramp (1 darkest, used for the lit outline), `5-8` accent ramp, `e E F` eye colour, `- 9 0 +` hair ramp. Fixed colours come from `KEY` in `src/engine/sprite.js` (`o`/`k` ink, `w` white...).

**Sockets** are marked in the grids: `@`/`*` face (small/large), `^` top of the head, `=` neck (head and body meet here), `[ ]` ears, `< >` arms, `( )` wings, `! ?` feet, `~` tail, `#` a part's own pivot. Left-side parts are drawn facing left; the right side is mirrored.

## House rules
- **Light from the upper left.** Lit outline in the darkest shade of the part's own colour (`1`), ink (`o`) on the shadow side; a light rim (`4`) just inside the lit edge, a shadow band (`2`) inside the lower right, and one white glint with a soft halo on heads.
- **One-pixel lines with no doubles**, and curves that step evenly.
- **Both eyes keep their glint on the upper left.** The right eye is drawn the same way round; only eyes marked `mirror` are flipped.
- **Grounded:** a pet stands on its body and feet; a tail or wing that dangles lower never lifts it off the floor (floaters count everything, so their tendrils stay on the canvas).
- **Every gene shows:** hair and toppers sit over the forehead mark, but if they hide more than half of it the renderer moves the mark down onto bare forehead, or onto the chest; a test checks every form, head and hair.
- **Joined seams:** where connected parts of the body or hair colour meet (ears and head, tail and body, shoulders, toppers), the renderer turns the outline into a soft crease. One-piece forms (blob, avian) also melt the head into the body.
- **Faces fit their heads:** a head with a large face (`*`) should be about as wide as its siblings in that form at the face row; put the face socket on the widest rows. A small head or child shape can bring the eyes closer with a `spread` option on its part. The tests fail if any eye in any form, head and stage lands over the outline.
- **Silhouette first:** each form must be recognisable in solid black (`tools/founders.html?grid&sil`).

## Town backdrops
### Props are hand-pixelled
Every thing in town is a hand-pixelled prop: trees (round, young, poplar), palms, bushes, clouds, rocks, flowers and flower beds, mushrooms, grass, ferns, logs, reeds and lily pads; buildings and structures (shops, the town hall, cottages, huts, tents, the bandstand, the fountain, the castle, lamps, benches, a well); and furniture and goods (counters, ovens, cabinets, beds, chairs, desks, shelves of loaves, bottles, toys and books). They are text grids in `src/art/props.js`, at the town's full pixel density, finished pixel by pixel. Their characters are colour roles (`1-4` leaf, `5-8` wood, `a-d` accent, `e-h` stone, `A-D` wall, `r s t u` roof, `x y z Z` glass), so one drawing comes in any colourway. Scenes only place them (`k.prop(name, x, y, { leaf, accent, flip })`, and `tree`, `bush`, `canopy`, `pcloud`, `tufts`, `rocks`, `mushroom`, `flowerPatch` all stamp props). Review them in `tools/props.html`. `tools/art-scripts/props_draft.py` blocks in a new prop's silhouette as a starting point; the grid in `props.js` is the real art, so edit it by hand.

### What gives a scene heart
- **No rudimentary shapes.** Ground edges, rocks, mountains, tree crowns and clouds are irregular lumps (`blob`, `canopy`, `pcloud`, `mountain`); trunks taper, curve and flare at the roots (`trunk`, `tree`); roofs curve like bells (`roofCurve`); even boxes have soft corners (`block`).
- **Volume from lobes.** Foliage and clouds are clumps of lobes in mixed sizes, upper ones lit, lower ones in shade, each tucked into a darker pocket where it meets the ones behind.
- **Clusters, not grids.** Flowers, tufts, rocks, mushrooms and shelf items come in uneven groups from a seeded random generator (`rand`), with open space between. Nothing repeats on a fixed step.
- **Depth through layers.** Far things are paler and cooler with less contrast; mist sits between layers (`mist`); everything overlaps something; framing in the bottom corners sits in front of the pets.
- **Hue-shifted light.** Shadows go cooler within their colour (green toward teal, cloud undersides toward lavender), never plain grey; highlights go lighter and warmer.
- **Grounds are soft fields, not fills.** `k.field(y, colour)` lights the open middle, deepens the edges and the bottom, adds fine grass strokes and a sprinkle of tiny flowers. Skies carry several big clouds, with a bank of them along the horizon (`k.horizonClouds`).
- **Bold framing.** `k.frame('left' | 'right', leaf)` puts banded shrubs and bushes in a bottom corner, in front of the pets.
- **Whimsy, not clip art.** Things in town have character: the town-hall clock and the moon wear the Tamagotchi face (`k.face`); shops, the hall and the stage carry lettered signs in the game's own font (`k.sign`); fairground rides, marquees and the stage are ringed with bulbs (`k.bulbs`); stars hang on strings (`k.starString`); some folk live in mushroom houses, and cone trees (`coneTree`) line the roofs. Buildings against the sky get a white sticker halo (`k.prop(name, x, y, { halo: 'white' })`) so they pop like the town maps.
- **An open stage.** Keep the middle clear for the pets and put the detail around the edges, with a trail, river or path leading in.

Each place in town is drawn in code at the room's double density (`src/art/town.js`), using a small kit of shaded shapes so every scene follows the same rules:
- Solid shapes are lit from the upper left: a light rim on the top and left, a two-pixel shadow band on the bottom and right, and an outline in a darker shade of their own colour (ink only for small, dark details).
- Props stand on soft dithered contact shadows, and indoor walls meet the floor with a dithered shadow line.
- Floors are in perspective (tiles and planks get taller toward the viewer); outdoor scenes have a far layer (skyline, hills or pines) behind the main props.
- Aim for the quality of the official backgrounds, not their layouts: every place should be its own composition. Outdoor places use a high horizon with a big ground plane seen from above, pastel banded skies with sparkles, and everything leafy or cloudy built from puffs (`puff`, `canopy`, `pcloud`, `cloudBank`), lit on top with a lighter highlight, darker underneath, outlined in a deeper shade of their own colour. Grounds get soft lighter patches (`mottle`), winding rivers (`river`), mountains and waterfalls.
- Indoors: light pools under lamps and windows (`lightPool`, `beam`), soft corner shading (`vignette`), puffy potted and hanging plants (`plant`, `hangingPlant`), and a few props that say what the place is.
- Bushes, trees and clouds can frame the bottom corners **in front of** the pets: draw them after `k.layer('front')` (and switch back with `k.layer('back')`). Keep them to the corners so they never cover a pet's face.
- Keep the middle of the floor clear: your pet stands at the left, the resident at the right, and the action buttons cover the bottom.
- Review with `tools/town.html` (`?only=park&z=3`, `&pets` to see pets for scale).

## Life stages
- **Baby:** the form's simple baby shape with baby eyes and a little mouth.
- **Child:** the form's child shape with the pet's own eyes, mouth, markings and (small) ears, so the line already shows.
- **Teen:** the full pet, without topper or wings (those grow in).
- **Adult:** everything.

## Tools
- `tools/founders.html`: each founder's sheet (`?f=Name&s=560`), the set (`?grid`, any stage with `&stage=teen`), silhouettes (`?grid&sil`), and each founder's parts drawn in every form (`?forms`).
- `tools/parts.html`: every part, one row per allele and one column per form (`?gene=ears`).
- `tools/gallery.html`: every option of each gene on a plain pet (`?gene=tail&form=quad`).
- `tools/compare.html`: founders, children of founder pairs, wild pets, growth and expressions (hover a picture for its genes).
- `tools/lab.html`: the Pairing Lab.
- `node tools/dump.mjs <Founder|random:seed|Founder+gene=allele,...> [stage] [expr]`: prints a composed pet as characters, for pixel-level review (e.g. `Glimmer+head=lamb,accent=red`).
- `node tools/seen.mjs [Founder]`: how many pixels of each part show in each founder's adult picture.
- `tools/art-scripts/ed.py`: Python helpers to read and rewrite any part's grid by name (`show`, `rows_of`, `setpart`, `setall`), and to block in a silhouette from row extents with the house shading (`from_extents`, `paint`), widen a part about its middle (`widen`), and paint pattern zones along a body's spine (`spine_zones`, `setzones`). `draft.py` holds the shape and shading tools the forms were first drafted with (it won't overwrite the finished grids unless given `--force`).

## Adding things
- **A new part:** add the allele to `GENES`, give it to a founder, draw it in every form file. The tests list anything missing.
- **A new form:** add `forms/<name>.js` with the same sections, register it in `src/art/pets/index.js`, add the allele to `GENES.form`, and give it a founder.
