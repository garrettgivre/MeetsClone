// The town: places your pet can visit. Pure logic, no drawing, so it can be
// tested. Every place has a resident to befriend and a few things to do that
// feed the rest of the game (hunger, weight, discipline, illness, points,
// marriage and the Gene Book).
//
// Downtown is free to walk around. The other districts need a travel pass,
// and a hidden village opens once you've found every piece of an old map.

import { rand as defaultRng, makeRng, hash } from '../engine/rng.js';
import { randomGenome, express, pureGenome, FOUNDERS } from './genetics.js';
import { FOODS, TOYS, CLOTHES } from './items.js';
import { HOUR, canAct, canMarry, isChubby, MAX_DISCIPLINE, BASE_WEIGHT, train, skillLevel, SKILL_LABEL, SKILL_MAX } from './pet.js';
import { BOOK_GENES, entries, has } from './book.js';

export const DISTRICTS = [
  { id: 'downtown', name: 'Downtown', pass: null, travel: 'walk' },
  { id: 'uptown', name: 'Uptown', pass: { id: 'bus', name: 'Bus Pass', price: 150 }, travel: 'bus' },
  { id: 'seaside', name: 'Seaside', pass: { id: 'train', name: 'Train Pass', price: 300 }, travel: 'train' },
  { id: 'faraway', name: 'Far Away', pass: { id: 'balloon', name: 'Balloon Ticket', price: 600 }, travel: 'balloon' },
  { id: 'hidden', name: 'Off the Map', pass: null, travel: 'walk', secret: true },
];

export const MAP_PIECES = 3;
export const PHOTO_LIMIT = 20;
export const HAIR_DYES = ['red', 'orange', 'gold', 'green', 'sky', 'violet', 'pink', 'slate'];

// Residents: one per place. Their looks come from a fixed seed, so they're
// the same pet every visit (and every game).
export const LOCATIONS = [
  // ---- downtown ----
  { id: 'square', district: 'downtown', name: 'Town Square', resident: 'Mayor Pomme',
    lines: ['Welcome to our little town!', 'Toss a coin in the fountain. It might bring luck!', 'The bus to Uptown leaves from here.'] },
  { id: 'park', district: 'downtown', name: 'Park', resident: 'Twig',
    lines: ['I found a shiny pebble here once.', 'The ducks like you!', 'Walk slowly. You never know what turns up.'] },
  { id: 'playground', district: 'downtown', name: 'Playground', resident: 'Bibi',
    lines: ['Race you to the slide!', 'Higher! Higher!', 'Swinging makes me hungry.'] },
  { id: 'cafe', district: 'downtown', name: 'Cafe', resident: 'Chef Momo',
    lines: ['Today\'s dish is fresh from the oven!', 'Eat up, little one.', 'Every pet has a favourite taste.'] },
  { id: 'bakery', district: 'downtown', name: 'Bakery', resident: 'Crumb',
    lines: ['Smell that? Fresh bread!', 'Have a free sample, once a day!', 'Too many sweets hurt your teeth.'] },
  { id: 'toyshop', district: 'downtown', name: 'Toy Shop', resident: 'Pip',
    lines: ['Every pet has a favourite toy.', 'The plushie is my best seller.', 'Toys make playtime twice as fun.'] },
  { id: 'boutique', district: 'downtown', name: 'Boutique', resident: 'Madame Lulu',
    lines: ['Darling, that colour suits you!', 'Clothes don\'t pass to children. Fashion is personal!', 'Try a cape. Very dramatic.'] },
  { id: 'arcade', district: 'downtown', name: 'Arcade', resident: 'Zappy',
    lines: ['High score or bust!', 'Games keep you trim, you know.', 'Copy Me is my favourite.'] },
  { id: 'hospital', district: 'downtown', name: 'Hospital', resident: 'Dr. Fennel',
    lines: ['An apple a day... and a game or two.', 'Keep things clean and you\'ll stay well.', 'Sick? We can fix you right up.'] },
  // ---- uptown ----
  { id: 'dept', district: 'uptown', name: 'Department Store', resident: 'Clerk Nana',
    lines: ['Everything under one roof!', 'Check the daily sale!', 'Food, toys, clothes. All here.'] },
  { id: 'salon', district: 'uptown', name: 'Beauty Salon', resident: 'Stylist Ruru',
    lines: ['A new hair colour? Let\'s do it!', 'Dye doesn\'t pass to your children, sweetie.', 'Sit down, relax.'] },
  { id: 'school', district: 'uptown', name: 'School', resident: 'Teacher Oak',
    lines: ['Good manners start in class.', 'Two classes a day is plenty.', 'Grown-ups can take a night class for a small fee.'] },
  { id: 'work', district: 'uptown', name: 'Workshop', resident: 'Boss Bolt',
    lines: ['Need work? Grown-ups only!', 'Check the job board. Skills open doors!', 'Three good shifts earn a promotion.'] },
  { id: 'chapel', district: 'uptown', name: 'Wedding Chapel', resident: 'Matchmaker Hana',
    lines: ['Love is in the air!', 'I know someone perfect for you.', 'Every egg starts with a wedding.'] },
  { id: 'studio', district: 'uptown', name: 'Photo Studio', resident: 'Flash',
    lines: ['Say cheese!', 'Pick a backdrop you like.', 'Photos last forever.'] },
  // ---- seaside & country ----
  { id: 'beach', district: 'seaside', name: 'Beach', resident: 'Coral',
    lines: ['The water is lovely today!', 'Collect shells. Five make a nice gift!', 'Swimming is great exercise.'] },
  { id: 'forest', district: 'seaside', name: 'Forest', resident: 'Moss',
    lines: ['Fruit grows wild out here.', 'They say an old map is buried in these woods...', 'Shh. Listen to the birds.'] },
  { id: 'fair', district: 'seaside', name: 'Amusement Park', resident: 'Ringo',
    lines: ['Step right up!', 'The coaster is not for the faint-hearted!', 'Rides make everyone smile.'] },
  { id: 'stage', district: 'seaside', name: 'Concert Hall', resident: 'Diva Vee',
    lines: ['The stage is yours, darling!', 'A happy, well-behaved pet shines brightest.', 'Fans remember a great show.'] },
  // ---- far away ----
  { id: 'castle', district: 'faraway', name: 'Royal Castle', resident: 'Queen Opal',
    lines: ['Welcome to my court.', 'Manners matter in the castle.', 'Have some tea, dear.'] },
  { id: 'starisle', district: 'faraway', name: 'Star Isle', resident: 'Stella',
    lines: ['Wishes come true on Star Isle.', 'A wish touches your next egg.', 'Look how the stars sparkle!'] },
  // ---- hidden ----
  { id: 'hidden', district: 'hidden', name: 'Hidden Village', resident: 'Elder Sage',
    lines: ['So, you found the old map.', 'The founders\' families still live here.', 'Every line can be traced back to one of six.'] },
];

export const LOCATION = Object.fromEntries(LOCATIONS.map(l => [l.id, l]));
export const districtOf = (id) => DISTRICTS.find(d => d.id === LOCATION[id].district);

// ---------- state ----------

/** The town's save data, created on first use. */
export function townState(game) {
  game.town ||= {};
  const t = game.town;
  t.passes ||= [];
  t.friends ||= {};
  t.daily ||= { day: '', counts: {} };
  t.photos ||= [];
  t.mapPieces ??= 0;
  t.shells ??= 0;
  t.fans ??= 0;
  t.lastWork ??= 0;
  t.metQueen ??= false;
  t.wish ??= null; // a part promised to the next egg by Star Isle: { gene, allele }
  const day = new Date(game.simTime).toDateString();
  if (t.daily.day !== day) t.daily = { day, counts: {} };
  return t;
}

const used = (game, key) => townState(game).daily.counts[key] || 0;
const use = (game, key) => { const c = townState(game).daily.counts; c[key] = (c[key] || 0) + 1; };
const spend = (game, n) => { if (game.points < n) return false; game.points -= n; return true; };
const gain = (game, n) => { game.points = Math.min(999999, game.points + n); };
const clamp4 = (v) => Math.max(0, Math.min(4, v));
const dayNumber = (game) => Math.floor(game.simTime / (24 * HOUR));

export function hasPass(game, passId) { return townState(game).passes.includes(passId); }

/** Can this district be visited? Returns null, or the reason it can't. */
export function districtLocked(game, district) {
  const d = typeof district === 'string' ? DISTRICTS.find(x => x.id === district) : district;
  if (d.secret) return townState(game).mapPieces >= MAP_PIECES ? null : 'secret';
  if (d.pass && !hasPass(game, d.pass.id)) return 'pass';
  return null;
}

export function buyPass(game, passId) {
  const d = DISTRICTS.find(x => x.pass?.id === passId);
  if (!d) return { ok: false };
  if (hasPass(game, passId)) return { ok: false, msg: 'You already have it!' };
  if (!spend(game, d.pass.price)) return { ok: false, msg: 'Not enough points!' };
  townState(game).passes.push(passId);
  return { ok: true, msg: `Got the ${d.pass.name}! ${d.name} is open.` };
}

/** Can the pet go out at all, or to this place? Returns null or a reason. */
export function cantGo(game, locId = null) {
  const pet = game.pet;
  if (!canAct(pet)) return pet?.stage === 'egg' ? 'Wait for it to hatch!' : '...';
  if (pet.stage === 'baby') return 'Too little to go out!';
  if (pet.asleep) return 'Shh! Sleeping...';
  if (pet.sick && locId !== 'hospital') return locId ? 'Too sick to go out! Try the hospital.' : null;
  if (locId) {
    const why = districtLocked(game, LOCATION[locId].district);
    if (why === 'pass') return `You need the ${districtOf(locId).pass.name}.`;
    if (why === 'secret') return '???';
  }
  return null;
}

// ---------- residents ----------

/** A resident's looks: the same every time. */
export function resident(locId) {
  const rng = makeRng(hash('resident:' + locId));
  const genome = randomGenome(rng);
  const p = express(genome, rng);
  return { name: LOCATION[locId].resident, phenotype: p, gender: rng.chance(0.5) ? 'f' : 'm' };
}

export const FRIEND_GIFTS = { 3: 50, 7: 150 };

/** Chat with the resident: friendship goes up once a day, with gifts along the way. */
export function talk(game, locId, rng = defaultRng) {
  const loc = LOCATION[locId], t = townState(game);
  const line = rng.pick(loc.lines);
  if (used(game, 'talk:' + locId)) return { ok: true, msg: `${loc.resident}: "${line}"` };
  use(game, 'talk:' + locId);
  const f = (t.friends[locId] || 0) + 1;
  t.friends[locId] = f;
  const gift = FRIEND_GIFTS[f];
  if (gift) gain(game, gift);
  train(game.pet, 'charm', 1); // a good chat is practice
  return { ok: true, friendship: f, gift, msg: `${loc.resident}: "${line}"${gift ? ` A gift for a good friend! +${gift}` : ''}` };
}

export const friendship = (game, locId) => townState(game).friends[locId] || 0;

// ---------- things to do ----------
// Each action: { id, label, price?, needs?(game) -> reason|null, run(game, rng) -> result }
// or { id, label, ui } for actions the scene handles itself (shops, games...).
// Results: { ok, msg, anim?: 'happy'|'eat'|'sad'|'dizzy'|'scold' }

const meals = Object.keys(FOODS).filter(id => FOODS[id].kind === 'meal' && !FOODS[id].free);
const snacks = Object.keys(FOODS).filter(id => FOODS[id].kind === 'snack');

/** The cafe's dish of the day (it changes every day). */
export const dishOfDay = (game) => meals[dayNumber(game) % meals.length];

/** The department store's sale item: [kind, id] with 30% off. */
export function saleOfDay(game) {
  const all = [...Object.keys(TOYS).map(id => ['toy', id]), ...Object.keys(CLOTHES).map(id => ['clothes', id])];
  return all[(dayNumber(game) * 7) % all.length];
}
export const salePrice = (price) => Math.round(price * 0.7);

const FORTUNES = [
  'Great luck! Something nice is coming.', 'Good luck with food today.', 'A friend is thinking of you.',
  'Play a game. Luck is on your side!', 'Small luck. Small treats are best.', 'Patience brings good things.',
];

export const ACTIONS = {
  square: [
    { id: 'fountain', label: 'Toss a coin', price: 5, run(game, rng) {
      if (used(game, 'fountain')) return { ok: false, msg: 'One wish a day at the fountain.' };
      if (!spend(game, 5)) return { ok: false, msg: 'Not enough points!' };
      use(game, 'fountain');
      const lucky = rng.chance(0.25);
      if (lucky) gain(game, 30);
      return { ok: true, anim: 'happy', msg: `Fortune: ${rng.pick(FORTUNES)}${lucky ? ' Coins in the fountain! +30' : ''}` };
    } },
  ],
  park: [
    { id: 'stroll', label: 'Take a stroll', run(game, rng) {
      if (used(game, 'stroll')) return { ok: false, msg: 'You strolled already today. Lovely!' };
      use(game, 'stroll');
      const pet = game.pet;
      pet.happy = clamp4(pet.happy + 0.5);
      if (townState(game).mapPieces < MAP_PIECES && rng.chance(0.06)) return findMap(game, 'under a bench');
      if (rng.chance(0.5)) {
        const id = rng.pick(snacks);
        game.inventory[id] = (game.inventory[id] || 0) + 1;
        return { ok: true, anim: 'happy', msg: `A nice walk. Found a ${FOODS[id].name}!` };
      }
      gain(game, 20);
      return { ok: true, anim: 'happy', msg: 'A nice walk. Found 20 points on the path!' };
    } },
  ],
  playground: [
    { id: 'swing', label: 'Swings', run: (game) => play(game, 'Wheee! Up and down!') },
    { id: 'slide', label: 'Slide', run: (game) => play(game, 'Zoom! Down the slide!') },
  ],
  cafe: [
    { id: 'lunch', label: 'Dish of the day', price: 25, needs: (game) => (game.pet.hunger >= 4 ? 'Not hungry!' : null), run(game) {
      if (!spend(game, 25)) return { ok: false, msg: 'Not enough points!' };
      const pet = game.pet, dish = FOODS[dishOfDay(game)];
      const fav = dish.taste === pet.phenotype.taste;
      pet.hunger = clamp4(pet.hunger + 3);
      if (fav) pet.happy = clamp4(pet.happy + 1);
      pet.weight += 1;
      return { ok: true, anim: 'eat', msg: fav ? `${dish.name}! A favourite taste!` : `${dish.name}. Yum!` };
    } },
  ],
  bakery: [
    { id: 'sample', label: 'Free sample', run(game) {
      if (used(game, 'sample')) return { ok: false, msg: 'One sample a day, sweetie!' };
      use(game, 'sample');
      const pet = game.pet;
      pet.happy = clamp4(pet.happy + 1);
      pet.weight += 1;
      return { ok: true, anim: 'eat', msg: 'Warm bread! So soft.' };
    } },
    { id: 'buy', label: 'Buy treats', ui: 'shop:snacks' },
  ],
  toyshop: [{ id: 'buy', label: 'Browse toys', ui: 'shop:toys' }],
  boutique: [{ id: 'buy', label: 'Browse clothes', ui: 'shop:clothes' }],
  arcade: [
    { id: 'jumprope', label: 'Jump Rope', ui: 'game:jumprope' },
    { id: 'whichway', label: 'Which Way?', ui: 'game:whichway' },
    { id: 'catch', label: 'Snack Catch', ui: 'game:catch' },
    { id: 'copyme', label: 'Copy Me', ui: 'game:copyme' },
  ],
  hospital: [
    { id: 'treat', label: 'Treatment', price: 40, needs: (game) => (game.pet.sick ? null : 'Not sick!'), run(game) {
      if (!spend(game, 40)) return { ok: false, msg: 'Not enough points!' };
      Object.assign(game.pet, { sick: null, critical: false, sickMs: 0, dosesLeft: 0 });
      return { ok: true, anim: 'happy', msg: 'All better! Take care now.' };
    } },
    { id: 'checkup', label: 'Check-up', run(game) {
      const pet = game.pet;
      const tip = pet.sick ? 'Needs treatment!' : isChubby(pet) ? 'A bit chubby. More games!' : pet.weight <= BASE_WEIGHT[pet.stage] ? 'Healthy and trim!' : 'Healthy!';
      return { ok: true, msg: `Weight ${pet.weight}g. ${tip}` };
    } },
  ],
  dept: [
    { id: 'food', label: 'Food', ui: 'shop:food' },
    { id: 'toys', label: 'Toys', ui: 'shop:toys' },
    { id: 'clothes', label: 'Clothes', ui: 'shop:clothes' },
    { id: 'sale', label: 'Daily sale', ui: 'sale' },
  ],
  salon: [{ id: 'dye', label: 'Hair dye', price: 80, ui: 'dye' }],
  school: [
    { id: 'lesson', label: 'Manners', price: nightFee, run: (game) => lesson(game, null) },
    { id: 'reading', label: 'Reading', price: nightFee, run: (game) => lesson(game, 'smart') },
    { id: 'art', label: 'Art class', price: nightFee, run: (game) => lesson(game, 'creative') },
    { id: 'gym', label: 'Gym class', price: nightFee, run: (game) => lesson(game, 'fit') },
  ],
  work: [
    { id: 'shift', label: 'Work a shift', needs: (game) => (game.pet.stage !== 'adult' ? 'Grown-ups only!' : null), run: (game) => workShift(game) },
    { id: 'jobs', label: 'Job board', ui: 'jobs', needs: (game) => (game.pet.stage !== 'adult' ? 'Grown-ups only!' : null) },
  ],
  chapel: [{ id: 'match', label: 'Matchmaker', ui: 'matchmaker', needs: (game) => marryWhy(game.pet) }],
  studio: [
    { id: 'photo', label: 'Take a photo', price: 20, run(game, rng) {
      if (!spend(game, 20)) return { ok: false, msg: 'Not enough points!' };
      const pet = game.pet, t = townState(game);
      t.photos.push({
        name: pet.name, gender: pet.gender, stage: pet.stage, species: pet.species || null,
        phenotype: JSON.parse(JSON.stringify(pet.phenotype)), wear: { ...(pet.wear || {}) },
        backdrop: rng.int(4), at: game.simTime, generation: pet.generation,
      });
      if (t.photos.length > PHOTO_LIMIT) t.photos.shift();
      return { ok: true, anim: 'happy', msg: 'Snap! Saved to your photos.' };
    } },
    { id: 'album', label: 'View photos', ui: 'photos' },
  ],
  beach: [
    { id: 'swim', label: 'Swim', run(game) {
      if (used(game, 'swim') >= 2) return { ok: false, msg: 'Too tired to swim again today.' };
      use(game, 'swim');
      const pet = game.pet;
      pet.happy = clamp4(pet.happy + 1);
      pet.weight = Math.max(Math.round(BASE_WEIGHT[pet.stage] * 0.8), pet.weight - 2);
      train(pet, 'fit', 1);
      return { ok: true, anim: 'happy', msg: 'Splash! Great exercise.' };
    } },
    { id: 'shells', label: 'Look for shells', run(game) {
      if (used(game, 'shells')) return { ok: false, msg: 'The tide hasn\'t brought new shells yet.' };
      use(game, 'shells');
      const t = townState(game);
      t.shells++;
      if (t.shells % 5 === 0) { gain(game, 50); return { ok: true, anim: 'happy', msg: `A shell! That's ${t.shells}. Coral trades five for 50 points!` }; }
      return { ok: true, anim: 'happy', msg: `Found a pretty shell! (${t.shells % 5}/5)` };
    } },
  ],
  forest: [
    { id: 'forage', label: 'Forage', run(game, rng) {
      if (used(game, 'forage')) return { ok: false, msg: 'You\'ve picked the bushes clean today.' };
      use(game, 'forage');
      if (townState(game).mapPieces < MAP_PIECES && rng.chance(0.3)) return findMap(game, 'in a hollow log');
      const id = rng.pick(['fruitbowl', 'berrypie', 'peachbun']);
      game.inventory[id] = (game.inventory[id] || 0) + 1;
      return { ok: true, anim: 'happy', msg: `Found wild fruit: a ${FOODS[id].name}!` };
    } },
  ],
  fair: [
    { id: 'wheel', label: 'Ferris wheel', price: 30, run: (game) => ride(game, 30, 2, 'What a view from the top!') },
    { id: 'coaster', label: 'Roller coaster', price: 50, run: (game) => ride(game, 50, 4, 'AAAAH! That was amazing!', 'dizzy') },
  ],
  stage: [
    { id: 'perform', label: 'Perform', run(game, rng) {
      if (used(game, 'perform')) return { ok: false, msg: 'One show a day. Rest your voice!' };
      use(game, 'perform');
      const pet = game.pet, t = townState(game);
      const score = Math.round(pet.happy * 15 + pet.discipline * 10 + (isChubby(pet) ? 0 : 10) + rng.int(25));
      const fans = Math.floor(score / 10);
      t.fans += fans;
      gain(game, score);
      train(pet, 'charm', score >= 55 ? 2 : 1);
      const verdict = score >= 85 ? 'A standing ovation!' : score >= 55 ? 'Big applause!' : 'A polite clap...';
      return { ok: true, anim: score >= 55 ? 'happy' : 'sad', msg: `${verdict} +${score} points, +${fans} fans (${t.fans} in all).` };
    } },
  ],
  castle: [
    { id: 'audience', label: 'Royal audience', needs: (game) => (game.pet.discipline < MAX_DISCIPLINE ? 'Only well-mannered pets may enter!' : null), run(game) {
      const t = townState(game);
      if (!t.metQueen) {
        t.metQueen = true;
        if (!game.wardrobe.includes('crown')) game.wardrobe.push('crown');
        return { ok: true, anim: 'happy', msg: 'The Queen is charmed! She gives you a Crown!' };
      }
      if (used(game, 'tea')) return { ok: false, msg: 'The Queen is resting. Come back tomorrow.' };
      use(game, 'tea');
      game.pet.happy = clamp4(game.pet.happy + 1);
      gain(game, 40);
      return { ok: true, anim: 'happy', msg: 'Tea with the Queen! +40' };
    } },
  ],
  starisle: [
    { id: 'wish', label: 'Make a wish', price: 150, needs: (game) => (townState(game).wish ? 'Your wish is waiting for the next egg.' : null), run(game, rng) {
      const missing = [];
      for (const gene of BOOK_GENES) for (const a of entries(gene)) if (!has(game, gene, a)) missing.push({ gene, allele: a });
      if (!missing.length) return { ok: false, msg: 'You\'ve found everything! Nothing left to wish for.' };
      if (!spend(game, 150)) return { ok: false, msg: 'Not enough points!' };
      townState(game).wish = rng.pick(missing);
      return { ok: true, anim: 'happy', msg: 'A star falls... Your next egg will show something you\'ve never seen!' };
    } },
  ],
  hidden: [
    { id: 'founders', label: 'Founder kin', price: 100, ui: 'founders', needs: (game) => marryWhy(game.pet) },
  ],
};

// ---------- school ----------

export const CLASSES_PER_DAY = 2;
export const NIGHT_CLASS = 30; // what a grown-up pays per class
function nightFee(game) { return game.pet.stage === 'adult' ? NIGHT_CLASS : 0; }
export const classesLeft = (game) => Math.max(0, CLASSES_PER_DAY - used(game, 'lesson'));

/**
 * A class at school: two a day. Manners (skill null) teaches discipline; the
 * others are worth a whole skill level. Children and teens go free; adults pay
 * for a night class.
 */
function lesson(game, skill) {
  const pet = game.pet;
  if (used(game, 'lesson') >= CLASSES_PER_DAY) return { ok: false, msg: 'Class is over for today.' };
  const adult = pet.stage === 'adult';
  if (adult && !spend(game, NIGHT_CLASS)) return { ok: false, msg: `A night class costs ${NIGHT_CLASS} points.` };
  use(game, 'lesson');
  if (!skill) {
    pet.whim = false;
    pet.discipline = Math.min(MAX_DISCIPLINE, pet.discipline + 1);
    if (!adult) gain(game, 10);
    return { ok: true, anim: 'happy', msg: `Learned good manners! Discipline ${pet.discipline}/${MAX_DISCIPLINE}.${adult ? '' : ' +10'}` };
  }
  if (skill === 'fit') pet.weight = Math.max(Math.round(BASE_WEIGHT[pet.stage] * 0.8), pet.weight - 1);
  const r = train(pet, skill, 3);
  const name = SKILL_LABEL[skill];
  return { ok: true, anim: 'happy', msg: r.level >= SKILL_MAX ? `${name} mastered! Level ${SKILL_MAX}.` : `Good class! ${name} is now level ${r.level}.` };
}

// ---------- jobs ----------
// Anyone grown can help out at the workshop. Better jobs ask for a skill level,
// and every third shift in the same job earns a promotion (up to MAX_RANK).

export const JOBS = [
  { id: 'helper',    name: 'Helper',       skill: null,       need: 0, pay: 60 },
  { id: 'tutor',     name: 'Tutor',        skill: 'smart',    need: 2, pay: 100 },
  { id: 'professor', name: 'Professor',    skill: 'smart',    need: 4, pay: 160 },
  { id: 'painter',   name: 'Sign Painter', skill: 'creative', need: 2, pay: 100 },
  { id: 'designer',  name: 'Designer',     skill: 'creative', need: 4, pay: 160 },
  { id: 'coach',     name: 'Swim Coach',   skill: 'fit',      need: 2, pay: 100 },
  { id: 'athlete',   name: 'Athlete',      skill: 'fit',      need: 4, pay: 160 },
  { id: 'host',      name: 'Cafe Host',    skill: 'charm',    need: 2, pay: 100 },
  { id: 'star',      name: 'Stage Star',   skill: 'charm',    need: 4, pay: 160 },
];
export const JOB = Object.fromEntries(JOBS.map(j => [j.id, j]));
export const SHIFT_REST = 4 * HOUR;
export const SHIFTS_PER_RANK = 3;
export const MAX_RANK = 3;
export const RANK_PAY = 20;

/** The pet's job (a helper until it's hired for something better). */
export const jobOf = (pet) => JOB[pet.job?.id] || JOB.helper;
export const jobRank = (pet) => Math.min(MAX_RANK, Math.floor((pet.job?.shifts || 0) / SHIFTS_PER_RANK));
export const jobPay = (pet) => jobOf(pet).pay + jobRank(pet) * RANK_PAY;

/** Apply for a job: an interview on the spot. Hired if the skill is there, turned down if not. */
export function applyJob(game, jobId) {
  const pet = game.pet, job = JOB[jobId];
  if (!job || !canAct(pet)) return { ok: false };
  if (pet.stage !== 'adult') return { ok: false, msg: 'Grown-ups only!' };
  if (jobOf(pet).id === jobId) return { ok: false, msg: "That's your job already!" };
  if (job.skill && skillLevel(pet, job.skill) < job.need) {
    return { ok: false, rejected: true, msg: `Not this time. A ${job.name} needs ${SKILL_LABEL[job.skill]} level ${job.need}.` };
  }
  pet.job = { id: jobId, shifts: 0 };
  return { ok: true, msg: `Hired! ${pet.name} is now a ${job.name}. ${job.pay} points a shift.` };
}

function workShift(game) {
  const t = townState(game), pet = game.pet;
  if (game.simTime - t.lastWork < SHIFT_REST) return { ok: false, msg: 'Rest a while before the next shift.' };
  t.lastWork = game.simTime;
  const job = jobOf(pet), pay = jobPay(pet), before = jobRank(pet);
  pet.job = { id: job.id, shifts: (pet.job?.shifts || 0) + 1 };
  pet.hunger = clamp4(pet.hunger - 1);
  pet.happy = clamp4(pet.happy - 1);
  gain(game, pay);
  if (job.skill) train(pet, job.skill, 1);
  const promoted = jobRank(pet) > before;
  return { ok: true, anim: 'happy', promoted, msg: promoted ? `Earned ${pay} points. Promoted! ${jobPay(pet)} a shift from now on.` : `Hard work! Earned ${pay} points.` };
}

function marryWhy(pet) {
  if (canMarry(pet)) return null;
  if (pet.stage !== 'adult') return 'Only adults can marry.';
  if (pet.sick) return 'Get better first!';
  return 'Not ready to marry yet.';
}

function play(game, msg) {
  const key = 'play';
  if (used(game, key) >= 3) return { ok: false, msg: 'Worn out from playing! Come back tomorrow.' };
  use(game, key);
  const pet = game.pet;
  pet.happy = clamp4(pet.happy + 1);
  pet.weight = Math.max(Math.round(BASE_WEIGHT[pet.stage] * 0.8), pet.weight - 1);
  train(pet, 'fit', 1);
  return { ok: true, anim: 'happy', msg };
}

function ride(game, price, happy, msg, anim = 'happy') {
  if (!spend(game, price)) return { ok: false, msg: 'Not enough points!' };
  game.pet.happy = clamp4(game.pet.happy + happy);
  return { ok: true, anim, msg };
}

function findMap(game, where) {
  const t = townState(game);
  t.mapPieces++;
  const done = t.mapPieces >= MAP_PIECES;
  return { ok: true, anim: 'happy', map: true, msg: done ? `Found the last map piece ${where}! A Hidden Village is on the map!` : `Found a torn map piece ${where}! (${t.mapPieces}/${MAP_PIECES})` };
}

/** Run an action at a place. */
export function doAction(game, locId, actionId, rng = defaultRng) {
  const a = ACTIONS[locId]?.find(x => x.id === actionId);
  if (!a || a.ui) return { ok: false };
  const why = cantGo(game, locId) || a.needs?.(game);
  if (why) return { ok: false, msg: why };
  return a.run(game, rng);
}

/** Why an action can't be used right now (for greying it out), or null. */
export function actionBlocked(game, locId, action) {
  return action.needs?.(game) || null;
}

// ---------- special actions ----------

/** The salon: dye the pet's hair (just this pet; dye isn't inherited). */
export function dyeHair(game, color) {
  if (!HAIR_DYES.includes(color)) return { ok: false };
  if (game.pet.phenotype.hairColor === color) return { ok: false, msg: 'That\'s already the colour!' };
  if (!spend(game, 80)) return { ok: false, msg: 'Not enough points!' };
  game.pet.phenotype.hairColor = color;
  return { ok: true, msg: `Fabulous! ${color[0].toUpperCase() + color.slice(1)} it is!` };
}

/** The department store sale: buy today's item at 30% off. */
export function buySale(game) {
  const [kind, id] = saleOfDay(game);
  const owned = kind === 'toy' ? game.toys : game.wardrobe;
  const item = kind === 'toy' ? TOYS[id] : CLOTHES[id];
  if (owned.includes(id)) return { ok: false, msg: 'You already have it!' };
  if (!spend(game, salePrice(item.price))) return { ok: false, msg: 'Not enough points!' };
  owned.push(id);
  return { ok: true, msg: `Bought the ${item.name} on sale!` };
}

/** The hidden village: a partner from a founder's family (pure founder genes). */
export function founderKin(game, founderName, rng = defaultRng) {
  const f = FOUNDERS.find(x => x.name === founderName);
  if (!f) return null;
  if (game.points < 100) return null;
  game.points -= 100;
  const genome = pureGenome(f.traits);
  return {
    name: `${f.name} Jr`,
    gender: game.pet.gender === 'm' ? 'f' : 'm',
    genome,
    phenotype: express(genome, rng),
    wear: {},
  };
}
