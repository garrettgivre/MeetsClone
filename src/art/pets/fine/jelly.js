// FINE-LINE PET ART, NOT YET USED BY THE GAME (see axolotl.js for the format).
//
// The jelly founder, Gloop: the colours nobody else has, lemon yellow with mint.
// A wobbly gumdrop of lemon jelly in one piece (the head runs straight into the
// base, with no line between), mint icing dripping down from the top, a dollop
// of cream, two little nub ears, a gloss streak and a few bubbles inside.
// Extra colours here: 7 accent, m pale grey, f heart pink, P blush pink, q mouth red.

export const LOOK = { color: 'gold', accent: 'mint', eye: 'blue', merge: true };
// The body plan this founder is drawn in, and the gene names of its parts
export const FORM = 'blob';
export const GENES = { head: 'gumdrop', body: 'jelly', ears: 'nubs', hair: 'drip', topper: 'cream', eyes: 'jelly', mouth: 'o', mark: 'heart', pattern: 'bubbles' };

// Head, "gumdrop": 60 x 39, a tall dome with a flat floor. In the one-piece form the floor line melts into the base.
export const HEAD = { rows: [
  '......................oooooooooooooooo',
  '..................oooo44444444^4444444oooo',
  '...............ooo444444444444444444444444ooo',
  '.............oo444444444444444444444444444444oo',
  '...........oo44[4444444444444444444444444444]44oo',
  '..........o44444wwww44444444444444444444444444444o',
  '.........o4444ww4444444444444444444444444444444444o',
  '........o444ww4444444444444444444444444444444444444o',
  '.......o444w4444444444444444444444444444444444444444o',
  '......o4444444444444444444444444444444444444444444444o',
  '......o4444444444444444444444444444444444444444444444o',
  '.....o444444444444444444444444444444444444444444444444o',
  '.....o444444444444444444444444444444444444444444444443o',
  '....o44444444444444444444444444444444444444444444444443o',
  '....o44444444444444444444444444444444444444444444444443o',
  '...o4444444444444444444444444444444444444444444444444433o',
  '...o4444444444444444444444444444444444444444444444444433o',
  '...o4444444444444444444444444444444444444444444444444433o',
  '..o444444444444444444444444444444444444444444444444444433o',
  '..o444444444444444444444444444444444444444444444444444433o',
  '..o444444444444444444444444444444444444444444444444444333o',
  '.o44444444444444444444444444444444444444444444444444444333o',
  '.o44444444444444444444444444444444444444444444444444444333o',
  '.o44444444444444444444444444444444444444444444444444444333o',
  '.o44444444444444444444444444444444444444444444444444444333o',
  'o4444444444444444444444444444444444444444444444444444444333o',
  'o4444444444444444444444444444444444444444444444444444444333o',
  'o44444444444444444444444444444@4444444444444444444444444333o',
  'o4444444444444444444444444444444444444444444444444444444333o',
  'o4444444444444444444444444444444444444444444444444444444333o',
  'o4444444444444444444444444444444444444444444444444444444333o',
  'o4444444444444444444444444444444444444444444444444444443333o',
  'o4444444444444444444444444444444444444444444444444444443333o',
  'o4444444444444444444444444444444444444444444444444444443333o',
  'o4444444444444444444444444444444444444444444444444444443333o',
  'o4444444444444444444444444444444444444444444444444444443333o',
  'o4444444444444444444444444444444444444444444444444444443333o',
  '.o4444444444444444444444444444=444444444444444444444443333o',
  '..oooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
] };

// Body, "jelly": the base the gumdrop sits on, rounded underneath
export const BODY = { rows: [
  'o44444444444444444444444444444=4444444444444444444444443333o',
  'o4444444444444444444444444444444444444444444444444444443333o',
  '.o44444444444444444444444444444444444444444444444444333333o',
  '.o44444444444444444444444444444444444444444444444433333333o',
  '..oo4444444444444444444444444444444444444444443333333333oo',
  '....ooo3333333333333333333333333333333333333333333333ooo',
  '.......oooooooooooooooooooooooooooooooooooooooooooooo',
] };

// Ears, "nubs": a small round bump. The left one; its inner side lies behind the head.
export const EARS = { pivot: [7, 5], rows: [
  '...oooo',
  '.oo4444oo',
  'o44444444o',
  'o444444444',
  'o444444444',
  '.o44444444',
  '..o4444444',
] };

// Hair, "drip": icing in the accent colour, poured over the top and running down in four drips (set on the head's top-left corner)
export const OVERLAYS = [
  { on: 'head', gene: 'hair', anchor: 'top', at: [0, 1], rows: [
    '......................7777777777777777',
    '..................777777777777777777777777',
    '...............777777777777777777777777777777',
    '.............7777777777777777777777777777777777',
    '...........77777777777777777777777777777777777777',
    '..........7777777777777777777777777777777777777777',
    '.........777777777777777777777777777777777777777777',
    '........77777777777777777777777777777777777777777777',
    '.......7777777777777777777777777777777777777777777777',
    '......777777777ooooooo777777777ooooooo777777oooo777777',
    '......77777777o.......o7777777o......o777777o...oooooo',
    '......7777777o.........ooooooo.......o777777o',
    '.....oooooooo........................o777777o',
    '......................................oooooo',
  ] },
];

// Markings, "bubbles": little rings of air inside the jelly (each one set down at a place on the head)
export const SPOTS = { pivot: [1, 1], at: [[6, 22], [52, 17], [40, 36], [17, 35]], rows: [
  '.ww.',
  'w..w',
  'w..w',
  '.ww.',
] };

// Topper: a dollop of whipped cream (the old cherry's place)
export const TOPPER = { pivot: [6, 8], rows: [
  '.....oo',
  '....owwo',
  '...owwwwo',
  '..owwmwwwo',
  '.owwwwwmwwo',
  '.owwmwwwwwo',
  'owwwwwwmwwwo',
  'owwwwwwwwwwo',
  '.oooooooooo',
] };

// Eyes, "jelly": a dark pupil in a ring of the eye colour, with two shines
export const EYE = { pivot: [4, 4], rows: [
  '..oooo..',
  '.oeeeeo.',
  'oewwooeo',
  'oewwooeo',
  'oeooooeo',
  'oeooooeo',
  'oeeooweo',
  '.oeeeeo.',
  '..oooo..',
] };

// Mouth, "o": a small round mouth
export const MOUTH = { pivot: [2, 0], rows: [
  '.oo.',
  'oqqo',
  '.oo.',
] };

// Forehead mark, "heart"
export const MARK = { pivot: [2, 1], rows: [
  'ff.ff',
  'fffff',
  '.fff.',
  '..f..',
] };

export const CHEEK = { pivot: [4, 2], rows: [
  '.PPPPPP.',
  'PPPPPPPP',
  'PPPPPPPP',
  '.PPPPPP.',
] };

export const FACE = { eyes: 14, mouth: 6, mark: [0, -10], cheeks: [22, 7] };
