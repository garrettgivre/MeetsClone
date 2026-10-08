import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { newGame, marry, findPartner, BASE_WEIGHT, MAX_DISCIPLINE, MARRY_AFTER, HOUR } from '../src/game/pet.js';
import { has } from '../src/game/book.js';
import {
  DISTRICTS, LOCATIONS, LOCATION, ACTIONS, MAP_PIECES, FRIEND_GIFTS,
  townState, districtLocked, buyPass, cantGo, resident, talk, doAction, dyeHair, buySale, saleOfDay, founderKin,
} from '../src/game/town.js';

const NINE_AM = new Date(2026, 0, 5, 9, 0, 0).getTime();

/** A teen out on the town with plenty of points. */
function outing(seed = 1, stage = 'teen') {
  const rng = makeRng(seed);
  const g = newGame(NINE_AM, rng);
  Object.assign(g.pet, { stage, hunger: 2, happy: 2, weight: BASE_WEIGHT[stage] });
  g.points = 5000;
  return { g, rng };
}
const nextDay = (g) => { g.simTime += 24 * HOUR; };

test('every place has a district, a resident and something to do', () => {
  assert.equal(LOCATIONS.length, 22);
  for (const l of LOCATIONS) {
    assert.ok(DISTRICTS.some(d => d.id === l.district), l.id);
    assert.ok(l.resident && l.lines.length, l.id);
    assert.ok(ACTIONS[l.id]?.length, `${l.id} has actions`);
    assert.ok(resident(l.id).phenotype.form, `${l.id} resident has looks`);
  }
  assert.deepEqual(resident('park'), resident('park'), 'residents look the same every visit');
});

test('downtown is open, other districts need a pass, and the village needs the map', () => {
  const { g } = outing();
  assert.equal(districtLocked(g, 'downtown'), null);
  assert.equal(districtLocked(g, 'uptown'), 'pass');
  assert.equal(districtLocked(g, 'hidden'), 'secret');
  assert.match(cantGo(g, 'school'), /Bus Pass/);
  assert.ok(buyPass(g, 'bus').ok);
  assert.equal(cantGo(g, 'school'), null);
  assert.equal(buyPass(g, 'bus').ok, false, 'only once');
  townState(g).mapPieces = MAP_PIECES;
  assert.equal(districtLocked(g, 'hidden'), null);
});

test('babies stay home, and sick pets can only go to the hospital', () => {
  const { g } = outing(2, 'baby');
  assert.match(cantGo(g, 'park'), /little/);
  g.pet.stage = 'teen';
  g.pet.sick = 'cold';
  assert.match(cantGo(g, 'park'), /sick/i);
  assert.equal(cantGo(g, 'hospital'), null);
  const p = g.points;
  assert.ok(doAction(g, 'hospital', 'treat').ok);
  assert.equal(g.pet.sick, null);
  assert.equal(g.points, p - 40);
});

test('talking once a day builds friendship, with gifts along the way', () => {
  const { g, rng } = outing(3);
  let gifts = 0;
  for (let d = 0; d < 8; d++) {
    const r = talk(g, 'park', rng);
    if (r.gift) gifts += r.gift;
    talk(g, 'park', rng); // a second chat the same day doesn't count
    nextDay(g);
  }
  assert.equal(townState(g).friends.park, 8);
  assert.equal(gifts, Object.values(FRIEND_GIFTS).reduce((a, b) => a + b, 0));
});

test('daily limits reset each day', () => {
  const { g, rng } = outing(4);
  assert.ok(doAction(g, 'park', 'stroll', rng).ok);
  assert.equal(doAction(g, 'park', 'stroll', rng).ok, false);
  for (let i = 0; i < 3; i++) assert.ok(doAction(g, 'playground', i % 2 ? 'swing' : 'slide', rng).ok);
  assert.equal(doAction(g, 'playground', 'swing', rng).ok, false, 'three plays a day');
  nextDay(g);
  assert.ok(doAction(g, 'park', 'stroll', rng).ok);
  assert.ok(doAction(g, 'playground', 'swing', rng).ok);
});

test('the cafe feeds, school teaches manners, and work is for grown-ups', () => {
  const { g, rng } = outing(5);
  g.pet.hunger = 0;
  assert.ok(doAction(g, 'cafe', 'lunch', rng).ok);
  assert.equal(g.pet.hunger, 3);
  assert.equal(g.pet.weight, BASE_WEIGHT.teen + 1);
  buyPass(g, 'bus');
  g.pet.discipline = 1;
  assert.ok(doAction(g, 'school', 'lesson', rng).ok);
  assert.equal(g.pet.discipline, 2);
  assert.match(doAction(g, 'work', 'shift', rng).msg, /Grown-ups/);
  g.pet.stage = 'adult';
  const p = g.points;
  assert.ok(doAction(g, 'work', 'shift', rng).ok);
  assert.equal(g.points, p + 60);
  assert.equal(doAction(g, 'work', 'shift', rng).ok, false, 'needs a rest between shifts');
});

test('the castle only admits well-mannered pets, and gives a crown the first time', () => {
  const { g, rng } = outing(6);
  buyPass(g, 'balloon');
  assert.match(doAction(g, 'castle', 'audience', rng).msg, /well-mannered/);
  g.pet.discipline = MAX_DISCIPLINE;
  assert.ok(doAction(g, 'castle', 'audience', rng).ok);
  assert.ok(g.wardrobe.includes('crown'));
});

test('a wish on Star Isle gives the next egg a part the family has never seen', () => {
  const { g, rng } = outing(7, 'adult');
  buyPass(g, 'balloon');
  assert.ok(doAction(g, 'starisle', 'wish', rng).ok);
  const wish = townState(g).wish;
  assert.ok(wish && !has(g, wish.gene, wish.allele));
  assert.equal(doAction(g, 'starisle', 'wish', rng).ok, false, 'one wish at a time');
  g.pet.adultMs = MARRY_AFTER;
  g.pet.species = 'Gloop';
  marry(g, findPartner(g, rng), rng);
  assert.deepEqual(g.pet.genome[wish.gene], [wish.allele, wish.allele]);
  assert.equal(townState(g).wish, null);
});

test('the forest and park turn up map pieces that open the hidden village', () => {
  const { g, rng } = outing(8);
  buyPass(g, 'train');
  for (let d = 0; d < 200 && townState(g).mapPieces < MAP_PIECES; d++) { doAction(g, 'forest', 'forage', rng); nextDay(g); }
  assert.equal(townState(g).mapPieces, MAP_PIECES);
  assert.equal(cantGo(g, 'hidden'), null);
});

test('the salon dyes hair (not passed on), the store has a sale, and founder kin are pure', () => {
  const { g } = outing(9, 'adult');
  g.pet.phenotype.hair = 'tuft';
  const gene = [...g.pet.genome.hairColor];
  assert.ok(dyeHair(g, 'violet').ok);
  assert.equal(g.pet.phenotype.hairColor, 'violet');
  assert.deepEqual(g.pet.genome.hairColor, gene, 'dye is not genetic');
  const [kind, id] = saleOfDay(g);
  assert.ok(buySale(g).ok);
  assert.ok((kind === 'toy' ? g.toys : g.wardrobe).includes(id));
  const kin = founderKin(g, 'Hoolet');
  assert.equal(kin.phenotype.form, 'avian');
  assert.deepEqual(kin.genome.head, ['owl', 'owl']);
});

test('photos are saved, up to a limit', () => {
  const { g, rng } = outing(10);
  buyPass(g, 'bus');
  for (let i = 0; i < 25; i++) assert.ok(doAction(g, 'studio', 'photo', rng).ok);
  assert.equal(townState(g).photos.length, 20);
  assert.equal(townState(g).photos[0].name, g.pet.name);
});

test('every place has art and every non-menu action runs without errors', async () => {
  const { backdrop } = await import('../src/art/town.js');
  for (const l of LOCATIONS) {
    assert.ok(backdrop(l.id).px.some(c => c), `${l.id} backdrop`);
    const { g, rng } = outing(11, 'adult');
    for (const d of DISTRICTS) if (d.pass) buyPass(g, d.pass.id);
    townState(g).mapPieces = MAP_PIECES;
    Object.assign(g.pet, { discipline: MAX_DISCIPLINE, adultMs: MARRY_AFTER, sick: l.id === 'hospital' ? 'cold' : null });
    for (const a of ACTIONS[l.id]) if (!a.ui) assert.ok(doAction(g, l.id, a.id, rng).msg, `${l.id}:${a.id} says something`);
    assert.ok(LOCATION[l.id]);
  }
});
