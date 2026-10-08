// Matchmaker, wedding and the family album.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, titleBar, text, ListMenu } from '../ui.js';
import { composePet, composeEgg, CANVAS, GROUND } from '../game/render.js';
import { HEART, RING, SPARKLE } from '../art/icons.js';
import { findPartner, marry } from '../game/pet.js';

const sym = (g) => (g === 'f' ? '♀' : '♂');

export class MatchmakerScene {
  constructor(app) {
    this.app = app;
    this.t = 0;
    this.partner = findPartner(app.game);
  }
  enter() {
    if (!this.partner) {
      this.app.toast('The matchmaker is resting. Come back tomorrow!');
      this.app.pop();
    }
  }
  update(dt) { this.t += dt; }
  button(b) {
    const app = this.app;
    if (b === 'C') { app.sfx('back'); app.pop(); }
    else if (b === 'A') this.next();
    else if (b === 'B') this.accept();
  }
  tap(x, y) {
    const { y: ry, h: rh } = LAYOUT.room;
    if (y < ry || y >= ry + rh) return false;
    if (y < ry + 12) this.button('C');
    else if (y > ry + rh - 26) (x < W / 2 ? this.next() : this.accept());
    return true;
  }
  next() {
    const p = findPartner(this.app.game);
    if (!p) { this.app.sfx('nope'); this.app.toast('No one else today!'); return; }
    this.partner = p;
    this.t = 0;
    this.app.sfx('blip');
  }
  accept() {
    this.app.sfx('wedding');
    this.app.push(new WeddingScene(this.app, this.partner));
  }
  draw(scr) {
    if (!this.partner) return;
    const pet = this.app.game.pet, p = this.partner;
    const { y: ry, h: rh } = LAYOUT.room;
    scr.rect(0, ry, W, rh, C('pink.3'));
    for (let i = 0; i < 10; i++) {
      const x = (i * 29 + Math.floor(this.t / 40)) % (W + 10) - 5, y = ry + 16 + ((i * 41) % 60);
      scr.draw(HEART, x, y, { solid: C('pink.2') });
    }
    titleBar(scr, '◀ MATCHMAKER', ry);
    const floor = ry + 92;
    scr.rect(0, floor, W, 4, C('pink.2'));
    scr.bitmap(composePet(pet.phenotype, 'adult', { gender: pet.gender }), 34 - CANVAS / 2, floor - GROUND);
    const bounce = this.t < 400 ? Math.round(Math.sin(this.t / 400 * Math.PI) * 6) : 0;
    scr.bitmap(composePet(p.phenotype, 'adult', { gender: p.gender, expr: Math.floor(this.t / 1600) % 4 === 3 ? 'happy' : 'idle' }), 94 - CANVAS / 2, floor - GROUND - bounce, true);
    scr.draw(HEART, W / 2 - 4, floor - 30 - (Math.floor(this.t / 300) % 2), {});
    text(scr, `${pet.name} ${sym(pet.gender)}`, 34, floor + 8, COL.ink, { align: 'center' });
    text(scr, `${p.name} ${sym(p.gender)}`, 94, floor + 8, COL.ink, { align: 'center' });
    text(scr, `MARRY ${p.name.toUpperCase()}?`, W / 2, floor + 22, COL.accent, { align: 'center' });
    const left = this.app.game.matchmaker.left;
    const by = ry + rh - 22;
    scr.panel(6, by, 54, 16, C('white'), COL.ink);
    text(scr, `A: NEXT (${left})`, 33, by + 6, left ? COL.ink : COL.silver, { align: 'center' });
    scr.panel(68, by, 54, 16, COL.hi, COL.ink);
    text(scr, 'B: MARRY ♥', 95, by + 6, COL.ink, { align: 'center' });
  }
}

class WeddingScene {
  constructor(app, partner) {
    this.app = app;
    this.partner = partner;
    this.t = 0;
    this.done = false;
  }
  update(dt) {
    this.t += dt;
    if (this.t > 5200 && !this.done) this.finish();
  }
  button(b) { if (b === 'B' && this.t > 4200) this.finish(); }
  tap() { if (this.t > 4200) this.finish(); return true; }
  finish() {
    if (this.done) return;
    this.done = true;
    const app = this.app;
    const old = app.game.pet.name;
    const egg = marry(app.game, this.partner);
    app.home();
    app.sfx('hatch');
    app.toast(`${old} and ${this.partner.name} left a new egg! Generation ${egg.generation}`, 3500);
    app.save();
  }
  draw(scr) {
    const pet = this.app.game.pet, p = this.partner;
    const { y: ry, h: rh } = LAYOUT.room;
    const t = this.t;
    scr.rect(0, ry, W, rh, C('white'));
    // arch of flowers
    for (let a = 0; a <= 20; a++) {
      const ang = Math.PI * a / 20;
      const x = W / 2 - Math.cos(ang) * 50, y = ry + 92 - Math.sin(ang) * 66;
      scr.rect(Math.round(x) - 2, Math.round(y) - 2, 5, 5, a % 2 ? C('pink.2') : C('gold.2'));
      scr.pset(Math.round(x), Math.round(y), C('white'));
    }
    const floor = ry + 120;
    scr.rect(0, floor, W, rh - (floor - ry), C('pink.3'));
    scr.hline(0, floor, W, C('pink.2'));
    const k = Math.min(1, t / 1800);
    const gap = Math.round(30 - k * 14);
    const happy = t > 1800 ? 'happy' : 'idle';
    if (t < 4200) {
      scr.bitmap(composePet(pet.phenotype, 'adult', { gender: pet.gender, expr: happy }), W / 2 - gap - CANVAS / 2, floor - GROUND);
      scr.bitmap(composePet(p.phenotype, 'adult', { gender: p.gender, expr: happy }), W / 2 + gap - CANVAS / 2, floor - GROUND, true);
      if (t > 1800) {
        scr.draw(RING, W / 2 - 3, floor - 46 - (Math.floor(t / 250) % 2), {});
        for (let i = 0; i < 6; i++) {
          const hy = floor - 30 - ((t / 20 + i * 23) % 60);
          scr.draw(HEART, W / 2 - 30 + i * 11, hy, {});
        }
      }
    } else {
      // a new egg!
      const wob = Math.floor(t / 150) % 2 ? 1 : -1;
      scr.bitmap(composeEgg(null, 0, wob), W / 2 - CANVAS / 2, floor - GROUND);
      for (let i = 0; i < 4; i++) {
        const ang = t / 300 + i * Math.PI / 2;
        scr.draw(SPARKLE, W / 2 - 2 + Math.cos(ang) * 20, floor - 14 + Math.sin(ang) * 12, { frame: i % 2 });
      }
    }
    text(scr, t < 4200 ? 'CONGRATULATIONS!' : 'A NEW EGG!', W / 2, ry + 8, COL.accent, { align: 'center' });
  }
}

export class AlbumScene extends ListMenu {
  constructor(app) {
    const album = app.game.album;
    const items = album.map((e, i) => ({
      label: `G${e.generation} ${e.name}`,
      right: e.fate === 'married' ? '♥' : e.fate === 'died' ? 'RIP' : 'BYE',
      action: () => app.push(new AlbumPage(app, i)),
    })).reverse();
    super(app, 'FAMILY ALBUM', items, { footer: `${album.length} MEMBERS` });
  }
}

class AlbumPage {
  constructor(app, i) { this.app = app; this.i = i; }
  button(b, dir = 1) {
    const n = this.app.game.album.length;
    if (b === 'C' || b === 'B') { this.app.sfx('back'); this.app.pop(); }
    else if (b === 'A') { this.i = (this.i - dir + n) % n; this.app.sfx('blip'); }
  }
  tap(x, y) { if (y >= LAYOUT.room.y && y < LAYOUT.room.y + LAYOUT.room.h) { this.button('C'); return true; } return false; }
  draw(scr) {
    const e = this.app.game.album[this.i];
    const { y: ry, h: rh } = LAYOUT.room;
    scr.rect(0, ry, W, rh, COL.panel);
    titleBar(scr, `◀ GENERATION ${e.generation}`, ry);
    const floor = ry + 76;
    scr.panel(8, ry + 16, W - 16, 64, C('sky.3'), COL.ink);
    if (e.partner) {
      scr.bitmap(composePet(e.phenotype, e.stage, { gender: e.gender, expr: 'happy' }), 40 - CANVAS / 2, floor - GROUND);
      scr.bitmap(composePet(e.partner.phenotype, 'adult', { gender: e.gender === 'f' ? 'm' : 'f', expr: 'happy' }), 88 - CANVAS / 2, floor - GROUND, true);
      scr.draw(HEART, W / 2 - 3, floor - 34, {});
    } else {
      scr.bitmap(composePet(e.phenotype, e.stage === 'egg' ? 'baby' : e.stage, { gender: e.gender, expr: e.fate === 'died' ? 'sleep' : 'sad' }), W / 2 - CANVAS / 2, floor - GROUND);
    }
    let y = ry + 86;
    const line = (a, b) => { text(scr, a, 8, y, COL.gray); text(scr, String(b).toUpperCase(), W - 8, y, COL.ink, { align: 'right' }); y += 9; };
    line('NAME', `${e.name} ${sym(e.gender)}`);
    if (e.species) line('KIND', e.species);
    line('LIVED', `${Math.max(1, Math.round(e.ageMs / 86400000))} DAYS`);
    line('STORY', e.fate === 'married' ? `MARRIED ${e.partner.name}` : e.fate === 'died' ? 'RETURNED TO STARS' : 'RAN AWAY');
    text(scr, 'A: FLIP PAGE', W / 2, ry + rh - 10, COL.gray, { align: 'center' });
  }
}
