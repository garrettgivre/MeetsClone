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
stretch('towelStand', { rows: [[20, 1, 8], [45, 1, 6]] });
stretch('branchRack', { rows: [[15, 1, 6], [35, 1, 8]] });
stretch('towelLadder', { rows: [[1, 1, 2], [10, 1, 2], [20, 1, 3], [28, 1, 2], [36, 1, 3], [44, 1, 3]] });
stretch('towelBasket', { rows: [[10, 2, 10]] });

// ---------------------------------------------------------------- bathroom cabinets: 88 to 98 high
stretch('starWardrobe', { rows: [[30, 1, 44]] });
stretch('trunkCabinet', { rows: [[45, 1, 34]] });
stretch('hutCabinet', { rows: [[20, 1, 8], [30, 1, 6], [55, 1, 14]] });
stretch('shelfUnit', { rows: [[17, 11, 2], [28, 10, 1], [41, 1, 12]] });

// ---------------------------------------------------------------- floor plants: 50 to 63 high
stretch('moonFlower', { rows: [[5, 1, 14], [12, 1, 2], [17, 1, 3], [24, 1, 5]], x: 12 });
stretch('fernBucket', { rows: [[5, 1, 2], [9, 1, 2], [12, 1, 2], [21, 1, 5], [27, 1, 6]] });
stretch('dunePot', { rows: [[8, 1, 6], [12, 1, 6], [16, 1, 4], [23, 1, 2], [25, 1, 2], [29, 1, 2]] });
stretch('legPot', { rows: [[20, 1, 3], [22, 1, 3], [28, 1, 6], [39, 1, 4]] });
stretch('snakePlant', { rows: [[6, 1, 6], [14, 1, 6], [20, 1, 4], [31, 1, 4]] });

// ---------------------------------------------------------------- toy corners
// (the toy rocket and Modern's bench are drawn in props-decor.js itself, which stretches them there)
stretch('logPile', { cols: [[20, 12, 2]], rows: [[8, 8, 1]] });
stretch('sandPail', { cols: [[8, 4, 2]], rows: [[8, 1, 4], [14, 1, 4]] });
stretch('beachBall', { cols: [[3, 2, 1], [7, 2, 1], [12, 2, 1], [17, 2, 1], [21, 2, 1]], rows: [[5, 1, 2], [9, 1, 3], [13, 1, 3], [16, 1, 2]] });
stretch('beanbag', { cols: [[20, 10, 2]], rows: [[15, 1, 10]] });

// ---------------------------------------------------------------- garden trees: 76 to 96 high

// ---------------------------------------------------------------- garden centrepieces

// ---------------------------------------------------------------- garden seats: 66 to 72 wide, seat about 25 to 30 high

// ---------------------------------------------------------------- beds: 100 wide (the front rim keeps its rows)
stretch('heartBasket', { cols: [[20, 12, 1]] });
stretch('moonCradle', { cols: [[47, 6, 2]] });
stretch('leafNest', { cols: [[26, 4, 1], [40, 8, 1]] });
stretch('clamBed', { cols: [[38, 12, 1]] });
stretch('podBed', { cols: [[40, 12, 1]] });

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
