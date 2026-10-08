// Going out: the town map, the trip there, and each place you can visit.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, titleBar, text, ListMenu } from '../ui.js';
import { composePet, CANVAS, GROUND } from '../game/render.js';
import { backdrop, frontdrop, drawVehicle, FEET } from '../art/town.js';
import { HEART } from '../art/icons.js';
import { TOYS, CLOTHES } from '../game/items.js';
import { FOUNDERS } from '../game/genetics.js';
import {
  DISTRICTS, LOCATIONS, LOCATION, ACTIONS, MAP_PIECES, HAIR_DYES,
  townState, districtLocked, buyPass, cantGo, resident, talk, friendship, doAction,
  dishOfDay, saleOfDay, salePrice, buySale, dyeHair, founderKin,
} from '../game/town.js';
import { FOODS } from '../game/items.js';
import { shopList } from './menus.js';
import { JumpRopeScene } from './jumprope.js';
import { WhichWayScene, SnackCatchScene, CopyMeScene } from './minigames.js';
import { MatchmakerScene } from './family.js';

const FEET_Y = LAYOUT.room.y + FEET / 2; // where pets stand on screen

// ---------------------------------------------------------------- the map
export class TownScene extends ListMenu {
  constructor(app) {
    super(app, 'TOWN', [], { footer: () => `POINTS: ${app.game.points}` });
    this.build();
  }
  resume() { this.build(); }
  build() {
    const app = this.app, g = app.game, t = townState(g);
    const rows = [];
    for (const d of DISTRICTS) {
      const locked = districtLocked(g, d);
      if (d.secret && locked) {
        if (t.mapPieces > 0) rows.push({ label: `- ??? -`, right: `MAP ${t.mapPieces}/${MAP_PIECES}`, disabled: true, why: 'Find the rest of the old map...' });
        continue;
      }
      if (locked === 'pass') {
        rows.push({
          label: `- ${d.name} -`, right: `${d.pass.name.split(' ')[0].toUpperCase()} ${d.pass.price}`,
          action: () => {
            const r = buyPass(g, d.pass.id);
            app.sfx(r.ok ? 'coin' : 'nope');
            if (r.msg) app.toast(r.msg, 2400);
            if (r.ok) { app.save(); this.build(); }
          },
        });
        continue;
      }
      rows.push({ label: `- ${d.name} -`, disabled: true, why: d.travel === 'walk' ? 'A short walk away.' : `Your ${d.pass?.name || 'map'} takes you here.` });
      for (const loc of LOCATIONS.filter(l => l.district === d.id)) {
        const f = friendship(g, loc.id);
        rows.push({ label: '  ' + loc.name, right: f ? `♥${f}` : '', action: () => go(app, loc.id) });
      }
    }
    this.items = rows;
    this.sel = Math.min(this.sel, rows.length - 1);
    if (this.items[this.sel]?.disabled) this.sel = Math.max(0, rows.findIndex(r => !r.disabled));
    this.fixScroll();
  }
}

/** Head out to a place (by bus, train or balloon if it's out of town). */
function go(app, locId) {
  const why = cantGo(app.game, locId);
  if (why) { app.sfx('nope'); app.toast(why); return; }
  const travel = DISTRICTS.find(d => d.id === LOCATION[locId].district).travel;
  app.push(new TravelScene(app, locId, travel));
}

// ---------------------------------------------------------------- the trip
const TRIP_MS = 1800;

class TravelScene {
  constructor(app, locId, kind) { this.app = app; this.locId = locId; this.kind = kind; this.t = 0; }
  enter() { this.app.sfx(this.kind === 'walk' ? 'blip' : 'select'); }
  button(b) { if (b === 'B' || b === 'C') this.arrive(); }
  tap() { this.arrive(); return true; }
  update(dt) { this.t += dt; if (this.t >= TRIP_MS) this.arrive(); }
  arrive() {
    if (this.done) return;
    this.done = true;
    const app = this.app;
    app.pop();
    app.push(new PlaceScene(app, this.locId));
  }
  draw(scr) {
    const { y: ry, h: rh } = LAYOUT.room;
    const k = this.t / TRIP_MS;
    const pet = this.app.game.pet;
    const air = this.kind === 'balloon';
    scr.rect(0, ry, W, rh, C(air ? 'sky.2' : 'sky.3'));
    for (let i = 0; i < 4; i++) { const cx = ((i * 41 - this.t / 25) % (W + 40) + W + 40) % (W + 40) - 20; scr.rect(Math.round(cx), ry + 18 + i * 13, 16, 4, C('white')); }
    const ground = ry + 112;
    if (!air) {
      scr.rect(0, ground, W, rh - (ground - ry), C(this.kind === 'train' ? 'green.2' : 'slate.2'));
      if (this.kind === 'train') for (let x = -(Math.floor(this.t / 20) % 8); x < W; x += 8) scr.rect(x, ground + 2, 4, 2, C('brown.1'));
      else for (let x = -(Math.floor(this.t / 15) % 16); x < W; x += 16) scr.rect(x, ground + 10, 8, 1, C('white'));
    } else {
      for (let i = 0; i < 3; i++) scr.rect(0, ry + rh - 30 + i * 10, W, 10, C(['green.2', 'green.1', 'green.0'][i]));
    }
    const x = -40 + k * (W + 80);
    if (this.kind === 'walk') {
      const bm = composePet(pet.phenotype, pet.stage, { step: Math.floor(this.t / 200) % 2 ? 1 : 2, gender: pet.gender, wear: pet.wear, species: pet.species });
      scr.bitmap(bm, Math.round(x - CANVAS / 2), ground - GROUND, true);
    } else {
      drawVehicle(scr, this.kind, x, air ? ry + 100 + Math.sin(this.t / 300) * 3 : ground, this.t);
    }
    text(scr, `TO ${LOCATION[this.locId].name.toUpperCase()}...`, W / 2, ry + 6, COL.ink, { align: 'center' });
  }
}

// ---------------------------------------------------------------- a place
const BTN_H = 11, BTN_W = 61;

export class PlaceScene {
  constructor(app, locId) {
    this.app = app;
    this.loc = LOCATION[locId];
    this.res = resident(locId);
    this.sel = 0;
    this.anim = null;
    this.t = 0;
  }
  get game() { return this.app.game; }
  /** Talk first, then the place's own actions. */
  get buttons() {
    return [{ id: 'talk', label: 'Talk' }, ...ACTIONS[this.loc.id]];
  }
  rect(i) {
    const n = this.buttons.length, rows = Math.ceil(n / 2);
    const { y: ry, h: rh } = LAYOUT.room;
    const y0 = ry + rh - rows * BTN_H - 2;
    return { x: 3 + (i % 2) * (BTN_W + 1), y: y0 + Math.floor(i / 2) * BTN_H, w: BTN_W, h: BTN_H - 1 };
  }
  button(b, dir = 1) {
    const app = this.app;
    if (b === 'C') { app.sfx('back'); app.pop(); return; }
    if (this.anim) return;
    if (b === 'A') { this.sel = (this.sel + dir + this.buttons.length) % this.buttons.length; app.sfx('blip'); }
    if (b === 'B') this.activate(this.sel);
  }
  tap(x, y) {
    const { y: ry, h: rh } = LAYOUT.room;
    if (y < ry || y >= ry + rh) return false;
    if (y < ry + 12) { this.button('C'); return true; }
    for (let i = 0; i < this.buttons.length; i++) {
      const r = this.rect(i);
      if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h + 1) { this.sel = i; this.activate(i); return true; }
    }
    return false;
  }
  activate(i) {
    const app = this.app, g = this.game, a = this.buttons[i];
    if (this.anim) return;
    if (a.id === 'talk') {
      const r = talk(g, this.loc.id);
      app.sfx(r.gift ? 'coin' : 'blip');
      this.play('talk', r.gift ? 'happy' : null);
      app.toast(r.msg, 3200);
      app.save();
      return;
    }
    const blocked = a.needs?.(g);
    if (blocked) { app.sfx('nope'); app.toast(blocked); return; }
    if (a.ui) return this.openUi(a.ui);
    const r = doAction(g, this.loc.id, a.id);
    if (!r.ok) { app.sfx('nope'); if (r.msg) app.toast(r.msg); return; }
    app.sfx(r.anim === 'sad' ? 'sad' : r.anim === 'eat' ? 'eat' : 'happy');
    this.play(r.anim || 'happy');
    app.toast(r.msg, 3200);
    app.save();
  }
  play(type, resType = null) { this.anim = { type, resType, t: 0, dur: 1100 }; }
  openUi(ui) {
    const app = this.app, g = this.game;
    const [kind, arg] = ui.split(':');
    if (kind === 'shop') return app.push(shopList(app, arg, this.loc.name.toUpperCase()));
    if (kind === 'game') {
      const S = { jumprope: JumpRopeScene, whichway: WhichWayScene, catch: SnackCatchScene, copyme: CopyMeScene }[arg];
      return app.push(new S(app));
    }
    if (kind === 'sale') {
      const [k, id] = saleOfDay(g), item = k === 'toy' ? TOYS[id] : CLOTHES[id];
      const owned = (k === 'toy' ? g.toys : g.wardrobe).includes(id);
      return app.push(new ListMenu(app, 'DAILY SALE', [{
        label: item.name, right: owned ? 'OWNED' : `${salePrice(item.price)} (WAS ${item.price})`,
        action: (_, it) => { const r = buySale(g); app.sfx(r.ok ? 'coin' : 'nope'); app.toast(r.msg); if (r.ok) { it.right = 'OWNED'; app.save(); } },
      }], { footer: '30% OFF TODAY ONLY' }));
    }
    if (kind === 'dye') {
      if (!g.pet.phenotype.hair || g.pet.phenotype.hair === 'none') { app.sfx('nope'); app.toast('No hair to style, darling!'); return; }
      return app.push(new ListMenu(app, 'HAIR DYE', HAIR_DYES.map(c => ({
        label: c[0].toUpperCase() + c.slice(1), right: g.pet.phenotype.hairColor === c ? 'NOW' : 80,
        action: () => { const r = dyeHair(g, c); app.sfx(r.ok ? 'happy' : 'nope'); if (r.msg) app.toast(r.msg); if (r.ok) { app.save(); app.pop(); this.play('happy'); } },
      })), { footer: "DYE ISN'T PASSED ON" }));
    }
    if (kind === 'matchmaker') return app.push(new MatchmakerScene(app));
    if (kind === 'photos') return app.push(new PhotoScene(app));
    if (kind === 'founders') {
      return app.push(new ListMenu(app, 'FOUNDER KIN', FOUNDERS.map(f => ({
        label: `${f.name}'s family`, right: 100,
        action: () => {
          const partner = founderKin(g, f.name);
          if (!partner) { app.sfx('nope'); app.toast('Not enough points!'); return; }
          app.save();
          app.pop();
          app.push(new MatchmakerScene(app, partner));
        },
      })), { footer: 'PURE FOUNDER GENES' }));
    }
  }
  update(dt) {
    this.t += dt;
    if (this.anim && (this.anim.t += dt) >= this.anim.dur) this.anim = null;
  }
  draw(scr) {
    const g = this.game, pet = g.pet, a = this.anim, t = this.t;
    const { y: ry, h: rh } = LAYOUT.room;
    scr.bitmap(backdrop(this.loc.id), 0, ry);
    titleBar(scr, `◀ ${this.loc.name.toUpperCase()}`, ry);

    // the resident, facing your pet
    const resTalk = a?.type === 'talk';
    const resExpr = a?.resType === 'happy' || resTalk ? (Math.floor(t / 200) % 2 ? 'happy' : 'idle') : (t % 4000 < 150 ? 'blink' : 'idle');
    const rbm = composePet(this.res.phenotype, 'adult', { expr: resExpr, arms: resTalk ? 'wave' : 'down', gender: this.res.gender });
    scr.bitmap(rbm, 94 - CANVAS / 2, FEET_Y - GROUND);
    // your pet
    let expr = pet.sick ? 'sick' : t % 3600 < 140 ? 'blink' : 'idle', arms = 'down', dy = 0;
    if (a) {
      const k = a.t / a.dur;
      if (a.type === 'happy') { expr = 'happy'; arms = 'up'; dy = Math.round(Math.abs(Math.sin(k * Math.PI * 2)) * 6); }
      else if (a.type === 'eat') { expr = Math.floor(a.t / 250) % 2 ? 'chew' : 'eat'; arms = 'out'; }
      else if (a.type === 'sad') expr = 'sad';
      else if (a.type === 'dizzy') { expr = 'dizzy'; dy = Math.floor(a.t / 100) % 2; }
      else if (a.type === 'talk') { expr = 'happy'; }
    }
    const pbm = composePet(pet.phenotype, pet.stage, { expr, arms, gender: pet.gender, wear: pet.wear, species: pet.species, t });
    scr.bitmap(pbm, 38 - CANVAS / 2, FEET_Y - GROUND - dy, true);
    // bushes, trees and clouds that frame the scene sit in front of the pets
    const fr = frontdrop(this.loc.id);
    if (fr) scr.bitmap(fr, 0, ry);

    // the resident's name and your friendship
    const f = friendship(g, this.loc.id);
    const label = this.res.name.toUpperCase();
    const lw = label.length * 4 + (f ? 12 : 0) + 6;
    const lx = Math.min(W - lw - 2, Math.round(94 - lw / 2));
    scr.panel(lx, ry + 14, lw, 9, C('white'), COL.ink);
    text(scr, label, lx + 3, ry + 16, COL.ink);
    if (f) scr.draw(HEART, lx + lw - 11, ry + 15, {});
    // place info
    const info = placeInfo(g, this.loc.id);
    if (info) { scr.panel(3, ry + 25, info.length * 4 + 6, 9, C('white'), COL.ink); text(scr, info, 6, ry + 27, COL.accent); }

    // the buttons
    const sel = this.buttons[this.sel];
    const hint = sel?.price ? `COSTS ${sel.price}` : sel?.needs?.(g) || '';
    const r0 = this.rect(0);
    if (hint) { scr.rect(0, r0.y - 9, W, 9, COL.bar); text(scr, hint.toUpperCase(), W / 2, r0.y - 7, COL.ink, { align: 'center' }); }
    this.buttons.forEach((b, i) => {
      const r = this.rect(i), on = i === this.sel, off = !!b.needs?.(g);
      scr.panel(r.x, r.y, r.w, r.h, on ? COL.hi : C('white'), COL.ink);
      text(scr, b.label.toUpperCase(), r.x + r.w / 2, r.y + 3, off ? COL.silver : COL.ink, { align: 'center' });
    });
  }
}

/** A line of extra info for some places. */
function placeInfo(g, id) {
  const t = townState(g);
  if (id === 'cafe') return `TODAY: ${FOODS[dishOfDay(g)].name.toUpperCase()}`;
  if (id === 'beach') return `SHELLS ${t.shells}`;
  if (id === 'stage') return `FANS ${t.fans}`;
  if (id === 'forest' && t.mapPieces < MAP_PIECES && t.mapPieces > 0) return `MAP ${t.mapPieces}/${MAP_PIECES}`;
  if (id === 'starisle' && t.wish) return 'A WISH WAITS';
  return null;
}

// ---------------------------------------------------------------- photos
const BACKDROPS = [['sky.3', 'sky.2'], ['pink.3', 'pink.2'], ['gold.3', 'gold.2'], ['mint.3', 'mint.2']];

class PhotoScene {
  constructor(app) { this.app = app; this.i = Math.max(0, townState(app.game).photos.length - 1); }
  get photos() { return townState(this.app.game).photos; }
  button(b, dir = 1) {
    if (b === 'C') { this.app.sfx('back'); this.app.pop(); return; }
    if (!this.photos.length) return;
    this.i = (this.i + (b === 'A' ? dir : 1) + this.photos.length) % this.photos.length;
    this.app.sfx('blip');
  }
  tap(x, y) {
    const { y: ry, h: rh } = LAYOUT.room;
    if (y < ry || y >= ry + rh) return false;
    if (y < ry + 12) this.button('C'); else this.button(x < W / 2 ? 'A' : 'B', -1);
    return true;
  }
  update() {}
  draw(scr) {
    const { y: ry, h: rh } = LAYOUT.room;
    scr.rect(0, ry, W, rh, COL.panel);
    titleBar(scr, `◀ PHOTOS ${this.photos.length ? `${this.i + 1}/${this.photos.length}` : ''}`, ry);
    const p = this.photos[this.i];
    if (!p) { text(scr, 'No photos yet!', W / 2, ry + 70, COL.gray, { align: 'center' }); return; }
    const [c1, c2] = BACKDROPS[p.backdrop % BACKDROPS.length];
    scr.panel(14, ry + 18, 100, 92, C('white'), COL.ink);
    scr.rect(18, ry + 22, 92, 72, C(c1));
    for (let y = ry + 22; y < ry + 94; y += 6) scr.rect(18, y, 92, 2, C(c2));
    scr.setClip(18, ry + 22, 92, 72);
    scr.bitmap(composePet(p.phenotype, p.stage, { expr: 'happy', arms: 'wave', gender: p.gender, wear: p.wear, species: p.species }), W / 2 - CANVAS / 2, ry + 90 - GROUND);
    scr.noClip();
    const d = new Date(p.at);
    text(scr, `${p.name.toUpperCase()} ${p.gender === 'f' ? '♀' : '♂'}`, W / 2, ry + 98, COL.ink, { align: 'center' });
    text(scr, `${d.getMonth() + 1}/${d.getDate()}  GEN ${p.generation}  ${p.stage.toUpperCase()}`, W / 2, ry + 116, COL.gray, { align: 'center' });
    text(scr, '◀ A   B ▶', W / 2, ry + rh - 12, COL.shade, { align: 'center' });
  }
}
