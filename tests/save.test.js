import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { newGame } from '../src/game/pet.js';
import { migrate, SAVE_VERSION } from '../src/game/save.js';

test('a new game is on the current save version and survives a round trip', () => {
  const g = newGame(Date.UTC(2026, 0, 5, 9), makeRng(1));
  assert.equal(g.version, SAVE_VERSION);
  const back = migrate(JSON.parse(JSON.stringify(g)));
  assert.ok(back);
  assert.deepEqual(back.pet.genome, g.pet.genome);
});

test('saves from before the form rebuild start fresh', () => {
  const g = newGame(Date.UTC(2026, 0, 5, 9), makeRng(2));
  g.version = 1;
  assert.equal(migrate(g), null);
});

test('genes added later are filled in on load', () => {
  const g = newGame(Date.UTC(2026, 0, 5, 9), makeRng(3));
  delete g.pet.genome.wings; delete g.pet.phenotype.wings;
  const back = migrate(JSON.parse(JSON.stringify(g)));
  assert.deepEqual(back.pet.genome.wings, ['none', 'none']);
  assert.equal(back.pet.phenotype.wings, 'none');
});
