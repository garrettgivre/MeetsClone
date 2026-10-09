// A way of typing props that keeps long rows honest. Rows are typed from the
// left and may be left ragged on the right (defineProp fills them out with
// empty cells). Leaves and wood are typed as letters and renamed to the usual
// digits of props.js, because long runs of digits are where typing slips:
//   o leaf outline (1)   S leaf shade (2)   M leaf (3)   L leaf light (4)
//   p wood dark (5)      Q wood shade (6)   q wood (7)   P wood light (8)
// Everything else is as in props.js.
import { defineProp, PROPS } from './props.js';

const KEY = { o: '1', S: '2', M: '3', L: '4', p: '5', Q: '6', q: '7', P: '8' };
export const drawn = (name, rows, opts) => defineProp(name, rows.map(r => [...r].map(ch => KEY[ch] || ch).join('')), opts);

/**
 * Make a prop bigger by repeating parts of its own drawing: a stretch of rows
 * (a pole, a trunk, a door, a leg) or of columns (the middle of a bed, a bench,
 * a rug). Nothing new is drawn: `rows` and `cols` are lists of
 * [from, count, extra], meaning "the `count` rows (or columns) starting at
 * `from` appear `extra` more times". Indexes are those of the drawing as typed.
 * `x` keeps the anchor on a given original column (else it is the middle), and
 * `up` puts it that many rows above the bottom.
 */
export function stretch(name, { rows = [], cols = [], x = null, up = 0 } = {}) {
  const p = PROPS[name];
  if (!p) throw new Error(`no prop called ${name}`);
  let grid = p.rows.map(r => [...r]);
  let ax = x;
  for (const [from, count, extra] of [...cols].sort((a, b) => b[0] - a[0])) {
    grid = grid.map(r => { const part = r.slice(from, from + count); let add = []; for (let i = 0; i < extra; i++) add = add.concat(part); return [...r.slice(0, from + count), ...add, ...r.slice(from + count)]; });
    if (ax !== null && from + count <= ax) ax += count * extra;
  }
  for (const [from, count, extra] of [...rows].sort((a, b) => b[0] - a[0])) {
    const part = grid.slice(from, from + count); let add = [];
    for (let i = 0; i < extra; i++) add = add.concat(part.map(r => [...r]));
    grid = [...grid.slice(0, from + count), ...add, ...grid.slice(from + count)];
  }
  const out = grid.map(r => r.join(''));
  defineProp(name, out, { at: [ax === null ? out[0].length >> 1 : ax, out.length - 1 - up], ramps: p.ramps });
}
