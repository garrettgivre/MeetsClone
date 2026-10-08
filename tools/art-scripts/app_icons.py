"""Render the app icon (the same 16x16 drawing as assets/icon.svg) to the PNG
sizes an installable web app needs. Run from the project root:

    python tools/art-scripts/app_icons.py

Writes assets/icon-192.png, icon-512.png (pixel-rounded corners),
icon-maskable-512.png (full-bleed, art inside the safe zone),
apple-touch-icon.png (180, square: iOS rounds it itself) and badge.png (96,
the little pet in a phone's status bar when a care alert arrives: Android only
uses its shape, so it is plain white with the eyes and mouth cut out).
"""
import os
from PIL import Image, ImageColor

BG, INK, BODY, WHITE, BLUSH = '#fbd3e4', '#262459', '#9fd8f5', '#ffffff', '#f59ac4'
GRID = [
    '................',
    '................',
    '................',
    '.....oooooo.....',
    '....obbbbbbo....',
    '...obbbbbbbbo...',
    '...obbwbbwbbo...',
    '...obbkbbkbbo...',
    '...obpbbbbpbo...',
    '...obbbkkbbbo...',
    '...obbbbbbbbo...',
    '....obbbbbbo....',
    '.....oooooo.....',
    '................',
    '................',
    '................',
]
KEY = {'.': BG, 'o': INK, 'k': INK, 'b': BODY, 'w': WHITE, 'p': BLUSH}
# cells cut from each corner for the stepped, rounded look (mirrored to all four)
CORNER = {(0, 0), (1, 0), (0, 1)}
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets')


def render(size, cell, rounded):
    """A size x size icon with the 16x16 art drawn at `cell` pixels per cell, centred."""
    img = Image.new('RGBA', (size, size), BG)
    px = img.load()
    off = (size - 16 * cell) // 2
    for gy, row in enumerate(GRID):
        for gx, ch in enumerate(row):
            cut = rounded and (min(gx, 15 - gx), min(gy, 15 - gy)) in CORNER
            colour = (0, 0, 0, 0) if cut else ImageColor.getrgb(KEY[ch]) + (255,)
            for y in range(off + gy * cell, off + (gy + 1) * cell):
                for x in range(off + gx * cell, off + (gx + 1) * cell):
                    px[x, y] = colour
    return img


def badge(size=96, cell=9):
    """The pet's face as a white silhouette on transparent, cropped to the face."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    px = img.load()
    face = [row[3:13] for row in GRID[3:13]]
    off = (size - 10 * cell) // 2
    for gy, row in enumerate(face):
        for gx, ch in enumerate(row):
            if ch not in 'obp': continue  # eyes and mouth stay see-through
            for y in range(off + gy * cell, off + (gy + 1) * cell):
                for x in range(off + gx * cell, off + (gx + 1) * cell):
                    px[x, y] = (255, 255, 255, 255)
    return img


if __name__ == '__main__':
    badge().save(os.path.join(OUT, 'badge.png'), optimize=True)
    print('wrote badge.png')
    for name, size, cell, rounded in [
        ('icon-192.png', 192, 12, True),
        ('icon-512.png', 512, 32, True),
        ('icon-maskable-512.png', 512, 24, False),
        ('apple-touch-icon.png', 180, 11, False),
    ]:
        render(size, cell, rounded).save(os.path.join(OUT, name), optimize=True)
        print('wrote', name)
