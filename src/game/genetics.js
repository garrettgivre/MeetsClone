// Genetics: every trait is a gene with two alleles (one from each parent).
// The higher-dominance allele is expressed; ties are a coin flip made once,
// at conception. Recessive alleles can skip a generation and come back.
// Size is incompletely dominant (small x large = medium), colours can blend
// or drift a step around the colour wheel, and rare mutations bring
// brand-new alleles.

import { RAMP_NAMES } from '../engine/palette.js';
import { rand as defaultRng } from '../engine/rng.js';

// dominance: 3 = common/dominant, 2 = normal, 1 = rare/recessive
export const GENES = {
  shape:   { round: 3, mochi: 3, bean: 2, egg: 2, tall: 2, pear: 2, bun: 2, onigiri: 1, drop: 1, blocky: 1, heart: 1, cloud: 1, acorn: 1, peach: 1 },
  size:    { medium: 3, small: 1, large: 1 },
  eyes:    { bean: 3, button: 3, dot: 2, wide: 2, sparkle: 2, shiny: 2, sleepy: 2, droopy: 2, arc: 1, cat: 1, star: 1, gem: 1, heart: 1, pixel: 1 },
  eyeSet:  { normal: 3, wide: 2, close: 2, low: 1 },
  mouth:   { smile: 3, open: 3, tiny: 2, cat: 2, ooh: 2, flat: 2, smirk: 2, grin: 2, teeth: 1, bill: 1, fang: 1, blep: 1, wobble: 1, grill: 1 },
  nose:    { none: 3, dot: 2, button: 2, snout: 1, whiskers: 1 },
  mark:    { none: 3, star: 1, heart: 1, moon: 1, drop: 1, diamond: 1 },
  hair:    { none: 3, bangs: 2, bob: 2, spiky: 1, ponytail: 1, twintails: 1, curly: 1 },
  ears:    { none: 3, bear: 2, cat: 2, floppy: 2, bunny: 2, mouse: 2, puff: 1, horns: 1, fins: 1, antenna: 1, leaf: 1, wings: 1, antlers: 1 },
  crest:   { none: 3, tuft: 2, curl: 2, sprout: 2, bobble: 2, swirl: 2, bud: 2, horn: 1, flame: 1, halo: 1, star: 1, comet: 1 },
  back:    { none: 3, pomtail: 2, longtail: 2, fox: 2, curly: 2, wings: 1, bat: 1, fairy: 1, butterfly: 1, fishtail: 1, dragon: 1, bolt: 1, devil: 1 },
  fluff:   { none: 3, cheeks: 2, mane: 1 },
  build:   { round: 3, chubby: 2, slim: 2, pear: 2, egg: 2, barrel: 2, wide: 2, bell: 1, long: 1, stout: 1, cone: 1, peanut: 1, square: 1, tiny: 1 },
  belly:   { none: 3, patch: 2, suit: 1, bib: 1, heart: 1 },
  feet:    { stubs: 3, paws: 2, puffs: 2, float: 1, legs: 1, flippers: 1, tiny: 1, talons: 1, hooves: 1, tentacles: 1, roots: 1, claws: 1, cloud: 1, wheels: 1 },
  pattern: { none: 3, socks: 2, tips: 2, mask: 1, spots: 1, stripes: 1, twotone: 1 },
  cheeks:  { blush: 3, none: 2, dots: 2, freckles: 1, hearts: 1 },
  aura:    { none: 3, sparkle: 1 }, // very rare: a twinkling pet
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
// follows them. Having no ears, top, nose and so on doesn't beat having one.
const NONE_TIES = ['hair', 'ears', 'crest', 'back', 'nose', 'mark', 'belly'];
function dom(gene, allele) {
  if (allele === 'none' && NONE_TIES.includes(gene)) return 2;
  return GENES[gene]?.[allele] ?? 2;
}

/** A random allele, common ones more likely. */
export function randomAllele(gene, rng = defaultRng) {
  if (!GENES[gene]) return rng.pick(choices(gene));
  return rng.weighted(Object.entries(GENES[gene]).map(([a, d]) => [a, d * d]));
}

/**
 * A wild-born genome (matchmaker partners, testing). Wild pets usually breed
 * true: colours are mostly two copies of the same allele and parts often are,
 * so children resemble the parent you can see, with the odd surprise.
 */
export function randomGenome(rng = defaultRng) {
  const g = {};
  for (const gene of ALL_GENES) {
    const a = randomAllele(gene, rng);
    const same = COLOR_GENES.includes(gene) ? 0.7 : 0.45;
    g[gene] = [a, rng.chance(same) ? a : randomAllele(gene, rng)];
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
    p[gene] = da > db ? a : db > da ? b : rng.chance(0.5) ? a : b;
  }
  // Size is incompletely dominant: the child lands between its two alleles.
  const SZ = { small: -1, medium: 0, large: 1 };
  if (genome.size) {
    const avg = (SZ[genome.size[0]] + SZ[genome.size[1]]) / 2;
    const v = Number.isInteger(avg) ? avg : (rng.chance(0.5) ? Math.floor(avg) : Math.ceil(avg));
    p.size = ['small', 'medium', 'large'][v + 1];
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
    for (const a of new Set(pair)) if (a !== phenotype[gene] && !(gene === 'size')) out.push({ gene, allele: a });
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
  shape: 'Head', size: 'Size', eyes: 'Eyes', mouth: 'Mouth', hair: 'Hair', ears: 'Ears', crest: 'Top',
  back: 'Back', fluff: 'Fur', feet: 'Feet', eyeSet: 'Eye spacing', nose: 'Nose', mark: 'Forehead', build: 'Build', belly: 'Belly', pattern: 'Markings', cheeks: 'Cheeks', aura: 'Aura',
  appetite: 'Appetite', energy: 'Energy', taste: 'Taste',
  color: 'Body colour', accent: 'Accent colour', eyeColor: 'Eye colour', hairColor: 'Hair colour',
};

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
  shape: 'round', size: 'medium', eyes: 'bean', mouth: 'open', hair: 'none', ears: 'none', crest: 'none',
  back: 'none', feet: 'stubs', pattern: 'none', cheeks: 'blush',
  color: 'cream', accent: 'pink', eyeColor: 'ink', hairColor: 'brown',
};

// The founders. Every body part belongs to exactly one founder: each founder
// is the root of a genetic line, and every part in the game descends from one
// of them. No two founders share a part (or a body colour).
// tier: 0 = best care, 2 = poorest care (generation 1 grows into one of these).
export const FOUNDERS = [
  { name: 'Mogumo', line: 'sleepy bear', tier: 2, traits: {
    color: 'brown', accent: 'cream', eyeColor: 'ink', shape: 'round', build: 'stout', size: 'large', eyes: 'droopy', eyeSet: 'close',
    mouth: 'tiny', nose: 'snout', ears: 'bear', crest: 'curl', belly: 'heart', feet: 'paws', cheeks: 'blush', taste: 'sweet', energy: 'calm' } },
  { name: 'Kometchi', line: 'comet kitty', tier: 0, traits: {
    color: 'sky', accent: 'gold', eyeColor: 'blue', shape: 'bean', build: 'slim', eyes: 'cat', mouth: 'cat', nose: 'whiskers', mark: 'star',
    ears: 'cat', crest: 'comet', back: 'longtail', belly: 'patch', feet: 'legs', pattern: 'tips', taste: 'savory', energy: 'lively' } },
  { name: 'Ducklet', line: 'duckling', tier: 1, traits: {
    color: 'lime', accent: 'cream', eyeColor: 'ink', shape: 'bun', build: 'chubby', eyes: 'dot', eyeSet: 'wide', mouth: 'bill',
    crest: 'tuft', back: 'wings', belly: 'bib', feet: 'flippers', taste: 'savory', appetite: 'hearty' } },
  { name: 'Pipolin', line: 'bunny idol', tier: 1, traits: {
    color: 'pink', accent: 'cream', eyeColor: 'violet', hairColor: 'violet', shape: 'egg', build: 'bell', size: 'small', eyes: 'shiny', eyeSet: 'close',
    mouth: 'smile', nose: 'button', hair: 'twintails', ears: 'bunny', crest: 'bobble', back: 'pomtail', feet: 'tiny', cheeks: 'hearts', taste: 'fruity' } },
  { name: 'Lumipom', line: 'pom-pom fairy', tier: 0, traits: {
    color: 'cream', accent: 'pink', eyeColor: 'sky', hairColor: 'gold', shape: 'mochi', build: 'round', eyes: 'sparkle', eyeSet: 'wide',
    mouth: 'open', hair: 'bob', ears: 'puff', crest: 'halo', back: 'fairy', feet: 'cloud', cheeks: 'dots', aura: 'sparkle', taste: 'sweet', energy: 'calm' } },
  { name: 'Spookit', line: 'little imp', tier: 2, traits: {
    color: 'violet', accent: 'indigo', eyeColor: 'red', hairColor: 'indigo', shape: 'drop', build: 'long', eyes: 'wide', eyeSet: 'low',
    mouth: 'fang', mark: 'moon', hair: 'spiky', ears: 'horns', back: 'devil', belly: 'suit', feet: 'claws', pattern: 'mask', taste: 'spicy' } },
  { name: 'Fawnly', line: 'forest fawn', tier: 0, traits: {
    color: 'orange', accent: 'cream', eyeColor: 'green', hairColor: 'orange', shape: 'tall', build: 'egg', eyes: 'gem', mouth: 'ooh', mark: 'drop',
    hair: 'bangs', ears: 'antlers', crest: 'bud', feet: 'hooves', pattern: 'spots', cheeks: 'freckles', taste: 'fruity', energy: 'calm' } },
  { name: 'Pupplo', line: 'puppy', tier: 1, traits: {
    color: 'gold', accent: 'brown', eyeColor: 'brown', shape: 'pear', build: 'pear', eyes: 'heart', mouth: 'blep', nose: 'dot', mark: 'heart',
    ears: 'floppy', back: 'fox', feet: 'stubs', pattern: 'twotone', taste: 'savory', energy: 'lively' } },
  { name: 'Hamuchi', line: 'hamster', tier: 2, traits: {
    color: 'slate', accent: 'cream', eyeColor: 'ink', shape: 'onigiri', build: 'barrel', eyes: 'button', mouth: 'teeth', ears: 'mouse',
    crest: 'star', back: 'curly', fluff: 'cheeks', feet: 'puffs', pattern: 'stripes', taste: 'savory', appetite: 'hearty' } },
  { name: 'Gillybop', line: 'axolotl', tier: 1, traits: {
    color: 'mint', accent: 'pink', eyeColor: 'gold', hairColor: 'pink', shape: 'cloud', build: 'peanut', eyes: 'star', mouth: 'wobble',
    hair: 'ponytail', ears: 'fins', crest: 'swirl', back: 'fishtail', feet: 'tentacles', taste: 'fruity' } },
  { name: 'Sproutle', line: 'plant sprite', tier: 1, traits: {
    color: 'green', accent: 'lime', eyeColor: 'brown', hairColor: 'lime', shape: 'acorn', build: 'cone', eyes: 'sleepy', mouth: 'flat',
    mark: 'diamond', hair: 'curly', ears: 'leaf', crest: 'sprout', back: 'butterfly', feet: 'roots', taste: 'fruity', energy: 'calm' } },
  { name: 'Drakko', line: 'baby dragon', tier: 0, traits: {
    color: 'red', accent: 'gold', eyeColor: 'gold', hairColor: 'orange', shape: 'peach', build: 'wide', eyes: 'bean', mouth: 'grin',
    crest: 'flame', back: 'dragon', fluff: 'mane', feet: 'talons', taste: 'spicy', energy: 'lively' } },
  { name: 'Bolto', line: 'robot', tier: 2, traits: {
    color: 'blue', accent: 'slate', eyeColor: 'sky', shape: 'blocky', build: 'square', eyes: 'pixel', mouth: 'grill', ears: 'antenna',
    crest: 'horn', back: 'bolt', feet: 'wheels', taste: 'savory' } },
  { name: 'Nocti', line: 'night bat', tier: 0, traits: {
    color: 'indigo', accent: 'violet', eyeColor: 'ink', shape: 'heart', build: 'tiny', eyes: 'arc', mouth: 'smirk', ears: 'wings',
    back: 'bat', feet: 'float', pattern: 'socks', taste: 'sweet', energy: 'calm' } },
];

/** Which founder's line each part comes from: LINEAGE[gene][allele] -> founder name. */
export const LINEAGE = {};
for (const f of FOUNDERS) for (const [gene, v] of Object.entries(f.traits)) {
  if (!GENES[gene] || v === 'none' || ['size', 'eyeSet', 'appetite', 'energy', 'taste'].includes(gene)) continue;
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
  for (const gene of ['appetite', 'energy', 'taste']) g[gene] = [randomAllele(gene, rng), randomAllele(gene, rng)];
  return g;
}

/** Ears drawn in proportion to the head (others are fixed-size sprites). */
export const SCALED_EARS = ['bear', 'mouse', 'cat', 'bunny', 'floppy'];

/** Which visible traits a stage shows. Babies are simple; adults show everything. */
export function stageTraits(p, stage) {
  const t = { ...p };
  if (stage === 'baby') {
    Object.assign(t, { fluff: 'none', eyes: 'baby', eyeSet: 'normal', mouth: p.mouth === 'bill' ? 'bill' : 'open', nose: 'none', mark: 'none', hair: 'none', ears: 'none', crest: 'none', back: 'none', feet: 'float', pattern: 'none', cheeks: 'blush', size: 'medium' });
  } else if (stage === 'child') {
    // kids already show their ear shape (drawn to scale), their nose and the start of their hair
    Object.assign(t, { fluff: p.fluff === 'cheeks' ? 'cheeks' : 'none', hair: p.hair === 'bangs' || p.hair === 'bob' ? 'bangs' : 'none', ears: SCALED_EARS.includes(p.ears) ? p.ears : 'none', mark: 'none', crest: 'none', back: 'none', feet: p.feet === 'flippers' ? 'flippers' : 'stubs', size: 'medium' });
  } else if (stage === 'teen') {
    Object.assign(t, { crest: 'none', back: 'none', feet: ['float', 'flippers'].includes(p.feet) ? p.feet : 'stubs', size: 'medium' });
  }
  return t;
}

const SYL = ['mo', 'pi', 'ku', 'la', 'ri', 'to', 'nu', 'be', 'chi', 'pa', 'mi', 'so', 'fu', 'ra', 'ko', 'ne', 'bo', 'lu', 'ta', 'shi', 'po', 'yu', 'ma', 'ki'];
export function randomName(rng = defaultRng) {
  let n = rng.pick(SYL) + rng.pick(SYL);
  if (rng.chance(0.35)) n += rng.pick(['n', 'chi', 'mo', 'tt', 'ppi', 'ko']);
  return n[0].toUpperCase() + n.slice(1);
}
