// The Gene Book: every body plan, part and body colour, shown on a little
// plain pet. Ones you haven't found yet are silhouettes.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { makeRng } from '../engine/rng.js';
import { LAYOUT, COL, titleBar, text, ListMenu } from '../ui.js';
import { composePetArt } from '../game/pet-art.js';
import { STARTER, FOUNDERS, GENE_LABELS, express, pureGenome, lineOf } from '../game/genetics.js';
import { BOOK_GENES, BOOK_SIZE, entries, has, found, foundTotal, lineParts, lineFound, lineDone, entryName } from '../game/book.js';

const COLS = 3, ROWS = 3, PER_PAGE = COLS * ROWS;
const CW = 42, CH = 42;
const PAGE_TITLE = { form: 'BODY PLANS', color: 'BODY COLOURS' };

/** A plain pet showing one entry, in the body plan of the line it comes from. */
const previews = new Map();
function preview(gene, allele) {
  const key = gene + ':' + allele;
  if (!previews.has(key)) {
    const founder = FOUNDERS.find(f => f.name === lineOf(gene, allele));
    const traits = { ...STARTER, form: founder?.traits.form || STARTER.form, [gene]: allele };
    const art = composePetArt(express(pureGenome(traits), makeRng(1)), 'adult', {});
    // a window 80 fine pixels square (40 on screen): the pet's middle, its feet on the bottom edge
    const V = 80, px = new Uint8Array(V * V), ox = (art.w - V) >> 1, oy = art.h - V;
    for (let y = 0; y < V; y++) for (let x = 0; x < V; x++) {
      const sx = x + ox, sy = y + oy;
      if (sx >= 0 && sy >= 0 && sx < art.w && sy < art.h) px[y * V + x] = art.px[sy * art.w + sx];
    }
    previews.set(key, { w: V, h: V, px, hd: true });
  }
  return previews.get(key);
}

export class GeneBookScene extends ListMenu {
  constructor(app) {
    const g = app.game;
    const rows = BOOK_GENES.map(gene => {
      const n = found(g, gene), total = entries(gene).length;
      return {
        label: PAGE_TITLE[gene] ? PAGE_TITLE[gene][0] + PAGE_TITLE[gene].slice(1).toLowerCase() : GENE_LABELS[gene],
        right: n === total ? `★ ${n}/${total}` : `${n}/${total}`,
        action: () => app.push(new BookPage(app, gene)),
      };
    });
    const lines = FOUNDERS.filter(f => lineDone(g, f.name)).length;
    rows.push({ label: 'Founder lines', right: `${lines}/${FOUNDERS.length}`, action: () => app.push(linesMenu(app)) });
    super(app, 'GENE BOOK', rows, { footer: () => `FOUND ${foundTotal(app.game)}/${BOOK_SIZE}` });
  }
}

function linesMenu(app) {
  const g = app.game;
  return new ListMenu(app, 'FOUNDER LINES', FOUNDERS.map(f => {
    const n = lineFound(g, f.name), total = lineParts(f.name).length;
    return {
      label: f.name,
      right: n === total ? `★ ${n}/${total}` : `${n}/${total}`,
      action: () => app.toast(n === total ? `The ${f.line} line is complete!` : `${f.line}: ${total - n} part${total - n === 1 ? '' : 's'} still to find.`),
    };
  }), { footer: 'FIND EVERY PART: +100' });
}

class BookPage {
  constructor(app, gene) {
    this.app = app;
    this.gene = gene;
    this.list = entries(gene);
    this.sel = 0;
  }
  get page() { return Math.floor(this.sel / PER_PAGE); }
  get pages() { return Math.ceil(this.list.length / PER_PAGE); }
  button(b, dir = 1) {
    if (b === 'C') { this.app.sfx('back'); this.app.pop(); return; }
    if (b === 'A') { this.sel = (this.sel + dir + this.list.length) % this.list.length; this.app.sfx('blip'); }
    if (b === 'B') this.describe();
  }
  tap(x, y) {
    const { y: ry, h: rh } = LAYOUT.room;
    if (y < ry || y >= ry + rh) return false;
    if (y < ry + 12) { this.button('C'); return true; }
    if (y >= ry + rh - 10 && this.pages > 1) { // footer: next page
      this.sel = ((this.page + 1) % this.pages) * PER_PAGE;
      this.app.sfx('blip');
      return true;
    }
    const col = Math.floor((x - 1) / CW), row = Math.floor((y - ry - 13) / CH);
    const i = this.page * PER_PAGE + row * COLS + col;
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS || i >= this.list.length) return false;
    this.sel = i;
    this.describe();
    return true;
  }
  describe() {
    const g = this.app.game, allele = this.list[this.sel];
    if (!has(g, this.gene, allele)) { this.app.sfx('nope'); this.app.toast('Not found yet. Keep breeding!'); return; }
    const line = lineOf(this.gene, allele);
    const founder = FOUNDERS.find(f => f.name === line);
    this.app.sfx('select');
    this.app.toast(founder ? `${entryName(this.gene, allele)}, from the ${founder.line} line.` : entryName(this.gene, allele));
  }
  update() {}
  draw(scr) {
    const g = this.app.game;
    const { y: ry, h: rh } = LAYOUT.room;
    scr.rect(0, ry, W, rh, COL.panel);
    const title = PAGE_TITLE[this.gene] || GENE_LABELS[this.gene].toUpperCase();
    titleBar(scr, `◀ ${title} ${found(g, this.gene)}/${this.list.length}`, ry);
    const start = this.page * PER_PAGE;
    for (let k = 0; k < PER_PAGE; k++) {
      const i = start + k;
      if (i >= this.list.length) break;
      const allele = this.list[i];
      const x = 1 + (k % COLS) * CW, y = ry + 13 + Math.floor(k / COLS) * CH;
      const known = has(g, this.gene, allele);
      scr.panel(x, y, CW - 1, CH - 1, i === this.sel ? COL.hi : C('white'), COL.ink);
      scr.setClip(x + 1, y + 1, CW - 3, CH - 10);
      scr.bitmap(preview(this.gene, allele), x + (CW - 1) / 2 - 20, y + 1, false, known ? 0 : C('silver'));
      scr.noClip();
      text(scr, known ? allele.toUpperCase() : '???', x + (CW - 1) / 2, y + CH - 9, known ? COL.ink : COL.gray, { align: 'center' });
    }
    const fy = ry + rh - 10;
    scr.rect(0, fy, W, 10, COL.bar);
    text(scr, this.pages > 1 ? `PAGE ${this.page + 1}/${this.pages}  TAP FOR MORE` : 'B: ABOUT  C: BACK', W / 2, fy + 3, COL.ink, { align: 'center' });
  }
}
