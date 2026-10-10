import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { GENES, FOUNDERS, STARTER, randomGenome, inherit, express, pureGenome, starterGenome } from '../src/game/genetics.js';
import { PARTS, FORMS, LINES, FW, FH, composePetArt, composeEggArt } from '../src/game/pet-art.js';
import { composePet, composeEgg, CANVAS, S } from '../src/game/render.js';

const STAGES = ['baby', 'child', 'teen', 'adult'];

test('every allele of every part has fine-line art, and every body is drawn for every body plan', () => {
  for (const gene of ['head', 'ears', 'eyes', 'mouth', 'mark', 'tail', 'topper', 'feet', 'nose', 'wings', 'hair', 'pattern']) {
    for (const allele of Object.keys(GENES[gene])) {
      if (allele === 'none') continue;
      assert.ok(PARTS[gene]?.[allele], `no art for ${gene}: ${allele}`);
    }
  }
  for (const allele of Object.keys(GENES.body)) {
    for (const form of FORMS) assert.ok(PARTS.body[allele]?.[form], `no ${allele} body for the ${form} plan`);
  }
  assert.deepEqual([...FORMS].sort(), Object.keys(GENES.form).sort(), 'one body plan per form allele');
});

test('the gene names on the art files are the game\'s gene names', () => {
  for (const [name, L] of Object.entries(LINES)) {
    assert.ok(GENES.form[L.FORM], `${name}: body plan ${L.FORM}`);
    for (const [gene, allele] of Object.entries(L.GENES)) assert.ok(GENES[gene]?.[allele] !== undefined, `${name}: ${gene} ${allele} is not a gene`);
  }
});

test('heads and bodies have the sockets their parts hang on', () => {
  for (const [name, h] of Object.entries(PARTS.head)) {
    for (const s of ['neck', 'top', 'earL', 'earR', 'face']) assert.ok(h.sockets[s], `head ${name} is missing ${s}`);
    assert.ok(PARTS.face[name] && PARTS.cheek[name], `head ${name} has a face layout and a cheek`);
  }
  for (const [name, byForm] of Object.entries(PARTS.body)) for (const [form, b] of Object.entries(byForm)) {
    assert.ok(b.sockets.neck, `${name} ${form} body is missing its neck`);
    if (form === 'biped') assert.ok(b.sockets.armL && b.sockets.armR, `${name} two-legged body needs arm sockets`);
  }
});

test('founders, mixed children and wild pets all render and fit the canvas', () => {
  const rng = makeRng(21);
  const pets = FOUNDERS.map(f => express(pureGenome(f.traits), rng));
  for (let i = 0; i < 120; i++) {
    const a = rng.pick(FOUNDERS), b = rng.pick(FOUNDERS);
    pets.push(express(inherit(pureGenome(a.traits), pureGenome(b.traits), rng), rng));
    pets.push(express(randomGenome(rng), rng));
  }
  pets.push(express(starterGenome(rng), rng));
  for (const p of pets) {
    for (const stage of STAGES) {
      const k = composePetArt(p, stage, {});
      assert.ok(!k.overflow, `${p.form} ${p.head}/${p.body} ${stage} is ${k.w} x ${k.h}: too big for ${FW} x ${FH}`);
      assert.ok(k.px.some(c => c), 'drew something');
      const bm = composePet(p, stage, { expr: 'happy', step: 1, bob: 1, t: 400 });
      assert.equal(bm.w, CANVAS * S);
      assert.ok(bm.px.some(c => c));
    }
  }
  assert.equal(composeEgg(pets[0], 2, 1).w, CANVAS * S);
  assert.ok(composeEggArt(pets[0]).px.some(c => c));
});

test('every part a founder has is visible in its adult and teen pictures', () => {
  const rng = makeRng(31);
  for (const f of FOUNDERS) {
    const p = express(pureGenome(f.traits), rng);
    for (const stage of ['adult', 'teen']) {
      const { seen } = composePetArt(p, stage, {});
      const need = { head: 200, body: 20, ears: 10, face: 20 };
      for (const gene of ['tail', 'hair', 'feet']) if (p[gene] !== 'none') need[gene] = 6;
      if (stage === 'adult') for (const [gene, part] of [['topper', 'topper'], ['wings', 'wings']]) if (p[gene] !== 'none') need[part] = 10;
      for (const [part, n] of Object.entries(need)) assert.ok((seen[part] || 0) >= n, `${f.name} ${stage}: only ${seen[part] || 0} pixels of ${part} show`);
    }
  }
});

test('ears, toppers and hair show on every head, in every body plan', () => {
  const rng = makeRng(41);
  const failures = [];
  for (const form of FORMS) for (const head of Object.keys(GENES.head)) {
    for (const gene of ['ears', 'topper', 'hair']) {
      for (const allele of Object.keys(GENES[gene])) {
        if (allele === 'none') continue;
        const p = express(pureGenome({ ...STARTER, form, head, [gene]: allele }), rng);
        const { seen } = composePetArt(p, 'adult', {});
        if ((seen[gene] || 0) < 6) failures.push(`${form} ${head} ${gene}:${allele} (${seen[gene] || 0}px)`);
      }
    }
  }
  assert.deepEqual(failures, [], 'hidden parts');
});

test('tails and feet show on every body that has a place for them', () => {
  const rng = makeRng(43);
  const failures = [];
  for (const form of FORMS) for (const body of Object.keys(GENES.body)) {
    const b = PARTS.body[body][form];
    for (const [gene, socket] of [['tail', 'tail'], ['feet', 'feet']]) {
      if (!b.sockets[socket]) continue;
      for (const allele of Object.keys(GENES[gene])) {
        if (allele === 'none') continue;
        const p = express(pureGenome({ ...STARTER, form, body, [gene]: allele }), rng);
        const { seen } = composePetArt(p, 'adult', {});
        if ((seen[gene] || 0) < 4) failures.push(`${form} ${body} ${gene}:${allele} (${seen[gene] || 0}px)`);
      }
    }
  }
  assert.deepEqual(failures, [], 'hidden parts');
});

test('the eyes and mouth land on the head, for every head, eye and mouth', () => {
  const misses = [];
  for (const head of Object.keys(GENES.head)) for (const eyes of Object.keys(GENES.eyes)) for (const mouth of Object.keys(GENES.mouth)) {
    const p = express(pureGenome({ ...STARTER, head, eyes, mouth }), makeRng(1));
    for (const stage of ['child', 'adult']) {
      const k = composePetArt(p, stage, {});
      assert.equal(k.eyeBoxes.length, 2);
      for (const [x, y, w, h] of k.eyeBoxes) if (x < 0 || y < 0 || x + w > k.w || y + h > k.h) misses.push(`${head} ${eyes} ${stage}: an eye is off the picture`);
      const [mx, my] = k.mouth;
      if (!k.px[my * k.w + mx] && !k.px[(my + 1) * k.w + mx]) misses.push(`${head} ${mouth} ${stage}: the mouth is off the head`);
    }
  }
  assert.deepEqual(misses, []);
});

test('hats, face items and neckwear show on every head in every body plan, and stay on the canvas', async () => {
  const { HATS, FACE: FACE_WEAR, NECK } = await import('../src/art/pets/wear.js');
  const { CLOTHES } = await import('../src/game/items.js');
  const drawn = { head: HATS, face: FACE_WEAR, body: NECK };
  const bad = [];
  for (const [slot, set] of Object.entries(drawn)) for (const id of Object.keys(set)) {
    assert.equal(CLOTHES[id]?.slot, slot, `${id} is a ${slot} item in the shop`);
    for (const form of FORMS) for (const head of Object.keys(GENES.head)) for (const eyes of Object.keys(GENES.eyes)) {
      const p = express(pureGenome({ ...STARTER, form, head, eyes }), makeRng(1));
      for (const stage of ['teen', 'adult']) {
        const k = composePetArt(p, stage, { wear: { [slot]: id } });
        if ((k.seen.wear || 0) < 30) bad.push(`${id} on ${form} ${head} ${eyes} ${stage}: ${k.seen.wear || 0}px`);
        if (k.overflow) bad.push(`${id} on ${form} ${head} ${stage} overflows`);
      }
    }
  }
  assert.deepEqual(bad, [], 'clothes that are hidden or cut off');
  // shades cover the eyes, so they are not redrawn for expressions
  const p = express(pureGenome(FOUNDERS[0].traits), makeRng(1));
  assert.equal(composePetArt(p, 'adult', { wear: { face: 'shades' } }).eyesHidden, true);
  assert.equal(composePetArt(p, 'adult', { wear: { face: 'glasses' } }).eyesHidden, false);
});
