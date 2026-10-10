import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { newGame, marry, findPartner, BASE_WEIGHT, MAX_DISCIPLINE, MARRY_AFTER, HOUR } from '../src/game/pet.js';
import { has } from '../src/game/book.js';
import {
  DISTRICTS, LOCATIONS, LOCATION, ACTIONS, MAP_PIECES, FRIEND_GIFTS,
  townState, districtLocked, buyPass, cantGo, resident, talk, doAction, dyeHair, buySale, saleOfDay, founderKin,
  retiresIn, isNewFace, townNews, TENURE, JUNIOR, HEIR_AT, ELDER_AT, DAY, AGELESS,
  retirees, nextCottager, singles, findMatch, weddingBells,
} from '../src/game/town.js';
import { ageTown } from '../src/game/cheats.js';

const NINE_AM = new Date(2026, 0, 5, 9, 0, 0).getTime();

/** A teen out on the town with plenty of points, and (unless `open` is false) every part of town open to it. */
function outing(seed = 1, stage = 'teen', open = true) {
  const rng = makeRng(seed);
  const g = newGame(NINE_AM, rng);
  Object.assign(g.pet, { stage, hunger: 2, happy: 2, weight: BASE_WEIGHT[stage] });
  g.points = 5000;
  if (open) { const t = townState(g); for (const d of DISTRICTS) if (d.pass) t.passes.push(d.pass.id); t.grown = t.invited = t.starIsle = true; }
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
  assert.equal(LOCATIONS.length, 23);
  for (const l of LOCATIONS) {
    assert.ok(DISTRICTS.some(d => d.id === l.district), l.id);
    assert.ok(l.resident && l.lines.length, l.id);
    assert.ok(ACTIONS[l.id]?.length, `${l.id} has actions`);
    assert.ok(resident(l.id).phenotype.form, `${l.id} resident has looks`);
  }
  assert.deepEqual(resident('park'), resident('park'), 'residents look the same every visit');
});

test('the town opens a part at a time: downtown first, then by growing up, by passes that cost more and more, by deeds, and by the map', () => {
  const { g } = outing(1, 'teen', false);
  assert.equal(districtLocked(g, 'downtown'), null);
  for (const id of ['square', 'hospital', 'school', 'bakery']) assert.equal(cantGo(g, id), null, id);
  // the Suburbs open once a pet has grown up
  assert.equal(districtLocked(g, 'suburbs'), 'grown');
  assert.match(cantGo(g, 'cottages'), /grown up/);
  // three passes, each dearer than the last
  const prices = ['outskirts', 'uptown', 'boardwalk'].map(id => DISTRICTS.find(d => d.id === id).pass.price);
  assert.ok(prices[0] < prices[1] && prices[1] < prices[2]);
  assert.equal(districtLocked(g, 'uptown'), 'pass');
  assert.match(cantGo(g, 'cafe'), /Bus Pass/);
  assert.ok(buyPass(g, 'bus').ok);
  assert.equal(cantGo(g, 'cafe'), null);
  assert.equal(buyPass(g, 'bus').ok, false, 'only once');
  assert.match(cantGo(g, 'forest'), /Trail Map/);
  assert.match(cantGo(g, 'beach'), /Train Pass/);
  // Far Away is not bought: the Castle sends for the well-mannered or the learned, Star Isle shows itself to those who grant wishes
  assert.match(cantGo(g, 'castle'), /invitation/);
  g.pet.diploma = 'smart';
  assert.equal(cantGo(g, 'castle'), null);
  assert.match(cantGo(g, 'starisle'), /wish/);
  g.wishDays = 5;
  assert.equal(cantGo(g, 'starisle'), null);
  g.pet.stage = 'adult';
  assert.equal(cantGo(g, 'cottages'), null);
  // and the village needs the whole map
  assert.equal(districtLocked(g, 'hidden'), 'secret');
  townState(g).mapPieces = MAP_PIECES;
  assert.equal(districtLocked(g, 'hidden'), null);
  // every place is in exactly one part of town
  assert.deepEqual(DISTRICTS.flatMap(d => d.places).sort(), LOCATIONS.map(l => l.id).sort());
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
  assert.ok(retiresIn(g, 'cafe') <= TENURE - ELDER_AT);
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

test('retired keepers live at the cottages until the next handover at their old place', () => {
  const { g, rng } = outing(25);
  assert.deepEqual(retirees(g), [], 'nobody has retired yet');
  assert.equal(resident('cottages', g).name, 'Gran Willow');
  assert.equal(nextCottager(g).name, 'Gran Willow', 'only Gran to visit');
  freshKeeper(g, 'toyshop'); // Pip has just handed the toy shop on
  const pip = retirees(g).find(r => r.from === 'Toy Shop');
  assert.equal(pip.name, 'Pip');
  assert.equal(pip.successor, resident('toyshop', g).name);
  assert.equal(retirees(g)[0].name, 'Pip', 'most recently retired first');
  townState(g).cottage = 0;
  const first = nextCottager(g);
  assert.equal(first.name, 'Pip');
  assert.ok(first.elder && first.retired.from === 'Toy Shop');
  assert.equal(first.phenotype.hairColor, 'slate');
  assert.ok(doAction(g, 'cottages', 'story', rng).ok);
  assert.equal(doAction(g, 'cottages', 'story', rng).ok, false, 'one story a day');
  assert.equal(g.pet.skills.smart, 1);
  ageTown(g, TENURE);
  assert.ok(!retirees(g).some(r => r.name === 'Pip'), 'a newer retiree has taken Pip\'s cottage');
  assert.ok(resident('cottages', g).name, 'whoever is being visited still exists');
});

test('a keeper\'s brother or sister can turn up at the matchmaker, and marrying one ties the families', () => {
  const { g } = outing(26, 'adult');
  g.pet.adultMs = MARRY_AFTER;
  assert.deepEqual(singles(g), [], 'the first keepers have no brothers or sisters');
  freshKeeper(g, 'cafe');
  const s = singles(g).find(x => x.locId === 'cafe');
  assert.ok(s, 'the new chef has a sibling');
  assert.equal(s.kin, 'Chef Momo');
  assert.notEqual(s.name, resident('cafe', g).name.split(' ').pop());
  g.pet.gender = s.gender === 'f' ? 'm' : 'f';
  let match = null;
  for (let seed = 1; seed < 400 && !match; seed++) {
    g.matchmaker = { day: '', left: 3 };
    townState(g).daily.counts = {};
    const p = findMatch(g, makeRng(seed));
    assert.notEqual(p.gender, g.pet.gender);
    if (p.single === s.id) match = p;
  }
  assert.ok(match, 'they are introduced sooner or later');
  assert.deepEqual(match.genome, s.genome);
  const hearts = townState(g).friends.cafe || 0;
  const name = g.pet.name;
  weddingBells(g, match);
  const egg = marry(g, match, makeRng(2));
  assert.equal(egg.parents[1], match.name);
  assert.equal(townState(g).friends.cafe, hearts + 2);
  assert.ok(townNews(g)[0].msg.startsWith(`${name} married ${match.name}, Chef Momo's`));
  assert.ok(!singles(g).some(x => x.id === s.id), 'spoken for');
  assert.equal(resident('cafe', g).inLaw.name, match.name);
  g.simTime += HEIR_AT;
  assert.ok(!singles(g).some(x => x.locId === 'cafe'), 'that generation has settled down');
});

test('the forest and park turn up map pieces that open the hidden village', () => {
  const { g, rng } = outing(8);
  buyPass(g, 'train');
  // a long hunt: never two pieces close together
  let days = 0;
  for (; days < 2000 && townState(g).mapPieces < MAP_PIECES; days++) { doAction(g, 'forest', 'forage', rng); nextDay(g); }
  assert.equal(townState(g).mapPieces, MAP_PIECES);
  assert.ok(days >= (MAP_PIECES - 1) * 2, `took ${days} days`);
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
