// Furniture and ornaments for the themed room sets (src/game/decor.js),
// pixelled by hand, row by row, in the same colour roles as props.js:
//   1-4 leaf   5-8 wood   a-d accent   e-h stone   A-D wall   r s t u roof   x y z Z glass
//   w white   m mist   v silver   n grey   k ink   . empty
// Light comes from the upper left.
import { defineProp, PROPS } from './props.js';
import './props-home.js';
import './props-beds.js';
import './props-seaside.js';
import './props-modern.js';
import './surfaces.js';
import './ground-bits.js';
import './props-starry.js';
import './props-starry-garden.js';
import './props-forest.js';
import './props-forest-2.js';
import './props-forest-3.js';
import './props-forest-4.js';
import './props-forest-5.js';
import './props-forest-6.js';
import './props-redrawn.js';
import './props-redrawn-2.js';
import './props-redrawn-3.js';
import './props-sweet-1.js';
import './props-sweet-2.js';
import './props-sweet-3.js';
import './props-sweet-4.js';
import './props-sweet-5.js';
import './props-starry-2.js';
import './props-real-1.js';
import './props-sized-1.js';
import './props-sized-2.js';
import './props-sized-3.js';


// ---------- the starry set's toy ----------
// A toy rocket standing on its fins, with a round porthole.
defineProp('toyRocket', [
  '..........aa..........',
  '.........adda.........',
  '........addcba........',
  '.......adddcbba.......',
  '......addddccbba......',
  '......adddcccbba......',
  '.....adddccccbbba.....',
  '.....aaaaaaaaaaaa.....',
  '.....nwwwwwwwwmmn.....',
  '.....nwwwwwwwwmmn.....',
  '.....nwwwxxxxwmmn.....',
  '.....nwwxZZzyxmmn.....',
  '.....nwwxZwzyxmmn.....',
  '.....nwwxzzzyxmmn.....',
  '.....nwwxyyyyxmmn.....',
  '.....nwwwxxxxwmmn.....',
  '.....nwwwwwwwwmmn.....',
  '.....naaaaaaaaaan.....',
  '.....ndddccccbban.....',
  '.....naaaaaaaaaan.....',
  '.....nwwwwwwwwmmn.....',
  '....anwwwwwwwwmmna....',
  '...adnwwwwwwwwmmnba...',
  '..addnwwwwwwwwmmnbba..',
  '.adddnwwwwwwwwmmnbbba.',
  '.adccnwwwwwwwwmmncbba.',
  'adcccnnnnnnnnnnnnccbba',
  'adccba..eeeeee..adcbba',
  'aaaaa...effffe...aaaaa',
  '.........eeee.........',
], { ramps: { accent: 'red', glass: 'sky', stone: 'gold' } });

// A little scallop shell, and a starfish.
defineProp('shell', [
  '...aaaa...',
  '.aadcdcaa.',
  'adcdcdcdca',
  'adcdcdcdba',
  '.adcdcdba.',
  '..abdcba..',
  '...abba...',
  '....aa....',
], { ramps: { accent: 'pink' } });
defineProp('starfish', [
  '.....a.....',
  '....aca....',
  '....aca....',
  'aaaaaccaaaa',
  'adccccccdca',
  '.aaccdccaa.',
  '..acccccca.',
  '.accaaacca.',
  '.acaa..aca.',
  '.aa.....aa.',
], { ramps: { accent: 'orange' } });

// A cooker under an extractor hood: a dark glass hob, four knobs, an oven with a window.
defineProp('range', [
  '....................ehhgggggggggggggfffe....................',
  '....................ehhgggggggggggggfffe....................',
  '....................ehhgggggggggggggfffe....................',
  '....................ehhgggggggggggggfffe....................',
  '....................ehhgggggggggggggfffe....................',
  '....................ehhgggggggggggggfffe....................',
  '....eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee....',
  '....ehhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhe....',
  '....ehhhggggggggggggggggggggggggggggggggggggggggggggfffe....',
  '....ehhhggggggggggggggggggggggggggggggggggggggggggggfffe....',
  '...ehgggggggggggggggggggggggggggggggggggggggggggggggggffe...',
  '..ehgggggggggggggggggggggggggggggggggggggggggggggggggggffe..',
  '..eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee..',
  '..effffffffffffffffffffffffffffffffffffffffffffffffffffffe..',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '............................................................',
  '......eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee......',
  '......ennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnne......',
  '......ennkkkkkknnnnnnkkkkkknnnnnnkkkkkknnnnnnkkkkkknne......',
  '......eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee......',
  '......ehhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhe......',
  '......ehhhkkhhhhkkhhhhkkhhhhkkhhhhhhhhhhhhhhhhhhhhhhhe......',
  '......ehhhkkhhhhkkhhhhkkhhhhkkhhhhhhhhhhhhhhhhhhhhhhhe......',
  '......egggggggggggggggggggggggggggggggggggggggggggggge......',
  '......eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee......',
  '......egeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeefe......',
  '......egehhvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvhhefe......',
  '......egehhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhefe......',
  '......egehhkyyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkhhefe......',
  '......egehhkyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkhhefe......',
  '......egehhkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkhhefe......',
  '......egehhkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkhhefe......',
  '......egehhkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkhhefe......',
  '......egehhkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkhhefe......',
  '......egehhkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkhhefe......',
  '......egehhkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkhhefe......',
  '......egehhkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkhhefe......',
  '......egehhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhefe......',
  '......egeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeefe......',
  '......eggggggggggggggggggggggggggggggggggggggggggggffe......',
  '......eggggggggggggggggggggggggggggggggggggggggggggffe......',
  '......eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee......',
  '........ee........................................ee........',
  '........ee........................................ee........',
], { ramps: { stone: 'slate', glass: 'orange' } });

// A slatted garden bench.
defineProp('bench', [
  '.5555555555555555555555555555555555555555.',
  '588888888888888888888888888888888888888875',
  '577777777777777777777777777777777777777765',
  '.5555555555555555555555555555555555555555.',
  '..56..................................56..',
  '..56..................................56..',
  '.5555555555555555555555555555555555555555.',
  '588888888888888888888888888888888888888875',
  '577777777777777777777777777777777777777765',
  '566666666666666666666666666666666666666665',
  '.5555555555555555555555555555555555555555.',
  '..576................................576..',
  '..576................................576..',
  '..576................................576..',
  '..576................................576..',
  '..555................................555..',
], { ramps: { wood: 'slate' } });

// A cactus in a small pot.
defineProp('cactus', [
  '....1111....',
  '...134431...',
  '...133321...',
  '11.133321...',
  '131133321.11',
  '131133321131',
  '133333321131',
  '.11133333331',
  '...13332111.',
  '...133321...',
  '..eeeeeeee..',
  '..ehhggffe..',
  '..eeeeeeee..',
  '...ehggfe...',
  '...ehggfe...',
  '...eeeeee...',
], { ramps: { stone: 'cream' } });
