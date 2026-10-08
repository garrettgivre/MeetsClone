// Shown when a pet passes away or runs away. B starts a new egg.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, text, wrap, LINE_H } from '../ui.js';
import { composeGhost, CANVAS } from '../game/render.js';
import { startOver } from '../game/pet.js';
import { backdrop } from '../art/town.js';
import { SPARKLE, LETTER } from '../art/icons.js';
import { drawRoom, drawRoomFront } from './room.js';

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
    const msg = wrap(died ? `${this.name} has returned to the stars.` : `${this.name} ran away... It felt lonely.`, W - 20);
    const tip = wrap(died ? 'Keep it fed, clean and healthy next time.' : 'Play and give treats so it stays happy.', W - 20);
    const again = this.t > 1200 && Math.floor(this.t / 500) % 2;
    if (died) {
      // a hilltop under the stars, a few of them twinkling
      scr.bitmap(backdrop('farewell'), 0, ry);
      [[14, 20], [40, 44], [70, 12], [96, 58], [112, 30], [56, 70]].forEach(([x, y], i) => {
        const f = (Math.floor(this.t / 300) + i) % 4;
        if (f < 2) scr.draw(SPARKLE, x, ry + y, { frame: 1 - f });
      });
      const f = Math.floor(this.t / 600) % 2;
      scr.bitmap(composeGhost(f), W / 2 - CANVAS / 2, ry + 30 - Math.round(this.t / 200) % 3);
      let y = ry + 100;
      for (const l of msg) { text(scr, l, W / 2, y, COL.white, { align: 'center' }); y += LINE_H; }
      y += 4;
      for (const l of tip) { text(scr, l, W / 2, y, C('sky.3'), { align: 'center' }); y += LINE_H; }
      if (again) text(scr, 'B: NEW EGG', W / 2, ry + rh - 12, C('gold.3'), { align: 'center' });
    } else {
      // its own room, empty, and the note it left on the rug
      const now = this.app.game.simTime;
      drawRoom(scr, now, this.app.time, false);
      scr.draw(LETTER, W / 2 - 8, ry + 122, {});
      drawRoomFront(scr, now, false);
      const h = (msg.length + tip.length) * LINE_H + 13;
      scr.panel(6, ry + 6, W - 12, h, C('white'), COL.ink);
      let y = ry + 11;
      for (const l of msg) { text(scr, l, W / 2, y, COL.ink, { align: 'center' }); y += LINE_H; }
      y += 4;
      for (const l of tip) { text(scr, l, W / 2, y, COL.shade, { align: 'center' }); y += LINE_H; }
      if (again) { scr.panel(W / 2 - 26, ry + rh - 16, 52, 11, COL.hi, COL.ink); text(scr, 'B: NEW EGG', W / 2, ry + rh - 13, COL.ink, { align: 'center' }); }
    }
  }
}
