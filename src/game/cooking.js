// Cooking. The pantry holds ingredients: what the garden grew (garden.js) and
// three staples bought in town. Two ingredients make a dish; the right pair
// makes one of the RECIPES, which is then known and can be cooked again from
// the list, and any other pair makes an odd stew. A dish goes into the food
// inventory like bought food (the dishes are in FOODS, marked `cooked`).
import { CROPS } from './garden.js';
import { FOODS } from './items.js';
import { grant } from './wishes.js';
import { priceToday } from './days.js';

export const STAPLES = {
  flour: { name: 'Flour', price: 10 },
  cream: { name: 'Cream', price: 10 },
  egg:   { name: 'Egg',   price: 10 },
};
export const INGREDIENTS = { ...Object.fromEntries(Object.entries(CROPS).map(([id, c]) => [id, { name: c.name }])), ...STAPLES };

export const RECIPES = {
  tomatotart:     ['tomato', 'flour'],
  gardenomelette: ['tomato', 'egg'],
  carrotcake:     ['carrot', 'flour'],
  berrytart:      ['strawberry', 'flour'],
  berryshake:     ['strawberry', 'cream'],
  pumpkinsoup:    ['pumpkin', 'cream'],
};
export const FLOP = 'oddstew';

export const pantryOf = (game) => (game.pantry = game.pantry && typeof game.pantry === 'object' ? game.pantry : {});
export const has = (game, id, n = 1) => (pantryOf(game)[id] || 0) >= n;
export const knows = (game, dish) => (game.recipes || []).includes(dish);
/** Whether the pantry has what a known recipe needs. */
export const canCook = (game, dish) => !!RECIPES[dish] && RECIPES[dish].every(id => has(game, id));

export function buyStaple(game, id) {
  const s = STAPLES[id];
  if (!s) return { ok: false };
  const price = priceToday(game.simTime, s.price);
  if (game.points < price) return { ok: false, msg: 'Not enough points!' };
  game.points -= price;
  pantryOf(game)[id] = (pantryOf(game)[id] || 0) + 1;
  return { ok: true };
}

/** The dish two ingredients make. */
export function dishFor(a, b) {
  const hit = Object.entries(RECIPES).find(([, needs]) => (needs[0] === a && needs[1] === b) || (needs[0] === b && needs[1] === a));
  return hit ? hit[0] : FLOP;
}

/** Cook with two ingredients from the pantry. Returns { ok, dish, isNew } (isNew: a recipe found for the first time). */
export function cook(game, a, b) {
  if (!INGREDIENTS[a] || !INGREDIENTS[b]) return { ok: false };
  if (a === b ? !has(game, a, 2) : !has(game, a) || !has(game, b)) return { ok: false, msg: 'Not enough in the pantry!' };
  const pantry = pantryOf(game);
  pantry[a]--; pantry[b]--;
  const dish = dishFor(a, b);
  game.inventory[dish] = (game.inventory[dish] || 0) + 1;
  game.recipes = game.recipes || [];
  const isNew = dish !== FLOP && !game.recipes.includes(dish);
  if (isNew) game.recipes.push(dish);
  grant(game, 'cook');
  return { ok: true, dish, isNew, name: FOODS[dish].name };
}
