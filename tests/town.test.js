import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { newGame, marry, findPartner, BASE_WEIGHT, MAX_DISCIPLINE, MARRY_AFTER, HOUR } from '../src/game/pet.js';
import { has } from '../src/game/book.js';
import {
  DISTRICTS, LOCATIONS, LOCATION, ACTIONS, MAP_PIECES, FRIEND_GIFTS,
  townState, districtLocked, buyPass, cantGo, resident, talk, doAction, dyeHair, buySale, saleOfDay, founderKin,
  retiresIn, isNewFace, townNews, TENURE, JUNIOR, HEIR_AT, ELDER_AT, DAY, AGELESS,
} from '../src/game/town.js';
import { ageTown } from '../src/game/cheats.js';

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
/** Set the town's clock so the keeper of a place has only just taken over. */
function freshKeeper(g, locId) {
  const t = townState(g);
  t.epoch -= retiresIn(g, locId);
  Object.assign(t, { gens: {}, met: {}, born: {}, news: [], unread: 0 });
  return townState(g);
}

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
  freshKeeper(g, 'park');
  let gifts = 0;
  for (let d = 0; d < 5; d++) { // (within one keeper's time at the park)
    const r = talk(g, 'park', rng);
    if (r.gift) gifts += r.gift;
    talk(g, 'park', rng); // a second chat the same day doesn't count
    nextDay(g);
  }
  assert.equal(townState(g).friends.park, 5);
  assert.equal(gifts, FRIEND_GIFTS[3]);
});

test('a keeper starts young, grows up, has a child, grows old and hands the place to that child', () => {
  const { g } = outing(20);
  freshKeeper(g, 'cafe');
  const first = resident('cafe', g);
  assert.ok(first.junior && first.stage === 'teen' && !first.heir && !first.elder);
  g.simTime += JUNIOR;
  const grown = resident('cafe', g);
  assert.equal(grown.name, first.name);
  assert.ok(grown.stage === 'adult' && !grown.junior && !grown.heir);
  g.simTime += HEIR_AT - JUNIOR;
  const parent = resident('cafe', g);
  assert.equal(parent.heir.stage, 'baby');
  g.simTime += DAY;
  assert.equal(resident('cafe', g).heir.stage, 'child');
  g.simTime += ELDER_AT - HEIR_AT - DAY;
  const old = resident('cafe', g);
  assert.ok(old.elder && old.stage === 'adult');
  assert.equal(old.phenotype.hairColor, 'slate', 'gone grey');
  assert.equal(old.heir.stage, 'teen');
  assert.ok(retiresIn(g, 'cafe') <= DAY);
  g.simTime += TENURE - ELDER_AT;
  const next = resident('cafe', g);
  assert.notEqual(next.name, first.name);
  assert.match(next.name, /^Chef /, 'the title stays with the place');
  assert.equal(next.parent, first.name);
  assert.equal(next.generation, first.generation + 1);
  assert.deepEqual(next.phenotype, old.heir.phenotype, 'the child we watched grow up');
  assert.ok(next.junior && next.stage === 'teen');
});

test('a handover is news, and half the friendship passes to the child', () => {
  const { g, rng } = outing(21);
  freshKeeper(g, 'bakery');
  townState(g).friends.bakery = 7;
  const before = resident('bakery', g).name;
  assert.equal(isNewFace(g, 'bakery'), false);
  // (the news only keeps the latest dozen items, so read it as the days go by)
  const seen = [];
  for (let h = 0; h <= TENURE / HOUR; h += 6) { g.simTime += 6 * HOUR; seen.push(...townNews(g).map(n => n.msg)); }
  assert.ok(seen.some(m => /Bakery: .* had a baby/.test(m)));
  assert.ok(seen.some(m => m.includes(`Bakery: ${before} has retired`)));
  const t = townState(g);
  assert.equal(t.friends.bakery, 3);
  assert.ok(t.unread >= 2);
  townNews(g, true);
  assert.equal(townState(g).unread, 0);
  assert.ok(isNewFace(g, 'bakery'));
  assert.ok(talk(g, 'bakery', rng).msg.startsWith(resident('bakery', g).name));
  assert.equal(isNewFace(g, 'bakery'), false, 'met them now');
});

test('families are fixed for a save, differ between saves, and some folk never age', () => {
  const a = outing(22).g, b = outing(23).g;
  townState(a).seed = 111; townState(b).seed = 222;
  for (const g of [a, b]) g.simTime += 3 * TENURE;
  assert.deepEqual(resident('toyshop', a), resident('toyshop', a));
  assert.notDeepEqual(resident('toyshop', a).phenotype, resident('toyshop', b).phenotype);
  assert.deepEqual(resident('toyshop').name, 'Pip', 'the first keeper is the same in every game');
  for (const id of AGELESS) {
    assert.equal(resident(id, a).name, LOCATION[id].resident);
    assert.equal(retiresIn(a, id), null);
  }
  // every place turns over within one tenure, and they don't all do it at once
  const c = outing(24).g;
  const days = new Set(LOCATIONS.filter(l => !AGELESS.includes(l.id)).map(l => Math.floor(retiresIn(c, l.id) / DAY)));
  assert.ok(days.size >= 4, 'handovers are spread through the week');
  ageTown(c, TENURE);
  assert.ok(LOCATIONS.every(l => AGELESS.includes(l.id) || resident(l.id, c).generation === 1));
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
