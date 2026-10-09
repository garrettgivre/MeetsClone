// Quick minigames in the spirit of the original device: Which Way? (guess
// where your pet will hop), Snack Catch (catch falling treats, dodge rocks)
// and Copy Me (repeat your pet's left/right dance). Each one pays Gotchi
// Points, cheers the pet up after a good game, and burns off a little weight.
// Controls: A = left, B = right (or tap the left/right half of the room), C = quit.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, text, dialog } from '../ui.js';
import { composePet, CANVAS, GROUND } from '../game/render.js';
import { FOOD_ART, ROCK } from '../art/icons.js';
import { backdrop } from '../art/town.js';
import { drawPlaceSky, skyState } from './room.js';
import { finishGame, learnedLine } from '../game/pet.js';

const FLOOR_OFF = 130; // floor line, from the top of the room

/** Shared bits: the games field, score panels, the ready/result dialogs. */
class MiniGame {
  constructor(app, title, help) {
    this.app = app;
    this.title = title;
    this.help = help;
    this.state = 'ready';
    this.t = 0;
    this.reward = 0;
  }
  get pet() { return this.app.game.pet; }
  get openAir() { return 'playfield'; } // the bars carry the field's sky and grass on
  get floor() { return LAYOUT.room.y + FLOOR_OFF; }

  button(b) {
    if (b === 'C') { this.app.sfx('back'); this.app.pop(); return; }
    if (b === 'A' || b === 'B') this.press(b === 'A' ? -1 : 1);
  }
  tap(x, y) {
    if (y < LAYOUT.room.y || y >= LAYOUT.room.y + LAYOUT.room.h) return false;
    this.press(x < W / 2 ? -1 : 1, x);
    return true;
  }
  press(side, x) {
    if (this.state === 'ready') { this.state = 'play'; this.t = 0; this.app.sfx('select'); this.start?.(); return; }
    if (this.state === 'over') { if (this.t > 600) this.app.pop(); return; }
    this.input(side, x);
  }
  update(dt) {
    this.t += dt;
    if (this.state === 'play') this.tick(dt);
  }
  /** End the game: pay out and show the result. */
  finish(points, good, msg) {
    this.state = 'over';
    this.t = 0;
    this.good = good;
    this.msg = msg;
    this.reward = finishGame(this.app.game, { points, good, skill: this.skill });
    this.learned = learnedLine(this.app.game);
    this.app.sfx(good ? 'happy' : 'fail');
    this.app.save();
  }
  drawPark(scr) {
    const now = this.app.game.simTime;
    drawPlaceSky(scr, now, this.app.time);
    scr.bitmap(backdrop('playfield', skyState(new Date(now).getHours())), 0, LAYOUT.room.y);
  }
  drawPet(scr, x, { expr = 'idle', arms = 'down', flip = false, dy = 0 } = {}) {
    const pet = this.pet;
    const bm = composePet(pet.phenotype, pet.stage, { expr, arms, gender: pet.gender, wear: pet.wear, species: pet.species });
    scr.bitmap(bm, Math.round(x - CANVAS / 2), this.floor - GROUND - dy, flip);
  }
  hud(scr, left, right) {
    const ry = LAYOUT.room.y;
    scr.panel(3, ry + 3, 50, 11, C('white'), COL.ink);
    text(scr, left, 7, ry + 6, COL.ink);
    scr.panel(W - 51, ry + 3, 48, 11, C('white'), COL.ink);
    text(scr, right, W - 47, ry + 6, COL.accent);
  }
  drawDialogs(scr) {
    const ry = LAYOUT.room.y;
    if (this.state === 'ready') dialog(scr, `${this.title}\n${this.help}`, { y: ry + 36 });
    if (this.state === 'over') dialog(scr, `${this.msg}\n+${this.reward} points${this.learned ? '\n' + this.learned : ''}`, { y: ry + 36, title: this.good ? 'NICE!' : 'GAME OVER' });
  }
}

/** Arrow buttons along the bottom of the room, lit when pressed. */
function sideButtons(scr, lit = 0) {
  const y = LAYOUT.room.y + LAYOUT.room.h - 16;
  for (const side of [-1, 1]) {
    const x = side < 0 ? 6 : W - 34;
    scr.panel(x, y, 28, 12, lit === side ? COL.hi : C('white'), COL.ink);
    text(scr, side < 0 ? '◀ A' : 'B ▶', x + 14, y + 4, COL.ink, { align: 'center' });
  }
}

// ---------------------------------------------------------------- Which Way?
const WW_ROUNDS = 5;

export class WhichWayScene extends MiniGame {
  constructor(app) {
    super(app, 'WHICH WAY?', 'Guess which way your pet will hop: A or tap left, B or tap right.');
    this.skill = 'smart';
    this.round = 0;
    this.wins = 0;
    this.phase = 'guess'; // guess -> show
    this.guess = 0;
    this.hop = 0;
  }
  input(side) {
    if (this.phase !== 'guess') return;
    this.guess = side;
    this.hop = Math.random() < 0.5 ? -1 : 1;
    this.phase = 'show';
    this.showT = 0;
    if (this.guess === this.hop) { this.wins++; this.app.sfx('happy'); } else this.app.sfx('nope');
  }
  tick(dt) {
    if (this.phase !== 'show') return;
    this.showT += dt;
    if (this.showT < 1200) return;
    this.round++;
    this.phase = 'guess';
    this.guess = 0;
    if (this.round >= WW_ROUNDS) {
      const perfect = this.wins === WW_ROUNDS;
      this.finish(this.wins * 10 + (perfect ? 20 : 0), this.wins >= 3, perfect ? 'PERFECT! 5 out of 5!' : `${this.wins} out of ${WW_ROUNDS} right!`);
    }
  }
  draw(scr) {
    this.drawPark(scr);
    const showing = this.state === 'play' && this.phase === 'show';
    const k = showing ? Math.min(1, this.showT / 350) : 0;
    const x = W / 2 + (showing ? this.hop * Math.round(k * 26) : 0);
    const dy = showing ? Math.round(Math.sin(k * Math.PI) * 12) : 0;
    const right = showing && this.guess === this.hop;
    const expr = this.state === 'over' ? (this.good ? 'happy' : 'sad') : showing && k >= 1 ? (right ? 'happy' : 'wink') : 'idle';
    this.drawPet(scr, x, { expr, flip: showing && this.hop > 0, arms: right && k >= 1 ? 'up' : 'down', dy });
    if (this.state === 'play' && this.phase === 'guess' && Math.floor(this.t / 400) % 2) text(scr, '?', W / 2, this.floor - 66, COL.ink, { align: 'center' });
    if (showing && k >= 1) text(scr, right ? 'YES!' : 'NOPE!', W / 2, LAYOUT.room.y + 24, right ? COL.good : COL.bad, { align: 'center' });
    this.hud(scr, `ROUND ${Math.min(this.round + 1, WW_ROUNDS)}/${WW_ROUNDS}`, `RIGHT ${this.wins}`);
    if (this.state === 'play') sideButtons(scr, this.guess);
    this.drawDialogs(scr);
  }
}

// ---------------------------------------------------------------- Snack Catch
const SC_TIME = 25000;
const SC_TREATS = ['cookie', 'candy', 'icecream', 'juice', 'fruitbowl', 'pancake', 'riceball'];

export class SnackCatchScene extends MiniGame {
  constructor(app) {
    super(app, 'SNACK CATCH', 'Catch the treats, dodge the rocks! A/B or tap to move.');
    this.skill = 'fit';
    this.x = W / 2;
    this.target = W / 2;
    this.items = [];
    this.next = 0;
    this.caught = 0;
    this.bonk = 0;
  }
  input(side, tapX) {
    this.target = tapX !== undefined ? tapX : this.target + side * 20;
    this.target = Math.max(14, Math.min(W - 14, this.target));
  }
  tick(dt) {
    const left = SC_TIME - this.t;
    if (left <= 0) {
      const n = this.caught;
      return this.finish(n * 3, n >= 10, n ? `Caught ${n} treats!` : 'Nothing caught...');
    }
    this.bonk = Math.max(0, this.bonk - dt);
    // the pet walks toward where you want it (slower while seeing stars)
    const speed = (this.bonk ? 0.03 : 0.11) * dt;
    const d = this.target - this.x;
    this.x += Math.sign(d) * Math.min(Math.abs(d), speed);
    // drop things, faster as time runs out
    this.next -= dt;
    if (this.next <= 0) {
      const rock = Math.random() < 0.28;
      this.items.push({ x: 12 + Math.random() * (W - 24), y: LAYOUT.room.y + 14, vy: 0.035 + (this.t / SC_TIME) * 0.035, rock, food: SC_TREATS[Math.floor(Math.random() * SC_TREATS.length)] });
      this.next = 900 - (this.t / SC_TIME) * 450;
    }
    const mouth = this.floor - 24;
    for (const it of this.items) {
      it.y += it.vy * dt;
      if (!it.done && it.y >= mouth && it.y < mouth + 10 && Math.abs(it.x - this.x) < 13) {
        it.done = true;
        if (it.rock) { this.bonk = 1000; this.caught = Math.max(0, this.caught - 2); this.app.sfx('fail'); }
        else { this.caught++; this.app.sfx('blip'); }
      }
    }
    this.items = this.items.filter(it => !it.done && it.y < this.floor);
  }
  draw(scr) {
    this.drawPark(scr);
    for (const it of this.items) {
      const x = Math.round(it.x), y = Math.round(it.y);
      if (it.rock) scr.draw(ROCK, x - 3, y - 3, {});
      else {
        const spr = FOOD_ART[it.food];
        scr.draw(spr, x - Math.floor(spr.w / 2), y - Math.floor(spr.h / 2), {});
      }
    }
    const over = this.state === 'over';
    const expr = over ? (this.good ? 'happy' : 'sad') : this.bonk ? 'dizzy' : 'eat';
    this.drawPet(scr, this.x, { expr, flip: this.target > this.x, arms: over && this.good ? 'up' : 'out' });
    const secs = Math.max(0, Math.ceil((SC_TIME - (this.state === 'play' ? this.t : 0)) / 1000));
    this.hud(scr, `CAUGHT ${this.caught}`, `TIME ${this.state === 'over' ? 0 : secs}`);
    this.drawDialogs(scr);
  }
}

// ---------------------------------------------------------------- Copy Me
const CM_START = 3, CM_MAX = 9, CM_STEP = 650;

export class CopyMeScene extends MiniGame {
  constructor(app) {
    super(app, 'COPY ME', 'Watch the dance, then copy it: A or tap left, B or tap right.');
    this.skill = 'creative';
    this.seq = [];
    this.best = 0;
  }
  start() { this.newRound(CM_START); }
  newRound(n) {
    this.seq = Array.from({ length: n }, () => (Math.random() < 0.5 ? -1 : 1));
    this.phase = 'watch';
    this.phaseT = -500;
    this.pos = 0;
    this.lit = 0;
  }
  input(side) {
    if (this.phase !== 'copy') return;
    this.lit = side;
    this.litT = 300;
    this.app.sfx(side < 0 ? 'left' : 'right');
    if (side !== this.seq[this.pos]) {
      this.phase = 'done';
      const n = this.best;
      return this.finish(Math.max(0, n - 2) * 8, n >= 5, n ? `Copied ${n} moves!` : 'Oops! Wrong way!');
    }
    this.pos++;
    if (this.pos >= this.seq.length) {
      this.best = this.seq.length;
      if (this.best >= CM_MAX) { this.phase = 'done'; return this.finish(this.best * 8 + 20, true, `Every move! ${this.best} in a row!`); }
      this.phase = 'pause';
      this.phaseT = 0;
      this.app.sfx('happy');
    }
  }
  tick(dt) {
    this.phaseT += dt;
    if (this.litT > 0) { this.litT -= dt; if (this.litT <= 0) this.lit = 0; }
    if (this.phase === 'watch') {
      const i = Math.floor(this.phaseT / CM_STEP);
      if (this.phaseT >= 0 && i !== this.shown && i < this.seq.length) { this.shown = i; this.app.sfx(this.seq[i] < 0 ? 'left' : 'right'); }
      if (i >= this.seq.length) { this.phase = 'copy'; this.pos = 0; this.shown = -1; }
    } else if (this.phase === 'pause' && this.phaseT > 900) {
      this.newRound(this.seq.length + 1);
    }
  }
  /** The move being shown or copied right now (-1 left, 1 right, 0 none). */
  move() {
    if (this.state !== 'play') return 0;
    if (this.phase === 'watch' && this.phaseT >= 0) {
      const i = Math.floor(this.phaseT / CM_STEP);
      return this.phaseT % CM_STEP < CM_STEP * 0.7 ? this.seq[i] || 0 : 0;
    }
    return this.lit;
  }
  draw(scr) {
    this.drawPark(scr);
    const m = this.move();
    const over = this.state === 'over';
    const expr = over ? (this.good ? 'happy' : 'sad') : this.phase === 'pause' ? 'happy' : m ? 'wink' : 'idle';
    // a lean and a wave toward the side of each move
    this.drawPet(scr, W / 2 + m * 8, { expr, arms: m ? 'wave' : this.phase === 'pause' ? 'up' : 'down', flip: m > 0, dy: m ? 3 : 0 });
    if (m && this.phase === 'watch') text(scr, m < 0 ? '◀' : '▶', W / 2 + m * 30, this.floor - 30, COL.accent, { align: 'center' });
    const label = this.state !== 'play' ? '' : this.phase === 'watch' ? 'WATCH...' : this.phase === 'copy' ? 'YOUR TURN!' : 'GREAT!';
    if (label) text(scr, label, W / 2, LAYOUT.room.y + 24, this.phase === 'copy' ? COL.accent : COL.ink, { align: 'center' });
    this.hud(scr, `MOVES ${this.seq.length || CM_START}`, `BEST ${this.best}`);
    if (this.state === 'play') sideButtons(scr, m); // the button for each move lights up, shown or copied
    this.drawDialogs(scr);
  }
}
