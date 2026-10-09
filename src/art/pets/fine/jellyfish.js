// FINE-LINE PET ART, NOT YET USED BY THE GAME (see axolotl.js for the format).
//
// The jellyfish founder, Glimmer: a fantasy lantern jelly, blue with purple.
// A big domed bell with a purple scalloped hem and a few glowing spots, a
// little star lantern on a curved stalk, ruffled purple frills at the sides,
// a small deeper-blue skirt underneath, long wavy ribbons trailing down and a
// soft veil either side. It floats; it has no feet.
// Extra colours here: 7 8 accent (base, light), e E eye colour (base, light), Y y gold, P blush pink.

export const LOOK = { color: 'blue', accent: 'violet', eye: 'pink', floats: 8 };

// Head, "bell": 56 x 40, a dome with a scalloped hem in the accent colour
export const HEAD = { under: { '=': '8' }, rows: [
  '.....................oooooooooooooo',
  '.................oooo4444444^444444oooo',
  '..............ooo4444444444444444444444ooo',
  '............oo4444444444444444444444444444oo',
  '..........oo44444444444444444444444444444444oo',
  '.........o444444444444444444444444444444444444o',
  '........o44444444444444444444444444444444444444o',
  '.......o4444444444444444444444444444444444444444o',
  '......o444444444444444444444444444444444444444444o',
  '.....o44444444444444444444444444444444444444444444o',
  '.....o44444444444444444444444444444444444444444444o',
  '....o4444444444444444444444444444444444444444444444o',
  '....o4444444444444444444444444444444444444444444444o',
  '...o444444444444444444444444444444444444444444444444o',
  '...o444444444444444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444444444444444o',
  '..o44444444444444444444444444444444444444444444444444o',
  '.o4444444444444444444444444444444444444444444444444444o',
  '.o4444444444444444444444444444444444444444444444444444o',
  '.o4444444444444444444444444444444444444444444444444443o',
  '.o4444444444444444444444444444444444444444444444444443o',
  'o444444444444444444444444444444444444444444444444444443o',
  'o444444444444444444444444444444444444444444444444444443o',
  'o444444444444444444444444444@44444444444444444444444443o',
  'o444444444444444444444444444444444444444444444444444443o',
  'o444444444444444444444444444444444444444444444444444433o',
  'o444444444444444444444444444444444444444444444444444433o',
  'o444444444444444444444444444444444444444444444444444433o',
  'o444444444444444444444444444444444444444444444444444433o',
  'o[4444444444444444444444444444444444444444444444444433]o',
  'o444444444444444444444444444444444444444444444444444333o',
  'o444444444444444444444444444444444444444444444444444333o',
  'o444444444444444444444444444444444444444444444444444333o',
  'o888888888888888888888888888888888888888888888888888777o',
  'o888888888888888888888888888=88888888888888888888888777o',
  'o888888888888oo888888888888oo888888888888oo888888888777o',
  '.o8888888777o..o8888888777o..o8888888777o..o8888888777o',
  '..o88888777o....o88888777o....o88888777o....o88888777o',
  '...oooooooo......oooooooo......oooooooo......oooooooo',
] };

// Markings, "glowspots": small lights scattered over the dome (each one set down at a place on the head)
export const SPOTS = { pivot: [1, 1], at: [[9, 14], [15, 7], [24, 4], [41, 6], [47, 15], [34, 11]], rows: [
  '.8.',
  '8w8',
  '.8.',
] };

// Ears, "frills": a ruffled fin in the accent colour. The left one; its right-hand part lies behind the bell.
export const EARS = { pivot: [11, 4], rows: [
  '....ooo',
  '..oo888oo',
  '.o8888888o',
  'o888888888o',
  'o8888888888o',
  '.o888888888o',
  '..o88888888o',
  '.o888888887o',
  'o8888888877o',
  'o888888877o',
  '.o8888777o',
  '..ooo77oo',
  '.....oo',
] };

// Topper, "lure": a curved stalk with a little star lantern hanging from it
export const TOPPER = { pivot: [1, 12], rows: [
  '......oooo',
  '....oo....oo',
  '...o........o',
  '..o..........o',
  '..o.........ooo',
  '.o.........oYYYo',
  '.o........oYYwYYo',
  '.o........oYwwwYo',
  '.o........oYYwYyo',
  '.o.........oYyyo',
  '.o..........ooo',
  '.o',
  '.o',
] };

// Body, "bell": a small skirt in the deeper shade, tucked up under the bell, with three soft lobes
export const BODY = { under: { '=': '3', '~': '3', '(': '3', ')': '3' }, rows: [
  '......oooooooooooooooooooo',
  '....oo3333333333=333333333oo',
  '..oo333333333333333333333333oo',
  '...o333333333333333333333322o',
  '..o33333333333333333333333322o',
  '.o3333333333333333333333333222o',
  '.o3(333333333333333333333333)2o',
  'o333333333333333333333333333222o',
  'o333333333333333333333333333222o',
  'o333333333333333333333333333222o',
  'o333333333333333333333333333222o',
  'o333333333oo33333333oo333332222o',
  '.o3333333o..o333~33o..o3333222o',
  '..ooooooo....oooooo....ooooooo',
] };

// Tail, "tendrils": three wide wavy ribbons of different lengths in the accent colour. Their tops lie behind the skirt.
export const TAIL = { pivot: [16, 0], rows: [
  '....o887o.....o887o.....o887o',
  '....o887o.....o887o.....o887o',
  '....o887o......o887o...o887o',
  '...o887o.......o887o...o887o',
  '...o887o........o887o.o887o',
  '..o887o.........o887o.o887o',
  '..o887o.........o887o.o887o',
  '..o887o........o887o...o887o',
  '.o887o.........o887o...o887o',
  '.o887o........o887o.....o887o',
  '.o887o........o887o.....o887o',
  '..o887o......o887o.......o887o',
  '..o887o......o887o.......o887o',
  '...o887o.....o887o........o887o',
  '...o887o......o887o.......o887o',
  '....o887o.....o887o.......o887o',
  '....o887o......o887o.....o887o',
  '.....o887o.....o887o.....o887o',
  '.....o887o......o887o...o887o',
  '.....o887o......o887o...o887o',
  '....o887o........ooo...o887o',
  '....o887o..............o887o',
  '...o887o..............o887o',
  '...o887o..............o887o',
  '..o887o................ooo',
  '..o887o',
  '..o887o',
  '...o887o',
  '....ooo',
] };

// Wings, "veils": a soft veil with a pale streak, hanging from the skirt's side. The left one.
export const WINGS = { pivot: [9, 0], rows: [
  '......oooo',
  '.....o888o',
  '....o8w88o',
  '....o8w88o',
  '...o8w888o',
  '...o8w88o',
  '..o8w888o',
  '..o8w88o',
  '..o8w88o',
  '.o8w888o',
  '.o8w88o',
  '.o8w88o',
  '.o8888o',
  '..o888o',
  '..o8887o',
  '...o888o',
  '...o8887o',
  '....o888o',
  '....o887o',
  '.....o87o',
  '.....o87o',
  '......o7o',
  '......oo',
] };

// Eyes, "glow": a dark oval lit from below in the eye colour, with two shines
export const EYE = { pivot: [3, 4], rows: [
  '..ooo..',
  '.ooooo.',
  'owwoooo',
  'owwoooo',
  'ooooowo',
  'oeeeeeo',
  'oeEEEeo',
  '.oeeeo.',
  '..ooo..',
] };

// Mouth, "dot": the smallest smile
export const MOUTH = { pivot: [1, 0], rows: [
  'o.o',
  '.o.',
] };

// Forehead mark, "spark": a four-pointed twinkle
export const MARK = { pivot: [2, 2], rows: [
  '..Y..',
  '..Y..',
  'YYwYY',
  '..Y..',
  '..Y..',
] };

export const CHEEK = { pivot: [4, 2], rows: [
  '.PPPPPP.',
  'PPPPPPPP',
  'PPPPPPPP',
  '.PPPPPP.',
] };

export const FACE = { eyes: 14, mouth: 6, mark: [0, -13], cheeks: [20, 8] };
