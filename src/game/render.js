// Pet rendering entry point. Every pet is sprite-resolution pixel art:
//   - generation-1 adult founders use their hand-pixelled sprites (src/art/founders.js)
//   - everyone else is assembled from the hand-pixelled parts kit (src/art/kit.js)
// Both are scaled and animated by src/game/founder-render.js.

import { C } from '../engine/palette.js';
import { makeBitmap } from '../engine/screen.js';
import { scale2x, thinOutlines } from '../engine/upscale.js';
import { composeFounder, hasFounderArt, composeKitSprite } from './founder-render.js';
import { composeKit, composeKitEgg } from './render-kit.js';

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
 *   wear: clothing ids (hats, glasses, ties on founders), species: founder name
 * }
 */
export function composePet(phenotype, stage, pose = {}) {
  if (stage === 'adult' && pose.species && hasFounderArt(pose.species)) return composeFounder(pose.species, pose, HC, HG, S);
  return composeKitSprite(composeKit(phenotype, stage, pose), pose, HC, HG, S);
}

/** Egg: colours hint at the baby inside. */
export function composeEgg(phenotype, crack = 0, wobble = 0) {
  return composeKitSprite(composeKitEgg(phenotype, crack, wobble), {}, HC, HG, S);
}

/** Ghost for a pet that has passed away. */
export function composeGhost(frame = 0) {
  const out = makeBitmap(HC, HC, true);
  const rows = thinOutlines(scale2x([
    '....oooooo....',
    '..oowwwwwwoo..',
    '.owwwwwwwwwwo.',
    '.owwwwwwwwwwo.',
    'owwwkwwwwkwwwo',
    'owwwkwwwwkwwwo',
    'owwffwwwwffwwo',
    'owwwwwkkwwwwwo',
    'owwwwwwwwwwwmo',
    'owwwwwwwwwwmmo',
    'owwwwwwwwwwmmo',
    frame ? 'owowwowwowwomo' : 'owwowwowwowwoo',
    frame ? '.o.ooo.ooo.oo.' : 'o.ooo.ooo.oo..',
  ]));
  const x0 = HC / 2 - 14, y0 = HG - 56 - frame * S;
  const key = { o: C('ink'), k: C('ink'), w: C('white'), m: C('mist'), f: C('pink.2') };
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const xx = x0 + x, yy = y0 + y;
    if (key[ch] && xx >= 0 && yy >= 0 && xx < HC && yy < HC) out.px[yy * HC + xx] = key[ch];
  }));
  return out;
}
