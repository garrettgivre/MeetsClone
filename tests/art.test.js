import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import { GENES, FOUNDERS, STARTER, randomGenome, inherit, express, pureGenome, starterGenome } from '../src/game/genetics.js';
import { FORMS, FORM_SECTIONS, EYES, MOUTHS, MARKS, NOSES, PATTERNS } from '../src/art/pets/index.js';
import { composePetArt } from '../src/game/pet-art.js';

const FACE = { eyes: EYES, mouth: MOUTHS, mark: MARKS, nose: NOSES };

test('every form has art for every allele of every part', () => {
  for (const [form, F] of Object.entries(FORMS)) {
    for (const [gene, section] of Object.entries(FORM_SECTIONS)) {
      for (const allele of Object.keys(GENES[gene])) {
        if (allele === 'none') continue;
        assert.ok(F[section]?.[allele], `${form} has no ${gene}: ${allele}`);
      }
    }
    for (const stage of ['baby', 'child']) assert.ok(F[stage]?.sockets.faceS, `${form} ${stage} needs a face socket`);
  }
  assert.deepEqual(Object.keys(FORMS).sort(), Object.keys(GENES.form).sort(), 'one form file per form allele');
});

test('face parts come in both sizes, and every pattern exists', () => {
  for (const [gene, set] of Object.entries(FACE)) {
    for (const allele of Object.keys(GENES[gene])) {
      if (allele === 'none') continue;
      assert.ok(set[allele]?.S && set[allele]?.L, `${gene}: ${allele} needs S and L`);
    }
  }
  for (const allele of Object.keys(GENES.pattern)) assert.equal(typeof PATTERNS[allele], 'function', allele);
});

test('heads and bodies have the sockets their parts attach to', () => {
  for (const [form, F] of Object.entries(FORMS)) {
    for (const [name, h] of Object.entries(F.head)) {
      for (const s of ['neck', 'top', 'earL', 'earR']) assert.ok(h.sockets[s], `${form} head ${name} is missing ${s}`);
      assert.ok(h.sockets.faceL || h.sockets.faceS, `${form} head ${name} has no face`);
    }
    for (const [name, b] of Object.entries(F.body)) {
      for (const s of ['neck', 'tail', 'footL', 'wingL', 'wingR']) assert.ok(b.sockets[s], `${form} body ${name} is missing ${s}`);
      if (F.arms) assert.ok(b.sockets.armL && b.sockets.armR, `${form} body ${name} needs arm sockets`);
    }
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
    for (const stage of ['baby', 'child', 'teen', 'adult']) {
      const k = composePetArt(p, stage, { gender: 'f', arms: 'wave' });
      assert.ok(!k.overflow, `${p.form} ${p.head}/${p.body} ${stage} overflows the canvas`);
      assert.ok(k.px.some(c => c), 'drew something');
    }
  }
});

test('every part a founder has is visible in its adult and teen pictures', () => {
  const rng = makeRng(31);
  for (const f of FOUNDERS) {
    const p = express(pureGenome(f.traits), rng);
    for (const stage of ['adult', 'teen']) {
      const { seen } = composePetArt(p, stage, {});
      const need = { head: 40, body: 10, ears: 3 };
      for (const [gene, part] of [['tail', 'tail'], ['hair', 'hair'], ['feet', 'feet']]) if (p[gene] !== 'none') need[part] = 3;
      if (stage === 'adult') for (const gene of ['topper', 'wings']) if (p[gene] !== 'none') need[gene] = 3;
      for (const [part, n] of Object.entries(need)) assert.ok((seen[part] || 0) >= n, `${f.name} ${stage}: only ${seen[part] || 0} pixels of ${part} show`);
    }
  }
});

test('every optional part and every ear shows in every form', () => {
  const rng = makeRng(41);
  const failures = [];
  for (const form of Object.keys(FORMS)) {
    for (const gene of ['ears', 'tail', 'topper', 'feet', 'wings', 'hair']) {
      for (const allele of Object.keys(GENES[gene])) {
        if (allele === 'none') continue;
        const p = express(pureGenome({ ...STARTER, form, [gene]: allele }), rng);
        const { seen } = composePetArt(p, 'adult', {});
        const part = gene === 'ears' ? 'ears' : gene;
        if ((seen[part] || 0) < 3) failures.push(`${form} ${gene}:${allele} (${seen[part] || 0}px)`);
      }
    }
  }
  assert.deepEqual(failures, [], 'hidden parts');
});

test('pattern zones, where a part has them, match the part size', () => {
  for (const [form, F] of Object.entries(FORMS)) {
    for (const section of ['head', 'body', 'baby', 'child']) {
      const parts = F[section]?.spr ? { [section]: F[section] } : F[section] || {};
      for (const [name, p] of Object.entries(parts)) {
        if (!p.zones) continue;
        assert.equal(p.zones.length, p.h, `${form} ${section} ${name} zones height`);
        for (const r of p.zones) assert.equal(r.length, p.w, `${form} ${section} ${name} zones width`);
      }
    }
  }
});

test('faces fit: eyes, nose and mouth stay inside every head and child shape, in every form', () => {
  const rng = makeRng(51);
  const misses = [];
  for (const form of Object.keys(FORMS)) for (const head of Object.keys(GENES.head)) for (const eyes of Object.keys(GENES.eyes)) for (const mouth of Object.keys(GENES.mouth)) {
    const p = express(pureGenome({ ...STARTER, form, head, eyes, mouth, nose: 'snoot', hair: 'none' }), rng);
    for (const stage of ['baby', 'child', 'teen']) {
      if (stage === 'baby' && (eyes !== 'bead' || mouth !== 'o' || head !== 'gumdrop')) continue; // babies all share one face
      const { offFace } = composePetArt(p, stage, { gender: 'f' });
      if (offFace) misses.push(`${form} ${head} ${eyes} ${mouth} ${stage} (${offFace}px)`);
    }
  }
  assert.deepEqual(misses, [], 'face parts over the outline or over each other');
});

test('the forehead mark always shows (it moves off the forehead when hair covers it)', () => {
  const hidden = [];
  const faceAt = (g) => composePetArt(express(pureGenome(g), makeRng(1)), 'adult', {}).seen.face || 0;
  for (const form of Object.keys(FORMS)) for (const head of Object.keys(GENES.head)) for (const hair of Object.keys(GENES.hair)) {
    const base = { ...STARTER, form, head, hair, topper: 'none' };
    const without = faceAt({ ...base, mark: 'none' });
    for (const mark of Object.keys(GENES.mark)) {
      if (mark === 'none') continue;
      const shows = faceAt({ ...base, mark }) - without; // mark pixels still on top (at least half of the smallest mark)
      if (shows < 2) hidden.push(`${form} ${head} ${hair} ${mark} (${shows}px)`);
    }
  }
  assert.deepEqual(hidden, [], 'hidden marks');
});

test('hats and face items show on every head in every form, and stay on the canvas', async () => {
  const { HATS, FACE: FACE_WEAR } = await import('../src/art/pets/clothes.js');
  const { CLOTHES } = await import('../src/game/items.js');
  const drawn = { head: HATS, face: FACE_WEAR };
  const bad = [];
  for (const [slot, set] of Object.entries(drawn)) for (const id of Object.keys(set)) {
    assert.equal(CLOTHES[id]?.slot, slot, `${id} is a ${slot} item in the shop`);
    for (const form of Object.keys(FORMS)) for (const head of Object.keys(GENES.head)) for (const eyes of Object.keys(GENES.eyes)) {
      const p = express(pureGenome({ ...STARTER, form, head, eyes }), makeRng(1));
      for (const stage of ['teen', 'adult']) {
        const k = composePetArt(p, stage, { wear: { [slot]: id } });
        // at least most of the smallest item (the side ribbon has 17 pixels)
        if ((k.seen.wear || 0) < 10) bad.push(`${id} on ${form} ${head} ${eyes} ${stage}: ${k.seen.wear || 0}px`);
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
