// Shared layout and drawing helpers for scenes.
import { C } from './engine/palette.js';
import { text, wrap, measure, LINE_H } from './engine/font.js';
import { W, H } from './engine/screen.js';
import { HEART, HEART_EMPTY, RICE, RICE_EMPTY, ARROW } from './art/icons.js';

export const LAYOUT = {
  status: { y: 0, h: 12 },
  top: { y: 12, h: 22 },
  room: { y: 34, h: 156 },
  bottom: { y: 190, h: 22 },
  info: { y: 212, h: 12 },
};
export const ROOM_FLOOR = LAYOUT.room.y + 128; // y where pets stand

export const COL = {
  ink: C('ink'), white: C('white'), mist: C('mist'), silver: C('silver'), gray: C('gray'),
  panel: C('cream.3'), panelLine: C('ink'), hi: C('pink.3'), hiDark: C('pink.2'),
  bar: C('cream.2'), accent: C('pink.1'), good: C('green.1'), bad: C('red.1'), gold: C('gold.1'),
  night: C('night'), shade: C('shade'),
};

/** A centred dialog panel with wrapped text. Returns the panel rect. */
export function dialog(scr, msg, { y = null, w = 112, title = null } = {}) {
  const lines = wrap(msg, w - 10);
  const h = lines.length * LINE_H + 9 + (title ? LINE_H + 2 : 0);
  const x = Math.floor((W - w) / 2);
  y = y ?? Math.floor(LAYOUT.room.y + (LAYOUT.room.h - h) / 2);
  scr.panel(x, y, w, h, COL.white, COL.ink);
  scr.hline(x + 2, y + h, w - 3, COL.silver);
  let ty = y + 5;
  if (title) { text(scr, title, W / 2, ty, COL.accent, { align: 'center' }); ty += LINE_H + 2; }
  for (const l of lines) { text(scr, l, W / 2, ty, COL.ink, { align: 'center' }); ty += LINE_H; }
  return { x, y, w, h };
}

/** Row of up to 4 hearts. */
export function heartRow(scr, x, y, value, kind = 'heart') {
  const full = kind === 'rice' ? RICE : HEART, empty = kind === 'rice' ? RICE_EMPTY : HEART_EMPTY;
  for (let i = 0; i < 4; i++) scr.draw(i < value ? full : empty, x + i * 9, y);
}

/** Title bar used at the top of full-screen menus. */
export function titleBar(scr, title, y = LAYOUT.room.y) {
  scr.rect(0, y, W, 11, COL.accent);
  scr.hline(0, y + 11, W, COL.ink);
  text(scr, title, W / 2, y + 3, COL.white, { align: 'center' });
}

/**
 * Generic scrolling list menu over the room area.
 * items: [{ label, right?, icon?, disabled?, action(app) }]
 */
export class ListMenu {
  constructor(app, title, items, { onBack = null, footer = null } = {}) {
    this.app = app;
    this.title = title;
    this.items = items;
    this.sel = Math.max(0, items.findIndex(i => !i.disabled));
    this.scroll = 0;
    this.onBack = onBack;
    this.footer = footer;
    this.rowH = 15;
    this.top = LAYOUT.room.y + 13;
    this.rows = Math.floor((LAYOUT.room.h - 14 - (footer ? 10 : 0)) / this.rowH);
  }
  get transparent() { return false; }
  button(b, dir = 1) {
    const app = this.app;
    if (b === 'A') {
      if (!this.items.length) return;
      this.sel = (this.sel + dir + this.items.length) % this.items.length;
      this.fixScroll();
      app.sfx('blip');
    } else if (b === 'B') this.activate();
    else if (b === 'C') { app.sfx('back'); this.onBack ? this.onBack() : app.pop(); }
  }
  fixScroll() {
    if (this.sel < this.scroll) this.scroll = this.sel;
    if (this.sel >= this.scroll + this.rows) this.scroll = this.sel - this.rows + 1;
  }
  activate() {
    const it = this.items[this.sel];
    if (!it) return;
    if (it.disabled) { this.app.sfx('nope'); if (it.why) this.app.toast(it.why); return; }
    this.app.sfx('select');
    it.action?.(this.app, it);
  }
  tap(x, y) {
    if (y < LAYOUT.room.y || y >= LAYOUT.room.y + LAYOUT.room.h) return false;
    if (y < this.top) { this.button('C'); return true; } // title bar = back
    const listBottom = this.top + this.rows * this.rowH;
    if (y >= listBottom) return false;
    const i = this.scroll + Math.floor((y - this.top) / this.rowH);
    if (x > W - 12 && this.items.length > this.rows) { // scroll strip
      const half = y < this.top + (this.rows * this.rowH) / 2;
      this.scroll = Math.max(0, Math.min(this.items.length - this.rows, this.scroll + (half ? -this.rows : this.rows)));
      this.sel = Math.max(this.scroll, Math.min(this.sel, this.scroll + this.rows - 1));
      this.app.sfx('blip');
      return true;
    }
    if (i >= this.items.length) return false;
    this.sel = i;
    this.activate();
    return true;
  }
  update() {}
  draw(scr) {
    const { y: ry, h: rh } = LAYOUT.room;
    scr.rect(0, ry, W, rh, COL.panel);
    titleBar(scr, '◀ ' + this.title, ry);
    for (let r = 0; r < this.rows; r++) {
      const i = this.scroll + r;
      const it = this.items[i];
      if (!it) break;
      const y = this.top + r * this.rowH;
      const selected = i === this.sel;
      if (selected) scr.panel(2, y, W - 4, this.rowH - 1, COL.hi, COL.ink);
      const color = it.disabled ? COL.silver : COL.ink;
      let x = 6;
      if (it.icon) { scr.draw(it.icon, x, y + Math.floor((this.rowH - 1 - it.icon.h) / 2), { ctx: it.iconCtx }); x += 13; }
      text(scr, it.label, x, y + 5, color);
      if (it.right !== undefined) text(scr, String(it.right), W - 8, y + 5, it.disabled ? COL.silver : COL.shade, { align: 'right' });
    }
    if (this.items.length > this.rows) {
      if (this.scroll > 0) scr.draw(ARROW, W - 6, this.top + 1, {});
      const pct = this.scroll / (this.items.length - this.rows);
      const trackH = this.rows * this.rowH - 4;
      scr.rect(W - 3, this.top + 2 + Math.round(pct * (trackH - 8)), 2, 8, COL.shade);
    }
    if (!this.items.length) text(scr, 'Nothing here yet!', W / 2, ry + 60, COL.gray, { align: 'center' });
    if (this.footer) {
      const fy = ry + rh - 10;
      scr.rect(0, fy, W, 10, COL.bar);
      text(scr, typeof this.footer === 'function' ? this.footer() : this.footer, W / 2, fy + 3, COL.ink, { align: 'center' });
    }
  }
}

export { text, wrap, measure, LINE_H, W, H };
