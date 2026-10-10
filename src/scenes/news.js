// News: what is going on today, and a calendar of the month.
//   page 1  TODAY: special days, what the shops have on, what has happened in town, things at home
//   page 2  the month at a glance, a small mark in each day for what falls on it;
//           A steps through the days, B (or a tap on a day) opens what is on that day
// On the first page A moves down the day's news when there is more than fits, and B turns to the calendar; C goes back a step.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, titleBar, text, wrap, LINE_H } from '../ui.js';
import { today, monthOf, eventsOn, sameDay } from '../game/calendar.js';
import { townNews } from '../game/town.js';
import { DAY_ICONS } from '../art/day-icons.js';

const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const ORDER = ['market', 'games', 'visiting', 'moon', 'marry', 'retire', 'baby', 'news', 'friend']; // which marks a crowded day shows first
const CELL_W = 18, CELL_H = 19, GRID_X = 1;
const dateLine = (time) => { const d = new Date(time); return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };

export class NewsScene {
  constructor(app) {
    this.app = app;
    this.page = 0;
    this.top = 0;       // the first of today's items on show (page one moves down a screenful at a time)
    this.detail = null; // the day whose events are open, on the calendar
    const g = app.game;
    this.sections = today(g);
    this.month = monthOf(g, g.simTime);
    this.day = new Date(g.simTime).getDate() - 1; // the calendar's cursor: an index into this.month.days
    townNews(g, true);                            // (read)
    g.newsSeen = new Date(g.simTime).toDateString();
  }
  get gridY() { return LAYOUT.room.y + 23; }
  button(b, dir = 1) {
    const app = this.app;
    if (this.detail !== null) { this.detail = null; app.sfx('back'); return; }
    if (this.page === 0) {
      if (b === 'C') { app.sfx('back'); app.pop(); }
      else if (b === 'A' && this.more) { this.top = this.next; app.sfx('blip'); } // (round to the top again after the last)
      else { this.page = 1; app.sfx('blip'); }
      return;
    }
    if (b === 'C') { this.page = 0; app.sfx('back'); }
    else if (b === 'A') { const n = this.month.days.length; this.day = (this.day + dir + n) % n; app.sfx('blip'); }
    else if (b === 'B') { this.detail = this.day; app.sfx('select'); }
  }
  tap(x, y) {
    const { y: ry, h: rh } = LAYOUT.room;
    if (y < ry || y >= ry + rh) return false;
    if (this.detail !== null) { this.detail = null; return true; }
    if (y < ry + 12) { this.button('C'); return true; }
    if (this.page === 0) { this.button(this.more && y < ry + rh - 18 ? 'A' : 'B'); return true; } // (the list moves on; the strip under it turns the page)
    // a day on the calendar: open it
    const col = Math.floor((x - GRID_X) / CELL_W), row = Math.floor((y - this.gridY) / CELL_H);
    const i = row * 7 + col - this.month.first;
    if (col >= 0 && col < 7 && row >= 0 && i >= 0 && i < this.month.days.length) { this.day = i; this.detail = i; this.app.sfx('select'); }
    return true;
  }
  update() {}
  draw(scr) {
    const { y: ry, h: rh } = LAYOUT.room;
    scr.rect(0, ry, W, rh, COL.panel);
    if (this.page === 0) this.drawToday(scr); else this.drawMonth(scr);
    // which page: two pips
    [0, 1].forEach(i => scr.panel(W / 2 - 7 + i * 8, ry + rh - 7, 5, 5, i === this.page ? COL.accent : COL.mist, COL.ink));
    if (this.detail !== null) this.drawDetail(scr);
  }

  drawToday(scr) {
    const g = this.app.game, { y: ry, h: rh } = LAYOUT.room;
    titleBar(scr, '◀ NEWS', ry);
    let y = ry + 16;
    text(scr, dateLine(g.simTime), W / 2, y, COL.ink, { align: 'center' });
    y += 10;
    const bottom = ry + rh - 18;
    // every item of the day in one run, each under its section's heading; as many as fit are shown from `top` on
    const all = this.sections.flatMap(s => s.items.map(it => ({ ...it, head: s.head })));
    let i = this.top, head = '';
    for (; i < all.length; i++) {
      const it = all[i], lines = wrap(it.text, W - 24), need = (it.head !== head ? 10 : 0) + lines.length * LINE_H;
      if (y + need > bottom && i > this.top) break;
      if (it.head !== head) {
        head = it.head;
        text(scr, head, 6, y, COL.accent);
        scr.rule(6 + head.length * 4 + 3, y + 3, W - 15 - head.length * 4, COL.silver);
        y += 9;
      }
      scr.draw(DAY_ICONS[it.kind] || DAY_ICONS.news, 6, y, {});
      for (const l of lines) { text(scr, l, 16, y, COL.ink); y += LINE_H; }
      y += 3;
    }
    this.more = this.top > 0 || i < all.length;  // there is more than one screenful
    this.next = i < all.length ? i : 0;          // where A goes: on down, or back to the top
    if (!all.length) text(scr, 'A QUIET DAY', W / 2, y + 20, COL.gray, { align: 'center' });
    if (this.more) text(scr, i < all.length ? `A: MORE (${all.length - i})` : 'A: TOP', 6, bottom + 2, COL.shade);
    text(scr, 'B: CALENDAR', W - 6, bottom + 2, COL.shade, { align: 'right' });
  }

  drawMonth(scr) {
    const g = this.app.game, { y: ry, h: rh } = LAYOUT.room, m = this.month;
    titleBar(scr, `◀ ${MONTHS[m.month]} ${m.year}`, ry);
    [...'SMTWTFS'].forEach((ch, i) => text(scr, ch, GRID_X + i * CELL_W + CELL_W / 2, ry + 15, i === 0 || i === 6 ? COL.accent : COL.gray, { align: 'center' }));
    const gy = this.gridY;
    m.days.forEach((d, i) => {
      const col = (m.first + i) % 7, row = Math.floor((m.first + i) / 7);
      const x = GRID_X + col * CELL_W, y = gy + row * CELL_H;
      const isToday = sameDay(d.time, g.simTime), past = d.time < g.simTime && !isToday, on = i === this.day;
      scr.panel(x, y, CELL_W - 1, CELL_H - 1, on ? COL.hi : isToday ? C('gold.3') : C('white'), on || isToday ? COL.ink : COL.silver);
      text(scr, d.date, x + 2, y + 2, past ? COL.silver : COL.ink);
      // up to two marks, the weightiest first
      const kinds = ORDER.filter(k => d.kinds.includes(k));
      kinds.slice(0, 2).forEach((k, n) => scr.draw(DAY_ICONS[k], x + 2 + n * 7, y + 10, past ? { alpha: 0.5 } : {}));
      if (kinds.length > 2) text(scr, '+', x + CELL_W - 5, y + 2, COL.accent);
    });
    // the day the cursor is on, in a line under the grid
    const d = m.days[this.day], ev = eventsOn(g, d.time);
    const line = ev.length ? `${d.date}: ${ev[0].title.toUpperCase()}${ev.length > 1 ? `  +${ev.length - 1}` : ''}` : `${d.date}: NOTHING ON`;
    text(scr, line, W / 2, ry + rh - 16, COL.ink, { align: 'center' });
  }

  /** Everything on one day, in a box over the calendar. */
  drawDetail(scr) {
    const g = this.app.game, { y: ry, h: rh } = LAYOUT.room;
    const d = this.month.days[this.detail], ev = eventsOn(g, d.time);
    const w = 118, x = (W - w) / 2, rows = [];
    for (const e of ev) rows.push({ kind: e.kind, title: e.title.toUpperCase(), lines: wrap(e.text, w - 22) });
    let h = 16 + (rows.length ? 0 : 10);
    for (const r of rows) h += 9 + r.lines.length * LINE_H + 3;
    h = Math.min(h, rh - 8);
    const y0 = ry + Math.floor((rh - h) / 2);
    scr.panel(x, y0, w, h, COL.white, COL.ink);
    scr.unveil(x, y0, w, h); // (the faded marks of days gone by must not show through it)
    scr.rule(x + 2, y0 + h, w - 3, COL.shade);
    text(scr, dateLine(d.time), W / 2, y0 + 5, COL.accent, { align: 'center' });
    let y = y0 + 16;
    if (!rows.length) text(scr, 'NOTHING ON THAT DAY', W / 2, y, COL.gray, { align: 'center' });
    for (const r of rows) {
      if (y + 9 + r.lines.length * LINE_H > y0 + h - 2) { text(scr, '...', W / 2, y, COL.gray, { align: 'center' }); break; }
      scr.draw(DAY_ICONS[r.kind] || DAY_ICONS.news, x + 5, y, {});
      text(scr, r.title, x + 15, y, COL.ink);
      y += 9;
      for (const l of r.lines) { text(scr, l, x + 15, y, COL.gray); y += LINE_H; }
      y += 3;
    }
  }
}
