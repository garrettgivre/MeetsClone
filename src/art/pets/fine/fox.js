// FINE-LINE PET ART, NOT YET USED BY THE GAME (see axolotl.js for the format).
//
// The fox founder, Kitsu: an ember fox, orange with red. A big round head with
// fluffed cheeks, tall ears lined in red, a white muzzle and bib, a small
// seated body on red-socked paws, and a big brush of a tail whose tip burns red.
// Extra colours here: 6 7 accent (shadow, base), r q Y the flame's reds and gold, P blush pink.

// (deeper: the body is drawn one shade down the ramp, so the fox is a true orange and not peach)
export const LOOK = { color: 'orange', accent: 'red', deeper: true };

// Head, "fox": 58 x 42, round, with a tuft of cheek fluff low on each side
export const HEAD = { rows: [
  '......................oooooooooooooo',
  '..................oooo4444444^444444oooo',
  '...............ooo4444444444444444444444ooo',
  '.............oo4444444444444444444444444444oo',
  '...........oo44444444444444444444444444444444oo',
  '..........o444[4444444444444444444444444444]444o',
  '.........o44444444444444444444444444444444444444o',
  '........o4444444444444444444444444444444444444444o',
  '.......o444444444444444444444444444444444444444444o',
  '......o44444444444444444444444444444444444444444444o',
  '......o44444444444444444444444444444444444444444444o',
  '.....o4444444444444444444444444444444444444444444444o',
  '.....o4444444444444444444444444444444444444444444444o',
  '....o444444444444444444444444444444444444444444444444o',
  '....o444444444444444444444444444444444444444444444444o',
  '....o444444444444444444444444444444444444444444444444o',
  '...o44444444444444444444444444444444444444444444444444o',
  '...o44444444444444444444444444444444444444444444444444o',
  '...o44444444444444444444444444444444444444444444444444o',
  '...o44444444444444444444444444444444444444444444444444o',
  '...o44444444444444444444444444444444444444444444444443o',
  '...o44444444444444444444444444444444444444444444444443o',
  '...o44444444444444444444444444444444444444444444444443o',
  '...o44444444444444444444444444444444444444444444444443o',
  '...o4444444444444444444444444@444444444444444444444443o',
  '...o44444444444444444444444444444444444444444444444433o',
  '..o4444444444444444444444444444444444444444444444444433o',
  '.o444444444444444444444444444444444444444444444444444433o',
  'oo444444444444444444444444444444444444444444444444444333oo',
  '..o4444444444444444444444444444444444444444444444444333o',
  '.oo4444444444444444444444444444444444444444444444444333oo',
  '...o44444444444444444444444444444444444444444444443333o',
  '....o444444444444444444444444444444444444444444443333o',
  '.....o4444444444444444444444444444444444444444433333o',
  '......o44444444444444444444444444444444444444333333o',
  '.......oo4444444444444444444444444444444443333333oo',
  '.........oo444444444444444444444444444433333333oo',
  '...........oo44444444444444444444444333333333oo',
  '.............ooo44444444444444443333333333ooo',
  '................ooo44444444443333333333ooo',
  '...................oooo444444=44333oooo',
  '.......................oooooooooooo',
] };

// Ears, "fox": tall and pointed, lined in the accent colour. The left one; its base lies behind the head.
export const EARS = { pivot: [10, 18], rows: [
  '..oo',
  '..o4o',
  '.o444o',
  '.o4474o',
  '.o44774o',
  'o4477744o',
  'o44777744o',
  'o447777744o',
  'o4477777744o',
  'o44777777744o',
  'o447777777744o',
  'o4477777777444o',
  'o44777777774444o',
  '.o4777777744444o',
  '.o44777774444444o',
  '.o444444444444444',
  '..o44444444444444',
  '..o44444444444444',
  '...o4444444444444',
  '....o444444444444',
] };

// Markings, "muzzle": a white muzzle on the head and a white bib on the chest (each set down at its place)
export const OVERLAYS = [
  { on: 'head', at: [16, 27], rows: [
    '........wwwwwwwwww',
    '.....wwwwwwwwwwwwwwww',
    '...wwwwwwwwwwwwwwwwwwww',
    '..wwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwww',
    '..wwwwwwwwwwwwwwwwwwwwww',
    '....wwwwwwwwwwwwwwwwww',
    '.......wwwwwwwwwwww',
  ] },
  { on: 'body', at: [8, 3], rows: [
    '..wwwwwwwwwwww',
    '.wwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwww',
    '.www.wwwwww.www',
    '..w...wwww...w',
    '.......ww',
  ] },
];

// Body, "fluffy": a small pear-shaped body, sitting up
export const BODY = { rows: [
  '...........oooooooooo',
  '........ooo4444444444ooo',
  '......oo44444444=4444444oo',
  '.....o44444444444444444444o',
  '....o4444444444444444444444o',
  '...o444444444444444444444443o',
  '..o44444444444444444444444443o',
  '.o4444444444444444444444444433o',
  '.o4444444444444444444444444433o',
  'o444444444444444444444444444333o',
  'o444444444444444444444444444333o',
  'o444444444444444444444444444333o',
  'o444444444444444444444444444333o',
  'o444444444444444444444444444333o',
  'o444444444444444444444444444333o',
  'o444444444444444444444444444~33o',
  'o444444444444444444444444443333o',
  '.o4444444444444444444444443333o',
  '.o4444444444444444444444433333o',
  '..o444444!444444444444!433333o',
  '...oo3333333333333333333333oo',
  '.....oooooooooooooooooooooo',
] };

// Tail, "brush": a big soft brush that sweeps out and up behind, its tip in the accent colour like a flame
export const TAIL = { pivot: [2, 24], rows: [
  '........................oo',
  '.......................o77o',
  '......................o777o',
  '.....................o7777o',
  '....................o77777o',
  '...................o7777777o',
  '..................o77777777o',
  '.................o777777777o',
  '................o77777777777o',
  '...............o777777777777o',
  '..............o7777777777777o',
  '.............o77777777777777o',
  '............o7747777477774777o',
  '...........o74447744477444777o',
  '..........o444444444444444433o',
  '.........o4444444444444444333o',
  '........o44444444444444444333o',
  '.......o444444444444444444333o',
  '......o4444444444444444444333o',
  '.....o44444444444444444443333o',
  '....o444444444444444444443333o',
  '...o4444444444444444444433333o',
  '..o44444444444444444444433333o',
  '.o44444444444444444444333333o',
  'o4444444444444444444433333oo',
  'o444444444444444443333333o',
  '.o4444444444443333333ooo',
  '..oo44444443333333ooo',
  '....ooooooooooooo',
] };

// Feet, "paws": round paws in socks of the accent colour
export const FEET = { pivot: [4, 0], rows: [
  '.oooooooo.',
  'o77777777o',
  'o77777776o',
  'o77o77o66o',
  '.oooooooo.',
] };

// Eyes, "sly": an oval with a small lash at the outer corner. The left one; the right is turned round.
export const EYE = { pivot: [4, 4], mirror: true, rows: [
  '...ooo..',
  'o.ooooo.',
  '.owwoooo',
  '.owwoooo',
  '.ooooooo',
  '.ooooooo',
  '..ooooo.',
  '...ooo..',
] };

// Nose, "button"
export const NOSE = { pivot: [1, 0], rows: [
  'ooo',
  '.o.',
] };

// Mouth, "fang": a little cat's mouth
export const MOUTH = { pivot: [3, 0], rows: [
  'o..o..o',
  '.oo.oo.',
] };

// Forehead mark, "flame"
export const MARK = { pivot: [2, 3], rows: [
  '..r..',
  '..rr.',
  '.rqr.',
  'rqYqr',
  'rqYqr',
  '.rrr.',
] };

export const CHEEK = { pivot: [3, 1], rows: [
  '.PPPPP.',
  'PPPPPPP',
  '.PPPPP.',
] };

export const FACE = { eyes: 13, nose: 4, mouth: 6, mark: [0, -15], cheeks: [20, 5] };
