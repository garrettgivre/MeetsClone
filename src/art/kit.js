// The hand-pixelled parts kit. Children are assembled from these parts, drawn
// at the same size and in the same style as the founders (docs/STYLE.md).
// Founder-only parts are transcribed from the founders' own sprites, so a
// child that inherits Mogumo's ears or Ducklet's bill shows exactly those pixels.
//
// Role characters (coloured by the pet's genes):
//   1-4  body ramp: 1 lit outline (darkest), 2 shadow, 3 base, 4 light
//   5-8  accent ramp in the same order
//   e E F  eye colour (mid, dark, light)      - 9 0 +  hair ramp (outline, shadow, base, light)
// Fixed colours come from KEY in src/engine/sprite.js (o/k ink, w white, f/P blush pinks...).
// Every part: { spr, pivot: [x, y], ...flags }. Left-side parts are mirrored for the right.

import { sprite } from '../engine/sprite.js';
import { MOUTHS as MOUTHS_1X, EARS as EARS_1X, CRESTS as CRESTS_1X, BACKS as BACKS_1X, HAIR_PARTS as HAIR_1X } from './parts.js';

const P = (rows, pivot, extra = {}) => ({ spr: sprite(rows, extra.key || null), pivot, ...extra });

/** Recolour a founder grid into kit roles. */
const remap = (rows, map) => rows.map(r => [...r].map(c => (c in map ? map[c] : c)).join(''));
/** Body-coloured founder chars (O lit outline, 1 shadow, 2 base, 3 light) to body roles. */
const BODY = { O: '1', 1: '2', 2: '3', 3: '4' };

// ---------------------------------------------------------------------------
// Eyes (left eye; mirrored). Pivot = eye centre.
export const EYES = {
  bean:    P(['.kk.', 'kwkk', 'kwkk', 'kkkk', 'kEEk', '.kk.'], [2, 3]),   // Kometchi
  button:  P(['.kk.', 'kwkk', 'kkkk', '.kk.'], [2, 2]),
  dot:     P(['kk', 'wk', 'kk', 'kk'], [1, 2]),                          // Ducklet
  shiny:   P(['.kk.', 'kwwk', 'kwek', 'keek', 'kFFk', '.kk.'], [2, 3]),   // Pipolin
  sparkle: P(['.kk.', 'kwwk', 'kwkk', 'keek', 'kFek', '.kk.'], [2, 3]),   // Lumipom
  wide:    P(['.kkk.', 'kwwwk', 'kwwwk', 'kweEk', 'kwEEk', '.kkk.'], [2, 3]), // Spookit
  sleepy:  P(['kkkkk', 'kwkkk', 'kkkkk', '.kkk.'], [2, 2]),
  droopy:  P(['..kkk', 'kkkkk', 'kwEEk', '.kkk.'], [2, 2]),              // Mogumo
  arc:     P(['.kk.', 'k..k'], [2, 1]),
  cat:     P(['.kk.', 'keFk', 'kekk', 'kekk', 'keek', '.kk.'], [2, 3]),
  star:    P(['..y..', '.yYy.', 'yyYyy', '.yYy.', 'y...y'], [2, 2]),
  gem:     P(['.F.', 'FwF', 'eee', 'eEe', '.E.'], [1, 2]),
  heart:   P(['.q.q.', 'qQqqq', '.qqq.', '..q..'], [2, 2]),
};
export const BABY_EYES = P(['kk', 'wk', 'kk'], [1, 1]);
export const LASH = P(['k'], [0, 0]);

// ---------------------------------------------------------------------------
// Mouths (pivot = top centre). Most keep their simple 1x shapes.
export const MOUTHS = {
  ...MOUTHS_1X,
  tiny: P(['k.k.k', '.k.k.'], [2, 0]),   // Mogumo's little ω
  open: P(['kkkkk', 'kRqRk', '.kkk.'], [2, 0]),
};
export const MOUTH_OPEN = P(['kkk', 'kqk', '.k.'], [1, 0]);
export const MOUTH_CHEW = P(['kkk'], [1, 0]);
export const MOUTH_SAD = P(['.kk.', 'k..k'], [2, 0]);

// Ducklet's bill (fixed oranges), drawn over the lower face. Pivot = top centre.
export const BILL = P([
  '..aaaaaaaaaaaa..',
  '.aNNNNnnnnnnnbo.',
  'aNNnnnnnnnnnnnbo',
  'oabkkkkkkkkkkbao',
  'obnnnnnnnnnnnbbo',
  '.obbnnnnnnnnbbo.',
  '..oooooooooooo..',
], [8, 0], { key: { a: 'orange.0', b: 'orange.1', n: 'orange.2', N: 'orange.3' } });

// ---------------------------------------------------------------------------
// Noses. Mogumo's muzzle (accent coloured) with its shiny nose; pivot = top centre.
export const NOSES = {
  none: null,
  dot: P(['kk'], [1, 0]),
  button: P(['pp'], [1, 0]),
  snout: P(remap([
    '..111111111..',
    '.1CCckKkkkcc1',
    '1CCccckkkcccd1',
    '1Cccccckccccdd1',
    '1cccccccccdddd1',
    '.1cccccccdddd1.',
    '..11111111111..',
  ], { 1: '2', C: '8', c: '7', d: '6' }), [7, 0]),
  whiskers: 'whiskers',
};

// Forehead marks (pivot = centre)
export const MARKS = {
  none: null,
  star:    P(['..y..', '.yYy.', 'yyYyy', '.y.y.'], [2, 2]),   // Kometchi
  moon:    P(['.YY', 'Y..', '.YY'], [1, 1]),                    // Spookit
  heart:   P(['.q.q.', 'qQqqq', '.qqq.', '..q..'], [2, 2]),
  drop:    P(['.B.', 'BsB', 'BBB', '.B.'], [1, 2]),
  diamond: P(['.V.', 'VfV', '.V.'], [1, 1]),
};

// Cheeks (left; mirrored). Pivot = top centre.
export const CHEEKS = {
  none: null,
  blush: P(['fff', 'fff'], [1, 0]),            // Mogumo, Lumipom
  hearts: P(['q.q', 'qqq', '.q.'], [1, 0]),    // Pipolin
  dots: P(['f.f'], [1, 0]),
  freckles: P(['n.n', '.n.'], [1, 0]),
};

// ---------------------------------------------------------------------------
// Ears (left ear; mirrored). Pivot = where the ear meets the head outline.
// `side` ears hang at the side of the head; `front` ears draw over the head.
export const EARS = {
  ...Object.fromEntries(Object.entries(EARS_1X).filter(([k]) => ['antenna', 'leaf', 'fins', 'flower', 'wings', 'antlers', 'pigtail'].includes(k))),
  none: null,
  bear: P(remap([            // Mogumo
    '..OOOO..',
    '.O3322o.',
    'O32ff22o',
    'O2fPff2o',
    'O2fff22o',
    'O222221o',
    '.o2221o.',
    '..oooo..',
  ], BODY), [5, 6]),
  mouse: P(remap([
    '...OOOO...',
    '..O3322o..',
    '.O332222o.',
    'O32ffff22o',
    'O2fPPff22o',
    'O2fPfff21o',
    'O2ffff221o',
    '.O222221o.',
    '..o2211o..',
    '...oooo...',
  ], BODY), [6, 7]),
  cat: P(remap([             // Kometchi
    'O......',
    'OO.....',
    'O3O....',
    'O3fo...',
    'O3ffo..',
    'O2fffo.',
    'O22ff2o',
    'O222221',
  ], BODY), [4, 7]),
  bunny: P(remap([           // Pipolin
    '.OOOO.',
    'O3322o',
    'O3PP1o',
    'O3PP1o',
    'O3PP1o',
    'O3PP1o',
    'O3PP1o',
    'O33PP1o',
    'O33PP1o',
    'O33P21o',
    'O3221o',
    'O3222o',
  ], BODY), [3, 11]),
  floppy: P(remap([
    '.OOOO.',
    'O3322o',
    'O3222o',
    'O2221o',
    'O2221o',
    'O2211o',
    '.O211o',
    '.O111o',
    '..o1o.',
    '...o..',
  ], { O: '5', 1: '6', 2: '7', 3: '8' }), [4, 0], { side: true, front: true }),
  puff: P(['..666..', '.6887o.', '688777o', '687777o', '677766o', '.o666o.', '..ooo..'], [5, 5]), // Lumipom
  horns: P([                 // Spookit
    'Ro......',
    '.RQo....',
    '.RQqo...',
    '..RQqo..',
    '..RQqro.',
    '...RQrro',
    '...RQrr.',
  ], [5, 6]),
};

// ---------------------------------------------------------------------------
// Crests (pivot = bottom centre, sitting on the top of the head)
export const CRESTS = {
  ...CRESTS_1X,
  none: null,
  comet: P([                 // Kometchi
    '.........u....',
    '........uYu...',
    '..xYYuuuYYYuuu',
    'xxxYY.uYYYYxu.',
    '.xxY...uYYxu..',
    '.....uYu.uxu..',
    '......uu...uu.',
  ], [9, 6], { front: true }),
  tuft: P(remap(['..OO', '.O3o', 'O3o.', 'O3o.'], BODY), [1, 3]), // Ducklet
};

// ---------------------------------------------------------------------------
// Back parts. Tails attach on the right at their base pivot; `pair` wings are
// mirrored on both sides with the root pivot against the body.
const grid = (w, h, placements) => {
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  for (const [r, c, s] of placements) [...s].forEach((ch, i) => { if (ch !== '.') g[r][c + i] = ch; });
  return g.map(r => r.join(''));
};
export const BACKS = {
  ...Object.fromEntries(Object.entries(BACKS_1X).filter(([k]) => ['wings', 'bat', 'butterfly', 'fishtail', 'shell'].includes(k))),
  none: null,
  longtail: P(remap([        // Kometchi, gold tip -> accent
    '.......OO.',
    '......OYyo',
    '......Oyyo',
    '......O21o',
    '......O21o',
    '......O21o',
    '......O21o',
    '......O21o',
    '......O21o',
    '......O21o',
    '.....O221o',
    '.OOOOO21o.',
    '22222211o.',
    'ooooooooo.',
  ], { ...BODY, Y: '8', y: '7' }), [0, 12], { tail: true }),
  devil: P(remap(grid(13, 11, [     // Spookit
    [10, 0, 'o21o'], [9, 2, 'O21o'], [8, 4, 'O21o'], [7, 5, 'O21o'], [6, 6, 'O21o'], [5, 7, 'O21o'],
    [0, 9, 'o'], [1, 8, 'oQo'], [2, 7, 'oQqqo'], [3, 6, 'oQqqqro'], [4, 7, 'orrro'],
  ]), BODY), [0, 10], { tail: true }),
  pomtail: P(['88o.', '776o', '76o.'], [0, 1], { tail: true }), // Pipolin
  fairy: P(remap([           // Lumipom
    '...BBB.......',
    '..BsssBB.....',
    '.BswwssSB....',
    'BsswssssSB...',
    'BsssssssSSB..',
    '.BSssssSSSB..',
    '..BBSsSSBB...',
    '...BsssSB....',
    '..BsssSSB....',
    '...BBSSB.....',
    '....BBB......',
  ], { s: 's', S: 'B', B: 'S' }), [11, 5], { pair: true }),
  fox: P([
    '.....111.',
    '....1TTTo',
    '...1TTTco',
    '...14Tcco',
    '..14433co',
    '..143333o',
    '.1443332o',
    '.1433332o',
    '1443332o.',
    '1433322o.',
    '133322o..',
    '13322o...',
    '1222o....',
    'oooo.....',
  ], [0, 12], { tail: true }),
  curly: P(['.111.', '14o31', '13.2o', '.1o2o', '...o.'], [0, 3], { tail: true }),
  bolt: P([
    '......11.',
    '.....143o',
    '....143o.',
    '...143o..',
    '..14311o.',
    '...o1433o',
    '....143o.',
    '...143o..',
    '.7713o...',
    '766o.....',
  ], [0, 9], { tail: true }),
  dragon: P([
    '........7.',
    '.......776',
    '..7...1446',
    '.77..1433o',
    '.7..1433o.',
    '...1433o..',
    '.7143 3o..'.replace(' ', '3'),
    '71433o....',
    '1433o.....',
    '133o......',
    '1oo.......',
  ], [0, 9], { tail: true }),
};

// ---------------------------------------------------------------------------
// Hair pieces drawn outside the head (the fringe itself is painted on the head)
export const HAIR = {
  ...HAIR_1X,
  spikes: P(remap(grid(16, 5, [   // Spookit
    [0, 7, 'oo'], [1, 6, 'oNno'], [2, 6, 'oNIo'], [3, 5, 'oNnnIo'], [4, 4, 'oNnnnnIo'],
    [2, 1, 'oo'], [3, 1, 'oNo'], [4, 0, 'oNnIo'], [2, 13, 'oo'], [3, 12, 'oNo'], [4, 11, 'oNnIo'],
  ]), { N: '+', n: '0', I: '9', i: '-' }), [8, 4]),
  twintail: P([                   // Pipolin (left): tapered, curling out at the tip
    '..-----',
    '.-xxx..',
    '.-++0..',
    '-+++0..',
    '-++00..',
    '-++00..',
    '-++009.',
    '.-+009.',
    '.-+009.',
    '..-+09.',
    '..-+09.',
    '...-09o',
    '..-+09o',
    '.-+09o.',
    '-+09o..',
    '-99o...',
    '.oo....',
  ], [6, 1]),
};

// Cheek fur tufts (left; mirrored). Pivot = where they meet the head side.
export const TUFT = P(['o...', '13o.', '1433', '13o.', 'o...'], [3, 2]);

// ---------------------------------------------------------------------------
// Arms (left; pivot = shoulder). Feet (pivot = top centre).
export const ARMS = {
  down: P(['..11.', '.1433', '14433', '14333', '1333.', '.o32o', '..oo.'], [4, 1]),   // Mogumo
  out:  P(['.11111.', '1443333', '.o2222o', '..oooo.'], [6, 1]),
  up:   P(['.11..', '1441.', '1433o', '.1433', '..o32', '...oo'], [4, 5]),
};
export const FEET = {
  float: null,
  stubs: P(['.1111.', '14332o', '.oooo.'], [3, 0]),
  paws: P(['.1111.', '14333o', '13232o', '.oooo.'], [3, 0]),           // Mogumo
  legs: P(['.13o.', '.13o.', '.13o.', '13332o', '.oooo.'], [2, 0]),    // Kometchi
  flippers: P(['aNNnnnnnbo', 'onnbnnbnno', '.oooooooo.'], [5, 0], { key: { a: 'orange.0', b: 'orange.1', n: 'orange.2', N: 'orange.3' } }), // Ducklet
  tiny: P(['1433o', '1322o', '.ooo.'], [2, 0]),                        // Pipolin
};
