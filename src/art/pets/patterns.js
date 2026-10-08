// Markings: which pixels of the head and body take the accent colour.
// A pattern recolours inside the hand-drawn shading (shadow, base and light
// keep their place), so it never fights the pixel art underneath.
//
// pattern(region, u, v, info) -> 'accent' | 'bright' | null
//   region  'head' | 'body'
//   u, v    -1..1 across the part's bounding box
//   info    { form, fu, fv }  fu/fv: the face centre on the head, in the same units

export const PATTERNS = {
  // Kitsu: a pale muzzle and chest
  muzzle(region, u, v, { form, fu, fv }) {
    if (region === 'head') return ((u - fu) / 0.5) ** 2 + ((v - fv - 0.34) / 0.36) ** 2 <= 1 ? 'accent' : null;
    if (form === 'quad') return u < -0.35 && v > -0.4 && v < 0.35 ? 'accent' : null;
    if (form === 'serpent') return Math.abs(u) < 0.32 && v < 0.2 ? 'accent' : null;
    return (u / 0.42) ** 2 + ((v + 0.05) / 0.62) ** 2 <= 1 ? 'accent' : null;
  },
  // Gloop: little bubbles floating in the jelly
  bubbles(region, u, v) {
    const spots = region === 'head'
      ? [[-0.55, -0.35, 0.11], [0.5, -0.55, 0.08], [0.62, 0.15, 0.1]]
      : [[-0.45, 0.2, 0.12], [0.35, -0.2, 0.09], [0.1, 0.55, 0.08], [0.6, 0.45, 0.07]];
    return spots.some(([x, y, r]) => (u - x) ** 2 + (v - y) ** 2 <= r * r) ? 'bright' : null;
  },
  // Fleece: a sooty face and sooty legs, like a black-faced sheep
  sooty(region, u, v, { form, fu, fv }) {
    if (region === 'head') return ((u - fu) / 0.62) ** 2 + ((v - fv - 0.12) / 0.62) ** 2 <= 1 ? 'accent' : null;
    if (form === 'quad') return v > 0.25 ? 'accent' : null;
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
  // Inchy: bands around the body and a stripe over the crown
  bands(region, u, v, { form }) {
    if (region === 'head') return v < -0.5 && v > -0.78 ? 'accent' : null;
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
