// Things to play on in the garden (see props-play-1.js), typed by hand.
// This file: Modern, Squiggle Club, Aqua Breeze and Pumpkin Hollow.
import { drawn } from './draw.js';

// Modern: a low trampoline. A dark mat inside a mint safety pad, on two steel
// legs with long feet.
drawn('trampoline', [
  '........aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  '.....aaaddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddaaa',
  '...aaccccccggggggggggggggggggggggggggggggggggggggggggggggggggggggccccccaa',
  '..acccccccfffffffffffffffffffffffffffffffffffffffffffffffffffffffcccccccca',
  '..acccccccfffffffffffffffffffffffffffffffffffffffffffffffffffffffcccccccca',
  '...aacccccceeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeccccccaa',
  '...abbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbba',
  '...adddddcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccbba',
  '...accccccccccccccccccccccccccccwwcwwcwccccccccccccccccccccccccccccccbbba',
  '...abbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbba',
  '....aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  '..........nvvn................................................nvvn',
  '..........nvvn................................................nvvn',
  '..........nwvn................................................nwvn',
  '..........nwvn................................................nwvn',
  '..........nwvn................................................nwvn',
  '..........nvvn................................................nvvn',
  '..........nvvn................................................nvvn',
  '..........nvvn................................................nvvn',
  '..........nvvn................................................nvvn',
  '......nnnnnvvnnnnn........................................nnnnnvvnnnnn',
  '......nwwvvvvvvvmn........................................nwwvvvvvvvmn',
  '......nnnnnnnnnnnn........................................nnnnnnnnnnnn',
], { ramps: { accent: 'mint', stone: 'slate' } });

// Squiggle Club: a ball pit. A yellow wall with a striped rim and a pink
// zigzag, heaped with balls in pink, blue, yellow and teal.
drawn('ballPit', [
  '........xxxx....aaaa....rrrr....eeee....aaaa....xxxx....rrrr....eeee',
  '.......xZZZzx..adddca..ruuutr..ehhhge..adddca..xZZZzx..ruuutr..ehhhge',
  '......xZZzzzyxadddccbaruutttsrehhgggfeadddccbaxZZzzzyxruutttsrehhgggfe',
  '......xZzzzzyxadccccbarutttssrehggggfeadccccbaxZzzzzyxrutttssrehggggfe',
  '....aaaazzzzeeeeccccrrrrttttxxxxggggeeeeccccaaaazzzzxxxxttttrrrrggggaaaa',
  '...adddcazzehhhgeccruuutrttxZZZzxggehhhgeccadddcazzxZZZzxttruuutrggadddca',
  '..adddccbaehhgggferuutttsrxZZzzzyxehhgggfeadddccbaxZZzzzyxruutttsradddccba',
  '..adccccbaehggggferutttssrxZzzzzyxehggggfeadccccbaxZzzzzyxrutttssradccccba',
  '..adccccbaehggggferutttssrxZzzzzyxehggggfeadccccbaxZzzzzyxrutttssradccccba',
  '..adccccbaehggggferutttssrxZzzzzyxehggggfeadccccbaxZzzzzyxrutttssradccccba',
  '.kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwk',
  'kwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwwwkkkkwwk',
  '.kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  '.ruuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuur',
  '.ruttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttsssr',
  '.ruttttttccttttttccttttttccttttttccttttttccttttttccttttttccttttttccttttsssr',
  '.rutttttccccttttccccttttccccttttccccttttccccttttccccttttccccttttcccctttsssr',
  '.ruttttccttcctccttcctccttcctccttcctccttcctccttcctccttcctccttcctccttccttsssr',
  '.rutttccttttccccttttccccttttccccttttccccttttccccttttccccttttccccttttcctsssr',
  '.ruttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttsssr',
  '.ruttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttsssr',
  '.ruttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttsssr',
  '.rssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssr',
  '..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
], { ramps: { roof: 'gold', accent: 'pink', glass: 'mint', stone: 'blue' } });

// Aqua Breeze: a blown-up cushion to bounce on, a low dome of blue glass in
// three panels with a streak of shine, on a green ring.
drawn('bouncePillow', [
  '..........................xxxxxxxxxxxxxxxxxxxxxxxx',
  '...................xxxxxxxZZZZZZZZZxZZZZZZZZZZZZZZxxxxxxx',
  '..............xxxxxZZZZZZZZZZZZZZZZxZZZZZZZZZZZZZZZZZZZZZxxxxx',
  '..........xxxxZZwwwwwwwwwwwwZZZZZZZxZZZZZZZZZZZZZZZZxZZZZZZZZZxxxx',
  '.......xxxZZwwwwwwwwZZZZZZZZZZZZZZZxZZZZZZZZZZZZZZZZxZZZZZZZZZZZZZxxx',
  '.....xxZZwwwwwZZZZZZZZZZZZZZZZZZZZZxZZZZZZZZZZZZZZZZxZZZZZZZZZZZZZZZZxx',
  '...xxZZwwwZZZZZZZZZZZZZZZZZZZZZZZZZxzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzzzxx',
  '..xZZZwwZZZZZZZZZZZZZZZZZZZZZZZZZZZxzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzzzzzx',
  '.xZZZZZZZZZZZZZZZZZZZZzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzzzzzzx',
  '.xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzzzzzzx',
  'xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzzzzzzzx',
  'xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzxzzzzzzzzzzzzzzzzzzzzzzx',
  'xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxzzzzzyyyyyyyyyyyxyyyyyyyyyyyyyyyyyyyyyyx',
  'xzzzzzzzzzzzzzzzzzzzzyyyyyyyyyyyyyyxyyyyyyyyyyyyyyyyxyyyyyyyyyyyyyyyyyyyyyyx',
  'xyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyxyyyyyyyyyyyyyyyyxyyyyyyyyyyyyyyyyyyyyyyx',
  '.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  '..oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
  '.oLLLLLLLLLLLLLLLLLLLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSo',
  '.oMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSSSSSo',
  '..oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
], { ramps: { glass: 'sky', leaf: 'green' } });

// Pumpkin Hollow: a heap of fallen leaves to jump in, orange and gold and
// brown, with a rake stood in it and a few leaves blown loose.
drawn('leafPile', [
  '................................................................pp',
  '................................................................pq',
  '................................................................pq',
  '................................................................pq',
  '................................................................pq',
  '................................................................pq',
  '..............................aaaaaaaaaaaaaaa...................pq',
  '..........................aaaaccctccctccccbcaaaa................pq',
  '......................aaaacctccccbcctcccctccccctaaaa............pq',
  '...................aaacccctccbccccctccccbccctcccccccaaa.........pq',
  '................aaactccccbcccctccccqcccctccccbccctcccctaa.......pq',
  '..............aactcccbcccctcccccbccccctccccccqccccbccccccaa.....pq',
  '............aacccccctccccccbccctcccccbccccctccccccctccccbccaa...pq',
  '..........aacctcccbccccctccccccccqccccctccccbcccctcccccccctccaa.pq',
  '.........acccccccccctcccccbccctcccccccbccccccctcccccbccctccccccapq',
  '........actccbccctccccccbccccccctcccbccccctccccccbccccccccbccctcaq',
  '.......acccccctcccccqccccccctccccccccccbccccccctccccctccccccccccca',
  '......accbcccccccbccccctcccccccbccctccccccqccccccccbccccctccbcccca',
  '.....acccctcccbcccccccccccbccccccccccctccccccbccctccccccccccccctcca',
  '.....actccccccccctcccbccccccctcccbcccccccctccccccccccbcccctcccbcccca',
  '....accccbccctccccccccccqcccccccccccbccccccccbccctcccccccccccccccccca',
  '....acccccccccccbccctccccccbccctcccccccctcccccccccccqccccbccctccbccca',
  '...actccbcccccccccccccccccccccccccbccccccccbccccctcccccccccccccccctcca',
  '...acccccccctcccbccccctcccbcccctccccccctccccccccccccbccctcccbccccccca',
  '..accbccccccccccccccccccccccccccccccbccccccccctcccccccccccccccccbcccca',
  '..acccccctccbccctcccbccccctccccbccccccccctccccccccbccccctcccctcccccca',
  '...abbbcccccccccccccccccbbbcccccccccctcccccbbbccccccccccccccccbbbbba....c',
  '.....aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa....tca',
], { ramps: { accent: 'orange', roof: 'gold', wood: 'brown' } });
