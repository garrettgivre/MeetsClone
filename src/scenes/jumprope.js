// Jump Rope: press B (or tap) to jump as the rope swings under your pet.
// Aim for 30 jumps. Earns Gotchi Points and happiness.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, text, dialog } from '../ui.js';
import { composePet, CANVAS, GROUND } from '../game/render.js';
import { finishGame, learnedLine, SKILL_LABEL } from '../game/pet.js';
import { endShift } from '../game/town.js';
import { backdrop } from '../art/town.js';
import { drawPlaceSky, skyState } from './room.js';

const GOAL = 30;

export class JumpRopeScene {
  /** `opts.job`: this round is a shift at work (see MiniGame in minigames.js). */
  constructor(app, opts = {}) {
    this.app = app;
    this.job = opts.job || null;
    this.state = 'ready';
    this.t = 0;
    this.angle = Math.PI;    // rope starts at the top
    this.speed = 2.6;        // radians per second
    this.jumpT = -1;
    this.count = 0;
    this.reward = 0;
  }
  get pet() { return this.app.game.pet; }
  get openAir() { return 'ropefield'; } // the bars carry the field's sky and grass on

  button(b) {
    if (b === 'C') { this.app.sfx('back'); this.app.pop(); return; }
    if (b === 'B' || b === 'A') this.press();
  }
  tap(x, y) {
    if (y < LAYOUT.room.y || y >= LAYOUT.room.y + LAYOUT.room.h) return false;
    this.press();
    return true;
  }
  press() {
    const app = this.app;
    if (this.state === 'ready') { this.state = 'play'; app.sfx('select'); return; }
    if (this.state === 'over') { if (this.t > 600) app.pop(); return; }
    if (this.jumpT < 0) { this.jumpT = 0; app.sfx('jump'); }
  }
  height() {
    if (this.jumpT < 0) return 0;
    const k = this.jumpT / 520;
    return Math.round(Math.sin(Math.min(1, k) * Math.PI) * 18);
  }
  update(dt) {
    this.t += dt;
    if (this.state !== 'play') return;
    if (this.jumpT >= 0) { this.jumpT += dt; if (this.jumpT > 520) this.jumpT = -1; }
    const before = this.angle;
    this.angle += this.speed * dt / 1000;
    // rope passes the bottom at angle 2πn
    if (Math.floor(before / (Math.PI * 2)) !== Math.floor(this.angle / (Math.PI * 2))) {
      if (this.height() >= 5) {
        this.count++;
        this.app.sfx('blip');
        this.speed = Math.min(6.5, this.speed + 0.11);
        if (this.count >= GOAL) this.finish(true);
      } else this.finish(false);
    }
  }
  finish(won) {
    const app = this.app;
    this.state = 'over';
    this.t = 0;
    this.won = won;
    if (this.job) {
      const r = endShift(app.game, this.count >= 5);
      this.reward = r.pay;
      this.learned = r.promoted ? 'Promoted!' : r.wants ? `Promotion needs ${SKILL_LABEL[this.job.skill]} ${r.wants}` : '';
    } else {
      this.reward = finishGame(app.game, { points: this.count * 2 + (won ? 30 : 0), good: this.count >= 5, skill: 'fit' });
      this.learned = learnedLine(app.game);
    }
    app.sfx(won ? 'happy' : 'fail');
    app.save();
  }
  draw(scr) {
    const { y: ry, h: rh } = LAYOUT.room;
    const floor = ry + 130;
    // the games field, with a post either side (the rope ties on at their rings)
    const now = this.app.game.simTime;
    drawPlaceSky(scr, now, this.app.time);
    scr.bitmap(backdrop('ropefield', skyState(new Date(now).getHours())), 0, ry);
    const hy = floor - 22;

    const ropeDepth = Math.cos(this.angle) * 24; // + = rope swung down/in front
    // the rope, three fine pixels thick, lit from above
    const drawRope = () => {
      for (let x = 25; x <= 233; x++) {
        const u = (x / 2 - 64) / 53;
        const y = Math.round((hy + 1 + ropeDepth * (1 - u * u)) * 2);
        scr.hpset(x, y, C('red.2')); scr.hpset(x, y + 1, C('red.1')); scr.hpset(x, y + 2, C('red.0'));
      }
    };
    const front = Math.sin(this.angle) < 0 || ropeDepth > 18;
    if (!front) drawRope();
    const pet = this.pet;
    const expr = this.state === 'over' ? (this.won ? 'happy' : 'dizzy') : this.height() > 0 ? 'happy' : 'idle';
    const bm = composePet(pet.phenotype, pet.stage, { expr, gender: pet.gender, wear: pet.wear, species: pet.species, arms: this.height() > 0 || (this.state === 'over' && this.won) ? 'up' : 'out' });
    scr.bitmap(bm, W / 2 - CANVAS / 2, floor - GROUND - this.height());
    if (front) drawRope();

    // HUD
    scr.panel(3, ry + 3, 46, 11, C('white'), COL.ink);
    text(scr, `JUMPS ${this.count}`, 7, ry + 6, COL.ink);
    scr.panel(W - 47, ry + 3, 44, 11, C('white'), COL.ink);
    text(scr, `GOAL ${GOAL}`, W - 43, ry + 6, COL.accent);

    if (this.state === 'ready') dialog(scr, `${this.job ? `AT WORK: ${this.job.name.toUpperCase()}` : 'JUMP ROPE'}\nPress B or tap to jump when the rope swings low!`, { y: ry + 40 });
    if (this.state === 'over') {
      const msg = this.won ? `PERFECT! ${GOAL} jumps!` : this.count ? `${this.count} jumps!` : 'Oops! Tripped!';
      dialog(scr, `${msg}\n+${this.reward} points${this.learned ? '\n' + this.learned : ''}`, { y: ry + 40, title: this.won ? 'CLEAR!' : 'GAME OVER' });
    }
  }
}
