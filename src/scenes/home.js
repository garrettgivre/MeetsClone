// The main screen: status bar, two rows of menu icons, the room with the pet.
import { C } from '../engine/palette.js';
import { text } from '../engine/font.js';
import { W } from '../engine/screen.js';
import { ICONS, COIN, POOP, SKULL, ZZZ, ATTN, SPARKLE, HEART, SYRINGE, BROOM_WAVE, MOON, SUN, STINK, FOOD_ART, TOY_ART, NOTE } from '../art/icons.js';
import { composePet, composeEgg, composeGhost, CANVAS, GROUND } from '../game/render.js';
import { LAYOUT, ROOM_FLOOR, COL, dialog } from '../ui.js';
import { needs, canAct, STAGE_LENGTH, feed, play, clean, medicine, toggleLights, pat } from '../game/pet.js';
import { FOODS } from '../game/items.js';
import { openMenu } from './menus.js';
import { EndingScene } from './ending.js';

const TOP = ['status', 'food', 'clean', 'medicine', 'lights'];
const BOTTOM = ['games', 'items', 'shop', 'family', 'settings'];
const ALL = [...TOP, ...BOTTOM];
const LABEL = {
  status: 'STATUS', food: 'FOOD', clean: 'CLEAN UP', medicine: 'MEDICINE', lights: 'LIGHTS',
  games: 'GAMES', items: 'TOYS', shop: 'SHOP', family: 'FAMILY', settings: 'SETTINGS',
};
const STAGE_NAME = { egg: 'EGG', baby: 'BABY', child: 'CHILD', teen: 'TEEN', adult: 'ADULT' };
const POOP_X = [104, 116, 92, 80];
const CELL = W / 5;

export class HomeScene {
  constructor(app) {
    this.app = app;
    this.cursor = -1;
    this.petX = 52;
    this.targetX = 52;
    this.facing = 1;
    this.moveIn = 1500;
    this.blink = 0;
    this.anim = null;
    this.fx = [];
  }

  get game() { return this.app.game; }
  get pet() { return this.app.game.pet; }

  // ---------- events from the simulation ----------
  handleEvents(events, away = false) {
    const app = this.app, pet = this.pet;
    const name = pet?.name || '';
    for (const e of events) {
      switch (e.type) {
        case 'hatch':
          if (away) app.toast(`${name} hatched!`);
          else this.play({ type: 'hatch', dur: 1800, done: () => { app.sfx('hatch'); app.toast(`${name} hatched!`); } });
          break;
        case 'grow': {
          const msg = e.stage === 'adult' && pet.species ? `${name} grew into a ${pet.species}!` : `${name} is now a ${e.stage}!`;
          if (away) app.toast(msg);
          else this.play({ type: 'grow', dur: 2000, done: () => { app.sfx('grow'); app.toast(msg); } });
          break;
        }
        case 'sick': if (!away) app.sfx('alert'); app.toast(`${name} feels sick...`); break;
        case 'critical': app.sfx('alert'); app.toast(`${name} is very sick! Medicine!`, 3500); break;
        case 'attention': if (!away) app.sfx('alert'); break;
        case 'sleep': app.toast('Sleepy... Turn off the lights.', 3000); break;
        case 'wake': if (!away) app.toast('Good morning!'); break;
        case 'death':
        case 'runaway':
          this.anim = null;
          app.home();
          app.push(new EndingScene(app, e.type));
          break;
      }
    }
    if (away && app.awayMs > 30 * 60 * 1000 && pet && !pet.gone) {
      const n = needs(pet);
      if (n) app.toast(n === 'hungry' ? `${name} is starving!` : n === 'unhappy' ? `${name} missed you!` : n === 'sick' ? `${name} got sick!` : 'Welcome back!', 3000);
    }
  }

  play(anim) {
    this.anim = { t: 0, ...anim };
  }

  // ---------- input ----------
  button(b, dir = 1) {
    if (this.anim) return;
    const app = this.app;
    if (b === 'A') {
      this.cursor = this.cursor < 0 ? (dir > 0 ? 0 : ALL.length - 1) : (this.cursor + dir + ALL.length) % ALL.length;
      app.sfx('blip');
    } else if (b === 'B') {
      if (this.cursor >= 0) this.open(ALL[this.cursor]);
      else this.patPet();
    } else if (b === 'C') {
      if (this.cursor >= 0) { this.cursor = -1; app.sfx('back'); }
    }
  }

  tap(x, y) {
    if (this.anim) return false;
    const { top, bottom, room } = LAYOUT;
    if (y >= top.y && y < top.y + top.h) { this.cursor = Math.min(4, Math.floor(x / CELL)); this.open(ALL[this.cursor]); return true; }
    if (y >= bottom.y && y < bottom.y + bottom.h) { this.cursor = 5 + Math.min(4, Math.floor(x / CELL)); this.open(ALL[this.cursor]); return true; }
    if (y >= room.y && y < room.y + room.h) {
      const pet = this.pet;
      if (pet && pet.poop > 0 && x > 72 && y > ROOM_FLOOR - 20 && pet.lights) { this.open('clean'); return true; }
      if (Math.abs(x - this.petX) < 16 && y > ROOM_FLOOR - 40 && y < ROOM_FLOOR + 4) { this.patPet(); return true; }
    }
    return false;
  }

  patPet() {
    const app = this.app, pet = this.pet;
    if (!canAct(pet)) return;
    if (pet.asleep) { app.toast('Zzz...'); return; }
    const r = pat(this.game);
    if (!r.ok) return;
    app.sfx('happy');
    this.play({ type: 'pat', dur: 900 });
    for (let i = 0; i < 3; i++) this.fx.push({ spr: HEART, x: this.petX - 10 + i * 8, y: ROOM_FLOOR - 36, vy: -0.025 - i * 0.004, life: 900 });
  }

  /** Run a care action with its animation. Used by menus too. */
  doFeed(foodId) {
    const app = this.app;
    const r = feed(this.game, foodId);
    if (!r.ok) {
      app.sfx('nope');
      if (r.refuse) this.play({ type: 'refuse', dur: 1000 });
      if (r.msg) app.toast(r.msg);
      return;
    }
    this.play({
      type: 'eat', dur: 2000, food: foodId, done: () => {
        if (r.toothache) { app.sfx('sad'); app.toast(r.msg); return; }
        if (r.colorChanged) { app.sfx('grow'); app.toast(`Whoa! ${this.pet.name} turned ${r.colorChanged}!`, 3000); this.play({ type: 'grow', dur: 1400 }); return; }
        if (r.disliked) { app.toast('Meh... plain rice again?'); this.play({ type: 'refuse', dur: 800 }); return; }
        if (r.liked) { app.sfx('happy'); app.toast('Yum! A favourite!'); this.play({ type: 'happy', dur: 900 }); }
      },
    });
    app.sfx('eat');
  }

  doPlay(toyId) {
    const app = this.app;
    const r = play(this.game, toyId);
    if (!r.ok) { app.sfx('nope'); if (r.msg) app.toast(r.msg); return; }
    app.sfx('happy');
    this.play({ type: 'toy', dur: 2200, toy: toyId, done: () => { if (r.liked) app.toast('Its favourite toy!'); } });
  }

  open(name) {
    const app = this.app, pet = this.pet;
    const waiting = !pet || pet.stage === 'egg';
    const sleeping = pet?.asleep && !pet.lights;
    if (waiting && ['food', 'clean', 'medicine', 'games', 'items', 'family'].includes(name)) {
      app.sfx('nope'); app.toast(pet?.stage === 'egg' ? 'Wait for it to hatch!' : '...'); return;
    }
    if (sleeping && ['food', 'clean', 'medicine', 'games', 'items'].includes(name)) {
      app.sfx('nope'); app.toast('Shh! Sleeping...'); return;
    }
    switch (name) {
      case 'clean': {
        if (pet.poop === 0) { app.sfx('nope'); app.toast('Already clean!'); return; }
        app.sfx('clean');
        this.play({ type: 'clean', dur: 1000, done: () => clean(this.game) });
        return;
      }
      case 'medicine': {
        const r = medicine(this.game);
        if (!r.ok) { app.sfx('nope'); if (r.refuse) this.play({ type: 'refuse', dur: 900 }); if (r.msg) app.toast(r.msg); return; }
        app.sfx('select');
        this.play({ type: 'medicine', dur: 1100, done: () => { app.toast(r.msg); if (r.cured) { app.sfx('happy'); this.play({ type: 'happy', dur: 900 }); } } });
        return;
      }
      case 'lights': {
        const r = toggleLights(this.game);
        app.sfx(r.lights ? 'select' : 'back');
        if (!r.lights && !pet.asleep && canAct(pet)) app.toast("It's not bedtime yet!");
        return;
      }
      default:
        app.sfx('select');
        openMenu(app, name, this);
    }
  }

  // ---------- update ----------
  update(dt) {
    const pet = this.pet;
    const t = this.app.time;
    if (this.anim) {
      this.anim.t += dt;
      if (this.anim.t >= this.anim.dur) {
        const a = this.anim;
        this.anim = null;
        a.done?.();
      }
    }
    this.fx = this.fx.filter(f => (f.life -= dt) > 0);
    for (const f of this.fx) f.y += f.vy * dt;
    if (!canAct(pet) || pet.asleep || this.anim) return;

    // wandering
    const slow = pet.sick || pet.hunger <= 0 || pet.happy <= 0;
    this.moveIn -= dt;
    if (this.moveIn <= 0) {
      const maxX = pet.poop > 0 ? 70 : 96;
      this.targetX = 30 + Math.random() * (maxX - 30);
      this.moveIn = 2000 + Math.random() * 3500;
    }
    const d = this.targetX - this.petX;
    if (Math.abs(d) > 1) {
      this.petX += Math.sign(d) * Math.min(Math.abs(d), (slow ? 0.008 : 0.016) * dt);
      this.facing = Math.sign(d);
    }
    this.blink = (t % 3600) < 140 ? 1 : 0;
  }

  // ---------- draw ----------
  draw(scr) {
    const game = this.game, pet = this.pet, t = this.app.time;
    this.drawRoom(scr);
    const lightsOff = pet && !pet.lights;

    // poop
    if (pet && !lightsOff && this.anim?.type !== 'clean-done') {
      for (let i = 0; i < (pet.poop || 0); i++) {
        const px = POOP_X[i];
        if (this.anim?.type === 'clean' && px > W - (this.anim.t / this.anim.dur) * (W + 20)) continue;
        scr.draw(POOP, px - 4, ROOM_FLOOR - 7, { frame: Math.floor(t / 500) % 2 });
        scr.draw(STINK, px - 2, ROOM_FLOOR - 12, { frame: Math.floor(t / 400 + i) % 2 });
      }
    }

    // pet / egg / ghost
    if (pet) this.drawPet(scr, t, lightsOff);

    // effects
    for (const f of this.fx) scr.draw(f.spr, f.x, f.y, {});
    this.drawAnimOverlay(scr, t);

    if (lightsOff) {
      scr.dither(0, LAYOUT.room.y, W, LAYOUT.room.h, COL.night, Math.floor(t / 2000) % 2);
      if (pet?.asleep) {
        const zy = ROOM_FLOOR - 44 - Math.floor((t / 120) % 8);
        scr.draw(ZZZ, this.petX + 10, zy, { solid: COL.white });
      }
    }

    this.drawBars(scr, t);
  }

  drawPet(scr, t, lightsOff) {
    const pet = this.pet, a = this.anim;
    const baseY = ROOM_FLOOR - GROUND;
    if (pet.gone) {
      const gf = Math.floor(t / 600) % 2;
      scr.bitmap(composeGhost(gf), this.petX - CANVAS / 2, baseY - Math.round(Math.sin(t / 500) * 2));
      return;
    }
    if (pet.stage === 'egg') {
      const p = pet.stageMs / STAGE_LENGTH.egg;
      const hatching = a?.type === 'hatch';
      const wob = hatching ? (Math.floor(t / 80) % 2 ? 1 : -1) : (t % 2400 < 400 ? (Math.floor(t / 100) % 2 ? 1 : -1) : 0);
      const crack = hatching ? 3 : p > 0.66 ? 2 : p > 0.33 ? 1 : 0;
      const hint = pet.generation > 1 ? pet.phenotype : null;
      if (hatching && a.t > a.dur - 300) scr.rect(0, LAYOUT.room.y, W, LAYOUT.room.h, COL.white);
      else scr.bitmap(composeEgg(hint, crack, wob), 64 - CANVAS / 2, baseY);
      this.petX = 64;
      return;
    }

    let expr = 'idle', dy = 0, flip = this.facing > 0, solid = 0;
    const moving = Math.abs(this.targetX - this.petX) > 1;
    const bob = Math.floor(t / (moving ? 220 : 480)) % 2;
    if (pet.asleep) expr = 'sleep';
    else if (pet.sick) expr = 'sick';
    else if (pet.hunger <= 0 || pet.happy <= 0) expr = 'sad';
    else if (this.blink) expr = 'blink';

    if (a) {
      const k = a.t / a.dur;
      switch (a.type) {
        case 'eat':
          flip = false;
          expr = Math.floor(a.t / 280) % 2 ? 'chew' : 'eat';
          break;
        case 'refuse':
          expr = 'sad';
          flip = Math.floor(a.t / 140) % 2 === 0;
          break;
        case 'happy': case 'pat':
          expr = 'happy';
          dy = -Math.round(Math.abs(Math.sin(k * Math.PI * 2)) * 6);
          break;
        case 'toy':
          expr = 'happy';
          dy = -Math.round(Math.abs(Math.sin(k * Math.PI * 4)) * 5);
          flip = true;
          break;
        case 'grow':
          expr = 'happy';
          if (Math.floor(a.t / 120) % 2 && k < 0.7) solid = COL.white;
          break;
        case 'medicine':
          expr = k > 0.7 ? 'dizzy' : expr;
          flip = true;
          break;
      }
    }
    const bm = composePet(pet.phenotype, pet.stage, { expr, bob: moving || pet.asleep ? 0 : bob, gender: pet.gender });
    const x = Math.round(this.petX - CANVAS / 2);
    if (lightsOff) scr.bitmap(bm, x, baseY + dy, flip, 0);
    else scr.bitmap(bm, x, baseY + dy, flip, solid);

    if (!lightsOff && pet.sick && !a) scr.draw(SKULL, this.petX + 12, ROOM_FLOOR - 34, { frame: 0 });
    if (!pet.asleep && needs(pet) && !a && Math.floor(t / 400) % 2) scr.draw(ATTN, this.petX - 2, ROOM_FLOOR - 50);
  }

  drawAnimOverlay(scr, t) {
    const a = this.anim;
    if (!a) return;
    const k = a.t / a.dur;
    const fy = ROOM_FLOOR;
    switch (a.type) {
      case 'eat': {
        const spr = FOOD_ART[a.food] || FOOD_ART.riceball;
        const bites = Math.min(3, Math.floor(k * 4));
        const x = Math.round(this.petX - 28), y = fy - 12;
        if (bites < 3) {
          scr.setClip(x, y, spr.w - Math.round(spr.w * bites / 3), spr.h);
          scr.draw(spr, x, y, {});
          scr.noClip();
        }
        break;
      }
      case 'toy': {
        const spr = TOY_ART[a.toy] || TOY_ART.ball;
        const by = fy - 12 - Math.round(Math.abs(Math.sin(k * Math.PI * 3)) * 22);
        scr.draw(spr, Math.round(this.petX + 14), by, {});
        if (Math.floor(t / 300) % 2) scr.draw(NOTE, Math.round(this.petX - 22), fy - 40, {});
        break;
      }
      case 'clean': {
        const wx = Math.round(W - k * (W + 20));
        for (let y = LAYOUT.room.y + 2; y < LAYOUT.room.y + LAYOUT.room.h - 4; y += 5) scr.draw(BROOM_WAVE, wx + ((y >> 2) % 2) * 2, y, {});
        break;
      }
      case 'medicine': {
        const sx = Math.round(W - 10 - k * (W - 10 - this.petX - 10));
        if (k < 0.75) scr.draw(SYRINGE, sx, fy - 26, {});
        else scr.draw(SPARKLE, this.petX - 14, fy - 34, { frame: Math.floor(t / 100) % 2 });
        break;
      }
      case 'grow': case 'hatch': {
        for (let i = 0; i < 4; i++) {
          const ang = t / 300 + i * Math.PI / 2;
          scr.draw(SPARKLE, this.petX - 2 + Math.cos(ang) * 22, fy - 22 + Math.sin(ang) * 16, { frame: (Math.floor(t / 120) + i) % 2 });
        }
        break;
      }
    }
  }

  drawRoom(scr) {
    const { y: ry, h: rh } = LAYOUT.room;
    const pet = this.pet;
    const hour = new Date(this.game.simTime).getHours();
    const night = hour >= 20 || hour < 6, dusk = hour >= 17 && hour < 20, dawn = hour >= 6 && hour < 8;
    const floorY = ry + 92;
    // wall with polka-dot wallpaper
    scr.rect(0, ry, W, floorY - ry, C('sky.3'));
    for (let y = ry + 4; y < floorY - 8; y += 10) for (let x = (y / 10) % 2 ? 4 : 9; x < W; x += 10) {
      scr.pset(x, y, C('sky.2')); scr.pset(x + 1, y, C('sky.2')); scr.pset(x, y + 1, C('sky.2')); scr.pset(x + 1, y + 1, C('sky.2'));
    }
    // skirting board
    scr.rect(0, floorY - 5, W, 5, C('white'));
    scr.hline(0, floorY - 5, W, C('sky.1'));
    // floor boards
    scr.rect(0, floorY, W, ry + rh - floorY, C('cream.2'));
    for (let y = floorY + 6; y < ry + rh; y += 8) scr.hline(0, y, W, C('cream.1'));
    for (let y = floorY; y < ry + rh; y += 8) for (let x = ((y >> 3) % 2) * 16 + 8; x < W; x += 32) scr.vline(x, y + 1, 5, C('cream.1'));
    // rug
    for (let y = -6; y <= 6; y++) {
      const half = Math.round(Math.sqrt(1 - (y / 6.5) ** 2) * 40);
      scr.hline(56 - half, ROOM_FLOOR + y - 2, half * 2, y === -6 || y === 6 ? C('pink.1') : (Math.abs(y) === 3 ? C('pink.3') : C('pink.2')));
    }
    // window
    const wx = 10, wy = ry + 14, ww = 34, wh = 28;
    scr.panel(wx - 2, wy - 2, ww + 4, wh + 4, C('white'), C('ink'));
    const sky = night ? C('indigo.0') : dusk ? C('orange.2') : dawn ? C('pink.3') : C('sky.2');
    scr.rect(wx, wy, ww, wh, sky);
    if (night) {
      scr.draw(MOON, wx + 22, wy + 4, {});
      [[4, 5], [12, 14], [7, 20], [18, 8], [28, 20]].forEach(([x, y]) => scr.pset(wx + x, wy + y, C('gold.3')));
    } else {
      scr.draw(SUN, wx + 4, wy + 4, {});
      const cx = wx + 14 + Math.floor(this.app.time / 2000) % 14;
      scr.rect(cx, wy + 16, 9, 3, C('white')); scr.rect(cx + 2, wy + 14, 5, 2, C('white'));
    }
    scr.vline(wx + ww / 2, wy, wh, C('white'));
    scr.hline(wx, wy + wh / 2, ww, C('white'));
    // shelf + plant
    scr.rect(92, ry + 34, 28, 3, C('brown.2'));
    scr.hline(92, ry + 37, 28, C('brown.0'));
    scr.rect(100, ry + 27, 8, 7, C('orange.1'));
    scr.box(99, ry + 26, 10, 8, C('ink'));
    [[101, 22], [104, 19], [107, 23], [98, 20], [104, 24]].forEach(([x, y]) => { scr.rect(x, ry + y, 3, 3, C('green.2')); scr.pset(x, ry + y, C('green.3')); });
    scr.draw(ICONS.lights, 112, ry + 24, {});

    if (pet && !pet.lights) scr.rect(0, ry, W, rh, C('night'));
    if (pet && !pet.lights) { scr.panel(wx - 2, wy - 2, ww + 4, wh + 4, C('indigo.0'), C('shade')); scr.draw(MOON, wx + 22, wy + 4, {}); }
  }

  drawBars(scr, t) {
    const game = this.game, pet = this.pet;
    const { status, top, bottom, info } = LAYOUT;
    // status bar
    scr.rect(0, status.y, W, status.h, COL.ink);
    const d = new Date(game.simTime);
    const hh = d.getHours(), mm = String(d.getMinutes()).padStart(2, '0');
    text(scr, `${hh % 12 || 12}:${mm}${hh < 12 ? 'AM' : 'PM'}`, 3, 4, COL.white);
    scr.draw(COIN, W - 6 - 5 - String(game.points).length * 4, 3, {});
    text(scr, game.points, W - 4, 4, C('gold.3'), { align: 'right' });
    text(scr, `G${pet?.generation || game.generation}`, 66, 4, C('sky.3'), { align: 'center' });
    if (pet && needs(pet) && Math.floor(t / 400) % 2) scr.draw(ATTN, 78, 2, { solid: C('red.2') });
    if (pet?.paused) text(scr, 'II', 86, 4, C('gold.3'));
    // icon rows
    for (const [row, ids] of [[top, TOP], [bottom, BOTTOM]]) {
      scr.rect(0, row.y, W, row.h, COL.panel);
      scr.hline(0, row.y + (row === top ? row.h - 1 : 0), W, C('cream.1'));
      ids.forEach((id, i) => {
        const idx = ALL.indexOf(id);
        const cx = Math.round(i * CELL + CELL / 2);
        if (this.cursor === idx) scr.panel(Math.round(i * CELL) + 1, row.y + 1, Math.round(CELL) - 1, row.h - 2, COL.hi, COL.ink);
        const ic = ICONS[id];
        scr.draw(ic, cx - Math.floor(ic.w / 2), row.y + Math.floor((row.h - ic.h) / 2), {});
      });
    }
    // info bar
    scr.rect(0, info.y, W, info.h, COL.ink);
    let label;
    if (this.cursor >= 0) label = LABEL[ALL[this.cursor]];
    else if (pet) label = `${pet.gender === 'f' ? '♀' : '♂'} ${pet.name.toUpperCase()}  ${STAGE_NAME[pet.stage]}`;
    text(scr, label || '', W / 2, info.y + 4, COL.white, { align: 'center' });
  }
}
