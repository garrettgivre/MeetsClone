// Shared layout and drawing helpers for scenes.
import { C } from './engine/palette.js';
import { text, wrap, measure, LINE_H } from './engine/font.js';
import { W, H } from './engine/screen.js';
import { HEART, HEART_EMPTY, RICE, RICE_EMPTY } from './art/icons.js';

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
  scr.rule(x + 2, y + h, w - 3, COL.silver);
  let ty = y + 5;
  if (title) { text(scr, title, W / 2, ty, COL.accent, { align: 'center' }); ty += LINE_H + 2; }
  for (const l of lines) { text(scr, l, W / 2, ty, COL.ink, { align: 'center' }); ty += LINE_H; }
  return { x, y, w, h };
}

/**
 * A notice: a banner that slides down from the top edge over the status bar and the top icons, so it never
 * covers the room or the menu that is open. `k` is how far in it is (0 out of sight, 1 home). Returns its
 * bottom edge, for taps (a tap on a notice puts it away).
 */
export function banner(scr, msg, k = 1) {
  const x = 3, w = W - 6, lines = wrap(msg, w - 14);
  const h = lines.length * LINE_H + 8;
  const y = Math.round(-h - 2 + (h + 4) * (1 - (1 - k) * (1 - k)));
  scr.panel(x, y, w, h, COL.white, COL.ink);
  scr.unveil(x, y, w, h + 1); // (the see-through icons under it must not show through)
  scr.rule(x + 2, y + h, w - 3, COL.shade); // a line of shadow under it
  scr.hrect((x + 2) * 2, (y + 2) * 2, 3, (h - 4) * 2, COL.accent); // a pink tab down its left edge
  let ty = y + 4;
  for (const l of lines) { text(scr, l, W / 2 + 1, ty, COL.ink, { align: 'center' }); ty += LINE_H; }
  return y + h + 1;
}

/**
 * Something said or told in a scene: a white box with its top at `y`, and a tail from its bottom edge down
 * toward whoever is speaking (`tail`: their x, or null for a caption nobody says).
 */
export function bubble(scr, msg, { y, tail = null, w = 116 } = {}) {
  const lines = wrap(msg, w - 12);
  const h = lines.length * LINE_H + 8, x = Math.floor((W - w) / 2);
  scr.panel(x, y, w, h, COL.white, COL.ink);
  if (tail != null) {
    const X = Math.max(x + 8, Math.min(x + w - 8, tail)) * 2, Y = (y + h) * 2 - 1;
    for (let r = 0; r < 6; r++) {
      scr.hrect(X - (5 - r), Y + r, (5 - r) * 2 + 1, 1, COL.white);
      scr.hpset(X - (5 - r), Y + r, COL.ink); scr.hpset(X + (5 - r), Y + r, COL.ink);
    }
  }
  let ty = y + 4;
  for (const l of lines) { text(scr, l, W / 2, ty, COL.ink, { align: 'center' }); ty += LINE_H; }
}

/** A small arrowhead (fine pixels), for "there is more this way" in a list. */
function more(scr, x, y, up, c) {
  for (let r = 0; r < 4; r++) scr.hrect(x * 2 - (up ? r : 3 - r), y * 2 + r, (up ? r : 3 - r) * 2 + 1, 1, c);
}

/** A string cut short with two dots if it is wider than `room` pixels. */
function fit(str, room) {
  if (measure(str) <= room) return str;
  let s = str;
  while (s.length > 1 && measure(s + '..') > room) s = s.slice(0, -1);
  return s.trimEnd() + '..';
}

/** Row of up to 4 hearts. */
export function heartRow(scr, x, y, value, kind = 'heart') {
  const full = kind === 'rice' ? RICE : HEART, empty = kind === 'rice' ? RICE_EMPTY : HEART_EMPTY;
  for (let i = 0; i < 4; i++) scr.draw(i < value ? full : empty, x + i * 9, y);
}

/** Title bar used at the top of full-screen menus. */
export function titleBar(scr, title, y = LAYOUT.room.y) {
  scr.rect(0, y, W, 11, COL.accent);
  scr.rule(0, y + 11, W, COL.ink);
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
    // icons of different sizes share one column, so the labels line up
    const iconCol = Math.max(13, ...this.items.filter(it => it.icon).map(it => it.icon.w + 3));
    for (let r = 0; r < this.rows; r++) {
      const i = this.scroll + r;
      const it = this.items[i];
      if (!it) break;
      const y = this.top + r * this.rowH;
      const selected = i === this.sel;
      if (selected) scr.panel(2, y, W - 4, this.rowH - 1, COL.hi, COL.ink);
      const color = it.disabled ? COL.silver : COL.ink;
      let x = 6;
      if (it.icon) { scr.draw(it.icon, x + Math.floor((iconCol - 3 - it.icon.w) / 2), y + Math.floor((this.rowH - 1 - it.icon.h) / 2), { ctx: it.iconCtx }); x += iconCol; }
      // what is on the right keeps its place; a label too long to clear it is cut short
      const right = it.right !== undefined ? fit(String(it.right), W - 8 - x - 24) : '';
      text(scr, fit(it.label, W - 8 - x - (right ? measure(right) + 5 : 0)), x, y + 5, color);
      if (right) text(scr, right, W - 8, y + 5, it.disabled ? COL.silver : COL.shade, { align: 'right' });
    }
    if (this.items.length > this.rows) {
      // a thumb for where the list is, and an arrowhead wherever there is more to see
      const pct = this.scroll / (this.items.length - this.rows);
      const trackH = this.rows * this.rowH - 4;
      scr.panel(W - 4, this.top + 2 + Math.round(pct * (trackH - 8)), 3, 8, COL.silver, COL.shade);
      const listBottom = this.top + this.rows * this.rowH;
      if (this.scroll > 0) more(scr, W / 2, this.top - 1, true, COL.shade);
      if (this.scroll + this.rows < this.items.length) more(scr, W / 2, listBottom - 2, false, COL.shade);
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
