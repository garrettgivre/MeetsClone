// Indexed framebuffer. Everything draws palette indexes into `buf`;
// present() converts to RGBA once per frame and the canvas is scaled up
// with CSS (image-rendering: pixelated).
//
// An optional LCD filter (setFilter) makes the picture look like an old
// handheld's screen rather than raw pixels. It is not a blur:
//   - the frame is enlarged three times with hard edges, and the browser then
//     smooths only that last, small step to the display size, so pixel edges
//     soften by a fraction of a pixel while flat areas stay flat;
//   - the frame is laid over itself again, slightly down and to the right and
//     multiplied in faintly, so dark shapes cast a soft shadow on what is
//     behind them, the way LCD segments sit above their backing;
//   - a faint grid marks the screen's cells.
// The glass over it all (a sheen at the top left, darker corners) is a page
// layer in style.css, so it covers the buttons under the screen as well.
//
// Two pixel densities share one screen: the UI and rooms are drawn on a
// 128 x 224 grid (each pixel is a 2x2 block), while pets are drawn at double
// density (256 x 448) for finer detail. Coordinates passed to every method are
// always in the 128 x 224 grid; hi-res bitmaps (bm.hd) land on half-pixels.

import { PACKED } from './palette.js';
import { lut, sprite } from './sprite.js';
import { scale2x, thinOutlines } from './upscale.js';

export const W = 128;
export const H = 224;
export const HD = 2;              // detail multiplier for hi-res art
const BW = W * HD, BH = H * HD;   // real framebuffer size

const LCD = 3; // the filter draws each hi-res pixel as a 3 x 3 block before the browser's final scale

export class Screen {
  constructor(canvas) {
    this.canvas = canvas;
    canvas.width = BW;
    canvas.height = BH;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.img = this.ctx.createImageData(BW, BH);
    this.out = new Uint32Array(this.img.data.buffer);
    this.buf = new Uint8Array(BW * BH);
    this.palette = PACKED;
    this.clip = null; // [x0, y0, x1, y1] in hi-res pixels
    this.filter = false;
    this.raw = null;   // the plain frame, kept off-screen while the filter is on
    this.glass = null; // the filter's static layer: the cell grid
  }

  /** Turn the LCD filter on or off. */
  setFilter(on) {
    on = !!on && typeof document !== 'undefined';
    if (on === this.filter) return;
    this.filter = on;
    const k = on ? LCD : 1;
    this.canvas.width = BW * k;
    this.canvas.height = BH * k;
    this.canvas.style.imageRendering = on ? 'auto' : '';
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    if (on && !this.raw) {
      this.raw = document.createElement('canvas');
      this.raw.width = BW; this.raw.height = BH;
      this.rawCtx = this.raw.getContext('2d', { alpha: false });
      this.glass = lcdGlass();
    }
  }

  present() {
    const { buf, out, palette } = this;
    for (let i = 0; i < buf.length; i++) out[i] = palette[buf[i]];
    if (!this.filter) { this.ctx.putImageData(this.img, 0, 0); return; }
    this.rawCtx.putImageData(this.img, 0, 0);
    const ctx = this.ctx, w = BW * LCD, h = BH * LCD;
    // the picture, enlarged with hard edges
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.raw, 0, 0, w, h);
    // its own shadow: the same picture a little down and right, soft, multiplied in
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.2;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.raw, LCD * 0.8, LCD * 0.9, w, h);
    // the cell grid
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(this.glass, 0, 0);
  }

  clear(c) { this.buf.fill(c); }

  setClip(x, y, w, h) { this.clip = [x * HD, y * HD, (x + w) * HD, (y + h) * HD]; }
  noClip() { this.clip = null; }

  /** One hi-res pixel. */
  hpset(x, y, c) {
    const cl = this.clip;
    if (cl ? (x < cl[0] || y < cl[1] || x >= cl[2] || y >= cl[3]) : (x < 0 || y < 0 || x >= BW || y >= BH)) return;
    this.buf[y * BW + x] = c;
  }

  /** One normal pixel (a 2x2 block). */
  pset(x, y, c) {
    x = (x | 0) * HD; y = (y | 0) * HD;
    this.hpset(x, y, c); this.hpset(x + 1, y, c); this.hpset(x, y + 1, c); this.hpset(x + 1, y + 1, c);
  }

  rect(x, y, w, h, c) {
    this.hrect(x * HD, y * HD, w * HD, h * HD, c);
  }

  /** Filled rectangle in hi-res pixels. */
  hrect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.hpset(x + i, y + j, c);
  }

  /** Rounded panel: fill with a fine 1 hi-res pixel outline and soft corners. */
  panel(x, y, w, h, fill, line) {
    const X = x * HD, Y = y * HD, Wd = w * HD, Hd = h * HD;
    this.hrect(X + 1, Y + 1, Wd - 2, Hd - 2, fill);
    for (let i = 3; i < Wd - 3; i++) { this.hpset(X + i, Y, line); this.hpset(X + i, Y + Hd - 1, line); }
    for (let j = 3; j < Hd - 3; j++) { this.hpset(X, Y + j, line); this.hpset(X + Wd - 1, Y + j, line); }
    // rounded corners
    for (const [cx, cy, dx, dy] of [[X, Y, 1, 1], [X + Wd - 1, Y, -1, 1], [X, Y + Hd - 1, 1, -1], [X + Wd - 1, Y + Hd - 1, -1, -1]]) {
      this.hpset(cx + dx * 2, cy, line); this.hpset(cx + dx, cy + dy, line); this.hpset(cx, cy + dy * 2, line);
      this.hpset(cx + dx * 2, cy + dy, fill); this.hpset(cx + dx, cy + dy * 2, fill); this.hpset(cx + dx * 2, cy + dy * 2, fill);
    }
  }

  /**
   * A rule one fine pixel thick, the same weight as a panel's outline: along
   * the top edge of normal row y, or along its bottom edge.
   */
  rule(x, y, w, c, bottom = false) { this.hrect(x * HD, y * HD + (bottom ? HD - 1 : 0), w * HD, 1, c); }

  /** Fine checkerboard in hi-res pixels (coordinates in normal pixels). */
  hdither(x, y, w, h, c, phase = 0) {
    for (let j = 0; j < h * HD; j++) for (let i = 0; i < w * HD; i++)
      if (((i + j + phase) & 1) === 0) this.hpset(x * HD + i, y * HD + j, c);
  }

  /**
   * Draw a sprite. opts: { frame, flip, ctx (colour context), solid (draw every pixel in one colour),
   * remap (a palette-to-palette table, e.g. mutedLut(), applied to every pixel) }
   */
  draw(spr, x, y, opts = {}) {
    if (!opts.chunky) return this.drawHD(spr, x, y, opts);
    const frame = spr.frames[(opts.frame || 0) % spr.frames.length];
    const t = lut(spr, opts.ctx);
    const solid = opts.solid;
    const { w, h } = spr;
    x |= 0; y |= 0;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const c = t[frame[j * w + i]];
        if (!c) continue;
        this.pset(opts.flip ? x + w - 1 - i : x + i, y + j, solid || c);
      }
    }
  }

  /**
   * Draw a 1x sprite smoothed up to double density (Scale2x with the outline
   * thinned back to one fine pixel). Upscaled frames are cached on the sprite.
   */
  drawHD(spr, x, y, opts = {}) {
    if (!spr._hd) {
      const rows = spr.frames.map(f => {
        const out = [];
        for (let j = 0; j < spr.h; j++) {
          let r = '';
          for (let i = 0; i < spr.w; i++) r += f[j * spr.w + i] ? String.fromCharCode(f[j * spr.w + i]) : '.';
          out.push(r);
        }
        return thinOutlines(scale2x(out));
      });
      spr._hd = sprite(rows, spr.key);
    }
    const hd = spr._hd;
    const frame = hd.frames[(opts.frame || 0) % hd.frames.length];
    const t = lut(hd, opts.ctx);
    const solid = opts.solid, remap = opts.remap;
    const X = Math.round(x * HD), Y = Math.round(y * HD);
    for (let j = 0; j < hd.h; j++) for (let i = 0; i < hd.w; i++) {
      const c = t[frame[j * hd.w + i]];
      if (!c) continue;
      this.hpset(opts.flip ? X + hd.w - 1 - i : X + i, Y + j, solid || (remap ? remap[c] : c));
    }
  }

  /**
   * Draw a raw index bitmap {w, h, px, hd?} (0 = transparent) with its top-left
   * at (x, y). Hi-res bitmaps (bm.hd) are drawn at double density.
   */
  bitmap(bm, x, y, flip = false, solid = 0) {
    if (bm.hd) {
      const x0 = Math.round(x * HD), y0 = Math.round(y * HD);
      for (let j = 0; j < bm.h; j++) for (let i = 0; i < bm.w; i++) {
        const c = bm.px[j * bm.w + i];
        if (c) this.hpset(flip ? x0 + bm.w - 1 - i : x0 + i, y0 + j, solid || c);
      }
      return;
    }
    for (let j = 0; j < bm.h; j++) for (let i = 0; i < bm.w; i++) {
      const c = bm.px[j * bm.w + i];
      if (c) this.pset(flip ? x + bm.w - 1 - i : x + i, y + j, solid || c);
    }
  }
}

/**
 * One cell of the LCD grid (a normal pixel, drawn LCD times enlarged): a
 * hairline of shade along the right and bottom and a touch of light along the
 * top and left. Also used, as an image, behind the buttons under the screen.
 */
export function lcdCell() {
  const cell = document.createElement('canvas');
  cell.width = cell.height = HD * LCD;
  const c = cell.getContext('2d');
  c.fillStyle = 'rgba(38, 36, 89, 0.07)';
  c.fillRect(HD * LCD - 1, 0, 1, HD * LCD); c.fillRect(0, HD * LCD - 1, HD * LCD, 1);
  c.fillStyle = 'rgba(255, 255, 255, 0.03)';
  c.fillRect(0, 0, HD * LCD - 1, 1); c.fillRect(0, 0, 1, HD * LCD - 1);
  return cell;
}

/** The LCD filter's grid for the whole screen, drawn once. */
function lcdGlass() {
  const w = BW * LCD, h = BH * LCD;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = ctx.createPattern(lcdCell(), 'repeat');
  ctx.fillRect(0, 0, w, h);
  return cv;
}

/** Off-screen index bitmap used to compose characters once and reuse them. */
export function makeBitmap(w, h, hd = false) { return { w, h, px: new Uint8Array(w * h), hd }; }
