// FINE-LINE PET ART, NOT YET USED BY THE GAME (see axolotl.js for the format).
//
// The owl founder, Hoolet: a moon owlet in black, white and grey and nothing
// else. A wide round grey head with two dark-tipped tufts, a white heart of a
// face with huge dark eyes and a small grey beak, a white crescent on the brow,
// an egg of a body with a white speckled front, dark folded wings and dark feet.
// The one colour beyond those is a small pink blush, which every founder has.
// Extra colours here: g dark grey, P blush pink.

// (deeper: the body is drawn one shade down the ramp, a mid grey, so the white and the dark both show against it)
export const LOOK = { color: 'slate', accent: 'slate', deeper: true };
// The body plan this founder is drawn in, and the gene names of its parts
export const FORM = 'avian';
export const GENES = { head: 'owl', body: 'feathered', ears: 'tufts', wings: 'feathered', feet: 'talons', topper: 'crest', eyes: 'owl', mouth: 'beak', mark: 'moon', pattern: 'facedisk' };

// Head, "owl": 54 x 42, wide and round with a broad top
export const HEAD = { rows: [
  '.................oooooooooooooooooooo',
  '.............oooo4444444444^444444444oooo',
  '..........ooo4444444444444444444444444444ooo',
  '........oo4444444444444444444444444444444444oo',
  '......oo4[4444444444444444444444444444444444]4oo',
  '.....o444444444444444444444444444444444444444444o',
  '....o44444444444444444444444444444444444444444444o',
  '...o4444444444444444444444444444444444444444444444o',
  '..o444444444444444444444444444444444444444444444444o',
  '..o444444444444444444444444444444444444444444444444o',
  '.o44444444444444444444444444444444444444444444444444o',
  '.o44444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444444o',
  'o4444444444444444444444444444444444444444444444444443o',
  'o4444444444444444444444444444444444444444444444444443o',
  'o{44444444444444444444444444444444444444444444444444}o',
  'o4444444444444444444444444444444444444444444444444443o',
  'o4444444444444444444444444444444444444444444444444443o',
  'o4444444444444444444444444444444444444444444444444443o',
  'o44444444444444444444444444@4444444444444444444444443o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  'o4444444444444444444444444444444444444444444444444433o',
  '.o44444444444444444444444444444444444444444444444333o',
  '.o44444444444444444444444444444444444444444444444333o',
  '..o444444444444444444444444444444444444444444443333o',
  '..o444444444444444444444444444444444444444444443333o',
  '...o4444444444444444444444444444444444444444433333o',
  '....o44444444444444444444444444444444444444433333o',
  '.....oo4444444444444444444444444444444443333333oo',
  '.......oo444444444444444444444444444433333333oo',
  '.........ooo444444444444444444444333333333ooo',
  '............ooo444444444444444333333333ooo',
  '...............oooo44444444=4443333oooo',
  '...................oooooooooooooooo',
] };

// Ears, "tufts": a pointed feather tuft with a black tip. The left one; its base lies behind the head.
export const EARS = { pivot: [8, 11], rows: [
  'oo',
  'ooo',
  'oooo',
  'ooooo',
  'o4oooo',
  'o44oooo',
  'o444o4oo',
  'o4444444o',
  '.o4444444o',
  '.o44444444o',
  '..o44444444',
  '..o44444444',
  '...o4444444',
] };

// The same tuft at a child's size
export const EARS_SMALL = { pivot: [4, 6], rows: [
  'oo',
  'ooo',
  'o4oo',
  'o44oo',
  '.o444o',
  '.o4444',
  '..o444',
] };

// Markings, "facedisk": a white heart of a face, and a white front with a few dark flecks
export const OVERLAYS = [
  { on: 'head', at: [4, 13], rows: [
    '.........wwwwwww...............wwwwwww',
    '......wwwwwwwwwwwww.........wwwwwwwwwwwww',
    '.....wwwwwwwwwwwwwww.......wwwwwwwwwwwwwww',
    '....wwwwwwwwwwwwwwwww.....wwwwwwwwwwwwwwwww',
    '...wwwwwwwwwwwwwwwwwww...wwwwwwwwwwwwwwwwwww',
    '..wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '..wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '..wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '...wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.....wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.......wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    '..........wwwwwwwwwwwwwwwwwwwwwwwwwww',
    '.............wwwwwwwwwwwwwwwwwwwww',
    '.................wwwwwwwwwwwww',
    '.....................wwwww',
  ] },
  { on: 'body', at: [7, 5], rows: [
    '.....wwwwwwwwww',
    '...wwwwwwwwwwwwww',
    '..wwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwww',
    'wwwwgwgwwwwwwgwgwwww',
    'wwwwwgwwwwwwwwgwwwww',
    'wwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwgwgwwwwwwww',
    'wwwwwwwwwwgwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwww',
    '..wwwwwwwwwwwwwwww',
    '...wwwwwwwwwwwwww',
    '.....wwwwwwwwww',
  ] },
];

// Body, "feathered": a small egg of a body
export const BODY = { rows: [
  '............oooooooooo',
  '.........ooo4444444444ooo',
  '.......oo44444444=4444444oo',
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
] };

// Wings, "feathered": a dark folded wing with one feather line, lying over the body's side. The left one.
export const WINGS = { pivot: [8, 1], front: true, rows: [
  '....ooooo',
  '..oogggggo',
  '.oggggggggo',
  '.ogggggggggo',
  'oggggggggggo',
  'oggggggggggo',
  'oggggggggggo',
  'oggggggggggo',
  'ogggggggoggo',
  '.oggggggoggo',
  '.ogggggoggo.',
  '.oggggoggggo',
  '..oggggggo',
  '..ogggggo',
  '...ogggo',
  '...oggo',
  '....oo',
] };

// Feet, "talons": small dark three-toed feet
export const FEET = { pivot: [3, 0], rows: [
  '.ooooo.',
  'ogggggo',
  'ogogogo',
  '.o.o.o.',
] };

// Eyes, "owl": huge and round, with a big shine and a small one
export const EYE = { pivot: [5, 5], rows: [
  '...ooooo...',
  '..ooooooo..',
  '.owwwooooo.',
  'oowwwoooooo',
  'oowwwoooooo',
  'ooooooooooo',
  'ooooooooooo',
  'ooooooowwoo',
  '.oooooowwo.',
  '..ooooooo..',
  '...ooooo...',
] };

// Mouth, "beak": a small grey beak
export const MOUTH = { pivot: [2, 0], rows: [
  '.ooo.',
  'ogggo',
  'ogggo',
  '.ogo.',
  '..o..',
] };

// Forehead mark, "moon": a white crescent
export const MARK = { pivot: [2, 3], rows: [
  '..www',
  '.ww..',
  'ww...',
  'ww...',
  '.ww..',
  '..www',
] };

export const CHEEK = { pivot: [3, 1], rows: [
  '.PPPPP.',
  'PPPPPPP',
  '.PPPPP.',
] };

// Topper, "crest" (the old plume's place): two short feathers standing up, dark with white tips
export const TOPPER = { pivot: [3, 6], rows: [
  '.o...o.',
  'owo.owo',
  'owo.owo',
  'ogo.ogo',
  'oggoggo',
  '.ogggo.',
  '..ooo..',
] };

export const FACE = { eyes: 11, mouth: 4, mark: [0, -17], cheeks: [21, 8] };

// ---------- The "feathered" body in the other five body plans ----------
// Always smooth with feather ends: rounded scallops along a hem, in tiers, or fanned out at the back.
export const BODIES = {
  // four-legged: a low body with a row of feather ends across the chest, and a rump that ends in two rounded tail feathers
  quad: { rows: [
    '..............ooooooooooooooooooooo',
    '........oooooo444444444444444444444oooo',
    '....oooo4444444444444444444444444444444ooo',
    '..oo44444444444444444444444444444444444444oo',
    '.o444444444444444444444444444444444444444444oo',
    '.o44444444444444444444444444444444444444444444oo',
    '.o4444444444444444444444444444444444444444444443o',
    '.o444444444444444444444444444444444444444444444433o',
    '.o444444444444444444444444444444444444(444444444433o',
    '.o44444444444444444444444444444444444444444444444433o',
    '.o44444444444444=4444444444444444444444444444444433o',
    '.o444444444444444444444444444444444444444444444444333o',
    '.o4444444444444444444444444444444444444444444444443333o',
    '.o4443444344434443444344434444444444444444444444333oo',
    '.o44443334444433344444333444444444444444444444444~333o',
    '.o4444444444444444444444444444444444444444444444443333o',
    '.o444444444444444444444444444444444444444444444443333o',
    '.o44444444444444444444444444444444444444444444443333o',
    '.o44444443ooo44444443ooooooooooo4444444444444443333o',
    '.o44444443o.o44444443o......o44444444444444443333o',
    '.o44444433o.o44444433o......o4444444444444433333o',
    '.o444!4333o.o444!4333o.......o444444444!44333333o',
    '..o333333o...o333333o.........oo33333333333333oo',
    '...oooooo.....oooooo............oooooooooooooo',
  ] },
  // serpent: a long tapering body that ends in a fan of three tail feathers
  serpent: { rows: [
    '.',
    '.',
    '...........oooooooooo',
    '........ooo4444444444ooo',
    '......oo4444444444444444oo',
    '.....o44444444444444444444ooooo',
    '....o44444444444444444444444444oooo',
    '...o4444444444444444444444444444444oooo',
    '...o44444444444=44444444444444444444444ooo',
    '..o444444444444444444444444444444444444444ooo',
    '..o444444444444444444444444444444444444444444ooo',
    '..o444444444444444444444444444444444444444444444oo',
    '..o4444444444444444444444444444444(444444444444444oo',
    '..o4444444444444444444444444444444444444444444444443oo',
    '..o444444444444444444444444444444444444444444444444433o',
    '..o444444444444444444444444444444444444444444444444433333o',
    '..o44444444444444444444444444444444444444444444444443333o',
    '...o444444444444444444444444444444444444444444444444333~3o',
    '...o4444444444444444444444444444444444444444444433333333o',
    '....o4444444444444444444444444444444444444433333333333333o',
    '.....oo44444!444444444444444444444!3333333333333333333ooo',
    '.......ooooooooooooooooooooooooooooooooooooooooooooooo',
  ] },
  // floater: three tiers of feathers, each tier's scalloped edge lying over the next
  floater: { rows: [
    '......oooooooooooooooo',
    '....oo44444444=4444444oo',
    '..oo44444444444444444444oo',
    '.o444444444444444444444444o',
    'o44444444444444444444444444o',
    'o44(44444444444444444444)43o',
    'o44444444444444444444444433o',
    'o44444444444444444444444433o',
    '.o4444444o.o44444444o.o4433o',
    '..ooooooo4444oooooo4444oooo',
    '...o44444444444444444333o',
    '...o4444!4444444444!4333o',
    '...o444444444oo444444333o',
    '....o4444444o..o4444333o',
    '.....ooooooo4444ooooooo',
    '.......o444444444333o',
    '........o4444444333o',
    '.........oo444~33oo',
    '...........oooooo',
  ] },
  // two-legged: an egg sitting up, with a hem of six small feather ends
  biped: { rows: [
    '...........oooooooooo',
    '........ooo4444444444ooo',
    '......oo44444444=4444444oo',
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
    '....o44oo!4oo44oo44oo4!oo33o',
    '.....oo..oo..oo..oo..oo..oo',
  ] },
  // one-piece: a tall mound whose bottom edge is a row of six feather ends; the head melts into it
  blob: { rows: [
    '................oooooooooooooooooooooooooooo',
    '...........ooooo4444444444444444444444444444ooooo',
    '........ooo44444444444444444444444444444444444444ooo',
    '.....ooo44444444444444444444444444444444444444444444ooo',
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
    'o44444444oo44444444oo44444444oo44444444oo44444444oo44433333o',
    '.o444444o..o44!444o..o444444o..o444444o..o44!444o..o433333o',
    '..oooooo....oooooo....oooooo....oooooo....oooooo....oooooo',
  ] },
  // the dragon's plan: standing on four legs, seen from the side, with rows of feather ends on the flank
  drake: { farWing: [-8, -5], rows: [
    '..........oooooooooooooo',
    '........oo44444444444444oo',
    '.......o444444444444444444o',
    '.......o44444444=4444444444o',
    '......o444444444444444444444o',
    '......o444444444444444444444o',
    '.....o4444444444444444444444o',
    '.....o44444444444444444444444ooooooooooooooooooooo',
    '.....o4444444444444444444444444444444444444444444ooooo',
    '.....o44444444444444444444444444(444444444444444444444oooo',
    '.....o444444444444444444444444444444444444444444444444433o',
    '.....o444444444444444444444444444444444344434443444344433o',
    '.....o4444444444444444444444444444444444333444333444333333o',
    '.....o444444444444444444444444444444444444444444444444433~o',
    '.....o4444444444444444444444444444444443444344434443444333o',
    '.....o4444444444444444444444444444444444333444333444333333o',
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
  ] },
};
