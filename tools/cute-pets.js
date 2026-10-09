// A mock-up, not used by the game: a simpler, rounder way to build pets from
// genes, to compare with today's. Every grid is typed by hand. One chubby
// one-piece body (head and body together), flat colour with a single shadow,
// a heavy outline, a tiny face set low and wide, and a few bold features
// chosen by genes: ears, a topper, a tail, a belly or mask marking.
//
//   o ink   2 3 4 body colour (shadow, base, light)   6 7 accent (deep, pale)
//   w white   p blush   r mouth red   a beak orange   L l leaf greens   Y y gold

/** Bodies. `face` is the middle of the face, `ears` where the two ears stand, `top` the crown, `tail` the right hip. */
export const BODIES = {
  round: { face: [11, 9], ears: [[5, 2], [16, 2]], top: [11, 0], tail: [21, 12], rows: [
    '......oooooooooo......',
    '....oo3333333333oo....',
    '...o33333333333333o...',
    '..o3344333333333333o..',
    '.o334433333333333333o.',
    '.o333333333333333333o.',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333332o',
    'oo333333333333333332oo',
    'o3o3333333333333322o3o',
    'o33o33333333333322o32o',
    '.ooo33333333333222ooo.',
    '...o33333333322222o...',
    '....oooooooooooooo....',
    '....o33o......o32o....',
    '....oooo......oooo....',
  ] },
  drop: { face: [11, 11], ears: [[4, 7], [17, 7]], top: [11, 0], tail: [21, 14], rows: [
    '..........oo..........',
    '.........o33o.........',
    '........o3333o........',
    '.......o343333o.......',
    '......o34333333o......',
    '....oo3333333333oo....',
    '...o33333333333333o...',
    '..o3333333333333333o..',
    '.o333333333333333333o.',
    '.o333333333333333333o.',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333332o',
    'o33333333333333333322o',
    '.o333333333333333322o.',
    '.o333333333333332222o.',
    '..oo33333333322222oo..',
    '....oooooooooooooo....',
    '....o33o......o32o....',
    '....oooo......oooo....',
  ] },
  loaf: { face: [11, 7], ears: [[4, 1], [17, 1]], top: [11, 0], tail: [21, 10], rows: [
    '...oooooooooooooooo...',
    '..o3333333333333333o..',
    '.o344333333333333333o.',
    'o34433333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333333o',
    'o33333333333333333332o',
    'o33333333333333333322o',
    '.o333333333333333322o.',
    '.o333333333333332222o.',
    '..oo33333333322222oo..',
    '....oooooooooooooo....',
    '....o33o......o32o....',
    '....oooo......oooo....',
  ] },
};

/** Ears: the left one, standing on its bottom middle; the right is its mirror. */
export const EARS = {
  none: null,
  cat: ['..oo..', '.o33o.', '.o37o.', 'o3773o', 'o3773o', 'o3333o'],
  bunny: ['.ooo.', 'o333o', 'o373o', 'o373o', 'o373o', 'o373o', 'o373o', 'o333o', 'o333o'],
  bear: ['.oooo.', 'o3333o', 'o3773o', 'o3773o', 'o3333o'],
  horn: ['..o..', '.oYo.', '.oYo.', 'oYYyo', 'oYyyo'],
};

/** Toppers: stand on the crown by their bottom middle. */
export const TOPS = {
  none: null,
  sprout: ['oo...oo', 'olo.olo', 'ollolLo', '.olLlo.', '..oLo..', '..oLo..'],
  flower: ['.oo.oo.', 'o77o77o', 'o7oYo7o', '.oYYYo.', 'o7oYo7o', 'o77o77o', '.oo.oo.'],
  tuft: ['..o..', '.o3o.', 'o333o', 'o333o'],
  star: ['...o...', '..oYo..', 'oooYooo', 'oYYYYyo', '.oYyyo.', '.oo.oo.'],
};

/** Tails: grow from the right hip, anchored at their left middle. */
export const TAILS = {
  none: null,
  puff: ['.ooo.', 'o777o', 'o777o', 'o776o', '.ooo.'],
  curl: ['..ooo.', '.o333o', 'o3oo3o', 'o3o.oo', 'o33o..', '.oo...'],
  fin: ['...oo', '..o3o', 'oo33o', 'o332o', 'oo32o', '..o2o', '...oo'],
};

/** Eyes: one eye; `gap` is how far each sits from the middle of the face. */
export const EYES = {
  dot: { gap: 5, rows: ['oo', 'oo'] },
  shine: { gap: 5, rows: ['woo', 'ooo', 'ooo'] },
  tall: { gap: 4, rows: ['oo', 'wo', 'oo', 'oo'] },
  happy: { gap: 5, rows: ['.o.', 'o.o'] },
};

/** Mouths: centred under the eyes. */
export const MOUTHS = {
  smile: ['o.o', '.o.'],
  open: ['ooo', 'oro', '.o.'],
  beak: ['aaa', '.a.'],
  cat: ['o.o.o', '.o.o.'],
};

/** Markings: painted over the body's own colour only. `at` is the offset from the face. */
export const MARKS = {
  none: null,
  belly: { at: [-5, 4], rows: ['..777777..', '.77777777.', '7777777777', '7777777777', '7777777777', '.77777777.'] },
  mask: { at: [-8, -3], rows: ['..7777....7777..', '.777777..777777.', '7777777..7777777', '7777777..7777777', '.777777..777777.', '..7777....7777..'] },
  spots: { at: [-8, -5], rows: ['.66..........66.', '.66..........66.', '................', '................', '................', '................', '................', '6..............6', '66............66'] },
};
