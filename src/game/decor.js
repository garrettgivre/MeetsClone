// Decorating. A room has a fixed list of slots (wallpaper, floor, bed, lamp...),
// and each slot holds one item. Items come in themed sets, one item per slot;
// you can buy a whole set or single pieces, and mix sets freely. A room dressed
// entirely in one set is "themed", which earns a one-off bonus.
//
// Built for more rooms later (indoors or out): a room is an entry in ROOMS
// with its own slots, an item names the room it belongs to, and the save keeps
// one layout per room. How each item is drawn is in src/art/decor-art.js.

/** The house, left to right: you step from one room to the next. */
export const HOUSE = ['garden', 'kitchen', 'bedroom', 'bathroom'];

export const ROOMS = {
  garden: { name: 'Garden', outdoor: true, slots: ['ground', 'horizon', 'fence', 'tree', 'feature', 'flowers', 'play', 'seat'] },
  kitchen: { name: 'Kitchen', outdoor: false, slots: ['wall', 'floor', 'window', 'stove', 'counter', 'shelf', 'table', 'seat'] },
  bedroom: { name: 'Bedroom', outdoor: false, slots: ['wall', 'floor', 'window', 'picture', 'shelf', 'lamp', 'bed', 'rug', 'corner', 'plant'] },
  bathroom: { name: 'Bathroom', outdoor: false, slots: ['wall', 'floor', 'window', 'mirror', 'bath', 'toilet', 'cabinet', 'mat', 'towels', 'plant'] },
};

/** What each kind of slot is called, and what a piece for it costs. */
export const SLOTS = {
  wall: { label: 'Wallpaper', price: 60 },
  floor: { label: 'Floor', price: 60 },
  window: { label: 'Window', price: 50 },
  picture: { label: 'Picture', price: 40 },
  shelf: { label: 'Shelf', price: 50 },
  lamp: { label: 'Lamp', price: 70 },
  bed: { label: 'Bed', price: 120 },
  rug: { label: 'Rug', price: 50 },
  corner: { label: 'Toy corner', price: 80 },
  plant: { label: 'Greenery', price: 40 },
  stove: { label: 'Stove', price: 120 },
  counter: { label: 'Counter', price: 80 },
  table: { label: 'Table', price: 70 },
  seat: { label: 'Seat', price: 50 },
  mirror: { label: 'Mirror', price: 80 },
  bath: { label: 'Bath', price: 120 },
  toilet: { label: 'Toilet', price: 80 },
  cabinet: { label: 'Cabinet', price: 80 },
  mat: { label: 'Bath mat', price: 40 },
  towels: { label: 'Towels', price: 30 },
  ground: { label: 'Lawn', price: 60 },
  horizon: { label: 'Horizon', price: 50 },
  fence: { label: 'Fence', price: 50 },
  tree: { label: 'Tree', price: 60 },
  feature: { label: 'Centrepiece', price: 120 },
  flowers: { label: 'Flower bed', price: 40 },
  play: { label: 'Play spot', price: 100 },
};

/**
 * The themed sets. `pieces` names each slot's item, room by room; a set need
 * not cover every room. The starter set is the house every game begins with.
 */
export const SETS = {
  sweet: {
    name: 'Sweetheart', starter: true,
    pieces: {
      bedroom: { wall: 'Dotted Paper', floor: 'Pine Boards', window: 'Pink Curtains', picture: 'Heart Picture', shelf: 'Keepsake Shelf', lamp: 'Pleated Lamp', bed: 'Heart Basket', rug: 'Pink Rug', corner: 'Toy Chest', plant: 'Potted Plant' },
      kitchen: { wall: 'Candy Stripes', floor: 'Checked Tiles', window: 'Kitchen Window', stove: 'Brick Oven', counter: 'Baking Counter', shelf: 'Pantry Shelf', table: 'Tea Table', seat: 'Pink Stool' },
      bathroom: { wall: 'Sky Tiles', floor: 'Mint Tiles', window: 'Porthole', mirror: 'Bulb Mirror', bath: 'Claw-foot Bath', toilet: 'Chain-pull Toilet', cabinet: 'Glass Cabinet', mat: 'Pink Mat', towels: 'Folded Towels', plant: 'Bathroom Fern' },
      garden: { ground: 'Clover Lawn', horizon: 'Flowering Hedge', fence: 'White Pickets', tree: 'Shade Tree', feature: 'Fountain', flowers: 'Pink Flower Bed', play: 'Sandpit', seat: 'Log Seat' },
    },
  },
  starry: {
    name: 'Starry Night',
    pieces: {
      bedroom: { wall: 'Star Paper', floor: 'Dusk Boards', window: 'Arched Window', picture: 'Star Chart', shelf: 'Cloud Shelf', lamp: 'Moon Floor Lamp', bed: 'Moon Cradle', rug: 'Comet Rug', corner: 'Toy Rocket', plant: 'Moonflowers' },
      kitchen: { wall: 'Moon Paper', floor: 'Star Tiles', window: 'Round Sky Window', stove: 'Rocket Oven', counter: 'Star Cupboard', shelf: 'Kitchen Cloud Shelf', table: 'Moon Table', seat: 'Star Stool' },
      bathroom: { wall: 'Night Tiles', floor: 'Twilight Tiles', window: 'Moon Window', mirror: 'Moon Mirror', bath: 'Starlit Bath', toilet: 'Midnight Toilet', cabinet: 'Star Cabinet', mat: 'Comet Mat', towels: 'Towel Stand', plant: 'Bath Moonflower' },
      garden: { ground: 'Night Meadow', horizon: 'Far Cottage Lights', fence: 'Star Railings', tree: 'Lantern Tree', feature: 'Telescope', flowers: 'Moonflower Pot', play: 'Rocket Rider', seat: 'Star Bench' },
    },
  },
  forest: {
    name: 'Forest Cabin',
    pieces: {
      bedroom: { wall: 'Sprig Paper', floor: 'Oak Boards', window: 'Cabin Window', picture: 'Cuckoo Clock', shelf: 'Log Shelf', lamp: 'Toadstool Lamp', bed: 'Leaf Nest', rug: 'Leaf Rug', corner: 'Firewood', plant: 'Fern Bucket' },
      kitchen: { wall: 'Gingham Paper', floor: 'Pebble Floor', window: 'Cottage Window', stove: 'Stone Hearth', counter: 'Butcher Block', shelf: 'Pantry Log Shelf', table: 'Stump Table', seat: 'Mushroom Stool' },
      bathroom: { wall: 'Fern Paper', floor: 'Flagstones', window: 'Bath Cottage Window', mirror: 'Branch Mirror', bath: 'Barrel Tub', toilet: 'Stump Privy', cabinet: 'Tree Trunk Cabinet', mat: 'Moss Mat', towels: 'Branch Rack', plant: 'Bath Fern' },
      garden: { ground: 'Woodland Floor', horizon: 'Pine Tops', fence: 'Log Fence', tree: 'Pine Tree', feature: 'Campfire', flowers: 'Toadstool Ring', play: 'Balance Log', seat: 'Log Bench' },
    },
  },
  seaside: {
    name: 'Seaside',
    pieces: {
      bedroom: { wall: 'Wave Paper', floor: 'Driftwood Boards', window: 'Porthole Window', picture: 'Life Ring', shelf: 'Rope Shelf', lamp: 'Lighthouse Lamp', bed: 'Clam Bed', rug: 'Tide Rug', corner: 'Beach Ball', plant: 'Dune Grass' },
      kitchen: { wall: 'Deckchair Stripes', floor: 'Sea Tiles', window: 'Shutter Window', stove: 'Potbelly Stove', counter: 'Crate Counter', shelf: 'Galley Shelf', table: 'Barrel Table', seat: 'Keg Stool' },
      bathroom: { wall: 'Ripple Tiles', floor: 'Lagoon Tiles', window: 'Shore Shutters', mirror: 'Shell Mirror', bath: 'Anchor Tub', toilet: 'Beach Hut Toilet', cabinet: 'Beach Hut Cabinet', mat: 'Tide Mat', towels: 'Towel Basket', plant: 'Shell Pot' },
      garden: { ground: 'Sandy Beach', horizon: 'Open Sea', fence: 'Rope Fence', tree: 'Beach Parasol', feature: 'Rowing Boat', flowers: 'Driftwood', play: 'Paddling Pool', seat: 'Sun Lounger' },
    },
  },
  modern: {
    name: 'Modern',
    pieces: {
      bedroom: { wall: 'Plain White', floor: 'Slate Boards', window: 'Picture Window', picture: 'Wall Clock', shelf: 'Cube Shelf', lamp: 'Arc Lamp', bed: 'Pod Bed', rug: 'Mint Rug', corner: 'Beanbag', plant: 'Big Leaf Plant' },
      kitchen: { wall: 'Mint Diamonds', floor: 'Grey Checks', window: 'Strip Window', stove: 'Cooker and Hood', counter: 'Kitchen Island', shelf: 'Kitchen Cube Shelf', table: 'Tulip Table', seat: 'Bar Stool' },
      bathroom: { wall: 'Metro Tiles', floor: 'Slate Tiles', window: 'Bath Strip Window', mirror: 'Round Mirror', bath: 'Soaking Tub', toilet: 'Wall-hung Toilet', cabinet: 'Tall Cupboard', mat: 'Mint Mat', towels: 'Towel Ladder', plant: 'Snake Plant' },
      garden: { ground: 'Trim Lawn', horizon: 'City Skyline', fence: 'Slat Fence', tree: 'Ball Tree', feature: 'Ring Sculpture', flowers: 'Planter Box', play: 'Trampoline', seat: 'Garden Bench' },
    },
  },
  squiggle: {
    name: 'Squiggle Club',
    pieces: {
      bedroom: { wall: 'Squiggle Paper', floor: 'Terrazzo', window: 'Stripe and Spot Window', picture: 'Shapes Print', shelf: 'Zigzag Shelf', lamp: 'Totem Lamp', bed: 'Mismatch Bed', rug: 'Squiggle Rug', corner: 'Soft Shapes', plant: 'Party Cactus' },
      kitchen: { wall: 'Grid Paper', floor: 'Chessboard Floor', window: 'Shape Window', stove: 'Party Cooker', counter: 'Three-Door Counter', shelf: 'Kitchen Zigzag Shelf', table: 'Ball and Cone Table', seat: 'Spot Chair' },
      bathroom: { wall: 'Odd Tiles', floor: 'Candy Mosaic', window: 'Bath Shape Window', mirror: 'Arch Mirror', bath: 'Wedge Tub', toilet: 'Cone Toilet', cabinet: 'Stacked Cabinet', mat: 'Zigzag Mat', towels: 'Party Towels', plant: 'Ball Topiary' },
      garden: { ground: 'Confetti Lawn', horizon: 'Party Peaks', fence: 'Odd Post Fence', tree: 'Hoop Palm', feature: 'Shape Totem', flowers: 'Shape Flowers', play: 'Ball Pit', seat: 'Shape Bench' },
    },
  },
  aqua: {
    name: 'Aqua Breeze',
    pieces: {
      bedroom: { wall: 'Bubble Sky Paper', floor: 'Gloss Tiles', window: 'Soft Corner Window', picture: 'Green Hill Print', shelf: 'Glass Shelf', lamp: 'Orb Lamp', bed: 'Bubble Bed', rug: 'Ripple Rug', corner: 'Fish Tank', plant: 'Lucky Bamboo' },
      kitchen: { wall: 'Wave Paper', floor: 'Mint Gloss Tiles', window: 'Long Round Window', stove: 'Gloss Cooker', counter: 'Glass Door Counter', shelf: 'Kitchen Glass Shelf', table: 'Glass Table', seat: 'Jelly Stool' },
      bathroom: { wall: 'Sky Wave Paper', floor: 'Sky Tiles', window: 'Bath Round Window', mirror: 'Drop Mirror', bath: 'Glass Tub', toilet: 'Glass Tank Toilet', cabinet: 'Gloss Tower', mat: 'Droplet Mat', towels: 'Chrome Towel Hoop', plant: 'Bath Bamboo' },
      garden: { ground: 'Dewy Lawn', horizon: 'Windmill Hills', fence: 'Glass Fence', tree: 'Gloss Tree', feature: 'Orb Fountain', flowers: 'Glass Tulips', play: 'Bounce Cushion', seat: 'Swoosh Bench' },
    },
  },
  hollow: {
    name: 'Pumpkin Hollow',
    pieces: {
      bedroom: { wall: 'Bat Paper', floor: 'Old Dark Boards', window: 'Arch Window', picture: 'Ghost Portrait', shelf: 'Cobweb Shelf', lamp: 'Candle Stand', bed: 'Pumpkin Bed', rug: 'Web Rug', corner: 'Cauldron', plant: 'Bare Little Tree' },
      kitchen: { wall: 'Faded Trellis Paper', floor: 'Pumpkin Checks', window: 'Round Stone Window', stove: 'Grinning Range', counter: 'Crypt Counter', shelf: 'Kitchen Cobweb Shelf', table: 'Runner Table', seat: 'Spider Stool' },
      bathroom: { wall: 'Mossy Stone Wall', floor: 'Dungeon Slabs', window: 'Bath Stone Window', mirror: 'Haunted Mirror', bath: 'Slime Tub', toilet: 'Gravestone Toilet', cabinet: 'Coffin Cabinet', mat: 'Bat Mat', towels: 'Bone Rack', plant: 'Fly-trap' },
      garden: { ground: 'Graveyard Grass', horizon: 'Graveyard Rise', fence: 'Iron Railings', tree: 'Tree with a Face', feature: 'Great Pumpkin', flowers: 'Pumpkin Patch', play: 'Leaf Pile', seat: 'Bat Bench' },
    },
  },
};

/** An item's id. (Bedroom pieces came first and keep their short ids, so saves made then still work.) */
export const decorId = (set, room, slot) => (room === 'bedroom' ? `${set}-${slot}` : `${set}-${room}-${slot}`);

/** Every item: id -> { id, set, slot, room, name, price }. */
export const DECOR = {};
for (const [set, s] of Object.entries(SETS)) {
  for (const [room, pieces] of Object.entries(s.pieces)) {
    for (const [slot, name] of Object.entries(pieces)) {
      const id = decorId(set, room, slot);
      DECOR[id] = { id, set, slot, room, name, price: s.starter ? 0 : SLOTS[slot].price };
    }
  }
}

export const SET_DISCOUNT = 0.8; // buying what is left of a set at once
export const THEME_BONUS = 50;   // points, the first time a room is dressed entirely in one set

const STARTER = Object.keys(SETS).find(id => SETS[id].starter);
const starterLayout = (room) => Object.fromEntries(ROOMS[room].slots.map(slot => [slot, decorId(STARTER, room, slot)]));

/** A new game's decor: the starter set, owned and in place. */
export function newDecor() {
  const rooms = Object.fromEntries(Object.keys(ROOMS).map(r => [r, starterLayout(r)]));
  return { owned: Object.values(rooms).flatMap(l => Object.values(l)), rooms, themes: [] };
}

/** Repair a save's decor: rooms and slots added since, and anything no longer in the catalogue. */
export function fixDecor(game) {
  const fresh = newDecor();
  const d = (game.decor = game.decor && typeof game.decor === 'object' ? game.decor : fresh);
  d.owned = [...new Set([...(Array.isArray(d.owned) ? d.owned : []), ...fresh.owned])].filter(id => DECOR[id]);
  d.themes = Array.isArray(d.themes) ? d.themes : [];
  d.rooms = d.rooms || {};
  for (const room of Object.keys(ROOMS)) {
    const layout = (d.rooms[room] = d.rooms[room] || {});
    // a slot the house has gained since this save: whoever owns the rest of a set's room is given its piece for the new slot
    const had = ROOMS[room].slots.filter(slot => layout[slot]);
    if (had.length) for (const slot of ROOMS[room].slots) if (!layout[slot]) for (const [set, s] of Object.entries(SETS)) {
      if (s.pieces[room] && had.every(h => d.owned.includes(decorId(set, room, h))) && !d.owned.includes(decorId(set, room, slot))) d.owned.push(decorId(set, room, slot));
    }
    for (const slot of ROOMS[room].slots) {
      const it = DECOR[layout[slot]];
      if (!it || it.slot !== slot || it.room !== room || !d.owned.includes(it.id)) layout[slot] = fresh.rooms[room][slot];
    }
  }
  if (!ROOMS[game.room]) game.room = 'bedroom';
  return game;
}

/** The room on show, and what is in each of its slots. */
export const roomOf = (game) => (ROOMS[game?.room] ? game.room : 'bedroom');
/** The room next door, to the left (-1) or right (1), or null at the end of the house. */
export const nextRoom = (room, dir) => HOUSE[HOUSE.indexOf(room) + dir] || null;
export function layoutOf(game, room = roomOf(game)) {
  return game?.decor?.rooms?.[room] || starterLayout(room);
}

export const owns = (game, id) => !!game.decor?.owned.includes(id);

/** The owned items that fit a slot, in catalogue order. */
export function optionsFor(game, room, slot) {
  return Object.values(DECOR).filter(it => it.room === room && it.slot === slot && owns(game, it.id)).map(it => it.id);
}

/** The set a room is dressed entirely in, or null. */
export function themeOf(layout) {
  const sets = new Set(Object.values(layout).map(id => DECOR[id]?.set));
  return sets.size === 1 ? [...sets][0] : null;
}

export function buyDecor(game, id) {
  const it = DECOR[id];
  if (!it) return { ok: false };
  if (owns(game, id)) return { ok: false, msg: 'Already owned!' };
  if (game.points < it.price) return { ok: false, msg: 'Not enough points!' };
  game.points -= it.price;
  game.decor.owned.push(id);
  return { ok: true };
}

/** The pieces of a set not yet owned, and what they cost together (with the set discount). */
export function setOffer(game, set) {
  const left = Object.values(DECOR).filter(it => it.set === set && !owns(game, it.id));
  const full = left.reduce((n, it) => n + it.price, 0);
  return { left: left.map(it => it.id), price: Math.round((full * SET_DISCOUNT) / 5) * 5 };
}

export function buySet(game, set) {
  const { left, price } = setOffer(game, set);
  if (!SETS[set]) return { ok: false };
  if (!left.length) return { ok: false, msg: 'Already owned!' };
  if (game.points < price) return { ok: false, msg: 'Not enough points!' };
  game.points -= price;
  game.decor.owned.push(...left);
  return { ok: true, count: left.length };
}

/**
 * Put an owned item in its slot. Returns { ok, theme?, bonus? }: `theme` is the
 * set the room now matches, `bonus` the points paid the first time it does.
 */
export function place(game, room, id) {
  const it = DECOR[id];
  if (!it || it.room !== room || !owns(game, id) || !ROOMS[room]?.slots.includes(it.slot)) return { ok: false };
  const layout = game.decor.rooms[room];
  layout[it.slot] = id;
  const theme = themeOf(layout);
  if (!theme) return { ok: true };
  const key = `${room}:${theme}`;
  if (SETS[theme].starter || game.decor.themes.includes(key)) return { ok: true, theme };
  game.decor.themes.push(key);
  game.points += THEME_BONUS;
  return { ok: true, theme, bonus: THEME_BONUS };
}

/** Step a slot to the next (or previous) owned item. */
export function cycle(game, room, slot, dir = 1) {
  const opts = optionsFor(game, room, slot);
  const i = opts.indexOf(game.decor.rooms[room][slot]);
  if (opts.length < 2) return { ok: false, only: true };
  return place(game, room, opts[(i + dir + opts.length) % opts.length]);
}

/** Dress a whole room in one set, using every piece of it that is owned. */
export function useSet(game, room, set) {
  let last = { ok: false };
  for (const slot of ROOMS[room].slots) { const r = place(game, room, decorId(set, room, slot)); if (r.ok) last = r; }
  return last;
}
