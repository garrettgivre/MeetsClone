// Pet simulation. Pure logic, no drawing, so it runs in Node tests and can
// fast-forward the time the page was closed.
//
// Timings follow the original device: egg a few minutes, baby 1 hour,
// child 24 h, teen 24 h, and adults can marry after 24 h of adulthood.

import { rand as defaultRng, hash } from '../engine/rng.js';
import {
  express, inherit, starterGenome, pureGenome, founderFor, randomGenome, randomName,
} from './genetics.js';
import { FOODS, TOYS, CLOTHES, SLOTS, COLOR_FOOD_MEALS } from './items.js';
import { discover } from './book.js';

export const MIN = 60 * 1000;
export const HOUR = 60 * MIN;

export const STAGE_LENGTH = { egg: 3 * MIN, baby: 1 * HOUR, child: 24 * HOUR, teen: 24 * HOUR };
export const NEXT_STAGE = { egg: 'baby', baby: 'child', child: 'teen', teen: 'adult' };
export const MARRY_AFTER = 24 * HOUR;

// Hearts lost per hour while awake.
const HUNGER_RATE = { baby: 3, child: 1.0, teen: 0.8, adult: 0.7 };
const HAPPY_RATE = { baby: 3, child: 0.9, teen: 0.75, adult: 0.65 };
const APPETITE = { light: 0.8, normal: 1, hearty: 1.25 };
const ENERGY = { calm: 0.8, normal: 1, lively: 1.25 };
const POOP_EVERY = { baby: 20 * MIN, child: 150 * MIN, teen: 180 * MIN, adult: 210 * MIN };
// Bedtime hour .. wake hour (local time).
export const SLEEP = { baby: null, child: [20, 8], teen: [21, 8], adult: [22, 8] };

export const SICK_TO_CRITICAL = 6 * HOUR;
export const CRITICAL_TO_DEATH = 4 * HOUR;
export const STARVE_TO_DEATH = 16 * HOUR;
export const UNHAPPY_TO_RUNAWAY = 10 * HOUR;
export const ATTENTION_GRACE = 15 * MIN;
export const LIGHTS_GRACE = 60 * MIN;
export const MAX_CRITICAL = 4;

// Weight (grams): meals and snacks add to it, games burn it off. Each stage
// has a base weight; well over it a pet is chubby and gets sick more easily.
export const BASE_WEIGHT = { egg: 5, baby: 5, child: 10, teen: 20, adult: 30 };
export const MEAL_WEIGHT = 1, SNACK_WEIGHT = 2, GAME_WEIGHT = 1;
export const isChubby = (pet) => pet.weight >= Math.round(BASE_WEIGHT[pet.stage] * 1.5);
const minWeight = (stage) => Math.round(BASE_WEIGHT[stage] * 0.8);

// Discipline (0-4): children, teens and (less often) adults throw whims, calling
// for attention they don't need or refusing a meal. Scolding a whim teaches
// manners; comforting it makes the pet happier but spoils it. A pet with full
// discipline stops fussing. In generation 1, an unruly pet grows into a
// lower-tier founder.
export const MAX_DISCIPLINE = 4;
const WHIM_EVERY = { child: 3 * HOUR, teen: 4 * HOUR, adult: 8 * HOUR };
const REFUSE_GAP = 2 * HOUR;

// Hygiene (0-4 grime): a pet gets grubby while it's awake, faster with poop on
// the floor. A dirty pet (3+) falls ill more easily, and a filthy one (4) calls
// for a bath.
export const MAX_DIRT = 4;
export const DIRTY_AT = 3;
const DIRT_PER_HOUR = 0.2, POOP_DIRT_PER_HOUR = 0.15;
export const isDirty = (pet) => (pet.dirt || 0) >= DIRTY_AT;

// Toilet training: a pet squirms for a few minutes before it poops. Catch it and
// send it to the toilet, and after a few goes it learns to use it on its own.
export const TOILET_WARN = 3 * MIN;
export const POTTY_TRAINED = 4;
export const isPottyTrained = (pet) => (pet.potty || 0) >= POTTY_TRAINED;

// Skills: raised by school classes, good minigames and time around town. Each
// level takes a few points; better jobs ask for a level (see JOBS in town.js).
export const SKILLS = ['smart', 'creative', 'fit', 'charm'];
export const SKILL_LABEL = { smart: 'Smarts', creative: 'Arts', fit: 'Sports', charm: 'Charm' };
export const SKILL_MAX = 5;
export const SKILL_STEP = 3; // points per level
const noSkills = () => ({ smart: 0, creative: 0, fit: 0, charm: 0 });
export const skillLevel = (pet, skill) => Math.min(SKILL_MAX, Math.floor((pet.skills?.[skill] || 0) / SKILL_STEP));

/** What the last minigame taught, as a line for its result screen ('' if nothing). */
export function learnedLine(game) {
  const l = game.learned;
  if (!l) return '';
  return l.up ? `${SKILL_LABEL[l.skill]} level ${l.level}!` : `+1 ${SKILL_LABEL[l.skill]}`;
}

/** Add skill points. Returns { skill, level, up } (up: it just reached a new level). */
export function train(pet, skill, points = 1) {
  if (!SKILLS.includes(skill) || !canAct(pet)) return null;
  pet.skills ||= noSkills();
  const before = skillLevel(pet, skill);
  pet.skills[skill] = Math.min(SKILL_MAX * SKILL_STEP, (pet.skills[skill] || 0) + points);
  const level = skillLevel(pet, skill);
  return { skill, level, up: level > before };
}

export function newGame(now = Date.now(), rng = defaultRng) {
  return {
    version: 2, // keep in step with SAVE_VERSION in save.js
    simTime: now,
    lastReal: now,
    points: 100,
    inventory: { cookie: 3, omelette: 2, juice: 2 },
    toys: ['ball'],
    wardrobe: ['bow', 'scarf'],
    settings: { sound: true, speed: 1, alerts: false, cheats: false, lcd: true },
    generation: 1,
    album: [],
    matchmaker: { day: '', left: 3 },
    book: {},            // Gene Book: { gene: [alleles found] }
    bookNews: [],        // discoveries waiting to be announced
    bookSeeded: true,
    pet: newPet({ generation: 1 }, now, rng),
  };
}

export function newPet({ generation, genome, parents = null, name, skills = null }, now, rng = defaultRng) {
  genome = genome || starterGenome(rng);
  const phenotype = express(genome, rng);
  return {
    id: Math.floor(rng.next() * 2 ** 31).toString(36) + now.toString(36),
    name: name || randomName(rng),
    gender: rng.chance(0.5) ? 'm' : 'f',
    generation,
    parents,
    stage: 'egg',
    stageMs: 0,
    ageMs: 0,
    adultMs: 0,
    genome,
    phenotype,
    hunger: 4,
    happy: 4,
    poop: 0,
    poopIn: POOP_EVERY.baby,
    sick: null,          // null | 'cold' | 'toothache'
    critical: false,
    sickMs: 0,
    dosesLeft: 0,
    criticalCount: 0,
    asleep: false,
    lights: true,
    lightsOnMs: 0,
    careMistakes: 0,
    attention: null,     // { reason, ms, counted }
    starvingMs: 0,
    unhappyMs: 0,
    snackTimes: [],
    colorMeals: {},
    paused: false,
    pettedAt: 0,
    weight: BASE_WEIGHT.baby,
    discipline: 0,
    whim: false,         // fussing for no reason (scold it)
    whimIn: WHIM_EVERY.child,
    refusedAt: 0,
    dirt: 0,             // grime, 0-4 (bathe it)
    squirm: false,       // about to poop (send it to the toilet)
    potty: 0,            // toilet catches so far; trained at POTTY_TRAINED
    skills: { ...noSkills(), ...skills },
    job: null,           // { id, shifts } once hired (see JOBS in town.js)
    wear: {},            // clothing: { head, face, body, back, feet } -> item id
    bornAt: now,
  };
}

export function hearts(v) { return Math.max(0, Math.min(4, Math.ceil(v - 1e-6))); }

function hourOf(t) { return new Date(t).getHours() + new Date(t).getMinutes() / 60; }

export function isBedtime(stage, t) {
  const s = SLEEP[stage];
  if (!s) return false;
  const h = hourOf(t);
  return h >= s[0] || h < s[1];
}

/** Favourite toy is fixed per pet. */
export function favouriteToy(pet) {
  const ids = Object.keys(TOYS);
  return ids[hash(pet.id) % ids.length];
}

/**
 * Advance the simulation by `ms`. Returns a list of events for the UI.
 * Runs in steps of at most one minute.
 */
export function advance(game, ms, rng = defaultRng) {
  const events = [];
  let left = ms;
  while (left > 0) {
    const step = Math.min(MIN, left);
    left -= step;
    game.simTime += step;
    if (game.pet && !game.pet.paused && !game.pet.gone) stepPet(game, game.pet, step, events, rng);
  }
  return events;
}

function emit(events, type, data = {}) { events.push({ type, ...data }); }

function stepPet(game, pet, dt, events, rng) {
  const t = game.simTime;
  pet.ageMs += dt;
  pet.stageMs += dt;

  if (pet.stage === 'egg') {
    if (pet.stageMs >= STAGE_LENGTH.egg) grow(game, pet, events, rng);
    return;
  }
  if (pet.stage === 'adult') pet.adultMs += dt;

  // --- sleep ---
  const bed = isBedtime(pet.stage, t);
  if (bed && !pet.asleep) { pet.asleep = true; pet.lightsOnMs = 0; pet.whim = false; pet.squirm = false; emit(events, 'sleep'); }
  if (!bed && pet.asleep) { pet.asleep = false; pet.lights = true; emit(events, 'wake'); }

  const h = dt / HOUR;
  if (pet.asleep) {
    if (pet.lights) {
      pet.lightsOnMs += dt;
      if (pet.lightsOnMs >= LIGHTS_GRACE && !pet.lightsMistake) {
        pet.lightsMistake = true;
        pet.careMistakes++;
        pet.happy = Math.max(0, pet.happy - 1);
        emit(events, 'mistake', { reason: 'lights' });
      }
    }
  } else {
    pet.lightsMistake = false;
    const sickMul = pet.sick ? 1.5 : 1;
    pet.hunger = Math.max(0, pet.hunger - HUNGER_RATE[pet.stage] * APPETITE[pet.phenotype.appetite] * sickMul * h);
    pet.happy = Math.max(0, pet.happy - HAPPY_RATE[pet.stage] * ENERGY[pet.phenotype.energy] * sickMul * h);

    pet.poopIn -= dt;
    if (pet.poopIn <= 0) {
      if (pet.poop < 4) { pet.poop++; emit(events, 'poop'); }
      pet.squirm = false;
      pet.poopIn = POOP_EVERY[pet.stage] * rng.range(0.7, 1.3);
    } else if (pet.poopIn <= TOILET_WARN && !pet.squirm && pet.poop < 4) {
      if (isPottyTrained(pet)) {
        // a trained pet takes itself to the toilet
        pet.poopIn = POOP_EVERY[pet.stage] * rng.range(0.7, 1.3);
        emit(events, 'toilet');
      } else {
        pet.squirm = true;
        emit(events, 'squirm');
      }
    }

    const wasDirty = isDirty(pet);
    pet.dirt = Math.min(MAX_DIRT, (pet.dirt || 0) + (DIRT_PER_HOUR + pet.poop * POOP_DIRT_PER_HOUR) * h);
    if (!wasDirty && isDirty(pet)) emit(events, 'dirty');
  }

  // --- sickness ---
  if (!pet.sick) {
    let p = 0.00003;
    if (pet.poop >= 3) p += 0.006; else if (pet.poop > 0) p += 0.0005;
    if (pet.hunger <= 0) p += 0.004;
    if (pet.happy <= 0) p += 0.002;
    if (isDirty(pet)) p += pet.dirt >= MAX_DIRT ? 0.003 : 0.001;
    if (pet.stage === 'baby') p *= 0.3;
    if (isChubby(pet)) p *= 2;
    if (rng.chance(p * (dt / MIN))) makeSick(pet, 'cold', events, rng);
  } else {
    pet.sickMs += dt;
    if (!pet.critical && pet.sickMs >= SICK_TO_CRITICAL) {
      pet.critical = true;
      pet.sickMs = 0;
      pet.criticalCount++;
      emit(events, 'critical');
      if (pet.stage === 'adult' && pet.criticalCount >= MAX_CRITICAL) return die(game, pet, 'illness', events);
    } else if (pet.critical && pet.sickMs >= CRITICAL_TO_DEATH) {
      return die(game, pet, 'illness', events);
    }
  }

  // --- neglect ---
  pet.starvingMs = pet.hunger <= 0 ? pet.starvingMs + dt : 0;
  if (pet.starvingMs >= STARVE_TO_DEATH) return die(game, pet, 'hunger', events);
  pet.unhappyMs = pet.happy <= 0 && !pet.asleep ? pet.unhappyMs + dt : (pet.happy > 0 ? 0 : pet.unhappyMs);
  if (pet.unhappyMs >= UNHAPPY_TO_RUNAWAY) return runAway(game, pet, events);

  // --- whims ---
  if (WHIM_EVERY[pet.stage] && !pet.asleep && !pet.whim && pet.discipline < MAX_DISCIPLINE) {
    pet.whimIn -= dt;
    if (pet.whimIn <= 0) {
      resetWhim(pet, rng);
      if (!needs(pet)) { pet.whim = true; emit(events, 'whim'); }
    }
  }

  // --- attention calls ---
  const reason = needs(pet);
  if (!reason) pet.attention = null;
  else if (!pet.attention || pet.attention.reason !== reason) {
    pet.attention = { reason, ms: 0, counted: false };
    emit(events, 'attention', { reason });
  } else {
    pet.attention.ms += dt;
    if (reason === 'whim' && pet.attention.ms >= ATTENTION_GRACE) {
      // an ignored whim blows over: no harm done, but no lesson learned either
      pet.whim = false;
      pet.attention = null;
    } else if (!pet.attention.counted && pet.attention.ms >= ATTENTION_GRACE && reason !== 'lights') {
      pet.attention.counted = true;
      pet.careMistakes++;
      emit(events, 'mistake', { reason });
    }
  }

  // --- growing up ---
  const len = STAGE_LENGTH[pet.stage];
  if (len && pet.stageMs >= len && !pet.asleep) grow(game, pet, events, rng);
}

/** What the pet is calling for, if anything. */
export function needs(pet) {
  if (pet.stage === 'egg' || pet.gone) return null;
  if (pet.asleep) return pet.lights ? 'lights' : null;
  if (pet.sick) return 'sick';
  if (pet.hunger <= 0) return 'hungry';
  if (pet.happy <= 0) return 'unhappy';
  if ((pet.dirt || 0) >= MAX_DIRT) return 'dirty';
  if (pet.whim) return 'whim';
  return null;
}

function resetWhim(pet, rng) {
  pet.whimIn = (WHIM_EVERY[pet.stage] || WHIM_EVERY.child) * rng.range(0.6, 1.4) * (1 + pet.discipline * 0.5);
}

function makeSick(pet, kind, events, rng) {
  pet.sick = kind;
  pet.sickMs = 0;
  pet.dosesLeft = kind === 'toothache' ? 1 : 1 + rng.int(2);
  emit(events, 'sick', { kind });
}

function grow(game, pet, events, rng) {
  const from = pet.stage;
  pet.stage = NEXT_STAGE[from];
  pet.stageMs = 0;
  pet.weight = Math.max(minWeight(pet.stage), (pet.weight ?? BASE_WEIGHT[from]) + BASE_WEIGHT[pet.stage] - BASE_WEIGHT[from]);
  if (pet.stage === 'adult' && pet.generation === 1) {
    // Generation 1: care decides who your pet becomes, and an unruly pet counts as worse care.
    const f = founderFor(pet.careMistakes + Math.max(0, 2 - pet.discipline), rng);
    const keep = {};
    for (const g of ['appetite', 'energy', 'taste']) keep[g] = pet.genome[g];
    pet.genome = { ...pureGenome(f.traits), ...keep };
    pet.phenotype = express(pet.genome, rng);
    pet.species = f.name;
    // the founder's signature outfit is a gift
    for (const id of Object.values(f.wear || {})) if (!game.wardrobe.includes(id)) game.wardrobe.push(id);
    // (hand-drawn founders don't wear body outfits yet, so start them undressed)
    pet.wear = {};
  }
  if (from === 'egg') emit(events, 'hatch');
  else emit(events, 'grow', { stage: pet.stage });
  // the Gene Book records every part a pet shows once it's grown into its looks
  if (pet.stage === 'teen' || pet.stage === 'adult') discover(game, pet.phenotype);
  if (pet.stage !== 'adult') pet.careMistakes = from === 'egg' ? 0 : pet.careMistakes;
}

function retire(game, pet, fate, extra = {}) {
  game.album.push({
    name: pet.name, gender: pet.gender, generation: pet.generation, phenotype: pet.phenotype,
    stage: pet.stage, species: pet.species || null, wear: { ...(pet.wear || {}) }, fate, ageMs: pet.ageMs, endedAt: game.simTime, ...extra,
  });
}

function die(game, pet, cause, events) {
  pet.gone = 'died';
  pet.cause = cause;
  retire(game, pet, 'died', { cause });
  emit(events, 'death', { cause });
}

function runAway(game, pet, events) {
  pet.gone = 'ranaway';
  retire(game, pet, 'ran away');
  emit(events, 'runaway');
}

// ---------- Player actions. Each returns { ok, msg?, ... } ----------

export function feed(game, foodId, rng = defaultRng) {
  const pet = game.pet;
  const food = FOODS[foodId];
  if (!food || !canAct(pet)) return { ok: false };
  if (!food.free && !(game.inventory[foodId] > 0)) return { ok: false, msg: 'None left!' };
  if (food.babyOnly && pet.stage !== 'baby') return { ok: false, msg: 'Too old for milk!' };
  if (pet.sick && food.kind === 'snack') return { ok: false, refuse: true, msg: "Doesn't feel well." };
  if (food.kind === 'meal' && pet.hunger >= 4) return { ok: false, refuse: true, msg: 'Full!' };
  if (food.kind === 'snack' && pet.happy >= 4 && pet.hunger >= 4) return { ok: false, refuse: true, msg: 'Not now!' };
  // an unruly pet sometimes turns its nose up at a meal: that's a whim to scold
  if (food.kind === 'meal' && WHIM_EVERY[pet.stage] && game.simTime - pet.refusedAt >= REFUSE_GAP
    && rng.chance((MAX_DISCIPLINE - pet.discipline) * 0.06)) {
    pet.refusedAt = game.simTime;
    pet.whim = true;
    return { ok: false, refuse: true, whim: true, msg: "Hmph! Won't eat!" };
  }

  if (!food.free) game.inventory[foodId]--;
  pet.weight += food.kind === 'meal' ? MEAL_WEIGHT : SNACK_WEIGHT;
  const fav = food.taste === pet.phenotype.taste;
  let liked = fav;
  let disliked = foodId === 'riceball' && pet.stage === 'adult' && !fav;
  if (food.kind === 'meal') {
    pet.hunger = Math.min(4, pet.hunger + (fav ? 2 : 1));
    if (fav) pet.happy = Math.min(4, pet.happy + 1);
  } else {
    pet.happy = Math.min(4, pet.happy + (fav ? 2 : 1));
    pet.snackTimes = pet.snackTimes.filter(t => game.simTime - t < 3 * HOUR);
    pet.snackTimes.push(game.simTime);
    if (pet.snackTimes.length >= 5 && !pet.sick) {
      makeSick(pet, 'toothache', [], rng);
      pet.snackTimes = [];
      return { ok: true, liked, toothache: true, msg: 'Ouch! A toothache!' };
    }
  }
  let colorChanged = null;
  if (food.color) {
    const n = (pet.colorMeals[food.color] || 0) + 1;
    pet.colorMeals[food.color] = n;
    if (n >= COLOR_FOOD_MEALS && pet.phenotype.color !== food.color && pet.stage !== 'egg') {
      pet.phenotype.color = food.color;
      // Diet colour is passed on: it replaces one colour allele.
      pet.genome.color = [food.color, pet.genome.color[1]];
      pet.colorMeals[food.color] = 0;
      colorChanged = food.color;
    }
  }
  return { ok: true, liked, disliked, colorChanged };
}

export function play(game, toyId) {
  const pet = game.pet;
  if (!canAct(pet)) return { ok: false };
  if (!game.toys.includes(toyId)) return { ok: false };
  if (pet.sick) return { ok: false, refuse: true, msg: "Doesn't feel well." };
  const fav = favouriteToy(pet) === toyId;
  pet.happy = Math.min(4, pet.happy + (fav ? 2 : 1));
  return { ok: true, liked: fav };
}

export function clean(game) {
  const pet = game.pet;
  if (!pet || pet.poop === 0) return { ok: false, msg: 'Already clean!' };
  pet.poop = 0;
  return { ok: true };
}

/** A bath washes the grime off. A clean pet won't get in the tub. */
export function bathe(game) {
  const pet = game.pet;
  if (!canAct(pet) || pet.asleep) return { ok: false };
  if (pet.sick) return { ok: false, refuse: true, msg: "Doesn't feel well." };
  if ((pet.dirt || 0) < 1) return { ok: false, refuse: true, msg: 'Already squeaky clean!' };
  const dirty = isDirty(pet);
  pet.dirt = 0;
  pet.happy = Math.min(4, pet.happy + (dirty ? 1 : 0.5));
  return { ok: true, msg: dirty ? 'So fresh and clean!' : 'Splish splash!' };
}

/**
 * Send a squirming pet to the toilet: no mess, and one step closer to being
 * toilet trained (which also teaches a little discipline).
 */
export function toilet(game, rng = defaultRng) {
  const pet = game.pet;
  if (!canAct(pet) || pet.asleep) return { ok: false };
  if (!pet.squirm) return { ok: false, refuse: true, msg: isPottyTrained(pet) ? 'It goes by itself now!' : "Doesn't need to go!" };
  pet.squirm = false;
  pet.poopIn = POOP_EVERY[pet.stage] * rng.range(0.7, 1.3);
  pet.potty = Math.min(POTTY_TRAINED, (pet.potty || 0) + 1);
  pet.happy = Math.min(4, pet.happy + 0.5);
  if (isPottyTrained(pet)) {
    pet.discipline = Math.min(MAX_DISCIPLINE, pet.discipline + 1);
    return { ok: true, trained: true, msg: 'Toilet trained! It will go by itself from now on.' };
  }
  return { ok: true, msg: `Made it in time! (${pet.potty}/${POTTY_TRAINED})` };
}

export function medicine(game) {
  const pet = game.pet;
  if (!canAct(pet)) return { ok: false };
  if (!pet.sick) return { ok: false, refuse: true, msg: "Not sick!" };
  if (pet.critical && pet.stage === 'adult' && pet.criticalCount >= MAX_CRITICAL) return { ok: false, msg: 'It is too late...' };
  pet.dosesLeft--;
  if (pet.dosesLeft > 0) return { ok: true, cured: false, msg: 'One more dose...' };
  pet.sick = null;
  pet.critical = false;
  pet.sickMs = 0;
  return { ok: true, cured: true, msg: 'All better!' };
}

/** Scold: the right answer to a whim. Scolding a pet that did nothing wrong just upsets it. */
export function scold(game) {
  const pet = game.pet;
  if (!canAct(pet) || pet.asleep) return { ok: false };
  if (!pet.whim) {
    pet.happy = Math.max(0, pet.happy - 1);
    return { ok: true, fair: false, msg: 'Huh? It did nothing wrong...' };
  }
  pet.whim = false;
  pet.attention = null;
  pet.discipline = Math.min(MAX_DISCIPLINE, pet.discipline + 1);
  return { ok: true, fair: true, discipline: pet.discipline, msg: pet.discipline >= MAX_DISCIPLINE ? 'Perfectly behaved!' : 'It listened!' };
}

/** Comfort a fussing pet: happier now, but it learns that fussing works. */
export function comfort(game) {
  const pet = game.pet;
  if (!canAct(pet) || pet.asleep || !pet.whim) return { ok: false };
  pet.whim = false;
  pet.attention = null;
  pet.happy = Math.min(4, pet.happy + 1);
  pet.discipline = Math.max(0, pet.discipline - 1);
  return { ok: true, msg: 'All better... for now.' };
}

/**
 * After a minigame: points, a little happiness for a good effort, and some
 * weight burned off. Returns the points earned.
 */
export function finishGame(game, { points = 0, good = false, skill = null } = {}) {
  const pet = game.pet;
  earn(game, points);
  game.learned = null; // what the last game taught: { skill, level, up }
  if (canAct(pet)) {
    if (good) pet.happy = Math.min(4, pet.happy + 1);
    pet.weight = Math.max(minWeight(pet.stage), pet.weight - GAME_WEIGHT);
    if (good && skill) game.learned = train(pet, skill, 1);
  }
  return points;
}

export function toggleLights(game) {
  const pet = game.pet;
  if (!pet) return { ok: false };
  pet.lights = !pet.lights;
  return { ok: true, lights: pet.lights };
}

/** Tapping the pet: a little happiness, at most once every 30 minutes. */
export function pat(game) {
  const pet = game.pet;
  if (!canAct(pet) || pet.asleep) return { ok: false };
  if (game.simTime - pet.pettedAt < 30 * MIN) return { ok: true, gain: false };
  pet.pettedAt = game.simTime;
  pet.happy = Math.min(4, pet.happy + 0.5);
  return { ok: true, gain: true };
}

export function canAct(pet) { return pet && !pet.gone && pet.stage !== 'egg'; }

// ---------- Hooks for the debug menu (src/game/cheats.js) ----------

/** Grow to the next stage right now. Returns the events. */
export function growNow(game, rng = defaultRng) {
  const events = [], pet = game.pet;
  if (pet && !pet.gone && NEXT_STAGE[pet.stage]) grow(game, pet, events, rng);
  return events;
}

/** Make the pet ill ('cold' or 'toothache'). Returns the events. */
export function sicken(game, kind = 'cold', rng = defaultRng) {
  const events = [];
  if (canAct(game.pet) && !game.pet.sick) makeSick(game.pet, kind, events, rng);
  return events;
}

export function earn(game, n) { game.points = Math.min(999999, game.points + Math.max(0, Math.floor(n))); }

export function buy(game, kind, id) {
  const item = kind === 'food' ? FOODS[id] : kind === 'toy' ? TOYS[id] : CLOTHES[id];
  if (!item) return { ok: false };
  const owned = kind === 'toy' ? game.toys : kind === 'clothes' ? game.wardrobe : null;
  if (owned?.includes(id)) return { ok: false, msg: 'Already owned!' };
  if (game.points < item.price) return { ok: false, msg: 'Not enough points!' };
  game.points -= item.price;
  if (kind === 'food') game.inventory[id] = (game.inventory[id] || 0) + 1;
  else owned.push(id);
  return { ok: true };
}

/** Clothes fit teens and adults. */
export function canDress(pet) { return canAct(pet) && (pet.stage === 'teen' || pet.stage === 'adult'); }

/** Put an owned item on (or take it off if it's already worn). */
export function toggleWear(game, id) {
  const pet = game.pet, item = CLOTHES[id];
  if (!item || !game.wardrobe.includes(id)) return { ok: false };
  if (!canDress(pet)) return { ok: false, msg: 'Too little for clothes!' };
  pet.wear = pet.wear || {};
  if (pet.wear[item.slot] === id) { delete pet.wear[item.slot]; return { ok: true, worn: false }; }
  pet.wear[item.slot] = id;
  return { ok: true, worn: true };
}

/** A random outfit for matchmaker partners (0-3 items). */
export function randomOutfit(rng = defaultRng) {
  const wear = {};
  const n = rng.int(4);
  for (let i = 0; i < n; i++) {
    const id = rng.pick(Object.keys(CLOTHES));
    wear[CLOTHES[id].slot] = id;
  }
  return wear;
}

// ---------- Marriage ----------

export function canMarry(pet) { return canAct(pet) && pet.stage === 'adult' && pet.adultMs >= MARRY_AFTER && !pet.sick; }

/** The matchmaker brings a random partner of the other gender (3 per day). */
export function findPartner(game, rng = defaultRng) {
  const day = new Date(game.simTime).toDateString();
  if (game.matchmaker.day !== day) game.matchmaker = { day, left: 3 };
  if (game.matchmaker.left <= 0) return null;
  game.matchmaker.left--;
  const genome = randomGenome(rng);
  return {
    name: randomName(rng),
    gender: game.pet.gender === 'm' ? 'f' : 'm',
    genome,
    phenotype: express(genome, rng),
    wear: randomOutfit(rng),
  };
}

/** Marry: the current pet leaves for the album and the couple's egg begins the next generation. */
export function marry(game, partner, rng = defaultRng) {
  const pet = game.pet;
  const [mom, dad] = pet.gender === 'f' ? [pet, partner] : [partner, pet];
  const genome = inherit(mom.genome, dad.genome, rng);
  // a wish made on Star Isle (src/game/town.js): the egg gets two copies of a part
  // the family has never seen, so it shows
  const wish = game.town?.wish;
  if (wish) { genome[wish.gene] = [wish.allele, wish.allele]; game.town.wish = null; }
  discover(game, partner.phenotype);
  retire(game, pet, 'married', { partner: { name: partner.name, phenotype: partner.phenotype, wear: partner.wear || {} } });
  game.generation = pet.generation + 1;
  // a third of what the parent learned is passed down
  const skills = {};
  for (const s of SKILLS) skills[s] = Math.floor((pet.skills?.[s] || 0) / 3);
  game.pet = newPet({ generation: game.generation, genome, parents: [pet.name, partner.name], skills }, game.simTime, rng);
  return game.pet;
}

/** After a death or runaway, start over with a new generation-1 egg. */
export function startOver(game, rng = defaultRng) {
  game.generation = 1;
  game.pet = newPet({ generation: 1 }, game.simTime, rng);
  return game.pet;
}
