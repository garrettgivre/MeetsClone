// The Sweetheart set's bedroom, redrawn as real things. Typed by hand, row by
// row; rows are ragged on the right (see draw.js for that and for the letters).
import { drawn } from './draw.js';

// A cross-stitched heart in a gilt frame, hung by a ribbon tied in a bow.
drawn('heartPicture', [
  '...........aa....aa',
  '..........adda..adda',
  '.........adccdaadccda',
  '..........adda..adda',
  '...........aattaa',
  '............a..a',
  '...........a....a',
  '..rrrrrrrrrrrrrrrrrrrrrrrrrr',
  '.ruuuuuuuuuuuuuuuuuuuuuuuuuur',
  '.ruttttttttttttttttttttttttsr',
  '.rutrrrrrrrrrrrrrrrrrrrrrrtsr',
  '.rutrwwwwwwwwwwwwwwwwwwwwrtsr',
  '.rutrwmwwwwwwwwwwwwwwwwmwrtsr',
  '.rutrwwwwccccwwwwccccwwwwrtsr',
  '.rutrwwwcddcccwwcccccbwwwrtsr',
  '.rutrwwcddccccccccccccbwwrtsr',
  '.rutrwwcdcccccccccccccbwwrtsr',
  '.rutrwwccccccccccccccbbwwrtsr',
  '.rutrwwwccccccccccccbbwwwrtsr',
  '.rutrwwwwccccccccccbbwwwwrtsr',
  '.rutrwwwwwccccccccbbwwwwwrtsr',
  '.rutrwwwwwwccccccbbwwwwwwrtsr',
  '.rutrwwwwwwwccccbbwwwwwwwrtsr',
  '.rutrwwwwwwwwccbbwwwwwwwwrtsr',
  '.rutrwwwwwwwwwcbwwwwwwwwwrtsr',
  '.rutrwmwwwwwwwwwwwwwwwwmwrtsr',
  '.rutrwwwwwwwwwwwwwwwwwwwwrtsr',
  '.rutrrrrrrrrrrrrrrrrrrrrrrtsr',
  '.russsssssssssssssssssssssssr',
  '..rrrrrrrrrrrrrrrrrrrrrrrrrr',
], { at: [15, 29], ramps: { accent: 'pink', roof: 'gold' } });

// A wooden shelf with a scalloped apron.
drawn('sweetShelf', [
  'pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
  'pPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPp',
  'pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqQQp',
  'pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
  '.pqqqqqqqqp..pqqqqqqqqp..pqqqqqqqqp..pqqqqqqqqp..pqqqqqqqqp..pqqqqqqqqp.',
  '..pqqqqqqp....pqqqqqqp....pqqqqqqp....pqqqqqqp....pqqqqqqp....pqqqqqqp..',
  '...pppppp......pppppp......pppppp......pppppp......pppppp......pppppp...',
], { ramps: { wood: 'brown' } });

// A teddy bear sitting up, a bow at its neck.
drawn('teddyBear', [
  '...qq......qq',
  '..qPPq....qPPq',
  '..qPqqqqqqqqPq',
  '...qPPPPPPPPq',
  '..qPPPPPPPPPPq',
  '..qPkPPPPPPkPq',
  '..qPPPPAAPPPPq',
  '..qPPPAkkAPPPq',
  '...qPPPAAPPPq',
  '....qqaaaaqq',
  '...qPPadcaPPq',
  '.qqPPPPaaPPPPqq',
  'qPPqPPPPPPPPqPPq',
  'qPPqPPPAAPPPqPPq',
  '.qq.qPPAAPPq.qq',
  '..qqqPPPPPPqqq',
  '.qPPPqqqqqqPPPq',
  '.qqqqq....qqqqq',
], { ramps: { wood: 'brown', wall: 'cream', accent: 'pink' } });

// Three books in a stack, not quite square to one another.
drawn('bookStack', [
  '..aaaaaaaaaaaa',
  '..adcccccccwwa',
  '..aaaaaaaaaaaa',
  'xxxxxxxxxxxxxx',
  'xZzzzzzzzzzwwx',
  'xZzzzzzzzzzwwx',
  'xxxxxxxxxxxxxx',
  '.rrrrrrrrrrrrrr',
  '.rutttttttttwwr',
  '.rutttttttttwwr',
  '.rrrrrrrrrrrrrr',
], { ramps: { accent: 'pink', glass: 'sky', roof: 'gold' } });

// Violets in a pot with a heart on it.
drawn('violetPot', [
  '...x..x...x',
  '..xZx.xZxxZx',
  '...x.Mx..x',
  '..M.MMM.M.M',
  '.MLM.MM.MLM',
  '..MMMMMMMMM',
  '...MMSMMSM',
  '.eeeeeeeeeee',
  '.ehhhhgggffe',
  '.eeeeeeeeeee',
  '..ehhgaggfe',
  '..ehgaaagfe',
  '..ehhgaggfe',
  '..ehhggggfe',
  '...eeeeeee',
], { at: [6, 14], ramps: { glass: 'violet', leaf: 'green', stone: 'orange', accent: 'pink' } });

// A rug in the shape of a heart, with a stitched edge.
drawn('sweetRug', [
  '..................aaaaaaaaaaaaaaaa............................aaaaaaaaaaaaaaaa',
  '.............aaddddddddddddddddddddddaa..................aaddddddddddddddddddddddaa',
  '.........aaddddddddddddddddddddddddddddddaa..........aaddddddddddddddddddddddddddddddaa',
  '......aaddddwdwdwdwdwdwdwdwdwdwdwdwdwdwdddddaa....aadddddwdwdwdwdwdwdwdwdwdwdwdwdwdwddddaa',
  '....adddwddddddddddddddddddddddddddddddddwddddaaaaddddwddddddddddddddddddddddddddddddddwddda',
  '...addwdddddddddddddddddddddddddddddddddddddwddddddwdddddddddddddddddddddddddddddddddddddwdda',
  '..addwdddddddddddddddddddddddddddddddddddddddddwwdddddddddddddddddddddddddddddddddddddddddwdda',
  '..adwdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddwda',
  '..acwcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwca',
  '...acwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwca',
  '.....acwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwca',
  '........aacwwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwwcaa',
  '............aacwwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwwcaa',
  '.................aacwwccccccccccccccccccccccccccccccccccccccccccccccccccwwcaa',
  '......................aaacwwccccccccccccccccccccccccccccccccccccccwwcaaa',
  '............................aaacwwccccccccccccccccccccccccccwwcaaa',
  '..................................aaabwwbbbbbbbbbbbbbbbbwwbaaa',
  '........................................aaabwwbbbbwwbaaa',
  '.............................................aaaaaa',
], { at: [48, 18], ramps: { accent: 'pink' } });
