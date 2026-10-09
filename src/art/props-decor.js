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

/** A copy of a prop with some rows drawn afresh: { rowIndex: 'new row' }. */
function variant(name, of, rows) {
  const base = PROPS[of].rows.slice();
  for (const [i, row] of Object.entries(rows)) {
    if (row.length !== base[i].length) throw new Error(`${name} row ${i} is ${row.length} wide, expected ${base[i].length}`);
    base[i] = row;
  }
  defineProp(name, base);
}

// ---------- bedside table and lamps ----------
// The table on its own (a lamp from below stands on it).
defineProp('bedsideTable', [
  '.55555555555555555555555555555555.',
  '5888888888888888888888888888888765',
  '5777777777777777777777777777777665',
  '.55555555555555555555555555555555.',
  '..566666666666666666666666666665..',
  '..587777777777777777777777776665..',
  '..587777777777777777777777776665..',
  '..587755555555555555555555557665..',
  '..587758888888888888888887657665..',
  '..587758777777777777777776657665..',
  '..587758777777777777777776657665..',
  '..5877587777777suus7777776657665..',
  '..5877587777777stts7777776657665..',
  '..58775877777777ss77777776657665..',
  '..587758777777777777777776657665..',
  '..587757666666666666666666657665..',
  '..587755555555555555555555557665..',
  '..587777777777777777777777776665..',
  '..587777777777777777777777776665..',
  '..587777777777777777777777776665..',
  '..587777777777777777777777776665..',
  '..587777777777777777777777776665..',
  '..576666666666666666666666666665..',
  '..555555555555555555555555555555..',
  '....58765................58765....',
  '....58765................58765....',
  '....58765................58765....',
  '....58765................58765....',
  '....57665................57665....',
  '....55555................55555....',
]);

// A crescent-moon lamp with a little star in its hollow, on a stand.
defineProp('moonLamp', [
  '......rrrrrr........',
  '....rruuuuttrr......',
  '...ruuuuutrrr.......',
  '..ruuwuutrr.........',
  '.ruuwuutr...........',
  '.ruuuutr............',
  'ruuuuutr............',
  'ruuuutsr....u.......',
  'ruuuutsr...uwu......',
  'ruuuuttr....u.......',
  'ruuuuttsr...........',
  '.ruuuttsr...........',
  '.ruuutttsr..........',
  '..ruutttssrr........',
  '...rutttsssrrr......',
  '....rrttssssssrr....',
  '......rrrrrrrr......',
  '.......gf...........',
  '.......gf...........',
  '.....eeeeee.........',
  '....ehhggffe........',
  '....eeeeeeee........',
], { at: [8, 21], ramps: { roof: 'gold', stone: 'slate' } });

// A toadstool lamp: a spotted cap on a plump stalk.
defineProp('mushroomLamp', [
  '......aaaaaaaa......',
  '....aaddddccccaa....',
  '...addwwdccccccba...',
  '..addwwwdcccwwcbba..',
  '.adddwwdccccwwccbba.',
  '.adddddcccccccccbba.',
  'adddcccccwwccccccbba',
  'adccccccwwwwcccccbba',
  'abccccccccwwccccbbba',
  'abbbbbbbbbbbbbbbbbba',
  '.aaaaaaaaaaaaaaaaaa.',
  '......ehhhhgfe......',
  '......ehhhggfe......',
  '......ehhhggfe......',
  '.....ehhhhgggfe.....',
  '.....ehhhgggffe.....',
  '....ehhhhggggffe....',
  '....eeeeeeeeeeee....',
], { ramps: { accent: 'red', stone: 'cream' } });

// ---------- pictures ----------
// A framed night sky: a crescent moon and three stars.
variant('moonFrame', 'heartFrame', {
  11: '.rutsmxxxxxxxxxxxxxxxxxutsr.',
  12: '.rutsmxxxxxxxxxxxxwxxxxutsr.',
  13: '.rutsmxxxxxxccccxxxxxxxutsr.',
  14: '.rutsmxxxxxcdddxxxxxxxxutsr.',
  15: '.rutsmxxxxcddcxxxxxwxxxutsr.',
  16: '.rutsmxxxcddcxxxxxwwwxxutsr.',
  17: '.rutsmxxxcddcxxxxxxwxxxutsr.',
  18: '.rutsmxxxcddcxxxxxxxxxxutsr.',
  19: '.rutsmxxxcdddcxxxxxxxxxutsr.',
  20: '.rutsmxxxxcddddcccccxxxutsr.',
  21: '.rutsmxxxxxccddddddcxxxutsr.',
  22: '.rutsmxxxxxxxcccccxxxxxutsr.',
  23: '.rutsmxwxxxxxxxxxxxxxxxutsr.',
  24: '.rutsmxxxxxxxxxxxxxxxxxutsr.',
  25: '.rutsmxxxxxxxxxxxxxwxxxutsr.',
  26: '.rutsmxxxxxwxxxxxxxxxxxutsr.',
  27: '.rutsmxxxxxxxxxxxxxxxxxutsr.',
  28: '.rutsmxxxxxxxxxxxxxxxxxutsr.',
  29: '.rutsmxxxxxxxxxxxxxxxxxutsr.',
});
// A pressed leaf in a frame.
variant('leafFrame', 'heartFrame', {
  14: '.rutsmwwwwwwwwwww11wwwwutsr.',
  15: '.rutsmwwwwwwwww11341wwwutsr.',
  16: '.rutsmwwwwwwww1343331wwutsr.',
  17: '.rutsmwwwwwww13433321wwutsr.',
  18: '.rutsmwwwwww134333221wwutsr.',
  19: '.rutsmwwwwww13332321wwwutsr.',
  20: '.rutsmwwwww133323221wwwutsr.',
  21: '.rutsmwwwww13232221wwwwutsr.',
  22: '.rutsmwwwww1322221wwwwwutsr.',
  23: '.rutsmwwwww122211wwwwwwutsr.',
  24: '.rutsmwwwww1111wwwwwwwwutsr.',
  25: '.rutsmwwww51wwwwwwwwwwwutsr.',
  26: '.rutsmwww5wwwwwwwwwwwwwutsr.',
});

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
