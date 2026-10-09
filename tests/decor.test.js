import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { newGame } from '../src/game/pet.js';
import { migrate } from '../src/game/save.js';
import {
  ROOMS, SLOTS, SETS, DECOR, THEME_BONUS, layoutOf, optionsFor, themeOf, buyDecor, buySet, setOffer, place, cycle, useSet,
} from '../src/game/decor.js';
import { DECOR_ART } from '../src/art/decor-art.js';
import { PROPS } from '../src/art/props.js';

const game = () => newGame(Date.UTC(2026, 0, 1, 12), makeRng(3));

test('every set has a piece for every slot of its room, and every piece can be drawn', async () => {
  const { homeRoom } = await import('../src/art/town.js');
  for (const [id, set] of Object.entries(SETS)) {
    assert.deepEqual(Object.keys(set.pieces).sort(), [...ROOMS[set.room].slots].sort(), `${id} covers the ${set.room}`);
    const layout = {};
    for (const slot of ROOMS[set.room].slots) {
      const item = DECOR[`${id}-${slot}`], art = DECOR_ART[item.id];
      assert.ok(SLOTS[slot], `${slot} is a known slot`);
      assert.ok(art, `${item.id} has art`);
      for (const name of [art.prop, ...(art.things || []).map(t => t[0])].filter(Boolean)) assert.ok(PROPS[name], `${item.id} uses a prop that exists: ${name}`);
      layout[slot] = item.id;
    }
    for (const dark of [false, true]) {
      const room = homeRoom('day', dark, layout);
      assert.ok(room.back.px.some(c => c) && room.front.px.some(c => c), `${id} room renders`);
    }
  }
  assert.equal(Object.values(SETS).filter(s => s.starter).length, 1, 'one starter set');
});

test('a new game starts in the starter room, which is not a bonus theme', () => {
  const g = game();
  assert.equal(themeOf(layoutOf(g)), 'sweet');
  assert.ok(Object.values(layoutOf(g)).every(id => g.decor.owned.includes(id)));
  assert.equal(optionsFor(g, 'bedroom', 'rug').length, 1);
  assert.equal(cycle(g, 'bedroom', 'rug').ok, false, 'nothing to switch to yet');
});

test('buying pieces and sets, placing them, and the theme bonus', () => {
  const g = game();
  g.points = 2000;
  assert.equal(place(g, 'bedroom', 'starry-rug').ok, false, 'must own it first');
  assert.ok(buyDecor(g, 'starry-rug').ok);
  assert.equal(g.points, 2000 - SLOTS.rug.price);
  assert.equal(buyDecor(g, 'starry-rug').ok, false, 'not twice');
  assert.ok(cycle(g, 'bedroom', 'rug').ok);
  assert.equal(layoutOf(g).rug, 'starry-rug');
  assert.equal(themeOf(layoutOf(g)), null, 'a mixed room has no theme');

  // the rest of the set costs less bought together
  const before = g.points, offer = setOffer(g, 'starry');
  assert.equal(offer.left.length, ROOMS.bedroom.slots.length - 1);
  const single = offer.left.reduce((n, id) => n + DECOR[id].price, 0);
  assert.ok(offer.price < single);
  assert.ok(buySet(g, 'starry').ok);
  assert.equal(g.points, before - offer.price);
  assert.equal(buySet(g, 'starry').ok, false);

  const mid = g.points;
  const r = useSet(g, 'bedroom', 'starry');
  assert.equal(r.theme, 'starry');
  assert.equal(g.points, mid + THEME_BONUS, 'the bonus is paid once');
  useSet(g, 'bedroom', 'sweet');
  useSet(g, 'bedroom', 'starry');
  assert.equal(g.points, mid + THEME_BONUS);

  g.points = 0;
  assert.equal(buyDecor(g, 'forest-bed').ok, false, 'no points, no bed');
});

test('old saves gain the starter room, and broken layouts are repaired', () => {
  const g = game();
  delete g.decor; delete g.room;
  const m = migrate(JSON.parse(JSON.stringify(g)));
  assert.equal(themeOf(layoutOf(m)), 'sweet');
  assert.equal(m.room, 'bedroom');

  const h = game();
  h.decor.rooms.bedroom.bed = 'forest-bed'; // placed but never bought
  h.decor.rooms.bedroom.rug = 'no-such-thing';
  delete h.decor.rooms.bedroom.lamp;
  const fixed = migrate(JSON.parse(JSON.stringify(h)));
  assert.equal(layoutOf(fixed).bed, 'sweet-bed');
  assert.equal(layoutOf(fixed).rug, 'sweet-rug');
  assert.equal(layoutOf(fixed).lamp, 'sweet-lamp');
});
