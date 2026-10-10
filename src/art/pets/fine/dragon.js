// FINE-LINE PET ART (see axolotl.js for the format). A DESIGN: not yet in the gene pool.
//
// The dragon founder, Ryu: indigo with lime, colours no other founder uses.
// It is here to round out the gene pool, so every piece is a kind the others
// lack: the only horns, the only snout, bat wings (a third kind of wing), a
// tail with a spade on the end, claws, a spiny crest for hair, webbed fan
// ears, slit eyes, a broad head that narrows to a snout, and a body with spikes at the
// shoulder and a plated belly. It has its own body plan, "drake": sitting up
// and facing you, with two big feet forward, a wing at each shoulder and the
// tail behind.
// Extra colours here: 6 7 8 accent (shadow, base, light), e eye colour, m pale grey, b B gem blues, P blush pink.

// (deeper: the body is drawn one shade down the ramp; the lightest indigo is too close to the jellyfish's pale blue)
export const LOOK = { color: 'indigo', accent: 'lime', eye: 'green', deeper: true };
export const FORM = 'drake';
export const GENES = { head: 'dragon', body: 'scaled', ears: 'fins', tail: 'arrow', feet: 'claws', wings: 'bat', topper: 'horns', hair: 'spines', eyes: 'slit', nose: 'snout', mouth: 'grin', mark: 'gem', pattern: 'plates' };

// Head, "dragon": 54 x 34. A broad flat-topped skull with rounded corners that narrows in a smooth line to a
// rounded snout. There is no line round the snout: the nostrils and the mouth on it are what make it one.
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
  'o44444444444444444444444444@4444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444333o',
  '.o44444444444444444444444444444444444444444444444333o',
  '..o444444444444444444444444444444444444444444444333o',
  '....oo444444444444444444444444444444444444444333oo',
  '......oo44444444444444444444444444444444444333oo',
  '........oo4444444444444444444444444444444333oo',
  '..........oo444444444444444444444444444333oo',
  '...........o444444444444444444444444444333o',
  '............o4444444444444444444444444333o',
  '............o4444444444444444444444444333o',
  '............o4444444444444444444444444333o',
  '.............o44444444444444444444443333o',
  '..............oo44444444444=4444433333oo',
  '................oooooooooooooooooooooo',
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

// Body, "scaled", in its own plan: sitting up and facing you. A pear of a body, a small arm held out at each side,
// two big feet forward, a spike on each shoulder, a few scale marks at the hips, and a wing socket at each shoulder
// (the sockets are swapped left for right, because the wing part is drawn opening to the right).
export const BODY = { rows: [
  '..............oooooooooooooo',
  '............oo44444444444444oo',
  '...........o44444444=444444444o',
  '..........o44444444444444444444o',
  '.........o4444444444444444444443o',
  '......oooo4444444444444444444443ooo',
  '....o777444444444444444444444443777o',
  '.....oooo44444444444444444444443ooo',
  '.......o4444444444444444444444443o',
  '.......o4)4444444444444444444444(3o',
  '......o4444444444444444444444444433o',
  '..ooooo4444444444444444444444444433ooooo',
  '.o44444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444333o',
  'o4444444444444444444444444444444444444333o',
  '.o44444444444444444444444444444444444333o',
  '..ooooo4444444444444444444444444333ooooo',
  '......o4444444444444444444444444333o',
  '......o4444444444444444444444444333o',
  '......o4343444444444444444443434333o',
  '......o4434444444444444444444344333o',
  '......o4444444444444444444444444333o',
  '......o4444444444444444444444444333o',
  '......o4444444444444444444444444333o',
  '......o4444444444444444444444444333o',
  '......o444444444444444444444444433~o',
  '......o4444444444444444444444443333o',
  '...oooo4444444444444444444444443333oooo',
  '..o444444444444444o444o444444444444333o',
  '.o44444444444444444o4o44444444444443333o',
  '.o44444444444444443ooo44444444444443333o',
  '.o4444444!444444333o.o44444444!44443333o',
  '..ooooooooooooooooo...ooooooooooooooooo',
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

// Eyes, "slit": a dragon's eye. A heavy lid slants down toward the middle of the face, over an iris in the eye colour
// with a narrow upright pupil and one shine. The left one; the right is turned round.
export const EYE = { pivot: [5, 3], mirror: true, rows: [
  'oooo',
  'oeeeoooo',
  'oeeooeeeoo',
  'owwooeeeeo',
  'oeeooeeeeo',
  '.oeooeeeo',
  '..oooooo',
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

// (mouthFixed: the mouth keeps its place low on the snout whether or not there is a nose above it)
export const FACE = { eyes: 14, nose: 9, mouth: 12, mouthFixed: true, mark: [0, -11], cheeks: [19, 5] };
