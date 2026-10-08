// Turning 1x sprite grids into double-density art.
//
// Scale2x (EPX) doubles a grid while rounding off diagonal steps. A plain 2x
// copy would also double every outline to 2px thick, so afterwards outline
// pixels ('o') that don't touch the outside are filled with the colour next to
// them, leaving a crisp 1px outer outline like the procedurally drawn shapes.

import { sprite } from './sprite.js';

const EMPTY = '.';

export function scale2x(rows) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? EMPTY : rows[y][x] || EMPTY);
  const out = Array.from({ length: h * 2 }, () => new Array(w * 2).fill(EMPTY));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const E = at(x, y), B = at(x, y - 1), D = at(x - 1, y), F = at(x + 1, y), Hh = at(x, y + 1);
    let e0 = E, e1 = E, e2 = E, e3 = E;
    if (B !== Hh && D !== F) {
      if (D === B) e0 = D;
      if (B === F) e1 = F;
      if (D === Hh) e2 = D;
      if (Hh === F) e3 = F;
    }
    out[y * 2][x * 2] = e0; out[y * 2][x * 2 + 1] = e1;
    out[y * 2 + 1][x * 2] = e2; out[y * 2 + 1][x * 2 + 1] = e3;
  }
  return out.map(r => r.join(''));
}

/** Fill inner halves of doubled outlines so only the outer 1px line remains. */
export function thinOutlines(rows, outline = 'o') {
  const h = rows.length, w = rows[0].length;
  const g = rows.map(r => [...r]);
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? EMPTY : rows[y][x]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (rows[y][x] !== outline) continue;
    const n4 = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
    if (n4.includes(EMPTY)) continue;                         // touches the outside: keep
    const n8 = [...n4, at(x - 1, y - 1), at(x + 1, y - 1), at(x - 1, y + 1), at(x + 1, y + 1)];
    if (n8.includes(EMPTY)) continue;                         // a corner of the silhouette: keep
    const fills = n4.filter(c => c !== outline);
    if (!fills.length) continue;                              // solid outline area: keep
    // most common neighbouring fill colour
    const count = {};
    for (const c of fills) count[c] = (count[c] || 0) + 1;
    g[y][x] = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  }
  return g.map(r => r.join(''));
}

/**
 * Double-density version of a part { spr, pivot, rows?, hd? }.
 * Parts with hand-drawn double-density art (part.native) use it; others are upscaled once and cached.
 */
export function hdPart(part) {
  if (part.hd) return part;
  if (part.native) return part.native;               // hand-drawn double-density art
  if (part._hd) return part._hd;
  const rows = part.rows;
  const big = thinOutlines(scale2x(rows));
  part._hd = { ...part, spr: sprite(big, part.spr.key), pivot: [part.pivot[0] * 2, part.pivot[1] * 2], hd: true };
  return part._hd;
}
