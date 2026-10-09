// The Forest Cabin set's garden, continued, and the bits of its woodland floor.
// Pixelled by hand, row by row, in the colour roles of props.js.
import { defineProp } from './props.js';

// A campfire: flames over a log in a ring of stones.
defineProp('campfire', [
  '.......................t........................',
  '......................tt........................',
  '......................ttt.......................',
  '.....................tutt.......................',
  '................t....tuut.......................',
  '................tt..tuuut.....t.................',
  '...............ttt.tuuuutt...tt.................',
  '...............tutttuuwuuutt..tt................',
  '..............tuuttuuwwuuuttttut................',
  '..............tuuutuuwwwuuuttuut................',
  '.............tuuuuuuwwwwuuuuuuut................',
  '.............tuuuuuwwwwwwuuuuuut................',
  '............stuuuuuwwwwwwuuuuuuts...............',
  '............stuuuuuuwwwwuuuuuuuts...............',
  '............sttuuuuuuwwuuuuuuutts...............',
  '.............sttuuuuuuuuuuuuuutts...............',
  '..........5555555555555555555555555555..........',
  '.........588888888888888888888888888885.........',
  '.........577777777777777777777777777775.........',
  '.........566666666666666666666666666665.........',
  '..........5555555555555555555555555555..........',
  '.....eeeeee..eeeeee..eeeeee..eeeeee..eeeeee.....',
  '....ehhggffeehhggffeehhggffeehhggffeehhggffe....',
  '....ehggggfeehggggfeehggggfeehggggfeehggggfe....',
  '....eggggffeeggggffeeggggffeeggggffeeggggffe....',
  '.....eeeeee..eeeeee..eeeeee..eeeeee..eeeeee.....',
], { ramps: { roof: 'orange', stone: 'slate' } });

// A ring of toadstools.
defineProp('toadstools', [
  '......aaaaaa................................',
  '....aaddwdccaa............aaaa..............',
  '...adddddccccba.........aadwdcaa............',
  '..addwdcccwccbba.......adddccccba.....aaaa..',
  '..aaaaaaaaaaaaaa.......adwdcccwba....adwdca.',
  '......ehhgfe...........aaaaaaaaaa...adddccba',
  '......ehhgfe.............ehggfe.....aaaaaaaa',
  '......ehhgfe.............ehggfe.......ehfe..',
  '......ehhgfe.............ehggfe.......ehfe..',
  '.....ehhhgffe............ehggfe.......ehfe..',
  '..3..eeeeeeee...33.......eeeeee...3...eeee..',
  '.333............3333.................333....',
], { ramps: { accent: 'red', stone: 'cream', leaf: 'green' } });

// A bench made of half a log on two stumps.
defineProp('logBench', [
  '..5555555555555555555555555555555555555555555555..',
  '58888888888888888888888888888888888888888888888885',
  '57777777777777777777777777777777777777777777777665',
  '57777777777777777777766777777777777777777777777665',
  '56666666666666666666666666666666666666666666666665',
  '.555555555555555555555555555555555555555555555555.',
  '...55555555555555555555555555555555555555555555...',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '........58777665..................58777665........',
  '.......5555555555................5555555555.......',
]);

// ---- bits of the woodland floor ----
defineProp('leafFall', [
  '..aa...',
  '.accca.',
  'acccdca',
  '.acca..',
  '..a....',
], { ramps: { accent: 'orange' } });
defineProp('acornBit', [
  '5555',
  '5775',
  '.bc.',
  '.bc.',
  '..b.',
], { ramps: { accent: 'orange' } });
defineProp('mossPatch', [
  '.2222222.',
  '223333322',
  '233343332',
  '.2222222.',
]);
defineProp('tinyShroom', [
  '.rrr.',
  'ruwur',
  'rrrrr',
  '..w..',
  '..w..',
], { ramps: { roof: 'red' } });
