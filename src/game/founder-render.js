// Drawing and animating the hand-pixelled founder sprites.
// Each sprite pixel is a normal screen pixel (2x2 at double density), so the
// founders keep a crafted, readable pixel size. Animation is layered on top of
// the single hand-drawn frame using the anchors in src/art/founders.js:
//   breathing   the head (rows above `neck`) bobs down a pixel
//   walking     a one-pixel hop on alternate steps
//   expressions eyes are covered with the face colour and redrawn
//               (blink, happy ^^, sad, sleep, dizzy); mouths open for eating

import { C } from '../engine/palette.js';
import { lut, colors } from '../engine/sprite.js';
import { makeBitmap } from '../engine/screen.js';
import { FOUNDER_ART } from '../art/founders.js';
import { CRESTS, FACE, BOWTIE, TIE } from '../art/parts.js';
import { CLOTHES } from './items.js';

export const hasFounderArt = (species) => !!FOUNDER_ART[species];

// Where clothes sit on each founder: top of the head (for hats) and the neck.
const FIT = {
  Mogumo: { top: [18, 6], neck: [18, 27] },
  Kometchi: { top: [19, 8], neck: [19, 29] },
  Ducklet: { top: [19, 5], neck: [19, 26] },
  Pipolin: { top: [19, 13], neck: [19, 33] },
  Lumipom: { top: [20, 6], neck: [20, 29] },
  Spookit: { top: [19, 9], neck: [19, 32] },
};

/**
 * Compose a founder. canvas/ground are the hi-res bitmap size and the feet line
 * (same as composePet), scale = hi-res pixels per sprite pixel.
 */
export function composeFounder(species, pose, canvas, ground, scale) {
  const art = FOUNDER_ART[species];
  const spr = art.spr;
  const t = lut(spr);
  const src = spr.frames[0];
  const out = makeBitmap(canvas, canvas, true);
  const put = (x, y, c) => {
    for (let j = 0; j < scale; j++) for (let i = 0; i < scale; i++) {
      const X = x * scale + i, Y = y * scale + j;
      if (X >= 0 && Y >= 0 && X < canvas && Y < canvas) out.px[Y * canvas + X] = c;
    }
  };

  // find the lowest drawn row so the feet sit on the ground line
  let bottom = spr.h - 1;
  while (bottom > 0 && ![...src.slice(bottom * spr.w, (bottom + 1) * spr.w)].some(ch => t[ch])) bottom--;
  const groundRow = Math.floor(ground / scale);
  const lift = art.floats ? 3 + Math.round(Math.sin((pose.t || 0) / 500) * 1) : 0;
  const hop = pose.step === 1 ? 1 : 0;
  const ox = Math.floor(canvas / scale / 2 - spr.w / 2);
  const oy = groundRow - bottom - lift - hop;
  const bob = pose.bob ? 1 : 0;

  // soft shadow (dotted when floating)
  const cx = canvas / 2, gy = ground;
  for (let i = -12; i <= 12; i++) {
    const X = cx + i;
    if (art.floats) { if ((i & 3) === 0) { out.px[gy * canvas + X] = C('silver'); out.px[gy * canvas + X + 1] = C('silver'); } }
    else if (Math.abs(i) < 11) { out.px[gy * canvas + X] = C('mist'); if (Math.abs(i) < 8) out.px[(gy + 1) * canvas + X] = C('mist'); }
  }

  // body first, then the head with its breathing bob on top
  const drawRows = (from, to, dy) => {
    for (let y = from; y < to; y++) for (let x = 0; x < spr.w; x++) {
      const c = t[src[y * spr.w + x]];
      if (c) put(ox + x, oy + y + dy, c);
    }
  };
  drawRows(art.neck, spr.h, 0);
  drawRows(0, art.neck, bob);

  const ink = C('ink');
  const skin = t[art.face.charCodeAt(0)];
  const at = (x, y, c) => put(ox + x, oy + y + bob, c);
  const expr = pose.expr || 'idle';
  const [ew, eh] = art.eyeSize;

  // ----- eyes -----
  const closedEye = (ex, ey, shape) => {
    const x0 = ex - Math.floor(ew / 2), y0 = ey - Math.floor(eh / 2);
    for (let y = 0; y < eh; y++) for (let x = 0; x < ew; x++) at(x0 + x, y0 + y, skin);
    const mid = y0 + Math.floor(eh / 2);
    const w = Math.max(3, ew);
    const xs = ex - Math.floor(w / 2);
    for (let x = 0; x < w; x++) {
      const end = x === 0 || x === w - 1;
      let y = mid;
      if (shape === 'happy') y = end ? mid + 1 : mid;         // ^^
      if (shape === 'closed') y = end ? mid - 1 : mid;        // content curve
      if (shape === 'sad') y = end ? mid + (x === 0 ? 0 : 1) : mid; // droopy
      at(xs + x, y, ink);
    }
  };
  const dizzyEye = (ex, ey) => {
    const x0 = ex - Math.floor(ew / 2), y0 = ey - Math.floor(eh / 2);
    for (let y = 0; y < eh; y++) for (let x = 0; x < ew; x++) at(x0 + x, y0 + y, skin);
    for (let i = -1; i <= 1; i++) { at(ex + i, ey + i, ink); at(ex + i, ey - i, ink); }
  };
  const eyeShape = { blink: 'closed', sleep: 'closed', chew: 'closed', happy: 'happy', wink: null, sad: 'sad', sick: 'sad' }[expr];
  art.eyes.forEach(([ex, ey], i) => {
    if (expr === 'dizzy') return dizzyEye(ex, ey);
    if (expr === 'wink' && i === 1) return closedEye(ex, ey, 'happy');
    if (eyeShape) closedEye(ex, ey, eyeShape);
  });

  // ----- mouth (open for eating and big smiles; the bill and fangs keep their own shape) -----
  const [mx, my] = art.mouth;
  if ((expr === 'eat' || expr === 'happy' || expr === 'wink') && species !== 'Ducklet') {
    for (let x = -1; x <= 1; x++) at(mx + x, my, ink);
    at(mx - 1, my + 1, ink); at(mx, my + 1, C('red.1')); at(mx + 1, my + 1, ink);
    at(mx, my + 2, ink);
  } else if (expr === 'chew' && species !== 'Ducklet') {
    for (let x = -1; x <= 1; x++) at(mx + x, my, ink);
  }

  // ----- clothes: hats, glasses, ties (other outfits don't fit hand-drawn bodies yet) -----
  const wear = pose.wear || {};
  const fit = FIT[species];
  const itemCtx = (id) => colors('cream', CLOTHES[id]?.color || 'pink', 'ink', 'brown');
  const stampPart = (part, ax, ay, ctx, flip = false) => {
    const s = part.spr, lt = lut(s, ctx), f = s.frames[0];
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
      const c = lt[f[j * s.w + i]];
      if (!c) continue;
      const x = flip ? ax + (s.w - 1 - part.pivot[0]) - i : ax - part.pivot[0] + i;
      at(x, ay - part.pivot[1] + j, c);
    }
  };
  if (fit && wear.head && CRESTS[wear.head]) stampPart(CRESTS[wear.head], fit.top[0], fit.top[1], itemCtx(wear.head));
  if (fit && wear.face && FACE[wear.face]?.lens) {
    const lens = FACE[wear.face].lens;
    art.eyes.forEach(([ex, ey], i) => stampPart(lens, ex, ey, itemCtx(wear.face), i === 1));
  }
  if (fit && (wear.body === 'bowtie' || wear.body === 'tie')) {
    const part = wear.body === 'bowtie' ? BOWTIE : TIE;
    const s = part.spr, lt = lut(s, itemCtx(wear.body)), f = s.frames[0];
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
      const c = lt[f[j * s.w + i]];
      if (c) put(ox + fit.neck[0] - part.pivot[0] + i, oy + fit.neck[1] - part.pivot[1] + j, c);
    }
  }
  return out;
}
