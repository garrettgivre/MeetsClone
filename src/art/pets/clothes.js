// Clothes drawn on the pet, at the pet's own pixel size. Hand-pixelled parts in
// the same format as the rest of the pet art (./part.js); `5 6 7 8` take the
// item's own colour (CLOTHES[id].color), darkest to lightest. Light comes from
// the upper left: `5` outlines the lit side, ink (`o`) the shadow side.
//
// So far: hats and face items. Neckwear, body clothes, capes and shoes are
// still to draw (src/game/pet-art.js draws whatever is listed here).

import { part } from './part.js';

// ---------- hats ----------
// The pivot lands on the top of the head, in the column of the head's `top`
// socket; rows below the pivot overlap the head, so the hat sits on it rather
// than floating. `offset` moves a hat sideways along the head (the side ribbon).
export const HATS = {
  bow: part([
    '.55...oo.',
    '5875.576o',
    '58776776o',
    '5765.566o',
    '.oo...oo.',
  ], { pivot: [4, 3] }),
  ribbon: part([
    '55.oo',
    '58o7o',
    '.o6o.',
    '57o6o',
    'oo.oo',
  ], { pivot: [2, 3], offset: 6 }),
  cap: part([
    '...5555555...',
    '..588777766o.',
    '.58877777766o',
    '.58777777766o',
    '5777777776665',
    '.ooooooooooo.',
  ], { pivot: [6, 3] }),
  beret: part([
    '.....5o....',
    '...55555...',
    '.588777766o',
    '5887777766o',
    '5777776666o',
    '.ooooooooo.',
  ], { pivot: [5, 4] }),
  tiara: part([
    '...o...',
    '..o8o..',
    '.oY7yo.',
    'oYyoyuo',
    '.ooooo.',
  ], { pivot: [3, 3] }),
  crown: part([
    'o...o...o',
    'oYooYooyo',
    'oYyYYyyuo',
    'oYqyByquo',
    'oyyyyyuuo',
    '.ooooooo.',
  ], { pivot: [4, 4] }),
};

// ---------- glasses ----------
// A lens is a ring round one eye, in three sizes; the renderer picks the
// smallest that clears the pet's eyes and joins the pair with a bridge.
// `inner` is the clear space inside the ring.
const ring = (rows, inner) => part(rows, { pivot: [0, 0], inner });
const ROUND = [
  ring(['..ooo..', '.o...o.', 'o.....o', 'o.....o', 'o.....o', '.o...o.', '..ooo..'], 5),
  ring(['..oooo..', '.o....o.', 'o......o', 'o......o', 'o......o', 'o......o', '.o....o.', '..oooo..'], 6),
  ring(['..ooooo..', '.o.....o.', 'o.......o', 'o.......o', 'o.......o', 'o.......o', 'o.......o', '.o.....o.', '..ooooo..'], 7),
];
// the monocle's gold rim
const GOLD = [
  ring(['..yyy..', '.y...u.', 'y.....u', 'u.....u', 'u.....o', '.u...o.', '..uoo..'], 5),
  ring(['..yyyy..', '.y....u.', 'y......u', 'y......u', 'u......o', 'u......o', '.u....o.', '..uuoo..'], 6),
  ring(['..yyyyy..', '.y.....u.', 'y.......u', 'y.......u', 'u.......u', 'u.......o', 'u.......o', '.u.....o.', '..uuooo..'], 7),
];
// dark lenses, flat across the top, with a glint
const DARK = [
  ring(['ooooooo', 'oKmKKKo', 'oKKmKKo', 'oKKKKKo', 'oKKKKKo', '.oKKKo.', '..ooo..'], 5),
  ring(['oooooooo', 'oKmKKKKo', 'oKKmKKKo', 'oKKKKKKo', 'oKKKKKKo', 'oKKKKKKo', '.oKKKKo.', '..oooo..'], 6),
  ring(['ooooooooo', 'oKmKKKKKo', 'oKKmKKKKo', 'oKKKKKKKo', 'oKKKKKKKo', 'oKKKKKKKo', 'oKKKKKKKo', '.oKKKKKo.', '..ooooo..'], 7),
];

// ---------- face items ----------
//   lens       one of the ring sets above, worn over both eyes (or one: `oneSide`)
//   hidesEyes  the eyes don't show, so they don't blink or change with the pet's mood
//   chain      hangs from the lens's outer edge
//   brow       a small part stuck on the brow, over one eye ('left' or 'right' as you look at the pet)
export const FACE = {
  glasses: { lens: ROUND },
  shades: { lens: DARK, hidesEyes: true },
  monocle: { lens: GOLD, oneSide: true, chain: part(['u.', '.o', 'u.', '.o', 'u.'], { pivot: [0, 0] }) },
  bandaid: { brow: part([
    '.ooooo.',
    'oTcwcTo',
    '.ooooo.',
  ], { pivot: [3, 2] }), side: 'left' },
  sticker: { brow: part([
    '...o...',
    '..oYo..',
    'oooYooo',
    'oYYYYyo',
    '.oYyyo.',
    '.oo.oo.',
  ], { pivot: [3, 5] }), side: 'right' },
};
