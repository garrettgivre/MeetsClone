// Building blocks for hand-pixelled pet parts.
//
// A part is a text grid (one character per pixel, see src/engine/sprite.js).
// Role characters recolour with the pet's genes:
//   1-4  body ramp: 1 darkest (lit outline), 2 shadow, 3 base, 4 light
//   5-8  accent ramp, same order       e E F  eye colour      - 9 0 +  hair ramp
// Fixed colours: o/k ink, w white, f/P/p pinks, q/Q/R/r reds, a/A orange,
// u/y/x/Y golds, l/L/j greens, B/s/S blues, n/N/d browns, G silver, m mist.
//
// Socket markers are painted as fill (the `under` colour, default '3') and
// record where other parts attach:
//   @ face (small)   * face (large)   ^ top of the head   = neck
//   [ ] ears          < > arms          ( ) wings          ! ? feet   ~ tail
//   # this part's own pivot (the point that lands on the socket)
// Left-side parts are drawn facing left; the right side is mirrored.

import { sprite } from '../../engine/sprite.js';

const SOCKETS = {
  '@': 'faceS', '*': 'faceL', '^': 'top', '=': 'neck', '[': 'earL', ']': 'earR',
  '<': 'armL', '>': 'armR', '(': 'wingL', ')': 'wingR', '!': 'footL', '?': 'footR', '~': 'tail', '#': 'pivot',
};

/**
 * part(rows, opts)
 *   opts.under   colour drawn under socket markers: a char, or { marker: char }
 *   opts.pivot   [x, y] if the grid has no '#'
 *   opts.key     extra/override colours for this sprite (see sprite())
 *   any other opts (front, mirror, bill, ...) are kept on the part
 */
export function part(rows, opts = {}) {
  const w = rows[0].length;
  const sockets = {};
  // a marker floating on empty space records the socket but draws nothing
  const empty = (x, y) => { const c = rows[y]?.[x]; return c === undefined || c === '.' || c === ' '; };
  const clean = rows.map((r, y) => {
    if (r.length !== w) throw new Error(`part row ${y} is ${r.length} wide, expected ${w}: "${r}"`);
    return [...r].map((ch, x) => {
      const name = SOCKETS[ch];
      if (!name) return ch;
      (sockets[name] ||= []).push([x, y]);
      if (empty(x - 1, y) && empty(x + 1, y) && empty(x, y - 1) && empty(x, y + 1)) return '.';
      return typeof opts.under === 'object' ? (opts.under[ch] ?? '3') : (opts.under ?? '3');
    }).join('');
  });
  const pivot = opts.pivot || sockets.pivot?.[0] || [w >> 1, rows.length - 1];
  const { under, key, ...flags } = opts;
  return { ...flags, spr: sprite(clean, key || null), rows: clean, w, h: rows.length, sockets, pivot };
}

/** The first socket of a kind, or null. */
export const socket = (p, name, i = 0) => p?.sockets?.[name]?.[i] || null;

export const ORANGE = { a: 'orange.0', b: 'orange.1', n: 'orange.2', N: 'orange.3' };
