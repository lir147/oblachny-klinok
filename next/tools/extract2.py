"""Сборка ассетов Flare для «Облачного клинка» (v56+).
Каждый слой снаряжения и каждый монстр — отдельный атлас WebP + JSON.
Графика: проект Flare, CC-BY-SA 3.0."""
import json, re, io, os, sys
from multiprocessing import Pool
from PIL import Image

FC = '/home/claude/ext/flare/mods/fantasycore/'
EC = '/home/claude/ext/flare/mods/empyrean_campaign/'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/oblachny-klinok/next/flare'
HERO_ANIMS = ['stance', 'run', 'swing', 'cast', 'shoot', 'hit', 'die']
MOB_ANIMS = ['stance', 'run', 'swing', 'hit', 'die']
MOB_SC = {'wyvern_water': .45, 'wyvern_air': .45, 'wyvern_fire': .45, 'minotaur': .6, 'skeleton_knight_boss': .6, 'antlion_armored': .6, 'skeleton_mage_high_boss': .6}

def find(rel):
    for b in (EC, FC):
        if os.path.exists(b + rel): return b + rel
    raise FileNotFoundError(rel)

def parse(path):
    txt = open(path).read()
    images, default, anims, cur = {}, None, {}, None
    for line in txt.splitlines():
        line = line.strip()
        if line.startswith('image='):
            v = line[6:].split(',')
            if len(v) == 2: images[v[1]] = v[0]
            else: default = v[0]
        elif line.startswith('['):
            cur = line[1:-1]; anims[cur] = {'frames': [], 'n': 0, 'dur': 0, 'type': ''}
        elif cur and line.startswith('frames='): anims[cur]['n'] = int(line[7:])
        elif cur and line.startswith('duration='): anims[cur]['dur'] = int(re.sub(r'\D', '', line))
        elif cur and line.startswith('type='): anims[cur]['type'] = line[5:]
        elif cur and line.startswith('frame='):
            v = line[6:].split(',')
            i, d, x, y, w, h, ox, oy = map(int, v[:8])
            im = images.get(v[8]) if len(v) > 8 else (images.get(cur) or default)
            anims[cur]['frames'].append((i, d, x, y, w, h, ox, oy, im))
    return anims

_img = {}
def img(p):
    if p not in _img: _img[p] = Image.open(find(p)).convert('RGBA')
    return _img[p]

def build(anim_file, anim_names, sc, out_base, q=78, keep_meta=None):
    A = parse(anim_file)
    frames, meta = [], {}
    for an in anim_names:
        if an not in A or not A[an]['frames']: continue
        a = A[an]; meta[an] = {'n': a['n'], 'dur': a['dur'], 'type': a['type']}
        for (i, d, x, y, w, h, ox, oy, im) in a['frames']:
            c = img(im).crop((x, y, x + w, y + h))
            bb = c.getbbox()
            if not bb: c = Image.new('RGBA', (1, 1)); bx = by = 0
            else: c = c.crop(bb); bx, by = bb[0], bb[1]
            W, H = max(1, round(c.width * sc)), max(1, round(c.height * sc))
            if c.width > 1: c = c.resize((W, H), Image.LANCZOS)
            frames.append((f'{an}_{d}_{i}', c, (ox - bx) * sc, (oy - by) * sc))
    if not frames: return None
    # общий исходный прямоугольник с одним якорем на все кадры слоя
    L = max(f[2] for f in frames); T = max(f[3] for f in frames)
    Rr = max(f[1].width - f[2] for f in frames); B = max(f[1].height - f[3] for f in frames)
    SW, SH = int(L + Rr) + 2, int(T + B) + 2
    order = sorted(frames, key=lambda t: -t[1].height)
    maxw = 2048 if sum(f[1].width * f[1].height for f in frames) < 2048 * 1400 else 4096
    X = Y = RH = 0; pos = []
    for k, im, ax, ay in order:
        if X + im.width > maxw: X = 0; Y += RH + 1; RH = 0
        pos.append((k, im, ax, ay, X, Y)); X += im.width + 1; RH = max(RH, im.height)
    atlas = Image.new('RGBA', (maxw, Y + RH))
    js = {'frames': {}, 'meta': {'size': {'w': maxw, 'h': Y + RH}, 'scale': 1, 'origin': [L / SW, T / SH], 'anims': meta, 'src': 'Flare (CC-BY-SA 3.0)'}}
    for k, im, ax, ay, px, py in pos:
        atlas.alpha_composite(im, (px, py))
        js['frames'][k] = {'frame': {'x': px, 'y': py, 'w': im.width, 'h': im.height}, 'rotated': False, 'trimmed': True,
                           'spriteSourceSize': {'x': int(round(L - ax)), 'y': int(round(T - ay)), 'w': im.width, 'h': im.height},
                           'sourceSize': {'w': SW, 'h': SH}}
    os.makedirs(os.path.dirname(out_base), exist_ok=True)
    atlas.save(out_base + '.webp', 'WEBP', quality=q, method=4)
    json.dump(js, open(out_base + '.json', 'w'), separators=(',', ':'))
    return os.path.getsize(out_base + '.webp')

HERO_ITEMS = ('head_short head_bald head_long plate_helm chain_coif leather_hood mage_hood mage_hood_alt1 mage_hood_alt2 '
              'cloth_shirt leather_chest chain_cuirass plate_cuirass mage_vest mage_vest_alt1 mage_vest_alt2 default_chest '
              'cloth_pants leather_pants chain_greaves plate_greaves mage_skirt mage_skirt_alt1 mage_skirt_alt2 default_legs '
              'default_hands cloth_gloves leather_gloves chain_gloves plate_gauntlets mage_sleeves mage_sleeves_alt1 mage_sleeves_alt2 '
              'default_feet cloth_sandals leather_boots chain_boots plate_boots mage_boots mage_boots_alt1 mage_boots_alt2 '
              'longsword shortsword dagger greatsword zweihander infantry_axe reinforced_club war_hammer battle_axe mace club hand_axe maul '
              'staff greatstaff rod wand longbow shortbow greatbow slingshot buckler kite_shield').split()

# монстр v55 → (файл Flare, масштаб хранения)
MOBS = {'goblin': 'goblin', 'goblin_elite': 'goblin_elite', 'hobgoblin': 'hobgoblin', 'skeleton': 'skeleton', 'skeleton_archer': 'skeleton_archer',
        'skeleton_mage': 'skeleton_mage', 'zombie': 'zombie', 'zombie_dark': 'zombie_dark', 'antlion': 'antlion', 'antlion_small': 'antlion_small',
        'antlion_armored': 'antlion_armored', 'fire_ant': 'fire_ant', 'ice_ant': 'ice_ant', 'minotaur': 'minotaur', 'boulder': 'boulder',
        'wyvern_water': 'wyvern_water', 'wyvern_air': 'wyvern_air', 'wyvern_fire': 'wyvern_fire', 'skeleton_knight_boss': 'skeleton_knight_boss',
        'skeleton_mage_high_boss': 'skeleton_mage_high_boss'}

def job(t):
    kind, name, sex = t
    try:
        if kind == 'hero':
            rel = f'animations/avatar/{"male" if sex == "m" else "female"}/{name}.txt'
            try: path = find(rel)
            except FileNotFoundError: return (kind, sex, name, None)
            return (kind, sex, name, build(path, HERO_ANIMS, .75, f'{OUT}/hero/{sex}/{name}', q=75))
        path = find(f'animations/enemies/{name}.txt')
        return (kind, sex, name, build(path, MOB_ANIMS, MOB_SC.get(name, .6), f'{OUT}/mob/{name}', q=74))
    except Exception as e:
        return (kind, sex, name, 'ERR ' + repr(e))

if __name__ == '__main__':
    only = os.environ.get('ONLY')
    jobs = [('hero', n, s) for s in ('m', 'f') for n in HERO_ITEMS] + [('mob', n, '') for n in MOBS]
    if only: jobs = [j for j in jobs if j[1] in only.split(',')]
    tot = 0; man = {'hero': {'m': [], 'f': []}, 'mob': []}
    with Pool(2) as p:
        for kind, sex, name, r in p.imap_unordered(job, jobs):
            if isinstance(r, int): tot += r; (man['hero'][sex] if kind == 'hero' else man['mob']).append(name)
            print(kind, sex, name, r if not isinstance(r, int) else f'{r // 1024}KB', flush=True)
    if not only or os.environ.get('MAN'):
        json.dump(man, open(f'{OUT}/manifest.json', 'w'))
    print('TOTAL', tot // 1024 // 1024, 'MB')
