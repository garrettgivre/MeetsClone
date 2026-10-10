// FINE-LINE PET ART (see axolotl.js for the format). A DESIGN: not yet in the gene pool.
//
// The dragon founder, Ryu: indigo with lime, colours no other founder uses.
// It is here to round out the gene pool, so every piece is a kind the others
// lack: the only horns, the only snout, bat wings (a third kind of wing), a
// tail with a spade on the end, claws, a spiny crest for hair, webbed fan
// ears, slit eyes, and a body with a ridge of spikes down its back and a
// plated belly. It has its own body plan, "drake": side-on like the
// four-legged plan, but the head is carried up on a short neck and the wing
// grows from the back.
// Extra colours here: 6 7 8 accent (shadow, base, light), e eye colour, m pale grey, b B gem blues, P blush pink.

// (deeper: the body is drawn one shade down the ramp; the lightest indigo is too close to the jellyfish's pale blue)
export const LOOK = { color: 'indigo', accent: 'lime', eye: 'green', deeper: true };
export const FORM = 'drake';
export const GENES = { head: 'dragon', body: 'scaled', ears: 'fins', tail: 'arrow', feet: 'claws', wings: 'bat', topper: 'horns', hair: 'spines', eyes: 'slit', nose: 'snout', mouth: 'grin', mark: 'gem', pattern: 'plates' };

// Head, "dragon": 56 x 41. Round on top, then a broad square jaw with two small spikes at each corner.
export const HEAD = { rows: [
  '....................oooooooooooooooo',
  '................oooo44444444^4444444oooo',
  '.............ooo444444444444444444444444ooo',
  '...........oo444444444444444444444444444444oo',
  '.........oo4[444444444444444444444444444444]4oo',
  '........o44444444444444444444444444444444444444o',
  '.......o4444444444444444444444444444444444444444o',
  '......o444444444444444444444444444444444444444444o',
  '.....o44444444444444444444444444444444444444444444o',
  '.....o44444444444444444444444444444444444444444444o',
  '....o4444444444444444444444444444444444444444444444o',
  '....o4444444444444444444444444444444444444444444444o',
  '...o444444444444444444444444444444444444444444444444o',
  '...o444444444444444444444444444444444444444444444444o',
  '...o444444444444444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444444444444443o',
  '..o44444444444444444444444444444444444444444444444443o',
  '..o{444444444444444444444444444444444444444444444444}o',
  '..o44444444444444444444444444444444444444444444444443o',
  '..o44444444444444444444444444444444444444444444444443o',
  '..o44444444444444444444444444444444444444444444444443o',
  '..o4444444444444444444444444@444444444444444444444443o',
  '..o44444444444444444444444444444444444444444444444433o',
  '.o4444444444444444444444444444444444444444444444444433o',
  'o444444444444444444444444444444444444444444444444444333o',
  '.o4444444444444444444444444444444444444444444444444333o',
  '..o44444444444444444444444444444444444444444444444333o',
  '.o4444444444444444444444444444444444444444444444444333o',
  'o444444444444444444444444444444444444444444444444444333o',
  '.o4444444444444444444444444444444444444444444444443333o',
  '...o444444444444444444444444444444444444444444443333o',
  '....o4444444444444444444444444444444444444444433333o',
  '.....o44444444444444444444444444444444444444433333o',
  '......o444444444444444444444444444444444443333333o',
  '.......o4444444444444444444444444444444433333333o',
  '........oo444444444444444444444444443333333333oo',
  '..........oooo44444444444444=4444333333333oooo',
  '..............oooooooooooooooooooooooooooo',
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
  { on: 'body', at: [10, 10], rows: [
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

// Body, "scaled", in its own plan: a short neck, a round body with three spikes on its back, a front leg and a big haunch
export const BODY = { rows: [
  '................oooooooooo',
  '..............oo4444444444oo',
  '.............o44444444444444o',
  '.............o444444=4444444o',
  '.............o44444444444444o',
  '.............o44444444444444o',
  '.............o44444444444444o....o...o...o',
  '.............o44444444444444o...o7o.o7o.o7o',
  '............o444444444444444oooo777o777o777ooo',
  '.........ooo44444444444444444444444444444444444ooo',
  '.......oo4444444444444444444444444444444444444444oo',
  '......o44444444444444444444444444444444444444(444433o',
  '.....o44444444444444444444444444444444444444444444433o',
  '....o4444444444444444444444444444444444444444444444333o',
  '....o4444444444444444444444444444444444444444444444333o',
  '....o4444444444444444444444444444444444444444444444333o',
  '....o4444444444444444444444444444444444444444444444333o',
  '....o4444444444444444444444444444444444444444444444333o',
  '....o444444444444444444444444444444444444444444444~333o',
  '....o4444444444444444444444444444444444444444444443333o',
  '....o4444444444444444444444444444444444444444444443333o',
  '.....o44444444444444444444444444444444444444444443333o',
  '......o444444444444444444444444444444444444444433333o',
  '.......o4444444444444444444444444444444444444433333o',
  '........o444444444443oooooooooo4444444444444433333oo',
  '........o444444444433o........o44444444444443333o',
  '........o444444444433o........o44444444444443333o',
  '........o44444!444333o........o4444444!444433333o',
  '.........oooooooooooo..........ooooooooooooooooo',
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

// Nose, "snout": two nostrils set apart
export const NOSE = { pivot: [3, 0], rows: [
  'oo..oo',
] };

// Mouth, "grin": a wide flat grin with two small teeth showing
export const MOUTH = { pivot: [4, 0], rows: [
  'o.......o',
  '.ooooooo.',
  '..w...w..',
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

export const FACE = { eyes: 14, nose: 5, mouth: 8, mark: [0, -15], cheeks: [20, 8] };
