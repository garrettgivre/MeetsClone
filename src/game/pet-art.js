// Pet renderer: puts a pet together from the fine-line parts in src/art/pets/fine/.
//
// A pet is drawn at the fine pixel size (one art cell = one pixel of a room).
// What is shared and what is per body plan: a head, ears, tail, feet, wings,
// topper, hair and the face parts are one drawing each and go on any body plan.
// A body is drawn once per body plan (BODY for its founder's own plan, BODIES
// for the rest): seven styles in seven plans. Arms belong to the two-legged plan. Babies and children are a
// plain head and a small body in one piece (young.js).
//
// The head's neck socket lands on the body's; everything else hangs on its
// socket. Things laid over a head or body (markings, icing hair, spots) are kept
// by where they sit from the face, the crown or the neck and only show on the
// part they lie on, inside its outline, so they go on any head or body. The
// result is handed to sprite-pet.js for placing and animation.
//
// Parts move by being set down a little off their socket (the drawings are not changed):
//   pose.wag    the tail lifts            pose.flap   the wings lift           pose.ear    the ears twitch up
//   pose.arms   'up', 'wave' (one arm up) or 'out'                             pose.step   1 or 2: alternate feet lift

import { C, ramp } from '../engine/palette.js';
import { colors, lut } from '../engine/sprite.js';
import { EGG } from '../art/pets/egg.js';
import { HATS, FACE as FACE_WEAR } from '../art/pets/clothes.js';
import { CLOTHES } from './items.js';
import * as axolotl from '../art/pets/fine/axolotl.js';
import * as caterpillar from '../art/pets/fine/caterpillar.js';
import * as jellyfish from '../art/pets/fine/jellyfish.js';
import * as fox from '../art/pets/fine/fox.js';
import * as owl from '../art/pets/fine/owl.js';
import * as jelly from '../art/pets/fine/jelly.js';
import * as young from '../art/pets/fine/young.js';
import * as dragon from '../art/pets/fine/dragon.js';

export const LINES = { axolotl, caterpillar, jellyfish, fox, owl, jelly, dragon };
// Designs that are drawn and can be put together, but are not in the gene pool yet (the review page shows them). None just now.
export const DESIGNS = {};
export const FORMS = ['quad', 'serpent', 'floater', 'biped', 'avian', 'blob', 'drake'];
export const FW = 128, FH = 128; // the most room a pet may take, in fine pixels (the feet sit 6 above the bottom)

// The fine look uses a ramp's lightest shade as the body colour. For these ramps that shade is too
// pale to read as the colour (orange turns peach, slate and cream turn white), so the body is drawn a shade deeper.
export const DEEPER = new Set(['orange', 'slate', 'cream', 'red', 'brown', 'indigo']);

const SOCKETS = { '^': 'top', '[': 'earL', ']': 'earR', '{': 'sideL', '}': 'sideR', '@': 'face', '=': 'neck', '~': 'tail', '!': 'feet', '(': 'wingL', ')': 'wingR', '<': 'armL', '>': 'armR' };
const FIXED = { o: 'ink', w: 'white', l: 'green.2', L: 'green.1', j: 'green.0', P: 'pink.3', f: 'pink.2', q: 'red.2', r: 'red.1', Y: 'gold.3', y: 'gold.1', g: 'gray', v: 'silver', m: 'mist', b: 'sky.2', B: 'sky.3' };

// read a part: note its sockets (painted as body colour unless the part says otherwise)
function read(p) {
  if (!p) return null;
  const sockets = {};
  const rows = p.rows.map((r, y) => [...r].map((ch, x) => {
    if (!SOCKETS[ch]) return ch;
    (sockets[SOCKETS[ch]] ||= []).push([x, y]);
    return p.under?.[ch] || '4';
  }));
  return { ...p, rows, sockets, pivot: p.pivot || [0, 0] };
}

// ---------- the table of parts, by gene and allele ----------
const SLOT = { head: 'HEAD', ears: 'EARS', tail: 'TAIL', feet: 'FEET', wings: 'WINGS', topper: 'TOPPER', hair: 'HAIR', eyes: 'EYE', mouth: 'MOUTH', nose: 'NOSE', mark: 'MARK' };
export const PARTS = { body: {}, pattern: {}, face: {}, cheek: {}, arms: {} };
for (const L of [...Object.values(LINES), ...Object.values(DESIGNS)]) {
  const head = read(L.HEAD), body = read(L.BODY);
  const face = head.sockets.face[0], top = head.sockets.top[0], neck = body.sockets.neck[0];
  for (const [gene, slot] of Object.entries(SLOT)) if (L.GENES[gene] && L[slot]) (PARTS[gene] ||= {})[L.GENES[gene]] = read(L[slot]);
  if (L.TAIL_SIDE) PARTS.tail[L.GENES.tail].side = read(L.TAIL_SIDE); // for a pet that stands on the ground
  if (L.WINGS_SIDE) PARTS.wings[L.GENES.wings].side = read(L.WINGS_SIDE);
  if (L.EARS_SMALL) PARTS.ears[L.GENES.ears].small = read(L.EARS_SMALL); // a child's
  PARTS.body[L.GENES.body] = { [L.FORM]: body };
  for (const [form, b] of Object.entries(L.BODIES || {})) PARTS.body[L.GENES.body][form] = read(b);
  PARTS.face[L.GENES.head] = L.FACE;
  PARTS.cheek[L.GENES.head] = read(L.CHEEK);
  if (L.ARMS) PARTS.arms[L.FORM] = read(L.ARMS);
  // things laid over a head or body: kept by where they sit from the face, the crown or the neck
  const layers = [];
  for (const o of L.OVERLAYS || []) {
    const from = o.on === 'body' ? neck : o.anchor === 'top' ? top : face;
    layers.push({ ...read(o), on: o.on, anchor: o.anchor, off: [o.at[0] - from[0], o.at[1] - from[1]] });
  }
  if (L.SPOTS) for (const [x, y] of L.SPOTS.at) layers.push({ ...read(L.SPOTS), on: 'head', off: [x - L.SPOTS.pivot[0] - face[0], y - L.SPOTS.pivot[1] - face[1]] });
  const hair = layers.filter(o => o.gene === 'hair'), pattern = layers.filter(o => o.gene !== 'hair');
  if (hair.length) (PARTS.hair ||= {})[L.GENES.hair] = { layers: hair };
  if (L.GENES.pattern) PARTS.pattern[L.GENES.pattern] = pattern;
}

// babies and children: a head and a small body per body plan, in one piece
const each = (o) => Object.fromEntries(Object.entries(o).map(([f, b]) => [f, read(b)]));
const YOUNG = {
  baby: { head: read(young.BABY_HEAD), body: each(young.BABY_BODY), face: young.BABY_FACE, cheek: read(young.BABY_CHEEK) },
  child: { head: read(young.CHILD_HEAD), body: each(young.CHILD_BODY), face: young.CHILD_FACE, cheek: read(young.CHILD_CHEEK) },
};
const BABY_EYE = read(young.BABY_EYE), BABY_MOUTH = read(young.BABY_MOUTH);

const has = (p, gene) => p[gene] && p[gene] !== 'none';

/**
 * Put a pet together. Returns { px, own } (maps from "x,y" to a colour and to the part that drew it, with
 * the body's top-left at 0, 0), the eye boxes, the mouth, the neck row and `floats`.
 * p is a phenotype; p.deeper may force the deeper body shade on or off. stage: baby, child, teen, adult.
 */
export function build(p, stage = 'adult', pose = {}) {
  const Y = YOUNG[stage]; // a baby or child is a plain head and body in one piece
  const adult = stage === 'adult';
  const form = FORMS.includes(p.form) || Object.values(DESIGNS).some(L => L.FORM === p.form) ? p.form : 'blob';
  const d = (p.deeper ?? DEEPER.has(p.color)) ? 1 : 0;
  const eyeRamp = p.eyeColor || p.eye || 'ink';
  const col = { 4: ramp(p.color, 3 - d), 3: ramp(p.color, 2 - d), 2: ramp(p.color, 1 - d), 8: ramp(p.accent, 3), 7: ramp(p.accent, 2), 6: ramp(p.accent, 1), e: ramp(eyeRamp, 2), E: ramp(eyeRamp, 3) };
  if (eyeRamp === 'ink') col.e = col.E = C('ink');
  for (const [k, v] of Object.entries(FIXED)) col[k] = C(v);
  const ink = col.o;
  const px = new Map(), own = new Map();
  let who = '';
  const stamp = (part, ax, ay, flip = false, at = part && part.pivot, clip = null) => part && part.rows.forEach((r, j) => r.forEach((ch, i) => {
    if (ch === '.' || ch === ' ') return;
    const k = (flip ? ax + at[0] - i : ax - at[0] + i) + ',' + (ay - at[1] + j);
    if (clip && (own.get(k) !== clip || px.get(k) === ink)) return; // an overlay only shows on the part it lies on, inside its outline
    px.set(k, col[ch]); if (!clip) own.set(k, who);
  }));
  const bodies = PARTS.body[p.body] || PARTS.body.jelly;
  const body = Y ? Y.body[form] : bodies[form], head = Y ? Y.head : PARTS.head[p.head] || PARTS.head.gumdrop;
  const [bnx, bny] = body.sockets.neck[0], [hnx, hny] = head.sockets.neck[0];
  const hx = bnx - hnx, hy = bny - hny; // the head's top-left: its neck on the body's
  const H = (n) => (head.sockets[n] || []).map(([x, y]) => [hx + x, hy + y]);
  const B = (n) => body.sockets[n] || [];
  const [el] = H('earL'), [er] = H('earR'), [f] = H('face'), [top] = H('top'), [t] = B('tail');
  const wing0 = Y || !adult ? null : PARTS.wings?.[p.wings], wings = wing0 && (form !== 'floater' && wing0.side || wing0), [wl] = B('wingL'), [wr] = B('wingR');
  const ears = stage === 'baby' ? null : stage === 'child' ? PARTS.ears[p.ears]?.small : PARTS.ears[p.ears];
  const pattern = Y ? [] : PARTS.pattern[p.pattern] || [], hair = Y || !has(p, 'hair') ? null : PARTS.hair?.[p.hair];
  // ears that grow from the side of a head (gills, fins) use its side sockets; the rest use the ones on top
  const [sl] = H('sideL'), [sr] = H('sideR'), eL = ears?.side && sl || el, eR = ears?.side && sr || er;
  const earUp = pose.ear ? 1 : 0, wingUp = pose.flap ? 3 : 0, tailUp = pose.wag ? 2 : 0;
  const drawEars = () => { who = 'ears'; if (ears && eL) { stamp(ears, eL[0], eL[1] - earUp); stamp(ears, eR[0], eR[1] - earUp, true); } };
  // (a wing part is drawn opening to the left, for the left socket, and turned round for the right one; one marked
  // `opensRight` is the other way about. On a body seen from the side, with one socket, it is used as drawn.)
  const drawWings = () => { who = 'wings'; const r = !!wings?.opensRight && !!wr; if (wings && wl) stamp(wings, wl[0], wl[1] - wingUp, r); if (wings && wr) stamp(wings, wr[0], wr[1] - wingUp, !r); };
  // (an overlay sits where it was typed, measured from the face or the neck, or from the crown if it says `anchor: 'top'`)
  const lay = (list, on, from, part) => { for (const o of list) if (o.on === on) { const a = o.anchor === 'top' ? top : from; stamp(o, a[0] + o.off[0], a[1] + o.off[1], false, [0, 0], part); } };

  const onePiece = form === 'blob' && !Y; // the base stands behind the head, so ears that lie behind the head go on after it
  if (ears && !ears.front && !onePiece) drawEars();
  const flank = !!wl && !wr; // seen from the side: one wing, lying on the flank in front of the body
  const overHead = form === 'blob' && !Y; // on the one-piece mound the head covers the body, so wings go on last, at its sides
  if (wings && !wings.front && !flank && !overHead) drawWings();
  // a body seen from the side may ask for its far wing as well: the same wing again, behind everything, a little offset
  if (wings && flank && body.farWing) { who = 'wings'; stamp(wings, wl[0] + body.farWing[0], wl[1] + body.farWing[1] - wingUp); }
  const tail = !Y && has(p, 'tail') && PARTS.tail[p.tail] && (form !== 'floater' && PARTS.tail[p.tail].side || PARTS.tail[p.tail]);
  who = 'tail'; if (t && tail) stamp(tail, t[0], t[1] - tailUp);
  who = 'body'; stamp(body, 0, 0, false, [0, 0]);
  lay(pattern, 'body', [bnx, bny], 'body');
  if (ears && !ears.front && onePiece) drawEars();
  if (wings && (wings.front || flank) && !overHead) drawWings();
  const arms = Y ? null : PARTS.arms[form], [al] = B('armL'), [ar] = B('armR');
  // an arm up is the same arm set higher and a little out; 'wave' lifts one
  const armAt = (up, out) => (pose.arms === 'out' ? [2, 2] : up ? [1, 5] : [0, 0]);
  const [lx, ly] = armAt(pose.arms === 'up' || pose.arms === 'wave'), [rx, ry] = armAt(pose.arms === 'up');
  who = 'arms'; if (arms && al) { stamp(arms, al[0] - lx, al[1] - ly); stamp(arms, ar[0] + rx, ar[1] - ry, true); }
  // walking: every other foot lifts, turn about
  who = 'feet'; if (!Y && has(p, 'feet') && PARTS.feet[p.feet]) B('feet').forEach(([x, y], i) => stamp(PARTS.feet[p.feet], x, y - (pose.step && (i + pose.step) % 2 === 0 ? 2 : 0)));
  const under = onePiece ? new Set([...own].filter(([, w]) => w === 'body').map(([k]) => k)) : null;
  who = 'head'; stamp(head, hx, hy, false, [0, 0]);
  // one piece: the head's own shadow would lie across the mound as a streak, so over the mound the head is plain
  if (under) for (const k of under) if (own.get(k) === 'head' && px.get(k) === col[3]) px.set(k, col[4]);
  if (form === 'blob' || Y) {
    // one piece: wherever the head's outline lies on the body with body colour beside it, the line goes
    const melted = [];
    for (const [k, c] of px) {
      if (c !== ink || own.get(k) !== 'head') continue;
      const [x, y] = k.split(',').map(Number), near = [[0, -1], [0, 1], [-1, 0], [1, 0]].map(([dx, dy]) => (x + dx) + ',' + (y + dy));
      const inside = near.find(n => own.get(n) === 'head' && px.get(n) !== ink), outside = near.find(n => own.get(n) === 'body' && px.get(n) !== ink);
      if (inside && outside) melted.push([k, px.get(Y ? outside : inside)]);
    }
    for (const [k, c] of melted) px.set(k, c);
  }
  if (wings && overHead) drawWings();
  // the top of the head in each column, before anything is put on it, for hats
  const tops = new Map();
  for (const [k, w] of own) if (w === 'head') { const [x, y] = k.split(',').map(Number); if (!tops.has(x) || y < tops.get(x)) tops.set(x, y); }
  lay(pattern, 'head', f, 'head');
  if (hair?.layers) for (const o of hair.layers) stamp(o, (o.anchor === 'top' ? top : f)[0] + o.off[0], (o.anchor === 'top' ? top : f)[1] + o.off[1], false, [0, 0], 'head');
  if (ears?.front) drawEars();
  const topper = adult && has(p, 'topper') && PARTS.topper[p.topper], both = !!(hair?.rows && topper && !topper.wide);
  who = 'hair'; if (hair?.rows) stamp(hair, top[0] - (both ? 7 : 0), top[1] + (both ? 1 : 0));
  if (hair?.layers) for (const [k, w] of own) if (w === 'head' && [col[7], col[8]].includes(px.get(k))) own.set(k, 'hair'); // (icing counts as hair where it shows)
  who = 'topper'; if (topper) stamp(topper, top[0] + (both ? 5 : 0), top[1] + (both ? 1 : 0));

  who = 'face';
  const F = Y ? Y.face : PARTS.face[p.head] || PARTS.face.gumdrop, cheek = Y ? Y.cheek : PARTS.cheek[p.head];
  const eye = stage === 'baby' ? BABY_EYE : PARTS.eyes[p.eyes] || PARTS.eyes.bead, mouth = stage === 'baby' ? BABY_MOUTH : PARTS.mouth[p.mouth] || PARTS.mouth.o;
  const nose = Y || !has(p, 'nose') ? null : PARTS.nose?.[p.nose], mark = Y ? null : PARTS.mark[p.mark];
  if (mark) stamp(mark, f[0] + F.mark[0], f[1] + F.mark[1]);
  if (cheek && F.cheeks && pose.expr !== 'sick') { stamp(cheek, f[0] - F.cheeks[0], f[1] + F.cheeks[1]); stamp(cheek, f[0] + F.cheeks[0], f[1] + F.cheeks[1]); }
  lay(pattern, 'face', f, null);
  // the eyes; remember each one's box and the colour under it, so it can be covered and redrawn for a blink or a mood
  const ew = eye.rows[0].length, eh = eye.rows.length;
  const exL = f[0] - F.eyes, exR = f[0] + F.eyes - (eye.mirror ? 1 : 0);
  const boxes = [[exL - eye.pivot[0], f[1] - eye.pivot[1], ew, eh], [eye.mirror ? exR + eye.pivot[0] - (ew - 1) : exR - eye.pivot[0], f[1] - eye.pivot[1], ew, eh]];
  for (const b of boxes) b.push(px.get((b[0] + (ew >> 1)) + ',' + (b[1] + (eh >> 1))) || col[4]);
  stamp(eye, exL, f[1]); stamp(eye, exR, f[1], !!eye.mirror);
  const noseY = f[1] + (F.nose ?? F.mouth - 2);
  if (nose) stamp(nose, f[0], noseY);
  const mouthY = nose && !F.mouthFixed ? noseY + nose.rows.length : f[1] + F.mouth;
  stamp(mouth, f[0], mouthY);

  // clothes: a hat on top of the head, glasses and stickers over the face (drawn at twice their grid, like the old pets)
  let eyesHidden = false;
  const wear = Y || stage === 'baby' ? {} : pose.wear || {};
  who = 'wear';
  const dress = (part, ctx, x0, y0, only = null) => {
    const t2 = lut(part.spr, ctx);
    part.rows.forEach((r, j) => [...r].forEach((ch, i) => {
      const c = t2[ch.charCodeAt(0)]; if (!c) return;
      for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++) {
        const k = (x0 + (i - part.pivot[0]) * 2 + a) + ',' + (y0 + (j - part.pivot[1]) * 2 + b);
        if (only && !px.has(k)) continue; // a sticker only shows where there is pet to stick to
        px.set(k, c); own.set(k, 'wear');
      }
    }));
  };
  if (wear.head && HATS[wear.head] && tops.size) {
    const hat = HATS[wear.head];
    let x = top[0] + (hat.offset || 0) * 2;
    while (!tops.has(x) && x > top[0]) x--;
    if (tops.has(x)) dress(hat, colors(p.color, CLOTHES[wear.head].color, 'ink', 'brown'), x, tops.get(x));
  }
  if (wear.face && FACE_WEAR[wear.face]) {
    const item = FACE_WEAR[wear.face], ctx = colors(p.color, CLOTHES[wear.face].color, 'ink', 'brown');
    if (item.lens) {
      const need = Math.ceil(Math.max(ew, eh) / 2);
      const lens = item.lens.find(l => l.inner >= need) || item.lens[item.lens.length - 1];
      const place = ([x, y]) => [x + (ew >> 1) - lens.w, y + (eh >> 1) - lens.h]; // the ring centred on the eye
      const [l, r] = boxes.map(place), bare = { ...lens, pivot: [0, 0] };
      if (!item.oneSide) {
        dress(bare, ctx, l[0], l[1]);
        for (let x = l[0] + lens.w * 2; x < r[0]; x++) for (let b = 0; b < 2; b++) { const k = x + ',' + (l[1] + lens.h - 2 + b); px.set(k, ink); own.set(k, 'wear'); }
      }
      dress(bare, ctx, r[0], r[1]);
      if (item.chain) dress(item.chain, ctx, r[0] + lens.w * 2 - 2, r[1] + lens.h * 2 - 2);
    }
    if (item.brow) {
      const left = item.side === 'left', b = boxes[left ? 0 : 1];
      dress(item.brow, ctx, b[0] + (ew >> 1), b[1] - 4, true);
    }
    eyesHidden = !!item.hidesEyes;
  }

  // a pet that stands on the ground: nothing hangs through the floor (the floor is the lowest point of its body and feet)
  const floats = form === 'floater';
  if (!floats) {
    let floor = -Infinity;
    for (const [k, w] of own) if (w === 'body' || w === 'feet') floor = Math.max(floor, +k.split(',')[1]);
    for (const k of [...px.keys()]) if (+k.split(',')[1] > floor) { px.delete(k); own.delete(k); }
  }
  return { px, own, boxes, eyesHidden, mouth: [f[0], mouthY], neck: Y ? bny + 1 : bny, floats, bill: !Y && stage !== 'baby' && p.mouth === 'beak', faceColour: col[4] };
}

/**
 * Compose a pet at its own (fine) resolution, cropped to what it covers.
 * Returns { px, w, h, eyeBoxes, mouth, neck, floats, bill, faceColour, eyesHidden, seen, overflow, fine: true }.
 */
export function composePetArt(p, stage, pose = {}) {
  const k = build(p, stage, pose);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const key of k.px.keys()) { const [x, y] = key.split(',').map(Number); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const w = x1 - x0 + 1, h = y1 - y0 + 1, px = new Uint8Array(w * h), seen = {};
  for (const [key, c] of k.px) { const [x, y] = key.split(',').map(Number); px[(y - y0) * w + (x - x0)] = c; const n = k.own.get(key); seen[n] = (seen[n] || 0) + 1; }
  return {
    px, w, h, fine: true, seen, overflow: w > FW || h > FH - 6,
    eyeBoxes: k.eyesHidden ? [] : k.boxes.map(([x, y, bw, bh, c]) => [x - x0, y - y0, bw, bh, c]),
    eyesHidden: k.eyesHidden, mouth: [k.mouth[0] - x0, k.mouth[1] - y0], neck: k.neck - y0,
    floats: k.floats, bill: k.bill, faceColour: k.faceColour,
  };
}

// ---------- the egg (still at the old double-size grid) ----------
/** The egg: colours hint at the baby inside. Returns a 64 x 64 sprite for sprite-pet.js to scale. */
export function composeEggArt(p, crack = 0, wobble = 0) {
  const W = 64, px = new Uint8Array(W * W);
  const t = lut(EGG.spr, colors(p?.color || 'gold', p?.accent || 'cream', 'ink', 'brown'));
  const x0 = ((W - EGG.w) >> 1) + wobble, y0 = W - 3 - EGG.h;
  EGG.rows.forEach((r, j) => [...r].forEach((ch, i) => { const c = t[ch.charCodeAt(0)]; if (c) px[(y0 + j) * W + x0 + i] = c; }));
  const cracks = [[8, 3], [7, 4], [8, 5], [9, 6], [8, 7], [10, 4], [11, 5], [6, 6], [5, 7]];
  for (let i = 0; i < Math.min(cracks.length, crack * 3); i++) px[(y0 + cracks[i][1]) * W + x0 + cracks[i][0]] = C('ink');
  return { px, w: W, h: W, egg: true };
}
