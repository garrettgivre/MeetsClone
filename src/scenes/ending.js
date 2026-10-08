// Shown when a pet passes away or runs away. B starts a new egg.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, text, wrap, LINE_H } from '../ui.js';
import { composeGhost, CANVAS } from '../game/render.js';
import { startOver } from '../game/pet.js';

export class EndingScene {
  constructor(app, kind) {
    this.app = app;
    this.kind = kind; // 'death' | 'runaway'
    this.t = 0;
    const pet = app.game.pet;
    this.name = pet?.name || 'Your pet';
    app.sfx('sad');
    app.save();
  }
  update(dt) { this.t += dt; }
  button(b) { if (b === 'B' && this.t > 1200) this.next(); }
  tap() { if (this.t > 1200) this.next(); return true; }
  next() {
    const app = this.app;
    startOver(app.game);
    app.home();
    app.sfx('hatch');
    app.toast('A new egg appeared!');
    app.save();
  }
  draw(scr) {
    const { y: ry, h: rh } = LAYOUT.room;
    const died = this.kind === 'death';
    scr.rect(0, ry, W, rh, died ? C('indigo.0') : C('slate.1'));
    // twinkling stars
    for (let i = 0; i < 18; i++) {
      const x = (i * 37) % W, y = ry + 4 + ((i * 53) % 70);
      if ((Math.floor(this.t / 300) + i) % 3) scr.pset(x, y, C('gold.3'));
    }
    if (died) {
      const f = Math.floor(this.t / 600) % 2;
      scr.bitmap(composeGhost(f), W / 2 - CANVAS / 2, ry + 30 - Math.round(this.t / 200) % 3);
    } else {
      // a little note left on the floor
      scr.panel(W / 2 - 14, ry + 50, 28, 22, C('white'), COL.ink);
      for (let i = 0; i < 3; i++) scr.hline(W / 2 - 9, ry + 56 + i * 4, 18, C('silver'));
    }
    const msg = died
      ? `${this.name} has returned to the stars.`
      : `${this.name} ran away... It felt lonely.`;
    let y = ry + 96;
    for (const l of wrap(msg, W - 16)) { text(scr, l, W / 2, y, COL.white, { align: 'center' }); y += LINE_H; }
    y += 4;
    const tip = died ? 'Keep it fed, clean and healthy next time.' : 'Play and give treats so it stays happy.';
    for (const l of wrap(tip, W - 16)) { text(scr, l, W / 2, y, C('sky.3'), { align: 'center' }); y += LINE_H; }
    if (this.t > 1200 && Math.floor(this.t / 500) % 2) text(scr, 'B: NEW EGG', W / 2, ry + rh - 12, C('gold.3'), { align: 'center' });
  }
}
