// More pieces redrawn after the look at every decoration (see props-redrawn.js).
// Pixelled by hand, row by row, in the colour roles of props.js.
import { defineProp } from './props.js';

// Starry Night: a brass telescope in three sections, each fatter than the last,
// dark bands between them and a blue lens at the wide end, on a mount and tripod.
defineProp('bigTelescope', [
  '................................rrrrrrrrrrrrrrrrrrrrrrrrrrrreexx',
  '................................ruuuuuuuuuuuuuuuuuuuuuuuuuurehZx',
  '................................ruuuuuuuuuuuuuuuuuuuuuuuuuurehZx',
  '................................rttttttttttttttttttttttttttregzx',
  '................................rttttttttttttttttttttttttttregzx',
  '................................rttttttttttttttttttttttttttregzx',
  '................rrrrrrrrrrrrrrrrrttttttttttttttttttttttttttregzx',
  '................euuuuuuuuuuuuuuerttttttttttttttttttttttttttregzx',
  '................euuuuuuuuuuuuuuerttttttttttttttttttttttttttregzx',
  '................etttttttttttttterttttttttttttttttttttttttttregyx',
  '................etttttttttttttterttttttttttttttttttttttttttregyx',
  '....rrrrrrrrrrrretttttttttttttterssssssssssssssssssssssssssrefyx',
  '....egggggggggggetttttttttttttterssssssssssssssssssssssssssrefyx',
  '....egggggggggggesssssssssssssserrrrrrrrrrrrrrrrrrrrrrrrrrrreexx',
  '....efffffffffffesssssssssssssse................................',
  '....efffffffffffesssssssssssssse................................',
  '....eeeeeeeeeeeerrrrrrrrrrrrrrrr................................',
  '..............................eeeeeeeeee........................',
  '..............................ehhggggffe........................',
  '..............................ehhggggffe........................',
  '..............................eeeeeeeeee........................',
  '.................................eggge..........................',
  '.................................eggge..........................',
  '...............................eeeeeeeee........................',
  '................................egfegfegf.......................',
  '...............................egf.egf.egf......................',
  '..............................egf..egf..egf.....................',
  '..............................egf..egf..egf.....................',
  '.............................egf...egf...egf....................',
  '............................egf....egf....egf...................',
  '...........................egf.....egf.....egf..................',
  '..........................egf......egf......egf.................',
  '..........................egf......egf......egf.................',
  '.........................egf.......egf.......egf................',
  '........................egf........egf........egf...............',
  '.......................egf.........egf.........egf..............',
  '......................egf..........egf..........egf.............',
  '......................egf..........egf..........egf.............',
  '.....................egf...........egf...........egf............',
  '....................egf............egf............egf...........',
  '...................egf.............egf.............egf..........',
  '..................egf..............egf..............egf.........',
  '..................egf..............egf..............egf.........',
  '.................eeeee............eeeee............eeeee........',
], { at: [36, 43], ramps: { roof: 'gold', stone: 'indigo', glass: 'sky' } });

// Starry Night: a gold bench with three stars cut through its back.
defineProp('crescentBench', [
  '....rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr....',
  '....ruuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuur....',
  '....rtttttt.tttttttttttt.tttttttttttt.tttttr....',
  '....rtttt.....tttttttt.....tttttttt.....tttr....',
  '....rttttt...tttttttttt...tttttttttt...ttttr....',
  '....rttttt.t.tttttttttt.t.tttttttttt.t.ttttr....',
  '....rssssssssssssssssssssssssssssssssssssssr....',
  '....rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr....',
  '......rt................................tr......',
  '......rt................................tr......',
  '......rt................................tr......',
  '..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr..',
  '.ruuuuuuuuuuuuuuuuuuuuuuuuuuuuuuttttttttttttssr.',
  '.rttttttttttttttttttttttttttttttttttttttssssssr.',
  '..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr..',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '........egfe........................egfe........',
  '......eeeeeeee....................eeeeeeee......',
], { ramps: { roof: 'gold', stone: 'indigo' } });

// ---------------------------------------------------------------- a second round
// Flat shapes given the texture the older props have: clumps of leaves, needles,
// veins, a shine. Each touch is a few pixels typed here and set down at a place
// chosen by hand ([row, column, pixels]; a `.` leaves what is there).
import { PROPS } from './props.js';
function retouch(name, letters, stamps) {
  const p = PROPS[name];
  const rows = p.rows.map(r => [...r].map(ch => letters[ch] || ch));
  for (const [r, c, px] of stamps) [...px].forEach((ch, i) => { if (ch !== '.' && rows[r]?.[c + i] !== undefined && rows[r][c + i] !== '.') rows[r][c + i] = ch; });
  defineProp(name, rows.map(r => r.join('')), { at: p.at, ramps: p.ramps });
}
// a clump of leaves: a dark arc under it, a light fleck on its upper left
const clump = (r, c) => [[r, c, '2.........2'], [r + 1, c, '.22.....22.'], [r + 2, c, '...22222...'], [r - 3, c + 3, '444'], [r - 2, c + 2, '44']];
// a smaller one, for needles
const tuft = (r, c) => [[r, c, '2.....2'], [r + 1, c, '.22222.'], [r - 2, c + 2, '44']];

retouch('ballTree', { 4: '3', 2: '3' }, [
  ...clump(8, 8), ...clump(8, 20),
  ...clump(16, 4), ...clump(16, 15), ...clump(16, 26),
  ...clump(24, 9), ...clump(24, 21),
  [31, 9, '2222222222222222222222'], [32, 10, '22222222222222222222'], [33, 12, '2222222222222222'],
]);
retouch('pineTree', {}, [
  ...tuft(6, 24), ...tuft(10, 20), ...tuft(10, 29),
  ...tuft(20, 19), ...tuft(20, 29), ...tuft(25, 13), ...tuft(25, 23), ...tuft(25, 33),
  ...tuft(34, 16), ...tuft(34, 26), ...tuft(34, 36), ...tuft(40, 9), ...tuft(40, 19), ...tuft(40, 29), ...tuft(40, 39),
]);
// the leaf rug: veins off the midrib
const vein = (c) => [[9, c, '22'], [8, c + 2, '22'], [7, c + 4, '22'], [6, c + 6, '22'], [12, c, '22'], [13, c + 2, '22'], [14, c + 4, '22'], [15, c + 6, '22']];
retouch('rugLeaf', {}, [...vein(16), ...vein(34), ...vein(52), ...vein(70), ...vein(88), ...vein(104)]);
// the beanbag: a shine, and a stitched seam

// Starry Night: a star cushion with a sleepy face.
defineProp('starCushion', [
  '............rr............',
  '............rr............',
  '...........ruur...........',
  '...........ruur...........',
  '..........ruuuur..........',
  '..........ruuuur..........',
  '.........ruuuuuur.........',
  '.........ruuuuuur.........',
  'rrrrrrrrruuuuuuuurrrrrrrrr',
  'ruuuuuuuuuuuuuuuuuuuuuuttr',
  '..ruuuuuuuuuuuuuuuuutttr..',
  '...ruuuuukuuuuukuuutttr...',
  '.....ruuuuuuuuuuutttr.....',
  '......ruuuukkkuutttr......',
  '......ruuuuuuuuutttr......',
  '.....ruuuuuuuuuuttttr.....',
  '.....ruuuuuuuuuuttttr.....',
  '....ruuuuuuurrtttttttr....',
  '....ruuuuurr..rrtttttr....',
  '...ruuuurr......rrttttr...',
  '...ruurr..........rrttr...',
  '..rurr..............rrtr..',
  '..rrr................rrr..',
], { ramps: { roof: 'gold' } });
