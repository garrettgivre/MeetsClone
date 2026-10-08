// The three device buttons under the screen, as pixel art in the game's own
// palette: a gold dome with an ink outline, lit from the upper left, standing
// on its darker side (UP), and pushed in (DOWN). The grids here are the art:
// edit them by hand.
import { HEX, C } from '../engine/palette.js';

const KEY = { o: 'ink', u: 'gold.0', y: 'gold.1', x: 'gold.2', Y: 'gold.3', w: 'white' };

const UP = [
  '..............oooo..............',
  '..........ooooYYyyoooo..........',
  '........ooYYYYxxxxYYyyoo........',
  '.......oYYxxxxYYYYxxxxyyo.......',
  '......oYxxxwYYYYYYYYYxxyyo......',
  '.....oYxxYYYYxxxxxxxxYYxyyo.....',
  '....oYxxYwwwxxxxxxxxxxxYxyyo....',
  '...oYxxYwwxxxxxxxxxxxxxxxxyyo...',
  '...oYxYwwxxxxxxxxxxxxxxxxxyyo...',
  '..oYxxYwxxxxxxxxxxxxxxxxxxxyyo..',
  '..oYxYYxxxxxxxxxxxxxxxxxxxxyyo..',
  '..oYxYYxxxxxxxxxxxxxxxxxxxxyyo..',
  '..oYxYxxxxxxxxxxxxxxxxxxxxxyyo..',
  '.oYxYYxxxxxxxxxxxxxxxxxxxxxxyyo.',
  '.oYxYYxxxxxxxxxxxxxxxxxxxxxxyyo.',
  '.oyxYYxxxxxxxxxxxxxxxxxxxxxxyyo.',
  '.oyxYYxxxxxxxxxxxxxxxxxxxxxxyyo.',
  '.ooYxYxxxxxxxxxxxxxxxxxxxxxyyoo.',
  '.ooYxYxxxxxxxxxxxxxxxxxxxxxyyoo.',
  '.ooyxYxxxxxxxxxxxxxxxxxxxxxyyoo.',
  '.ooyxxYxxxxxxxxxxxxxxxxxxxxyyoo.',
  '.ouoyxYxxxxxxxxxxxxxxxxxxxyyouo.',
  '..ooyyxYxxxxxxxxxxxxxxxxxxyyoo..',
  '..ouoyyxxxxxxxxxxxxxxxxxxyyouo..',
  '..ouuoyyxxxxxxxxxxxxxxxxyyouuo..',
  '..ouuuoyyyxxxxxxxxxxxxyyyouuuo..',
  '...ouuuoyyyyyyxxxxyyyyyyouuuo...',
  '...ouuuuooyyyyyyyyyyyyoouuuuo...',
  '....ouuuuuooooyyyyoooouuuuuo....',
  '.....ouuuuuuuuoooouuuuuuuuo.....',
  '......ouuuuuuuuuuuuuuuuuuo......',
  '.......ouuuuuuuuuuuuuuuuo.......',
  '........oouuuuuuuuuuuuoo........',
  '..........oooouuuuoooo..........',
  '..............oooo..............',
  '................................',
];
const DOWN = [
  '................................',
  '................................',
  '................................',
  '..............oooo..............',
  '..........ooooYYyyoooo..........',
  '........ooYYYYxxxxYYyyoo........',
  '.......oYYxxxxYYYYxxxxyyo.......',
  '......oYxxxwYYYYYYYYYxxyyo......',
  '.....oYxxYYYYxxxxxxxxYYxyyo.....',
  '....oYxxYwwwxxxxxxxxxxxYxyyo....',
  '...oYxxYwwxxxxxxxxxxxxxxxxyyo...',
  '...oYxYwwxxxxxxxxxxxxxxxxxyyo...',
  '..oYxxYwxxxxxxxxxxxxxxxxxxxyyo..',
  '..oYxYYxxxxxxxxxxxxxxxxxxxxyyo..',
  '..oYxYYxxxxxxxxxxxxxxxxxxxxyyo..',
  '..oYxYxxxxxxxxxxxxxxxxxxxxxyyo..',
  '.oYxYYxxxxxxxxxxxxxxxxxxxxxxyyo.',
  '.oYxYYxxxxxxxxxxxxxxxxxxxxxxyyo.',
  '.oyxYYxxxxxxxxxxxxxxxxxxxxxxyyo.',
  '.oyxYYxxxxxxxxxxxxxxxxxxxxxxyyo.',
  '.ooYxYxxxxxxxxxxxxxxxxxxxxxyyoo.',
  '.ooYxYxxxxxxxxxxxxxxxxxxxxxyyoo.',
  '..oyxYxxxxxxxxxxxxxxxxxxxxxyyo..',
  '..oyxxYxxxxxxxxxxxxxxxxxxxxyyo..',
  '..ooyxYxxxxxxxxxxxxxxxxxxxyyoo..',
  '..ooyyxYxxxxxxxxxxxxxxxxxxyyoo..',
  '...ooyyxxxxxxxxxxxxxxxxxxyyoo...',
  '...ouoyyxxxxxxxxxxxxxxxxyyouo...',
  '....ouoyyyxxxxxxxxxxxxyyyouo....',
  '.....ouoyyyyyyxxxxyyyyyyouo.....',
  '......ouooyyyyyyyyyyyyoouo......',
  '.......ouuooooyyyyoooouuo.......',
  '........oouuuuoooouuuuoo........',
  '..........oooouuuuoooo..........',
  '..............oooo..............',
  '................................',
];

/**
 * A button picture as an image URL. With the LCD filter on it gets the same
 * treatment as the screen: enlarged with hard edges (so the browser smooths
 * only the final step) and laid over itself, offset, for a soft shadow.
 */
function render(rows, lcd) {
  const w = rows[0].length, h = rows.length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!KEY[ch]) return;
    ctx.fillStyle = HEX[C(KEY[ch])];
    ctx.fillRect(x, y, 1, 1);
  }));
  if (!lcd) return cv.toDataURL();
  const k = 6; // a button pixel is a normal game pixel: two hi-res pixels, each drawn three times over
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
export function paintButtons(lcd = false) {
  if (!style) { style = document.createElement('style'); document.head.appendChild(style); }
  style.textContent = `.btn { background-image: url(${render(UP, lcd)}); image-rendering: ${lcd ? 'auto' : 'pixelated'}; } .btn.down { background-image: url(${render(DOWN, lcd)}); }`;
}
