"""Тайлы земли и объекты карты Flare → один атлас next/flare/tiles.webp + .json (кадры 'g16', 's435', 'd150', 'c20' …)."""
import json, re, os, sys
from PIL import Image
FC = '/home/claude/ext/flare/mods/fantasycore/'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/oblachny-klinok/next/flare'
SC = .5
SETS = {
    'g': ('tileset_grassland.txt', list(range(16, 48)) + [72, 75, 98, 99, 102, 103, 112, 113, 116, 117, 118, 119, 124, 125, 128, 129, 130, 131, 136, 137, 138, 140, 141, 142, 143] + list(range(240, 256)) + [264, 265, 76, 77, 297]),
    's': ('tileset_snowplains.txt', list(range(16, 44)) + list(range(568, 584)) + [72, 75, 244, 245, 246, 247, 535, 552, 553, 554, 555, 556, 557, 132, 133, 134, 135, 532, 265]),
    'd': ('tileset_dungeon.txt', [16, 17, 18, 19, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 56, 57, 58, 59, 60, 61, 62, 63, 110, 111, 128, 129, 130, 131, 132, 134, 136, 144, 146, 147, 148, 151, 167, 202, 100, 265, 64, 65, 68, 69, 101, 102, 103, 106, 107]),
    'c': ('tileset_cave.txt', list(range(16, 32)) + [48, 49, 50, 51, 52, 53, 54, 55]),
}
def tiles(defs):
    T = {}; cur = None
    for line in open(FC + 'tilesetdefs/' + defs):
        line = line.strip()
        if line.startswith('img='): cur = line[4:]
        m = re.match(r'tile=(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)', line)
        if m: T[int(m[1])] = (cur,) + tuple(map(int, m.groups()[1:]))
    return T
ims, frames = {}, []
for pre, (defs, ids) in SETS.items():
    T = tiles(defs)
    for i in ids:
        if i not in T: print('нет', pre, i); continue
        p, x, y, w, h, ox, oy = T[i]
        if p not in ims: ims[p] = Image.open(FC + p).convert('RGBA')
        c = ims[p].crop((x, y, x + w, y + h)).resize((round(w * SC), round(h * SC)), Image.LANCZOS)
        frames.append((pre + str(i), c, ox * SC, oy * SC, w == 192 and h <= 100))
frames.sort(key=lambda f: -f[1].height)
X = Y = RH = 0; pos = []; W = 2048
for k, im, ax, ay, flat in frames:
    if X + im.width > W: X = 0; Y += RH + 2; RH = 0
    pos.append((k, im, ax, ay, flat, X, Y)); X += im.width + 2; RH = max(RH, im.height)
atlas = Image.new('RGBA', (W, Y + RH))
js = {'frames': {}, 'meta': {'size': {'w': W, 'h': Y + RH}, 'scale': SC, 'origins': {}, 'src': 'Flare (CC-BY-SA 3.0)'}}
for k, im, ax, ay, flat, px, py in pos:
    atlas.alpha_composite(im, (px, py))
    js['frames'][k] = {'frame': {'x': px, 'y': py, 'w': im.width, 'h': im.height}}
    js['meta']['origins'][k] = [round(ax / im.width, 4), round(ay / im.height, 4)]
atlas.save(OUT + '/tiles.webp', 'WEBP', quality=80, method=5)
json.dump(js, open(OUT + '/tiles.json', 'w'), separators=(',', ':'))
print(atlas.size, os.path.getsize(OUT + '/tiles.webp') // 1024, 'KB', len(frames))
