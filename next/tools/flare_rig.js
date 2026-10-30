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
    nodachi: 'greatsword', odachi: 'greatsword', greatsword: 'greatsword', zanbato: 'zweihander',
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
    scene = S; window.__FLG = S;
    if (!MAN && !status.__man) { status.__man = 1; fetch(BASE + 'manifest.json').then(r => r.json()).then(j => { MAN = j; }).catch(() => { MAN = { hero: { m: [], f: [] }, mob: [] }; }); }
    S.load.on('filecomplete', (key, type) => { if (type === 'atlasjson' && key.startsWith('fl_')) { status[key] = 'ready'; makeAnims(S, key); } });
    S.load.on('loaderror', f => { if (f && f.key && f.key.startsWith('fl_')) status[f.key] = 'missing'; });
    S.events.on('postupdate', () => { for (const r of rigs) tick(S, r); });
    S.events.once('shutdown', () => { for (const r of [...rigs]) destroy(r); });
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
  function heroSpec(o) { // o: { cls, r, costume, head, weapon, fem, outfit }
    const cls = TIER[o.cls] ? o.cls : 'warrior', sex = o.fem ? 'f' : 'm';
    const t = Math.max(0, Math.min(4, o.costume ? Math.max(3, o.r || 0) : (o.r || 0)));
    const L = Object.assign({}, SETS[TIER[cls][t]]);
    L.head = sex === 'f' ? 'head_long' : 'head_short';
    let helm = HELM[cls][t]; if (o.head) helm = cls === 'mage' ? 'mage_hood_alt2' : cls === 'warrior' ? 'plate_helm' : 'leather_hood';
    if (helm) L.helm = helm;
    L.main = WEAP[o.weapon] || DEF_WEAP[cls];
    if (cls === 'rogue' && t >= 2) L.off = 'buckler';
    for (const k in L) if (!has(sex, L[k])) delete L[k];
    const tint = {};
    if (o.outfit) { const c = mixWhite(o.outfit, .45); tint.chest = c; tint.legs = mixWhite(o.outfit, .6); }
    return { sex, layers: L, tint, act: ACT[cls] || 'swing', sig: sex + JSON.stringify(L) + JSON.stringify(tint) };
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
  function attachMob(S, unit, kind) {
    const m = MOB[kind]; if (!m) return null;
    if (unit.flr) destroy(unit.flr);
    const r = { unit, kind: 'mob', mobKey: kind, parts: { body: { key: 'fl_m_' + m[0], path: 'mob/' + m[0], spr: null } }, dir: Math.floor(Math.random() * 8), anim: '', ready: false, height: m[1], defTint: m[2] };
    unit.flr = r; rigs.add(r); return r;
  }
  function destroy(r) { for (const s in r.parts) if (r.parts[s].spr) r.parts[s].spr.destroy(); rigs.delete(r); if (r.unit && r.unit.flr === r) r.unit.flr = null; restore(r); }
  const NOREN = () => false;
  function hideOld(u) { for (const o of [u.spr, u.wspr, u.wglow]) if (o && o.willRender !== NOREN) { o._flWR = o.willRender; o.willRender = NOREN; } }
  function restore(r) { const u = r.unit; if (!u) return; for (const o of [u.spr, u.wspr, u.wglow]) if (o && o._flWR) { o.willRender = o._flWR; delete o._flWR; } }

  function tick(S, r) {
    const u = r.unit, spr = u.spr;
    if (!spr || !spr.scene || u.gone) { destroy(r); return; }
    if (!r.ready) {
      let all = true; for (const s in r.parts) if (!need(S, r.parts[s].key, r.parts[s].path)) { if (status[r.parts[s].key] === 'missing') { delete r.parts[s]; continue; } all = false; }
      if (!all || !Object.keys(r.parts).length) return;
      for (const s in r.parts) { const p = r.parts[s], o = meta(S, p.key).origin || [.5, .8]; p.spr = S.add.sprite(0, 0, p.key, Object.keys(S.textures.get(p.key).frames).find(f => f !== '__BASE')).setOrigin(o[0], o[1]); }
      if (r.kind === 'mob') { const p = r.parts.body, f = S.textures.getFrame(p.key, 'stance_6_0') || p.spr.frame, h = (f.data && f.data.spriteSourceSize ? f.data.spriteSourceSize.h : f.height) || 60; r.scale = Phaser.Math.Clamp(r.height / h, .3, 3) * (u.boss && !MOB[r.mobKey][1] ? 1.3 : 1); }
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
      s.setPosition(spr.x, spr.y + (u.flBob || 0)).setDepth(spr.depth + .01 + i * .001).setAlpha(spr.alpha).setVisible(spr.visible && !(mounted && (slot === 'feet' || slot === 'legs')));
      s.setScale(r.scale || 1);
      if (tinted || (r.spec && r.spec.tint[slot]) || r.defTint) {
        const base = r.spec && r.spec.tint[slot] || r.defTint;
        if (fill) s.setTintFill(tc); else if (tinted) s.setTint(tc); else s.setTint(base);
      } else if (s.isTinted) s.clearTint();
      i++;
    }
    r.anim = key;
    // свечение заточки на оружии (тот же цвет, что и у старого свечения)
    if (r.kind === 'hero' && r.parts.main && r.parts.main.spr && u.wTier && typeof tierColor === 'function') {
      const ms = r.parts.main.spr;
      if (!ms.preFX) { /* canvas renderer */ } else { if (!r.glow) r.glow = ms.preFX.addGlow(0xffffff, 3, 0, false, .1, 10); r.glow.color = tierColor(u.wTier, S.now || 0); r.glow.outerStrength = 2.5 + Math.sin((S.now || 0) * 4); }
    } else if (r.glow && r.parts.main && r.parts.main.spr) { r.parts.main.spr.preFX.remove(r.glow); r.glow = null; }
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
  function drawPanel(S, ctx, u, cx, fy, k, t, mounted) { // рисует героя в окне персонажа; true если получилось
    const r = u && u.flr; if (!r || !r.ready || r.kind !== 'hero') return false;
    const fi = Math.floor(t * 3.2) % 4, d = 6;
    for (const slot of ORDER[d]) {
      const p = r.parts[slot]; if (!p || (mounted && (slot === 'feet' || slot === 'legs'))) continue;
      const f = S.textures.getFrame(p.key, 'stance_' + d + '_' + fi) || S.textures.getFrame(p.key, 'stance_' + d + '_0'); if (!f) continue;
      const o = meta(S, p.key).origin || [.5, .8], ss = f.data.spriteSourceSize, src = f.data.sourceSize || { w: f.realWidth, h: f.realHeight };
      const x = cx - o[0] * src.w * k + ss.x * k, y = fy - o[1] * src.h * k + ss.y * k;
      ctx.save();
      const tint = r.spec.tint[slot];
      if (tint) { ctx.filter = 'none'; }
      ctx.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, x, y, f.cutWidth * k, f.cutHeight * k);
      ctx.restore();
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
  return { init, heroSpec, portrait, attachHero, attachMob, ghost, drawPanel, MOB, ready: u => !!(u && u.flr && u.flr.ready) };
})();
