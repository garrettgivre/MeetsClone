// FINE-LINE PET ART, NOT YET USED BY THE GAME (see axolotl.js for the format).
//
// Babies and children. A young pet is one soft piece: a round head with a small
// body tucked under it, drawn for each body plan, and the line between the two
// melts away. A baby is plain: its own colour, two dot eyes, a tiny smile and a
// blush. A child is bigger and already has its own eyes, mouth and ears.

// The baby's head: 30 x 22, a ball
export const BABY_HEAD = { rows: [
  '...........oooooooo',
  '........ooo44444444ooo',
  '......oo44444444444444oo',
  '....oo444444444444444444oo',
  '...o4444444444444444444444o',
  '..o444444444444444444444444o',
  '.o44444444444444444444444444o',
  '.o44444444444444444444444443o',
  'o4444444444444444444444444443o',
  'o4444444444444444444444444443o',
  'o4444444444444444444444444443o',
  'o4444444444444444444444444443o',
  'o4444444444444@44444444444433o',
  'o4444444444444444444444444433o',
  'o4444444444444444444444444433o',
  'o4444444444444444444444444433o',
  '.o44444444444444444444444333o',
  '.o44444444444444444444443333o',
  '..o444444444444444444444433o',
  '...o4444444444444444444433o',
  '.....oo4444444=44444444oo',
  '.......oooooooooooooooo',
] };

// The baby's body, one for each body plan
export const BABY_BODY = {
  // four-legged: a little bean lying behind, on three stubs
  quad: { rows: [
    '....oooooooooooooooo',
    '..oo4444=44444444444oo',
    '.o444444444444444444443o',
    '.o444444444444444444433o',
    '.o443oo443ooooooo44433o',
    '.o443o.o443o.....o4433o',
    '..ooo...ooo.......oooo',
  ] },
  // serpent: a comma of a tail
  serpent: { rows: [
    '...oooooooooo',
    '.oo4444=44444ooooo',
    'o44444444444444444oooo',
    'o444444444444444444443ooo',
    'o4444444444444443333333333o',
    '.oo444444433333333333333oo',
    '...oooooooooooooooooooooo',
  ] },
  // floater: a drop
  floater: { rows: [
    '...oooooooo',
    '..o4444=443o',
    '..o44444433o',
    '...o444433o',
    '....o4433o',
    '.....o43o',
    '......oo',
  ] },
  // two-legged: a dumpling on two feet
  biped: { rows: [
    '....oooooooooo',
    '..oo44444=4444oo',
    '.o4444444444443o',
    '.o4444444444433o',
    '.o4444444444433o',
    '..o3333oooo3333o',
    '...oooo....oooo',
  ] },
  // bird: an egg on two tiny feet
  avian: { rows: [
    '.....oooooooo',
    '...oo4444=444oo',
    '..o44444444443o',
    '.o4444444444433o',
    '.o4444444444433o',
    '..o44444444333o',
    '...oooooooooo',
    '....o.o..o.o',
  ] },
  // one-piece: a small puddle
  blob: { rows: [
    '......oooooooooooooooooo',
    '...ooo444444444=44444444ooo',
    '.oo4444444444444444444444433oo',
    'o44444444444444444444444433333o',
    '.oo3333333333333333333333333oo',
    '...oooooooooooooooooooooooo',
  ] },
};

// The baby's face: dot eyes and a tiny smile
export const BABY_EYE = { pivot: [1, 1], rows: [
  'ooo',
  'owo',
  'ooo',
  'ooo',
] };
export const BABY_MOUTH = { pivot: [1, 0], rows: [
  'o.o',
  '.o.',
] };
export const BABY_CHEEK = { pivot: [2, 1], rows: [
  '.PPP.',
  'PPPPP',
] };
export const BABY_FACE = { eyes: 6, mouth: 4, cheeks: [10, 4] };

// The child's head: 44 x 36, round, with places for ears
export const CHILD_HEAD = { rows: [
  '................oooooooooooo',
  '............oooo444444^44444oooo',
  '.........ooo44444444444444444444ooo',
  '.......oo44444444444444444444444444oo',
  '......o4[44444444444444444444444444]4o',
  '.....o44444444444444444444444444444444o',
  '....o4444444444444444444444444444444444o',
  '...o444444444444444444444444444444444444o',
  '...o444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444o',
  '.o4444444444444444444444444444444444444444o',
  '.o4444444444444444444444444444444444444444o',
  '.o4444444444444444444444444444444444444444o',
  'o444444444444444444444444444444444444444444o',
  'o444444444444444444444444444444444444444444o',
  'o444444444444444444444444444444444444444443o',
  'o444444444444444444444444444444444444444443o',
  'o{4444444444444444444444444444444444444444}o',
  'o444444444444444444444444444444444444444443o',
  'o444444444444444444444444444444444444444433o',
  'o444444444444444444444@44444444444444444433o',
  'o444444444444444444444444444444444444444433o',
  'o444444444444444444444444444444444444444433o',
  '.o4444444444444444444444444444444444444333o',
  '.o4444444444444444444444444444444444444333o',
  '.o4444444444444444444444444444444444443333o',
  '..o44444444444444444444444444444444443333o',
  '..o44444444444444444444444444444444433333o',
  '...o444444444444444444444444444444433333o',
  '....o4444444444444444444444444444443333o',
  '.....oo444444444444444444444444444433oo',
  '.......oo44444444444444444444444444oo',
  '.........ooo44444444444444444444ooo',
  '............oooo444444=44444oooo',
  '................oooooooooooo',
] };

// The child's body, one for each body plan
export const CHILD_BODY = {
  // four-legged: a small low body behind, on three stubs
  quad: { rows: [
    '.....oooooooooooooooooooooo',
    '...oo44444=4444444444444444oo',
    '..o444444444444444444444444443o',
    '.o44444444444444444444444444433o',
    '.o44444444444444444444444444433o',
    '.o44444444444444444444444444333o',
    '.o44443oo44443ooooooooo4444333o',
    '.o44443o.o44443o.......o444333o',
    '.o44433o.o44433o.......o443333o',
    '..ooooo...ooooo.........oooooo',
  ] },
  // serpent: a short tail trailing along the ground
  serpent: { rows: [
    '....oooooooooooo',
    '..oo44444=444444oooooo',
    '.o44444444444444444444ooooo',
    'o444444444444444444444444444oooo',
    'o44444444444444444444444444444443ooo',
    'o4444444444444444444444444444444333333oo',
    'o444444444444444444444443333333333333333o',
    '.oo44444444444444433333333333333333333oo',
    '...oooooooooooooooooooooooooooooooooooo',
  ] },
  // floater: a teardrop
  floater: { rows: [
    '....oooooooooooo',
    '..oo444444=44444oo',
    '.o44444444444444443o',
    '.o44444444444444433o',
    '..o444444444444433o',
    '...o4444444444433o',
    '....o44444444433o',
    '.....o444444433o',
    '......oo44433oo',
    '........ooooo',
  ] },
  // two-legged: a little pear on two feet
  biped: { rows: [
    '.....oooooooooooooo',
    '...oo4444444=444444oo',
    '..o444444444444444443o',
    '.o44444444444444444433o',
    '.o44444444444444444433o',
    '.o44444444444444444333o',
    '.o44444444444444444333o',
    '..o444444444444443333o',
    '..o44443ooooo4443333o',
    '..o33333o...o333333o',
    '...ooooo.....oooooo',
  ] },
  // bird: an egg on two small feet
  avian: { rows: [
    '......oooooooooooo',
    '....oo44444=444444oo',
    '..oo4444444444444444oo',
    '.o4444444444444444443o',
    'o444444444444444444433o',
    'o444444444444444444433o',
    'o444444444444444444333o',
    '.o4444444444444443333o',
    '..oo444444444443333oo',
    '....ooogoooooogoooo',
    '.....ogo.....ogo',
  ] },
  // one-piece: a low mound
  blob: { rows: [
    '..........oooooooooooooooooooooooooooo',
    '......oooo4444444444444=44444444444444oooo',
    '...ooo444444444444444444444444444444444433ooo',
    '.oo44444444444444444444444444444444444444333oo',
    'o4444444444444444444444444444444444444443333333o',
    '.oo333333333333333333333333333333333333333333oo',
    '...oooooooooooooooooooooooooooooooooooooooo',
  ] },
};

export const CHILD_CHEEK = { pivot: [3, 1], rows: [
  '.PPPPP.',
  'PPPPPPP',
  '.PPPPP.',
] };
export const CHILD_FACE = { eyes: 10, mouth: 6, cheeks: [15, 6] };
