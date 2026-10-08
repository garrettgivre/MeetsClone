// The three device buttons under the screen, as pixel art in the game's own
// palette: a gold dome with an ink outline, lit from the upper left, standing
// on its darker side (UP), and pushed in (DOWN). Drafted with the mask and
// shading helpers in tools/art-scripts/icon_kit.py; the grids here are the art.
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

function render(rows) {
  const cv = document.createElement('canvas');
  cv.width = rows[0].length;
  cv.height = rows.length;
  const ctx = cv.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!KEY[ch]) return;
    ctx.fillStyle = HEX[C(KEY[ch])];
    ctx.fillRect(x, y, 1, 1);
  }));
  return cv.toDataURL();
}

/** Paint the buttons: each gets the UP picture, and the DOWN one while it is held (the .down class). */
export function paintButtons() {
  const style = document.createElement('style');
  style.textContent = `.btn { background-image: url(${render(UP)}); } .btn.down { background-image: url(${render(DOWN)}); }`;
  document.head.appendChild(style);
}
