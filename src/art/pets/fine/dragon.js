// FINE-LINE PET ART (see axolotl.js for the format).
//
// The dragon founder, Ryu: indigo with lime, colours no other founder uses.
// It is here to round out the gene pool, so every piece is a kind the others
// lack: the only horns, the only snout, bat wings (a third kind of wing), a
// tail with a spade on the end, claws, a spiny crest for hair, webbed fan
// ears, slit eyes, a broad head that narrows to a snout, and a body with spikes at the
// shoulder and a plated belly. It has its own body plan, "drake": standing
// on four legs and seen from the side, the head up at the front, spikes along
// the back, both wings showing and the tail behind.
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
  { on: 'body', at: [6, 10], rows: [
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

// Body, "scaled", in its own plan: a little dragon standing on four legs, seen from the side. The chest is up at the
// front under the head; the back runs flat under the wing and then drops to the rump in three spikes, clear of the
// wing; the legs narrow to the ankle and end in a rounded foot that points forward. The two legs on the far side are in
// the deeper shade. `farWing` draws the wing a second time behind the body, a little up and to the left, so both show.
export const BODY = { farWing: [-8, -5], rows: [
  '..........oooooooooooooo',
  '........oo44444444444444oo',
  '.......o444444444444444444o',
  '.......o44444444=4444444444o',
  '......o444444444444444444444o.................o',
  '......o444444444444444444444o................o7o...o',
  '.....o4444444444444444444444o...............o777o.o7o',
  '.....o44444444444444444444444oooooooooooooooooooo777o..o',
  '.....o4444444444444444444444444444444444444444444ooooo.o7o',
  '.....o44444444444444444444444444(444444444444444444444oooo',
  '.....o444444444444444444444444444444444444444444444444433o',
  '.....o444444444444444444444444444444444444444444444444433o',
  '.....o4444444444444444444444444444444444444444444444444333o',
  '.....o444444444444444444444444444444444444444444444444433~o',
  '.....o4444444444444444444444444444444444444444444444444333o',
  '.....o4444444444444444444444444444444444444444444444444333o',
  '......o444444444444444444444444444444444444444444444444333o',
  '.......o4444444444444444444444444444444444444444444444433o',
  '........o444444444444444444444444444444444444444444444333o',
  '.........o4444444444444444444444444444444444444444444333o',
  '..........o44444444444444444444444444444444444444444333o',
  '..........o444444444oo33333oooooooo3333oo4444444444333o',
  '..........o444444444oo33333o......o3333oo4444444444333o',
  '..........o444444444oo33333o......o3333oo4444444444333o',
  '...........o44444444oo33333o......o3333o.o44444444333o',
  '...........o44444443oo33333o......o3333o...o44444333o',
  '...........o44444443oo33333o......o3333o...o44444333o',
  '...........o44444443ooooooooo......oooooo...o44444333o',
  '........ooo444444443o...................ooo444444333o',
  '.......o44444!444443o..................o44444!443333o',
  '........oooooooooooo....................oooooooooooo',
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
export const WINGS = { pivot: [1, 21], opensRight: true, rows: [
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

// ---------- The "scaled" body in the other six body plans ----------
// Always smooth with spikes in the accent colour: on the rump, down the back, or at the shoulders.
export const BODIES = {
  // four-legged: a low body with two spikes on its rump
  quad: { rows: [
    '..............ooooooooooooooooooooo',
    '........oooooo444444444444444444444oooo',
    '....oooo4444444444444444444444444444444ooo',
    '..oo44444444444444444444444444444444444444oo',
    '.o444444444444444444444444444444444444444444oo',
    '.o44444444444444444444444444444444444444444444oooo',
    '.o4444444444444444444444444444444444444444444443777o',
    '.o44444444444444444444444444444444444444444444433ooo',
    '.o444444444444444444444444444444444444(44444444433o',
    '.o4444444444444444444444444444444444444444444444433o',
    '.o44444444444444=4444444444444444444444444444444433ooo',
    '.o44444444444444444444444444444444444444444444444333777o',
    '..o4444444444444444444444444444444444444444444444333ooo',
    '..o4444444444444444444444444444444444444444444444333o',
    '..o4444444444444444444444444444444444444444444444~33o',
    '..o4444444444444444444444444444444444444444444443333o',
    '..o4444444444444444444444444444444444444444444443333o',
    '.o44444444444444444444444444444444444444444444443333o',
    '.o44444443ooo44444443ooooooooooo4444444444444443333o',
    '.o44444443o.o44444443o......o44444444444444443333o',
    '.o44444433o.o44444433o......o4444444444444433333o',
    '.o444!4333o.o444!4333o.......o444444444!44333333o',
    '..o333333o...o333333o.........oo33333333333333oo',
    '...oooooo.....oooooo............oooooooooooooo',
  ] },
  // serpent: a long tapering body with three spikes standing on its back
  serpent: { rows: [
    '.',
    '.',
    '...........oooooooooo',
    '........ooo4444444444ooo',
    '......oo4444444444444444oo......o',
    '.....o44444444444444444444oooooo7o',
    '....o44444444444444444444444444oooo.....o',
    '...o4444444444444444444444444444444oooo7o',
    '...o44444444444=44444444444444444444444ooo....o',
    '..o444444444444444444444444444444444444444oooo7o',
    '..o444444444444444444444444444444444444444444ooo',
    '..o444444444444444444444444444444444444444444444oo',
    '..o4444444444444444444444444444444(444444444444444oo',
    '..o4444444444444444444444444444444444444444444444443oo',
    '..o444444444444444444444444444444444444444444444444433o',
    '..o4444444444444444444444444444444444444444444444444333o',
    '..o44444444444444444444444444444444444444444444444443333o',
    '...o4444444444444444444444444444444444444444444444443333~o',
    '...o44444444444444444444444444444444444444444444333333333o',
    '....o444444444444444444444444444444444444443333333333333o',
    '.....oo44444!444444444444444444444!3333333333333333333ooo',
    '.......ooooooooooooooooooooooooooooooooooooooooooooooo',
  ] },
  // floater: a teardrop with two spikes down one side
  floater: { rows: [
    '......oooooooooooooooo',
    '....oo44444444=4444444oo',
    '..oo44444444444444444444oo',
    '.o444444444444444444444444o',
    'o44444444444444444444444444o',
    'o44(44444444444444444444)43o',
    'o44444444444444444444444433ooo',
    'o44444444444444444444444433777o',
    'o44444444444444444444444433ooo',
    '.o444444444444444444444433o',
    '.o444444444444444444444333o',
    '..o4444444444444444444333ooo',
    '...o4444!4444444444!4333777o',
    '....o444444444444444333ooo',
    '.....o4444444444444333o',
    '......o44444444444333o',
    '.......o444444444333o',
    '........o4444444333o',
    '.........oo444~33oo',
    '...........oooooo',
  ] },
  // two-legged: a bean sitting up, with a spike on each shoulder
  biped: { rows: [
    '.....o..oooooooooooooooo..o',
    '....o7oo4444444444444444oo7o',
    '....oooo44444444=4444444oooo',
    '....oo44444444444444444444oo',
    '...o444444444444444444444444o',
    '..o44444444444444444444444444o',
    '.o44<4444444444444444444444>43o',
    '.o4444444444444444444444444433o',
    'o(4444444444444444444444444433)o',
    'o444444444444444444444444444333o',
    'o444444444444444444444444444333o',
    'o444444444444444444444444444333o',
    'o444444444444444444444444444333o',
    'o444444444444444444444444444333o',
    'o444444444444444444444444444333o',
    'o44444444444444444444444444443~o',
    'o444444444444444444444444443333o',
    '.o4444444444444444444444443333o',
    '..o44444444444444444444433333o',
    '...o44444!444444444444!43333o',
    '.....oo333333333333333333oo',
    '.......oooooooooooooooooo',
  ] },
  // bird: an egg with a spike on each shoulder
  avian: { rows: [
    '......o..oooooooooooooooo..o',
    '.....o7oo4444444444444444oo7o',
    '.....oooo44444444=4444444oooo',
    '.....oo44444444444444444444oo',
    '....o444444444444444444444444o',
    '...o44444444444444444444444444o',
    '..o44(4444444444444444444444)43o',
    '.o444444444444444444444444444433o',
    'o44444444444444444444444444444333o',
    'o44444444444444444444444444444333o',
    'o44444444444444444444444444444333o',
    'o44444444444444444444444444444333o',
    'o44444444444444444444444444444333o',
    'o44444444444444444444444444444333o',
    'o44444444444444444444444444444333o',
    'o4444444444444444444444444444443~o',
    '.o444444444444444444444444443333o',
    '.o444444444444444444444444433333o',
    '..o4444444444444444444444333333o',
    '...o44444444444444444443333333o',
    '....oo444444!44444444!333333oo',
    '......ooo3333333333333333ooo',
    '.........oooooooooooooooo',
  ] },
  // one-piece: a tall mound with a spike standing on each shoulder; the head melts into it
  blob: { rows: [
    '................oooooooooooooooooooooooooooo',
    '...........ooooo4444444444444444444444444444ooooo',
    '...o....ooo44444444444444444444444444444444444444ooo....o',
    '..o7oooo44444444444444444444444444444444444444444444oooo7o',
    '...oo44444444444444444444444444444444444444444444444444oo',
    '..o444444444444444444444444444444444444444444444444444444o',
    '.o44444444444444444444444444444444444444444444444444444444o',
    '.o44444444444444444444444444444444444444444444444444444444o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o44(4444444444444444444444444444444444444444444444444444)33o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o4444444444444444444444444444444444444444444444444444444333o',
    'o44444444444444444444444444444=4444444444444444444444444333o',
    'o444444444444444444444444444444444444444444444444444433333~o',
    'o4444444444444444444444444444444444444444444444444444433333o',
    '.o44444444444444444444444444444444444444444444444444333333o',
    '...oo44444444444!44444444444444444444444444!44443333333oo',
    '.....oooooooooooooooooooooooooooooooooooooooooooooooooo',
  ] },
};
