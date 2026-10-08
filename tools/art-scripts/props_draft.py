"""Block in town props as text grids (silhouette + base shading), to be finished by hand.

Roles: 1-4 leaf ramp (dark..light), 5-8 wood ramp, a-d accent ramp, e-h stone ramp,
w white, k ink, '.' empty. Light comes from the upper left.

    python tools/art-scripts/props_draft.py            # print every draft
    python tools/art-scripts/props_draft.py treeA      # print one

The finished grids live in src/art/props.js; this only makes starting points.
"""
import math, random, sys

def canvas(w, h):
    return [['.'] * w for _ in range(h)]

def paint_lobes(w, h, lobes, ramp='1234', low_from=None, creases=True):
    """Paint round lobes back to front, each lit from the upper left. Lobes low in
    the clump sit in shade. Where a lobe tucks behind one in front of it, its edge
    darkens into a pocket; the whole silhouette gets the darkest outline."""
    d1, d2, d3, d4 = ramp
    g = canvas(w, h)
    own = [[-1] * w for _ in range(h)]
    for i, (cx, cy, r) in enumerate(lobes):
        low = low_from is not None and cy > low_from
        for y in range(h):
            for x in range(w):
                nx, ny = (x + 0.5 - cx) / r, (y + 0.5 - cy) / r
                if nx * nx + ny * ny > 1:
                    continue
                l = -(nx * 0.6 + ny * 0.8)
                v = d4 if l > 0.42 and nx * nx + ny * ny < 0.8 else d2 if l < -0.32 else d3
                if low and v == d4:
                    v = d3
                if low and l < 0.05:
                    v = d2
                g[y][x] = v
                own[y][x] = i
    snap = [row[:] for row in own]
    for y in range(h):
        for x in range(w):
            i = snap[y][x]
            if i < 0:
                continue
            nb = {(dx, dy): (snap[y + dy][x + dx] if 0 <= y + dy < h and 0 <= x + dx < w else -1) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))}
            if -1 in nb.values():
                g[y][x] = d1
            elif creases and nb[(0, 1)] > i and lobes[nb[(0, 1)]][1] > lobes[i][1] + 2:
                g[y][x] = d1 if g[y][x] == d2 else d2   # the pocket where a lower lobe sits in front
    return g, own

def leaf_texture(g, seed, lit='4', mid='3', shadow='2'):
    """Little leaf clumps: a lit pixel with a shadow pixel under it, scattered."""
    rnd = random.Random(seed)
    h, w = len(g), len(g[0])
    for _ in range(w * h // 18):
        x, y = rnd.randrange(1, w - 1), rnd.randrange(1, h - 2)
        if g[y][x] == mid and g[y + 1][x] == mid:
            g[y][x] = lit if rnd.random() < 0.5 else mid
            g[y + 1][x] = shadow
        elif g[y][x] == lit and g[y + 1][x] in (lit, mid) and rnd.random() < 0.4:
            g[y + 1][x] = mid

def trunk(g, x, top, bottom, w_top, w_bot, ramp='5678'):
    d1, d2, d3, d4 = ramp
    for y in range(top, bottom):
        t = (y - top) / max(1, bottom - top - 1)
        flare = (max(0, t - 0.75) / 0.25) ** 2 * w_bot * 0.7
        half = (w_top + (w_bot - w_top) * t) / 2 + flare
        x0, x1 = round(x - half), round(x + half)
        for xx in range(x0, x1):
            if 0 <= xx < len(g[0]):
                g[y][xx] = d4 if xx <= x0 + 1 else d2 if xx >= x1 - 2 else d3
        if 0 <= x0 - 1 < len(g[0]): g[y][x0 - 1] = d1
        if 0 <= x1 < len(g[0]): g[y][x1] = d1

def out(name, g):
    print(f'  {name}: [')
    for r in g:
        print(f"    '{''.join(r)}',")
    print('  ],')

def tree(w, h, crown_h, lobes, trunk_w, seed):
    g = canvas(w, h)
    trunk(g, w / 2, crown_h - 6, h, trunk_w, trunk_w + 2)
    sub, own = paint_lobes(w, crown_h, lobes, low_from=crown_h * 0.6)
    for y in range(crown_h):
        for x in range(w):
            if own[y][x] >= 0:
                g[y][x] = sub[y][x]
    return g

DRAFTS = {}

def draft(fn):
    DRAFTS[fn.__name__] = fn
    return fn

@draft
def treeA():
    lobes = [(14, 9, 7), (27, 10, 7), (20, 12, 10), (10, 17, 8), (30, 17, 8), (20, 22, 10), (8, 25, 7), (32, 25, 7), (14, 28, 7), (26, 28, 7)]
    return tree(40, 50, 35, lobes, 5, 1)

@draft
def treeB():
    lobes = [(11, 7, 5), (19, 7, 5), (15, 10, 8), (8, 15, 6), (22, 15, 6), (15, 18, 8), (9, 21, 5), (21, 21, 5)]
    return tree(30, 38, 26, lobes, 4, 2)

@draft
def bushA():
    w, h = 30, 18
    lobes = [(15, 8, 7), (8, 11, 6), (22, 10, 6), (4, 14, 4), (26, 13, 4), (11, 13, 5), (19, 13, 5)]
    return paint_lobes(w, h, lobes, low_from=11)[0]

@draft
def bushB():
    w, h = 20, 13
    lobes = [(11, 6, 5), (6, 8, 5), (15, 8, 4), (9, 10, 4), (14, 10, 3)]
    return paint_lobes(w, h, lobes, low_from=9)[0]

@draft
def rockA():
    w, h = 22, 14
    lobes = [(9, 8, 7), (15, 9, 6), (6, 10, 5)]
    return paint_lobes(w, h, lobes, ramp='efgh')[0]

@draft
def cloudA():
    w, h = 60, 22
    lobes = [(31, 8, 10), (20, 10, 9), (42, 10, 9), (10, 15, 7), (51, 14, 7), (26, 14, 8), (38, 15, 7)]
    g, own = paint_lobes(w, h, lobes, ramp='abcw')
    for y in range(h - 4, h):  # a flat bottom
        g[y] = ['.'] * w
    for x in range(w):
        col = [y for y in range(h) if g[y][x] != '.']
        if col:
            g[col[-1]][x] = 'a'
    return g

if __name__ == '__main__':
    names = sys.argv[1:] or list(DRAFTS)
    for n in names:
        out(n, DRAFTS[n]())
