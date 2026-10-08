import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import {
  GENES, ALL_GENES, randomGenome, pureGenome, express, inherit, blendColor, FOUNDERS, BODY_COLORS,
} from '../src/game/genetics.js';

test('random genomes have two valid alleles per gene', () => {
  const rng = makeRng(1);
  for (let i = 0; i < 200; i++) {
    const g = randomGenome(rng);
    for (const gene of ALL_GENES) {
      assert.equal(g[gene].length, 2);
      if (GENES[gene]) for (const a of g[gene]) assert.ok(a in GENES[gene], `${gene}:${a}`);
    }
  }
});

test('a pure genome always expresses its traits', () => {
  const rng = makeRng(2);
  for (const f of FOUNDERS) {
    const p = express(pureGenome(f.traits), rng);
    for (const [k, v] of Object.entries(f.traits)) assert.equal(p[k], v, `${f.name} ${k}`);
  }
});

test('dominant alleles win over recessive ones', () => {
  const rng = makeRng(3);
  const g = pureGenome({});
  g.eyes = ['bean', 'star']; // 3 vs 1
  for (let i = 0; i < 50; i++) assert.equal(express(g, rng).eyes, 'bean');
});

test('children get one allele from each parent (apart from mutations)', () => {
  const rng = makeRng(4);
  const mom = pureGenome({ ...FOUNDERS[0].traits });
  const dad = pureGenome({ ...FOUNDERS[3].traits });
  let fromBoth = 0, total = 0;
  for (let i = 0; i < 300; i++) {
    const c = inherit(mom, dad, rng);
    for (const gene of ['eyes', 'ears', 'crest', 'outfit']) {
      total++;
      if (c[gene][0] === mom[gene][0] && c[gene][1] === dad[gene][0]) fromBoth++;
    }
  }
  assert.ok(fromBoth / total > 0.9, `inheritance ratio ${fromBoth / total}`);
});

test('recessive traits can skip a generation and come back', () => {
  const rng = makeRng(5);
  const a = pureGenome({ crest: 'crown' }); // recessive
  const b = pureGenome({ crest: 'none' });  // dominant
  const kids = Array.from({ length: 40 }, () => inherit(a, b, rng));
  const crownedKids = kids.filter(k => express(k, rng).crest === 'crown' && k.crest.includes('none')).length;
  assert.equal(crownedKids, 0, 'carriers do not show the recessive crown');
  // carriers marrying each other can have a crowned grandchild (about 1 in 4)
  const carriers = kids.filter(k => k.crest.includes('crown') && k.crest.includes('none'));
  let crowned = 0;
  for (let i = 0; i < 400; i++) if (express(inherit(carriers[0], carriers[1], rng), rng).crest === 'crown') crowned++;
  assert.ok(crowned > 50 && crowned < 160, `crowned grandkids: ${crowned}`);
});

test('colour blending lands between the parents on the wheel', () => {
  const rng = makeRng(6);
  for (let i = 0; i < 20; i++) assert.ok(['orange', 'gold', 'lime'].includes(blendColor('red', 'green', rng)));
  assert.ok(BODY_COLORS.includes(blendColor('cream', 'slate', rng)));
});

test('accent colour never matches body colour', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 300; i++) {
    const p = express(randomGenome(rng), rng);
    assert.notEqual(p.color, p.accent);
  }
});
