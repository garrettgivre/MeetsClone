# Drafting tool: blocks in base shapes (masks, house shading, socket markers)
# and the original first drafts of src/art/pets/forms/*.js. The grids have
# since been finished by hand, so running the whole script would overwrite
# that work: it only rebuilds the forms when given --force. Import the shape
# helpers above the '# ---- forms' marker for new drafts instead (ed.py does).
import math, os, json

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'art', 'pets', 'forms')
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- shapes
def mask(w, h, fn, ss=4, px=False):
    m = [[0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            hit = 0
            for j in range(ss):
                for i in range(ss):
                    X = x + (i + .5) / ss; Y = y + (j + .5) / ss
                    if px:
                        ok = fn(X, Y)
                    else:
                        ok = fn((X - w / 2) / (w / 2), (Y - h / 2) / (h / 2))
                    if ok: hit += 1
            m[y][x] = 1 if hit * 2 >= ss * ss else 0
    return m

def nodoubles(m):
    h = len(m); w = len(m[0])
    M = lambda x, y: 0 <= x < w and 0 <= y < h and m[y][x]
    out = [r[:] for r in m]
    for y in range(h):
        for x in range(w):
            if not M(x, y): continue
            for dx, dy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
                if (not M(x + dx, y) and not M(x, y + dy) and M(x - dx, y) and M(x, y - dy)
                        and M(x - dx, y - dy) and M(x - 2 * dx, y) and M(x, y - 2 * dy)):
                    out[y][x] = 0; break
    return out

def shade(m, glint=False, rim=True):
    h = len(m); w = len(m[0])
    M = lambda x, y: 0 <= x < w and 0 <= y < h and m[y][x]
    def edge(x, y): return M(x, y) and not (M(x - 1, y) and M(x + 1, y) and M(x, y - 1) and M(x, y + 1))
    def edge_br(x, y): return M(x, y) and (not M(x + 1, y) or not M(x, y + 1))
    def edge_tl(x, y): return M(x, y) and (not M(x - 1, y) or not M(x, y - 1))
    g = [['.'] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if not M(x, y): continue
            u = (x + .5 - w / 2) / (w / 2); v = (y + .5 - h / 2) / (h / 2)
            if edge(x, y):
                lit = (not M(x, y - 1) or not M(x - 1, y)) and M(x, y + 1) and M(x + 1, y) or (not M(x - 1, y) and v < 0.5) or (not M(x, y - 1) and u < 0.4)
                g[y][x] = '1' if lit and v < 0.6 else 'o'
                continue
            c = '3'
            if (edge_br(x + 1, y) or edge_br(x, y + 1)) and u + v > 0.15: c = '2'
            if rim and (edge_tl(x, y - 1) or edge_tl(x - 1, y)) and u + v < -0.45: c = '4'
            g[y][x] = c
    if glint:
        gx, gy = int(w * 0.3), int(h * 0.28)
        for yy in range(gy, h):
            if g[yy][gx] in '34':
                g[yy][gx] = 'w'
                for dx, dy in ((1, 0), (0, 1)):
                    if g[yy + dy][gx + dx] == '3': g[yy + dy][gx + dx] = '4'
                break
    return g

def put(g, x, y, ch):
    g[y][x] = ch

def top_of(g, x):
    for y in range(len(g)):
        if g[y][x] != '.': return y
    return None

def rows(g): return [''.join(r) for r in g]

def supers(u, v, n): return abs(u) ** n + abs(v) ** n <= 1

def zig(x): return abs(((x % 1) + 1) % 1 - 0.5) * 2

# ---------------------------------------------------------------- heads
def head_fn(kind, flatbottom=False):
    def gum(u, v):
        if flatbottom and v > 0.55: return abs(u) <= 0.97
        return supers(u, v, 2.2 if v < 0 else 2.6)
    def fox(u, v):
        if flatbottom and v > 0.55: return abs(u) <= 0.86 + (0.1 if v < 0.75 else 0)
        base = supers(u / 0.86, v, 2.1 if v < 0 else 1.9)
        d = abs(v - 0.3)
        tuft = d < 0.32 and abs(u) < 0.84 + 0.18 * (1 - d / 0.32) and abs(u) <= 1
        return base or tuft
    def lamb(u, v):
        f = 0.86 - 0.12 * ((v + 1) / 2)
        if flatbottom and v > 0.55: return abs(u) <= f
        return supers(u / f, v, 2.1)
    def bell(u, v):
        if v < 0: return supers(u, v, 2.0)
        if flatbottom and v > 0.55: return abs(u) <= 0.98 and v < 0.62 + 0.4 * abs(math.cos(u * math.pi * 2.5))
        return abs(u) <= 0.98 and v < 0.72 + 0.22 * abs(math.cos(u * math.pi * 2.5))
    def bug(u, v):
        if flatbottom and v > 0.55: return abs(u) <= 0.97
        return supers(u, v, 2.0)
    def owl(u, v):
        if v < -0.82 and abs(u) < 0.22 + (v + 1) * 0.2: return False
        if flatbottom and v > 0.55: return abs(u) <= 0.99
        return supers(u, v, 3.0)
    return {'gumdrop': gum, 'fox': fox, 'lamb': lamb, 'bell': bell, 'bug': bug, 'owl': owl}[kind]

def make_head(kind, w, h, face, flatbottom=False, eary=None, earx=0.22):
    g = shade(nodoubles(mask(w, h, head_fn(kind, flatbottom))), glint=True)
    if kind == 'bug':  # a brow ridge across the forehead
        y = int(h * 0.3)
        for x in range(w):
            if g[y][x] in '34w': g[y][x] = '2'
    if kind == 'fox':  # fur tufts at the cheeks: a darker notch line
        pass
    cx = w // 2
    # sockets
    fx, fy = cx, int(h * face[1])
    put(g, fx, fy, face[0])
    ty = top_of(g, cx) + 1
    put(g, cx, ty, '^')
    ex = int(w * earx)
    ey = top_of(g, ex) + (eary if eary is not None else 1)
    g[ey][ex] = '['; g[ey][w - 1 - ex] = ']'
    # neck: bottom centre
    by = max(y for y in range(h) if g[y][cx] != '.')
    g[by - 1][cx] = '='
    return rows(g)

# ---------------------------------------------------------------- bodies
def body_mod(kind, u, v, a):
    if kind == 'fluffy': return 1 + 0.07 * zig(a * 7 / math.pi) if v > -0.3 else 1
    if kind == 'woolly': return 1 + 0.09 * abs(math.cos(a * 5))
    return 1

def body_texture(g, kind, w, h, axis='v'):
    H = len(g); W = len(g[0])
    if kind == 'segmented':
        if axis == 'v':
            for y in range(3, H - 1, 4):
                for x in range(W):
                    if g[y][x] in '34': g[y][x] = '2'
        else:
            for x in range(6, W - 2, 6):
                for y in range(H):
                    if g[y][x] in '34': g[y][x] = '2'
    if kind == 'feathered':
        cx = W // 2
        for (oy) in range(3, H - 3, 4):
            for dx in range(-3, 4):
                y = oy + abs(dx) // 2
                x = cx + dx
                if 0 <= y < H and 0 <= x < W and g[y][x] in '34': g[y][x] = '2'
    if kind == 'jelly':
        # a glossy streak and glint
        gx, gy = int(W * 0.25), int(H * 0.25)
        for i in range(3):
            x, y = gx + i, gy + i
            if 0 <= y < H and 0 <= x < W and g[y][x] in '23': g[y][x] = '4'
        if g[gy][gx] in '34': g[gy][gx] = 'w'
    return g

def compact_body(kind, w, h, base):
    def fn(u, v):
        a = math.atan2(v, u)
        k = body_mod(kind, u, v, a)
        if kind == 'bell' and v > 0.3:
            return abs(u) <= 0.95 and v < 0.75 + 0.25 * abs(math.cos(u * math.pi * 2))
        if kind == 'feathered' and v > 0.4:
            return base(u / k, v / k) and v < 0.82 + 0.16 * abs(math.cos(u * math.pi * 3))
        return base(u / k, v / k)
    g = shade(nodoubles(mask(w, h, fn)))
    return body_texture(g, kind, w, h)

# ---------------------------------------------------------------- simple stages
def simple(w, h, fn, face, px=False):
    g = shade(nodoubles(mask(w, h, fn, px=px)), glint=True)
    put(g, face[0], face[1], '@')
    return rows(g)

# ---------------------------------------------------------------- JS output
def js_rows(r, indent='    '):
    return '\n'.join(f"{indent}'{x}'," for x in r)

def js_part(r, opts=None, indent='    '):
    o = ''
    if opts: o = ', ' + opts
    return f"part([\n{js_rows(r, indent + '  ')}\n{indent}]{o})"

ALLELES_HEAD = ['fox', 'gumdrop', 'lamb', 'bell', 'bug', 'owl']
ALLELES_BODY = ['fluffy', 'jelly', 'woolly', 'bell', 'segmented', 'feathered']
OWN_HEAD = {'fox': 'Kitsu', 'gumdrop': 'Gloop', 'lamb': 'Fleece', 'bell': 'Glimmer', 'bug': 'Inchy', 'owl': 'Hoolet'}
OWN_BODY = {'fluffy': 'Kitsu', 'jelly': 'Gloop', 'woolly': 'Fleece', 'bell': 'Glimmer', 'segmented': 'Inchy', 'feathered': 'Hoolet'}

def section(name, entries, comment):
    s = f"  // {comment}\n  {name}: {{\n"
    for k, v in entries:
        s += f"    {k}: {v},\n"
    return s + "  },\n"

def write_form(name, doc, heads, bodies, extra):
    s = f"// {doc}\n// Drafted with a shape tool, then finished by hand. See src/art/pets/part.js for the format.\n\n"
    s += "import { part, ORANGE } from '../part.js';\n\n"
    s += f"export default {{\n  name: '{name}',\n"
    s += extra.get('head_meta', '')
    s += section('head', [(k, js_part(v, "{ under: { '=': 'o' } }", '    ')) for k, v in heads], 'heads (one per head allele)')
    s += section('body', [(k, js_part(v, None, '    ')) for k, v in bodies], 'bodies (one per body allele)')
    for key in ['baby', 'child']:
        s += f"  {key}: {js_part(extra[key], None, '  ')},\n"
    for sec in ['arms', 'plainFeet', 'ears', 'hair', 'topper', 'tail', 'feet', 'wings']:
        if sec in extra:
            s += f"  {sec}: {{\n"
            for k, v in extra[sec]:
                s += f"    {k}: {v},\n"
            s += "  },\n"
    for k in ['flags']:
        if k in extra: s += extra[k]
    s += "};\n"
    open(f'{OUT}/{name}.js', 'w', encoding='utf8').write(s)

# ---------------------------------------------------------------- hand-drawn ancillary parts
def P(r, opts=None):
    for i, x in enumerate(r):
        assert len(x) == len(r[0]), (r, i)
    return js_part(r, opts, '    ')

# Ears (left ear; the right is mirrored). Medium for big heads, small for S faces.
EARS_M = {
    'fox': P(['k.......', 'kk......', '1ko.....', '14ko....', '147o....', '1477o...', '14778o..', '147773o.', '1377733o'], '{ pivot: [5, 8] }'),
    'nubs': P(['.1111.', '14433o', '14333o', '13332o'], '{ pivot: [3, 3] }'),
    'lamb': P(['.....111.', '..1114443', '.14477733', '1477773o.', '.1ooooo..'], '{ pivot: [8, -3], front: true }'),
    'frills': P(['55.....', '585.55.', '.58585.', '..5875.', '.58775.', '587775.', '577766.', '.5666..'], '{ pivot: [4, 7] }'),
    'antennae': P(['.55..', '5885.', '5876.', '.66..', '..1..', '..1..', '...1.', '...1.', '...1.', '...1.'], '{ pivot: [3, 9] }'),
    'tufts': P(['1.....', '14....', '141...', '1441..', '14431.', '144331', '13332o', '1332oo'], '{ pivot: [4, 7] }'),
}
EARS_S = {
    'fox': P(['k....', '1k...', '14o..', '147o.', '1473o', '1333o'], '{ pivot: [3, 5] }'),
    'nubs': P(['.11.', '143o', '133o'], '{ pivot: [2, 2] }'),
    'lamb': P(['...11.', '.11443', '14773o', '.ooo..'], '{ pivot: [5, -2], front: true }'),
    'frills': P(['5..5.', '5858.', '.585.', '5876.', '.566.'], '{ pivot: [3, 4] }'),
    'antennae': P(['.55.', '5886', '.66.', '.1..', '..1.', '..1.'], '{ pivot: [2, 5] }'),
    'tufts': P(['1...', '141.', '1431', '1332', '133o'], '{ pivot: [2, 4] }'),
}
TOPPER_M = {
    'cherry': P(['....lj.', '...l...', '..l....', '.RRRR..', 'RqQqqR.', 'RqqqqR.', 'RrqqrR.', '.RRRR..'], '{ pivot: [3, 7] }'),
    'horns': P(['..nnn......nnn..', '.nNNNn....nNNNn.', 'nNnnNNn..nNNnnNn', 'nN..nNn..nNn..Nn', 'nNn.nN....Nn.nNn', '.nNNn......nNNn.', '..nn........nn..'], '{ pivot: [8, 4] }'),
    'lure': P(['..yyy..', '.yYwYy.', '.yYYYy.', '..yyy..', '...1...', '...1...', '..1....', '..1....', '...1...', '...1...'], '{ pivot: [3, 9] }'),
    'leaf': P(['......j...', '...jjLlj..', '.jLllllLj.', 'jLlLlLllLj', '.jLLLLLLj.', '..jjjjjj..'], '{ pivot: [5, 5] }'),
    'plume': P(['...5..', '..585.', '..585.', '.5875.', '.5875.', '58775.', '5876..', '.565..', '..5...'], '{ pivot: [2, 8] }'),
}
TOPPER_S = {
    'cherry': P(['..lj', '.l..', 'RRR.', 'RQqR', 'RqrR', '.RR.'], '{ pivot: [2, 5] }'),
    'horns': P(['.nnn....nnn.', 'nNNNn..nNNNn', 'nn.Nn..nN.nn', '.nNn....nNn.', '..n......n..'], '{ pivot: [6, 3] }'),
    'lure': P(['.yyy.', 'yYwYy', '.yyy.', '..1..', '.1...', '.1...', '..1..'], '{ pivot: [2, 6] }'),
    'leaf': P(['...j...', '.jLlLj.', 'jLlLlLj', '.jjjjj.'], '{ pivot: [3, 3] }'),
    'plume': P(['..5.', '.585', '.587', '5875', '.56.', '.5..'], '{ pivot: [1, 5] }'),
}
HAIR_M = {
    'tuft': P(['.-...-..', '.+-.-+-.', '-+0-+00-', '-+00009-', '.-0#09-.'], "{ under: { '#': '0' }, front: true }"),
    'drip': P(['...--------...', '.--++00000--..', '-+++000#00099-', '-+000-990-099-', '.-00-.-0-.-9-.', '..-0-..-...-..', '...-..........'], "{ under: { '#': '0' }, front: true }"),
    'wool': P(['...--..--..--...', '..-++--++--++-..', '.-+00-+00-+009-.', '-+000000#000009-', '-+0000000000099-', '.-990-990-990-9.', '..--...--...--..'], "{ under: { '#': '0' }, front: true }"),
}
HAIR_S = {
    'tuft': P(['.-..-.', '-+-.+-', '-+0#09', '.-99-.'], "{ under: { '#': '0' }, front: true }"),
    'drip': P(['..------..', '.-++00009-', '-+00#009-9', '.-0-.9-.-.', '..-...-...'], "{ under: { '#': '0' }, front: true }"),
    'wool': P(['.--.--.--.', '-++-++-++-', '-+00#0009-', '.-90-90-9-', '..-..-..-.'], "{ under: { '#': '0' }, front: true }"),
}
WINGS_L = {
    'veils': P(['5.......', '585.....', '58855...', '5877755.', '.587777#', '..58777.', '...5577.', '.....55.'], "{ under: { '#': '7' } }"),
    'feathered': P(['....111.', '..114431', '.1443331', '14433332', '1433333#', '13333322', '13232322', '.787878o', '..o.o.o.'], None),
}
WINGS_S = {
    'veils': P(['5.....', '5855..', '58775#', '.5777.', '..555.'], "{ under: { '#': '7' } }"),
    'feathered': P(['..111.', '.14431', '144332', '13333#', '1323o.', '.7.7..'], None),
}

def tail_stroke(pts, widths, w, h):
    """A thick curved stroke through pts (pixel coords) with per-point widths."""
    def fn(X, Y):
        best = False
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            r0, r1 = widths[i], widths[i + 1]
            for k in range(6):
                t = k / 5
                cx = x0 + (x1 - x0) * t; cy = y0 + (y1 - y0) * t; r = r0 + (r1 - r0) * t
                if (X - cx) ** 2 + (Y - cy) ** 2 <= r * r: return True
        return best
    return nodoubles(mask(w, h, fn, px=True))

def tail_part(kind, pts, widths, w, h, pivot, tip_from=None):
    m = tail_stroke(pts, widths, w, h)
    g = shade(m)
    if kind == 'brush':
        # cream tip
        tx, ty = pts[-1]
        for y in range(h):
            for x in range(w):
                if (x - tx) ** 2 + (y - ty) ** 2 < (widths[-2] + 1.2) ** 2 and g[y][x] in '1234o':
                    g[y][x] = {'1': '5', '2': '6', '3': '7', '4': '8', 'o': 'o'}[g[y][x]]
    if kind == 'spike':
        tx, ty = pts[-1]
        for y in range(h):
            for x in range(w):
                if (x - tx) ** 2 + (y - ty) ** 2 < 4.5 and g[y][x] != '.': g[y][x] = 'k'
        # accent stripe rings
        for (sx, sy) in pts[1:-1]:
            for y in range(h):
                for x in range(w):
                    if abs((x - sx) + (y - sy)) < 1 and (x - sx) ** 2 + (y - sy) ** 2 < 9 and g[y][x] in '234': g[y][x] = '7'
    if kind == 'tendrils':
        for y in range(h):
            for x in range(w):
                if g[y][x] != '.': g[y][x] = {'1': '5', '2': '6', '3': '7', '4': '8', 'o': '6'}[g[y][x]]
    if kind == 'puff':
        for y in range(h):
            for x in range(w):
                if g[y][x] in '234': g[y][x] = {'2': '6', '3': '7', '4': '8'}[g[y][x]]
                elif g[y][x] == '1': g[y][x] = '5'
    px, py = pivot
    return P(rows(g), f'{{ pivot: [{px}, {py}] }}')

def tendrils(w, h, starts, pivot, wave=1.0):
    g = [['.'] * w for _ in range(h)]
    for sx in starts:
        for y in range(h):
            x = int(round(sx + wave * math.sin(y * 0.7 + sx)))
            if 0 <= x < w:
                g[y][x] = '6' if y % 3 else '7'
                if y == h - 1: g[y][x] = '8'
    px, py = pivot
    return P(rows(g), f'{{ pivot: [{px}, {py}] }}')

def puff(w, h, pivot):
    m = nodoubles(mask(w, h, lambda u, v: (1 + 0.12 * abs(math.cos(math.atan2(v, u) * 4))) >= math.hypot(u, v)))
    g = shade(m)
    for y in range(h):
        for x in range(w):
            if g[y][x] in '1234':
                g[y][x] = {'1': '5', '2': '6', '3': '7', '4': '8'}[g[y][x]]
    px, py = pivot
    return P(rows(g), f'{{ pivot: [{px}, {py}] }}')

# ---------------------------------------------------------------- forms
def build_biped():
    W, H = 24, 20
    heads = [(k, make_head(k, W, H, ('*', 0.56))) for k in ALLELES_HEAD]
    bw, bh = 14, 12
    def base(u, v):
        f = 1 - 0.16 * (1 - (v + 1) / 2)
        return supers(u / f, v, 2.4)
    bodies = []
    for k in ALLELES_BODY:
        g = [list(r) for r in rows(compact_body(k, bw, bh, base))]
        put(g, bw // 2, 1, '=')
        put(g, 2, 3, '<'); put(g, bw - 3, 3, '>')
        put(g, 3, bh - 2, '!'); put(g, bw - 4, bh - 2, '?')
        put(g, bw - 2, bh - 4, '~')
        put(g, 2, 2, '('); put(g, bw - 3, 2, ')')
        bodies.append((k, rows(g)))
    baby = simple(14, 13, lambda u, v: supers(u, v * 1.05, 2.2) or (v > 0.7 and (abs(u - 0.45) < 0.22 or abs(u + 0.45) < 0.22)), (7, 6))
    def child_fn(X, Y):
        head = ((X - 9.5) / 9.5) ** 2 + ((Y - 7.5) / 7.5) ** 2 <= 1
        body = ((X - 9.5) / 5.5) ** 2 + ((Y - 15) / 4) ** 2 <= 1
        feet = Y > 17 and (abs(X - 6.5) < 2 or abs(X - 12.5) < 2) and Y < 19.5
        return head or body or feet
    child = simple(19, 20, child_fn, (9, 8), px=True)
    tails = {
        'brush': tail_part('brush', [(2, 13), (7, 10), (9, 5), (7, 1.5)], [2.2, 3.4, 3.2, 1.6], 13, 16, (1, 13)),
        'puff': puff(7, 7, (1, 4)),
        'spike': tail_part('spike', [(1, 8), (5, 6), (9, 3), (12, 1)], [2.0, 1.8, 1.3, 0.6], 14, 11, (1, 8)),
        'tendrils': tendrils(7, 10, [1, 3, 5], (3, 0)),
    }
    extra = dict(baby=baby, child=child)
    extra['arms'] = [
        ('down', P(['.11..', '1442.', '1432.', '14322', '13322', '.ooo.'], '{ pivot: [3, 1] }')),
        ('up', P(['.11..', '1441.', '1332o', '.143o', '.143o', '..13o', '..13o'], '{ pivot: [3, 6] }')),
        ('out', P(['.11....', '1441112', '1433332', '133222.', '.ooo...'], '{ pivot: [6, 1] }')),
    ]
    extra['plainFeet'] = [('stubs', P(['.1111.', '143332', '.oooo.'], '{ pivot: [3, 0] }'))]
    extra['ears'] = list(EARS_M.items())
    extra['hair'] = list(HAIR_M.items())
    extra['topper'] = list(TOPPER_M.items())
    extra['tail'] = list(tails.items())
    extra['feet'] = [
        ('paws', P(['.11111.', '1433332', '1378762', '.ooooo.'], '{ pivot: [3, 0] }')),
        ('hooves', P(['.1111.', '143332', 'dnNNnd', '.dddd.'], '{ pivot: [3, 0] }')),
        ('nubs', P(['.111.', '14332', '13322', '.ooo.'], '{ pivot: [2, 0] }')),
        ('talons', P(['..a..', '..a..', 'aNnnb', 'k.k.k'], '{ pivot: [2, 0], key: ORANGE }')),
    ]
    extra['wings'] = list(WINGS_S.items())
    extra['flags'] = "  face: 'L',\n  order: ['wings', 'tail', 'body', 'feet', 'arms', 'ears', 'head', 'hair', 'topper'],\n"
    write_form('biped', 'Biped: a big head on a small upright body, with arms and two feet.', heads, bodies, extra)

def build_blob():
    W, H = 28, 15
    heads = [(k, make_head(k, W, H, ('*', 0.72), flatbottom=True, earx=0.2)) for k in ALLELES_HEAD]
    bw, bh = 30, 14
    def base(u, v):
        if v < -0.4: return abs(u) <= 0.94
        return supers(u, v, 2.8) and v < 0.88
    bodies = []
    for k in ALLELES_BODY:
        g = [list(r) for r in rows(compact_body(k, bw, bh, base))]
        put(g, bw // 2, 1, '=')
        put(g, 2, 4, '<'); put(g, bw - 3, 4, '>')
        put(g, 8, bh - 3, '!'); put(g, bw - 9, bh - 3, '?')
        put(g, bw - 2, 8, '~')
        put(g, 2, 3, '('); put(g, bw - 3, 3, ')')
        bodies.append((k, rows(g)))
    baby = simple(16, 11, lambda u, v: supers(u, v, 2.3) and v < 0.85, (8, 6))
    child = simple(21, 14, lambda u, v: supers(u, v, 2.4) and v < 0.88, (10, 8))
    tails = {
        'brush': tail_part('brush', [(1, 8), (5, 6), (7, 3), (6, 1)], [1.8, 2.6, 2.4, 1.2], 10, 11, (1, 8)),
        'puff': puff(6, 6, (1, 3)),
        'spike': tail_part('spike', [(1, 5), (4, 4), (7, 2), (9, 1)], [1.6, 1.4, 1.0, 0.5], 11, 8, (1, 5)),
        'tendrils': tendrils(6, 7, [1, 4], (2, 0)),
    }
    extra = dict(baby=baby, child=child)
    extra['arms'] = [
        ('down', P(['.11.', '1432', '1322', '.oo.'], '{ pivot: [3, 0] }')),
        ('up', P(['.11.', '1432', '.132', '..1o'], '{ pivot: [3, 3] }')),
    ]
    extra['ears'] = list(EARS_M.items())
    extra['hair'] = list(HAIR_M.items())
    extra['topper'] = list(TOPPER_M.items())
    extra['tail'] = list(tails.items())
    extra['feet'] = [
        ('paws', P(['.111.', '14332', '17862', '.ooo.'], '{ pivot: [2, 0] }')),
        ('hooves', P(['.111.', 'dnNnd', '.ddd.'], '{ pivot: [2, 0] }')),
        ('nubs', P(['.11.', '1332', '.oo.'], '{ pivot: [2, 0] }')),
        ('talons', P(['aNnnb', 'k.k.k'], '{ pivot: [2, 0], key: ORANGE }')),
    ]
    extra['wings'] = list(WINGS_S.items())
    extra['flags'] = "  face: 'L',\n  merge: true, // head and body are one soft mass\n  order: ['wings', 'tail', 'body', 'feet', 'arms', 'ears', 'head', 'hair', 'topper'],\n"
    write_form('blob', 'Blob: head and body melt into one soft mass on little nub feet.', heads, bodies, extra)

def build_quad():
    W, H = 18, 15
    heads = [(k, make_head(k, W, H, ('@', 0.56), earx=0.2)) for k in ALLELES_HEAD]
    bw, bh = 30, 17
    legs = [4, 9, 19, 24]
    def base_px(kind):
        def fn(X, Y):
            u = (X - 15) / 15; v = (Y - 5.5) / 5.5
            a = math.atan2(v, u)
            k = body_mod(kind, u, v, a)
            torso = (u / k) ** 2 + (v / k) ** 2 <= 1
            if kind == 'bell' and v > 0.3: torso = abs(u) <= 0.95 and (u * u + v * v <= 1) and v < 0.7 + 0.3 * abs(math.cos(u * math.pi * 4))
            leg = any(abs(X - (lx + 0.5)) <= 1.6 for lx in legs) and 8 <= Y <= 16.5
            return torso or leg
        return fn
    bodies = []
    for k in ALLELES_BODY:
        g = shade(nodoubles(mask(bw, bh, base_px(k), px=True)))
        g = body_texture(g, k, bw, bh, axis='h')
        put(g, 5, 2, '=')
        put(g, bw - 2, 3, '~')
        for lx in legs: put(g, lx, bh - 2, '!')
        put(g, 12, 2, '('); put(g, 17, 2, ')')
        bodies.append((k, rows(g)))
    def baby_fn(X, Y):
        b = ((X - 8) / 7.5) ** 2 + ((Y - 6) / 5.5) ** 2 <= 1
        legs_ = Y > 9 and Y < 12 and any(abs(X - lx) < 1.3 for lx in (3, 6, 10, 13))
        return b or legs_
    baby = simple(16, 12, baby_fn, (5, 5), px=True)
    def child_fn(X, Y):
        head = ((X - 7) / 6.5) ** 2 + ((Y - 6) / 5.5) ** 2 <= 1
        body = ((X - 13) / 8.5) ** 2 + ((Y - 9.5) / 3.5) ** 2 <= 1
        legs_ = Y > 11 and Y < 14.5 and any(abs(X - lx) < 1.3 for lx in (7, 10, 16, 19))
        return head or body or legs_
    child = simple(22, 15, child_fn, (7, 6), px=True)
    tails = {
        'brush': tail_part('brush', [(1, 7), (5, 5), (8, 2), (7, 0.8)], [1.8, 2.6, 2.4, 1.2], 11, 10, (1, 7)),
        'puff': puff(7, 7, (1, 4)),
        'spike': tail_part('spike', [(1, 5), (5, 4), (9, 2), (12, 1)], [1.7, 1.5, 1.1, 0.5], 14, 8, (1, 5)),
        'tendrils': tendrils(6, 8, [1, 4], (2, 0)),
    }
    extra = dict(baby=baby, child=child)
    extra['ears'] = list(EARS_S.items())
    extra['hair'] = list(HAIR_S.items())
    extra['topper'] = list(TOPPER_S.items())
    extra['tail'] = list(tails.items())
    extra['feet'] = [
        ('paws', P(['14332', '17862', 'ooooo'], '{ pivot: [2, 0] }')),
        ('hooves', P(['.132.', 'dNNnd', 'ddddd'], '{ pivot: [2, 0] }')),
        ('nubs', P(['14332', '13322', '.ooo.'], '{ pivot: [2, 0] }')),
        ('talons', P(['aNnnb', 'k.k.k'], '{ pivot: [2, 0], key: ORANGE }')),
    ]
    extra['wings'] = list(WINGS_S.items())
    extra['flags'] = "  face: 'S',\n  order: ['tail', 'body', 'feet', 'wings', 'ears', 'head', 'hair', 'topper'],\n"
    write_form('quad', 'Quadruped: a long body on four legs, the head raised at the front.', heads, bodies, extra)

def build_floater():
    W, H = 24, 19
    heads = [(k, make_head(k, W, H, ('*', 0.58))) for k in ALLELES_HEAD]
    bw, bh = 20, 21
    def base_px(kind):
        def fn(X, Y):
            u = (X - 10) / 9; v = (Y - 6) / 6.5
            a = math.atan2(v, u)
            k = body_mod(kind, u, v, a)
            top = (u / k) ** 2 + (v / k) ** 2 <= 1 and Y < 11
            for i in range(12):
                t = i / 11
                cx = 10 + 7 * t ** 1.4; cy = 8 + 12 * t; r = 6.2 * (1 - t) + 0.7
                if kind == 'woolly': r *= 1 + 0.12 * abs(math.cos(t * 12))
                if kind == 'fluffy': r *= 1 + 0.1 * zig(t * 5)
                if (X - cx) ** 2 + (Y - cy) ** 2 <= r * r: return True
            return top
        return fn
    bodies = []
    for k in ALLELES_BODY:
        g = shade(nodoubles(mask(bw, bh, base_px(k), px=True)))
        g = body_texture(g, k, bw, bh)
        put(g, bw // 2, 1, '=')
        put(g, 3, 5, '<'); put(g, bw - 4, 5, '>')
        put(g, 6, 11, '!'); put(g, 12, 11, '?')
        # tail at the wisp's tip
        tip = max(((x, y) for y in range(bh) for x in range(bw) if g[y][x] != '.'), key=lambda p: p[0] * 0.6 + p[1])
        put(g, tip[0] - 1, tip[1] - 1, '~')
        put(g, 2, 4, '('); put(g, bw - 3, 4, ')')
        bodies.append((k, rows(g)))
    def baby_fn(X, Y):
        b = ((X - 6.5) / 6.2) ** 2 + ((Y - 6) / 5.8) ** 2 <= 1
        tail = any((X - (6.5 + 3 * t)) ** 2 + (Y - (9 + 5 * t)) ** 2 <= (3 * (1 - t) + 0.6) ** 2 for t in [i / 8 for i in range(9)])
        return b or tail
    baby = simple(13, 15, baby_fn, (6, 6), px=True)
    def child_fn(X, Y):
        b = ((X - 9) / 8.5) ** 2 + ((Y - 8) / 7.5) ** 2 <= 1
        tail = any((X - (9 + 5 * t)) ** 2 + (Y - (12 + 7 * t)) ** 2 <= (4.5 * (1 - t) + 0.6) ** 2 for t in [i / 10 for i in range(11)])
        return b or tail
    child = simple(18, 20, child_fn, (9, 8), px=True)
    tails = {
        'brush': tail_part('brush', [(1, 1), (4, 4), (8, 5), (11, 3)], [1.4, 2.2, 2.0, 1.0], 13, 8, (1, 1)),
        'puff': puff(6, 6, (2, 1)),
        'spike': tail_part('spike', [(1, 1), (4, 3), (7, 5), (10, 6)], [1.2, 1.1, 0.8, 0.4], 12, 8, (1, 1)),
        'tendrils': tendrils(7, 12, [1, 3, 5], (3, 0), wave=1.2),
    }
    extra = dict(baby=baby, child=child)
    extra['arms'] = [
        ('down', P(['.11.', '1432', '.oo.'], '{ pivot: [3, 0] }')),
        ('up', P(['.1.', '143', '.13'], '{ pivot: [2, 2] }')),
    ]
    extra['ears'] = list(EARS_M.items())
    extra['hair'] = list(HAIR_M.items())
    extra['topper'] = list(TOPPER_M.items())
    extra['tail'] = list(tails.items())
    extra['feet'] = [
        ('paws', P(['.13.', '1782', '.oo.'], '{ pivot: [2, 0] }')),
        ('hooves', P(['.13.', 'dNnd', '.dd.'], '{ pivot: [2, 0] }')),
        ('nubs', P(['.1.', '132', '.o.'], '{ pivot: [1, 0] }')),
        ('talons', P(['.a.', 'aNb', 'k.k'], '{ pivot: [1, 0], key: ORANGE }')),
    ]
    extra['wings'] = list(WINGS_L.items())
    extra['flags'] = "  face: 'L',\n  floats: true,\n  order: ['wings', 'body', 'tail', 'feet', 'arms', 'ears', 'head', 'hair', 'topper'],\n"
    write_form('floater', 'Floater: a big head that trails off into a curling wisp, hovering above the ground.', heads, bodies, extra)

def build_serpent():
    W, H = 18, 14
    heads = [(k, make_head(k, W, H, ('@', 0.58), earx=0.2)) for k in ALLELES_HEAD]
    bw, bh = 26, 28
    def path(t): return 13 - 7 * math.sin(2 * math.pi * t * 0.92), 3 + 22 * t
    def width(t): return 4.8 * (1 - 0.5 * t) + 0.6
    def base_px(kind):
        def fn(X, Y):
            for i in range(40):
                t = i / 39
                cx, cy = path(t); r = width(t)
                if kind == 'woolly': r *= 1 + 0.14 * abs(math.cos(t * 26))
                if kind == 'fluffy': r *= 1 + 0.1 * zig(t * 9)
                if kind == 'bell' and t > 0.75: r *= 1 + 0.2 * abs(math.cos(t * 40))
                if (X - cx) ** 2 + (Y - cy) ** 2 <= r * r: return True
            return False
        return fn
    bodies = []
    for k in ALLELES_BODY:
        g = shade(nodoubles(mask(bw, bh, base_px(k), px=True)))
        if k == 'segmented':
            for i in range(1, 8):
                t = i / 8
                cx, cy = path(t); r = width(t)
                for y in range(bh):
                    for x in range(bw):
                        if abs(math.hypot(x + .5 - cx, y + .5 - cy) - r * 0.2) < 0.6 and g[y][x] in '34': pass
                # crease: a short line across the body at t
                cx2, cy2 = path(t + 0.01)
                nx, ny = -(cy2 - cy), (cx2 - cx); L = math.hypot(nx, ny); nx /= L; ny /= L
                for s in range(-6, 7):
                    x = int(cx + nx * s * 0.8); y = int(cy + ny * s * 0.8)
                    if 0 <= x < bw and 0 <= y < bh and g[y][x] in '34': g[y][x] = '2'
        else:
            g = body_texture(g, k, bw, bh)
        put(g, 13, 2, '=')
        tx, ty = path(1.0)
        put(g, int(tx) - 1, int(ty) - 1, '~')
        # little legs under the two bends
        lx, ly = path(0.32); put(g, int(lx - width(0.32)) + 2, int(ly) + 2, '!')
        rx, ry = path(0.78); put(g, int(rx + width(0.78)) - 2, int(ry) + 1, '?')
        wx, wy = path(0.12); put(g, int(wx - width(0.12)) + 1, int(wy), '('); put(g, int(wx + width(0.12)) - 1, int(wy), ')')
        bodies.append((k, rows(g)))
    def baby_fn(X, Y):
        head = ((X - 6) / 5.5) ** 2 + ((Y - 5) / 4.5) ** 2 <= 1
        body = any((X - (6 - 3 * math.sin(t * 5.5))) ** 2 + (Y - (8 + 6 * t)) ** 2 <= (3 * (1 - 0.4 * t)) ** 2 for t in [i / 10 for i in range(11)])
        return head or body
    baby = simple(12, 15, baby_fn, (6, 5), px=True)
    def child_fn(X, Y):
        head = ((X - 8) / 7) ** 2 + ((Y - 6) / 5.5) ** 2 <= 1
        body = any((X - (8 - 4 * math.sin(t * 5.8))) ** 2 + (Y - (10 + 9 * t)) ** 2 <= (4 * (1 - 0.45 * t)) ** 2 for t in [i / 14 for i in range(15)])
        return head or body
    child = simple(16, 21, child_fn, (8, 6), px=True)
    tails = {
        'brush': tail_part('brush', [(1, 1), (4, 2), (7, 1), (9, -0.5)], [1.4, 2.0, 1.8, 1.0], 11, 5, (1, 1)),
        'puff': puff(6, 6, (1, 2)),
        'spike': tail_part('spike', [(1, 2), (4, 2), (7, 1), (10, 0.5)], [1.4, 1.2, 0.9, 0.4], 11, 5, (1, 2)),
        'tendrils': tendrils(6, 7, [1, 4], (2, 0)),
    }
    extra = dict(baby=baby, child=child)
    extra['ears'] = list(EARS_S.items())
    extra['hair'] = list(HAIR_S.items())
    extra['topper'] = list(TOPPER_S.items())
    extra['tail'] = list(tails.items())
    extra['feet'] = [
        ('paws', P(['.13o', '.13o', '1782', '.oo.'], '{ pivot: [2, 0] }')),
        ('hooves', P(['.13o', '.13o', 'dNnd', '.dd.'], '{ pivot: [2, 0] }')),
        ('nubs', P(['.11.', '1432', '1322', '.oo.'], '{ pivot: [2, 0] }')),
        ('talons', P(['.a.', '.a.', 'aNb', 'k.k'], '{ pivot: [1, 0], key: ORANGE }')),
    ]
    extra['wings'] = list(WINGS_S.items())
    extra['flags'] = "  face: 'S',\n  order: ['tail', 'wings', 'feet', 'body', 'ears', 'head', 'hair', 'topper'],\n"
    write_form('serpent', 'Serpent: a long body that coils up in an S, the head raised on top.', heads, bodies, extra)

def build_avian():
    W, H = 22, 13
    heads = [(k, make_head(k, W, H, ('*', 0.62), flatbottom=True, earx=0.2)) for k in ALLELES_HEAD]
    bw, bh = 24, 18
    def base(u, v):
        if v < -0.6: return abs(u) <= 0.92
        return u * u + ((v + 0.15) / 1.15) ** 2 <= 1
    bodies = []
    for k in ALLELES_BODY:
        g = [list(r) for r in rows(compact_body(k, bw, bh, base))]
        put(g, bw // 2, 1, '=')
        put(g, 2, 6, '<'); put(g, bw - 3, 6, '>')
        put(g, 8, bh - 2, '!'); put(g, bw - 9, bh - 2, '?')
        put(g, bw - 3, 12, '~')
        put(g, 2, 4, '('); put(g, bw - 3, 4, ')')
        bodies.append((k, rows(g)))
    baby = simple(12, 14, lambda u, v: u * u + ((v + 0.1) / 1.1) ** 2 <= 1, (6, 5))
    child = simple(16, 19, lambda u, v: u * u + ((v + 0.08) / 1.08) ** 2 <= 1, (8, 7))
    tails = {
        'brush': tail_part('brush', [(1, 1), (4, 4), (7, 6), (9, 6)], [1.6, 2.2, 2.0, 1.0], 11, 9, (1, 1)),
        'puff': puff(6, 6, (1, 2)),
        'spike': tail_part('spike', [(1, 1), (4, 3), (7, 5), (10, 6)], [1.3, 1.1, 0.8, 0.4], 12, 8, (1, 1)),
        'tendrils': tendrils(6, 8, [1, 4], (2, 0)),
    }
    extra = dict(baby=baby, child=child)
    extra['arms'] = [
        ('down', P(['.11..', '14431', '14332', '.1322', '..oo.'], '{ pivot: [4, 0] }')),
        ('up', P(['..11', '.143', '1432', '13o.'], '{ pivot: [3, 3] }')),
    ]
    extra['plainFeet'] = [('legs', P(['..a..', '..a..', '.aNb.', '.k.k.'], '{ pivot: [2, 0], key: ORANGE }'))]
    extra['ears'] = list(EARS_M.items())
    extra['hair'] = list(HAIR_M.items())
    extra['topper'] = list(TOPPER_M.items())
    extra['tail'] = list(tails.items())
    extra['feet'] = [
        ('paws', P(['.13o.', '.13o.', '14782', '.ooo.'], '{ pivot: [2, 0] }')),
        ('hooves', P(['.13o.', '.13o.', 'dnNnd', '.ddd.'], '{ pivot: [2, 0] }')),
        ('nubs', P(['.13.', '.13.', '1432', '.oo.'], '{ pivot: [2, 0] }')),
        ('talons', P(['..a..', '..a..', '..a..', 'aNnnb', 'k.k.k'], '{ pivot: [2, 0], key: ORANGE }')),
    ]
    extra['wings'] = list(WINGS_L.items())
    extra['flags'] = "  face: 'L',\n  merge: true, // the head is the top of the egg\n  armsUnlessWings: true,\n  order: ['tail', 'body', 'feet', 'wings', 'arms', 'ears', 'head', 'hair', 'topper'],\n"
    write_form('avian', 'Avian: an egg-shaped bird body with a big face, wings at the sides and legs below.', heads, bodies, extra)

if __name__ == '__main__':
    import sys
    if '--force' not in sys.argv:
        sys.exit('refusing to overwrite the hand-finished form files; pass --force to redraft from scratch')
    for b in [build_biped, build_blob, build_quad, build_floater, build_serpent, build_avian]:
        b()
    print('drafted')
