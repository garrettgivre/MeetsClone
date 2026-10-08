import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { newGame, advance, marry, findPartner, MIN, STAGE_LENGTH, MARRY_AFTER } from '../src/game/pet.js';
import { FOUNDERS, STARTER, express, pureGenome } from '../src/game/genetics.js';
import { discover, has, foundTotal, BOOK_SIZE, BOOK_GENES, entries, lineParts, lineDone, FIND_POINTS, LINE_POINTS } from '../src/game/book.js';
import { migrate } from '../src/game/save.js';

const NINE_AM = new Date(2026, 0, 5, 9, 0, 0).getTime();

test('the book covers every part, body plan and body colour', () => {
  assert.equal(BOOK_SIZE, BOOK_GENES.reduce((n, g) => n + entries(g).length, 0));
  assert.ok(!BOOK_GENES.some(g => entries(g).includes('none')));
  for (const f of FOUNDERS) assert.ok(lineParts(f.name).length >= 10, `${f.name} has a full line`);
});

test('discovering parts pays points once, and a full line pays a bonus', () => {
  const g = newGame(NINE_AM, makeRng(1));
  const kitsu = FOUNDERS.find(f => f.name === 'Kitsu');
  const p0 = g.points;
  const fresh = discover(g, express(pureGenome(kitsu.traits), makeRng(1)));
  assert.ok(fresh.length >= 10);
  assert.ok(lineDone(g, 'Kitsu'));
  assert.equal(g.points, p0 + fresh.length * FIND_POINTS + LINE_POINTS);
  assert.equal(g.bookNews.length, 2, 'one message for the finds, one for the line');
  assert.deepEqual(discover(g, express(pureGenome(kitsu.traits), makeRng(1))), [], 'nothing new the second time');
  assert.ok(has(g, 'ears', 'fox') && has(g, 'color', 'orange'));
});

test('growing into a teen and marrying fill the book', () => {
  const rng = makeRng(2);
  const g = newGame(NINE_AM, rng);
  Object.assign(g.pet, { stage: 'child', stageMs: STAGE_LENGTH.child - MIN, hunger: 4, happy: 4 });
  advance(g, 2 * MIN, rng);
  assert.equal(g.pet.stage, 'teen');
  for (const gene of ['form', 'head', 'body', 'eyes']) assert.ok(has(g, gene, STARTER[gene]), gene);
  const before = foundTotal(g);
  Object.assign(g.pet, { stage: 'adult', adultMs: MARRY_AFTER, species: 'Gloop' });
  marry(g, findPartner(g, rng), rng);
  assert.ok(foundTotal(g) > before, 'the partner adds new finds');
});

test('old saves are credited from the family album without a points windfall', () => {
  const g = newGame(NINE_AM, makeRng(3));
  delete g.book; delete g.bookNews; delete g.bookSeeded;
  g.album.push({ name: 'Old', phenotype: express(pureGenome(FOUNDERS[0].traits), makeRng(1)), fate: 'married',
    partner: { name: 'Pal', phenotype: express(pureGenome(FOUNDERS[1].traits), makeRng(1)) } });
  delete g.pet.weight; delete g.pet.discipline;
  const points = g.points;
  const m = migrate(JSON.parse(JSON.stringify(g)));
  assert.ok(has(m, 'ears', 'fox') && has(m, 'topper', 'cherry'));
  assert.equal(m.points, points);
  assert.deepEqual(m.bookNews, []);
  assert.equal(typeof m.pet.weight, 'number');
  assert.equal(m.pet.discipline, 0);
});
