// Pet rendering entry point. Every pet is sprite-resolution pixel art assembled
// from its form's hand-pixelled parts (src/art/pets/) by src/game/pet-art.js,
// then scaled and animated by src/game/sprite-pet.js.

import { C } from '../engine/palette.js';
import { makeBitmap } from '../engine/screen.js';
import { GHOST, HEM } from '../art/pets/ghost.js';
import { composeKitSprite } from './sprite-pet.js';
import { composePetArt, composeEggArt } from './pet-art.js';

// Pets are drawn into a double-density bitmap. CANVAS and GROUND are in
// screen pixels (what scenes use to place a pet); the bitmap is S times larger.
export const S = 2;
export const CANVAS = 64; // composed character covers CANVAS x CANVAS screen pixels
export const GROUND = 61; // y of the feet inside it, in screen pixels
const HC = CANVAS * S, HG = GROUND * S;

/**
 * Compose a pet. Returns a double-density bitmap (bm.hd).
 * pose: {
 *   expr: 'idle'|'blink'|'happy'|'sad'|'eat'|'chew'|'sleep'|'sick'|'dizzy'|'wink',
 *   arms: 'down'|'up'|'out'|'wave', step: 0|1|2 (walking), bob: 0|1, gender: 'm'|'f', t: ms,
 *   wag, flap, ear: 0|1 (the tail, wings or ears lifted for this frame),
 *   wear: { head, face, ... } clothing ids; hats, face items and neckwear are drawn (src/art/pets/wear.js)
 * }
 */
const built = new WeakMap(); // phenotype -> pictures already put together, by stage and pose
export function composePet(phenotype, stage, pose = {}) {
  // putting a pet together is the slow part, so each stage and pose of a pet is built once and kept
  const key = [stage, phenotype.color, phenotype.accent, phenotype.eyeColor, pose.arms || '', pose.step || 0, pose.wag ? 1 : 0, pose.flap ? 1 : 0,
    pose.ear ? 1 : 0, pose.expr === 'sick' ? 1 : 0, pose.wear ? JSON.stringify(pose.wear) : ''].join('|');
  let mine = built.get(phenotype);
  if (!mine) built.set(phenotype, mine = new Map());
  let kit = mine.get(key);
  if (!kit) { if (mine.size > 80) mine.clear(); mine.set(key, kit = composePetArt(phenotype, stage, pose)); }
  return composeKitSprite(kit, pose, HC, HG, S);
}

/** Egg: colours hint at the baby inside. */
export function composeEgg(phenotype, crack = 0, wobble = 0) {
  return composeKitSprite(composeEggArt(phenotype, crack, wobble), {}, HC, HG, S);
}

/** Ghost for a pet that has passed away: fine pixels, hovering, its hem rippling between the two frames. */
export function composeGhost(frame = 0) {
  const out = makeBitmap(HC, HC, true);
  const rows = [...GHOST, ...HEM[frame ? 1 : 0]];
  const x0 = HC / 2 - 15, y0 = HG - 28 - rows.length - (frame ? S : 0);
  const key = { o: C('ink'), k: C('ink'), w: C('white'), m: C('mist'), f: C('pink.2') };
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const xx = x0 + x, yy = y0 + y;
    if (key[ch] && xx >= 0 && yy >= 0 && xx < HC && yy < HC) out.px[yy * HC + xx] = key[ch];
  }));
  return out;
}
