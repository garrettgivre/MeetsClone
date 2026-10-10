// Review-page helper, not used by the game: puts fine-line pets together from the parts in
// src/art/pets/fine/, the way the game's renderer will one day. It reads the founders' files into a
// table of parts by gene, and builds any mix of them on any body plan that has been drawn.
//
// What is shared and what is per body plan: a head, ears, tail, feet, wings, topper, hair and the face
// parts are one drawing each and go on any body plan. A body is drawn once per body plan
// (BODY for the founder's own, BODIES for the rest). Arms belong to the two-legged plan.

import { C, ramp } from '../src/engine/palette.js';
import * as axolotl from '../src/art/pets/fine/axolotl.js';
import * as caterpillar from '../src/art/pets/fine/caterpillar.js';
import * as jellyfish from '../src/art/pets/fine/jellyfish.js';
import * as fox from '../src/art/pets/fine/fox.js';
import * as owl from '../src/art/pets/fine/owl.js';
import * as jelly from '../src/art/pets/fine/jelly.js';

export const LINES = { axolotl, caterpillar, jellyfish, fox, owl, jelly };
export const FORMS = ['quad', 'serpent', 'floater', 'biped', 'avian', 'blob'];

const SOCKETS = { '^': 'top', '[': 'earL', ']': 'earR', '@': 'face', '=': 'neck', '~': 'tail', '!': 'feet', '(': 'wingL', ')': 'wingR', '<': 'armL', '>': 'armR' };
const FIXED = { o: 'ink', w: 'white', l: 'green.2', L: 'green.1', j: 'green.0', P: 'pink.3', f: 'pink.2', q: 'red.2', r: 'red.1', Y: 'gold.3', y: 'gold.1', g: 'gray', v: 'silver', m: 'mist' };

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

// ---------- the table of parts ----------
const SLOT = { head: 'HEAD', ears: 'EARS', tail: 'TAIL', feet: 'FEET', wings: 'WINGS', topper: 'TOPPER', hair: 'HAIR', eyes: 'EYE', mouth: 'MOUTH', nose: 'NOSE', mark: 'MARK' };
export const PARTS = { body: {}, pattern: {}, face: {}, cheek: {}, arms: {} };
for (const [name, L] of Object.entries(LINES)) {
  const head = read(L.HEAD), body = read(L.BODY);
  const face = head.sockets.face[0], top = head.sockets.top[0], neck = body.sockets.neck[0];
  for (const [gene, slot] of Object.entries(SLOT)) if (L.GENES[gene] && L[slot]) (PARTS[gene] ||= {})[L.GENES[gene]] = read(L[slot]);
  if (L.TAIL_SIDE) PARTS.tail[L.GENES.tail].side = read(L.TAIL_SIDE); // for a pet that stands on the ground
  PARTS.body[L.GENES.body] = { [L.FORM]: body };
  for (const [form, b] of Object.entries(L.BODIES || {})) PARTS.body[L.GENES.body][form] = read(b);
  PARTS.face[L.GENES.head] = L.FACE;
  PARTS.cheek[L.GENES.head] = read(L.CHEEK);
  if (L.ARMS) PARTS.arms[L.FORM] = read(L.ARMS);
  // things laid over a head or body: kept by where they sit from the face, the crown or the neck, so they go on any head or body
  const layers = [];
  for (const o of L.OVERLAYS || []) {
    const from = o.on === 'body' ? neck : o.anchor === 'top' ? top : face;
    layers.push({ ...read(o), on: o.on, anchor: o.anchor, off: [o.at[0] - from[0], o.at[1] - from[1]] });
  }
  if (L.SPOTS) for (const [x, y] of L.SPOTS.at) layers.push({ ...read(L.SPOTS), on: 'head', off: [x - L.SPOTS.pivot[0] - face[0], y - L.SPOTS.pivot[1] - face[1]] });
  const hair = layers.filter(o => o.gene === 'hair'), pattern = layers.filter(o => o.gene !== 'hair');
  if (hair.length) PARTS.hair[L.GENES.hair] = { layers: hair };
  if (L.GENES.pattern) PARTS.pattern[L.GENES.pattern] = pattern;
}

/** A founder as a pet: its own parts, colours and body plan. */
export function founder(name) {
  const L = LINES[name];
  return { ...L.GENES, form: L.FORM, color: L.LOOK.color, accent: L.LOOK.accent, eye: L.LOOK.eye || 'ink', deeper: !!L.LOOK.deeper };
}
/** Can this pet be drawn yet (is its body drawn for its body plan)? */
export const drawable = (p) => !!PARTS.body[p.body]?.[p.form];

/**
 * Put a pet together. Returns its pixels [x, y, colour] with the body's top-left at 0, 0, their bounds,
 * and `lift` (how far a floater hangs above the floor).
 */
export function compose(p) {
  const d = p.deeper ? 1 : 0;
  const col = { 4: ramp(p.color, 3 - d), 3: ramp(p.color, 2 - d), 2: ramp(p.color, 1 - d), 8: ramp(p.accent, 3), 7: ramp(p.accent, 2), 6: ramp(p.accent, 1), e: ramp(p.eye || 'ink', 2), E: ramp(p.eye || 'ink', 3) };
  if ((p.eye || 'ink') === 'ink') col.e = col.E = C('ink');
  for (const [k, v] of Object.entries(FIXED)) col[k] = C(v);
  const ink = col.o;
  const px = new Map(), own = new Map(); // colour and which part drew each pixel
  let who = '';
  const stamp = (part, ax, ay, flip = false, at = part && part.pivot, clip = null) => part && part.rows.forEach((r, j) => r.forEach((ch, i) => {
    if (ch === '.' || ch === ' ') return;
    const k = (flip ? ax + at[0] - i : ax - at[0] + i) + ',' + (ay - at[1] + j);
    if (clip && (own.get(k) !== clip || px.get(k) === ink)) return; // an overlay only shows on the part it lies on, inside its outline
    px.set(k, col[ch]); if (!clip) own.set(k, who);
  }));
  const body = PARTS.body[p.body][p.form], head = PARTS.head[p.head];
  const [bnx, bny] = body.sockets.neck[0], [hnx, hny] = head.sockets.neck[0];
  const hx = bnx - hnx, hy = bny - hny; // the head's top-left: its neck on the body's
  const H = (n) => (head.sockets[n] || []).map(([x, y]) => [hx + x, hy + y]);
  const B = (n) => body.sockets[n] || [];
  const [el] = H('earL'), [er] = H('earR'), [f] = H('face'), [top] = H('top'), [t] = B('tail');
  const ears = PARTS.ears[p.ears], wings = PARTS.wings?.[p.wings], [wl] = B('wingL'), [wr] = B('wingR');
  const pattern = PARTS.pattern[p.pattern] || [], hair = PARTS.hair?.[p.hair];
  const drawEars = () => { who = 'ears'; if (ears) { stamp(ears, el[0], el[1]); stamp(ears, er[0], er[1], true); } };
  const drawWings = () => { who = 'wings'; if (wings && wl) { stamp(wings, wl[0], wl[1]); stamp(wings, wr[0], wr[1], true); } };
  const lay = (list, on, from, part) => { for (const o of list) if (o.on === on) stamp(o, from[0] + o.off[0], from[1] + o.off[1], false, [0, 0], part); };

  if (ears && !ears.front) drawEars();
  if (wings && !wings.front) drawWings();
  const tail = PARTS.tail[p.tail] && (p.form !== 'floater' && PARTS.tail[p.tail].side || PARTS.tail[p.tail]);
  who = 'tail'; if (t && tail) stamp(tail, t[0], t[1]);
  who = 'body'; stamp(body, 0, 0, false, [0, 0]);
  lay(pattern, 'body', [bnx, bny], 'body');
  if (wings?.front) drawWings();
  const arms = PARTS.arms[p.form], [al] = B('armL'), [ar] = B('armR');
  who = 'arms'; if (arms && al) { stamp(arms, al[0], al[1]); stamp(arms, ar[0], ar[1], true); }
  who = 'feet'; if (PARTS.feet[p.feet]) for (const [x, y] of B('feet')) stamp(PARTS.feet[p.feet], x, y);
  who = 'head'; stamp(head, hx, hy, false, [0, 0]);
  if (p.form === 'blob') {
    // one piece: where the head's floor line lies on the base, with jelly above and below it, the line goes
    for (const [k, c] of [...px]) {
      if (c !== ink || own.get(k) !== 'head') continue;
      const [x, y] = k.split(',').map(Number), up = x + ',' + (y - 1), dn = x + ',' + (y + 1);
      if (own.get(up) === 'head' && px.get(up) !== ink && own.get(dn) === 'body' && px.get(dn) !== ink) { px.set(k, px.get(up)); }
    }
  }
  lay(pattern, 'head', f, 'head');
  if (hair?.layers) for (const o of hair.layers) stamp(o, (o.anchor === 'top' ? top : f)[0] + o.off[0], (o.anchor === 'top' ? top : f)[1] + o.off[1], false, [0, 0], 'head');
  if (ears?.front) drawEars();
  who = 'hair'; if (hair?.rows) stamp(hair, top[0], top[1]);
  who = 'topper'; if (PARTS.topper[p.topper]) stamp(PARTS.topper[p.topper], top[0], top[1]);
  who = 'face';
  const F = PARTS.face[p.head], cheek = PARTS.cheek[p.head], eye = PARTS.eyes[p.eyes], mouth = PARTS.mouth[p.mouth], nose = PARTS.nose?.[p.nose], mark = PARTS.mark[p.mark];
  if (mark) stamp(mark, f[0] + F.mark[0], f[1] + F.mark[1]);
  if (cheek && F.cheeks) { stamp(cheek, f[0] - F.cheeks[0], f[1] + F.cheeks[1]); stamp(cheek, f[0] + F.cheeks[0], f[1] + F.cheeks[1]); }
  lay(pattern, 'face', f, null);
  stamp(eye, f[0] - F.eyes, f[1]); stamp(eye, f[0] + F.eyes - (eye.mirror ? 1 : 0), f[1], !!eye.mirror);
  if (nose) stamp(nose, f[0], f[1] + (F.nose ?? F.mouth - 2));
  stamp(mouth, f[0], f[1] + (nose ? (F.nose ?? F.mouth - 2) + nose.rows.length : F.mouth));

  // a pet that stands on the ground: nothing hangs through the floor (the floor is the lowest point of its body and feet)
  if (p.form !== 'floater') {
    let floor = -Infinity;
    for (const [k, w] of own) if (w === 'body' || w === 'feet') floor = Math.max(floor, +k.split(',')[1]);
    for (const k of [...px.keys()]) if (+k.split(',')[1] > floor) px.delete(k);
  }
  const cells = [...px].map(([k, c]) => [...k.split(',').map(Number), c]);
  const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
  return { cells, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), lift: p.form === 'floater' ? 8 : 0 };
}
