// Decorating the room, three-button style: A steps through the room's slots,
// B changes what is in the slot, C is done. The room itself is the preview:
// the home screen keeps drawing underneath, so every change shows at once.
// Tapping a spot in the room picks the slot nearest to it; tapping the bar
// at the bottom changes it.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, titleBar, text } from '../ui.js';
import { POINTER } from '../art/icons.js';
import { ROOMS, SLOTS, SETS, DECOR, roomOf, layoutOf, optionsFor, cycle, themeOf } from '../game/decor.js';

// Where each slot is in the room (normal pixels from the room's top left), for the pointer and for taps.
const SPOT = {
  bedroom: {
    wall: [47, 58], floor: [30, 104], window: [31, 14], picture: [69, 30], shelf: [103, 26],
    lamp: [73, 66], bed: [108, 72], rug: [62, 122], corner: [16, 134], plant: [119, 134],
  },
  kitchen: {
    wall: [118, 22], floor: [64, 104], window: [71, 30], stove: [30, 48], counter: [104, 82], shelf: [107, 40],
    table: [16, 132], seat: [117, 134],
  },
  bathroom: {
    wall: [64, 16], floor: [64, 104], window: [102, 20], mirror: [42, 34], cabinet: [102, 70], mat: [62, 122],
    plant: [12, 132], towels: [117, 132],
  },
  garden: {
    ground: [64, 100], fence: [84, 66], tree: [20, 72], feature: [88, 76], flowers: [20, 142], seat: [114, 142],
  },
};
const BAR_H = 24;
const LOW = new Set(['rug', 'corner', 'plant', 'floor', 'table', 'seat', 'mat', 'towels', 'ground', 'flowers']); // slots the bar would hide at the bottom, so it moves up for them

export class DecorateScene {
  constructor(app) {
    this.app = app;
    this.room = roomOf(app.game);
    this.i = 0;
    this.t = 0;
  }
  get slots() { return ROOMS[this.room].slots; }
  get slot() { return this.slots[this.i]; }
  /** The top of the bar: along the bottom of the room, or under the title for things down on the floor. */
  get barY() { const { y, h } = LAYOUT.room; return LOW.has(this.slot) ? y + 13 : y + h - BAR_H; }
  update(dt) { this.t += dt; }
  button(b, dir = 1) {
    const app = this.app;
    if (b === 'C') { app.sfx('back'); app.save(); app.pop(); return; }
    if (b === 'A') { this.i = (this.i + dir + this.slots.length) % this.slots.length; this.t = 0; app.sfx('blip'); }
    if (b === 'B') this.change();
  }
  change() {
    const app = this.app, g = app.game;
    const r = cycle(g, this.room, this.slot);
    if (!r.ok) { app.sfx('nope'); app.toast('Only one of these so far. The Department Store in Uptown sells more.', 2600); return; }
    app.sfx('select');
    if (r.bonus) { app.sfx('happy'); app.toast(`A perfect ${SETS[r.theme].name} room! +${r.bonus} points`, 3200); }
    app.save();
  }
  tap(x, y) {
    const { y: ry, h: rh } = LAYOUT.room;
    if (y < ry || y >= ry + rh) return false;
    if (y < ry + 12) { this.button('C'); return true; }
    if (y >= this.barY && y < this.barY + BAR_H) { this.change(); return true; }
    // the slot nearest the tap; tapping the one already picked changes it
    let best = 0, bestD = Infinity;
    this.slots.forEach((s, i) => {
      const [sx, sy] = SPOT[this.room][s];
      const d = (sx - x) ** 2 + (ry + sy - y) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best === this.i) this.change();
    else { this.i = best; this.t = 0; this.app.sfx('blip'); }
    return true;
  }
  draw(scr) {
    const g = this.app.game;
    const { y: ry, h: rh } = LAYOUT.room;
    const layout = layoutOf(g, this.room);
    const theme = themeOf(layout);
    titleBar(scr, theme ? `◀ ${SETS[theme].name.toUpperCase()} ★` : '◀ DECORATE', ry);
    // a pointer bobbing over the slot being changed
    const [sx, sy] = SPOT[this.room][this.slot];
    scr.draw(POINTER, sx - 4, ry + sy - 10 + (Math.floor(this.t / 300) % 2), {});
    // the bar: which slot, what is in it, and how many there are to choose from
    const by = this.barY;
    const opts = optionsFor(g, this.room, this.slot), item = DECOR[layout[this.slot]];
    scr.panel(2, by, W - 4, BAR_H - 2, C('white'), COL.ink);
    text(scr, SLOTS[this.slot].label.toUpperCase(), 7, by + 4, COL.accent);
    text(scr, `${opts.indexOf(item.id) + 1}/${opts.length}`, W - 7, by + 4, COL.gray, { align: 'right' });
    text(scr, item.name.toUpperCase(), W / 2, by + 13, COL.ink, { align: 'center' });
    if (opts.length > 1) { text(scr, '◀', 7, by + 13, COL.shade); text(scr, '▶', W - 7, by + 13, COL.shade, { align: 'right' }); }
  }
}
