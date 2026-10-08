// The hand-pixelled parts kit. Every pet, founders included, is assembled from
// these parts (see docs/STYLE.md). Every part belongs to exactly one founder's
// line; the founder that owns each part is noted beside it.
//
// Role characters (coloured by the pet's genes):
//   1-4  body ramp: 1 darkest (lit outline), 2 shadow, 3 base, 4 light
//   5-8  accent ramp in the same order
//   e E F  eye colour (mid, dark, light)      - 9 0 +  hair ramp (darkest .. light)
// Fixed colours come from KEY in src/engine/sprite.js (o/k ink, w white, f/P pinks, ...).
// Every part: { spr, pivot: [x, y], ...flags }. Left-side parts are mirrored for the right.

import { sprite } from '../engine/sprite.js';

const P = (rows, pivot, extra = {}) => ({ spr: sprite(rows, extra.key || null), pivot, ...extra });
const ORANGE = { a: 'orange.0', b: 'orange.1', n: 'orange.2', N: 'orange.3' };

// ---------------------------------------------------------------------------
// Eyes (left eye). The right eye is drawn the same way round so the glint stays on the
// lit side; eyes marked `mirror` (pupils that look inward) are flipped. Pivot = eye centre.
export const EYES = {
  droopy:  P(['kkkkk', '.kwk.'], [2, 0]),                                     // Mogumo: a heavy lid, the eye just peeking
  cat:     P(['.kk.', 'kFek', 'kekk', 'kekk', 'kEek', '.kk.'], [2, 3]),      // Kometchi: slit pupils
  dot:     P(['.k.', 'kwk', 'kwk', 'kkk', '.k.'], [1, 2]),                            // Ducklet
  shiny:   P(['.kkk.', 'kwwek', 'kweEk', 'keeEk', 'kFwEk', '.kkk.'], [2, 3]),   // Pipolin: big coloured irises
  sparkle: P(['.kkk.', 'kwwkk', 'kwkkk', 'kkkkk', 'kFFwk', '.kkk.'], [2, 3]),   // Lumipom: dark eyes with two glints
  wide:    P(['.kkk.', 'kwwwk', 'kwwwk', 'kweEk', 'kwEEk', '.kkk.'], [2, 3], { mirror: true }), // Spookit
  gem:     P(['..k..', '.kFk.', 'kFwek', 'keeEk', '.kEk.', '..k..'], [2, 3]),  // Fawnly: faceted, glassy
  heart:   P(['.k.k.', 'kqkqk', 'kQqqk', '.kqk.', '..k..'], [2, 2]),        // Pupplo
  button:  P(['.kk.', 'kwkk', 'kkkk', '.kk.'], [2, 2]),                      // Hamuchi
  star:    P(['.kkk.', 'kkFkk', 'kFwFk', 'kkFkk', '.kkk.'], [2, 2]),             // Gillybop
  sleepy:  P(['k...k', '.kkk.', '.k.k.'], [2, 1]),                       // Sproutle: peaceful closed lids with lashes
  bean:    P(['.kk.', 'kwkk', 'kwkk', 'kkkk', 'kEEk', '.kk.'], [2, 3]),      // Drakko
  pixel:   P(['kkkk', 'kFFk', 'kFek', 'kkkk'], [2, 2]),                      // Bolto: glowing LEDs
  arc:     P(['.kkk.', 'k...k'], [2, 1]),                                    // Nocti: content, half-asleep
};
export const BABY_EYES = P(['kk', 'wk', 'kk'], [1, 1]);

// ---------------------------------------------------------------------------
// Mouths (pivot = top centre)
export const MOUTHS = {
  tiny:   P(['.k.', 'k.k'], [1, 0]),                         // Mogumo: a little bear ∧
  cat:    P(['k.k.k', '.k.k.'], [2, 0]),                     // Kometchi
  bill:   'bill',                                            // Ducklet (drawn as BILL)
  smile:  P(['k...k', '.kkk.'], [2, 0]),                     // Pipolin
  open:   P(['kkkkk', 'kRRRk', '.kqk.', '..k..'], [2, 0]),   // Lumipom: an open D laugh
  fang:   P(['kkkkk', '.wk..'], [2, 0]),                     // Spookit
  ooh:    P(['.k.', 'kqk', '.k.'], [1, 0]),                  // Fawnly
  blep:   P(['kkkkk', '.kqk.', '.kqk.', '..k..'], [2, 0]),   // Pupplo: tongue out
  teeth:  P(['kkkkk', 'kwkwk', '.k.k.'], [2, 0]),            // Hamuchi: buck teeth
  wobble: P(['k.......k', '.kk...kk.', '...kkk...'], [4, 0]), // Gillybop: a wide axolotl smile
  flat:   P(['kkk'], [1, 0]),                               // Sproutle
  grin:   P(['kk.....kk', '.kwwwwwk.', '..kkkkk..'], [4, 0]),      // Drakko
  grill:  P(['kkkkkkk', 'kGkGkGk', 'kkkkkkk'], [3, 0]),            // Bolto
  smirk:  P(['....k', 'kkkk.'], [2, 0]),                     // Nocti
};
export const MOUTH_OPEN = P(['kkk', 'kqk', '.k.'], [1, 0]);

// Ducklet's bill (fixed oranges), drawn under the eyes. Pivot = top centre.
export const BILL = P([
  '..aaaaaaaaa..',
  '.aNNNnnnnnnb.',
  'aNNnknnnknnbo',
  'anbbbbbbbbbbo',
  'obnnnnnnnnnbo',
  '.oobnnnnnboo.',
  '...ooooooo...',
], [6, 0], { key: ORANGE });

// ---------------------------------------------------------------------------
// Noses (pivot = top centre). Mogumo's muzzle is accent coloured with a shiny nose.
export const NOSES = {
  none: null,
  snout: P([                                                   // Mogumo
    '..222222222..',
    '.2887Kkk7762.',
    '288777k777662',
    '2877777777662',
    '2877777777662',
    '.27777777662.',
    '..222222222..',
  ], [6, 0]),
  whiskers: 'whiskers',                                        // Kometchi
  button: P(['.pp.', 'pPpp', '.pp.'], [2, 0]),                             // Pipolin
  dot: P(['Kkk', 'kkk', '.k.'], [1, 0]),                                // Pupplo
};

// Forehead marks (pivot = centre)
export const MARKS = {
  none: null,
  star:    P(['..y..', '.yYy.', 'yyYyy', '.y.y.'], [2, 2]),   // Kometchi
  moon:    P(['.YY', 'Y..', '.YY'], [1, 1]),                    // Spookit
  drop:    P(['.B.', '.B.', 'BsB', 'BBB', '.B.'], [1, 3]),          // Fawnly: a dewdrop
  heart:   P(['.q.q.', 'qQqqq', '.qqq.', '..q..'], [2, 2]),     // Pupplo
  diamond: P(['..l..', '.lil.', 'li.il', '.lil.', '..l..'], [2, 2]),                    // Sproutle
};

// Cheeks (left; mirrored). Pivot = top centre.
export const CHEEKS = {
  none: null,
  blush: P(['fff', 'fff'], [1, 0]),            // Mogumo
  hearts: P(['p.p', 'ppp', '.p.'], [1, 0]),    // Pipolin
  dots: P(['f.f'], [1, 0]),                    // Lumipom
  freckles: P(['n.n', '.n.'], [1, 0]),         // Fawnly
};

// ---------------------------------------------------------------------------
// Ears (left ear; mirrored). Pivot = where the ear meets the head outline.
// `side` ears hang at the side of the head; `front` ears draw over the head.
export const EARS = {
  none: null,
  bear: P([                    // Mogumo: small round half-domes
    '..1111..',
    '.144332.',
    '143ff33o',
    '13fPff3o',
    '13ffff3o',
    '1333332o',
  ], [4, 5]),
  cat: P([                     // Kometchi: upright points with a fur tuft
    '1......',
    '11.....',
    '141....',
    '14f1...',
    '13fwo..',
    '13ffwo.',
    '133ff3o',
    '1333332',
  ], [3, 6]),
  bunny: P([                   // Pipolin
    '.1111.',
    '144332',
    '14PP3o',
    '14PP2o',
    '13PP2o',
    '13PP2o',
    '13PP2o',
    '133PP2o',
    '133PP2o',
    '133P32o',
    '13332o',
    '13332o',
  ], [3, 11]),
  puff: P(['..555..', '.58875.', '5887776', '5877776', '5777666', '.56665.', '..ooo..'], [5, 5]), // Lumipom: pom-poms
  horns: P([                   // Spookit
    'R.......',
    'Rr......',
    'Rqr.....',
    '.Rqro...',
    '.RQqro..',
    '..RQqro.',
    '..RQqrro',
    '...RQrr.',
    '...RQrr.',
  ], [5, 8], { at: 0.3 }),
  antlers: P([                 // Fawnly: branching antlers with a soft fawn ear at the base
    '..n..n.....',
    '..nN.nN....',
    '...nNnN.n..',
    '....nNNnN..',
    '.....nNN...',
    '......nN...',
    '111...nN...',
    '14431.nN...',
    '.143331nN..',
    '..o3332oN..',
    '...oooo....',
  ], [8, 9]),
  floppy: P([                  // Pupplo: long soft ears in the accent colour, ink on the shadow side
    '.5555..',
    '588776o',
    '587776o',
    '577766o',
    '577766o',
    '577766o',
    '.57766o',
    '.57766o',
    '.5766o.',
    '..576o.',
    '..56o..',
    '...oo..',
  ], [4, 1], { side: true, front: true, at: 0.1 }),
  mouse: P([                   // Hamuchi: big thin round ears
    '....1111....',
    '..11443322..',
    '.1443ffff32.',
    '143fPPPPff3o',
    '13fPPfPPPf3o',
    '13fPPPPPff2o',
    '13ffPPPff32o',
    '.133ffff32o.',
    '..o333322o..',
    '....oooo....',
  ], [7, 8]),
  fins: P([                    // Gillybop: three feathery axolotl gills
    '.55.....',
    '5885....',
    '.5885...',
    '..5885..',
    '55.5885.',
    '58855885',
    '.555.588',
    '...5885.',
    '..5885..',
    '.555....',
  ], [7, 5], { side: true, at: 0.3 }),
  leaf: P([                    // Sproutle: veined leaves that fan out
    '555......',
    '58855....',
    '578875...',
    '.5778755.',
    '..5778875',
    '...577665',
    '....55665',
    '......555',
  ], [7, 6], { at: 0.22 }),
  antenna: P([                 // Bolto
    '.oo..',
    'oQqo.',
    'oqro.',
    '.oo..',
    '..G..',
    '..G..',
    '...G.',
    '...G.',
    '..oGo',
  ], [3, 8]),
  wings: P([                   // Nocti: tall bat ears that lean out, ridged inside
    '11......',
    '161.....',
    '.1661...',
    '.16661..',
    '.167661.',
    '.166761.',
    '.1666661',
    '16676661',
    '13333332',
  ], [5, 8]),
};

// ---------------------------------------------------------------------------
// Crests (pivot = bottom centre, sitting on the top of the head)
export const CRESTS = {
  none: null,
  curl: P(['.111.', '14431', '13o13', '.o.13', '..13o', '.13o.'], [2, 5], { front: true }),        // Mogumo
  comet: P([                   // Kometchi: a star with a streak trailing behind the head
    '...........u...',
    '..........uxu..',
    'x.....yyuxYxxxu',
    '.xxyyyyyyuYwxu.',
    '...xxxyy.uxxxu.',
    '.........uxuxu.',
    '........uu...uu',
  ], [9, 9]),
  tuft: P(['1.1.1', '14141', '.141.', '..1..'], [2, 3], { front: true }),                 // Ducklet: three feather sprigs
  bobble: P(['.555.', '58875', '58776', '57766', '.566.'], [2, 3], { front: true }),                 // Pipolin
  halo: P(['..uuuuu..', '.uYYYYYu.', 'uY.....Yu', '.uxxxxxu.', '..uuuuu..'], [4, 9], { front: true }),                       // Lumipom
  bud: P(['..o..', '.oPo.', 'oPfPo', 'ofPfo', '.ofo.', '.lLl.', '..L..'], [2, 6]),            // Fawnly
  star: P(['..u..', '..x..', 'uxYxu', '..x..', '..u..'], [2, 4], { front: true }),         // Hamuchi: a little twinkle
  swirl: P(['.6666.', '6....6', '6.66.6', '6.6..6', '6.666.', '6.....', '.66...'], [3, 6]),  // Gillybop: a curl of water
  sprout: P(['.jj.....jj.', 'jlij...jlij', 'jllLj.jLllj', '.jjlLjLljj.', '...jjLjj...', '....jLj....', '....jLj....', '....jLj....'], [5, 7]), // Sproutle
  flame: P(['....R....', '...RR..R.', '..RaR.RR.', '.RaAaRaR.', '.RaAYAaR.', 'RaAYYYAaR', 'RaAYwYAaR', '.RaAYAaR.', '..RRRRR..'], [4, 8], { front: true }), // Drakko
  horn: P(['..o..', '.oGo.', '.oGo.', 'omGGo', 'oGGgo', 'ooooo'], [2, 5]),                  // Bolto
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
  none: null,
  longtail: P([                // Kometchi: gold-tipped
    '.......11.',
    '......187o',
    '......177o',
    '......132o',
    '......132o',
    '......132o',
    '......132o',
    '......132o',
    '......132o',
    '......132o',
    '.....1332o',
    '.1111132o.',
    '33333322o.',
    'ooooooooo.',
  ], [0, 12], { tail: true }),
  wings: P(['....111.', '..11443o', '.144333o', '14333332', '1332o2o.', '.oo.o...'], [5, 2], { pair: true }), // Ducklet: feathered stubs
  pomtail: P(['.555.', '58875', '58776', '.566.'], [0, 2], { tail: true }),                       // Pipolin: cotton tail
  fairy: P([                   // Lumipom
    '...SSS.......',
    '..SsssSS.....',
    '.SswwssBS....',
    'SsswssssBS...',
    'SsssssssBBS..',
    '.SBssssBBBS..',
    '..SSBsBBSS...',
    '...SsssBS....',
    '..SsssBBS....',
    '...SSBBS.....',
    '....SSS......',
  ], [11, 5], { pair: true }),
  devil: P(grid(13, 11, [      // Spookit
    [10, 0, 'o32o'], [9, 2, '132o'], [8, 4, '132o'], [7, 5, '132o'], [6, 6, '132o'], [5, 7, '132o'],
    [0, 9, 'o'], [1, 8, 'oQo'], [2, 7, 'oQqqo'], [3, 6, 'oQqqqro'], [4, 7, 'orrro'],
  ]), [0, 10], { tail: true }),
  fox: P([                     // Pupplo: big fluffy tail with a cream tip
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
  curly: P(['..111.', '.14o31', '.13.2o', '..1o2o', '....o.'], [0, 3], { tail: true }),         // Hamuchi
  fishtail: P([                // Gillybop: a mint tail with a frilly pink fin
    '.......55..',
    '.....55885.',
    '...5588775.',
    '..11443376.',
    '.14433332o.',
    '1333322oo..',
    'oooooo.....',
  ], [0, 5], { tail: true }),
  butterfly: P(['.555....', '58875...', '58Y8755.', '.587765.', '..5555..', '.5776...', '.57Y5...', '..55....'], [6, 3], { pair: true }), // Sproutle: two-lobed
  dragon: P([                  // Drakko: a thick tail with gold back spikes
    '.........u.',
    '........uY1',
    '.....u..1446',
    '....uY.1433o',
    '....u.1433o.',
    '.u...1433o..',
    'uY..1433o...',
    'u..1433o....',
    '..1433o.....',
    '.1433o......',
    '1433o.......',
    '133o........',
    '1oo.........',
  ], [0, 11], { tail: true }),
  bolt: P([                    // Bolto: a power-cable lightning tail
    '......uu.',
    '.....uYx',
    '....uYxu.',
    '...uYxu..',
    '..uYxxuu.',
    '...uuYxu.',
    '....uYxu.',
    '...uYxu..',
    '.GGuxu...',
    'GgGuu....',
  ], [0, 9], { tail: true }),
  bat: P([                     // Nocti: big scalloped bat wings
    '5............',
    '55...........',
    '565.........5',
    '5665.......55',
    '56665.....565',
    '566665...5665',
    '5666665.56665',
    '5666666566665',
    '.5.5.5.56665.',
    '.......5555..',
  ], [11, 4], { pair: true }),
};

// ---------------------------------------------------------------------------
// Hair pieces drawn outside the head (the fringe itself is painted on the head)
export const HAIR = {
  spikes: P([                  // Spookit: three tall spikes
    '.....-.....',
    '.-...-+...-',
    '.-+.-+0..-9',
    '-+0.-+09.-9',
    '-+0-+009-+9',
    '-+00+0009+9',
    '-+000000099',
  ], [5, 6]),
  twintail: P([                // Pipolin (left): ribbon-tied, hanging and curling out
    '...-qq.',
    '..-qRq.',
    '.-++0-.',
    '-+++09o',
    '-++009o',
    '-+0009o',
    '-+0099o',
    '-+0099o',
    '.-009o.',
    '.-009o.',
    '.-009o.',
    '..-09o.',
    '..-09o.',
    '..-09o.',
    '.-+09o.',
    '-+09o..',
    '-+9o...',
    '-09o...',
    '.oo....',
  ], [5, 1]),
  ponytail: P([                // Gillybop: an upswept tail at the back of the crown
    '....-+0.',
    '...-+009',
    '..-+009.',
    '.-+009..',
    '-+009...',
    '-009....',
  ], [1, 5]),
  puff: P(['..--------..', '.-++000000-.', '-++00000000-', '-+000000009-', '-00000000999-', '-99......99-'], [6, 2]), // Sproutle (curly)
};

// Cheek fur tufts (left; mirrored). Pivot = where they meet the head side.
export const TUFT = P(['.555.', '58875', '58776', '57766', '.566.'], [2, 2]); // Hamuchi: stuffed cheek pouches

// ---------------------------------------------------------------------------
// Arms (left; pivot = shoulder)
export const ARMS = {
  // drawn in front of the body, with a soft inner edge and a round hand at the end
  down: P(['.11..', '1442.', '1432.', '14322', '13322', '.ooo.'], [3, 1]),
  out:  P(['.11....', '1441112', '1433332', '133222.', '.ooo...'], [6, 1]),
  up:   P(['.11..', '1441.', '1332o', '.143o', '.143o', '..13o', '..13o'], [3, 6]),
};

// Feet (pivot = top centre)
export const FEET = {
  paws: P(['.11111.', '1433332', '1378762', '.ooooo.'], [3, 0]),                         // Mogumo
  legs: P(['13o', '13o', '13o', '13o', 'wwwo', '.oo.'], [1, 0]),                         // Kometchi: slim legs, white socks
  flippers: P(['aNNnnnnnbo', 'onnbnnbnno', '.oooooooo.'], [5, 0], { key: ORANGE }),   // Ducklet
  tiny: P(['.13.', '1332', '.oo.'], [2, 0]),                                            // Pipolin: tiny nubs
  cloud: P(['.mm..mm.', 'mwwmmwwm', 'mwwwwwwG', 'GmwwwwGG', '.GGGGGG.'], [4, 0]),                     // Lumipom: rides a cloud
  claws: P(['.1111.', '14332o', '13332o', '.w.w.w'], [3, 0]),                         // Spookit
  hooves: P(['.13o.', '.13o.', '.13o.', 'nNknn', 'nn.nn'], [2, 0]),                       // Fawnly: split hooves
  stubs: P(['.11111.', '1433332', '13o3o32', '.ooooo.'], [3, 0]),                         // Pupplo: stubby feet with toes
  puffs: P(['.5555.', '588775', '577766', '5.56.5'], [3, 0]),                         // Hamuchi: fluffy feet
  tentacles: P(['1331331', '133o133o', '.13o.13o', '.73o.73o', '..oo..oo'], [4, 0]), // Gillybop
  roots: P(['..nn..', '.nNNn.', 'n.nn.n', 'n.n..n', '..n...'], [3, 0]),             // Sproutle
  talons: P(['..13o.', '.1333o', '13333o', 'u.u.u.'], [3, 0]),                        // Drakko
  wheels: P(['.oooo.', 'oGkkGo', 'okGGko', 'oGkkGo', '.oooo.'], [3, 0]),              // Bolto
  float: null,                                                                        // Nocti: flies
};
