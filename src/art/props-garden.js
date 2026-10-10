// The vegetable bed in the garden and what grows in it (src/game/garden.js),
// typed by hand at the fine size. A plant's prop stands on the soil: its
// anchor is the middle of its bottom row.
import { drawn } from './draw.js';

// A wooden trough of dark soil on two stub feet, three planks along the front.
drawn('veggieBed', [
  '.pppppppppppppppppppppppppppppppppppppppppppppp.',
  'pPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPp',
  'pQQpQQQQQpQQQQQQpQQQQQQQQpQQQQQpQQQQQQQpQQQQQQQp',
  'pQQQQQpQQQQQQpQQQQQQQpQQQQQQQQQQQQpQQQQQQQQpQQQp',
  'pppppppppppppppppppppppppppppppppppppppppppppppp',
  'pPqqqqqqqqqqqqqqpPqqqqqqqqqqqqqqpPqqqqqqqqqqqqQp',
  'pPqqqqqqqqqqqqqqpPqqqqqqqqqqqqqqpPqqqqqqqqqqqqQp',
  'pPqqqqQQqqqqqqqqpPqqqqqqqqqQQqqqpPqqqqqqqqqqqqQp',
  'pPqqqqqqqqqqqqqqpPqqqqqqqqqqqqqqpPqqqqQQqqqqqqQp',
  'pPqqqqqqqqqqqqqqpPqqqqqqqqqqqqqqpPqqqqqqqqqqqqQp',
  'pQQQQQQQQQQQQQQQpQQQQQQQQQQQQQQQpQQQQQQQQQQQQQQp',
  'pppppppppppppppppppppppppppppppppppppppppppppppp',
  '...pQQp..................................pQQp...',
  '...pppp..................................pppp...',
], { ramps: { wood: 'brown' } });

// A seedling: two small leaves on a stem.
drawn('sprout', [
  '.oo..oo.',
  'oLMooMSo',
  '.oMMMSo.',
  '..oMSo..',
  '...oo...',
  '...oo...',
], { ramps: { leaf: 'green' } });

// A young plant: a stem with leaves out to both sides.
drawn('leafy', [
  '....oo......',
  '...oLMo.oo..',
  '..oLMMooLMo.',
  '.oo.oMMoMMSo',
  'oLMo.oMMMSo.',
  'oMMMooMMSo..',
  '.oMMMMMSooo.',
  '..oSMMMMMMSo',
  '...ooMMSSoo.',
  '.....oMSo...',
  '.....oMSo...',
  '......oo....',
], { ramps: { leaf: 'green' } });

// A tomato plant tied to a cane, with three ripe tomatoes.
drawn('ripeTomato', [
  '......pq......',
  '...oo.pq.oo...',
  '..oLMopqoMSo..',
  '.oLMMMpqMMMSo.',
  '.oMMrrpqMMSSo.',
  'oLMrutrqMrrSSo',
  'oMMrttrqruttSo',
  '.oMMrrpqrttrSo',
  '.oSMMMpqMrrSo.',
  '..oMMrrqMMSo..',
  '..oMrutrMSo...',
  '...orttroo....',
  '....orrpq.....',
  '....oMSpq.....',
  '.....oopq.....',
  '......pq......',
], { ramps: { leaf: 'green', roof: 'red', wood: 'brown' } });

// Carrots: feathery tops, and the orange shoulders of three roots showing above the soil.
drawn('ripeCarrot', [
  '..o....o....o...',
  '.oLo..oLo..oLo..',
  'oLMo.oLMSo.oMSo.',
  '.oMSooMMSooMSo..',
  '..oMSoMSoMSoo...',
  '.oLMSoMSoMMSo...',
  '..oMSooMSoSo....',
  '..oaao.aao.aao..',
  '.oadcaoadcaoadca',
  '.oacbaoacbaoacba',
  '..aaa..aaa..aaa.',
  '................',
], { ramps: { leaf: 'green', accent: 'orange' } });

// A strawberry plant: broad leaves, a white flower, and berries hanging at the sides.
drawn('ripeStrawberry', [
  '.....oooo.....',
  '...ooLLMMoo...',
  '..oLLMwwMMSo..',
  '.oLMMwuwMMMSo.',
  'oLMMMMwwMMMSSo',
  'oMMMSMMMMSMMSo',
  '.oorrSMMSrroo.',
  '.orutroorutro.',
  '.orttr..rttro.',
  '..orr....rro..',
  '...o......o...',
  '..............',
], { ramps: { leaf: 'green', roof: 'red' } });

// A pumpkin sitting on the soil under a big leaf, its vine curling away.
drawn('ripePumpkin', [
  '....oooo..........',
  '..ooLLMMoo...oo...',
  '.oLLMMMMMSo.oMSo..',
  '.oLMMMMMSSooMSo...',
  '..oSMMSSooMMSo....',
  '...oooopqoooo.....',
  '...oaaapqaaao.....',
  '..oaddcacdccao....',
  '.oadccacccacbao...',
  '.oadccacccacbao...',
  '.oaccbacbbacbao...',
  '..oabbabbbabao....',
  '...oaaaaaaaao.....',
  '..................',
], { ramps: { leaf: 'green', accent: 'orange', wood: 'brown' } });
