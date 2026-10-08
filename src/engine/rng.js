// Small seeded random generator (mulberry32) so genetics can be tested and
// replayed. `rand` is the shared default; tests create their own.

export function makeRng(seed = (Math.random() * 2 ** 32) >>> 0) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int: (n) => Math.floor(next() * n),
    range: (a, b) => a + next() * (b - a),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    /** Pick from [[item, weight], ...] */
    weighted(list) {
      let total = 0;
      for (const [, w] of list) total += w;
      let x = next() * total;
      for (const [item, w] of list) { if ((x -= w) < 0) return item; }
      return list[list.length - 1][0];
    },
  };
  return r;
}

export const rand = makeRng();

/** Stable hash of a string -> 32-bit int (for deterministic per-pet details). */
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
