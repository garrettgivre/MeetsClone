// Menus opened from the home screen icons.
import { ListMenu } from '../ui.js';
import { FOOD_ART, TOY_ART, ICONS } from '../art/icons.js';
import { FOODS, TOYS, CLOTHES, SLOTS, SLOT_LABEL } from '../game/items.js';
import { buy, canMarry, MARRY_AFTER, HOUR } from '../game/pet.js';
import { setMuted } from '../engine/audio.js';
import { exportCode, importCode } from '../game/save.js';
import { StatusScene } from './status.js';
import { JumpRopeScene } from './jumprope.js';
import { WhichWayScene, SnackCatchScene, CopyMeScene } from './minigames.js';
import { GeneBookScene } from './genebook.js';
import { TownScene } from './town.js';
import { foundTotal, BOOK_SIZE } from '../game/book.js';
import { MatchmakerScene, AlbumScene } from './family.js';
import { WardrobeScene, clothesIcon } from './wardrobe.js';
import { VERSION } from '../version.js';
import { debugMenu } from './debug.js';
import * as notify from '../notify.js';

export function openMenu(app, name, home) {
  const menus = { status, food, games, items, town, family, settings };
  menus[name]?.(app, home);
}

function status(app) { app.push(new StatusScene(app)); }

function town(app) { app.push(new TownScene(app)); }

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
    { label: 'Which Way?', right: '▶', icon: TOY_ART.ball, action: () => app.push(new WhichWayScene(app)) },
    { label: 'Snack Catch', right: '▶', icon: FOOD_ART.cookie, action: () => app.push(new SnackCatchScene(app)) },
    { label: 'Copy Me', right: '▶', icon: TOY_ART.drum, action: () => app.push(new CopyMeScene(app)) },
  ], { footer: 'GAMES BURN OFF WEIGHT' }));
}

function items(app, home) {
  const g = app.game;
  const toys = () => app.push(new ListMenu(app, 'TOYS', g.toys.map(id => ({
    label: TOYS[id].name, icon: TOY_ART[id],
    action: () => { app.home(); home.doPlay(id); },
  })), { footer: 'BUY MORE IN TOWN' }));
  app.push(new ListMenu(app, 'ITEMS', [
    { label: 'Toys', icon: TOY_ART.ball, right: g.toys.length, action: toys },
    { label: 'Wardrobe', icon: ICONS.items, right: g.wardrobe.length, action: () => app.push(new WardrobeScene(app)) },
  ]));
}

/**
 * A shop list: 'food' (everything on sale), 'snacks', 'toys' or 'clothes'.
 * Used by the town's shops.
 */
export function shopList(app, kind, title = null) {
  const g = app.game;
  const footer = () => `POINTS: ${g.points}`;
  if (kind === 'food' || kind === 'snacks') {
    const ids = Object.keys(FOODS).filter(id => !FOODS[id].free && (kind === 'food' || FOODS[id].kind === 'snack'));
    return new ListMenu(app, title || (kind === 'snacks' ? 'TREATS' : 'FOOD'), ids.map(id => ({
      label: FOODS[id].name, right: FOODS[id].price, icon: FOOD_ART[id],
      action: () => {
        const r = buy(g, 'food', id);
        if (r.ok) { app.sfx('coin'); app.toast(`Bought ${FOODS[id].name}! (x${g.inventory[id]})`, 1400); app.save(); }
        else { app.sfx('nope'); app.toast(r.msg); }
      },
    })), { footer });
  }
  if (kind === 'toys') {
    return new ListMenu(app, title || 'TOYS', Object.keys(TOYS).map(id => ({
      label: TOYS[id].name, right: g.toys.includes(id) ? 'OWNED' : TOYS[id].price, icon: TOY_ART[id],
      action: (_, item) => {
        const r = buy(g, 'toy', id);
        if (r.ok) { app.sfx('coin'); item.right = 'OWNED'; app.toast(`Bought the ${TOYS[id].name}!`, 1400); app.save(); }
        else { app.sfx('nope'); app.toast(r.msg); }
      },
    })), { footer });
  }
  const ids = Object.keys(CLOTHES).sort((a, b) => SLOTS.indexOf(CLOTHES[a].slot) - SLOTS.indexOf(CLOTHES[b].slot) || CLOTHES[a].price - CLOTHES[b].price);
  return new ListMenu(app, title || 'CLOTHES', ids.map(id => ({
    label: CLOTHES[id].name, ...clothesIcon(id),
    right: g.wardrobe.includes(id) ? 'OWNED' : CLOTHES[id].price,
    action: (_, item) => {
      const r = buy(g, 'clothes', id);
      if (r.ok) { app.sfx('coin'); item.right = 'OWNED'; app.toast(`Bought the ${CLOTHES[id].name}! Try it on in Items.`, 1800); app.save(); }
      else { app.sfx('nope'); app.toast(r.msg); }
    },
  })), { footer });
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
    { label: 'Gene Book', right: `${foundTotal(g)}/${BOOK_SIZE}`, icon: ICONS.status, action: () => app.push(new GeneBookScene(app)) },
  ]));
}

function settings(app) {
  const g = app.game;
  const items = [
    { label: 'Sound', right: g.settings.sound ? 'ON' : 'OFF', action: (_, it) => {
      g.settings.sound = !g.settings.sound; setMuted(!g.settings.sound); it.right = g.settings.sound ? 'ON' : 'OFF'; app.sfx('select');
    } },
    { label: 'Care alerts', right: g.settings.alerts ? 'ON' : 'OFF', action: async (_, it) => {
      if (g.settings.alerts) { g.settings.alerts = false; app.toast('Care alerts are off.'); } else {
        const p = await notify.enable();
        if (p === 'granted') {
          g.settings.alerts = true;
          app.toast(`Alerts on! Leave the game open in the background and ${g.pet.name} will call you.`, 4200);
        } else {
          app.sfx('nope');
          app.toast(p === 'unsupported' ? "This browser can't show alerts." : p === 'denied' ? 'Alerts are blocked. Allow them in your browser settings.' : 'Alerts were not allowed.', 3600);
        }
      }
      it.right = g.settings.alerts ? 'ON' : 'OFF';
      app.save();
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
  if (app.installState !== 'app') {
    items.push({ label: 'Install app', right: app.installState === 'ready' ? '▶' : '', action: async (_, it) => {
      const r = await app.install();
      if (r === 'accepted') app.toast('Installing...', 3000);
      else if (r === 'dismissed') app.toast('Not installed. Come back here to try again.', 3000);
      else { app.sfx('nope'); app.toast("The browser isn't offering an install right now. Reload the page and try again, or use its menu.", 4600); }
      it.right = app.installState === 'ready' ? '▶' : '';
    } });
  }
  items.push({ label: 'Debug', right: '▶', action: () => debugMenu(app) });
  items.push({ label: 'Version', right: VERSION, action: () => app.toast(`MeetsClone v${VERSION}`) });
  app.push(new ListMenu(app, 'SETTINGS', items));
}

