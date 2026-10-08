// Character renderer, in a classic colour-screen virtual pet style:
// a big head on a small body, navy outlines, flat pastel fills with a soft
// rim shade, glossy eyes and blush.
//
// Babies are a round head only; kids gain feet; teens a little body;
// adults get arms, outfits, headgear and back parts.
// The result is composed into an off-screen bitmap so it can be flipped
// or drawn as a silhouette.

import { C, ramp } from '../engine/palette.js';
import { colors, lut } from '../engine/sprite.js';
import { makeBitmap } from '../engine/screen.js';
import {
  EYES, BABY_EYES, LASH, MOUTHS, MOUTH_FX, EYE_FX, EARS, CRESTS, BACKS, FEET, CHEEKS, ARM, BOWTIE, TIE,
} from '../art/parts.js';
import { stageTraits } from './genetics.js';

const SHAPES = {
  round:  { aw: 1.0,  ah: 1.0,  n: 2.0 },
  bean:   { aw: 1.14, ah: 0.88, n: 2.3 },
  egg:    { aw: 0.94, ah: 1.06, n: 2.0, pear: -0.18 },
  tall:   { aw: 0.86, ah: 1.12, n: 2.3 },
  pear:   { aw: 1.0,  ah: 1.0,  n: 2.0, pear: 0.3 },
  bun:    { aw: 1.12, ah: 0.86, n: 3.0 },
  drop:   { aw: 0.98, ah: 1.08, n: 2.0, drop: true },
  blocky: { aw: 1.0,  ah: 0.96, n: 4.2 },
};
// [head w, head h, torso w, torso h]
const STAGE_SIZE = { baby: [15, 13, 0, 0], child: [19, 16, 0, 0], teen: [22, 18, 11, 6], adult: [24, 20, 14, 10] };
const SIZE_DELTA = { small: -2, medium: 0, large: 2 };

function inside(s, u, v) {
  let f = 1;
  if (s.pear > 0) f = 1 - s.pear * (1 - (v + 1) / 2);      // wider at the bottom
  if (s.pear < 0) f = 1 + s.pear * ((v + 1) / 2);           // wider at the top
  if (s.drop) f = Math.min(1, Math.pow(Math.max(0, (v + 1) / 1.25), 0.7) + 0.1);
  return Math.pow(Math.abs(u / f), s.n) + Math.pow(Math.abs(v), s.n) <= 1;
}

/**
 * Rasterise a shape with a navy outline and flat shading.
 * regionAt(u, v, x, y) returns the ramp name for a pixel (or a fixed colour index).
 */
function raster(w, h, s, regionAt) {
  const bm = makeBitmap(w, h);
  const mask = new Uint8Array(w * h);
  const U = (x) => ((x + 0.5) - w / 2) / (w / 2);
  const V = (y) => ((y + 0.5) - h / 2) / (h / 2);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) mask[y * w + x] = inside(s, U(x), V(y)) ? 1 : 0;
  const m = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x];
  const ink = C('ink');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!m(x, y)) continue;
    if (!m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1) || !m(x, y + 1)) { bm.px[y * w + x] = ink; continue; }
    const u = U(x), v = V(y);
    const r = regionAt(u, v, x, y);
    if (typeof r === 'number') { bm.px[y * w + x] = r; continue; }
    // flat fill, soft rim shade on the lower right, a small glint on the upper left
    let shade = 2;
    if ((!m(x + 2, y + 1) || !m(x + 1, y + 2)) && u + v > 0.15) shade = 1;
    if ((u + 0.5) ** 2 * 1.2 + (v + 0.55) ** 2 < 0.028) shade = 3;
    bm.px[y * w + x] = ramp(r, shade);
  }
  const rowSpan = (y) => {
    let l = -1, rr = -1;
    for (let x = 0; x < w; x++) if (m(x, y)) { if (l < 0) l = x; rr = x; }
    return [l, rr];
  };
  return { bm, w, h, m, rowSpan };
}

function headPattern(pattern, u, v, y) {
  switch (pattern) {
    case 'socks': return (u / 0.62) ** 2 + ((v - 0.62) / 0.42) ** 2 <= 1; // muzzle
    case 'tips': return v < -0.38 + 0.12 * Math.cos(u * 9);              // hair-like cap
    case 'mask': return v > -0.25 && v < 0.12 && Math.abs(u) < 0.95;
    case 'twotone': return u < 0;
    case 'stripes': return v < -0.2 && (y >> 1) % 2 === 0;
    case 'spots': return [[-0.62, -0.35, 0.18], [0.5, -0.62, 0.15], [0.68, 0.2, 0.16]].some(([cx, cy, r]) => (u - cx) ** 2 + (v - cy) ** 2 < r * r);
    default: return false;
  }
}

const cache = new Map();

function headBitmap(t, stage) {
  const key = ['h', t.shape, t.size, t.pattern, t.color, t.accent, stage].join('|');
  let b = cache.get(key);
  if (b) return b;
  const s = SHAPES[t.shape] || SHAPES.round;
  const [hw, hh] = STAGE_SIZE[stage];
  const d = stage === 'adult' ? SIZE_DELTA[t.size] || 0 : 0;
  const w = Math.round((hw + d) * s.aw), h = Math.round((hh + d) * s.ah);
  const r = raster(w, h, s, (u, v, x, y) => headPattern(t.pattern, u, v, y) ? t.accent : t.color);
  const earY = Math.max(1, Math.round(h * 0.18));
  let top = 0;
  while (top < h && !r.m(Math.floor(w / 2), top)) top++;
  const [sideL, sideR] = r.rowSpan(Math.round(h * 0.4));
  b = {
    ...r, top, sideL, sideR, earY, earX: r.rowSpan(earY)[0] + 1,
    eyeY: Math.round(h * 0.47), eyeDX: Math.max(3, Math.round(w * 0.23)),
    mouthY: Math.round(h * 0.47) + Math.max(3, Math.round(h * 0.2)),
  };
  cache.set(key, b);
  return b;
}

function torsoBitmap(t, stage) {
  const key = ['t', t.outfit, t.color, t.accent, t.pattern, stage].join('|');
  let b = cache.get(key);
  if (b) return b;
  const [, , tw, th] = STAGE_SIZE[stage];
  const dress = t.outfit === 'dress';
  const s = { n: 2.4, pear: dress ? 0.5 : 0.15 };
  const w = tw + (dress ? 2 : 0), h = th;
  const white = C('white');
  const r = raster(w, h, s, (u, v) => {
    switch (t.outfit) {
      case 'dress': return v > 0.75 ? white : v > -0.5 ? t.accent : t.color;
      case 'overalls': return v > -0.05 || (Math.abs(Math.abs(u) - 0.42) < 0.14) ? t.accent : t.color;
      case 'scarf': return v < -0.3 ? t.accent : t.color;
      case 'collar': return v < -0.1 && Math.abs(u) > (v + 0.9) * 0.55 ? white : t.color;
      case 'apron': return Math.abs(u) < 0.48 && v > -0.4 ? white : t.color;
      default: return t.pattern === 'socks' && Math.abs(u) < 0.5 && v > -0.3 ? t.accent : t.color; // belly
    }
  });
  const [sideL, sideR] = r.rowSpan(1);
  b = { ...r, sideL, sideR };
  cache.set(key, b);
  return b;
}

function stamp(bm, part, ax, ay, ctx, flip = false, keep = null) {
  const spr = part.spr;
  const t = lut(spr, ctx);
  const f = spr.frames[0];
  const [px, py] = part.pivot;
  const x0 = flip ? ax - (spr.w - 1 - px) : ax - px;
  const y0 = ay - py;
  for (let j = 0; j < spr.h; j++) for (let i = 0; i < spr.w; i++) {
    const c = t[f[j * spr.w + i]];
    if (!c) continue;
    const x = x0 + (flip ? spr.w - 1 - i : i), y = y0 + j;
    if (x >= 0 && y >= 0 && x < bm.w && y < bm.h && (!keep || keep(x, y))) bm.px[y * bm.w + x] = c;
  }
}

function blit(dst, src, x0, y0) {
  for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
    const c = src.px[j * src.w + i];
    const x = x0 + i, y = y0 + j;
    if (c && x >= 0 && y >= 0 && x < dst.w && y < dst.h) dst.px[y * dst.w + x] = c;
  }
}

function put(bm, x, y, c) { if (x >= 0 && y >= 0 && x < bm.w && y < bm.h) bm.px[y * bm.w + x] = c; }

export const CANVAS = 56; // composed character bitmap is CANVAS x CANVAS
export const GROUND = 53; // y of the feet inside it

/**
 * Compose a pet.
 * pose: { expr: 'idle'|'blink'|'happy'|'sad'|'eat'|'chew'|'sleep'|'sick'|'dizzy', bob: 0|1, gender: 'm'|'f' }
 */
export function composePet(phenotype, stage, pose = {}) {
  const t = stageTraits(phenotype, stage);
  const ctx = colors(t.color, t.accent, t.eyeColor);
  const out = makeBitmap(CANVAS, CANVAS);
  const head = headBitmap(t, stage);
  const hasTorso = STAGE_SIZE[stage][2] > 0;
  const torso = hasTorso ? torsoBitmap(t, stage) : null;
  const feet = FEET[t.feet];
  const footH = feet ? feet.spr.h - 1 : 0;
  const lift = t.feet === 'float' ? 3 : 0;
  const bob = pose.bob ? 1 : 0;
  const cx = CANVAS / 2;

  let ty = 0, tx = 0, hy;
  if (torso) {
    ty = GROUND - footH - lift - torso.h + 1;
    tx = Math.round(cx - torso.w / 2);
    hy = ty - head.h + 3 + bob;
  } else {
    hy = GROUND - footH - lift - head.h + 2 + bob;
  }
  const hx = Math.round(cx - head.w / 2);
  const hcx = hx + Math.floor(head.w / 2);
  const even = head.w % 2 === 0;

  // shadow for floaters
  if (lift) for (let i = -5; i <= 5; i++) if ((i & 1) === 0) put(out, cx + i, GROUND - 1, C('silver'));

  // ----- behind everything: back parts -----
  const back = BACKS[t.back];
  const bodyL = torso ? tx + torso.sideL : hx + head.sideL;
  const bodyR = torso ? tx + torso.sideR : hx + head.sideR;
  const bodyMidY = torso ? ty + 2 : hy + Math.round(head.h * 0.6);
  if (back === 'cape' && torso) {
    const top = ty;
    for (let y = top; y <= GROUND - 1; y++) {
      const spread = 2 + Math.floor((y - top) / 3);
      const l = tx + torso.sideL - spread, r = tx + torso.sideR + spread;
      for (let x = l; x <= r; x++) put(out, x, y, x === l || x === r || y === GROUND - 1 ? C('ink') : C('red.1'));
    }
  } else if (back?.pair) {
    stamp(out, back, bodyL + 1, bodyMidY, ctx);
    stamp(out, back, bodyR - 1, bodyMidY, ctx, true);
  } else if (back?.tail) {
    stamp(out, back, bodyR - 1, torso ? ty + torso.h - 3 : bodyMidY + 2, ctx);
  }

  // ----- body -----
  if (torso) {
    blit(out, torso.bm, tx, ty);
    if (stage === 'adult' || stage === 'teen') {
      stamp(out, ARM, tx + torso.sideL, ty + 1, ctx);
      stamp(out, ARM, tx + torso.sideR, ty + 1, ctx, true);
    }
    if (t.outfit === 'bowtie') stamp(out, BOWTIE, Math.round(cx) - 1 + (torso.w % 2), ty + 1, ctx);
    if (t.outfit === 'tie' || t.outfit === 'collar') stamp(out, TIE, Math.round(cx) - 1 + (torso.w % 2), ty + 1, ctx);
  }
  if (feet) {
    const fy = (torso ? ty + torso.h - 1 : hy + head.h - 1 - bob);
    const span = torso ? Math.max(3, Math.round(torso.w * 0.26)) : Math.max(3, Math.round(head.w * 0.24));
    stamp(out, feet, Math.round(cx) - 1 - span + (even ? 0 : 1), fy, ctx);
    stamp(out, feet, Math.round(cx) + span - (even ? 1 : 0), fy, ctx, true);
  }

  // ----- head -----
  const ears = EARS[t.ears];
  if (ears) {
    const ey = ears.side ? hy + Math.round(head.h * 0.3) : hy + head.earY;
    const exL = ears.side ? hx + head.sideL + 1 : hx + head.earX + 1;
    const exR = hx + head.w - 1 - (exL - hx);
    stamp(out, ears, exL, ey, ctx);
    stamp(out, ears, exR, ey, ctx, true);
  }
  const crest = CRESTS[t.crest];
  const crestX = hcx - (even ? 1 : 0) + (crest?.offset || 0);
  if (crest && !crest.front) stamp(out, crest, crestX, hy + head.top + 1, ctx);
  blit(out, head.bm, hx, hy);
  if (crest && crest.front) stamp(out, crest, crestX, hy + head.top + 1, ctx);

  // ----- face -----
  const expr = pose.expr || 'idle';
  const ey = hy + head.eyeY;
  const exL = hcx - head.eyeDX - (even ? 1 : 0);
  const exR = hcx + head.eyeDX;
  const cheeks = CHEEKS[t.cheeks];
  if (cheeks && expr !== 'sick') {
    // only on the face: inside the head outline
    const onFace = (x, y) => {
      const lx = x - hx, ly = y - hy;
      return head.m(lx, ly) && head.m(lx - 1, ly) && head.m(lx + 1, ly) && head.m(lx, ly + 1);
    };
    const cy = ey + (stage === 'baby' ? 2 : 3);
    const off = stage === 'baby' || stage === 'child' ? 1 : 2;
    stamp(out, cheeks, exL - off, cy, ctx, false, onFace);
    stamp(out, cheeks, exR + off, cy, ctx, true, onFace);
  }
  let eyeFx = null;
  if (expr === 'blink' || expr === 'sleep' || expr === 'chew') eyeFx = EYE_FX.closed;
  else if (expr === 'happy') eyeFx = EYE_FX.happy;
  else if (expr === 'sad' || expr === 'sick') eyeFx = EYE_FX.sad;
  else if (expr === 'dizzy') eyeFx = EYE_FX.dizzy;
  const eye = t.eyes === 'baby' ? BABY_EYES : (EYES[t.eyes] || EYES.bean);
  if (eyeFx) {
    stamp(out, eyeFx, exL, ey, ctx);
    stamp(out, eyeFx, exR, ey, ctx, true);
  } else {
    stamp(out, eye, exL, ey, ctx);
    stamp(out, eye, exR, ey, ctx, true);
    if (pose.gender === 'f' && stage !== 'baby') {
      const top = ey - eye.pivot[1];
      stamp(out, LASH, exL - eye.pivot[0], top, ctx);
      stamp(out, LASH, exR + eye.pivot[0], top, ctx, true);
    }
  }
  let mouth = MOUTHS[t.mouth] || MOUTHS.smile;
  if (expr === 'eat') mouth = MOUTH_FX.open;
  else if (expr === 'chew') mouth = MOUTH_FX.chew;
  else if (expr === 'happy') mouth = MOUTHS[t.mouth] === MOUTHS.beak ? mouth : MOUTH_FX.happy;
  else if (expr === 'sad' || expr === 'sick') mouth = MOUTH_FX.sad;
  else if (expr === 'sleep') mouth = MOUTHS.tiny;
  stamp(out, mouth, hcx, hy + head.mouthY, ctx);
  return out;
}

/** Egg sprite: its colours hint at the baby inside. */
export function composeEgg(phenotype, crack = 0, wobble = 0) {
  const w = 16, h = 19;
  const out = makeBitmap(CANVAS, CANVAS);
  const x0 = Math.round(CANVAS / 2 - w / 2) + wobble, y0 = GROUND - h;
  const base = phenotype?.accent || 'cream', spot = phenotype?.color || 'gold';
  const r = raster(w, h, { n: 2, pear: -0.25 }, (u, v) => {
    const isSpot = [[-0.4, -0.25, 0.2], [0.38, 0.12, 0.22], [-0.12, 0.6, 0.18], [0.22, -0.62, 0.14]].some(([a, b, rr]) => (u - a) ** 2 + (v - b) ** 2 < rr * rr);
    return isSpot ? spot : base;
  });
  blit(out, r.bm, x0, y0);
  const cracks = [[8, 3], [7, 4], [8, 5], [9, 6], [8, 7], [10, 4], [11, 5], [6, 6], [5, 7]];
  for (let i = 0; i < Math.min(cracks.length, crack * 3); i++) put(out, x0 + cracks[i][0], y0 + cracks[i][1], C('ink'));
  return out;
}

/** Ghost for a pet that has passed away. */
export function composeGhost(frame = 0) {
  const out = makeBitmap(CANVAS, CANVAS);
  const rows = [
    '...oooooo...',
    '..owwwwwwo..',
    '.owwwwwwwwo.',
    'owwkwwwwkwwo',
    'owwkwwwwkwwo',
    'owwwwffwwwwo',
    'owwwwwwwwwwo',
    'owwwwwwwwwmo',
    'owwwwwwwwmmo',
    frame ? 'owowwowwowmo' : 'owwowwowwowo',
    frame ? '.o.oo.oo.oo.' : 'o.oo.oo.oo.o',
  ];
  const x0 = CANVAS / 2 - 6, y0 = GROUND - 26 - frame;
  const key = { o: C('ink'), k: C('ink'), w: C('white'), m: C('mist'), f: C('pink.2') };
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (key[ch]) put(out, x0 + x, y0 + y, key[ch]); }));
  return out;
}
