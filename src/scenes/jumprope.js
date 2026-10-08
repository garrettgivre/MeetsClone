// Jump Rope: press B (or tap) to jump as the rope swings under your pet.
// Aim for 30 jumps. Earns Gotchi Points and happiness.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, text, dialog } from '../ui.js';
import { composePet, CANVAS, GROUND } from '../game/render.js';
import { earn } from '../game/pet.js';

const GOAL = 30;

export class JumpRopeScene {
  constructor(app) {
    this.app = app;
    this.state = 'ready';
    this.t = 0;
    this.angle = Math.PI;    // rope starts at the top
    this.speed = 2.6;        // radians per second
    this.jumpT = -1;
    this.count = 0;
    this.reward = 0;
  }
  get pet() { return this.app.game.pet; }

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
    const app = this.app, pet = this.pet;
    this.state = 'over';
    this.t = 0;
    this.won = won;
    this.reward = this.count * 2 + (won ? 30 : 0);
    earn(app.game, this.reward);
    if (this.count >= 5 && pet) pet.happy = Math.min(4, pet.happy + 1);
    app.sfx(won ? 'happy' : 'fail');
    app.save();
  }
  draw(scr) {
    const { y: ry, h: rh } = LAYOUT.room;
    const floor = ry + 130;
    // park
    scr.rect(0, ry, W, rh, C('sky.3'));
    scr.rect(14, ry + 16, 14, 4, C('white')); scr.rect(17, ry + 13, 8, 3, C('white'));
    scr.rect(84, ry + 26, 18, 4, C('white')); scr.rect(88, ry + 23, 9, 3, C('white'));
    scr.rect(0, floor - 10, W, rh - (floor - 10 - ry), C('green.2'));
    scr.hline(0, floor - 10, W, C('green.1'));
    for (let x = 3; x < W; x += 9) scr.pset(x, floor - 6 + (x % 3), C('green.1'));
    // posts
    const hy = floor - 22;
    for (const px of [10, W - 12]) { scr.rect(px, hy, 3, 22, C('brown.2')); scr.box(px - 1, hy - 1, 5, 23, COL.ink); }

    const ropeDepth = Math.cos(this.angle) * 24; // + = rope swung down/in front
    const drawRope = () => {
      for (let x = 12; x <= W - 11; x++) {
        const u = (x - 64) / 53;
        scr.pset(x, Math.round(hy + 1 + ropeDepth * (1 - u * u)), C('red.1'));
        scr.pset(x, Math.round(hy + 2 + ropeDepth * (1 - u * u)), C('red.0'));
      }
    };
    const front = Math.sin(this.angle) < 0 || ropeDepth > 18;
    if (!front) drawRope();
    const pet = this.pet;
    const expr = this.state === 'over' ? (this.won ? 'happy' : 'dizzy') : this.height() > 0 ? 'happy' : 'idle';
    const bm = composePet(pet.phenotype, pet.stage, { expr, gender: pet.gender });
    scr.bitmap(bm, W / 2 - CANVAS / 2, floor - GROUND - this.height());
    if (front) drawRope();

    // HUD
    scr.panel(3, ry + 3, 46, 11, C('white'), COL.ink);
    text(scr, `JUMPS ${this.count}`, 7, ry + 6, COL.ink);
    scr.panel(W - 47, ry + 3, 44, 11, C('white'), COL.ink);
    text(scr, `GOAL ${GOAL}`, W - 43, ry + 6, COL.accent);

    if (this.state === 'ready') dialog(scr, 'JUMP ROPE\nPress B or tap to jump when the rope swings low!', { y: ry + 40 });
    if (this.state === 'over') {
      const msg = this.won ? `PERFECT! ${GOAL} jumps!` : this.count ? `${this.count} jumps!` : 'Oops! Tripped!';
      dialog(scr, `${msg}\n+${this.reward} points`, { y: ry + 40, title: this.won ? 'CLEAR!' : 'GAME OVER' });
    }
  }
}
