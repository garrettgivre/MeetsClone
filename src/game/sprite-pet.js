// Placing and animating a composed pet. A pet from pet-art.js is at the fine size already (scale 1, `fine`);
// the egg is a 64-pixel sprite whose pixels are doubled. Animation is layered on the frame:
//   breathing   the head (rows above `neck`) bobs down a pixel
//   walking     a one-pixel hop
//   expressions eyes are covered with the face colour and redrawn
//               (blink, happy ^^, wink, sad, sleep, dizzy); mouths open to eat

import { C } from '../engine/palette.js';
import { makeBitmap } from '../engine/screen.js';

/**
 * Scale and animate a sprite-resolution pet.
 * src: { px, w, h, eyeBoxes: [[x,y,w,h,skin?],...], faceColour, mouth: [x,y], neck, floats, keepMouth }
 * (an eye box may carry its own skin colour, for a patch or mask around that eye)
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
  const U = src.fine ? 2 : 1; // how many of this sprite's pixels make one old pet pixel: motions and strokes keep their size
  // (a floater hangs above the ground, as far as its height leaves room for)
  const lift = src.floats ? Math.max(0, Math.min((3 + Math.round(Math.sin((pose.t || 0) / 500))) * U, groundRow - bottom)) : 0;
  const hop = pose.step === 1 ? U : 0;
  const ox = Math.floor(canvas / scale / 2 - src.w / 2);
  const oy = groundRow - bottom - lift - hop;
  const bob = pose.bob ? U : 0;

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
  const dot = (x, y, c) => { for (let j = 0; j < U; j++) for (let i = 0; i < U; i++) at(x + i, y + j, c); }; // one stroke pixel
  const expr = pose.expr || 'idle';
  const skin = src.faceColour;

  // ----- eyes -----
  const cover = ([x0, y0, w, h, c = skin]) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) at(x0 + x, y0 + y, c); };
  const closedEye = (box, shape) => {
    cover(box);
    const [x0, y0, w, h] = box;
    const mid = y0 + Math.floor(h / 2) - (U >> 1);
    const n = Math.max(3, Math.round(w / U)); // the line, in strokes
    const xs = x0 + Math.floor((w - n * U) / 2);
    for (let i = 0; i < n; i++) {
      const end = i === 0 || i === n - 1;
      let dy = 0;
      if (shape === 'happy') dy = end ? 1 : 0;
      if (shape === 'closed') dy = end ? -1 : 0;
      if (shape === 'sad') dy = end ? (i === 0 ? 0 : 1) : 0;
      dot(xs + i * U, mid + dy * U, ink);
    }
  };
  const dizzyEye = (box) => {
    cover(box);
    const [x0, y0, w, h] = box, ex = x0 + (w >> 1) - (U >> 1), ey = y0 + (h >> 1) - (U >> 1);
    for (let i = -1; i <= 1; i++) { dot(ex + i * U, ey + i * U, ink); dot(ex + i * U, ey - i * U, ink); }
  };
  const shape = { blink: 'closed', sleep: 'closed', chew: 'closed', happy: 'happy', sad: 'sad', sick: 'sad' }[expr];
  src.eyeBoxes.forEach((box, i) => {
    if (expr === 'dizzy') return dizzyEye(box);
    if (expr === 'wink' && i === 1) return closedEye(box, 'happy');
    if (shape) closedEye(box, shape);
  });

  // ----- mouth -----
  if (!src.keepMouth) {
    const [mx, my] = src.mouth, m = (dx, dy, c) => dot(mx - (U >> 1) + dx * U, my + dy * U, c);
    const clear = () => { if (src.fine) for (let y = 0; y < 3 * U; y++) for (let x = -2 * U; x <= 2 * U; x++) at(mx + x, my + y, skin); }; // paint out the drawn mouth
    if (expr === 'eat' || expr === 'happy' || expr === 'wink') {
      clear();
      for (let x = -1; x <= 1; x++) m(x, 0, ink);
      m(-1, 1, ink); m(0, 1, C('red.1')); m(1, 1, ink);
      m(0, 2, ink);
    } else if (expr === 'chew') {
      clear();
      for (let x = -1; x <= 1; x++) m(x, 0, ink);
    }
  }
  return { out, at, ox, oy, bob };
}

/** Wrap what pet-art.js built for placing and animation. */
export function composeKitSprite(kit, pose, canvas, ground, scale) {
  if (kit.fine) return animateSprite({ ...kit, keepMouth: kit.bill }, pose, canvas, ground, 1).out;
  if (kit.egg) {
    return animateSprite({ ...kit, eyeBoxes: [], neck: 0, mouth: [0, 0], keepMouth: true, faceColour: 0 }, {}, canvas, ground, scale).out;
  }
  const [ew, eh] = kit.eyeSize, [pxv, pyv] = kit.eyePivot;
  const src = {
    ...kit, keepMouth: kit.bill,
    // (eyes behind dark glasses aren't redrawn for a blink or a mood)
    eyeBoxes: kit.eyesHidden ? [] : [[kit.eyes[0][0] - pxv, kit.eyes[0][1] - pyv, ew, eh, kit.eyeSkin?.[0]], [kit.eyes[1][0] - (ew - 1 - pxv), kit.eyes[1][1] - pyv, ew, eh, kit.eyeSkin?.[1]]],
  };
  return animateSprite(src, pose, canvas, ground, scale).out;
}
