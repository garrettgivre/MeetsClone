// UI icons, foods, toys and status symbols.
import { sprite } from '../engine/sprite.js';

// ---------- Menu icons: hi-res sprites, in their own file ----------
export { MENU_ICONS as ICONS } from './menu-icons.js';

// ---------- Status symbols ----------
export const HEART = sprite(['.oo.oo.', 'oQqoqro', 'oqqqqro', '.oqqro.', '..oro..', '...o...']);
export const HEART_EMPTY = sprite(['.oo.oo.', 'ommommo', 'ommmmmo', '.ommmo.', '..omo..', '...o...']);
export const RICE = sprite(['..oo...', '.owwo..', 'owwwwo.', 'owkkwo.', 'okkkko.', '.oooo..']);
export const RICE_EMPTY = sprite(['..oo...', '.ommo..', 'ommmmo.', 'omggmo.', 'ogggggo', '.oooo..'].map(r => r.slice(0, 7)));
export const COIN = sprite(['.ooo.', 'oYyyo', 'oyuyo', 'oyyuo', '.ooo.']);
export const POOP = sprite([
  ['...o....', '..ono...', '.onNno..', '.onnno..', 'onNnnno.', 'onnnnndo', '.oooooo.'],
  ['....o...', '...ono..', '..onNno.', '..onnno.', '.onNnnno', 'onnnnndo', '.oooooo.'],
]);
export const SKULL = sprite(['.ooooo.', 'ommmmmo', 'okmmmko', 'okmmmko', 'ommkmmo', '.omomo.', '..ooo..']);
export const ZZZ = sprite(['kkkk', '..k.', '.k..', 'kkkk']);
export const ATTN = sprite(['.oo.', 'oqqo', 'oqqo', 'oqqo', '.oo.', '.oo.', 'oqqo', '.oo.']);
export const SPARKLE = sprite([['..Y..', '..Y..', 'YYxYY', '..Y..', '..Y..'], ['.....', '..Y..', '.YxY.', '..Y..', '.....']]);
export const NOTE = sprite(['..ooo', '..o.o', '..o.o', 'ooo.o', 'ooo..']);
export const SWEAT = sprite(['.o.', 'oso', 'oBo', '.o.']);
export const ANGRY = sprite(['q.q', '.q.', 'q.q']);
export const ARROW = sprite(['o..', 'oo.', 'ooo', 'oo.', 'o..']);
export const STINK = sprite([['.l..', 'l.l.', '...l'], ['..l.', '.l.l', 'l...']]);
export const SYRINGE = sprite([
  '.......o',
  '......o.',
  '..oooo..',
  '.oBBGo..',
  'oBBGo...',
  'oBGo....',
  '.oo.....',
]);
export const BROOM_WAVE = sprite(['..ss', '.sBs', 'sBBs', 'sBs.', 'ss..']);
export const MOON = sprite(['.YYY.', 'YYx..', 'Yx...', 'YYx..', '.YYY.']);
export const SUN = sprite(['.y.y.', 'yYYYy', '.YYY.', 'yYYYy', '.y.y.']);
export const RING = sprite(['..oo..', '.osso.', '..oo..', '.oyyo.', 'oy..yo', 'oy..yo', '.oyyo.']);

// ---------- Bath and toilet ----------
// A claw-foot tub (the pet sits behind it), suds along its rim, bubbles, and a
// little toilet.
export const TUB = sprite([
  '.oooooooooooooooooooooooooooooooooooo.',
  'owwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwmmo',
  'owmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmGGo',
  '.oooooooooooooooooooooooooooooooooooo.',
  '..owwwmmmmmmmmmmmmmmmmmmmmmmmmmmmGGo..',
  '..owwmmmmmmmmmmmffmffmmmmmmmmmmmmGGo..',
  '..owwmmmmmmmmmmfPfffpfmmmmmmmmmmmGGo..',
  '..owmmmmmmmmmmmfffffpfmmmmmmmmmmGGGo..',
  '...owmmmmmmmmmmmfffpfmmmmmmmmmmmGGo...',
  '...ommmmmmmmmmmmmfpfmmmmmmmmmmmGGGo...',
  '....ommmmmmmmmmmmmpmmmmmmmmmmmGGGo....',
  '.....omGGGGGGGGGGGGGGGGGGGGGGGGGo.....',
  '.......oooooooooooooooooooooooo.......',
  '......oyyo..................oyyo......',
  '.....oyYuo..................ouYyo.....',
  '.....oooo....................oooo.....',
]);
export const SUDS = sprite([
  [
    '...ss.....sss......ss.....ss..',
    '..swws...swwws.ss.swws...swws.',
    '.swwwwssswwwwwswwswwwwsssswwws',
    'swwwwwwwwwwwwwwwwwwwwwwwwwwwws',
    'swwswwwwwswwwwwwwswwwwwwwswwws',
  ],
  [
    '.....ss......ss.....sss...ss..',
    '.ss.swws.ss.swws...swwws.swws.',
    'swwsswwwswwswwwwssswwwwwswwwws',
    'swwwwwwwwwwwwwwwwwwwwwwwwwwwws',
    'swwwwswwwwwwwswwwwwwswwwwwwsws',
  ],
]);
export const BUBBLE = sprite([['.BBB.', 'Bw..B', 'B...S', 'B...S', '.BSS.'], ['.BB.', 'Bw.S', 'B..S', '.SS.'], ['.B.', 'BwS', '.S.']]);
export const POTTY = sprite([
  '.ooooooo........',
  'owwwwwwmo.......',
  'owwwwwwmo.......',
  'owBBwwwmo.......',
  'owwwwwwmo.......',
  'owwwwwwmo.......',
  'ommmmmmGo.......',
  '.oooooooooooooo.',
  '..owwwwwwwwwwwmo',
  '..oooooooooooooo',
  '...owwwwwwwwmGo.',
  '...owwwwwwwmGGo.',
  '....owwwwwmGGo..',
  '.....owwmmGGo...',
  '....owwmmmmGGo..',
  '....oooooooooo..',
]);
// an old resident's walking stick
export const CANE = sprite([
  '.ooo..',
  'onNno.',
  'ono.no',
  '.o..no',
  '....no',
  '....no',
  '....no',
  '....no',
  '....no',
  '....no',
  '....no',
  '....oo',
]);
export const BROOM_ICON = sprite([
  '.......oo.',
  '......oNo.',
  '.....oNo..',
  '....oNo...',
  '...oNo..Y.',
  '..oyyo.YxY',
  '.oyyyyo.Y.',
  'oyyyyyyo..',
  'oyuyuyuo..',
  '.ooooooo..',
]);
export const BATH_ICON = sprite([
  '..s....s..',
  '.....s....',
  '.oooooooo.',
  'owwwwwwwmo',
  '.oooooooo.',
  '.owwwwmGo.',
  '.owwwmmGo.',
  '..oooooo..',
  '..oy..yo..',
]);
export const POTTY_ICON = sprite([
  'oooo......',
  'owmo......',
  'owmo......',
  'owmooooooo',
  'owmowwwwmo',
  'oooooooooo',
  '..owwwmGo.',
  '...owmGo..',
  '..owwmmGo.',
  '..ooooooo.',
]);

// ---------- Foods (10x10) ----------
export const FOOD_ART = {
  riceball: sprite([
    '....oo....',
    '...owwo...',
    '..owwwwo..',
    '..owwwwo..',
    '.owwwwwwo.',
    '.owwkkwwo.',
    'owwkkkkwwo',
    'owwkkkkwwo',
    '.oooooooo.',
  ]),
  milk: sprite([
    '...oo.....',
    '..oqqo....',
    '...oo.....',
    '..owwo....',
    '..owwo....',
    '.owwwwo...',
    '.owssso...',
    '.owssso...',
    '.owssso...',
    '..oooo....',
  ]),
  omelette: sprite([
    '..........',
    '...oooo...',
    '..oYYYyo..',
    '.oYYqqyyo.',
    'oYYyyqqyyo',
    'oyyyyyyyuo',
    '.ouuuuuuo.',
    'oGGGGGGGGo',
    '.oooooooo.',
  ]),
  noodles: sprite([
    '..o.o.....',
    '..o.o.....',
    '.oxoxoooo.',
    'oxYxYxYxYo',
    'oYxYxYxYxo',
    'oooooooooo',
    '.orrrrrro.',
    '..orrrro..',
    '...oooo...',
  ]),
  curry: sprite([
    '..........',
    '..ooooo...',
    '.owwwwnoo.',
    'owwwwnnnno',
    'owwwnaNnno',
    'owwnnnnaNo',
    '.oGGGGGGo.',
    '..oooooo..',
  ]),
  pancake: sprite([
    '...yyy....',
    '..oooooo..',
    '.oNNNNNno.',
    '.onnnnnno.',
    '.oNNNNNno.',
    '.onnnnnno.',
    '.oNNNNNno.',
    'oGGGGGGGGo',
    '.oooooooo.',
  ]),
  fruitbowl: sprite([
    '...o..o...',
    '..oqo.oLo.',
    '.oqqoaaoo.',
    'oqqqoaAaio',
    'oooooooooo',
    'oBBBBBBBBo',
    '.oSSSSSSo.',
    '..oooooo..',
  ]),
  berrypie: sprite([
    '..........',
    '...oooo...',
    '..obbbbo..',
    '.obbBbbbo.',
    'oNNNNNNNNo',
    'onBbbBbbno',
    'onnnnnnnno',
    '.oooooooo.',
  ]),
  tomatosoup: sprite([
    '..........',
    '...o.o....',
    '..o.o.....',
    'oooooooooo',
    'oqrrqrrrro',
    'oRrrrrrrRo',
    '.oRRRRRRo.',
    '..oooooo..',
  ]),
  lemoncake: sprite([
    '....oo....',
    '...oYyo...',
    '..oooooo..',
    '.oTTTTTTo.',
    '.oYYYYYyo.',
    '.oTTTTTTo.',
    '.oyyyyyuo.',
    'oGGGGGGGGo',
    '.oooooooo.',
  ]),
  grapejelly: sprite([
    '..........',
    '...oooo...',
    '..oVVVvo..',
    '..oVwVvo..',
    '.oVVVVvvo.',
    '.oVVvvvvo.',
    'oGGGGGGGGo',
    '.oooooooo.',
  ]),
  mintpudding: sprite([
    '....oo....',
    '...onno...',
    '..ohhhho..',
    '..ohwhho..',
    '.ohhhhhHo.',
    '.ohhhhHHo.',
    'oGGGGGGGGo',
    '.oooooooo.',
  ]),
  peachbun: sprite([
    '....oo....',
    '...oLo....',
    '..oooooo..',
    '.oPPPffpo.',
    'oPPwPfffpo',
    'oPPPfffppo',
    '.offfpppo.',
    '..oooooo..',
  ]),
  cookie: sprite([
    '..oooooo..',
    '.oNNNNnno.',
    'oNNdNNNnno',
    'oNNNNNdnno',
    'oNdNNNNnno',
    'oNNNNdnnno',
    '.onnnnnno.',
    '..oooooo..',
  ]),
  icecream: sprite([
    '...oooo...',
    '..oPPPpo..',
    '.oPPwPPpo.',
    '.oPPPPppo.',
    '..oooooo..',
    '...oNno...',
    '...oNno...',
    '....oo....',
  ]),
  candy: sprite([
    '..........',
    'o.......o.',
    'oo.ooo.oo.',
    'oqoQqqoqo.',
    'oqoqqroqo.',
    'oo.ooo.oo.',
    'o.......o.',
  ]),
  chips: sprite([
    '..oooooo..',
    '.oaAaAaao.',
    '.oqqqqqqo.',
    '.oqwwwqqo.',
    '.oqyyyqqo.',
    '.oqqqqqqo.',
    '.oaAaAaao.',
    '..oooooo..',
  ]),
  juice: sprite([
    '.....o....',
    '.....o....',
    '..oooooo..',
    '..oaaaao..',
    '..oAAAao..',
    '..oaaaao..',
    '..oaaaao..',
    '...oooo...',
  ]),
  chilipuff: sprite([
    '......oL.',
    '.....oLo.',
    '..ooooo..',
    '.oqqqrro.',
    'oqQqrrro.',
    'orrrrRo..',
    '.oRRoo...',
    '..oo.....',
  ]),
};

// ---------- Toys ----------
export const TOY_ART = {
  ball: sprite([
    '..oooo..',
    '.oQqqro.',
    'oQwqqqro',
    'oqqqqqro',
    'oqqqqrro',
    '.orrrro.',
    '..oooo..',
  ]),
  yoyo: sprite([
    '...o....',
    '...o....',
    '..oooo..',
    '.obBBbo.',
    '.oooooo.',
    '.obbbbo.',
    '..oooo..',
  ]),
  plushie: sprite([
    'oo...oo.',
    'onooono.',
    '.oNNNNo.',
    'oNkNNkNo',
    'oNNnnNNo',
    '.oNNNNo.',
    'oNo..oNo',
    '.o....o.',
  ]),
  kite: sprite([
    '...oo...',
    '..oqQo..',
    '.oqqQQo.',
    'oqqqQQQo',
    '.obbBBo.',
    '..obBo..',
    '...oo...',
    '....o.q.',
    '.....o..',
  ]),
  drum: sprite([
    '.o....o.',
    '..o..o..',
    '.oooooo.',
    'oGwwwwGo',
    'oqrqrqro',
    'oyqyqyqo',
    'oqrqrqro',
    '.oooooo.',
  ]),
  blocks: sprite([
    '..oooo....',
    '..oQqo....',
    '..oqqo....',
    'oooooooo..',
    'oBboxYyo..',
    'obboyyuo..',
    'oooooooo..',
  ]),
};
