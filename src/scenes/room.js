// The pet's room on the home screen. The room itself is hand-pixelled props
// laid out in src/art/town.js (homeRoom), cached per time of day; its window
// panes are see-through, so the sky is drawn here first, with a sun and a
// drifting cloud by day and a moon and twinkling stars at night.
//
// That sky is one picture the size of the whole screen. The window shows the
// part of it behind the panes, and the bars above and below the room (the
// status bar, the icon rows, the info bar) show the rest, so the room sits in
// the open sky; the page round the screen takes its top and bottom colours.
import { C, COLORS } from '../engine/palette.js';
import { W, H, HD } from '../engine/screen.js';
import { LAYOUT } from '../ui.js';
import { homeRoom, ROOM_SKY, propBitmap, groundTone } from '../art/town.js';

const RY = LAYOUT.room.y * 2; // room top, in hi-res screen pixels

export function skyState(hour) {
  if (hour >= 20 || hour < 6) return 'night';
  if (hour >= 17) return 'dusk';
  if (hour < 8) return 'dawn';
  return 'day';
}

// the whole sky, top of the screen to the bottom: four bands with dithered seams
// (the first seam falls behind the window, so the panes show two tones)
const SKY = {
  day:   ['sky.1', 'sky.2', 'sky.3', 'sky.3'],
  dawn:  ['pink.2', 'gold.3', 'gold.3', 'cream.3'],
  dusk:  ['orange.2', 'pink.2', 'pink.3', 'pink.3'],
  night: ['ink', 'indigo.0', 'indigo.0', 'indigo.0'],
};
const BW = W * HD, BH = H * HD;
const SEAMS = [132, 250, 372]; // where each band gives way to the next (fine y)
const BARS = [[0, LAYOUT.room.y * HD], [LAYOUT.bottom.y * HD, BH]]; // the screen above and below the room

const skies = new Map();
function skyPicture(sky) {
  if (!skies.has(sky)) {
    const px = new Uint8Array(BW * BH), tones = SKY[sky].map(C);
    for (let y = 0; y < BH; y++) {
      const band = SEAMS.filter(s => y >= s).length, next = SEAMS[band];
      // each band melts into the next over 36 rows: a quarter, then half, then three quarters of the next colour
      const left = next === undefined ? 99 : next - y;
      for (let x = 0; x < BW; x++) {
        const mix = left > 36 ? false : left > 24 ? (x % 2 === 0 && y % 2 === 0) : left > 12 ? (x + y) % 2 === 0 : !(x % 2 === 1 && y % 2 === 1);
        px[y * BW + x] = mix ? tones[band + 1] : tones[band];
      }
    }
    skies.set(sky, px);
  }
  return skies.get(sky);
}
/** Copy a piece of the sky onto the screen (fine pixels). */
function paintSky(scr, sky, x, y, w, h) {
  const px = skyPicture(sky);
  for (let j = y; j < y + h; j++) scr.buf.set(px.subarray(j * BW + x, j * BW + x + w), j * BW + x);
}

/** The sky where a room shows it (`box`: a window's panes, or a garden's whole sky), with what is up there. */
function drawSky(scr, sky, appTime, box) {
  const { x: wx, y: wy, w: ww, h: wh } = box;
  const ox = wx, oy = RY + wy;
  paintSky(scr, sky, ox, oy, ww, wh);
  scr.clip = [ox, oy, ox + ww, oy + wh];
  if (sky === 'night') {
    // moon and twinkling stars
    const mx = ox + 42, my = oy + 8;
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
      const d1 = (x - 5.5) ** 2 + (y - 5.5) ** 2, d2 = (x - 8) ** 2 + (y - 4) ** 2;
      if (d1 < 30 && d2 > 22) scr.hpset(mx + x, my + y, C(d1 > 20 ? 'gold.2' : 'gold.3'));
    }
    // (the same handful of stars, repeated across a wide sky)
    for (let tile = 0; tile * 64 < ww; tile++) [[8, 10], [22, 30], [12, 46], [34, 22], [56, 40], [26, 52], [50, 12]].forEach(([x, y], i) => {
      const n = i + tile * 3, sx = ox + tile * 64 + x, sy = oy + y + (tile % 2) * 9;
      if ((Math.floor(appTime / 500) + n) % 4 === 0) return;
      scr.hpset(sx, sy, C('white'));
      if ((Math.floor(appTime / 500) + n) % 4 === 1) { scr.hpset(sx + 1, sy, C('gold.3')); scr.hpset(sx - 1, sy, C('gold.3')); }
    });
  } else if (ww > 100) {
    // an open sky: a big sun, and hand-pixelled clouds drifting across at their own speeds
    const sx = ox + 30, sy = oy + 30;
    for (let y = -17; y <= 17; y++) for (let x = -17; x <= 17; x++) {
      const d = x * x + y * y, ray = Math.abs(x) < 2 || Math.abs(y) < 2 || Math.abs(Math.abs(x) - Math.abs(y)) < 2;
      if (d <= 81) scr.hpset(sx + x, sy + y, C(d < 36 ? 'gold.3' : d < 64 ? 'gold.2' : 'orange.2'));
      else if (d > 121 && d <= 280 && ray) scr.hpset(sx + x, sy + y, C('gold.2'));
    }
    scr.hpset(sx - 4, sy - 4, C('white')); scr.hpset(sx - 3, sy - 4, C('white')); scr.hpset(sx - 4, sy - 3, C('white'));
    const tint = sky === 'day' ? 'violet' : 'pink';
    [['cloudA', 22, 0.011, 150], ['cloudB', 62, 0.007, 30], ['cloudD', 96, 0.004, 260]].forEach(([name, y, speed, start]) => {
      const cloud = propBitmap(name, { accent: tint }), span = ww + cloud.w * 2;
      scr.bitmap(cloud, (ox + ((start + appTime * speed) % span) - cloud.w) / HD, (oy + y) / HD);
    });
  } else {
    // sun and a drifting cloud
    const sx = ox + 10, sy = oy + 10;
    for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
      const d = x * x + y * y;
      if (d <= 20) scr.hpset(sx + x, sy + y, C(d < 8 ? 'gold.3' : 'gold.2'));
      else if (d <= 36 && (x === 0 || y === 0 || Math.abs(x) === Math.abs(y))) scr.hpset(sx + x, sy + y, C('gold.2'));
    }
    const cx = ox + Math.floor(appTime / 120) % (ww + 36) - 26, cy = oy + 28;
    for (const [bx, by, r] of [[0, 4, 6], [8, 0, 8], [17, 4, 6], [9, 6, 6]]) {
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r && by + y <= 9) scr.hpset(cx + bx + x, cy + by + y, C(y > 2 ? 'mist' : 'white'));
    }
  }
  scr.noClip();
}

const stateOf = (simTime, lightsOff) => (lightsOff ? 'night' : skyState(new Date(simTime).getHours()));

// stars over the bars at night, and small clouds drifting across them by day: [x, y] and [y, speed, start]
const BAR_STARS = [[14, 8], [52, 30], [88, 12], [118, 50], [150, 22], [182, 6], [206, 44], [236, 18], [30, 58], [246, 60],
  [22, 392], [60, 430], [98, 404], [134, 438], [168, 396], [200, 426], [232, 400], [246, 440]];
const BAR_CLOUDS = [[26, 0.006, 40], [50, 0.004, 190], [404, 0.005, 120], [428, 0.007, 260]];

// grass strokes and tiny flowers on the ground under an outdoor room: [x, y] in the bottom bars
const GROUND_STROKES = [[10, 390], [34, 402], [58, 386], [80, 420], [104, 396], [126, 432], [150, 388], [172, 410], [196, 394], [218, 426], [240, 400],
  [22, 436], [66, 440], [112, 414], [160, 438], [206, 444], [246, 430], [44, 422], [138, 404], [186, 384]];
const GROUND_FLOWERS = [[26, 414, 'white'], [92, 438, 'pink.3'], [146, 420, 'gold.3'], [212, 408, 'white'], [236, 440, 'pink.3'], [60, 396, 'gold.3']];

/**
 * The bars round the room, in place of a flat colour: sky above it, and the
 * ground below (`ground`: the garden lawn's colours, { c, stroke }, shown as
 * they look at this time of day). The house stands on that ground, so it is
 * under every room; out in the garden it is the lawn itself carrying on.
 * Returns what the bars' text should allow for: { sky, dark, top, bottom },
 * where `dark` is about the bars above the room and `bottomDark` those below,
 * and `bottom` is a palette index.
 */
export function drawSkyBars(scr, simTime, appTime, lightsOff, ground = null, air = null) {
  if (air) return drawAirBars(scr, appTime, air);
  const sky = stateOf(simTime, lightsOff);
  // (the ground comes as colour names, shown in the light of the hour, or as palette indexes already in it)
  const tone = (c) => (typeof c === 'number' ? c : groundTone(c, sky));
  for (const [y0, y1] of BARS) {
    if (ground && y0 > 0) {
      scr.noClip();
      scr.hrect(0, y0, BW, y1 - y0, tone(ground.c));
      if (ground.cobbles) { cobbleOn(scr, y0, y1, tone(ground.stroke), tone('white')); continue; }
      for (const [x, y] of GROUND_STROKES) { const c = tone(ground.stroke); scr.hpset(x, y, c); scr.hpset(x - 1, y - 1, c); scr.hpset(x + 1, y - 1, c); }
      if (!ground.bare) for (const [x, y, name] of GROUND_FLOWERS) { const c = tone(name); scr.hpset(x, y - 1, c); scr.hpset(x - 1, y, c); scr.hpset(x + 1, y, c); scr.hpset(x, y + 1, c); scr.hpset(x, y, tone('gold.3')); }
      continue;
    }
    paintSky(scr, sky, 0, y0, BW, y1 - y0);
    scr.clip = [0, y0, BW, y1];
    if (sky === 'night') {
      BAR_STARS.forEach(([x, y], i) => {
        const f = (Math.floor(appTime / 500) + i) % 5;
        if (f === 0) return;
        scr.hpset(x, y, C('white'));
        if (f === 1) { scr.hpset(x + 1, y, C('gold.3')); scr.hpset(x - 1, y, C('gold.3')); scr.hpset(x, y - 1, C('gold.3')); scr.hpset(x, y + 1, C('gold.3')); }
      });
    } else {
      const cloud = propBitmap('cloudC', { accent: sky === 'day' ? 'violet' : 'pink' });
      for (const [y, speed, start] of BAR_CLOUDS) {
        const span = BW + cloud.w * 2;
        scr.bitmap(cloud, (((start + appTime * speed) % span) - cloud.w) / HD, (y - cloud.h / 2) / HD);
      }
    }
  }
  scr.noClip();
  const [top, , , bottom] = SKY[sky];
  const under = ground ? tone(ground.c) : C(bottom), [r, g, b] = COLORS[under];
  return { sky, dark: sky === 'night', top, bottom: under, bottomDark: r * 0.3 + g * 0.59 + b * 0.11 < 110 };
}

/**
 * Cobbles carried on under a paved place (the Town Square): the same courses
 * as `cobbles` in src/art/town.js, picked up where the picture leaves off.
 * Each course is a little taller and its stones a little wider than the last,
 * and every other course is shifted half a stone.
 */
function cobbleOn(scr, y0, y1, line, glint) {
  const HZ = 172, ROOM = LAYOUT.room.h * HD; // where the paving starts in the picture, and where the picture ends
  let yy = HZ, row = 0, h = 5;
  while (yy + h <= ROOM) { yy += h; h = Math.min(14, h + 1); row++; } // the course the picture's bottom edge cuts through
  scr.clip = [0, y0, BW, y1];
  for (let top = y0 - (ROOM - yy); top < y1; top += h, h = Math.min(14, h + 1), row++) {
    const w = 8 + row * 2;
    for (let x = (row % 2) * (w >> 1) - w; x < BW; x += w) {
      scr.hrect(x, top, w, 1, line); scr.hrect(x, top + h - 1, w, 1, line);
      scr.hrect(x, top, 1, h, line); scr.hrect(x + w - 1, top, 1, h, line);
      scr.hpset(x + 1, top + 1, glint);
    }
  }
  scr.noClip();
}

/**
 * The real sky behind an outdoor place away from home (its picture has its own
 * sky cut out): the sky of the hour over the whole room, with the moon and
 * stars at night. The place's picture brings its own clouds and sun by day.
 */
export function drawPlaceSky(scr, simTime, appTime) {
  const sky = skyState(new Date(simTime).getHours());
  if (sky === 'night') drawSky(scr, sky, appTime, { x: 0, y: 0, w: BW, h: LAYOUT.room.h * HD });
  else paintSky(scr, sky, 0, RY, BW, LAYOUT.room.h * HD);
}

/**
 * The bars while an outdoor place that keeps its own sky is on show (Star Isle,
 * the hidden village, the farewell hill): they carry that picture's own sky
 * and ground on, meeting it in the same colours top and bottom. `air` is its edgeColours.
 */
function drawAirBars(scr, appTime, air) {
  const light = (c) => { const [r, g, b] = COLORS[c]; return r * 0.3 + g * 0.59 + b * 0.11; };
  const [[t0, t1], [b0, b1]] = BARS;
  scr.noClip();
  scr.hrect(0, t0, BW, t1 - t0, air.top);
  scr.hrect(0, b0, BW, b1 - b0, air.bottom);
  for (const [x, y] of GROUND_STROKES) { scr.hpset(x, y, air.stroke); scr.hpset(x - 1, y - 1, air.stroke); scr.hpset(x + 1, y - 1, air.stroke); }
  if (light(air.top) > 110) {
    // (clouds only in a daytime sky)
    scr.clip = [0, t0, BW, t1];
    const cloud = propBitmap('cloudC', { accent: 'violet' });
    for (const [y, speed, start] of BAR_CLOUDS) {
      if (y > t1) continue;
      const span = BW + cloud.w * 2;
      scr.bitmap(cloud, (((start + appTime * speed) % span) - cloud.w) / HD, (y - cloud.h / 2) / HD);
    }
    scr.noClip();
  }
  return { sky: 'air', dark: light(air.top) < 110, top: air.top, bottom: air.bottom, bottomDark: light(air.bottom) < 110 };
}

/**
 * Draw a room of the house: the sky where it shows, then the room over it.
 * `layout` is what is in each slot and `room` which room it is (src/game/decor.js).
 */
export function drawRoom(scr, simTime, appTime, lightsOff, layout = null, room = 'bedroom') {
  if (ROOM_SKY[room]) drawSky(scr, stateOf(simTime, lightsOff), appTime, ROOM_SKY[room]);
  scr.bitmap(homeRoom(skyState(new Date(simTime).getHours()), !!lightsOff, layout, room).back, 0, LAYOUT.room.y);
}

/**
 * Stepping from one room to the next: the old room slides off as the new one
 * slides on (k runs 0 to 1; dir 1 means the new room is to the right). `from`
 * and `to` are { room, layout }.
 */
export function drawSlide(scr, simTime, lightsOff, from, to, dir, k) {
  const state = skyState(new Date(simTime).getHours()), ry = LAYOUT.room.y;
  paintSky(scr, stateOf(simTime, lightsOff), 0, RY, BW, LAYOUT.room.h * HD);
  const off = Math.round(Math.min(1, Math.max(0, k)) * W);
  scr.setClip(0, ry, W, LAYOUT.room.h);
  for (const [r, x] of [[from, -dir * off], [to, dir * (W - off)]]) {
    const pic = homeRoom(state, !!lightsOff, r.layout, r.room);
    scr.bitmap(pic.back, x, ry);
    if (pic.front) scr.bitmap(pic.front, x, ry);
  }
  scr.noClip();
}

/** The things in the room's front corners, drawn over the pet. */
export function drawRoomFront(scr, simTime, lightsOff, layout = null, room = 'bedroom') {
  const front = homeRoom(skyState(new Date(simTime).getHours()), !!lightsOff, layout, room).front;
  if (front) scr.bitmap(front, 0, LAYOUT.room.y);
}
