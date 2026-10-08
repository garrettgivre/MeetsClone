import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import {
  newGame, advance, feed, scold, comfort, finishGame, isChubby,
  MIN, HOUR, STAGE_LENGTH, BASE_WEIGHT, MAX_DISCIPLINE,
} from '../src/game/pet.js';
import { FOUNDERS } from '../src/game/genetics.js';

const NINE_AM = new Date(2026, 0, 5, 9, 0, 0).getTime();

/** A child at 9 AM, fed and happy. */
function child(seed) {
  const rng = makeRng(seed);
  const g = newGame(NINE_AM, rng);
  Object.assign(g.pet, { stage: 'child', stageMs: 0, hunger: 4, happy: 4, weight: BASE_WEIGHT.child });
  return { g, rng };
}

/** Keep needs topped up so only whims call for attention. */
function tend(g, ms, rng, onWhim) {
  for (let left = ms; left > 0; left -= 10 * MIN) {
    advance(g, 10 * MIN, rng);
    Object.assign(g.pet, { hunger: 4, happy: 4, poop: 0, sick: null });
    if (g.pet.whim) onWhim?.(g);
  }
}

test('children throw whims, and scolding them builds discipline', () => {
  const { g, rng } = child(1);
  let whims = 0;
  tend(g, 10 * HOUR, rng, (g) => { whims++; assert.ok(scold(g).fair); });
  assert.ok(whims >= 2, `only ${whims} whims in 10 hours`);
  assert.equal(g.pet.discipline, Math.min(MAX_DISCIPLINE, whims));
  assert.equal(g.pet.careMistakes, 0, 'whims are never care mistakes');
});

test('an ignored whim blows over without a care mistake', () => {
  const { g, rng } = child(2);
  g.pet.whimIn = MIN;
  advance(g, 2 * MIN, rng);
  assert.ok(g.pet.whim);
  advance(g, 20 * MIN, rng);
  assert.equal(g.pet.whim, false);
  assert.equal(g.pet.careMistakes, 0);
  assert.equal(g.pet.discipline, 0);
});

test('scolding for nothing upsets the pet; comforting a whim spoils it', () => {
  const { g } = child(3);
  const r = scold(g);
  assert.equal(r.fair, false);
  assert.equal(g.pet.happy, 3);
  Object.assign(g.pet, { whim: true, discipline: 2, happy: 2 });
  assert.ok(comfort(g).ok);
  assert.equal(g.pet.discipline, 1);
  assert.equal(g.pet.happy, 3);
  assert.equal(g.pet.whim, false);
});

test('a perfectly disciplined pet stops fussing and never refuses meals', () => {
  const { g, rng } = child(4);
  g.pet.discipline = MAX_DISCIPLINE;
  let whims = 0;
  tend(g, 10 * HOUR, rng, () => whims++);
  assert.equal(whims, 0);
  for (let i = 0; i < 50; i++) { g.pet.hunger = 0; g.pet.refusedAt = 0; assert.ok(feed(g, 'riceball', rng).ok); }
});

test('an unruly pet sometimes refuses a meal, which is a whim', () => {
  const { g, rng } = child(5);
  let refused = null;
  for (let i = 0; i < 100 && !refused; i++) {
    g.pet.hunger = 0; g.pet.refusedAt = 0;
    const r = feed(g, 'riceball', rng);
    if (!r.ok) refused = r;
  }
  assert.ok(refused?.whim, 'never refused');
  assert.ok(g.pet.whim);
  g.pet.hunger = 0;
  assert.ok(feed(g, 'riceball', rng).ok, 'no second refusal straight away');
});

test('in generation 1, an unruly pet grows into a lower-tier founder', () => {
  const tierAt = (discipline) => {
    const { g, rng } = child(6);
    Object.assign(g.pet, { stage: 'teen', stageMs: STAGE_LENGTH.teen - MIN, careMistakes: 0, discipline });
    advance(g, 2 * MIN, rng);
    assert.equal(g.pet.stage, 'adult');
    return FOUNDERS.find(f => f.name === g.pet.species).tier;
  };
  assert.equal(tierAt(MAX_DISCIPLINE), 0);
  assert.equal(tierAt(0), 1);
});

test('meals and snacks add weight, games burn it off, and growing up adds more', () => {
  const { g, rng } = child(7);
  g.inventory.candy = 5;
  g.pet.discipline = MAX_DISCIPLINE; // no refusals
  g.pet.hunger = 0;
  feed(g, 'riceball', rng);
  assert.equal(g.pet.weight, BASE_WEIGHT.child + 1);
  g.pet.happy = 0;
  feed(g, 'candy', rng);
  assert.equal(g.pet.weight, BASE_WEIGHT.child + 3);
  const pts = g.points;
  assert.equal(finishGame(g, { points: 20, good: true }), 20);
  assert.equal(g.points, pts + 20);
  assert.equal(g.pet.weight, BASE_WEIGHT.child + 2);
  for (let i = 0; i < 30; i++) finishGame(g);
  assert.equal(g.pet.weight, Math.round(BASE_WEIGHT.child * 0.8), 'weight has a floor');
  g.pet.weight = BASE_WEIGHT.child * 2;
  assert.ok(isChubby(g.pet));
  Object.assign(g.pet, { stageMs: STAGE_LENGTH.child - MIN, weight: BASE_WEIGHT.child + 4, hunger: 4, happy: 4 });
  advance(g, 2 * MIN, rng);
  assert.equal(g.pet.stage, 'teen');
  assert.equal(g.pet.weight, BASE_WEIGHT.teen + 4);
});
