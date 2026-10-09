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
// The other rooms use the same shapes: a `prop` with `ramps` for a piece of
// furniture, `things` for a front corner or for what stands on a shelf or
// counter ([prop, x offset, colours]), colours for walls, floors and mats.

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

  // the kitchen
  'sweet-kitchen-wall': { base: 'cream.3', pattern: 'pink.3', kind: 'stripes', wainscot: 'pink.2' },
  'sweet-kitchen-floor': { c: 'white', c2: 'pink.3', shadow: 'pink.2' },
  'sweet-kitchen-window': { prop: 'window', ramps: { accent: 'pink' } },
  'sweet-kitchen-stove': { prop: 'oven', ramps: {} },
  'sweet-kitchen-counter': { prop: 'counter', ramps: {}, things: [['espresso', -20, {}], ['breadBasket', 14, {}]] },
  'sweet-kitchen-shelf': { ramps: {}, things: [['layerCake', -18, {}], ['bottle', 4, {}], ['bottle', 12, { accent: 'sky' }], ['loaf', 26, {}]] },
  'sweet-kitchen-table': { things: [['cafeTable', 30, 309, {}, 16]] },
  'sweet-kitchen-seat': { things: [['stool', 234, 309, {}, 12]] },
  // the bathroom
  'sweet-bathroom-wall': { base: 'sky.3', pattern: 'white', kind: 'bricks', wainscot: null },
  'sweet-bathroom-floor': { c: 'mint.3', c2: 'white', shadow: 'mint.2' },
  'sweet-bathroom-window': { prop: 'porthole', ramps: {} },
  'sweet-bathroom-mirror': { prop: 'vanity', ramps: {} },
  'sweet-bathroom-cabinet': { prop: 'medCabinet', ramps: {} },
  'sweet-bathroom-mat': { c1: 'pink.2', c2: 'pink.3' },
  'sweet-bathroom-towels': { things: [['stool', 234, 309, {}, 12], ['towels', 234, 275, {}, 0]] },
  'sweet-bathroom-plant': { things: [['plant', 24, 309, { leaf: 'green', accent: 'sky' }, 11]] },
  // the garden
  'sweet-garden-ground': { c: 'green.3', light: 'lime.3', tufts: 'green.2' },
  'sweet-garden-fence': { c: 'white', shade: 'mist', hedge: 'mint.1' },
  'sweet-garden-tree': { prop: 'treeA', ramps: { leaf: 'green' } },
  'sweet-garden-feature': { prop: 'fountain', ramps: {}, shadow: 50 },
  'sweet-garden-flowers': { things: [['flowerBed', 36, 306, { accent: 'pink' }, 0], ['flowersA', 76, 308, { accent: 'gold' }, 0]] },
  'sweet-garden-seat': { things: [['log', 224, 306, {}, 16], ['mushroomA', 246, 298, { accent: 'red' }, 0]] },

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
