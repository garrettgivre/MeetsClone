import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import {
  newGame, advance, feed, clean, medicine, toggleLights, buy, findPartner, marry, canMarry, toggleWear,
  MIN, HOUR, STAGE_LENGTH, MARRY_AFTER,
} from '../src/game/pet.js';
import { FOUNDERS } from '../src/game/genetics.js';

// Start at 9 AM so the pet is awake.
const NINE_AM = new Date(2026, 0, 5, 9, 0, 0).getTime();

/** Simulate an attentive owner checking in every 30 minutes. */
function caredFor(game, ms, rng) {
  let left = ms;
  const events = [];
  while (left > 0) {
    const step = Math.min(30 * MIN, left);
    events.push(...advance(game, step, rng));
    left -= step;
    const pet = game.pet;
    if (!pet || pet.gone || pet.stage === 'egg') continue;
    if (pet.asleep) { pet.lights = false; continue; }
    pet.lights = true;
    while (pet.hunger < 3) feed(game, 'riceball', rng);
    if (pet.happy < 3) pet.happy = 4;
    if (pet.poop) clean(game);
    while (pet.sick) medicine(game);
  }
  return events;
}

test('egg hatches after a few minutes', () => {
  const rng = makeRng(1);
  const g = newGame(NINE_AM, rng);
  const ev = advance(g, STAGE_LENGTH.egg + MIN, rng);
  assert.equal(g.pet.stage, 'baby');
  assert.ok(ev.some(e => e.type === 'hatch'));
});

test('a well cared-for pet grows up in about two days and becomes a good-care founder', () => {
  const rng = makeRng(2);
  const g = newGame(NINE_AM, rng);
  caredFor(g, 3 * MIN + HOUR + 48 * HOUR + 14 * HOUR, rng);
  assert.equal(g.pet.stage, 'adult');
  assert.ok(!g.pet.gone);
  const f = FOUNDERS.find(f => f.name === g.pet.species);
  assert.ok(f, 'became a founder');
  assert.ok(f.tier <= 1, `tier ${f.tier} with ${g.pet.careMistakes} mistakes`);
});

test('a neglected pet gets sick and is eventually gone', () => {
  const rng = makeRng(3);
  const g = newGame(NINE_AM, rng);
  advance(g, 4 * 24 * HOUR, rng);
  assert.ok(g.pet.gone, 'pet should be gone');
  assert.equal(g.album.length, 1);
});

test('feeding fills hunger and is refused when full', () => {
  const rng = makeRng(4);
  const g = newGame(NINE_AM, rng);
  advance(g, STAGE_LENGTH.egg + 30 * MIN, rng);
  g.pet.hunger = 1;
  assert.ok(feed(g, 'riceball', rng).ok);
  assert.ok(g.pet.hunger >= 2);
  g.pet.hunger = 4;
  assert.equal(feed(g, 'riceball', rng).ok, false);
});

test('five coloured meals change body colour', () => {
  const rng = makeRng(5);
  const g = newGame(NINE_AM, rng);
  advance(g, STAGE_LENGTH.egg + MIN, rng);
  g.inventory.berrypie = 5;
  let changed = null;
  for (let i = 0; i < 5; i++) { g.pet.hunger = 0; changed = feed(g, 'berrypie', rng).colorChanged || changed; }
  assert.equal(changed, 'blue');
  assert.equal(g.pet.phenotype.color, 'blue');
});

test('too many snacks cause a toothache that medicine cures', () => {
  const rng = makeRng(6);
  const g = newGame(NINE_AM, rng);
  advance(g, STAGE_LENGTH.egg + MIN, rng);
  g.inventory.candy = 10;
  let r;
  for (let i = 0; i < 5; i++) { g.pet.happy = 0; r = feed(g, 'candy', rng); }
  assert.equal(g.pet.sick, 'toothache');
  assert.ok(r.toothache);
  medicine(g);
  assert.equal(g.pet.sick, null);
});

test('lights left on at bedtime count as a care mistake', () => {
  const rng = makeRng(7);
  const g = newGame(new Date(2026, 0, 5, 19, 0).getTime(), rng);
  g.pet.stage = 'child';
  g.pet.stageMs = 0;
  g.pet.hunger = 4; g.pet.happy = 4;
  advance(g, 2.5 * HOUR, rng); // past the 8 PM bedtime with the lights still on
  assert.ok(g.pet.asleep);
  assert.ok(g.pet.careMistakes >= 1);
  toggleLights(g);
  assert.equal(g.pet.lights, false);
});

test('marriage makes a next-generation egg that inherits from both parents', () => {
  const rng = makeRng(8);
  const g = newGame(NINE_AM, rng);
  caredFor(g, 3 * MIN + HOUR + 48 * HOUR + 14 * HOUR, rng);
  assert.equal(canMarry(g.pet), false);
  caredFor(g, MARRY_AFTER, rng);
  assert.ok(canMarry(g.pet));
  const parent = g.pet;
  const partner = findPartner(g, rng);
  assert.notEqual(partner.gender, parent.gender);
  const egg = marry(g, partner, rng);
  assert.equal(egg.generation, 2);
  assert.equal(egg.stage, 'egg');
  assert.deepEqual(egg.parents, [parent.name, partner.name]);
  assert.equal(g.album.at(-1).fate, 'married');
});

test('the shop spends points', () => {
  const g = newGame(NINE_AM, makeRng(9));
  g.points = 100;
  assert.ok(buy(g, 'food', 'cookie').ok);
  assert.equal(g.points, 85);
  assert.equal(buy(g, 'toy', 'plushie').ok, false);
});

test('clothes are bought, worn and swapped, but not inherited', () => {
  const rng = makeRng(10);
  const g = newGame(NINE_AM, rng);
  g.points = 1000;
  assert.ok(buy(g, 'clothes', 'cap').ok);
  assert.equal(buy(g, 'clothes', 'cap').ok, false, 'cannot buy twice');
  advance(g, STAGE_LENGTH.egg + MIN, rng);
  assert.equal(toggleWear(g, 'cap').ok, false, 'babies are too little');
  g.pet.stage = 'adult';
  assert.ok(toggleWear(g, 'cap').worn);
  assert.ok(toggleWear(g, 'bow').worn, 'bow replaces the cap in the head slot');
  assert.equal(g.pet.wear.head, 'bow');
  assert.equal(toggleWear(g, 'bow').worn, false);
  assert.equal(g.pet.wear.head, undefined);
  toggleWear(g, 'scarf');
  g.pet.adultMs = MARRY_AFTER;
  const egg = marry(g, findPartner(g, rng), rng);
  assert.deepEqual(egg.wear, {});
  assert.equal(g.album.at(-1).wear.body, 'scarf');
});

test('becoming a founder gifts its signature outfit', () => {
  const rng = makeRng(11);
  const g = newGame(NINE_AM, rng);
  caredFor(g, 3 * MIN + HOUR + 48 * HOUR + 14 * HOUR, rng);
  const f = FOUNDERS.find(f => f.name === g.pet.species);
  for (const id of Object.values(f.wear)) assert.ok(g.wardrobe.includes(id), id);
  assert.deepEqual(g.pet.wear, f.wear);
});
