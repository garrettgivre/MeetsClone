// Print a composed pet as text, one character per pixel, for pixel-level review.
//   node tools/dump.mjs <Founder|random:seed|Founder+gene=allele,...> [stage] [expr]
//   e.g. node tools/dump.mjs Glimmer+head=lamb,pattern=muzzle,accent=red
//   [expr] can also be an arm pose: down, up, out, wave
// Colours print as their palette name's first letters in a legend.

import { composePetArt } from '../src/game/pet-art.js';
import { FOUNDERS, express, pureGenome, randomGenome } from '../src/game/genetics.js';
import { makeRng } from '../src/engine/rng.js';
import { NAMES } from '../src/engine/palette.js';

const [who = 'Kitsu', stage = 'adult', expr = 'idle'] = process.argv.slice(2);
const rng = makeRng(1);
const [name, mix = ''] = who.split('+');
const swap = Object.fromEntries(mix.split(',').filter(Boolean).map(kv => kv.split('=')));
const p = name.startsWith('random:') ? express(randomGenome(makeRng(+name.slice(7))), rng)
  : express(pureGenome({ ...FOUNDERS.find(f => f.name === name).traits, ...swap }), rng);
const arms = ['down', 'up', 'out', 'wave'].includes(expr) ? expr : undefined; // an arm pose can stand in for the expression
const k = composePetArt(p, stage, { expr: arms ? 'idle' : expr, arms, gender: 'f' });
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
if (k.offFace) console.log('face pixels over the outline or an eye:', JSON.stringify(k.offFacePx.map(([x, y]) => [x - x0, y - y0])));
