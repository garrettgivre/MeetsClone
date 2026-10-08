// Pet renderer: assembles a pet from its form's hand-pixelled parts.
//
// Every part is drawn for every form (src/art/pets/forms/), so a pet is just
// its form's body with the head on the neck socket and each other part on
// its socket. Patterns recolour inside the drawn shading, outlines between
// connected parts of the same colour become soft creases, and the face goes
// on last. The result is handed to sprite-pet.js for scaling and animation.

import { C, ramp } from '../engine/palette.js';
import { colors, lut } from '../engine/sprite.js';
import { FORMS, EYES, MOUTHS, MARKS, NOSES, BABY_EYES, BABY_MOUTH, FACE_LAYOUT, PATTERNS, EGG } from '../art/pets/index.js';

export const PW = 64, PH = 64; // output sprite canvas (the feet sit 3 rows above the bottom)
const TW = 128, TH = 128, OX = 64, OY = 76; // working canvas; the body's neck socket lands on (OX, OY)

// Which part drew each pixel, so joins between connected parts can be cleaned up
const PART = { head: 1, body: 2, ears: 3, tail: 4, arms: 5, feet: 6, hair: 8, topper: 9, wings: 10, face: 11 };
// parts that grow out of each other: where they meet in the same colour, the outline between them goes
const JOINS = ['1-3', '1-8', '1-9', '2-4', '2-5', '2-6', '2-10'];
const joinSet = (extra) => new Set([...JOINS, ...extra].flatMap(k => [k, k.split('-').reverse().join('-')]));

function canvas() {
  const px = new Uint8Array(TW * TH), ids = new Uint8Array(TW * TH);
  let cur = 0;
  const set = (x, y, c) => { if (c && x >= 0 && y >= 0 && x < TW && y < TH) { px[y * TW + x] = c; ids[y * TW + x] = cur; } };
  /** Draw a part with its pivot on (ax, ay). remap(charCode, i, j) can swap colours per pixel. */
  const stamp = (p, ax, ay, ctx, flip = false, remap = null) => {
    if (!p) return;
    const s = p.spr, t = lut(s, ctx), f = s.frames[0];
    const [p0x, p0y] = p.pivot;
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
      let code = f[j * s.w + i];
      if (!code) continue;
      if (remap) code = remap(code, i, j);
      const c = t[code];
      if (!c) continue;
      set(flip ? ax + p0x - i : ax - p0x + i, ay - p0y + j, c);
    }
  };
  return { px, ids, set, stamp, part: (name) => { cur = PART[name]; } };
}

/** Where a part's sockets land once its pivot is placed on (ax, ay). */
function placed(p, ax, ay, flip = false) {
  const [p0x, p0y] = p.pivot;
  return (name) => (p.sockets[name] || []).map(([x, y]) => [flip ? ax + p0x - x : ax - p0x + x, ay - p0y + y]);
}

// recolour body-ramp pixels for a pattern, keeping their shade
const C2 = '2'.charCodeAt(0), C3 = '3'.charCodeAt(0), C4 = '4'.charCodeAt(0);
const ACCENT = { [C2]: '6'.charCodeAt(0), [C3]: '7'.charCodeAt(0), [C4]: '8'.charCodeAt(0) };
const BRIGHT = { [C2]: '7'.charCodeAt(0), [C3]: '8'.charCodeAt(0), [C4]: '8'.charCodeAt(0) };
function patternRemap(pattern, region, p, info) {
  const fn = PATTERNS[pattern];
  if (!fn) return null;
  return (code, i, j) => {
    if (code !== C2 && code !== C3 && code !== C4) return code;
    const r = fn(region, ((i + 0.5) / p.w) * 2 - 1, ((j + 0.5) / p.h) * 2 - 1, { ...info, w: p.w, h: p.h, zone: p.zones?.[j]?.[i] });
    return r === 'accent' ? ACCENT[code] : r === 'bright' ? BRIGHT[code] : code;
  };
}

/**
 * Erase the outline where two connected parts of the same colour meet (an ear
 * growing out of the head, a tail out of the body), leaving a soft crease in
 * the darker shade, the way a pixel artist joins shapes by hand. Silhouette
 * edges, chins, faces and accent-coloured parts keep their lines.
 */
function joinSeams(L, ramps, joins, melt = new Set()) {
  const ink = C('ink');
  const info = new Map();
  for (const r of ramps) for (let k = 0; k < 4; k++) if (!info.has(ramp(r, k))) info.set(ramp(r, k), [r, k]);
  const isLine = (c) => c === ink || info.get(c)?.[1] === 0;
  const out = L.px.slice();
  for (let y = 1; y < TH - 1; y++) for (let x = 1; x < TW - 1; x++) {
    const i = y * TW + x, c = L.px[i];
    if (!c || !isLine(c)) continue;
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const a = i - dy * TW - dx, b = i + dy * TW + dx;
      const ia = info.get(L.px[a]), ib = info.get(L.px[b]);
      if (!ia || !ib || ia[1] === 0 || ib[1] === 0 || ia[0] !== ib[0]) continue;
      const pa = L.ids[a], pb = L.ids[b];
      if (pa === pb || !joins.has(pa + '-' + pb) || (L.ids[i] !== pa && L.ids[i] !== pb)) continue;
      // a crease where parts join; where a one-piece form melts together, no line at all
      out[i] = ramp(ia[0], melt.has(pa + '-' + pb) ? Math.min(ia[1], ib[1]) : Math.max(1, Math.min(ia[1], ib[1]) - 1));
      break;
    }
  }
  L.px.set(out);
}

/**
 * Crop the working canvas to the output size: centred, feet near the bottom.
 * The ground is the lowest pixel of the body and feet; a tail or wing that
 * dangles lower doesn't lift the pet off the floor. A floater has no floor, so
 * all of it counts (its tendrils must stay on the canvas).
 */
function crop(L, floats = false) {
  let x0 = TW, y0 = TH, x1 = -1, y1 = -1, ground = -1;
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    const i = y * TW + x;
    if (!L.px[i]) continue;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    if (floats || (L.ids[i] !== PART.tail && L.ids[i] !== PART.wings)) ground = Math.max(ground, y);
  }
  if (ground < 0) ground = y1;
  const dx = Math.floor((PW - (x1 - x0 + 1)) / 2) - x0, dy = PH - 3 - ground;
  const px = new Uint8Array(PW * PH);
  const seen = {}; // visible pixels per part, so tests can check nothing is hidden or cut off
  const names = Object.fromEntries(Object.entries(PART).map(([k, v]) => [v, k]));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * TW + x, c = L.px[i], X = x + dx, Y = y + dy;
    if (c && X >= 0 && Y >= 0 && X < PW && Y < PH) { px[Y * PW + X] = c; const n = names[L.ids[i]]; if (n) seen[n] = (seen[n] || 0) + 1; }
  }
  return { px, dx, dy, seen, overflow: x1 - x0 + 1 > PW || ground - y0 + 4 > PH };
}

/** Draw the eyes, cheeks, mark, nose and mouth around a face socket. */
function drawFace(L, p, stage, pose, ctx, [fx, fy], size, on = {}) {
  // layout: house defaults, then the form's, then the part's own (a small head can set a closer eye spread)
  const lay = { ...FACE_LAYOUT[size], ...(FORMS[p.form]?.faceLayout || {}) };
  const simple = stage === 'baby';
  const eye = simple ? BABY_EYES : (EYES[p.eyes] || EYES.bead)[size];
  const spread = on.spread || (simple ? 3 : lay.spread);
  const exL = fx - spread, exR = fx + spread;
  const skinAt = (x, y) => { const c = L.px[y * TW + x]; return c && c !== C('ink') && c !== C('white') ? c : null; };
  // the skin on the inner side of each eye, to paint over closed eyes (a mask or patch keeps its colour)
  const eyeSkin = [skinAt(exL + eye.w - eye.pivot[0], fy), skinAt(exR - (eye.w - eye.pivot[0]), fy)].map(c => c || ramp(p.color, 2));
  L.part('face');
  // cheeks: a soft blush under the outer corner of each eye
  if (pose.expr !== 'sick') {
    const by = fy + eye.h - eye.pivot[1];
    for (const x of [exL - 2, exL - 1, exR + 1, exR + 2]) if (skinAt(x, by)) L.set(x, by, C('pink.2'));
  }
  const before = L.px.slice(); // to count eye pixels that miss the head
  L.stamp(eye, exL, fy, ctx);
  // the right eye keeps its glint on the lit (left) side unless the eye is meant to mirror
  if (eye.mirror) L.stamp(eye, exR, fy, ctx, true);
  else L.stamp(eye, exR + 2 * eye.pivot[0] - eye.w + 1, fy, ctx);
  // eye pixels on empty space or over the head's outline mean the eyes don't fit the head
  const edge = new Set([0, C('ink'), ramp(p.color, 0)]);
  const off = [];
  for (let i = 0; i < before.length; i++) if (L.px[i] !== before[i] && edge.has(before[i])) off.push(i);
  if (pose.gender === 'f' && !simple) {
    // a single lash at the outer top of each eye
    L.set(exL - eye.pivot[0] - 1, fy - eye.pivot[1], C('ink'));
    L.set(exR + eye.pivot[0] + 1, fy - eye.pivot[1], C('ink'));
  }
  const withEyes = L.px.slice();
  if (!simple && p.nose && p.nose !== 'none') L.stamp(NOSES[p.nose]?.[size], fx, fy + lay.nose, ctx);
  const mouth = simple ? BABY_MOUTH : (MOUTHS[p.mouth] || MOUTHS.o)[size];
  const my = fy + (mouth.bill ? 1 : simple ? 2 : lay.mouth);
  L.stamp(mouth, fx, my, ctx);
  // nose and mouth pixels that cover an eye or miss the head
  for (let i = 0; i < before.length; i++) if (L.px[i] !== withEyes[i] && (withEyes[i] !== before[i] || edge.has(before[i]))) off.push(i);
  return { off, eyes: [[exL, fy], [exR, fy]], eye, mouth: [fx, my + (mouth.bill ? mouth.h - 1 : 0)], bill: !!mouth.bill, eyeSkin };
}

/**
 * Compose a pet at sprite resolution.
 * Returns { px, w, h, eyes, eyeSize, eyePivot, eyeSkin, mouth, faceColour, neck, floats, bill, ctx }.
 */
export function composePetArt(p, stage, pose = {}) {
  const F = FORMS[p.form] || FORMS.blob;
  const ctx = colors(p.color, p.accent, p.eyeColor, p.hairColor || p.color);
  const L = canvas();
  let face, neckY = OY;

  if (stage === 'baby' || stage === 'child') {
    // early stages are simple shapes in the form's spirit, with a face
    const shape = F[stage];
    L.part('body');
    const ax = OX, ay = OY;
    const at = placed(shape, ax, ay);
    // children already show their ears, drawn small (the serpent's ears are the small set)
    const ears = stage === 'child' && FORMS.serpent.ears[p.ears];
    const drawEars = () => {
      const [l] = at('earL'), [r] = at('earR');
      L.part('ears');
      if (l) L.stamp(ears, l[0], l[1], ctx);
      if (r) L.stamp(ears, r[0], r[1], ctx, true);
      L.part('body');
    };
    if (ears && !ears.front) drawEars();
    L.stamp(shape, ax, ay, ctx, false, stage === 'child' ? patternRemap(p.pattern, 'body', shape, { form: p.form, fu: 0, fv: 0 }) : null);
    if (ears && ears.front) drawEars();
    face = drawFace(L, p, stage, pose, ctx, at('faceS')[0], 'S', shape);
    neckY = at('faceS')[0][1] + 4;
  } else {
    const adult = stage === 'adult';
    const body = F.body[p.body] || Object.values(F.body)[0];
    const head = F.head[p.head] || Object.values(F.head)[0];
    const [bnx, bny] = body.sockets.neck[0];
    const [hnx, hny] = head.sockets.neck[0];
    // the head's neck socket lands on the body's
    const bx0 = OX - bnx, by0 = OY - bny, hx0 = OX - hnx, hy0 = OY - hny;
    const B = (name) => (body.sockets[name] || []).map(([x, y]) => [bx0 + x, by0 + y]);
    const Hs = (name) => (head.sockets[name] || []).map(([x, y]) => [hx0 + x, hy0 + y]);
    const faceSock = Hs('faceL')[0] ? ['L', Hs('faceL')[0]] : ['S', Hs('faceS')[0]];
    const [fx, fy] = faceSock[1];
    const headInfo = { form: p.form, fu: ((fx - hx0 + 0.5) / head.w) * 2 - 1, fv: ((fy - hy0 + 0.5) / head.h) * 2 - 1 };

    const has = (gene) => p[gene] && p[gene] !== 'none';
    const showWings = adult && has('wings');
    const armPose = pose.arms || 'down';
    const [armL, armR] = armPose === 'wave' ? ['up', 'down'] : [armPose, armPose];
    const arm = (k) => F.arms?.[k] || F.arms?.down;
    const drawArms = (which) => {
      if (!F.arms || (F.armsUnlessWings && showWings)) return;
      L.part('arms');
      const [l] = B('armL'), [r] = B('armR');
      if (l && which(armL)) L.stamp(arm(armL), l[0], l[1], ctx);
      if (r && which(armR)) L.stamp(arm(armR), r[0], r[1], ctx, true);
    };
    const ears = F.ears[p.ears];
    const drawEars = () => {
      if (!ears) return;
      L.part('ears');
      const [l] = Hs('earL'), [r] = Hs('earR');
      if (l) L.stamp(ears, l[0], l[1], ctx);
      if (r) L.stamp(ears, r[0], r[1], ctx, true);
    };
    const steps = {
      wings: () => {
        if (!showWings) return;
        const w = F.wings[p.wings]; L.part('wings');
        const [l] = B('wingL'), [r] = B('wingR');
        if (l) L.stamp(w, l[0], l[1], ctx);
        if (r) L.stamp(w, r[0], r[1], ctx, true);
      },
      tail: () => { if (has('tail')) { L.part('tail'); const [t] = B('tail'); if (t) L.stamp(F.tail[p.tail], t[0], t[1], ctx); } },
      body: () => { L.part('body'); L.stamp(body, bx0 + body.pivot[0], by0 + body.pivot[1], ctx, false, patternRemap(p.pattern, 'body', body, { form: p.form, fu: 0, fv: 0 })); },
      feet: () => {
        const foot = has('feet') ? F.feet[p.feet] : F.plainFeet && Object.values(F.plainFeet)[0];
        if (!foot) return;
        L.part('feet');
        const lift = (i) => (pose.step === 1 && i % 2 === 0) || (pose.step === 2 && i % 2 === 1) ? 1 : 0;
        B('footL').forEach(([x, y], i) => L.stamp(foot, x, y - lift(i), ctx));
        B('footR').forEach(([x, y], i) => L.stamp(foot, x, y - lift(i + 1), ctx, true));
      },
      arms: () => drawArms((k) => k !== 'up'),
      ears: () => { if (!ears?.front) drawEars(); },
      head: () => {
        L.part('head');
        L.stamp(head, hx0 + head.pivot[0], hy0 + head.pivot[1], ctx, false, patternRemap(p.pattern, 'head', head, headInfo));
        // the forehead mark goes on with the head, so hair and toppers can sit over it
        const lay = { ...FACE_LAYOUT[faceSock[0]], ...(F.faceLayout || {}) };
        const mark = MARKS[p.mark]?.[lay.markSize || faceSock[0]];
        if (mark) { L.part('face'); L.stamp(mark, fx, fy + lay.mark, ctx); L.part('head'); }
        if (ears?.front) drawEars();
      },
      hair: () => { if (has('hair')) { L.part('hair'); const [t] = Hs('top'); if (t) L.stamp(F.hair[p.hair], t[0], t[1], ctx); } },
      topper: () => { if (adult && has('topper')) { L.part('topper'); const [t] = Hs('top'); if (t) L.stamp(F.topper[p.topper], t[0], t[1], ctx); } },
    };
    for (const step of F.order) steps[step]?.();
    drawArms((k) => k === 'up'); // raised arms go in front of the head
    joinSeams(L, [p.color, p.hairColor || p.color], joinSet(F.merge ? ['1-2'] : []), F.merge ? new Set(['1-2', '2-1']) : undefined);
    face = drawFace(L, p, stage, pose, ctx, [fx, fy], faceSock[0], head);
  }

  const { px, dx, dy, seen, overflow } = crop(L, !!F.floats);
  const sh = ([x, y]) => [x + dx, y + dy];
  return {
    px, w: PW, h: PH, overflow, seen,
    offFace: face.off.length, offFacePx: face.off.map(i => [(i % TW) + dx, Math.floor(i / TW) + dy]),
    eyes: face.eyes.map(sh), eyeSize: [face.eye.w, face.eye.h], eyePivot: face.eye.pivot, eyeSkin: face.eyeSkin,
    mouth: sh(face.mouth), faceColour: ramp(p.color, 2), neck: neckY + dy,
    floats: !!F.floats,
    bill: face.bill, ctx, expr: pose.expr,
  };
}

/** The egg: colours hint at the baby inside. */
export function composeEggArt(p, crack = 0, wobble = 0) {
  const L = canvas();
  const ctx = colors(p?.color || 'gold', p?.accent || 'cream', 'ink', 'brown');
  L.stamp(EGG, OX + wobble, OY, ctx);
  const x0 = OX + wobble - EGG.pivot[0], y0 = OY - EGG.pivot[1];
  const cracks = [[8, 3], [7, 4], [8, 5], [9, 6], [8, 7], [10, 4], [11, 5], [6, 6], [5, 7]];
  for (let i = 0; i < Math.min(cracks.length, crack * 3); i++) L.set(x0 + cracks[i][0], y0 + cracks[i][1], C('ink'));
  const { px } = crop(L);
  return { px, w: PW, h: PH, egg: true };
}
