import json, sys, math
from PIL import Image
def repack(k, MAX=2048):
    d = json.load(open(k + '.json')); im = Image.open(k + '.webp').convert('RGBA')
    fr = d['frames']; names = list(fr)
    area = sum(fr[n]['frame']['w'] * fr[n]['frame']['h'] for n in names)
    sc = 1.0
    while True:
        crops = {}
        for n in names:
            f = fr[n]['frame']; c = im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
            if sc != 1: c = c.resize((max(1, round(f['w'] * sc)), max(1, round(f['h'] * sc))), Image.LANCZOS)
            crops[n] = c
        order = sorted(names, key=lambda n: -crops[n].height)
        x = y = rowh = 0; pos = {}
        for n in order:
            w, h = crops[n].size
            if x + w + 1 > MAX: x = 0; y += rowh + 1; rowh = 0
            pos[n] = (x, y); x += w + 1; rowh = max(rowh, h)
        H = y + rowh
        if H <= MAX: break
        sc *= 0.92
    out = Image.new('RGBA', (MAX, H))
    for n in names:
        out.paste(crops[n], pos[n]); e = fr[n]; w, h = crops[n].size
        ss = e['spriteSourceSize']; so = e['sourceSize']
        e['frame'] = {'x': pos[n][0], 'y': pos[n][1], 'w': w, 'h': h}
        e['spriteSourceSize'] = {'x': round(ss['x'] * sc), 'y': round(ss['y'] * sc), 'w': w, 'h': h}
        e['sourceSize'] = {'w': round(so['w'] * sc), 'h': round(so['h'] * sc)}
    d['meta']['size'] = {'w': MAX, 'h': H}
    out.save(k + '.webp', quality=80, method=6); json.dump(d, open(k + '.json', 'w'), separators=(',', ':'))
    print(k, round(sc, 3), MAX, H)
for k in sys.argv[1:]: repack(k)
