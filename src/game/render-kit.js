// Kit renderer: builds a pet at sprite resolution from the hand-pixelled parts
// kit (src/art/kit.js), in the same style as the founders, then hands it to
// the founder pipeline for scaling and animation-friendly drawing.
//
// Heads and bodies are shaped by genes and rendered with the founder rules
// (docs/STYLE.md): lit outline in the darkest body shade, ink on the shadow
// side, a rounded light cluster, a shine pixel, a shadow band and a neck shadow.

import { C, ramp } from '../engine/palette.js';
import { colors, lut } from '../engine/sprite.js';
import { makeBitmap } from '../engine/screen.js';
import { stageTraits } from './genetics.js';
import {
  EYES, BABY_EYES, LASH, MOUTHS, MOUTH_OPEN, MOUTH_CHEW, MOUTH_SAD, BILL, NOSES, MARKS, CHEEKS,
  EARS, CRESTS, BACKS, HAIR, TUFT, ARMS, FEET,
} from '../art/kit.js';

export const KW = 48, KH = 52, KG = 50; // sprite canvas and the feet row

// Head size [w, h] and body size [w, h] per stage, in sprite pixels
const STAGE = { baby: [16, 14, 0, 0], child: [21, 18, 0, 0], teen: [26, 21, 14, 10], adult: [30, 24, 17, 13] };
const SIZE = { small: -2, medium: 0, large: 2 };
const SHAPES = {
  round:   { aw: 1.0,  ah: 1.0,  n: 2.0 },
  mochi:   { aw: 1.1,  ah: 0.92, n: 2.4, nb: 3.4 },
  bean:    { aw: 1.12, ah: 0.88, n: 2.3 },
  egg:     { aw: 0.94, ah: 1.06, n: 2.0, pear: -0.18 },
  tall:    { aw: 0.88, ah: 1.12, n: 2.3 },
  pear:    { aw: 1.0,  ah: 1.0,  n: 2.0, pear: 0.3 },
  bun:     { aw: 1.12, ah: 0.86, n: 3.0 },
  onigiri: { aw: 1.06, ah: 1.0,  n: 2.4, pear: 0.45, nb: 3.2 },
  drop:    { aw: 0.98, ah: 1.08, n: 2.0, drop: true },
  blocky:  { aw: 1.0,  ah: 0.96, n: 4.0 },
  heart:   { aw: 1.08, ah: 0.98, n: 2.0, nb: 1.7, notch: true },
};
const BUILDS = {
  round: { dw: 0, dh: 0, n: 2.5, pear: 0.25 }, chubby: { dw: 5, dh: 0, n: 2.2, pear: 0.1 },
  slim: { dw: -3, dh: 1, n: 3.0, pear: 0.1 }, bell: { dw: 3, dh: 0, n: 2.4, pear: 0.55 },
  long: { dw: -2, dh: 3, n: 3.2, pear: 0.15 }, stout: { dw: 6, dh: -3, n: 2.8, pear: 0.05 },
};

function inside(s, u, v) {
  if (s.notch && v < -0.42 && Math.abs(u) < 0.3 * (-0.42 - v) / 0.58) return false;
  let f = 1;
  if (s.pear > 0) f = 1 - s.pear * (1 - (v + 1) / 2);
  if (s.pear < 0) f = 1 + s.pear * ((v + 1) / 2);
  if (s.drop) f = Math.min(1, Math.pow(Math.max(0, (v + 1) / 1.25), 0.7) + 0.1);
  const n = v > 0 && s.nb ? s.nb : s.n;
  return Math.pow(Math.abs(u / f), n) + Math.pow(Math.abs(v), n) <= 1;
}

/** Supersampled, mirrored mask with pixel-perfect outline cleanup. */
function makeMask(w, h, s) {
  const m = new Uint8Array(w * h);
  const SS = 4;
  for (let y = 0; y < h; y++) for (let x = 0; x < Math.ceil(w / 2); x++) {
    let hits = 0;
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) {
      if (inside(s, ((x + (i + 0.5) / SS) - w / 2) / (w / 2), ((y + (j + 0.5) / SS) - h / 2) / (h / 2))) hits++;
    }
    const on = hits * 2 >= SS * SS ? 1 : 0;
    m[y * w + x] = on; m[y * w + (w - 1 - x)] = on;
  }
  return m;
}

const zig = (x) => Math.abs((((x % 1) + 1) % 1) - 0.5) * 2;
function hairAt(hair, u, v) {
  switch (hair) {
    case 'bangs': case 'ponytail': case 'twintails':
      // locks that come to a point, one centred on the face
      return v < -0.42 + 0.24 * (1 - zig(u / 0.4 + 0.5));
    case 'bob': {
      // Lumipom's blunt bob: a straight fringe with two little notches, and side locks
      const notch = Math.abs(Math.abs(u) - 0.3) < 0.07 ? 0.1 : 0;
      return v < -0.26 - notch || (Math.abs(u) > 0.64 && v < 0.5);
    }
    case 'spiky': return v < -0.48 + 0.2 * zig(u * 2.4 + 0.5);
    case 'curly': return v < -0.44 + 0.1 * Math.cos(u * 14);
    default: return false;
  }
}
function headPattern(pattern, u, v, y) {
  switch (pattern) {
    case 'socks': return (u / 0.62) ** 2 + ((v - 0.62) / 0.42) ** 2 <= 1;
    case 'tips': return v < -0.38 + 0.12 * Math.cos(u * 9);
    case 'mask': return v > -0.22 && v < 0.12 && Math.abs(u) < 0.95;
    case 'twotone': return u < 0;
    case 'stripes': {
      const a = Math.abs(u);
      if (a > 0.5 && [-0.45, -0.1, 0.25].some(c => Math.abs(v - c - (a - 0.5) * 0.3) < 0.1 * (a - 0.35) / 0.65)) return 'dark';
      return v > -0.9 && v < -0.55 && Math.abs(u) < 0.06 ? 'dark' : false;
    }
    case 'spots': return [[-0.6, -0.3, 0.2], [0.5, -0.58, 0.16], [0.66, 0.2, 0.18], [-0.68, 0.32, 0.14]].some(([cx, cy, r]) => (u - cx) ** 2 + (v - cy) ** 2 < r * r);
    default: return false;
  }
}

/**
 * Paint a shape in the founder style. paint(u, v, x, y) may return:
 *   a ramp name (auto shaded), { ramp, shade } or a palette index.
 */
function paintShape(w, h, mask, paint, opts = {}) {
  const px = new Uint8Array(w * h);
  const m = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x] === 1;
  const ink = C('ink');
  // light cluster: a rounded patch on the upper left, and a shine pixel in it
  const lcx = w * 0.32, lcy = h * 0.3, lrx = Math.max(2, w * 0.2), lry = Math.max(1.5, h * 0.16);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!m(x, y)) continue;
    const u = ((x + 0.5) - w / 2) / (w / 2), v = ((y + 0.5) - h / 2) / (h / 2);
    const r = paint(u, v, x, y, m);
    const edge = !m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1) || !m(x, y + 1);
    if (edge) {
      const lit = !m(x, y - 1) || !m(x - 1, y);
      const rr = typeof r === 'object' ? r.ramp : typeof r === 'string' ? r : null;
      // lit outline in the darkest shade of the part's own colour, ink on the shadow side
      px[y * w + x] = lit && rr && v < 0.45 ? ramp(rr, 0) : ink;
      continue;
    }
    if (typeof r === 'number') { px[y * w + x] = r; continue; }
    if (typeof r === 'object') { px[y * w + x] = ramp(r.ramp, r.shade); continue; }
    let shade = 2;
    const nearRight = !m(x + 2, y) || !m(x + 1, y + 1);
    const nearBottom = !m(x, y + 2);
    if ((nearRight && u > -0.1) || (nearBottom && v > 0.2)) shade = 1;
    if (opts.shadeTop && y < opts.shadeTop) shade = 1;
    if (opts.shine !== false && ((x + 0.5 - lcx) / lrx) ** 2 + ((y + 0.5 - lcy) / lry) ** 2 <= 1) shade = 3;
    px[y * w + x] = ramp(r, shade);
  }
  if (opts.shine !== false && w >= 14) {
    const sx = Math.round(lcx - lrx * 0.35), sy = Math.round(lcy - lry * 0.2);
    if (m(sx, sy) && px[sy * w + sx] !== ink) px[sy * w + sx] = C('white');
  }
  return { w, h, px, m };
}

const cache = new Map();

function headBM(t, stage) {
  const key = ['h', stage, t.shape, t.size, t.pattern, t.color, t.accent, t.hair, t.hairColor].join('|');
  if (cache.has(key)) return cache.get(key);
  const s = SHAPES[t.shape] || SHAPES.round;
  const [hw, hh] = STAGE[stage];
  const d = stage === 'adult' ? SIZE[t.size] || 0 : 0;
  const w = Math.round((hw + d) * s.aw), h = Math.round((hh + d) * s.ah);
  const base = makeMask(w, h, s);
  // hair has volume: it sits a pixel beyond the skull at the top and sides,
  // so the head canvas is padded by P on the left, right and top
  const hasHair = t.hair && t.hair !== 'none';
  const P = hasHair ? 1 : 0;
  const W = w + 2 * P, H = h + P;
  const mask = new Uint8Array(W * H);
  const hm = new Uint8Array(W * H);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!base[y * w + x]) continue;
    mask[(y + P) * W + x + P] = 1;
    if (hairAt(t.hair, ((x + 0.5) - w / 2) / (w / 2), ((y + 0.5) - h / 2) / (h / 2))) hm[(y + P) * W + x + P] = 1;
  }
  if (P) {
    // grow the hair one pixel outward where it covers the skull edge (above the eyes)
    const grow = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (mask[y * W + x] || y > H * 0.5) continue;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => hm[(y + dy) * W + x + dx] && x + dx >= 0 && x + dx < W && y + dy >= 0 && y + dy < H);
      if (nb) grow.push(y * W + x);
    }
    for (const i of grow) { mask[i] = 1; hm[i] = 1; }
  }
  const hair = (x, y) => x >= 0 && y >= 0 && x < W && y < H && hm[y * W + x] === 1;
  const strandX = [Math.round(P + w * 0.34), Math.round(P + w * 0.66 - 1)];
  const b = paintShape(W, H, mask, (u0, v0, x, y, m) => {
    const u = ((x - P + 0.5) - w / 2) / (w / 2), v = ((y - P + 0.5) - h / 2) / (h / 2);
    if (hair(x, y)) {
      // hair outlined in its darkest shade where it meets the face
      if ((m(x, y + 1) && !hair(x, y + 1)) || (m(x - 1, y) && !hair(x - 1, y)) || (m(x + 1, y) && !hair(x + 1, y))) return { ramp: t.hairColor, shade: 0 };
      if (y === P + Math.round(h * 0.12) + 1 && u > -0.6 && u < -0.05) return { ramp: t.hairColor, shade: 3 };   // gloss
      if (strandX.includes(x) && hair(x, y + 2) && v > -0.85 && t.hair !== 'curly') return { ramp: t.hairColor, shade: 1 }; // strands
      return { ramp: t.hairColor, shade: (!m(x + 2, y) || !hair(x, y + 2)) ? 1 : 2 };
    }
    const pat = headPattern(t.pattern, u, v, y);
    if (pat === 'dark') return { ramp: t.accent, shade: 1 };
    return pat ? t.accent : t.color;
  }, { shine: !hasHair || t.hair === 'spiky' });
  // anchors (in padded coordinates)
  let top = 0; while (top < H && !base[Math.max(0, top - P) * w + (w >> 1)]) top++;
  top += P;
  const span = (y) => { let l = -1, r = -1; for (let x = 0; x < W; x++) if (mask[y * W + x]) { if (l < 0) l = x; r = x; } return [l, r]; };
  const spread = { wide: 1.24, close: 0.78 }[t.eyeSet] || 1;
  const eyeY = P + Math.round(h * 0.52) + (t.eyeSet === 'low' ? Math.round(h * 0.08) : 0);
  const out = {
    ...b, top, span,
    eyeY, eyeDX: Math.max(3, Math.round(w * 0.22 * spread)),
    mouthY: eyeY + Math.max(3, Math.round(h * 0.24)),
  };
  cache.set(key, out);
  return out;
}

function bodyBM(t, stage) {
  const key = ['b', stage, t.build, t.belly, t.color, t.accent].join('|');
  if (cache.has(key)) return cache.get(key);
  const [, , tw, th] = STAGE[stage];
  const k = stage === 'adult' ? 1 : 0.6;
  const B = BUILDS[t.build] || BUILDS.round;
  const w = Math.round(tw + B.dw * k), h = Math.round(th + B.dh * k);
  const mask = makeMask(w, h, { n: B.n, pear: B.pear });
  const b = paintShape(w, h, mask, (u, v) => {
    switch (t.belly) {
      case 'patch': if ((u / 0.5) ** 2 + ((v - 0.3) / 0.62) ** 2 <= 1) return t.accent; break;
      case 'suit': return t.accent;
      case 'bib': if (v < 0.1 && Math.abs(u) < 0.66) return t.accent; break;
      case 'heart': { const x = u / 0.55, y = -(v - 0.2) / 0.62; if ((x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0) return t.accent; break; }
    }
    return t.color;
  }, { shadeTop: 2, shine: false });
  const span = (y) => { let l = -1, r = -1; for (let x = 0; x < w; x++) if (mask[y * w + x]) { if (l < 0) l = x; r = x; } return [l, r]; };
  const out = { ...b, span };
  cache.set(key, out);
  return out;
}

/** A sprite-resolution canvas with layered drawing helpers. */
function layer() {
  const px = new Uint8Array(KW * KH);
  const set = (x, y, c) => { if (c && x >= 0 && y >= 0 && x < KW && y < KH) px[y * KW + x] = c; };
  const blit = (b, x0, y0, flip = false) => {
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      const c = b.px[y * b.w + (flip ? b.w - 1 - x : x)];
      if (c) set(x0 + x, y0 + y, c);
    }
  };
  const stamp = (part, ax, ay, ctx, flip = false) => {
    if (!part) return;
    const s = part.spr, t = lut(s, ctx), f = s.frames[0];
    const [px0, py0] = part.pivot;
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
      const c = t[f[j * s.w + i]];
      if (!c) continue;
      const x = flip ? ax + px0 - i : ax - px0 + i;
      set(x, ay - py0 + j, c);
    }
  };
  return { px, set, blit, stamp };
}

/**
 * Compose a kit pet at sprite resolution.
 * Returns { px, w, h, eyes: [[x,y],...], eyeSize, mouth, faceColour, neck, floats }.
 */
export function composeKit(phenotype, stage, pose = {}) {
  const t = stageTraits(phenotype, stage);
  const ctx = colors(t.color, t.accent, t.eyeColor, t.hairColor || 'brown');
  const L = layer();
  const head = headBM(t, stage);
  const hasBody = STAGE[stage][2] > 0;
  const body = hasBody ? bodyBM(t, stage) : null;
  const feet = FEET[t.feet] || null;
  const floats = !feet;
  const footH = feet ? feet.spr.h : 0;
  const lift = floats ? 2 : 0;
  const cx = KW >> 1;

  let by = 0, bx = 0, hy;
  if (body) {
    by = KG - footH - lift - body.h + 2;
    bx = cx - (body.w >> 1);
    hy = by - head.h + 2;
  } else {
    hy = KG - footH - lift - head.h + 2;
  }
  const hx = cx - (head.w >> 1);
  const hcx = hx + (head.w >> 1);
  const odd = head.w % 2;
  const mirrorX = (x) => hx + head.w - 1 - (x - hx); // mirror a head x across the head centre

  // ----- back parts -----
  const back = BACKS[t.back];
  if (back && body) {
    const [l, r] = body.span(Math.min(body.h - 1, 3));
    if (back.pair) { L.stamp(back, bx + l + 1, by + 3, ctx); L.stamp(back, bx + r - 1, by + 3, ctx, true); }
    else if (back.tail) L.stamp(back, bx + r - 1, by + body.h - 2, ctx);
  }
  // fur mane behind the head
  if (t.fluff === 'mane') {
    const R = Math.round(head.w * 0.66);
    const mcx = hcx - (odd ? 0 : 0.5), mcy = hy + head.h / 2;
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const a = Math.atan2(y, x), d = Math.hypot(x, y), lim = R * (0.88 + 0.12 * Math.cos(a * 11));
      if (d <= lim) L.set(Math.round(mcx + x), Math.round(mcy + y), d > lim - 1.2 ? C('ink') : ramp(t.hairColor, x + y > 2 ? 1 : 2));
    }
  }
  // twin tails, ponytail, curly puff
  if (t.hair === 'twintails') {
    const [l] = head.span(Math.round(head.h * 0.3));
    L.stamp(HAIR.twintail, hx + l + 1, hy + Math.round(head.h * 0.28), ctx);
    L.stamp(HAIR.twintail, mirrorX(hx + l + 1), hy + Math.round(head.h * 0.28), ctx, true);
  }
  if (t.hair === 'ponytail') { const [, r] = head.span(Math.round(head.h * 0.25)); L.stamp(HAIR.ponytail, hx + r - 1, hy + Math.round(head.h * 0.22), ctx); }
  if (t.hair === 'curly') L.stamp(HAIR.puff, hcx, hy + head.top + 3, ctx);

  // ----- arms, feet and body -----
  const armPose = pose.arms || 'down';
  const [armL, armR] = armPose === 'wave' ? ['up', 'down'] : [armPose, armPose];
  const drawArm = (which, side) => {
    const [l, r] = body.span(3);
    if (side < 0) L.stamp(ARMS[which], bx + l + 2, by + 3, ctx);
    else L.stamp(ARMS[which], bx + r - 2, by + 3, ctx, true);
  };
  if (body) {
    if (feet) {
      const span = Math.max(3, Math.round(body.w * 0.25));
      const fy = by + body.h - 2;
      L.stamp(feet, cx - span - (odd ? 0 : 1), fy - (pose.step === 1 ? 1 : 0), ctx);
      L.stamp(feet, cx + span, fy - (pose.step === 2 ? 1 : 0), ctx, true);
    }
    if (armL !== 'up') drawArm(armL, -1);
    if (armR !== 'up') drawArm(armR, 1);
    L.blit(body, bx, by);
  } else if (feet) {
    const span = Math.max(3, Math.round(head.w * 0.22));
    L.stamp(feet, cx - span - (odd ? 0 : 1), hy + head.h - 2, ctx);
    L.stamp(feet, cx + span, hy + head.h - 2, ctx, true);
  }

  // ----- head -----
  const ears = EARS[t.ears];
  let frontEars = null;
  if (ears) {
    const ey = ears.side ? hy + Math.round(head.h * 0.32) : hy + Math.round(head.h * 0.1);
    const [l] = head.span(ey - hy);
    const ex = ears.side ? hx + l + 1 : hx + l + Math.round(head.w * 0.12);
    const draw = () => { L.stamp(ears, ex, ey, ctx); L.stamp(ears, mirrorX(ex), ey, ctx, true); };
    if (ears.front) frontEars = draw; else draw();
  }
  if (t.fluff === 'cheeks') {
    const ty = hy + Math.round(head.h * 0.62);
    const [l] = head.span(ty - hy);
    L.stamp(TUFT, hx + l, ty, ctx); L.stamp(TUFT, mirrorX(hx + l), ty, ctx, true);
  }
  if (t.hair === 'spiky') L.stamp(HAIR.spikes, hcx, hy + head.top + 2, ctx);
  const crest = CRESTS[t.crest];
  if (crest && !crest.front) L.stamp(crest, hcx, hy + head.top + 1, ctx);
  L.blit(head, hx, hy);
  if (crest && crest.front) L.stamp(crest, hcx, hy + head.top + 1, ctx);
  frontEars?.();

  // neck shadow on the body under the head
  if (body) for (let x = 0; x < body.w; x++) {
    const i = (by + 2) * KW + bx + x;
    if (body.m(x, 2) && L.px[i] && L.px[i] !== C('ink')) L.px[i] = ramp(t.belly === 'suit' ? t.accent : t.color, 1);
  }
  if (body) { if (armL === 'up') drawArm('up', -1); if (armR === 'up') drawArm('up', 1); }

  // ----- face -----
  const ey = hy + head.eyeY;
  const exL = hcx - head.eyeDX - (odd ? 0 : 1), exR = hcx + head.eyeDX;
  const eye = t.eyes === 'baby' ? BABY_EYES : (EYES[t.eyes] || EYES.bean);
  const cheeks = CHEEKS[t.cheeks];
  if (cheeks && pose.expr !== 'sick') {
    const cy = ey + eye.spr.h - eye.pivot[1];
    L.stamp(cheeks, exL - 2, cy, ctx); L.stamp(cheeks, exR + 2, cy, ctx, true);
  }
  const closed = ['blink', 'sleep', 'chew', 'happy', 'sad', 'sick', 'dizzy'].includes(pose.expr);
  L.stamp(eye, exL, ey, ctx);
  if (pose.expr !== 'wink') L.stamp(eye, exR, ey, ctx, true);
  if (pose.gender === 'f' && stage !== 'baby' && !closed) {
    const topY = ey - eye.pivot[1] - 1;
    L.set(exL - eye.pivot[0] - 0, topY + 1, C('ink'));
    L.set(exR + eye.pivot[0], topY + 1, C('ink'));
  }
  const mark = MARKS[t.mark];
  if (mark) L.stamp(mark, hcx, ey - eye.pivot[1] - 3, ctx);

  let mouthY = hy + head.mouthY;
  const nose = NOSES[t.nose];
  if (t.mouth === 'bill') {
    L.stamp(BILL, hcx, ey + eye.spr.h - eye.pivot[1], ctx); // Ducklet's bill sits right under the eyes
  } else {
    if (nose === 'whiskers') {
      for (const side of [-1, 1]) for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) {
        L.set(hcx + side * (head.eyeDX + 2 + k) - (side < 0 && !odd ? 1 : 0), mouthY - 2 + i * 2 + (i - 1) * (k > 1 ? 1 : 0), C('ink'));
      }
    } else if (nose === NOSES.snout) {
      L.stamp(nose, hcx, mouthY - 3, ctx);
      mouthY += 1;
    } else if (nose) {
      L.stamp(nose, hcx, mouthY - 2, ctx);
    }
    const mouth = MOUTHS[t.mouth] || MOUTHS.smile;
    if (mouth && typeof mouth === 'object') L.stamp(mouth, hcx, mouthY, ctx);
  }

  return {
    px: L.px, w: KW, h: KH,
    eyes: [[exL, ey], [exR, ey]], eyeSize: [eye.spr.w, eye.spr.h], eyePivot: eye.pivot,
    mouth: [hcx, mouthY], mouthOpen: MOUTH_OPEN, mouthChew: MOUTH_CHEW, mouthSad: MOUTH_SAD,
    faceColour: ramp(t.color, 2), neck: by + 2, headTop: hy, floats, bill: t.mouth === 'bill', ctx,
    expr: pose.expr, wink: pose.expr === 'wink',
  };
}

/** A sprite-resolution egg in the founder style; colours hint at the baby. */
export function composeKitEgg(phenotype, crack = 0, wobble = 0) {
  const w = 16, h = 19;
  const L = layer();
  const base = phenotype?.accent || 'cream', spot = phenotype?.color || 'gold';
  const mask = makeMask(w, h, { n: 2, pear: -0.25 });
  const b = paintShape(w, h, mask, (u, v) => {
    const isSpot = [[-0.4, -0.25, 0.22], [0.38, 0.12, 0.24], [-0.12, 0.62, 0.2], [0.22, -0.62, 0.16]].some(([a, bb, r]) => (u - a) ** 2 + (v - bb) ** 2 < r * r);
    return isSpot ? spot : base;
  });
  const x0 = (KW >> 1) - (w >> 1) + wobble, y0 = KG - h + 1;
  L.blit(b, x0, y0);
  const cracks = [[8, 3], [7, 4], [8, 5], [9, 6], [8, 7], [10, 4], [11, 5], [6, 6], [5, 7]];
  for (let i = 0; i < Math.min(cracks.length, crack * 3); i++) L.set(x0 + cracks[i][0], y0 + cracks[i][1], C('ink'));
  return { px: L.px, w: KW, h: KH, egg: true };
}
