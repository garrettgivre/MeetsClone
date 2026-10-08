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
import { PROPS, stampProp } from './props.js';

export const RW = W * HD;               // 256
export const RH = LAYOUT.room.h * HD;   // 312
export const HZ = 172;                  // where the back wall / horizon meets the ground
export const FEET = 228;                // where pets stand (hi-res, inside the room)

const cache = new Map();

function draw(id) {
  if (!cache.has(id)) {
    const k = kit();
    (SCENES[id] || SCENES.square)(k);
    cache.set(id, { back: k.bm, front: k.usedFront() ? k.front : null });
  }
  return cache.get(id);
}
/** The backdrop for a place: a cached hi-res bitmap covering the room area. */
export const backdrop = (id) => draw(id).back;
/** Framing drawn in front of the pets (bushes, clouds at the corners), or null. */
export const frontdrop = (id) => draw(id).front;

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
/** The colour ramp a colour belongs to (plain colours map to the nearest ramp). */
const rampOf = (c) => { const r = c.split('.')[0]; return RAMP_NAMES.includes(r) ? r : ({ white: 'cream', mist: 'cream', silver: 'slate', gray: 'slate', shade: 'indigo', ink: 'indigo', night: 'indigo' })[r] || 'slate'; };
const dk = (c, n = 1) => tone(c, -n);
/** The outline for a fill: two shades darker, or ink once that runs out. */
const edge = (c) => (dk(c, 2) === c || c.endsWith('.0') || c.endsWith('.1') || c === 'shade' || c === 'ink' ? 'ink' : dk(c, 2));

// ---------------------------------------------------------------- drawing kit
/** A small seeded random generator (mulberry32), so every scene is the same every time. */
export function rand(seed = 1) {
  let a = (seed * 2654435761) >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function kit() {
  const bm = makeBitmap(RW, RH, true);
  const front = makeBitmap(RW, RH, true);
  let target = bm, frontUsed = false;
  /** Draw on the backdrop ('back') or in front of the pets ('front'). */
  const layer = (name) => { target = name === 'front' ? front : bm; if (name === 'front') frontUsed = true; };
  const col = (c) => (typeof c === 'string' ? C(c) : c);
  const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < RW && y < RH) target.px[y * RW + x] = col(c); };
  const get = (x, y) => target.px[y * RW + x];
  const rect = (x, y, w, h, c) => { const v = col(c); x = Math.round(x); y = Math.round(y); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, v); };
  const box = (x, y, w, h, c = 'ink') => { rect(x, y, w, 1, c); rect(x, y + h - 1, w, 1, c); rect(x, y, 1, h, c); rect(x + w - 1, y, 1, h, c); };
  const line = (x0, y0, x1, y1, c) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) set(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c);
  };
  const dither = (x, y, w, h, c, phase = 0) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (((x + i + y + j + phase) & 1) === 0) set(x + i, y + j, c); };

  const block = (x, y, w, h, fill, { outline = edge(fill), rim = true, r = Math.min(3, Math.floor(Math.min(w, h) / 4)) } = {}) => {
    // a soft-cornered block: nothing man-made in town has razor corners
    const inside = (i, j) => {
      const cx = i < r ? r - i : i > w - 1 - r ? i - (w - 1 - r) : 0, cy = j < r ? r - j : j > h - 1 - r ? j - (h - 1 - r) : 0;
      return cx * cx + cy * cy <= r * r + 0.5;
    };
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (!inside(i, j)) continue;
      const rimEdge = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1);
      let v = fill;
      if (rim && w > 3 && h > 3) {
        if (j === 1 || i === 1) v = lt(fill);
        if (j >= h - 3 || i >= w - 3) v = dk(fill);
      }
      if (outline && rimEdge) v = outline;
      set(x + i, y + j, v);
    }
  };
  /**
   * An organic lump: an ellipse whose edge wobbles with a little noise, lit
   * from the upper left, darker underneath, outlined in its own darker shade.
   */
  const blob = (cx, cy, rx, ry, c, { seed = 1, wob = 0.14, line = dk(c, 2), top = dk(c), hi = lt(c), shade = true, flat = null } = {}) => {
    const r = rand(seed), ph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28];
    const R = (t) => 1 + wob * (Math.sin(2 * t + ph[0]) * 0.5 + Math.sin(3 * t + ph[1]) * 0.35 + Math.sin(5 * t + ph[2]) * 0.2 + Math.sin(7 * t + ph[3]) * 0.12);
    const inside = (x, y) => { if (flat !== null && y > flat) return false; const nx = x / rx, ny = y / ry; return Math.sqrt(nx * nx + ny * ny) <= R(Math.atan2(ny, nx)); };
    const X = Math.ceil(rx * (1 + wob * 1.3)), Y = Math.ceil(ry * (1 + wob * 1.3));
    for (let y = -Y; y <= Y; y++) for (let x = -X; x <= X; x++) {
      if (!inside(x, y)) continue;
      const nx = x / rx, ny = y / ry, l = -(nx * 0.55 + ny * 0.85);
      let v = c;
      if (shade) { if (l > 0.5 && nx * nx + ny * ny < 0.7) v = hi; else if (l < -0.3) v = dk(c); }
      if (line && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1))) v = ny > -0.25 ? line : top;
      set(cx + x, cy + y, v);
    }
  };
  /** A soft band of mist with a wavy top edge. */
  const mist = (y, h = 10, c = 'white', seed = y) => {
    const ph = rand(seed)() * 6;
    for (let x = 0; x < RW; x++) { const t = y + Math.round(Math.sin(x / 19 + ph) * 3 + Math.sin(x / 7 + ph) * 1); for (let j = 0; j < h; j++) if (j > 2 || ((x + j) & 1) === 0) if (j < h - 3 || ((x + j) & 1) === 0) set(x, t + j, c); }
  };
  /** A tapering, slightly curved trunk with flared roots and a few bark marks. */
  const trunk = (x, top, bottom, wTop, wBot, bark = 'brown.2', seed = 1) => {
    const rnd = rand(seed * 17 + 5), bend = (rnd() - 0.5) * (bottom - top) * 0.08, h = bottom - top;
    for (let j = 0; j < h; j++) {
      const t = j / h, flare = t > 0.85 ? Math.pow((t - 0.85) / 0.15, 2) * wBot * 0.6 : 0;
      const half = (wTop + (wBot - wTop) * t) / 2 + flare, mid = x + Math.sin(t * 3.1) * bend;
      for (let i = Math.round(-half); i < Math.round(half); i++) set(mid + i, top + j, i < -half + 2 ? lt(bark) : i > half - 3 ? dk(bark) : bark);
      set(mid - half - 1, top + j, dk(bark, 2)); set(mid + half, top + j, dk(bark, 2));
    }
    for (let k = 0; k < h / 9; k++) { const by = top + 4 + rnd() * (h - 12), bx = x + (rnd() - 0.6) * wTop * 0.6; for (let j = 0; j < 4; j++) set(bx + Math.sin(j) * 0.8, by + j, dk(bark)); }
  };
  /**
   * A winding trail toward the viewer: centre(y) and half(y) give its shape;
   * the edges wobble and pick up pebbles and grass.
   */
  const trail = (y0, y1, centre, half, c = 'cream.3', { edgeC = dk(c), pebbles = true, seed = 3 } = {}) => {
    const rnd = rand(seed);
    for (let y = y0; y < y1; y++) {
      const cx = centre(y), h = half(y) + Math.sin(y / 5 + seed) * 1.2;
      for (let x = Math.round(cx - h); x < cx + h; x++) set(x, y, c);
      set(Math.round(cx - h), y, edgeC); set(Math.round(cx + h), y, edgeC);
      if (y % 6 === 0 && rnd() < 0.5) set(cx + (rnd() - 0.5) * h, y, dk(c));
      if (pebbles && rnd() < 0.12) { const side = rnd() < 0.5 ? -1 : 1; blob(Math.round(cx + side * h), y, 2 + rnd() * 2, 1.5, 'slate.3', { seed: y, wob: 0.2 }); }
    }
  };
  /** A clump of flowers (hand-pixelled), in the first colour given. */
  const flowerPatch = (cx, cy, n = 6, colors = ['pink.2', 'white', 'gold.2'], seed = cx) => {
    prop(n >= 6 ? 'flowersA' : 'flowersB', cx, cy, { accent: rampOf(colors[0] === 'white' ? colors[1] || 'pink.2' : colors[0]), flip: Math.round(seed) % 2 === 1 });
  };
  const rocks = (cx, cy, n = 3, c = 'slate.3', seed = cx) => {
    shadow(cx + 2, cy, 12, dk(c, 2));
    prop(n >= 3 ? 'rockA' : 'rockB', cx, cy, { stone: rampOf(c), flip: Math.round(seed) % 2 === 1 });
    if (n >= 2) prop('pebbles', cx + 14, cy + 2, { stone: rampOf(c) });
  };
  /**
   * A roof with gently curved sides (a bell rather than a triangle), shingle
   * rows that follow the curve, a light left side and an eave shadow.
   */
  const roofCurve = (cx, top, w, h, c, { flare = 0.12, rows = 5 } = {}) => {
    for (let j = 0; j < h; j++) {
      const t = j / h, half = Math.max(1, (w / 2) * (Math.sqrt(t) * (1 - flare) + flare * t * t * 1.4));
      for (let i = Math.round(-half); i < Math.round(half); i++) {
        let v = i < -half * 0.35 ? lt(c) : i > half * 0.45 ? dk(c) : c;
        if (j > 2 && (j % rows === rows - 1) && Math.abs(i) < half - 1) v = dk(c);
        set(cx + i, top + j, v);
      }
      set(cx - half - 1, top + j, dk(c, 2)); set(cx + half, top + j, dk(c, 2));
    }
    for (let i = -w / 2 - 1; i <= w / 2; i++) set(cx + i, top + h, dk(c, 2));
  };
  /** Stamp a hand-pixelled prop (src/art/props.js) with its anchor at (x, y). */
  const prop = (name, x, y, opts = {}) => stampProp(set, name, Math.round(x), Math.round(y), opts);
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
  /** A hand-pixelled tree with a soft shadow; big trees for s >= 0.95, young ones below. */
  const tree = (x, y, s = 1, leaf = 'green.2', { seed = 7 } = {}) => {
    blob(x + 4, y + 1, 18 * s, 4 * s, dk(leaf, 2), { seed, line: null, shade: false, wob: 0.2 });
    prop(s >= 0.95 ? 'treeA' : 'treeB', x, y, { leaf: rampOf(leaf), flip: seed % 2 === 1 });
  };
  const pine = (x, y, h = 50, c = 'green.1') => {
    rect(x - 2, y - 8, 4, 8, 'brown.1');
    for (let j = 0; j < h; j++) { const half = Math.round(2 + (j % 14) * 0.9 + j * 0.25); rect(x - half, y - 8 - h + j, half * 2, 1, j % 14 < 3 ? lt(c) : c); set(x + half - 1, y - 8 - h + j, dk(c)); }
  };
  const bush = (x, y, c = 'green.2', w = 16, seed = x) => {
    blob(x + 2, y, w + 3, Math.max(2, w / 5), dk(c, 2), { seed, line: null, shade: false, wob: 0.2 });
    prop(w >= 14 ? 'bushA' : w >= 9 ? 'bushB' : 'bushC', x, y, { leaf: rampOf(c), flip: Math.round(seed) % 2 === 1 });
  };
  const flower = (x, y, c = 'pink.2') => { rect(x, y - 5, 1, 5, 'green.1'); set(x + 1, y - 2, 'green.2'); for (const [dx, dy] of [[-1, -6], [1, -6], [0, -7], [0, -5]]) set(x + dx, y + dy, c); set(x, y - 6, 'gold.3'); };
  const flowers = (x, y, n = 5, c = 'pink.2') => { for (let i = 0; i < n; i++) flower(x + i * 6, y - (i % 2) * 2, i % 3 === 2 ? 'gold.2' : c); };
  const pot = (x, y, plant = 'green.2', potC = 'orange.2') => {
    shadow(x, y, 10, 'shade');
    for (const [dx, dy, r] of [[0, -22, 8], [-6, -16, 6], [6, -16, 6]]) disc(x + dx, y + dy, r, plant, { outline: dk(plant, 2) });
    disc(x - 3, y - 25, 3, lt(plant));
    block(x - 8, y - 12, 16, 12, potC);
  };
  /** A hand-pixelled lamp post; lit ones throw a soft glow. */
  const lamp = (x, y, glow = true) => {
    shadow(x, y, 7);
    if (glow) for (let j = -13; j <= 13; j++) for (let i = -13; i <= 13; i++) if (i * i + j * j < 160 && ((x + i + j) & 1) === 0) set(x + i, y - 51 + j, 'gold.3');
    prop('lamp', x, y, { glass: 'gold' });
  };
  const bench = (x, y, c = 'brown.2') => { shadow(x + 22, y, 24); prop('bench', x + 23, y, { wood: rampOf(c) }); };
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
  /** A hand-pixelled shopfront: wall colour, awning colour (awn[0]) and its sign. */
  const shopFront = (x, y, w, h, wallC, awn, { sign = null } = {}) => {
    shadow(x + w / 2, y, w / 2, 'shade', 3);
    prop('shop', x + w / 2, y, { wall: rampOf(wallC), accent: rampOf(awn[0]), flip: x > RW / 2 });
  };
  /** A hand-pixelled counter; long ones are two counters side by side. */
  const counter = (x, y, w, c = 'brown.2', top = 'cream.3') => {
    shadow(x + w / 2, y, w / 2 + 4);
    const n = Math.max(1, Math.round(w / 74));
    for (let i = 0; i < n; i++) prop('counter', x + (w / n) * (i + 0.5), y, { wood: rampOf(c), wall: rampOf(top) });
  };
  /**
   * A shelf of hand-pixelled goods ('bread', 'bottles', 'toys', 'books' or
   * 'boxes'): each shelf gets its own mix, colours and gaps, so a wall of
   * shelves never reads as a grid.
   */
  const shelf = (x, y, w, kind = 'boxes', colors = ['red.2', 'gold.2', 'sky.2', 'pink.2', 'green.2', 'violet.2'], seed = x * 7 + y) => {
    const rnd = rand(seed);
    for (let i = 2 + Math.floor(rnd() * 4); i < w - 8;) {
      if (rnd() < 0.12) { i += 6; continue; }
      const accent = rampOf(colors[Math.floor(rnd() * colors.length)]);
      const name = kind === 'bread' ? 'loaf' : kind === 'bottles' ? 'bottle' : kind === 'books' ? 'books' : kind === 'toys' ? ['toyBall', 'toyBlock', 'teddy'][Math.floor(rnd() * 3)] : 'toyBlock';
      const pw = PROPS[name].w;
      if (i + pw > w - 2) break;
      prop(name, x + i + pw / 2, y - 1, { accent, wood: kind === 'bread' ? accent : 'brown', stone: 'slate', flip: rnd() < 0.5 });
      i += pw + 1 + Math.floor(rnd() * 3);
    }
    block(x, y, w, 4, 'brown.2');
    rect(x, y + 4, w, 1, 'shade');
  };
  const table = (x, y, w = 36, cloth = 'white') => { shadow(x + w / 2, y, w / 2 + 2); prop('table', x + w / 2, y, {}); };
  const chair = (x, y, c = 'red.2') => prop('chair', x + 7, y, { accent: rampOf(c) });
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
  // ---- soft, puffy shapes (the cel-shaded look of the town scenes) ----
  /** One round puff: lit on top, darker underneath, a soft outline (darker on the bottom). */
  const puff = (cx, cy, r, c, { line = dk(c, 2), hi = lt(c) } = {}) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d > r + 0.3) continue;
      let v = c;
      const k = x * 0.45 + y; // toward the lower right
      if (k > r * 0.5) v = dk(c);
      else if (k < -r * 0.45 && d < r - 1.5) v = hi;
      if (d > r - 1) v = k > -r * 0.2 ? line : dk(c);
      set(cx + x, cy + y, v);
    }
    if (r >= 4) { set(cx - r * 0.4, cy - r * 0.45, lt(hi)); set(cx - r * 0.4 + 1, cy - r * 0.45, lt(hi)); }
  };
  /**
   * A mass of foliage (hedges, tree lines, framing): hand-pixelled bushes
   * clustered back to front, bigger ones in the middle, all in one leaf colour.
   */
  const canopy = (x, y, w, h, c, { seed = 1, r = 9 } = {}) => {
    const rnd = rand(seed * 977 + 13), leaf = rampOf(c);
    const cx = x + w / 2, cy = y + h / 2, ax = Math.max(1, w / 2 - 8), ay = Math.max(1, h / 2 - 5);
    const area = r >= 13 ? 900 : r >= 10 ? 370 : r >= 6 ? 150 : 77; // the bushes (or crowns) it's built from
    const n = Math.max(2, Math.ceil((w * h) / (area * 0.42)));
    const spots = [];
    for (let i = 0; i < n; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()); spots.push([cx + Math.cos(a) * d * ax, cy + Math.sin(a) * d * ay, d]); }
    spots.sort((p, q) => p[1] - q[1]);
    for (const [px, py, d] of spots) {
      const name = r >= 13 ? (d < 0.7 || rnd() < 0.5 ? 'crownA' : 'bushA') : r >= 10 ? (d < 0.6 ? 'bushA' : rnd() < 0.5 ? 'bushA' : 'bushB') : r >= 6 ? (rnd() < 0.6 ? 'bushB' : 'bushC') : 'bushC';
      prop(name, px, py + PROPS[name].h / 2, { leaf, flip: rnd() < 0.5 });
    }
  };
  /** A hand-pixelled cloud, sized to the width asked for, with a tinted underside. */
  const pcloud = (x, y, w, tint = 'violet.3', s = 1, seed = Math.round(x + y * 7)) => {
    const name = w * s >= 56 ? 'cloudA' : w * s >= 36 ? 'cloudB' : 'cloudC';
    prop(name, x + w / 2, y + 4, { accent: rampOf(tint), flip: seed % 2 === 1 });
  };
  /** Soft horizontal sky bands with dithered seams. */
  const bands = (colors, y0 = 0, y1 = HZ) => {
    const h = (y1 - y0) / colors.length;
    for (let y = y0; y < y1; y++) {
      const i = Math.min(colors.length - 1, Math.floor((y - y0) / h)), f = (y - y0) / h - i;
      for (let x = 0; x < RW; x++) {
        const next = colors[Math.min(colors.length - 1, i + 1)];
        set(x, y, f > 0.82 && ((x + y) & 1) === 0 ? next : f > 0.92 ? next : colors[i]);
      }
    }
  };
  /** A mountain with a noisy ridge, a lit face, a shaded face and an optional ragged snow cap. */
  const mountain = (cx, by, w, h, c, { snow = false, seed = cx } = {}) => {
    const rnd = rand(seed), ph = rnd() * 6, crest = cx + (rnd() - 0.5) * w * 0.15;
    for (let x = Math.round(cx - w / 2); x < cx + w / 2; x++) {
      const t = Math.abs(x - crest) / (w / 2);
      if (t >= 1) continue;
      const top = Math.round(by - h * Math.pow(1 - t, 1.3) + Math.sin(x / 7 + ph) * 2 + Math.sin(x / 3.1 + ph) * 0.8);
      for (let y = top; y < by; y++) {
        let v = x < crest + (y - top) * 0.15 ? lt(c) : c;
        if (x > crest + (by - y) * 0.25) v = dk(c);
        if (snow && y < by - h * 0.72 + Math.sin(x / 3) * 2) v = x < crest ? 'white' : 'mist';
        set(x, y, v);
      }
      set(x, top, x < crest ? lt(c, 2) : dk(c, 2));
    }
  };
  /** A winding river with uneven banks, ripples, foam and sparkles. */
  const river = (y0, amp = 8, w = 14, c = 'sky.2', bank = 'cream.3', f = 34, seed = 5) => {
    const ph = rand(seed)() * 6;
    for (let x = 0; x < RW; x++) {
      const cy = y0 + Math.sin(x / f + ph) * amp + x * 0.08, half = w / 2 + x * 0.04 + Math.sin(x / 11 + ph) * 1.5;
      const b1 = 2 + Math.round(Math.abs(Math.sin(x / 9 + ph)) * 3), b2 = 2 + Math.round(Math.abs(Math.sin(x / 13)) * 3);
      for (let y = Math.round(cy - half - b1); y < cy + half + b2; y++) set(x, y, y < cy - half || y > cy + half ? bank : c);
      set(x, Math.round(cy - half - b1), dk(bank)); set(x, Math.round(cy + half + b2 - 1), dk(bank));
      set(x, Math.round(cy - half), lt(c)); if ((x & 1) === 0) set(x, Math.round(cy - half + 1), lt(c));
      if (x % 9 < 4) set(x, Math.round(cy + ((x * 7) % 5) - 2), lt(c));
      if (x % 17 === 0) { set(x, Math.round(cy - 1), 'white'); set(x + 1, Math.round(cy - 1), 'white'); }
    }
  };
  /** Soft patches on a ground: organic lumps with dithered edges, scattered naturally. */
  const mottle = (y0, y1, c, n = 14, seed = 3) => {
    const rnd = rand(seed * 101 + 7);
    for (let i = 0; i < n; i++) {
      const cx = rnd() * RW, cy = y0 + rnd() * (y1 - y0), rx = 8 + rnd() * 18, ry = rx * (0.28 + (cy - y0) / (y1 - y0) * 0.12);
      blob(Math.round(cx), Math.round(cy), rx, ry, c, { seed: seed * 13 + i, line: null, shade: false, wob: 0.25 });
    }
  };
  /** Grass tufts (hand-pixelled) in natural clumps (a few clusters, not an even sprinkle). */
  const tufts = (y0, y1, c, n = 30, seed = 1) => {
    const rnd = rand(seed * 59 + 3), clusters = [], leaf = rampOf(c);
    for (let i = 0; i < Math.max(3, n / 8); i++) clusters.push([rnd() * RW, y0 + rnd() * (y1 - y0)]);
    for (let i = 0; i < n / 2; i++) {
      const [qx, qy] = clusters[i % clusters.length];
      prop(rnd() < 0.5 ? 'tuftA' : 'tuftB', qx + (rnd() - 0.5) * 34, qy + (rnd() - 0.5) * 12, { leaf, flip: rnd() < 0.5 });
    }
  };
  /** A dither that darkens a ground toward the bottom of the scene. */
  const groundShade = (y0, c) => {
    const edge = (x) => y0 + 34 + Math.round(Math.sin(x / 23) * 4);
    for (let x = 0; x < RW; x++) { const e = edge(x); for (let y = e; y < RH; y++) if (y > e + 3 || ((x + y) & 1) === 0) set(x, y, c); }
  };
  /** A chubby five-pointed star. */
  const star5 = (cx, cy, r, c) => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.5 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    const inside = (x, y) => { let k = false; for (let i = 0, j = 9; i < 10; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) k = !k; } return k; };
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      if (!inside(x + 0.5, y + 0.5)) continue;
      const rim = !inside(x + 1.5, y + 0.5) || !inside(x - 0.5, y + 0.5) || !inside(x + 0.5, y + 1.5) || !inside(x + 0.5, y - 0.5);
      set(x, y, rim ? dk(c, 2) : y > cy + r * 0.15 ? dk(c) : c);
    }
    set(cx - 1, cy - 1, 'white');
  };
  const rainbow = (cx, cy, r, colors = ['red.3', 'orange.3', 'gold.3', 'mint.3', 'sky.3', 'violet.3'], bw = 3) => {
    colors.forEach((c, i) => {
      const r0 = r - i * bw;
      for (let y = -r0; y <= 0; y++) for (let x = -r0; x <= r0; x++) { const d = Math.sqrt(x * x + y * y); if (d <= r0 && d > r0 - bw) set(cx + x, cy + y, c); }
    });
  };
  /**
   * A bank of cloud: a scalloped top edge, a soft highlight under it, filled
   * down to the bottom. Stack banks back to front for a sea of clouds.
   */
  const cloudBank = (y, c, { line = dk(c), seed = 1, size = 14 } = {}) => {
    const rnd = (i) => { const v = Math.sin((i + seed * 31) * 12.9898) * 43758.5453; return v - Math.floor(v); };
    const bumps = [];
    for (let x = -size - rnd(0) * size, i = 1; x < RW + size; i++) { const r = Math.round(size * (0.7 + rnd(i) * 0.7)); bumps.push([x, y + Math.round((rnd(i + 50) - 0.5) * size * 0.5), r]); x += r * (1.2 + rnd(i + 9) * 0.5); }
    const top = new Array(RW).fill(Infinity), owner = new Array(RW).fill(-1);
    bumps.forEach(([cx, cy, r], b) => { for (let x = Math.max(0, Math.ceil(cx - r)); x < Math.min(RW, cx + r); x++) { const t = cy - Math.sqrt(r * r - (x - cx) ** 2); if (t < top[x]) { top[x] = t; owner[x] = b; } } });
    for (let x = 0; x < RW; x++) {
      if (!isFinite(top[x])) continue;
      const t = Math.round(top[x]);
      for (let yy = t; yy < RH; yy++) set(x, yy, yy < t + 3 ? 'white' : yy < t + 5 && (x + yy) % 2 === 0 ? 'white' : c);
      set(x, t, line);
      if (x > 0 && owner[x] !== owner[x - 1]) for (let j = 0; j < 6; j++) set(x, t + j, line); // the crease between two puffs
    }
  };
  const sparkle = (x, y, c = 'white') => { set(x, y, c); set(x - 1, y, c); set(x + 1, y, c); set(x, y - 1, c); set(x, y + 1, c); set(x, y - 2, c); set(x, y + 2, c); };
  const mushroom = (x, y, c = 'pink.2', s = 1) => {
    shadow(x, y, 5, dk('green.2'));
    prop('mushroomA', x, y, { accent: rampOf(c), flip: Math.round(x) % 2 === 1 });
  };
  const rock = (x, y, r = 6, c = 'slate.3') => { shadow(x, y, r + 2); puff(x, y - r * 0.6, r, c); };
  /** A rounded, striped tall bush (the soft conifers that frame the scenes). */
  const conifer = (x, y, w = 22, h = 50, c = 'green.2') => {
    for (let j = 0; j < h; j++) {
      const t = j / h, half = Math.round((w / 2) * Math.min(1, Math.sqrt(t * 3)));
      for (let i = -half; i < half; i++) {
        let v = (j % 10) < 2 ? lt(c) : c;
        if (i > half * 0.4) v = dk(c);
        if (i < -half * 0.5 && (j % 10) < 4) v = lt(c);
        set(x + i, y - h + j, v);
      }
      set(x - half, y - h + j, dk(c, 2)); set(x + half - 1, y - h + j, dk(c, 2));
    }
  };
  const waterfall = (x, y0, y1, w = 14, c = 'sky.3') => {
    for (let y = y0; y < y1; y++) for (let i = 0; i < w; i++) set(x + i, y, (i + Math.floor(y / 3)) % 5 === 0 ? 'white' : i < 2 || i > w - 3 ? 'sky.2' : c);
    for (let i = -4; i < w + 4; i += 3) puff(x + i, y1, 4, 'white', { line: 'sky.2', hi: 'white' });
  };

  // ---- light and atmosphere ----
  /** A soft pool of light on the floor (dithered ellipse, denser in the middle). */
  const lightPool = (cx, cy, rx, ry, c = 'gold.3') => {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (d > 1) continue;
      if (d < 0.35 ? ((x + y) & 1) === 0 || ((x * 3 + y) % 4 === 0) : ((x + y) & 1) === 0 && ((x + y * 3) % 4 === 0)) set(cx + x, cy + y, c);
    }
  };
  /** A slanted beam of light from a window down to the floor. */
  const beam = (x, y0, w, y1, c = 'white', slant = 0.45) => {
    for (let y = y0; y < y1; y++) for (let i = 0; i < w; i++) { const x0 = x + (y - y0) * slant + i; if (((x0 + y) & 1) === 0 && ((x0 * 3 + y) % 5 !== 0)) set(x0, y, c); }
  };
  /** Darken the top corners of a room a little, for depth. */
  const vignette = (c = 'shade', size = 40) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size - y; x++) {
      const d = (x + y) / size; // denser right in the corner, fading out
      if (((x + y) & 1) === 0 && (d < 0.35 || ((x * 3 + y) & 3) === 0 && d < 0.7)) { set(x, y, c); set(RW - 1 - x, y, c); }
    }
  };
  /** A hand-pixelled potted plant. */
  const plant = (x, y, s = 1, leaf = 'green.2', potC = 'orange.2', seed = 1) => {
    shadow(x, y, 11 * s);
    prop('plant', x, y, { leaf: rampOf(leaf), accent: rampOf(potC), flip: seed % 2 === 1 });
  };
  const hangingPlant = (x, y, len = 20, leaf = 'green.2') => {
    line(x, 0, x, y, 'brown.1');
    block(x - 7, y, 14, 9, 'orange.2');
    for (const dx of [-8, -3, 3, 8]) for (let j = 0; j < len - Math.abs(dx); j += 3) puff(x + dx + Math.sin(j / 4) * 2, y + 8 + j, 3, leaf);
    canopy(x - 10, y - 8, 20, 12, leaf, { seed: x, r: 4 });
  };
  /** A mobile of stars and moons hanging from the ceiling. */
  const mobile = (x, y, colors = ['gold.3', 'pink.2', 'sky.2']) => {
    line(x, 0, x, y, 'ink'); line(x - 20, y, x + 20, y, 'brown.1');
    [-18, -6, 6, 18].forEach((dx, i) => { const len = 10 + (i % 2) * 8; line(x + dx, y, x + dx, y + len, 'ink'); star5(x + dx, y + len + 5, 5, colors[i % colors.length]); });
  };

  return {
    bm, front, layer, usedFront: () => frontUsed, set, prop, blob, mist, roofCurve, trunk, trail, flowerPatch, rocks, tufts, groundShade, cloudBank, lightPool, beam, vignette, plant, hangingPlant, mobile, puff, canopy, pcloud, bands, mountain, river, mottle, star5, rainbow, sparkle, mushroom, rock, conifer, waterfall, get, rect, box, line, dither, block, flat, ellipse, disc, ball, shadow, sky, cloud, skyline, hills, grass, path,
    tiles, planks, cobbles, wall, floorShadow, tree, pine, bush, flower, flowers, pot, lamp, bench, window: window_, door, awning,
    shopFront, counter, shelf, table, chair, rug, frame, clock, water, star, curtain, bunting, stringLights,
  };
}

// ---------------------------------------------------------------- the places
const SCENES = {
  // ---- downtown ----
  square(k) {
    k.bands(['sky.2', 'sky.2', 'sky.3'], 0, HZ);
    k.pcloud(30, 34, 60, 'violet.3'); k.pcloud(182, 48, 56, 'pink.3', 0.9);
    k.skyline(HZ - 60, 'sky.2', 3);
    k.canopy(-8, HZ - 92, 44, 40, 'green.2', { seed: 21, r: 9 }); k.canopy(222, HZ - 98, 44, 42, 'green.2', { seed: 22, r: 9 });
    k.shopFront(4, HZ, 72, 74, 'pink.3', ['pink.2', 'white'], { sign: 'pink.1' });
    k.shopFront(180, HZ, 72, 80, 'gold.3', ['sky.2', 'white'], { sign: 'sky.1' });
    k.prop('townhall', 128, HZ, { roof: 'red', accent: 'red' });
    k.cobbles(HZ, 'slate.3');
    k.bunting(8, 14);
    k.shadow(128, 252, 54, 'slate.1', 6);
    k.prop('fountain', 128, 252);
    k.lamp(26, 246); k.lamp(230, 246);
    k.pot(56, 214, 'green.2', 'brown.2'); k.pot(200, 214, 'green.2', 'brown.2');
    k.layer('front');
    k.canopy(-14, 204, 46, 44, 'green.2', { seed: 23, r: 9 }); k.flowers(4, 246, 4, 'pink.2');
    k.canopy(224, 206, 46, 42, 'green.2', { seed: 24, r: 9 }); k.flowers(232, 248, 4, 'gold.2');
    k.layer('back');
  },
  park(k) {
    // a garden park: a bandstand at the end of a winding trail, a pond with a little bridge
    k.bands(['sky.2', 'sky.2', 'sky.3'], 0, 118);
    k.pcloud(14, 46, 74, 'violet.3'); k.pcloud(150, 30, 92, 'pink.3'); k.pcloud(104, 80, 40, 'violet.3', 0.7);
    k.mountain(52, 108, 180, 34, 'sky.1', { seed: 11 }); k.mountain(206, 108, 160, 26, 'mint.2', { seed: 12 });
    k.mist(96, 12, 'sky.3');
    k.canopy(-24, 84, 304, 36, 'mint.1', { seed: 61, r: 9 }); // the far tree line, soft and pale
    k.rect(0, 112, RW, RH - 112, 'green.3');
    k.mottle(116, 140, 'mint.2', 5, 8); // shade along the trees
    k.mottle(130, 300, 'lime.3', 9, 12); k.mottle(160, 300, 'green.2', 5, 4);
    k.tufts(118, 260, 'green.2', 48, 2);
    // trees with bushes at their feet
    k.tree(20, 140, 1.05, 'green.2', { seed: 3 }); k.bush(40, 146, 'green.2', 10, 5); k.bush(4, 150, 'lime.2', 8, 6);
    k.tree(238, 136, 1.15, 'green.2', { seed: 9 }); k.bush(214, 142, 'green.2', 11, 8);
    // the pond, with reeds, lily pads and a little arched bridge
    k.blob(58, 162, 46, 13, 'sky.2', { seed: 3, line: 'sky.1', top: 'sky.1', hi: 'sky.3', wob: 0.1 });
    k.blob(50, 158, 24, 4, 'sky.3', { seed: 4, line: null, shade: false, wob: 0.2 });
    for (const [x, y] of [[78, 168], [88, 161], [42, 170]]) k.prop('lilypad', x, y);
    k.puff(88, 157, 2, 'pink.3');
    k.prop('reeds', 16, 170); k.prop('reeds', 102, 168, { flip: true });
    for (let i = 0; i < 40; i++) { const t = i / 39, x = 38 + i, y = 156 - Math.sin(t * Math.PI) * 9; k.rect(x, y, 1, 3, i % 5 ? 'brown.2' : 'brown.1'); k.set(x, y, 'brown.3'); }
    for (let i = 0; i <= 40; i += 8) { const y = 150 - Math.sin((i / 39) * Math.PI) * 9; k.rect(38 + i, y, 1, 6, 'brown.1'); }
    for (let i = 0; i < 40; i++) k.set(38 + i, 150 - Math.sin((i / 39) * Math.PI) * 9, 'brown.1');
    // the bandstand
    const bx = 154, by = 150;
    k.blob(bx + 6, by + 4, 44, 6, 'green.1', { seed: 7, line: null, shade: false, wob: 0.2 });
    k.prop('bandstand', bx, by + 6, { accent: 'pink', wall: 'cream' });
    // a winding trail from you to the bandstand
    k.trail(by + 6, RH, (y) => bx - 8 - (y - by) * 0.6 + Math.sin(y / 16) * 5, (y) => 8 + (y - by) * 0.16, 'cream.3', { seed: 4 });
    // flowers in clumps
    k.flowerPatch(218, 186, 7, ['pink.2', 'white']); k.flowerPatch(108, 140, 5, ['gold.2', 'white']); k.flowerPatch(30, 200, 6, ['violet.2', 'pink.2']);
    k.rocks(126, 206, 2);
    k.lamp(112, 196, false);
    k.layer('front');
    k.canopy(-26, 196, 70, 60, 'green.2', { seed: 31, r: 11 }); k.flowerPatch(14, 250, 5, ['pink.2', 'white']);
    k.canopy(214, 204, 64, 52, 'green.1', { seed: 32, r: 11 }); k.canopy(236, 230, 40, 30, 'lime.2', { seed: 33, r: 8 });
    k.layer('back');
  },
  playground(k) {
    k.bands(['sky.2', 'sky.3'], 0, 110);
    k.pcloud(26, 34, 64, 'pink.3'); k.pcloud(166, 50, 54, 'violet.3', 0.9);
    k.canopy(-12, 62, 112, 46, 'green.2', { seed: 3, r: 11 }); k.canopy(150, 58, 124, 50, 'green.2', { seed: 6, r: 11 });
    k.rect(0, 104, RW, RH - 104, 'green.3'); k.mottle(110, 300, 'lime.3', 14, 4);
    k.groundShade(200, 'green.2'); k.tufts(116, 270, 'green.2', 36, 6);
    for (let x = 2; x < RW; x += 12) { k.rect(x, 92, 7, 20, 'white'); k.rect(x + 6, 94, 1, 18, 'mist'); for (let j = 0; j < 3; j++) k.rect(x + j, 89 + j, 7 - j * 2, 1, 'white'); }
    k.rect(0, 97, RW, 3, 'white'); k.rect(0, 105, RW, 3, 'white'); k.dither(0, 112, RW, 2, C('green.2'));
    // sand pit
    k.blob(128, 222, 112, 32, 'gold.3', { seed: 44, line: 'gold.1', top: 'gold.2', hi: 'cream.3', wob: 0.08 });
    for (let i = 0; i < 40; i++) k.set(30 + (i * 47) % 196, 200 + (i * 13) % 40, 'gold.2');
    // swing set
    const gy = 196;
    k.shadow(62, gy, 46, 'green.2');
    for (const x of [20, 102]) { k.line(x, gy, x + 6, gy - 96, 'red.1'); k.line(x + 1, gy, x + 7, gy - 96, 'red.2'); k.line(x + 14, gy, x + 8, gy - 96, 'red.1'); k.line(x + 15, gy, x + 9, gy - 96, 'red.0'); }
    k.block(20, gy - 100, 98, 6, 'red.2');
    for (const sx of [40, 76]) { k.rect(sx, gy - 94, 1, 60, 'slate.1'); k.rect(sx + 14, gy - 94, 1, 60, 'slate.1'); k.block(sx - 2, gy - 34, 19, 5, 'sky.2'); }
    // slide with a ladder
    k.shadow(200, gy + 2, 34, 'green.2');
    k.rect(166, gy - 96, 3, 96, 'sky.1'); k.rect(186, gy - 96, 3, 96, 'sky.1');
    for (let y = gy - 86; y < gy; y += 10) k.rect(166, y, 22, 2, 'sky.2');
    k.block(162, gy - 102, 30, 8, 'sky.2');
    for (let i = 0; i < 64; i++) { const x = 190 + i * 0.85, y = gy - 96 + i * 1.5; k.rect(x, y, 13, 2, 'gold.2'); k.set(x, y, 'gold.1'); k.set(x + 12, y + 1, 'gold.1'); }
    k.block(120, 226, 12, 10, 'red.2'); k.rect(122, 223, 8, 1, 'ink'); k.line(140, 234, 148, 222, 'slate.1');
    k.layer('front');
    k.canopy(-10, 206, 56, 50, 'green.2', { seed: 7, r: 10 }); k.canopy(222, 212, 48, 44, 'lime.2', { seed: 8, r: 9 });
    k.layer('back');
  },
  cafe(k) {
    k.wall('cream.3', 'pink.3', 'stripes', { wainscot: 'pink.2' });
    k.window(16, 34, 60, 46); k.window(180, 34, 60, 46);
    k.awning(14, 26, 66, 'pink.2', 'white'); k.awning(178, 26, 66, 'pink.2', 'white');
    k.block(102, 22, 52, 36, 'brown.1'); k.flat(105, 25, 46, 30, 'green.0');
    for (let i = 0; i < 4; i++) { k.rect(109, 30 + i * 6, 24 - (i % 2) * 8, 1, 'white'); k.rect(140, 30 + i * 6, 6, 1, 'gold.3'); }
    k.shelf(104, 74, 48, 'bottles', ['gold.2', 'brown.2', 'red.2']);
    k.vignette('pink.2', 36);
    k.planks(HZ, 'cream.2'); k.floorShadow();
    k.beam(20, HZ, 30, 236, 'white', 0.35); k.beam(184, HZ, 30, 236, 'white', 0.35);
    for (const x of [48, 208]) { k.rect(x, 0, 1, 92, 'ink'); k.ellipse(x, 96, 9, 5, 'gold.2', { outline: 'gold.0' }); k.lightPool(x, 104, 14, 8, 'gold.3'); }
    k.counter(92, HZ + 18, 72, 'pink.2', 'white');
    k.block(100, HZ - 22, 16, 14, 'slate.2'); k.rect(104, HZ - 10, 6, 2, 'ink'); for (let j = 0; j < 6; j++) k.set(108 + Math.sin(j) * 2, HZ - 26 - j * 2, 'mist');
    k.ellipse(146, HZ - 9, 10, 2, 'white', { outline: 'mist' }); k.ellipse(146, HZ - 14, 7, 5, 'pink.3', { outline: 'pink.1', shade: true }); k.set(146, HZ - 20, 'red.2');
    for (const x of [20, 196]) { k.table(x, 248, 40, 'white'); k.disc(x + 14, 222, 3, 'white', { outline: 'mist' }); k.rect(x + 12, 219, 4, 1, 'brown.1'); }
    k.layer('front');
    k.plant(16, 262, 1.1, 'green.2', 'pink.2', 3); k.plant(242, 262, 1, 'green.2', 'pink.2', 4);
    k.layer('back');
  },
  bakery(k) {
    k.wall('gold.3', 'orange.3', 'bricks');
    for (let i = 0; i < 3; i++) k.shelf(10, 62 + i * 30, 84, 'bread', ['orange.2', 'gold.2', 'brown.2']);
    // a domed brick oven with a chimney, glowing inside
    k.prop('oven', 210, 146, { accent: 'red', wall: 'cream' });
    k.disc(132, 52, 18, 'brown.2', { outline: 'brown.0' }); k.disc(132, 52, 14, 'sky.3', { outline: 'brown.1' });
    k.canopy(118, 50, 22, 16, 'green.2', { seed: 5, r: 5 }); k.rect(119, 51, 26, 1, 'brown.2'); k.rect(132, 38, 1, 28, 'brown.2');
    k.lightPool(210, 150, 30, 6, 'orange.3');
    // a round window onto the street
    k.rect(106, 0, 1, 40, 'ink'); for (const [dx, c] of [[-6, 'gold.2'], [0, 'orange.2'], [6, 'gold.2']]) k.ellipse(106 + dx, 44 + Math.abs(dx), 4, 6, c, { outline: 'brown.0', shade: true }); // hanging loaves
    k.vignette('orange.2', 36);
    k.tiles(HZ, 'cream.3', 'gold.3'); k.floorShadow();
    k.lightPool(208, HZ + 14, 40, 10, 'orange.3');
    k.counter(54, HZ + 24, 148, 'brown.2', 'cream.3');
    k.prop('pastryCase', 92, HZ - 5, { accent: 'orange' }); k.prop('pastryCase', 164, HZ - 5, { accent: 'pink', flip: true });
    k.layer('front');
    for (const [x, y] of [[12, 256], [30, 260]]) { k.shadow(x, y, 9); k.ellipse(x, y - 11, 10, 12, 'cream.3', { outline: 'cream.0', shade: true }); k.rect(x - 4, y - 22, 8, 2, 'brown.1'); }
    k.shadow(238, 258, 16); k.ellipse(238, 244, 18, 8, 'brown.2', { outline: 'brown.0', shade: true }); for (const dx of [-8, 0, 8]) k.ellipse(238 + dx, 238, 6, 4, 'orange.2', { outline: 'brown.0', shade: true });
    k.layer('back');
  },
  toyshop(k) {
    k.wall('sky.3', 'sky.2', 'dots');
    for (let i = 0; i < 3; i++) { k.shelf(8, 58 + i * 32, 100, 'toys'); k.shelf(148, 58 + i * 32, 100, 'toys', ['violet.2', 'gold.2', 'red.2', 'mint.2']); }
    k.mobile(128, 30);
    k.blob(128, 120, 22, 30, 'white', { seed: 2, wob: 0, flat: 18, line: 'sky.1' }); k.blob(128, 120, 17, 25, 'sky.3', { seed: 2, wob: 0, flat: 16, line: null, shade: false });
    k.canopy(112, 116, 32, 20, 'green.2', { seed: 9, r: 6 }); k.rect(128, 96, 1, 40, 'white'); k.rect(112, 120, 33, 1, 'white');
    k.vignette('sky.1', 34);
    k.tiles(HZ, 'pink.3', 'white', 16); k.floorShadow();
    k.lightPool(128, HZ + 30, 60, 12, 'white');
    // a rocking horse
    k.shadow(128, 200, 28);
    for (let i = 0; i < 50; i++) k.set(104 + i, 198 - Math.sin((i / 49) * Math.PI) * -4, 'brown.1');
    k.block(112, 170, 32, 14, 'red.2'); k.block(136, 158, 12, 16, 'red.2'); k.puff(148, 158, 6, 'red.2'); k.set(150, 156, 'ink');
    for (let j = 0; j < 8; j++) k.rect(132 + j * 0.5, 152 + j, 3, 1, 'gold.2'); // mane
    for (const x of [116, 138]) k.rect(x, 184, 3, 12, 'red.1');
    k.layer('front');
    k.shadow(26, 260, 22); k.block(6, 236, 16, 16, 'red.2'); k.block(24, 240, 14, 12, 'sky.2'); k.block(12, 222, 14, 14, 'gold.2'); for (const [x, y] of [[10, 240], [27, 243], [15, 226]]) k.rect(x + 2, y + 2, 4, 4, 'white');
    k.shadow(236, 262, 14); k.puff(236, 236, 11, 'brown.2'); k.puff(227, 226, 5, 'brown.2'); k.puff(245, 226, 5, 'brown.2'); k.puff(236, 252, 13, 'brown.2'); k.set(232, 234, 'ink'); k.set(240, 234, 'ink'); k.puff(236, 240, 3, 'cream.3');
    k.layer('back');
  },
  boutique(k) {
    k.wall('pink.3', 'pink.2', 'stripes', { wainscot: 'violet.3' });
    k.rect(18, 66, 108, 3, 'slate.1');
    for (const x of [22, 122]) k.rect(x, 66, 3, 104, 'slate.1');
    for (let i = 0; i < 6; i++) {
      const x = 28 + i * 16, c = ['red.2', 'sky.2', 'gold.2', 'violet.2', 'green.2', 'pink.1'][i];
      k.line(x + 6, 69, x + 6, 72, 'ink'); k.line(x, 76, x + 6, 72, 'ink'); k.line(x + 12, 76, x + 6, 72, 'ink');
      k.block(x, 76, 13, 34 + (i % 2) * 8, c);
    }
    k.ellipse(208, 88, 28, 52, 'gold.1', { outline: 'gold.0' }); k.ellipse(208, 88, 23, 47, 'sky.3'); k.dither(186, 100, 44, 32, C('sky.2'));
    for (let i = 0; i < 18; i++) k.set(198 + i * 0.6, 60 + i, 'white');
    // hat stand
    k.rect(150, 56, 2, 60, 'brown.1'); k.rect(144, 114, 14, 2, 'brown.0');
    for (const [dx, dy, c] of [[-8, 60, 'red.2'], [8, 70, 'sky.2'], [-6, 82, 'gold.2']]) { k.ellipse(151 + dx, dy, 8, 2, c, { outline: dk(c, 2) }); k.ellipse(151 + dx, dy - 3, 5, 4, c, { outline: dk(c, 2), shade: true }); }
    k.vignette('pink.1', 36);
    k.planks(HZ, 'violet.3'); k.floorShadow();
    k.lightPool(128, HZ + 40, 70, 14, 'white');
    k.rug(128, 258, 68, 12, 'pink.2', 'pink.3');
    k.layer('front');
    for (const x of [16, 240]) { k.shadow(x, 262, 14); k.prop('dressForm', x, 262, { accent: x < 128 ? 'violet' : 'sky', flip: x > 128 }); }
    k.layer('back');
  },
  arcade(k) {
    k.rect(0, 0, RW, HZ + 32, 'indigo.0');
    for (let i = 0; i < 50; i++) k.star((i * 61) % RW, (i * 37) % 60, i % 3 ? 'violet.2' : 'sky.2');
    k.flat(84, 8, 88, 18, 'night', 'pink.2'); for (let i = 0; i < 5; i++) k.rect(92 + i * 16, 14, 10, 6, ['pink.2', 'sky.2', 'gold.2', 'mint.2', 'violet.2'][i]);
    k.rect(0, 30, RW, 1, 'pink.2'); k.rect(0, 32, RW, 1, 'sky.2'); // neon strips
    for (const [x, c] of [[8, 'red'], [64, 'sky'], [148, 'gold'], [204, 'green']]) {
      k.shadow(x + 22, 206, 26, 'night');
      k.prop('cabinet', x + 22, 206, { accent: c, wall: 'cream', glass: 'indigo', stone: 'slate' });
    }
    k.prop('claw', 128, 206, { accent: 'pink', glass: 'sky', wall: 'gold' });
    for (let y = HZ + 32; y < RH; y++) for (let x = 0; x < RW; x++) k.set(x, y, (Math.floor(x / 10) * 3 + Math.floor((y - HZ) / 8) * 5) % 7 === 0 ? 'pink.2' : ((x + y) % 19 === 0 ? 'sky.2' : 'indigo.1'));
    k.rect(0, HZ + 32, RW, 1, 'violet.1');
    for (const [x, c] of [[30, 'red.3'], [86, 'sky.3'], [170, 'gold.3'], [226, 'mint.3']]) k.lightPool(x, HZ + 40, 26, 6, c);
    k.layer('front');
    // a gumball machine
    k.shadow(18, 262, 14); k.prop('gumball', 18, 262, { accent: 'red', glass: 'sky', wall: 'gold', roof: 'pink' });
    k.layer('back');
  },
  hospital(k) {
    k.wall('white', 'mint.3', 'stripes', { wainscot: 'mint.2' });
    k.flat(22, 30, 38, 38, 'white', 'red.1'); k.rect(37, 36, 8, 26, 'red.2'); k.rect(28, 45, 26, 8, 'red.2');
    k.window(84, 30, 50, 40);
    k.clock(160, 44, 9);
    k.rect(176, 20, 80, 2, 'slate.1');
    for (let x = 178; x < RW; x += 4) k.rect(x, 22, 2, 70, x % 8 ? 'mint.2' : 'mint.1');
    k.shadow(212, HZ + 4, 40);
    k.prop('bed', 212, 184, { wall: 'cream', glass: 'sky', accent: 'sky', stone: 'slate' });
    k.rect(154, 90, 2, 84, 'slate.1'); k.block(148, 84, 14, 18, 'sky.3'); k.line(155, 102, 168, 140, 'mist');
    k.block(10, 104, 52, 64, 'slate.3'); k.rect(36, 105, 1, 62, 'slate.1');
    k.shelf(14, 126, 20, 'bottles', ['red.2', 'sky.2', 'gold.2']); k.shelf(40, 126, 20, 'bottles', ['mint.2', 'pink.2']);
    k.vignette('mint.2', 30);
    k.tiles(HZ, 'mint.3', 'white', 20); k.floorShadow('mint.1');
    k.beam(86, HZ, 46, 250, 'white', 0.3);
    k.layer('front');
    k.plant(18, 262, 1.2, 'green.2', 'sky.1', 7);
    k.shadow(238, 262, 12); k.block(226, 230, 24, 30, 'slate.3'); k.rect(230, 236, 16, 2, 'slate.1'); k.disc(238, 248, 4, 'red.2', { outline: 'red.0' });
    k.layer('back');
  },
  // ---- uptown ----
  dept(k) {
    k.wall('cream.3', 'gold.3', 'diamonds');
    for (const x of [78, 178]) { k.block(x - 5, 0, 10, HZ, 'white'); k.rect(x - 7, HZ - 12, 14, 12, 'mist'); } // pillars
    k.block(84, 10, 88, 22, 'red.1'); k.rect(92, 18, 72, 6, 'white'); for (let i = 0; i < 6; i++) k.rect(96 + i * 12, 19, 6, 4, 'red.1');
    for (let i = 0; i < 3; i++) { k.shelf(6, 64 + i * 30, 66, 'boxes'); k.shelf(184, 64 + i * 30, 66, 'boxes', ['red.2', 'blue.2', 'gold.2']); }
    for (let i = 0; i < 14; i++) { k.rect(92 + i * 5, 168 - i * 8, 22, 3, 'slate.2'); k.rect(92 + i * 5, 171 - i * 8, 22, 1, 'slate.0'); }
    k.line(88, 166, 158, 54, 'slate.0'); k.line(116, 172, 184, 60, 'slate.0');
    k.line(88, 160, 158, 48, 'sky.3'); k.line(116, 166, 184, 54, 'sky.3');
    k.vignette('gold.2', 30);
    k.tiles(HZ, 'white', 'mist', 24); k.floorShadow('silver');
    for (const x of [40, 128, 216]) k.lightPool(x, HZ + 24, 30, 6, 'white');
    k.shadow(220, 236, 24); k.block(196, 210, 48, 10, 'white'); k.rect(200, 220, 4, 16, 'slate.1'); k.rect(236, 220, 4, 16, 'slate.1');
    for (const [x, c] of [[204, 'pink.2'], [218, 'sky.2'], [230, 'gold.2']]) k.block(x, 200, 10, 10, c);
    k.layer('front');
    for (const [x, c] of [[8, 'red.2'], [22, 'violet.2']]) { k.shadow(x + 7, 262, 9); k.block(x, 240, 15, 20, c); k.ellipse(x + 7, 240, 5, 5, c, { outline: dk(c, 2) }); k.rect(x + 3, 246, 9, 2, 'white'); }
    k.plant(240, 262, 1.1, 'green.2', 'gold.2', 11);
    k.layer('back');
  },
  salon(k) {
    k.wall('violet.3', 'pink.3', 'dots', { wainscot: 'violet.2' });
    for (const x of [30, 154]) {
      k.prop('vanity', x + 36, 112, { wall: 'cream', roof: 'gold' });
      k.shadow(x + 36, 214, 24);
      k.prop('salonChair', x + 36, 214, { accent: 'pink', stone: 'slate' });
    }
    k.shelf(108, 40, 40, 'bottles', ['pink.2', 'violet.2', 'mint.2']); k.shelf(108, 70, 40, 'bottles', ['gold.2', 'sky.2']);
    k.ellipse(128, 120, 16, 12, 'mist', { outline: 'gray', shade: true }); k.rect(127, 132, 2, 76, 'slate.1'); k.rect(118, 206, 20, 3, 'slate.0');
    k.vignette('violet.2', 34);
    k.tiles(HZ, 'white', 'violet.3', 16); k.floorShadow();
    for (const x of [66, 190]) k.lightPool(x, HZ + 36, 28, 7, 'white');
    k.layer('front');
    k.plant(16, 262, 1.1, 'green.2', 'violet.2', 13);
    k.shadow(240, 262, 12); for (let i = 0; i < 3; i++) k.block(226, 248 - i * 7, 28, 7, ['pink.3', 'white', 'sky.3'][i]); // folded towels
    k.layer('back');
  },
  school(k) {
    k.wall('lime.3', 'cream.3', 'bricks', { wainscot: 'brown.2' });
    k.block(50, 22, 156, 76, 'brown.2'); k.flat(56, 28, 144, 62, 'green.0', 'green.0'); k.dither(56, 28, 144, 62, C('green.1'), 1);
    k.rect(66, 38, 6, 1, 'white'); k.rect(74, 38, 30, 1, 'white'); k.rect(66, 48, 52, 1, 'white'); k.rect(66, 58, 24, 1, 'white'); k.rect(66, 68, 40, 1, 'gold.3');
    for (let i = 0; i < 4; i++) k.puff(150 + i * 10, 52, 3, ['pink.2', 'sky.2', 'gold.2', 'white'][i]);
    k.line(140, 70, 186, 70, 'white'); k.rect(62, 90, 36, 3, 'white');
    k.clock(228, 36, 10);
    for (let i = 0; i < 5; i++) k.block(8 + i * 8, 10, 7, 9, ['red.2', 'gold.2', 'sky.2', 'green.2', 'violet.2'][i]);
    k.shelf(6, 110, 38, 'books', ['red.2', 'sky.2', 'gold.2', 'green.2', 'violet.2']);
    k.shadow(228, 160, 10); k.prop('globe', 228, 160, { glass: 'sky', leaf: 'green', accent: 'gold' });
    k.vignette('lime.1', 30);
    k.planks(HZ, 'gold.2'); k.floorShadow();
    k.lightPool(128, HZ + 30, 70, 10, 'gold.3');
    for (const x of [18, 186]) { k.shadow(x + 26, 244, 30); k.prop('desk', x + 26, 244, { accent: x < 128 ? 'red' : 'violet', glass: 'sky' }); }
    k.layer('front');
    k.plant(240, 262, 1.1, 'green.2', 'red.2', 17);
    k.shadow(16, 262, 12); k.block(4, 242, 24, 18, 'sky.2'); k.rect(8, 238, 16, 4, 'sky.1'); k.rect(10, 248, 12, 2, 'white'); // a schoolbag
    k.layer('back');
  },
  work(k) {
    k.wall('slate.3', 'slate.2', 'bricks');
    k.window(18, 30, 54, 40);
    k.block(96, 24, 92, 62, 'brown.3'); for (let y = 30; y < 82; y += 6) for (let x = 102; x < 184; x += 6) k.set(x, y, 'brown.1');
    k.line(110, 34, 110, 70, 'slate.0'); k.block(104, 30, 12, 8, 'red.2');
    k.line(130, 34, 140, 72, 'slate.1'); k.line(140, 34, 130, 72, 'slate.1'); k.puff(130, 74, 3, 'red.2'); k.puff(140, 74, 3, 'red.2');
    k.rect(158, 34, 3, 34, 'gold.2'); k.rect(156, 66, 7, 12, 'slate.0');
    k.disc(176, 52, 7, 'slate.1', { outline: 'slate.0' }); k.disc(176, 52, 2, 'brown.3');
    const gear = (cx, cy, r, c) => { for (let a = 0; a < 10; a++) k.disc(cx + Math.cos(a * Math.PI / 5) * r, cy + Math.sin(a * Math.PI / 5) * r, 4, c); k.disc(cx, cy, r, c, { outline: dk(c, 2), shade: true }); k.disc(cx, cy, r / 3, 'slate.3', { outline: dk(c, 2) }); };
    gear(222, 62, 18, 'slate.1'); gear(232, 104, 11, 'gold.2');
    k.rect(64, 0, 1, 100, 'ink'); k.ellipse(64, 104, 10, 5, 'gold.2', { outline: 'gold.0' }); // work lamp
    k.vignette('slate.1', 36);
    k.planks(HZ, 'slate.2'); k.floorShadow();
    k.beam(20, HZ, 40, 240, 'white', 0.3); k.lightPool(64, HZ + 30, 34, 8, 'gold.3');
    k.shadow(56, 246, 50); k.prop('workbench', 56, 248);
    k.block(70, 186, 22, 12, 'slate.1'); k.rect(78, 182, 6, 4, 'slate.0'); k.block(26, 188, 20, 10, 'red.2');
    k.layer('front');
    for (const [x, y, f] of [[228, 264, false], [252, 264, true], [240, 242, false]]) k.prop('crate', x, y, { wall: 'gold', flip: f });
    k.shadow(18, 262, 14); k.prop('toolbox', 18, 262, { accent: 'red' });
    k.layer('back');
  },
  chapel(k) {
    k.wall('white', 'pink.3', 'stripes');
    k.disc(128, 62, 34, 'gold.1', { outline: 'gold.0' }); k.rect(94, 62, 69, 60, 'gold.1'); k.box(94, 62, 69, 60, 'gold.0');
    k.disc(128, 62, 29, 'sky.2'); k.rect(99, 62, 59, 56, 'sky.2');
    for (const [c, x, y] of [['pink.2', 104, 70], ['violet.2', 132, 70], ['mint.2', 104, 94], ['gold.3', 132, 94], ['red.2', 118, 40]]) k.flat(x, y, 20, 20, c, 'ink');
    k.disc(128, 50, 8, 'gold.3', { outline: 'ink' });
    for (let x = 99; x < 158; x += 1) if (x % 14 === 0) k.rect(x, 62, 1, 56, 'ink');
    // a flower arch over the altar
    for (let a = 0; a <= 20; a++) { const t = a / 20 * Math.PI; k.puff(128 - Math.cos(t) * 60, 150 - Math.sin(t) * 40, 5, a % 3 ? 'pink.3' : 'white', { line: 'pink.1' }); if (a % 4 === 2) k.puff(128 - Math.cos(t) * 60, 150 - Math.sin(t) * 40, 3, 'green.2'); }
    for (const x of [30, 226]) {
      k.shadow(x, HZ + 2, 12);
      k.rect(x - 1, 124, 3, 48, 'gold.1'); k.rect(x - 8, 170, 17, 3, 'gold.0');
      for (const [dx, dy, c] of [[-6, -6, 'pink.2'], [6, -6, 'pink.3'], [0, -12, 'white'], [-4, -14, 'pink.3'], [4, -14, 'pink.2']]) k.puff(x + dx, 120 + dy, 5, c);
    }
    k.vignette('pink.2', 34);
    k.planks(HZ, 'pink.3'); k.floorShadow();
    // coloured light from the window
    for (const [x, c] of [[98, 'pink.2'], [116, 'violet.3'], [134, 'gold.3'], [152, 'mint.3']]) k.lightPool(x, HZ + 18, 10, 5, c);
    for (let y = HZ; y < RH; y++) { const half = 10 + (y - HZ) * 0.3; k.rect(128 - half, y, half * 2, 1, 'red.1'); }
    for (let i = 0; i < 16; i++) k.set(122 + (i * 7) % 14, HZ + 8 + i * 8, 'pink.3');
    for (const x of [4, 182]) for (let r = 0; r < 2; r++) k.prop('pew', x + 35, 207 + r * 34);
    k.layer('front');
    for (const x of [14, 242]) { k.shadow(x, 262, 12); k.block(x - 8, 238, 16, 22, 'white'); k.rect(x - 10, 236, 20, 3, 'mist'); k.canopy(x - 14, 206, 28, 30, 'pink.3', { seed: x, r: 6, line: 'pink.1' }); }
    k.layer('back');
  },
  studio(k) {
    k.rect(0, 0, RW, RH, 'slate.0');
    for (let x = 0; x < RW; x += 12) k.rect(x, 0, 6, HZ, 'slate.1');
    k.block(46, 14, 164, 160, 'sky.3', { outline: 'slate.0' });
    for (let y = 120; y < 216; y++) k.rect(47, y, 162, 1, y > 174 ? ((y & 1) ? 'sky.3' : 'mist') : 'sky.3');
    k.dither(47, 150, 162, 24, C('mist'));
    k.rect(40, 10, 176, 6, 'slate.2');
    for (const [x, y] of [[80, 40], [178, 56], [140, 30]]) k.star5(x, y, 4, 'white'); // backdrop decals
    k.rect(0, 216, RW, RH - 216, 'slate.1');
    for (const x of [18, 238]) {
      k.rect(x - 1, 70, 3, 146, 'ink'); for (const dx of [-8, 8]) k.line(x, 214, x + dx, 222, 'ink');
      for (let j = 0; j < 26; j++) k.rect(x - 14, 34 + j, 28, 1, j < 3 || j > 22 ? 'gray' : 'white');
      k.box(x - 14, 34, 28, 26, 'ink');
    }
    k.lightPool(128, 216, 70, 10, 'white');
    k.shadow(128, 224, 16, 'slate.0'); k.ellipse(128, 194, 13, 4, 'red.2', { outline: 'red.0' }); for (const dx of [-9, 0, 9]) k.rect(128 + dx, 197, 2, 26, 'slate.2');
    k.prop('camera', 128, 222, { stone: 'slate', glass: 'sky' });
    k.layer('front');
    k.plant(242, 262, 1.2, 'green.2', 'gold.2', 19);
    for (let j = 0; j < 30; j++) k.rect(4, 230 + j, 20 - Math.abs(j - 15) * 0.6, 1, j < 15 ? 'white' : 'mist'); k.rect(13, 260, 2, 4, 'ink'); // a reflector
    k.layer('back');
  },
  // ---- seaside & country ----
  beach(k) {
    k.bands(['sky.1', 'sky.2', 'sky.3'], 0, 92);
    for (let j = -26; j <= 26; j++) for (let i = -26; i <= 26; i++) { const d = i * i + j * j; if (d < 676 && d > 230 && ((i + j) & 1) === 0 && (d < 420 || ((i * 3 + j) & 3) === 0)) k.set(212 + i, 30 + j, 'white'); } // a soft glow
    k.disc(212, 30, 14, 'gold.3', { outline: 'orange.3' }); k.disc(207, 25, 5, 'white');
    k.pcloud(20, 40, 70, 'pink.3'); k.pcloud(124, 58, 48, 'violet.3', 0.8);
    // the sea, deeper toward the horizon
    k.rect(0, 92, RW, 6, 'blue.2'); k.rect(0, 98, RW, 22, 'sky.1'); k.rect(0, 120, RW, 30, 'sky.2');
    for (let y = 96, r = 0; y < 148; y += 5 + r, r++) for (let x = (y * 7) % 30; x < RW; x += 30) { k.rect(x, y, 6 + r * 2, 1, 'sky.3'); }
    for (let i = 0; i < 14; i++) k.sparkle((i * 43) % RW, 104 + (i * 17) % 40);
    k.ellipse(70, 96, 22, 4, 'gold.2'); k.rect(66, 84, 2, 10, 'brown.1'); k.ellipse(67, 84, 8, 3, 'green.2'); // a little island
    // sand
    k.rect(0, 148, RW, RH - 148, 'gold.3'); k.mottle(160, 300, 'cream.3', 7, 9);
    for (let x = 0; x < RW; x++) { const y = 148 + Math.round(Math.sin(x / 15) * 2); k.set(x, y, 'white'); k.set(x, y - 1, 'sky.3'); k.set(x, y + 1, 'sky.3'); if ((x & 1) === 0) k.set(x, y + 3, 'white'); }
    // palm tree
    k.shadow(40, 202, 30, 'gold.1');
    for (let j = 0; j < 108; j++) { const x = 28 + Math.round(Math.sin(j / 40) * 8); k.rect(x, 94 + j, 8, 1, j % 8 < 2 ? 'brown.1' : 'brown.2'); k.set(x, 94 + j, 'brown.0'); }
    // drooping fronds with leaflets, darker underneath
    for (const [ang, len] of [[-2.8, 44], [-2.3, 38], [-1.7, 28], [-1.2, 30], [-0.6, 40], [-0.15, 44], [2.9, 34]]) {
      for (let i = 0; i < len; i++) {
        const t = i / len, px = 34 + Math.cos(ang) * i, py = 92 + Math.sin(ang) * i * 0.6 + t * t * 26, wd = Math.round(2 - t * 1.5);
        for (let w = -wd; w <= wd + 1; w++) k.set(px, py + w, w < 0 ? 'green.3' : w > wd - 1 ? 'green.1' : 'green.2');
        if (i % 3 === 0 && i > 3) { const ly = 5 + t * 4; k.line(px, py + 1, px + 2, py + ly, 'green.1'); k.line(px, py + 1, px - 2, py + ly, 'green.2'); }
      }
    }
    k.puff(30, 94, 3, 'brown.1'); k.puff(37, 95, 3, 'brown.1'); k.puff(33, 98, 3, 'brown.2');
    // umbrella, towel and a sandcastle
    k.shadow(206, 206, 34, 'gold.1');
    k.rect(204, 144, 3, 64, 'white');
    for (let j = 0; j < 16; j++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - ((16 - j) / 16) ** 2)) * 34); for (let i = -half; i < half; i++) k.set(206 + i, 128 + j, Math.floor((i + 34) / 11) % 2 ? 'white' : 'red.2'); }
    k.rect(172, 144, 68, 1, 'red.0');
    k.block(150, 214, 44, 14, 'sky.2'); for (let x = 152; x < 192; x += 6) k.rect(x, 215, 3, 12, 'white');
    // a sandcastle: a lumpy mound with two towers, a moat and a flag
    k.blob(114, 186, 22, 5, 'sky.2', { seed: 6, line: 'gold.1', wob: 0.15 });
    k.blob(114, 176, 18, 9, 'gold.2', { seed: 7, line: 'gold.0', wob: 0.18 });
    for (const [x, h] of [[106, 14], [122, 11]]) { k.blob(x, 168 - h / 2, 5, h / 2 + 2, 'gold.2', { seed: x, line: 'gold.0', wob: 0.12 }); for (const dx of [-3, 0, 3]) k.set(x + dx, 166 - h, 'gold.0'); }
    k.rect(106, 146, 1, 8, 'ink'); k.rect(107, 146, 5, 3, 'red.2'); k.puff(118, 180, 2, 'pink.3');
    k.star5(140, 204, 6, 'orange.2');
    k.puff(64, 214, 3, 'pink.3');
    k.layer('front');
    for (const [x, c] of [[6, 'green.2'], [16, 'green.1'], [244, 'green.2'], [252, 'green.1']]) for (let i = 0; i < 6; i++) k.line(x, 258, x - 12 + i * 5, 210 + Math.abs(i - 3) * 6, c);
    k.rock(232, 250, 10, 'slate.3'); k.star5(232, 236, 5, 'pink.2');
    k.layer('back');
  },
  forest(k) {
    // a deep, quiet wood: misty trunks, an ancient hollow tree and a fairy ring in a sunny glade
    k.bands(['mint.3', 'sky.3'], 0, 140);
    const rnd = rand(77);
    for (let i = 0; i < 10; i++) { const x = 6 + i * 27 + rnd() * 10; k.trunk(x, 10, 132, 5 + rnd() * 4, 8 + rnd() * 5, 'mint.2', i + 1); }
    k.mist(64, 16, 'mint.3', 3); k.mist(104, 18, 'white', 4);
    for (let i = 0; i < 6; i++) { const x = 14 + i * 46 + rnd() * 10; k.trunk(x, 30, 136, 7 + rnd() * 3, 11 + rnd() * 4, 'mint.1', i + 20); }
    k.canopy(-36, -34, 330, 74, 'green.1', { seed: 71, r: 16 }); // the canopy overhead
    k.rect(0, 128, RW, RH - 128, 'green.2');
    k.blob(118, 178, 104, 40, 'green.3', { seed: 5, line: null, shade: false, wob: 0.15 }); // the sunny glade
    k.mottle(130, 160, 'green.1', 6, 7); k.mottle(170, 260, 'lime.3', 6, 21);
    k.tufts(132, 260, 'green.1', 44, 3); k.tufts(150, 250, 'green.3', 18, 8);
    // the ancient tree, roots spilling over the ground, with a hollow and moss
    const tx = 210;
    k.blob(tx + 6, 166, 50, 8, 'green.1', { seed: 9, line: null, shade: false, wob: 0.2 });
    k.trunk(tx, 20, 160, 34, 48, 'brown.2', 42);
    for (const [dx, w, ry] of [[-30, 16, 5], [-14, 12, 4], [26, 18, 5], [12, 10, 3]]) k.blob(tx + dx, 162 + ry / 2, w, ry, 'brown.2', { seed: dx + 50, wob: 0.2 });
    k.blob(tx + 2, 118, 10, 15, 'brown.0', { seed: 3, line: 'brown.0', shade: false }); k.blob(tx + 3, 122, 7, 10, 'night', { seed: 4, line: null, shade: false });
    k.set(tx, 118, 'gold.3'); k.set(tx + 5, 118, 'gold.3');
    for (const [dx, dy] of [[-16, 60], [8, 90], [-10, 140]]) k.blob(tx + dx, dy, 7, 3, 'green.2', { seed: dx + dy, wob: 0.3 });
    k.canopy(tx - 58, -8, 116, 64, 'green.2', { seed: 43, r: 14 });
    // the fairy ring, catching the light
    k.lightPool(104, 176, 34, 9, 'lime.3');
    for (let a = 0; a < 11; a++) { const j = rnd(), x = 104 + Math.cos(a * 0.571 + j * 0.2) * (32 + j * 4), y = 176 + Math.sin(a * 0.571) * 9; k.mushroom(Math.round(x), Math.round(y), j < 0.3 ? 'pink.2' : 'red.2', 0.5 + j * 0.35); }
    // a mossy log, ferns, flowers and fireflies
    k.blob(32, 210, 30, 4, 'green.1', { seed: 12, line: null, shade: false });
    k.prop('log', 30, 208); k.prop('bushC', 18, 200, { leaf: 'green' });
    const fern = (x, y, s = 1, c = 'green.1') => k.prop('fern', x, y, { leaf: rampOf(c), flip: x % 2 === 1 });
    fern(150, 206); fern(162, 212, 0.8, 'lime.2'); fern(244, 196, 1.1); k.prop('stump', 92, 152);
    k.flowerPatch(128, 214, 5, ['violet.2', 'white']); k.flowerPatch(76, 152, 4, ['white', 'gold.2']);
    k.rocks(176, 214, 2, 'slate.3');
    for (let i = 0; i < 18; i++) { const x = rnd() * RW, y = 70 + rnd() * 140; k.set(x, y, 'gold.3'); k.set(x + 1, y, 'lime.3'); }
    k.layer('front');
    k.canopy(-30, 200, 76, 64, 'green.1', { seed: 91, r: 13 }); fern(30, 252, 1.4, 'green.0');
    k.canopy(214, 208, 70, 56, 'green.1', { seed: 92, r: 12 }); fern(236, 254, 1.3, 'green.2');
    k.layer('back');
  },
  fair(k) {
    k.bands(['sky.2', 'pink.3', 'gold.3'], 0, HZ);
    k.pcloud(150, 24, 60, 'pink.2'); k.pcloud(14, 150, 40, 'violet.3', 0.7);
    k.canopy(110, 118, 60, 46, 'green.2', { seed: 25, r: 9 });
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
    k.rect(0, HZ, RW, RH - HZ, 'green.3'); k.mottle(HZ + 4, 300, 'lime.3', 8, 31); k.tufts(HZ + 4, 260, 'green.2', 36, 14);
    k.trail(HZ, RH, (y) => 128 + Math.sin((y - HZ) / 26) * 10, (y) => 22 + (y - HZ) * 0.5, 'pink.3', { seed: 9, pebbles: false });
    k.stringLights(12, 10);
    // striped tents with bell roofs and scalloped trims, and a popcorn cart
    for (const [x, c] of [[176, 'red'], [230, 'sky']]) {
      k.blob(x + 4, HZ + 4, 28, 4, 'green.2', { seed: x, line: null, shade: false });
      k.prop('tent', x, HZ + 2, { accent: c, wall: 'cream', flip: x > 200 });
    }
    k.shadow(26, 226, 18); k.block(10, 192, 32, 30, 'red.2'); k.flat(14, 180, 24, 12, 'sky.3', 'slate.1'); for (const [x, y] of [[18, 184], [24, 182], [30, 185], [21, 188], [28, 188]]) k.disc(x, y, 2, 'cream.3'); k.disc(16, 224, 4, 'ink'); k.disc(36, 224, 4, 'ink');
    k.layer('front');
    for (let i = 0; i < 4; i++) { const x = 228 + i * 7; k.line(x, 236, x - 3 + i, 196 - (i % 2) * 8, 'ink'); k.ball(x - 3 + i, 190 - (i % 2) * 8, 6, ['red.2', 'gold.2', 'violet.2', 'sky.2'][i]); }
    k.canopy(-12, 214, 50, 40, 'green.2', { seed: 26, r: 9 });
    k.layer('back');
  },
  stage(k) {
    k.rect(0, 0, RW, RH, 'indigo.0');
    k.rect(44, 24, 168, HZ - 24, 'violet.0'); k.dither(44, 24, 168, HZ - 24, C('indigo.0'));
    for (let i = 0; i < 14; i++) k.star5(60 + (i * 37) % 136, 40 + (i * 23) % 90, 2 + (i % 2), i % 2 ? 'gold.3' : 'pink.3'); // star backdrop
    for (const cx of [86, 170]) for (let y = 20; y < HZ + 20; y++) {
      const half = Math.round(4 + (y - 20) * 0.24);
      for (let x = cx - half; x < cx + half; x++) if (((x + y) & 1) === 0) k.set(x, y, 'gold.3');
    }
    k.curtain(0, 46, HZ + 14); k.curtain(RW - 46, 46, HZ + 14);
    k.rect(0, 0, RW, 16, 'red.1'); for (let x = 0; x < RW; x += 16) { k.ellipse(x + 8, 16, 8, 6, 'red.1', { outline: 'red.0' }); k.rect(x + 7, 20, 2, 6, 'gold.2'); k.puff(x + 8, 27, 2, 'gold.2'); }
    k.rect(0, 0, RW, 3, 'gold.2'); k.rect(0, 3, RW, 1, 'gold.0');
    k.planks(HZ, 'brown.2');
    for (const cx of [86, 170]) k.lightPool(cx, HZ + 20, 34, 9, 'gold.3');
    k.block(0, HZ + 34, RW, 10, 'brown.1'); for (let x = 12; x < RW; x += 28) { k.puff(x, HZ + 38, 3, 'gold.3'); }
    k.shadow(128, 226, 8); k.rect(127, 182, 2, 44, 'slate.1'); k.rect(122, 224, 12, 2, 'ink'); k.ellipse(128, 178, 3, 4, 'slate.2', { outline: 'ink' });
    k.rect(0, HZ + 44, RW, RH - HZ - 44, 'indigo.0');
    k.layer('front');
    // the audience, in silhouette
    for (let r = 0; r < 2; r++) for (let x = (r % 2) * 11 + 6; x < RW; x += 22) { const y = 250 + r * 12; k.puff(x, y, 9, r ? 'indigo.1' : 'violet.0', { line: 'indigo.0', hi: r ? 'indigo.2' : 'violet.1' }); if ((x / 22 | 0) % 3 === 0) { k.puff(x - 6, y - 9, 3, r ? 'indigo.1' : 'violet.0', { line: 'indigo.0', hi: 'violet.1' }); k.puff(x + 6, y - 9, 3, r ? 'indigo.1' : 'violet.0', { line: 'indigo.0', hi: 'violet.1' }); } }
    k.layer('back');
  },
  // ---- far away ----
  castle(k) {
    k.bands(['violet.3', 'pink.3', 'pink.3'], 0, 110);
    k.pcloud(10, 34, 56, 'violet.3'); k.pcloud(196, 54, 54, 'pink.2', 0.9);
    k.mountain(30, 110, 120, 30, 'violet.3'); k.mountain(226, 110, 120, 36, 'violet.3');
    k.rect(0, 106, RW, RH - 106, 'green.3'); k.ellipse(128, 118, 120, 18, 'green.3'); k.mottle(114, 300, 'lime.3', 12, 6);
    k.groundShade(200, 'green.2'); k.tufts(120, 270, 'green.2', 36, 9);
    // the castle on its hill
    const B = 124;
    k.prop('keep', 128, B, { accent: 'red', glass: 'gold' });
    for (const x of [58, 198]) { k.prop('tower', x, B, { roof: 'violet', glass: 'gold' }); k.rect(x, B - 124, 1, 8, 'ink'); k.rect(x + 1, B - 124, 8, 4, 'red.2'); }
    k.shadow(128, B + 2, 70, 'green.2');
    // a winding path down to you
    for (let y = B; y < RH; y++) { const cx = 128 + Math.sin((y - B) / 30) * 18, half = 12 + (y - B) * 0.32; k.rect(cx - half, y, half * 2, 1, 'cream.3'); k.set(cx - half, y, 'cream.1'); k.set(cx + half, y, 'cream.1'); }
    k.canopy(0, 96, 56, 40, 'green.2', { seed: 11, r: 10 }); k.canopy(200, 92, 58, 44, 'green.2', { seed: 12, r: 10 });
    k.flowers(30, 176, 5, 'violet.2'); k.flowers(196, 180, 5, 'red.2'); k.flowers(60, 214, 4, 'pink.2');
    k.layer('front');
    k.canopy(-14, 200, 60, 56, 'green.1', { seed: 13, r: 11 }); k.canopy(216, 204, 56, 52, 'green.1', { seed: 14, r: 11 });
    k.layer('back');
  },
  starisle(k) {
    // twilight among the stars: a wishing shrine on a floating meadow
    k.bands(['indigo.1', 'violet.1', 'violet.2', 'pink.2', 'pink.3'], 0, 156);
    for (let i = 0; i < 60; i++) { const x = (i * 71) % RW, y = (i * 43) % 120; if (i % 4) k.set(x, y, i % 3 ? 'white' : 'gold.3'); else k.sparkle(x, y); }
    // aurora ribbons
    for (let x = 0; x < RW; x++) for (let j = 0; j < 10; j++) { const y = 46 + Math.sin(x / 26) * 10 + j - x * 0.05; if (((x + j) & 1) === 0) k.set(x, y, j < 4 ? 'mint.3' : 'sky.3'); }
    // a big moon with craters, and two little floating islands
    k.disc(52, 40, 20, 'gold.3', { outline: 'gold.2', shade: true }); k.disc(46, 36, 4, 'gold.2'); k.disc(60, 48, 3, 'gold.2'); k.disc(58, 30, 2, 'gold.2');
    for (const [x, y, w] of [[220, 92, 30], [28, 122, 22]]) {
      k.blob(x, y + 6, w / 2, w / 3, 'violet.2', { seed: x, wob: 0.25 }); // the rocky underside
      k.blob(x, y, w / 2 + 1, 4, 'mint.2', { seed: x + 1, wob: 0.1, line: 'mint.0' });
      k.puff(x - w / 5, y - 3, 3, 'green.2'); k.star5(x + 3, y - 7, 3, 'gold.3');
    }
    // the meadow you stand on
    k.rect(0, 150, RW, RH - 150, 'mint.2'); k.ellipse(128, 150, 140, 10, 'mint.3'); k.mottle(156, 300, 'mint.3', 12, 17); k.mottle(170, 300, 'sky.2', 5, 3);
    k.groundShade(196, 'mint.1'); k.tufts(156, 270, 'mint.1', 34, 5);
    // crystal clusters at the back
    for (const [cx, cy, s] of [[24, 158, 1], [238, 160, 1.2], [90, 156, 0.7]]) for (const [dx, h] of [[-6, 16], [0, 26], [7, 18]]) for (let j = 0; j < h * s; j++) { const half = Math.max(1, Math.round((1 - j / (h * s)) * 4 * s)); k.rect(cx + dx * s - half, cy - j, half * 2, 1, j > h * s * 0.7 ? 'white' : dx < 0 ? 'sky.3' : 'violet.3'); k.set(cx + dx * s + half - 1, cy - j, 'blue.1'); }
    // stepping stones to the shrine
    for (let i = 0; i < 6; i++) k.ellipse(128 + Math.sin(i) * 8, 246 - i * 16, 10 - i, 4 - i * 0.4, 'slate.3', { outline: 'slate.1' });
    // the wishing shrine: steps, a pedestal and a glowing star
    k.shadow(128, 154, 40, 'mint.1');
    for (let j = 0; j < 3; j++) k.block(100 + j * 6, 140 - j * 8, 56 - j * 12, 8, 'slate.3');
    k.block(118, 106, 20, 18, 'violet.3'); k.rect(116, 104, 24, 3, 'violet.2');
    for (let j = -24; j <= 24; j++) for (let i = -24; i <= 24; i++) if (i * i + j * j < 560 && ((i + j) & 1) === 0) k.set(128 + i, 84 + j, j < 0 ? 'gold.3' : 'pink.3');
    k.star5(128, 84, 14, 'gold.3');
    for (const dx of [-20, 20]) { k.sparkle(128 + dx, 70); }
    // star lanterns and glowing flowers
    for (const x of [62, 194]) { k.rect(x, 120, 2, 50, 'slate.1'); k.star5(x + 1, 116, 7, 'gold.3'); k.lightPool(x + 1, 170, 14, 4, 'gold.3'); }
    for (const [x, y, c] of [[30, 188, 'pink.2'], [88, 206, 'sky.3'], [170, 200, 'violet.3'], [226, 182, 'gold.3'], [140, 222, 'pink.3']]) { k.rect(x, y - 4, 1, 4, 'mint.1'); k.star5(x, y - 6, 3, c); }
    k.layer('front');
    for (const [x, y, h, c] of [[8, 252, 30, 'sky.3'], [20, 256, 20, 'violet.3'], [244, 254, 28, 'pink.3'], [232, 258, 18, 'sky.3']]) {
      for (let j = 0; j < h; j++) { const half = Math.round((h - j) * 0.22) + 1; k.rect(x - half, y - j, half * 2, 1, j < h * 0.3 ? 'white' : c); k.set(x + half - 1, y - j, dk(c)); }
    }
    k.layer('back');
  },
  // ---- hidden ----
  hidden(k) {
    // a village of treehouses deep in a sunset grove, joined by rope bridges
    k.bands(['orange.3', 'gold.3', 'pink.3'], 0, 140);
    k.disc(128, 96, 26, 'gold.3', { outline: 'orange.3' });
    k.dither(0, 60, RW, 80, C('pink.3'));
    for (let x = -8; x < RW + 10; x += 14) k.puff(x, 130 + ((x * 7) % 8), 11, 'violet.3', { line: 'violet.2' }); // misty far trees
    k.rect(0, 136, RW, RH - 136, 'lime.2'); k.mottle(140, 300, 'lime.3', 12, 23); k.mottle(150, 300, 'green.2', 6, 6);
    k.groundShade(200, 'green.2'); k.tufts(142, 270, 'green.2', 36, 11);
    for (const [x, y] of [[74, 158], [190, 160]]) k.bush(x, y, 'green.2', 12);
    k.flowers(56, 222, 4, 'pink.2'); k.flowers(184, 226, 4, 'gold.2');
    for (let i = 0; i < 6; i++) k.ellipse(128 + Math.sin(i * 1.3) * 10, 252 - i * 11, 8 - i * 0.6, 3, 'slate.3', { outline: 'slate.1' }); // a stone path to the fire
    // two giant trees
    for (const [x, w, sd] of [[30, 30, 81], [216, 34, 82]]) {
      k.blob(x + 6, 152, w + 16, 6, 'green.1', { seed: sd, line: null, shade: false, wob: 0.2 });
      k.trunk(x, 0, 150, w, w * 1.35, 'brown.2', sd);
      for (const [dx, rw] of [[-w * 0.7, 12], [w * 0.6, 13], [-w * 0.2, 8]]) k.blob(x + dx, 150, rw, 4, 'brown.2', { seed: sd + dx, wob: 0.2 });
      for (const [dx, dy] of [[-6, 100], [5, 40], [-8, 130]]) k.blob(x + dx, dy, 6, 3, 'green.2', { seed: sd + dy, wob: 0.3 });
    }
    // treehouses on platforms
    const house = (x, y, c) => k.prop('hut', x, y + 27, { roof: rampOf(c), glass: 'gold', flip: x > RW / 2 });
    house(34, 48, 'orange.2'); house(212, 64, 'red.2');
    // the rope bridge between them, with lanterns
    for (let x = 60; x < 186; x++) { const y = 76 + Math.sin(((x - 60) / 126) * Math.PI) * 18; k.set(x, y, 'brown.0'); k.set(x, y + 8, 'brown.1'); if (x % 6 === 0) k.rect(x, y, 1, 9, 'brown.1'); if (x % 6 === 3) k.rect(x - 2, y + 9, 5, 2, 'brown.2'); }
    for (const x of [90, 123, 156]) { const y = 76 + Math.sin(((x - 60) / 126) * Math.PI) * 18; k.rect(x, y + 1, 1, 5, 'ink'); k.dither(x - 6, y + 4, 12, 12, C('gold.3')); k.ellipse(x, y + 10, 3, 4, 'red.2', { outline: 'red.0' }); }
    // ladders down to the ground
    for (const x of [52, 232]) for (let y = 120; y < 150; y += 5) { k.rect(x, y, 8, 1, 'brown.1'); }
    for (const x of [52, 59, 232, 239]) k.rect(x, 116, 1, 34, 'brown.0');
    // a campfire with log seats
    k.shadow(128, 186, 30, 'green.1'); k.lightPool(128, 184, 40, 10, 'gold.3');
    for (let a = 0; a < 8; a++) k.puff(128 + Math.cos(a * 0.785) * 12, 182 + Math.sin(a * 0.785) * 4, 3, 'slate.3');
    k.line(118, 182, 138, 176, 'brown.1'); k.line(118, 176, 138, 182, 'brown.1');
    for (const [dx, dy, r, c] of [[0, 170, 6, 'orange.2'], [-3, 166, 4, 'gold.2'], [3, 164, 3, 'gold.3'], [0, 160, 2, 'white']]) k.puff(128 + dx, dy, r, c, { line: 'red.1', hi: lt(c) });
    for (const [x, y] of [[92, 196], [164, 196]]) { k.block(x - 12, y - 6, 24, 8, 'brown.1'); k.ellipse(x - 12, y - 2, 3, 4, 'brown.2', { outline: 'brown.0' }); }
    for (let i = 0; i < 16; i++) { const x = (i * 59) % RW, y = 100 + (i * 23) % 110; k.set(x, y, 'gold.3'); k.set(x + 1, y, 'lime.3'); }
    k.layer('front');
    k.mushroom(14, 246, 'orange.2', 1.6); k.mushroom(32, 254, 'red.2', 1.1);
    k.mushroom(242, 248, 'pink.2', 1.5); k.mushroom(226, 256, 'orange.2', 1);
    k.layer('back');
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
