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
  const COSTUME = {
    sakura: ['mage1', null, 0xffb0cc], monk: ['cloth', null, 0xffa040], raven: ['leather', 'leather_hood', 0x6a6478, 0x5a5468], fox: ['leather', 'leather_hood', 0xffd8a0, 0xff9a50],
    miko: ['mage0', null, 0xffe8e0], festival: ['mage1', null, 0x8fa0ff], ninja: ['leather', 'leather_hood', 0x707484, 0x60646e], shogun: ['plate', 'plate_helm', 0xff8a7a, 0xff8a7a],
    abyss: ['plate', 'plate_helm', 0x7ab0b8, 0x7ab0b8, 0x3ae0d0], paladin: ['plate', 'plate_helm', 0xfff0b0, 0xfff0b0, 0xffe08a], bloodreaper: ['mage2', 'mage_hood_alt2', 0xff7a7a, 0x9a5060, 0xff3b5e]
  };
  const HEADC = { hunter: ['chain_coif', 0xe8f0ff], reaper: ['mage_hood_alt2', 0x8a7090], crown: ['plate_helm', 0xffd060], oni: ['leather_hood', 0xff7a6a] };
  function heroSpec(o) { // o: { cls, r, costume, head, weapon, fem, outfit }
    const cls = TIER[o.cls] ? o.cls : 'warrior', sex = o.fem ? 'f' : 'm';
    const t = Math.max(0, Math.min(4, o.r || 0)), C = o.costume && COSTUME[o.costume], H = o.head && HEADC[o.head];
    const L = Object.assign({}, SETS[C ? C[0] : TIER[cls][t]]);
    L.head = sex === 'f' ? 'head_long' : o.bald ? 'head_bald' : 'head_short';
    let helm = C ? C[1] : HELM[cls][t]; if (H) helm = H[0];
    if (helm) L.helm = helm;
    L.main = o.noWeapon ? null : (WEAP[o.weapon] || o.weapon || DEF_WEAP[cls]); if (!L.main) delete L.main;
    if (o.noHelm) delete L.helm;
    if (cls === 'rogue' && t >= 2) L.off = 'buckler';
    for (const k in L) if (!has(sex, L[k])) delete L[k];
    const tint = {};
    if (C) { for (const k of ['chest', 'legs', 'hands', 'feet']) tint[k] = C[2]; if (C[3]) tint.helm = C[3]; }
    else if (o.outfit && !o.r) { tint.chest = mixWhite(o.outfit, .45); tint.legs = mixWhite(o.outfit, .6); }
    if (H) tint.helm = H[1];
    for (const k in tint) if (!L[k]) delete tint[k];
    return { sex, layers: L, tint, glow: C && C[4] || 0, act: ACT[cls] || 'swing', sig: sex + JSON.stringify(L) + JSON.stringify(tint) };
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
  function destroy(r) { for (const s in r.parts) if (r.parts[s].spr) r.parts[s].spr.destroy(); for (const o of [r.mnt && r.mnt.spr, ...(r.wings || [])]) if (o) o.destroy(); rigs.delete(r); if (r.unit && r.unit.flr === r) r.unit.flr = null; restore(r); }
  const NOREN = () => false;
  function hideOld(u) { for (const o of [u.spr, u.wspr, u.wglow, u.mountB, u.mountF, u.wingR, u.wingL, u.wingGR, u.wingGL]) if (o && o.willRender !== NOREN) { o._flWR = o.willRender; o.willRender = NOREN; } }
  function restore(r) { const u = r.unit; if (!u) return; for (const o of [u.spr, u.wspr, u.wglow, u.mountB, u.mountF, u.wingR, u.wingL, u.wingGR, u.wingGL]) if (o && o._flWR) { o.willRender = o._flWR; delete o._flWR; } }

  function tick(S, r) {
    const u = r.unit, spr = u.spr;
    if (!spr || !spr.scene || u.gone) { destroy(r); return; }
    if (!r.ready) {
      let all = true; for (const s in r.parts) if (!need(S, r.parts[s].key, r.parts[s].path)) { if (status[r.parts[s].key] === 'missing') { delete r.parts[s]; continue; } all = false; }
      if (!all || !Object.keys(r.parts).length) return;
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
    if (r.kind === 'hero') { hideOld(u); mountTick(S, r, u, mounted, moving); wingTick(S, r, u); glowTick(S, r, u); }
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
  const WSZ = 300, WR = [24, 236];
  const rgb = (c, a) => 'rgba(' + (c >> 16 & 255) + ',' + (c >> 8 & 255) + ',' + (c & 255) + ',' + (a === undefined ? 1 : a) + ')';
  const shade = (c, k) => { const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return (f(c >> 16 & 255) << 16) | (f(c >> 8 & 255) << 8) | f(c & 255); };
  function wingCanvas(id) {
    if (WCV[id]) return WCV[id];
    const W = (typeof WINGS !== 'undefined' && WINGS[id]) || { pal: [0xd8d8e8, 0xf0f0ff, 0xffffff, 0x8a8aa0] };
    const P = W.pal, cv = document.createElement('canvas'); cv.width = cv.height = WSZ; const x = cv.getContext('2d');
    x.translate(WR[0], WR[1]); x.lineJoin = 'round';
    // кость крыла: плечо → локоть → кисть → кончик
    const arm = [[0, 0], [70, -96], [150, -150], [262, -206]];
    const bez = t => { const [a, b, c, d] = arm, m = 1 - t; return [m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0], m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1]]; };
    const outline = rgb(shade(P[3], -.55), .85);
    if (W.style === 'membrane') {
      const fingers = [[262, -206], [250, -60], [196, 10], [118, 30]], wrist = bez(.55);
      x.beginPath(); x.moveTo(0, 0); for (let t = 0; t <= .55; t += .05) { const q = bez(t); x.lineTo(q[0], q[1]); }
      x.lineTo(262, -206);
      for (let i = 1; i < fingers.length; i++) { const a = fingers[i - 1], b = fingers[i], mx = (a[0] + b[0]) / 2 - 18, my = (a[1] + b[1]) / 2 - 26; x.quadraticCurveTo(mx, my, b[0], b[1]); }
      x.quadraticCurveTo(40, -10, 0, 0); x.closePath();
      const g = x.createLinearGradient(0, -200, 160, 40); g.addColorStop(0, rgb(P[1])); g.addColorStop(.6, rgb(P[0])); g.addColorStop(1, rgb(P[3]));
      x.fillStyle = g; x.fill(); x.lineWidth = 4; x.strokeStyle = outline; x.stroke();
      x.lineCap = 'round';
      for (const f of fingers) { x.beginPath(); x.moveTo(wrist[0], wrist[1]); x.lineTo(f[0], f[1]); x.lineWidth = 7; x.strokeStyle = rgb(shade(P[3], -.4)); x.stroke(); x.lineWidth = 2.5; x.strokeStyle = rgb(P[2], .55); x.stroke(); }
      x.beginPath(); x.moveTo(0, 0); for (let t = 0; t <= .55; t += .05) { const q = bez(t); x.lineTo(q[0], q[1]); } x.lineWidth = 11; x.strokeStyle = rgb(shade(P[3], -.4)); x.stroke(); x.lineWidth = 4; x.strokeStyle = rgb(P[2], .5); x.stroke();
      x.beginPath(); x.moveTo(wrist[0], wrist[1]); x.lineTo(wrist[0] + 6, wrist[1] - 22); x.lineTo(wrist[0] + 14, wrist[1] - 2); x.fillStyle = rgb(P[2]); x.fill();
    } else if (W.style === 'crystal') {
      for (let i = 0; i < 9; i++) {
        const t = .18 + i * .1, b = bez(Math.min(1, t)), len = 70 + i * 16, ang = Math.PI * (.42 - i * .045);
        const tip = [b[0] + Math.cos(ang) * len, b[1] + Math.sin(ang) * len], w = 15 + i * 1.2, nx = -Math.sin(ang) * w, ny = Math.cos(ang) * w;
        x.beginPath(); x.moveTo(b[0] + nx * .4, b[1] + ny * .4); x.lineTo(b[0] + (tip[0] - b[0]) * .55 + nx, b[1] + (tip[1] - b[1]) * .55 + ny); x.lineTo(tip[0], tip[1]); x.lineTo(b[0] + (tip[0] - b[0]) * .6 - nx * .6, b[1] + (tip[1] - b[1]) * .6 - ny * .6); x.lineTo(b[0] - nx * .3, b[1] - ny * .3); x.closePath();
        const g = x.createLinearGradient(b[0], b[1], tip[0], tip[1]); g.addColorStop(0, rgb(P[0], .95)); g.addColorStop(.7, rgb(P[1], .85)); g.addColorStop(1, rgb(P[2], .9));
        x.fillStyle = g; x.fill(); x.lineWidth = 2.5; x.strokeStyle = rgb(P[3], .9); x.stroke();
        x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(tip[0], tip[1]); x.lineWidth = 1.6; x.strokeStyle = 'rgba(255,255,255,.7)'; x.stroke();
      }
      x.beginPath(); x.moveTo(0, 0); for (let t = 0; t <= 1; t += .05) { const q = bez(t); x.lineTo(q[0], q[1]); } x.lineWidth = 10; x.strokeStyle = rgb(P[3]); x.stroke(); x.lineWidth = 3; x.strokeStyle = 'rgba(255,255,255,.75)'; x.stroke();
    } else {
      const feather = (b, ang, len, w, c0, c1, edge) => {
        const tip = [b[0] + Math.cos(ang) * len, b[1] + Math.sin(ang) * len], nx = -Math.sin(ang), ny = Math.cos(ang);
        x.beginPath(); x.moveTo(b[0] - nx * w * .35, b[1] - ny * w * .35);
        x.quadraticCurveTo(b[0] + Math.cos(ang) * len * .55 - nx * w * .7, b[1] + Math.sin(ang) * len * .55 - ny * w * .7, tip[0], tip[1]);
        x.quadraticCurveTo(b[0] + Math.cos(ang) * len * .6 + nx * w * .62, b[1] + Math.sin(ang) * len * .6 + ny * w * .62, b[0] + nx * w * .35, b[1] + ny * w * .35); x.closePath();
        const g = x.createLinearGradient(b[0], b[1], tip[0], tip[1]); g.addColorStop(0, rgb(c0)); g.addColorStop(1, rgb(c1));
        x.fillStyle = g; x.fill(); x.lineWidth = 2.2; x.strokeStyle = outline; x.stroke();
        x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(b[0] + Math.cos(ang) * len * .85, b[1] + Math.sin(ang) * len * .85); x.lineWidth = 1.3; x.strokeStyle = rgb(edge, .55); x.stroke();
      };
      // маховые (длинные, по внешней половине), второстепенные, кроющие
      for (let i = 10; i >= 0; i--) { const t = .35 + i * .065, b = bez(Math.min(1, t)); feather(b, Math.PI * (.47 - i * .052), 92 + i * 10, 24, shade(P[0], -.25), P[1], P[2]); }
      for (let i = 7; i >= 0; i--) { const t = .04 + i * .055, b = bez(t); feather(b, Math.PI * (.52 - i * .02), 110 - i * 2, 26, shade(P[0], -.35), shade(P[0], .1), P[2]); }
      for (let i = 0; i < 9; i++) { const t = .05 + i * .1, b = bez(t); feather([b[0] - 4, b[1] + 6], Math.PI * (.45 - i * .04), 46 + i * 2, 22, shade(P[3], 0), P[0], P[2]); }
      for (let i = 0; i < 10; i++) { const t = .03 + i * .085, b = bez(t); feather([b[0], b[1] + 2], Math.PI * (.42 - i * .035), 26, 18, P[1], shade(P[0], .15), 0xffffff); }
      x.beginPath(); x.moveTo(0, 0); for (let t = 0; t <= 1; t += .04) { const q = bez(t); x.lineTo(q[0], q[1]); } x.lineCap = 'round'; x.lineWidth = 9; x.strokeStyle = rgb(shade(P[3], -.2)); x.stroke(); x.lineWidth = 3; x.strokeStyle = rgb(P[2], .7); x.stroke();
      if (W.energy) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = .35; x.drawImage(cv, -WR[0], -WR[1]); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
    }
    // лёгкий «живописный» шум
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 900; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)'; x.fillRect(Math.random() * WSZ, Math.random() * WSZ, 3, 3); }
    x.globalCompositeOperation = 'source-over';
    return (WCV[id] = cv);
  }
  const WSCALE = .3, SHOULDER = 74; // размер крыла в мире; высота корня крыла над стопами
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
      const cv = wingCanvas(wid), pz = wingPose(d, t, false), sc = WSCALE * k, x0 = cx + pz.ox * k, y0 = fy - lift - SHOULDER * k + pz.oy * k, gl = me && u.wingTier && tc ? tc(u.wingTier, t) : 0;
      for (const sd of [1, -1]) {
        ctx.save(); ctx.translate(x0 + sd * 3 * k, y0); ctx.scale(sd * pz.wf, 1); ctx.rotate(-pz.flap);
        if (gl) { ctx.shadowColor = rgb(gl, .9); ctx.shadowBlur = 16; }
        ctx.drawImage(cv, -WR[0] * sc, -WR[1] * sc, WSZ * sc, WSZ * sc); ctx.restore();
      }
    }
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
  return { tileImage, wingCanvas, mountGeo, portraitTo, WEAP, PET, petFrame, attachPet, mountKey, NPC, whenTiles, init, heroSpec, portrait, groundOk, paintGround, decoImage, attachHero, attachMob, ghost, drawPanel, MOB, ready: u => !!(u && u.flr && u.flr.ready) };
})();
