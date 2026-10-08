// Genetics: every trait is a gene with two alleles (one from each parent).
// The higher-dominance allele is expressed; ties are a coin flip made once,
// at conception. Recessive alleles can skip a generation and come back.
// Colours can blend or drift a step around the colour wheel, and rare
// mutations bring brand-new alleles.

import { RAMP_NAMES } from '../engine/palette.js';
import { rand as defaultRng } from '../engine/rng.js';

// dominance: 3 = common/dominant, 2 = normal, 1 = rare/recessive.
// The numbers are also how common an allele is in the wild.
//
// Every pet has a FORM (its body plan) and the BASE parts; ANCILLARY parts
// are optional ('none' = doesn't have one). Every part is drawn separately
// for every form (src/art/pets/), so any mix of genes still fits together.
export const FORM_GENES = ['form'];
export const BASE_GENES = ['head', 'body', 'eyes', 'ears', 'mouth', 'pattern', 'mark'];
export const ANCILLARY_GENES = ['tail', 'topper', 'feet', 'nose', 'wings', 'hair'];
export const TEMPERAMENT_GENES = ['appetite', 'energy', 'taste'];

export const GENES = {
  // body plans are codominant (a coin flip between the parents' forms), so lines mix
  form:    { biped: 2, blob: 2, quad: 2, floater: 2, serpent: 2, avian: 2 },
  head:    { gumdrop: 3, fox: 2, lamb: 2, bug: 2, bell: 1, owl: 1 },
  body:    { jelly: 3, fluffy: 2, woolly: 2, segmented: 2, bell: 1, feathered: 1 },
  eyes:    { jelly: 3, bead: 3, sly: 2, sleepy: 2, glow: 1, owl: 1 },
  ears:    { nubs: 3, fox: 2, lamb: 2, antennae: 2, frills: 1, tufts: 1 },
  mouth:   { o: 3, fang: 2, baa: 2, dot: 2, munch: 2, beak: 1 },
  pattern: { bubbles: 2, muzzle: 2, sooty: 2, bands: 2, glowspots: 1, facedisk: 1 },
  mark:    { dots: 3, heart: 2, clover: 2, flame: 1, spark: 1, moon: 1 },
  tail:    { none: 3, brush: 2, puff: 2, spike: 1, tendrils: 1 },
  topper:  { none: 3, cherry: 2, horns: 2, leaf: 2, lure: 1, plume: 1 },
  feet:    { none: 2, nubs: 3, paws: 2, hooves: 2, talons: 1 },
  nose:    { none: 3, button: 2, snoot: 2 },
  wings:   { none: 3, veils: 1, feathered: 1 },
  hair:    { none: 3, tuft: 2, drip: 2, wool: 2 },
  // temperament (shown on the status screen, changes care)
  appetite: { normal: 3, light: 2, hearty: 2 },
  energy:   { normal: 3, calm: 2, lively: 2 },
  taste:    { sweet: 2, savory: 2, fruity: 2, spicy: 1 },
};

export const COLOR_GENES = ['color', 'accent', 'eyeColor', 'hairColor'];
export const BODY_COLORS = RAMP_NAMES; // all 14 ramps
export const EYE_COLORS = ['ink', 'brown', 'blue', 'green', 'violet', 'red', 'gold', 'pink', 'sky', 'mint'];
// Order around the colour wheel, for blending.
const WHEEL = ['red', 'orange', 'gold', 'lime', 'green', 'mint', 'sky', 'blue', 'indigo', 'violet', 'pink'];

export const PART_GENES = Object.keys(GENES);
export const ALL_GENES = [...PART_GENES, ...COLOR_GENES];

function choices(gene) {
  if (gene === 'color' || gene === 'accent' || gene === 'hairColor') return BODY_COLORS;
  if (gene === 'eyeColor') return EYE_COLORS;
  return Object.keys(GENES[gene]);
}
// The GENES numbers are how common an allele is in the wild, and dominance
// follows them. Having no tail, topper, nose and so on neither beats nor loses
// to having one: a part paired with 'none' is a coin flip, whatever its rarity,
// so a rare plume or pair of wings can show in the very first mixed litter.
function dom(gene, allele) {
  if (gene === 'form') return 2;
  return GENES[gene]?.[allele] ?? 2;
}
const noneTie = (gene, a, b) => ANCILLARY_GENES.includes(gene) && (a === 'none') !== (b === 'none');

/** A random allele, common ones more likely. */
export function randomAllele(gene, rng = defaultRng) {
  if (!GENES[gene]) return rng.pick(choices(gene));
  return rng.weighted(Object.entries(GENES[gene]).map(([a, d]) => [a, d * d]));
}

/**
 * A wild-born genome (matchmaker partners, town residents, testing). Wild pets
 * come from the founder lines: each starts as a founder, usually in its own
 * colours, and picks up a few twists from the wider gene pool (a part, now and
 * then a whole body plan), often as one carried copy. So a wild pet looks like
 * a coherent creature with a surprise or two, and its children can take after
 * either it or the line it came from.
 */
export function randomGenome(rng = defaultRng, twists = 1 + rng.int(3)) {
  const g = pureGenome(rng.pick(FOUNDERS).traits);
  for (const gene of TEMPERAMENT_GENES) g[gene] = [randomAllele(gene, rng), randomAllele(gene, rng)];
  // a fresh coat: most wild pets wear colours of their own, with hair to match
  if (rng.chance(0.7)) { const c = rng.pick(BODY_COLORS); g.color = [c, rng.chance(0.7) ? c : g.color[1]]; g.hairColor = [c, c]; }
  if (rng.chance(0.4)) { const c = rng.pick(BODY_COLORS); g.accent = [c, rng.chance(0.7) ? c : g.accent[1]]; }
  if (rng.chance(0.3)) g.eyeColor = [rng.pick(EYE_COLORS), g.eyeColor[1]];
  const pool = PART_GENES.filter(gene => !TEMPERAMENT_GENES.includes(gene) && (gene !== 'form' || rng.chance(0.15)));
  for (let i = 0; i < twists; i++) {
    const gene = rng.pick(pool), a = randomAllele(gene, rng);
    g[gene] = rng.chance(0.4) ? [a, a] : rng.chance(0.5) ? [a, g[gene][1]] : [g[gene][0], a];
  }
  return g;
}

/** A genome where both alleles are the given traits (used for founders). */
export function pureGenome(traits) {
  const g = {};
  for (const gene of ALL_GENES) {
    const v = traits[gene] ?? (gene === 'hairColor' ? 'brown' : choices(gene)[0]);
    g[gene] = [v, v];
  }
  return g;
}

/** Blend two body colours: the ramp halfway between them on the colour wheel. */
export function blendColor(a, b, rng = defaultRng) {
  const ia = WHEEL.indexOf(a), ib = WHEEL.indexOf(b);
  if (ia < 0 || ib < 0) return rng.chance(0.5) ? a : b; // neutrals don't blend
  let d = ib - ia;
  if (Math.abs(d) > WHEEL.length / 2) d -= Math.sign(d) * WHEEL.length;
  if (Math.abs(d) <= 1) return rng.chance(0.5) ? a : b;
  const mid = ia + d / 2;
  const i = rng.chance(0.5) ? Math.floor(mid) : Math.ceil(mid);
  return WHEEL[((i % WHEEL.length) + WHEEL.length) % WHEEL.length];
}

/** Work out the visible traits for a genome (done once at conception). */
export function express(genome, rng = defaultRng) {
  const p = {};
  for (const gene of PART_GENES) {
    const [a, b] = genome[gene] || ['none', 'none'];
    const da = dom(gene, a), db = dom(gene, b);
    p[gene] = noneTie(gene, a, b) || da === db ? (rng.chance(0.5) ? a : b) : da > db ? a : b;
  }
  for (const gene of COLOR_GENES) {
    const [a, b] = genome[gene];
    if (a === b) p[gene] = a;
    else if (gene !== 'eyeColor' && rng.chance(0.3)) p[gene] = blendColor(a, b, rng);
    else p[gene] = rng.chance(0.5) ? a : b;
  }
  // Markings in the same colour as the body would be invisible.
  if (p.accent === p.color) p.accent = p.color === 'cream' ? 'slate' : 'cream';
  return p;
}

export const MUTATION_RATE = 0.025;
export const DRIFT_RATE = 0.04;

/** Move a colour one step around the wheel (neutrals stay put). */
export function drift(color, rng = defaultRng) {
  const i = WHEEL.indexOf(color);
  if (i < 0) return color;
  return WHEEL[(i + (rng.chance(0.5) ? 1 : -1) + WHEEL.length) % WHEEL.length];
}

/** Make a child genome: one random allele from each parent, plus rare mutations and colour drift. */
export function inherit(mom, dad, rng = defaultRng) {
  const g = {};
  for (const gene of ALL_GENES) {
    const pick = (parent) => {
      if (rng.chance(MUTATION_RATE)) return randomAllele(gene, rng);
      const pair = parent[gene] || [choices(gene)[0], choices(gene)[0]];
      let a = pair[rng.int(2)];
      if (gene !== 'eyeColor' && COLOR_GENES.includes(gene) && rng.chance(DRIFT_RATE)) a = drift(a, rng);
      return a;
    };
    g[gene] = [pick(mom), pick(dad)];
  }
  return g;
}

/** Hidden alleles a pet carries but doesn't show: [{ gene, allele }]. */
export function carried(genome, phenotype) {
  const out = [];
  for (const gene of ALL_GENES) {
    const pair = genome[gene];
    if (!pair) continue;
    for (const a of new Set(pair)) if (a !== phenotype[gene]) out.push({ gene, allele: a });
  }
  return out;
}

/** Chance (0..1) of each visible trait among `n` simulated children. */
export function childOdds(mom, dad, n = 400, rng = defaultRng) {
  const counts = {};
  for (const gene of ALL_GENES) counts[gene] = {};
  for (let i = 0; i < n; i++) {
    const p = express(inherit(mom, dad, rng), rng);
    for (const gene of ALL_GENES) counts[gene][p[gene]] = (counts[gene][p[gene]] || 0) + 1;
  }
  const odds = {};
  for (const gene of ALL_GENES) {
    odds[gene] = Object.entries(counts[gene]).map(([k, c]) => [k, c / n]).sort((a, b) => b[1] - a[1]);
  }
  return odds;
}

export const GENE_LABELS = {
  form: 'Body plan', head: 'Head', body: 'Body', eyes: 'Eyes', ears: 'Ears', mouth: 'Mouth', pattern: 'Markings', mark: 'Forehead',
  tail: 'Tail', topper: 'Topper', feet: 'Feet', nose: 'Nose', wings: 'Wings', hair: 'Hair',
  appetite: 'Appetite', energy: 'Energy', taste: 'Taste',
  color: 'Body colour', accent: 'Accent colour', eyeColor: 'Eye colour', hairColor: 'Hair colour',
};

/** Count how many visible traits differ between two phenotypes. */
export function difference(a, b) {
  let n = 0;
  for (const gene of ALL_GENES) if (a[gene] !== b[gene]) n++;
  return n;
}

/** Who a child takes after: how many visible traits it shares with mum only, dad only, both, or neither. */
export function resemblance(child, mom, dad) {
  const r = { mom: 0, dad: 0, both: 0, neither: 0 };
  for (const gene of ALL_GENES) {
    const m = child[gene] === mom[gene], d = child[gene] === dad[gene];
    if (m && d) r.both++; else if (m) r.mom++; else if (d) r.dad++; else r.neither++;
  }
  return r;
}

// ---------- Generation 1 ----------
// Generation 1 looks are decided by care, like the original device.
// From generation 2 on, looks come only from genes.

// Before it grows up, a generation-1 pet is a plain little jelly; at adulthood
// it becomes one of the founders.
export const STARTER = {
  form: 'blob', head: 'gumdrop', body: 'jelly', eyes: 'bead', ears: 'nubs', mouth: 'o', pattern: 'bubbles', mark: 'dots',
  tail: 'none', topper: 'none', feet: 'none', nose: 'none', wings: 'none', hair: 'none',
  color: 'cream', accent: 'pink', eyeColor: 'ink', hairColor: 'cream',
};

// The founders: one per body plan. Every part belongs to exactly one founder,
// so each founder is the root of a genetic line and every part in the game
// descends from one of them. No two founders share a part or a body colour.
// tier: 0 = best care, 2 = poorest care (generation 1 grows into one of these).
export const FOUNDERS = [
  { name: 'Kitsu', line: 'ember fox', tier: 1, traits: {
    form: 'biped', head: 'fox', body: 'fluffy', eyes: 'sly', ears: 'fox', mouth: 'fang', pattern: 'muzzle', mark: 'flame',
    tail: 'brush', feet: 'paws', nose: 'button', hair: 'tuft',
    color: 'orange', accent: 'cream', eyeColor: 'gold', hairColor: 'orange', taste: 'spicy', energy: 'lively' } },
  { name: 'Gloop', line: 'cherry jelly', tier: 2, traits: {
    form: 'blob', head: 'gumdrop', body: 'jelly', eyes: 'jelly', ears: 'nubs', mouth: 'o', pattern: 'bubbles', mark: 'heart',
    topper: 'cherry', hair: 'drip',
    color: 'mint', accent: 'cream', eyeColor: 'blue', hairColor: 'cream', taste: 'sweet', appetite: 'hearty' } },
  { name: 'Fleece', line: 'cloud lamb', tier: 1, traits: {
    form: 'quad', head: 'lamb', body: 'woolly', eyes: 'sleepy', ears: 'lamb', mouth: 'baa', pattern: 'sooty', mark: 'clover',
    tail: 'puff', topper: 'horns', feet: 'hooves', nose: 'snoot', hair: 'wool',
    color: 'cream', accent: 'slate', eyeColor: 'ink', hairColor: 'cream', taste: 'fruity', energy: 'calm' } },
  { name: 'Glimmer', line: 'lantern jellyfish', tier: 0, traits: {
    form: 'floater', head: 'bell', body: 'bell', eyes: 'glow', ears: 'frills', mouth: 'dot', pattern: 'glowspots', mark: 'spark',
    tail: 'tendrils', topper: 'lure', wings: 'veils',
    color: 'sky', accent: 'violet', eyeColor: 'pink', hairColor: 'sky', taste: 'sweet', energy: 'calm' } },
  { name: 'Inchy', line: 'garden caterpillar', tier: 2, traits: {
    form: 'serpent', head: 'bug', body: 'segmented', eyes: 'bead', ears: 'antennae', mouth: 'munch', pattern: 'bands', mark: 'dots',
    tail: 'spike', topper: 'leaf', feet: 'nubs',
    color: 'lime', accent: 'gold', eyeColor: 'ink', hairColor: 'lime', taste: 'fruity', appetite: 'hearty' } },
  { name: 'Hoolet', line: 'moon owlet', tier: 0, traits: {
    form: 'avian', head: 'owl', body: 'feathered', eyes: 'owl', ears: 'tufts', mouth: 'beak', pattern: 'facedisk', mark: 'moon',
    topper: 'plume', feet: 'talons', wings: 'feathered',
    color: 'brown', accent: 'cream', eyeColor: 'gold', hairColor: 'brown', taste: 'savory', energy: 'lively' } },
];

// Traits that are shared, not parts owned by a line.
export const NOT_PARTS = [...TEMPERAMENT_GENES];

/** Which founder's line each part comes from: LINEAGE[gene][allele] -> founder name. */
export const LINEAGE = {};
for (const f of FOUNDERS) for (const [gene, v] of Object.entries(f.traits)) {
  if (!GENES[gene] || v === 'none' || NOT_PARTS.includes(gene)) continue;
  (LINEAGE[gene] ||= {})[v] = f.name;
}
export const lineOf = (gene, allele) => LINEAGE[gene]?.[allele] || null;

export function founderFor(careMistakes, rng = defaultRng) {
  const tier = careMistakes <= 1 ? 0 : careMistakes <= 4 ? 1 : 2;
  return rng.pick(FOUNDERS.filter(f => f.tier === tier));
}

/** Starter genome for a new generation-1 egg: plain look, random temperament and colour. */
export function starterGenome(rng = defaultRng) {
  const g = pureGenome(STARTER);
  for (const gene of TEMPERAMENT_GENES) g[gene] = [randomAllele(gene, rng), randomAllele(gene, rng)];
  return g;
}

const SYL = ['mo', 'pi', 'ku', 'la', 'ri', 'to', 'nu', 'be', 'chi', 'pa', 'mi', 'so', 'fu', 'ra', 'ko', 'ne', 'bo', 'lu', 'ta', 'shi', 'po', 'yu', 'ma', 'ki'];
export function randomName(rng = defaultRng) {
  let n = rng.pick(SYL) + rng.pick(SYL);
  if (rng.chance(0.35)) n += rng.pick(['n', 'chi', 'mo', 'tt', 'ppi', 'ko']);
  return n[0].toUpperCase() + n.slice(1);
}
