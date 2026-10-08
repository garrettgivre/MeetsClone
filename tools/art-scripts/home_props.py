"""Drafts of the props for the pet's own room (the home screen): a curtained
window, a bed, a nightstand with a lamp, a wall shelf, a potted sprout, a framed
heart and a toy chest. Run from the project root:

    python tools/art-scripts/home_props.py

It writes them into src/art/props.js (replacing props of the same name). Look
at them in tools/props.html?z=4&only=homeWindow,petBed,... and on the game's
home screen before keeping a change; after hand edits in props.js, stop
re-running this for that prop.

Colour roles are the ones in props.js: 1-4 leaf, 5-8 wood, a-d accent, e-h
stone, A-D wall, r s t u roof, x y z Z glass, w white, m mist, v silver, k ink.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from town_kit import G, px, put, write_props

LEAF, WOOD, ACC, STONE, WALL, ROOF, GLASS = '1234', '5678', 'abcd', 'efgh', 'ABCD', 'rstu', 'xyzZ'
WHITE = 'vmww'  # white things: silver outline, mist shade


def rr(x, y, w, h, r=2):
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
    return {(x, y) for y in range(int(cy - ry - 1), int(cy + ry + 2)) for x in range(int(cx - rx - 1), int(cx + rx + 2))
            if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1}


def rect(x, y, w, h): return {(x + i, y + j) for j in range(h) for i in range(w)}


def poly(pts, w=140, h=140):
    cells, n = set(), len(pts)
    for y in range(h):
        for x in range(w):
            cxp, cyp, inside = x + 0.5, y + 0.5, False
            for i in range(n):
                (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % n]
                if (y1 > cyp) != (y2 > cyp) and cxp < (x2 - x1) * (cyp - y1) / (y2 - y1) + x1: inside = not inside
            if inside: cells.add((x, y))
    return cells


def paint(g, cells, ramp, rim=True, band=1, line=None):
    """House shading: an outline in the shape's own darkest shade, a light rim inside
    the upper left and a shadow band inside the lower right."""
    d0, d1, d2, d3 = ramp
    edge = {c for c in cells if any((c[0] + a, c[1] + b) not in cells for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))}
    inner = cells - edge
    for (x, y) in cells:
        if (x, y) in edge: v = line or d0
        else:
            v = d2
            dark = any((x + a, y) not in inner for a in range(1, band + 1)) or any((x, y + b) not in inner for b in range(1, band + 1))
            lit = (x - 1, y) not in inner or (x, y - 1) not in inner
            if band and dark: v = d1
            elif rim and lit: v = d3
        px(g, x, y, v)


def stamp(g, x, y, rows):
    for j, r in enumerate(rows): put(g, x, y + j, r.replace(' ', '.'))


# ---------------------------------------------------------------- the window
def home_window():
    """112 x 94: a rod with gold finials, two gathered curtains, a white frame with
    see-through panes (the room paints the sky behind them), a sill and a flowerpot."""
    W, H = 112, 94
    g = G(W, H)
    # frame: glass is x 24..87, y 14..73; four panes, left as holes
    frame = rect(20, 10, 72, 68)
    paint(g, frame, WHITE, band=2)
    for (x, y) in rect(24, 14, 64, 60): px(g, x, y, '.')
    # an inner edge to the frame, then the bars
    for x in range(23, 89): px(g, x, 13, 'v'); px(g, x, 74, 'w')
    for y in range(13, 75): px(g, 23, y, 'v'); px(g, 88, y, 'w')
    for y in range(14, 74): put(g, 54, y, 'wwwm')
    for x in range(24, 88): px(g, x, 42, 'w'); px(g, x, 43, 'w'); px(g, x, 44, 'm')
    put(g, 54, 42, 'wwww'); put(g, 54, 43, 'wwww')
    # sill: a slab wider than the frame
    paint(g, rr(15, 78, 82, 6, 1), WHITE, band=1)
    for x in range(17, 96, 2): px(g, x, 84, 'v')
    # a little pot of flowers on the sill, in front of the glass
    paint(g, poly([(70, 68), (80, 68), (79, 78), (71, 78)]), STONE, band=1)
    put(g, 69, 67, 'e' + 'h' * 10 + 'e')
    stamp(g, 69, 58, ['   1  1 1   ', '  131 1321  ', ' 13311 131  ', '  11341311  ', '   1331331  ', '    13111   ', '     121    ', '     121    ', '     121    '])
    stamp(g, 70, 54, [' cc   ', 'cdbc  ', ' cc   '])
    stamp(g, 76, 56, [' cc ', 'cdbc', ' cc '])
    # the rod and its finials
    for x in range(4, 108): put(g, x, 2, '8'); put(g, x, 3, '7'); put(g, x, 4, '5')
    for cx in (3, 108):
        paint(g, ell(cx + 0.5, 3.5, 3.4), ROOF, band=1)
        px(g, cx - 1, 2, 'w')
    # curtains: gathered at a tie two thirds of the way down, flaring again below
    def curtain(left):
        outer = 5 if left else W - 6
        def width(y):
            if y < 60: return round(21 - (y - 6) * 11 / 54)      # 21 at the rod down to 10 at the tie
            return round(10 + (y - 60) * 6 / 30)                  # out to 16 at the hem
        tones = 'dcdcbcdcb' if left else 'cdcbcdcbc'
        for y in range(6, 92):
            w = width(y)
            hem = y >= 89 and ((y - 89) + 1)  # scalloped hem
            for i in range(w):
                x = outer + i if left else outer - i
                if hem and (i % 5) in ((0, 4) if hem == 1 else (0, 1, 3, 4) if hem == 2 else (0, 1, 2, 3, 4)) and i < w - 1 and hem == 3: continue
                if hem and (i % 5) in (0, 4) and hem == 2: continue
                v = tones[min(len(tones) - 1, i * len(tones) // max(1, w))]
                if i == 0 or i == w - 1: v = 'a'
                px(g, x, y, v)
        # ruffled header over the rod
        for i in range(0, 21):
            x = outer + i if left else outer - i
            px(g, x, 5, 'a'); px(g, x, 6, 'd' if i % 4 < 2 else 'c')
            if i % 4 == 1: px(g, x, 4, 'a'); px(g, x, 5, 'd')
        # the tie-back, with a knot
        for i in range(-1, 11):
            x = outer + i if left else outer - i
            put(g, x, 59, 's'); put(g, x, 60, 'u'); put(g, x, 61, 't'); put(g, x, 62, 's')
        kx = outer + 9 if left else outer - 11
        stamp(g, kx, 58, ['sss', 'sus', 'sts', 'sus', 'sts', 'sss'])
    curtain(True); curtain(False)
    return g


# ---------------------------------------------------------------- the bed
def pet_bed():
    """86 x 48: a low wooden bed seen from the side, with a plump pillow and a quilt."""
    g = G(86, 48)
    paint(g, rr(0, 2, 11, 42, 4), WOOD, band=2)                       # headboard
    paint(g, rr(76, 16, 10, 28, 3), WOOD, band=2)                     # footboard
    paint(g, rect(9, 31, 69, 7), WOOD, band=1)                        # side rail
    for x in range(14, 76, 9): px(g, x, 34, '5')                      # grain
    paint(g, rr(10, 22, 67, 11, 3), WHITE, band=1)                    # mattress
    paint(g, ell(22, 19.5, 11, 5.5), WHITE, band=1)                   # pillow
    px(g, 15, 17, 'w'); put(g, 26, 22, 'mm')
    quilt = rr(33, 15, 44, 20, 5)
    paint(g, quilt, ACC, band=2)
    cuff = rr(33, 15, 9, 20, 4) & quilt                               # the turned-down edge
    paint(g, cuff, WALL, band=1)
    for i, (x, y) in enumerate([(47, 20), (56, 24), (65, 19), (51, 29), (61, 30), (70, 26), (46, 26)]):
        stamp(g, x, y, [' d ', 'dwd', ' d '] if i % 2 == 0 else ['d d', ' d ', 'd d'])
    for x in (2, 79): paint(g, rect(x, 43, 6, 5), WOOD, band=1)       # feet
    # a heart carved into the headboard
    stamp(g, 3, 10, ['5 5', '555', ' 5 '])
    return g


# ---------------------------------------------------------------- nightstand and lamp
def night_lamp():
    """34 x 62: a bedside table with a drawer, and a lamp with a pleated shade."""
    g = G(34, 62)
    paint(g, rr(2, 34, 30, 22, 2), WOOD, band=2)
    paint(g, rr(0, 32, 34, 5, 1), WOOD, band=1)                       # top
    paint(g, rr(6, 40, 22, 9, 1), WOOD, band=1)                       # drawer front
    put(g, 15, 44, 'stts'); put(g, 16, 43, 'uu')                      # knob
    for x in (4, 26): paint(g, rect(x, 55, 5, 7), WOOD, band=1)       # legs
    # lamp: base, stem, shade
    paint(g, ell(17, 30.5, 6, 2.4), STONE, band=1)
    for y in range(20, 30): put(g, 16, y, 'gf')
    shade = poly([(10, 4), (24, 4), (29, 21), (5, 21)])
    paint(g, shade, ROOF, band=2)
    for x in (11, 15, 19, 23):
        for y in range(6, 20):
            xx = round(17 + (x - 17) * (1 + (y - 4) * 0.045))
            if g[y][xx] in 'tu': px(g, xx, y, 's')
    put(g, 9, 3, 'r' * 16); put(g, 4, 21, 'r' * 26)
    put(g, 8, 6, 'u'); put(g, 7, 9, 'u')
    return g


# ---------------------------------------------------------------- shelf, sprout, frame, chest
def wall_shelf():
    """72 x 13: a wooden shelf on two scrolled brackets."""
    g = G(72, 13)
    paint(g, rr(0, 0, 72, 5, 1), WOOD, band=1)
    for x in (8, 58):
        paint(g, poly([(x, 5), (x + 7, 5), (x + 7, 7), (x + 3, 12), (x, 12)]), WOOD, band=1)
        px(g, x + 3, 8, '5')
    for x in range(6, 68, 11): px(g, x, 2, '6')
    return g


def sprout_pot():
    """16 x 22: a seedling in a round pot."""
    g = G(16, 22)
    paint(g, poly([(3, 12), (13, 12), (12, 21), (4, 21)]), STONE, band=1)
    paint(g, rr(2, 10, 12, 4, 1), STONE, band=1)
    for y in range(4, 11): px(g, 8, y, '1')
    paint(g, ell(4.5, 5, 4, 2.6), LEAF, band=1)
    paint(g, ell(11.5, 3.5, 4, 2.6), LEAF, band=1)
    px(g, 3, 4, '4'); px(g, 10, 2, '4')
    return g


def heart_frame():
    """28 x 34: a framed heart hanging from a nail."""
    g = G(28, 34)
    px(g, 14, 0, 'k'); px(g, 13, 0, 'k')
    for i in range(1, 7): px(g, 14 - i * 1.6, i, 'n'); px(g, 13 + i * 1.6, i, 'n')
    paint(g, rr(1, 7, 26, 27, 2), ROOF, band=2)
    paint(g, rect(5, 11, 18, 19), WHITE, band=0, rim=False, line='s')
    heart = ell(10.5, 17.5, 3.6) | ell(17.5, 17.5, 3.6) | poly([(6.6, 18.5), (21.4, 18.5), (14, 27)])
    paint(g, heart, ACC, band=1)
    px(g, 9, 16, 'w')
    return g


def toy_chest():
    """50 x 40: an open toy chest with a ball, a block and a star peeking out."""
    g = G(50, 40)
    paint(g, poly([(3, 4), (47, 4), (45, 18), (5, 18)]), WOOD, band=1)          # the raised lid, seen from inside
    for x in range(8, 44, 6):
        for y in range(6, 17): px(g, x, y, '6')
    # toys
    paint(g, ell(15, 15, 7), ACC, band=2); px(g, 12, 11, 'w'); put(g, 9, 15, 'a' * 13)
    paint(g, rr(24, 9, 11, 11, 1), GLASS, band=2); stamp(g, 27, 12, ['Z Z', ' Z ', 'Z Z'])
    star = poly([(40, 6), (42, 11), (47, 11), (43, 14), (45, 19), (40, 16), (35, 19), (37, 14), (33, 11), (38, 11)])
    paint(g, star, ROOF, band=1)
    # the box, with corner straps and a heart clasp
    paint(g, rr(1, 18, 48, 22, 2), WOOD, band=2)
    for x in (5, 41):
        paint(g, rect(x, 18, 4, 22), STONE, band=0)
        px(g, x + 1, 22, 'h'); px(g, x + 1, 35, 'h')
    paint(g, rr(0, 17, 50, 4, 1), WOOD, band=1)
    stamp(g, 22, 25, ['t t t', 'tutut', 'ttttt', ' tts ', '  s  '])
    for x in range(12, 40, 7): px(g, x, 31, '6'); px(g, x + 1, 35, '6')
    return g


if __name__ == '__main__':
    write_props({
        'homeWindow': home_window(), 'petBed': pet_bed(), 'nightLamp': night_lamp(), 'wallShelf': wall_shelf(),
        'sproutPot': sprout_pot(), 'heartFrame': heart_frame(), 'toyChest': toy_chest(),
    })
    print('wrote the home props')
