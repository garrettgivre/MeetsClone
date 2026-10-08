// Draft generator for hand-pixelling characters (the "sketch" step).
// Blocks in layered shapes and prints a starting grid to paint over by hand:
//   O lit outline (outside is up/left), o shadow outline,
//   per-part colour group: base / shadow band (lower right) / light patch (upper left).
// Usage: node tools/sketch.mjs <name> [--json]

// groups: [shadow, base, light] characters
const G = { body: '123', acc: '567', hair: 'HhJ', gold: 'uyY', pink: 'fpP', red: 'RrQ', white: 'GmW', orange: 'Ndn' };

// part: { g, e: [cx, cy, rx, ry] } ellipse | { g, t: [[x,y],[x,y],[x,y]] } triangle
const SHAPES = {
  kometchi: { w: 40, h: 46, parts: [
    { g: 'body', t: [[7, 20], [9, 2], [17, 12]] }, { g: 'body', t: [[32, 20], [30, 2], [22, 12]] },
    { g: 'body', e: [14, 40.5, 3, 3.6] }, { g: 'body', e: [25, 40.5, 3, 3.6] },
    { g: 'body', e: [19.5, 32.5, 7.5, 8] },
    { g: 'body', e: [19.5, 18, 14, 11.5] },
  ] },
  ducklet: { w: 40, h: 44, parts: [
    { g: 'orange', e: [13, 41, 5.5, 2.4] }, { g: 'orange', e: [26, 41, 5.5, 2.4] },
    { g: 'body', e: [8, 30, 3, 5] }, { g: 'body', e: [31, 30, 3, 5] },
    { g: 'body', e: [19.5, 31.5, 12, 9.5] },
    { g: 'body', e: [19.5, 16, 15.5, 12] },
  ] },
  pipolin: { w: 40, h: 46, parts: [
    { g: 'body', e: [13, 9, 3.6, 9.5] }, { g: 'body', e: [26, 9, 3.6, 9.5] },
    { g: 'hair', e: [6, 26, 4.5, 8] }, { g: 'hair', e: [33, 26, 4.5, 8] },
    { g: 'body', e: [15.5, 42, 2.6, 2] }, { g: 'body', e: [23.5, 42, 2.6, 2] },
    { g: 'body', e: [19.5, 35, 7.5, 7] },
    { g: 'body', e: [19.5, 23, 13, 11] },
  ] },
  lumipom: { w: 42, h: 44, parts: [
    { g: 'acc', e: [9, 27, 9, 6] }, { g: 'acc', e: [32, 27, 9, 6] },
    { g: 'body', e: [15, 41, 3.5, 2.4] }, { g: 'body', e: [26, 41, 3.5, 2.4] },
    { g: 'body', e: [20.5, 33, 9, 8] },
    { g: 'pink', e: [6.5, 8.5, 4, 4] }, { g: 'pink', e: [34.5, 8.5, 4, 4] },
    { g: 'body', e: [20.5, 17, 16, 12] },
  ] },
  spookit: { w: 40, h: 46, parts: [
    { g: 'red', t: [[9, 13], [6, 2], [14, 9]] }, { g: 'red', t: [[30, 13], [33, 2], [25, 9]] },
    { g: 'acc', e: [19.5, 34, 7, 8] },
    { g: 'body', e: [19.5, 20, 13.5, 12.5] },
  ] },
};

const name = process.argv[2];
const { w, h, parts } = SHAPES[name];
const insideTri = ([a, b, c], x, y) => {
  const s = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]);
  const pt = [x, y];
  const d1 = s(pt, a, b), d2 = s(pt, b, c), d3 = s(pt, c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
const id = Array.from({ length: h }, () => new Array(w).fill(-1));
parts.forEach((p, i) => {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const X = x + 0.5, Y = y + 0.5;
    const hit = p.e ? ((X - p.e[0]) / p.e[2]) ** 2 + ((Y - p.e[1]) / p.e[3]) ** 2 <= 1 : insideTri(p.t, X, Y);
    if (hit) id[y][x] = i;
  }
});
const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? -1 : id[y][x]);
const rows = [];
for (let y = 0; y < h; y++) {
  let r = '';
  for (let x = 0; x < w; x++) {
    const me = at(x, y);
    if (me < 0) { r += '.'; continue; }
    const behind = (o) => o < me;
    if (behind(at(x, y - 1)) || behind(at(x - 1, y))) { r += 'O'; continue; }
    if (behind(at(x, y + 1)) || behind(at(x + 1, y))) { r += 'o'; continue; }
    const [sh, base, light] = G[parts[me].g];
    // light patch upper-left, shadow band along the lower-right edge
    if (behind(at(x + 2, y + 2)) || behind(at(x, y + 2))) r += sh;
    else if (behind(at(x - 3, y - 3)) || behind(at(x - 2, y - 3))) r += light;
    else r += base;
  }
  rows.push(r);
}
if (process.argv.includes('--json')) console.log(JSON.stringify(rows));
else console.log(rows.map((r, i) => String(i).padStart(2) + ' ' + r).join('\n'));
