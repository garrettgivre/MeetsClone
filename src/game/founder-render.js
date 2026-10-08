// Drawing and animating sprite-resolution pets: the hand-pixelled founders and
// kit-built children share this pipeline. Each sprite pixel becomes a normal
// screen pixel (2x2 at double density). Animation is layered on the frame:
//   breathing   the head (rows above `neck`) bobs down a pixel
//   walking     a one-pixel hop
//   expressions eyes are covered with the face colour and redrawn
//               (blink, happy ^^, wink, sad, sleep, dizzy); mouths open to eat

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
 * Scale and animate a sprite-resolution pet.
 * src: { px, w, h, eyeBoxes: [[x,y,w,h],...], faceColour, mouth: [x,y], neck, floats, keepMouth }
 */
export function animateSprite(src, pose, canvas, ground, scale) {
  const out = makeBitmap(canvas, canvas, true);
  const put = (x, y, c) => {
    for (let j = 0; j < scale; j++) for (let i = 0; i < scale; i++) {
      const X = x * scale + i, Y = y * scale + j;
      if (X >= 0 && Y >= 0 && X < canvas && Y < canvas) out.px[Y * canvas + X] = c;
    }
  };
  let bottom = src.h - 1;
  const rowEmpty = (y) => { for (let x = 0; x < src.w; x++) if (src.px[y * src.w + x]) return false; return true; };
  while (bottom > 0 && rowEmpty(bottom)) bottom--;
  const groundRow = Math.floor(ground / scale);
  const lift = src.floats ? 3 + Math.round(Math.sin((pose.t || 0) / 500)) : 0;
  const hop = pose.step === 1 ? 1 : 0;
  const ox = Math.floor(canvas / scale / 2 - src.w / 2);
  const oy = groundRow - bottom - lift - hop;
  const bob = pose.bob ? 1 : 0;

  // soft shadow (dotted when floating)
  const cx = canvas / 2, gy = ground;
  for (let i = -12; i <= 12; i++) {
    const X = cx + i;
    if (src.floats) { if ((i & 3) === 0) { out.px[gy * canvas + X] = C('silver'); out.px[gy * canvas + X + 1] = C('silver'); } }
    else if (Math.abs(i) < 11) { out.px[gy * canvas + X] = C('mist'); if (Math.abs(i) < 8) out.px[(gy + 1) * canvas + X] = C('mist'); }
  }

  // body first, then the head (with its breathing bob) on top
  const drawRows = (from, to, dy) => {
    for (let y = from; y < to; y++) for (let x = 0; x < src.w; x++) {
      const c = src.px[y * src.w + x];
      if (c) put(ox + x, oy + y + dy, c);
    }
  };
  drawRows(src.neck, src.h, 0);
  drawRows(0, src.neck, bob);

  const ink = C('ink');
  const at = (x, y, c) => put(ox + x, oy + y + bob, c);
  const expr = pose.expr || 'idle';
  const skin = src.faceColour;

  // ----- eyes -----
  const cover = ([x0, y0, w, h]) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) at(x0 + x, y0 + y, skin); };
  const closedEye = (box, shape) => {
    cover(box);
    const [x0, y0, w, h] = box;
    const mid = y0 + Math.floor(h / 2);
    const lw = Math.max(3, w);
    const xs = x0 + Math.floor((w - lw) / 2);
    for (let x = 0; x < lw; x++) {
      const end = x === 0 || x === lw - 1;
      let y = mid;
      if (shape === 'happy') y = end ? mid + 1 : mid;
      if (shape === 'closed') y = end ? mid - 1 : mid;
      if (shape === 'sad') y = end ? mid + (x === 0 ? 0 : 1) : mid;
      at(xs + x, y, ink);
    }
  };
  const dizzyEye = (box) => {
    cover(box);
    const [x0, y0, w, h] = box, ex = x0 + (w >> 1), ey = y0 + (h >> 1);
    for (let i = -1; i <= 1; i++) { at(ex + i, ey + i, ink); at(ex + i, ey - i, ink); }
  };
  const shape = { blink: 'closed', sleep: 'closed', chew: 'closed', happy: 'happy', sad: 'sad', sick: 'sad' }[expr];
  src.eyeBoxes.forEach((box, i) => {
    if (expr === 'dizzy') return dizzyEye(box);
    if (expr === 'wink' && i === 1) return closedEye(box, 'happy');
    if (shape) closedEye(box, shape);
  });

  // ----- mouth -----
  if (!src.keepMouth) {
    const [mx, my] = src.mouth;
    if (expr === 'eat' || expr === 'happy' || expr === 'wink') {
      for (let x = -1; x <= 1; x++) at(mx + x, my, ink);
      at(mx - 1, my + 1, ink); at(mx, my + 1, C('red.1')); at(mx + 1, my + 1, ink);
      at(mx, my + 2, ink);
    } else if (expr === 'chew') {
      for (let x = -1; x <= 1; x++) at(mx + x, my, ink);
    }
  }
  return { out, at, ox, oy, bob };
}

/** Compose a hand-pixelled founder (with hats, glasses and ties when worn). */
export function composeFounder(species, pose, canvas, ground, scale) {
  const art = FOUNDER_ART[species];
  const spr = art.spr, t = lut(spr), f = spr.frames[0];
  const px = new Uint8Array(spr.w * spr.h);
  for (let i = 0; i < f.length; i++) px[i] = t[f[i]];
  const [ew, eh] = art.eyeSize;
  const src = {
    px, w: spr.w, h: spr.h, neck: art.neck, floats: art.floats, mouth: art.mouth,
    faceColour: t[art.face.charCodeAt(0)], keepMouth: species === 'Ducklet',
    eyeBoxes: art.eyes.map(([x, y]) => [x - Math.floor(ew / 2), y - Math.floor(eh / 2), ew, eh]),
  };
  const { out, at, ox, oy } = animateSprite(src, pose, canvas, ground, scale);

  // clothes: hats, glasses, ties (other outfits don't fit hand-drawn bodies yet)
  const wear = pose.wear || {};
  const fit = FIT[species];
  const itemCtx = (id) => colors('cream', CLOTHES[id]?.color || 'pink', 'ink', 'brown');
  const stampPart = (part, ax, ay, ctx, flip = false) => {
    const s = part.spr, lt = lut(s, ctx), fr = s.frames[0];
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
      const c = lt[fr[j * s.w + i]];
      if (!c) continue;
      const x = flip ? ax + (s.w - 1 - part.pivot[0]) - i : ax - part.pivot[0] + i;
      at(x, ay - part.pivot[1] + j, c);
    }
  };
  if (fit && wear.head && CRESTS[wear.head]) stampPart(CRESTS[wear.head], fit.top[0], fit.top[1], itemCtx(wear.head));
  if (fit && wear.face && FACE[wear.face]?.lens) {
    art.eyes.forEach(([ex, ey], i) => stampPart(FACE[wear.face].lens, ex, ey, itemCtx(wear.face), i === 1));
  }
  if (fit && (wear.body === 'bowtie' || wear.body === 'tie')) {
    const part = wear.body === 'bowtie' ? BOWTIE : TIE;
    const s = part.spr, lt = lut(s, itemCtx(wear.body)), fr = s.frames[0];
    const scaleBox = canvas / (canvas / scale); // = scale
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
      const c = lt[fr[j * s.w + i]];
      if (!c) continue;
      const X = ox + fit.neck[0] - part.pivot[0] + i, Y = oy + fit.neck[1] - part.pivot[1] + j;
      for (let b = 0; b < scaleBox; b++) for (let a = 0; a < scaleBox; a++) {
        const xx = X * scaleBox + a, yy = Y * scaleBox + b;
        if (xx >= 0 && yy >= 0 && xx < canvas && yy < canvas) out.px[yy * canvas + xx] = c;
      }
    }
  }
  return out;
}

/** Wrap a kit-built pet (from render-kit.js) for scaling and animation. */
export function composeKitSprite(kit, pose, canvas, ground, scale) {
  if (kit.egg) {
    return animateSprite({ ...kit, eyeBoxes: [], neck: 0, mouth: [0, 0], keepMouth: true, faceColour: 0 }, {}, canvas, ground, scale).out;
  }
  const [ew, eh] = kit.eyeSize, [pxv, pyv] = kit.eyePivot;
  const src = {
    ...kit, keepMouth: kit.bill,
    eyeBoxes: [[kit.eyes[0][0] - pxv, kit.eyes[0][1] - pyv, ew, eh], [kit.eyes[1][0] - (ew - 1 - pxv), kit.eyes[1][1] - pyv, ew, eh]],
  };
  return animateSprite(src, pose, canvas, ground, scale).out;
}
