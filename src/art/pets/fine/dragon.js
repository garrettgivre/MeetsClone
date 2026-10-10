// FINE-LINE PET ART (see axolotl.js for the format). A DESIGN: not yet in the gene pool.
//
// The dragon founder, Ryu: indigo with lime, colours no other founder uses.
// It is here to round out the gene pool, so every piece is a kind the others
// lack: the only horns, the only snout, bat wings (a third kind of wing), a
// tail with a spade on the end, claws, a spiny crest for hair, webbed fan
// ears, slit eyes, an angular head with a long muzzle, and a body with spikes down
// its back and a plated belly. It has its own body plan, "drake": sitting up
// and seen from the side, with a small arm in front, the wing on the back and
// the tail behind.
// Extra colours here: 6 7 8 accent (shadow, base, light), e eye colour, m pale grey, b B gem blues, P blush pink.

// (deeper: the body is drawn one shade down the ramp; the lightest indigo is too close to the jellyfish's pale blue)
export const LOOK = { color: 'indigo', accent: 'lime', eye: 'green', deeper: true };
export const FORM = 'drake';
export const GENES = { head: 'dragon', body: 'scaled', ears: 'fins', tail: 'arrow', feet: 'claws', wings: 'bat', topper: 'horns', hair: 'spines', eyes: 'slit', nose: 'snout', mouth: 'grin', mark: 'gem', pattern: 'plates' };

// Head, "dragon": 54 x 40. A broad flat-topped skull with its corners rounded off, and a square muzzle below it
// (shorter than the first long one, which made a horse of it).
export const HEAD = { rows: [
  '.................oooooooooooooooooooo',
  '............ooooo4444444444^444444444ooooo',
  '.........ooo444444444444444444444444444444ooo',
  '......ooo444444444444444444444444444444444444ooo',
  '....oo444[4444444444444444444444444444444444]444oo',
  '..oo4444444444444444444444444444444444444444444444oo',
  '.o44444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444443o',
  'o4444444444444444444444444444444444444444444444444443o',
  'o4444444444444444444444444444444444444444444444444443o',
  'o{44444444444444444444444444444444444444444444444443}o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o44444444444444444444444444@4444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444333o',
  '.oo444444444444444444444444444444444444444444444333oo',
  '...ooo444444444444444444444444444444444444443333ooo',
  '......ooo444444444444444444444444444444443333ooo',
  '.........oo44444444444444444444444444443333oo',
  '...........o444444444444444444444444444333o',
  '............o4444444444444444444444444433o',
  '............o4444444444444444444444444433o',
  '............o4444444444444444444444444433o',
  '............o4444444444444444444444444433o',
  '............o4444444444444444444444444433o',
  '............o4444444444444444444444444433o',
  '............o4444444444444444444444444333o',
  '............o4444444444444444444444444333o',
  '............o4444444444444444444444444333o',
  '............o4444444444444444444444444333o',
  '.............o44444444444444444444443333o',
  '.............oo444444444444444444433333oo',
  '...............ooo444444444=44433333ooo',
  '..................oooooooooooooooooo',
] };

// Ears, "fins": a webbed fan on three spines, the web in the accent colour. The left one; its base lies behind the head.
export const EARS = { pivot: [9, 13], rows: [
  '....o',
  '...o7o....o',
  '...o77o..o7o',
  '..o7777oo77o',
  '..o77777o777o.o',
  '.o7777777o77oo7o',
  '.o77777777o7o77o',
  'o777777777oo777o',
  'o7777777777o77o',
  '.o777777777777o',
  '.o77777777777o',
  '..o777777777o',
  '...o44444444',
  '....o4444444',
] };

// The same ear at a child's size
export const EARS_SMALL = { pivot: [5, 7], rows: [
  '..o',
  '.o7o..o',
  '.o77oo7o',
  'o7777o7o',
  'o777777o',
  '.o7777o',
  '..o4444',
  '...o444',
] };

// Topper, "horns": a pair of pale horns curving out and up (`wide`: it sits across the crown, so it does not step aside for hair)
export const TOPPER = { pivot: [12, 8], wide: true, rows: [
  '.oo....................oo',
  'owwo..................owwo',
  'owwwo................owwwo',
  '.owwwo..............owwwo',
  '.omwwwo............owwwmo',
  '..omwwwo..........owwwmo',
  '...omwwwo........owwwmo',
  '....ommwo........owmmo',
  '.....oooo........oooo',
] };

// Hair, "spines": a crest of three spikes in the accent colour
export const HAIR = { pivot: [6, 3], rows: [
  '......o',
  '..o..o7o..o',
  '.o7oo777oo7o',
  'o777o777o777o',
] };

// Markings, "plates": a plated belly in the accent colour, ridge by ridge (it shows on whatever body it lies on)
export const OVERLAYS = [
  { on: 'body', at: [10, 11], rows: [
    '....8888888888888',
    '..88888888888888888',
    '.7777777777777777777',
    '888888888888888888888',
    '888888888888888888888',
    '777777777777777777777',
    '888888888888888888888',
    '888888888888888888888',
    '777777777777777777777',
    '.8888888888888888888',
    '.8888888888888888888',
    '..77777777777777777',
    '....8888888888888',
  ] },
];

// Body, "scaled", in its own plan: sitting up, seen from the side. A round belly, a small arm held out in front,
// a big foot forward and one behind, and three spikes down the back to where the tail joins.
export const BODY = { rows: [
  '..............oooooooooooo',
  '............oo444444444444oo',
  '...........o44444444=4444444o',
  '...........o4444444444444444o',
  '..........o444444444444444444o',
  '..........o4444444444444444444ooo',
  '.........o44444444444444444444777o',
  '.........o44444444444444444444ooo',
  '........o4444444444444444444443o',
  '........o4444444444444444444444(o',
  '.......o4444444444444444444444443ooo',
  '......o44444444444444444444444443777o',
  '...oooo44444444444444444444444443ooo',
  '..o4444444444444444444444444444433o',
  '..o443444444444444444444444444444433o',
  '...oooo4444444444444444444444444444433ooo',
  '......o4444444444444444444444444444433777o',
  '......o4444444444444444444444444444433ooo',
  '......o4444444444444444444444444444433o',
  '......o4444444444444444444444444444433o',
  '......o4444444444444444444444444444433o',
  '......o4444444444444444444444444444433o',
  '......o444444444444444444444444444433o',
  '......o4444444444444444444444444444433o',
  '......o44444444444444444444444444444433o',
  '......o4444444444444444444444444444443~o',
  '......o44444444444444444444444444444333o',
  '......o4444444444444444444444444444333o',
  '.....o4444444444444444444444444444333o',
  '...oo4444444444444444444444444444333o',
  '..o44444444444444444o44444444444333o',
  '..o44444444444444443o4444444444333o',
  '..o444444!4444444333o444444!444333o',
  '...oooooooooooooooooooooooooooooo',
] };

// Tail, "arrow": a thick tail that curls up behind and ends in a spade in the accent colour. Its left end lies behind the body.
export const TAIL = { pivot: [1, 15], rows: [
  '..................o',
  '.................o7o',
  '................o777o',
  '...............o77777o',
  '..............o7777777o',
  '...............oo777oo',
  '.................o4o',
  '................o44o',
  '...............o444o',
  '.............oo4443o',
  '...........oo44443o',
  '........ooo444443o',
  '.....ooo44444433o',
  '..ooo444444433oo',
  'oo44444444333o',
  '444444443333o',
  '4444443333oo',
  '33333ooooo',
  'ooooo',
] };

// Feet, "claws": a broad foot with three pale claws
export const FEET = { pivot: [4, 0], rows: [
  'o44444443o',
  'o44444433o',
  'wowowo333o',
  'o.o.o.ooo',
] };

// Wings, "bat": a wing of skin in the accent colour stretched over three fingers, rising from the back. The left one.
export const WINGS = { pivot: [1, 21], rows: [
  '............oo',
  '...........o87o',
  '..........o8777o......oo',
  '.........o877777o...oo87o',
  '........o87777777ooo8777o',
  '.......o877777777o877777o',
  '......o8777777777o8777777o',
  '.....o87777777777o8777777o',
  '....o877777777777o87777777o',
  '....o87777777777o877777777o',
  '...o877777777777o877777766o',
  '...o87777777777o8777777666o',
  '..o877777777777o877777666o',
  '..o87777777777o8777766oo',
  '.o877777777777o87766oo',
  '.o87777777777o8766o',
  'o877777o7777o866o',
  'o8777oo.o77oo66o',
  'o877o...o7o..oo',
  'o87o.....o',
  'o8o',
  'oo',
] };

// Eyes, "slit": a round eye in the eye colour with a narrow upright pupil and one shine
export const EYE = { pivot: [4, 4], rows: [
  '..oooo..',
  '.oeooeo.',
  'owwooeeo',
  'owwooeeo',
  'oeeooeeo',
  'oeeooeeo',
  'oeeooeeo',
  '.oeooeo.',
  '..oooo..',
] };

// Nose, "snout": two small nostrils set apart
export const NOSE = { pivot: [2, 0], rows: [
  'o...o',
] };

// Mouth, "grin": a small curved smile with one little fang showing
export const MOUTH = { pivot: [3, 0], rows: [
  'o.....o',
  '.ooooo.',
  '.w.....',
] };

// Forehead mark, "gem": a small cut jewel
export const MARK = { pivot: [2, 2], rows: [
  '..o..',
  '.oBo.',
  'oBwbo',
  '.obo.',
  '..o..',
] };

export const CHEEK = { pivot: [4, 2], rows: [
  '.PPPPPP.',
  'PPPPPPPP',
  'PPPPPPPP',
  '.PPPPPP.',
] };

// (mouthFixed: the mouth keeps its place at the end of the muzzle whether or not there is a nose above it)
export const FACE = { eyes: 14, nose: 12, mouth: 15, mouthFixed: true, mark: [0, -12], cheeks: [17, 3] };
