// Settings > Debug: review pages and cheats for testing. Cheats are off until
// they're switched on here (or the address has ?dev). The logic is in
// src/game/cheats.js; this file is only the menus.
import { ListMenu } from '../ui.js';
import { VERSION } from '../version.js';
import { FOUNDERS } from '../game/genetics.js';
import { startOver, canAct, SKILLS, SKILL_LABEL, SKILL_MAX, skillLevel, MAX_DISCIPLINE, POTTY_TRAINED, MIN, HOUR } from '../game/pet.js';
import * as cheat from '../game/cheats.js';
import * as notify from '../notify.js';

const SPEEDS = [1, 60, 600, 3600];
const GRIME = [0, 2, 3, 4];

export function debugMenu(app) {
  const g = app.game;
  const locked = () => !app.dev;
  const why = 'Turn cheats on first.';
  const sub = (label, open) => ({ label, right: '▶', get disabled() { return locked(); }, why, action: () => open(app) });
  app.push(new ListMenu(app, 'DEBUG', [
    { label: 'Cheats', right: app.dev ? 'ON' : 'OFF', action: (_, it) => {
      if (app.devUrl) { app.toast('On because of ?dev in the address.'); return; }
      g.settings.cheats = !g.settings.cheats;
      if (!g.settings.cheats) g.settings.speed = 1;
      it.right = app.dev ? 'ON' : 'OFF';
      app.save();
    } },
    sub('Pet', petMenu),
    sub('Care', careMenu),
    sub('Training', trainingMenu),
    sub('Time', timeMenu),
    sub('Town and items', townMenu),
    { label: 'Alerts', right: '▶', action: () => alertMenu(app) },
    { label: 'Review pages', right: '▶', action: () => toolsMenu(app) },
  ], { footer: `VERSION ${VERSION}` }));
}

/** Show what a cheat did: play its events on the home screen, or just say so. */
function done(app, events, msg) {
  if (events?.length) {
    app.home();
    app.scenes[0].handleEvents(events);
  } else if (msg) app.toast(msg);
  app.save();
}

/** For cheats that need a hatched, living pet. */
function alive(app) {
  if (canAct(app.game.pet)) return true;
  app.sfx('nope');
  app.toast('Hatch the egg first.');
  return false;
}

function petMenu(app) {
  const g = app.game;
  const become = () => app.push(new ListMenu(app, 'BECOME', [
    ...FOUNDERS.map(f => ({ label: f.name, right: f.line.toUpperCase(), action: () => { const ev = cheat.becomeFounder(g, f.name); app.home(); done(app, ev, `Now a ${f.name}!`); } })),
    { label: 'Wild pet', right: 'RANDOM', action: () => { cheat.becomeWild(g); app.home(); done(app, null, 'New genes!'); } },
  ], { footer: 'FOUNDERS ARE FULLY GROWN' }));
  app.push(new ListMenu(app, 'DEBUG: PET', [
    { label: 'Grow a stage', action: () => done(app, cheat.grow(g), 'Fully grown already.') },
    { label: 'Almost grown', right: '1 MIN', action: () => { cheat.almostGrown(g); done(app, null, 'One minute to go.'); } },
    { label: 'Ready to marry', action: () => done(app, cheat.readyToMarry(g), 'Ready to marry!') },
    { label: 'Become...', right: '▶', action: become },
    { label: 'Swap gender', right: g.pet.gender === 'f' ? '♀' : '♂', action: (_, it) => { g.pet.gender = g.pet.gender === 'f' ? 'm' : 'f'; it.right = g.pet.gender === 'f' ? '♀' : '♂'; app.save(); } },
    { label: 'Next generation', right: `G${g.pet.generation}`, action: (_, it) => { g.pet.generation++; g.generation = g.pet.generation; it.right = `G${g.pet.generation}`; app.save(); } },
    { label: 'New egg', action: () => { startOver(g); app.home(); done(app, null, 'A new egg appeared!'); } },
    { label: 'Ending: passed away', action: () => { if (alive(app)) done(app, cheat.endGame(g, 'death')); } },
    { label: 'Ending: ran away', action: () => { if (alive(app)) done(app, cheat.endGame(g, 'runaway')); } },
  ]));
}

function careMenu(app) {
  const g = app.game;
  const act = (fn, msg) => () => { if (!alive(app)) return; const ev = fn(); done(app, Array.isArray(ev) ? ev : null, msg); };
  app.push(new ListMenu(app, 'DEBUG: CARE', [
    { label: 'Fill hearts', action: act(() => cheat.fillNeeds(g), 'Full and happy.') },
    { label: 'Empty hearts', action: act(() => cheat.emptyNeeds(g), 'Hungry and sad.') },
    { label: 'Catch a cold', action: act(() => cheat.makeSick(g, 'cold'), 'Already sick.') },
    { label: 'Toothache', action: act(() => cheat.makeSick(g, 'toothache'), 'Already sick.') },
    { label: 'Cure', action: act(() => cheat.cure(g), 'All better.') },
    { label: 'Add a poop', right: `x${g.pet.poop || 0}`, action: (_, it) => { if (!alive(app)) return; cheat.addPoop(g); it.right = `x${g.pet.poop}`; app.save(); } },
    { label: 'Dirt', right: Math.floor(g.pet.dirt || 0) + '/4', action: (_, it) => {
      if (!alive(app)) return;
      const next = GRIME.find(v => v > Math.floor(g.pet.dirt || 0)) || 0;
      cheat.setDirt(g, next);
      it.right = next + '/4';
      app.save();
    } },
    { label: 'Needs the toilet', action: () => { if (!alive(app)) return; const ok = cheat.squirm(g); if (ok) app.home(); done(app, null, ok ? 'Squirming! Tap your pet.' : "It's asleep."); } },
    { label: 'Start a whim', action: () => { if (!alive(app)) return; const ok = cheat.whim(g); if (ok) app.home(); done(app, null, ok ? 'Fussing! Tap your pet.' : "It's asleep."); } },
    { label: 'Weight +5', right: `${g.pet.weight}G`, action: (_, it) => { if (!alive(app)) return; cheat.addWeight(g, 5); it.right = `${g.pet.weight}G`; app.save(); } },
    { label: 'Weight -5', action: () => { if (!alive(app)) return; cheat.addWeight(g, -5); done(app, null, `${g.pet.weight}g`); } },
    { label: 'Clear care misses', right: g.pet.careMistakes || 0, action: (_, it) => { g.pet.careMistakes = 0; it.right = 0; app.save(); } },
  ]));
}

function trainingMenu(app) {
  const g = app.game, pet = g.pet;
  const rows = [
    { label: 'Discipline', right: `${pet.discipline || 0}/${MAX_DISCIPLINE}`, action: (_, it) => { it.right = `${cheat.cycleDiscipline(g)}/${MAX_DISCIPLINE}`; app.save(); } },
    { label: 'Toilet training', right: `${pet.potty || 0}/${POTTY_TRAINED}`, action: (_, it) => { it.right = `${cheat.cyclePotty(g)}/${POTTY_TRAINED}`; app.save(); } },
    ...SKILLS.map(s => ({
      label: SKILL_LABEL[s], right: `${skillLevel(pet, s)}/${SKILL_MAX}`,
      action: (_, it) => { it.right = `${cheat.cycleSkill(g, s)}/${SKILL_MAX}`; app.save(); },
    })),
    { label: 'Max every skill', action: () => { cheat.maxSkills(g); SKILLS.forEach((s, i) => { rows[2 + i].right = `${SKILL_MAX}/${SKILL_MAX}`; }); app.save(); } },
    { label: 'Quit job', right: pet.job ? pet.job.id.toUpperCase() : 'NONE', action: (_, it) => { pet.job = null; it.right = 'NONE'; app.save(); } },
  ];
  app.push(new ListMenu(app, 'DEBUG: TRAINING', rows, { footer: 'B STEPS A VALUE UP' }));
}

function timeMenu(app) {
  const g = app.game;
  const jump = (label, ms) => ({ label, action: () => done(app, cheat.skip(g, ms), `Skipped ${label.slice(1)}.`) });
  app.push(new ListMenu(app, 'DEBUG: TIME', [
    { label: 'Time speed', right: 'x' + (g.settings.speed || 1), action: (_, it) => {
      g.settings.speed = SPEEDS[(SPEEDS.indexOf(g.settings.speed || 1) + 1) % SPEEDS.length];
      it.right = 'x' + g.settings.speed;
      app.save();
    } },
    jump('+10 minutes', 10 * MIN),
    jump('+1 hour', HOUR),
    jump('+8 hours', 8 * HOUR),
    jump('+1 day', 24 * HOUR),
    { label: 'To bedtime / morning', action: () => done(app, cheat.skipToSleepChange(g), 'Hatch the egg first.') },
  ], { footer: () => clock(g.simTime) }));
}

/** "MON 9:05AM", in letters the pixel font has. */
function clock(t) {
  const d = new Date(t), h = d.getHours();
  return `${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()]} ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}${h < 12 ? 'AM' : 'PM'}`;
}

function townMenu(app) {
  const g = app.game;
  const say = (fn, msg) => () => { fn(); done(app, null, msg); };
  app.push(new ListMenu(app, 'DEBUG: TOWN', [
    { label: '+500 points', action: say(() => { g.points += 500; }, '+500') },
    { label: '+5000 points', action: say(() => { g.points += 5000; }, '+5000') },
    { label: 'Open every district', action: say(() => cheat.unlockTown(g), 'Passes and the old map are yours.') },
    { label: 'Age the town 1 day', action: say(() => cheat.ageTown(g, 24 * HOUR), 'A day passes in town.') },
    { label: 'Age the town 3 days', action: say(() => cheat.ageTown(g, 72 * HOUR), 'Three days pass in town.') },
    { label: 'Befriend everyone', action: say(() => cheat.befriendAll(g), 'Seven hearts all round.') },
    { label: 'New day in town', action: say(() => cheat.resetDaily(g), 'Daily limits reset.') },
    { label: 'Every toy and outfit', action: say(() => cheat.unlockItems(g), 'Toy box, wardrobe and fridge filled.') },
    { label: 'All furniture', action: say(() => cheat.unlockDecor(g), 'Every room set is yours. Put it out in Items > Decorate.') },
    { label: 'Fill the Gene Book', action: say(() => cheat.fillBook(g), 'Every part found.') },
  ], { footer: () => `POINTS: ${g.points}` }));
}

function alertMenu(app) {
  const g = app.game;
  const state = () => ({ granted: 'ALLOWED', denied: 'BLOCKED', default: 'NOT ASKED', unsupported: 'NO SUPPORT' })[notify.permission()];
  const test = (delay) => async () => {
    const p = await notify.enable();
    if (p !== 'granted') { app.sfx('nope'); app.toast(p === 'unsupported' ? "This browser can't show alerts." : 'Alerts are not allowed in this browser.', 3000); return; }
    const send = () => notify.show({ title: 'MeetsClone', body: `${g.pet?.name || 'Your pet'} is hungry! (test)`, tag: 'care' });
    if (delay) { app.toast(`Alert in ${delay} seconds. Switch tabs now!`, 3000); setTimeout(send, delay * 1000); } else send();
  };
  app.push(new ListMenu(app, 'DEBUG: ALERTS', [
    { label: 'Permission', right: state(), action: (_, it) => { it.right = state(); app.toast('Turn alerts on or off in Settings.'); } },
    { label: 'Care alerts', right: g.settings.alerts ? 'ON' : 'OFF', disabled: true, why: 'Change this in Settings.' },
    { label: 'Test alert now', action: test(0) },
    { label: 'Test alert in 10 s', action: test(10) },
  ], { footer: 'ALERTS SHOW WHEN THE TAB IS HIDDEN' }));
}

function toolsMenu(app) {
  const open = (path) => () => window.open(path, '_blank');
  app.push(new ListMenu(app, 'REVIEW PAGES', [
    { label: 'Pairing Lab', right: '▶', action: open('tools/lab.html') },
    { label: 'Character Gallery', right: '▶', action: open('tools/gallery.html') },
    { label: 'Founders', right: '▶', action: open('tools/founders.html?grid') },
    { label: 'Every part', right: '▶', action: open('tools/parts.html') },
    { label: 'Art compare', right: '▶', action: open('tools/compare.html') },
    { label: 'Town backdrops', right: '▶', action: open('tools/town.html') },
    { label: 'Town props', right: '▶', action: open('tools/props.html') },
    { label: 'Sprite Editor', right: '▶', action: open('tools/sprite-editor/') },
  ]));
}
