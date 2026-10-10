// Daily wishes. Each morning a pet that is old enough wants three things: a
// food, a game, a bath, a trip into town, something cooked, the garden seen
// to. Doing one pays a little and cheers the pet; doing all three pays more.
// Nothing here draws or reads the pet's care rules: pet.js, cooking.js,
// garden.js and the town call grant() when something happens.
import { makeRng, hash } from '../engine/rng.js';
import { FOODS, TOYS } from './items.js';
import { isDay } from './days.js';

export const WISH_POINTS = 25;  // for each wish granted
export const WISH_BONUS = 50;   // for all of a day's wishes
export const WISHES_A_DAY = 3;
const AGES = ['child', 'teen', 'adult'];

const dayOf = (game) => new Date(game.simTime).toDateString();

/** What a wish asks for, in the pet's words. */
export function wishText(w) {
  switch (w.kind) {
    case 'eat': return `Eat ${FOODS[w.id]?.name || 'something nice'}`;
    case 'play': return `Play with the ${TOYS[w.id]?.name || 'toys'}`;
    case 'bath': return 'Have a bath';
    case 'game': return 'Play a game';
    case 'town': return 'Go into town';
    case 'cook': return 'Cook something';
    case 'water': return 'Water the garden';
    case 'harvest': return 'Pick something ripe';
    case 'plant': return 'Plant a seed';
    case 'class': return 'Go to a class';
    case 'work': return 'Work a shift';
    default: return '...';
  }
}

/** The wishes a pet could have today, given what the house has in it. */
function candidates(game, rng) {
  const out = [{ kind: 'game' }, { kind: 'town' }, { kind: 'cook' }];
  if ((game.pet.dirt || 0) >= 1) out.push({ kind: 'bath' });
  // school for the young, work for the grown (both are in Uptown: only once the bus pass is bought)
  if (game.town?.passes?.includes('bus')) out.push({ kind: game.pet.stage === 'adult' ? 'work' : 'class' });
  // a food on sale or in the cupboard (not the free rice ball, not baby milk, not a failed stew)
  const foods = Object.keys(FOODS).filter(id => !FOODS[id].free && !FOODS[id].babyOnly && id !== 'oddstew' && (!FOODS[id].cooked || (game.recipes || []).includes(id)));
  out.push({ kind: 'eat', id: rng.pick(foods) }, { kind: 'eat', id: rng.pick(foods) });
  if (game.toys?.length) out.push({ kind: 'play', id: rng.pick(game.toys) });
  const plots = game.garden?.plots || [];
  if (plots.some(p => !p)) out.push({ kind: 'plant' });
  if (plots.some(p => p)) out.push({ kind: 'water' });
  return out;
}

/** Today's wishes, rolled the first time they are asked for each day: { day, list: [{ kind, id?, done }], paid }. Null for an egg, a baby or a pet that is gone. */
export function todaysWishes(game) {
  const pet = game.pet;
  if (!pet || pet.gone || !AGES.includes(pet.stage)) return null;
  const day = dayOf(game);
  if (game.wishes?.day === day) return game.wishes;
  const rng = makeRng(hash(`${pet.id}:${day}`));
  const pool = candidates(game, rng), list = [];
  while (list.length < WISHES_A_DAY && pool.length) {
    const w = pool.splice(rng.int(pool.length), 1)[0];
    if (!list.some(x => x.kind === w.kind && x.id === w.id)) list.push({ ...w, done: false });
  }
  game.wishes = { day, list, paid: false, fresh: true }; // `fresh`: not yet announced on the home screen
  return game.wishes;
}

/**
 * Something happened that a wish may have been for: 'eat' (with the food), 'play' (the toy), 'bath', 'game',
 * 'town', 'cook', 'water', 'harvest', 'plant'. Grants the first matching wish; the news goes to game.bookNews,
 * which the home screen reads out. Returns the points paid.
 */
export function grant(game, kind, id = null) {
  const wishes = game.wishes?.day === dayOf(game) ? game.wishes : null;
  const w = wishes?.list.find(x => !x.done && x.kind === kind && (x.id == null || x.id === id));
  if (!w) return 0;
  w.done = true;
  let paid = WISH_POINTS;
  game.points += WISH_POINTS;
  if (game.pet) game.pet.happy = Math.min(4, game.pet.happy + 1);
  (game.bookNews ||= []).push(`A wish come true: ${wishText(w).toLowerCase()}! +${WISH_POINTS}`);
  if (!wishes.paid && wishes.list.every(x => x.done)) {
    wishes.paid = true;
    const bonus = WISH_BONUS * (isDay(game.simTime, 'moon') ? 2 : 1); // (double under a full moon)
    game.points += bonus;
    paid += bonus;
    game.bookNews.push(`Every wish granted today! +${bonus}`);
  }
  return paid;
}
