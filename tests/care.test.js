import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/engine/rng.js';
import {
  newGame, advance, needs, clean, bathe, toilet, train, skillLevel, finishGame, learnedLine, marry, findPartner, isDirty, isPottyTrained,
  MIN, HOUR, BASE_WEIGHT, MAX_DIRT, DIRTY_AT, TOILET_WARN, POTTY_TRAINED, SKILLS, SKILL_MAX, SKILL_STEP, MARRY_AFTER, MAX_DISCIPLINE,
} from '../src/game/pet.js';
import { migrate } from '../src/game/save.js';
import { alertFor, alertLine } from '../src/game/alerts.js';
import * as cheat from '../src/game/cheats.js';
import {
  JOBS, JOB, applyJob, jobOf, jobPay, jobRank, doAction, buyPass, talk, townState, districtLocked, classesLeft,
  SHIFT_REST, SHIFTS_PER_RANK, RANK_PAY, MAX_RANK, NIGHT_CLASS, CLASSES_PER_DAY, DISTRICTS,
} from '../src/game/town.js';
import { foundTotal, BOOK_SIZE } from '../src/game/book.js';

const NINE_AM = new Date(2026, 0, 5, 9, 0, 0).getTime();

/** A fed, happy pet at 9 AM. */
function pet(seed, stage = 'child') {
  const rng = makeRng(seed);
  const g = newGame(NINE_AM, rng);
  Object.assign(g.pet, { stage, stageMs: 0, hunger: 4, happy: 4, weight: BASE_WEIGHT[stage], discipline: MAX_DISCIPLINE });
  g.points = 5000;
  return { g, rng };
}
/** Let time pass with hunger and happiness topped up, so only the thing under test changes. */
function pass(g, ms, rng, each) {
  const events = [];
  for (let left = ms; left > 0; left -= MIN) {
    events.push(...advance(g, MIN, rng));
    Object.assign(g.pet, { hunger: 4, happy: 4, sick: null });
    each?.(g);
  }
  return events;
}

// ---------------------------------------------------------------- hygiene

test('a pet gets dirty over a day, calls for a bath when filthy, and a bath cleans it', () => {
  const { g, rng } = pet(1);
  assert.equal(bathe(g).ok, false, 'a clean pet stays out of the tub');
  const events = pass(g, 10 * HOUR, rng, (g) => { g.pet.poop = 0; });
  assert.ok(g.pet.dirt > 1 && g.pet.dirt < DIRTY_AT, `grubby after ten hours (${g.pet.dirt.toFixed(2)})`);
  assert.ok(!events.some(e => e.type === 'dirty'));
  g.pet.dirt = DIRTY_AT - 0.01;
  assert.ok(pass(g, 10 * MIN, rng).some(e => e.type === 'dirty'), 'says so once it turns dirty');
  assert.ok(isDirty(g.pet));
  assert.notEqual(needs(g.pet), 'dirty', 'dirty is not yet an attention call');
  g.pet.dirt = MAX_DIRT;
  assert.equal(needs(g.pet), 'dirty');
  g.pet.happy = 2;
  const r = bathe(g);
  assert.ok(r.ok);
  assert.equal(g.pet.dirt, 0);
  assert.equal(g.pet.happy, 3);
  assert.equal(needs(g.pet), null);
});

test('poop on the floor makes a pet dirty faster, and sleeping pets stay as they are', () => {
  const a = pet(2), b = pet(2);
  pass(a.g, 4 * HOUR, a.rng, (g) => { g.pet.poop = 0; });
  pass(b.g, 4 * HOUR, b.rng, (g) => { g.pet.poop = 3; });
  assert.ok(b.g.pet.dirt > a.g.pet.dirt * 2);
  const n = pet(3);
  n.g.simTime = new Date(2026, 0, 5, 23, 0, 0).getTime();
  n.g.pet.dirt = 1;
  advance(n.g, 3 * HOUR, n.rng);
  assert.ok(n.g.pet.asleep);
  assert.equal(n.g.pet.dirt, 1);
});

// ---------------------------------------------------------------- toilet

test('a pet squirms before it poops, and the toilet saves the mess', () => {
  const { g, rng } = pet(4);
  g.pet.poopIn = TOILET_WARN + 2 * MIN;
  assert.equal(toilet(g, rng).ok, false, "doesn't need to go yet");
  const events = pass(g, 3 * MIN, rng);
  assert.ok(events.some(e => e.type === 'squirm'));
  assert.ok(g.pet.squirm);
  const r = toilet(g, rng);
  assert.ok(r.ok);
  assert.equal(g.pet.potty, 1);
  assert.equal(g.pet.squirm, false);
  assert.equal(g.pet.poop, 0);
  assert.ok(g.pet.poopIn > TOILET_WARN, 'the clock starts again');
});

test('an ignored squirm ends in a mess', () => {
  const { g, rng } = pet(5);
  g.pet.poopIn = TOILET_WARN;
  const events = pass(g, TOILET_WARN + MIN, rng);
  assert.ok(events.some(e => e.type === 'squirm') && events.some(e => e.type === 'poop'));
  assert.equal(g.pet.poop, 1);
  assert.equal(g.pet.squirm, false);
  assert.equal(g.pet.potty, 0);
  assert.ok(clean(g).ok);
});

test('after enough catches a pet is toilet trained: it goes by itself and learns discipline', () => {
  const { g, rng } = pet(6);
  g.pet.discipline = 1;
  let last;
  for (let i = 0; i < POTTY_TRAINED; i++) {
    g.pet.poopIn = TOILET_WARN;
    pass(g, MIN, rng);
    last = toilet(g, rng);
  }
  assert.ok(last.trained);
  assert.ok(isPottyTrained(g.pet));
  assert.equal(g.pet.discipline, 2);
  const events = pass(g, 12 * HOUR, rng);
  assert.ok(events.filter(e => e.type === 'toilet').length >= 2, 'uses the toilet on its own');
  assert.ok(!events.some(e => e.type === 'poop' || e.type === 'squirm'));
  assert.equal(g.pet.poop, 0);
  assert.equal(toilet(g, rng).ok, false);
});

// ---------------------------------------------------------------- skills

test('skills level up every few points, up to a cap', () => {
  const { g } = pet(7);
  assert.deepEqual(Object.keys(g.pet.skills), SKILLS);
  assert.equal(train(g.pet, 'smart', SKILL_STEP - 1).up, false);
  const r = train(g.pet, 'smart', 1);
  assert.ok(r.up);
  assert.equal(skillLevel(g.pet, 'smart'), 1);
  train(g.pet, 'smart', 999);
  assert.equal(skillLevel(g.pet, 'smart'), SKILL_MAX);
  assert.equal(train(g.pet, 'juggling', 1), null);
});

test('a good minigame trains its skill, a poor one does not', () => {
  const { g } = pet(8);
  finishGame(g, { points: 10, good: false, skill: 'fit' });
  assert.equal(g.pet.skills.fit, 0);
  assert.equal(learnedLine(g), '');
  finishGame(g, { points: 10, good: true, skill: 'fit' });
  assert.equal(g.pet.skills.fit, 1);
  assert.equal(learnedLine(g), '+1 Sports');
  g.pet.skills.fit = SKILL_STEP - 1;
  finishGame(g, { points: 10, good: true, skill: 'fit' });
  assert.equal(learnedLine(g), 'Sports level 1!');
});

test('school has two classes a day; each is worth a level, and adults pay for night class', () => {
  const { g, rng } = pet(9, 'teen');
  buyPass(g, 'bus');
  assert.equal(classesLeft(g), CLASSES_PER_DAY);
  const p = g.points;
  assert.ok(doAction(g, 'school', 'reading', rng).ok);
  assert.equal(skillLevel(g.pet, 'smart'), 1);
  assert.ok(doAction(g, 'school', 'gym', rng).ok);
  assert.equal(skillLevel(g.pet, 'fit'), 1);
  assert.equal(g.points, p, 'free for the young');
  assert.equal(doAction(g, 'school', 'art', rng).ok, false, 'two a day');
  assert.equal(classesLeft(g), 0);
  g.simTime += 24 * HOUR;
  g.pet.stage = 'adult';
  assert.ok(doAction(g, 'school', 'art', rng).ok);
  assert.equal(g.points, p - NIGHT_CLASS);
  assert.equal(skillLevel(g.pet, 'creative'), 1);
});

test('chatting, swimming and performing are practice too', () => {
  const { g, rng } = pet(10, 'teen');
  for (const d of DISTRICTS) if (d.pass) buyPass(g, d.pass.id);
  talk(g, 'park', rng);
  talk(g, 'park', rng);
  assert.equal(g.pet.skills.charm, 1, 'one point for the first chat of the day');
  doAction(g, 'beach', 'swim', rng);
  doAction(g, 'playground', 'swing', rng);
  assert.equal(g.pet.skills.fit, 2);
  doAction(g, 'stage', 'perform', rng);
  assert.ok(g.pet.skills.charm >= 2);
});

test('a third of what a parent learned is passed down', () => {
  const { g, rng } = pet(11, 'adult');
  g.pet.adultMs = MARRY_AFTER;
  g.pet.skills = { smart: 15, creative: 7, fit: 2, charm: 0 };
  const egg = marry(g, findPartner(g, rng), rng);
  assert.deepEqual(egg.skills, { smart: 5, creative: 2, fit: 0, charm: 0 });
  assert.equal(egg.job, null);
});

// ---------------------------------------------------------------- jobs

test('better jobs ask for a skill level: applying without it is turned down', () => {
  const { g } = pet(12, 'adult');
  assert.equal(jobOf(g.pet).id, 'helper');
  const no = applyJob(g, 'tutor');
  assert.ok(!no.ok && no.rejected);
  assert.match(no.msg, /Smarts level 2/);
  train(g.pet, 'smart', 2 * SKILL_STEP);
  assert.ok(applyJob(g, 'tutor').ok);
  assert.equal(jobOf(g.pet).id, 'tutor');
  assert.equal(applyJob(g, 'tutor').ok, false, 'already yours');
  assert.equal(applyJob(g, 'professor').ok, false, 'needs level 4');
  g.pet.stage = 'teen';
  assert.match(applyJob(g, 'helper').msg, /Grown-ups/);
  for (const j of JOBS) assert.ok(j.skill === null || SKILLS.includes(j.skill), j.id);
});

test('shifts pay the job wage, train its skill, and every third one is a promotion', () => {
  const { g, rng } = pet(13, 'adult');
  buyPass(g, 'bus');
  train(g.pet, 'creative', 2 * SKILL_STEP);
  applyJob(g, 'painter');
  const xp = g.pet.skills.creative;
  let p = g.points, promos = 0;
  for (let i = 0; i < SHIFTS_PER_RANK * (MAX_RANK + 1); i++) {
    const pay = jobPay(g.pet);
    g.pet.hunger = 4; g.pet.happy = 4;
    const r = doAction(g, 'work', 'shift', rng);
    assert.ok(r.ok, r.msg);
    assert.equal(g.points, p + pay);
    p = g.points;
    if (r.promoted) promos++;
    g.simTime += SHIFT_REST;
  }
  assert.equal(promos, MAX_RANK);
  assert.equal(jobRank(g.pet), MAX_RANK);
  assert.equal(jobPay(g.pet), JOB.painter.pay + MAX_RANK * RANK_PAY);
  assert.ok(g.pet.skills.creative > xp);
  train(g.pet, 'fit', 2 * SKILL_STEP);
  applyJob(g, 'coach');
  assert.equal(jobRank(g.pet), 0, 'a new career starts at the bottom');
});

// ---------------------------------------------------------------- alerts

test('care alerts pick the most urgent event and name the pet', () => {
  const p = { name: 'Momo', species: 'Kitsu' };
  assert.equal(alertFor([], p), null);
  assert.equal(alertFor([{ type: 'wake' }, { type: 'whim' }], p), null, 'nothing worth an alert');
  assert.match(alertFor([{ type: 'poop' }], p).body, /Momo made a mess/);
  const a = alertFor([{ type: 'poop' }, { type: 'attention', reason: 'hungry' }, { type: 'grow', stage: 'teen' }], p);
  assert.match(a.body, /Momo is hungry/);
  assert.equal(a.tag, 'care');
  assert.match(alertFor([{ type: 'attention', reason: 'hungry' }, { type: 'critical' }], p).body, /very sick/);
  assert.match(alertFor([{ type: 'squirm' }, { type: 'dirty' }], p).body, /toilet/);
  assert.match(alertLine({ type: 'grow', stage: 'adult' }, p), /grew into a Kitsu/);
  assert.equal(alertLine({ type: 'attention', reason: 'whim' }, p), null);
});

test('the simulation raises the events alerts are built from', () => {
  const { g, rng } = pet(14);
  g.pet.hunger = 0.01;
  const events = advance(g, 30 * MIN, rng);
  assert.ok(events.some(e => e.type === 'attention' && e.reason === 'hungry'));
  assert.ok(alertFor(events, g.pet).body.includes(g.pet.name));
});

// ---------------------------------------------------------------- cheats

test('debug cheats: growing, needs, sickness, mess and time', () => {
  const rng = makeRng(15);
  const g = newGame(NINE_AM, rng);
  assert.ok(cheat.grow(g, rng).some(e => e.type === 'hatch'));
  assert.equal(g.pet.stage, 'baby');
  cheat.growTo(g, 'teen', rng);
  assert.equal(g.pet.stage, 'teen');
  cheat.emptyNeeds(g);
  assert.equal(needs(g.pet), 'hungry');
  cheat.fillNeeds(g);
  assert.equal(needs(g.pet), null);
  assert.ok(cheat.makeSick(g, 'cold', rng).some(e => e.type === 'sick'));
  assert.equal(g.pet.sick, 'cold');
  cheat.cure(g);
  assert.equal(g.pet.sick, null);
  cheat.addPoop(g); cheat.setDirt(g, MAX_DIRT);
  assert.equal(g.pet.poop, 1);
  assert.equal(needs(g.pet), 'dirty');
  assert.ok(cheat.squirm(g) && toilet(g, rng).ok);
  assert.ok(cheat.whim(g) && g.pet.whim);
  const t = g.simTime;
  cheat.skip(g, HOUR, rng);
  assert.equal(g.simTime, t + HOUR);
  cheat.fillNeeds(g); cheat.setDirt(g, 0); clean(g);
  cheat.skipToSleepChange(g, rng);
  assert.ok(g.pet.asleep, 'skipped to bedtime');
  cheat.cure(g); cheat.fillNeeds(g); clean(g); // a day without care takes its toll
  cheat.skipToSleepChange(g, rng);
  assert.ok(!g.pet.asleep && !g.pet.gone, 'and on to the morning');
});

test('debug cheats: training, founders, town and endings', () => {
  const rng = makeRng(16);
  const g = newGame(NINE_AM, rng);
  cheat.growTo(g, 'child', rng);
  assert.equal(cheat.cycleSkill(g, 'charm'), 1);
  cheat.maxSkills(g);
  assert.equal(cheat.cycleSkill(g, 'charm'), 0, 'wraps past the top');
  assert.equal(skillLevel(g.pet, 'smart'), SKILL_MAX);
  g.pet.discipline = MAX_DISCIPLINE;
  assert.equal(cheat.cycleDiscipline(g), 0);
  assert.equal(cheat.cyclePotty(g), 1);
  cheat.becomeFounder(g, 'Hoolet', rng);
  assert.equal(g.pet.stage, 'adult');
  assert.equal(g.pet.species, 'Hoolet');
  assert.equal(g.pet.phenotype.form, 'avian');
  cheat.readyToMarry(g, rng);
  assert.ok(g.pet.adultMs >= MARRY_AFTER);
  cheat.unlockTown(g);
  for (const d of DISTRICTS) assert.equal(districtLocked(g, d), null, d.id);
  cheat.befriendAll(g);
  assert.equal(townState(g).friends.park, 7);
  cheat.unlockItems(g);
  assert.ok(g.toys.includes('plushie') && g.wardrobe.includes('cape') && g.inventory.curry >= 5);
  const pts = g.points;
  cheat.fillBook(g);
  assert.equal(foundTotal(g), BOOK_SIZE);
  assert.equal(g.points, pts);
  assert.deepEqual(g.bookNews, []);
  assert.ok(cheat.endGame(g, 'runaway', rng).some(e => e.type === 'runaway'));
  assert.equal(g.pet.gone, 'ranaway');
  const g2 = newGame(NINE_AM, makeRng(17));
  cheat.growTo(g2, 'child', makeRng(17));
  assert.ok(cheat.endGame(g2, 'death', makeRng(18)).some(e => e.type === 'death'));
});

// ---------------------------------------------------------------- saves

test('saves from before baths, toilets and skills load with the new fields', () => {
  const g = newGame(NINE_AM, makeRng(19));
  for (const k of ['dirt', 'squirm', 'potty', 'skills', 'job']) delete g.pet[k];
  delete g.settings.alerts; delete g.settings.cheats;
  const back = migrate(JSON.parse(JSON.stringify(g)));
  assert.equal(back.pet.dirt, 0);
  assert.equal(back.pet.squirm, false);
  assert.equal(back.pet.potty, 0);
  assert.deepEqual(back.pet.skills, { smart: 0, creative: 0, fit: 0, charm: 0 });
  assert.equal(back.pet.job, null);
  assert.equal(back.settings.alerts, false);
  assert.equal(back.settings.cheats, false);
});

test('setting the clock moves the time without living through it', async () => {
  const cheat = await import('../src/game/cheats.js');
  const { newGame } = await import('../src/game/pet.js');
  const { townState } = await import('../src/game/town.js');
  const g = newGame(new Date(2026, 0, 5, 9, 30).getTime(), makeRng(4));
  const town = townState(g), age = g.simTime - town.epoch, hunger = g.pet.hunger, stageMs = g.pet.stageMs;
  cheat.setClock(g, 17, 30);
  const d = new Date(g.simTime);
  assert.deepEqual([d.getDate(), d.getHours(), d.getMinutes()], [5, 17, 30]);
  assert.equal(g.simTime - town.epoch, age, 'the town is no older');
  assert.equal(g.pet.hunger, hunger);
  assert.equal(g.pet.stageMs, stageMs);
  cheat.setClock(g, 6);
  assert.equal(new Date(g.simTime).getHours(), 6, 'backwards works too');
  const now = new Date(2026, 5, 1, 12, 0).getTime();
  cheat.phoneClock(g, now);
  assert.equal(g.simTime, now);
});
