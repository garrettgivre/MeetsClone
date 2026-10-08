// Procedural creature parts: tails, wings, fur tufts and manes. They're built
// from simple geometry (curves, ellipses) and rasterised by the same pipeline as
// heads and bodies, so outlines and shading always match the pet.

import { C } from '../engine/palette.js';

// ---------- geometry helpers ----------
function polyline(pts) {
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    segs.push({ x0, y0, dx: x1 - x0, dy: y1 - y0, len, start: total });
    total += len;
  }
  /** nearest point: distance and t (0 at the base .. 1 at the tip) */
  return (x, y) => {
    let best = Infinity, bt = 0;
    for (const s of segs) {
      let k = ((x - s.x0) * s.dx + (y - s.y0) * s.dy) / (s.len * s.len);
      k = Math.max(0, Math.min(1, k));
      const d = Math.hypot(x - (s.x0 + s.dx * k), y - (s.y0 + s.dy * k));
      if (d < best) { best = d; bt = (s.start + s.len * k) / total; }
    }
    return [best, bt];
  };
}
const ell = (x, y, cx, cy, rx, ry, rot = 0) => {
  const c = Math.cos(rot), s = Math.sin(rot);
  const dx = x - cx, dy = y - cy;
  const u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry;
  return u * u + v * v;
};
const zig = (x) => Math.abs((((x % 1) + 1) % 1) - 0.5) * 2;

// ---------- tails (base at pts[0], tip at the end; drawn to the right) ----------
// Each returns { w, h, base: [x, y], inside(x, y), paint(x, y) -> ramp | {ramp, shade} | index }
export function tailShape(kind, t, scale = 1) {
  const S = (n) => n * scale;
  const P = (pts) => pts.map(([x, y]) => [S(x), S(y)]);
  switch (kind) {
    case 'fox': {
      const near = polyline(P([[4, 44], [12, 42], [20, 35], [25, 25], [24, 15], [29, 6]]));
      const rad = (k) => S(2.5 + 9 * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.04)), 0.7));
      return {
        w: S(42), h: S(48), base: [S(4), S(44)],
        inside: (x, y) => { const [d, k] = near(x, y); return d <= rad(k); },
        paint: (x, y) => (near(x, y)[1] > 0.76 ? 'cream' : t.color),
      };
    }
    case 'longtail': {
      const near = polyline(P([[3, 38], [12, 37], [19, 31], [21, 22], [19, 13], [23, 6]]));
      return {
        w: S(30), h: S(42), base: [S(3), S(38)],
        inside: (x, y) => near(x, y)[0] <= S(2.6),
        paint: (x, y) => (near(x, y)[1] > 0.86 ? t.accent : t.color),
      };
    }
    case 'dragon': {
      const pts = P([[3, 36], [13, 36], [22, 31], [28, 23], [31, 14]]);
      const near = polyline(pts);
      const rad = (k) => S(6.5 * (1 - k) + 1.6);
      // triangular spikes along the top edge, and a spade at the tip
      const spikes = [0.25, 0.45, 0.65].map(k => {
        const i = Math.min(pts.length - 2, Math.floor(k * (pts.length - 1)));
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        const f = k * (pts.length - 1) - i;
        const px = x0 + (x1 - x0) * f, py = y0 + (y1 - y0) * f;
        const len = Math.hypot(x1 - x0, y1 - y0);
        const nx = (y1 - y0) / len, ny = -(x1 - x0) / len; // normal pointing up-left
        return { px, py, nx, ny, r: rad(k) };
      });
      const inSpike = (x, y) => spikes.some(({ px, py, nx, ny, r }) => {
        const along = (x - px) * -ny + (y - py) * nx, out = (x - px) * nx + (y - py) * ny;
        return out > r - 1 && out < r + S(6) && Math.abs(along) < (r + S(6) - out) * 0.55;
      });
      const [tx, ty] = pts[pts.length - 1];
      const inTip = (x, y) => Math.abs(x - tx) + Math.abs(y - ty + S(2)) < S(5);
      return {
        w: S(42), h: S(42), base: [S(3), S(36)],
        inside: (x, y) => { const [d, k] = near(x, y); return d <= rad(k) || inSpike(x, y) || inTip(x, y); },
        paint: (x, y) => (inSpike(x, y) || inTip(x, y) ? t.accent : t.color),
      };
    }
    case 'bolt': {
      const near = polyline(P([[3, 40], [11, 35], [7, 28], [17, 23], [13, 15], [26, 6]]));
      return {
        w: S(34), h: S(44), base: [S(3), S(40)],
        inside: (x, y) => near(x, y)[0] <= S(3.4),
        paint: (x, y) => (near(x, y)[1] < 0.18 ? t.accent : t.color),
      };
    }
    case 'curly': {
      // a little piggy spiral
      const pts = [[2, 22]];
      for (let a = 0; a <= Math.PI * 3.2; a += 0.35) {
        const r = 8 - a * 1.6;
        pts.push([13 + Math.cos(a + Math.PI) * Math.max(1.5, r), 13 + Math.sin(a + Math.PI) * Math.max(1.5, r)]);
      }
      const near = polyline(P(pts));
      return {
        w: S(26), h: S(26), base: [S(2), S(22)],
        inside: (x, y) => near(x, y)[0] <= S(2.3),
        paint: () => t.color,
      };
    }
    case 'devil': {
      const near = polyline(P([[3, 34], [11, 34], [17, 29], [19, 21], [17, 14], [21, 9]]));
      const inSpade = (x, y) => ell(x, y, S(23), S(6), S(5), S(4.5), 0.6) <= 1 || (Math.abs(x - S(24)) + Math.abs(y - S(1)) < S(3.5));
      return {
        w: S(32), h: S(38), base: [S(3), S(34)],
        inside: (x, y) => near(x, y)[0] <= S(2) || inSpade(x, y),
        paint: (x, y) => (inSpade(x, y) ? 'red' : t.color),
      };
    }
    case 'pomtail': {
      const cx = S(10), cy = S(10), R = S(8);
      return {
        w: S(22), h: S(22), base: [S(3), S(12)],
        inside: (x, y) => { const a = Math.atan2(y - cy, x - cx); return Math.hypot(x - cx, y - cy) <= R * (0.9 + 0.1 * Math.cos(a * 7)); },
        paint: () => t.accent,
      };
    }
    case 'fishtail': {
      // a fan with a notch
      return {
        w: S(26), h: S(30), base: [S(2), S(15)],
        inside: (x, y) => {
          const dx = x - S(2), dy = y - S(15);
          if (dx < 0) return false;
          const a = Math.atan2(dy, dx), r = Math.hypot(dx, dy);
          const notch = Math.abs(a) < 0.18 && r > S(15);
          return Math.abs(a) < 0.75 && r < S(22) && !notch;
        },
        paint: (x, y) => ((Math.round((Math.atan2(y - S(15), x - S(2))) * 10) % 2 === 0) ? t.accent : { ramp: t.accent, shade: 1 }),
      };
    }
    default: return null;
  }
}
export const SHAPED_TAILS = ['fox', 'longtail', 'dragon', 'bolt', 'curly', 'devil', 'pomtail', 'fishtail'];

// ---------- wings (left wing; the root is on the right edge) ----------
export function wingShape(kind, t, scale = 1) {
  const S = (n) => n * scale;
  switch (kind) {
    case 'wings': { // feathered angel wing
      const lobes = [[16, 12, 13, 9, -0.5], [9, 18, 7, 5, -0.3], [15, 20, 6, 5, -0.2], [21, 19, 5, 4, 0]];
      const inside = (x, y) => lobes.some(([cx, cy, rx, ry, r]) => ell(x, y, S(cx), S(cy), S(rx), S(ry), r) <= 1);
      return {
        w: S(30), h: S(28), root: [S(27), S(14)], inside,
        paint: (x, y) => ((y > S(14) && (Math.round(x / scale) + Math.round(y / scale)) % 6 === 0) ? { ramp: 'cream', shade: 1 } : 'cream'),
      };
    }
    case 'bat': {
      const inside = (x, y) => {
        const u = x / S(28);
        if (u < 0 || u > 1) return false;
        const top = S(2) + (1 - u) * S(2) + u * S(8);
        const bottom = S(16) - S(6) * Math.abs(Math.sin(u * Math.PI * 2.5)) + u * S(3);
        return y >= top && y <= bottom;
      };
      return {
        w: S(30), h: S(22), root: [S(27), S(10)], inside,
        paint: (x, y) => ((Math.round(x / scale) % 9 === 4 && y < S(14)) ? { ramp: t.accent, shade: 0 } : { ramp: t.accent, shade: 1 }),
      };
    }
    case 'fairy': case 'butterfly': {
      const up = [14, 10, 12, 8, -0.55], low = [17, 22, 7, 5, 0.3];
      const inside = (x, y) => ell(x, y, S(up[0]), S(up[1]), S(up[2]), S(up[3]), up[4]) <= 1 || ell(x, y, S(low[0]), S(low[1]), S(low[2]), S(low[3]), low[4]) <= 1;
      if (kind === 'fairy') {
        return {
          w: S(28), h: S(30), root: [S(25), S(16)], inside,
          paint: (x, y) => (ell(x, y, S(up[0]), S(up[1]), S(up[2]), S(up[3]), up[4]) < 0.25 ? C('white') : 'sky'),
        };
      }
      return {
        w: S(28), h: S(30), root: [S(25), S(16)], inside,
        paint: (x, y) => {
          if (ell(x, y, S(10), S(8), S(3), S(3)) <= 1 || ell(x, y, S(15), S(22), S(2), S(2)) <= 1) return C('white');
          const e = Math.min(ell(x, y, S(up[0]), S(up[1]), S(up[2]), S(up[3]), up[4]), ell(x, y, S(low[0]), S(low[1]), S(low[2]), S(low[3]), low[4]));
          return e > 0.62 ? { ramp: t.accent, shade: 0 } : t.accent;
        },
      };
    }
    default: return null;
  }
}
export const SHAPED_WINGS = ['wings', 'bat', 'fairy', 'butterfly'];

// ---------- fur: cheek tufts (left side) and a mane behind the head ----------
export function cheekTuft(headH, t) {
  const h = Math.round(headH * 0.5), w = Math.round(headH * 0.26);
  return {
    w, h,
    // three fur points sticking outward
    inside: (x, y) => x >= w * (1 - 0.85 * (1 - zig(y / h * 3 + 0.5))) - 0.5 && x < w,
    paint: () => t.color,
  };
}

export function maneShape(size, t) {
  const R = size / 2;
  return {
    w: size, h: size,
    inside: (x, y) => {
      const dx = x - R, dy = y - R, a = Math.atan2(dy, dx);
      return Math.hypot(dx, dy) <= R * (0.9 + 0.1 * Math.cos(a * 11));
    },
    paint: () => t.hairColor || t.accent,
  };
}
