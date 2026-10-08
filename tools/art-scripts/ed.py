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
    src = open(os.path.join(os.path.dirname(__file__), 'draft.py'), encoding='utf8').read()
    ns = {}
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
