import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { newGame, feed, play } from '../src/game/pet.js';
import { migrate } from '../src/game/save.js';
import { FOODS } from '../src/game/items.js';
import { CROPS, PLOTS, gardenOf, stageOf, plant, water, harvest } from '../src/game/garden.js';
import { RECIPES, FLOP, STAPLES, INGREDIENTS, buyStaple, cook, dishFor, canCook, knows } from '../src/game/cooking.js';
import { todaysWishes, grant, wishText, WISH_POINTS, WISH_BONUS, WISHES_A_DAY } from '../src/game/wishes.js';
import { FOOD_ART } from '../src/art/icons.js';

const DAY = 24 * 60 * 60 * 1000;
const game = () => { const g = newGame(Date.UTC(2026, 0, 1, 12), makeRng(3)); g.pet.stage = 'adult'; g.points = 1000; return g; };

test('the garden: a seed costs points, grows a step each day it is watered, and is picked into the pantry', () => {
  const g = game();
  assert.equal(gardenOf(g).plots.length, PLOTS);
  assert.equal(water(g).ok, false, 'nothing to water yet');
  assert.ok(plant(g, 0, 'tomato').ok);
  assert.equal(g.points, 1000 - CROPS.tomato.seed);
  assert.equal(plant(g, 0, 'carrot').ok, false, 'the plot is taken');
  assert.equal(stageOf(g.garden.plots[0]), 'sprout');
  assert.ok(water(g, 0).ok);
  assert.equal(water(g, 0).ok, false, 'once a day');
  assert.equal(stageOf(g.garden.plots[0]), 'leafy');
  assert.equal(harvest(g, 0).ok, false, 'not ripe');
  g.simTime += DAY;
  const r = water(g);
  assert.equal(r.ripe, 1);
  assert.equal(stageOf(g.garden.plots[0]), 'ripe');
  assert.equal(harvest(g, 0).count, CROPS.tomato.crop);
  assert.equal(g.pantry.tomato, CROPS.tomato.crop);
  assert.equal(g.garden.plots[0], null);
});

test('cooking: the right pair makes a recipe that is then known, any other pair an odd stew', () => {
  const g = game();
  assert.equal(cook(g, 'tomato', 'flour').ok, false, 'an empty pantry');
  g.pantry = { tomato: 2, carrot: 2 };
  assert.ok(buyStaple(g, 'flour').ok);
  assert.equal(g.points, 1000 - STAPLES.flour.price);
  assert.equal(canCook(g, 'tomatotart'), true);
  const r = cook(g, 'flour', 'tomato');
  assert.deepEqual([r.dish, r.isNew], ['tomatotart', true], 'either way round');
  assert.equal(g.inventory.tomatotart, 1);
  assert.ok(knows(g, 'tomatotart'));
  assert.equal(cook(g, 'tomato', 'tomato').ok, false, 'one tomato left');
  const flop = cook(g, 'tomato', 'carrot');
  assert.deepEqual([flop.dish, flop.isNew], [FLOP, false]);
  // every recipe is two real ingredients, makes a dish that is a food with a picture, and is never sold
  for (const [dish, needs] of Object.entries(RECIPES)) {
    assert.equal(needs.length, 2);
    for (const id of needs) assert.ok(INGREDIENTS[id], `${id} is an ingredient`);
    assert.equal(dishFor(...needs), dish);
    assert.ok(FOODS[dish]?.cooked && FOOD_ART[dish], `${dish} is a cooked food with art`);
  }
  assert.ok(FOODS[FLOP].cooked && FOOD_ART[FLOP]);
  // a home-cooked dish fills more than a bought meal
  g.pet.hunger = 0;
  assert.ok(feed(g, 'tomatotart', makeRng(1)).ok);
  assert.ok(g.pet.hunger >= 2);
});

test('wishes: three a day for a pet old enough, paid as they are granted, with a bonus for all of them', () => {
  const g = game();
  const w = todaysWishes(g);
  assert.equal(w.list.length, WISHES_A_DAY);
  assert.equal(todaysWishes(g), w, 'the same wishes all day');
  for (const x of w.list) assert.notEqual(wishText(x), '...');
  const before = g.points;
  assert.equal(grant(g, 'nothing-like-this'), 0);
  let paid = 0;
  for (const x of w.list) paid += grant(g, x.kind, x.id);
  assert.equal(paid, WISHES_A_DAY * WISH_POINTS + WISH_BONUS);
  assert.equal(g.points, before + paid);
  assert.equal(grant(g, w.list[0].kind, w.list[0].id), 0, 'not twice');
  assert.ok(g.bookNews.length >= WISHES_A_DAY + 1, 'the home screen has news to read out');
  // a new day brings new wishes; care actions grant them through pet.js
  g.simTime += DAY;
  const next = todaysWishes(g);
  assert.notEqual(next, w);
  next.list = [{ kind: 'play', id: 'ball', done: false }, { kind: 'eat', id: 'cookie', done: false }];
  g.pet.happy = 0; g.pet.hunger = 0;
  play(g, 'ball');
  feed(g, 'cookie', makeRng(1));
  assert.ok(next.list.every(x => x.done));
  // none for an egg or a baby
  const young = game(); young.pet.stage = 'baby';
  assert.equal(todaysWishes(young), null);
});

test('an older save gains a garden, a pantry and a recipe list', () => {
  const g = game();
  delete g.garden; delete g.pantry; delete g.recipes; delete g.wishes;
  const m = migrate(JSON.parse(JSON.stringify(g)));
  assert.equal(gardenOf(m).plots.length, PLOTS);
  assert.deepEqual(m.pantry, {});
  assert.deepEqual(m.recipes, []);
});

test('special days: market day is cheaper, games day pays double, and the calendar knows what falls when', async () => {
  const { specialDays, isDay, priceToday, fullMoon } = await import('../src/game/days.js');
  const { eventsOn, monthOf, today } = await import('../src/game/calendar.js');
  const { buy, finishGame } = await import('../src/game/pet.js');
  const at = (y, m, d) => new Date(y, m, d, 12).getTime();
  assert.deepEqual(specialDays(at(2026, 9, 10)), ['market']);   // a Saturday
  assert.ok(isDay(at(2026, 9, 14), 'games'));                   // a Wednesday
  assert.ok(isDay(at(2026, 9, 11), 'visiting'));                // a Sunday
  assert.equal(priceToday(at(2026, 9, 10), 100), 80);
  assert.equal(priceToday(at(2026, 9, 12), 100), 100);
  // one full moon in about every 29 or 30 days
  let moons = 0;
  for (let d = 0; d < 59; d++) if (fullMoon(at(2026, 0, 1) + d * DAY)) moons++;
  assert.equal(moons, 2);
  const g = game();
  g.simTime = at(2026, 9, 10);
  const before = g.points;
  assert.ok(buy(g, 'food', 'cookie').ok);
  assert.equal(before - g.points, priceToday(g.simTime, FOODS.cookie.price));
  g.simTime = at(2026, 9, 14);
  assert.equal(finishGame(g, { points: 10 }), 20);
  // the calendar: every day of the month, with the special days marked, and today in sections
  const m = monthOf(g, g.simTime);
  assert.equal(m.days.length, 31);
  assert.ok(m.days[9].kinds.includes('market') && m.days[13].kinds.includes('games'));
  assert.ok(eventsOn(g, at(2026, 9, 10)).some(e => e.kind === 'market'));
  const sections = today(g);
  assert.ok(sections.some(s => s.head === 'TODAY') && sections.some(s => s.head === 'IN THE SHOPS'));
});
