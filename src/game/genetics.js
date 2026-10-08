// Genetics: every trait is a gene with two alleles (one from each parent).
// The higher-dominance allele is expressed; ties are a coin flip made once,
// at conception. Recessive alleles can skip a generation and come back.
// Colours can also blend, and rare mutations bring brand-new alleles.

import { RAMP_NAMES } from '../engine/palette.js';
import { rand as defaultRng } from '../engine/rng.js';

// dominance: 3 = common/dominant, 2 = normal, 1 = rare/recessive
export const GENES = {
  shape:   { round: 3, bean: 2, egg: 2, tall: 2, pear: 2, bun: 2, drop: 1, blocky: 1 },
  size:    { medium: 3, small: 1, large: 1 },
  eyes:    { bean: 3, button: 3, dot: 2, wide: 2, sparkle: 2, shiny: 2, sleepy: 2, arc: 1, cat: 1, star: 1, gem: 1 },
  mouth:   { smile: 3, open: 3, tiny: 2, cat: 2, ooh: 2, flat: 2, beak: 1, fang: 1, blep: 1, wobble: 1 },
  ears:    { none: 3, bear: 2, cat: 2, floppy: 2, bunny: 2, mouse: 2, pigtail: 2, puff: 1, horns: 1, fins: 1, antenna: 1, leaf: 1 },
  crest:   { none: 3, tuft: 2, curl: 2, sprout: 2, bow: 2, ribbon: 2, cap: 2, beret: 1, horn: 1, crown: 1, flame: 1, halo: 1, star: 1 },
  back:    { none: 3, pomtail: 2, longtail: 2, wings: 1, bat: 1, fairy: 1, fishtail: 1, shell: 1, cape: 1 },
  outfit:  { none: 3, bowtie: 2, scarf: 2, overalls: 2, dress: 2, collar: 1, apron: 1, tie: 1 },
  feet:    { stubs: 3, shoes: 2, float: 2, paws: 2, legs: 1 },
  pattern: { none: 3, socks: 2, tips: 2, mask: 1, spots: 1, stripes: 1, twotone: 1 },
  cheeks:  { blush: 3, none: 2, dots: 2, freckles: 1, hearts: 1 },
  // temperament (shown on the status screen, changes care)
  appetite: { normal: 3, light: 2, hearty: 2 },
  energy:   { normal: 3, calm: 2, lively: 2 },
  taste:    { sweet: 2, savory: 2, fruity: 2, spicy: 1 },
};

export const COLOR_GENES = ['color', 'accent', 'eyeColor'];
export const BODY_COLORS = RAMP_NAMES; // all 14 ramps
export const EYE_COLORS = ['ink', 'brown', 'blue', 'green', 'violet', 'red', 'gold', 'pink', 'sky', 'mint'];
// Order around the colour wheel, for blending.
const WHEEL = ['red', 'orange', 'gold', 'lime', 'green', 'mint', 'sky', 'blue', 'indigo', 'violet', 'pink'];

export const PART_GENES = Object.keys(GENES);
export const ALL_GENES = [...PART_GENES, ...COLOR_GENES];

function choices(gene) {
  if (gene === 'color' || gene === 'accent') return BODY_COLORS;
  if (gene === 'eyeColor') return EYE_COLORS;
  return Object.keys(GENES[gene]);
}
function dom(gene, allele) { return GENES[gene]?.[allele] ?? 2; }

/** A random allele, common ones more likely. */
export function randomAllele(gene, rng = defaultRng) {
  if (!GENES[gene]) return rng.pick(choices(gene));
  return rng.weighted(Object.entries(GENES[gene]).map(([a, d]) => [a, d * d]));
}

export function randomGenome(rng = defaultRng) {
  const g = {};
  for (const gene of ALL_GENES) g[gene] = [randomAllele(gene, rng), randomAllele(gene, rng)];
  return g;
}

/** A genome where both alleles are the given traits (used for founders). */
export function pureGenome(traits) {
  const g = {};
  for (const gene of ALL_GENES) {
    const v = traits[gene] ?? choices(gene)[0];
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
    const [a, b] = genome[gene];
    const da = dom(gene, a), db = dom(gene, b);
    p[gene] = da > db ? a : db > da ? b : rng.chance(0.5) ? a : b;
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

/** Make a child genome: one random allele from each parent, plus rare mutations. */
export function inherit(mom, dad, rng = defaultRng) {
  const g = {};
  for (const gene of ALL_GENES) {
    const pick = (parent) => rng.chance(MUTATION_RATE) ? randomAllele(gene, rng) : parent[gene][rng.int(2)];
    g[gene] = [pick(mom), pick(dad)];
  }
  return g;
}

/** Count how many visible traits differ between two phenotypes. */
export function difference(a, b) {
  let n = 0;
  for (const gene of ALL_GENES) if (a[gene] !== b[gene]) n++;
  return n;
}

// ---------- Generation 1 ----------
// Generation 1 looks are decided by care, like the original device.
// From generation 2 on, looks come only from genes.

export const STARTER = {
  shape: 'round', size: 'medium', eyes: 'bean', mouth: 'open', ears: 'none', crest: 'none',
  back: 'none', outfit: 'none', feet: 'stubs', pattern: 'none', cheeks: 'blush',
  color: 'cream', accent: 'pink', eyeColor: 'ink',
};

// Original characters. tier: 0 = best care, 2 = poorest care.
// Each tier has one boy-leaning and one girl-leaning design, but any pet can become any founder.
export const FOUNDERS = [
  { name: 'Lumipom', tier: 0, traits: { shape: 'round', eyes: 'sparkle', mouth: 'open', ears: 'puff', crest: 'ribbon', back: 'fairy', outfit: 'dress', feet: 'shoes', pattern: 'none', cheeks: 'blush', color: 'cream', accent: 'pink', eyeColor: 'sky', taste: 'sweet', energy: 'calm' } },
  { name: 'Kometchi', tier: 0, traits: { shape: 'bean', eyes: 'bean', mouth: 'open', ears: 'cat', crest: 'star', back: 'none', outfit: 'bowtie', feet: 'stubs', pattern: 'none', cheeks: 'blush', color: 'sky', accent: 'red', eyeColor: 'ink', taste: 'savory', energy: 'lively' } },
  { name: 'Pipolin', tier: 1, traits: { shape: 'egg', eyes: 'shiny', mouth: 'cat', ears: 'bunny', crest: 'bow', back: 'pomtail', outfit: 'collar', feet: 'stubs', pattern: 'none', cheeks: 'hearts', color: 'pink', accent: 'violet', eyeColor: 'violet', taste: 'fruity' } },
  { name: 'Ducklet', tier: 1, traits: { shape: 'bun', eyes: 'dot', mouth: 'beak', ears: 'none', crest: 'tuft', back: 'none', outfit: 'scarf', feet: 'shoes', pattern: 'none', cheeks: 'none', color: 'lime', accent: 'orange', eyeColor: 'ink', taste: 'savory', appetite: 'hearty' } },
  { name: 'Mogumo', tier: 2, traits: { shape: 'blocky', eyes: 'sleepy', mouth: 'blep', ears: 'bear', crest: 'none', back: 'none', outfit: 'overalls', feet: 'stubs', pattern: 'none', cheeks: 'dots', color: 'brown', accent: 'blue', eyeColor: 'ink', taste: 'sweet', energy: 'calm' } },
  { name: 'Spookit', tier: 2, traits: { shape: 'drop', eyes: 'wide', mouth: 'fang', ears: 'horns', crest: 'none', back: 'bat', outfit: 'tie', feet: 'float', pattern: 'mask', cheeks: 'none', color: 'violet', accent: 'indigo', eyeColor: 'red', taste: 'spicy' } },
];

export function founderFor(careMistakes, rng = defaultRng) {
  const tier = careMistakes <= 1 ? 0 : careMistakes <= 4 ? 1 : 2;
  return rng.pick(FOUNDERS.filter(f => f.tier === tier));
}

/** Starter genome for a new generation-1 egg: plain look, random temperament and colour. */
export function starterGenome(rng = defaultRng) {
  const g = pureGenome(STARTER);
  for (const gene of ['appetite', 'energy', 'taste']) g[gene] = [randomAllele(gene, rng), randomAllele(gene, rng)];
  return g;
}

/** Which visible traits a stage shows. Babies are simple; adults show everything. */
export function stageTraits(p, stage) {
  const t = { ...p };
  if (stage === 'baby') {
    Object.assign(t, { eyes: 'baby', mouth: 'open', ears: 'none', crest: 'none', back: 'none', outfit: 'none', feet: 'float', pattern: 'none', cheeks: 'blush', size: 'medium' });
  } else if (stage === 'child') {
    Object.assign(t, { ears: 'none', crest: 'none', back: 'none', outfit: 'none', feet: 'stubs', size: 'medium' });
  } else if (stage === 'teen') {
    Object.assign(t, { crest: 'none', back: 'none', outfit: 'none', feet: p.feet === 'float' ? 'float' : 'stubs', size: 'medium' });
  }
  return t;
}

const SYL = ['mo', 'pi', 'ku', 'la', 'ri', 'to', 'nu', 'be', 'chi', 'pa', 'mi', 'so', 'fu', 'ra', 'ko', 'ne', 'bo', 'lu', 'ta', 'shi', 'po', 'yu', 'ma', 'ki'];
export function randomName(rng = defaultRng) {
  let n = rng.pick(SYL) + rng.pick(SYL);
  if (rng.chance(0.35)) n += rng.pick(['n', 'chi', 'mo', 'tt', 'ppi', 'ko']);
  return n[0].toUpperCase() + n.slice(1);
}
