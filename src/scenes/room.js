// The pet's room on the home screen. The room itself is hand-pixelled props
// laid out in src/art/town.js (homeRoom), cached per time of day; its window
// panes are see-through, so the sky is drawn here first, with a sun and a
// drifting cloud by day and a moon and twinkling stars at night.
import { C } from '../engine/palette.js';
import { LAYOUT } from '../ui.js';
import { homeRoom, HOME_WINDOW } from '../art/town.js';

const RY = LAYOUT.room.y * 2; // room top, in hi-res screen pixels

export function skyState(hour) {
  if (hour >= 20 || hour < 6) return 'night';
  if (hour >= 17) return 'dusk';
  if (hour < 8) return 'dawn';
  return 'day';
}

// the sky behind the panes: [upper, lower]
const SKY = {
  day:   ['sky.2', 'sky.3'],
  dawn:  ['pink.2', 'gold.3'],
  dusk:  ['orange.2', 'pink.2'],
  night: ['indigo.0', 'indigo.1'],
};

function drawSky(scr, sky, appTime) {
  const { x: wx, y: wy, w: ww, h: wh } = HOME_WINDOW;
  const ox = wx, oy = RY + wy;
  const [top, bottom] = SKY[sky].map(C);
  // two tones with a dithered seam
  for (let y = 0; y < wh; y++) for (let x = 0; x < ww; x++) {
    const t = y / wh;
    scr.hpset(ox + x, oy + y, t > 0.62 || (t > 0.5 && (x + y) % 2 === 0) ? bottom : top);
  }
  scr.clip = [ox, oy, ox + ww, oy + wh];
  if (sky === 'night') {
    // moon and twinkling stars
    const mx = ox + 42, my = oy + 8;
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
      const d1 = (x - 5.5) ** 2 + (y - 5.5) ** 2, d2 = (x - 8) ** 2 + (y - 4) ** 2;
      if (d1 < 30 && d2 > 22) scr.hpset(mx + x, my + y, C(d1 > 20 ? 'gold.2' : 'gold.3'));
    }
    [[8, 10], [22, 30], [12, 46], [34, 22], [56, 40], [26, 52], [50, 12]].forEach(([x, y], i) => {
      if ((Math.floor(appTime / 500) + i) % 4 === 0) return;
      scr.hpset(ox + x, oy + y, C('white'));
      if ((Math.floor(appTime / 500) + i) % 4 === 1) { scr.hpset(ox + x + 1, oy + y, C('gold.3')); scr.hpset(ox + x - 1, oy + y, C('gold.3')); }
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

/** Draw the room: the sky through the window, then the room over it. */
export function drawRoom(scr, simTime, appTime, lightsOff) {
  drawSky(scr, stateOf(simTime, lightsOff), appTime);
  scr.bitmap(homeRoom(skyState(new Date(simTime).getHours()), !!lightsOff).back, 0, LAYOUT.room.y);
}

/** The things in the room's front corners, drawn over the pet. */
export function drawRoomFront(scr, simTime, lightsOff) {
  const front = homeRoom(skyState(new Date(simTime).getHours()), !!lightsOff).front;
  if (front) scr.bitmap(front, 0, LAYOUT.room.y);
}
