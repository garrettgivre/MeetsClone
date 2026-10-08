// Indexed framebuffer. Everything draws palette indexes into `buf`;
// present() converts to RGBA once per frame and the canvas is scaled up
// with CSS (image-rendering: pixelated) by a whole number.

import { PACKED } from './palette.js';
import { lut } from './sprite.js';

export const W = 128;
export const H = 224;

export class Screen {
  constructor(canvas) {
    this.canvas = canvas;
    canvas.width = W;
    canvas.height = H;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.img = this.ctx.createImageData(W, H);
    this.out = new Uint32Array(this.img.data.buffer);
    this.buf = new Uint8Array(W * H);
    this.palette = PACKED;
    this.clip = null; // [x0, y0, x1, y1]
  }

  present() {
    const { buf, out, palette } = this;
    for (let i = 0; i < buf.length; i++) out[i] = palette[buf[i]];
    this.ctx.putImageData(this.img, 0, 0);
  }

  clear(c) { this.buf.fill(c); }

  setClip(x, y, w, h) { this.clip = [x, y, x + w, y + h]; }
  noClip() { this.clip = null; }

  pset(x, y, c) {
    x |= 0; y |= 0;
    const cl = this.clip;
    if (cl ? (x < cl[0] || y < cl[1] || x >= cl[2] || y >= cl[3]) : (x < 0 || y < 0 || x >= W || y >= H)) return;
    this.buf[y * W + x] = c;
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.pset(x + i, y + j, c);
  }

  box(x, y, w, h, c) {
    for (let i = 0; i < w; i++) { this.pset(x + i, y, c); this.pset(x + i, y + h - 1, c); }
    for (let j = 1; j < h - 1; j++) { this.pset(x, y + j, c); this.pset(x + w - 1, y + j, c); }
  }

  /** Rounded panel: fill with outline, 1px rounded corners. */
  panel(x, y, w, h, fill, line) {
    this.rect(x + 1, y + 1, w - 2, h - 2, fill);
    for (let i = 1; i < w - 1; i++) { this.pset(x + i, y, line); this.pset(x + i, y + h - 1, line); }
    for (let j = 1; j < h - 1; j++) { this.pset(x, y + j, line); this.pset(x + w - 1, y + j, line); }
  }

  hline(x, y, w, c) { for (let i = 0; i < w; i++) this.pset(x + i, y, c); }
  vline(x, y, h, c) { for (let j = 0; j < h; j++) this.pset(x, y + j, c); }

  /** Dither fill (checkerboard) for shadows and night overlays. */
  dither(x, y, w, h, c, phase = 0) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++)
      if (((x + i + y + j + phase) & 1) === 0) this.pset(x + i, y + j, c);
  }

  /**
   * Draw a sprite. opts: { frame, flip, ctx (colour context), solid (draw every pixel in one colour) }
   */
  draw(spr, x, y, opts = {}) {
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

  /** Draw a raw index bitmap {w, h, px: Uint8Array} (0 = transparent). */
  bitmap(bm, x, y, flip = false, solid = 0) {
    for (let j = 0; j < bm.h; j++) for (let i = 0; i < bm.w; i++) {
      const c = bm.px[j * bm.w + i];
      if (c) this.pset(flip ? x + bm.w - 1 - i : x + i, y + j, solid || c);
    }
  }
}

/** Off-screen index bitmap used to compose characters once and reuse them. */
export function makeBitmap(w, h) { return { w, h, px: new Uint8Array(w * h) }; }
