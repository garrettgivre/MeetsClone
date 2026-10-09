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
  garden: { name: 'Garden', outdoor: true, slots: ['ground', 'fence', 'tree', 'feature', 'flowers', 'seat'] },
  kitchen: { name: 'Kitchen', outdoor: false, slots: ['wall', 'floor', 'window', 'stove', 'counter', 'shelf', 'table', 'seat'] },
  bedroom: { name: 'Bedroom', outdoor: false, slots: ['wall', 'floor', 'window', 'picture', 'shelf', 'lamp', 'bed', 'rug', 'corner', 'plant'] },
  bathroom: { name: 'Bathroom', outdoor: false, slots: ['wall', 'floor', 'window', 'mirror', 'cabinet', 'mat', 'towels', 'plant'] },
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
  cabinet: { label: 'Cabinet', price: 80 },
  mat: { label: 'Bath mat', price: 40 },
  towels: { label: 'Towels', price: 30 },
  ground: { label: 'Lawn', price: 60 },
  fence: { label: 'Fence', price: 50 },
  tree: { label: 'Tree', price: 60 },
  feature: { label: 'Centrepiece', price: 120 },
  flowers: { label: 'Flower bed', price: 40 },
};

/**
 * The themed sets. `pieces` names each slot's item, room by room; a set need
 * not cover every room. The starter set is the house every game begins with.
 */
export const SETS = {
  sweet: {
    name: 'Sweetheart', starter: true,
    pieces: {
      bedroom: { wall: 'Dotted Paper', floor: 'Pine Boards', window: 'Pink Curtains', picture: 'Heart Picture', shelf: 'Keepsake Shelf', lamp: 'Pleated Lamp', bed: 'Heart Bed', rug: 'Pink Rug', corner: 'Toy Chest', plant: 'Potted Plant' },
      kitchen: { wall: 'Candy Stripes', floor: 'Checked Tiles', window: 'Kitchen Window', stove: 'Brick Oven', counter: 'Baking Counter', shelf: 'Pantry Shelf', table: 'Tea Table', seat: 'Pink Stool' },
      bathroom: { wall: 'Sky Tiles', floor: 'Mint Tiles', window: 'Porthole', mirror: 'Bulb Mirror', cabinet: 'Glass Cabinet', mat: 'Pink Mat', towels: 'Folded Towels', plant: 'Bathroom Fern' },
      garden: { ground: 'Clover Lawn', fence: 'White Pickets', tree: 'Shade Tree', feature: 'Fountain', flowers: 'Pink Flower Bed', seat: 'Log Seat' },
    },
  },
  starry: {
    name: 'Starry Night',
    pieces: {
      bedroom: { wall: 'Star Paper', floor: 'Dusk Boards', window: 'Night Curtains', picture: 'Moon Picture', shelf: 'Stargazer Shelf', lamp: 'Moon Lamp', bed: 'Star Bed', rug: 'Comet Rug', corner: 'Toy Rocket', plant: 'Star Lantern' },
    },
  },
  forest: {
    name: 'Forest Cabin',
    pieces: {
      bedroom: { wall: 'Sprig Paper', floor: 'Oak Boards', window: 'Moss Curtains', picture: 'Leaf Picture', shelf: 'Forager Shelf', lamp: 'Toadstool Lamp', bed: 'Leaf Bed', rug: 'Clover Rug', corner: 'Mossy Stump', plant: 'Fern Corner' },
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
