// Garden grounds. A ground is not a repeated tile (the owner: "The outside
// floor patterns shouldn't repeat so much, maybe just do pixel art for the
// whole floor area"): it is one flat colour with these small hand-typed
// details set down one by one, each at a place chosen by hand (GROUNDS below),
// so no stretch of it looks like another. Colour roles as in props.js.
import { defineProp } from './props.js';

// ---- grass ----
defineProp('tuftA', [
  '3..3..3',
  '.3.3.3.',
  '..333..',
  '...2...',
]);
defineProp('tuftB', [
  '3...3',
  '.3.3.',
  '..2..',
]);
defineProp('tuftDeep', [
  '2..2..2',
  '.2.2.2.',
  '..222..',
  '...1...',
]);
defineProp('clover', [
  '.33.33.',
  '3333333',
  '.33233.',
  '..333..',
  '...2...',
]);
defineProp('daisy', [
  '..w..',
  '.www.',
  'wwcww',
  '.www.',
  '..w..',
], { ramps: { accent: 'gold' } });
defineProp('starBloom', [
  'w...w',
  '.wcw.',
  '..c..',
  '.wcw.',
  'w...w',
], { ramps: { accent: 'gold' } });
defineProp('lavender', [
  '.x.',
  'xZx',
  '.x.',
  'xZx',
  '.2.',
  '.2.',
], { ramps: { glass: 'violet' } });

// ---- sand ----
defineProp('rippleLong', [
  '......cccccccccc........',
  '...ccc..........cccc....',
  'ccc.................cccc',
], { ramps: { accent: 'gold' } });
defineProp('rippleShort', [
  '...cccccc...',
  'ccc......ccc',
], { ramps: { accent: 'gold' } });
defineProp('glint', [
  '.w.',
  'www',
  '.w.',
]);
defineProp('pebble', [
  '.eee.',
  'ehgfe',
  '.eee.',
], { ramps: { stone: 'slate' } });
defineProp('pawPrint', [
  '.c.c.c.',
  '..c.c..',
  '.......',
  '..ccc..',
  '.ccccc.',
  '..ccc..',
], { ramps: { accent: 'gold' } });

// ---- paving ----
defineProp('slabL', [
  '.ffffffffffffffffffffffffffffffffffffffffffff.',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhghhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhghhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fggggggggggggggggggggggggggggggggggggggggggggf',
  '.ffffffffffffffffffffffffffffffffffffffffffff.',
], { ramps: { stone: 'cream' } });
defineProp('slabM', [
  '.ffffffffffffffffffffffffffffffff.',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhghhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgf',
  'fggggggggggggggggggggggggggggggggf',
  '.ffffffffffffffffffffffffffffffff.',
], { ramps: { stone: 'cream' } });
defineProp('slabS', [
  '.ffffffffffffffffffffff.',
  'fhhhhhhhhhhhhhhhhhhhhhhf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhghhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fhhhhhhhhhhhhhhhhhhhhhgf',
  'fggggggggggggggggggggggf',
  '.ffffffffffffffffffffff.',
], { ramps: { stone: 'cream' } });

// Where each ground's details go: [prop, x, y] in hi-res room pixels (the
// ground runs from y 150 to the bottom at 312), set down by hand, thicker
// toward the edges and thinner where the pet walks.
export const GROUNDS = {
  lawn: [
    ['tuftA', 14, 170], ['daisy', 40, 166], ['tuftB', 70, 172], ['clover', 104, 168], ['tuftA', 140, 164], ['daisy', 170, 170], ['tuftB', 200, 166], ['tuftA', 236, 172],
    ['clover', 20, 196], ['tuftB', 52, 190], ['tuftA', 88, 200], ['daisy', 122, 188], ['tuftB', 160, 198], ['clover', 214, 192], ['tuftA', 246, 202],
    ['daisy', 10, 224], ['tuftA', 44, 230], ['tuftB', 96, 222], ['tuftA', 150, 228], ['daisy', 196, 220], ['tuftB', 232, 232],
    ['tuftA', 24, 258], ['clover', 70, 264], ['tuftB', 118, 252], ['daisy', 164, 262], ['tuftA', 206, 256], ['clover', 244, 266],
    ['tuftB', 12, 288], ['daisy', 56, 294], ['tuftA', 100, 284], ['tuftB', 140, 296], ['tuftA', 184, 288], ['daisy', 226, 298],
    ['tuftA', 36, 308], ['tuftB', 160, 310], ['clover', 200, 308],
  ],
  beach: [
    ['rippleLong', 40, 168], ['rippleShort', 120, 172], ['rippleLong', 200, 166], ['glint', 84, 180], ['pebble', 160, 186], ['rippleShort', 24, 198], ['rippleLong', 110, 204], ['rippleShort', 226, 200], ['glint', 180, 214],
    ['pawPrint', 60, 226], ['pawPrint', 76, 238], ['pawPrint', 94, 228], ['pawPrint', 110, 240], ['rippleShort', 200, 232], ['pebble', 20, 244], ['glint', 236, 250],
    ['rippleLong', 150, 262], ['rippleShort', 40, 270], ['pebble', 110, 276], ['glint', 70, 290], ['rippleLong', 210, 284], ['rippleShort', 130, 300], ['pebble', 244, 304], ['rippleShort', 30, 306],
  ],
  terrace: [
    ['slabM', 30, 178], ['slabL', 100, 180], ['slabS', 160, 176], ['slabM', 214, 178],
    ['slabL', 40, 204], ['slabS', 96, 202], ['slabM', 150, 204], ['slabL', 220, 206],
    ['slabS', 16, 228], ['slabM', 62, 230], ['slabL', 124, 232], ['slabS', 178, 230], ['slabM', 232, 232],
    ['slabL', 36, 258], ['slabM', 100, 258], ['slabS', 152, 256], ['slabL', 212, 258],
    ['slabM', 22, 284], ['slabS', 72, 282], ['slabL', 130, 284], ['slabM', 196, 284], ['slabS', 244, 282],
    ['slabL', 50, 310], ['slabM', 116, 310], ['slabS', 168, 308], ['slabL', 226, 310],
    ['tuftDeep', 68, 172], ['tuftDeep', 188, 198], ['tuftDeep', 92, 250], ['tuftDeep', 172, 278], ['tuftDeep', 8, 300],
  ],
  woodland: [
    ['leafFall', 18, 168], ['mossPatch', 50, 172], ['tinyShroom', 84, 170], ['leafFall', 120, 166], ['tuftDeep', 150, 172], ['acornBit', 184, 168], ['leafFall', 214, 172], ['mossPatch', 244, 168],
    ['acornBit', 10, 196], ['leafFall', 40, 200], ['tuftDeep', 76, 192], ['mossPatch', 112, 202], ['leafFall', 158, 194], ['tinyShroom', 196, 200], ['leafFall', 236, 196],
    ['mossPatch', 24, 228], ['leafFall', 64, 222], ['acornBit', 104, 230], ['tuftDeep', 170, 226], ['leafFall', 208, 232], ['mossPatch', 246, 224],
    ['leafFall', 14, 258], ['tinyShroom', 52, 264], ['leafFall', 110, 256], ['mossPatch', 160, 262], ['acornBit', 200, 258], ['leafFall', 240, 266],
    ['tuftDeep', 30, 290], ['leafFall', 74, 296], ['mossPatch', 124, 288], ['leafFall', 166, 298], ['tinyShroom', 214, 290], ['leafFall', 248, 300], ['acornBit', 96, 310], ['leafFall', 190, 310],
  ],
  // Squiggle Club: flakes, wedges, spots and squiggles scattered over a flat ground (the bits are in props-squiggle-3.js)
  confetti: [
    ['chipFlake', 16, 168], ['chipSquig', 46, 172], ['chipSpot', 82, 168], ['chipWedge', 112, 172], ['chipDash', 146, 166], ['chipFlake', 176, 172], ['chipSquig', 210, 168], ['chipSpot', 244, 172],
    ['chipWedge', 24, 196], ['chipDash', 60, 192], ['chipFlake', 98, 200], ['chipSpot', 132, 192], ['chipSquig', 166, 200], ['chipWedge', 204, 194], ['chipFlake', 238, 202],
    ['chipSpot', 12, 226], ['chipSquig', 50, 232], ['chipFlake', 104, 224], ['chipWedge', 150, 230], ['chipDash', 196, 222], ['chipSpot', 232, 232],
    ['chipFlake', 30, 260], ['chipWedge', 74, 264], ['chipSquig', 122, 256], ['chipSpot', 170, 264], ['chipFlake', 208, 256], ['chipDash', 246, 266],
    ['chipSquig', 18, 290], ['chipSpot', 60, 296], ['chipWedge', 108, 288], ['chipFlake', 146, 298], ['chipSquig', 190, 290], ['chipWedge', 230, 300],
    ['chipDash', 40, 310], ['chipFlake', 92, 310], ['chipSpot', 172, 310], ['chipSquig', 222, 310],
  ],
  // Aqua Breeze: a bright lawn with tufts, clover, daisies and glints of dew (the dew is in props-aqua-3.js)
  dew: [
    ['tuftA', 14, 170], ['dewDrop', 40, 166], ['daisy', 70, 172], ['tuftB', 104, 168], ['dewDrop', 138, 172], ['clover', 170, 166], ['tuftA', 204, 172], ['dewDrop', 240, 168],
    ['dewDrop', 22, 196], ['tuftB', 56, 192], ['clover', 92, 200], ['dewDrop', 126, 190], ['tuftA', 160, 200], ['daisy', 212, 194], ['dewDrop', 246, 202],
    ['tuftA', 12, 226], ['daisy', 48, 232], ['dewDrop', 98, 222], ['tuftB', 150, 230], ['dewDrop', 194, 224], ['clover', 232, 232],
    ['dewDrop', 28, 258], ['tuftA', 72, 264], ['clover', 120, 254], ['dewDrop', 166, 262], ['tuftB', 206, 256], ['daisy', 246, 266],
    ['tuftB', 14, 290], ['dewDrop', 58, 296], ['tuftA', 102, 286], ['daisy', 142, 298], ['dewDrop', 186, 288], ['tuftA', 228, 300],
    ['clover', 40, 310], ['dewDrop', 90, 308], ['tuftB', 164, 310], ['dewDrop', 216, 310],
  ],
  meadow: [
    ['starBloom', 20, 168], ['tuftDeep', 54, 172], ['lavender', 88, 170], ['starBloom', 126, 166], ['tuftDeep', 160, 172], ['lavender', 196, 168], ['starBloom', 234, 172],
    ['lavender', 12, 198], ['tuftDeep', 44, 194], ['starBloom', 80, 202], ['tuftDeep', 118, 192], ['starBloom', 170, 200], ['lavender', 214, 196], ['tuftDeep', 246, 204],
    ['starBloom', 30, 228], ['lavender', 100, 224], ['tuftDeep', 150, 230], ['starBloom', 206, 222], ['lavender', 240, 232],
    ['tuftDeep', 16, 260], ['starBloom', 66, 266], ['lavender', 128, 256], ['tuftDeep', 180, 264], ['starBloom', 228, 258],
    ['lavender', 40, 292], ['starBloom', 96, 288], ['tuftDeep', 140, 298], ['lavender', 188, 290], ['starBloom', 246, 300], ['tuftDeep', 70, 310], ['starBloom', 170, 310],
  ],
};
