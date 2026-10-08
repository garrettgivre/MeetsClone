"""Drafting helpers for hand-pixelled town props (src/art/props.js).

A prop is a text grid of colour-role characters (see the header of props.js):
  1-4 leaf, 5-8 wood, a-d accent, e-h stone, A-D wall, r s t u roof, x y z Z glass
  (each ramp darkest -> lightest), w white, k ink, m mist, v silver, n grey, . empty.

Block a prop in with these helpers, write it into props.js, then look at it in
tools/props.html (?z=4&only=name1,name2) and in its scene in tools/town.html
(?only=place&z=2&pets). The grid in props.js is the real art: once a prop has
been touched up by hand, edit the grid rather than re-running a generator.

    import sys; sys.path.insert(0, 'tools/art-scripts')
    from town_kit import *
    g = G(30, 40)
    ell(g, 15, 20, 12, 14, 'accent'); box(g, 4, 30, 22, 10, 'wood')
    write_props({'myThing': g})              # adds new props (or replaces same-named ones)
"""
import math, os

R = {'wall': 'ABCD', 'roof': 'rstu', 'wood': '5678', 'stone': 'efgh', 'accent': 'abcd', 'glass': 'xyzZ', 'leaf': '1234'}
PROPS_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'art', 'props.js')


def G(w, h):
    """A blank w x h grid."""
    return [['.'] * w for _ in range(h)]


def ok(g, x, y):
    return 0 <= y < len(g) and 0 <= x < len(g[0])


def px(g, x, y, ch):
    """Set one pixel (rounded). ch must be a single role character."""
    x, y = int(round(x)), int(round(y))
    if ok(g, x, y): g[y][x] = ch


def put(g, x, y, s):
    """Write a string of characters at (x, y); '.' leaves pixels alone."""
    for i, ch in enumerate(s):
        if ch != '.': px(g, x + i, y, ch)


def hl(g, x, y, w, ch):
    for i in range(int(round(w))): px(g, x + i, y, ch)


def vl(g, x, y, h, ch):
    for j in range(int(round(h))): px(g, x, y + j, ch)


def box(g, x, y, w, h, ramp, rim=True, outline=True, r=1):
    """A shaded box: light rim top/left, shadow bottom/right, outlined, corners rounded by r."""
    d0, d1, d2, d3 = R[ramp]
    for j in range(h):
        for i in range(w):
            corner = (i < r or i >= w - r) and (j < r or j >= h - r)
            if corner and r > 0: continue
            v = d2
            if rim:
                if j == 1 or i == 1: v = d3
                if j >= h - 2 or i >= w - 2: v = d1
            if outline and (i == 0 or j == 0 or i == w - 1 or j == h - 1): v = d0
            px(g, x + i, y + j, v)
    if outline and r > 0:
        for (cx, cy) in ((x + 1, y + 1), (x + w - 2, y + 1), (x + 1, y + h - 2), (x + w - 2, y + h - 2)):
            px(g, cx, cy, d0)


def ell(g, cx, cy, rx, ry, ramp, shade=True, outline=True):
    """A shaded ellipse lit from the upper left."""
    d0, d1, d2, d3 = R[ramp]
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            nx, ny = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            d = nx * nx + ny * ny
            if d > 1: continue
            l = -(nx * 0.6 + ny * 0.8)
            v = d3 if shade and l > 0.45 and d < 0.7 else d1 if shade and l < -0.35 else d2
            if outline and d > 1 - 2.2 / min(rx, ry): v = d0
            px(g, x, y, v)


def disc(g, cx, cy, r, ch):
    """A filled disc in one character."""
    for j in range(-r, r + 1):
        for i in range(-r, r + 1):
            if i * i + j * j <= r * r + r * 0.6: px(g, cx + i, cy + j, ch)


def tline(g, x0, y0, x1, y1, ramp, w=4):
    """A thick shaded bar (legs, poles, frames): lit edge, shaded edge, outlined. w is 3, 4 or 5."""
    d0, d1, d2, d3 = R[ramp]
    pat = {3: [d0, d3, d0], 4: [d0, d3, d1, d0], 5: [d0, d3, d2, d1, d0]}[w]
    dx, dy = x1 - x0, y1 - y0
    n = int(max(abs(dx), abs(dy))) or 1
    for s in range(n + 1):
        x, y = x0 + dx * s / n, y0 + dy * s / n
        for i, v in enumerate(pat):
            if abs(dy) >= abs(dx): px(g, x + i - w // 2, y, v)
            else: px(g, x, y + i - w // 2, v)


def outline(g):
    """Outline a silhouette: filled pixels touching empty space take their ramp's darkest shade."""
    dark = {ch: v[0] for v in R.values() for ch in v}
    dark.update({'w': 'v', 'm': 'v', 'v': 'n'})
    h, w = len(g), len(g[0])
    snap = [r[:] for r in g]
    for y in range(h):
        for x in range(w):
            c = snap[y][x]
            if c == '.': continue
            if any(not ok(snap, x + a, y + b) or snap[y + b][x + a] == '.' for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                g[y][x] = dark.get(c, c)


def rows_of(g):
    """The grid as trimmed text rows (empty rows above and below removed)."""
    rows = [''.join(r) for r in g]
    while rows and not rows[-1].strip('.'): rows.pop()
    while rows and not rows[0].strip('.'): rows.pop(0)
    return rows


def write_props(props, section='// ---------------------------------------------------------------- structures\n'):
    """Write {name: grid} into props.js. An existing prop of the same name is replaced in
    place (keeping any options after its rows); a new one is inserted before `section`."""
    s = open(PROPS_JS, encoding='utf8').read()
    for name, g in props.items():
        body = f"prop('{name}', [\n" + '\n'.join(f"  '{r}'," for r in rows_of(g)) + "\n]"
        head = f"prop('{name}', ["
        if head in s:
            i = s.index(head)
            j = s.index(']', s.index("',\n]", i) + 2)
            s = s[:i] + body + s[j + 1:]
        else:
            k = s.index(section)
            s = s[:k] + body + ');\n' + s[k:]
    open(PROPS_JS, 'w', encoding='utf8').write(s)
