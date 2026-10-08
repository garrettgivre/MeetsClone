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
- **Every part is drawn for every form.** The art lives in `src/art/pets/forms/<form>.js`: heads, bodies, ears, hair, toppers, tails, feet and wings, plus the form's baby and child shapes and its arms. Face parts (eyes, mouths, marks, noses) are shared, drawn in two sizes (S and L) in `src/art/pets/face.js`. Patterns are recolour maps in `src/art/pets/patterns.js` that keep the hand-drawn shading.
- `tests/art.test.js` fails if any allele is missing for any form, if a head or body lacks a socket, or if any founder, child or wild pet overflows the canvas.

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
- **Joined seams:** where connected parts of the body or hair colour meet (ears and head, tail and body, shoulders, toppers), the renderer turns the outline into a soft crease. One-piece forms (blob, avian) also melt the head into the body.
- **Silhouette first:** each form must be recognisable in solid black (`tools/founders.html?grid&sil`).

## Life stages
- **Baby:** the form's simple baby shape with baby eyes and a little mouth.
- **Child:** the form's child shape with the pet's own eyes, mouth and markings.
- **Teen:** the full pet, without topper or wings (those grow in).
- **Adult:** everything.

## Tools
- `tools/founders.html`: each founder's sheet (`?f=Name&s=560`), the set (`?grid`), silhouettes (`?grid&sil`).
- `tools/parts.html`: every part, one row per allele and one column per form (`?gene=ears`).
- `tools/gallery.html`: every option of each gene on a plain pet (`?gene=tail&form=quad`).
- `tools/compare.html`: founders, children of founder pairs, wild pets, growth and expressions.
- `tools/lab.html`: the Pairing Lab.

## Adding things
- **A new part:** add the allele to `GENES`, give it to a founder, draw it in every form file. The tests list anything missing.
- **A new form:** add `forms/<name>.js` with the same sections, register it in `src/art/pets/index.js`, add the allele to `GENES.form`, and give it a founder.
