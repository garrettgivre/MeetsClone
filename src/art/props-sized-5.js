// Every remaining piece brought to the size a pet can use (see "Furniture
// sizes" in CLAUDE.md). Most are made bigger by repeating part of their own
// hand-typed drawing with stretch() from draw.js: more of a pole, a trunk, a
// tower, a door or a leg, or more of the middle of a bed, a bench or a rug.
// The fir is drawn again from scratch, because a fir is all boughs.
// This file is loaded last, after every drawing it changes.
import { drawn, stretch } from './draw.js';

// ---------------------------------------------------------------- the fir, full size
// Six tiers of drooping boughs with lighter tips and a few cones, on a short straight trunk.
drawn('firTree', [
  '............................................o',
  '...........................................oLo',
  '...........................................oLo',
  '..........................................oLMMo',
  '.........................................oLMMMSo',
  '........................................oLLMMMSSo',
  '.......................................ooLMMMMSSoo',
  '......................................oLLMMMMMMSSSo',
  '....................................ooLLMMMMMMMMSSSoo',
  '...................................oLLMMoMMMMMMoSSSSSo',
  '..................................oLMMoo.oMMMMSo.ooSSSo',
  '...................................ooo..oLMMMMSSo..ooo',
  '.......................................oLLMMMMMSSo',
  '.....................................ooLLMMMMMMMSSoo',
  '...................................ooLLMMMMMMMMMMSSSoo',
  '.................................ooLLMMMMMpMMMMMMMSSSSoo',
  '...............................ooLLMMMMMMMpMMMMMMMMSSSSSoo',
  '..............................oLLMMMoMMMMMMMMMMMMoMMSSSSSSo',
  '.............................oLMMMoo.oMMMMMMMMMSo.ooSSSSSSSo',
  '..............................ooooo..oLMMMMMMMMSSo..oooooo',
  '....................................oLLMMMMMMMMMSSo',
  '..................................ooLLMMMMMMMMMMMSSoo',
  '................................ooLLMMMMMMMMMMMMMMSSSoo',
  '..............................ooLLMMMMMMMMMMMMMpMMMSSSSoo',
  '............................ooLLMMMMMpMMMMMMMMMpMMMMSSSSSoo',
  '..........................ooLLMMMMMMMpMMMMMMMMMMMMMMMSSSSSSoo',
  '.........................oLLMMMMoMMMMMMMMMMMMMMMMMMoMMMSSSSSSo',
  '........................oLMMMMoo.oMMMMMMMMMMMMMMMSo.ooMSSSSSSSo',
  '.........................ooooo..oLLMMMMMMMMMMMMMMSSo..ooooooo',
  '...............................oLLMMMMMMMMMMMMMMMMSSo',
  '.............................ooLLMMMMMMMMMMMMMMMMMMSSoo',
  '...........................ooLLMMMMMMMMMMMMMMMMMMMMMSSSoo',
  '.........................ooLLMMMMMMMMMMMMMMMMMMMMMMMMSSSSoo',
  '.......................ooLLMMMMMMpMMMMMMMMMMMMMMMMpMMMMSSSSSoo',
  '.....................ooLLMMMMMMMMpMMMMMMMMMMMMMMMMpMMMMMSSSSSSoo',
  '...................ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSoo',
  '..................oLLMMMMMoMMMMMMMMMMoMMMMMMMMoMMMMMMMMMoMMSSSSSSSo',
  '.................oLMMMMMoo.oMMMMMMMSo.oMMMMMSo.oMMMMMMSo.ooSSSSSSSSo',
  '..................oooooo....ooooooo....ooooo....oooooo.....oooooooo',
  '..........................oLLMMMMMMMMMMMMMMMMMMMMMMMMMSSo',
  '........................ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMSSoo',
  '......................ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSoo',
  '....................ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSoo',
  '..................ooLLMMMMMMMMMpMMMMMMMMMMMMMMMMMMpMMMMMMMSSSSSoo',
  '................ooLLMMMMMMMMMMMpMMMMMMMMMMMMMMMMMMpMMMMMMMMSSSSSSoo',
  '..............ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSoo',
  '............ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSSoo',
  '...........oLLMMMMMMoMMMMMMMMMMoMMMMMMMMMMoMMMMMMMMMoMMMMMMMMoMSSSSSSSSo',
  '..........oLMMMMMMoo.oMMMMMMMSo.oMMMMMMMSo.oMMMMMMSo.oMMMMMSo.ooSSSSSSSSo',
  '...........ooooooo....ooooooo....ooooooo....oooooo....ooooo.....oooooooo',
  '.....................oLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSo',
  '...................ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSoo',
  '.................ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSoo',
  '...............ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSoo',
  '.............ooLLMMMMMMMMMMMMpMMMMMMMMMMMMMMMMMMMMMMMpMMMMMMMMSSSSSoo',
  '...........ooLLMMMMMMMMMMMMMMpMMMMMMMMMMMMMMMMMMMMMMMpMMMMMMMMMSSSSSSoo',
  '.........ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSoo',
  '.......ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSSoo',
  '.....ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSSSoo',
  '....oLLMMMMMMMoMMMMMMMMMMMoMMMMMMMMMMMoMMMMMMMMMMoMMMMMMMMMMoMMMMMMoSSSSSSSSSo',
  '...oLMMMMMMMoo.oMMMMMMMMSo.oMMMMMMMMSo.oMMMMMMMSo.oMMMMMMMSo.oMMMSo.ooSSSSSSSSo',
  '....ooooooo.....oooooooo....oooooooo....ooooooo....ooooooo....oooo....ooooooooo',
  '.................oLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSo',
  '...............ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSoo',
  '.............ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSoo',
  '...........ooLLMMMMMMMMMMMMMMMpMMMMMMMMMMMMMMMMMMMMMMMMMMpMMMMMMMMMMMSSSSSoo',
  '.........ooLLMMMMMMMMMMMMMMMMMpMMMMMMMMMMMMMMMMMMMMMMMMMMpMMMMMMMMMMMMSSSSSSoo',
  '.......ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSoo',
  '.....ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSSoo',
  '...ooLLMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMSSSSSSSSSoo',
  '..oLLMMMMMMMoMMMMMMMMMMMoMMMMMMMMMMMoMMMMMMMMMMoMMMMMMMMMMoMMMMMMMMoMMMMoSSSSSSSSSSSo',
  '.oLMMMMMMMoo.oMMMMMMMMMSo.oMMMMMMMMMSo.oMMMMMMMMSo.oMMMMMMMMSo.oMMMMMMSo.oMMSo.ooSSSSo',
  '..ooooooooo....ooooooooo....ooooooooo....oooooooo....oooooooo....oooooo....oo..oooooo',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqQqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqQQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqQqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPqqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqQQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqQqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPqqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqQQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqQqQQp',
  '.......................................pPPqqqQQp',
  '.......................................pPPqqqQQp',
  '......................................pPPPqqqQQQp',
  '.....................................pPPPqqqqqQQQp',
  '...................................ppPPqqppqqppQQQpp',
], { at: [43, 106], ramps: { leaf: 'green', wood: 'brown' } });

// ---------------------------------------------------------------- lamps: 85 to 91 high

// ---------------------------------------------------------------- towel stands: 55 to 70 high

// ---------------------------------------------------------------- bathroom cabinets: 88 to 98 high

// ---------------------------------------------------------------- floor plants: 50 to 63 high

// ---------------------------------------------------------------- toy corners
// (the toy rocket and Modern's bench are drawn in props-decor.js itself, which stretches them there)

// ---------------------------------------------------------------- garden trees: 76 to 96 high

// ---------------------------------------------------------------- garden centrepieces

// ---------------------------------------------------------------- garden seats: 66 to 72 wide, seat about 25 to 30 high

// ---------------------------------------------------------------- beds: 100 wide (the front rim keeps its rows)

// ---------------------------------------------------------------- rugs: 98 to 120 wide; bath mats: 78 to 83
stretch('sweetRug', { cols: [[20, 12, 1], [60, 12, 1]] });
stretch('cometRug', { cols: [[30, 24, 1]] });
stretch('fishRug', { cols: [[20, 12, 2], [52, 12, 1]] });
stretch('hideRug', { cols: [[26, 12, 3]] });
stretch('bathMat', { cols: [[10, 12, 1]] });
stretch('moonMat', { cols: [[30, 8, 1]] });
stretch('logMat', { cols: [[8, 10, 1], [44, 10, 1]] });
stretch('starfishMat', { cols: [[8, 8, 1], [46, 8, 1]] });
stretch('pebbleMat', { cols: [[10, 22, 1]] });
