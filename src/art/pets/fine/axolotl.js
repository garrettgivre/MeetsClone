// FINE-LINE PET ART, NOT YET USED BY THE GAME.
//
// The pets are being redrawn at the fine pixel size (one character = one pixel
// of a room or a town backdrop, half the size of a pet pixel today), with a
// one-pixel ink outline. Nothing imports this folder yet: the art is being got
// ready first. tools/fine-axolotl.html shows these parts put together.
//
// This file: the axolotl founder's parts (the four-legged form).
//
// The format follows src/art/pets/part.js so the parts can go straight into
// the engine later:
//   o  ink (outline and eyes)        w  white
//   4  body colour   3  its shadow   2  a deeper shade   (the body ramp: the fine look uses the
//      light shade as the body, so a pet is paler than its double-pixel drawing)
//   8  accent, light (cheeks)
//   sockets: ^ top of the head, [ ] ears, @ face, = neck, ~ tail, ! feet, ( ) wings
//   (a socket inside a shape is painted in the body colour, 4)
// Rows are typed from the left and the right is left ragged; pad them to the
// longest row before handing them to part().
// `pivot` is the point of a part that lands on its socket.

// Head: 56 x 44, a little wider than tall and fullest below the middle. The face sits low.
export const HEAD = { rows: [
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
  'o[4444444444444444444444444444444444444444444444444443]o',
  'o444444444444444444444444444444444444444444444444444443o',
  'o444444444444444444444444444444444444444444444444444443o',
  'o444444444444444444444444444@44444444444444444444444443o',
  'o444444444444444444444444444444444444444444444444444433o',
  'o444444444444444444444444444444444444444444444444444433o',
  'o444444444444444444444444444444444444444444444444444433o',
  'o444444444444444444444444444444444444444444444444444333o',
  '.o4444444444444444444444444444444444444444444444444433o',
  '.o4444444444444444444444444444444444444444444444444333o',
  '.o4444444444444444444444444444444444444444444444444333o',
  '..o44444444444444444444444444444444444444444444444333o',
  '..o44444444444444444444444444444444444444444444443333o',
  '...o444444444444444444444444444444444444444444443333o',
  '....o4444444444444444444444444444444444444444433333o',
  '.....o44444444444444444444444444444444444444433333o',
  '......o444444444444444444444444444444444443333333o',
  '.......oo44444444444444444444444444444433333333oo',
  '.........oo4444444444444444444444444333333333oo',
  '...........ooo4444444444444444433333333333ooo',
  '..............oooo4444444444=443333333oooo',
  '..................oooooooooooooooooooo',
] };

// Ears, "gills": three petals in the body's deeper shade. The tall one stands up like an ear,
// one goes out to the side, one hangs low. The right-hand part lies behind the head.
// This is the left one; the right is the same piece turned round.
export const GILLS = { pivot: [16, 30], rows: [
  '.......oooo',
  '.....oo3333oo',
  '....o33333333o',
  '...o333333333o',
  '...o3333333333o',
  '..o33333333333o',
  '..o333333333333o',
  '..o333333333333o',
  '..o3333333333333o',
  '...o333333333333o',
  '...o2333333333333o',
  '....o233333333333o',
  '....o2333333333333o',
  '.....o2333333333333o',
  '......o233333333333o',
  '.......o2333333333333o',
  '........o2233333333333',
  '.........oo22333333333',
  '...........oo223333333',
  '....ooooo....oo3333333',
  '..oo333333oo...o333333',
  '.o33333333333o..o33333',
  'o33333333333333oo33333',
  'o333333333333333333333',
  'o333333333333333333333',
  'o233333333333333333333',
  '.o223333333333333333333',
  '..oo2223333333333333333',
  '....oooo2222222o3333333',
  '........ooooooo.o333333',
  '......ooooo....o3333333',
  '....oo3333oo..o33333333',
  '...o333333333o333333333',
  '..o33333333333333333333',
  '..o33333333333333333333',
  '..o233333333333333333',
  '...o2233333333333333',
  '....oo222333333333',
  '......ooo22222222o',
  '.........ooooooooo',
] };

// Body, "chubby": a plump mound that sits under and behind the head. Two stubby front legs under
// the chin, a back that slopes down toward the tail, and a round hind foot tucked forward.
export const BODY = { rows: [
  '..............ooooooooooooooooooooo',
  '........oooooo444444444444444444444oooo',
  '....oooo4444444444444444444444444444444ooo',
  '..oo44444444444444444444444444(44444444444oo',
  '.o444444444444444444444444444444444444444444oo',
  '.o44444444444444444444444444444444444444444444oo',
  '.o444444444444444444444444444444444444444444)443o',
  '.o44444444444444444444444444444444444444444444433o',
  '.o444444444444444444444444444444444444444444444433o',
  '.o4444444444444444444444444444444444444444444444433o',
  '.o44444444444444=4444444444444444444444444444444433o',
  '.o44444444444444444444444444444444444444444444444333o',
  '..o4444444444444444444444444444444444444444444444333o',
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
] };

// Tail, "paddle": a soft leaf that carries the slope of the back on down to the ground.
// Its left end lies behind the body.
export const TAIL = { pivot: [0, 0], rows: [
  'ooooo',
  '44444ooo',
  '44444444ooo',
  '44444444444oo',
  '4444444444444oo',
  '444444444444444oo',
  '44444444444444443o',
  '4444444444444443333o',
  '444444444444333333oo',
  '3444444433333333oo',
  'o33333333333oooo',
  '.ooooooooooo',
] };

// Feet, "toes": a rounded foot with two toe lines, over the end of a leg
export const FEET = { pivot: [4, 0], rows: [
  'o44444443o',
  'o44o44o43o',
  '.oooooooo.',
] };

// Eyes, "pebble": a tall oval with one shine (pivot at its middle)
export const EYE = { pivot: [3, 4], rows: [
  '..ooo..',
  '.ooooo.',
  'owwoooo',
  'owwoooo',
  'ooooooo',
  'ooooooo',
  'ooooooo',
  '.ooooo.',
  '..ooo..',
] };

// Mouth, "smile": a small contented curve (pivot at its top middle)
export const MOUTH = { pivot: [4, 0], rows: [
  'o.......o',
  '.oo...oo.',
  '...ooo...',
] };

// Forehead mark, "gleam": a wet shine (pivot at its middle)
export const MARK = { pivot: [3, 1], rows: [
  '.wwww.',
  'wwwwww',
  '.wwww.',
] };

// Markings, "rosy": a soft cheek under the outer half of each eye (pivot at its middle)
export const CHEEK = { pivot: [4, 2], rows: [
  '.888888.',
  '88888888',
  '88888888',
  '.888888.',
] };

// Where the face parts sit, measured from the head's face socket
export const FACE = { eyes: 15, mouth: 6, mark: [-12, -17], cheeks: [20, 9] };
