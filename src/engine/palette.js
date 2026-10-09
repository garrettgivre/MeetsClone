// 64-colour master palette.
//   0        transparent
//   1..56    14 colour ramps x 4 shades (dark, mid, light, highlight)
//   57..63   neutrals (ink outline .. white)
// Ramps are generated with hue shifting (shadows lean cool, highlights lean warm)
// so every ramp reads like hand-picked pixel-art colours.

export const RAMPS = [
  // name,     hue, sat,  lightness per shade
  // Bright, pastel-leaning ramps in the spirit of colour-screen virtual pets.
  ['red',      354, 0.80, [0.40, 0.56, 0.71, 0.86]],
  ['orange',    26, 0.92, [0.42, 0.58, 0.72, 0.86]],
  ['gold',      46, 0.95, [0.44, 0.58, 0.72, 0.87]],
  ['lime',      82, 0.66, [0.38, 0.54, 0.70, 0.85]],
  ['green',    130, 0.52, [0.32, 0.48, 0.64, 0.80]],
  ['mint',     162, 0.55, [0.36, 0.54, 0.72, 0.87]],
  ['sky',      196, 0.78, [0.42, 0.60, 0.76, 0.89]],
  ['blue',     222, 0.72, [0.36, 0.54, 0.71, 0.86]],
  ['indigo',   246, 0.55, [0.32, 0.48, 0.66, 0.82]],
  ['violet',   280, 0.55, [0.38, 0.56, 0.72, 0.86]],
  ['pink',     332, 0.82, [0.48, 0.67, 0.80, 0.91]],
  ['brown',     24, 0.45, [0.26, 0.38, 0.52, 0.68]],
  ['cream',     40, 0.70, [0.56, 0.78, 0.89, 0.96]], // a deeper first shade so pale pets keep a readable outline
  ['slate',    228, 0.16, [0.36, 0.52, 0.68, 0.84]],
];

export const NEUTRALS = [
  ['ink',   '#262459'], // navy outlines and text
  ['shade', '#4b4a86'],
  ['gray',  '#6f6a80'],
  ['silver','#a9a5b8'],
  ['mist',  '#d8d5e2'],
  ['white', '#fbf8ff'],
  ['night', '#0d0a17'], // lights-off backdrop
];

export const RAMP_NAMES = RAMPS.map(r => r[0]);
export const SHADES = 4;

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// Shift toward blue/purple in shadows and toward yellow in highlights.
function shiftHue(h, shade) {
  const toward = (target, amt) => {
    let d = ((target - h + 540) % 360) - 180;
    return h + Math.sign(d) * Math.min(Math.abs(d), amt);
  };
  if (shade === 0) return toward(250, 14);
  if (shade === 2) return toward(55, 6);
  if (shade === 3) return toward(55, 12);
  return h;
}
const SAT_MUL = [0.85, 1, 0.95, 0.8];

function hex(rgb) { return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join(''); }
function parseHex(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }

export const COLORS = [[0, 0, 0, 0]]; // RGBA, index 0 transparent
export const NAMES = ['clear'];
for (const [name, hue, sat, ls] of RAMPS) {
  ls.forEach((l, s) => {
    COLORS.push([...hsl(shiftHue(hue, s), Math.min(1, sat * SAT_MUL[s]), l), 255]);
    NAMES.push(`${name}.${s}`);
  });
}
for (const [name, h] of NEUTRALS) { COLORS.push([...parseHex(h), 255]); NAMES.push(name); }
if (COLORS.length !== 64) throw new Error('palette must have 64 entries, has ' + COLORS.length);

const byName = new Map(NAMES.map((n, i) => [n, i]));

/** Palette index of a ramp shade (shade 0 = dark .. 3 = highlight). */
export function ramp(name, shade) { return 1 + RAMP_NAMES.indexOf(name) * SHADES + shade; }
/** Palette index by name: 'ink', 'white', 'pink.2', ... */
export function C(name) {
  const i = byName.get(name);
  if (i === undefined) throw new Error('unknown colour ' + name);
  return i;
}
export const HEX = COLORS.map(c => hex(c.slice(0, 3)));

// Packed 32-bit pixels for ImageData (little-endian ABGR).
export const PACKED = new Uint32Array(COLORS.map(([r, g, b, a]) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0));

/**
 * A table that maps every palette colour to a washed-out one: most of its
 * colour drained, and lifted toward `paper` (the colour it sits on). Sprites
 * drawn through it look greyed out, like a menu icon that isn't selected.
 */
export function mutedLut(paper = 'cream.3', drain = 1, lift = 0.3) {
  const MUTED_TONES = ['shade', 'gray', 'silver', 'mist', 'white', 'slate.0', 'slate.1', 'slate.2', 'slate.3'].map(C);
  const [pr, pg, pb] = COLORS[C(paper)];
  const lut = new Uint8Array(COLORS.length);
  for (let i = 1; i < COLORS.length; i++) {
    const [r, g, b] = COLORS[i];
    const grey = r * 0.3 + g * 0.59 + b * 0.11;
    const want = [r, g, b].map((v, k) => (v + (grey - v) * drain) * (1 - lift) + [pr, pg, pb][k] * lift);
    let best = i, bestD = Infinity;
    // only greys and the slate ramp, so nothing picks up a stray tint
    for (const j of MUTED_TONES) {
      const d = (COLORS[j][0] - want[0]) ** 2 + (COLORS[j][1] - want[1]) ** 2 + (COLORS[j][2] - want[2]) ** 2;
      if (d < bestD) { bestD = d; best = j; }
    }
    lut[i] = best;
  }
  return lut;
}

const ghosts = new Map();
/**
 * A table that makes a sprite look greyed out and a little see-through over a
 * flat background: each colour loses its colour (`drain`), is mixed part of the
 * way (`alpha`) toward how light or dark the background is, and lands on the
 * nearest grey. (Only greys: mixing toward the background's own colour gave
 * icons a green cast on the lawn.) `bg` is the background's palette index.
 * Used for menu icons that aren't selected.
 */
export function ghostLut(bg, alpha = 0.35, drain = 1) {
  const key = `${bg}|${alpha}|${drain}`;
  if (!ghosts.has(key)) {
    const greys = ['ink', 'shade', 'gray', 'silver', 'mist', 'white', 'slate.0', 'slate.1', 'slate.2', 'slate.3'].map(C);
    const light = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11, behind = light(COLORS[bg]);
    const lut = new Uint8Array(COLORS.length);
    for (let i = 1; i < COLORS.length; i++) {
      const [r, g, b] = COLORS[i];
      const grey = light(COLORS[i]);
      const want = [r, g, b].map(v => (v + (grey - v) * drain) * (1 - alpha) + behind * alpha);
      let best = i, bestD = Infinity;
      for (const j of greys) {
        const d = (COLORS[j][0] - want[0]) ** 2 + (COLORS[j][1] - want[1]) ** 2 + (COLORS[j][2] - want[2]) ** 2;
        if (d < bestD) { bestD = d; best = j; }
      }
      lut[i] = best;
    }
    ghosts.set(key, lut);
  }
  return ghosts.get(key);
}

/** A darkened copy of the palette for lights-off / night tinting. */
export function tinted(mulR, mulG, mulB) {
  return new Uint32Array(COLORS.map(([r, g, b, a]) =>
    ((a << 24) | (Math.round(b * mulB) << 16) | (Math.round(g * mulG) << 8) | Math.round(r * mulR)) >>> 0));
}
