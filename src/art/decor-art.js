// How each decor item (src/game/decor.js) is drawn: which hand-pixelled props,
// in which colours, and the colours of the papered wall, the floor and the rug.
// src/art/town.js (homeScene) reads this to build the room.
//
//   wall     base, pattern, kind (a wall pattern from the kit), wainscot
//   floor    planks colour, and the shade for shadows that fall on it
//   window   the window prop's colours (curtains = accent, rod = roof), and the garland strung across the wall
//   picture  a framed prop
//   shelf    the shelf's wood, and what stands on it: [prop, x, colours]
//   lamp     a prop that stands on the floor, or `table` colours plus a lamp that stands on the bedside table
//   bed      a bed prop
//   rug      two colours, and optionally a star in the middle
//   corner   things in the front left corner: [prop, x, y, colours, shadow radius]
//   plant    things in the front right corner, the same way

export const DECOR_ART = {
  // ---------- Sweetheart: the room every game starts with ----------
  'sweet-wall': { base: 'sky.3', pattern: 'sky.2', kind: 'dots', wainscot: 'sky.2' },
  'sweet-floor': { c: 'cream.2', shadow: 'cream.1' },
  'sweet-window': {
    ramps: { accent: 'pink', roof: 'gold', stone: 'orange', wood: 'brown' },
    garland: { hearts: true, colors: ['gold.3', 'pink.3', 'white', 'mint.3'] },
  },
  'sweet-picture': { prop: 'heartFrame', ramps: { roof: 'gold', accent: 'pink' } },
  'sweet-shelf': { ramps: {}, things: [['sproutPot', 184, { stone: 'orange' }], ['books', 204, { accent: 'violet' }], ['teddy', 222, {}], ['toyBlock', 235, { accent: 'mint' }]] },
  'sweet-lamp': { prop: 'nightLamp', ramps: { roof: 'gold', stone: 'slate' } },
  'sweet-bed': { prop: 'petBed', ramps: { accent: 'pink', wall: 'cream' } },
  'sweet-rug': { c1: 'pink.2', c2: 'pink.3' },
  'sweet-corner': { things: [['toyChest', 30, 309, { accent: 'red', glass: 'sky', roof: 'gold', stone: 'gold' }, 25], ['toyBall', 62, 309, { accent: 'mint' }, 0]] },
  'sweet-plant': { things: [['plant', 238, 309, { leaf: 'green', accent: 'pink', flip: true }, 11]] },

  // ---------- Starry Night ----------
  'starry-wall': { base: 'indigo.2', pattern: 'gold.3', kind: 'stars', wainscot: 'indigo.1' },
  'starry-floor': { c: 'violet.3', shadow: 'violet.2' },
  'starry-window': {
    ramps: { accent: 'indigo', roof: 'gold', stone: 'slate', wood: 'brown' },
    garland: { hearts: false, string: 'indigo.0', colors: ['gold.3', 'white', 'sky.3'] },
  },
  'starry-picture': { prop: 'moonFrame', ramps: { roof: 'gold', accent: 'gold', glass: 'indigo' } },
  'starry-shelf': { ramps: { wood: 'slate' }, things: [['globe', 188, { accent: 'sky' }], ['books', 208, { accent: 'indigo' }], ['toyBlock', 226, { accent: 'gold' }]] },
  'starry-lamp': { prop: 'moonLamp', ramps: { roof: 'gold', stone: 'slate' }, table: { wood: 'slate', roof: 'gold' } },
  'starry-bed': { prop: 'starBed', ramps: { accent: 'indigo', wall: 'gold', wood: 'slate' } },
  'starry-rug': { c1: 'indigo.1', c2: 'indigo.2', star: 'gold.3' },
  'starry-corner': { things: [['toyRocket', 28, 309, { accent: 'red', glass: 'sky', stone: 'gold' }, 14], ['toyBall', 56, 309, { accent: 'gold' }, 0]] },
  'starry-plant': { things: [['starLantern', 240, 309, { wall: 'gold', stone: 'slate' }, 8]] },

  // ---------- Forest Cabin ----------
  'forest-wall': { base: 'cream.3', pattern: 'green.2', kind: 'sprigs', wainscot: 'lime.2' },
  'forest-floor': { c: 'brown.3', shadow: 'brown.2' },
  'forest-window': {
    ramps: { accent: 'green', roof: 'brown', stone: 'orange', wood: 'brown' },
    garland: { hearts: false, string: 'brown.1', colors: ['lime.3', 'gold.3', 'orange.3'] },
  },
  'forest-picture': { prop: 'leafFrame', ramps: { roof: 'brown', leaf: 'green', wood: 'brown' } },
  'forest-shelf': { ramps: {}, things: [['sproutPot', 184, { stone: 'brown' }], ['mushroomA', 204, { accent: 'red' }], ['books', 224, { accent: 'green' }]] },
  'forest-lamp': { prop: 'mushroomLamp', ramps: { accent: 'red', stone: 'cream' }, table: { wood: 'brown', roof: 'gold' } },
  'forest-bed': { prop: 'leafBed', ramps: { accent: 'lime', wall: 'cream', wood: 'brown' } },
  'forest-rug': { c1: 'green.2', c2: 'lime.3' },
  'forest-corner': { things: [['stump', 26, 309, {}, 14], ['mushroomA', 50, 309, { accent: 'orange' }, 5], ['fern', 12, 309, {}, 0]] },
  'forest-plant': { things: [['plant', 238, 309, { leaf: 'green', accent: 'brown', flip: true }, 11], ['fern', 218, 309, { flip: true }, 0]] },
};
