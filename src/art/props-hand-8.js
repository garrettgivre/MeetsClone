// The rugs and bath mats typed whole by hand at full size (rugs about 120
// across, mats over 80: see "Furniture sizes" in CLAUDE.md), in place of ones
// a script had widened. Nothing here is repeated or derived in code.
import { drawn } from './draw.js';

// Sweetheart: the heart rug. A heart lying flat, lighter toward the back, with
// a line of lace stitches inside its edge and a crease where the lobes meet.
drawn('sweetRug', [
  '......................aaaaaaaaaaaaaaaaaaa......................................aaaaaaaaaaaaaaaaaaa',
  '...............aadddddddddddddddddddddddddddddaa........................aadddddddddddddddddddddddddddddaa',
  '..........aadddddddddddddddddddddddddddddddddddddddaa..............aadddddddddddddddddddddddddddddddddddddddaa',
  '......aaddwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwddddaa......aaddwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwdwddddaa',
  '....aadwddddddddddddddddddddddddddddddddddddddddddddddddddaaaaddddddddddddddddddddddddddddddddddddddddddddddddddwdaa',
  '..aadwdddddddddddddddddddddddddddddddddddddddddddddddddddddccdddddddddddddddddddddddddddddddddddddddddddddddddddddwdaa',
  '.adwddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddwda',
  'adwddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddwda',
  'acwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwca',
  '.acwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwca',
  '...aacwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwcaa',
  '......aaacwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwcaaa',
  '..........aaaacwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwcaaaa',
  '...............aaaaacwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwcaaaaa',
  '.....................aaaaaacwccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccwcaaaaaa',
  '............................aaaaaaacwccccccccccccccccccccccccccccccccccccccccccccccwcaaaaaaa',
  '....................................aaaaaaaabwbbbbbbbbbbbbbbbbbbbbbbbbbbbbwbaaaaaaaa',
  '............................................aaaaaaaabbbbbbbbbbbbbbbbaaaaaaaa',
  '...................................................aaaaaaaaaaaaaaaaaa',
], { at: [60, 18], ramps: { accent: 'pink' } });

// Starry Night: the comet rug. A long indigo tail that narrows in steps to a
// point, a few sparks in it, and a gold star for the head.
drawn('cometRug', [
  '..........................................................................................................rr',
  '.........................................................................................................rttr',
  '..........................aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..........rtuutr',
  '..............aaaaaaaaaaaaddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddrrrrrrrrrrtuuuutrrrrrrrrrr',
  '......aaaaaaaaddddddwdddddddddddddddddddddwddddddddddddddddddddddddwdddddddddddddddddddwdddddddrtuuuuuuuuuuuuuuuuuuuutr',
  '..aaaadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddrrtuuuuuuuuuuuuuutrr',
  'aadddddddddddwddddddddddddddddddddddddwddddddddddddddddddddddwdddddddddddddddddddddwdddddddddddddddrrtuuuuuuuuuutrr',
  'addcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccrtuuuuuuuuuutr',
  'aacccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccrtuuuuttuuuutr',
  '..aaaaccccccccccccccwccccccccccccccccccccccccwcccccccccccccccccccccccwcccccccccccccccccccwccccccccrtuuttrrttuutr',
  '......aaaaaaaaccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccbbbbbbbbbbbbbbbbbbbbbbbbrtttrr....rrtttr',
  '..............aaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbaaaarrr..........rrr',
  '..........................aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
], { at: [60, 12], ramps: { accent: 'indigo', roof: 'gold' } });

// Seaside: the fish rug. A fat fish facing right: a forked tail, a fin on its
// back and one below, three white bands across its body and a round eye.
drawn('fishRug', [
  '..................................................aaaaaaaaaaaaaaaaa',
  '..............................................aaaadddddddddddddddddaaaa',
  '.aaa..............................aaaaaaaaaaaadddddddddddddddddddddddddaaaaaaaaaaaaaaaaaa',
  'adddaa......................aaaaaaddddddwwwwwdddddddddddwwwwwdddddddddddwwwwwddddddddddddaaaaa',
  'adddddaa................aaaaddddddddddddwwwwwdddddddddddwwwwwdddddddddddwwwwwdddddddddddddddddaaaa',
  '.addddddaa...........aaaddddddddddddddddwwwwwdddddddddddwwwwwdddddddddddwwwwwdddddddddddddddddddddaaa',
  '.adddddddaa........aadddddddddddddddddddwwwwwdddddddddddwwwwwdddddddddddwwwwwdddddddddddddddddwwwddddaaa',
  '..addddddddaaa...aadddddddddddddddddddddwwwwwdddddddddddwwwwwdddddddddddwwwwwdddddddddddddddddwkwdddddddaa',
  '..acccccccccccaaaaacccccccccccccccccccccwwwwwcccccccccccwwwwwcccccccccccwwwwwcccccccccccccccccwwwcccccccccaa',
  '..acccccccccccaaaaacccccccccccccccccccccwwwwwcccccccccccwwwwwcccccccccccwwwwwcccccccccccccccccccccccccccccccaa',
  '..accccccccaaa...aacccccccccccccccccccccwwwwwcccccccccccwwwwwcccccccccccwwwwwcccccccccccccccccccccccccccaa',
  '.acccccccaa........aacccccccccccccccccccwwwwwcccccccccccwwwwwcccccccccccwwwwwccccbbbbbbbbbbbbbbbbbbbbaaa',
  '.accccccaa...........aaabbbbbbbbbbbbbbbbmmmmmbbbbbbbbbbbmmmmmbbbbbbbbbbbmmmmmbbbbbbbbbbbbbbbbbbbbbaaa',
  'acccccaa................aaaabbbbbbbbbbbbmmmmmbbbbbbbbbbbmmmmmbbbbbbbbbbbmmmmmbbbbbbbbbbbbbbbbbaaaa',
  'acccaa......................aaaaaabbbbbbmmmmmbbbbbbbbbbbmmmmmbbbbbbbbbbbmmmmmbbbbbbbbbbbbaaaaa',
  '.aaa..............................aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  '....................................................aabbbbbbbbbbaa',
  '......................................................aaaaaaaaaa',
], { at: [55, 17], ramps: { accent: 'sky' } });

// Modern: the shag rug. A soft cream shape with a wavy edge, darker toward the
// front, with short ticks of pile all over it.
drawn('hideRug', [
  '......................aaaaaaaaaaaaaaaaaaaaaaa.............aaaaaaaaaaaaaaaaaaaaaaa',
  '..............aaaadddddddcdddddddddddcddddddddaaaaaaaaaaaaadddddddcddddddddddddcdddddddaaaa',
  '........aaadddcddddddddddddddcdddddddddddddcdddddddddddcdddddddddddddcdddddddddddcddddddddaaa',
  '....aadddddddddcddddddddddddddddcdddddddddddddddcdddddddddddddcddddddddddddddddcddddddddddddddaa',
  '..adddcdddddddddddddcdddddddddddddcddddddddddddddddcddddddddddddcdddddddddddddcddddddddddddcdddddda',
  '.addddddddddcddddddddddddcdddddddddddddddcdddddddddddddcdddddddddddddddcdddddddddddcdddddddddddddda',
  'addddcdddddddddddcddddddddddddddcdddddddddddddcddddddddddddddddcddddddddddcddddddddddddddcdddddddda',
  'adddddddddcddddddddddddcdddddddddddddcdddddddddddddddcdddddddddddddcdddddddddddddcddddddddddddcdddda',
  '.addcdddddddddddcdddddddddddddcddddddddddddcdddddddddddddcdddddddddddddddcdddddddddcddddddddddddddda',
  'adddddddcdddddddddddddcdddddddddddcdddddddddddddddcdddddddddddcddddddddddddddcddddddddddddcddddddda',
  'accccccccccbcccccccccccccbcccccccccccccccbcccccccccccccbccccccccccccccbcccccccccccccccbccccccccccca',
  '.acccbcccccccccccccbcccccccccccbccccccccccccccbccccccccccccbcccccccccccccbcccccccccbcccccccccccccca',
  '..acccccccccbccccccccccccbccccccccccccbcccccccccccccbccccccccccccccbccccccccccccbcccccccccbcccccca',
  '.....aacccbccccccccccbccccccccccccccbcccccccccccbcccccccccccccbccccccccccbcccccccccccccbccccccaa',
  '.........aaaccccccbccccccccccccbcccccccccccccbccccccccccbccccccccccccbccccccccccbccccccccaaa',
  '................aaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbaaaa',
  '..........................aaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbaaaaaa',
  '....................................aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
], { at: [50, 17], ramps: { accent: 'cream' } });

// Forest Cabin: the leaf rug. One big leaf with its tip to the left and its
// stalk to the right, a midrib and five pairs of veins running toward the tip.
drawn('rugLeaf', [
  '............................................ooooooooooooooooooooooooooooooooooooooooo',
  '..................................ooooLSSLLLLLLLLLLLLLLLLSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMoooo',
  '..........................ooLLLLLLLLLLLLLLSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMoo',
  '....................oLLMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMMMo',
  '...............oLLMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMMMo',
  '...........oLMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMMMo',
  '........oLMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMMo',
  '.....oLMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMo',
  '...oLMMMMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMo',
  '.oLMMMMMMMMMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMo',
  'oLMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMooo',
  'oSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSooo',
  '.oMMMMMMMMMMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMSo',
  '...oMMMMMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSo',
  '.....oMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMSo',
  '........oMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMSo',
  '...........oMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMMSo',
  '...............oMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMMSo',
  '....................oMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMMMMMSo',
  '..........................ooMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSMMMMMMMMMMMMMMMMSSSSSSSSSSSSSSSSSSSSSoo',
  '..................................ooooMSSMMMMMMMMMMMMMMMMSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSoooo',
  '............................................ooooooooooooooooooooooooooooooooooooooooo',
], { at: [60, 21], ramps: { leaf: 'green' } });

// Sweetheart: the bath mat. A towelling mat with rounded corners, a white band
// at each end and a white heart in the middle.
drawn('bathMat', [
  '......aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  '...aaaddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddaaa',
  '.aaddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddaa',
  'addwwwdddddddddddddddddddddddddddddddddwwdddwwddddddddddddddddddddddddddddddddwwwdda',
  'addwwwddddddddddddddddddddddddddddddddwwwwdwwwwdddddddddddddddddddddddddddddddwwwdda',
  'addwwwddddddddddddddddddddddddddddddddwwwwwwwwwdddddddddddddddddddddddddddddddwwwdda',
  'accwwwcccccccccccccccccccccccccccccccccwwwwwwwccccccccccccccccccccccccccccccccwwwcca',
  'accwwwccccccccccccccccccccccccccccccccccwwwwwcccccccccccccccccccccccccccccccccwwwcca',
  'accwwwcccccccccccccccccccccccccccccccccccwwwccccccccccccccccccccccccccccccccccwwwcca',
  '.aabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbmbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbaa',
  '...aaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbaaa',
  '......aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
], { at: [42, 11], ramps: { accent: 'pink' } });

// Starry Night: the moon mat. A crescent with its horns toward the front, a few
// sparks on it, and a gold star lying in the curve of it.
drawn('moonMat', [
  '......................aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  '..............aaaaaaaaddddddddddddddddddddddddddddddddddddaaaaaaaa',
  '........aaaaaaddddddddddddddwdddddddddwdddddddddddddddddddddddddddaaaaaa',
  '....aaaaddddddddwdddddddddddddddddddddddddddddddddddwddddddddddddddccccaaaa',
  '..aaddddddddddddddddddddddddccccccccccccccccccccccccccccccccccccccccccccbbbaa',
  '.adddddddddddddddccccccccccccaaaaaaaaaaaaaaaaaaaaaaaaaaaaccccccccccccccbbbbbbbbba',
  'adddddddddccccccccaaaaaaaaaa.............r..............aaaaaaaaccccccccbbbbbbbbba',
  'acccccccccccaaaaaa......................rur.....................aaaaacccbbbbbbbbba',
  '.accccccaaaa.........................rrrruurrrr.......................aaaabbbbbba',
  '..aaaaaa..............................rttutsr.............................aaaaaa',
  '.......................................rtrsr',
  '......................................rr...rr',
], { at: [41, 11], ramps: { accent: 'indigo', roof: 'gold' } });

// Forest Cabin: the log mat. A slice across a trunk: bark round the edge, pale
// rings and darker ones in turn, the pith in the middle.
drawn('logMat', [
  '..........................pppppppppppppppppppppppppppppp',
  '..............ppppppPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPpppppp',
  '.......ppppPPPPPPPPPPqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqPPPPPPPPPPpppp',
  '...pppPPPPPPPPqqqqqqqqqqPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPqqqqqqqqqqPPPPPPPPppp',
  '.ppPPPPPPqqqqqqqqPPPPPPPPPPqqqqqqqqqqqqqqqqqqqqqqqqqqqqPPPPPPPPPPqqqqqqqqPPPPPPpp',
  'pPPPPPPqqqqqqqPPPPPPPPPqqqqqqqqqqPPPPPPPPPPPPPPPPqqqqqqqqqqPPPPPPPPPqqqqqqqPPPPPPp',
  'pPPPPPPqqqqqqqPPPPPPPPPqqqqqqqqqqPPPPPPPppPPPPPPPqqqqqqqqqqPPPPPPPPPqqqqqqqQQQQQQp',
  'pPPPPPPqqqqqqqPPPPPPPPPqqqqqqqqqqPPPPPPPPPPPPPPPPqqqqqqqqqqPPPPPPPPPqqqqqqqQQQQQQp',
  '.ppQQQQQQqqqqqqqqPPPPPPPPPPqqqqqqqqqqqqqqqqqqqqqqqqqqqqPPPPPPPPPPqqqqqqqqQQQQQQpp',
  '...pppQQQQQQQQqqqqqqqqqqPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPqqqqqqqqqqQQQQQQQQppp',
  '.......ppppQQQQQQQQQQqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqQQQQQQQQQQpppp',
  '..............ppppppQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQpppppp',
  '..........................pppppppppppppppppppppppppppppp',
], { at: [41, 12], ramps: { wood: 'brown' } });

// Seaside: the starfish mat. Five arms, one toward the back, one to each side
// and two toward the front, paler along the back edge, with a few pale spots.
drawn('starfishMat', [
  '......................................aaaa',
  '.....................................addcca',
  '....................................adddccca',
  '....................................addwccca',
  'aaaaaa.............................adddccccca.............................aaaaaa',
  'addddaaaaaaaaaa...................adddcccccca...................aaaaaaaaaacccca',
  '.addddddddddddccccccaaaaaaaaaaaaaaddcwcccccccaaaaaaaaaaaaaaccccccccccccccccccca',
  '..aaddddddddwddddccccccccccccccccccccccccccccccccccccccccccccccwccccccccccbbaa',
  '....aaaddddddddccccccccccccccwcccccccccccccccwccccccccccccccccccccccbbbbbaaa',
  '.......aaaaddddccccccccccccccccccccccccccccccccccccccccccccccbbbbbbbbaaaa',
  '...........aaaadccccccccccccccccccccccccccccccccccccccccccbbbbbbbaaaa',
  '................aaadccccccccccccccccccccccccccccccccccccbbbbbaaa',
  '...............adccccccccccccccccbbbaa....aadccccccccccccccbbbbba',
  '.............adccccccccccccbbbbaaa............aaadccccccccccbbbbbba',
  '...........adccccccccccbbbbaaa....................aaadccccccccbbbbbba',
  '.........adccccccccbbbbaaa............................aaacccccccbbbbbba',
  '........accccccbbbaaa......................................aaaccccbbbbba',
  '........aaaaaaaa................................................aaaaaaaa',
], { at: [40, 17], ramps: { accent: 'orange' } });

// Modern: the pebble mat. Two rows of smooth river pebbles of different
// lengths set in a dark tray.
drawn('pebbleMat', [
  '..eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  '.efeeeeeeffeeeeeeeeffeeeeffeeeeeeeffeeeeeffeeeeeeeeffeeeeffeeeeeeffeeeeeeeffeeeeefe',
  '.eehhhhhheehhhhhhhheehhhheehhhhhhheehhhhheehhhhhhhheehhhheehhhhhheehhhhhhheehhhhhee',
  '.eehggggfeehggggggfeehggfeehgggggfeehgggfeehggggggfeehggfeehggggfeehgggggfeehgggfee',
  '.efeeeeeeffeeeeeeeeffeeeeffeeeeeeeffeeeeeffeeeeeeeeffeeeeffeeeeeeffeeeeeeeffeeeeefe',
  '.efeeeeffeeeeeeeffeeeeeeffeeeeeeeeffeeeeeffeeeeffeeeeeeeeffeeeeeeeffeeeeeeffeeeeefe',
  '.eehhhheehhhhhhheehhhhhheehhhhhhhheehhhhheehhhheehhhhhhhheehhhhhhheehhhhhheehhhhhee',
  '.eehggfeehgggggfeehggggfeehggggggfeehgggfeehggfeehggggggfeehgggggfeehggggfeehgggfee',
  '.efeeeeffeeeeeeeffeeeeeeffeeeeeeeeffeeeeeffeeeeffeeeeeeeeffeeeeeeeffeeeeeeffeeeeefe',
  '..eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
], { at: [41, 9], ramps: { stone: 'slate' } });
