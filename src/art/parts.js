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
export const EYES = {
  bean:    P(['.kk.', 'kwkk', 'kwkk', 'kkkk', 'kkkk', '.kk.'], [2, 3]),
  button:  P(['.kk.', 'kwkk', 'kkkk', '.kk.'], [2, 2]),
  dot:     P(['kk', 'kk', 'kk'], [1, 1]),
  shiny:   P(['.kkk.', 'kwwek', 'kwEek', 'keeek', 'keFek', '.kkk.'], [2, 3]),
  sparkle: P(['.kkk.', 'kwwkk', 'kwkkk', 'kkkkk', 'keeek', '.kkk.'], [2, 3]),
  wide:    P(['.kkk.', 'kwwwk', 'kwwkk', 'kwwkk', 'kwwwk', '.kkk.'], [2, 3]),
  sleepy:  P(['kkkkk', 'kwkkk', 'kkkkk', '.kkk.'], [2, 1]),
  arc:     P(['.kk.', 'k..k'], [2, 1]),
  cat:     P(['.kkk.', 'keFek', 'kekek', 'kekek', '.kkk.'], [2, 2]),
  star:    P(['..o..', '.oYo.', 'oYYYo', '.oYo.', '.o.o.'], [2, 2]),
  gem:     P(['..k..', '.kFk.', 'kFeek', 'keeEk', '.kek.', '..k..'], [2, 3]),
};
// Small eyes used by babies (big heads come later).
export const BABY_EYES = P(['kk', 'wk', 'kk'], [1, 1]);
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
  closed: P(['kkkk'], [2, 0]),
  happy:  P(['.kk.', 'k..k'], [2, 1]),
  sad:    P(['k...', '.kkk'], [2, 0]),
  dizzy:  P(['k.k', '.k.', 'k.k'], [1, 1]),
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
  horns:   P(['o...', 'oo..', 'oGo.', 'oGGo'], [3, 3]),
  fins:    P(['oo....', 'o7o...', 'o77oo.', 'o7777o'], [5, 3], { side: true }),
  leaf:    P(['..oo', '.olo', 'olLo', 'oLo.', '.o..'], [2, 4]),
  pigtail: P(['..oo.', '.o77o', 'o777o', 'o767o', '.o66o', '..oo.'], [4, 1], { side: true }),
  puff:    P(['.oo.oo.', 'o77o77o', 'o777777o', '.o7777o'], [5, 3]),
};

// ---------- Crests (centred on top of the head) ----------
export const CRESTS = {
  none:    null,
  tuft:    P(['.oo..', 'o34o.', '.oo3o', '..o3o', '.o33o'], [2, 4]),
  curl:    P(['.ooo.', 'o3..o', 'o3o.o', '.oo3o', '..o3o'], [2, 4]),
  sprout:  P(['oo...oo', 'olo.olo', '.olLlo.', '..oLo..', '...o...'], [3, 4]),
  bow:     P(['.oo...oo.', 'oPfo.ofPo', 'oPffoffPo', 'oPfo.ofPo', '.oo...oo.'], [4, 2], { front: true }),
  ribbon:  P(['oo.oo', 'o7o7o', '.o6o.', 'o7o7o', 'oo.oo'], [2, 3], { front: true, offset: 6 }),
  cap:     P(['...ooooo...', '..o77777o..', '.o7777777o.', 'o766666667o', 'ooooooooooo'], [5, 3], { front: true }),
  beret:   P(['....o....', '..ooooo..', '.o77777o.', 'o7777777o', '.ooooooo.'], [4, 3], { front: true }),
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
  pomtail:  P(['.oo.', 'o78o', 'o77o', '.oo.'], [0, 2], { tail: true }),
  longtail: P(['...oo', '..o3o', '.o3o.', 'o3o..', 'o3o..'], [0, 4], { tail: true }),
  fishtail: P(['o...', 'oo..', 'o7o.', 'o77o', 'o7o.', 'oo..', 'o...'], [0, 3], { tail: true }),
  shell:    P(['.ooo.', 'oNnNo', 'oNdNo', 'onNno', '.ooo.'], [0, 2], { tail: true }),
  cape:     'cape', // drawn procedurally
};

// ---------- Arms (left arm, mirrored). Pivot = shoulder. ----------
export const ARM = P(['.oo', 'o3o', 'o3o', '.o.'], [2, 0]);

// ---------- Feet (front, under the body) ----------
export const FEET = {
  float: null,
  stubs: P(['.ooo.', 'o333o', '.ooo.'], [2, 0]),
  paws:  P(['.ooo.', 'o777o', 'o7o7o', '.o.o.'], [2, 0]),
  legs:  P(['o3o.', 'o3o.', 'o33o', 'oooo'], [1, 0]),
  shoes: P(['.o3o.', 'oooo.', 'o66oo', 'oooooo'], [2, 0]),
};

// ---------- Outfits are drawn procedurally; bowtie sprite used at the neck ----------
export const BOWTIE = P(['oo.oo', 'o6o6o', 'o666o', 'o6o6o', 'oo.oo'], [2, 2]);
export const TIE = P(['.o.', 'o6o', 'o6o', 'o66o'.slice(0, 3), '.o.'], [1, 0]);

// ---------- Cheeks (left, mirrored) ----------
export const CHEEKS = {
  none: null,
  blush: P(['.ff.', 'ffff'], [2, 0]),
  dots: P(['f.f'], [1, 0]),
  freckles: P(['n.n', '.n.'], [1, 0]),
  hearts: P(['p.p', 'ppp', '.p.'], [1, 0]),
};
