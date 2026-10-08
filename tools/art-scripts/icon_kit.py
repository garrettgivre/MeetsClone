"""Drafting kit for the home-screen menu icons (src/art/menu-icons.js).

The icons are hi-res sprites: 28 x 28 pixels at the screen's double density
(14 x 14 screen pixels), drawn directly rather than upscaled. Each is built here
from masks (rounded boxes, ellipses, polygons) painted with the house shading:
an ink outline, a light rim inside the upper left, a shadow band inside the
lower right. Details are then set pixel by pixel.

    python tools/art-scripts/icon_kit.py          # rewrites src/art/menu-icons.js

The colour characters are the KEY at the top of menu-icons.js. Look at the
result in the game (the two icon rows) at zoom before keeping it.
"""
import math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'art', 'menu-icons.js')
N = 28

# ramps, darkest to lightest (see KEY in menu-icons.js)
RED, GOLD, SKY, PINK = 'RrqQ', 'uyxY', 'ABCD', 'EFHI'
GREEN, VIOLET, CREAM, BROWN = 'JLMN', 'PSTU', 'abcd', 'efhi'
SLATE, ORANGE, MINT = 'jlnp', 'stvz', 'VWXZ'
WHITE = 'Gmww'   # white things shade through mist to silver
STEEL = 'gGmw'

KEY = {
    'o': 'ink', 'K': 'shade', 'g': 'gray', 'G': 'silver', 'm': 'mist', 'w': 'white',
    **{c: 'red.%d' % i for i, c in enumerate(RED)}, **{c: 'gold.%d' % i for i, c in enumerate(GOLD)},
    **{c: 'sky.%d' % i for i, c in enumerate(SKY)}, **{c: 'pink.%d' % i for i, c in enumerate(PINK)},
    **{c: 'green.%d' % i for i, c in enumerate(GREEN)}, **{c: 'violet.%d' % i for i, c in enumerate(VIOLET)},
    **{c: 'cream.%d' % i for i, c in enumerate(CREAM)}, **{c: 'brown.%d' % i for i, c in enumerate(BROWN)},
    **{c: 'slate.%d' % i for i, c in enumerate(SLATE)}, **{c: 'orange.%d' % i for i, c in enumerate(ORANGE)},
    **{c: 'mint.%d' % i for i, c in enumerate(MINT)},
}


def G(): return [['.'] * N for _ in range(N)]


def px(g, x, y, ch):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < N and 0 <= y < N: g[y][x] = ch


def put(g, x, y, s):
    """Write a string at (x, y); spaces leave pixels alone."""
    for i, ch in enumerate(s):
        if ch != ' ': px(g, x + i, y, ch)


def stamp(g, x, y, rows):
    for j, r in enumerate(rows): put(g, x, y + j, r)


def rr(x, y, w, h, r=2):
    """Cells of a rounded rectangle."""
    cells = set()
    for j in range(h):
        for i in range(w):
            cx = x + r if i < r else x + w - 1 - r if i >= w - r else None
            cy = y + r if j < r else y + h - 1 - r if j >= h - r else None
            if cx is not None and cy is not None and (x + i - cx) ** 2 + (y + j - cy) ** 2 > r * r + r * 0.6: continue
            cells.add((x + i, y + j))
    return cells


def ell(cx, cy, rx, ry=None):
    ry = ry or rx
    return {(x, y) for y in range(N) for x in range(N) if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1}


def poly(pts):
    """Cells whose centres are inside a polygon."""
    cells = set()
    n = len(pts)
    for y in range(N):
        for x in range(N):
            px_, py_, inside = x + 0.5, y + 0.5, False
            for i in range(n):
                (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % n]
                if (y1 > py_) != (y2 > py_) and px_ < (x2 - x1) * (py_ - y1) / (y2 - y1) + x1: inside = not inside
            if inside: cells.add((x, y))
    return cells


def paint(g, cells, ramp, ink='o', rim=True, band=1, only=None):
    """House shading: outline, a light rim inside the upper left, a shadow band inside the lower right."""
    d0, d1, d2, d3 = ramp
    edge = {c for c in cells if any((c[0] + a, c[1] + b) not in cells for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))}
    inner = cells - edge
    for (x, y) in cells:
        if only is not None and (x, y) not in only: continue
        if (x, y) in edge: v = ink or d0
        else:
            v = d2
            dark = any((x + a, y) not in inner for a in range(1, band + 1)) or any((x, y + b) not in inner for b in range(1, band + 1))
            lit = (x - 1, y) not in inner or (x, y - 1) not in inner
            if band and dark: v = d1
            elif rim and lit: v = d3
        px(g, x, y, v)


# ---------------------------------------------------------------- the icons

def status():
    """A clipboard: the pet's record, with a heart and a few lines."""
    g = G()
    paint(g, rr(4, 3, 20, 24, 3), BROWN)
    paint(g, rr(6, 6, 16, 19, 1), WHITE, ink='G', band=1)
    paint(g, rr(9, 1, 10, 6, 2), GOLD)
    put(g, 12, 3, 'oooo')
    stamp(g, 8, 9, [' F F ', 'FIFFF', 'FFFFE', ' FFE ', '  E  '])
    put(g, 15, 10, 'llllll'); put(g, 15, 12, 'llll')
    for y, w in ((16, 12), (18, 10), (20, 12), (22, 7)): put(g, 8, y, 'n' * w)
    return g


def food():
    """A rice ball with its wrap of seaweed and a pickled plum on top."""
    g = G()
    rice = poly([(11, 2), (17, 2), (20, 6), (26, 19), (26, 23), (23, 26), (5, 26), (2, 23), (2, 19), (8, 6)])
    paint(g, rice, WHITE, band=2)
    nori = rr(8, 15, 12, 12, 1) & rice
    paint(g, nori, 'oKKg', band=0)
    for x, y in ((12, 17), (16, 20), (11, 22), (15, 23)): px(g, x, y, 'g')
    stamp(g, 12, 5, [' RR ', 'RQqR', 'RqrR', ' RR '])
    for x, y in ((6, 20), (22, 18), (10, 11), (19, 13), (5, 23), (23, 23)): px(g, x, y, 'm')
    return g


def clean():
    """A pail brimming with suds, a couple of bubbles and a sparkle."""
    g = G()
    paint(g, poly([(5, 13), (23, 13), (21, 26), (7, 26)]), SKY, band=2)
    paint(g, rr(4, 11, 20, 4, 1), SKY)
    put(g, 8, 19, 'DD'); put(g, 8, 20, 'D'); put(g, 8, 21, 'D')
    for cx, cy, r in ((9, 9, 3.6), (19.5, 9.5, 3.2), (14, 7, 4.6)): paint(g, ell(cx, cy, r), WHITE, ink='o', band=1)
    put(g, 7, 11, 'wwwwwwwwwwwwww'); put(g, 9, 10, 'www'); put(g, 17, 10, 'wwww')
    stamp(g, 22, 1, [' BB ', 'Bw B', 'B  A', ' AA '])
    stamp(g, 2, 4, [' B ', 'BwA', ' A '])
    stamp(g, 23, 17, ['  x  ', ' xYx ', '  x  '])
    return g


def medicine():
    """A first-aid case with a carrying handle."""
    g = G()
    handle = rr(9, 3, 10, 8, 3) - rr(11, 5, 6, 6, 2)
    paint(g, handle, SLATE)
    paint(g, rr(2, 8, 24, 18, 3), WHITE, band=2)
    cross = {(x, y) for x in range(12, 16) for y in range(11, 23)} | {(x, y) for x in range(8, 20) for y in range(15, 19)}
    paint(g, cross, RED, ink='R', band=1)
    put(g, 4, 23, 'G' * 20)
    return g


def lights():
    """A glowing bulb."""
    g = G()
    glass = ell(14, 12, 8.6) | poly([(9, 16), (19, 16), (17.5, 22), (10.5, 22)])
    paint(g, glass, GOLD, band=2)
    stamp(g, 8, 7, [' ww', 'ww ', 'w  '])
    stamp(g, 11, 12, ['u  u  u', ' uu uu ', '  u  u '][:2])
    put(g, 13, 14, 'uu'); put(g, 13, 15, 'uu'); put(g, 13, 16, 'uu')
    paint(g, rr(10, 20, 8, 6, 1), STEEL, band=1)
    put(g, 11, 22, 'gggggg'); put(g, 11, 24, 'gggggg')
    put(g, 12, 26, 'oooo')
    for (x, y) in ((14, 0), (14, 1), (13, 0), (13, 1), (1, 12), (2, 12), (25, 12), (26, 12), (3, 3), (4, 4), (24, 3), (23, 4), (3, 21), (4, 20), (24, 21), (23, 20)): px(g, x, y, 'y')
    return g


def games():
    """A game pad."""
    g = G()
    body = rr(1, 5, 26, 15, 7) | ell(7, 19, 6) | ell(21, 19, 6)
    paint(g, body, VIOLET, band=2)
    stamp(g, 5, 9, ['  oo  ', '  oo  ', 'oooooo', 'oooooo', '  oo  ', '  oo  '])
    put(g, 7, 11, 'KK'); put(g, 7, 12, 'K')
    stamp(g, 19, 7, ['oooo', 'oQqo', 'oqro', 'oooo'])
    stamp(g, 16, 11, ['oooo', 'oYxo', 'oxyo', 'oooo'])
    stamp(g, 22, 11, ['oooo', 'oDCo', 'oCBo', 'oooo'])
    stamp(g, 19, 15, ['oooo', 'oNMo', 'oMLo', 'oooo'])
    put(g, 12, 8, 'PPPP'); put(g, 12, 16, 'PP'); put(g, 15, 16, 'PP')
    return g


def items():
    """A wrapped present with a bow."""
    g = G()
    paint(g, rr(3, 12, 22, 14, 2), VIOLET, band=2)
    paint(g, rr(1, 8, 26, 7, 2), VIOLET, band=1)
    ribbon = {(x, y) for x in range(12, 16) for y in range(9, 25)}
    paint(g, ribbon, PINK, ink='F', band=1)
    put(g, 12, 14, 'EEEE')
    paint(g, ell(9, 5, 4.6, 3.4), PINK)
    paint(g, ell(19, 5, 4.6, 3.4), PINK)
    paint(g, rr(11, 3, 6, 6, 2), PINK)
    return g


def town():
    """A little house with a red roof."""
    g = G()
    paint(g, rr(18, 2, 5, 9, 1), BROWN)
    paint(g, rr(4, 13, 20, 13, 1), CREAM, band=2)
    paint(g, poly([(14, 1), (28, 14), (26, 16), (2, 16), (0, 14)]), RED, band=2)
    for x, y in ((9, 11), (13, 8), (18, 11), (14, 12), (6, 13), (21, 13)): put(g, x, y, 'rr')
    paint(g, rr(11, 18, 6, 8, 2), BROWN)
    px(g, 15, 22, 'Y')
    for x in (6, 19):
        stamp(g, x, 18, ['oooo', 'oDCo', 'oCBo', 'oooo'])
    return g


def family():
    """Two hearts, one big and one small."""
    g = G()
    big = ell(8.5, 8.5, 6) | ell(18, 8.5, 6) | poly([(2.6, 10), (23.9, 10), (13.25, 23.5)])
    paint(g, big, RED, band=2)
    stamp(g, 5, 5, [' ww', 'ww ', 'w  '])
    small = ell(18.5, 18, 3.9) | ell(24, 18, 3.9) | poly([(14.7, 19), (27.8, 19), (21.25, 27.5)])
    paint(g, small, PINK, band=1)
    stamp(g, 17, 16, [' w', 'w '])
    return g


def settings():
    """A cog."""
    g = G()
    cx = cy = 14
    cells = ell(cx, cy, 9)
    for k in range(8):
        a = k * math.pi / 4
        ux, uy = math.cos(a), math.sin(a)
        for y in range(N):
            for x in range(N):
                dx, dy = x + 0.5 - cx, y + 0.5 - cy
                along, across = dx * ux + dy * uy, -dx * uy + dy * ux
                # (the diagonal teeth are cut a touch shorter and wider so they read as square as the upright ones)
                if 7 <= along <= (13.2 if k % 2 == 0 else 12.4) and abs(across) <= (2.6 if k % 2 == 0 else 3.0): cells.add((x, y))
    cells -= ell(cx, cy, 3.6)
    paint(g, cells, SLATE, band=1)
    ring = ell(cx, cy, 6.2) - ell(cx, cy, 5.2)
    for (x, y) in ring:
        if g[y][x] == 'n': g[y][x] = 'l' if (x + y) > 28 else 'p'
    return g


ICONS = [('status', status), ('food', food), ('clean', clean), ('medicine', medicine), ('lights', lights),
         ('games', games), ('items', items), ('town', town), ('family', family), ('settings', settings)]


def write():
    out = [
        '// The ten menu icons on the home screen (two rows of five). Each is a hi-res',
        '// sprite: 28 x 28 pixels at the screen\'s double density, drawn pixel for pixel',
        '// (not upscaled). Drafted with tools/art-scripts/icon_kit.py; the grids here',
        '// are the art, so touch them up by hand.',
        "import { hdSprite } from '../engine/sprite.js';",
        '',
        '// colour characters: four-shade ramps run darkest to lightest',
        'const KEY = {',
    ]
    items = list(KEY.items())
    for i in range(0, len(items), 6):
        out.append('  ' + ' '.join("%s: '%s'," % (k, v) for k, v in items[i:i + 6]))
    out += ['};', '', 'export const MENU_ICONS = {']
    for name, fn in ICONS:
        rows = [''.join(r) for r in fn()]
        out.append('  // ' + fn.__doc__.strip())
        out.append('  %s: hdSprite([' % name)
        out += ["    '%s'," % r for r in rows]
        out.append('  ], KEY),')
    out += ['};', '']
    open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(out))
    print('wrote', os.path.normpath(OUT))


if __name__ == '__main__':
    write()
