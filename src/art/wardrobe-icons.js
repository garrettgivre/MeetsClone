// Wardrobe item icons (clothes aren't drawn on pets yet; these show in the
// shop and wardrobe). Same grid format as src/engine/sprite.js, drawn by hand
// at the fine pixel size; `5 6 7 8` take the item's own colour ramp. Pivots are
// in fine pixels.

import { sprite, hdSprite } from '../engine/sprite.js';

const P = (rows, pivot, extra = {}) => ({ spr: hdSprite(rows), rows, pivot, ...extra });
// lenses have no icon and are not drawn anywhere yet, so they are still the old 1x grids
const LENS = (rows, pivot, extra = {}) => ({ spr: sprite(rows), rows, pivot, ...extra });

export const HATS = {
  bow: P([
    '..ooo........ooo..',
    '.o887oo....oo776o.',
    'o88777ooooooo7766o',
    'o87777o8877o77766o',
    'o87776o8777o67766o',
    'o87776o7776o67766o',
    'o77766o7766o66665o',
    'o77666ooooooo6665o',
    '.o666oo....oo665o.',
    '..ooo........ooo..',
  ], [8, 4], { front: true }),
  ribbon: P([
    'ooo....ooo',
    'o87o..o76o',
    'o877oo776o',
    '.o77oo76o.',
    '..oo87oo..',
    '..oo76oo..',
    '.o77oo66o.',
    'o776oo665o',
    'o76o..o65o',
    'ooo....ooo',
  ], [4, 6], { front: true, offset: 12 }),
  cap: P([
    '..............oo..............',
    '.........oooooooooooo.........',
    '.......oo888887777776oo.......',
    '.....oo8888877777777766oo.....',
    '....o888877777ww777777666o....',
    '...o888777777wwww777777666o...',
    '...o8877777777ww7777776666o...',
    '..o887777777777777777766666o..',
    '..o777777777777777776666665o..',
    '.oooooooooooooooooooooooooooo.',
    'o7777777777777777777766666655o',
    '.oooooooooooooooooooooooooooo.',
  ], [14, 8], { front: true }),
  beret: P([
    '..........oo..........',
    '..........oo..........',
    '......oooooooooo......',
    '....oo8888877777oo....',
    '..oo88888777777776oo..',
    '.o888777777777776666o.',
    'o88777777777777766666o',
    'o77777777777777666665o',
    '.o777777777766666655o.',
    '...oooooooooooooooo...',
    '...o66666666666555o...',
    '....oooooooooooooo....',
  ], [10, 8], { front: true }),
  tiara: P([
    '......oo......',
    '.....o88o.....',
    '.....o76o.....',
    '..o..oYyo..o..',
    '.oYo.oYyo.oyo.',
    '.oYyooYyooyuo.',
    'oYYyyYYyyyyyuo',
    'oYyyyyyyyyyuuo',
    'oyoooooooooouo',
    'oo..........oo',
  ], [6, 6], { front: true }),
  crown: P([
    '.o....oo....o.',
    'oYo..oYyo..oyo',
    'oYyo.oYyo.oyuo',
    'oYyyoYYyyoyyuo',
    'oYYyyYYyyyyyuo',
    'oYyqyyyByyyquo',
    'oYyyyyyyyyyyuo',
    'oooooooooooooo',
    'oxyyyyyyyyyuuo',
    '.oooooooooooo.',
  ], [6, 6], { front: true }),
};

// face accessories: glasses lenses and cheek stickers
export const FACE = {
  glasses: { lens: LENS(['.ooooo.', 'o.....o', 'o.....o', 'o.....o', 'o.....o', 'o.....o', 'o.....o', '.ooooo.'], [3, 4]), bridge: 'ink' },
  shades:  { lens: LENS(['ooooooo', 'oKKKKKo', 'oKmKKKo', 'oKKKKKo', '.ooooo.'], [3, 2]), bridge: 'ink', hidesEyes: true },
  monocle: { lens: LENS(['.oyyyo.', 'oy...yo', 'y.....y', 'y.....y', 'y.....y', 'oy...yo', '.oyyyo.'], [3, 3]), oneSide: true, chain: true },
  bandaid: { cheek: P([
    '.oooooooooo.',
    'oTTcwwwwcTTo',
    'oTcTwwwwTcTo',
    'oTTcwwwwcTTo',
    'occcmmmmccco',
    '.oooooooooo.',
  ], [6, 2]) },
  sticker: { cheek: P([
    '....oo....',
    '...oYYo...',
    'oooYYYYooo',
    'oYYYYYYyyo',
    '.oYYYYyyo.',
    '.oYYyyyyo.',
    'oYyyooyyuo',
    'ooo....ooo',
  ], [4, 2]) },
};

export const BOWTIE = P([
  'oo......oo',
  'o8oo..oo6o',
  'o877oo776o',
  'o87o87o66o',
  'o87o77o66o',
  'o77o76o66o',
  'o77o66o65o',
  'o766oo665o',
  'o6oo..oo5o',
  'oo......oo',
], [4, 4]);
export const TIE = P([
  '.oooo.',
  'o8776o',
  '.o66o.',
  '.o87o.',
  '.o87o.',
  'o8776o',
  'o8776o',
  'o7766o',
  '.o66o.',
  '..oo..',
], [2, 0]);
