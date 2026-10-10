// Menus opened from the home screen icons.
import { ListMenu } from '../ui.js';
import { FOOD_ART, TOY_ART, ICONS } from '../art/icons.js';
import { FOODS, TOYS, CLOTHES, SLOTS, SLOT_LABEL } from '../game/items.js';
import { buy, canMarry, MARRY_AFTER, HOUR } from '../game/pet.js';
import { setMuted } from '../engine/audio.js';
import { filterMode } from '../engine/screen.js';
import { exportCode, importCode } from '../game/save.js';
import { StatusScene } from './status.js';
import { JumpRopeScene } from './jumprope.js';
import { WhichWayScene, SnackCatchScene, CopyMeScene } from './minigames.js';
import { GeneBookScene } from './genebook.js';
import { TownScene } from './town.js';
import { foundTotal, BOOK_SIZE } from '../game/book.js';
import { MatchmakerScene, AlbumScene } from './family.js';
import { WardrobeScene, clothesIcon } from './wardrobe.js';
import { DecorateScene } from './decorate.js';
import { DECOR, SETS, ROOMS, owns, setOffer, buySet, buyDecor } from '../game/decor.js';
import { VERSION } from '../version.js';
import { CROPS, gardenOf, stageOf, wateredToday, plant, water, harvest } from '../game/garden.js';
import { INGREDIENTS, STAPLES, RECIPES, FLOP, pantryOf, knows, canCook, buyStaple } from '../game/cooking.js';
import { todaysWishes, wishText, WISH_POINTS, WISH_BONUS } from '../game/wishes.js';
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
  const cookRow = pet.stage === 'baby' ? [] : [{ label: 'Cook...', right: '▶', icon: FOOD_ART.gardenomelette, action: () => cookMenu(app, home) }];
  app.push(new ListMenu(app, 'FOOD', [...cookRow, ...meals.map(row), ...snacks.map(row)], {
    footer: 'MEAL = HUNGER  SNACK = HAPPY',
  }));
}

/** Cooking: the recipes found so far, and trying two ingredients together to find another. */
function cookMenu(app, home) {
  const g = app.game, pantry = pantryOf(g);
  const stocked = () => Object.keys(INGREDIENTS).filter(id => pantry[id] > 0);
  const go = (a, b) => { app.home(); home.doCook(a, b); };
  const pick = (first = null) => {
    const ids = stocked().filter(id => id !== first || pantry[id] > 1);
    if (!ids.length) { app.sfx('nope'); app.toast(first ? 'Nothing else to put with it!' : 'The pantry is bare. The garden grows things, and the food shops sell flour, cream and eggs.', 3200); return; }
    app.push(new ListMenu(app, first ? `${INGREDIENTS[first].name.toUpperCase()} AND...` : 'FIRST, SOME...', ids.map(id => ({
      label: INGREDIENTS[id].name, right: 'x' + pantry[id], action: () => (first ? go(first, id) : pick(id)),
    })), { footer: 'TWO THINGS MAKE A DISH' }));
  };
  const known = Object.keys(RECIPES).filter(d => knows(g, d));
  app.push(new ListMenu(app, 'COOK', [
    ...known.map(d => ({
      label: FOODS[d].name, icon: FOOD_ART[d],
      right: canCook(g, d) ? 'COOK' : 'NO ' + INGREDIENTS[RECIPES[d].find(id => !(pantry[id] > 0))].name.toUpperCase(), // (the first thing missing; a tap says all it needs)
      action: () => { if (canCook(g, d)) go(...RECIPES[d]); else { app.sfx('nope'); app.toast(`${FOODS[d].name}: ${RECIPES[d].map(id => INGREDIENTS[id].name.toLowerCase()).join(' and ')}.`, 2400); } },
    })),
    { label: 'Try a new mix', right: '▶', action: () => pick() },
  ], { footer: () => `${known.length}/${Object.keys(RECIPES).length} RECIPES FOUND` }));
}

/** The vegetable bed: plant, water and pick. (The home screen opens this out in the garden.) */
export function gardenMenu(app) {
  const g = app.game, garden = gardenOf(g);
  const again = () => { app.pop(); gardenMenu(app); app.save(); };
  const seeds = (i) => app.push(new ListMenu(app, 'SEEDS', Object.keys(CROPS).map(id => ({
    label: CROPS[id].name, right: CROPS[id].seed,
    action: () => {
      const r = plant(g, i, id);
      if (!r.ok) { app.sfx('nope'); app.toast(r.msg); return; }
      app.sfx('coin'); app.pop(); app.toast(`Planted a ${CROPS[id].name.toLowerCase()} seed. Water it each day!`, 2400); again();
    },
  })), { footer: () => `POINTS: ${g.points}` }));
  const rows = garden.plots.map((p, i) => {
    if (!p) return { label: `Plot ${i + 1}: empty`, right: 'PLANT', action: () => seeds(i) };
    const c = CROPS[p.crop];
    if (stageOf(p) === 'ripe') {
      return { label: `${c.name}: ripe!`, right: 'PICK', action: () => {
        const r = harvest(g, i);
        if (!r.ok) { app.sfx('nope'); app.toast(r.msg); return; }
        app.sfx('happy'); app.toast(`Picked ${r.count} for the pantry: ${c.name.toLowerCase()}!`, 2400); again();
      } };
    }
    return { label: `${c.name}  ${p.growth}/${c.days}`, right: wateredToday(g, p) ? 'WATERED' : 'WATER', action: () => {
      const r = water(g, i);
      if (!r.ok) { app.sfx('nope'); app.toast(r.msg); return; }
      app.sfx('clean'); app.toast(r.ripe ? `The ${c.name.toLowerCase()} is ripe!` : 'Watered!', 1800); again();
    } };
  });
  rows.push({ label: 'Water everything', right: '▶', action: () => {
    const r = water(g);
    if (!r.ok) { app.sfx('nope'); app.toast(r.msg); return; }
    app.sfx('clean'); app.toast(r.ripe ? 'Watered. Something is ripe!' : 'Watered!', 1800); again();
  } });
  app.push(new ListMenu(app, 'VEGETABLE BED', rows, { footer: 'WATER ONCE A DAY TO GROW' }));
}

/** Today's wishes. */
function wishMenu(app) {
  const w = todaysWishes(app.game);
  if (!w) { app.sfx('nope'); app.toast('Too little to wish for much yet.'); return; }
  app.push(new ListMenu(app, 'WISHES FOR TODAY', w.list.map(x => ({
    label: wishText(x), right: x.done ? 'DONE' : `+${WISH_POINTS}`,
    action: () => app.toast(x.done ? 'That one came true!' : 'Make it come true today.', 1600),
  })), { footer: `ALL OF THEM: +${WISH_BONUS} MORE` }));
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
  const wishes = todaysWishes(g);
  app.push(new ListMenu(app, 'ITEMS', [
    ...(wishes ? [{ label: 'Wishes', icon: ICONS.status, right: `${wishes.list.filter(x => x.done).length}/${wishes.list.length}`, action: () => wishMenu(app) }] : []),
    { label: 'Vegetable bed', icon: FOOD_ART.fruitbowl, right: '▶', action: () => { app.home(); home.goRoom('garden', () => gardenMenu(app)); } },
    { label: 'Toys', icon: TOY_ART.ball, right: g.toys.length, action: toys },
    { label: 'Wardrobe', icon: ICONS.items, right: g.wardrobe.length, action: () => app.push(new WardrobeScene(app)) },
    { label: 'Decorate', icon: ICONS.lights, right: '▶', action: () => { app.home(); app.push(new DecorateScene(app)); } },
  ]));
}

/** The room sets on sale: a list of sets, each opening onto its pieces. */
function decorShop(app) {
  const g = app.game;
  const footer = () => `POINTS: ${g.points}`;
  const count = (set) => Object.values(DECOR).filter(it => it.set === set && owns(g, it.id)).length;
  const size = (set) => Object.values(DECOR).filter(it => it.set === set).length;
  const tally = (set) => (count(set) === size(set) ? 'OWNED' : `${count(set)}/${size(set)}`);
  const openSet = (set, row) => {
    const pieces = Object.values(DECOR).filter(it => it.set === set);
    const rows = [{
      label: 'Whole set', get right() { const o = setOffer(g, set); return o.left.length ? o.price : 'OWNED'; },
      action: () => {
        const r = buySet(g, set);
        if (r.ok) { app.sfx('coin'); app.toast(`The ${SETS[set].name} set is yours! Put it out in Items > Decorate.`, 2800); app.save(); }
        else { app.sfx('nope'); app.toast(r.msg); }
      },
    }, ...pieces.map(it => ({
      label: Object.keys(SETS[set].pieces).length > 1 ? `${it.name} (${ROOMS[it.room].name})` : it.name, get right() { return owns(g, it.id) ? 'OWNED' : it.price; },
      action: () => {
        const r = buyDecor(g, it.id);
        if (r.ok) { app.sfx('coin'); app.toast(`Bought the ${it.name}! Put it out in Items > Decorate.`, 2400); app.save(); }
        else { app.sfx('nope'); app.toast(r.msg); }
      },
    }))];
    const menu = new ListMenu(app, SETS[set].name.toUpperCase(), rows, { footer, onBack: () => { row.right = tally(set); app.pop(); } });
    app.push(menu);
  };
  return new ListMenu(app, 'FOR THE ROOM', Object.keys(SETS).filter(s => !SETS[s].starter).map(set => ({
    label: SETS[set].name, right: tally(set), action: (_, row) => openSet(set, row),
  })), { footer });
}

/**
 * A shop list: 'food' (everything on sale), 'snacks', 'toys' or 'clothes'.
 * Used by the town's shops.
 */
export function shopList(app, kind, title = null) {
  const g = app.game;
  const footer = () => `POINTS: ${g.points}`;
  if (kind === 'decor') return decorShop(app);
  if (kind === 'food' || kind === 'snacks') {
    const ids = Object.keys(FOODS).filter(id => !FOODS[id].free && !FOODS[id].cooked && (kind === 'food' || FOODS[id].kind === 'snack'));
    return new ListMenu(app, title || (kind === 'snacks' ? 'TREATS' : 'FOOD'), ids.map(id => ({
      label: FOODS[id].name, right: FOODS[id].price, icon: FOOD_ART[id],
      action: () => {
        const r = buy(g, 'food', id);
        if (r.ok) { app.sfx('coin'); app.toast(`Bought ${FOODS[id].name}! (x${g.inventory[id]})`, 1400); app.save(); }
        else { app.sfx('nope'); app.toast(r.msg); }
      },
    })).concat(kind !== 'food' ? [] : Object.keys(STAPLES).map(id => ({
      // for the pantry: things to cook with
      label: `${STAPLES[id].name} (to cook)`, right: STAPLES[id].price,
      action: () => {
        const r = buyStaple(g, id);
        if (r.ok) { app.sfx('coin'); app.toast(`${STAPLES[id].name} for the pantry! (x${pantryOf(g)[id]})`, 1400); app.save(); }
        else { app.sfx('nope'); app.toast(r.msg); }
      },
    }))), { footer });
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

// The screen filter's styles: what Settings calls each, and what it says when picked.
const FILTERS = {
  color: ['LCD', 'Colour LCD: a lit panel with a pixel grid, and a trail behind what moves.'],
  soft: ['SOFT', 'Soft: gentler pixel edges and a faint shadow.'],
  false: ['OFF', 'Filter off: plain sharp pixels.'],
};

function settings(app) {
  const g = app.game;
  const items = [
    { label: 'Sound', right: g.settings.sound ? 'ON' : 'OFF', action: (_, it) => {
      g.settings.sound = !g.settings.sound; setMuted(!g.settings.sound); it.right = g.settings.sound ? 'ON' : 'OFF'; app.sfx('select');
    } },
    { label: 'Screen filter', right: FILTERS[filterMode(g.settings.lcd)][0], action: (_, it) => {
      // the colour LCD, then the older soft look, then off
      const now = filterMode(g.settings.lcd);
      g.settings.lcd = now === 'color' ? 'soft' : now === 'soft' ? false : 'color';
      app.setFilter(g.settings.lcd);
      it.right = FILTERS[filterMode(g.settings.lcd)][0];
      app.toast(FILTERS[filterMode(g.settings.lcd)][1], 2600);
      app.save();
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

