/* ========== Графика Flare: герои из слоёв снаряжения, монстры, 8 направлений ==========
   Арт: проект Flare (flarerpg.org), лицензия CC-BY-SA 3.0. Атласы лежат в flare/, грузятся по требованию. */
const FLR = (() => {
  const BASE = 'flare/';
  // порядок слоёв по направлению (0 W, 1 NW, 2 N, 3 NE, 4 E, 5 SE, 6 S, 7 SW) — из engine/hero_layers.txt Flare
  const A = ['main', 'feet', 'legs', 'hands', 'chest', 'off', 'head', 'helm'], B = ['feet', 'legs', 'hands', 'chest', 'off', 'head', 'helm', 'main'];
  const ORDER = [A, A, B, B, B, ['feet', 'legs', 'hands', 'main', 'chest', 'head', 'helm', 'off'], ['main', 'feet', 'legs', 'hands', 'chest', 'head', 'helm', 'off'], A];
  const SLOTS = ['feet', 'legs', 'hands', 'chest', 'off', 'head', 'helm', 'main'];
  const ANGLE = [Math.PI, -Math.PI * .75, -Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4, Math.PI / 2, Math.PI * .75];
  const dirOf = (sx, sy) => [4, 5, 6, 7, 0, 1, 2, 3][((Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) % 8) + 8) % 8];
  const SETS = {
    cloth: { chest: 'cloth_shirt', legs: 'cloth_pants', hands: 'default_hands', feet: 'cloth_sandals' },
    leather: { chest: 'leather_chest', legs: 'leather_pants', hands: 'leather_gloves', feet: 'leather_boots' },
    chain: { chest: 'chain_cuirass', legs: 'chain_greaves', hands: 'chain_gloves', feet: 'chain_boots' },
    plate: { chest: 'plate_cuirass', legs: 'plate_greaves', hands: 'plate_gauntlets', feet: 'plate_boots' },
    mage0: { chest: 'mage_vest', legs: 'mage_skirt', hands: 'mage_sleeves', feet: 'mage_boots' },
    mage1: { chest: 'mage_vest_alt1', legs: 'mage_skirt_alt1', hands: 'mage_sleeves_alt1', feet: 'mage_boots_alt1' },
    mage2: { chest: 'mage_vest_alt2', legs: 'mage_skirt_alt2', hands: 'mage_sleeves_alt2', feet: 'mage_boots_alt2' }
  };
  const TIER = { warrior: ['cloth', 'leather', 'chain', 'plate', 'plate'], archer: ['cloth', 'leather', 'leather', 'chain', 'chain'], rogue: ['leather', 'leather', 'leather', 'chain', 'chain'], mage: ['mage0', 'mage0', 'mage1', 'mage2', 'mage2'] };
  const HELM = { warrior: [null, null, 'chain_coif', 'plate_helm', 'plate_helm'], archer: [null, null, 'leather_hood', 'leather_hood', 'chain_coif'], rogue: ['leather_hood', 'leather_hood', 'leather_hood', 'leather_hood', 'chain_coif'], mage: [null, 'mage_hood', 'mage_hood_alt1', 'mage_hood_alt2', 'mage_hood_alt2'] };
  const WEAP = {
    katana: 'longsword', tachi: 'longsword', jian: 'longsword', legblade: 'longsword', kusarigama: 'hand_axe', wakizashi: 'shortsword', tanto: 'dagger', kunai: 'dagger', shinobi: 'shortsword',
    nodachi: 'zweihander', odachi: 'zweihander', greatsword: 'greatsword', zanbato: 'zweihander',
    naginata: 'infantry_axe', yari: 'infantry_axe', bisento: 'infantry_axe', scythe: 'infantry_axe', kanabo: 'reinforced_club', hammer: 'war_hammer', ono: 'battle_axe',
    bo: 'staff', mstaff: 'greatstaff', icestaff: 'greatstaff', bonestaff: 'greatstaff', legstaff: 'greatstaff', scepter: 'rod', tome: 'wand', orb: 'wand', tessen: 'wand',
    yumi: 'longbow', longbow: 'longbow', stormbow: 'longbow', legbow: 'longbow', hankyu: 'shortbow', compbow: 'shortbow', crossbow: 'shortbow', repeater: 'shortbow', greatbow: 'greatbow'
  };
  const DEF_WEAP = { warrior: 'longsword', mage: 'staff', archer: 'longbow', rogue: 'dagger' };
  const ACT = { warrior: 'swing', rogue: 'swing', mage: 'cast', archer: 'shoot' };
  // монстры v55 → Flare: [атлас, высота на экране (px мира), оттенок по умолчанию]
  const MOB = {
    shade: ['skeleton_mage', 64, 0x9a86d0], horned: ['hobgoblin', 60], boss: ['minotaur', 128], wolf: ['antlion', 46], spider: ['antlion_small', 40, 0xb090c0],
    spiderqueen: ['antlion_armored', 92], icedemon: ['wyvern_water', 70], ronin: ['zombie_dark', 70], general: ['skeleton_knight_boss', 118, 0xc8dcff],
    kappa: ['zombie', 66, 0x9ad8a0], tengu: ['goblin_elite', 56], skeleton: ['skeleton', 72], firefox: ['fire_ant', 44], golem: ['boulder', 74], batdemon: ['wyvern_air', 54]
  };
  const status = {}; // ключ текстуры → 'loading' | 'ready' | 'missing'
  let MAN = null, scene = null;
  const rigs = new Set();

  function init(S) {
    scene = S; window.__FLG = S; window.__dbg = { get save() { return save; } };
    if (!MAN && !status.__man) { status.__man = 1; fetch(BASE + 'manifest.json').then(r => r.json()).then(j => { MAN = j; }).catch(() => { MAN = { hero: { m: [], f: [] }, mob: [] }; }); }
    if (!S._flInit) {
      S._flInit = true;
      S.load.on('filecomplete', (key, type) => { if (type === 'atlasjson' && key.startsWith('fl_')) { status[key] = 'ready'; makeAnims(S, key); } });
      S.load.on('loaderror', f => { if (f && f.key && f.key.startsWith('fl_')) status[f.key] = 'missing'; });
      S.events.on('postupdate', () => { for (const r of rigs) tick(S, r); });
      S.events.on('shutdown', () => { for (const r of [...rigs]) destroy(r); });
    }
    addTiles(S);
    if (!TILE.ready) TILE.waiters.push(() => { if (S.sys && S.sys.isActive()) { addTiles(S); if (S.gChunks) { for (const k of Object.keys(S.gChunks)) S.releaseChunk(k); for (const key of [...GTEX.keys()]) { if (S.textures.exists(key)) S.textures.remove(key); GTEX.delete(key); } if (S.updateGround) try { S.updateGround(true); } catch (e) {} } } });
  }
  /* ---------- карта: тайлы земли и объекты ---------- */
  const TILE = { img: null, json: null, ready: false, waiters: [], tinted: {} };
  fetch(BASE + 'tiles.json').then(r => r.json()).then(j => { TILE.json = j; const im = new Image(); im.onload = () => { TILE.img = im; TILE.ready = true; const w = TILE.waiters.splice(0); w.forEach(f => { try { f(); } catch (e) { console.warn(e); } }); }; im.src = BASE + 'tiles.webp'; }).catch(() => {});
  function addTiles(S) { if (TILE.ready && !S.textures.exists('fl_t')) S.textures.addAtlas('fl_t', TILE.img, TILE.json); }
  const rng = n => { const a = []; for (let i = n[0]; i <= n[1]; i++) a.push(i); return a; };
  const DFLOOR = [16, 17, 18, 19, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
  const GROUND = {
    t: { p: 'g', grass: rng([16, 31]), path: rng([32, 43]) },
    b: { p: 'g', grass: rng([16, 31]), path: rng([32, 43]), tint: 0xdce8a0 },
    w: { p: 'g', grass: rng([16, 31]), path: rng([32, 43]), tint: 0xa8dcd4 },
    m: { p: 'g', grass: rng([16, 31]), path: rng([44, 47]), tint: 0x9aa88a },
    s: { p: 's', grass: rng([16, 31]), path: rng([32, 43]), flower: rng([568, 583]) },
    d: { p: 's', grass: rng([16, 31]), path: rng([32, 43]), flower: rng([568, 575]), tint: 0xe8c890 },
    a: { p: 'c', grass: rng([16, 31]), path: rng([48, 51]), flower: rng([52, 55]) },
    k: { p: 'd', grass: DFLOOR, path: [32, 33, 34, 35] },
    v: { p: 'd', grass: DFLOOR, path: [56, 57, 58, 59], tint: 0xc0a8e8 }
  };
  const groundOk = () => TILE.ready;
  function tintedSrc(tint) {
    if (!tint) return TILE.img;
    if (TILE.tinted[tint]) return TILE.tinted[tint];
    const c = document.createElement('canvas'); c.width = TILE.img.width; c.height = TILE.img.height; const x = c.getContext('2d');
    x.drawImage(TILE.img, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = '#' + tint.toString(16).padStart(6, '0'); x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(TILE.img, 0, 0);
    return (TILE.tinted[tint] = c);
  }
  function paintGround(x, code, P, ti0, ti1, tj0, tj1, m, inView, tileRng, z) {
    const G = GROUND[code] || GROUND.t, src = tintedSrc(G.tint), F = TILE.json.frames;
    for (let j = tj0; j <= tj1; j++) for (let i = ti0; i <= ti1; i++) {
      const c = P(i + .5, j + .5); if (!inView(c[0], c[1], 60)) continue;
      const t = m[j][i], R = tileRng(z, i, j, 5);
      const list = t === 3 ? G.path : (t === 2 && G.flower && R() < .5) ? G.flower : G.grass;
      const f = F[G.p + list[Math.floor(R() * list.length)]]; if (!f) continue;
      const fr = f.frame;
      x.drawImage(src, fr.x, fr.y, fr.w, fr.h, c[0] - HW - .6, c[1] - HH - .3, HW * 2 + 1.2, HH * 2 + .6);
    }
  }
  // объект карты v55 → кадр атласа Flare
  const pickBy = (list, x, y) => list[Math.abs(Math.floor(x * 7.13 + y * 3.71)) % list.length];
  const DECO = {
    pine: ['g', [248, 249, 250, 251], .95], snowpine: ['g', [248, 249, 250, 251], .95, 0xe4ecff], wist: ['g', [252, 253, 254, 255], .95, 0xe0c8ff], maple: ['g', [252, 253, 254, 255], .95, 0xffb070],
    sakura: ['g', [240, 241, 242, 243], .95, 0xffc8dc], dead: ['g', [244, 245, 246, 247], .95], bamboo: ['g', [248, 249, 250, 251], .9, 0xd0f0a0], bush: ['g', [112, 113, 116, 117], .8],
    rock: ['g', [128, 129, 130, 131], .8], snowrock: ['s', [552, 553, 554, 555, 556, 557], .8], stump: ['g', [136, 137], .8], crystal: ['s', [132, 133, 134, 135], .8, 0xbfe8ff],
    shrine: ['d', [128, 129, 130, 131], .85], torii: ['d', [110, 111], 1], lantern: ['d', [151], .9], stall: ['g', [98], .9], anvil: ['g', [103], .9],
    chest: ['g', [76], .8], gchest: ['g', [297], .95], board: ['d', [148], .9], bed: ['d', [202], 1], table: ['d', [136], .9], books: ['d', [100], 1], throne: ['d', [132], 1], barrel: ['d', [146], .85], crate: ['d', [147], .85], statue: ['d', [128], .85],
    house0: ['g', [72], 1], house1: ['g', [75], 1], house2: ['g', [72], 1], well2: ['g', [102], .9], portal3: ['d', [265], .8, 0, true]
  };
  function deco(S, key, code, x, y) {
    if (!TILE.ready || !S.textures.exists('fl_t')) return null;
    let d = DECO[key]; if (!d) return null;
    let set = d[0], ids = d[1];
    if (code === 's' && key === 'dead') { set = 's'; ids = [244, 245, 246, 247]; }
    if (code === 's' && key === 'stump') { set = 's'; ids = [535]; }
    if (code === 's' && (key === 'house0' || key === 'house1' || key === 'house2')) { set = 's'; ids = [72, 75]; }
    const f = set + pickBy(ids, x, y);
    if (!TILE.json.frames[f]) return null;
    return { f, o: TILE.json.meta.origins[f], s: (1 / 3) / TILE.json.meta.scale * 1.35 * d[2], tint: d[3] || 0, flat: !!d[4] };
  }
  function decoImage(S, key, code, x, y) { // готовая картинка объекта или null
    const fd = deco(S, key, code, x, y); if (!fd) return null;
    const img = S.add.image(x, y, 'fl_t', fd.f).setOrigin(fd.o[0], fd.o[1]).setScale(fd.flat ? (1 / 3) / TILE.json.meta.scale * 1.1 : fd.s).setDepth(fd.flat ? -95000 : y);
    if (fd.tint) img.setTint(fd.tint);
    img.setScale = function () { return this; }; // старый код подгонял масштаб своих текстур — Flare уже в нужном
    img.flare = true;
    return img;
  }
  function tileImage(S, f, x, y, sc) { // кусок тайлсета Flare (стена, колонна) в натуральную величину * sc
    if (!TILE.ready || !S.textures.exists('fl_t') || !TILE.json.frames[f]) return null;
    const o = TILE.json.meta.origins[f]; return S.add.image(x, y, 'fl_t', f).setOrigin(o[0], o[1]).setScale((sc || 1) / TILE.json.meta.scale).setDepth(y);
  }
  const has = (sex, item) => !MAN || (MAN.hero[sex] || []).includes(item);
  function need(S, key, path) {
    if (S.textures.exists(key)) { if (status[key] !== 'ready') { status[key] = 'ready'; makeAnims(S, key); } return true; }
    if (status[key]) return false;
    status[key] = 'loading';
    S.load.atlas(key, BASE + path + '.webp', BASE + path + '.json');
    if (!S.load.isLoading()) S.load.start();
    return false;
  }
  function meta(S, key) { const t = S.textures.get(key); return (t && t.customData && t.customData.meta) || {}; }
  function makeAnims(S, key) {
    const M = meta(S, key).anims || {};
    for (const an in M) for (let d = 0; d < 8; d++) {
      const k = key + '|' + an + '|' + d; if (S.anims.exists(k)) continue;
      const fr = []; for (let i = 0; i < M[an].n; i++) if (S.textures.get(key).has(an + '_' + d + '_' + i)) fr.push({ key, frame: an + '_' + d + '_' + i });
      if (!fr.length) continue;
      const bf = M[an].type === 'back_forth', once = M[an].type === 'play_once';
      S.anims.create({ key: k, frames: fr, frameRate: fr.length / (Math.max(100, M[an].dur) / 1000) * (bf ? 2 : 1) * (an === 'stance' ? .7 : 1), repeat: once ? 0 : -1, yoyo: bf });
    }
  }

  /* ---------- что надето → какие слои ---------- */
  // костюмы: свой комплект Flare + окраска; [комплект, шлем, оттенок одежды, оттенок шлема, свечение]
  // наряды: [комплект, шлем, палитра одежды, палитра шлема, свечение]; палитра = [тень, основной, блик, сила] или по слотам { chest: [...], legs: [...] }
  const PAL = {
    gold: [0x2a1804, 0xb08a3a, 0xfff0c0, .72], white: [0x4a4642, 0xcfcac2, 0xffffff, .82], crimson: [0x1a0204, 0x86181a, 0xffb0a0, .78], abyss: [0x041014, 0x1e5860, 0xa0f0e8, .8],
    black: [0x0c0b10, 0x3a3846, 0xb8b4cc, .85], slate: [0x0c0e12, 0x444a58, 0xb8c0d0, .85], fox: [0x2a1004, 0xc87a34, 0xfff0d6, .85], rose: [0x3a0c1a, 0xd8729a, 0xffeaf2, .85],
    saffron: [0x341402, 0xd07a1c, 0xffe2a4, .85], navy: [0x060a24, 0x33489c, 0xd0dcff, .85], blood: [0x0c0102, 0x5e0a14, 0xf06070, .9], silver: [0x14161c, 0x8a92a4, 0xffffff, .85],
    shadowpurple: [0x060408, 0x2e2638, 0x9a8aaa, .9], red: [0x200302, 0xa02818, 0xffa080, .88], cream: [0x403830, 0xe6dccc, 0xffffff, .85],
    azure: [0x050a24, 0x2448b0, 0xb0ccff, .85], storm: [0x0a0618, 0x4a3496, 0xd0c0ff, .85], ice: [0x34465e, 0xc4dcf2, 0xffffff, .8], teal: [0x03181c, 0x1a7a84, 0xc8fff6, .85],
    brown: [0x140c06, 0x5e4630, 0xd8c0a0, .8], amethyst: [0x0c0614, 0x5a2e8a, 0xe0c8ff, .85], bronze: [0x1a0e04, 0x9a6428, 0xffe0a0, .78], obsidian: [0x030304, 0x26222e, 0xa49cbc, .86],
    forest: [0x04100a, 0x2e6a3a, 0xc8f0b0, .85], royal: [0x040a20, 0x22408e, 0xb8c8ff, .8], steel: [0x101318, 0x7c8698, 0xffffff, .7], ivory: [0x4a4034, 0xe8e0d0, 0xffffff, .82],
    violet: [0x0a0418, 0x3c1a7a, 0xc8a8ff, .88], sky: [0x0c2034, 0x5aa0d8, 0xe8f6ff, .82], ember: [0x1a0402, 0x8a2a0c, 0xffc070, .85]
  };
  const COSTUME = {
    sakura: ['mage1', null, 'rose'], monk: ['cloth', null, 'saffron'], raven: ['leather', 'leather_hood', 'black', 'black'], fox: ['leather', 'leather_hood', 'fox', 'fox'],
    miko: ['mage0', null, { chest: 'cream', hands: 'cream', legs: 'red', feet: 'red' }], festival: ['mage1', null, 'navy'], ninja: ['leather', 'leather_hood', 'slate', 'slate'],
    shogun: ['plate', 'plate_helm', { chest: 'crimson', legs: 'crimson', hands: 'gold', feet: 'crimson' }, 'crimson'], abyss: ['plate', 'plate_helm', 'abyss', 'abyss', 0x3ae0d0],
    paladin: ['plate', 'plate_helm', { chest: 'white', legs: 'gold', hands: 'gold', feet: 'gold' }, 'gold', 0xffe08a, [0xe8e2d4, 0xd8a838, 'sun']], bloodreaper: ['mage2', 'mage_hood_alt2', 'blood', 'shadowpurple', 0xff3b5e, [0x3a060c, 0x8a1020]],
    seraphknight: ['plate', 'plate_helm', { chest: 'ivory', legs: 'gold', hands: 'gold', feet: 'ivory' }, 'gold', 0x6ab8ff, [0x1a2a7a, 0xe8b84a, 'star']],
    crimsondragon: ['plate', 'plate_helm', { chest: 'crimson', legs: 'obsidian', hands: 'crimson', feet: 'obsidian' }, 'crimson', 0xff6a2a, [0x5a0810, 0xffc84a, 'dragon']],
    azuremage: ['mage2', 'mage_hood_alt1', { chest: 'azure', legs: 'azure', hands: 'gold', feet: 'gold' }, 'azure', 0, [0x14306e, 0xe0b04f, 'star']],
    stormlord: ['plate', 'plate_helm', 'storm', 'storm', 0xc0a0ff, [0x24164a, 0xb8a0ff, 'bolt']],
    snowqueen: ['mage1', null, { chest: 'ice', legs: 'ice', hands: 'sky', feet: 'sky' }, null, 0x9fe0ff, [0xdceeff, 0x8ac0f0, 'flake']],
    shadowassassin: ['leather', 'leather_hood', { chest: 'black', legs: 'black', hands: 'crimson', feet: 'black' }, 'black', 0, [0x16141c, 0xb01c2a]],
    goldemperor: ['plate', 'plate_helm', 'gold', 'gold', 0xffe08a, [0x8a1c24, 0xfff0b0, 'crown']],
    oceanpriest: ['mage0', null, { chest: 'teal', legs: 'teal', hands: 'ivory', feet: 'teal' }, null, 0, [0x0e5a66, 0x9ff0e8]],
    wanderer: ['leather', 'leather_hood', 'brown', 'brown', 0, [0x3a2e22, 0x8a1c24]],
    lotus: ['mage1', null, { chest: 'cream', legs: 'rose', hands: 'cream', feet: 'rose' }],
    spidersilk: ['mage2', 'mage_hood', 'amethyst', 'amethyst', 0xc080ff, [0x1a0f26, 0xd8c8ff]],
    bloodmoonrobe: ['mage2', 'mage_hood_alt2', 'blood', 'blood', 0xff3a5e, [0x3a0610, 0xffd36a, 'moon']],
    frostcitadel: ['plate', 'plate_helm', 'ice', 'ice', 0x9fe0ff, [0x5a8ac8, 0x9fe0ff, 'flake']],
    glad: ['chain', 'chain_coif', { chest: 'bronze', legs: 'brown', hands: 'bronze', feet: 'bronze' }, 'bronze', 0, [0x8a1c24, 0xffd36a]],
    // новые наряды
    royalknight: ['plate', 'plate_helm', { chest: 'steel', legs: 'steel', hands: 'gold', feet: 'steel' }, 'steel', 0, [0x1c3a8e, 0xf0c050, 'lion']],
    archmage: ['mage2', 'mage_hood_alt2', { chest: 'violet', legs: 'violet', hands: 'gold', feet: 'violet' }, 'violet', 0xb080ff, [0x2a1060, 0xe8c060, 'star']],
    elvenranger: ['leather', 'leather_hood', { chest: 'forest', legs: 'brown', hands: 'forest', feet: 'brown' }, 'forest', 0, [0x24502c, 0xd8c070, 'leaf']],
    nightblade: ['leather', 'leather_hood', 'obsidian', 'obsidian', 0xff3040, [0x0e0c12, 0xc01828, 'moon']],
    dragonlord: ['plate', 'plate_helm', { chest: 'obsidian', legs: 'obsidian', hands: 'ember', feet: 'obsidian' }, 'ember', 0xff7020, [0x6a0a08, 0xffb040, 'dragon']],
    highpriestess: ['mage1', null, { chest: 'ivory', legs: 'ivory', hands: 'gold', feet: 'gold' }, null, 0xfff0b0, [0xf4eee2, 0xd8a838, 'sun']]
  };
  const HEADC = { hunter: ['chain_coif', 'silver'], reaper: ['mage_hood_alt2', 'shadowpurple'], crown: ['plate_helm', 'gold'], oni: ['leather_hood', 'red'] };
  const RC = {}; // перекрашенные атласы: ключ → true
  function recolorKey(S, base, pid) { // атлас слоя, перекрашенный палитрой pid с сохранением светотени и бликов
    const key = base + '~' + pid; if (RC[key] || S.textures.exists(key)) return key;
    const P = PAL[pid], T = S.textures.get(base), src = T.getSourceImage();
    const cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height; const x = cv.getContext('2d'); x.drawImage(src, 0, 0);
    const id = x.getImageData(0, 0, cv.width, cv.height), d = id.data, st = P[3];
    const skin = /cloth|mage|default/.test(base);
    const isSkin = (r, g, bl) => skin && r > g && g > bl && r - bl > 45 && r - bl < 150 && r > 110 && g > 70 && (r - g) < 75;
    // выравниваем яркость материала: тёмная ткань не уходит в сплошную тень, светлая не выгорает
    const hist = new Uint32Array(256); let tot = 0;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128 || isSkin(d[i], d[i + 1], d[i + 2])) continue; hist[(d[i] * 77 + d[i + 1] * 151 + d[i + 2] * 28) >> 8]++; tot++; }
    let lo = 0, hi = 255, acc = 0; for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc < tot * .04) lo = i; if (acc < tot * .985) hi = i; }
    if (hi - lo < 40) { lo = Math.max(0, lo - 20); hi = Math.min(255, hi + 20); }
    const c3 = [P[0], P[1], P[2]].map(c => [c >> 16 & 255, c >> 8 & 255, c & 255]);
    // карта яркость → цвет (тень → основной → блик), с лёгким усилением контраста
    const lut = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) { let L = Math.min(1, Math.max(0, (i - lo) / (hi - lo))); const a = L < .55 ? c3[0] : c3[1], b = L < .55 ? c3[1] : c3[2], t = L < .55 ? L / .55 : (L - .55) / .45, e = t * t * (3 - 2 * t);
      for (let k = 0; k < 3; k++) lut[i * 3 + k] = a[k] + (b[k] - a[k]) * e; }
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 8) continue;
      const r = d[i], g = d[i + 1], bl = d[i + 2], L = (r * 77 + g * 151 + bl * 28) >> 8;
      // кожа (руки, шея) остаётся как была
      if (isSkin(r, g, bl)) continue;
      const mx = Math.max(r, g, bl), sat = mx ? (mx - Math.min(r, g, bl)) / mx : 0, k = st * (sat > .55 ? .9 : 1);
      d[i] = r + (lut[L * 3] - r) * k; d[i + 1] = g + (lut[L * 3 + 1] - g) * k; d[i + 2] = bl + (lut[L * 3 + 2] - bl) * k;
    }
    x.putImageData(id, 0, 0);
    const frames = {};
    for (const n of T.getFrameNames()) { const f = T.get(n), dd = f.data || {}; frames[n] = { frame: { x: f.cutX, y: f.cutY, w: f.cutWidth, h: f.cutHeight }, rotated: false, trimmed: !!f.trimmed || !!dd.trim,
      spriteSourceSize: dd.spriteSourceSize || { x: 0, y: 0, w: f.cutWidth, h: f.cutHeight }, sourceSize: dd.sourceSize || { w: f.realWidth, h: f.realHeight } }; }
    S.textures.addAtlasJSONHash(key, cv, { frames, meta: {} });
    const nt = S.textures.get(key); nt.customData = Object.assign({}, T.customData);
    makeAnims(S, key); RC[key] = true; return key;
  }
  function heroSpec(o) { // o: { cls, r, costume, head, weapon, fem, outfit }
    const cls = TIER[o.cls] ? o.cls : 'warrior', sex = o.fem ? 'f' : 'm';
    const t = Math.max(0, Math.min(4, o.r || 0)), C = o.costume && COSTUME[o.costume], H = o.head && HEADC[o.head];
    const rc = {};
    const L = Object.assign({}, SETS[C ? C[0] : TIER[cls][t]]);
    L.head = sex === 'f' ? 'head_long' : o.bald ? 'head_bald' : 'head_short';
    let helm = C ? C[1] : HELM[cls][t]; if (H) helm = H[0];
    if (helm) L.helm = helm;
    L.main = o.noWeapon ? null : (WEAP[o.weapon] || o.weapon || DEF_WEAP[cls]); if (!L.main) delete L.main;
    if (o.noHelm) delete L.helm;
    if (cls === 'rogue' && t >= 2) L.off = 'buckler';
    for (const k in L) if (!has(sex, L[k])) delete L[k];
    const tint = {};
    if (C) { for (const k of ['chest', 'legs', 'hands', 'feet']) rc[k] = typeof C[2] === 'string' ? C[2] : C[2][k]; if (C[3]) rc.helm = C[3]; }
    else if (o.outfit && !o.r) { tint.chest = mixWhite(o.outfit, .45); tint.legs = mixWhite(o.outfit, .6); }
    if (H) rc.helm = H[1];
    for (const k in tint) if (!L[k]) delete tint[k];
    for (const k in rc) if (!L[k] || !PAL[rc[k]]) delete rc[k];
    return { sex, layers: L, tint, rc, cape: C && C[5] || null, glow: C && C[4] || 0, act: ACT[cls] || 'swing', sig: sex + JSON.stringify(L) + JSON.stringify(tint) + JSON.stringify(rc) };
  }
  const mixWhite = (c, k) => { const r = c >> 16 & 255, g = c >> 8 & 255, b = c & 255; return (Math.round(r + (255 - r) * k) << 16) | (Math.round(g + (255 - g) * k) << 8) | Math.round(b + (255 - b) * k); };

  /* ---------- риг: набор спрайтов поверх «невидимого» старого спрайта ---------- */
  function attachHero(S, unit, spec) {
    let r = unit.flr;
    if (r && r.sig === spec.sig) return r;
    if (r) destroy(r);
    r = { unit, kind: 'hero', spec, sig: spec.sig, parts: {}, dir: 6, anim: '', ready: false, scale: 1 };
    for (const slot in spec.layers) { const key = 'fl_h' + spec.sex + '_' + spec.layers[slot]; r.parts[slot] = { key, path: 'hero/' + spec.sex + '/' + spec.layers[slot], spr: null }; }
    unit.flr = r; rigs.add(r); return r;
  }
  function attachMob(S, unit, kind, opt) {
    const m = opt ? [opt.key, opt.height, opt.tint] : MOB[kind]; if (!m) return null;
    if (unit.flr) destroy(unit.flr);
    const r = { unit, kind: 'mob', mobKey: kind, parts: { body: { key: 'fl_m_' + m[0], path: 'mob/' + m[0], spr: null } }, dir: Math.floor(Math.random() * 8), anim: '', ready: false, height: m[1], defTint: m[2] };
    unit.flr = r; rigs.add(r); return r;
  }
  function destroy(r) { for (const s in r.parts) if (r.parts[s].spr) r.parts[s].spr.destroy(); for (const o of [r.mnt && r.mnt.spr, r.cape, ...(r.wings || [])]) if (o) o.destroy(); rigs.delete(r); if (r.unit && r.unit.flr === r) r.unit.flr = null; restore(r); }
  const NOREN = () => false;
  function hideOld(u) { for (const o of [u.spr, u.wspr, u.wglow, u.mountB, u.mountF, u.wingR, u.wingL, u.wingGR, u.wingGL]) if (o && o.willRender !== NOREN) { o._flWR = o.willRender; o.willRender = NOREN; } }
  function restore(r) { const u = r.unit; if (!u) return; for (const o of [u.spr, u.wspr, u.wglow, u.mountB, u.mountF, u.wingR, u.wingL, u.wingGR, u.wingGL]) if (o && o._flWR) { o.willRender = o._flWR; delete o._flWR; } }

  function tick(S, r) {
    const u = r.unit, spr = u.spr;
    if (!spr || !spr.scene || u.gone) { destroy(r); return; }
    if (!r.ready) {
      let all = true; for (const s in r.parts) if (!need(S, r.parts[s].key, r.parts[s].path)) { if (status[r.parts[s].key] === 'missing') { delete r.parts[s]; continue; } all = false; }
      if (!all || !Object.keys(r.parts).length) return;
      if (r.spec && r.spec.rc) for (const s in r.parts) if (r.spec.rc[s]) { try { r.parts[s].key = recolorKey(S, r.parts[s].key, r.spec.rc[s]); } catch (e) { console.warn('recolor', e); } }
      for (const s in r.parts) { const p = r.parts[s], o = meta(S, p.key).origin || [.5, .8]; p.spr = S.add.sprite(0, 0, p.key, Object.keys(S.textures.get(p.key).frames).find(f => f !== '__BASE')).setOrigin(o[0], o[1]); }
      if (r.kind === 'mob') { const p = r.parts.body, f = S.textures.getFrame(p.key, 'stance_6_0') || p.spr.frame, h = (f.data && f.data.spriteSourceSize ? f.data.spriteSourceSize.h : f.height) || 60; r.scale = Phaser.Math.Clamp(r.height / h, .15, 3); }
      r.ready = true; r.lx = u.x; r.ly = u.y; hideOld(u);
    }
    // направление: по движению в клетках карты, иначе — к цели
    const dx = u.x - r.lx, dy = u.y - r.ly; r.lx = u.x; r.ly = u.y;
    const mounted = r.kind === 'hero' && (u.hasMount && u.alive !== false || u.mt);
    let moving = Math.hypot(dx, dy) > .004;
    if (moving) setDir(r, dx - dy, dx + dy);
    else { const tg = r.kind === 'hero' ? (u.target && u.target.alive ? u.target : null) : (u.angry && S.hero && S.hero.alive && Phaser.Math.Distance.Between(u.x, u.y, S.hero.x, S.hero.y) < 3 ? S.hero : null); if (tg) { const fx = tg.x - u.x, fy = tg.y - u.y; if (Math.hypot(fx, fy) > .05) setDir(r, fx - fy, fx + fy, true); } }
    // что играть
    const dead = u.alive === false || (u.hp !== undefined && u.hp <= 0 && r.kind === 'mob');
    let an = 'stance', restart = false;
    if (dead) an = 'die';
    else {
      const act = actionOf(S, r, u);
      if (act) { an = act.an; if (act.tok !== r.tok) { r.tok = act.tok; restart = true; } }
      else if (moving || u.moving && r.kind !== 'mob') an = 'run';
      if (!act && r.kind === 'mob' && u.hp < (r.lhp || 1e9) && r.anim !== 'swing') { r.hitUntil = S.time.now + 220; }
      if (!act && r.hitUntil > S.time.now) an = 'hit';
    }
    r.lhp = u.hp;
    if (mounted) an = 'stance';
    const key = an + '|' + r.dir;
    // позиция, глубина, прозрачность, оттенок — копируем со старого спрайта
    const order = r.kind === 'mob' ? ['body'] : ORDER[r.dir];
    const tinted = spr.isTinted, fill = spr.tintFill, tc = spr.tintTopLeft;
    let i = 0;
    for (const slot of order) {
      const p = r.parts[slot]; if (!p || !p.spr) continue;
      const s = p.spr, k = p.key + '|' + key;
      if (r.anim !== key || restart || !s.anims.isPlaying && an !== 'die') { if (S.anims.exists(k)) s.play(k, !restart && r.anim === key); }
      const sc = r.scale || 1, sit = mounted && r.lift !== undefined && (slot === 'feet' || slot === 'legs');
      // в седле ноги «согнуты»: укорочены от бёдер вниз и чуть разведены
      s.setPosition(spr.x, spr.y + (u.flBob || 0) - (r.lift || 0) - (sit ? HIP * sc * (1 - SITQ) : 0)).setDepth(spr.depth + .01 + i * .001).setAlpha(spr.alpha).setVisible(spr.visible);
      s.setScale(sc * (sit ? 1.12 : 1), sc * (sit ? SITQ : 1));
      if (tinted || (r.spec && r.spec.tint[slot]) || r.defTint) {
        const base = r.spec && r.spec.tint[slot] || r.defTint;
        if (fill) s.setTintFill(tc); else if (tinted) s.setTint(tc); else s.setTint(base);
      } else if (s.isTinted) s.clearTint();
      i++;
    }
    r.anim = key;
    if (r.kind === 'hero') { hideOld(u); mountTick(S, r, u, mounted, moving); wingTick(S, r, u); capeTick(S, r, u); glowTick(S, r, u); }
  }
  // свечение заточки: оружие (u.wTier) и доспех (u.aTier), а также «светящиеся» костюмы
  function glowTick(S, r, u) {
    const now = S.now || 0, tc = typeof tierColor === 'function' ? tierColor : null;
    const want = { main: u.wTier && tc ? tc(u.wTier, now) : 0, chest: u.aTier && tc ? tc(u.aTier, now, .5) : r.spec.glow || 0 };
    r.fx = r.fx || {};
    for (const slot in want) {
      const p = r.parts[slot], s = p && p.spr; if (!s || !s.preFX) continue;
      if (want[slot]) { if (!r.fx[slot]) r.fx[slot] = s.preFX.addGlow(0xffffff, 3, 0, false, .1, 10); r.fx[slot].color = want[slot]; r.fx[slot].outerStrength = (slot === 'main' ? 2.6 : 1.6) + Math.sin(now * 4) * (slot === 'main' ? 1 : .6); }
      else if (r.fx[slot]) { s.preFX.remove(r.fx[slot]); r.fx[slot] = null; }
    }
  }
  // маунт: существо Flare под героем — герой сидит у него на спине
  const MOUNT = { wolf: ['ice_ant'], tiger: ['fire_ant', 0xffe8b0], qilin: ['fire_ant'], boar: ['antlion', 0xe8d8c0], deer: ['ice_ant', 0xece4ff], panther: ['antlion_armored', 0xb8a8d8],
    lion: ['fire_ant', 0xfff0a0], cerberus: ['fire_ant', 0xff9a88], nightmare: ['antlion_armored'], drake: ['wyvern_water'], warboar: ['antlion_armored', 0xf0d8b8], bat: ['wyvern_air', 0xd890a0],
    crane: ['wyvern_air', 0xf0f4ff], phoenix: ['wyvern_fire'], skydragon: ['wyvern_water', 0xd8e8ff], whitetiger: ['ice_ant', 0xffffff], shadowlion: ['antlion_armored', 0x9888c8], flysword: ['wyvern_air', 0xc8e0ff] };
  // [высота на экране, доля высоты, где спина/седло, подъём над землёй в полёте]
  const MGEO = { antlion: [92, .5, 0], antlion_small: [80, .52, 0], antlion_armored: [104, .5, 0], fire_ant: [94, .5, 0], ice_ant: [94, .5, 0], wyvern_air: [134, .5, 8], wyvern_fire: [134, .5, 8], wyvern_water: [134, .5, 8] };
  const HIP = 48, SITQ = .58; // высота бёдер героя над стопами (px атласа); насколько «сгибаются» ноги в седле
  function mountKey(id) { const m = MOUNT[id]; if (m) return m; const M = typeof MOUNTS !== 'undefined' && MOUNTS[id]; return M && M.fly ? ['wyvern_air'] : ['antlion']; }
  function mountGeo(S, key) {
    const g = MGEO[key.replace('fl_m_', '')] || MGEO.antlion, f = S.textures.getFrame(key, 'stance_6_0'), h = (f && f.data && f.data.spriteSourceSize ? f.data.spriteSourceSize.h : 60) || 60;
    const sc = g[0] / h; return { sc, seat: g[0] * g[1] + g[2], fly: g[2] };
  }
  function mountId(S, u, mounted) { return !mounted ? null : u === S.hero ? (save.eq.mount && save.eq.mount.base) : u.mt; }
  function mountTick(S, r, u, mounted, moving) {
    const id = mountId(S, u, mounted);
    if (!id) { if (r.mnt && r.mnt.spr) r.mnt.spr.setVisible(false); r.lift = undefined; return; }
    const mk = mountKey(id), key = 'fl_m_' + mk[0];
    if (!r.mnt || r.mnt.id !== id) { if (r.mnt && r.mnt.spr) r.mnt.spr.destroy(); r.mnt = { id, key, spr: null }; }
    if (!r.mnt.spr) {
      r.lift = undefined;
      if (!need(S, key, 'mob/' + mk[0])) return;
      const o = meta(S, key).origin || [.5, .8]; r.mnt.g = mountGeo(S, key);
      r.mnt.spr = S.add.sprite(0, 0, key, 'stance_6_0').setOrigin(o[0], o[1]).setScale(r.mnt.g.sc); if (mk[1]) r.mnt.spr.setTint(mk[1]);
    }
    const g = r.mnt.g, now = S.now || 0, hover = g.fly ? Math.sin(now * 2.2) * 3 : 0;
    r.lift = Math.max(0, g.seat - HIP * (r.scale || 1)) + hover;
    const ms = r.mnt.spr, an = (moving || g.fly ? 'run' : 'stance') + '|' + r.dir, k = key + '|' + an;
    if (r.mnt.an !== an && S.anims.exists(k)) { ms.play(k); r.mnt.an = an; }
    const tinted = u.spr.isTinted && u.spr.tintFill;
    ms.setVisible(u.spr.visible).setAlpha(u.spr.alpha).setPosition(u.spr.x, u.spr.y + (u.flBob || 0) + hover).setDepth(u.spr.depth - .02);
    if (tinted) ms.setTintFill(u.spr.tintTopLeft); else if (mk[1]) ms.setTint(mk[1]); else ms.clearTint();
  }

  /* ---------- крылья: нарисованы в духе Flare (перья, перепонка, кристалл) ---------- */
  const WCV = {}; // id → canvas правого крыла; корень крыла в (WR[0], WR[1])
  const WSZ = 300, WR = [24, 206];
  const rgb = (c, a) => 'rgba(' + (c >> 16 & 255) + ',' + (c >> 8 & 255) + ',' + (c & 255) + ',' + (a === undefined ? 1 : a) + ')';
  const shade = (c, k) => { const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return (f(c >> 16 & 255) << 16) | (f(c >> 8 & 255) << 8) | f(c & 255); };
  // реалистичные крылья: рисуем в 2× разрешении (WQ), в мире — уменьшенная копия WSZ×WSZ
  const WQ = 2, WHI = {};
  function wrng(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
  const mixc = (a, b, t) => { const f = (s) => Math.round((a >> s & 255) + ((b >> s & 255) - (a >> s & 255)) * t); return (f(16) << 16) | (f(8) << 8) | f(0); };
  function wingHi(id) {
    if (WHI[id]) return WHI[id];
    const W = (typeof WINGS !== 'undefined' && WINGS[id]) || { pal: [0xd8d8e8, 0xf0f0ff, 0xffffff, 0x8a8aa0] };
    const P = W.pal, R = wrng([...String(id)].reduce((h, c) => h * 31 + c.charCodeAt(0), 7));
    const cv = document.createElement('canvas'); cv.width = cv.height = WSZ * WQ; const x = cv.getContext('2d');
    const feath = W.style !== 'membrane' && W.style !== 'crystal' && W.style !== 'butterfly';
    x.scale(WQ, WQ); x.translate(WR[0], WR[1]); { const ks = feath ? .8 : W.style === 'butterfly' ? .6 : .86; x.scale(ks, ks); } x.lineJoin = 'round'; x.lineCap = 'round';
    const arm = feath ? [[0, 0], [52, -84], [112, -134], [196, -176]] : [[0, 0], [70, -96], [150, -150], [262, -206]];
    const bez = t => { const [a, b, c, d] = arm, m = 1 - t; return [m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0], m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1]]; };
    const dark = shade(P[3], -.55), shadowOn = (a, bl, oy) => { x.shadowColor = 'rgba(0,0,0,' + a + ')'; x.shadowBlur = bl; x.shadowOffsetX = 1.5; x.shadowOffsetY = oy; }, shadowOff = () => { x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetX = 0; x.shadowOffsetY = 0; };
    if (W.style === 'membrane') {
      // перепонка летучей мыши / дракона: кости-пальцы, полупрозрачная кожа с прожилками, фестончатый край
      const wrist = bez(.55), fingers = [[262, -206], [262, -96], [228, -8], [160, 34], [84, 36]];
      const edge = () => { x.beginPath(); x.moveTo(0, 0); for (let t = 0; t <= .55; t += .05) { const q = bez(t); x.lineTo(q[0], q[1]); } x.lineTo(fingers[0][0], fingers[0][1]);
        for (let i = 1; i < fingers.length; i++) { const a = fingers[i - 1], b = fingers[i], mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * .22 - 10, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * .22 - 18; x.quadraticCurveTo(mx, my, b[0], b[1]); }
        x.quadraticCurveTo(40, 14, 0, 0); x.closePath(); };
      edge(); shadowOn(.45, 10, 4);
      const g = x.createRadialGradient(wrist[0], wrist[1], 10, wrist[0], wrist[1], 230); g.addColorStop(0, rgb(P[1], .97)); g.addColorStop(.55, rgb(P[0], .9)); g.addColorStop(1, rgb(shade(P[0], -.35), .82));
      x.fillStyle = g; x.fill(); shadowOff();
      x.save(); edge(); x.clip();
      // прожилки и складки кожи
      for (let i = 0; i < fingers.length; i++) { const f = fingers[i], n = i ? fingers[i - 1] : [0, 0];
        for (let k = 0; k < 7; k++) { const t = .2 + k * .11, sx = wrist[0] + (f[0] - wrist[0]) * t, sy = wrist[1] + (f[1] - wrist[1]) * t, ex = sx + (n[0] - f[0]) * (.18 + R() * .12) + (R() - .5) * 10, ey = sy + (n[1] - f[1]) * (.18 + R() * .12) + 14;
          x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo((sx + ex) / 2 + (R() - .5) * 14, (sy + ey) / 2 + 6, ex, ey); x.lineWidth = .9; x.strokeStyle = rgb(shade(P[3], -.3), .35); x.stroke(); } }
      for (let k = 0; k < 26; k++) { const a = fingers[1 + Math.floor(R() * 3)], t = .3 + R() * .6, sx = wrist[0] + (a[0] - wrist[0]) * t, sy = wrist[1] + (a[1] - wrist[1]) * t;
        x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + (R() - .3) * 40, sy + 10 + R() * 30); x.lineWidth = 2.5; x.strokeStyle = 'rgba(255,255,255,.05)'; x.stroke(); }
      const lg = x.createLinearGradient(0, -220, 120, 60); lg.addColorStop(0, 'rgba(255,255,255,.18)'); lg.addColorStop(.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,0,.25)'); x.fillStyle = lg; x.fillRect(-20, -240, 320, 320);
      x.restore();
      edge(); x.lineWidth = 2.2; x.strokeStyle = rgb(dark, .9); x.stroke();
      // кости
      const bone = (a, b, w) => { x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); shadowOn(.4, 4, 2); x.lineWidth = w; x.strokeStyle = rgb(shade(P[3], -.35)); x.stroke(); shadowOff(); x.lineWidth = w * .35; x.strokeStyle = rgb(mixc(P[1], 0xffffff, .3), .55); x.beginPath(); x.moveTo(a[0] - w * .15, a[1] - w * .2); x.lineTo(b[0] - w * .15, b[1] - w * .2); x.stroke(); };
      for (const f of fingers) bone(wrist, f, 5.5);
      x.beginPath(); x.moveTo(0, 0); for (let t = 0; t <= .55; t += .05) { const q = bez(t); x.lineTo(q[0], q[1]); } shadowOn(.4, 5, 2); x.lineWidth = 12; x.strokeStyle = rgb(shade(P[3], -.3)); x.stroke(); shadowOff(); x.lineWidth = 3.5; x.strokeStyle = rgb(mixc(P[1], 0xffffff, .35), .5); x.stroke();
      for (const j of [wrist, bez(.25)]) { const g2 = x.createRadialGradient(j[0] - 2, j[1] - 2, 1, j[0], j[1], 9); g2.addColorStop(0, rgb(mixc(P[1], 0xffffff, .4))); g2.addColorStop(1, rgb(shade(P[3], -.4))); x.fillStyle = g2; x.beginPath(); x.arc(j[0], j[1], 8, 0, 6.29); x.fill(); }
      x.beginPath(); x.moveTo(wrist[0] - 3, wrist[1] - 4); x.quadraticCurveTo(wrist[0] + 4, wrist[1] - 30, wrist[0] + 16, wrist[1] - 26); x.quadraticCurveTo(wrist[0] + 8, wrist[1] - 14, wrist[0] + 8, wrist[1]); x.closePath();
      x.fillStyle = '#e8e2d0'; x.fill(); x.lineWidth = 1; x.strokeStyle = 'rgba(0,0,0,.6)'; x.stroke();
      if (P[2] && W.gem) { const g3 = x.createRadialGradient(wrist[0], wrist[1], 0, wrist[0], wrist[1], 30); g3.addColorStop(0, rgb(P[2], .6)); g3.addColorStop(1, rgb(P[2], 0)); x.globalCompositeOperation = 'lighter'; x.fillStyle = g3; x.fillRect(wrist[0] - 30, wrist[1] - 30, 60, 60); x.globalCompositeOperation = 'source-over'; }
    } else if (W.style === 'butterfly') {
      // крыло бабочки/феи: верхняя и нижняя доли, жилки, тёмная кайма с пятнами, перламутровый отлив
      const lobe = (pts) => { x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(...pts[0]); x.bezierCurveTo(...pts[1]); x.bezierCurveTo(...pts[2]); x.closePath(); };
      const up = [[30, -120, 150, -220, 240, -200], [292, -186, 262, -96, 222, -60], [160, -10, 60, 0, 0, 0]], lo = [[60, 20, 170, -10, 196, 40], [214, 86, 170, 140, 120, 150], [70, 156, 20, 90, 0, 0]];
      for (const [pts, big] of [[lo, 0], [up, 1]]) {
        lobe(pts); x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = 10; x.shadowOffsetY = 3; x.fillStyle = rgb(P[3], .95); x.fill(); x.shadowColor = 'transparent';
        x.save(); lobe(pts); x.clip();
        const g = x.createRadialGradient(10, 0, 10, 10, 0, big ? 270 : 190); g.addColorStop(0, rgb(P[0], .95)); g.addColorStop(.55, rgb(P[1], .92)); g.addColorStop(.85, rgb(mixc(P[1], P[3], .5), .95)); g.addColorStop(1, rgb(P[3], 1));
        x.fillStyle = g; x.fillRect(-20, -260, 340, 440);
        // перламутр
        const ir = x.createLinearGradient(0, -220, 260, 120); ir.addColorStop(0, 'rgba(255,255,255,0)'); ir.addColorStop(.45, rgb(P[2], .28)); ir.addColorStop(.55, 'rgba(255,255,255,.18)'); ir.addColorStop(.7, 'rgba(255,255,255,0)'); x.fillStyle = ir; x.fillRect(-20, -260, 340, 440);
        // жилки
        x.lineWidth = 1.6; x.strokeStyle = rgb(P[3], .85);
        for (let k = 0; k < (big ? 7 : 5); k++) { const a = big ? -1.35 + k * .2 : .05 + k * .26, L = big ? 250 : 175; x.beginPath(); x.moveTo(6, -2); x.quadraticCurveTo(Math.cos(a) * L * .5 + 10, Math.sin(a) * L * .5 + 6, Math.cos(a) * L, Math.sin(a) * L); x.stroke(); }
        // кайма и светлые пятна
        x.restore(); lobe(pts); x.lineWidth = 9; x.strokeStyle = rgb(P[3], .95); x.stroke();
        x.save(); lobe(pts); x.clip(); const pts2 = []; for (let k = 0; k < 40; k++) { pts2.push(k); }
        x.fillStyle = rgb(P[2], .95); const pt = pts[1]; for (let k = 0; k < (big ? 9 : 6); k++) { const t = k / (big ? 9 : 6), bx = big ? 240 + (222 - 240) * t + Math.sin(t * 3) * 30 : 196 + (120 - 196) * t, by = big ? -200 + 140 * t : 40 + 110 * t; x.beginPath(); x.arc(bx - (big ? 6 : 6), by + (big ? 4 : -2), 2.6, 0, 6.29); x.fill(); }
        if (W.eye) { const ex = big ? 150 : 110, ey = big ? -120 : 70; for (const [rr, c] of [[18, P[3]], [14, W.eye], [7, P[3]], [3, 0xffffff]]) { x.fillStyle = rgb(c); x.beginPath(); x.ellipse(ex, ey, rr, rr * .8, -.4, 0, 6.29); x.fill(); } }
        x.restore();
      }
      x.beginPath(); x.moveTo(0, 2); x.quadraticCurveTo(-4, -30, 10, -60); x.lineWidth = 1.5; x.strokeStyle = rgb(P[3]); x.stroke();
      x.globalCompositeOperation = 'lighter'; for (let k = 0; k < 30; k++) { const px = R() * 240, py = -200 + R() * 330, rr = .6 + R() * 1.6; const sg = x.createRadialGradient(px, py, 0, px, py, rr * 3); sg.addColorStop(0, rgb(P[2], .8)); sg.addColorStop(1, rgb(P[2], 0)); x.fillStyle = sg; x.fillRect(px - rr * 3, py - rr * 3, rr * 6, rr * 6); } x.globalCompositeOperation = 'source-over';
    } else if (W.style === 'crystal') {
      // ледяные осколки: грани с преломлением, светлые рёбра, искры
      const shards = [];
      for (let i = 0; i < 13; i++) { const t = .1 + i * .072, b = bez(Math.min(1, t)), len = 64 + i * 13 + R() * 14, ang = Math.PI * (.46 - i * .036) + (R() - .5) * .06; shards.push([b, ang, len, 11 + i * .9]); }
      for (let i = 0; i < 9; i++) { const b = bez(.08 + i * .1); shards.push([[b[0] - 6, b[1] + 6], Math.PI * (.42 - i * .03), 34 + R() * 10, 9]); }
      for (const [b, ang, len, w] of shards) {
        const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, tip = [b[0] + dx * len, b[1] + dy * len], m1 = [b[0] + dx * len * .55 + nx * w, b[1] + dy * len * .55 + ny * w], m2 = [b[0] + dx * len * .62 - nx * w * .7, b[1] + dy * len * .62 - ny * w * .7];
        shadowOn(.35, 8, 3); x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(m1[0], m1[1]); x.lineTo(tip[0], tip[1]); x.lineTo(m2[0], m2[1]); x.closePath(); x.fillStyle = rgb(P[0], .55); x.fill(); shadowOff();
        // две грани: светлая и тёмная
        x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(m1[0], m1[1]); x.lineTo(tip[0], tip[1]); x.closePath();
        let g = x.createLinearGradient(b[0], b[1], m1[0], m1[1]); g.addColorStop(0, rgb(P[1], .75)); g.addColorStop(1, rgb(0xffffff, .9)); x.fillStyle = g; x.fill();
        x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(tip[0], tip[1]); x.lineTo(m2[0], m2[1]); x.closePath();
        g = x.createLinearGradient(b[0], b[1], m2[0], m2[1]); g.addColorStop(0, rgb(P[3], .85)); g.addColorStop(1, rgb(P[0], .7)); x.fillStyle = g; x.fill();
        x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(tip[0], tip[1]); x.lineWidth = 1.2; x.strokeStyle = 'rgba(255,255,255,.95)'; x.stroke();
        x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(m1[0], m1[1]); x.lineTo(tip[0], tip[1]); x.lineTo(m2[0], m2[1]); x.closePath(); x.lineWidth = 1; x.strokeStyle = rgb(shade(P[3], -.3), .8); x.stroke();
        for (let k = 0; k < 3; k++) { const t = .3 + R() * .5; x.beginPath(); x.moveTo(b[0] + dx * len * t, b[1] + dy * len * t); x.lineTo(b[0] + dx * len * t + nx * w * .6, b[1] + dy * len * t + ny * w * .6); x.lineWidth = .6; x.strokeStyle = 'rgba(255,255,255,.5)'; x.stroke(); }
      }
      x.beginPath(); x.moveTo(0, 0); for (let t = 0; t <= 1; t += .04) { const q = bez(t); x.lineTo(q[0], q[1]); } shadowOn(.4, 5, 2); x.lineWidth = 9; x.strokeStyle = rgb(P[3]); x.stroke(); shadowOff(); x.lineWidth = 2.5; x.strokeStyle = 'rgba(255,255,255,.85)'; x.stroke();
      x.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 18; k++) { const q = bez(R()), px = q[0] + R() * 80, py = q[1] + R() * 110, r = 1 + R() * 2.5; const g = x.createRadialGradient(px, py, 0, px, py, r * 4); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(px - r * 4, py - r * 4, r * 8, r * 8); }
      x.globalCompositeOperation = 'source-over';
    } else {
      // перо: объёмная лопасть (свет сверху-слева), стержень, бородки, расщепы на краю, мягкая тень на нижний ряд
      const feather = (b, ang, len, w, c0, c1, opt) => {
        opt = opt || {};
        const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, curve = opt.curve || .08, tip = [b[0] + dx * len - nx * len * curve, b[1] + dy * len - ny * len * curve];
        const path = () => { x.beginPath(); x.moveTo(b[0] - nx * w * .18, b[1] - ny * w * .18);
          x.bezierCurveTo(b[0] + dx * len * .3 - nx * w * .62, b[1] + dy * len * .3 - ny * w * .62, b[0] + dx * len * .78 - nx * w * (opt.round ? .62 : .48) - nx * len * curve, b[1] + dy * len * .78 - ny * w * (opt.round ? .62 : .48) - ny * len * curve, tip[0], tip[1]);
          x.bezierCurveTo(b[0] + dx * len * .82 + nx * w * (opt.round ? .58 : .42) - nx * len * curve, b[1] + dy * len * .82 + ny * w * (opt.round ? .58 : .42) - ny * len * curve, b[0] + dx * len * .35 + nx * w * .55, b[1] + dy * len * .35 + ny * w * .55, b[0] + nx * w * .18, b[1] + ny * w * .18); x.closePath(); };
        path(); shadowOn(opt.sh == null ? .38 : opt.sh, 7, 3); x.fillStyle = rgb(c0); x.fill(); shadowOff();
        x.save(); path(); x.clip();
        let g = x.createLinearGradient(b[0], b[1], tip[0], tip[1]); g.addColorStop(0, rgb(c0)); g.addColorStop(.6, rgb(mixc(c0, c1, .7))); g.addColorStop(1, rgb(c1)); x.fillStyle = g; x.fillRect(-60, -320, 460, 460);
        // изгиб лопасти: внешняя половина светлее, внутренняя темнее
        const mx = b[0] + dx * len * .5, my = b[1] + dy * len * .5;
        g = x.createLinearGradient(mx - nx * w * .6, my - ny * w * .6, mx + nx * w * .6, my + ny * w * .6); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(.45, 'rgba(255,255,255,0)'); g.addColorStop(.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
        x.fillStyle = g; x.fillRect(-60, -320, 460, 460);
        // бородки
        const nb = Math.max(8, Math.round(len / 3.2));
        for (let k = 1; k < nb; k++) { const t = k / nb, sx = b[0] + dx * len * t - nx * len * curve * t * t, sy = b[1] + dy * len * t - ny * len * curve * t * t;
          for (const sd of [-1, 1]) { const l = w * .62 * (1 - t * .35); x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + sd * nx * l * .5 + dx * l * .25, sy + sd * ny * l * .5 + dy * l * .25, sx + sd * nx * l + dx * l * .55, sy + sd * ny * l + dy * l * .55);
            x.lineWidth = .55; x.strokeStyle = sd < 0 ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.14)'; x.stroke(); } }
        if (opt.bands) for (let k = 1; k <= 3; k++) { const t = .32 + k * .16, cx0 = b[0] + dx * len * t, cy0 = b[1] + dy * len * t; x.beginPath(); x.moveTo(cx0 - nx * w, cy0 - ny * w); x.quadraticCurveTo(cx0 + dx * 4, cy0 + dy * 4, cx0 + nx * w, cy0 + ny * w); x.lineWidth = 3.2; x.strokeStyle = rgb(opt.bands, .55); x.stroke(); }
        if (opt.tipGlow) { const tg = x.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], len * .45); tg.addColorStop(0, rgb(opt.tipGlow, .9)); tg.addColorStop(1, rgb(opt.tipGlow, 0)); x.globalCompositeOperation = 'lighter'; x.fillStyle = tg; x.fillRect(tip[0] - len, tip[1] - len, len * 2, len * 2); x.globalCompositeOperation = 'source-over'; }
        x.restore();
        // расщепы на краю пера
        if (!opt.round) for (let k = 0; k < 1; k++) { if (R() < .55) continue; const t = .45 + R() * .4, sd = R() < .5 ? -1 : 1, ex = b[0] + dx * len * t + sd * nx * w * .5, ey = b[1] + dy * len * t + sd * ny * w * .5;
          x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.moveTo(ex, ey); x.lineTo(ex - sd * nx * w * .28 + dx * 3, ey - sd * ny * w * .28 + dy * 3); x.lineTo(ex + dx * 5, ey + dy * 5); x.closePath(); x.fill(); x.restore(); }
        path(); x.lineWidth = .7; x.strokeStyle = rgb(dark, .32); x.stroke();
        // стержень: светлая линия с тёмной кромкой
        x.beginPath(); x.moveTo(b[0], b[1]); x.quadraticCurveTo(b[0] + dx * len * .5 - nx * len * curve * .25, b[1] + dy * len * .5 - ny * len * curve * .25, b[0] + dx * len * .92 - nx * len * curve * .85, b[1] + dy * len * .92 - ny * len * curve * .85);
        x.lineWidth = opt.round ? .9 : 1.7; x.strokeStyle = rgb(shade(c0, -.4), .55); x.stroke(); x.lineWidth = opt.round ? .5 : .9; x.strokeStyle = rgb(mixc(c1, 0xffffff, .55), .85); x.stroke();
      };
      const jit = (c, a) => mixc(c, R() < .5 ? 0xffffff : 0x000000, R() * a);
      const lerp = (a, b, t) => a + (b - a) * t, D = Math.PI / 180;
      // маховые: от кисти к концу, длиннейшие — 2–4-е от края
      for (let i = 11; i >= 0; i--) { const u = i / 11, b = bez(.5 + u * .5); feather(b, lerp(28, -24, u) * D + (R() - .5) * .03, 112 + 46 * Math.sin(Math.min(1, u * 1.25) * Math.PI * .5) - (u > .9 ? 10 : 0) + R() * 5, 21 + u * 3, jit(shade(P[0], -.32), .07), W.tip ? W.tip : jit(P[1], .05), { curve: .035 + u * .03, bands: W.bands, tipGlow: W.tipGlow }); }
      // второстепенные: веером вниз от предплечья
      for (let i = 10; i >= 0; i--) { const u = i / 10, b = bez(u * .52); feather([b[0], b[1] + 3], lerp(82, 32, u) * D + (R() - .5) * .03, lerp(104, 112, u) + R() * 5, 24, jit(shade(P[0], -.36), .07), W.tip ? mixc(P[1], W.tip, .7) : jit(mixc(P[0], P[1], .55), .05), { curve: .025, bands: W.bands, tipGlow: W.tipGlow }); }
      // большие кроющие, средние, малые — ряды «чешуи» вдоль кости
      for (let i = 0; i < 13; i++) { const u = i / 12, b = bez(.02 + u * .9); feather([b[0] - 2, b[1] + 7], lerp(74, 0, u) * D, 56 - u * 6, 21, jit(shade(P[3], -.05), .05), jit(P[0], .05), { round: true, sh: .3 }); }
      for (let i = 0; i < 15; i++) { const u = i / 14, b = bez(.01 + u * .92); feather([b[0] - 1, b[1] + 3], lerp(66, -6, u) * D, 33 - u * 4, 16, jit(P[0], .05), jit(mixc(P[0], P[1], .6), .05), { round: true, sh: .28 }); }
      for (let i = 0; i < 20; i++) { const u = i / 19, b = bez(u * .95); feather([b[0], b[1]], lerp(58, -10, u) * D, 18, 11, jit(mixc(P[0], P[1], .5), .04), jit(P[1], .04), { round: true, sh: .22 }); }
      // ведущая кромка (кость, покрытая мелким пером) и блик сверху
      x.beginPath(); x.moveTo(0, 0); for (let t = 0; t <= 1; t += .04) { const q = bez(t); x.lineTo(q[0], q[1]); } shadowOn(.35, 4, 2); x.lineWidth = 7; x.strokeStyle = rgb(mixc(P[0], P[1], .4)); x.stroke(); shadowOff();
      x.lineWidth = 2.2; x.strokeStyle = rgb(mixc(P[1], 0xffffff, .5), .8); x.beginPath(); x.moveTo(-1, -3); for (let t = 0; t <= 1; t += .04) { const q = bez(t); x.lineTo(q[0] - 1, q[1] - 3); } x.stroke();
      if (W.stars) { x.save(); x.globalCompositeOperation = 'source-atop'; for (let k = 0; k < 90; k++) { const px = R() * 330 - 20, py = -230 + R() * 330, rr = .5 + R() * (k % 9 ? 1.2 : 2.6); const sg = x.createRadialGradient(px, py, 0, px, py, rr * 3); sg.addColorStop(0, rgb(W.stars, 1)); sg.addColorStop(1, rgb(W.stars, 0)); x.fillStyle = sg; x.fillRect(px - rr * 3, py - rr * 3, rr * 6, rr * 6); if (k % 9 === 0) { x.fillStyle = rgb(W.stars, .9); x.fillRect(px - rr * 4, py - .4, rr * 8, .8); x.fillRect(px - .4, py - rr * 4, .8, rr * 8); } } x.restore(); }
      if (W.energy) { x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = .28; x.filter = 'blur(3px)'; x.drawImage(cv, -WR[0], -WR[1], WSZ, WSZ); x.restore(); }
    }
    // общий объём: свет сверху-слева, затемнение к корню
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop';
    const S2 = WSZ * WQ, g = x.createLinearGradient(S2 * .9, 0, 0, S2); g.addColorStop(0, 'rgba(255,250,235,.12)'); g.addColorStop(.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,10,.28)'); x.fillStyle = g; x.fillRect(0, 0, S2, S2);
    x.globalCompositeOperation = 'source-over';
    return (WHI[id] = cv);
  }
  function wingCanvas(id) { // уменьшенная копия для мира (сглаженная, без «лесенки»)
    if (WCV[id]) return WCV[id];
    const hi = wingHi(id), cv = document.createElement('canvas'); cv.width = cv.height = WSZ; const x = cv.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(hi, 0, 0, WSZ, WSZ);
    return (WCV[id] = cv);
  }
  /* ---------- плащ: ткань со складками, кайма, застёжки и вышитая эмблема ---------- */
  const CW = 130, CH = 230, CVS = {};
  function capeCanvas(cp) {
    const id = cp.join('|'); if (CVS[id]) return CVS[id];
    const [col, trim, emb] = cp, Q = 2, cv = document.createElement('canvas'); cv.width = CW * Q; cv.height = CH * Q; const x = cv.getContext('2d'); x.scale(Q, Q);
    const hem = u => 214 + Math.sin(u * Math.PI * 5) * 7; // волнистый подол
    const shape = () => { x.beginPath(); x.moveTo(42, 6); x.lineTo(88, 6); x.bezierCurveTo(104, 60, 118, 140, 124, hem(1)); for (let u = 1; u >= 0; u -= .05) x.lineTo(6 + u * 118, hem(u)); x.bezierCurveTo(12, 140, 26, 60, 42, 6); x.closePath(); };
    shape(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 8; x.shadowOffsetY = 3; x.fillStyle = rgb(col); x.fill(); x.shadowColor = 'transparent';
    x.save(); shape(); x.clip();
    // складки: чередование света и тени по ширине, расходятся веером вниз
    for (let i = 0; i < 260; i++) { const yy = i * .9; const w = 46 + (118 - 46) * Math.min(1, yy / 210), x0 = 65 - w / 2;
      const g = x.createLinearGradient(x0, 0, x0 + w, 0);
      for (let k = 0; k <= 12; k++) { const u = k / 12, v = Math.cos(u * Math.PI * 6 + yy * .004) * .5 + .5; g.addColorStop(u, v > .5 ? 'rgba(255,255,255,' + ((v - .5) * .22).toFixed(3) + ')' : 'rgba(0,0,0,' + ((.5 - v) * .5).toFixed(3) + ')'); }
      x.fillStyle = g; x.fillRect(x0 - 4, yy, w + 8, 1.2); }
    // свет сверху и затемнение к краям
    let g = x.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(.4, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    g = x.createLinearGradient(0, 0, CW, 0); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.25, 'rgba(0,0,0,0)'); g.addColorStop(.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.4)'); x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    // фактура ткани
    for (let i = 0; i < 1400; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.05)'; x.fillRect(Math.random() * CW, Math.random() * CH, 2, 1); }
    // эмблема
    if (emb) { x.save(); x.translate(65, 110); x.fillStyle = rgb(trim, .85); x.strokeStyle = rgb(shade(trim, -.5), .8); x.lineWidth = 1.2;
      const star = (n, r1, r2) => { x.beginPath(); for (let k = 0; k < n * 2; k++) { const a = k * Math.PI / n - Math.PI / 2, r = k % 2 ? r2 : r1; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); };
      x.beginPath(); x.moveTo(0, -30); x.lineTo(24, -16); x.lineTo(22, 12); x.quadraticCurveTo(14, 28, 0, 36); x.quadraticCurveTo(-14, 28, -22, 12); x.lineTo(-24, -16); x.closePath(); x.fillStyle = rgb(shade(col, -.25), .9); x.fill(); x.lineWidth = 2.2; x.strokeStyle = rgb(trim, .9); x.stroke();
      x.fillStyle = rgb(trim, .9);
      if (emb === 'star' || emb === 'sun') star(emb === 'sun' ? 12 : 5, 15, emb === 'sun' ? 9 : 6);
      else if (emb === 'flake') { for (let k = 0; k < 6; k++) { x.save(); x.rotate(k * Math.PI / 3); x.fillRect(-1.2, -16, 2.4, 16); x.fillRect(-5, -11, 10, 1.8); x.restore(); } }
      else if (emb === 'moon') { x.beginPath(); x.arc(0, 2, 13, 0, 6.29); x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(6, -2, 11, 0, 6.29); x.fill(); x.globalCompositeOperation = 'source-over'; }
      else if (emb === 'bolt') { x.beginPath(); x.moveTo(4, -18); x.lineTo(-8, 3); x.lineTo(0, 3); x.lineTo(-4, 20); x.lineTo(9, -3); x.lineTo(1, -3); x.closePath(); x.fill(); }
      else if (emb === 'leaf') { x.beginPath(); x.moveTo(0, -18); x.quadraticCurveTo(14, -2, 0, 18); x.quadraticCurveTo(-14, -2, 0, -18); x.fill(); x.strokeStyle = rgb(shade(col, -.3)); x.beginPath(); x.moveTo(0, -14); x.lineTo(0, 15); x.stroke(); }
      else if (emb === 'crown') { x.beginPath(); x.moveTo(-14, 10); x.lineTo(-14, -6); x.lineTo(-7, 2); x.lineTo(0, -12); x.lineTo(7, 2); x.lineTo(14, -6); x.lineTo(14, 10); x.closePath(); x.fill(); x.stroke(); }
      else if (emb === 'lion' || emb === 'dragon') { x.beginPath(); x.moveTo(-12, 14); x.quadraticCurveTo(-16, -4, -4, -12); x.quadraticCurveTo(2, -20, 10, -14); x.lineTo(6, -9); x.quadraticCurveTo(14, -4, 8, 4); x.quadraticCurveTo(14, 10, 12, 16); x.quadraticCurveTo(2, 8, -12, 14); x.closePath(); x.fill(); x.stroke(); if (emb === 'dragon') { x.beginPath(); x.moveTo(-4, -12); x.lineTo(-12, -22); x.lineTo(-2, -16); x.fill(); } }
      x.restore(); }
    x.restore();
    // кайма по краю и подолу
    shape(); x.lineWidth = 5; x.strokeStyle = rgb(shade(trim, -.35)); x.stroke(); x.lineWidth = 2.6; const tg = x.createLinearGradient(0, 0, CW, CH); tg.addColorStop(0, rgb(mixc(trim, 0xffffff, .4))); tg.addColorStop(.5, rgb(trim)); tg.addColorStop(1, rgb(shade(trim, -.25))); x.strokeStyle = tg; x.stroke();
    // застёжки на плечах
    for (const cx0 of [44, 86]) { const gg = x.createRadialGradient(cx0 - 1.5, 8.5, .5, cx0, 10, 6.5); gg.addColorStop(0, '#fff8d8'); gg.addColorStop(.5, rgb(trim)); gg.addColorStop(1, rgb(shade(trim, -.5))); x.fillStyle = gg; x.beginPath(); x.arc(cx0, 10, 6, 0, 6.29); x.fill(); x.lineWidth = 1; x.strokeStyle = 'rgba(0,0,0,.5)'; x.stroke(); }
    return (CVS[id] = cv);
  }
  const CSC = .3; // высота плаща в мире ≈ 230 * .3 ≈ 69 px
  function capePose(dir, t, moving) { const a = ANGLE[dir], wf = Math.max(.42, Math.abs(Math.sin(a))); return { wf, front: Math.sin(a) < -.1, ox: -Math.cos(a) * 9, rot: -Math.cos(a) * (moving ? .32 : .1) + Math.sin(t * (moving ? 9 : 2)) * (moving ? .05 : .025), sy: 1 - (moving ? .06 : 0) + Math.sin(t * 2.2) * .015 }; }
  function capeTick(S, r, u) {
    const cp = r.spec && r.spec.cape;
    if (!cp || u.alive === false) { if (r.cape) r.cape.setVisible(false); return; }
    const key = 'flc_' + cp.join('_'); if (!S.textures.exists(key)) S.textures.addCanvas(key, (() => { const hi = capeCanvas(cp), c = document.createElement('canvas'); c.width = CW; c.height = CH; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(hi, 0, 0, CW, CH); return c; })());
    if (!r.cape || r.cape.texture.key !== key) { if (r.cape) r.cape.destroy(); r.cape = S.add.image(0, 0, key).setOrigin(.5, 6 / CH); }
    const pz = capePose(r.dir, S.now || 0, u.moving), sc = CSC * (r.scale || 1);
    r.cape.setVisible(u.spr.visible).setAlpha(u.spr.alpha).setPosition(u.spr.x + pz.ox * .6, u.spr.y + (u.flBob || 0) - (r.lift || 0) - SHOULDER - 2).setScale(sc * pz.wf, sc * pz.sy).setRotation(pz.rot).setDepth(u.spr.depth + (pz.front ? .025 : -.005));
  }
  const WSCALE = .33, SHOULDER = 74; // размер крыла в мире; высота корня крыла над стопами
  function wingId(S, u) { return u === S.hero ? (u.hasWings && u.alive !== false ? u.wingId : null) : (u.wingR && u.wingR.texture && u.wingR.texture.key.startsWith('wing7_') ? u.wingR.texture.key.slice(6) : null); }
  function wingPose(dir, t, moving) { // общая раскладка крыльев для мира и окна героя
    const a = ANGLE[dir], wf = Math.max(.3, Math.abs(Math.sin(a))), front = Math.sin(a) < -.1;
    const flap = Math.sin(t * (moving ? 7 : 2.6)) * (moving ? .2 : .12);
    return { wf, front, ox: -Math.cos(a) * 7, oy: Math.sin(a) < 0 ? 2 : 0, flap };
  }
  function wingTick(S, r, u) {
    const id = wingId(S, u);
    if (!id) { if (r.wings) for (const w of r.wings) w.setVisible(false); return; }
    const key = 'flw_' + id;
    if (!S.textures.exists(key)) S.textures.addCanvas(key, wingCanvas(id));
    if (!r.wings || r.wings[0].texture.key !== key) { if (r.wings) for (const w of r.wings) w.destroy(); r.wings = [1, -1].map(sd => S.add.image(0, 0, key).setOrigin(sd > 0 ? WR[0] / WSZ : 1 - WR[0] / WSZ, WR[1] / WSZ).setFlipX(sd < 0)); r.wfx = null; }
    const pz = wingPose(r.dir, S.now || 0, u.moving), sc = WSCALE * (r.scale || 1), x0 = u.spr.x + pz.ox, y0 = u.spr.y + (u.flBob || 0) - (r.lift || 0) - SHOULDER + pz.oy;
    const tier = u === S.hero ? u.wingTier : null;
    r.wings.forEach((w, i) => {
      const sd = i ? -1 : 1;
      w.setVisible(u.spr.visible).setAlpha(u.spr.alpha).setPosition(x0 + sd * 3, y0).setScale(sc * pz.wf, sc).setRotation(-sd * pz.flap).setDepth(u.spr.depth + (pz.front ? .03 : -.01));
      if (w.preFX) { if (tier && typeof tierColor === 'function') { if (!w._g) w._g = w.preFX.addGlow(0xffffff, 2, 0, false, .1, 8); w._g.color = tierColor(tier, S.now || 0); } else if (w._g) { w.preFX.remove(w._g); w._g = null; } }
    });
  }
  function setDir(r, sx, sy, snap) {
    if (Math.hypot(sx, sy) < 1e-6) return;
    const want = Math.atan2(sy, sx), diff = Math.abs(Phaser.Math.Angle.Wrap(want - ANGLE[r.dir]));
    if (snap || diff > .5) r.dir = dirOf(sx, sy);
  }
  function actionOf(S, r, u) {
    const now = S.now || 0;
    if (r.kind === 'mob') return now - (u.lungeT || -9) < .38 ? { an: 'swing', tok: u.lungeT } : null;
    const pz = u.pose;
    if (pz && now < pz.t0 + pz.dur) return { an: pz.type === 'raise' ? 'cast' : (r.spec.act === 'shoot' ? 'shoot' : 'swing'), tok: pz.t0 };
    if (now < (u.poseUntil || 0)) return { an: r.spec.act, tok: u.poseUntil };
    if (now - (u.lungeT || -9) < .3) return { an: r.spec.act, tok: u.lungeT };
    return null;
  }

  /* ---------- призрак (рывки) и картинка героя для окна персонажа ---------- */
  function ghost(S, u, tint, alpha) {
    const r = u.flr; if (!r || !r.ready) return false;
    for (const slot of (r.kind === 'mob' ? ['body'] : ORDER[r.dir])) {
      const p = r.parts[slot]; if (!p || !p.spr || !p.spr.visible) continue;
      const g = S.add.image(p.spr.x, p.spr.y, p.key, p.spr.frame.name).setOrigin(p.spr.originX, p.spr.originY).setScale(p.spr.scaleX).setTint(tint).setAlpha(alpha || .5).setDepth(p.spr.depth - 1);
      S.tweens.add({ targets: g, alpha: 0, duration: 400, onComplete: () => g.destroy() });
    }
    return true;
  }
  const TCV = new Map(); // окрашенные кадры для canvas
  function tintedFrame(f, tint) {
    const id = f.texture.key + '|' + f.name + '|' + tint; let c = TCV.get(id); if (c) return c;
    c = document.createElement('canvas'); c.width = f.cutWidth; c.height = f.cutHeight; const x = c.getContext('2d');
    x.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
    x.globalCompositeOperation = 'multiply'; x.fillStyle = rgb(tint); x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
    if (TCV.size > 400) TCV.clear(); TCV.set(id, c); return c;
  }
  function blit(S, ctx, key, fname, cx, fy, k, tint, glow, ky, kx) {
    ky = ky || k; kx = kx || k;
    const f = S.textures.getFrame(key, fname); if (!f || !f.data) return false;
    const o = meta(S, key).origin || [.5, .8], ss = f.data.spriteSourceSize, src = f.data.sourceSize || { w: f.realWidth, h: f.realHeight };
    const x = cx - o[0] * src.w * kx + ss.x * kx, y = fy - o[1] * src.h * ky + ss.y * ky;
    if (glow) { ctx.save(); ctx.shadowColor = rgb(glow, .95); ctx.shadowBlur = 14; }
    if (tint) ctx.drawImage(tintedFrame(f, tint), x, y, f.cutWidth * kx, f.cutHeight * ky);
    else ctx.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, x, y, f.cutWidth * kx, f.cutHeight * ky);
    if (glow) ctx.restore();
    return true;
  }
  function drawPanel(S, ctx, u, cx, fy, k, t, mounted) { // рисует героя (с маунтом и крыльями) в окне персонажа; true если получилось
    const r = u && u.flr; if (!r || !r.ready || r.kind !== 'hero') return false;
    const me = S && u === S.hero, mid = me && mounted && save.eq.mount ? save.eq.mount.base : null;
    const d = mid ? 5 : 6, fi = Math.floor(t * 3.2) % 4, tc = typeof tierColor === 'function' ? tierColor : null;
    let lift = 0, mkey = null, mg = null, mk = null;
    if (mid) { mk = mountKey(mid); mkey = 'fl_m_' + mk[0]; need(S, mkey, 'mob/' + mk[0]); if (S.textures.exists(mkey)) { mg = mountGeo(S, mkey); k *= mg.fly ? .66 : .78; lift = (Math.max(0, mg.seat - HIP) + (mg.fly ? Math.sin(t * 2.2) * 3 : 0)) * k; } else mkey = null; }
    // крылья (за спиной)
    const wid = me ? wingId(S, u) : null;
    if (wid) {
      const cv = wingHi(wid), pz = wingPose(d, t, false), sc = WSCALE * k, x0 = cx + pz.ox * k, y0 = fy - lift - SHOULDER * k + pz.oy * k, gl = me && u.wingTier && tc ? tc(u.wingTier, t) : 0;
      for (const sd of [1, -1]) {
        ctx.save(); ctx.translate(x0 + sd * 3 * k, y0); ctx.scale(sd * pz.wf, 1); ctx.rotate(-pz.flap);
        if (gl) { ctx.shadowColor = rgb(gl, .9); ctx.shadowBlur = 16; }
        ctx.drawImage(cv, -WR[0] * sc, -WR[1] * sc, WSZ * sc, WSZ * sc); ctx.restore();
      }
    }
    // плащ
    if (r.spec.cape) { const cv = capeCanvas(r.spec.cape), pz = capePose(d, t, false), sc = CSC * k; ctx.save(); ctx.translate(cx + pz.ox * .6 * k, fy - lift - (SHOULDER + 2) * k); ctx.rotate(pz.rot); ctx.scale(pz.wf, pz.sy); ctx.drawImage(cv, -CW / 2 * sc, -6 * sc, CW * sc, CH * sc); ctx.restore(); }
    // маунт
    if (mkey) { const fr = Math.floor(t * 8) % 4, fname = (mg.fly ? 'run_' : 'stance_') + d + '_' + (mg.fly ? fr : fi); blit(S, ctx, mkey, S.textures.getFrame(mkey, fname) ? fname : 'stance_' + d + '_0', cx, fy + (mg.fly ? Math.sin(t * 2.2) * 3 * k : 0), mg.sc * k, mk[1] || 0); }
    // сам герой
    const glow = { main: me && u.wTier && tc ? tc(u.wTier, t) : 0, chest: me && u.aTier && tc ? tc(u.aTier, t, .5) : r.spec.glow || 0 };
    for (const slot of ORDER[d]) {
      const p = r.parts[slot]; if (!p) continue;
      const nm = S.textures.getFrame(p.key, 'stance_' + d + '_' + fi) ? 'stance_' + d + '_' + fi : 'stance_' + d + '_0', sit = mkey && (slot === 'feet' || slot === 'legs');
      blit(S, ctx, p.key, nm, cx, fy - lift - (sit ? HIP * k * (1 - SITQ) : 0), k, r.spec.tint[slot] || 0, glow[slot] || 0, sit ? k * SITQ : k, sit ? k * 1.12 : k);
    }
    return true;
  }
  function portrait(S, spec, cb) { // картинка героя для карточек выбора класса
    const keys = Object.values(spec.layers).map(it => ['fl_h' + spec.sex + '_' + it, 'hero/' + spec.sex + '/' + it]);
    const tryDraw = n => {
      let ok = true; for (const [k, p] of keys) if (!need(S, k, p) && status[k] !== 'missing') ok = false;
      if (!ok) { if (n < 150) setTimeout(() => tryDraw(n + 1), 200); return; }
      const cv = document.createElement('canvas'); cv.width = 150; cv.height = 190; const ctx = cv.getContext('2d');
      const fake = { flr: { ready: true, kind: 'hero', spec, parts: {} } };
      for (const slot in spec.layers) fake.flr.parts[slot] = { key: 'fl_h' + spec.sex + '_' + spec.layers[slot] };
      for (const slot in fake.flr.parts) if (!S.textures.exists(fake.flr.parts[slot].key)) delete fake.flr.parts[slot];
      drawPanel(S, ctx, fake, 75, 182, 1.9, 0, false);
      cb(cv.toDataURL());
    };
    tryDraw(0);
  }
  function whenTiles(f) { if (TILE.ready) return f(); let done = false; const go = () => { if (!done) { done = true; f(); } }; TILE.waiters.push(go); setTimeout(go, 5000); }
  const PET = { dragon: ['wyvern_fire'], kitsune: ['fire_ant'], owl: ['wyvern_air', 0xd0d8ff], panda: ['antlion_small', 0xf0f0f0], phoenixchick: ['wyvern_fire', 0xffd080], jadeturtle: ['boulder', 0x9affc0],
    qilinkid: ['goblin_elite', 0xffe08a], frostpup: ['ice_ant'], spiderling: ['antlion_small', 0xc080ff], moonbat: ['wyvern_air', 0xff8090] };
  function attachPet(S, P) { if (!P || !P.spr) return; const m = PET[P.id] || ['wyvern_air']; attachMob(S, P, null, { key: m[0], height: /wyvern/.test(m[0]) ? 34 : 26, tint: m[1] }); }
  function petFrame(S, id) { const m = PET[id] || ['wyvern_air'], key = 'fl_m_' + m[0]; need(S, key, 'mob/' + m[0]); return S.textures.exists(key) ? { key, f: S.textures.getFrame(key, 'stance_6_0'), tint: m[1] } : null; }
  const NPC = { npc_master: { cls: 'mage', r: 2, weapon: 'bo' }, npc_trader: { cls: 'archer', r: 0, fem: true, noWeapon: true, noHelm: true }, npc_smith: { cls: 'warrior', r: 1, weapon: 'smith_hammer', bald: true, noHelm: true } };
  function portraitTo(S, cv, src) { // портрет героя/соперника в стиле Flare на canvas; true если нарисовано
    let fake = src && src.flr ? src : null;
    if (!fake) {
      const spec = src; let ok = true;
      for (const it of Object.values(spec.layers)) { const k = 'fl_h' + spec.sex + '_' + it; if (!need(S, k, 'hero/' + spec.sex + '/' + it) && status[k] !== 'missing') ok = false; }
      if (!ok) return false;
      fake = { flr: { ready: true, kind: 'hero', spec, parts: {} } };
      for (const slot in spec.layers) { const k = 'fl_h' + spec.sex + '_' + spec.layers[slot]; if (S.textures.exists(k)) fake.flr.parts[slot] = { key: k }; }
    }
    const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height);
    return drawPanel(S, x, fake, cv.width / 2, cv.height * .96, cv.height / 100, 0, false);
  }
  return { capeCanvas, tileImage, wingCanvas, wingHi, mountGeo, portraitTo, WEAP, PET, petFrame, attachPet, mountKey, NPC, whenTiles, init, heroSpec, portrait, groundOk, paintGround, decoImage, attachHero, attachMob, ghost, drawPanel, MOB, ready: u => !!(u && u.flr && u.flr.ready) };
})();
