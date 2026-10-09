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
  meadow: [
    ['starBloom', 20, 168], ['tuftDeep', 54, 172], ['lavender', 88, 170], ['starBloom', 126, 166], ['tuftDeep', 160, 172], ['lavender', 196, 168], ['starBloom', 234, 172],
    ['lavender', 12, 198], ['tuftDeep', 44, 194], ['starBloom', 80, 202], ['tuftDeep', 118, 192], ['starBloom', 170, 200], ['lavender', 214, 196], ['tuftDeep', 246, 204],
    ['starBloom', 30, 228], ['lavender', 100, 224], ['tuftDeep', 150, 230], ['starBloom', 206, 222], ['lavender', 240, 232],
    ['tuftDeep', 16, 260], ['starBloom', 66, 266], ['lavender', 128, 256], ['tuftDeep', 180, 264], ['starBloom', 228, 258],
    ['lavender', 40, 292], ['starBloom', 96, 288], ['tuftDeep', 140, 298], ['lavender', 188, 290], ['starBloom', 246, 300], ['tuftDeep', 70, 310], ['starBloom', 170, 310],
  ],
};
