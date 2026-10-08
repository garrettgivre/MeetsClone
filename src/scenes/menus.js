// Menus opened from the home screen icons.
import { ListMenu } from '../ui.js';
import { FOOD_ART, TOY_ART, ICONS } from '../art/icons.js';
import { FOODS, TOYS } from '../game/items.js';
import { buy, canMarry, MARRY_AFTER, HOUR } from '../game/pet.js';
import { setMuted } from '../engine/audio.js';
import { exportCode, importCode } from '../game/save.js';
import { StatusScene } from './status.js';
import { JumpRopeScene } from './jumprope.js';
import { MatchmakerScene, AlbumScene } from './family.js';

export function openMenu(app, name, home) {
  const menus = { status, food, games, items, shop, family, settings };
  menus[name]?.(app, home);
}

function status(app) { app.push(new StatusScene(app)); }

function food(app, home) {
  const g = app.game, pet = g.pet;
  const ids = Object.keys(FOODS).filter(id => {
    const f = FOODS[id];
    if (f.babyOnly) return pet.stage === 'baby';
    return f.free || g.inventory[id] > 0;
  });
  const meals = ids.filter(id => FOODS[id].kind === 'meal');
  const snacks = ids.filter(id => FOODS[id].kind === 'snack');
  const row = (id) => ({
    label: FOODS[id].name,
    right: FOODS[id].free ? 'FREE' : 'x' + g.inventory[id],
    icon: FOOD_ART[id],
    action: () => { app.home(); home.doFeed(id); },
  });
  app.push(new ListMenu(app, 'FOOD', [...meals.map(row), ...snacks.map(row)], {
    footer: 'MEAL = HUNGER  SNACK = HAPPY',
  }));
}

function games(app) {
  app.push(new ListMenu(app, 'GAMES', [
    { label: 'Jump Rope', right: '▶', icon: TOY_ART.yoyo, action: () => app.push(new JumpRopeScene(app)) },
    { label: 'More soon!', disabled: true, why: 'More games unlock later.' },
  ]));
}

function items(app, home) {
  const g = app.game;
  app.push(new ListMenu(app, 'TOYS', g.toys.map(id => ({
    label: TOYS[id].name, icon: TOY_ART[id],
    action: () => { app.home(); home.doPlay(id); },
  })), { footer: 'BUY MORE IN THE SHOP' }));
}

function shop(app) {
  const g = app.game;
  const foodList = () => {
    const m = new ListMenu(app, 'FOOD SHOP', Object.keys(FOODS).filter(id => !FOODS[id].free).map(id => ({
      label: FOODS[id].name, right: FOODS[id].price, icon: FOOD_ART[id],
      action: () => {
        const r = buy(g, 'food', id);
        if (r.ok) { app.sfx('coin'); app.toast(`Bought ${FOODS[id].name}! (x${g.inventory[id]})`, 1400); }
        else { app.sfx('nope'); app.toast(r.msg); }
      },
    })), { footer: () => `POINTS: ${g.points}` });
    app.push(m);
  };
  const toyList = () => {
    const m = new ListMenu(app, 'TOY SHOP', Object.keys(TOYS).map(id => ({
      label: TOYS[id].name, right: g.toys.includes(id) ? 'OWNED' : TOYS[id].price, icon: TOY_ART[id],
      action: (_, item) => {
        const r = buy(g, 'toy', id);
        if (r.ok) { app.sfx('coin'); item.right = 'OWNED'; app.toast(`Bought the ${TOYS[id].name}!`, 1400); }
        else { app.sfx('nope'); app.toast(r.msg); }
      },
    })), { footer: () => `POINTS: ${g.points}` });
    app.push(m);
  };
  app.push(new ListMenu(app, 'SHOP', [
    { label: 'Food', icon: ICONS.food, right: '▶', action: foodList },
    { label: 'Toys', icon: ICONS.items, right: '▶', action: toyList },
  ], { footer: () => `POINTS: ${g.points}` }));
}

function family(app) {
  const g = app.game, pet = g.pet;
  const ready = canMarry(pet);
  let why = '';
  if (!ready) {
    if (pet.stage !== 'adult') why = 'Only adults can marry.';
    else if (pet.sick) why = 'Get better first!';
    else why = `Ready in ${Math.ceil((MARRY_AFTER - pet.adultMs) / HOUR)} hours.`;
  }
  app.push(new ListMenu(app, 'FAMILY', [
    { label: 'Matchmaker', right: ready ? '♥' : '', disabled: !ready, why, icon: ICONS.family, action: () => app.push(new MatchmakerScene(app)) },
    { label: 'Family Album', right: g.album.length, icon: ICONS.status, action: () => app.push(new AlbumScene(app)) },
  ]));
}

function settings(app) {
  const g = app.game;
  const items = [
    { label: 'Sound', right: g.settings.sound ? 'ON' : 'OFF', action: (_, it) => {
      g.settings.sound = !g.settings.sound; setMuted(!g.settings.sound); it.right = g.settings.sound ? 'ON' : 'OFF'; app.sfx('select');
    } },
    { label: 'Pause pet', right: g.pet.paused ? 'ON' : 'OFF', action: (_, it) => {
      g.pet.paused = !g.pet.paused; it.right = g.pet.paused ? 'ON' : 'OFF';
      app.toast(g.pet.paused ? 'Time is paused for your pet.' : 'Unpaused!');
    } },
    { label: 'Rename pet', action: () => {
      const n = window.prompt('New name (up to 10 letters):', g.pet.name);
      if (n && n.trim()) { g.pet.name = n.trim().replace(/[^\w '-]/g, '').slice(0, 10) || g.pet.name; app.save(); app.toast(`Hello, ${g.pet.name}!`); }
    } },
    { label: 'Back up save', action: async () => {
      app.save();
      const code = exportCode(g);
      try { await navigator.clipboard.writeText(code); app.toast('Save code copied!'); }
      catch { window.prompt('Copy your save code:', code); }
    } },
    { label: 'Restore save', action: () => {
      const code = window.prompt('Paste a save code:');
      if (!code) return;
      const loaded = importCode(code);
      if (!loaded) { app.sfx('nope'); app.toast('That code did not work.'); return; }
      loaded.lastReal = Date.now();
      app.load(loaded);
      app.toast('Save restored!');
    } },
    { label: 'Start over', action: () => {
      if (window.confirm('Erase everything and start with a new egg?')) { app.reset(); app.toast('A new egg appeared!'); }
    } },
  ];
  if (app.dev) {
    items.push({ label: 'Dev speed', right: 'x' + (g.settings.speed || 1), action: (_, it) => {
      const speeds = [1, 60, 600, 3600];
      g.settings.speed = speeds[(speeds.indexOf(g.settings.speed || 1) + 1) % speeds.length];
      it.right = 'x' + g.settings.speed;
    } });
    items.push({ label: 'Dev +500 pts', action: () => { g.points += 500; app.toast('+500'); } });
  }
  app.push(new ListMenu(app, 'SETTINGS', items));
}
