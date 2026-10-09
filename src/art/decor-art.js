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
  'sweet-bed': { prop: 'heartBasket', ramps: { accent: 'pink', wood: 'brown' }, rim: 17 },
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
  'starry-bed': { prop: 'moonCradle', ramps: { roof: 'gold', accent: 'indigo' }, rim: 17 },
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
  'forest-bed': { prop: 'leafNest', ramps: { leaf: 'green', wood: 'brown' }, rim: 15 },
  'forest-rug': { c1: 'green.2', c2: 'lime.3' },
  'forest-corner': { things: [['stump', 26, 309, {}, 14], ['mushroomA', 50, 309, { accent: 'orange' }, 5], ['fern', 12, 309, {}, 0]] },
  'forest-plant': { things: [['plant', 238, 309, { leaf: 'green', accent: 'brown', flip: true }, 11], ['fern', 218, 309, { flip: true }, 0]] },

  // ---------- Seaside: every room, all its own furniture (src/art/props-seaside.js) ----------
  'seaside-wall': { base: 'sky.3', pattern: 'white', kind: 'waves', wainscot: 'cream.3' },
  'seaside-floor': { c: 'cream.3', shadow: 'cream.2' },
  'seaside-window': { prop: 'portWindow', ramps: { roof: 'gold' }, garland: { hearts: false, string: 'cream.1', colors: ['red.2', 'white', 'sky.2'] } },
  'seaside-picture': { prop: 'lifeRing', ramps: { accent: 'red' } },
  'seaside-shelf': { prop: 'ropeShelf', top: 6, ramps: { wood: 'brown' }, things: [['shell', 188, { accent: 'pink' }], ['bottle', 206, { accent: 'sky' }], ['starfish', 222, { accent: 'orange' }]] },
  'seaside-lamp': { prop: 'lighthouseLamp', ramps: { accent: 'red', roof: 'gold', stone: 'slate' } },
  'seaside-bed': { prop: 'clamBed', ramps: { accent: 'pink', wall: 'pink', glass: 'sky' }, rim: 17 },
  'seaside-rug': { c1: 'sky.2', c2: 'sky.3' },
  'seaside-corner': { things: [['beachBall', 24, 309, {}, 12], ['sandPail', 52, 309, { accent: 'sky' }, 8]] },
  'seaside-plant': { things: [['dunePot', 238, 309, { leaf: 'lime', accent: 'sky' }, 11], ['starfish', 214, 309, { accent: 'orange' }, 0]] },
  'seaside-kitchen-wall': { base: 'white', pattern: 'sky.3', kind: 'stripes', wainscot: 'sky.2' },
  'seaside-kitchen-floor': { c: 'white', c2: 'sky.3', shadow: 'sky.2' },
  'seaside-kitchen-window': { prop: 'shutterWindow', ramps: { accent: 'blue' } },
  'seaside-kitchen-stove': { prop: 'potbelly', ramps: { stone: 'slate', glass: 'orange' } },
  'seaside-kitchen-counter': { prop: 'crateCounter', ramps: { wood: 'cream' }, things: [['fishPlate', -16, {}], ['bottle', 18, { accent: 'sky' }]] },
  'seaside-kitchen-shelf': { prop: 'ropeShelf', top: 6, ramps: { wood: 'brown' }, things: [['shell', -18, { accent: 'pink' }], ['bottle', -2, { accent: 'sky' }], ['bottle', 6, {}], ['starfish', 20, { accent: 'orange' }]] },
  'seaside-kitchen-table': { things: [['barrelTable', 30, 309, {}, 16]] },
  'seaside-kitchen-seat': { things: [['kegStool', 234, 309, { accent: 'sky' }, 11]] },
  'seaside-bathroom-wall': { base: 'white', pattern: 'sky.3', kind: 'waves', wainscot: null },
  'seaside-bathroom-floor': { c: 'sky.3', c2: 'white', shadow: 'sky.2' },
  'seaside-bathroom-window': { prop: 'shutterWindow', ramps: { accent: 'sky' } },
  'seaside-bathroom-mirror': { prop: 'shellMirror', ramps: { accent: 'pink', wood: 'gold', glass: 'sky' } },
  'seaside-bathroom-cabinet': { prop: 'hutCabinet', ramps: { accent: 'sky', roof: 'red', glass: 'sky' } },
  'seaside-bathroom-mat': { c1: 'sky.2', c2: 'sky.3' },
  'seaside-bathroom-towels': { things: [['towelBasket', 234, 309, { accent: 'sky', wall: 'cream', glass: 'blue' }, 14]] },
  'seaside-bathroom-plant': { things: [['dunePot', 24, 309, { leaf: 'lime', accent: 'pink' }, 11], ['shell', 48, 309, { accent: 'pink' }, 0]] },
  'seaside-garden-ground': { c: 'gold.3', light: 'cream.3', tufts: 'lime.2', sparse: true, flowers: ['white', 'pink.3', 'cream.3'] },
  'seaside-garden-fence': { kind: 'rope', sea: true, c: 'cream.3', shade: 'brown.2' },
  'seaside-garden-tree': { prop: 'parasol', ramps: { accent: 'red' } },
  'seaside-garden-feature': { prop: 'rowboat', ramps: { accent: 'blue' }, shadow: 40 },
  'seaside-garden-flowers': { things: [['driftwood', 36, 306, {}, 0], ['starfish', 64, 302, { accent: 'orange' }, 0], ['shell', 14, 296, { accent: 'pink' }, 0]] },
  'seaside-garden-seat': { things: [['deckChair', 228, 308, { accent: 'red' }, 14], ['sandPail', 198, 306, { accent: 'sky' }, 0]] },

};
