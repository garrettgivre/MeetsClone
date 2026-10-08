// The living room, drawn at full (double) density. The static parts are
// rendered once per time-of-day and cached; clouds and stars move on top.
import { C } from '../engine/palette.js';
import { W, HD, makeBitmap } from '../engine/screen.js';
import { LAYOUT, ROOM_FLOOR } from '../ui.js';

const RW = W * HD;                      // room width in hi-res pixels
const RY = LAYOUT.room.y * HD;          // room top
const RH = LAYOUT.room.h * HD;          // room height
const FLOOR = (LAYOUT.room.y + 92) * HD - RY; // floor line, relative to the room
const WIN = { x: 16, y: 22, w: 76, h: 60 }; // window glass, relative to the room

const cache = new Map();

export function skyState(hour) {
  if (hour >= 20 || hour < 6) return 'night';
  if (hour >= 17) return 'dusk';
  if (hour < 8) return 'dawn';
  return 'day';
}

const SKY = {
  day:   ['sky.2', 'sky.3'],
  dawn:  ['pink.2', 'gold.3'],
  dusk:  ['orange.2', 'pink.2'],
  night: ['indigo.0', 'indigo.1'],
};

function roomBitmap(sky, dark) {
  const key = sky + '|' + dark;
  let bm = cache.get(key);
  if (bm) return bm;
  bm = makeBitmap(RW, RH, true);
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < RW && y < RH) bm.px[y * RW + x] = c; };
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c); };

  // ---- wall: soft wallpaper with little four-petal flowers ----
  rect(0, 0, RW, FLOOR, C('sky.3'));
  for (let y = 8, row = 0; y < FLOOR - 50; y += 18, row++) {
    for (let x = row % 2 ? 6 : 15; x < RW; x += 18) {
      set(x, y - 1, C('sky.2')); set(x - 1, y, C('sky.2')); set(x + 1, y, C('sky.2')); set(x, y + 1, C('sky.2'));
      set(x, y, C('white'));
    }
  }
  // wainscot: vertical stripes under a chair rail
  const railY = FLOOR - 44;
  for (let y = railY; y < FLOOR - 8; y++) for (let x = 0; x < RW; x++) set(x, y, (x >> 2) % 3 === 0 ? C('sky.2') : C('sky.3'));
  rect(0, railY - 3, RW, 3, C('white'));
  rect(0, railY, RW, 1, C('sky.1'));
  // skirting board
  rect(0, FLOOR - 8, RW, 8, C('white'));
  rect(0, FLOOR - 8, RW, 1, C('sky.1'));
  rect(0, FLOOR - 1, RW, 1, C('slate.2'));

  // ---- floor: wooden planks with seams, joints and grain ----
  rect(0, FLOOR, RW, RH - FLOOR, C('cream.2'));
  for (let y = FLOOR, row = 0; y < RH; y += 12, row++) {
    rect(0, y, RW, 1, C('cream.1'));
    for (let x = (row % 2) * 34 + 17; x < RW; x += 68) rect(x, y + 1, 1, 11, C('cream.1'));
    for (let x = (row * 23) % 41; x < RW; x += 41) { set(x, y + 5, C('cream.1')); set(x + 1, y + 5, C('cream.1')); set(x + 9, y + 8, C('cream.3')); }
  }
  // soft shadow along the wall
  for (let x = 0; x < RW; x += 2) set(x + ((x >> 1) % 2), FLOOR, C('cream.1'));

  // ---- window with curtains ----
  const wx = WIN.x, wy = WIN.y, ww = WIN.w, wh = WIN.h;
  const [skyTop, skyBottom] = SKY[dark ? 'night' : sky];
  for (let y = 0; y < wh; y++) for (let x = 0; x < ww; x++) {
    // two-tone sky with a dithered seam
    const t = y / wh;
    const lower = t > 0.62 || (t > 0.5 && (x + y) % 2 === 0);
    set(wx + x, wy + y, C(lower ? skyBottom : skyTop));
  }
  // frame and mullions
  rect(wx - 4, wy - 4, ww + 8, 4, C('white')); rect(wx - 4, wy + wh, ww + 8, 5, C('white'));
  rect(wx - 4, wy, 4, wh, C('white')); rect(wx + ww, wy, 4, wh, C('white'));
  rect(wx + (ww >> 1) - 1, wy, 3, wh, C('white'));
  rect(wx, wy + (wh >> 1) - 1, ww, 3, C('white'));
  const outline = (x, y, w, h) => { rect(x, y, w, 1, C('ink')); rect(x, y + h - 1, w, 1, C('ink')); rect(x, y, 1, h, C('ink')); rect(x + w - 1, y, 1, h, C('ink')); };
  outline(wx - 5, wy - 5, ww + 10, wh + 11);
  rect(wx - 6, wy + wh + 5, ww + 12, 2, C('slate.2')); // sill shadow
  // curtains: soft folds, gathered with a tie
  for (const side of [-1, 1]) {
    const cx0 = side < 0 ? wx - 12 : wx + ww - 6;
    for (let y = -8; y < wh + 14; y++) {
      const gather = y > wh * 0.55 && y < wh * 0.7 ? 4 : 0;
      for (let i = 0; i < 18 - gather; i++) {
        const x = side < 0 ? cx0 + i : cx0 + 18 - i - 1;
        const fold = (i >> 2) % 2 === 0 ? 'pink.2' : 'pink.3';
        set(x, wy + y, C(i === 0 || i === 17 - gather ? 'pink.1' : fold));
      }
    }
    // tie-back
    const tx = side < 0 ? cx0 : cx0 + 4;
    rect(tx, wy + Math.round(wh * 0.6), 14, 3, C('gold.2'));
  }
  // curtain rod
  rect(wx - 16, wy - 12, ww + 32, 3, C('brown.1'));
  set(wx - 17, wy - 11, C('gold.2')); set(wx + ww + 16, wy - 11, C('gold.2'));

  // ---- shelf with a potted plant and a lamp ----
  const sx = 176, sy = 70;
  rect(sx, sy, 64, 5, C('brown.2'));
  rect(sx, sy, 64, 1, C('brown.3'));
  rect(sx, sy + 5, 64, 2, C('brown.0'));
  rect(sx + 6, sy + 7, 3, 6, C('brown.1')); rect(sx + 55, sy + 7, 3, 6, C('brown.1'));
  // pot
  for (let y = 0; y < 14; y++) {
    const inset = y > 9 ? 2 : y > 4 ? 1 : 0;
    for (let x = inset; x < 18 - inset; x++) set(sx + 10 + x, sy - 14 + y, C(x === inset || x === 17 - inset || y === 0 ? 'ink' : x < 6 ? 'orange.2' : 'orange.1'));
  }
  rect(sx + 9, sy - 15, 20, 2, C('orange.0'));
  // leaves
  const leaf = (x, y, w, h, light) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const u = (i + 0.5) / w * 2 - 1, v = (j + 0.5) / h * 2 - 1;
      if (u * u + v * v <= 1) set(x + i, y + j, C(light && u + v < -0.3 ? 'green.3' : u + v > 0.5 ? 'green.1' : 'green.2'));
    }
  };
  leaf(sx + 6, sy - 30, 10, 14, true); leaf(sx + 18, sy - 34, 10, 16, true); leaf(sx + 13, sy - 26, 9, 12, false);
  rect(sx + 18, sy - 18, 1, 4, C('green.1'));
  // lamp
  for (let y = 0; y < 14; y++) {
    const half = 3 + Math.floor(y / 2);
    for (let x = -half; x <= half; x++) set(sx + 48 + x, sy - 26 + y, C(Math.abs(x) === half || y === 0 ? 'gold.1' : x < 0 ? 'gold.3' : 'gold.2'));
  }
  rect(sx + 47, sy - 12, 3, 8, C('brown.1'));
  rect(sx + 42, sy - 4, 13, 4, C('brown.2'));

  // ---- rug: oval with a border and a centre motif ----
  const rugY = (ROOM_FLOOR * HD) - RY - 4;
  const rx = 82, ry = 14;
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
    const d = (x / rx) ** 2 + (y / ry) ** 2;
    if (d > 1) continue;
    let c = 'pink.2';
    if (d > 0.86) c = 'pink.1';
    else if (d > 0.74) c = 'pink.3';
    else if (d > 0.62) c = (Math.round(Math.atan2(y, x) * 8) % 2) ? 'pink.2' : 'gold.3';
    else if (d < 0.08) c = 'pink.3';
    set(112 + x, rugY + y, C(c));
  }

  if (dark) {
    // lights off: everything dims to night, window keeps a little moonlight
    for (let i = 0; i < bm.px.length; i++) {
      const x = i % RW, y = (i / RW) | 0;
      const inWindow = x >= wx && x < wx + ww && y >= wy && y < wy + wh;
      if (!inWindow) bm.px[i] = (x + y) % 2 ? C('night') : C('shade');
    }
  }
  cache.set(key, bm);
  return bm;
}

/** Draw the room (cached base + moving sky details). */
export function drawRoom(scr, simTime, appTime, lightsOff) {
  const hour = new Date(simTime).getHours();
  const sky = skyState(hour);
  scr.bitmap(roomBitmap(sky, !!lightsOff), 0, LAYOUT.room.y);
  const ox = WIN.x, oy = RY + WIN.y;
  const night = sky === 'night' || lightsOff;
  // only the glass between the curtains shows the sky
  scr.clip = [WIN.x + 6, RY + WIN.y, WIN.x + WIN.w - 6, RY + WIN.y + WIN.h];
  if (night) {
    // moon and twinkling stars
    const mx = ox + 50, my = oy + 8;
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
      const d1 = (x - 5.5) ** 2 + (y - 5.5) ** 2, d2 = (x - 8) ** 2 + (y - 4) ** 2;
      if (d1 < 30 && d2 > 22) scr.hpset(mx + x, my + y, C(d1 > 20 ? 'gold.2' : 'gold.3'));
    }
    [[8, 10], [24, 30], [14, 44], [36, 16], [62, 42], [30, 50]].forEach(([x, y], i) => {
      if ((Math.floor(appTime / 500) + i) % 4 === 0) return;
      scr.hpset(ox + x, oy + y, C('white'));
      if ((Math.floor(appTime / 500) + i) % 4 === 1) { scr.hpset(ox + x + 1, oy + y, C('gold.3')); scr.hpset(ox + x - 1, oy + y, C('gold.3')); }
    });
  } else {
    // sun and a drifting cloud
    const sx = ox + 8, sy = oy + 8;
    for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
      const d = x * x + y * y;
      if (d <= 20) scr.hpset(sx + x, sy + y, C(d < 8 ? 'gold.3' : 'gold.2'));
      else if (d <= 36 && (x === 0 || y === 0 || Math.abs(x) === Math.abs(y))) scr.hpset(sx + x, sy + y, C('gold.2'));
    }
    const cx = ox + 20 + Math.floor(appTime / 120) % 80 - 10, cy = oy + 34;
    for (const [bx, by, r] of [[0, 4, 6], [8, 0, 8], [17, 4, 6], [9, 6, 6]]) {
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r && by + y <= 9) scr.hpset(cx + bx + x, cy + by + y, C(y > 2 ? 'mist' : 'white'));
    }
  }
  scr.noClip();
  // window bars in front of the sky
  if (!lightsOff || night) {
    scr.hrect(ox + (WIN.w >> 1) - 1, oy, 3, WIN.h, C('white'));
    scr.hrect(ox + 6, oy + (WIN.h >> 1) - 1, WIN.w - 12, 3, C('white'));
  }
}
