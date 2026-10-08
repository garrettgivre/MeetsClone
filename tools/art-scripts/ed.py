"""Hand-editing helper for the pet art grids (src/art/pets/forms/*.js).

Usage from Python (run from anywhere):
    import sys; sys.path.insert(0, "tools/art-scripts"); from ed import *
    show("biped", "head", "fox")                       # print a grid with row numbers
    rows = rows_of("biped", "head", "fox")             # get it as a list of strings
    setpart("biped", "head", "fox", rows)              # write it back (widths are checked)
    setall(M_FORMS, "hair", "tuft", rows, opts)        # same grid in several forms
    g = from_extents(w, spans); paint(g, {...})        # block in a silhouette, then paint details


setpart(form, section, key, rows, opts=None)  -> rewrites `key: part([...], opts)` inside `section: {`
show(form, section, key)                       -> prints the current grid with row numbers
"""
import re, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

def _path(form):
    return os.path.join(ROOT, 'src/art/pets/forms', form + '.js')

def _find(s, section, key):
    si = s.index(f"\n  {section}: {{") if section not in ('baby', 'child') else None
    if section in ('baby', 'child'):
        i = s.index(f"\n  {section}: part([") + 1
        indent = '  '
    else:
        i = s.index(f"\n    {key}: part([", si) + 1
        indent = '    '
    # the grid closes on its own line: indent + ']' (rows can contain ']' socket markers)
    j = s.index("\n" + indent + "]", i)
    k = s.index("),\n", j) + 3
    return i, k, indent

def rows_of(form, section, key=None):
    s = open(_path(form), encoding='utf8').read()
    i, k, _ = _find(s, section, key)
    return re.findall(r"^\s*'([^']*)',$", s[i:k], re.M)

def show(form, section, key=None):
    s = open(_path(form), encoding='utf8').read()
    i, k, _ = _find(s, section, key)
    rows = re.findall(r"^\s*'([^']*)',$", s[i:k], re.M)
    for n, r in enumerate(rows):
        print(f'{n:2d} {r}')
    print(s[i:k].splitlines()[-1])

def setpart(form, section, key, rows, opts=None):
    for n, r in enumerate(rows):
        assert len(r) == len(rows[0]), f'{form}.{section}.{key} row {n} is {len(r)} wide, expected {len(rows[0])}: {r}'
    s = open(_path(form), encoding='utf8').read()
    i, k, indent = _find(s, section, key)
    name = key if section not in ('baby', 'child') else section
    body = '\n'.join(f"{indent}  '{r}'," for r in rows)
    o = f', {opts}' if opts else ''
    new = f"{indent}{name}: part([\n{body}\n{indent}]{o}),\n"
    s = s[:i] + new + s[k:]
    open(_path(form), 'w', encoding='utf8').write(s)

def setall(forms, section, key, rows, opts=None):
    for f in forms:
        setpart(f, section, key, rows, opts)

M_FORMS = ['biped', 'blob', 'floater', 'avian']
S_FORMS = ['quad', 'serpent']

# ---- silhouette helpers: hand-specified row extents, house shading, then hand details
def _draft():
    import os
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'draft.py')
    src = open(path, encoding='utf8').read()
    ns = {'__file__': path}
    exec(src.split('# ---------------------------------------------------------------- heads')[0], ns)
    return ns

def from_extents(w, spans, glint=None):
    """spans: list of (l, r) per row (inclusive) or None for an empty row;
    returns a shaded grid (list of lists) in the house style"""
    ns = _draft()
    m = [[1 if s and s[0] <= x <= s[1] else 0 for x in range(w)] for s in spans]
    g = ns['shade'](m, glint=False)
    if glint:
        gx, gy = glint
        g[gy][gx] = 'w'
        for dx, dy in ((1, 0), (0, 1)):
            if g[gy + dy][gx + dx] == '3': g[gy + dy][gx + dx] = '4'
    return g

def paint(g, marks):
    """marks: {char: [(x, y), ...]}"""
    for ch, pts in marks.items():
        for x, y in pts:
            g[y][x] = ch
    return [''.join(r) for r in g]

def mirror_pts(pts, w):
    return pts + [(w - 1 - x, y) for x, y in pts]

# ---- pattern zones: a second grid on a part that patterns can read (info.zone)
def spine_zones(rows, spine, seg=5, offset=0, chars='ab'):
    """Band a part across a hand-placed spine (a list of (x, y) points along the
    middle of a body): each filled pixel takes chars[k % len(chars)], where k is
    which `seg`-pixel stretch of the spine it sits beside. Returns zone rows."""
    import math
    segs, total = [], 0.0
    for (x0, y0), (x1, y1) in zip(spine, spine[1:]):
        L = math.hypot(x1 - x0, y1 - y0); segs.append((x0, y0, x1, y1, L, total)); total += L
    out = []
    for y, r in enumerate(rows):
        line = ''
        for x, c in enumerate(r):
            if c == '.':
                line += '.'; continue
            best = None
            for x0, y0, x1, y1, L, t0 in segs:
                t = max(0, min(1, ((x + .5 - x0) * (x1 - x0) + (y + .5 - y0) * (y1 - y0)) / (L * L or 1)))
                d = math.hypot(x + .5 - (x0 + t * (x1 - x0)), y + .5 - (y0 + t * (y1 - y0)))
                if best is None or d < best[0]: best = (d, t0 + t * L)
            line += chars[int((best[1] + offset) // seg) % len(chars)]
        out.append(line)
    return out

def setzones(form, section, key, zones):
    """Store a zones grid on a part as its `zones` option."""
    rows = rows_of(form, section, key)
    assert len(zones) == len(rows) and all(len(z) == len(rows[0]) for z in zones)
    s = open(_path(form), encoding='utf8').read()
    i, k, indent = _find(s, section, key)
    block = s[i:k]
    import re as _re
    block = _re.sub(r",\s*\{\s*zones:\s*\[[^\]]*\]\s*\}\)", ")", block)  # replace any old zones
    z = '\n'.join(f"{indent}    '{r}'," for r in zones)
    assert block.rstrip().endswith(']),'), 'setzones only handles parts without other options'
    block = block.rstrip()[:-2] + f", {{ zones: [\n{z}\n{indent}  ] }}),\n"
    open(_path(form), 'w', encoding='utf8').write(s[:i] + block + s[k:])

def widen_rows(rows, at=None, n=2):
    """Insert n copies of column `at` (default: the middle) into every row, half on
    each side so whatever sits in that column stays centred; socket markers in the
    copies become plain fill so each socket stays single."""
    at = len(rows[0]) // 2 if at is None else at
    markers = '@*^=[]<>()!?~#'
    out = []
    for r in rows:
        c = r[at]
        fill = '3' if c in markers else c
        out.append(r[:at] + fill * (n // 2) + c + fill * (n - n // 2) + r[at + 1:])
    return out

def widen(form, section, key, at=None, n=2, opts=None):
    """Widen a part in place by repeating its middle column (see widen_rows)."""
    setpart(form, section, key, widen_rows(rows_of(form, section, key), at, n), opts)
