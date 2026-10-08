// Markings: which pixels of the head and body take the accent colour.
// A pattern recolours inside the hand-drawn shading (shadow, base and light
// keep their place), so it never fights the pixel art underneath.
//
// pattern(region, u, v, info) -> 'accent' | 'bright' | null
//   region  'head' | 'body'
//   u, v    -1..1 across the part's bounding box
//   info    { form, fu, fv, w, h }  fu/fv: the face centre on the head, in the same units;
//           w/h: the part's size in pixels, for shapes that should stay round

export const PATTERNS = {
  // Kitsu: a pale muzzle and chest
  muzzle(region, u, v, { form, fu, fv }) {
    if (region === 'head') return ((u - fu) / 0.5) ** 2 + ((v - fv - 0.34) / 0.36) ** 2 <= 1 ? 'accent' : null;
    if (form === 'quad') return u < -0.35 && v > -0.4 && v < 0.35 ? 'accent' : null;
    if (form === 'serpent') return Math.abs(u) < 0.32 && v < 0.2 ? 'accent' : null;
    return (u / 0.42) ** 2 + ((v + 0.05) / 0.62) ** 2 <= 1 ? 'accent' : null;
  },
  // Gloop: little round bubbles floating in the jelly (sized in pixels, so they stay round)
  bubbles(region, u, v, { w, h }) {
    const spots = region === 'head'
      ? [[-0.5, -0.3, 1.4], [0.6, 0.25, 1.0]]
      : [[-0.55, 0.2, 1.6], [0.45, -0.1, 1.1], [0.62, 0.55, 0.9]];
    // a bubble is a pale ring around a bright centre
    for (const [x, y, r] of spots) {
      const d = Math.hypot(((u - x) * w) / 2, ((v - y) * h) / 2);
      if (d <= r * 0.5) return 'bright';
      if (d <= r + 0.4) return 'accent';
    }
    return null;
  },
  // Fleece: a sooty face and sooty legs, like a black-faced sheep
  sooty(region, u, v, { form, fu, fv }) {
    // the muzzle and the lower legs; the eyes stay on pale wool
    if (region === 'head') return ((u - fu) / 0.5) ** 2 + ((v - fv - 0.62) / 0.42) ** 2 <= 1 ? 'accent' : null;
    if (form === 'quad') return v > 0.45 ? 'accent' : null;
    return v > 0.5 ? 'accent' : null;
  },
  // Glimmer: glowing spots around the rim
  glowspots(region, u, v) {
    const n = region === 'head' ? 5 : 4;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * 0.9 + (i / (n - 1)) * Math.PI * 1.8 - Math.PI / 2;
      const x = Math.cos(a) * 0.68, y = Math.sin(a) * 0.62 + (region === 'head' ? 0 : 0.1);
      if ((u - x) ** 2 + (v - y) ** 2 <= 0.024) return 'bright';
    }
    return null;
  },
  // Inchy: bands around the body
  bands(region, u, v, { form }) {
    if (region === 'head') return null; // a caterpillar's head stays plain
    const t = form === 'quad' ? u : v;
    return Math.floor((t + 1) * 3.2) % 2 === 1 ? 'accent' : null;
  },
  // Hoolet: a pale face disk and a speckled chest
  facedisk(region, u, v, { form, fu, fv }) {
    if (region === 'head') return ((u - fu) / 0.66) ** 2 + ((v - fv + 0.05) / 0.66) ** 2 <= 1 ? 'bright' : null;
    if (form === 'quad') return u < -0.3 && v > -0.3 && v < 0.4 ? 'accent' : null;
    return Math.abs(u) < 0.48 - Math.max(0, v) * 0.25 && v > -0.55 ? 'accent' : null;
  },
};
