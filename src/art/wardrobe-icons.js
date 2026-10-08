// Wardrobe item icons (clothes aren't drawn on pets yet; these show in the
// shop and wardrobe). Same grid format as src/engine/sprite.js.

import { sprite } from '../engine/sprite.js';

const P = (rows, pivot, extra = {}) => ({ spr: sprite(rows), rows, pivot, ...extra });

export const HATS = {
  bow: P(['.oo...oo.', 'oPfo.ofPo', 'oPffoffPo', 'oPfo.ofPo', '.oo...oo.'], [4, 2], { front: true }),
  ribbon: P(['oo.oo', 'o7o7o', '.o6o.', 'o7o7o', 'oo.oo'], [2, 3], { front: true, offset: 6 }),
  cap: P(['....ooooooo....', '...o7777777o...', '..o778777777o..', '.o77777777777o.', 'o6666666666666o', 'ooooooooooooooo'], [7, 4], { front: true }),
  beret: P(['.....o.....', '...ooooo...', '.oo77777oo.', 'o777787777o', 'o666666666o', '.ooooooooo.'], [5, 4], { front: true }),
  tiara: P(['...o...', '..oBo..', '.oyoyo.', 'oyyoyyo', '.ooooo.'], [3, 3], { front: true }),
  crown: P(['o..o..o', 'oyoyoyo', 'oyYyYyo', 'oyyyyyo', 'ooooooo'], [3, 3], { front: true }),
};

// face accessories: glasses lenses and cheek stickers
export const FACE = {
  glasses: { lens: P(['.ooooo.', 'o.....o', 'o.....o', 'o.....o', 'o.....o', 'o.....o', 'o.....o', '.ooooo.'], [3, 4]), bridge: 'ink' },
  shades:  { lens: P(['ooooooo', 'oKKKKKo', 'oKmKKKo', 'oKKKKKo', '.ooooo.'], [3, 2]), bridge: 'ink', hidesEyes: true },
  monocle: { lens: P(['.oyyyo.', 'oy...yo', 'y.....y', 'y.....y', 'y.....y', 'oy...yo', '.oyyyo.'], [3, 3]), oneSide: true, chain: true },
  bandaid: { cheek: P(['.oooo.', 'oTwwTo', '.oooo.'], [3, 1]) },
  sticker: { cheek: P(['..o..', '.oYo.', 'oYYYo', '.oYo.'], [2, 1]) },
};

export const BOWTIE = P(['oo.oo', 'o6o6o', 'o666o', 'o6o6o', 'oo.oo'], [2, 2]);
export const TIE = P(['.o.', 'o6o', 'o6o', 'o66', '.o.'], [1, 0]);
