// The three device buttons under the screen, as pixel art in the game's own
// palette: a gold dome with an ink outline, lit from the upper left, standing
// on its darker side (UP), and pushed in (DOWN). The grids here are the art,
// typed by hand at the fine size (64 x 72, one character to a fine pixel, with
// a one-pixel outline like everything else on screen): edit them by hand.
import { COLORS, C } from '../engine/palette.js';

const KEY = { o: 'ink', u: 'gold.0', y: 'gold.1', x: 'gold.2', Y: 'gold.3', w: 'white' };

// The buttons take a deep colour that stands out from the ground they sit on
// (the owner: dark purple on yellow sand, dark magenta on green grass): the
// ground's ramp picks the button's, and the dome is painted from that ramp's
// two darkest shades, with two deeper ones mixed toward ink for its side.
export const CONTRAST = { gold: 'violet', cream: 'violet', orange: 'blue', lime: 'pink', green: 'pink', mint: 'red', sky: 'orange', blue: 'orange',
  indigo: 'gold', violet: 'gold', pink: 'green', red: 'mint', brown: 'sky', slate: 'red' };
const rgb = (name, k = 1) => { const [r, g, b] = COLORS[C(name)], [ir, ig, ib] = COLORS[C('ink')]; return `rgb(${[r * k + ir * (1 - k), g * k + ig * (1 - k), b * k + ib * (1 - k)].map(Math.round).join(',')})`; };
/** What each letter of the grids is painted in, for a button of a colour ramp (null: the gold the grids were drawn in). */
function inks(ramp) {
  if (!ramp) return Object.fromEntries(Object.entries(KEY).map(([ch, name]) => [ch, rgb(name)]));
  return { o: rgb('ink'), u: rgb(`${ramp}.0`, 0.45), y: rgb(`${ramp}.0`, 0.7), x: rgb(`${ramp}.0`), Y: rgb(`${ramp}.1`), w: rgb(`${ramp}.3`) };
}

const UP = [
  '..........................oooooooooooo',
  '......................ooooYYYYYYYYyyyyoooo',
  '....................ooYYYYYYYYYYYYYYyyyyyyoo',
  '..................ooYYYYYYxxxxxxxxxxxxyyyyyyoo',
  '................ooYYYYYxxxxxxxxxxxxxxxxxxyyyyyoo',
  '..............ooYYYYYxxxxxxxxxxxxxxxxxxxxxxyyyyyoo',
  '.............oYYYYxxxxxxYYYYYYYYYYYYYxxxxxxxxyyyyyo',
  '............oYYYYxxxxYYYYxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '...........oYYYYxxxYYYxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '..........oYYYYxxYYYxxxwwwwwwxxxxxxxxxxxxxxxxxxxyyyyyo',
  '.........oYYYYxxYYxxxwwwwwwwxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '........oYYYYxxYYxxxwwwwwxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '.......oYYYYxxYYxxxwwwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '......oYYYYxxYYxxxwwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '......oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '.....oYYYYxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '.....oYYYxxxYYxxwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '....oYYYYxxYYxxxwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '....oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '...oYYYYxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '...oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '...oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '...oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..ooyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyoo',
  '..ooyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyoo',
  '..ooyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyoo',
  '..ooyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyoo',
  '..ouoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouo',
  '..ouoyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyouo',
  '..ouuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuo',
  '..ouuoyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyouuo',
  '..ouuuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuo',
  '..ouuuoyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyouuuo',
  '..ouuuuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuuo',
  '..ouuuuuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuuuo',
  '..ouuuuuuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuuuuo',
  '...ouuuuuuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuuuuo',
  '...ouuuuuuuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuuuuuo',
  '...ouuuuuuuuoyyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuuuuuuo',
  '...ouuuuuuuuuoyyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuuuuuuuo',
  '....ouuuuuuuuuooyyyyyyxxxxxxxxxxxxxxxxxxxxyyyyyyoouuuuuuuuuo',
  '....ouuuuuuuuuuuooyyyyyyxxxxxxxxxxxxxxxxyyyyyyoouuuuuuuuuuuo',
  '.....ouuuuuuuuuuuuooyyyyyyyxxxxxxxxxxyyyyyyyoouuuuuuuuuuuuo',
  '.....ouuuuuuuuuuuuuuooyyyyyyyyyyyyyyyyyyyyoouuuuuuuuuuuuuuo',
  '......ouuuuuuuuuuuuuuuooooyyyyyyyyyyyyoooouuuuuuuuuuuuuuuo',
  '......ouuuuuuuuuuuuuuuuuuuoooooooooooouuuuuuuuuuuuuuuuuuuo',
  '.......ouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuo',
  '........ouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuo',
  '.........ouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuo',
  '..........ouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuo',
  '...........ouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuo',
  '............ouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuo',
  '.............ouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuo',
  '..............oouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuoo',
  '................oouuuuuuuuuuuuuuuuuuuuuuuuuuuuoo',
  '..................oouuuuuuuuuuuuuuuuuuuuuuuuoo',
  '....................oouuuuuuuuuuuuuuuuuuuuoo',
  '......................oooouuuuuuuuuuuuoooo',
  '..........................oooooooooooo',
  '.',
  '.',
  '.',
];
const DOWN = [
  '.',
  '.',
  '.',
  '.',
  '.',
  '.',
  '.',
  '.',
  '.',
  '..........................oooooooooooo',
  '......................ooooYYYYYYYYyyyyoooo',
  '....................ooYYYYYYYYYYYYYYyyyyyyoo',
  '..................ooYYYYYYxxxxxxxxxxxxyyyyyyoo',
  '................ooYYYYYxxxxxxxxxxxxxxxxxxyyyyyoo',
  '..............ooYYYYYxxxxxxxxxxxxxxxxxxxxxxyyyyyoo',
  '.............oYYYYxxxxxxYYYYYYYYYYYYYxxxxxxxxyyyyyo',
  '............oYYYYxxxxYYYYxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '...........oYYYYxxxYYYxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '..........oYYYYxxYYYxxxwwwwwwxxxxxxxxxxxxxxxxxxxyyyyyo',
  '.........oYYYYxxYYxxxwwwwwwwxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '........oYYYYxxYYxxxwwwwwxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '.......oYYYYxxYYxxxwwwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '......oYYYYxxYYxxxwwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '......oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '.....oYYYYxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '.....oYYYxxxYYxxwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '....oYYYYxxYYxxxwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '....oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '...oYYYYxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '...oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '...oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '...oYYYxxxYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oYYYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..oyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyo',
  '..ooyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyoo',
  '..ooyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyoo',
  '..ooyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyoo',
  '..ooyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyoo',
  '...ooyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyoo',
  '...ooyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyoo',
  '...ouoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouo',
  '...ouoyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyouo',
  '....ouoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouo',
  '....ouoyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyouo',
  '.....ouoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouo',
  '.....ouuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuo',
  '......ouuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuo',
  '......ouuuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuo',
  '.......ouuuoyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuo',
  '........ouuuoyyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuo',
  '.........ouuuoyyyyyxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyouuuo',
  '..........ouuuooyyyyyyxxxxxxxxxxxxxxxxxxxxyyyyyyoouuuo',
  '...........ouuuuooyyyyyyxxxxxxxxxxxxxxxxyyyyyyoouuuuo',
  '............ouuuuuooyyyyyyyxxxxxxxxxxyyyyyyyoouuuuuo',
  '.............ouuuuuuooyyyyyyyyyyyyyyyyyyyyoouuuuuuo',
  '..............oouuuuuuooooyyyyyyyyyyyyoooouuuuuuoo',
  '................oouuuuuuuuoooooooooooouuuuuuuuoo',
  '..................oouuuuuuuuuuuuuuuuuuuuuuuuoo',
  '....................oouuuuuuuuuuuuuuuuuuuuoo',
  '......................oooouuuuuuuuuuuuoooo',
  '..........................oooooooooooo',
  '.',
  '.',
  '.',
];

/**
 * A button picture as an image URL. With the LCD filter on it gets the same
 * treatment as the screen: enlarged with hard edges (so the browser smooths
 * only the final step) and laid over itself, offset, for a soft shadow.
 */
function render(rows, lcd, ink) {
  const w = 64, h = rows.length; // (rows are typed ragged on the right)
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!ink[ch]) return;
    ctx.fillStyle = ink[ch];
    ctx.fillRect(x, y, 1, 1);
  }));
  if (!lcd) return cv.toDataURL();
  const k = 3; // a button pixel is a fine pixel, drawn three times over as the screen's are
  const big = document.createElement('canvas');
  big.width = w * k; big.height = h * k;
  const b = big.getContext('2d');
  b.imageSmoothingEnabled = false;
  b.drawImage(cv, 0, 0, w * k, h * k);
  b.globalCompositeOperation = 'source-atop'; // the shadow stays inside the button's own shape
  b.globalAlpha = 0.2;
  b.imageSmoothingEnabled = true;
  b.filter = 'brightness(0.55)';
  b.drawImage(cv, 3 * 0.8, 3 * 0.9, w * k, h * k);
  return big.toDataURL();
}

let style = null;
/** Paint the buttons: each gets the UP picture, and the DOWN one while it is held (the .down class). */
let last = { lcd: false, ramp: null };
export function paintButtons(lcd = last.lcd, ramp = last.ramp) {
  last = { lcd, ramp };
  const ink = inks(ramp);
  if (!style) { style = document.createElement('style'); document.head.appendChild(style); }
  style.textContent = `.btn { background-image: url(${render(UP, lcd, ink)}); image-rendering: ${lcd ? 'auto' : 'pixelated'}; } .btn.down { background-image: url(${render(DOWN, lcd, ink)}); }`;
}
