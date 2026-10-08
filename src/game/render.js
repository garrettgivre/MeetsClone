// Character renderer, in a classic colour-screen virtual pet style:
// a big head on a small body, navy outlines, flat pastel fills with a soft
// rim shade, glossy eyes, blush and hair.
//
// Babies are a round head only; kids gain feet; teens a little body and arms;
// adults get headgear and back parts. Clothes (pose.wear) fit teens and adults.
// The result is composed into an off-screen bitmap so it can be flipped
// or drawn as a silhouette.

import { C, ramp } from '../engine/palette.js';
import { colors, lut } from '../engine/sprite.js';
import { makeBitmap } from '../engine/screen.js';
import {
  EYES, BABY_EYES, LASH, MOUTHS, MOUTH_FX, EYE_FX, EARS, CRESTS, BACKS, FEET, CHEEKS, ARMS, BOWTIE, TIE, HAIR_PARTS, FACE, MARKS, NOSES,
} from '../art/parts.js';
import { stageTraits, SCALED_EARS } from './genetics.js';
import { CLOTHES } from './items.js';

const SHAPES = {
  round:   { aw: 1.0,  ah: 1.0,  n: 2.0 },
  mochi:   { aw: 1.1,  ah: 0.9,  n: 2.3, nb: 3.4 },        // soft top, flatter bottom
  bean:    { aw: 1.14, ah: 0.88, n: 2.3 },
  egg:     { aw: 0.94, ah: 1.06, n: 2.0, pear: -0.18 },
  tall:    { aw: 0.86, ah: 1.12, n: 2.3 },
  pear:    { aw: 1.0,  ah: 1.0,  n: 2.0, pear: 0.3 },
  bun:     { aw: 1.12, ah: 0.86, n: 3.0 },
  onigiri: { aw: 1.06, ah: 1.0,  n: 2.4, pear: 0.5, nb: 3.2 }, // rounded triangle
  drop:    { aw: 0.98, ah: 1.08, n: 2.0, drop: true },
  blocky:  { aw: 1.0,  ah: 0.96, n: 4.2 },
  heart:   { aw: 1.08, ah: 0.98, n: 2.0, nb: 1.7, notch: true },  // dip at the top, soft point below
};
// Body builds: width/height change and superellipse shape.
const BUILDS = {
  round:  { dw: 0, dh: 0,  n: 2.6, pear: 0.3 },
  chubby: { dw: 5, dh: 0,  n: 2.2, pear: 0.12 },
  slim:   { dw: -3, dh: 1, n: 3.0, pear: 0.1 },
  bell:   { dw: 3, dh: 0,  n: 2.4, pear: 0.6 },
  long:   { dw: -2, dh: 3, n: 3.4, pear: 0.15 },
  stout:  { dw: 6, dh: -3, n: 2.8, pear: 0.05 },
};
// [head w, head h, torso w, torso h]
const STAGE_SIZE = { baby: [16, 14, 0, 0], child: [20, 17, 0, 0], teen: [24, 20, 13, 10], adult: [28, 23, 16, 13] };
const SIZE_DELTA = { small: -2, medium: 0, large: 2 };

function inside(s, u, v) {
  if (s.fn) return s.fn(u, v);
  if (s.notch && v < -0.42 && Math.abs(u) < 0.3 * (-0.42 - v) / 0.58) return false;
  let f = 1;
  if (s.pear > 0) f = 1 - s.pear * (1 - (v + 1) / 2);      // wider at the bottom
  if (s.pear < 0) f = 1 + s.pear * ((v + 1) / 2);           // wider at the top
  if (s.drop) f = Math.min(1, Math.pow(Math.max(0, (v + 1) / 1.25), 0.7) + 0.1);
  const n = v > 0 && s.nb ? s.nb : s.n;
  return Math.pow(Math.abs(u / f), n) + Math.pow(Math.abs(v), n) <= 1;
}

/** Zig-zag 0..1 used for fringes. */
const zig = (x) => Math.abs((((x % 1) + 1) % 1) - 0.5) * 2;

/** Rounded scallop 0..1 for bangs: locks of width `lock` with round bottoms, one centred. */
function scallop(u, lock) {
  const f = (((u / lock) + 0.5) % 1 + 1) % 1;
  return Math.sqrt(Math.max(0, 1 - (2 * f - 1) ** 2));
}

function hairAt(hair, u, v) {
  switch (hair) {
    case 'bangs': case 'ponytail': case 'twintails':
      return v < -0.42 + 0.2 * scallop(u, 0.44);
    case 'bob':
      return v < -0.42 + 0.2 * scallop(u, 0.44) || (Math.abs(u) > 0.62 && v < 0.42 + 0.1 * Math.cos((Math.abs(u) - 0.62) * 8));
    case 'spiky':
      return v < -0.5 + 0.22 * zig(u * 2.4 + 0.5);
    case 'curly':
      return v < -0.44 + 0.1 * scallop(u, 0.22);
    default: return false;
  }
}

function headPattern(pattern, u, v, y) {
  switch (pattern) {
    case 'socks': return (u / 0.62) ** 2 + ((v - 0.62) / 0.42) ** 2 <= 1; // muzzle
    case 'tips': return v < -0.38 + 0.12 * Math.cos(u * 9);              // cap of colour
    case 'mask': return v > -0.25 && v < 0.12 && Math.abs(u) < 0.95;
    case 'twotone': return u < 0;
    case 'stripes': return v < -0.2 && (y >> 1) % 2 === 0;
    case 'spots': return [[-0.62, -0.35, 0.18], [0.5, -0.62, 0.15], [0.68, 0.2, 0.16]].some(([cx, cy, r]) => (u - cx) ** 2 + (v - cy) ** 2 < r * r);
    default: return false;
  }
}

/**
 * Rasterise a shape into clean pixel art.
 *  - 4x4 supersampled coverage, mirrored left/right so shapes are symmetric
 *  - 1px navy outline with "pixel-perfect" cleanup (no doubled corner pixels)
 *  - cel shading: a shadow band that follows the shape's own edge on the lower
 *    right, and an oval highlight on the upper left
 * paint(u, v, x, y, m) returns a ramp name (auto-shaded), { ramp, shade } or a
 * fixed palette index. m(x, y) tells whether a pixel is inside the shape.
 * opts: { shine: false } no highlight; { shadeTop: n } shade the top n rows
 * (where a head casts a shadow); { asym: true } skip mirroring.
 */
function raster(w, h, s, paint, opts = {}) {
  const bm = makeBitmap(w, h);
  const mask = new Uint8Array(w * h);
  const U = (x) => ((x + 0.5) - w / 2) / (w / 2);
  const V = (y) => ((y + 0.5) - h / 2) / (h / 2);
  const SS = 4;
  const half = opts.asym ? w : Math.ceil(w / 2);
  for (let y = 0; y < h; y++) for (let x = 0; x < half; x++) {
    let hits = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const u = ((x + (sx + 0.5) / SS) - w / 2) / (w / 2);
      const v = ((y + (sy + 0.5) / SS) - h / 2) / (h / 2);
      if (inside(s, u, v)) hits++;
    }
    const on = hits * 2 >= SS * SS ? 1 : 0;
    mask[y * w + x] = on;
    if (!opts.asym) mask[y * w + (w - 1 - x)] = on;
  }
  const m = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x] === 1;

  // outline: inside pixels with an outside 4-neighbour
  const edge = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (m(x, y) && (!m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1) || !m(x, y + 1))) edge[y * w + x] = 1;
  // pixel-perfect: drop the middle pixel of an "L" so diagonals are single steps
  const e = (x, y) => x >= 0 && y >= 0 && x < w && y < h && edge[y * w + x] === 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!e(x, y)) continue;
    for (const [ax, ay, bx, by] of [[-1, 0, 0, -1], [0, -1, 1, 0], [1, 0, 0, 1], [0, 1, -1, 0]]) {
      if (e(x + ax, y + ay) && e(x + bx, y + by) && !m(x + ax + bx, y + ay + by)
        && m(x - ax, y - ay) && !e(x - ax, y - ay) && m(x - bx, y - by) && !e(x - bx, y - by)) {
        edge[y * w + x] = 0;
        break;
      }
    }
  }

  const ink = C('ink');
  const k = Math.max(1, Math.round(Math.min(w, h) / 9)); // shadow band thickness
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!m(x, y)) continue;
    if (edge[y * w + x]) { bm.px[y * w + x] = ink; continue; }
    const u = U(x), v = V(y);
    const r = paint(u, v, x, y, m);
    if (typeof r === 'number') { bm.px[y * w + x] = r; continue; }
    if (typeof r === 'object') { bm.px[y * w + x] = ramp(r.ramp, r.shade); continue; }
    bm.px[y * w + x] = ramp(r, celShade(m, x, y, u, v, k, opts));
  }
  const rowSpan = (y) => {
    let l = -1, rr = -1;
    for (let x = 0; x < w; x++) if (m(x, y)) { if (l < 0) l = x; rr = x; }
    return [l, rr];
  };
  return { bm, w, h, m, rowSpan, U, V };
}

/** 1 = shadow, 2 = base, 3 = highlight. The shadow follows the shape's own edge. */
function celShade(m, x, y, u, v, k, opts = {}) {
  if (opts.shadeTop && y <= opts.shadeTop) return 1;
  // light from the upper left: pixels near the lower-right edge fall into shadow
  if (!m(x + k, y + k) || (v > 0.35 && !m(x, y + k + 1))) return 1;
  if (opts.shine !== false && ((u + 0.42) / 0.2) ** 2 + ((v + 0.5) / 0.12) ** 2 <= 1) return 3;
  return 2;
}

const cache = new Map();

/** Eye and mouth anchors. The eyeSet gene moves the eyes apart, together or lower. */
function faceLayout(w, h, eyeSet) {
  const spread = { wide: 1.24, close: 0.78 }[eyeSet] || 1;
  const low = eyeSet === 'low' ? Math.round(h * 0.08) : 0;
  const eyeY = Math.round(h * 0.5) + low;
  return {
    eyeY, eyeDX: Math.max(3, Math.round(w * 0.21 * spread)),
    mouthY: eyeY + Math.max(3, Math.round(h * 0.22)),
  };
}

function headBitmap(t, stage) {
  const key = ['h', t.shape, t.size, t.pattern, t.color, t.accent, t.hair, t.hairColor, t.eyeSet, stage].join('|');
  let b = cache.get(key);
  if (b) return b;
  const s = SHAPES[t.shape] || SHAPES.round;
  const [hw, hh] = STAGE_SIZE[stage];
  const d = stage === 'adult' ? SIZE_DELTA[t.size] || 0 : 0;
  const w = Math.round((hw + d) * s.aw), h = Math.round((hh + d) * s.ah);
  // hair is worked out per pixel (mirrored so both sides match) so it can be outlined
  const hm = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < Math.ceil(w / 2); x++) {
    const on = hairAt(t.hair, ((x + 0.5) - w / 2) / (w / 2), ((y + 0.5) - h / 2) / (h / 2)) ? 1 : 0;
    hm[y * w + x] = on; hm[y * w + (w - 1 - x)] = on;
  }
  const hair = (x, y) => x >= 0 && y >= 0 && x < w && y < h && hm[y * w + x] === 1;
  const k = Math.max(1, Math.round(Math.min(w, h) / 9));
  const r = raster(w, h, s, (u, v, x, y, m) => {
    if (hair(x, y)) {
      // outline the hair where it meets the face, like the head's own outline
      if ((m(x, y + 1) && !hair(x, y + 1)) || (m(x - 1, y) && !hair(x - 1, y)) || (m(x + 1, y) && !hair(x + 1, y))) return C('ink');
      // a curved gloss band across the top
      const gloss = Math.abs(Math.hypot(u * 1.05, v - 0.25) - 0.86) < 1.6 / h && u > -0.62 && u < -0.06;
      if (gloss) return { ramp: t.hairColor, shade: 3 };
      // shadow along the head's lower-right edge and just above the fringe line
      const shade = !m(x + k, y + k) || !hair(x, y + 2) ? 1 : 2;
      return { ramp: t.hairColor, shade };
    }
    return headPattern(t.pattern, u, v, y) ? t.accent : t.color;
  }, { shine: t.hair === 'none' });
  const earY = Math.max(1, Math.round(h * 0.18));
  let top = 0;
  while (top < h && !r.m(Math.floor(w / 2), top)) top++;
  const [sideL, sideR] = r.rowSpan(Math.round(h * 0.4));
  b = {
    ...r, top, sideL, sideR, earY, earX: r.rowSpan(earY)[0] + 1,
    ...faceLayout(w, h, t.eyeSet),
  };
  cache.set(key, b);
  return b;
}

function torsoBitmap(t, stage) {
  const key = ['t', t.outfit, t.outfitColor, t.color, t.accent, t.build, t.belly, stage].join('|');
  let b = cache.get(key);
  if (b) return b;
  const [, , tw, th] = STAGE_SIZE[stage];
  const k = stage === 'adult' ? 1 : 0.7; // teens get a gentler version of their build
  const B = BUILDS[t.build] || BUILDS.round;
  const dress = t.outfit === 'dress';
  const oc = t.outfitColor || t.accent;
  const s = { n: B.n, pear: dress ? 0.55 : B.pear };
  const w = Math.round(tw + B.dw * k) + (dress ? 4 : 0), h = Math.round(th + B.dh * k);
  const white = C('white');
  // the bare body: base colour plus the belly gene
  const skin = (u, v) => {
    switch (t.belly) {
      case 'patch': return (u / 0.52) ** 2 + ((v - 0.28) / 0.66) ** 2 <= 1 ? t.accent : t.color;
      case 'suit': return t.accent;
      case 'bib': return v < 0.15 && Math.abs(u) < 0.62 - (v + 1) * 0.12 ? t.accent : t.color;
      case 'heart': {
        const x = u / 0.55, y = -(v - 0.2) / 0.62;
        return (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0 ? t.accent : t.color;
      }
      default: return t.color;
    }
  };
  const r = raster(w, h, s, (u, v, x, y) => {
    switch (t.outfit) {
      case 'sweater': return y % 3 === 2 && v > -0.5 ? C('white') : oc;
      case 'sash': return Math.abs(u + v * 0.9) < 0.24 ? oc : skin(u, v);
      case 'dress': return v > 0.6 ? (v > 0.75 ? white : C('mist')) : v > -0.45 ? oc : skin(u, v);
      case 'overalls': return v > -0.05 || (Math.abs(Math.abs(u) - 0.42) < 0.14) ? oc : skin(u, v);
      case 'scarf': return v < -0.3 ? oc : skin(u, v);
      case 'collar': return v < -0.1 && Math.abs(u) > (v + 0.9) * 0.55 ? white : skin(u, v);
      case 'apron': return Math.abs(u) < 0.48 && v > -0.4 ? white : skin(u, v);
      default: return skin(u, v);
    }
  }, { shadeTop: 2 });
  b = { ...r, sideL: r.rowSpan(3)[0], sideR: r.rowSpan(3)[1] };
  cache.set(key, b);
  return b;
}

/**
 * Ears drawn in proportion to the head (left ear; flip for the right).
 * Returns the bitmap plus where it attaches: angle from the top of the head
 * and the pixel in the ear that sits on the head's outline.
 */
function earBitmap(kind, headW, t) {
  const key = ['e', kind, headW, t.color, t.accent].join('|');
  let b = cache.get(key);
  if (b) return b;
  const ellipse = (u, v) => u * u + v * v <= 1;
  const inner = t.accent === t.color ? 'pink' : t.accent;
  let w, h, fn, paint, angle, pivot, front = false;
  switch (kind) {
    case 'bear': case 'mouse': {
      w = h = Math.round(headW * (kind === 'mouse' ? 0.5 : 0.36));
      fn = ellipse;
      paint = (u, v) => ((u - 0.2) ** 2 + (v - 0.2) ** 2 < (kind === 'mouse' ? 0.3 : 0.24) ? inner : t.color);
      angle = kind === 'mouse' ? 56 : 48;
      pivot = [w / 2, h / 2];
      break;
    }
    case 'cat': {
      w = Math.round(headW * 0.36); h = Math.round(headW * 0.42);
      // a triangle whose tip leans outward
      fn = (u, v) => Math.abs(u + 0.4 * (1 - v) / 2) <= (v + 1) / 2 && v <= 0.95;
      paint = (u, v) => (Math.abs(u + 0.4 * (1 - v) / 2 + 0.05) <= (v + 0.2) / 2 * 0.62 && v > -0.2 ? inner : t.color);
      angle = 42; pivot = [w * 0.55, h * 0.82];
      break;
    }
    case 'bunny': {
      w = Math.max(5, Math.round(headW * 0.26)); h = Math.round(headW * 0.72);
      fn = ellipse;
      paint = (u, v) => (Math.abs(u) < 0.36 && v > -0.72 && v < 0.7 ? inner : t.color);
      angle = 22; pivot = [w / 2, h * 0.86];
      break;
    }
    case 'floppy': {
      w = Math.round(headW * 0.3); h = Math.round(headW * 0.62);
      const a = 0.38; // tilt
      fn = (u, v) => { const x = u * Math.cos(a) - v * Math.sin(a) * 0.5, y = u * Math.sin(a) * 2 + v * Math.cos(a); return x * x + y * y <= 1; };
      paint = () => ({ ramp: t.color, shade: 1 });
      angle = 80; pivot = [w * 0.62, h * 0.14]; front = true;
      break;
    }
  }
  const r = raster(w, h, { fn }, paint, { asym: kind === 'cat' || kind === 'floppy', shine: false });
  b = { ...r, angle, pivot, front };
  cache.set(key, b);
  return b;
}

/** A muzzle drawn to scale with a little nose on top. */
function snoutBitmap(headW, headH, t) {
  const key = ['s', headW, headH, t.accent, t.color].join('|');
  let b = cache.get(key);
  if (b) return b;
  const w = Math.round(headW * 0.44) | 1, h = Math.max(6, Math.round(headH * 0.32));
  const fill = t.accent === t.color ? 'cream' : t.accent;
  b = raster(w, h, { n: 2.2 }, (u, v) => (Math.abs(u) < 0.22 && v < -0.2 ? C('ink') : fill));
  cache.set(key, b);
  return b;
}

/** A big duck bill drawn to scale; the middle line is the mouth. */
function billBitmap(headW, headH, open) {
  const key = ['b', headW, headH, open].join('|');
  let b = cache.get(key);
  if (b) return b;
  const w = Math.round(headW * 0.52) | 1, h = Math.max(6, Math.round(headH * 0.3));
  b = raster(w, h, { n: 2.4 }, (u, v) => {
    if (Math.abs(v - 0.05) < 1 / h * 1.2 && Math.abs(u) < 0.8) return open ? C('red.0') : C('ink');
    if (open && v > 0.05 && v < 0.5 && Math.abs(u) < 0.55) return C('red.1');
    return { ramp: 'orange', shade: v < 0 ? (u + v < -0.9 ? 3 : 2) : 1 };
  });
  cache.set(key, b);
  return b;
}

function blitFlip(dst, src, x0, y0) {
  for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
    const c = src.px[j * src.w + (src.w - 1 - i)];
    const x = x0 + i, y = y0 + j;
    if (c && x >= 0 && y >= 0 && x < dst.w && y < dst.h) dst.px[y * dst.w + x] = c;
  }
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

export const CANVAS = 64; // composed character bitmap is CANVAS x CANVAS
export const GROUND = 61; // y of the feet inside it

/**
 * Compose a pet.
 * pose: {
 *   expr: 'idle'|'blink'|'happy'|'sad'|'eat'|'chew'|'sleep'|'sick'|'dizzy'|'wink',
 *   arms: 'down'|'up'|'out'|'wave', step: 0|1|2 (walking), bob: 0|1, gender: 'm'|'f', t: ms (sparkles),
 *   wear: { head, face, body, back, feet } clothing item ids
 * }
 */
export function composePet(phenotype, stage, pose = {}) {
  const t = stageTraits(phenotype, stage);
  const ctx = colors(t.color, t.accent, t.eyeColor, t.hairColor || 'brown');
  // clothes: only teens and adults dress up; each item has its own colour
  const wear = stage === 'teen' || stage === 'adult' ? (pose.wear || {}) : {};
  const itemCtx = (id) => colors(t.color, CLOTHES[id]?.color || t.accent, t.eyeColor, t.hairColor || 'brown');
  t.outfit = wear.body || 'none';
  t.outfitColor = CLOTHES[wear.body]?.color;
  if (wear.back === 'cape') t.back = 'cape';
  const shoes = wear.feet === 'shoes' && t.feet !== 'float';
  if (shoes) t.feet = 'shoes';
  const out = makeBitmap(CANVAS, CANVAS);
  const head = headBitmap(t, stage);
  const hasTorso = STAGE_SIZE[stage][2] > 0;
  const torso = hasTorso ? torsoBitmap(t, stage) : null;
  const feet = FEET[t.feet];
  const feetCtx = shoes ? itemCtx('shoes') : ctx;
  const footH = feet ? feet.spr.h - 2 : 0;
  const lift = t.feet === 'float' ? 3 : 0;
  const bob = pose.bob ? 1 : 0;
  const step = pose.step || 0;
  const cx = CANVAS / 2;

  let ty = 0, tx = 0, hy;
  if (torso) {
    ty = GROUND - footH - lift - torso.h + 1 + (step ? 0 : 0);
    tx = Math.round(cx - torso.w / 2);
    hy = ty - head.h + 3 + bob;
  } else {
    hy = GROUND - footH - lift - head.h + 2 + bob;
  }
  const hx = Math.round(cx - head.w / 2);
  const hcx = hx + Math.floor(head.w / 2);
  const even = head.w % 2 === 0;

  // shadow under the pet
  for (let i = -6; i <= 6; i++) if (lift ? (i & 1) === 0 : Math.abs(i) < 6) put(out, cx + i, GROUND, lift ? C('silver') : C('mist'));

  // ----- behind everything: back parts and hair behind the head -----
  const back = BACKS[t.back];
  const bodyL = torso ? tx + torso.sideL : hx + head.sideL;
  const bodyR = torso ? tx + torso.sideR : hx + head.sideR;
  const bodyMidY = torso ? ty + 3 : hy + Math.round(head.h * 0.6);
  if (back === 'cape' && torso) {
    const top = ty + 1;
    for (let y = top; y <= GROUND - 1; y++) {
      const spread = 2 + Math.floor((y - top) / 3);
      const l = tx + torso.sideL - spread, r = tx + torso.sideR + spread;
      for (let x = l; x <= r; x++) put(out, x, y, x === l || x === r || y === GROUND - 1 ? C('ink') : ramp(CLOTHES.cape.color, x < cx - 4 ? 2 : 1));
    }
  } else if (back?.pair) {
    stamp(out, back, bodyL + 1, bodyMidY, ctx);
    stamp(out, back, bodyR - 1, bodyMidY, ctx, true);
  } else if (back?.tail) {
    stamp(out, back, bodyR - 1, torso ? ty + torso.h - 3 : bodyMidY + 2, ctx);
  }
  if (t.hair === 'curly') stamp(out, HAIR_PARTS.puff, hcx - (even ? 1 : 0), hy + head.top + 3, ctx);
  if (t.hair === 'ponytail') stamp(out, HAIR_PARTS.ponytail, hx + head.sideR - 1, hy + Math.round(head.h * 0.22), ctx);
  if (t.hair === 'twintails') {
    stamp(out, HAIR_PARTS.twintail, hx + head.sideL + 1, hy + Math.round(head.h * 0.25), ctx);
    stamp(out, HAIR_PARTS.twintail, hx + head.sideR - 1, hy + Math.round(head.h * 0.25), ctx, true);
  }

  // ----- body -----
  let armsY = torso ? ty + 4 : 0;
  // arms: lowered arms tuck behind the body (the body's outline joins them
  // cleanly); raised arms go in front so they aren't hidden by the big head
  const armPose = pose.arms || 'down';
  const [armL, armR] = armPose === 'wave' ? ['up', 'down'] : [armPose, armPose];
  const drawArm = (which, side) => {
    const a = ARMS[which] || ARMS.down;
    if (side < 0) stamp(out, a, tx + torso.sideL + (which === 'up' ? 1 : 2), armsY, ctx);
    else stamp(out, a, tx + torso.sideR - (which === 'up' ? 1 : 2), armsY, ctx, true);
  };

  if (torso) {
    // feet first so the body sits on them
    if (feet) drawFeet(out, feet, feetCtx, cx, ty + torso.h - 2, Math.max(3, Math.round(torso.w * 0.22)), step, even);
    if (armL !== 'up') drawArm(armL, -1);
    if (armR !== 'up') drawArm(armR, 1);
    blit(out, torso.bm, tx, ty);
    if (t.outfit === 'bowtie') stamp(out, BOWTIE, Math.round(cx) - 1 + (torso.w % 2), ty + 3, itemCtx('bowtie'));
    if (t.outfit === 'tie' || t.outfit === 'collar') stamp(out, TIE, Math.round(cx) - 1 + (torso.w % 2), ty + 3, itemCtx(t.outfit));
  } else if (feet) {
    drawFeet(out, feet, feetCtx, cx, hy + head.h - 3 - bob, Math.max(3, Math.round(head.w * 0.22)), step, even);
  }

  // ----- head -----
  // ears drawn to scale sit on the head outline at an angle from the top
  let frontEars = null;
  if (SCALED_EARS.includes(t.ears)) {
    const e = earBitmap(t.ears, head.w, t);
    const th = e.angle * Math.PI / 180;
    const hcy = hy + head.h / 2;
    const ax = Math.round(head.w / 2 * Math.sin(th) * 0.9), ay = Math.round(head.h / 2 * Math.cos(th) * 0.9);
    const lx = Math.round(hcx - (even ? 0.5 : 0) - ax - e.pivot[0]), rx = Math.round(hcx - (even ? 0.5 : 0) + ax - (e.w - e.pivot[0]));
    const y = Math.round(hcy - ay - e.pivot[1]);
    const drawEars = () => { blit(out, e.bm, lx, y); blitFlip(out, e.bm, rx, y); };
    if (e.front) frontEars = drawEars; else drawEars();
  }
  const ears = SCALED_EARS.includes(t.ears) ? null : EARS[t.ears];
  if (ears) {
    const ey = ears.side ? hy + Math.round(head.h * 0.3) : hy + head.earY;
    const exL = ears.side ? hx + head.sideL + 1 : hx + head.earX + 1;
    const exR = hx + head.w - 1 - (exL - hx);
    stamp(out, ears, exL, ey, ctx);
    stamp(out, ears, exR, ey, ctx, true);
  }
  if (t.hair === 'spiky') stamp(out, HAIR_PARTS.spikes, hcx - (even ? 1 : 0), hy + head.top + 2, ctx);
  // a hat replaces the natural crest while it's worn
  const hat = wear.head && CRESTS[wear.head];
  const crest = hat || CRESTS[t.crest];
  const crestCtx = hat ? itemCtx(wear.head) : ctx;
  const crestX = hcx - (even ? 1 : 0) + (crest?.offset || 0);
  if (crest && !crest.front) stamp(out, crest, crestX, hy + head.top + 1, crestCtx);
  blit(out, head.bm, hx, hy);
  if (crest && crest.front) stamp(out, crest, crestX, hy + head.top + 1, crestCtx);
  frontEars?.();
  if (torso) { if (armL === 'up') drawArm('up', -1); if (armR === 'up') drawArm('up', 1); }

  // ----- face -----
  const expr = pose.expr || 'idle';
  const ey = hy + head.eyeY;
  const exL = hcx - head.eyeDX - (even ? 1 : 0);
  const exR = hcx + head.eyeDX;
  const big = stage === 'teen' || stage === 'adult';
  const cheeks = CHEEKS[t.cheeks];
  if (cheeks && expr !== 'sick') {
    const onFace = (x, y) => {
      const lx = x - hx, ly = y - hy;
      return head.m(lx, ly) && head.m(lx - 1, ly) && head.m(lx + 1, ly) && head.m(lx, ly + 1);
    };
    const cy = ey + (big ? 4 : stage === 'baby' ? 2 : 3);
    const off = big ? 3 : 1;
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
  } else if (expr === 'wink') {
    stamp(out, eye, exL, ey, ctx);
    stamp(out, EYE_FX.happy, exR, ey, ctx, true);
  } else {
    stamp(out, eye, exL, ey, ctx);
    stamp(out, eye, exR, ey, ctx, true);
    if (pose.gender === 'f' && stage !== 'baby') {
      const top = ey - eye.pivot[1];
      stamp(out, LASH, exL - eye.pivot[0], top, ctx);
      stamp(out, LASH, exR + eye.pivot[0], top, ctx, true);
    }
  }
  // forehead mark
  const mark = MARKS[t.mark];
  if (mark) stamp(out, mark, hcx - (even ? 1 : 0) + (mark.spr.w % 2 ? 0 : 1), ey - eye.pivot[1] - 3, ctx);

  // face accessories (glasses go over the eyes, stickers on a cheek)
  const face = FACE[wear.face];
  const faceCtx = itemCtx(wear.face);
  if (face) {
    if (face.lens) {
      stamp(out, face.lens, exL, ey, faceCtx);
      if (!face.oneSide) {
        stamp(out, face.lens, exR, ey, faceCtx, true);
        const l = exL + face.lens.pivot[0] + 1, r = exR - face.lens.pivot[0] - 1;
        for (let x = l; x <= r; x++) put(out, x, ey - 1, C(face.bridge));
      } else if (face.chain) {
        for (let i = 0; i < 6; i++) put(out, exL - 3 - (i >> 1), ey + 3 + i, C(i % 2 ? 'gold.1' : 'gold.3'));
      }
    }
    if (face.cheek) stamp(out, face.cheek, exR + 3, ey + 5, faceCtx);
  }
  // nose: snout and whiskers are drawn to scale, the rest are small sprites
  let mouthY = hy + head.mouthY;
  const nose = NOSES[t.nose];
  if (nose === 'snout' && t.mouth !== 'bill') { // a bill is its own snout
    const sn = snoutBitmap(head.w, head.h, t);
    const sy = mouthY - 3;
    blit(out, sn.bm, Math.round(hcx - (even ? 0.5 : 0) - sn.w / 2 + 0.5), sy);
    mouthY = sy + Math.round(sn.h * 0.5);
  } else if (nose === 'whiskers') {
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x0 = hcx + side * (head.eyeDX + 3) - (side < 0 && even ? 1 : 0);
      for (let k = 0; k < 4; k++) put(out, x0 + side * k, mouthY - 2 + i * 2 + (i === 1 ? 0 : Math.round((i - 1) * k / 3)), C('ink'));
    }
    put(out, hcx, mouthY - 2, C('pink.1')); put(out, hcx - (even ? 1 : 0), mouthY - 2, C('pink.1'));
  } else if (nose) {
    stamp(out, nose, hcx, mouthY - 3, ctx);
    mouthY += 1;
  }
  if (MOUTHS[t.mouth] === 'bill') {
    const bill = billBitmap(head.w, head.h, expr === 'eat' || expr === 'happy' || expr === 'wink');
    blit(out, bill.bm, Math.round(hcx - (even ? 0.5 : 0) - bill.w / 2 + 0.5), mouthY - 3);
    return finish(out, t, pose, hcx, hy, head);
  }
  let mouth = MOUTHS[t.mouth] || MOUTHS.smile;
  const beak = mouth === MOUTHS.beak;
  if (expr === 'eat') mouth = beak ? mouth : MOUTH_FX.open;
  else if (expr === 'chew') mouth = beak ? mouth : MOUTH_FX.chew;
  else if (expr === 'happy' || expr === 'wink') mouth = beak ? mouth : MOUTH_FX.happy;
  else if (expr === 'sad' || expr === 'sick') mouth = beak ? mouth : MOUTH_FX.sad;
  else if (expr === 'sleep') mouth = beak ? mouth : MOUTHS.tiny;
  stamp(out, mouth, hcx, mouthY, ctx);
  return finish(out, t, pose, hcx, hy, head);
}

/** Final touches shared by every face: the rare sparkle aura. */
function finish(out, t, pose, hcx, hy, head) {

  // rare aura: twinkling sparkles around the pet
  if (t.aura === 'sparkle') {
    const tick = Math.floor((pose.t || 0) / 160);
    const spots = [[-1.1, -0.2], [1.15, 0.1], [-0.6, -1.05], [0.75, -0.95], [-1.25, 0.8], [1.2, 0.85]];
    spots.forEach(([sx, sy], i) => {
      const phase = (tick + i * 2) % 6;
      if (phase > 2) return;
      const x = Math.round(hcx + sx * head.w / 2), y = Math.round(hy + head.h / 2 + sy * head.h / 2);
      put(out, x, y, C('white'));
      if (phase === 1) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) put(out, x + dx, y + dy, C('gold.3'));
    });
  }
  return out;
}

function drawFeet(out, feet, ctx, cx, fy, span, step, even) {
  const lx = Math.round(cx) - 1 - span + (even ? 0 : 1);
  const rx = Math.round(cx) + span - (even ? 1 : 0);
  stamp(out, feet, lx, fy - (step === 1 ? 1 : 0), ctx);
  stamp(out, feet, rx, fy - (step === 2 ? 1 : 0), ctx, true);
}

/** Egg sprite: its colours hint at the baby inside. */
export function composeEgg(phenotype, crack = 0, wobble = 0) {
  const w = 18, h = 22;
  const out = makeBitmap(CANVAS, CANVAS);
  const x0 = Math.round(CANVAS / 2 - w / 2) + wobble, y0 = GROUND - h + 1;
  const base = phenotype?.accent || 'cream', spot = phenotype?.color || 'gold';
  for (let i = -6; i <= 6; i++) put(out, CANVAS / 2 + i, GROUND, C('mist'));
  const r = raster(w, h, { n: 2, pear: -0.25 }, (u, v) => {
    const isSpot = [[-0.4, -0.25, 0.2], [0.38, 0.12, 0.22], [-0.12, 0.6, 0.18], [0.22, -0.62, 0.14]].some(([a, b, rr]) => (u - a) ** 2 + (v - b) ** 2 < rr * rr);
    const band = Math.abs(v - 0.05 - 0.1 * (zig(u * 3) - 0.5)) < 0.08;
    return isSpot || band ? spot : base;
  });
  blit(out, r.bm, x0, y0);
  const cracks = [[9, 3], [8, 4], [9, 5], [10, 6], [9, 7], [11, 4], [12, 5], [7, 6], [6, 7]];
  for (let i = 0; i < Math.min(cracks.length, crack * 3); i++) put(out, x0 + cracks[i][0], y0 + cracks[i][1], C('ink'));
  return out;
}

/** Ghost for a pet that has passed away. */
export function composeGhost(frame = 0) {
  const out = makeBitmap(CANVAS, CANVAS);
  const rows = [
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
  ];
  const x0 = CANVAS / 2 - 7, y0 = GROUND - 28 - frame;
  const key = { o: C('ink'), k: C('ink'), w: C('white'), m: C('mist'), f: C('pink.2') };
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (key[ch]) put(out, x0 + x, y0 + y, key[ch]); }));
  return out;
}
