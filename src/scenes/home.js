// The main screen: status bar, two rows of menu icons, the room with the pet.
import { C, mutedLut } from '../engine/palette.js';
import { text } from '../engine/font.js';
import { W } from '../engine/screen.js';
import { ICONS, COIN, POOP, SKULL, ZZZ, ATTN, SPARKLE, HEART, SYRINGE, BROOM_WAVE, MOON, SUN, STINK, FOOD_ART, TOY_ART, NOTE, SWEAT, TUB, SUDS, BUBBLE, POTTY, BROOM_ICON, BATH_ICON, POTTY_ICON, ARROW } from '../art/icons.js';
import { hash } from '../engine/rng.js';
import { composePet, composeEgg, composeGhost, CANVAS, GROUND } from '../game/render.js';
import { LAYOUT, ROOM_FLOOR, COL, dialog, ListMenu } from '../ui.js';
import { needs, canAct, STAGE_LENGTH, feed, play, clean, medicine, toggleLights, pat, scold, comfort, bathe, toilet, isDirty, isPottyTrained, POTTY_TRAINED } from '../game/pet.js';
import { FOODS } from '../game/items.js';
import { openMenu } from './menus.js';
import { drawRoom as drawRoomHD, drawRoomFront, drawSkyBars, drawSlide, skyState } from './room.js';
import { layoutOf, roomOf, nextRoom, ROOMS, HOUSE } from '../game/decor.js';
import { PROPS } from '../art/props.js';
import { DECOR_ART } from '../art/decor-art.js';
import { tone, edgeColours, bedRim, BED, HOME_FEET } from '../art/town.js';
import { EndingScene } from './ending.js';

const TOP = ['status', 'food', 'clean', 'medicine', 'lights'];
const BOTTOM = ['games', 'items', 'town', 'family', 'settings'];
const ALL = [...TOP, ...BOTTOM];
const LABEL = {
  status: 'STATUS', food: 'FOOD', clean: 'CLEAN', medicine: 'MEDICINE', lights: 'LIGHTS',
  games: 'GAMES', items: 'ITEMS', town: 'TOWN', family: 'FAMILY', settings: 'SETTINGS',
};
const POOP_X = [104, 116, 92, 80];
// Menu icons are grey and see-through until the cursor is on them: the sky, clouds or grass behind show through.
const MUTED = mutedLut('white', 1, 0);
const ICON_ALPHA = 0.62; // how solid an icon that isn't picked is
const CELL = W / 5;
const DOOR_Y = 58; // where the arrows to the next rooms sit, from the top of the room
// how far a small pet is lifted so it shows over the rim of the tub
const BATH_LIFT = { baby: 17, child: 12, teen: 9, adult: 9 };
const GRIME = ['CLEAN', 'CLEAN', 'GRUBBY', 'DIRTY', 'FILTHY'];
// a splat of mud, in hi-res pixels ('1' mud, '0' its darker underside)
const MUD = ['.1111..', '1111111', '1111110', '.00000.'];

/**
 * Where the pet uses a piece of furniture in the room on show: the top of the seat or of the table, in screen pixels.
 * (A seat is taken to be at most 32 fine pixels high and a table top 46, the furniture size standard; a chair's back
 * and whatever stands on a table are above that.)
 */
function useSpot(game, slot) {
  const thing = DECOR_ART[layoutOf(game)?.[slot]]?.things?.[0];
  if (!thing) return null;
  const [name, x, y] = thing, h = Math.min(PROPS[name]?.h || 30, slot === 'table' ? 46 : 32);
  return { x: x / 2, y: LAYOUT.room.y + (y - h) / 2, floor: LAYOUT.room.y + y / 2 }; // floor: where the piece stands, in the front of the room
}

const BED_LIFT = (HOME_FEET - (BED.y - BED.sink)) / 2; // how far a pet in bed is above the floor it walks on, in screen pixels

export class HomeScene {
  constructor(app) {
    this.app = app;
    this.cursor = -1;
    this.petX = 52;
    this.bedLift = 0;
    this.targetX = 52;
    this.facing = 1;
    this.moveIn = 1500;
    this.blink = 0;
    this.anim = null;
    this.slide = null; // stepping between rooms: { from, to, dir, t, dur, then }
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
        case 'whim': if (!away) app.toast(`${name} is fussing! Tap it to scold or comfort.`, 3000); break;
        case 'squirm': if (!away) { app.sfx('alert'); app.toast(`${name} needs the toilet! Tap it!`, 3000); } break;
        case 'dirty': if (!away) app.toast(`${name} is getting dirty. Bath time!`, 3000); break;
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
      if (n) app.toast(n === 'hungry' ? `${name} is starving!` : n === 'unhappy' ? `${name} missed you!` : n === 'sick' ? `${name} got sick!` : n === 'dirty' ? `${name} needs a bath!` : 'Welcome back!', 3000);
    }
  }

  play(anim) {
    this.standUp();
    this.anim = { t: 0, ...anim };
  }

  /** Get down off a seat (anything the pet is asked to do starts with this). */
  standUp() {
    if (this.seated) this.moveIn = 1500;
    this.seated = this.goSit = null;
  }

  // ---------- input ----------
  button(b, dir = 1) {
    if (this.anim || this.slide) return;
    const app = this.app;
    if (b === 'A') {
      this.cursor = this.cursor < 0 ? (dir > 0 ? 0 : ALL.length - 1) : (this.cursor + dir + ALL.length) % ALL.length;
      app.sfx('blip');
    } else if (b === 'B') {
      if (this.cursor >= 0) this.open(ALL[this.cursor]);
      else this.patPet();
    } else if (b === 'C') {
      if (this.cursor >= 0) { this.cursor = -1; app.sfx('back'); }
      else this.stepRoom(1, true); // with no menu picked, C walks on to the next room
    }
  }

  // ---------- the house ----------
  /**
   * Walk to another room; `then` runs on arrival (care actions use it: meals
   * are in the kitchen, baths in the bathroom, toys in the garden, sleep in bed).
   */
  goRoom(to, then = null) {
    const game = this.game, from = roomOf(game);
    if (to === from) { then?.(); return true; }
    this.standUp();
    if (this.pet?.asleep && !then) { this.app.sfx('nope'); this.app.toast('Shh! Sleeping...'); return false; }
    const dir = HOUSE.indexOf(to) > HOUSE.indexOf(from) ? 1 : -1;
    game.room = to;
    this.slide = { from, to, dir, t: 0, dur: 300, then };
    // the pet comes in by the side it left through
    this.petX = dir > 0 ? 26 : 100;
    this.targetX = 64;
    this.facing = dir;
    this.moveIn = 1200;
    this.app.sfx('blip');
    return true;
  }
  /** The room next door (dir -1 left, 1 right); `wrap` goes round from the last room to the first. */
  stepRoom(dir, wrap = false) {
    let to = nextRoom(roomOf(this.game), dir);
    if (!to && wrap) to = dir > 0 ? HOUSE[0] : HOUSE[HOUSE.length - 1];
    if (to) this.goRoom(to);
  }
  /** Dragging the room to the left brings on the one to its right. */
  swipe(dir) { if (!this.anim && !this.slide && this.app.scene === this) this.stepRoom(-dir); }

  tap(x, y) {
    if (this.anim || this.slide) return false;
    const { top, bottom, room } = LAYOUT;
    if (y >= top.y && y < top.y + top.h) { this.cursor = Math.min(4, Math.floor(x / CELL)); this.open(ALL[this.cursor]); return true; }
    if (y >= bottom.y && y < bottom.y + bottom.h) { this.cursor = 5 + Math.min(4, Math.floor(x / CELL)); this.open(ALL[this.cursor]); return true; }
    if (y >= room.y && y < room.y + room.h) {
      const pet = this.pet;
      // the arrows at the room's edges lead next door
      if (y > room.y + DOOR_Y - 12 && y < room.y + DOOR_Y + 20 && (x < 12 || x >= W - 12)) {
        const dir = x < 12 ? -1 : 1;
        if (nextRoom(roomOf(this.game), dir)) { this.stepRoom(dir); return true; }
      }
      if (pet && pet.poop > 0 && x > 72 && y > ROOM_FLOOR - 20 && pet.lights && canAct(pet)) { this.sweep(); return true; }
      if (Math.abs(x - this.petX) < 16 && y > ROOM_FLOOR - 40 && y < ROOM_FLOOR + 4) { this.patPet(); return true; }
    }
    return false;
  }

  patPet() {
    const app = this.app, pet = this.pet;
    if (!canAct(pet)) return;
    if (pet.asleep) { app.toast('Zzz...'); return; }
    if (pet.squirm) { this.doToilet(); return; }
    if (pet.whim) { this.discipline(); return; }
    const r = pat(this.game);
    if (!r.ok) return;
    app.sfx('happy');
    this.play({ type: 'pat', dur: 900 });
    for (let i = 0; i < 3; i++) this.fx.push({ spr: HEART, x: this.petX - 10 + i * 8, y: ROOM_FLOOR - 36, vy: -0.025 - i * 0.004, life: 900 });
  }

  /** A fussing pet: scold it (discipline) or comfort it (happiness, but spoiled). */
  discipline() {
    const app = this.app;
    const done = (r, anim) => {
      app.home();
      if (!r.ok) return;
      app.sfx(anim === 'happy' ? 'happy' : 'back');
      this.play({ type: anim, dur: 1000, done: () => app.toast(r.msg) });
      app.save();
    };
    app.push(new ListMenu(app, `${this.pet.name.toUpperCase()} IS FUSSING`, [
      { label: 'Scold', right: 'MANNERS', action: () => done(scold(this.game), 'scold') },
      { label: 'Comfort', right: 'HAPPY', action: () => done(comfort(this.game), 'happy') },
    ], { footer: 'SCOLDING TEACHES DISCIPLINE' }));
  }

  /** Run a care action with its animation. Used by menus too. */
  doFeed(foodId) { this.goRoom('kitchen', () => this.feedNow(foodId)); }
  feedNow(foodId) {
    const app = this.app;
    const r = feed(this.game, foodId);
    if (!r.ok) {
      app.sfx('nope');
      if (r.refuse) this.play({ type: 'refuse', dur: 1000 });
      if (r.whim) { app.toast(`${r.msg} Tap ${this.pet.name} to scold it.`, 3000); return; }
      if (r.msg) app.toast(r.msg);
      return;
    }
    // in the kitchen the pet eats at the table: it stands beside it and the dish is on the table top
    const table = roomOf(this.game) === 'kitchen' && useSpot(this.game, 'table');
    if (table) { this.petX = this.targetX = Math.min(72, table.x + 36); this.facing = -1; }
    this.play({
      type: 'eat', dur: 2000, food: foodId, table, done: () => {
        if (r.toothache) { app.sfx('sad'); app.toast(r.msg); return; }
        if (r.colorChanged) { app.sfx('grow'); app.toast(`Whoa! ${this.pet.name} turned ${r.colorChanged}!`, 3000); this.play({ type: 'grow', dur: 1400 }); return; }
        if (r.disliked) { app.toast('Meh... plain rice again?'); this.play({ type: 'refuse', dur: 800 }); return; }
        if (r.liked) { app.sfx('happy'); app.toast('Yum! A favourite!'); this.play({ type: 'happy', dur: 900 }); }
      },
    });
    app.sfx('eat');
  }

  doPlay(toyId) { this.goRoom('garden', () => this.playNow(toyId)); }
  playNow(toyId) {
    const app = this.app;
    const r = play(this.game, toyId);
    if (!r.ok) { app.sfx('nope'); if (r.msg) app.toast(r.msg); return; }
    app.sfx('happy');
    this.play({ type: 'toy', dur: 2200, toy: toyId, done: () => { if (r.liked) app.toast('Its favourite toy!'); } });
  }

  sweep() {
    const app = this.app, pet = this.pet;
    if (pet.poop === 0) { app.sfx('nope'); app.toast('Already clean!'); return; }
    app.sfx('clean');
    this.play({ type: 'clean', dur: 1000, done: () => clean(this.game) });
  }

  doBath() { this.goRoom('bathroom', () => this.bathNow()); }
  bathNow() {
    const app = this.app;
    const r = bathe(this.game);
    if (!r.ok) { app.sfx('nope'); if (r.refuse) this.play({ type: 'refuse', dur: 900 }); if (r.msg) app.toast(r.msg); return; }
    app.sfx('clean');
    this.play({ type: 'bath', dur: 2800, done: () => { app.sfx('happy'); app.toast(r.msg); this.play({ type: 'happy', dur: 900 }); app.save(); } });
  }

  doToilet() { this.goRoom('bathroom', () => this.toiletNow()); }
  toiletNow() {
    const app = this.app;
    const r = toilet(this.game);
    if (!r.ok) { app.sfx('nope'); if (r.refuse) this.play({ type: 'refuse', dur: 900 }); if (r.msg) app.toast(r.msg); return; }
    app.sfx('select');
    this.play({
      type: 'toilet', dur: 1800, done: () => {
        app.sfx(r.trained ? 'grow' : 'happy');
        app.toast(r.msg, r.trained ? 3200 : 2200);
        this.play({ type: 'happy', dur: 900 });
        app.save();
      },
    });
  }

  /** Clean: sweep the floor, run a bath, or send the pet to the toilet. */
  cleanMenu() {
    const app = this.app, pet = this.pet;
    const go = (fn) => () => { app.home(); fn.call(this); };
    app.push(new ListMenu(app, 'CLEAN', [
      { label: 'Sweep up', icon: BROOM_ICON, right: pet.poop ? `x${pet.poop}` : 'TIDY', action: go(this.sweep) },
      { label: 'Bath', icon: BATH_ICON, right: GRIME[Math.min(4, Math.floor(pet.dirt || 0))], action: go(this.doBath) },
      { label: 'Toilet', icon: POTTY_ICON, right: pet.squirm ? 'NOW!' : isPottyTrained(pet) ? 'TRAINED' : `${pet.potty || 0}/${POTTY_TRAINED}`, action: go(this.doToilet) },
    ], { footer: 'SQUIRMING? TAP YOUR PET!' }));
  }

  open(name) {
    const app = this.app, pet = this.pet;
    const waiting = !pet || pet.stage === 'egg';
    const sleeping = pet?.asleep && !pet.lights;
    if (waiting && ['food', 'clean', 'medicine', 'games', 'items', 'family', 'town'].includes(name)) {
      app.sfx('nope'); app.toast(pet?.stage === 'egg' ? 'Wait for it to hatch!' : '...'); return;
    }
    if (sleeping && ['food', 'clean', 'medicine', 'games', 'items', 'town'].includes(name)) {
      app.sfx('nope'); app.toast('Shh! Sleeping...'); return;
    }
    switch (name) {
      case 'clean':
        app.sfx('select');
        this.cleanMenu();
        return;
      case 'medicine': {
        const r = medicine(this.game);
        if (!r.ok) { app.sfx('nope'); if (r.refuse) this.play({ type: 'refuse', dur: 900 }); if (r.msg) app.toast(r.msg); return; }
        app.sfx('select');
        this.play({ type: 'medicine', dur: 1100, done: () => { app.toast(r.msg); if (r.cured) { app.sfx('happy'); this.play({ type: 'happy', dur: 900 }); } } });
        return;
      }
      case 'lights': {
        // lights out is for bed, so the pet goes to its bedroom first
        const flip = () => {
          const r = toggleLights(this.game);
          app.sfx(r.lights ? 'select' : 'back');
          if (!r.lights && !pet.asleep && canAct(pet)) app.toast("It's not bedtime yet!");
        };
        if (pet.lights) this.goRoom('bedroom', flip); else flip();
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
    if (this.slide) {
      this.slide.t += dt;
      if (this.slide.t < this.slide.dur) return;
      const s = this.slide;
      this.slide = null;
      s.then?.();
      return;
    }
    // a pet that nods off anywhere else is carried to bed
    if (pet?.asleep && !this.anim && roomOf(this.game) !== 'bedroom') { this.goRoom('bedroom', () => {}); return; }
    if (this.anim) {
      this.anim.t += dt;
      if (this.anim.t >= this.anim.dur) {
        const a = this.anim;
        this.anim = null;
        a.done?.();
      }
    }
    this.fx = this.fx.filter(f => (f.life -= dt) > 0);
    // Gene Book finds, announced one at a time once nothing else is showing
    const news = this.game.bookNews;
    if (news?.length && !this.anim && this.app.scene === this && !this.app.toasts.length) {
      this.app.toast(news.shift(), 2600);
      this.app.sfx('coin');
    }
    for (const f of this.fx) f.y += f.vy * dt;
    if (!canAct(pet) || pet.asleep || this.anim) return;

    this.blink = (t % 3600) < 140 ? 1 : 0;
    // sitting on the seat for a while
    if (this.seated) {
      this.seatMs -= dt;
      if (this.seatMs <= 0 || needs(pet) || pet.squirm) this.standUp();
      return;
    }
    // wandering; now and then, when all is well, over to the seat (the kitchen's or the garden's) for a sit
    const slow = pet.sick || pet.hunger <= 0 || pet.happy <= 0;
    this.moveIn -= dt;
    if (this.moveIn <= 0) {
      const maxX = pet.poop > 0 ? 70 : 96;
      const seat = !slow && !pet.poop && pet.stage !== 'egg' && !pet.gone && Math.random() < 0.3 && useSpot(this.game, 'seat');
      this.goSit = seat || null;
      this.targetX = seat ? Math.min(100, seat.x - 10) : 30 + Math.random() * (maxX - 30);
      this.moveIn = 2000 + Math.random() * 3500;
    }
    const d = this.targetX - this.petX;
    if (Math.abs(d) > 1) {
      this.petX += Math.sign(d) * Math.min(Math.abs(d), (slow ? 0.008 : 0.016) * dt);
      this.facing = Math.sign(d);
    } else if (this.goSit) {
      this.seated = this.goSit; this.goSit = null;
      this.seatMs = 6000 + Math.random() * 7000;
      this.app.sfx?.('tick');
    }
    return;
    this.blink = (t % 3600) < 140 ? 1 : 0;
  }

  // ---------- draw ----------
  draw(scr) {
    const game = this.game, pet = this.pet, t = this.app.time;
    const lightsOff = pet && !pet.lights;
    if (this.slide) {
      const s = this.slide, side = (room) => ({ room, layout: layoutOf(game, room) });
      drawSlide(scr, game.simTime, lightsOff, side(s.from), side(s.to), s.dir, s.t / s.dur);
      this.drawBars(scr, t);
      return;
    }
    this.drawRoom(scr);

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
    const upFront = this.seated || (this.anim?.type === 'eat' && this.anim.table); // on the seat, or at the table: in the front of the room
    if (pet && !upFront) this.drawPet(scr, t, lightsOff);
    // the toy chest and plant in the front corners stand in front of the pet
    drawRoomFront(scr, game.simTime, lightsOff, layoutOf(game), roomOf(game));
    // (a pet on the seat or at the table in the front corner is in front of it)
    if (pet && upFront) this.drawPet(scr, t, lightsOff);

    // effects
    for (const f of this.fx) scr.draw(f.spr, f.x, f.y, {});
    this.drawAnimOverlay(scr, t);

    if (lightsOff) {
      scr.hdither(Math.round(this.petX) - 32, ROOM_FLOOR - 64 - this.bedLift, 64, 66, COL.night);

      if (pet?.asleep) {
        const zy = ROOM_FLOOR - 44 - this.bedLift - Math.floor((t / 120) % 8);
        scr.draw(ZZZ, this.petX + 10, zy, { solid: COL.white });
      }
    }

    this.drawDoors(scr);
    this.drawBars(scr, t);
  }

  /** A little arrow tab on each side of the room that has another room beyond it. */
  drawDoors(scr) {
    const room = roomOf(this.game), y = LAYOUT.room.y + DOOR_Y;
    if (nextRoom(room, -1)) { scr.panel(-2, y - 4, 9, 13, COL.white, COL.ink); scr.draw(ARROW, 1, y, { flip: true }); }
    if (nextRoom(room, 1)) { scr.panel(W - 7, y - 4, 9, 13, COL.white, COL.ink); scr.draw(ARROW, W - 4, y, {}); }
  }

  drawPet(scr, t, lightsOff) {
    const pet = this.pet, a = this.anim;
    this.bedLift = 0;
    const sit = this.seated && pet.stage !== 'egg' && !pet.gone ? this.seated : null;
    const table = a?.type === 'eat' && a.table && pet.stage !== 'egg' ? a.table : null; // eating at the table, standing beside it
    const baseY = sit ? Math.round(sit.y) - GROUND : table ? Math.round(table.floor) - GROUND : ROOM_FLOOR - GROUND;
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

    let expr = 'idle', dy = 0, dx = 0, flip = this.facing > 0, solid = 0, arms = 'down';
    // asleep in the bedroom: tucked into the bed, behind its front rim
    const inBed = pet.asleep && roomOf(this.game) === 'bedroom';
    this.bedLift = inBed ? BED_LIFT : 0;
    if (inBed) this.petX = this.targetX = BED.x / 2;
    if (sit) { this.petX = this.targetX = Math.min(104, sit.x - 4); flip = false; }
    const moving = !sit && Math.abs(this.targetX - this.petX) > 1 && !pet.asleep;
    const bob = Math.floor(t / (moving ? 220 : 480)) % 2;
    const step = moving ? (Math.floor(t / 200) % 2 ? 1 : 2) : 0;
    // every so often, a little idle flourish
    if (!moving && !pet.asleep && !pet.sick && pet.happy >= 3 && t % 9000 < 900) arms = t % 18000 < 9000 ? 'wave' : 'out';
    if (pet.asleep) expr = 'sleep';
    else if (pet.sick) expr = 'sick';
    else if (pet.hunger <= 0 || pet.happy <= 0) expr = 'sad';
    else if (this.blink) expr = 'blink';

    if (a) {
      const k = a.t / a.dur;
      switch (a.type) {
        case 'eat':
          flip = false;
          arms = 'out';
          expr = Math.floor(a.t / 280) % 2 ? 'chew' : 'eat';
          break;
        case 'scold':
          expr = 'sad';
          dy = Math.floor(a.t / 120) % 2;
          break;
        case 'refuse':
          expr = 'sad';
          flip = Math.floor(a.t / 140) % 2 === 0;
          break;
        case 'happy':
          expr = 'happy';
          arms = 'up';
          dy = -Math.round(Math.abs(Math.sin(k * Math.PI * 2)) * 6);
          break;
        case 'pat':
          expr = 'wink';
          arms = 'wave';
          dy = -Math.round(Math.abs(Math.sin(k * Math.PI)) * 3);
          break;
        case 'toy':
          expr = 'happy';
          arms = Math.floor(a.t / 250) % 2 ? 'up' : 'out';
          dy = -Math.round(Math.abs(Math.sin(k * Math.PI * 4)) * 5);
          flip = true;
          break;
        case 'grow':
          expr = 'happy';
          arms = 'up';
          if (Math.floor(a.t / 120) % 2 && k < 0.7) solid = COL.white;
          break;
        case 'medicine':
          expr = k > 0.7 ? 'dizzy' : expr;
          flip = true;
          break;
        case 'bath':
          expr = Math.floor(a.t / 450) % 2 ? 'happy' : 'wink';
          arms = 'up';
          flip = false;
          // (floaters already hover over the rim)
          dy = -(pet.phenotype.form === 'floater' ? 0 : BATH_LIFT[pet.stage] || 0) - (Math.floor(a.t / 300) % 2);
          break;
        case 'toilet':
          expr = k > 0.7 ? 'happy' : 'blink';
          flip = true;
          dy = pet.phenotype.form === 'floater' ? 0 : -7; // perched on the seat
          break;
      }
    } else if (pet.squirm && !pet.asleep) {
      // needs the toilet: a worried little wiggle
      expr = 'sad';
      dx = Math.floor(t / 90) % 2 ? 1 : -1;
    }
    // small signs of life: a wagging tail when it is happy, a twitch of the ears, a flutter of the wings
    const lively = !pet.asleep && !pet.sick && !lightsOff;
    const glad = a ? ['happy', 'pat', 'play', 'grow'].includes(a.type) : pet.happy >= 3 && t % 6000 < 1400;
    const wag = lively && glad ? Math.floor(t / 160) % 2 : 0;
    const ear = lively && t % 4700 < 180 ? 1 : 0;
    const flap = lively && (moving || t % 8000 < 700) ? Math.floor(t / 140) % 2 : 0;
    const bm = composePet(pet.phenotype, pet.stage, { expr, arms, step, t, wag, ear, flap, bob: moving || pet.asleep ? 0 : bob, gender: pet.gender, wear: pet.wear, species: pet.species });
    const x = Math.round(this.petX - CANVAS / 2) + dx;
    dy -= this.bedLift;
    if (lightsOff) scr.bitmap(bm, x, baseY + dy, flip, 0);
    else scr.bitmap(bm, x, baseY + dy, flip, solid);
    if (inBed) { const rim = bedRim(layoutOf(this.game), lightsOff); scr.bitmap(rim.bm, rim.x / 2, LAYOUT.room.y + (rim.y >> 1)); }

    if (!lightsOff && !solid && (pet.dirt || 0) >= 2) {
      this.drawDirt(scr, bm, x, baseY + dy, flip, pet);
      if (isDirty(pet) && !a) {
        scr.draw(STINK, this.petX - 16, ROOM_FLOOR - 36, { frame: Math.floor(t / 400) % 2 });
        scr.draw(STINK, this.petX + 11, ROOM_FLOOR - 30, { frame: Math.floor(t / 400 + 1) % 2 });
      }
    }
    if (!lightsOff && pet.sick && !a) scr.draw(SKULL, this.petX + 12, ROOM_FLOOR - 34, { frame: 0 });
    if (!lightsOff && pet.squirm && !pet.asleep && !a) scr.draw(SWEAT, this.petX + 11 + dx, ROOM_FLOOR - 32 + (Math.floor(t / 250) % 2), {});
    if (!pet.asleep && (needs(pet) || pet.squirm) && !a && Math.floor(t / 400) % 2) scr.draw(ATTN, this.petX - 2, ROOM_FLOOR - 50);
  }

  /**
   * Grime: brown smudges painted onto the pet's own silhouette, more of them as
   * it gets dirtier. The spots are fixed for each pet, so they stay put.
   */
  drawDirt(scr, bm, x, y, flip, pet) {
    const tries = pet.dirt >= 4 ? 36 : pet.dirt >= 3 ? 24 : 12;
    const X = Math.round(x * 2), Y = Math.round(y * 2);
    const tones = { 0: C('brown.1'), 1: C('brown.2') };
    const body = (i, j) => i >= 0 && j >= 0 && i < bm.w && j < bm.h && bm.px[j * bm.w + i];
    let seed = hash(pet.id) | 1;
    const next = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 2 ** 32; };
    for (let n = 0; n < tries; n++) {
      const px = Math.floor(next() * bm.w), py = Math.floor(next() * bm.h);
      // a splat lands on the body and is trimmed to it, so it never spills past the outline
      if (!body(px + 3, py + 1) || !body(px + 1, py + 2) || !body(px + 5, py + 2)) continue;
      MUD.forEach((row, j) => {
        for (let i = 0; i < row.length; i++) {
          if (row[i] === '.' || !body(px + i - 1, py + j) || !body(px + i + 1, py + j) || !body(px + i, py + j + 1) || !body(px + i, py + j - 1)) continue;
          scr.hpset(X + (flip ? bm.w - 1 - px - i : px + i), Y + py + j, tones[row[i]]);
        }
      });
    }
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
        // on the table if there is one, or else on the floor in front of the pet (every dish on the same line)
        const x = a.table ? Math.round(a.table.x - spr.w / 2) : Math.round(this.petX - 28), y = a.table ? Math.round(a.table.y) - spr.h + 1 : fy - 2 - spr.h;
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
      case 'bath': {
        const x = Math.round(this.petX - 19), y = fy - 13;
        scr.draw(TUB, x, y, {});
        scr.draw(SUDS, x + 4, y - 4, { frame: Math.floor(a.t / 350) % 2 });
        for (let i = 0; i < 5; i++) {
          const ph = (a.t / 1100 + i * 0.27) % 1;
          scr.draw(BUBBLE, x + 2 + i * 8 + Math.round(Math.sin(ph * 7 + i) * 2), y - 8 - Math.round(ph * 34), { frame: i % 3 });
        }
        break;
      }
      case 'toilet': {
        scr.draw(POTTY, Math.round(this.petX - 9), fy - 14, {});
        if (k > 0.7) scr.draw(SPARKLE, this.petX + 12, fy - 30, { frame: Math.floor(t / 100) % 2 });
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
    drawRoomHD(scr, this.game.simTime, this.app.time, this.pet && !this.pet.lights, layoutOf(this.game), roomOf(this.game));
  }

  drawBars(scr, t) {
    const game = this.game, pet = this.pet;
    const { status, top, bottom, info } = LAYOUT;
    // the bars are open sky: the same sky the window looks out on, by day and by night
    // Below the room is the ground the house stands on: the garden's own lawn, in the light of the hour.
    // (Out in the garden it is the same lawn carrying on, and nothing frames the room.)
    // Away from home and out of doors (a place in town, the road there, the games field), the bars
    // carry that picture's ground on instead of the lawn: it says which picture through `openAir`.
    const over = this.app.scene !== this ? this.app.scene : null;
    const edge = over?.openAir ? edgeColours(over.openAir, skyState(new Date(game.simTime).getHours())) : null;
    const open = edge ? true : !over && !!ROOMS[roomOf(game)].outdoor;
    const lawn = DECOR_ART[layoutOf(game, 'garden').ground] || DECOR_ART['sweet-garden-ground'];
    this.app.setButtons?.(lawn.bar || lawn.c); // the garden's ground picks the buttons' colour, whatever the hour or the screen
    // An outdoor place shows the sky of the hour like home does, over its own ground (sand, cobbles, grass);
    // one that keeps its own sky (`ownSky`) gives the bars above their colour too.
    const ground = edge ? { c: edge.bottom, stroke: edge.stroke, bare: true, cobbles: edge.cobbles } : lawn.bar ? { c: lawn.bar, stroke: tone(lawn.bar, -1) } : { c: tone(lawn.c, -1), stroke: tone(lawn.c, -2) };
    const sky = drawSkyBars(scr, game.simTime, t, edge ? false : pet && !pet.lights, ground, edge?.ownSky ? edge : null);
    const fg = sky.dark ? COL.white : COL.ink, low = sky.bottomDark ? COL.white : COL.ink;
    const shown = `${sky.top}|${sky.bottom}|${sky.lightsOff}`;
    if (shown !== this.skyShown) { this.skyShown = shown; this.app.pageSky?.(sky.top, sky.bottom); this.app.setDark?.(!!sky.lightsOff); }
    // status bar
    const d = new Date(game.simTime);
    const hh = d.getHours(), mm = String(d.getMinutes()).padStart(2, '0');
    text(scr, `${hh % 12 || 12}:${mm}${hh < 12 ? 'AM' : 'PM'}`, 3, 4, fg);
    scr.draw(COIN, W - 6 - 5 - String(game.points).length * 4, 3, {});
    text(scr, game.points, W - 4, 4, sky.dark ? C('gold.3') : COL.ink, { align: 'right' });
    text(scr, `G${pet?.generation || game.generation}`, 66, 4, sky.dark ? C('sky.3') : COL.shade, { align: 'center' });
    if (pet && (needs(pet) || pet.squirm) && Math.floor(t / 400) % 2) scr.draw(ATTN, 78, 2, { solid: C(sky.dark ? 'red.2' : 'red.1') });
    if (pet?.paused) text(scr, 'II', 86, 4, sky.dark ? C('gold.3') : COL.shade);
    // icon rows
    for (const [row, ids] of [[top, TOP], [bottom, BOTTOM]]) {
      const dark = row === top ? sky.dark : sky.bottomDark;
      if (!open) scr.rule(0, row.y + (row === top ? row.h - 1 : 0), W, dark ? COL.shade : COL.ink, row === top);
      ids.forEach((id, i) => {
        const idx = ALL.indexOf(id);
        const cx = Math.round(i * CELL + CELL / 2);
        if (this.cursor === idx) scr.panel(Math.round(i * CELL) + 1, row.y + 1, Math.round(CELL) - 1, row.h - 2, COL.hi, COL.ink);
        const ic = ICONS[id];
        // (with the lights out the lamp keeps its colour: it is what turns them back on)
        const lit = this.cursor === idx || (sky.lightsOff && id === 'lights');
        scr.draw(ic, cx - Math.floor(ic.w / 2), row.y + Math.floor((row.h - ic.h) / 2), lit ? {} : { remap: MUTED, alpha: sky.lightsOff ? ICON_ALPHA * 0.6 : ICON_ALPHA });
      });
    }
    // info bar
    // (only the name of the highlighted menu; the pet's name, gender and stage are on the Status page)
    // ...or, with no menu picked, which room of the house this is
    // (it sits between the two outer buttons, close under the icons and over the middle button)
    if (this.cursor >= 0) text(scr, LABEL[ALL[this.cursor]], W / 2, info.y + 3, low, { align: 'center' });
    else text(scr, ROOMS[roomOf(game)].name.toUpperCase(), W / 2, info.y + 3, sky.bottomDark ? COL.mist : COL.ink, { align: 'center' });
  }
}
