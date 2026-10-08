// Sprite format
// -------------
// A sprite is a grid of characters, one character per pixel:
//
//   const heart = sprite([
//     '.oo.oo.',
//     'orrorro',
//     'orrrrro',
//     '.orrro.',
//     '..oro..',
//     '...o...',
//   ]);
//
// '.' and ' ' are transparent. Every other character is looked up in KEY below.
// Digits and 'e/E/F' are *roles*: they become a shade of whatever ramp a pet's
// genes say, so one drawing works for every body colour.
// A sprite can override or extend the key: sprite(rows, { x: 'violet.3' }).

import { C, ramp } from './palette.js';

export const KEY = {
  // roles: primary body ramp, secondary (markings) ramp, eye ramp
  '1': 'P0', '2': 'P1', '3': 'P2', '4': 'P3',
  '5': 'S0', '6': 'S1', '7': 'S2', '8': 'S3',
  'E': 'Y0', 'e': 'Y1', 'F': 'Y2',
  '-': 'H0', '9': 'H1', '0': 'H2', '+': 'H3', // hair ramp
  // fixed colours
  o: 'ink', k: 'ink', K: 'shade', g: 'gray', G: 'silver', m: 'mist', w: 'white', z: 'night',
  R: 'red.0', r: 'red.1', q: 'red.2', Q: 'red.3',
  a: 'orange.1', A: 'orange.2',
  u: 'gold.0', y: 'gold.1', Y: 'gold.3', x: 'gold.2',
  i: 'lime.2', I: 'lime.1',
  j: 'green.0', L: 'green.1', l: 'green.2',
  h: 'mint.2', H: 'mint.1',
  b: 'blue.1', B: 'sky.2', s: 'sky.3', S: 'sky.1',
  v: 'violet.1', V: 'violet.2',
  p: 'pink.1', P: 'pink.3', f: 'pink.2',
  d: 'brown.0', n: 'brown.1', N: 'brown.2',
  c: 'cream.2', T: 'cream.3', t: 'slate.1', U: 'slate.2',
};

/** Create a sprite. `frames` may be one grid (array of strings) or an array of grids. */
export function sprite(frames, key = null) {
  if (typeof frames[0] === 'string') frames = [frames];
  const h = frames[0].length;
  const w = Math.max(...frames[0].map(r => r.length));
  const data = frames.map(rows => {
    const a = new Uint8Array(w * h);
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) a[y * w + x] = row.charCodeAt(x);
    });
    return a;
  });
  return { w, h, frames: data, key, lutCache: new Map() };
}

/** Colour context: which ramps the P/S/Y/H roles map to. */
export function colors(primary = 'slate', secondary = 'cream', eye = 'ink', hair = 'brown') {
  return { primary, secondary, eye, hair, id: primary + '|' + secondary + '|' + eye + '|' + hair };
}
const DEFAULT_CTX = colors();

function resolve(name, ctx) {
  if (name.length === 2 && 'PSYH'.includes(name[0])) {
    const shade = +name[1];
    const r = { P: ctx.primary, S: ctx.secondary, Y: ctx.eye, H: ctx.hair }[name[0]];
    if (r === 'ink') return shade >= 2 ? C('shade') : C('ink');
    return ramp(r, shade);
  }
  return C(name);
}

/** Lookup table char code -> palette index (0 = transparent). */
export function lut(spr, ctx = DEFAULT_CTX) {
  let t = spr.lutCache.get(ctx.id);
  if (t) return t;
  t = new Uint8Array(128);
  const keys = spr.key ? { ...KEY, ...spr.key } : KEY;
  for (const ch in keys) t[ch.charCodeAt(0)] = resolve(keys[ch], ctx);
  spr.lutCache.set(ctx.id, t);
  return t;
}

/** Mirror a grid left-to-right (handy for paired parts like ears and wings). */
export function mirrorRows(rows) { return rows.map(r => [...r].reverse().join('')); }
