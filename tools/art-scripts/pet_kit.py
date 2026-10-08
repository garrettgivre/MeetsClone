"""Pet part re-drafting: silhouette mask -> house shading -> hand details.

    python tools/art-scripts/pet_kit.py            # redraw every head in every form
    python tools/art-scripts/pet_kit.py quad       # one form
    from pet_kit import *; paint_body("avian", "feathered"); restore_body("avian", "fluffy")

Works on the existing grids in src/art/pets/forms/*.js: reads a part's silhouette
and sockets, reshapes the mask per allele, re-shades it (lit outline '1' on the
upper left, ink 'o' on the lower right, a '4' rim inside the lit edge, a '2'
shadow band inside the dark edge, one 'w' glint), puts the sockets back and
paints the allele's details.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ed import rows_of, setpart, show

MARKERS = '@*^=[]<>()!?~#'
FORMS = ['biped', 'blob', 'quad', 'floater', 'serpent', 'avian']
HEADS = ['gumdrop', 'fox', 'lamb', 'bug', 'bell', 'owl']


def load_mask(rows):
    h, w = len(rows), len(rows[0])
    mask = {(x, y) for y in range(h) for x in range(w) if rows[y][x] != '.'}
    sockets = {(x, y): rows[y][x] for y in range(h) for x in range(w) if rows[y][x] in MARKERS}
    return mask, sockets


def bounds(mask):
    xs = [x for x, _ in mask]; ys = [y for _, y in mask]
    return min(xs), max(xs), min(ys), max(ys)


def extents(mask):
    """{y: (l, r)} per row."""
    e = {}
    for x, y in mask:
        l, r = e.get(y, (x, x))
        e[y] = (min(l, x), max(r, x))
    return e


def shade(mask, glint=True):
    """House shading for a silhouette. Returns {(x, y): char}."""
    g = {}
    inside = lambda x, y: (x, y) in mask
    x0, x1, y0, y1 = bounds(mask)
    W, H = x1 - x0 + 1, y1 - y0 + 1
    kind = {}
    for (x, y) in mask:
        outs = [(dx, dy) for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)) if not inside(x + dx, y + dy)]
        if not outs: continue
        sx = sum(dx for dx, _ in outs) * 0.8 + sum(dy for _, dy in outs) * 0.6
        if sx < -0.1: kind[(x, y)] = '1'
        elif sx > 0.1: kind[(x, y)] = 'o'
        else: kind[(x, y)] = '1' if (y <= y0 + 1 or x <= x0 + 1) else 'o'
    for (x, y) in mask:
        if (x, y) in kind: g[(x, y)] = kind[(x, y)]; continue
        v = '3'
        if kind.get((x - 1, y)) == '1': v = '4'
        elif kind.get((x - 2, y)) == '1' and y0 + 2 <= y <= y0 + 5: v = '4'
        elif kind.get((x, y - 1)) == '1' and y <= y0 + 1 and x <= x0 + W * 0.65: v = '4'
        if kind.get((x + 1, y)) == 'o' or kind.get((x, y + 1)) == 'o' or kind.get((x + 1, y + 1)) == 'o': v = '2'
        g[(x, y)] = v
    if glint:
        gx, gy = x0 + round(W * 0.2), y0 + round(H * 0.22)
        for _ in range(6):
            if g.get((gx, gy)) in ('3', '4') and g.get((gx + 1, gy)) in ('3', '4') and g.get((gx, gy + 1)) in ('3', '4'): break
            gx += 1
        if g.get((gx, gy)) in ('3', '4'):
            g[(gx, gy)] = 'w'
            for c in ((gx + 1, gy), (gx, gy + 1)):
                if g.get(c) == '3': g[c] = '4'
    return g


def to_rows(g, sockets, w, h):
    rows = [['.'] * w for _ in range(h)]
    for (x, y), c in g.items():
        if 0 <= x < w and 0 <= y < h: rows[y][x] = c
    for (x, y), c in sockets.items():
        if 0 <= x < w and 0 <= y < h: rows[y][x] = c
    return [''.join(r) for r in rows]


def grow(mask, sockets, dx, dy):
    return {(x + dx, y + dy) for x, y in mask}, {(x + dx, y + dy): c for (x, y), c in sockets.items()}


# ---- allele silhouettes ----
def mod_fox(mask, sockets, face_y):
    e = extents(mask)
    x0, x1, y0, y1 = bounds(mask)
    H = y1 - y0 + 1
    out = set(mask)
    # cheek tufts: a pointed flare on each side just under the eye line
    cy = face_y
    for i, ext in enumerate((1, 2, 1) if H < 16 else (1, 2, 3, 1)):
        y = cy + i
        if y not in e: continue
        l, r = e[y]
        for k in range(1, ext + 1): out.add((l - k, y)); out.add((r + k, y))
    # a narrower chin: shave the bottom rows a pixel each side
    for y in range(y1 - 2, y1 + 1):
        if y in e:
            l, r = e[y]
            out.discard((l, y)); out.discard((r, y))
            if y == y1: out.discard((l + 1, y)); out.discard((r - 1, y))
    return out


def mod_lamb(mask, sockets, face_y):
    e = extents(mask)
    x0, x1, y0, y1 = bounds(mask)
    out = set(mask)
    top = lambda x: min((yy for (xx, yy) in mask if xx == x), default=None)
    # a woolly crown: bumps along the upper curve
    for x in range(x0 + 1, x1 - 3, 5):
        for dx in (0, 1, 2, 3):
            t = top(x + dx)
            if t is not None and t <= y0 + 5: out.add((x + dx, t - 1))
        for dx in (1, 2):
            t = top(x + dx)
            if t is not None and t <= y0 + 4: out.add((x + dx, t - 2))
    # woolly cheeks: a puff on each side around the eye line
    for i, ext in enumerate((1, 2, 2, 2, 1)):
        y = face_y - 1 + i
        if y not in e: continue
        l, r = e[y]
        for k in range(1, ext + 1): out.add((l - k, y)); out.add((r + k, y))
    return out


def mod_bug(mask, sockets, face_y):
    e = extents(mask)
    x0, x1, y0, y1 = bounds(mask)
    out = set(mask)
    W = x1 - x0 + 1
    # two little brow bumps (antenna bases) on the dome
    for bx in (x0 + W // 4, x1 - W // 4):
        for y in range(y0 - 2, y0 + 2):
            top = min(e.items(), key=lambda kv: abs(kv[0] - y0))
        col_top = min(y for (x, y) in out if x == bx)
        out.add((bx, col_top - 1)); out.add((bx + 1, col_top - 1)); out.add((bx, col_top - 2))
    return out


def details(g, allele, mask, sockets, face_y):
    """Interior details painted on the shaded grid (never on outline or sockets)."""
    x0, x1, y0, y1 = bounds(mask)
    W, H = x1 - x0 + 1, y1 - y0 + 1
    cx = (x0 + x1) / 2
    soft = lambda c, v: g.__setitem__(c, v) if g.get(c) in ('3', '4', '2') and c not in sockets else None
    if allele == 'fox':
        # a brow line over each eye and lighter fur on the cheek tufts
        for y in range(face_y + 1, face_y + 4):
            for (x, _) in [c for c in mask if c[1] == y]:
                if g.get((x, y)) == '3' and (x < x0 + 3 or x > x1 - 3): soft((x, y), '4')
    elif allele == 'lamb':
        # curls: little '4' arcs with a '2' pocket, scattered over the crown and cheeks
        for i, (fx, fy) in enumerate(((0.25, 0.18), (0.55, 0.12), (0.8, 0.22), (0.12, 0.5), (0.88, 0.5))):
            x, y = x0 + round(W * fx), y0 + round(H * fy)
            soft((x, y), '4'); soft((x + 1, y), '4'); soft((x + 1, y + 1), '2')
    elif allele == 'bug':
        # a ridge across the brow (a segment line) and a flat glossy top
        y = y0 + max(3, H // 4)
        for x in range(x0, x1 + 1):
            if g.get((x, y)) in ('3', '4') and (x, y) not in sockets: g[(x, y)] = '2'
            if g.get((x, y - 1)) == '3' and (x, y - 1) not in sockets: g[(x, y - 1)] = '4'
    elif allele == 'bell':
        # a soft inner glow: two lighter rings low on the bell
        for fx in (0.3, 0.7):
            x, y = x0 + round(W * fx), y0 + round(H * 0.68)
            for c in ((x, y - 1), (x - 1, y), (x + 1, y), (x, y + 1)): soft(c, '4')
    elif allele == 'owl':
        # a V brow over the eyes
        big = any(c == '*' for c in sockets.values())
        sp = 6 if big else 4
        for d in (-1, 1):
            ex = round(cx) + d * sp
            for dx, dy in ((-2, 1), (-1, 0), (0, 0), (1, 0), (2, 1)):
                soft((ex + dx, face_y - (5 if big else 4) + dy), '2')
    elif allele == 'gumdrop':
        # a second, smaller shine and a lighter dome band
        gx, gy = x0 + round(W * 0.3), y0 + round(H * 0.38)
        soft((gx, gy), 'w')
        for x in range(x0 + 4, x1 - 4):
            if g.get((x, y0 + 2)) == '3': g[(x, y0 + 2)] = '4'
    return g


MODS = {'fox': mod_fox, 'lamb': mod_lamb}


def redraw_head(form, allele, write=True, margin=2):
    rows = rows_of(form, 'head', allele)
    mask, sockets = load_mask(rows)
    mask, sockets = grow(mask, sockets, margin, margin)
    face = next((y for (x, y), c in sockets.items() if c in '@*'), None)
    if allele in MODS: mask = MODS[allele](mask, sockets, face)
    g = shade(mask)
    g = details(g, allele, mask, sockets, face)
    w, h = len(rows[0]) + 2 * margin, len(rows) + 2 * margin
    # trim empty margin rows/cols back off, keeping the grid rectangular
    new = to_rows(g, sockets, w, h)
    while new and not new[0].strip('.'): new.pop(0)
    while new and not new[-1].strip('.'): new.pop()
    while all(r[0] == '.' for r in new): new = [r[1:] for r in new]
    while all(r[-1] == '.' for r in new): new = [r[:-1] for r in new]
    if write: setpart(form, 'head', allele, new)
    return new


if __name__ == '__main__':
    which = sys.argv[1:] or FORMS
    for form in which:
        for allele in HEADS:
            redraw_head(form, allele)
    print('heads redrawn for', which)


# ---- body textures: painted inside the existing silhouettes (sockets and outlines untouched) ----
def paint_body(form, allele, write=True):
    rows = rows_of(form, 'body', allele)
    g = [list(r) for r in rows]
    h, w = len(g), len(g[0])
    mask, sockets = load_mask(rows)
    x0, x1, y0, y1 = bounds(mask)
    W, H = x1 - x0 + 1, y1 - y0 + 1
    def ok(x, y, allow='34'):
        return 0 <= x < w and 0 <= y < h and g[y][x] in allow and (x, y) not in sockets
    def soft(x, y, v, allow='34'):
        if ok(x, y, allow): g[y][x] = v
    def interior(x, y):
        # at least one pixel in from the outline on every side
        return ok(x, y) and all(ok(x + dx, y + dy, '234w') for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    if allele == 'jelly':
        # a glossy highlight blob high on the left, and a small lower shine
        for (fx, fy) in ((0.22, 0.22),):
            x, y = x0 + round(W * fx), y0 + round(H * fy)
            for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1), (2, 0), (0, 2)):
                if interior(x + dx, y + dy): g[y + dy][x + dx] = 'w' if (dx, dy) in ((0, 0), (1, 0)) else '4'
        x, y = x0 + round(W * 0.2), y0 + round(H * 0.55)
        if interior(x, y): g[y][x] = 'w'
    elif allele == 'fluffy':
        # fur: short diagonal ticks, lit on the upper left, shaded on the lower right
        import random
        rnd = random.Random(sum(map(ord, form + allele)))
        for y in range(y0 + 2, y1 - 1, 3):
            for x in range(x0 + 2 + (y // 3 % 2) * 2, x1 - 1, 5):
                if rnd.random() < 0.3: continue
                jx, jy = x + rnd.randint(0, 2), y + rnd.randint(0, 1)
                lit = (jx - x0) / W + (jy - y0) / H < 0.95
                v = '4' if lit else '2'
                d = rnd.choice((1, 1, -1))
                a, b = (jx, jy), (jx + d, jy + 1)
                if interior(*a) and interior(*b) and g[a[1]][a[0]] == '3' and g[b[1]][b[0]] == '3':
                    g[a[1]][a[0]] = v; g[b[1]][b[0]] = v
    elif allele == 'woolly':
        # curls: little rings of light with a shaded pocket
        for y in range(y0 + 2, y1 - 2, 4):
            for x in range(x0 + 2 + (y // 4 % 2) * 3, x1 - 2, 6):
                cells = ((0, 0, '4'), (1, 0, '4'), (0, 1, '4'), (1, 1, '2'))
                if all(interior(x + dx, y + dy) and g[y + dy][x + dx] == '3' for dx, dy, _ in cells):
                    for dx, dy, v in cells: g[y + dy][x + dx] = v
    elif allele == 'feathered':
        # overlapping feather rows: chevrons across the lower body
        rowsy = [y0 + round(H * f) for f in (0.42, 0.62, 0.82)]
        for i, y in enumerate(rowsy):
            for x in range(x0 + 1 + (i % 2) * 2, x1 - 2, 4):
                cells = ((0, 0, '2'), (2, 0, '2'), (1, 1, '2'), (1, -1, '4'))
                if all(ok(x + dx, y + dy, '234') for dx, dy, _ in cells) and all(interior(x + dx, y + dy) for dx, dy, _ in cells[:3]):
                    for dx, dy, v in cells: soft(x + dx, y + dy, v, '34')
    elif allele == 'bell':
        # a soft glow line above the scalloped hem
        y = y1 - 3
        for x in range(x0 + 2, x1 - 1, 2):
            if interior(x, y) and g[y][x] == '3': g[y][x] = '4'
    new = [''.join(r) for r in g]
    if write: setpart(form, 'body', allele, new)
    return new


def restore_body(form, allele):
    """Put back a body grid from git HEAD (to re-paint it from scratch)."""
    import subprocess, re
    repo = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
    src = subprocess.run(['git', 'show', 'HEAD:src/art/pets/forms/' + form + '.js'], capture_output=True, text=True, cwd=repo).stdout
    i = src.index(chr(10) + '  body: {'); i = src.index(chr(10) + '    ' + allele + ': part([', i) + 1
    j = src.index(chr(10) + '    ]', i)
    rows = re.findall(r"^\s*'([^']*)',$", src[i:j], re.M)
    setpart(form, 'body', allele, rows)
