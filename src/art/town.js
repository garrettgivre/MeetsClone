// Town backdrops, drawn at full (double) density like the living room, and
// cached once per place. Coordinates are hi-res pixels inside the room area
// (256 x 312). The horizon / back wall meets the ground at HZ; pets stand at FEET.
//
// House style (see docs/STYLE.md): light from the upper left; solid shapes get
// a light rim on top/left, a shadow band on the bottom/right and an outline in
// a darker shade of their own colour (ink only for small, dark details); props
// sit on soft dithered contact shadows.
import { C, RAMP_NAMES, COLORS, NAMES } from '../engine/palette.js';
import { W, HD, makeBitmap } from '../engine/screen.js';
import { LAYOUT } from '../ui.js';
import { PROPS, stampProp } from './props.js';
import './props-home.js';
import './props-travel.js';
import './props-decor.js';
import { DECOR_ART } from './decor-art.js';
import { glyphRows } from '../engine/font.js';

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

/** Backdrops that are out of doors: the bars round the screen carry their sky and ground on (see edgeColours). */
export const OPEN_AIR = new Set(['square', 'park', 'cottages', 'playground', 'beach', 'forest', 'fair', 'castle', 'starisle', 'hidden',
  'playfield', 'ropefield', 'trip', 'tripSky', 'farewell']);

const edges = new Map();
/**
 * The colours a backdrop meets the bars with: the commonest colour along its
 * top row and along its bottom row (palette indexes), and a darker shade of
 * the bottom one for grass strokes. Null for a place that is indoors.
 */
export function edgeColours(id) {
  if (!OPEN_AIR.has(id)) return null;
  if (!edges.has(id)) {
    const bm = backdrop(id);
    const commonest = (y) => {
      const n = new Map();
      for (let x = 0; x < bm.w; x++) { const c = bm.px[y * bm.w + x]; n.set(c, (n.get(c) || 0) + 1); }
      return [...n].sort((a, b) => b[1] - a[1])[0][0];
    };
    const top = commonest(0), bottom = commonest(bm.h - 1);
    edges.set(id, { top, bottom, stroke: C(tone(NAMES[bottom], -1)) });
  }
  return edges.get(id);
}

const propCache = new Map();
/** A prop as a hi-res bitmap of its own, for things that move across a scene. `at` is its anchor. */
export function propBitmap(name, opts = {}) {
  const key = name + JSON.stringify(opts);
  if (!propCache.has(key)) {
    const p = PROPS[name], bm = makeBitmap(p.w, p.h, true);
    stampProp((x, y, c) => { if (x >= 0 && y >= 0 && x < p.w && y < p.h) bm.px[y * p.w + x] = C(c); }, name, p.at[0], p.at[1], opts);
    bm.at = p.at;
    propCache.set(key, bm);
  }
  return propCache.get(key);
}

// ---------------------------------------------------------------- the pet's own room
// The home screen's room is built with the same kit and props as the town. Its
// window panes are left see-through: the scene draws the sky (and the sun, a
// cloud, the moon and stars) first and the room over it, so the view changes
// with the time of day. Pets stand lower here than in town (HOME_FEET).
export const HOME_WINDOW = { x: 30, y: 27, w: 64, h: 60 };  // the glass, in hi-res room pixels
export const HOME_FEET = 256;

/**
 * The room for a sky state ('day' | 'dawn' | 'dusk' | 'night'), lit or with the
 * lights off: { back, front }. `layout` says what is in each of the room's
 * slots ({ slot: decor id }, see src/game/decor.js); without one it is the
 * starter room. Only the last few pictures are kept, since every change of
 * decoration makes a new one.
 */
const homeKeys = [];
export function homeRoom(sky = 'day', dark = false, layout = null, room = 'bedroom') {
  const key = `home:${room}:${sky}:${dark}:${layout ? Object.values(layout).join(',') : ''}`;
  if (!cache.has(key)) {
    homeKeys.push(key);
    while (homeKeys.length > 12) cache.delete(homeKeys.shift());
    const k = kit();
    (ROOM_SCENES[room] || homeScene)(k, sky, layout || {});
    // window panes, and a garden's whole sky: holes in the picture
    for (let p = 0; p < k.bm.px.length; p++) if (k.bm.px[p] === HOLE) k.bm.px[p] = 0;
    // out of doors, the time of day colours everything
    const lut = OUTDOORS.has(room) && timeLut(sky);
    if (lut) for (const bm of [k.bm, k.front]) for (let p = 0; p < bm.px.length; p++) bm.px[p] = lut[bm.px[p]];
    if (dark) { dim(k.bm); dim(k.front); }
    cache.set(key, { back: k.bm, front: k.front });
  }
  return cache.get(key);
}
const HOLE = C('night'); // painted where the glass goes, then cut out (nothing else in the room uses it)

/** Lights off: the room keeps its shapes but sinks to two night shades. */
function dim(bm) {
  const night = C('night'), shade = C('shade');
  for (let i = 0; i < bm.px.length; i++) {
    const c = bm.px[i];
    if (!c) continue;
    const [r, g, b] = COLORS[c];
    const lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
    const x = i % bm.w, y = (i / bm.w) | 0;
    // light things become a half-tone, mid tones a sparse one, dark things solid night
    bm.px[i] = lum > 0.78 ? ((x + y) & 1 ? shade : night) : lum > 0.5 && (x & 1) === 0 && (y & 1) === 0 ? shade : night;
  }
}

// Out of doors the light changes through the day: the whole picture (and the
// ground in the bars under every room) moves along its own colour ramps, so a
// colour never lands somewhere unrelated. At night every shade drops a step
// (the ramps' dark ends lean blue already). At dusk the greens warm up a ramp,
// toward the orange sky: green to a deeper lime, mint to green, and the palest
// lime to gold. (Tinting by red, green and blue turned pale grass tan and left the rest green.)
const OUTDOORS = new Set(['garden']);
const NIGHT = { 3: 2, 2: 1, 1: 0, 0: 0 };
const TINTS = { dusk: {}, night: NIGHT };
const WARMER = { green: 'lime', mint: 'green' };
const DIMMER = { white: 'mist', mist: 'silver', silver: 'gray', gray: 'shade', shade: 'ink' }; // neutrals, at night
const tintLuts = {};
/** The palette-to-palette table for a time of day, or null when the light is plain daylight. */
export function timeLut(sky) {
  if (!TINTS[sky]) return null;
  if (!tintLuts[sky]) {
    const lut = new Uint8Array(COLORS.length);
    for (let i = 1; i < COLORS.length; i++) lut[i] = i;
    for (const r of RAMP_NAMES) for (let s = 0; s < 4; s++) lut[C(`${r}.${s}`)] = C(`${(sky === 'dusk' && WARMER[r]) || r}.${TINTS[sky][s] ?? s}`);
    // (the greens also drop a shade as they warm, so the evening lawn is golden, not washed out)
    if (sky === 'dusk') { for (let s = 0; s < 4; s++) lut[C(`green.${s}`)] = C(`lime.${Math.max(0, s - 1)}`); lut[C('lime.3')] = C('gold.3'); }
    if (sky === 'night') for (const [from, to] of Object.entries(DIMMER)) lut[C(from)] = C(to);
    tintLuts[sky] = lut;
  }
  return tintLuts[sky];
}
/** A ground colour as it looks at a time of day (a palette index). */
export function groundTone(name, sky) { const lut = timeLut(sky); return lut ? lut[C(name)] : C(name); }

/** Where each room shows the sky (hi-res room pixels): the bedroom's window panes, all of the garden's sky. */
export const ROOM_SKY = { bedroom: HOME_WINDOW, garden: { x: 0, y: 0, w: 256, h: 150 } };

/** The two front corners of a room: things that stand in front of the pet. */
function frontCorners(k, pieces, shadow) {
  k.layer('front');
  for (const piece of pieces) for (const [name, x, y, opts, r] of piece.things) {
    if (r) k.shadow(x, y, r, shadow, 3);
    k.prop(name, x, y, opts);
  }
  k.layer('back');
}

/** The kitchen: a stove and a counter against the wall, a shelf and a window over them, a table and a seat in front. */
function kitchenScene(k, sky, layout) {
  const art = (slot) => DECOR_ART[layout[slot]] || DECOR_ART[`sweet-kitchen-${slot}`];
  const wall = art('wall'), floor = art('floor'), win = art('window'), stove = art('stove'), counter = art('counter'), shelf = art('shelf');
  k.wall(wall.base, wall.pattern, wall.kind, { wainscot: wall.wainscot });
  k.prop(win.prop, 142, 98, win.ramps);
  k.prop('wallShelf', 214, 104, shelf.ramps);
  for (const [name, dx, opts] of shelf.things) k.prop(name, 214 + dx, 92, opts);
  k.tiles(HZ, floor.c, floor.c2); k.floorShadow(floor.shadow);
  if (sky === 'night') k.lightPool(128, 230, 70, 12, 'gold.3');
  k.shadow(60, 198, 46, floor.shadow, 4); k.prop(stove.prop, 60, 198, stove.ramps);
  k.shadow(208, 198, 40, floor.shadow, 4); k.prop(counter.prop, 208, 198, counter.ramps);
  for (const [name, dx, opts] of counter.things || []) k.prop(name, 208 + dx, 198 - PROPS[counter.prop].h, opts);
  frontCorners(k, [art('table'), art('seat')], floor.shadow);
}

/** The bathroom: a mirror on the tiled wall, a cabinet under a little window, a mat, towels and a plant. */
function bathroomScene(k, sky, layout) {
  const art = (slot) => DECOR_ART[layout[slot]] || DECOR_ART[`sweet-bathroom-${slot}`];
  const wall = art('wall'), floor = art('floor'), win = art('window'), mirror = art('mirror'), cabinet = art('cabinet'), mat = art('mat');
  k.wall(wall.base, wall.pattern, wall.kind, { wainscot: wall.wainscot });
  k.prop(win.prop, 204, 72, win.ramps);
  k.prop(mirror.prop, 84, 142, mirror.ramps);
  k.tiles(HZ, floor.c, floor.c2); k.floorShadow(floor.shadow);
  if (sky === 'night') k.lightPool(84, 196, 44, 9, 'gold.3');
  k.shadow(204, 198, 30, floor.shadow, 4); k.prop(cabinet.prop, 204, 198, cabinet.ramps);
  k.rug(124, HOME_FEET + 4, 64, 12, mat.c1, mat.c2);
  frontCorners(k, [art('plant'), art('towels')], floor.shadow);
}

/** The garden: open sky over a hedge and a fence, a tree, a centrepiece on the lawn, flowers and a seat in front. */
function gardenScene(k, sky, layout) {
  const art = (slot) => DECOR_ART[layout[slot]] || DECOR_ART[`sweet-garden-${slot}`];
  const ground = art('ground'), fence = art('fence'), tree = art('tree'), feature = art('feature');
  const top = 150; // where the lawn begins
  k.rect(0, 0, RW, top, 'night'); // the sky: cut out, so the real one shows
  k.canopy(-24, 118, 304, 34, fence.hedge, { seed: 91, r: 9 });
  k.field(top, ground.c, { seed: 12, light: ground.light, sides: false }); // (no darker sides: the lawn runs on past the screen's edge)
  k.tufts(164, 300, ground.tufts, 36, 9);
  // a picket fence along the back of the lawn
  for (let x = 2; x < RW; x += 12) { k.rect(x, 134, 7, 20, fence.c); k.rect(x + 6, 136, 1, 18, fence.shade); for (let j = 0; j < 3; j++) k.rect(x + j, 131 + j, 7 - j * 2, 1, fence.c); }
  k.rect(0, 139, RW, 3, fence.c); k.rect(0, 147, RW, 3, fence.c); k.dither(0, 154, RW, 2, C('green.2'));
  k.shadow(44, 198, 20, 'green.2', 4); k.prop(tree.prop, 40, 198, tree.ramps);
  k.shadow(176, 206, feature.shadow, 'green.2', 5); k.prop(feature.prop, 176, 206, feature.ramps);
  frontCorners(k, [art('flowers'), art('seat')], 'green.2');
}

/**
 * The bedroom, slot by slot: each slot's item says which props and colours to
 * use (src/art/decor-art.js); a slot with nothing in it gets the starter set's.
 */
function homeScene(k, sky, layout) {
  const night = sky === 'night', warm = sky === 'dawn' || sky === 'dusk';
  const art = (slot) => DECOR_ART[layout[slot]] || DECOR_ART[`sweet-${slot}`];
  const wall = art('wall'), floor = art('floor'), win = art('window');
  k.wall(wall.base, wall.pattern, wall.kind, { wainscot: wall.wainscot });
  // the window: sky shows through the panes
  const { x: wx, y: wy, w: ww, h: wh } = HOME_WINDOW;
  k.rect(wx, wy, ww, wh, 'night');
  k.prop('homeWindow', wx + 32, wy + 77, win.ramps);
  // the garland hangs in front of the curtain rod
  k.starString(5, { sag: 9, ...win.garland });
  // a picture, and a shelf of keepsakes over the bed
  const pic = art('picture'), shelf = art('shelf');
  k.prop(pic.prop, 138, 74, pic.ramps);
  k.prop('wallShelf', 206, 78, shelf.ramps);
  for (const [name, x, opts] of shelf.things) k.prop(name, x, 66, opts);
  k.planks(HZ, floor.c); k.floorShadow(floor.shadow);
  // light: sun through the window by day, the lamp at night
  if (!night) k.beam(wx + 8, HZ, 46, 226, warm ? 'gold.3' : 'cream.3', 0.4);
  else { k.lightPool(146, 150, 34, 22, 'gold.3'); k.lightPool(146, 196, 40, 9, 'gold.3'); }
  // the bed and the bedside lamp, against the wall
  const bed = art('bed'), lamp = art('lamp'), rug = art('rug');
  k.shadow(206, 198, 42, floor.shadow, 4); k.prop(bed.prop, 206, 198, bed.ramps);
  k.shadow(146, 198, 16, floor.shadow, 3);
  if (lamp.table) { k.prop('bedsideTable', 146, 198, lamp.table); k.prop(lamp.prop, 146, 168, lamp.ramps); }
  else k.prop(lamp.prop, 146, 198, lamp.ramps);
  // a rug to stand on
  k.rug(124, HOME_FEET + 4, 80, 14, rug.c1, rug.c2);
  if (rug.star) k.star5(124, HOME_FEET + 4, 8, rug.star);
  frontCorners(k, [art('corner'), art('plant')], floor.shadow);
}

const ROOM_SCENES = { bedroom: homeScene, kitchen: kitchenScene, bathroom: bathroomScene, garden: gardenScene };

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
  /** Stamp a hand-pixelled prop (src/art/props.js) with its anchor at (x, y). */
  const prop = (name, x, y, opts = {}) => stampProp(set, name, Math.round(x), Math.round(y), opts);
  /**
   * A soft field of grass (or sand, or moss): lighter where the light falls in
   * the open middle, deeper toward the edges and the bottom, finely textured
   * with little strokes, and sprinkled with tiny flowers.
   */
  const field = (y0, base, { seed = 1, flowers = ['white', 'pink.3', 'gold.3'], strokes = 160, light = lt(base), deep = dk(base), sides = true } = {}) => {
    const rnd = rand(seed * 41 + 9), H = RH - y0;
    rect(0, y0, RW, H, base);
    // the lit middle: a big soft oval, dithered at its rim
    const cx = 128 + (rnd() - 0.5) * 30, cy = y0 + H * 0.36, rx = 118, ry = H * 0.3;
    for (let y = y0; y < RH; y++) for (let x = 0; x < RW; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d < 0.8 || (d < 1 && ((x + y) & 1) === 0)) set(x, y, light);
    }
    // deeper toward the bottom and the sides
    for (let x = 0; x < RW; x++) {
      const e = y0 + H * 0.66 + Math.sin(x / 21 + seed) * 4 + Math.sin(x / 7) * 1.5;
      const side = Math.max(0, 1 - Math.min(x, RW - 1 - x) / 26);
      for (let y = y0; y < RH; y++) {
        if (y > e + 3 || (y > e && ((x + y) & 1) === 0)) set(x, y, deep);
        else if (sides && side > 0.5 && ((x + y) & 1) === 0 && y > y0 + 6) set(x, y, deep);
      }
    }
    // grass strokes: denser in the deeper ground, a few light ones in the middle
    for (let i = 0; i < strokes; i++) {
      const x = Math.round(rnd() * RW), y = Math.round(y0 + 4 + rnd() * (H - 6));
      const g = get(x, y), c = g === col(light) ? base : dk(base, g === col(deep) ? 2 : 1);
      set(x, y, c); set(x - 1, y - 1, c); set(x + 1, y - 1, c);
    }
    // tiny flowers, mostly toward the edges
    for (let i = 0; i < 26; i++) {
      const edgeX = rnd() < 0.7 ? (rnd() < 0.5 ? rnd() * 60 : RW - rnd() * 60) : rnd() * RW;
      const x = Math.round(edgeX), y = Math.round(y0 + 8 + rnd() * (H - 12)), c = flowers[i % flowers.length];
      set(x, y - 1, c); set(x - 1, y, c); set(x + 1, y, c); set(x, y + 1, c); set(x, y, 'gold.3');
    }
  };
  /** A bank of big soft clouds along the horizon, partly hidden behind what comes after. */
  const horizonClouds = (y, tint = 'violet.3', seed = 3) => {
    const rnd = rand(seed);
    for (let x = -30 + rnd() * 20; x < RW + 30;) { const w = 60 + rnd() * 30; pcloud(Math.round(x), Math.round(y - rnd() * 10), Math.round(w), tint, 1, Math.round(x)); x += w * 0.7; }
  };
  /** Framing in a bottom corner: banded shrubs and bushes (draw it on the front layer). */
  const frame = (side, leaf = 'green', { seed = 1, tall = true } = {}) => {
    const L = side === 'left', x = (d) => (L ? d : RW - d), rnd = rand(seed);
    if (tall) prop('shrubTall', x(10), 262, { leaf, flip: !L });
    prop('shrubShort', x(30 + rnd() * 4), 262, { leaf: leaf === 'green' ? 'lime' : leaf, flip: L });
    prop('bushA', x(16), 270, { leaf, flip: !L });
    prop('bushB', x(44), 266, { leaf: leaf === 'green' ? 'lime' : leaf, flip: L });
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
  /** Soft contact shadow on the ground. */
  const shadow = (cx, y, rx, c = 'shade', ry = Math.max(2, Math.round(rx / 5))) => {
    for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1 && ((cx + i + y + j) & 1) === 0) set(cx + i, y + j, c);
  };

  // ---- skies and grounds ----
  /** A row of far-off buildings in one pale colour. */
  const skyline = (y, c = 'sky.2', seed = 1) => {
    for (let x = 0, i = seed; x < RW; i++) {
      const w = 14 + ((i * 37) % 22), h = 18 + ((i * 53) % 40);
      rect(x, y - h, w - 1, h, c);
      for (let wy = y - h + 5; wy < y - 4; wy += 7) for (let wx = x + 3; wx < x + w - 4; wx += 5) set(wx, wy, lt(c));
      x += w;
    }
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
    if (kind === 'stars') for (let yy = 12, r = 0; yy < HZ - 16; yy += 20, r++) for (let x = r % 2 ? 12 : 30; x < RW; x += 36) star(x + ((r * 7) % 5), yy, pattern, (r + x) % 3 === 0);
    if (kind === 'sprigs') for (let yy = 12, r = 0; yy < HZ - 16; yy += 16, r++) for (let x = r % 2 ? 9 : 21; x < RW; x += 24) { set(x, yy, pattern); set(x, yy + 1, pattern); set(x - 1, yy - 1, pattern); set(x - 2, yy - 2, pattern); set(x + 1, yy - 1, pattern); set(x + 2, yy - 2, pattern); set(x, yy + 2, dk(pattern)); }
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
    prop(s >= 0.95 ? (seed % 3 === 2 ? 'treeC' : 'treeA') : 'treeB', x, y, { leaf: rampOf(leaf), flip: seed % 2 === 1 });
  };
  const bush = (x, y, c = 'green.2', w = 16, seed = x) => {
    blob(x + 2, y, w + 3, Math.max(2, w / 5), dk(c, 2), { seed, line: null, shade: false, wob: 0.2 });
    prop(w >= 14 ? 'bushA' : w >= 9 ? 'bushB' : 'bushC', x, y, { leaf: rampOf(c), flip: Math.round(seed) % 2 === 1 });
  };
  const flower = (x, y, c = 'pink.2') => { rect(x, y - 5, 1, 5, 'green.1'); set(x + 1, y - 2, 'green.2'); for (const [dx, dy] of [[-1, -6], [1, -6], [0, -7], [0, -5]]) set(x + dx, y + dy, c); set(x, y - 6, 'gold.3'); };
  const flowers = (x, y, n = 5, c = 'pink.2') => { for (let i = 0; i < n; i++) flower(x + i * 6, y - (i % 2) * 2, i % 3 === 2 ? 'gold.2' : c); };
  /** A hand-pixelled lamp post; lit ones throw a soft glow. */
  const lamp = (x, y, glow = true) => {
    shadow(x, y, 7);
    if (glow) for (let j = -13; j <= 13; j++) for (let i = -13; i <= 13; i++) if (i * i + j * j < 160 && ((x + i + j) & 1) === 0) set(x + i, y - 51 + j, 'gold.3');
    prop('lamp', x, y, { glass: 'gold' });
  };
  const awning = (x, y, w, c1 = 'red.2', c2 = 'white') => {
    for (let i = 0; i < w; i++) { const c = Math.floor(i / 8) % 2 ? c2 : c1; rect(x + i, y, 1, 10, c); set(x + i, y + 10, dk(c)); }
    for (let i = 0; i < w; i += 8) { const c = Math.floor(i / 8) % 2 ? c2 : c1; ellipse(x + i + 4, y + 11, 4, 3, c, { outline: dk(c, 2) }); }
    rect(x, y, w, 2, dk(c1)); rect(x, y - 2, w, 2, 'ink');
  };
  /** A hand-pixelled shopfront: wall colour, awning colour (awn[0]) and its sign. */
  const shopFront = (x, y, w, wallC, awn, { sign: label = null, signC = 'brown.1', halo = null } = {}) => {
    shadow(x + w / 2, y, w / 2, 'shade', 3);
    prop('shop', x + w / 2, y, { wall: rampOf(wallC), accent: rampOf(awn[0]), flip: x > RW / 2, halo });
    if (typeof label === 'string' && label.length > 1) sign(x + w / 2 + (x > RW / 2 ? 2 : -2), y - 66, label, { bg: signC, pad: 2 });
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
  const rug = (cx, cy, rx, ry, c1 = 'pink.2', c2 = 'pink.3') => { ellipse(cx, cy, rx, ry, c1, { outline: dk(c1) }); ellipse(cx, cy, rx - 6, ry - 3, c2); ellipse(cx, cy, rx - 12, ry - 6, c1); };
  const pictureFrame = (x, y, w, h, art = 'sky.2') => { block(x, y, w, h, 'gold.2'); rect(x + 3, y + 3, w - 6, h - 6, art); rect(x + 3, y + h - 8, w - 6, 5, 'green.2'); disc(x + w - 9, y + 9, 3, 'gold.3'); };
  const clock = (x, y, r = 10) => { disc(x, y, r + 2, 'brown.2', { outline: 'brown.0' }); disc(x, y, r, 'white', { outline: 'mist' }); line(x, y, x, y - r + 3, 'ink'); line(x, y, x + r - 4, y, 'ink'); set(x, y, 'red.1'); };
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
    const name = w * s >= 72 && seed % 2 === 0 ? 'cloudD' : w * s >= 56 ? 'cloudA' : w * s >= 36 ? 'cloudB' : 'cloudC';
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
      const r = rnd();
      prop(r < 0.12 ? 'tallGrass' : r < 0.56 ? 'tuftA' : 'tuftB', qx + (rnd() - 0.5) * 34, qy + (rnd() - 0.5) * 12, { leaf, flip: rnd() < 0.5 });
    }
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
  const sparkle = (x, y, c = 'white') => { set(x, y, c); set(x - 1, y, c); set(x + 1, y, c); set(x, y - 1, c); set(x, y + 1, c); set(x, y - 2, c); set(x, y + 2, c); };
  const mushroom = (x, y, c = 'pink.2') => {
    shadow(x, y, 5, dk('green.2'));
    prop('mushroomA', x, y, { accent: rampOf(c), flip: Math.round(x) % 2 === 1 });
  };
  const rock = (x, y, r = 6, c = 'slate.3') => { shadow(x, y, r + 2); puff(x, y - r * 0.6, r, c); };

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

  // ---- charm: lettering, faces, marquee bulbs, hanging stars ----
  /** A lettered sign board centred on x (top at y), in the game's own pixel font. */
  const sign = (x, y, str, { fg = 'white', bg = 'pink.1', pad = 3, board = true } = {}) => {
    const gl = [...str].map((ch) => glyphRows(ch));
    const w = gl.reduce((a, g) => a + (g[0] || '').length + 1, -1), h = 5;
    const x0 = Math.round(x - w / 2);
    if (board) {
      block(x0 - pad, y - pad, w + pad * 2, h + pad * 2 + 1, bg, { r: 2 });
      rect(x0 - pad + 2, y - pad + 1, w + pad * 2 - 4, 1, lt(bg));
    }
    let cx = x0;
    for (const g of gl) {
      g.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') { set(cx + i + 1, y + j + 1, dk(bg, 2)); set(cx + i, y + j, fg); } }));
      cx += (g[0] || '').length + 1;
    }
    return w + pad * 2;
  };
  /** The Tamagotchi face: two dot eyes with a glint, rosy cheeks, a little open mouth. */
  const face = (x, y, s = 1, { ink = 'ink', cheek = 'pink.2', mouth = 'red.1', gap = 5 } = {}) => {
    for (const d of [-1, 1]) {
      const ex = x + d * gap * s;
      rect(ex - s, y - s, 2 * s, 3 * s, ink); set(ex - s, y - s, 'white');
      rect(ex + d * 3 * s - s, y + 3 * s, 2 * s, s, cheek);
    }
    rect(x - s, y + 3 * s, 2 * s, s, ink); rect(x - s, y + 4 * s, 2 * s, s, mouth);
  };
  /** Marquee bulbs along a line, alternating warm colours, each with a glint. */
  const bulbs = (x0, y0, x1, y1, step = 6, colors = ['gold.3', 'orange.2']) => {
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n), c = colors[i % colors.length];
      set(x - 1, y, dk(c)); set(x + 1, y, dk(c)); set(x, y - 1, c); set(x, y + 1, dk(c)); set(x, y, 'white');
    }
  };
  /** A little puffy heart, lit on its upper left. */
  const heart = (cx, cy, c = 'pink.2', r = 3) => {
    for (let y = -r - 1; y <= r + 1; y++) for (let x = -2 * r; x <= 2 * r; x++) {
      const inside = (px, py) => { const u = Math.abs(px) / r - 1, v = py / r; return py <= 0 ? (u * u + (v + 0.3) ** 2 <= 1.1) : Math.abs(px) <= (r * 2) * (1 - py / (r * 1.6)); };
      if (!inside(x, y)) continue;
      const rim = !inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1);
      set(cx + x, cy + y, rim ? dk(c, 2) : y > 1 ? dk(c) : c);
    }
    set(cx - r, cy - 1, 'white');
  };
  /** A smiling sun with soft rounded rays. */
  const sun = (x, y, r = 13) => {
    for (let a = 0; a < 10; a++) { const t = (a / 10) * Math.PI * 2 + 0.3; puff(x + Math.cos(t) * (r + 5), y + Math.sin(t) * (r + 5), 3, 'orange.3', { line: 'orange.2' }); }
    disc(x, y, r, 'gold.3', { outline: 'orange.2' });
    for (let j = -r + 3; j < -r + 6; j++) rect(x - 4, y + j, 5, 1, 'white');
    face(x, y + 1, 1, { gap: 5, ink: 'brown.0', cheek: 'orange.3', mouth: 'red.2' });
  };
  /** A wooden signpost with a lettered board. */
  const signpost = (x, y, str, bg = 'brown.1') => {
    shadow(x, y, 7);
    rect(x - 1, y - 26, 3, 26, 'brown.1'); rect(x - 1, y - 26, 1, 26, 'brown.2'); set(x + 1, y - 1, 'brown.0');
    sign(x, y - 34, str, { bg, pad: 2 });
  };
  /** A sagging string of hanging stars (or hearts) across the top of a scene. */
  const starString = (y, { sag = 10, x0 = 0, x1 = RW, every = 30, string = 'brown.1', colors = ['gold.3', 'pink.3', 'sky.3', 'mint.3'], hearts = false } = {}) => {
    const at = (x) => y + Math.round(Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * sag);
    for (let x = x0; x < x1; x++) set(x, at(x), string);
    for (let x = x0 + every / 2, i = 0; x < x1; x += every, i++) {
      const len = 6 + (i % 3) * 5, yy = at(x);
      for (let j = 1; j < len; j++) set(x, yy + j, string);
      if (hearts) heart(x, yy + len + 3, colors[i % colors.length]);
      else { star5(x, yy + len + 4, 5, colors[i % colors.length]); set(x - 1, yy + len + 2, 'white'); }
    }
  };

  return {
    bm, front, layer, usedFront: () => frontUsed, set, sign, face, bulbs, starString, heart, sun, signpost, field, horizonClouds, frame, prop, blob,
    mist, trunk, trail, flowerPatch, rocks, tufts, lightPool, beam, vignette, plant, hangingPlant, mobile, puff, canopy, pcloud, bands, mountain,
    mottle, star5, sparkle, mushroom, rock, get, rect, box, line, dither, block, flat, ellipse, disc, shadow, skyline, tiles, planks, cobbles, wall,
    floorShadow, tree, bush, flower, flowers, lamp, awning, shopFront, counter, shelf, rug, clock, star, curtain, bunting,
    stringLights, pictureFrame,
  };
}

// ---------------------------------------------------------------- the places
const SCENES = {
  // ---- downtown ----
  square(k) {
    k.bands(['sky.2', 'sky.2', 'sky.3'], 0, HZ);
    k.pcloud(30, 34, 60, 'violet.3'); k.pcloud(182, 48, 56, 'pink.3', 0.9);
    k.skyline(HZ - 60, 'sky.2', 3);
    // rows of little cone trees peeking over the roofs
    for (const [x, y, l] of [[6, HZ - 62, 'green'], [22, HZ - 70, 'mint'], [86, HZ - 40, 'green'], [170, HZ - 40, 'mint'], [234, HZ - 72, 'green'], [250, HZ - 62, 'mint']]) k.prop('coneTree', x, y, { leaf: l, halo: 'white' });
    k.shopFront(4, HZ, 72, 'pink.3', ['pink.2', 'white'], { sign: 'SWEETS', signC: 'pink.1', halo: 'white' });
    k.shopFront(180, HZ, 72, 'gold.3', ['sky.2', 'white'], { sign: 'GIFTS', signC: 'sky.1', halo: 'white' });
    k.prop('townhall', 128, HZ, { roof: 'red', accent: 'red', halo: 'white' });
    // the clock wears a face, and the hall has its name over the windows
    k.disc(128, 59, 6, 'cream.3'); k.face(128, 57, 1, { gap: 3 });
    k.sign(128, 83, 'TOWN HALL', { bg: 'red.1', pad: 2 });
    k.cobbles(HZ, 'slate.3');
    for (let y = HZ + 16; y < RH; y++) for (let x = 0; x < RW; x++) {
      const dx = (x - 128) / 118, dy = (y - 252) / 50, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1) continue;
      const ring = Math.floor(d * 6), a = Math.atan2(dy, dx), seg = Math.floor(((a + Math.PI) / (Math.PI * 2)) * (8 + ring * 6));
      const edge = Math.abs(d * 6 - Math.round(d * 6)) < 0.08 || Math.abs((((a + Math.PI) / (Math.PI * 2)) * (8 + ring * 6)) % 1) < 0.06;
      k.set(x, y, edge ? 'slate.2' : d > 0.98 ? 'slate.1' : ring % 2 ? ((seg & 1) ? 'cream.3' : 'gold.3') : ((seg & 1) ? 'white' : 'cream.3'));
    }
    k.bunting(8, 14);
    k.shadow(128, 252, 54, 'slate.1', 6);
    k.prop('fountain', 128, 252);
    k.lamp(26, 246); k.lamp(230, 246);
    for (const [x, l] of [[56, 'green'], [200, 'mint']]) { k.shadow(x, 214, 9); k.prop('coneTree', x, 214, { leaf: l }); }
    k.layer('front');
    for (const [x, f] of [[14, false], [242, true]]) { k.prop('shrubShort', x, 244, { leaf: 'green', flip: f }); k.prop('planter', x, 262, { wall: 'cream' }); k.prop('flowersB', x + (f ? -6 : 6), 239, { accent: f ? 'gold' : 'pink' }); }
    k.layer('back');
  },
  park(k) {
    // a garden park: a bandstand at the end of a winding trail, a pond with a little bridge
    k.bands(['sky.2', 'sky.2', 'sky.3'], 0, 118);
    k.pcloud(-6, 40, 80, 'violet.3'); k.pcloud(140, 26, 96, 'pink.3'); k.pcloud(96, 64, 40, 'violet.3', 0.8); k.pcloud(210, 70, 50, 'violet.3', 0.8);
    k.horizonClouds(92, 'violet.3', 5);
    k.mountain(52, 108, 180, 34, 'sky.1', { seed: 11 }); k.mountain(206, 108, 160, 26, 'mint.2', { seed: 12 });
    k.mist(96, 12, 'sky.3');
    k.canopy(-24, 84, 304, 36, 'mint.1', { seed: 61, r: 9 }); // the far tree line, soft and pale
    k.field(112, 'green.3', { seed: 2, light: 'lime.3' });
    k.mottle(114, 132, 'mint.2', 5, 8); // shade along the trees
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
    k.prop('flowerBed', 218, 190, { accent: 'pink' }); k.flowerPatch(108, 140, 5, ['gold.2', 'white']); k.flowerPatch(30, 200, 6, ['violet.2', 'pink.2']);
    k.rocks(126, 206, 2);
    k.lamp(112, 196, false);
    k.signpost(98, 154, 'PARK');
    k.layer('front');
    k.frame('left', 'green', { seed: 31 }); k.frame('right', 'green', { seed: 32, tall: false }); k.prop('flowersA', 60, 262, { accent: 'pink' });
    k.layer('back');
  },
  cottages(k) {
    // snug cottages on a hillside at sunset, where the town's old keepers put their feet up
    k.bands(['violet.3', 'pink.3', 'gold.3', 'gold.3'], 0, 126);
    k.sun(180, 62, 17);
    k.pcloud(-10, 30, 84, 'pink.2'); k.pcloud(96, 18, 70, 'violet.2', 0.85); k.pcloud(214, 86, 44, 'pink.2', 0.8);
    k.horizonClouds(104, 'pink.3', 9);
    k.mountain(56, 124, 190, 34, 'violet.2', { seed: 41 }); k.mountain(214, 124, 150, 22, 'pink.2', { seed: 42 });
    k.mist(110, 12, 'gold.3');
    k.canopy(-24, 102, 304, 30, 'green.2', { seed: 71, r: 9 });
    k.field(124, 'lime.3', { seed: 9, light: 'gold.3' });
    k.mottle(126, 142, 'green.3', 5, 8);
    k.tufts(132, 262, 'green.2', 44, 5);
    // a path winding up to the middle cottage, and branching to the others
    k.trail(170, RH, (y) => 128 + Math.sin(y / 18) * 7, (y) => 7 + (y - 170) * 0.16, 'cream.3', { seed: 6 });
    // three cottages with trees behind
    k.tree(14, 150, 1.0, 'green.2', { seed: 5 }); k.tree(244, 148, 1.05, 'green.2', { seed: 8 });
    k.shadow(50, 168, 28, 'green.1'); k.prop('hut', 50, 168, { roof: 'red', glass: 'gold', wall: 'cream' });
    k.shadow(206, 172, 28, 'green.1'); k.prop('hut', 206, 172, { roof: 'sky', glass: 'gold', wall: 'cream', flip: true });
    k.shadow(128, 172, 28, 'green.1'); k.prop('mushroomHouse', 128, 172, { accent: 'pink' });
    k.signpost(152, 196, 'COTTAGES');
    // gardens: flower beds, a bench of a log, lanterns for the evening
    k.prop('flowerBed', 40, 196, { accent: 'gold' }); k.prop('flowerBed', 216, 200, { accent: 'pink' });
    k.flowerPatch(92, 150, 5, ['violet.2', 'white']); k.flowerPatch(170, 148, 5, ['pink.2', 'gold.2']);
    k.bush(86, 172, 'green.2', 9, 3); k.bush(168, 176, 'lime.2', 9, 4);
    k.shadow(180, 214, 16, 'green.1'); k.prop('log', 180, 214, { flip: true });
    k.lamp(24, 232); k.lamp(232, 236);
    k.rocks(150, 222, 2);
    for (let i = 0; i < 12; i++) { const x = (i * 67 + 20) % RW, y = 132 + (i * 29) % 90; k.set(x, y, 'gold.3'); k.set(x + 1, y, 'white'); } // fireflies
    k.layer('front');
    k.frame('left', 'green', { seed: 51, tall: false }); k.frame('right', 'green', { seed: 52 }); k.prop('flowersA', 196, 262, { accent: 'gold' });
    k.layer('back');
  },
  playground(k) {
    k.bands(['sky.2', 'sky.3'], 0, 110);
    k.sun(222, 26, 12);
    k.pcloud(10, 30, 76, 'pink.3'); k.pcloud(140, 50, 70, 'violet.3'); k.pcloud(110, 72, 36, 'violet.3', 0.8);
    k.canopy(-12, 62, 112, 46, 'green.2', { seed: 3, r: 11 }); k.canopy(150, 58, 124, 50, 'green.2', { seed: 6, r: 11 });
    k.field(104, 'green.3', { seed: 4, light: 'lime.3' }); k.tufts(116, 270, 'green.2', 30, 6);
    for (let x = 2; x < RW; x += 12) { k.rect(x, 92, 7, 20, 'white'); k.rect(x + 6, 94, 1, 18, 'mist'); for (let j = 0; j < 3; j++) k.rect(x + j, 89 + j, 7 - j * 2, 1, 'white'); }
    k.rect(0, 97, RW, 3, 'white'); k.rect(0, 105, RW, 3, 'white'); k.dither(0, 112, RW, 2, C('green.2'));
    k.sign(160, 96, 'PLAY!', { bg: 'sky.1', pad: 2 });
    // sand pit
    k.blob(128, 222, 112, 32, 'gold.3', { seed: 44, line: 'gold.1', top: 'gold.2', hi: 'cream.3', wob: 0.08 });
    for (let i = 0; i < 40; i++) k.set(30 + (i * 47) % 196, 200 + (i * 13) % 40, 'gold.2');
    // swing set
    const gy = 196;
    k.shadow(66, gy, 50, 'green.2'); k.prop('swingSet', 66, gy, { accent: 'red', wood: 'brown' });
    // slide with a ladder
    k.shadow(204, gy + 2, 36, 'green.2'); k.prop('slide', 200, gy, { accent: 'sky', wall: 'gold' });
    k.shadow(132, 236, 12, 'gold.2'); k.prop('pail', 132, 236, { accent: 'red', glass: 'sky', wood: 'brown' });
    k.layer('front');
    k.frame('left', 'green', { seed: 7, tall: false }); k.frame('right', 'lime', { seed: 8 });
    k.layer('back');
  },
  cafe(k) {
    k.wall('cream.3', 'pink.3', 'stripes', { wainscot: 'pink.2' });
    k.prop('window', 46, 84, { glass: 'sky', accent: 'pink' }); k.prop('window', 210, 84, { glass: 'sky', accent: 'pink' });
    k.awning(14, 26, 66, 'pink.2', 'white'); k.awning(178, 26, 66, 'pink.2', 'white');
    k.block(102, 22, 52, 36, 'brown.1'); k.flat(105, 25, 46, 30, 'green.0');
    k.sign(128, 29, 'MENU', { fg: 'gold.3', bg: 'green.0', board: false });
    for (let i = 0; i < 3; i++) { k.rect(110, 38 + i * 6, 22 - (i % 2) * 8, 1, 'white'); k.rect(140, 38 + i * 6, 6, 1, 'pink.3'); }
    k.heart(146, 29, 'pink.2', 2);
    k.shelf(104, 74, 48, 'bottles', ['gold.2', 'brown.2', 'red.2']);
    k.vignette('pink.2', 36);
    k.hangingPlant(92, 60, 18); k.hangingPlant(164, 60, 16);
    k.stringLights(4, 8, ['gold.3', 'pink.3', 'mint.3']);
    k.planks(HZ, 'cream.2'); k.floorShadow();
    k.rug(128, 236, 54, 10, 'pink.2', 'cream.3');
    k.beam(20, HZ, 30, 236, 'white', 0.35); k.beam(184, HZ, 30, 236, 'white', 0.35);
    for (const x of [48, 208]) { k.rect(x, 0, 1, 92, 'ink'); k.prop('pendantLamp', x, 103, { accent: 'gold', glass: 'gold' }); k.lightPool(x, 108, 14, 8, 'gold.3'); }
    k.counter(92, HZ + 18, 72, 'pink.2', 'white');
    k.prop('espresso', 108, HZ - 8, { stone: 'slate', accent: 'pink', glass: 'cream' });
    k.prop('layerCake', 146, HZ - 8, { wall: 'cream', accent: 'pink', stone: 'slate' });
    for (const x of [40, 216]) { k.shadow(x, 248, 18); k.prop('cafeTable', x, 248, { wall: 'cream', glass: 'pink', flip: x > 128 }); }
    k.layer('front');
    k.plant(16, 262, 1.1, 'green.2', 'pink.2', 3); k.plant(242, 262, 1, 'green.2', 'pink.2', 4);
    k.layer('back');
  },
  bakery(k) {
    k.wall('gold.3', 'orange.3', 'bricks');
    for (let i = 0; i < 3; i++) k.shelf(10, 62 + i * 30, 84, 'bread', ['orange.2', 'gold.2', 'brown.2']);
    // a smiling domed brick oven, glowing inside, and a porthole window
    k.prop('oven', 210, 146, { accent: 'red', wall: 'cream' });
    k.lightPool(210, 150, 30, 6, 'orange.3');
    k.face(205, 86, 1, { gap: 7, ink: 'brown.0', cheek: 'pink.3' });
    k.prop('porthole', 132, 72, { wood: 'brown', glass: 'sky', stone: 'gold' });
    // loaves hanging from the ceiling
    k.rect(106, 0, 1, 40, 'ink'); for (const [dx, c] of [[-6, 'gold.2'], [0, 'orange.2'], [6, 'gold.2']]) k.ellipse(106 + dx, 44 + Math.abs(dx), 4, 6, c, { outline: 'brown.0', shade: true });
    k.vignette('orange.2', 36);
    k.pictureFrame(100, 82, 22, 18, 'sky.2');
    k.sign(150, 12, 'BAKERY', { bg: 'orange.1', pad: 3 }); k.heart(126, 15, 'orange.2', 2); k.heart(174, 15, 'orange.2', 2);
    k.tiles(HZ, 'cream.3', 'gold.3'); k.floorShadow();
    k.rug(128, 232, 70, 9, 'orange.2', 'gold.3');
    k.lightPool(208, HZ + 14, 40, 10, 'orange.3');
    k.counter(54, HZ + 24, 148, 'brown.2', 'cream.3');
    k.prop('pastryCase', 92, HZ - 5, { accent: 'orange' }); k.prop('pastryCase', 164, HZ - 5, { accent: 'pink', flip: true });
    k.layer('front');
    for (const [x, y, f] of [[14, 256, false], [32, 262, true]]) { k.shadow(x, y, 11); k.prop('flourSack', x, y, { wall: 'cream', accent: 'red', flip: f }); }
    k.shadow(236, 260, 20); k.prop('breadBasket', 236, 260, { wall: 'gold', accent: 'pink', wood: 'brown' });
    k.layer('back');
  },
  toyshop(k) {
    k.wall('sky.3', 'sky.2', 'dots');
    for (let i = 0; i < 3; i++) { k.shelf(8, 58 + i * 32, 100, 'toys'); k.shelf(148, 58 + i * 32, 100, 'toys', ['violet.2', 'gold.2', 'red.2', 'mint.2']); }
    k.mobile(128, 30);
    k.sign(128, 78, 'TOY SHOP', { bg: 'red.1', pad: 2 });
    k.bunting(2, 6, ['red.2', 'gold.2', 'sky.2', 'mint.2', 'violet.2']);
    for (let y = 92; y < 148; y++) for (let x = 104; x < 152; x++) {
      const inArch = y > 114 || ((x - 128) / 24) ** 2 + ((y - 114) / 22) ** 2 <= 1;
      const inGlass = (y > 114 && x > 107 && x < 149 && y < 145) || (((x - 128) / 20) ** 2 + ((y - 114) / 18) ** 2 <= 1 && y <= 114);
      if (inArch) k.set(x, y, inGlass ? (y > 130 ? 'sky.2' : 'sky.3') : 'white');
    }
    for (const [x, y, r] of [[116, 136, 7], [128, 132, 8], [141, 137, 7]]) k.puff(x, y, r, 'green.2');
    k.rect(108, 141, 40, 4, 'green.1');
    k.rect(127, 96, 2, 49, 'white'); k.rect(108, 118, 40, 2, 'white');
    for (let i = 0; i < 6; i++) k.set(112 + i, 108 - i, 'white');
    k.rect(100, 146, 56, 3, 'white'); k.rect(100, 149, 56, 1, 'sky.1');
    k.vignette('sky.1', 34);
    k.tiles(HZ, 'pink.3', 'white', 16); k.floorShadow();
    k.rug(128, 232, 60, 11, 'sky.2', 'gold.3');
    k.lightPool(128, HZ + 30, 60, 12, 'white');
    k.shadow(128, 200, 28); k.prop('rockingHorse', 128, 200, { accent: 'red', wall: 'gold' });
    k.layer('front');
    k.shadow(24, 260, 22); k.prop('giftBox', 14, 260, { accent: 'red', wall: 'cream' }); k.prop('giftBox', 31, 260, { accent: 'sky', wall: 'gold' }); k.prop('giftBox', 22, 245, { accent: 'gold', wall: 'pink' });
    k.shadow(58, 256, 12); k.prop('plushEgg', 58, 256, { accent: 'pink', stone: 'slate' });
    k.shadow(236, 262, 16); k.prop('teddyBear', 236, 262, { wood: 'brown', wall: 'cream', accent: 'pink' });
    k.layer('back');
  },
  boutique(k) {
    k.wall('pink.3', 'pink.2', 'stripes', { wainscot: 'violet.3' });
    k.sign(72, 48, 'BOUTIQUE', { bg: 'violet.1', pad: 3 });
    k.starString(0, { sag: 8, every: 28, string: 'pink.1', colors: ['pink.2', 'red.2', 'white', 'violet.3'], hearts: true });
    k.rect(18, 66, 108, 3, 'slate.1');
    for (const x of [22, 122]) k.rect(x, 66, 3, 104, 'slate.1');
    ['pink', 'sky', 'gold', 'violet', 'mint'].forEach((c, i) => k.prop(i % 2 ? 'shirt' : 'dress', 36 + i * 19, i % 2 ? 93 : 105, { accent: c }));
    k.prop('mirror', 208, 144, { wall: 'gold', glass: 'sky', accent: 'pink' }); k.sparkle(222, 64); k.sparkle(196, 112);
    k.prop('hatStand', 151, 118, { wood: 'brown', accent: 'red', glass: 'sky', wall: 'gold' });
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
    k.block(80, 4, 96, 22, 'violet.0'); k.rect(83, 7, 90, 16, 'indigo.0');
    k.bulbs(80, 4, 176, 4, 6); k.bulbs(80, 25, 176, 25, 6); k.bulbs(80, 4, 80, 25, 7); k.bulbs(176, 4, 176, 25, 7);
    k.sign(128, 12, 'ARCADE', { fg: 'pink.3', bg: 'indigo.0', board: false }); k.star5(94, 14, 3, 'gold.3'); k.star5(162, 14, 3, 'gold.3');
    k.rect(0, 30, RW, 1, 'pink.2'); k.rect(0, 32, RW, 1, 'sky.2'); // neon strips
    for (const [x, c, knob] of [[8, 'red', 'gold'], [64, 'sky', 'red'], [148, 'gold', 'red'], [204, 'green', 'pink']]) {
      k.shadow(x + 22, 206, 26, 'night');
      k.prop('cabinet', x + 22, 206, { accent: c, wall: 'cream', glass: 'indigo', stone: 'slate', roof: knob });
    }
    k.prop('claw', 128, 206, { accent: 'pink', glass: 'sky', wall: 'gold' });
    k.rect(0, HZ + 32, RW, RH - HZ - 32, 'indigo.1'); k.dither(0, HZ + 32, RW, 10, C('indigo.0'));
    {
      const rnd = rand(404), motifs = [
        ['.#.', '###', '.#.'], ['#..', '.#.', '..#'], ['##', '##'], ['#.#', '.#.', '#.#'], ['.#..', '#.#.', '...#'],
      ];
      for (let y = HZ + 36; y < RH; y += 11) for (let x = (y * 7) % 13; x < RW; x += 15 + Math.round(rnd() * 6)) {
        const m = motifs[Math.floor(rnd() * motifs.length)], c = ['pink.2', 'sky.2', 'gold.2', 'mint.2', 'violet.2'][Math.floor(rnd() * 5)];
        const ox = x + Math.round(rnd() * 4), oy = y + Math.round(rnd() * 4);
        m.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') k.set(ox + i, oy + j, c); }));
      }
    }
    k.rect(0, HZ + 32, RW, 1, 'violet.1');
    for (const [x, c] of [[30, 'red.3'], [86, 'sky.3'], [170, 'gold.3'], [226, 'mint.3']]) k.lightPool(x, HZ + 40, 26, 6, c);
    k.layer('front');
    k.shadow(18, 262, 14); k.prop('gumball', 18, 262, { accent: 'red', glass: 'sky', wall: 'gold', roof: 'pink' });
    k.layer('back');
  },
  hospital(k) {
    k.wall('white', 'mint.3', 'stripes', { wainscot: 'mint.2' });
    k.prop('crossSign', 41, 69, { wall: 'cream', accent: 'red' });
    k.sign(41, 78, 'CLINIC', { bg: 'red.1', pad: 2 });
    k.prop('window', 109, 79, { glass: 'sky', accent: 'mint' });
    k.clock(160, 44, 9);
    k.pictureFrame(140, 76, 22, 18, 'mint.2'); k.hangingPlant(66, 82, 14);
    k.rect(176, 20, 80, 2, 'slate.1');
    for (let x = 178; x < RW; x += 4) k.rect(x, 22, 2, 70, x % 8 ? 'mint.2' : 'mint.1');
    k.shadow(212, HZ + 4, 40);
    k.prop('bed', 212, 184, { wall: 'cream', glass: 'sky', accent: 'sky', stone: 'slate' });
    k.shadow(158, 174, 12); k.prop('ivStand', 158, 174, { stone: 'slate', glass: 'sky' });
    k.shadow(36, 170, 28); k.prop('medCabinet', 36, 170, { accent: 'red', stone: 'slate', wall: 'cream' });
    k.vignette('mint.2', 30);
    k.tiles(HZ, 'mint.3', 'white', 20); k.floorShadow('mint.1');
    k.beam(86, HZ, 46, 250, 'white', 0.3);
    k.layer('front');
    k.plant(18, 262, 1.2, 'green.2', 'sky.1', 7);
    k.shadow(238, 262, 14); k.prop('firstAid', 238, 262, { wall: 'cream', accent: 'red', stone: 'slate' });
    k.layer('back');
  },
  // ---- uptown ----
  dept(k) {
    k.wall('cream.3', 'gold.3', 'diamonds');
    for (const x of [78, 178]) { k.block(x - 5, 0, 10, HZ, 'white'); k.rect(x - 7, HZ - 12, 14, 12, 'mist'); } // pillars
    k.block(84, 10, 88, 22, 'red.1'); k.rect(88, 14, 80, 14, 'red.0');
    k.sign(128, 18, 'DEPT STORE', { fg: 'gold.3', bg: 'red.0', board: false });
    k.bulbs(84, 10, 172, 10, 6); k.bulbs(84, 31, 172, 31, 6);
    for (let i = 0; i < 3; i++) { k.shelf(6, 64 + i * 30, 66, 'boxes'); k.shelf(184, 64 + i * 30, 66, 'boxes', ['red.2', 'blue.2', 'gold.2']); }
    // a grand escalator up to the next floor: golden steps between glass balustrades
    k.prop('escalator', 136, 174, { wall: 'gold', accent: 'red', glass: 'sky', stone: 'slate', roof: 'gold' });
    k.vignette('gold.2', 30);
    k.plant(66, HZ - 2, 0.9, 'green.2', 'gold.2', 21); k.plant(190, HZ - 2, 0.9, 'green.2', 'gold.2', 22);
    k.tiles(HZ, 'white', 'mist', 24); k.floorShadow('silver');
    for (const x of [40, 128, 216]) k.lightPool(x, HZ + 24, 30, 6, 'white');
    k.shadow(220, 238, 28); k.prop('displayTable', 220, 238, { wall: 'cream', accent: 'pink' });
    for (const [x, c] of [[205, 'pink'], [220, 'sky'], [234, 'gold']]) k.prop('giftBox', x, 213, { accent: c, wall: c === 'gold' ? 'pink' : 'cream' });
    k.layer('front');
    for (const [x, c] of [[14, 'red'], [30, 'violet']]) { k.shadow(x, 262, 9); k.prop('shoppingBag', x, 262, { accent: c }); }
    k.plant(240, 262, 1.1, 'green.2', 'gold.2', 11);
    k.layer('back');
  },
  salon(k) {
    k.wall('violet.3', 'pink.3', 'dots', { wainscot: 'violet.2' });
    for (const x of [66, 190]) k.prop('vanity', x, 112, { wall: 'cream', roof: 'gold' });
    k.sign(128, 9, 'SALON', { bg: 'violet.1', pad: 2 }); k.star5(106, 13, 3, 'gold.3'); k.star5(150, 13, 3, 'gold.3');
    k.shelf(108, 40, 40, 'bottles', ['pink.2', 'violet.2', 'mint.2']); k.shelf(108, 70, 40, 'bottles', ['gold.2', 'sky.2']);
    k.vignette('violet.2', 34);
    k.tiles(HZ, 'white', 'violet.3', 16); k.floorShadow();
    k.rug(128, 236, 50, 9, 'violet.2', 'pink.3');
    for (const x of [66, 190]) k.lightPool(x, HZ + 36, 28, 7, 'white');
    for (const x of [66, 190]) { k.shadow(x, 204, 18); k.prop('stylingChair', x, 204, { accent: 'pink', stone: 'slate', flip: x > 128 }); }
    k.shadow(128, 196, 14); k.prop('hoodDryer', 128, 196, { wall: 'cream', accent: 'violet', stone: 'slate' });
    k.layer('front');
    k.plant(16, 262, 1.1, 'green.2', 'violet.2', 13);
    k.shadow(240, 262, 14); k.prop('towels', 240, 262, { accent: 'pink', wall: 'cream', glass: 'sky' });
    k.layer('back');
  },
  school(k) {
    k.wall('lime.3', 'cream.3', 'bricks', { wainscot: 'brown.2' });
    k.block(50, 22, 156, 76, 'brown.2'); k.flat(56, 28, 144, 62, 'green.0', 'green.0'); k.dither(56, 28, 144, 62, C('green.1'), 1);
    k.sign(84, 36, 'ABC', { fg: 'white', bg: 'green.0', board: false }); k.sign(90, 50, '1+2=3', { fg: 'gold.3', bg: 'green.0', board: false });
    k.sign(88, 64, 'HELLO!', { fg: 'pink.3', bg: 'green.0', board: false }); k.heart(118, 67, 'pink.3', 2);
    for (let i = 0; i < 4; i++) k.puff(150 + i * 10, 52, 3, ['pink.2', 'sky.2', 'gold.2', 'white'][i]);
    k.line(140, 70, 186, 70, 'white'); k.rect(62, 90, 36, 3, 'white');
    k.clock(228, 36, 10);
    for (let x = 0; x < 48; x++) k.set(x, 7 + Math.round(Math.sin((x / 48) * Math.PI) * 3), 'brown.1');
    [...'ABCDE'].forEach((ch, i) => { const x = 6 + i * 9, y = 9 + Math.round(Math.sin(((x + 3) / 48) * Math.PI) * 3); k.sign(x + 3, y + 2, ch, { bg: ['red.1', 'gold.1', 'sky.1', 'green.1', 'violet.1'][i], pad: 2 }); });
    k.shelf(6, 110, 38, 'books', ['red.2', 'sky.2', 'gold.2', 'green.2', 'violet.2']);
    k.shadow(228, 160, 10); k.prop('globe', 228, 160, { glass: 'sky', leaf: 'green', accent: 'gold' });
    k.vignette('lime.1', 30);
    k.planks(HZ, 'gold.2'); k.floorShadow();
    k.rug(128, 230, 46, 9, 'sky.2', 'white');
    k.lightPool(128, HZ + 30, 70, 10, 'gold.3');
    for (const x of [18, 186]) { k.shadow(x + 26, 244, 30); k.prop('desk', x + 26, 244, { accent: x < 128 ? 'red' : 'violet', glass: 'sky' }); }
    k.layer('front');
    k.plant(240, 262, 1.1, 'green.2', 'red.2', 17);
    k.shadow(18, 262, 13); k.prop('backpack', 18, 262, { accent: 'sky', wall: 'gold' });
    k.layer('back');
  },
  work(k) {
    k.wall('slate.3', 'slate.2', 'bricks');
    k.pictureFrame(18, 92, 30, 22, 'blue.2'); for (let i = 0; i < 4; i++) k.rect(22, 98 + i * 4, 20 - i * 3, 1, 'white');
    k.prop('pegboard', 142, 86, { wood: 'brown', stone: 'slate', accent: 'red', wall: 'cream' });
    const gear = (cx, cy, r, c) => { for (let a = 0; a < 10; a++) k.disc(cx + Math.cos(a * Math.PI / 5) * r, cy + Math.sin(a * Math.PI / 5) * r, 4, c); k.disc(cx, cy, r, c, { outline: dk(c, 2), shade: true }); k.disc(cx, cy, r / 3, 'slate.3', { outline: dk(c, 2) }); };
    gear(222, 62, 18, 'slate.1'); gear(232, 104, 11, 'gold.2');
    k.disc(222, 62, 11, 'slate.2'); k.face(222, 60, 1, { gap: 5, cheek: 'pink.3' });
    k.sign(142, 10, 'WORKSHOP', { bg: 'brown.1', pad: 2 });
    k.rect(64, 0, 1, 96, 'ink'); k.prop('pendantLamp', 64, 108, { accent: 'slate', glass: 'gold' }); // work lamp
    k.vignette('slate.1', 36);
    k.planks(HZ, 'slate.2'); k.floorShadow();
    k.beam(20, HZ, 40, 240, 'white', 0.3); k.lightPool(64, HZ + 30, 34, 8, 'gold.3');
    k.shadow(134, HZ + 16, 26); k.prop('sawhorse', 134, HZ + 16, { wall: 'gold' });
    k.shadow(56, 246, 50); k.prop('workbench', 56, 248);
    k.prop('toyRobot', 80, 198, { stone: 'slate', accent: 'red' }); k.prop('toolbox', 34, 198, { accent: 'sky' });
    k.layer('front');
    for (const [x, y, f] of [[228, 264, false], [252, 264, true], [240, 242, false]]) k.prop('crate', x, y, { wall: 'gold', flip: f });
    k.shadow(18, 262, 14); k.prop('toolbox', 18, 262, { accent: 'red' });
    k.layer('back');
  },
  chapel(k) {
    k.wall('white', 'pink.3', 'stripes');
    k.prop('stainedGlass', 128, 122, { wall: 'gold', accent: 'pink', glass: 'sky', leaf: 'mint', roof: 'violet' });
    k.starString(0, { sag: 10, every: 26, string: 'pink.2', colors: ['pink.2', 'white', 'red.2'], hearts: true });
    // a flower arch over the altar
    for (let a = 0; a <= 20; a++) { const t = a / 20 * Math.PI; k.puff(128 - Math.cos(t) * 60, 150 - Math.sin(t) * 40, 5, a % 3 ? 'pink.3' : 'white', { line: 'pink.1' }); if (a % 4 === 2) k.puff(128 - Math.cos(t) * 60, 150 - Math.sin(t) * 40, 3, 'green.2'); }
    for (const x of [30, 226]) { k.shadow(x, HZ + 2, 12); k.prop('flowerStand', x, HZ + 2, { wall: 'gold', accent: 'pink', flip: x > 128 }); }
    k.vignette('pink.2', 34);
    k.planks(HZ, 'pink.3'); k.floorShadow();
    // coloured light from the window
    for (const [x, c] of [[98, 'pink.2'], [116, 'violet.3'], [134, 'gold.3'], [152, 'mint.3']]) k.lightPool(x, HZ + 18, 10, 5, c);
    for (let y = HZ; y < RH; y++) {
      const half = 10 + (y - HZ) * 0.3;
      k.rect(128 - half, y, half * 2, 1, 'red.1'); k.rect(128 - half + 3, y, half * 2 - 6, 1, 'red.2');
      k.set(128 - half, y, 'gold.1'); k.set(128 - half + 1, y, 'gold.3'); k.set(128 + half - 1, y, 'gold.1'); k.set(128 + half - 2, y, 'gold.2');
    }
    for (let i = 0; i < 14; i++) { const y = HZ + 12 + i * 9, x = 128 + Math.sin(i * 2.3) * (6 + i * 1.5); k.set(x, y, 'pink.3'); k.set(x + 1, y, 'white'); }
    for (let i = 0; i < 16; i++) k.set(122 + (i * 7) % 14, HZ + 8 + i * 8, 'pink.3');
    for (const x of [4, 182]) for (let r = 0; r < 2; r++) k.prop('pew', x + 35, 207 + r * 34);
    k.layer('front');
    for (const x of [16, 240]) { k.shadow(x, 262, 13); k.prop('flowerUrn', x, 262, { wall: 'cream', accent: 'pink', flip: x > 128 }); }
    k.layer('back');
  },
  studio(k) {
    k.rect(0, 0, RW, RH, 'slate.0');
    for (let x = 0; x < RW; x += 12) k.rect(x, 0, 6, HZ, 'slate.1');
    k.block(46, 14, 164, 160, 'sky.3', { outline: 'slate.0' });
    for (let y = 120; y < 216; y++) k.rect(47, y, 162, 1, y > 174 ? ((y & 1) ? 'sky.3' : 'mist') : 'sky.3');
    k.dither(47, 150, 162, 24, C('mist'));
    k.rect(40, 10, 176, 6, 'slate.2');
    k.bulbs(46, 14, 46, 174, 8); k.bulbs(209, 14, 209, 174, 8); k.bulbs(46, 14, 209, 14, 8);
    k.sign(128, 2, '★ PHOTO ★', { bg: 'red.1', pad: 2 });
    // a painted backdrop: soft clouds over rolling pastel hills
    k.pcloud(56, 40, 56, 'violet.3', 0.8); k.pcloud(140, 28, 60, 'pink.3', 0.8);
    for (let x = 47; x < 209; x++) {
      const h1 = 150 + Math.round(Math.sin((x - 40) / 22) * 7), h2 = 160 + Math.round(Math.sin((x - 10) / 15) * 5);
      for (let y = h1; y < 174; y++) k.set(x, y, y === h1 ? 'mint.1' : y < h1 + 3 ? 'mint.3' : 'mint.2');
      for (let y = h2; y < 174; y++) k.set(x, y, y === h2 ? 'green.1' : y < h2 + 2 ? 'lime.3' : 'lime.2');
    }
    for (const [x, y] of [[80, 70], [178, 62], [118, 84]]) k.star5(x, y, 4, 'white'); // backdrop decals
    k.rect(0, 216, RW, RH - 216, 'slate.1');
    for (const x of [20, 236]) { k.shadow(x, 222, 14, 'slate.0'); k.prop('softbox', x, 222, { stone: 'slate' }); }
    k.lightPool(128, 216, 70, 10, 'white');
    k.shadow(128, 224, 16, 'slate.0'); k.prop('stool', 128, 224, { accent: 'red', stone: 'slate' });
    k.prop('camera', 128, 222, { stone: 'slate', glass: 'sky' });
    k.layer('front');
    k.plant(242, 262, 1.2, 'green.2', 'gold.2', 19);
    k.shadow(16, 264, 12, 'slate.0'); k.prop('reflector', 16, 264, { stone: 'slate' });
    k.layer('back');
  },
  // ---- seaside & country ----
  beach(k) {
    k.bands(['sky.1', 'sky.2', 'sky.3'], 0, 92);
    for (let j = -26; j <= 26; j++) for (let i = -26; i <= 26; i++) { const d = i * i + j * j; if (d < 676 && d > 230 && ((i + j) & 1) === 0 && (d < 420 || ((i * 3 + j) & 3) === 0)) k.set(212 + i, 30 + j, 'white'); } // a soft glow
    k.sun(212, 30, 14);
    k.pcloud(20, 40, 70, 'pink.3'); k.pcloud(124, 58, 48, 'violet.3', 0.8);
    // the sea, deeper toward the horizon
    k.rect(0, 92, RW, 6, 'blue.2'); k.rect(0, 98, RW, 22, 'sky.1'); k.rect(0, 120, RW, 30, 'sky.2');
    for (let y = 96, r = 0; y < 148; y += 5 + r, r++) for (let x = (y * 7) % 30; x < RW; x += 30) { k.rect(x, y, 6 + r * 2, 1, 'sky.3'); }
    for (let i = 0; i < 14; i++) k.sparkle((i * 43) % RW, 104 + (i * 17) % 40);
    k.ellipse(70, 96, 22, 4, 'gold.2'); k.rect(66, 84, 2, 10, 'brown.1'); k.ellipse(67, 84, 8, 3, 'green.2'); // a little island
    // sand
    k.field(148, 'gold.3', { seed: 6, light: 'cream.3', deep: 'gold.2', flowers: ['pink.3', 'white', 'sky.3'], strokes: 90 });
    k.rect(0, 148, RW, 6, 'gold.2'); k.dither(0, 154, RW, 3, C('gold.2')); // wet sand by the water
    for (let x = 0; x < RW; x++) { const y = 148 + Math.round(Math.sin(x / 15) * 2); k.set(x, y, 'white'); k.set(x, y - 1, 'sky.3'); k.set(x, y + 1, 'sky.3'); if ((x & 1) === 0) k.set(x, y + 3, 'white'); }
    // a palm tree
    k.shadow(40, 204, 30, 'gold.1');
    k.prop('palm', 38, 206);
    // a beach umbrella and towel
    k.shadow(206, 206, 34, 'gold.1');
    k.rect(204, 144, 3, 64, 'white');
    for (let j = 0; j < 16; j++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - ((16 - j) / 16) ** 2)) * 34); for (let i = -half; i < half; i++) k.set(206 + i, 128 + j, Math.floor((i + 34) / 11) % 2 ? 'white' : 'red.2'); }
    k.rect(172, 144, 68, 1, 'red.0');
    k.prop('beachTowel', 172, 229, { accent: 'sky' });
    // a sandcastle in its moat, a smiling starfish and a signpost
    k.blob(114, 186, 22, 5, 'sky.2', { seed: 6, line: 'gold.1', wob: 0.15 });
    k.prop('sandcastle', 114, 188, { wall: 'gold', accent: 'red' });
    k.star5(140, 204, 6, 'orange.2'); k.face(140, 203, 1, { gap: 2, cheek: 'pink.3' });
    k.signpost(150, 168, 'BEACH');
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
    k.field(128, 'green.2', { seed: 8, light: 'green.3', flowers: ['white', 'violet.3'] });
    k.blob(118, 178, 104, 40, 'green.3', { seed: 5, line: null, shade: false, wob: 0.15 }); // the sunny glade
    k.mottle(130, 160, 'green.1', 6, 7);
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
    for (let a = 0; a < 11; a++) { const j = rnd(), x = 104 + Math.cos(a * 0.571 + j * 0.2) * (32 + j * 4), y = 176 + Math.sin(a * 0.571) * 9; k.mushroom(Math.round(x), Math.round(y), j < 0.3 ? 'pink.2' : 'red.2'); }
    // a mossy log, ferns, flowers and fireflies
    k.blob(32, 210, 30, 4, 'green.1', { seed: 12, line: null, shade: false });
    k.prop('log', 30, 208); k.prop('bushC', 18, 200, { leaf: 'green' });
    const fern = (x, y, c = 'green.1') => k.prop('fern', x, y, { leaf: rampOf(c), flip: x % 2 === 1 });
    fern(150, 206); fern(162, 212, 'lime.2'); fern(244, 196); k.prop('stump', 92, 152);
    k.flowerPatch(128, 214, 5, ['violet.2', 'white']); k.flowerPatch(76, 152, 4, ['white', 'gold.2']);
    k.rocks(176, 214, 2, 'slate.3');
    k.signpost(146, 166, 'WOODS', 'brown.0');
    for (let i = 0; i < 18; i++) { const x = rnd() * RW, y = 70 + rnd() * 140; k.set(x, y, 'gold.3'); k.set(x + 1, y, 'lime.3'); }
    k.layer('front');
    k.canopy(-30, 200, 76, 64, 'green.1', { seed: 91, r: 13 }); fern(30, 252, 'green.0');
    k.canopy(214, 208, 70, 56, 'green.1', { seed: 92, r: 12 }); fern(236, 254, 'green.2');
    k.layer('back');
  },
  fair(k) {
    k.bands(['sky.2', 'pink.3', 'gold.3'], 0, HZ);
    k.pcloud(150, 24, 60, 'pink.2'); k.pcloud(14, 150, 40, 'violet.3', 0.7);
    k.canopy(110, 118, 60, 46, 'green.2', { seed: 25, r: 9 });
    for (const [x, l] of [[104, 'green'], [118, 'mint'], [160, 'green']]) k.prop('coneTree', x, HZ, { leaf: l, halo: 'white' });
    // ferris wheel
    const cx = 64, cy = 88, R = 54;
    k.disc(cx, cy, R, 'pink.3', { outline: 'red.1' }); k.disc(cx, cy, R - 4, 'pink.3', { outline: 'red.2' });
    for (let a = 0; a < 12; a++) {
      const ex = cx + Math.cos(a * Math.PI / 6) * (R - 2), ey = cy + Math.sin(a * Math.PI / 6) * (R - 2);
      k.line(cx, cy, ex, ey, 'red.1');
      if (a % 2 === 0) k.prop('cabin', ex, ey + 15, { accent: ['sky', 'gold', 'mint', 'violet', 'red', 'blue'][a / 2], roof: ['red', 'violet', 'red', 'gold', 'violet', 'red'][a / 2], glass: 'sky' });
    }
    for (let a = 0; a < 36; a++) { const t = (a / 36) * Math.PI * 2; k.bulbs(cx + Math.cos(t) * R, cy + Math.sin(t) * R, cx + Math.cos(t) * R, cy + Math.sin(t) * R, 6, [a % 2 ? 'gold.3' : 'pink.3']); }
    k.disc(cx, cy, 6, 'gold.2', { outline: 'gold.0' }); k.face(cx, cy - 1, 1, { gap: 3 });
    k.line(cx - 4, cy, cx - 24, HZ, 'slate.1'); k.line(cx + 4, cy, cx + 24, HZ, 'slate.1'); k.line(cx - 3, cy, cx - 23, HZ, 'slate.2'); k.line(cx + 3, cy, cx + 23, HZ, 'slate.2');
    // coaster track on stilts
    for (let x = 134; x < RW; x++) {
      const y = 70 + Math.round(Math.sin((x - 134) / 17) * 28);
      k.rect(x, y, 1, 2, 'sky.1'); k.set(x, y + 4, 'sky.1');
      if (x % 10 === 0) { k.rect(x, y + 4, 2, HZ - y - 4, 'slate.2'); k.set(x, y + 4, 'slate.0'); }
    }
    k.prop('coasterCar', 207, 47, { accent: 'red', wall: 'gold' });
    k.field(HZ, 'green.3', { seed: 10, light: 'lime.3' });
    k.trail(HZ, RH, (y) => 128 + Math.sin((y - HZ) / 26) * 10, (y) => 22 + (y - HZ) * 0.5, 'pink.3', { seed: 9, pebbles: false });
    k.stringLights(12, 10);
    // striped tents with bell roofs and scalloped trims, and a popcorn cart
    for (const [x, c] of [[176, 'red'], [230, 'sky']]) {
      k.blob(x + 4, HZ + 4, 28, 4, 'green.2', { seed: x, line: null, shade: false });
      k.prop('tent', x, HZ + 2, { accent: c, wall: 'cream', flip: x > 200 });
    }
    k.shadow(26, 228, 20); k.prop('popcornCart', 26, 228, { accent: 'red', glass: 'sky' }); k.sign(26, 158, 'POP', { bg: 'red.1', pad: 2 });
    k.layer('front');
    k.prop('balloons', 234, 240, { accent: 'red', glass: 'sky', wall: 'gold', leaf: 'mint' });
    k.frame('left', 'green', { seed: 26, tall: false });
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
    k.bulbs(49, 32, 49, HZ + 6, 8); k.bulbs(RW - 50, 32, RW - 50, HZ + 6, 8); k.bulbs(49, 32, RW - 50, 32, 8);
    k.sign(128, 36, '★ SHOWTIME ★', { fg: 'gold.3', bg: 'red.0', pad: 3 });
    k.rect(0, 0, RW, 16, 'red.1'); for (let x = 0; x < RW; x += 16) { k.ellipse(x + 8, 16, 8, 6, 'red.1', { outline: 'red.0' }); k.rect(x + 7, 20, 2, 6, 'gold.2'); k.puff(x + 8, 27, 2, 'gold.2'); }
    k.rect(0, 0, RW, 3, 'gold.2'); k.rect(0, 3, RW, 1, 'gold.0');
    k.planks(HZ, 'brown.2');
    for (const cx of [86, 170]) k.lightPool(cx, HZ + 20, 34, 9, 'gold.3');
    k.block(0, HZ + 34, RW, 10, 'brown.1'); for (let x = 12; x < RW; x += 28) { k.puff(x, HZ + 38, 3, 'gold.3'); }
    k.shadow(128, 226, 9); k.prop('mic', 128, 226, { stone: 'slate', accent: 'red' });
    k.rect(0, HZ + 44, RW, RH - HZ - 44, 'indigo.0');
    k.layer('front');
    // the audience: hand-pixelled fans seen from behind, with bows, ear tufts and glow sticks
    const fans = ['fanA', 'fanB', 'fanC'];
    for (let r = 0; r < 2; r++) for (let x = r * 13 - 4, i = 0; x < RW + 14; x += 26, i++) {
      const y = 256 + r * 16;
      if ((i + r) % 3 !== 1) { // someone's sitting here
        const hx = x + (i % 2 ? 1 : -1);
        k.prop(fans[(i + r * 2) % 3], hx, y - 14, { accent: r ? 'indigo' : 'violet', roof: i % 2 ? 'pink' : 'red', glass: ['sky', 'mint', 'gold'][i % 3], flip: i % 2 === 1 });
      }
      k.prop('theatreSeat', x, y, { accent: 'red', wall: 'gold', wood: 'brown' });
    }
    k.layer('back');
  },
  // ---- far away ----
  castle(k) {
    k.bands(['violet.3', 'pink.3', 'pink.3'], 0, 110);
    k.pcloud(0, 30, 70, 'violet.3'); k.pcloud(184, 50, 70, 'pink.3'); k.pcloud(110, 20, 40, 'violet.3', 0.8);
    k.mountain(30, 110, 120, 30, 'violet.3'); k.mountain(226, 110, 120, 36, 'violet.3');
    k.field(106, 'green.3', { seed: 12, light: 'lime.3', flowers: ['white', 'violet.3', 'pink.3'] }); k.tufts(120, 270, 'green.2', 30, 9);
    // the castle on its hill
    const B = 124;
    k.prop('keep', 128, B, { accent: 'red', glass: 'gold' });
    for (const x of [58, 198]) { k.prop('tower', x, B, { roof: 'violet', glass: 'gold' }); k.rect(x, B - 124, 1, 8, 'ink'); k.rect(x + 1, B - 124, 8, 4, 'red.2'); }
    k.shadow(128, B + 2, 70, 'green.2');
    // a winding path down to you
    k.trail(B, RH, (y) => 128 + Math.sin((y - B) / 30) * 18, (y) => 10 + (y - B) * 0.2, 'cream.3', { seed: 13 });
    k.canopy(0, 96, 56, 40, 'green.2', { seed: 11, r: 10 }); k.canopy(200, 92, 58, 44, 'green.2', { seed: 12, r: 10 });
    k.signpost(108, 152, 'CASTLE');
    k.prop('flowerBed', 40, 180, { accent: 'violet' }); k.prop('flowerBed', 214, 184, { accent: 'red' }); k.flowerPatch(66, 214, 4, ['pink.2']);
    k.layer('front');
    k.frame('left', 'green', { seed: 13 }); k.frame('right', 'green', { seed: 14 });
    k.layer('back');
  },
  starisle(k) {
    // twilight among the stars: a wishing shrine on a floating meadow
    k.bands(['indigo.1', 'violet.1', 'violet.2', 'pink.2', 'pink.3'], 0, 156);
    for (let i = 0; i < 60; i++) { const x = (i * 71) % RW, y = (i * 43) % 120; if (i % 4) k.set(x, y, i % 3 ? 'white' : 'gold.3'); else k.sparkle(x, y); }
    // aurora ribbons
    for (let x = 0; x < RW; x++) for (let j = 0; j < 10; j++) { const y = 46 + Math.sin(x / 26) * 10 + j - x * 0.05; if (((x + j) & 1) === 0) k.set(x, y, j < 4 ? 'mint.3' : 'sky.3'); }
    // a big moon with craters, and two little floating islands
    k.disc(52, 40, 20, 'gold.3', { outline: 'gold.2', shade: true }); k.disc(40, 30, 2, 'gold.2'); k.disc(62, 30, 3, 'gold.2'); k.disc(64, 50, 2, 'gold.2');
    k.face(52, 41, 1, { ink: 'orange.1', cheek: 'pink.3', mouth: 'orange.2' });
    k.starString(0, { sag: 12, x0: 86, x1: RW + 4, every: 34, string: 'violet.3' });
    for (const [x, y, w] of [[220, 92, 30], [28, 122, 22]]) {
      k.blob(x, y + 6, w / 2, w / 3, 'violet.2', { seed: x, wob: 0.25 }); // the rocky underside
      k.blob(x, y, w / 2 + 1, 4, 'mint.2', { seed: x + 1, wob: 0.1, line: 'mint.0' });
      k.puff(x - w / 5, y - 3, 3, 'green.2'); k.star5(x + 3, y - 7, 3, 'gold.3');
    }
    // the meadow you stand on
    k.field(150, 'mint.2', { seed: 14, light: 'mint.3', deep: 'mint.1', flowers: ['white', 'pink.3', 'sky.3'] });
    // the island ends in a rocky cliff, with pastel clouds drifting below it
    k.rect(0, 250, RW, RH - 250, 'indigo.0');
    for (let i = 0; i < 24; i++) k.star((i * 47) % RW, 262 + (i * 29) % 48, i % 3 ? 'violet.2' : 'gold.3');
    k.pcloud(-10, 296, 80, 'violet.2'); k.pcloud(150, 302, 90, 'pink.2');
    // a rocky face of shaded boulders under the meadow's edge
    for (let x = -6, i = 0; x < RW + 8; i++) { const r = 8 + (i * 5) % 6; k.blob(x, 250 + (i % 2) * 3, r, r * 0.8, i % 3 ? 'violet.2' : 'violet.1', { seed: i + 70, wob: 0.2 }); x += r * 1.3; }
    for (let x = 0; x < RW; x++) { const e = 244 + Math.round(Math.sin(x / 17) * 3 + Math.sin(x / 6)); k.set(x, e, 'mint.1'); k.set(x, e + 1, 'mint.0'); }
    k.tufts(156, 236, 'mint.1', 28, 5);
    // crystal clusters at the back
    for (const [cx, cy, s] of [[24, 158, 1], [238, 160, 1.2], [90, 156, 0.7]]) for (const [dx, h] of [[-6, 16], [0, 26], [7, 18]]) for (let j = 0; j < h * s; j++) { const half = Math.max(1, Math.round((1 - j / (h * s)) * 4 * s)); k.rect(cx + dx * s - half, cy - j, half * 2, 1, j > h * s * 0.7 ? 'white' : dx < 0 ? 'sky.3' : 'violet.3'); k.set(cx + dx * s + half - 1, cy - j, 'blue.1'); }
    // stepping stones to the shrine
    for (let i = 0; i < 6; i++) k.ellipse(128 + Math.sin(i) * 8, 246 - i * 16, 10 - i, 4 - i * 0.4, 'slate.3', { outline: 'slate.1' });
    // the wishing shrine and its glowing star
    k.shadow(128, 154, 40, 'mint.1');
    k.prop('shrine', 128, 150, { stone: 'slate', wall: 'violet', accent: 'gold' });
    for (let j = -24; j <= 24; j++) for (let i = -24; i <= 24; i++) if (i * i + j * j < 560 && ((i + j) & 1) === 0) k.set(128 + i, 84 + j, j < 0 ? 'gold.3' : 'pink.3');
    k.star5(128, 84, 14, 'gold.3');
    for (const dx of [-20, 20]) { k.sparkle(128 + dx, 70); }
    // star lanterns and glowing flowers
    for (const x of [62, 194]) { k.lightPool(x, 170, 14, 4, 'gold.3'); k.prop('starLantern', x, 171, { wall: 'gold', stone: 'slate' }); }
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
    k.field(136, 'lime.2', { seed: 16, light: 'lime.3', deep: 'green.2' }); k.tufts(142, 270, 'green.2', 30, 11);
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
    k.shadow(78, 178, 30, 'green.1'); k.prop('mushroomHouse', 78, 178, { accent: 'red' });
    k.shadow(184, 174, 26, 'green.1'); k.prop('mushroomHouse', 184, 174, { accent: 'orange', flip: true });
    // a campfire with log seats
    k.shadow(128, 186, 30, 'green.1'); k.lightPool(128, 184, 40, 10, 'gold.3');
    k.prop('campfire', 128, 190, { glass: 'orange', stone: 'slate', wood: 'brown', wall: 'cream' });
    for (const [x, f] of [[96, false], [160, true]]) { k.shadow(x, 198, 16, 'green.1'); k.prop('log', x, 198, { flip: f }); }
    for (let i = 0; i < 16; i++) { const x = (i * 59) % RW, y = 100 + (i * 23) % 110; k.set(x, y, 'gold.3'); k.set(x + 1, y, 'lime.3'); }
    k.layer('front');
    k.mushroom(14, 246, 'orange.2'); k.mushroom(32, 254, 'red.2');
    k.mushroom(242, 248, 'pink.2'); k.mushroom(226, 256, 'orange.2');
    k.layer('back');
  },
  // ---- scenes that aren't places: the games field, the family scenes, photo backdrops, the trip, a farewell ----
  playfield(k) {
    // sports day on a meadow: flags overhead, a striped tent and a popcorn cart at the back; the pets play lower down (y 260)
    k.bands(['sky.2', 'sky.2', 'sky.3'], 0, 140);
    k.sun(224, 62, 11);
    k.pcloud(8, 48, 76, 'violet.3'); k.pcloud(112, 60, 60, 'pink.3', 0.9); k.pcloud(64, 92, 40, 'violet.3', 0.8);
    k.horizonClouds(118, 'violet.3', 7);
    k.mountain(64, 136, 180, 30, 'sky.1', { seed: 21 }); k.mountain(204, 136, 150, 22, 'mint.2', { seed: 22 });
    k.mist(124, 12, 'sky.3');
    k.canopy(-24, 112, 304, 34, 'mint.1', { seed: 33, r: 9 });
    k.field(138, 'green.3', { seed: 6, light: 'lime.3' });
    k.mottle(140, 158, 'mint.2', 5, 9);
    k.tufts(146, 300, 'green.2', 44, 4);
    k.bunting(32, 12);
    k.tree(16, 174, 1.05, 'green.2', { seed: 3 }); k.bush(38, 180, 'lime.2', 9, 5);
    k.tree(242, 170, 1.1, 'green.2', { seed: 9 });
    k.shadow(66, 178, 22, 'green.1'); k.prop('tent', 66, 178, { accent: 'pink', wall: 'cream' });
    k.shadow(196, 180, 18, 'green.1'); k.prop('popcornCart', 196, 180, { accent: 'red' });
    k.prop('balloons', 222, 178);
    k.flowerPatch(108, 170, 5, ['gold.2', 'white']); k.flowerPatch(150, 174, 6, ['pink.2', 'violet.2']);
    // a chalk ring to play in
    for (let a = 0; a < 360; a += 2) if (Math.floor(a / 8) % 2 === 0) { const r = (a * Math.PI) / 180; k.set(128 + Math.cos(r) * 112, 264 + Math.sin(r) * 30, 'white'); }
    k.rocks(14, 232, 2); k.flowerPatch(236, 236, 5, ['white', 'pink.2']);
  },
  ropefield(k) {
    SCENES.playfield(k);
    for (const x of [23, 235]) { k.shadow(x, 260, 9, 'green.1'); k.prop('ropePost', x, 260); }
  },
  matchmaker(k) {
    // the matchmaker's parlour: rosy paper, a garland of hearts, two windows and a framed heart; the pets meet on the rug (y 184)
    k.wall('pink.3', 'white', 'dots', { wainscot: 'pink.2' });
    k.prop('window', 54, 128, { accent: 'red' }); k.prop('window', 202, 128, { accent: 'red', flip: true });
    k.prop('heartFrame', 128, 112, { roof: 'gold', accent: 'red' });
    k.starString(26, { sag: 10, every: 26, string: 'pink.1', colors: ['red.2', 'white', 'pink.2'], hearts: true });
    k.vignette('pink.2', 34);
    k.tiles(HZ, 'white', 'pink.3'); k.floorShadow('pink.1');
    k.rug(128, 190, 100, 12, 'red.2', 'pink.2');
    for (const x of [16, 240]) { k.shadow(x, 180, 12, 'pink.1'); k.prop('flowerStand', x, 180, { wall: 'gold', accent: 'pink', flip: x > 128 }); }
    k.prop('balloons', 128, 172, { accent: 'red' });
  },
  // four painted backdrops for the photo studio and the family album (the picture shows x 36-220, y 44-188)
  photo0(k) {
    k.bands(['sky.2', 'sky.3', 'sky.3'], 0, 160);
    k.pcloud(40, 60, 60, 'violet.3', 0.9); k.pcloud(136, 80, 70, 'pink.3');
    k.mountain(90, 160, 150, 30, 'mint.2', { seed: 5 }); k.mountain(190, 160, 120, 22, 'sky.1', { seed: 6 });
    k.field(156, 'green.3', { seed: 3, light: 'lime.3' });
    k.tree(206, 172, 0.8, 'green.2', { seed: 4 });
    k.flowerPatch(58, 180, 6); k.flowerPatch(186, 184, 5, ['gold.2', 'white']);
  },
  photo1(k) {
    k.wall('pink.3', 'white', 'diamonds');
    k.starString(44, { sag: 8, x0: 30, x1: 226, every: 28, string: 'pink.1', colors: ['red.2', 'white', 'pink.2'], hearts: true });
    for (const [x, y, c, r] of [[62, 108, 'pink.2', 6], [196, 100, 'red.2', 5], [102, 132, 'white', 3], [160, 138, 'pink.2', 4]]) k.heart(x, y, c, r);
    k.planks(HZ, 'pink.3'); k.floorShadow('pink.1');
    k.prop('balloons', 198, 184); k.prop('giftBox', 58, 184);
  },
  photo2(k) {
    k.bands(['violet.3', 'pink.3', 'gold.3', 'gold.3'], 0, 160);
    k.sun(128, 100, 15);
    k.pcloud(38, 70, 56, 'pink.2', 0.9); k.pcloud(162, 62, 60, 'violet.2', 0.9);
    k.mountain(70, 160, 130, 24, 'violet.2', { seed: 8 }); k.mountain(196, 160, 110, 18, 'pink.2', { seed: 9 });
    k.field(156, 'gold.3', { seed: 5, light: 'cream.3', deep: 'gold.2', flowers: ['white', 'pink.3'] });
    k.prop('palm', 204, 186); k.prop('sandcastle', 60, 184);
  },
  photo3(k) {
    k.bands(['indigo.1', 'violet.1', 'violet.2', 'pink.2'], 0, 160);
    for (let i = 0; i < 40; i++) { const x = (i * 71) % RW, y = 44 + (i * 43) % 100; if (i % 4) k.set(x, y, i % 3 ? 'white' : 'gold.3'); else k.sparkle(x, y); }
    k.disc(72, 78, 14, 'gold.3', { outline: 'gold.2', shade: true }); k.disc(66, 72, 2, 'gold.2'); k.disc(79, 84, 2, 'gold.2');
    k.face(72, 79, 1, { ink: 'orange.1', cheek: 'pink.3', mouth: 'orange.2', gap: 4 });
    k.field(156, 'mint.2', { seed: 14, light: 'mint.3', deep: 'mint.1', flowers: ['white', 'pink.3', 'sky.3'] });
    for (const x of [54, 202]) { k.lightPool(x, 184, 14, 4, 'gold.3'); k.prop('starLantern', x, 185, { wall: 'gold', stone: 'slate' }); }
  },
  trip(k) {
    // the open country between districts: far peaks and a tree line; the road, track or path slides by in front (y 224)
    k.bands(['sky.2', 'sky.2', 'sky.3'], 0, 190);
    k.sun(40, 62, 12);
    k.horizonClouds(160, 'violet.3', 4);
    k.mountain(64, 194, 200, 50, 'sky.1', { seed: 31, snow: true }); k.mountain(204, 194, 170, 36, 'mint.2', { seed: 32 });
    k.mist(178, 14, 'sky.3');
    k.canopy(-24, 172, 304, 34, 'mint.1', { seed: 43, r: 9 });
    k.field(194, 'green.3', { seed: 8, light: 'lime.3' });
    k.tufts(250, 306, 'green.2', 30, 7);
  },
  tripSky(k) {
    // up among the clouds, the land small below
    k.bands(['sky.1', 'sky.2', 'sky.2', 'sky.3', 'sky.3'], 0, 290);
    for (const [x, y] of [[36, 70], [150, 44], [226, 130], [84, 170]]) k.sparkle(x, y);
    k.sun(214, 62, 13);
    k.horizonClouds(266, 'violet.3', 5);
    k.mountain(50, 304, 150, 28, 'mint.2', { seed: 51 }); k.mountain(190, 306, 180, 34, 'sky.1', { seed: 52, snow: true });
    k.canopy(-24, 296, 304, 26, 'green.2', { seed: 53, r: 6 });
  },
  farewell(k) {
    // a quiet hilltop under the stars
    k.bands(['indigo.0', 'indigo.0', 'indigo.0', 'indigo.1'], 0, 196);
    for (let i = 0; i < 70; i++) { const x = (i * 71) % RW, y = (i * 43) % 170; if (i % 5) k.set(x, y, i % 3 ? 'white' : 'gold.3'); else k.sparkle(x, y); }
    k.disc(204, 46, 16, 'gold.3', { outline: 'gold.2', shade: true }); k.disc(196, 38, 2, 'gold.2'); k.disc(212, 40, 3, 'gold.2'); k.disc(213, 56, 2, 'gold.2');
    k.pcloud(-14, 156, 96, 'indigo.2'); k.pcloud(168, 162, 100, 'indigo.2');
    // the hill, darker than the sky, with a pale rim of moonlight
    for (let x = 0; x < RW; x++) {
      const top = Math.round(188 - Math.cos((x - 128) / 150) * 14 + Math.sin(x / 9) * 1.2);
      k.rect(x, top, 1, RH - top, 'ink'); k.set(x, top, 'indigo.2'); if (x % 2) k.set(x, top + 1, 'indigo.0');
    }
    for (const [x, y, c] of [[40, 196, 'pink.2'], [214, 198, 'sky.3'], [150, 184, 'gold.3']]) { k.rect(x, y - 4, 1, 4, 'indigo.1'); k.star5(x, y - 6, 3, c); }
  },
};

// ---------------------------------------------------------------- travel
/**
 * A vehicle for the trip between districts: the hand-pixelled bus, train or
 * balloon, standing on (x, y) in normal pixels (x is its middle, y the ground).
 */
export function drawVehicle(scr, kind, x, y, t) {
  const put = (name, dx = 0, dy = 0, opts = {}) => { const bm = propBitmap(name, opts); scr.bitmap(bm, x + dx - bm.at[0] / 2, y + dy - (bm.at[1] + 1) / 2); };
  const bob = Math.floor(t / 150) % 2 ? 0.5 : 0;
  if (kind === 'bus') put('bus', 0, -bob);
  else if (kind === 'train') {
    // puffs of steam drift back from the stack
    for (let i = 0; i < 3; i++) { const p = ((t / 700) + i / 3) % 1; put('cloudC', 16 - p * 22, -26 - p * 12, { accent: 'slate' }); }
    put('trainCar', -14); put('trainEngine', 14, -bob);
  } else if (kind === 'balloon') put('balloon');
}
