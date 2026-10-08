// Print a composed pet as text, one character per pixel, for pixel-level review.
//   node tools/dump.mjs <Founder|random:seed> [stage] [expr]
// Colours print as their palette name's first letters in a legend.

import { composePetArt } from '../src/game/pet-art.js';
import { FOUNDERS, express, pureGenome, randomGenome } from '../src/game/genetics.js';
import { makeRng } from '../src/engine/rng.js';
import { NAMES } from '../src/engine/palette.js';

const [who = 'Kitsu', stage = 'adult', expr = 'idle'] = process.argv.slice(2);
const rng = makeRng(1);
const p = who.startsWith('random:') ? express(randomGenome(makeRng(+who.slice(7))), rng)
  : express(pureGenome(FOUNDERS.find(f => f.name === who).traits), rng);
const k = composePetArt(p, stage, { expr, gender: 'f' });
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&*+=?';
const used = new Map();
let y0 = k.h, y1 = 0, x0 = k.w, x1 = 0;
for (let y = 0; y < k.h; y++) for (let x = 0; x < k.w; x++) if (k.px[y * k.w + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
for (let y = y0; y <= y1; y++) {
  let r = '';
  for (let x = x0; x <= x1; x++) {
    const c = k.px[y * k.w + x];
    if (!c) { r += '.'; continue; }
    if (!used.has(c)) used.set(c, chars[used.size]);
    r += used.get(c);
  }
  console.log(String(y - y0).padStart(2) + ' ' + r);
}
console.log([...used].map(([c, ch]) => `${ch}=${NAMES[c] ?? c}`).join(' '));
console.log(JSON.stringify({ form: p.form, head: p.head, body: p.body, eyes: k.eyes.map(([x, y]) => [x - x0, y - y0]), mouth: [k.mouth[0] - x0, k.mouth[1] - y0] }));
