// Review-page helper: the game's own pet renderer (src/game/pet-art.js), wrapped for tools/fine-founders.html.
import { LINES as GAME, DESIGNS, FORMS as GAME_FORMS, PARTS, build } from '../src/game/pet-art.js';
// the review page shows the designs that are not in the gene pool yet alongside the game's lines
export const LINES = { ...GAME, ...DESIGNS };
export const FORMS = [...GAME_FORMS, ...Object.values(DESIGNS).map(L => L.FORM)];
export { PARTS };

/** A founder as a pet: its own parts, colours and body plan, as its art file gives them. */
export function founder(name) {
  const L = LINES[name];
  return { ...L.GENES, form: L.FORM, color: L.LOOK.color, accent: L.LOOK.accent, eye: L.LOOK.eye || 'ink', deeper: !!L.LOOK.deeper };
}
/** Is this pet's body drawn for its body plan? */
export const drawable = (p) => !!PARTS.body[p.body]?.[p.form];

/** Put a pet together. Returns its pixels [x, y, colour], their bounds, and `lift` (how far a floater hangs above the floor). */
export function compose(p, stage = 'adult') {
  const k = build({ none: 'none', ...Object.fromEntries(['tail', 'topper', 'feet', 'nose', 'wings', 'hair'].map(g => [g, p[g] || 'none'])), ...p }, stage);
  const cells = [...k.px].map(([key, c]) => [...key.split(',').map(Number), c]);
  const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
  return { cells, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), lift: k.floats ? 8 : 0 };
}
