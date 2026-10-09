// Debug cheats (Settings > Debug). Pure logic so they can be tested; the menu
// lives in src/scenes/debug.js. Cheats that move time or change the pet's
// state return the simulation events they caused, for the home screen to show.

import { rand as defaultRng } from '../engine/rng.js';
import { express, pureGenome, randomGenome, FOUNDERS } from './genetics.js';
import { FOODS, TOYS, CLOTHES } from './items.js';
import {
  advance, growNow, sicken, canAct, isBedtime, MIN, HOUR, MARRY_AFTER, MAX_DISCIPLINE, MAX_DIRT, TOILET_WARN,
  POTTY_TRAINED, SKILLS, SKILL_MAX, SKILL_STEP, STARVE_TO_DEATH, UNHAPPY_TO_RUNAWAY, BASE_WEIGHT, STAGE_LENGTH,
} from './pet.js';
import { discover, BOOK_GENES, entries } from './book.js';
import { DISTRICTS, LOCATIONS, MAP_PIECES, townState, DAY } from './town.js';
import { DECOR, fixDecor } from './decor.js';

const STAGES = ['egg', 'baby', 'child', 'teen', 'adult'];

/** Skip ahead in time. */
export function skip(game, ms, rng = defaultRng) { return advance(game, ms, rng); }

/** Skip to the next bedtime or the next morning, whichever comes first (at most a day). */
export function skipToSleepChange(game, rng = defaultRng) {
  const pet = game.pet, events = [];
  if (!canAct(pet)) return events;
  const was = isBedtime(pet.stage, game.simTime);
  for (let i = 0; i < 24 * 60 && !pet.gone && isBedtime(pet.stage, game.simTime) === was; i++) events.push(...advance(game, MIN, rng));
  events.push(...advance(game, MIN, rng));
  return events;
}

/** Grow one stage (waking the pet first, as it only grows while awake). */
export function grow(game, rng = defaultRng) { return growNow(game, rng); }

/** Jump straight to a stage, growing through the ones in between. */
export function growTo(game, stage, rng = defaultRng) {
  const events = [];
  while (game.pet && !game.pet.gone && STAGES.indexOf(game.pet.stage) < STAGES.indexOf(stage)) events.push(...growNow(game, rng));
  return events;
}

export function fillNeeds(game) {
  const pet = game.pet;
  if (!canAct(pet)) return;
  Object.assign(pet, { hunger: 4, happy: 4, starvingMs: 0, unhappyMs: 0, attention: null });
}

export function emptyNeeds(game) {
  const pet = game.pet;
  if (!canAct(pet)) return;
  Object.assign(pet, { hunger: 0, happy: 0 });
}

export function makeSick(game, kind = 'cold', rng = defaultRng) { return sicken(game, kind, rng); }

export function cure(game) {
  const pet = game.pet;
  if (pet) Object.assign(pet, { sick: null, critical: false, sickMs: 0, dosesLeft: 0, criticalCount: 0 });
}

export function addPoop(game) { const pet = game.pet; if (canAct(pet)) pet.poop = Math.min(4, pet.poop + 1); }

export function setDirt(game, dirt = MAX_DIRT) { const pet = game.pet; if (canAct(pet)) pet.dirt = dirt; }

/** Make the pet need the toilet right now. */
export function squirm(game) {
  const pet = game.pet;
  if (!canAct(pet) || pet.asleep) return false;
  pet.squirm = true;
  pet.poopIn = TOILET_WARN;
  return true;
}

/** Start a whim (a fuss to scold or comfort). */
export function whim(game) {
  const pet = game.pet;
  if (!canAct(pet) || pet.asleep) return false;
  pet.whim = true;
  return true;
}

/** Step a 0..max counter round (max wraps to 0). Returns the new value. */
const cycle = (v, max) => (v >= max ? 0 : v + 1);
export function cycleDiscipline(game) { const pet = game.pet; return (pet.discipline = cycle(pet.discipline || 0, MAX_DISCIPLINE)); }
export function cyclePotty(game) { const pet = game.pet; return (pet.potty = cycle(pet.potty || 0, POTTY_TRAINED)); }

/** Raise one skill a level (wrapping back to 0 past the top). Returns the new level. */
export function cycleSkill(game, skill) {
  const pet = game.pet;
  pet.skills ||= {};
  const level = cycle(Math.floor((pet.skills[skill] || 0) / SKILL_STEP), SKILL_MAX);
  pet.skills[skill] = level * SKILL_STEP;
  return level;
}

export function maxSkills(game) { const pet = game.pet; pet.skills = Object.fromEntries(SKILLS.map(s => [s, SKILL_MAX * SKILL_STEP])); }

export function addWeight(game, grams) {
  const pet = game.pet;
  if (canAct(pet)) pet.weight = Math.max(Math.round(BASE_WEIGHT[pet.stage] * 0.8), pet.weight + grams);
}

/** An adult that has been grown up long enough to marry. */
export function readyToMarry(game, rng = defaultRng) {
  const events = growTo(game, 'adult', rng);
  const pet = game.pet;
  pet.adultMs = Math.max(pet.adultMs, MARRY_AFTER);
  cure(game);
  return events;
}

/** One minute from growing up (so the change can be watched). */
export function almostGrown(game) {
  const pet = game.pet, len = STAGE_LENGTH[pet?.stage];
  if (len) pet.stageMs = Math.max(pet.stageMs, len - MIN);
}

/** Turn the pet into a founder, fully grown. */
export function becomeFounder(game, name, rng = defaultRng) {
  const f = FOUNDERS.find(x => x.name === name), pet = game.pet;
  if (!f || !pet || pet.gone) return [];
  const events = growTo(game, 'adult', rng);
  const keep = {};
  for (const g of ['appetite', 'energy', 'taste']) keep[g] = pet.genome[g];
  pet.genome = { ...pureGenome(f.traits), ...keep };
  pet.phenotype = express(pet.genome, rng);
  pet.species = f.name;
  discover(game, pet.phenotype);
  return events;
}

/** Give the pet a wild (random, line-based) set of genes. */
export function becomeWild(game, rng = defaultRng) {
  const pet = game.pet;
  if (!pet || pet.gone) return;
  pet.genome = randomGenome(rng);
  pet.phenotype = express(pet.genome, rng);
  pet.species = null;
  if (pet.stage === 'teen' || pet.stage === 'adult') discover(game, pet.phenotype);
}

/** Every travel pass and the whole old map. */
export function unlockTown(game) {
  const t = townState(game);
  for (const d of DISTRICTS) if (d.pass && !t.passes.includes(d.pass.id)) t.passes.push(d.pass.id);
  t.mapPieces = MAP_PIECES;
}

/** Let time pass for the town's residents only (they age, have children and retire). */
export function ageTown(game, ms = 2 * DAY) { townState(game).epoch -= ms; townState(game); }

/** Best friends with every resident. */
export function befriendAll(game, hearts = 7) {
  const t = townState(game);
  for (const l of LOCATIONS) t.friends[l.id] = Math.max(t.friends[l.id] || 0, hearts);
}

/** A new day in town: daily limits, the shift rest and the matchmaker all reset. */
export function resetDaily(game) {
  const t = townState(game);
  t.daily = { day: t.daily.day, counts: {} };
  t.lastWork = 0;
  game.matchmaker = { day: '', left: 3 };
}

export function unlockItems(game) {
  for (const id of Object.keys(TOYS)) if (!game.toys.includes(id)) game.toys.push(id);
  for (const id of Object.keys(CLOTHES)) if (!game.wardrobe.includes(id)) game.wardrobe.push(id);
  for (const id of Object.keys(FOODS)) if (!FOODS[id].free) game.inventory[id] = Math.max(game.inventory[id] || 0, 5);
}

/**
 * Move the game's clock without living through the time between: nothing
 * ages, gets hungry or happens in town. Everything that remembers a moment
 * (the town's own clock, the last pat, the last shift...) moves with it.
 */
export function shiftClock(game, ms) {
  game.simTime += ms;
  const pet = game.pet, town = game.town;
  if (pet) {
    for (const k of ['refusedAt', 'pettedAt']) if (typeof pet[k] === 'number' && pet[k]) pet[k] += ms;
    if (Array.isArray(pet.snackTimes)) pet.snackTimes = pet.snackTimes.map(t => t + ms);
  }
  if (town) for (const k of ['epoch', 'lastWork']) if (typeof town[k] === 'number' && town[k]) town[k] += ms;
  return game.simTime;
}
/** Set the clock to an hour and minute of the game's present day. */
export function setClock(game, hour, minute = 0) {
  const d = new Date(game.simTime);
  d.setHours(hour, minute, 0, 0);
  return shiftClock(game, d.getTime() - game.simTime);
}
/** Put the clock back to the real time and date. */
export function phoneClock(game, now = Date.now()) { return shiftClock(game, now - game.simTime); }

/** Own every piece of every room set (nothing is put out: that is done in Items > Decorate). */
export function unlockDecor(game) {
  fixDecor(game);
  for (const id of Object.keys(DECOR)) if (!game.decor.owned.includes(id)) game.decor.owned.push(id);
  return Object.keys(DECOR).length;
}

/** Fill the Gene Book (quietly: no points and no announcements). */
export function fillBook(game) {
  const points = game.points;
  for (const gene of BOOK_GENES) for (const a of entries(gene)) discover(game, { [gene]: a });
  game.points = points;
  game.bookNews = [];
}

/** Bring on an ending: 'death' (starved) or 'runaway' (unhappy too long). */
export function endGame(game, kind, rng = defaultRng) {
  const pet = game.pet;
  if (!canAct(pet)) return [];
  cure(game);
  if (kind === 'death') Object.assign(pet, { hunger: 0, starvingMs: STARVE_TO_DEATH });
  else Object.assign(pet, { hunger: 4, starvingMs: 0, happy: 0, unhappyMs: UNHAPPY_TO_RUNAWAY, asleep: false });
  return advance(game, MIN, rng);
}

export { HOUR, MIN };
