import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import {
  GENES, ALL_GENES, randomGenome, pureGenome, express, inherit, blendColor, FOUNDERS, BODY_COLORS, carried, childOdds, drift, lineOf, PART_GENES, NOT_PARTS, BASE_GENES, ANCILLARY_GENES, FORM_GENES, TEMPERAMENT_GENES, resemblance,
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
  g.eyes = ['bead', 'owl']; // 3 vs 1
  for (let i = 0; i < 50; i++) assert.equal(express(g, rng).eyes, 'bead');
});

test('children get one allele from each parent (apart from mutations)', () => {
  const rng = makeRng(4);
  const mom = pureGenome({ ...FOUNDERS[0].traits });
  const dad = pureGenome({ ...FOUNDERS[3].traits });
  let fromBoth = 0, total = 0;
  for (let i = 0; i < 300; i++) {
    const c = inherit(mom, dad, rng);
    for (const gene of ['eyes', 'ears', 'topper', 'form']) {
      total++;
      if (c[gene][0] === mom[gene][0] && c[gene][1] === dad[gene][0]) fromBoth++;
    }
  }
  assert.ok(fromBoth / total > 0.9, `inheritance ratio ${fromBoth / total}`);
});

test('recessive traits can skip a generation and come back', () => {
  const rng = makeRng(5);
  const a = pureGenome({ topper: 'lure' }); // recessive
  const b = pureGenome({ topper: 'cherry' }); // dominant
  const kids = Array.from({ length: 40 }, () => inherit(a, b, rng));
  const hornedKids = kids.filter(k => express(k, rng).topper === 'lure' && k.topper.includes('cherry')).length;
  assert.equal(hornedKids, 0, 'carriers do not show the recessive lure');
  // carriers marrying each other can have a grandchild with the lure (about 1 in 4)
  const carriers = kids.filter(k => k.topper.includes('lure') && k.topper.includes('cherry'));
  let horned = 0;
  for (let i = 0; i < 400; i++) if (express(inherit(carriers[0], carriers[1], rng), rng).topper === 'lure') horned++;
  assert.ok(horned > 50 && horned < 160, `horned grandkids: ${horned}`);
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

test('body plans are codominant: either parent form can show', () => {
  const rng = makeRng(8);
  const g = pureGenome({});
  g.form = ['quad', 'floater'];
  const seen = new Set();
  for (let i = 0; i < 60; i++) seen.add(express(g, rng).form);
  assert.deepEqual([...seen].sort(), ['floater', 'quad']);
});

test('every pet has a form and every base part', () => {
  const rng = makeRng(12);
  for (let i = 0; i < 200; i++) {
    const p = express(randomGenome(rng), rng);
    for (const gene of [...FORM_GENES, ...BASE_GENES]) assert.ok(p[gene] && p[gene] !== 'none', `${gene}`);
  }
  for (const gene of BASE_GENES) assert.ok(!('none' in GENES[gene]), `${gene} is a base part`);
  for (const gene of ANCILLARY_GENES) assert.ok('none' in GENES[gene], `${gene} is optional`);
});

test('colours sometimes drift one step around the wheel', () => {
  const rng = makeRng(9);
  for (let i = 0; i < 20; i++) assert.ok(['red', 'gold'].includes(drift('orange', rng)));
  assert.equal(drift('cream', rng), 'cream');
});

test('carried() lists hidden alleles only', () => {
  const g = pureGenome({ topper: 'cherry', color: 'pink', accent: 'cream' });
  g.topper = ['cherry', 'lure'];
  const p = express(g, makeRng(10));
  const hidden = carried(g, p);
  assert.deepEqual(hidden, [{ gene: 'topper', allele: 'lure' }]);
});

test('childOdds sums to 1 for every gene', () => {
  const rng = makeRng(11);
  const odds = childOdds(randomGenome(rng), randomGenome(rng), 200, rng);
  for (const gene of ALL_GENES) {
    const total = odds[gene].reduce((a, [, p]) => a + p, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, gene);
  }
});

// Temperament isn't a body part; "none" means the part is absent.

test('no two founders share a body part', () => {
  for (const gene of PART_GENES.filter(g => !NOT_PARTS.includes(g))) {
    const seen = new Map();
    for (const f of FOUNDERS) {
      const v = f.traits[gene] ?? 'none';
      if (v === 'none') continue;
      assert.ok(!seen.has(v), `${f.name} and ${seen.get(v)} both have ${gene}: ${v}`);
      seen.set(v, f.name);
    }
  }
});

test('every part belongs to exactly one founder', () => {
  for (const gene of PART_GENES.filter(g => !NOT_PARTS.includes(g))) {
    for (const allele of Object.keys(GENES[gene])) {
      if (allele === 'none') continue;
      const owners = FOUNDERS.filter(f => (f.traits[gene] ?? 'none') === allele).map(f => f.name);
      assert.equal(owners.length, 1, `${gene}: ${allele} belongs to ${owners.join(', ') || 'nobody'}`);
      assert.equal(lineOf(gene, allele), owners[0]);
    }
  }
});

test('every founder has its own body colour', () => {
  const colours = FOUNDERS.map(f => f.traits.color);
  assert.equal(new Set(colours).size, colours.length);
});

test('having no part is a coin flip against having one, however rare the part', () => {
  const rng = makeRng(13);
  for (const [gene, allele] of [['wings', 'feathered'], ['topper', 'plume'], ['tail', 'tendrils'], ['feet', 'nubs']]) {
    const g = pureGenome({});
    g[gene] = [allele, 'none'];
    let shown = 0;
    for (let i = 0; i < 200; i++) if (express(g, rng)[gene] === allele) shown++;
    assert.ok(shown > 70 && shown < 130, `${gene} ${allele} showed ${shown} times in 200`);
  }
  // a Hoolet x Kitsu litter can have wings in the first generation
  const kids = Array.from({ length: 60 }, () => express(inherit(pureGenome(FOUNDERS[5].traits), pureGenome(FOUNDERS[0].traits), rng), rng));
  assert.ok(kids.some(k => k.wings === 'feathered'), 'some first-generation children have wings');
  assert.ok(kids.some(k => k.wings === 'none'), 'and some do not');
});

test('wild pets follow a founder line with a few twists', () => {
  const rng = makeRng(14);
  const parts = PART_GENES.filter(g => !TEMPERAMENT_GENES.includes(g));
  const lines = new Set();
  let twisted = 0;
  for (let i = 0; i < 200; i++) {
    const g = randomGenome(rng);
    let best = 0, who = null;
    for (const f of FOUNDERS) {
      const n = parts.filter(gene => g[gene].every(a => a === (f.traits[gene] ?? 'none'))).length;
      if (n > best) { best = n; who = f.name; }
    }
    assert.ok(best >= parts.length - 3, `a wild pet strays ${parts.length - best} parts from any line`);
    lines.add(who);
    if (best < parts.length) twisted++;
  }
  assert.equal(lines.size, FOUNDERS.length, 'every line turns up in the wild');
  assert.ok(twisted > 120, `only ${twisted} of 200 wild pets carried a twist`);
});

test('resemblance counts who a child takes after', () => {
  const mom = express(pureGenome(FOUNDERS[0].traits), makeRng(15)), dad = express(pureGenome(FOUNDERS[2].traits), makeRng(16));
  const r = resemblance(mom, mom, dad);
  assert.equal(r.dad, 0);
  assert.equal(r.mom + r.both, ALL_GENES.length);
  const child = { ...mom, eyes: dad.eyes, ears: 'frills' };
  const c = resemblance(child, mom, dad);
  assert.deepEqual([c.dad, c.neither], [1, 1]);
});
