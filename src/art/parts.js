// Body-part artwork, drawn in a classic colour-screen virtual pet style:
// navy outlines, flat pastel fills, big glossy eyes, blush cheeks.
// Every part is drawn for the LEFT side (or centred) and mirrored when needed.
// Digits are body-colour roles, 5-8 accent roles, e/E/F eye-colour roles
// (see src/engine/sprite.js).
//
// `pivot` is the pixel in the grid that sits on the anchor point.

import { sprite } from '../engine/sprite.js';

const P = (rows, pivot, extra = {}) => ({ spr: sprite(rows), pivot, ...extra });

// ---------- Eyes (left eye; right eye is mirrored). Pivot = eye centre. ----------
// Big glossy eyes: a large highlight at the top, a small one at the bottom.
export const EYES = {
  bean:    P(['.kkk.', 'kwwkk', 'kwwkk', 'kkkkk', 'kkkkk', 'kkkwk', '.kkk.'], [2, 3]),
  button:  P(['.kk.', 'kwkk', 'kkkk', 'kkwk', '.kk.'], [2, 2]),
  dot:     P(['kk', 'wk', 'kk'], [1, 1]),
  shiny:   P(['.kkk.', 'kwwek', 'kwwEk', 'keeEk', 'keeek', 'kFewk', '.kkk.'], [2, 3]),
  sparkle: P(['.kkk.', 'kwwkk', 'kwwkk', 'kkkkk', 'keeek', 'keFwk', '.kkk.'], [2, 3]),
  wide:    P(['.kkk.', 'kwwwk', 'kwwwk', 'kwwkk', 'kwwkk', 'kwwwk', '.kkk.'], [2, 3]),
  sleepy:  P(['kkkkk', 'kkkkk', 'kwkkk', 'kkkwk', '.kkk.'], [2, 2]),
  arc:     P(['.kkk.', 'k...k', 'k...k'], [2, 1]),
  cat:     P(['.kkk.', 'keFek', 'kekek', 'kekek', 'keeek', '.kkk.'], [2, 3]),
  star:    P(['..o..', '.oYo.', 'oYYYo', '.oYo.', 'oo.oo'], [2, 2]),
  gem:     P(['..k..', '.kFk.', 'kFwek', 'keeEk', '.kek.', '..k..'], [2, 3]),
  heart:   P(['.k.k.', 'kqkqk', 'kqqqk', '.kqk.', '..k..'], [2, 2]),
  droopy:  P(['...kk', 'kkkk.', 'kkwkk', 'kkkkk', '.kkk.'], [2, 2]),
};
// Small eyes used by babies (big heads come later).
export const BABY_EYES = P(['kk', 'wk', 'kk', 'kk'], [1, 2]);
// Eyelashes flicked out from the outer top corner of girls' eyes.
export const LASH = P(['k.', '.k'], [1, 1]);

// ---------- Mouths (centred). Pivot = top centre. ----------
export const MOUTHS = {
  smile:  P(['k...k', '.kkk.'], [2, 0]),
  open:   P(['kkkkk', 'kqrqk', '.kkk.'], [2, 0]),
  tiny:   P(['k.k', '.k.'], [1, 0]),
  cat:    P(['k.k.k', '.k.k.'], [2, 0]),
  beak:   P(['.oooo.', 'oaAAao', 'oaaaao', '.oooo.'], [3, 0]),
  fang:   P(['kkkkk', '.w.w.'], [2, 0]),
  blep:   P(['kkk', '.q.'], [1, 0]),
  ooh:    P(['.k.', 'kqk', '.k.'], [1, 0]),
  flat:   P(['kkk'], [1, 0]),
  wobble: P(['.k.k.', 'k.k.k'], [2, 0]),
  smirk:  P(['....k', 'k..k.', '.kk..'], [2, 0]),
  bill:   'bill', // drawn to scale by the renderer
};
// Expression mouths shared by every pet.
export const MOUTH_FX = {
  open:  P(['.kk.', 'kqrk', '.kk.'], [2, 0]),
  chew:  P(['kkkk'], [2, 0]),
  sad:   P(['.kk.', 'k..k'], [2, 0]),
  happy: P(['kkkkk', 'kqrqk', '.kkk.'], [2, 0]),
};
// Expression eyes (drawn instead of the pet's own eyes).
export const EYE_FX = {
  closed: P(['k...k', '.kkk.'], [2, 0]),       // content, sleeping
  happy:  P(['.kkk.', 'k...k', 'k...k'], [2, 1]),
  sad:    P(['...kk', 'kkk..', '.kkk.', '.kkk.'], [2, 1]),
  dizzy:  P(['k...k', '.k.k.', '..k..', '.k.k.', 'k...k'], [2, 2]),
  wink:   P(['.....', 'kkkkk'], [2, 0]),
};

// ---------- Ears / headgear (left ear, mirrored; drawn behind the head) ----------
// side: hangs at the side of the head instead of on top.
export const EARS = {
  none:    null,
  cat:     P(['o.....', 'oo....', 'o3o...', 'o3Po..', 'o3PPo.', 'o333oo'], [4, 5]),
  bunny:   P(['.ooo.', 'o333o', 'o3P3o', 'o3P3o', 'o3P3o', 'o3P3o', 'o3P3o', 'o333o', 'o333o'], [3, 8]),
  bear:    P(['.ooo.', 'o333o', 'o3P3o', 'o333o'], [3, 3]),
  floppy:  P(['.ooo..', 'o3333o', 'o3333o', 'o2333o', '.o233o', '..o23o', '...oo.'], [4, 0], { side: true }),
  mouse:   P(['.oooo.', 'o3333o', 'o3PP3o', 'o3PP3o', 'o3333o', '.oooo.'], [4, 5]),
  antenna: P(['.oo..', 'oYxo.', '.oo..', '..o..', '...o.', '...o.'], [3, 5]),
  horns:   P(['o.....', 'oo....', 'oqo...', 'oqqo..', '.oqqo.', '.oRqqo', '..oRqo'], [4, 6]),
  fins:    P(['oo....', 'o7o...', 'o77oo.', 'o7777o'], [5, 3], { side: true }),
  leaf:    P(['..oo', '.olo', 'olLo', 'oLo.', '.o..'], [2, 4]),
  pigtail: P(['..oo.', '.o77o', 'o777o', 'o767o', '.o66o', '..oo.'], [4, 1], { side: true }),
  puff:    P(['.oo.oo.', 'o77o77o', 'o777777o', '.o7777o'], [5, 3]),
  flower:  P(['.o.o.', 'ofofo', '.oYo.', 'ofofo', '.o.o.'], [3, 4]),
  wings:   P(['oo....', 'owoo..', 'owwwoo', '.owmmo', '..ooo.'], [5, 2], { side: true }),
  antlers: P(['n.n..', 'nnn.n', '.nnnn', '..nn.', '..n..'], [3, 4]),
};

// ---------- Crests (centred on top of the head) ----------
export const CRESTS = {
  none:    null,
  tuft:    P(['.oo..', 'o34o.', '.oo3o', '..o3o', '.o33o'], [2, 4]),
  curl:    P(['.ooo.', 'o3..o', 'o3o.o', '.oo3o', '..o3o'], [2, 4]),
  sprout:  P(['oo...oo', 'olo.olo', '.olLlo.', '..oLo..', '...o...'], [3, 4]),
  bow:     P(['.oo...oo.', 'oPfo.ofPo', 'oPffoffPo', 'oPfo.ofPo', '.oo...oo.'], [4, 2], { front: true }),
  ribbon:  P(['oo.oo', 'o7o7o', '.o6o.', 'o7o7o', 'oo.oo'], [2, 3], { front: true, offset: 6 }),
  cap:     P(['....ooooooo....', '...o7777777o...', '..o778777777o..', '.o77777777777o.', 'o6666666666666o', 'ooooooooooooooo'], [7, 4], { front: true }),
  beret:   P(['.....o.....', '...ooooo...', '.oo77777oo.', 'o777787777o', 'o666666666o', '.ooooooooo.'], [5, 4], { front: true }),
  bobble:  P(['.ooo.', 'oPPfo', 'oPffo', '.ooo.', '..o..', '..o..'], [2, 5]),
  bud:     P(['..o.o..', '.ofofo.', 'ofPfPfo', '.ofPfo.', '..oLo..', '..oLo..'], [3, 5]),
  // a shooting star riding the head, its trail streaming behind
  comet:   P(['........o...', '.......oYo..', 'xx...ooYYYoo', '.xxxxoYYyYYo', '..xxx.oYYYo.', '.....oYo.oYo', '.....oo...oo'], [8, 6], { offset: 1 }),
  swirl:   P(['...o..', '..o3o.', '.o3oo.', 'o3o3o.', 'o333oo', '.o3333o'], [3, 5]),
  tiara:   P(['...o...', '..oBo..', '.oyoyo.', 'oyyoyyo', '.ooooo.'], [3, 3], { front: true }),
  horn:    P(['.o.', 'oPo', 'oGo', 'oPo', 'oGo'], [1, 4]),
  crown:   P(['o..o..o', 'oyoyoyo', 'oyYyYyo', 'oyyyyyo', 'ooooooo'], [3, 3], { front: true }),
  flame:   P(['..o..', '.oao.', 'oaAao', 'oAyAo', '.ooo.'], [2, 4]),
  halo:    P(['.ooooo.', 'oY...Yo', '.ooooo.'], [3, 6], { front: true }),
  star:    P(['...o...', '..oyo..', 'ooyYyoo', '.oyyyo.', 'oyo.oyo', 'oo...oo'], [3, 5]),
};

// ---------- Back parts (drawn behind the body) ----------
// pair: mirrored on both sides. tail: right side, lower.
export const BACKS = {
  none:     null,
  wings:    P(['..ooo', '.owwo', 'owwmo', 'owmmo', '.ooo.'], [4, 2], { pair: true }),
  bat:      P(['o.o..', 'o6o.o', 'o666o', '.o66o', '..ooo'], [4, 2], { pair: true }),
  fairy:    P(['.oo..', 'oBso.', 'osBo.', '.oBo.', '..oo.'], [3, 2], { pair: true }),
  butterfly: P(['.ooo..', 'oPPfo.', 'oPYPfo', '.oPffo', '.ofo.o', '..oo..'], [5, 2], { pair: true }),
  pomtail:  P(['.oo.', 'o78o', 'o77o', '.oo.'], [0, 2], { tail: true }),
  longtail: P(['...oo', '..o3o', '.o3o.', 'o3o..', 'o3o..'], [0, 4], { tail: true }),
  fishtail: P(['o...', 'oo..', 'o7o.', 'o77o', 'o7o.', 'oo..', 'o...'], [0, 3], { tail: true }),
  shell:    P(['.ooo.', 'oNnNo', 'oNdNo', 'onNno', '.ooo.'], [0, 2], { tail: true }),
  devil:    P(['....ooo', '...oqqo', '...oqo.', '..o3o..', '.o3o...', 'o3o....', 'oo.....'], [0, 6], { tail: true }),
  cape:     'cape', // drawn procedurally
};

// ---------- Arms (left arm, mirrored). Pivot = shoulder on the body's edge. ----------
export const ARMS = {
  down: P(['...ooo', '..o33o', '.o333o', 'o333o.', 'o223o.', '.ooo..'], [4, 0]),
  out:  P(['.oooooo', 'o333333', 'o223333', '.oooooo'], [5, 1]),
  up:   P(['.oo..', 'o33o.', 'o233o', '.o33o', '..ooo'], [3, 4]),
};

// ---------- Feet (front, under the body) ----------
export const FEET = {
  float: null,
  stubs: P(['.ooo.', 'o333o', 'o2222o', '.oooo.'], [2, 0]),
  paws:  P(['.ooo.', 'o777o', 'o7777o', 'o7o7o.', '.o.o..'], [2, 0]),
  legs:  P(['o3o.', 'o3o.', 'o3o.', 'o33oo', 'ooooo'], [1, 0]),
  shoes: P(['.o3o.', '.o3o.', 'oo66o.', 'o6666o', '.oooo.'], [2, 0]),
  flippers: P(['.o3o..', 'ooaao.', 'oaAaaao', 'oaoaoao', '.o.o.o.'], [2, 0]),
  tiny:  P(['.oo.', 'o23o', '.oo.'], [1, 0]),
};

// ---------- Outfits are drawn procedurally; bowtie sprite used at the neck ----------
export const BOWTIE = P(['oo.oo', 'o6o6o', 'o666o', 'o6o6o', 'oo.oo'], [2, 2]);
export const TIE = P(['.o.', 'o6o', 'o6o', 'o66o'.slice(0, 3), '.o.'], [1, 0]);

// ---------- Forehead marks (centred above the eyes) ----------
export const MARKS = {
  none: null,
  star:    P(['..y..', '.yYy.', 'yyYyy', '.y.y.'], [2, 2]),
  heart:   P(['.q.q.', 'qQqqq', '.qqq.', '..q..'], [2, 2]),
  moon:    P(['.YY', 'Y..', 'Y..', '.YY'], [1, 2]),
  drop:    P(['.B.', 'BsB', 'BBB', '.B.'], [1, 2]),
  diamond: P(['.V.', 'VfV', '.V.'], [1, 1]),
};

// ---------- Noses (centred between eyes and mouth). Snout and whiskers are drawn to scale. ----------
export const NOSES = {
  none: null,
  dot:    P(['kk'], [1, 0]),
  button: P(['.kk.', 'kqQk', '.kk.'], [2, 0]),
  snout: 'snout',
  whiskers: 'whiskers',
};

// ---------- Hair pieces drawn outside the head shape ----------
// (The fringe itself is painted onto the head by the renderer.)
export const HAIR_PARTS = {
  // spikes along the top of the head
  spikes: P(['o...o...o', 'oo.o0o.oo', 'o0o909o0o', 'o0099900o'], [4, 3]),
  // a ponytail hanging off the back (right side)
  ponytail: P(['.oo..', 'o00o.', 'o090o', '.o90o', '.o99o', '..o9o', '...oo'], [0, 1]),
  // twin tails on both sides (left one; mirrored)
  twintail: P(['..oo', '.o0o', 'o00o', 'o90o', 'o90o', 'o99o', '.o9o', '..oo'], [3, 1]),
  // a big curly puff behind the head
  puff: P(['..oooooooo..', '.o00000000o.', 'o0000000000o', 'o0000000000o', 'o9000000009o', 'o99......99o'], [6, 2]),
};

// ---------- Face accessories (adults) ----------
// lens: drawn around each eye (left, mirrored); bridge joins the two.
export const FACE = {
  glasses: { lens: P(['.ooooo.', 'o.....o', 'o.....o', 'o.....o', 'o.....o', 'o.....o', 'o.....o', '.ooooo.'], [3, 4]), bridge: 'ink' },
  shades:  { lens: P(['ooooooo', 'oKKKKKo', 'oKmKKKo', 'oKKKKKo', '.ooooo.'], [3, 2]), bridge: 'ink', hidesEyes: true },
  monocle: { lens: P(['.oyyyo.', 'oy...yo', 'y.....y', 'y.....y', 'y.....y', 'oy...yo', '.oyyyo.'], [3, 3]), oneSide: true, chain: true },
  bandaid: { cheek: P(['.oooo.', 'oTwwTo', '.oooo.'], [3, 1]) },
  sticker: { cheek: P(['..o..', '.oYo.', 'oYYYo', '.oYo.'], [2, 1]) },
};

// ---------- Cheeks (left, mirrored) ----------
export const CHEEKS = {
  none: null,
  blush: P(['.ff.', 'ffff'], [2, 0]),
  dots: P(['f.f'], [1, 0]),
  freckles: P(['n.n', '.n.'], [1, 0]),
  hearts: P(['p.p', 'ppp', '.p.'], [1, 0]),
};
