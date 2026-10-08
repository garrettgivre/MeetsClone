// Town backdrops, drawn at full (double) density like the living room, and
// cached once per place. Coordinates are hi-res pixels inside the room area
// (256 x 312). The horizon / back wall meets the ground at HZ; pets stand at FEET.
//
// House style (see docs/STYLE.md): light from the upper left; solid shapes get
// a light rim on top/left, a shadow band on the bottom/right and an outline in
// a darker shade of their own colour (ink only for small, dark details); props
// sit on soft dithered contact shadows.
import { C, RAMP_NAMES } from '../engine/palette.js';
import { W, HD, makeBitmap } from '../engine/screen.js';
import { LAYOUT } from '../ui.js';

export const RW = W * HD;               // 256
export const RH = LAYOUT.room.h * HD;   // 312
export const HZ = 172;                  // where the back wall / horizon meets the ground
export const FEET = 228;                // where pets stand (hi-res, inside the room)

const cache = new Map();

/** The backdrop for a place: a cached hi-res bitmap covering the room area. */
export function backdrop(id) {
  if (!cache.has(id)) {
    const k = kit();
    (SCENES[id] || SCENES.square)(k);
    cache.set(id, k.bm);
  }
  return cache.get(id);
}

// ---------------------------------------------------------------- colour helpers
const NEUTRAL = ['ink', 'shade', 'gray', 'silver', 'mist', 'white'];
/** A colour `n` shades lighter (n > 0) or darker (n < 0), staying in its ramp. */
export function tone(c, n) {
  const [ramp, s] = c.split('.');
  if (s === undefined) {
    const i = NEUTRAL.indexOf(c);
    return i < 0 ? c : NEUTRAL[Math.max(0, Math.min(NEUTRAL.length - 1, i + n))];
  }
  if (!RAMP_NAMES.includes(ramp)) return c;
  return `${ramp}.${Math.max(0, Math.min(3, +s + n))}`;
}
const lt = (c, n = 1) => tone(c, n);
const dk = (c, n = 1) => tone(c, -n);
/** The outline for a fill: two shades darker, or ink once that runs out. */
const edge = (c) => (dk(c, 2) === c || c.endsWith('.0') || c.endsWith('.1') || c === 'shade' || c === 'ink' ? 'ink' : dk(c, 2));

// ---------------------------------------------------------------- drawing kit
function kit() {
  const bm = makeBitmap(RW, RH, true);
  const col = (c) => (typeof c === 'string' ? C(c) : c);
  const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < RW && y < RH) bm.px[y * RW + x] = col(c); };
  const get = (x, y) => bm.px[y * RW + x];
  const rect = (x, y, w, h, c) => { const v = col(c); x = Math.round(x); y = Math.round(y); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, v); };
  const box = (x, y, w, h, c = 'ink') => { rect(x, y, w, 1, c); rect(x, y + h - 1, w, 1, c); rect(x, y, 1, h, c); rect(x + w - 1, y, 1, h, c); };
  const line = (x0, y0, x1, y1, c) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) set(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c);
  };
  const dither = (x, y, w, h, c, phase = 0) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (((x + i + y + j + phase) & 1) === 0) set(x + i, y + j, c); };

  /** A solid block lit from the upper left, outlined in its own darker shade. */
  const block = (x, y, w, h, fill, { outline = edge(fill), rim = true } = {}) => {
    rect(x, y, w, h, fill);
    if (rim && w > 3 && h > 3) {
      rect(x + 1, y + 1, w - 2, 1, lt(fill)); rect(x + 1, y + 1, 1, h - 2, lt(fill));
      rect(x + 1, y + h - 3, w - 2, 2, dk(fill)); rect(x + w - 3, y + 1, 2, h - 2, dk(fill));
    }
    if (outline) box(x, y, w, h, outline);
  };
  /** Flat block with an outline (for small things and frames). */
  const flat = (x, y, w, h, fill, outline = edge(fill)) => { rect(x, y, w, h, fill); if (outline) box(x, y, w, h, outline); };
  const ellipse = (cx, cy, rx, ry, fill, { outline = null, shade = false } = {}) => {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = (x * x) / (rx * rx || 1) + (y * y) / (ry * ry || 1);
      if (d > 1) continue;
      let c = fill;
      if (shade) {
        const k = (x / rx) * 0.7 + (y / ry) * 0.7; // toward the lower right
        if (k > 0.55) c = dk(fill); else if (k < -0.75 && d > 0.25) c = lt(fill);
      }
      if (outline && d > Math.max(0.7, 1 - 2.2 / Math.min(rx, ry))) c = outline;
      set(cx + x, cy + y, c);
    }
  };
  const disc = (cx, cy, r, fill, opts = {}) => ellipse(cx, cy, r, r, fill, opts);
  /** A ball with a highlight: shaded, outlined. */
  const ball = (cx, cy, r, fill) => { disc(cx, cy, r, fill, { outline: edge(fill), shade: true }); set(cx - r / 2, cy - r / 2, 'white'); };
  /** Soft contact shadow on the ground. */
  const shadow = (cx, y, rx, c = 'shade', ry = Math.max(2, Math.round(rx / 5))) => {
    for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1 && ((cx + i + y + j) & 1) === 0) set(cx + i, y + j, c);
  };

  // ---- skies and grounds ----
  const sky = (top = 'sky.2', bottom = 'sky.3', h = HZ) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < RW; x++) {
      const t = y / h;
      set(x, y, (t > 0.6 || (t > 0.42 && ((x + y) & 1) === 0 && t > 0.42 + ((x * 7) % 5) * 0.02)) ? bottom : top);
    }
  };
  const cloud = (x, y, s = 1) => {
    const puffs = [[0, 0, 14, 7], [-12, 3, 9, 5], [12, 3, 10, 5], [-4, -4, 8, 5]];
    for (const [dx, dy, rx, ry] of puffs) ellipse(x + dx * s, y + dy * s, rx * s, ry * s, 'white');
    for (let i = -20 * s; i < 21 * s; i++) if (((i + y) & 1) === 0) set(x + i, y + 7 * s, 'mist');
    rect(x - 18 * s, y + 6 * s, 38 * s, 1, 'mist');
  };
  /** A row of far-off buildings in one pale colour. */
  const skyline = (y, c = 'sky.2', seed = 1) => {
    for (let x = 0, i = seed; x < RW; i++) {
      const w = 14 + ((i * 37) % 22), h = 18 + ((i * 53) % 40);
      rect(x, y - h, w - 1, h, c);
      for (let wy = y - h + 5; wy < y - 4; wy += 7) for (let wx = x + 3; wx < x + w - 4; wx += 5) set(wx, wy, lt(c));
      x += w;
    }
  };
  const hills = (y, c1 = 'green.2', amp = 6, f = 23, seed = 0) => {
    for (let x = 0; x < RW; x++) {
      const a = y - 10 - Math.round(Math.sin((x + seed) / f) * amp + Math.sin((x + seed) / 9) * 2);
      rect(x, a, 1, y - a, c1);
      set(x, a, lt(c1));
    }
  };
  const grass = (y = HZ, c = 'green.2') => {
    rect(0, y, RW, RH - y, c);
    rect(0, y, RW, 1, lt(c));
    dither(0, y + 1, RW, 3, lt(c));
    for (let i = 0; i < 110; i++) {
      const x = (i * 37 + (i >> 3) * 11) % RW, yy = y + 6 + ((i * 53) % (RH - y - 8));
      set(x, yy, dk(c)); set(x + 1, yy - 1, dk(c)); set(x + 2, yy, dk(c));
      if (i % 3 === 0) set(x + 5, yy + 2, lt(c));
    }
  };
  /** A path that widens toward the viewer. */
  const path = (y = HZ, c = 'cream.2', narrow = 22) => {
    for (let yy = y; yy < RH; yy++) {
      const half = narrow + Math.round((yy - y) * 0.85);
      rect(RW / 2 - half, yy, half * 2, 1, c);
      set(RW / 2 - half, yy, dk(c)); set(RW / 2 + half - 1, yy, dk(c));
    }
    for (let i = 0; i < 40; i++) { const yy = y + 6 + (i * 29) % (RH - y - 8), half = narrow + (yy - y) * 0.85; set(RW / 2 - half + 6 + (i * 41) % (half * 2 - 12), yy, dk(c)); }
  };
  /** Floor tiles in perspective: rows get taller toward the viewer. */
  const tiles = (y = HZ, c1 = 'cream.3', c2 = 'cream.2', s = 18) => {
    for (let yy = y, row = 0, h = 6; yy < RH; yy += h, h = Math.min(18, h + 2), row++) {
      for (let x = 0; x < RW; x++) {
        const k = Math.floor((x - RW / 2) / (s * (0.6 + row * 0.12)) + 100);
        rect(x, yy, 1, h, (k + row) % 2 ? c2 : c1);
      }
      rect(0, yy, RW, 1, dk(c2));
    }
  };
  const planks = (y = HZ, c = 'brown.2') => {
    rect(0, y, RW, RH - y, c);
    for (let yy = y, row = 0, h = 6; yy < RH; yy += h, h = Math.min(14, h + 2), row++) {
      rect(0, yy, RW, 1, dk(c));
      for (let x = (row % 2) * 31 + 13; x < RW; x += 62) rect(x, yy + 1, 1, h - 1, dk(c));
      for (let x = (row * 19) % 37; x < RW; x += 37) { set(x, yy + (h >> 1), lt(c)); set(x + 1, yy + (h >> 1), lt(c)); }
    }
  };
  const cobbles = (y = HZ, c = 'slate.3') => {
    rect(0, y, RW, RH - y, c);
    for (let yy = y, row = 0, h = 5; yy < RH; yy += h, h = Math.min(14, h + 1), row++) {
      const w = 8 + row * 2;
      for (let x = (row % 2) * (w >> 1); x < RW; x += w) { box(x, yy, w, h, dk(c)); set(x + 1, yy + 1, 'white'); }
    }
  };
  /** Indoor wall: pattern, chair rail, wainscot, skirting, and a soft shadow on the floor. */
  const wall = (c = 'cream.3', pattern = 'cream.2', kind = 'stripes', { wainscot = null } = {}) => {
    rect(0, 0, RW, HZ, c);
    if (kind === 'stripes') for (let x = 0; x < RW; x += 16) rect(x, 0, 6, HZ, pattern);
    if (kind === 'dots') for (let yy = 10, r = 0; yy < HZ - 20; yy += 14, r++) for (let x = r % 2 ? 7 : 14; x < RW; x += 14) { set(x, yy, pattern); set(x - 1, yy, pattern); set(x + 1, yy, pattern); set(x, yy - 1, pattern); set(x, yy + 1, pattern); }
    if (kind === 'bricks') for (let yy = 0, r = 0; yy < HZ; yy += 9, r++) { rect(0, yy, RW, 1, pattern); for (let x = r % 2 ? 0 : 13; x < RW; x += 26) rect(x, yy, 1, 9, pattern); }
    if (kind === 'diamonds') for (let yy = 0; yy < HZ; yy += 12) for (let x = 0; x < RW; x += 12) { set(x + 6, yy, pattern); set(x + 5, yy + 1, pattern); set(x + 7, yy + 1, pattern); set(x + 6, yy + 2, pattern); }
    if (wainscot) {
      rect(0, HZ - 44, RW, 34, wainscot);
      for (let x = 6; x < RW; x += 32) { box(x, HZ - 38, 26, 22, dk(wainscot)); rect(x + 1, HZ - 37, 24, 1, lt(wainscot)); }
      rect(0, HZ - 47, RW, 3, 'white'); rect(0, HZ - 44, RW, 1, dk(wainscot));
    }
    rect(0, HZ - 9, RW, 9, 'white'); rect(0, HZ - 9, RW, 1, 'mist'); rect(0, HZ - 1, RW, 1, 'silver');
  };
  /** Dithered shadow where the wall meets the floor. */
  const floorShadow = (c = 'shade') => dither(0, HZ, RW, 3, c);

  // ---- props ----
  const tree = (x, y, s = 1, leaf = 'green.2') => {
    shadow(x, y, 16 * s, dk(leaf, 2));
    rect(x - 3 * s, y - 24 * s, 6 * s, 24 * s, 'brown.1'); rect(x - 3 * s, y - 24 * s, 2 * s, 24 * s, 'brown.2'); set(x + 2 * s, y - 12 * s, 'brown.0');
    for (const [dx, dy, r] of [[0, -38, 16], [-11, -30, 11], [11, -29, 11], [-4, -46, 10], [7, -44, 9]]) disc(x + dx * s, y + dy * s, r * s, leaf, { outline: dk(leaf, 2) });
    for (const [dx, dy, r] of [[-6, -44, 6], [-12, -33, 5], [3, -38, 6]]) disc(x + dx * s, y + dy * s, r * s, lt(leaf));
    for (const [dx, dy, r] of [[9, -27, 6], [-1, -28, 5]]) disc(x + dx * s, y + dy * s, r * s, dk(leaf));
  };
  const pine = (x, y, h = 50, c = 'green.1') => {
    rect(x - 2, y - 8, 4, 8, 'brown.1');
    for (let j = 0; j < h; j++) { const half = Math.round(2 + (j % 14) * 0.9 + j * 0.25); rect(x - half, y - 8 - h + j, half * 2, 1, j % 14 < 3 ? lt(c) : c); set(x + half - 1, y - 8 - h + j, dk(c)); }
  };
  const bush = (x, y, c = 'green.2', w = 16) => {
    shadow(x, y, w + 2, dk(c, 2));
    ellipse(x, y - 7, w, 8, c, { outline: dk(c, 2), shade: true });
    ellipse(x - w / 3, y - 11, w / 3, 3, lt(c));
  };
  const flower = (x, y, c = 'pink.2') => { rect(x, y - 5, 1, 5, 'green.1'); set(x + 1, y - 2, 'green.2'); for (const [dx, dy] of [[-1, -6], [1, -6], [0, -7], [0, -5]]) set(x + dx, y + dy, c); set(x, y - 6, 'gold.3'); };
  const flowers = (x, y, n = 5, c = 'pink.2') => { for (let i = 0; i < n; i++) flower(x + i * 6, y - (i % 2) * 2, i % 3 === 2 ? 'gold.2' : c); };
  const pot = (x, y, plant = 'green.2', potC = 'orange.2') => {
    shadow(x, y, 10, 'shade');
    for (const [dx, dy, r] of [[0, -22, 8], [-6, -16, 6], [6, -16, 6]]) disc(x + dx, y + dy, r, plant, { outline: dk(plant, 2) });
    disc(x - 3, y - 25, 3, lt(plant));
    block(x - 8, y - 12, 16, 12, potC);
  };
  const lamp = (x, y, glow = true) => {
    shadow(x, y, 6);
    rect(x - 1, y - 56, 3, 56, 'ink'); rect(x - 4, y - 3, 9, 3, 'ink');
    if (glow) for (let j = -12; j <= 12; j++) for (let i = -12; i <= 12; i++) if (i * i + j * j < 140 && ((x + i + j) & 1) === 0) set(x + i, y - 60 + j, 'gold.3');
    flat(x - 5, y - 66, 11, 10, 'gold.3', 'ink'); rect(x - 4, y - 65, 3, 8, 'white'); rect(x - 7, y - 68, 15, 3, 'ink');
  };
  const bench = (x, y, c = 'brown.2') => {
    shadow(x + 20, y, 24);
    for (const yy of [y - 22, y - 16]) flat(x, yy, 40, 4, c);
    flat(x - 2, y - 11, 44, 4, lt(c), dk(c, 2));
    rect(x + 3, y - 7, 3, 7, 'ink'); rect(x + 34, y - 7, 3, 7, 'ink');
  };
  /** A window: frame, sky glass with a reflection, sill. */
  const window_ = (x, y, w, h, glass = 'sky.3', frame = 'white', { cross = true } = {}) => {
    block(x - 3, y - 3, w + 6, h + 6, frame);
    rect(x, y, w, h, glass);
    for (let j = 0; j < h; j++) if (j > h * 0.55) for (let i = 0; i < w; i++) if (((i + j) & 1) === 0) set(x + i, y + j, dk(glass));
    for (let i = 0; i < Math.min(w, h) / 2; i++) set(x + 3 + i, y + h / 2 - i, lt(glass, 2) === glass ? 'white' : 'white');
    if (cross) { rect(x + (w >> 1) - 1, y, 2, h, frame); rect(x, y + (h >> 1) - 1, w, 2, frame); }
    rect(x - 5, y + h + 3, w + 10, 3, frame); rect(x - 5, y + h + 5, w + 10, 1, dk(frame));
  };
  const door = (x, y, w = 22, h = 34, c = 'brown.2') => {
    block(x, y - h, w, h, c);
    box(x + 3, y - h + 4, w - 6, h / 2 - 6, dk(c)); box(x + 3, y - h / 2 + 2, w - 6, h / 2 - 6, dk(c));
    set(x + w - 5, y - h / 2, 'gold.3'); set(x + w - 5, y - h / 2 + 1, 'gold.1');
  };
  const awning = (x, y, w, c1 = 'red.2', c2 = 'white') => {
    for (let i = 0; i < w; i++) { const c = Math.floor(i / 8) % 2 ? c2 : c1; rect(x + i, y, 1, 10, c); set(x + i, y + 10, dk(c)); }
    for (let i = 0; i < w; i += 8) { const c = Math.floor(i / 8) % 2 ? c2 : c1; ellipse(x + i + 4, y + 11, 4, 3, c, { outline: dk(c, 2) }); }
    rect(x, y, w, 2, dk(c1)); rect(x, y - 2, w, 2, 'ink');
  };
  const shopFront = (x, y, w, h, wallC, awn, { sign = null } = {}) => {
    block(x, y - h, w, h, wallC);
    awning(x - 3, y - h + 14, w + 6, ...awn);
    if (sign) { block(x + 8, y - h + 3, w - 16, 9, sign); rect(x + 12, y - h + 7, w - 24, 1, lt(sign, 2)); }
    window_(x + 8, y - h + 34, (w * 0.42) | 0, 22);
    door(x + w - 28, y, 20, 32);
    shadow(x + w / 2, y, w / 2, 'shade', 3);
  };
  const counter = (x, y, w, c = 'brown.2', top = 'cream.3') => {
    shadow(x + w / 2, y, w / 2 + 4);
    block(x, y - 26, w, 26, c);
    for (let i = x + 6; i < x + w - 10; i += 20) box(i, y - 20, 14, 14, dk(c));
    block(x - 3, y - 31, w + 6, 6, top);
  };
  /** A shelf with things on it: kind = 'boxes' | 'bread' | 'toys' | 'bottles' | 'books'. */
  const shelf = (x, y, w, kind = 'boxes', colors = ['red.2', 'gold.2', 'sky.2', 'pink.2', 'green.2', 'violet.2']) => {
    for (let i = 0, k = 0; i < w - 6; k++) {
      const c = colors[k % colors.length];
      if (kind === 'bread') { ellipse(x + 6 + i, y - 4, 6, 4, c, { outline: dk(c, 2), shade: true }); rect(x + 3 + i, y - 6, 2, 1, lt(c)); rect(x + 7 + i, y - 6, 2, 1, lt(c)); i += 13; }
      else if (kind === 'bottles') { block(x + 2 + i, y - 12, 6, 12, c); rect(x + 4 + i, y - 15, 2, 3, dk(c, 2)); set(x + 3 + i, y - 10, 'white'); i += 9; }
      else if (kind === 'books') { const h = 10 + (k * 7) % 5; flat(x + 2 + i, y - h, 4, h, c); i += 5; }
      else if (kind === 'toys') {
        const t = k % 4;
        if (t === 0) ball(x + 7 + i, y - 6, 5, c);
        else if (t === 1) { block(x + 2 + i, y - 10, 10, 10, c); rect(x + 5 + i, y - 7, 4, 4, lt(c, 2)); }
        else if (t === 2) { disc(x + 7 + i, y - 8, 4, 'brown.2', { outline: 'brown.0' }); disc(x + 4 + i, y - 12, 2, 'brown.2'); disc(x + 10 + i, y - 12, 2, 'brown.2'); set(x + 6 + i, y - 9, 'ink'); set(x + 8 + i, y - 9, 'ink'); rect(x + 4 + i, y - 4, 7, 4, 'brown.2'); }
        else { rect(x + 6 + i, y - 14, 2, 14, 'slate.2'); ellipse(x + 7 + i, y - 14, 4, 3, c); }
        i += 15;
      } else { block(x + 2 + i, y - 11, 10, 11, c); rect(x + 4 + i, y - 8, 3, 2, 'white'); i += 12; }
    }
    block(x, y, w, 4, 'brown.2');
    rect(x, y + 4, w, 1, 'shade');
  };
  const table = (x, y, w = 36, cloth = 'white') => {
    shadow(x + w / 2, y, w / 2 + 2);
    rect(x + w / 2 - 2, y - 18, 4, 18, 'brown.1'); rect(x + w / 2 - 9, y - 2, 18, 2, 'brown.0');
    block(x, y - 24, w, 6, cloth);
    for (let i = 0; i < w; i += 6) rect(x + i, y - 18, 3, 3, cloth); // scalloped edge
  };
  const chair = (x, y, c = 'red.2') => { flat(x, y - 24, 3, 24, dk(c)); flat(x, y - 12, 14, 3, c); rect(x + 12, y - 9, 2, 9, dk(c)); };
  const rug = (cx, cy, rx, ry, c1 = 'pink.2', c2 = 'pink.3') => { ellipse(cx, cy, rx, ry, c1, { outline: dk(c1) }); ellipse(cx, cy, rx - 6, ry - 3, c2); ellipse(cx, cy, rx - 12, ry - 6, c1); };
  const frame = (x, y, w, h, art = 'sky.2') => { block(x, y, w, h, 'gold.2'); rect(x + 3, y + 3, w - 6, h - 6, art); rect(x + 3, y + h - 8, w - 6, 5, 'green.2'); disc(x + w - 9, y + 9, 3, 'gold.3'); };
  const clock = (x, y, r = 10) => { disc(x, y, r + 2, 'brown.2', { outline: 'brown.0' }); disc(x, y, r, 'white', { outline: 'mist' }); line(x, y, x, y - r + 3, 'ink'); line(x, y, x + r - 4, y, 'ink'); set(x, y, 'red.1'); };
  const water = (y, c = 'sky.2') => {
    rect(0, y, RW, RH - y, c);
    for (let yy = y + 3, r = 0; yy < RH; yy += 6 + r, r++) for (let x = (yy * 7) % 26; x < RW; x += 26) { rect(x, yy, 7 + r, 1, lt(c)); rect(x + 9 + r, yy + 1, 3, 1, dk(c)); }
  };
  const star = (x, y, c = 'gold.3', big = false) => { set(x, y, 'white'); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) set(x + dx, y + dy, c); if (big) for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) set(x + dx, y + dy, dk(c)); };
  const curtain = (x, w, h, c = 'red.1') => {
    rect(x, 0, w, h, c);
    for (let i = 0; i < w; i += 8) { rect(x + i + 1, 0, 2, h, lt(c)); rect(x + i + 5, 0, 2, h, dk(c)); }
    rect(x, h - 4, w, 4, dk(c));
  };
  /** Little flags on a sagging string. */
  const bunting = (y, sag = 10, colors = ['red.2', 'gold.2', 'sky.2', 'green.2', 'pink.2']) => {
    for (let x = 0; x < RW; x++) set(x, y + Math.round(Math.sin((x / RW) * Math.PI) * sag), 'ink');
    for (let x = 6, k = 0; x < RW - 4; x += 14, k++) {
      const yy = y + Math.round(Math.sin((x / RW) * Math.PI) * sag) + 1, c = colors[k % colors.length];
      for (let j = 0; j < 7; j++) rect(x - 3 + (j >> 1), yy + j, 7 - j, 1, c);
    }
  };
  const stringLights = (y, sag = 8, colors = ['gold.3', 'pink.2', 'sky.3']) => {
    for (let x = 0; x < RW; x++) set(x, y + Math.round(Math.sin((x / RW) * Math.PI) * sag), 'ink');
    for (let x = 8, k = 0; x < RW; x += 16, k++) { const yy = y + Math.round(Math.sin((x / RW) * Math.PI) * sag) + 2; disc(x, yy, 2, colors[k % colors.length]); set(x - 1, yy - 1, 'white'); }
  };
  return {
    bm, set, get, rect, box, line, dither, block, flat, ellipse, disc, ball, shadow, sky, cloud, skyline, hills, grass, path,
    tiles, planks, cobbles, wall, floorShadow, tree, pine, bush, flower, flowers, pot, lamp, bench, window: window_, door, awning,
    shopFront, counter, shelf, table, chair, rug, frame, clock, water, star, curtain, bunting, stringLights,
  };
}

// ---------------------------------------------------------------- the places
const SCENES = {
  // ---- downtown ----
  square(k) {
    k.sky('sky.2', 'sky.3'); k.cloud(60, 26); k.cloud(196, 40, 0.8);
    k.skyline(HZ - 60, 'sky.2', 3);
    k.shopFront(4, HZ, 72, 74, 'pink.3', ['pink.2', 'white'], { sign: 'pink.1' });
    k.shopFront(180, HZ, 72, 80, 'gold.3', ['sky.2', 'white'], { sign: 'sky.1' });
    // town hall
    k.block(90, HZ - 100, 76, 100, 'cream.3');
    for (let j = 0; j < 22; j++) k.rect(128 - (j * 2 + 6), HZ - 122 + j, j * 4 + 12, 1, j % 6 === 5 ? 'red.0' : 'red.1'); // pediment roof
    k.rect(86, HZ - 101, 84, 3, 'red.0');
    k.clock(128, HZ - 104, 8);
    for (const x of [96, 150]) k.block(x, HZ - 92, 8, 92, 'white');
    for (const x of [108, 136]) k.window(x, HZ - 80, 12, 18);
    k.door(117, HZ, 22, 38, 'red.1');
    k.cobbles(HZ, 'slate.3');
    k.bunting(8, 14);
    // fountain
    k.shadow(128, 244, 54, 'slate.1', 6);
    k.ellipse(128, 236, 52, 13, 'slate.2', { outline: 'slate.0' }); k.ellipse(128, 234, 45, 9, 'sky.2'); k.dither(84, 234, 88, 4, C('sky.3'));
    k.block(124, 198, 8, 38, 'slate.3');
    k.ellipse(128, 198, 20, 5, 'slate.2', { outline: 'slate.0' }); k.ellipse(128, 197, 15, 3, 'sky.2');
    for (const [dx, dy] of [[-10, -8], [10, -8], [-16, -2], [16, -2], [0, -16], [-5, -13], [5, -13]]) { k.set(128 + dx, 194 + dy, 'sky.3'); k.set(128 + dx, 195 + dy, 'white'); }
    k.lamp(26, 246); k.lamp(230, 246);
    k.pot(56, 214, 'green.2', 'brown.2'); k.pot(200, 214, 'green.2', 'brown.2');
  },
  park(k) {
    k.sky('sky.2', 'sky.3'); k.cloud(70, 30); k.cloud(204, 22, 0.7);
    k.hills(HZ - 8, 'green.3', 8, 31, 20); k.hills(HZ, 'green.2', 5, 19);
    for (let x = 10; x < RW; x += 34) k.pine(x, HZ - 6, 22, 'green.1');
    k.grass(HZ); k.path(HZ, 'cream.2');
    k.tree(30, HZ + 30, 1.1); k.tree(226, HZ + 22, 0.95);
    // pond with lily pads, reeds and a duck
    k.ellipse(212, 236, 36, 11, 'sky.2', { outline: 'blue.1' }); k.ellipse(206, 233, 20, 4, 'sky.3');
    k.ellipse(196, 238, 5, 2, 'green.2'); k.ellipse(228, 240, 4, 2, 'green.2'); k.set(228, 239, 'pink.2');
    for (const x of [182, 185, 246]) k.rect(x, 222, 1, 10, 'green.1');
    k.ellipse(214, 230, 5, 3, 'white', { outline: 'mist' }); k.disc(219, 227, 3, 'white'); k.set(222, 227, 'orange.2'); k.set(220, 226, 'ink');
    k.bench(16, 222);
    k.flowers(146, 198, 6, 'pink.2'); k.flowers(72, 204, 5, 'violet.2');
    for (const [x, y] of [[150, 150], [164, 140]]) { k.set(x, y, 'pink.2'); k.set(x + 2, y, 'pink.2'); k.set(x + 1, y + 1, 'ink'); } // butterflies
  },
  playground(k) {
    k.sky('sky.2', 'sky.3'); k.cloud(46, 26); k.cloud(200, 50, 0.6);
    k.hills(HZ - 18, 'green.3', 4, 27);
    // picket fence and bushes
    for (let x = 2; x < RW; x += 12) { k.rect(x, HZ - 22, 7, 22, 'white'); for (let j = 0; j < 3; j++) k.rect(x + j, HZ - 25 + j, 7 - j * 2, 1, 'white'); k.rect(x + 6, HZ - 20, 1, 20, 'mist'); }
    k.rect(0, HZ - 16, RW, 3, 'white'); k.rect(0, HZ - 7, RW, 3, 'white');
    k.grass(HZ);
    k.ellipse(128, 238, 96, 22, 'gold.3', { outline: 'gold.2' }); k.dither(40, 228, 176, 20, C('gold.2')); // sandpit
    // swing set
    k.shadow(62, 216, 46, 'green.0');
    for (const x of [20, 102]) { k.line(x, 216, x + 6, 114, 'red.1'); k.line(x + 1, 216, x + 7, 114, 'red.1'); k.line(x + 14, 216, x + 8, 114, 'red.1'); k.line(x + 15, 216, x + 9, 114, 'red.1'); }
    k.block(20, 110, 98, 6, 'red.2');
    for (const sx of [40, 76]) { k.rect(sx, 116, 1, 62, 'slate.1'); k.rect(sx + 14, 116, 1, 62, 'slate.1'); k.block(sx - 2, 178, 19, 5, 'sky.2'); }
    // slide with ladder
    k.shadow(200, 218, 34, 'green.0');
    k.rect(166, 120, 3, 98, 'sky.1'); k.rect(186, 120, 3, 98, 'sky.1');
    for (let y = 130; y < 216; y += 10) k.rect(166, y, 22, 2, 'sky.2');
    k.block(162, 114, 30, 8, 'sky.2');
    for (let i = 0; i < 64; i++) { const x = 190 + i * 0.85, y = 120 + i * 1.5; k.rect(x, y, 13, 2, 'gold.2'); k.set(x, y, 'gold.1'); k.set(x + 12, y + 1, 'gold.1'); }
    // bucket and spade
    k.block(120, 236, 12, 10, 'red.2'); k.rect(122, 233, 8, 1, 'ink'); k.line(140, 244, 148, 232, 'slate.1');
  },
  cafe(k) {
    k.wall('cream.3', 'pink.3', 'stripes', { wainscot: 'pink.2' });
    k.window(16, 34, 60, 46); k.window(180, 34, 60, 46);
    k.awning(14, 26, 66, 'pink.2', 'white'); k.awning(178, 26, 66, 'pink.2', 'white');
    // menu board and hanging lamps
    k.block(102, 22, 52, 36, 'brown.1'); k.flat(105, 25, 46, 30, 'green.0');
    for (let i = 0; i < 4; i++) { k.rect(109, 30 + i * 6, 24 - (i % 2) * 8, 1, 'white'); k.rect(140, 30 + i * 6, 6, 1, 'gold.3'); }
    for (const x of [48, 208]) { k.rect(x, 0, 1, 92, 'ink'); k.ellipse(x, 96, 9, 5, 'gold.2', { outline: 'gold.0' }); k.dither(x - 12, 102, 24, 10, C('gold.3')); }
    k.planks(HZ, 'cream.2'); k.floorShadow();
    k.counter(92, HZ + 18, 72, 'pink.2', 'white');
    // coffee machine and cake stand on the counter
    k.block(100, HZ - 22, 16, 14, 'slate.2'); k.rect(104, HZ - 10, 6, 2, 'ink');
    k.ellipse(146, HZ - 9, 10, 2, 'white', { outline: 'mist' }); k.ellipse(146, HZ - 14, 7, 5, 'pink.3', { outline: 'pink.1', shade: true }); k.set(146, HZ - 20, 'red.2');
    for (const x of [20, 196]) { k.table(x, 248, 40, 'white'); k.disc(x + 14, 222, 3, 'white', { outline: 'mist' }); k.rect(x + 12, 219, 4, 1, 'brown.1'); k.chair(x - 12, 248, 'red.2'); }
  },
  bakery(k) {
    k.wall('gold.3', 'orange.3', 'bricks');
    // shelves of bread and a brick oven
    for (let i = 0; i < 3; i++) k.shelf(10, 62 + i * 30, 84, 'bread', ['orange.2', 'gold.2', 'brown.2']);
    k.block(170, 34, 76, 104, 'red.1'); for (let yy = 38; yy < 136; yy += 8) k.rect(171, yy, 74, 1, 'red.0');
    k.ellipse(208, 98, 24, 20, 'night', { outline: 'red.0' }); k.rect(184, 98, 49, 22, 'night');
    for (let i = 0; i < 4; i++) k.disc(196 + i * 8, 114 - (i % 2) * 3, 4, i % 2 ? 'orange.2' : 'gold.2');
    k.dither(186, 104, 44, 14, C('orange.1'));
    k.tiles(HZ, 'cream.3', 'gold.3'); k.floorShadow();
    // display counter with glass front
    k.counter(54, HZ + 24, 148, 'brown.2', 'cream.3');
    // a glass display case on the counter, full of pastries
    k.flat(60, HZ - 30, 136, 23, 'sky.3', 'slate.1'); k.rect(61, HZ - 29, 134, 1, 'white');
    for (let i = 0; i < 6; i++) { const x = 72 + i * 22; k.ellipse(x, HZ - 13, 8, 4, ['orange.2', 'pink.2', 'gold.2'][i % 3], { outline: 'brown.0', shade: true }); k.rect(x - 3, HZ - 16, 2, 1, 'white'); }
    k.dither(61, HZ - 28, 40, 10, C('white'));
    // flour sacks
    for (const [x, y] of [[14, 236], [30, 240]]) { k.shadow(x, y, 9); k.ellipse(x, y - 9, 8, 10, 'cream.3', { outline: 'cream.0', shade: true }); k.rect(x - 3, y - 18, 6, 2, 'brown.1'); }
  },
  toyshop(k) {
    k.wall('sky.3', 'sky.2', 'dots');
    for (let i = 0; i < 3; i++) { k.shelf(8, 58 + i * 32, 100, 'toys'); k.shelf(148, 58 + i * 32, 100, 'toys', ['violet.2', 'gold.2', 'red.2', 'mint.2']); }
    // a kite on the wall
    for (let j = 0; j < 20; j++) { const half = Math.round((1 - Math.abs(j - 8) / (j < 8 ? 8 : 12)) * 10); k.rect(128 - half, 24 + j, half * 2, 1, j < 8 ? 'red.2' : 'gold.2'); }
    k.line(128, 44, 136, 70, 'ink'); for (const yy of [52, 60]) k.rect(130 + (yy - 44) / 3, yy, 4, 2, 'sky.2');
    k.tiles(HZ, 'pink.3', 'white', 16); k.floorShadow();
    // toy train and a ball on the floor
    k.shadow(128, 246, 34);
    k.block(100, 228, 18, 16, 'red.2'); k.block(104, 220, 8, 8, 'red.1'); k.block(120, 232, 16, 12, 'sky.2'); k.block(138, 232, 16, 12, 'gold.2');
    for (const x of [104, 114, 124, 132, 142, 150]) k.disc(x, 245, 3, 'ink');
    k.ball(32, 238, 10, 'red.2'); k.rect(23, 238, 19, 2, 'white');
    k.shadow(236, 244, 12); k.disc(236, 224, 9, 'brown.2', { outline: 'brown.0', shade: true }); k.disc(229, 216, 4, 'brown.2', { outline: 'brown.0' }); k.disc(243, 216, 4, 'brown.2', { outline: 'brown.0' }); k.disc(236, 240, 11, 'brown.2', { outline: 'brown.0', shade: true }); k.set(233, 222, 'ink'); k.set(239, 222, 'ink'); k.disc(236, 228, 3, 'cream.3');
  },
  boutique(k) {
    k.wall('pink.3', 'pink.2', 'stripes', { wainscot: 'violet.3' });
    // clothes rail with hangers
    k.rect(18, 66, 108, 3, 'slate.1');
    for (const x of [22, 122]) k.rect(x, 66, 3, 104, 'slate.1');
    for (let i = 0; i < 6; i++) {
      const x = 28 + i * 16, c = ['red.2', 'sky.2', 'gold.2', 'violet.2', 'green.2', 'pink.1'][i];
      k.line(x + 6, 69, x + 6, 72, 'ink'); k.line(x, 76, x + 6, 72, 'ink'); k.line(x + 12, 76, x + 6, 72, 'ink');
      k.block(x, 76, 13, 34 + (i % 2) * 8, c);
    }
    // gold-framed mirror and a dress form
    k.ellipse(208, 88, 28, 52, 'gold.1', { outline: 'gold.0' }); k.ellipse(208, 88, 23, 47, 'sky.3'); k.dither(186, 100, 44, 32, C('sky.2'));
    for (let i = 0; i < 18; i++) k.set(198 + i * 0.6, 60 + i, 'white');
    k.shadow(152, HZ + 24, 12);
    k.ellipse(152, HZ - 26, 11, 16, 'cream.3', { outline: 'cream.0', shade: true }); k.ellipse(152, HZ - 14, 14, 9, 'pink.2', { outline: 'pink.0', shade: true });
    k.rect(151, HZ - 6, 2, 30, 'brown.1'); k.rect(144, HZ + 22, 16, 2, 'brown.0');
    k.planks(HZ, 'violet.3'); k.floorShadow();
    k.rug(128, 258, 68, 12, 'pink.2', 'pink.3');
  },
  arcade(k) {
    k.rect(0, 0, RW, HZ + 32, 'indigo.0');
    for (let i = 0; i < 50; i++) k.star((i * 61) % RW, (i * 37) % 60, i % 3 ? 'violet.2' : 'sky.2');
    // neon sign
    k.flat(84, 8, 88, 18, 'night', 'pink.2'); for (let i = 0; i < 5; i++) k.rect(92 + i * 16, 14, 10, 6, ['pink.2', 'sky.2', 'gold.2', 'mint.2', 'violet.2'][i]);
    // cabinets
    for (const [x, c] of [[8, 'red.1'], [64, 'sky.1'], [148, 'gold.1'], [204, 'green.1']]) {
      k.shadow(x + 22, 206, 26, 'night');
      k.block(x, 46, 44, 160, c);
      k.flat(x + 4, 36, 36, 12, 'night', lt(c, 2)); k.rect(x + 8, 40, 28, 4, lt(c, 2));
      k.flat(x + 5, 56, 34, 30, 'night', 'ink');
      k.rect(x + 9, 62, 6, 6, 'mint.2'); k.rect(x + 22, 72, 8, 4, 'pink.2'); k.rect(x + 9, 78, 24, 1, 'sky.2');
      k.dither(x + 5, 56, 34, 30, C('indigo.1'), 1);
      k.block(x + 2, 92, 40, 14, 'slate.1'); k.disc(x + 13, 98, 3, 'red.2', { outline: 'red.0' }); k.rect(x + 12, 92, 2, 6, 'ink'); k.disc(x + 26, 99, 2, 'sky.2'); k.disc(x + 33, 99, 2, 'gold.2');
      k.flat(x + 16, 120, 12, 16, 'night', 'ink'); k.rect(x + 20, 124, 4, 1, 'gold.2');
    }
    // claw machine in the middle
    k.block(110, 70, 36, 136, 'pink.2'); k.flat(114, 76, 28, 56, 'sky.3', 'pink.0');
    for (let i = 0; i < 6; i++) k.disc(118 + (i % 3) * 9, 124 - Math.floor(i / 3) * 6, 3, ['gold.2', 'violet.2', 'mint.2'][i % 3]);
    k.rect(127, 76, 1, 18, 'ink'); k.line(123, 98, 127, 94, 'ink'); k.line(131, 98, 127, 94, 'ink');
    // arcade carpet
    for (let y = HZ + 32; y < RH; y++) for (let x = 0; x < RW; x++) k.set(x, y, (Math.floor(x / 10) * 3 + Math.floor((y - HZ) / 8) * 5) % 7 === 0 ? 'pink.2' : ((x + y) % 19 === 0 ? 'sky.2' : 'indigo.1'));
    k.rect(0, HZ + 32, RW, 1, 'violet.1');
  },
  hospital(k) {
    k.wall('white', 'mint.3', 'stripes', { wainscot: 'mint.2' });
    k.flat(22, 30, 38, 38, 'white', 'red.1'); k.rect(37, 36, 8, 26, 'red.2'); k.rect(28, 45, 26, 8, 'red.2');
    k.window(84, 30, 50, 40);
    k.clock(160, 44, 9);
    // bed with a curtain rail
    k.rect(176, 20, 80, 2, 'slate.1');
    for (let x = 178; x < RW; x += 4) k.rect(x, 22, 2, 70, x % 8 ? 'mint.2' : 'mint.1');
    k.shadow(212, HZ + 4, 40);
    k.block(172, 136, 6, 44, 'slate.2'); k.block(246, 146, 6, 34, 'slate.2');
    k.block(176, 148, 72, 12, 'white'); k.block(180, 142, 20, 8, 'sky.3'); k.block(198, 146, 50, 10, 'sky.2');
    // drip stand and medicine cabinet
    k.rect(154, 90, 2, 84, 'slate.1'); k.block(148, 84, 14, 18, 'sky.3'); k.line(155, 102, 168, 140, 'mist');
    k.block(10, 104, 52, 64, 'slate.3'); k.rect(36, 105, 1, 62, 'slate.1');
    k.shelf(14, 126, 20, 'bottles', ['red.2', 'sky.2', 'gold.2']); k.shelf(40, 126, 20, 'bottles', ['mint.2', 'pink.2']);
    k.tiles(HZ, 'mint.3', 'white', 20); k.floorShadow('mint.1');
    k.pot(80, 206, 'green.2', 'sky.1');
  },
  // ---- uptown ----
  dept(k) {
    k.wall('cream.3', 'gold.3', 'diamonds');
    k.block(70, 10, 116, 22, 'red.1'); k.rect(78, 18, 100, 6, 'white'); for (let i = 0; i < 8; i++) k.rect(82 + i * 12, 19, 6, 4, 'red.1'); // SALE banner
    for (let i = 0; i < 3; i++) { k.shelf(6, 64 + i * 30, 66, 'boxes'); k.shelf(184, 64 + i * 30, 66, 'boxes', ['red.2', 'blue.2', 'gold.2']); }
    // escalator with glass rails
    for (let i = 0; i < 14; i++) { k.rect(92 + i * 5, 168 - i * 8, 22, 3, 'slate.2'); k.rect(92 + i * 5, 171 - i * 8, 22, 1, 'slate.0'); }
    k.line(88, 166, 158, 54, 'slate.0'); k.line(116, 172, 184, 60, 'slate.0');
    k.line(88, 160, 158, 48, 'sky.3'); k.line(116, 166, 184, 54, 'sky.3');
    k.tiles(HZ, 'white', 'mist', 24); k.floorShadow('silver');
    // display table and shopping bags
    k.shadow(220, 236, 24); k.block(196, 210, 48, 10, 'white'); k.rect(200, 220, 4, 16, 'slate.1'); k.rect(236, 220, 4, 16, 'slate.1');
    for (const [x, c] of [[204, 'pink.2'], [218, 'sky.2'], [230, 'gold.2']]) k.block(x, 200, 10, 10, c);
    for (const [x, c] of [[20, 'red.2'], [34, 'violet.2']]) { k.shadow(x + 6, 244, 8); k.block(x, 228, 13, 16, c); k.ellipse(x + 6, 228, 4, 4, c, { outline: dk(c, 2) }); }
  },
  salon(k) {
    k.wall('violet.3', 'pink.3', 'dots', { wainscot: 'violet.2' });
    for (const x of [30, 154]) {
      // mirror with bulbs
      k.block(x, 34, 72, 76, 'white'); k.flat(x + 6, 40, 60, 64, 'sky.3', 'mist'); k.dither(x + 6, 76, 60, 28, C('sky.2'));
      for (let i = 0; i < 12; i++) k.set(x + 14 + i, 62 - i, 'white');
      for (let i = 0; i < 5; i++) { k.disc(x + 8 + i * 14, 36, 3, 'gold.3', { outline: 'gold.1' }); }
      // chair
      k.shadow(x + 36, 214, 24);
      k.block(x + 16, 150, 40, 26, 'pink.1'); k.block(x + 20, 118, 32, 34, 'pink.1'); k.rect(x + 34, 176, 4, 34, 'slate.1'); k.block(x + 22, 208, 28, 4, 'slate.1');
    }
    // hood dryer and product shelf
    k.shelf(108, 40, 40, 'bottles', ['pink.2', 'violet.2', 'mint.2']); k.shelf(108, 70, 40, 'bottles', ['gold.2', 'sky.2']);
    k.ellipse(128, 120, 16, 12, 'mist', { outline: 'gray', shade: true }); k.rect(127, 132, 2, 76, 'slate.1'); k.rect(118, 206, 20, 3, 'slate.0');
    k.tiles(HZ, 'white', 'violet.3', 16); k.floorShadow();
  },
  school(k) {
    k.wall('lime.3', 'cream.3', 'bricks', { wainscot: 'brown.2' });
    // chalkboard with lessons
    k.block(50, 22, 156, 76, 'brown.2'); k.flat(56, 28, 144, 62, 'green.0', 'green.0'); k.dither(56, 28, 144, 62, C('green.1'), 1);
    k.rect(66, 38, 6, 1, 'white'); k.rect(74, 38, 30, 1, 'white'); k.rect(66, 48, 52, 1, 'white'); k.rect(66, 58, 24, 1, 'white'); k.rect(66, 68, 40, 1, 'gold.3');
    for (let i = 0; i < 4; i++) k.disc(150 + i * 10, 52, 3, ['pink.2', 'sky.2', 'gold.2', 'white'][i]); // "1 + 1" in dots
    k.line(140, 70, 186, 70, 'white'); k.rect(62, 90, 36, 3, 'white'); // chalk ledge
    k.clock(228, 36, 10);
    // ABC banner and a globe
    for (let i = 0; i < 5; i++) k.block(8 + i * 8, 10, 7, 9, ['red.2', 'gold.2', 'sky.2', 'green.2', 'violet.2'][i]);
    k.shadow(228, 160, 10); k.disc(228, 136, 11, 'sky.2', { outline: 'blue.1', shade: true }); k.ellipse(224, 132, 5, 4, 'green.2'); k.ellipse(232, 140, 3, 3, 'green.2'); k.rect(227, 147, 2, 10, 'brown.1'); k.rect(220, 157, 16, 3, 'brown.0');
    k.planks(HZ, 'gold.2'); k.floorShadow();
    // desks with books
    for (const x of [18, 186]) { k.shadow(x + 26, 244, 30); k.block(x, 212, 52, 7, 'brown.2'); k.rect(x + 4, 219, 3, 25, 'slate.1'); k.rect(x + 45, 219, 3, 25, 'slate.1'); k.block(x + 8, 206, 14, 6, 'red.2'); k.block(x + 24, 207, 12, 5, 'sky.2'); }
  },
  work(k) {
    k.wall('slate.3', 'slate.2', 'bricks');
    k.window(18, 30, 54, 40);
    // pegboard with tools
    k.block(96, 24, 92, 62, 'brown.3'); for (let y = 30; y < 82; y += 6) for (let x = 102; x < 184; x += 6) k.set(x, y, 'brown.1');
    k.line(110, 34, 110, 70, 'slate.0'); k.block(104, 30, 12, 8, 'red.2'); // hammer
    k.line(130, 34, 140, 72, 'slate.1'); k.line(140, 34, 130, 72, 'slate.1'); k.disc(130, 74, 3, 'red.2'); k.disc(140, 74, 3, 'red.2'); // pliers
    k.rect(158, 34, 3, 34, 'gold.2'); k.rect(156, 66, 7, 12, 'slate.0'); // screwdriver
    k.disc(176, 52, 7, 'slate.1', { outline: 'slate.0' }); k.disc(176, 52, 2, 'brown.3');
    // big gears
    const gear = (cx, cy, r, c) => { for (let a = 0; a < 10; a++) k.disc(cx + Math.cos(a * Math.PI / 5) * r, cy + Math.sin(a * Math.PI / 5) * r, 4, c); k.disc(cx, cy, r, c, { outline: dk(c, 2), shade: true }); k.disc(cx, cy, r / 3, 'slate.3', { outline: dk(c, 2) }); };
    gear(222, 62, 18, 'slate.1'); gear(232, 104, 11, 'gold.2');
    k.planks(HZ, 'slate.2'); k.floorShadow();
    // workbench with a vise, crates
    k.shadow(56, 246, 50); k.block(8, 198, 96, 8, 'brown.2'); k.rect(14, 206, 4, 40, 'brown.1'); k.rect(92, 206, 4, 40, 'brown.1'); k.block(18, 214, 72, 6, 'brown.1');
    k.block(70, 186, 22, 12, 'slate.1'); k.rect(78, 182, 6, 4, 'slate.0'); k.block(26, 188, 20, 10, 'red.2');
    for (const [x, y] of [[214, 246], [236, 246], [224, 226]]) { k.block(x - 10, y - 20, 20, 20, 'gold.2'); k.line(x - 9, y - 19, x + 8, y - 2, 'gold.0'); }
  },
  chapel(k) {
    k.wall('white', 'pink.3', 'stripes');
    // stained glass arch
    k.disc(128, 62, 34, 'gold.1', { outline: 'gold.0' }); k.rect(94, 62, 69, 60, 'gold.1'); k.box(94, 62, 69, 60, 'gold.0');
    k.disc(128, 62, 29, 'sky.2'); k.rect(99, 62, 59, 56, 'sky.2');
    const glass = [['pink.2', 104, 70], ['violet.2', 132, 70], ['mint.2', 104, 94], ['gold.3', 132, 94], ['red.2', 118, 40]];
    for (const [c, x, y] of glass) k.flat(x, y, 20, 20, c, 'ink');
    k.disc(128, 50, 8, 'gold.3', { outline: 'ink' });
    for (let x = 99; x < 158; x += 1) if (x % 14 === 0) k.rect(x, 62, 1, 56, 'ink');
    // candles and flower stands
    for (const x of [30, 226]) {
      k.shadow(x, HZ + 2, 12);
      k.rect(x - 1, 124, 3, 48, 'gold.1'); k.rect(x - 8, 170, 17, 3, 'gold.0');
      for (const [dx, dy, c] of [[-6, -6, 'pink.2'], [6, -6, 'pink.3'], [0, -12, 'white'], [-4, -14, 'pink.3'], [4, -14, 'pink.2']]) k.disc(x + dx, 120 + dy, 5, c, { outline: dk(c, 2) });
    }
    for (const x of [66, 190]) { k.rect(x, 130, 4, 20, 'cream.3'); k.disc(x + 2, 126, 2, 'gold.3'); k.dither(x - 6, 116, 16, 12, C('gold.3')); }
    k.planks(HZ, 'pink.3'); k.floorShadow();
    // aisle with petals, and pews
    for (let y = HZ; y < RH; y++) { const half = 10 + (y - HZ) * 0.3; k.rect(128 - half, y, half * 2, 1, 'red.1'); }
    for (let i = 0; i < 16; i++) k.set(122 + (i * 7) % 14, HZ + 8 + i * 8, 'pink.3');
    for (const x of [4, 182]) for (let r = 0; r < 2; r++) { k.block(x, 196 + r * 34, 70, 8, 'brown.2'); k.block(x, 186 + r * 34, 70, 6, 'brown.1'); }
  },
  studio(k) {
    k.rect(0, 0, RW, RH, 'slate.0');
    for (let x = 0; x < RW; x += 12) k.rect(x, 0, 6, HZ, 'slate.1');
    // sweeping backdrop paper
    k.block(46, 14, 164, 160, 'sky.3', { outline: 'slate.0' });
    for (let y = 120; y < 216; y++) k.rect(47, y, 162, 1, y > 174 ? ((y & 1) ? 'sky.3' : 'mist') : 'sky.3');
    k.dither(47, 150, 162, 24, C('mist'));
    k.rect(40, 10, 176, 6, 'slate.2'); // roll
    k.rect(0, 216, RW, RH - 216, 'slate.1');
    // softbox lights, a stool and a plant
    for (const [x, flip] of [[18, 1], [238, -1]]) {
      k.rect(x - 1, 70, 3, 146, 'ink'); for (const dx of [-8, 8]) k.line(x, 214, x + dx, 222, 'ink');
      for (let j = 0; j < 26; j++) k.rect(x - 14 + (flip > 0 ? 0 : 0), 34 + j, 28, 1, j < 3 || j > 22 ? 'gray' : 'white');
      k.box(x - 14, 34, 28, 26, 'ink');
      k.dither(x - 30 + (flip > 0 ? 40 : 0), 60, 24, 60, C('mist'));
    }
    k.shadow(128, 224, 16, 'slate.0'); k.ellipse(128, 194, 13, 4, 'red.2', { outline: 'red.0' }); for (const dx of [-9, 0, 9]) k.rect(128 + dx, 197, 2, 26, 'slate.2');
    k.pot(200, 214, 'green.2', 'gold.2');
    // camera on a tripod
    k.block(112, 140, 32, 20, 'ink'); k.disc(128, 150, 7, 'slate.2', { outline: 'white' }); k.disc(128, 150, 3, 'night'); k.set(126, 148, 'white'); k.block(118, 134, 10, 6, 'slate.1');
    for (const dx of [-12, 0, 12]) k.line(128, 160, 128 + dx, 222, 'ink');
  },
  // ---- seaside & country ----
  beach(k) {
    k.sky('sky.1', 'sky.2', 118);
    k.disc(210, 34, 16, 'gold.3', { outline: 'gold.2' }); for (let a = 0; a < 8; a++) k.line(210 + Math.cos(a * 0.785) * 20, 34 + Math.sin(a * 0.785) * 20, 210 + Math.cos(a * 0.785) * 26, 34 + Math.sin(a * 0.785) * 26, 'gold.3');
    k.cloud(70, 40, 0.8);
    k.water(118, 'sky.2');
    k.rect(0, 118, RW, 1, 'sky.3'); k.ellipse(60, 120, 18, 3, 'slate.2'); k.rect(57, 112, 6, 6, 'white'); // island with a sail
    for (let i = 0; i < 12; i++) k.star((i * 43) % RW, 126 + (i * 17) % 40, 'white');
    // sand, foam line
    for (let y = 168; y < RH; y++) k.rect(0, y, RW, 1, y < 176 ? 'gold.3' : 'gold.3');
    for (let x = 0; x < RW; x++) { const y = 168 + Math.round(Math.sin(x / 16) * 2); k.set(x, y, 'white'); k.set(x, y - 1, 'sky.3'); if ((x & 1) === 0) k.set(x, y + 2, 'white'); }
    for (let i = 0; i < 60; i++) k.set((i * 47) % RW, 180 + (i * 29) % 130, 'gold.2');
    // palm tree
    k.shadow(40, 214, 26, 'gold.1');
    for (let j = 0; j < 110; j++) { const x = 30 + Math.round(Math.sin(j / 40) * 8); k.rect(x, 104 + j, 7, 1, j % 8 < 2 ? 'brown.1' : 'brown.2'); }
    for (const [dx, dy, r] of [[-26, 4, 18], [-12, -6, 16], [10, -6, 16], [26, 6, 18], [0, 8, 14]]) k.ellipse(34 + dx, 98 + dy, r, 5, 'green.2', { outline: 'green.0', shade: true });
    k.disc(30, 106, 3, 'brown.1'); k.disc(37, 107, 3, 'brown.1');
    // umbrella, towel, sandcastle, crab
    k.shadow(206, 222, 34, 'gold.1');
    k.rect(204, 160, 3, 66, 'white');
    for (let j = 0; j < 16; j++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - ((16 - j) / 16) ** 2)) * 34); for (let i = -half; i < half; i++) k.set(206 + i, 144 + j, Math.floor((i + 34) / 11) % 2 ? 'white' : 'red.2'); }
    k.rect(172, 160, 68, 1, 'red.0');
    k.block(150, 230, 44, 14, 'sky.2'); for (let x = 152; x < 192; x += 6) k.rect(x, 231, 3, 12, 'white');
    k.block(108, 214, 26, 16, 'gold.2'); k.block(112, 204, 8, 10, 'gold.2'); k.block(124, 206, 8, 8, 'gold.2'); k.rect(115, 198, 1, 6, 'ink'); k.rect(116, 198, 4, 3, 'red.2');
    k.ellipse(84, 242, 6, 4, 'red.2', { outline: 'red.0', shade: true }); k.set(80, 238, 'ink'); k.set(88, 238, 'ink'); k.line(77, 240, 74, 236, 'red.1'); k.line(91, 240, 94, 236, 'red.1');
    k.disc(64, 262, 3, 'pink.2', { outline: 'pink.0' });
  },
  forest(k) {
    k.sky('mint.2', 'mint.3');
    for (let i = 0; i < 9; i++) k.pine(8 + i * 30, HZ - 20, 46 + (i % 3) * 10, 'green.0');
    for (let i = 0; i < 7; i++) k.tree(20 + i * 38, HZ - 2 + (i % 2) * 4, 0.75, 'green.1');
    k.grass(HZ, 'green.1');
    // light shafts
    for (const x0 of [80, 150]) for (let y = 0; y < HZ + 40; y++) for (let x = x0 + y * 0.3; x < x0 + y * 0.3 + 14; x++) if (((x + y) & 3) === 0) k.set(x, y, 'mint.3');
    k.tree(26, HZ + 64, 1.25, 'green.2'); k.tree(234, HZ + 54, 1.15, 'green.2');
    // mushrooms, berry bush, log, ferns
    for (const [x, y, s] of [[96, 226, 1], [106, 232, 0.7], [170, 218, 0.8]]) { k.shadow(x, y, 7 * s); k.rect(x - 2, y - 7 * s, 4, 7 * s, 'cream.3'); k.ellipse(x, y - 8 * s, 8 * s, 5 * s, 'red.2', { outline: 'red.0', shade: true }); k.set(x - 3 * s, y - 10 * s, 'white'); k.set(x + 2 * s, y - 9 * s, 'white'); }
    k.bush(146, 206, 'green.2', 18); for (const [x, y] of [[138, 196], [146, 194], [154, 198], [150, 202]]) { k.disc(x, y, 2, 'violet.1'); k.set(x - 1, y - 1, 'violet.3'); }
    k.shadow(128, 246, 30); k.block(98, 228, 56, 14, 'brown.1'); for (let x = 104; x < 150; x += 8) k.rect(x, 230, 1, 10, 'brown.0'); k.ellipse(98, 235, 5, 7, 'brown.2', { outline: 'brown.0' }); k.disc(98, 235, 2, 'brown.0');
    for (const x of [60, 200]) for (let i = 0; i < 5; i++) k.line(x, 216, x - 10 + i * 5, 202 + Math.abs(i - 2) * 2, 'green.2');
  },
  fair(k) {
    k.sky('pink.3', 'gold.3');
    k.cloud(196, 22, 0.7);
    // ferris wheel
    const cx = 64, cy = 88, R = 54;
    k.disc(cx, cy, R, 'pink.3', { outline: 'red.1' }); k.disc(cx, cy, R - 4, 'pink.3', { outline: 'red.2' });
    for (let a = 0; a < 12; a++) {
      const ex = cx + Math.cos(a * Math.PI / 6) * (R - 2), ey = cy + Math.sin(a * Math.PI / 6) * (R - 2);
      k.line(cx, cy, ex, ey, 'red.1');
      if (a % 2 === 0) { k.rect(ex - 1, ey, 2, 4, 'ink'); k.block(ex - 7, ey + 4, 14, 10, ['sky.2', 'gold.2', 'mint.2', 'violet.2', 'red.2', 'sky.1'][a / 2]); }
    }
    k.disc(cx, cy, 6, 'gold.2', { outline: 'gold.0' });
    k.line(cx - 4, cy, cx - 24, HZ, 'slate.1'); k.line(cx + 4, cy, cx + 24, HZ, 'slate.1'); k.line(cx - 3, cy, cx - 23, HZ, 'slate.2'); k.line(cx + 3, cy, cx + 23, HZ, 'slate.2');
    // coaster track on stilts
    for (let x = 134; x < RW; x++) {
      const y = 70 + Math.round(Math.sin((x - 134) / 17) * 28);
      k.rect(x, y, 1, 2, 'sky.1'); k.set(x, y + 4, 'sky.1');
      if (x % 10 === 0) { k.rect(x, y + 4, 2, HZ - y - 4, 'slate.2'); k.set(x, y + 4, 'slate.0'); }
    }
    k.block(196, 34, 22, 12, 'red.2'); k.disc(200, 47, 2, 'ink'); k.disc(214, 47, 2, 'ink');
    k.grass(HZ, 'green.2'); k.path(HZ, 'pink.3', 26);
    k.stringLights(12, 10);
    // striped tents and a popcorn cart
    for (const [x, c] of [[156, 'red.2'], [210, 'sky.2']]) {
      k.shadow(x + 20, HZ + 4, 24);
      for (let j = 0; j < 24; j++) { const half = 4 + j; for (let i = -half; i < half; i++) k.set(x + 20 + i, HZ - 46 + j, Math.floor((i + 40) / 6) % 2 ? 'white' : c); }
      k.block(x - 4, HZ - 22, 48, 22, c); k.rect(x + 14, HZ - 16, 12, 16, 'night'); k.rect(x + 19, HZ - 52, 1, 6, 'ink'); k.rect(x + 20, HZ - 52, 5, 3, 'gold.2');
    }
    k.shadow(26, 226, 18); k.block(10, 192, 32, 30, 'red.2'); k.flat(14, 180, 24, 12, 'sky.3', 'slate.1'); for (const [x, y] of [[18, 184], [24, 182], [30, 185], [21, 188], [28, 188]]) k.disc(x, y, 2, 'cream.3'); k.disc(16, 224, 4, 'ink'); k.disc(36, 224, 4, 'ink');
    for (let i = 0; i < 3; i++) { const x = 230 + i * 8; k.line(x, 230, x - 2, 196, 'ink'); k.ball(x - 2, 192, 5, ['red.2', 'gold.2', 'violet.2'][i]); }
  },
  stage(k) {
    k.rect(0, 0, RW, RH, 'indigo.0');
    k.rect(44, 24, 168, HZ - 24, 'violet.0'); k.dither(44, 24, 168, HZ - 24, C('indigo.0'));
    // spotlights
    for (const cx of [86, 170]) for (let y = 20; y < HZ + 20; y++) {
      const half = Math.round(4 + (y - 20) * 0.24);
      for (let x = cx - half; x < cx + half; x++) k.set(x, y, ((x + y) & 1) === 0 ? 'gold.3' : 'violet.1');
    }
    k.curtain(0, 46, HZ + 14); k.curtain(RW - 46, 46, HZ + 14);
    // valance with tassels
    k.rect(0, 0, RW, 16, 'red.1'); for (let x = 0; x < RW; x += 16) { k.ellipse(x + 8, 16, 8, 6, 'red.1', { outline: 'red.0' }); k.rect(x + 7, 20, 2, 6, 'gold.2'); k.disc(x + 8, 27, 2, 'gold.2'); }
    k.rect(0, 0, RW, 3, 'gold.2'); k.rect(0, 3, RW, 1, 'gold.0');
    k.planks(HZ, 'brown.2');
    k.block(0, HZ + 34, RW, 10, 'brown.1'); for (let x = 12; x < RW; x += 28) { k.disc(x, HZ + 38, 3, 'gold.3'); k.dither(x - 6, HZ + 28, 12, 6, C('gold.3')); } // footlights
    // microphone
    k.shadow(128, 226, 8); k.rect(127, 182, 2, 44, 'slate.1'); k.rect(122, 224, 12, 2, 'ink'); k.ellipse(128, 178, 3, 4, 'slate.2', { outline: 'ink' });
    // audience
    k.rect(0, HZ + 44, RW, RH - HZ - 44, 'indigo.0');
    for (let r = 0; r < 3; r++) for (let x = (r % 2) * 9 + 4; x < RW; x += 18) { k.ellipse(x, HZ + 58 + r * 16, 8, 8, r ? 'indigo.1' : 'violet.0'); if (r === 0 && x % 36 < 18) { k.disc(x - 5, HZ + 50, 2, 'violet.0'); k.disc(x + 5, HZ + 50, 2, 'violet.0'); } }
  },
  // ---- far away ----
  castle(k) {
    k.sky('violet.3', 'pink.3'); k.cloud(40, 30, 0.7); k.cloud(222, 54, 0.6);
    k.hills(HZ - 2, 'green.3', 5, 30);
    const roof = (x, w, top, c = 'violet.1') => { for (let j = 0; j < w * 1.1; j++) { const half = Math.round(1 + j * 0.48); k.rect(x + w / 2 - half, top + j, half * 2, 1, j % 6 === 5 ? dk(c) : c); k.set(x + w / 2 + half - 1, top + j, dk(c)); } };
    for (const x of [30, 194]) { k.block(x, 46, 32, HZ - 46, 'slate.3'); roof(x - 2, 36, 8); k.window(x + 11, 70, 10, 16, 'gold.3', 'slate.2', { cross: false }); k.rect(x + 15, 2, 1, 10, 'ink'); k.rect(x + 16, 2, 10, 6, 'red.2'); }
    k.block(62, 72, 132, HZ - 72, 'slate.3');
    for (let x = 62; x < 194; x += 12) k.block(x, 62, 8, 12, 'slate.3');
    // brick texture, banners, windows, gate
    for (let y = 80; y < HZ - 6; y += 9) for (let x = 66 + (y % 18 ? 0 : 7); x < 190; x += 14) k.rect(x, y, 10, 1, 'slate.2');
    for (const x of [78, 166]) { k.block(x, 78, 12, 34, 'red.2'); for (let j = 0; j < 6; j++) k.rect(x + j, 112 + j, 12 - j * 2, 1, 'red.2'); k.disc(x + 6, 90, 3, 'gold.2'); }
    for (const x of [102, 146]) k.window(x, 90, 10, 16, 'gold.3', 'slate.2', { cross: false });
    k.rect(110, 118, 36, HZ - 118, 'brown.1'); k.disc(128, 118, 18, 'brown.1', { outline: 'slate.0' }); k.box(110, 118, 36, HZ - 118, 'slate.0');
    for (let x = 114; x < 144; x += 6) k.rect(x, 104, 1, HZ - 104, 'brown.0');
    k.rect(127, 22, 1, 40, 'ink'); k.rect(128, 22, 16, 10, 'gold.2'); k.disc(134, 27, 2, 'red.2');
    k.grass(HZ, 'green.2'); k.path(HZ, 'slate.3', 18);
    // hedges and flowers along the path
    for (const x of [24, 232]) k.bush(x, 214, 'green.1', 20);
    k.flowers(56, 236, 5, 'violet.2'); k.flowers(178, 238, 5, 'red.2');
    k.lamp(80, 216, false); k.lamp(176, 216, false);
  },
  starisle(k) {
    // night sky with a galaxy band
    for (let y = 0; y < RH; y++) k.rect(0, y, RW, 1, y < 60 || y > HZ + 40 ? 'indigo.0' : y < 120 ? (((y >> 1) & 1) ? 'indigo.0' : 'violet.0') : 'violet.0');
    for (let i = 0; i < 40; i++) k.star((i * 53) % RW, HZ + 54 + (i * 31) % (RH - HZ - 56), i % 4 ? 'violet.2' : 'gold.3');
    for (let x = 0; x < RW; x++) for (let j = -10; j < 10; j++) { const y = 70 - x * 0.18 + j; if (((x + j) % 3) === 0 && Math.abs(j) < 10 - (x % 7)) k.set(x, y, j % 4 ? 'violet.1' : 'pink.2'); }
    for (let i = 0; i < 80; i++) k.star((i * 71) % RW, (i * 43) % 170, i % 5 ? 'gold.3' : 'pink.3', i % 11 === 0);
    k.disc(208, 36, 15, 'gold.3', { outline: 'gold.2' }); k.disc(214, 32, 13, 'indigo.0');
    // little floating rocks
    for (const [x, y, r] of [[30, 120, 10], [222, 104, 8]]) { k.ellipse(x, y, r, r / 2, 'violet.2', { outline: 'violet.0', shade: true }); k.ellipse(x, y - r / 3, r, r / 4, 'mint.2'); }
    // the island
    for (let j = 0; j < 46; j++) { const half = Math.round(122 * Math.sqrt(1 - (j / 46) ** 2)); k.rect(128 - half, HZ + 4 + j, half * 2, 1, j % 8 < 2 ? 'violet.1' : 'violet.2'); k.set(128 + half - 1, HZ + 4 + j, 'violet.0'); }
    k.ellipse(128, HZ + 4, 124, 16, 'mint.2', { outline: 'mint.0' }); k.ellipse(110, HZ, 90, 8, 'mint.3');
    for (let i = 0; i < 30; i++) k.set(20 + (i * 37) % 216, HZ - 4 + (i * 13) % 16, 'mint.1');
    // the wishing crystal, glowing
    for (let j = -22; j <= 22; j++) for (let i = -22; i <= 22; i++) if (i * i + j * j < 480 && ((i + j) & 1) === 0) k.set(128 + i, HZ - 36 + j, 'sky.1');
    for (let y = 0; y < 52; y++) { const half = Math.round((1 - Math.abs(y - 18) / (y < 18 ? 18 : 34)) * 11); k.rect(128 - half, HZ - 56 + y, half, 1, 'sky.3'); k.rect(128, HZ - 56 + y, half, 1, 'sky.2'); k.set(128 - half, HZ - 56 + y, 'blue.1'); k.set(128 + half - 1, HZ - 56 + y, 'blue.1'); }
    k.star(122, HZ - 46, 'white');
    // glowing mushrooms
    for (const [x, c] of [[56, 'pink.2'], [74, 'violet.2'], [196, 'sky.2']]) { k.rect(x - 2, HZ - 10, 4, 12, 'cream.3'); k.ellipse(x, HZ - 12, 11, 6, c, { outline: dk(c, 2), shade: true }); for (const dx of [-5, 0, 5]) k.set(x + dx, HZ - 14, 'white'); }
  },
  // ---- hidden ----
  hidden(k) {
    k.sky('orange.3', 'gold.3'); k.disc(54, 50, 20, 'orange.2', { outline: 'orange.1' }); k.disc(54, 50, 14, 'gold.3');
    // mountains
    for (const [cx, h, c] of [[60, 70, 'violet.2'], [170, 90, 'violet.1'], [250, 60, 'violet.2']]) for (let j = 0; j < h; j++) { const half = Math.round(j * 1.2); k.rect(cx - half, HZ - 20 - h + j, half * 2, 1, j < 12 ? 'white' : c); k.set(cx + half - 1, HZ - 20 - h + j, dk(c)); }
    k.hills(HZ - 14, 'green.1', 5, 26); k.hills(HZ, 'lime.1', 4, 18, 40);
    // thatched cottages
    for (const [x, roofC] of [[14, 'gold.1'], [100, 'orange.1'], [186, 'gold.1']]) {
      k.shadow(x + 28, HZ + 2, 30);
      k.block(x, HZ - 48, 56, 48, 'cream.3');
      for (let j = 0; j < 30; j++) { const half = Math.round(4 + j * 1.05); k.rect(x + 28 - half, HZ - 74 + j, half * 2, 1, j % 5 === 4 ? dk(roofC) : roofC); }
      for (let i = 0; i < 10; i++) k.line(x + 28 - i * 3, HZ - 74 + i * 3, x + 28 - i * 3 - 4, HZ - 46, dk(roofC));
      k.door(x + 8, HZ, 16, 28, 'brown.1'); k.window(x + 34, HZ - 38, 12, 12, 'gold.3', 'brown.2', { cross: true });
    }
    k.grass(HZ, 'lime.2'); k.path(HZ, 'brown.3', 16);
    // a well, lanterns and fireflies
    k.shadow(56, 228, 18); k.block(40, 202, 32, 22, 'slate.3'); for (let y = 206; y < 222; y += 6) k.rect(41, y, 30, 1, 'slate.2');
    k.rect(42, 176, 3, 26, 'brown.1'); k.rect(67, 176, 3, 26, 'brown.1'); for (let j = 0; j < 8; j++) k.rect(38 + j, 168 + j, 36 - j * 2, 1, 'brown.2');
    k.rect(55, 184, 1, 14, 'ink'); k.block(51, 196, 10, 8, 'brown.2');
    for (let x = 0; x < RW; x++) k.set(x, 104 + Math.round(Math.sin(x / 40) * 6), 'ink');
    for (let x = 20; x < RW; x += 40) { const y = 112 + Math.round(Math.sin(x / 40) * 6); k.dither(x - 9, y - 9, 18, 18, C('gold.3')); k.ellipse(x, y, 5, 6, 'red.2', { outline: 'red.0', shade: true }); k.rect(x - 2, y - 7, 5, 2, 'ink'); k.rect(x - 1, y + 2, 3, 1, 'gold.3'); }
    for (let i = 0; i < 14; i++) { const x = (i * 59) % RW, y = 140 + (i * 23) % 70; k.set(x, y, 'gold.3'); k.set(x + 1, y, 'lime.3'); }
    k.tree(236, HZ + 66, 1, 'green.2'); k.flowers(150, 240, 5, 'gold.2');
  },
};

// ---------------------------------------------------------------- travel
/** A vehicle for the trip between districts, drawn straight to the screen at (x, y) (normal pixels). */
export function drawVehicle(scr, kind, x, y, t) {
  const r = (a, b, w, h, c) => scr.rect(Math.round(x + a), Math.round(y + b), w, h, C(c));
  const bob = Math.floor(t / 150) % 2;
  if (kind === 'bus') {
    r(0, -24 - bob, 56, 20, 'gold.2'); r(1, -23 - bob, 54, 2, 'gold.3'); r(0, -7 - bob, 56, 2, 'gold.1');
    scr.box(Math.round(x), Math.round(y - 24 - bob), 56, 20, C('gold.0'));
    for (let i = 0; i < 4; i++) { r(4 + i * 12, -21 - bob, 9, 7, 'sky.3'); r(5 + i * 12, -20 - bob, 2, 2, 'white'); }
    r(0, -12 - bob, 56, 2, 'red.1');
    for (const wx of [10, 42]) { scr.rect(Math.round(x + wx - 4), Math.round(y - 6), 9, 6, C('ink')); r(wx - 1, -4, 3, 2, 'silver'); }
  } else if (kind === 'train') {
    r(0, -26, 34, 22, 'red.1'); r(1, -25, 32, 2, 'red.2'); scr.box(Math.round(x), Math.round(y - 26), 34, 22, C('red.0'));
    r(4, -22, 10, 8, 'sky.3'); r(24, -34, 6, 8, 'ink'); r(30, -10, 6, 6, 'slate.1');
    r(-40, -22, 36, 18, 'sky.1'); r(-39, -21, 34, 2, 'sky.2'); scr.box(Math.round(x - 40), Math.round(y - 22), 36, 18, C('blue.1'));
    for (let i = 0; i < 3; i++) r(-36 + i * 11, -19, 8, 6, 'sky.3');
    for (const wx of [6, 26, -34, -14]) scr.rect(Math.round(x + wx), Math.round(y - 5), 6, 5, C('ink'));
    if (bob) { r(26, -40, 4, 3, 'mist'); r(30, -44, 5, 4, 'white'); }
  } else if (kind === 'balloon') {
    for (let j = -14; j <= 14; j++) {
      const half = Math.round(Math.sqrt(Math.max(0, 196 - j * j)));
      for (let i = -half; i < half; i++) scr.rect(Math.round(x + i), Math.round(y - 60 + j + bob), 1, 1, C(Math.floor((i + 14) / 5) % 2 ? 'gold.2' : 'red.2'));
      scr.rect(Math.round(x + half - 2), Math.round(y - 60 + j + bob), 2, 1, C('red.0'));
    }
    r(-6, -58 + bob, 3, 3, 'white');
    r(-1, -46 + bob, 1, 12, 'ink'); r(5, -46 + bob, 1, 12, 'ink');
    r(-6, -34 + bob, 18, 8, 'brown.2'); r(-5, -33 + bob, 16, 1, 'brown.3'); scr.box(Math.round(x - 6), Math.round(y - 34 + bob), 18, 8, C('brown.0'));
  }
}
