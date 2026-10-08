// Town backdrops, drawn at full (double) density like the living room, and
// cached once per place. Coordinates are hi-res pixels inside the room area
// (256 x 312). The horizon / back wall meets the ground at HZ; pets stand at FEET.
import { C } from '../engine/palette.js';
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

// ---------------------------------------------------------------- drawing kit
function kit() {
  const bm = makeBitmap(RW, RH, true);
  const set = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < RW && y < RH) bm.px[y * RW + x] = typeof c === 'string' ? C(c) : c; };
  const rect = (x, y, w, h, c) => { const v = typeof c === 'string' ? C(c) : c; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, v); };
  const box = (x, y, w, h, c = 'ink') => { rect(x, y, w, 1, c); rect(x, y + h - 1, w, 1, c); rect(x, y, 1, h, c); rect(x + w - 1, y, 1, h, c); };
  const panel = (x, y, w, h, fill, line = 'ink') => { rect(x, y, w, h, fill); box(x, y, w, h, line); };
  const dither = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (((x + i + y + j) & 1) === 0) set(x + i, y + j, c); };
  const disc = (cx, cy, r, c, line = null) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = x * x + y * y;
      if (d <= r * r) set(cx + x, cy + y, line && d > (r - 1.2) * (r - 1.2) ? line : c);
    }
  };
  const ellipse = (cx, cy, rx, ry, c, line = null) => {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (d <= 1) set(cx + x, cy + y, line && d > 0.82 ? line : c);
    }
  };
  /** Two-tone gradient sky with a dithered seam. */
  const sky = (top = 'sky.2', bottom = 'sky.3', h = HZ) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < RW; x++) {
      const t = y / h;
      set(x, y, (t > 0.55 || (t > 0.42 && (x + y) % 2 === 0)) ? bottom : top);
    }
  };
  const cloud = (x, y, s = 1) => {
    ellipse(x, y, 14 * s, 6 * s, 'white'); ellipse(x - 10 * s, y + 2 * s, 9 * s, 5 * s, 'white'); ellipse(x + 11 * s, y + 2 * s, 10 * s, 5 * s, 'white');
    rect(x - 18 * s, y + 6 * s, 38 * s, 1, 'mist');
  };
  const hills = (y, c1 = 'green.2', c2 = 'green.3') => {
    for (let x = 0; x < RW; x++) {
      const a = y - 10 - Math.round(Math.sin(x / 23) * 6 + Math.sin(x / 9) * 2);
      for (let j = a; j < y; j++) set(x, j, j < a + 2 ? c2 : c1);
    }
  };
  /** Grass from the horizon down, with tufts. */
  const grass = (y = HZ, c = 'green.2', dark = 'green.1', light = 'green.3') => {
    rect(0, y, RW, RH - y, c);
    rect(0, y, RW, 2, light);
    for (let i = 0; i < 70; i++) {
      const x = (i * 37) % RW, yy = y + 6 + ((i * 53) % (RH - y - 8));
      set(x, yy, dark); set(x + 1, yy - 1, dark); set(x + 2, yy, dark);
    }
  };
  const path = (y = HZ, c = 'cream.2', edge = 'cream.1') => {
    for (let yy = y; yy < RH; yy++) {
      const half = 26 + Math.round((yy - y) * 0.9);
      const x0 = RW / 2 - half, x1 = RW / 2 + half;
      for (let x = x0; x < x1; x++) set(x, yy, (x === x0 || x === x1 - 1) ? edge : c);
    }
  };
  /** Checker floor tiles. */
  const tiles = (y = HZ, c1 = 'cream.3', c2 = 'cream.2', s = 16) => {
    for (let yy = y; yy < RH; yy++) for (let x = 0; x < RW; x++) set(x, yy, ((Math.floor(x / s) + Math.floor((yy - y) / (s / 2))) % 2) ? c2 : c1);
    rect(0, y, RW, 1, 'ink');
  };
  /** Wooden planks. */
  const planks = (y = HZ, c = 'brown.2', seam = 'brown.1', hi = 'brown.3') => {
    rect(0, y, RW, RH - y, c);
    for (let yy = y, row = 0; yy < RH; yy += 12, row++) {
      rect(0, yy, RW, 1, seam);
      for (let x = (row % 2) * 30 + 15; x < RW; x += 60) rect(x, yy + 1, 1, 11, seam);
      for (let x = (row * 19) % 37; x < RW; x += 37) set(x, yy + 6, hi);
    }
    rect(0, y, RW, 1, 'ink');
  };
  /** Indoor wall with a stripe or dot pattern, a rail and a skirting board. */
  const wall = (c = 'cream.3', pattern = 'cream.2', kind = 'stripes', y = HZ) => {
    rect(0, 0, RW, y, c);
    if (kind === 'stripes') for (let x = 0; x < RW; x += 16) rect(x, 0, 6, y - 10, pattern);
    if (kind === 'dots') for (let yy = 10, r = 0; yy < y - 20; yy += 16, r++) for (let x = r % 2 ? 8 : 16; x < RW; x += 16) { set(x, yy, pattern); set(x + 1, yy, pattern); set(x, yy + 1, pattern); set(x + 1, yy + 1, pattern); }
    if (kind === 'bricks') for (let yy = 0, r = 0; yy < y - 10; yy += 10, r++) { rect(0, yy, RW, 1, pattern); for (let x = r % 2 ? 0 : 14; x < RW; x += 28) rect(x, yy, 1, 10, pattern); }
    rect(0, y - 10, RW, 10, 'white');
    rect(0, y - 10, RW, 1, 'silver');
  };
  const tree = (x, y, s = 1, leaf = 'green.2', dark = 'green.1', light = 'green.3') => {
    rect(x - 3 * s, y - 22 * s, 6 * s, 22 * s, 'brown.1');
    rect(x - 3 * s, y - 22 * s, 2 * s, 22 * s, 'brown.2');
    disc(x, y - 34 * s, 17 * s, leaf, 'green.0');
    disc(x - 9 * s, y - 28 * s, 10 * s, leaf, 'green.0');
    disc(x + 10 * s, y - 27 * s, 10 * s, leaf, 'green.0');
    ellipse(x - 5 * s, y - 40 * s, 6 * s, 4 * s, light);
    ellipse(x + 6 * s, y - 24 * s, 7 * s, 3 * s, dark);
  };
  const bush = (x, y, c = 'green.2') => { ellipse(x, y - 6, 14, 8, c, 'green.0'); ellipse(x - 4, y - 9, 5, 3, 'green.3'); };
  const flowers = (x, y, n = 5, c = 'pink.2') => { for (let i = 0; i < n; i++) { const fx = x + i * 7, fy = y - (i % 2) * 3; rect(fx, fy, 1, 5, 'green.1'); set(fx - 1, fy - 1, c); set(fx + 1, fy - 1, c); set(fx, fy - 2, c); set(fx, fy, c); set(fx, fy - 1, 'gold.3'); } };
  const fence = (y, c = 'white') => { for (let x = 4; x < RW; x += 14) { rect(x, y - 20, 6, 20, c); box(x, y - 20, 6, 20, 'silver'); } rect(0, y - 14, RW, 3, c); rect(0, y - 6, RW, 3, c); };
  const lamp = (x, y) => { rect(x - 1, y - 54, 3, 54, 'ink'); rect(x - 5, y - 62, 11, 9, 'gold.3'); box(x - 5, y - 62, 11, 9, 'ink'); rect(x - 7, y - 64, 15, 3, 'ink'); };
  const bench = (x, y) => { rect(x, y - 12, 40, 4, 'brown.2'); box(x, y - 12, 40, 4); rect(x, y - 20, 40, 4, 'brown.2'); box(x, y - 20, 40, 4); rect(x + 3, y - 8, 3, 8, 'ink'); rect(x + 34, y - 8, 3, 8, 'ink'); };
  const windowPane = (x, y, w, h, glass = 'sky.3') => { panel(x, y, w, h, glass); rect(x + (w >> 1), y, 1, h, 'ink'); rect(x, y + (h >> 1), w, 1, 'ink'); rect(x + 2, y + 2, 3, 1, 'white'); };
  const door = (x, y, w = 22, h = 34, c = 'brown.2') => { panel(x, y - h, w, h, c); set(x + w - 5, y - h / 2, 'gold.2'); set(x + w - 5, y - h / 2 + 1, 'gold.2'); };
  /** Striped shop awning. */
  const awning = (x, y, w, c1 = 'red.2', c2 = 'white') => {
    for (let i = 0; i < w; i++) rect(x + i, y, 1, 12, Math.floor(i / 8) % 2 ? c2 : c1);
    for (let i = 0; i < w; i += 8) disc(x + i + 4, y + 12, 4, Math.floor(i / 8) % 2 ? c2 : c1);
    rect(x, y, w, 1, 'ink');
  };
  /** A shop front: wall, awning, window and door. */
  const shopFront = (x, y, w, h, wallC, awn) => {
    panel(x, y - h, w, h, wallC);
    awning(x - 3, y - h + 8, w + 6, ...awn);
    windowPane(x + 8, y - h + 30, w * 0.45 | 0, 26);
    door(x + w - 30, y, 22, 34);
  };
  const counter = (x, y, w, c = 'brown.2', top = 'cream.3') => { panel(x, y - 26, w, 26, c); rect(x - 2, y - 30, w + 4, 5, top); box(x - 2, y - 30, w + 4, 5); for (let i = x + 6; i < x + w - 4; i += 18) rect(i, y - 20, 10, 14, 'brown.1'); };
  const shelf = (x, y, w, items = ['red.2', 'gold.2', 'sky.2', 'pink.2', 'green.2', 'violet.2']) => {
    rect(x, y, w, 3, 'brown.2'); box(x, y, w, 3);
    for (let i = 0, k = 0; i < w - 8; i += 11, k++) { const c = items[k % items.length]; panel(x + 3 + i, y - 10, 8, 10, c); rect(x + 4 + i, y - 9, 2, 3, 'white'); }
  };
  const table = (x, y, w = 36) => { rect(x, y - 22, w, 4, 'white'); box(x, y - 22, w, 4); rect(x + w / 2 - 2, y - 18, 4, 18, 'brown.1'); rect(x + w / 2 - 8, y - 2, 16, 2, 'brown.1'); };
  const water = (y, c = 'sky.2', light = 'sky.3', dark = 'blue.2') => {
    rect(0, y, RW, RH - y, c);
    for (let yy = y + 4; yy < RH; yy += 8) for (let x = (yy * 7) % 24; x < RW; x += 24) { rect(x, yy, 8, 1, light); set(x + 9, yy + 1, dark); }
  };
  const star = (x, y, c = 'gold.3') => { set(x, y, 'white'); set(x - 1, y, c); set(x + 1, y, c); set(x, y - 1, c); set(x, y + 1, c); };
  const curtain = (x, w, h, c = 'red.1', fold = 'red.0') => { rect(x, 0, w, h, c); for (let i = x + 3; i < x + w; i += 7) rect(i, 0, 2, h, fold); };
  return { bm, set, rect, box, panel, dither, disc, ellipse, sky, cloud, hills, grass, path, tiles, planks, wall, tree, bush, flowers, fence, lamp, bench, windowPane, door, awning, shopFront, counter, shelf, table, water, star, curtain };
}

// ---------------------------------------------------------------- the places
const SCENES = {
  // ---- downtown ----
  square(k) {
    k.sky(); k.cloud(60, 30); k.cloud(190, 48, 0.8);
    // shopfronts around the square
    k.shopFront(6, HZ, 70, 70, 'pink.3', ['pink.2', 'white']);
    k.shopFront(180, HZ, 70, 78, 'gold.3', ['sky.2', 'white']);
    k.panel(92, HZ - 96, 72, 96, 'cream.3');               // town hall
    k.rect(88, HZ - 100, 80, 6, 'red.1'); k.box(88, HZ - 100, 80, 6);
    k.disc(128, HZ - 72, 9, 'white', 'ink'); k.rect(128, HZ - 78, 1, 6, 'ink'); k.rect(128, HZ - 72, 5, 1, 'ink'); // clock
    k.door(117, HZ, 22, 36, 'red.1');
    k.tiles(HZ, 'slate.3', 'mist', 20);
    // fountain
    k.ellipse(128, 238, 50, 12, 'slate.2', 'ink'); k.ellipse(128, 236, 44, 9, 'sky.2');
    k.rect(124, 200, 8, 36, 'slate.3'); k.box(124, 200, 8, 36);
    k.ellipse(128, 200, 18, 5, 'slate.2', 'ink'); k.ellipse(128, 199, 14, 3, 'sky.2');
    for (const [dx, dy] of [[-10, -8], [10, -8], [-16, -2], [16, -2], [0, -14]]) k.set(128 + dx, 196 + dy, 'sky.3');
    k.lamp(30, 262); k.lamp(226, 262);
  },
  park(k) {
    k.sky('sky.2', 'sky.3'); k.cloud(70, 34); k.cloud(200, 24, 0.7);
    k.hills(HZ, 'green.2', 'green.3');
    k.grass(HZ); k.path();
    k.tree(36, HZ + 8, 1.1); k.tree(222, HZ + 4, 0.9);
    // pond
    k.ellipse(210, 250, 34, 10, 'sky.2', 'blue.1'); k.rect(196, 248, 10, 1, 'sky.3');
    k.disc(200, 246, 3, 'white'); k.set(197, 246, 'orange.2'); // duck
    k.bench(14, 238); k.flowers(150, 200, 6, 'pink.2'); k.flowers(80, 206, 5, 'gold.2');
  },
  playground(k) {
    k.sky('sky.2', 'sky.3'); k.cloud(40, 28);
    k.fence(HZ + 2); k.grass(HZ + 2); k.rect(0, 210, RW, RH - 210, 'gold.3'); k.dither(0, 210, RW, 4, C('gold.2')); // sandpit
    // swing set
    k.rect(20, 120, 4, 100, 'red.1'); k.rect(100, 120, 4, 100, 'red.1'); k.rect(18, 116, 90, 6, 'red.1'); k.box(18, 116, 90, 6);
    for (const sx of [40, 76]) { k.rect(sx, 122, 1, 60, 'ink'); k.rect(sx + 14, 122, 1, 60, 'ink'); k.rect(sx - 2, 182, 18, 4, 'sky.1'); k.box(sx - 2, 182, 18, 4); }
    // slide
    k.rect(170, 120, 4, 100, 'sky.1'); k.rect(196, 120, 4, 100, 'sky.1'); k.rect(168, 118, 34, 6, 'sky.1'); k.box(168, 118, 34, 6);
    for (let i = 0; i < 60; i++) k.rect(198 + i * 0.8, 122 + i * 1.6, 12, 3, 'gold.2');
    for (let y = 130; y < 218; y += 10) k.rect(170, y, 30, 2, 'sky.2');
  },
  cafe(k) {
    k.wall('cream.3', 'pink.3', 'stripes');
    k.windowPane(20, 40, 64, 52); k.windowPane(172, 40, 64, 52);
    k.panel(104, 30, 48, 30, 'ink'); for (let i = 0; i < 4; i++) k.rect(110, 38 + i * 5, 36, 1, 'white'); // menu board
    k.planks(HZ, 'cream.2', 'cream.1', 'cream.3');
    k.table(26, 250); k.table(192, 250);
    for (const x of [44, 210]) { k.disc(x, 224, 5, 'white', 'ink'); k.rect(x - 2, 220, 4, 2, 'brown.1'); }
    k.counter(98, HZ + 26, 60, 'pink.2', 'white');
  },
  bakery(k) {
    k.wall('gold.3', 'cream.3', 'bricks');
    for (let i = 0; i < 3; i++) { k.shelf(16, 60 + i * 30, 90, ['brown.2', 'gold.2', 'orange.2']); k.shelf(150, 60 + i * 30, 90, ['gold.2', 'brown.2', 'cream.2']); }
    k.tiles(HZ, 'cream.3', 'gold.3', 16);
    k.counter(60, HZ + 32, 136, 'brown.2', 'cream.3');
    // loaves on the counter
    for (const x of [80, 120, 160]) { k.ellipse(x, HZ + 0, 12, 5, 'orange.2', 'brown.0'); k.rect(x - 6, HZ - 2, 2, 1, 'gold.3'); k.rect(x + 2, HZ - 2, 2, 1, 'gold.3'); }
  },
  toyshop(k) {
    k.wall('sky.3', 'sky.2', 'dots');
    for (let i = 0; i < 3; i++) { k.shelf(10, 56 + i * 32, 100); k.shelf(146, 56 + i * 32, 100, ['violet.2', 'gold.2', 'red.2', 'mint.2']); }
    k.tiles(HZ, 'pink.3', 'white', 16);
    // a big ball and a teddy on the floor
    k.disc(52, 246, 14, 'red.2', 'ink'); k.rect(40, 246, 24, 3, 'white');
    k.disc(238, 220, 9, 'brown.2', 'ink'); k.disc(231, 212, 4, 'brown.2', 'ink'); k.disc(245, 212, 4, 'brown.2', 'ink'); k.disc(238, 238, 12, 'brown.2', 'ink');
  },
  boutique(k) {
    k.wall('pink.3', 'pink.2', 'stripes');
    // mirror and clothes rack
    k.ellipse(196, 96, 26, 50, 'sky.3', 'gold.1'); k.rect(184, 70, 6, 30, 'white');
    k.rect(20, 70, 110, 3, 'slate.1'); k.box(20, 70, 110, 3);
    for (let i = 0; i < 6; i++) { const x = 28 + i * 17, c = ['red.2', 'sky.2', 'gold.2', 'violet.2', 'green.2', 'pink.1'][i]; k.rect(x + 5, 73, 1, 4, 'ink'); k.panel(x, 77, 12, 30, c); }
    k.rect(24, 73, 2, 100, 'slate.1'); k.rect(126, 73, 2, 100, 'slate.1');
    k.planks(HZ, 'violet.3', 'violet.2', 'white');
    k.ellipse(128, 260, 60, 10, 'pink.2'); // rug
  },
  arcade(k) {
    k.rect(0, 0, RW, RH, 'indigo.0');
    for (let i = 0; i < 40; i++) k.star((i * 61) % RW, (i * 37) % 120, 'violet.2');
    // cabinets
    for (const [x, c] of [[12, 'red.1'], [74, 'sky.1'], [136, 'gold.1'], [198, 'green.1']]) {
      k.panel(x, 64, 46, 140, c);
      k.panel(x + 6, 76, 34, 28, 'night'); k.rect(x + 12, 84, 6, 6, 'mint.2'); k.rect(x + 24, 92, 8, 4, 'pink.2');
      k.rect(x + 4, 112, 38, 10, 'slate.1'); k.disc(x + 14, 116, 3, 'red.2'); k.disc(x + 30, 116, 3, 'sky.2');
      k.rect(x + 8, 66, 30, 6, 'white');
    }
    k.tiles(204, 'indigo.1', 'violet.0', 16);
  },
  hospital(k) {
    k.wall('white', 'mint.3', 'stripes');
    k.panel(24, 40, 36, 36, 'white'); k.rect(38, 46, 8, 24, 'red.2'); k.rect(30, 54, 24, 8, 'red.2'); // red cross
    // bed
    k.rect(170, 150, 76, 12, 'white'); k.box(170, 150, 76, 12); k.rect(166, 130, 6, 50, 'slate.2'); k.rect(244, 140, 6, 40, 'slate.2'); k.rect(172, 146, 18, 6, 'sky.3');
    k.tiles(HZ, 'mint.3', 'white', 20);
    k.panel(16, 120, 50, 52, 'slate.3'); k.rect(22, 132, 38, 1, 'ink'); k.rect(22, 146, 38, 1, 'ink'); // cabinet
    k.disc(41, 126, 3, 'red.2');
  },
  // ---- uptown ----
  dept(k) {
    k.wall('cream.3', 'gold.3', 'stripes');
    k.panel(76, 18, 104, 20, 'red.1'); k.rect(84, 26, 88, 4, 'white'); // banner
    for (let i = 0; i < 3; i++) { k.shelf(8, 70 + i * 30, 70); k.shelf(178, 70 + i * 30, 70, ['red.2', 'blue.2', 'gold.2']); }
    // escalator
    for (let i = 0; i < 12; i++) k.rect(96 + i * 5, 160 - i * 8, 18, 3, 'slate.2');
    k.rect(94, 64, 3, 108, 'slate.1'); k.rect(160, 64, 3, 108, 'slate.1');
    k.tiles(HZ, 'white', 'mist', 24);
  },
  salon(k) {
    k.wall('violet.3', 'pink.3', 'dots');
    for (const x of [26, 150]) { k.ellipse(x + 40, 86, 30, 40, 'sky.3', 'gold.1'); k.rect(x + 26, 62, 6, 26, 'white'); }
    for (const x of [44, 168]) { k.panel(x, 148, 44, 28, 'pink.1'); k.panel(x + 6, 120, 32, 30, 'pink.1'); k.rect(x + 20, 176, 4, 20, 'slate.1'); }
    k.tiles(HZ, 'white', 'violet.3', 16);
  },
  school(k) {
    k.wall('lime.3', 'cream.3', 'bricks');
    k.panel(56, 26, 144, 70, 'green.0'); k.rect(52, 22, 152, 4, 'brown.2'); // chalkboard
    k.rect(70, 44, 40, 2, 'white'); k.rect(70, 56, 64, 2, 'white'); k.rect(70, 68, 30, 2, 'white'); k.rect(150, 44, 2, 30, 'white');
    k.disc(220, 40, 12, 'white', 'ink'); k.rect(220, 32, 1, 8, 'ink'); k.rect(220, 40, 6, 1, 'ink');
    k.planks(HZ, 'gold.2', 'gold.1', 'gold.3');
    for (const x of [24, 180]) { k.rect(x, 216, 52, 6, 'brown.2'); k.box(x, 216, 52, 6); k.rect(x + 4, 222, 4, 20, 'slate.1'); k.rect(x + 44, 222, 4, 20, 'slate.1'); }
  },
  work(k) {
    k.wall('slate.3', 'slate.2', 'bricks');
    k.panel(20, 40, 60, 44, 'sky.3'); k.rect(48, 40, 1, 44, 'ink'); // window
    // gears and tool board
    k.disc(170, 70, 22, 'slate.1', 'ink'); k.disc(170, 70, 8, 'slate.3', 'ink');
    for (let a = 0; a < 8; a++) k.rect(170 + Math.cos(a * Math.PI / 4) * 24 - 3, 70 + Math.sin(a * Math.PI / 4) * 24 - 3, 6, 6, 'slate.1');
    k.disc(212, 108, 12, 'gold.2', 'ink'); k.disc(212, 108, 4, 'gold.3', 'ink');
    k.planks(HZ, 'slate.2', 'slate.1', 'slate.3');
    k.panel(20, 200, 90, 30, 'brown.2'); k.rect(20, 196, 90, 5, 'brown.3'); k.box(20, 196, 90, 5); // workbench
    k.rect(36, 186, 18, 10, 'red.2'); k.box(36, 186, 18, 10);
  },
  chapel(k) {
    k.wall('white', 'pink.3', 'stripes');
    // stained-glass arch window
    k.disc(128, 60, 30, 'gold.3', 'ink'); k.rect(98, 60, 61, 56, 'gold.3'); k.box(98, 60, 61, 56);
    for (const [x, y, c] of [[110, 50, 'pink.2'], [138, 50, 'sky.2'], [110, 80, 'violet.2'], [138, 80, 'mint.2'], [124, 38, 'red.2']]) k.panel(x, y, 12, 16, c);
    k.planks(HZ, 'pink.3', 'pink.2', 'white');
    k.rect(118, HZ, 20, RH - HZ, 'red.1'); // aisle
    for (const x of [10, 186]) for (let r = 0; r < 3; r++) { k.rect(x, 200 + r * 30, 60, 6, 'brown.2'); k.box(x, 200 + r * 30, 60, 6); }
    for (const x of [30, 226]) { k.disc(x, 120, 8, 'pink.2', 'ink'); k.rect(x - 1, 128, 3, 44, 'green.1'); } // flowers
  },
  studio(k) {
    k.rect(0, 0, RW, RH, 'slate.0');
    k.panel(48, 20, 160, 190, 'sky.3'); // backdrop paper
    for (let y = 150; y < 210; y++) k.rect(49, y, 158, 1, (y - 150) % 6 < 3 ? 'sky.3' : 'mist');
    k.rect(0, 208, RW, RH - 208, 'slate.1');
    // lights and camera
    for (const x of [18, 238]) { k.rect(x - 1, 60, 3, 160, 'ink'); k.ellipse(x, 56, 12, 9, 'white', 'ink'); }
    k.panel(114, 166, 28, 18, 'ink'); k.disc(128, 175, 5, 'slate.2', 'white'); k.rect(126, 184, 4, 36, 'ink'); k.rect(118, 218, 20, 2, 'ink');
  },
  // ---- seaside & country ----
  beach(k) {
    k.sky('sky.1', 'sky.2', 120); k.disc(210, 34, 16, 'gold.3', 'gold.2');
    k.water(120, 'sky.2', 'sky.3', 'blue.2');
    k.rect(0, 170, RW, RH - 170, 'gold.3'); k.dither(0, 170, RW, 6, C('white'));
    for (let i = 0; i < 30; i++) k.set((i * 47) % RW, 180 + (i * 29) % 120, 'gold.2');
    // palm, umbrella, shells
    k.rect(30, 90, 6, 120, 'brown.2'); for (const dx of [-26, -10, 8, 24]) k.ellipse(33 + dx, 88 + Math.abs(dx) / 3, 16, 5, 'green.2', 'green.0');
    k.rect(200, 168, 3, 60, 'slate.1'); k.ellipse(201, 166, 34, 14, 'red.2', 'ink'); k.rect(170, 166, 64, 2, 'white');
    k.disc(90, 262, 4, 'pink.2', 'ink'); k.disc(160, 280, 3, 'white', 'ink');
  },
  forest(k) {
    k.sky('mint.2', 'mint.3');
    for (let i = 0; i < 6; i++) k.tree(16 + i * 46, HZ - 10 + (i % 2) * 6, 0.8, 'green.1', 'green.0', 'green.2');
    k.grass(HZ, 'green.1', 'green.0', 'green.2');
    k.tree(30, HZ + 60, 1.2); k.tree(230, HZ + 50, 1.1);
    // mushrooms and a berry bush
    for (const [x, y] of [[90, 260], [100, 268], [170, 254]]) { k.rect(x - 1, y - 6, 3, 6, 'cream.3'); k.ellipse(x, y - 7, 6, 4, 'red.2', 'ink'); k.set(x - 2, y - 8, 'white'); }
    k.bush(150, 214); for (const [x, y] of [[144, 206], [152, 204], [158, 209]]) k.disc(x, y, 2, 'violet.1');
    k.rect(110, 238, 40, 10, 'brown.1'); k.box(110, 238, 40, 10); k.ellipse(110, 243, 4, 5, 'brown.0'); // log
  },
  fair(k) {
    k.sky('pink.3', 'gold.3');
    // ferris wheel
    k.disc(70, 90, 56, 'pink.3', 'red.1'); k.disc(70, 90, 52, 'pink.3');
    for (let a = 0; a < 8; a++) {
      const ex = 70 + Math.cos(a * Math.PI / 4) * 52, ey = 90 + Math.sin(a * Math.PI / 4) * 52;
      for (let t = 0; t <= 1; t += 0.02) k.set(70 + (ex - 70) * t, 90 + (ey - 90) * t, 'red.1');
      k.panel(ex - 6, ey, 12, 10, ['sky.2', 'gold.2', 'mint.2', 'violet.2'][a % 4]);
    }
    k.rect(66, 90, 8, 82, 'slate.1');
    // coaster track
    for (let x = 140; x < RW; x++) { const y = 70 + Math.round(Math.sin((x - 140) / 18) * 30); k.rect(x, y, 1, 3, 'sky.1'); if (x % 12 === 0) k.rect(x, y, 2, HZ - y, 'slate.2'); }
    k.grass(HZ, 'green.2'); k.path(HZ, 'pink.3', 'pink.2');
    k.panel(180, 150, 50, 22, 'red.2'); k.awning(176, 140, 58, 'red.2', 'white'); // ticket booth
    for (let i = 0; i < 4; i++) { const x = 20 + i * 14; k.rect(x, 150, 1, 22, 'ink'); k.disc(x, 146, 5, ['red.2', 'sky.2', 'gold.2', 'violet.2'][i], 'ink'); } // balloons
  },
  stage(k) {
    k.rect(0, 0, RW, RH, 'indigo.0');
    k.curtain(0, 44, HZ + 10); k.curtain(RW - 44, 44, HZ + 10);
    k.rect(0, 0, RW, 18, 'red.1'); for (let x = 0; x < RW; x += 16) k.disc(x + 8, 18, 8, 'red.1');
    k.rect(0, 0, RW, 2, 'gold.2');
    // spotlights
    for (const cx of [84, 172]) for (let y = 20; y < HZ; y++) {
      const half = Math.round(4 + (y - 20) * 0.22);
      for (let x = cx - half; x < cx + half; x++) k.set(x, y, (x + y) % 2 === 0 ? 'gold.3' : 'indigo.2');
    }
    k.planks(HZ, 'brown.2', 'brown.1', 'brown.3');
    k.rect(0, 250, RW, RH - 250, 'indigo.1'); // audience
    for (let x = 6; x < RW; x += 18) k.ellipse(x, 268, 8, 9, 'indigo.0');
  },
  // ---- far away ----
  castle(k) {
    k.sky('violet.3', 'pink.3');
    // towers and keep
    for (const x of [40, 186]) {
      k.panel(x, 40, 30, HZ - 40, 'slate.3');
      for (let j = 0; j < 30; j++) { const half = Math.round(1 + j * 0.62); k.rect(x + 15 - half, 10 + j, half * 2, 1, j % 7 === 6 ? 'violet.0' : 'violet.1'); } // cone roof
      k.windowPane(x + 9, 70, 12, 16, 'gold.3');
    }
    k.panel(70, 70, 116, HZ - 70, 'slate.3');
    for (let x = 70; x < 186; x += 14) k.rect(x, 62, 8, 8, 'slate.3');
    k.rect(110, 120, 36, 52, 'brown.1'); k.disc(128, 120, 18, 'brown.1'); k.box(110, 120, 36, 52); // gate
    for (const x of [84, 160]) k.windowPane(x, 90, 12, 18, 'gold.3');
    k.rect(127, 40, 1, 30, 'ink'); k.rect(128, 40, 14, 8, 'red.2'); // flag
    k.grass(HZ, 'green.2'); k.path(HZ, 'slate.3', 'slate.2');
    k.bush(30, 220); k.bush(226, 226); k.flowers(60, 250, 4, 'violet.2'); k.flowers(176, 252, 4, 'red.2');
  },
  starisle(k) {
    k.rect(0, 0, RW, RH, 'indigo.0'); k.dither(0, 90, RW, 80, C('violet.0'));
    for (let i = 0; i < 70; i++) k.star((i * 71) % RW, (i * 43) % 160, i % 5 ? 'gold.3' : 'pink.3');
    k.disc(200, 40, 14, 'gold.3'); k.disc(206, 36, 12, 'indigo.0'); // moon
    // floating island
    k.ellipse(128, HZ + 20, 120, 30, 'violet.2', 'ink'); k.ellipse(128, HZ + 12, 116, 20, 'mint.2');
    k.rect(0, HZ + 40, RW, RH - HZ - 40, 'indigo.0'); for (let i = 0; i < 20; i++) k.star((i * 53) % RW, HZ + 50 + (i * 31) % 90, 'violet.2');
    // crystal and mushrooms
    for (let y = 0; y < 50; y++) { const half = Math.round((1 - Math.abs(y - 25) / 25) * 10); k.rect(128 - half, HZ - 40 + y, half * 2, 1, y < 25 ? 'sky.3' : 'sky.2'); }
    for (const [x, c] of [[60, 'pink.2'], [196, 'violet.2']]) { k.rect(x - 2, HZ - 4, 4, 10, 'cream.3'); k.ellipse(x, HZ - 6, 12, 7, c, 'ink'); }
  },
  // ---- hidden ----
  hidden(k) {
    k.sky('orange.3', 'gold.3'); k.disc(60, 44, 18, 'orange.2');
    k.hills(HZ - 20, 'green.1', 'green.2');
    for (const [x, c] of [[20, 'brown.2'], [104, 'red.1'], [184, 'brown.2']]) {
      k.panel(x, HZ - 50, 52, 50, 'cream.3');
      for (let i = 0; i < 26; i++) k.rect(x - 4 + i, HZ - 50 - i, 60 - i * 2, 1, c); // thatched roof
      k.door(x + 16, HZ, 18, 28); k.windowPane(x + 38, HZ - 40, 10, 10, 'gold.3');
    }
    k.grass(HZ, 'lime.2', 'lime.1', 'lime.3'); k.path(HZ, 'brown.3', 'brown.2');
    // lanterns on a string
    for (let x = 0; x < RW; x++) k.set(x, 110 + Math.round(Math.sin(x / 40) * 6), 'ink');
    for (let x = 20; x < RW; x += 40) k.disc(x, 118 + Math.round(Math.sin(x / 40) * 6), 5, 'red.2', 'ink');
    k.tree(236, HZ + 60, 1); k.flowers(30, 260, 5, 'gold.2');
  },
};

// ---------------------------------------------------------------- travel
/** A vehicle for the trip between districts, drawn straight to the screen at (x, y) (normal pixels). */
export function drawVehicle(scr, kind, x, y, t) {
  const r = (a, b, w, h, c) => scr.rect(Math.round(x + a), Math.round(y + b), w, h, C(c));
  const bob = Math.floor(t / 150) % 2;
  if (kind === 'bus') {
    r(0, -24 - bob, 56, 20, 'gold.2'); scr.box(Math.round(x), Math.round(y - 24 - bob), 56, 20, C('ink'));
    for (let i = 0; i < 4; i++) r(4 + i * 12, -21 - bob, 9, 7, 'sky.3');
    r(0, -10 - bob, 56, 2, 'red.1');
    for (const wx of [10, 42]) { scr.rect(Math.round(x + wx - 4), Math.round(y - 6), 9, 6, C('ink')); r(wx - 1, -4, 3, 2, 'silver'); }
  } else if (kind === 'train') {
    r(0, -26, 34, 22, 'red.1'); scr.box(Math.round(x), Math.round(y - 26), 34, 22, C('ink'));
    r(4, -22, 10, 8, 'sky.3'); r(24, -34, 6, 8, 'ink');
    r(-40, -22, 36, 18, 'sky.1'); scr.box(Math.round(x - 40), Math.round(y - 22), 36, 18, C('ink'));
    for (let i = 0; i < 3; i++) r(-36 + i * 11, -19, 8, 6, 'sky.3');
    for (const wx of [6, 26, -34, -14]) scr.rect(Math.round(x + wx), Math.round(y - 5), 6, 5, C('ink'));
    if (bob) { r(26, -40, 4, 3, 'mist'); r(30, -44, 5, 4, 'mist'); }
  } else if (kind === 'balloon') {
    for (let j = -14; j <= 14; j++) {
      const half = Math.round(Math.sqrt(Math.max(0, 196 - j * j)));
      scr.rect(Math.round(x - half), Math.round(y - 60 + j + bob), half * 2, 1, C(j % 6 < 3 ? 'red.2' : 'gold.2'));
    }
    r(-1, -46 + bob, 1, 12, 'ink'); r(5, -46 + bob, 1, 12, 'ink');
    r(-6, -34 + bob, 18, 8, 'brown.2'); scr.box(Math.round(x - 6), Math.round(y - 34 + bob), 18, 8, C('ink'));
  }
}
