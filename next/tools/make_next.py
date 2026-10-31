"""Собирает тестовую версию next/index.html из живой index.html:
графика Flare (риг слоёв), класс Разбойник, отдельное сохранение без записи в облако."""
import re, sys
SRC = '/home/claude/oblachny-klinok/index.html'
DST = '/home/claude/oblachny-klinok/next/index.html'
s = open(SRC, encoding='utf-8').read()
rig = open('/home/claude/work/flare_rig.js', encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f'ANCHOR x{n} (need {count}): {old[:90]!r}')
    s = s.replace(old, new)

# --- 1. класс Разбойник ---
rep("""  archer: { name: 'Лучник',""", """  rogue: { name: 'Разбойник', desc: 'Кинжалы и короткие клинки: молниеносные удары, частые криты, рывки и теневые клоны. Мало брони — бейте первым.', hp: 1, atk: 1.12, def: 2, crit: 14, aspd: .6, mp: 1, range: 1.05,
    look: { cls: 'sword', hair: [0x1a1a22, 0x6a6a7a], band: 0x2a2a3a }, starter: 'kunai', skills: ['thousand', 'windstep', 'clone', 'shadow', 'storm', 'moonslash'] },
  archer: { name: 'Лучник',""")
rep("Object.assign(WEAPON_CLASS, { legblade: 'warrior', legstaff: 'mage', legbow: 'archer' });",
    """Object.assign(WEAPON_CLASS, { legblade: 'warrior', legstaff: 'mage', legbow: 'archer', kunai: 'rogue', shinobi: 'rogue' });
BASES.weapon.push('kunai', 'shinobi');
NAMES.weapon.push(['Кунай', 'Острый кунай', 'Кунай Тихой тени'], ['Синоби-гатана', 'Закалённая синоби-гатана', 'Клинок Ночного ветра']);
WGEO.kunai = WGEO.tanto; WGEO.shinobi = WGEO.wakizashi;
Object.assign(WMULT, { kunai: .9, shinobi: 1 }); Object.assign(WCRIT, { kunai: 8, shinobi: 6 });""")
rep("const LEG_WEAPON = { warrior: ['legblade', 'Клинок Небесного дракона'],", "const LEG_WEAPON = { rogue: ['shinobi', 'Клинок Безлунной ночи'], warrior: ['legblade', 'Клинок Небесного дракона'],")
rep("b: { warrior: 'tachi', mage: 'orb', archer: 'compbow' }", "b: { warrior: 'tachi', mage: 'orb', archer: 'compbow', rogue: 'kunai' }")
rep("b: { warrior: 'zanbato', mage: 'bonestaff', archer: 'crossbow' }", "b: { warrior: 'zanbato', mage: 'bonestaff', archer: 'crossbow', rogue: 'shinobi' }")
rep("b: { warrior: 'odachi', mage: 'icestaff', archer: 'longbow' }", "b: { warrior: 'odachi', mage: 'icestaff', archer: 'longbow', rogue: 'shinobi' }")
rep("  archer: ['Лук Небесного грома', 'Арбалет Кровавой луны', 'Лук Тысячи звёзд']\n};",
    "  archer: ['Лук Небесного грома', 'Арбалет Кровавой луны', 'Лук Тысячи звёзд'],\n  rogue: ['Клинок Безлунной ночи', 'Кунай Алой тени', 'Клинок Шёпота смерти']\n};")
rep("  archer: { sniper: { n: 'Снайпер',", "  rogue: { assassin: { n: 'Убийца', d: 'Крит +12%, урон крита +30%.', crit: 12, critDmg: .3 }, shadow: { n: 'Тень', d: 'Скорость атаки +25%, атака +8%.', aspd: .25, atk: .08 } },\n  archer: { sniper: { n: 'Снайпер',")
rep("CP_NAMECOL = { warrior: '#ffb38a', mage: '#c3b2ff', archer: '#a6eaa7' }", "CP_NAMECOL = { warrior: '#ffb38a', mage: '#c3b2ff', archer: '#a6eaa7', rogue: '#d8d8f0' }")
rep("{ warrior: '剣', mage: '術', archer: '弓' }[p.c]", "{ warrior: '剣', mage: '術', archer: '弓', rogue: '忍' }[p.c]")
rep("const FEM_HAIR = { warrior: [0x2a1220, 0x9a3a5a], mage: [0xd8d0f0, 0xffffff], archer: [0x7a3a14, 0xe09a50] };",
    "const FEM_HAIR = { warrior: [0x2a1220, 0x9a3a5a], mage: [0xd8d0f0, 0xffffff], archer: [0x7a3a14, 0xe09a50], rogue: [0x14141c, 0x5a5a72] };")
rep("cls = ['warrior', 'mage', 'archer'][Math.floor(R() * 3)]", "cls = ['warrior', 'mage', 'archer', 'rogue'][Math.floor(R() * 4)]")
rep("  base_archer: { coat: 0x2f5a34,", "  base_rogue: { coat: 0x2a2a34, inner: 0x141418, sash: 0x5a1a2a, trim: 0x9a9ab0 },\n  base_archer: { coat: 0x2f5a34,")
rep("Object.assign(APANTS, { base_warrior: 0x262e3a,", "Object.assign(APANTS, { base_rogue: 0x18181e, base_warrior: 0x262e3a,")
rep("SKILL_LV.push(45);", """SKILL_LV.push(45);
Object.assign(SKILLS, { deathlotus: { name: 'Танец смерти', short: 'Танец', glyph: '蓮', cost: 60, cd: 28, text: 'мгновенные удары со спины по пяти врагам вокруг, каждый — критический' } });
for (const [k, c] of Object.entries({ thousand: 0xd8c8ff, windstep: 0x9fd6ff, clone: 0xc18cff, shadow: 0xb27cff, moonslash: 0xd8e4ff, deathlotus: 0xb27cff })) if (SKILL_COL[k] == null) SKILL_COL[k] = c;
CLASSES.rogue.skills.push('deathlotus');
World.prototype.sk_deathlotus = function (h) {
  const tg = this.mobs.filter(e => e.alive && dist(e, h) < 6).sort((a, b) => dist(a, h) - dist(b, h)).slice(0, 5);
  if (!tg.length) { log('Нет целей.', 'info'); return false; }
  tg.forEach((m, i) => this.time.delayedCall(i * 160, () => {
    if (!h.alive || !m.alive) return;
    FLR.ghost(this, h, 0xb27cff, .6);
    const a = Math.atan2(m.y - h.y, m.x - h.x), nx = m.x + Math.cos(a) * .7, ny = m.y + Math.sin(a) * .7;
    if (this.walkable(nx, ny)) { h.x = nx; h.y = ny; }
    this.face(h, m); this.lunge(h, m); this.slash(m, 0xb27cff, true);
    this.hurtMob(m, Math.round(h.atk * 2.4 * 1.8 * rand(.95, 1.05)), true);
  }));
};""")

# --- 2. графика Flare ---
sty = open('/home/claude/work/flare_style.js', encoding='utf-8').read()
rep("\nnew Phaser.Game({\n  type: Phaser.AUTO, parent: 'game', transparent: true,", "\n" + rig + "\n" + sty + "\nFLR.whenTiles(() => FST.ready.then(() => new Phaser.Game({\n  type: Phaser.AUTO, parent: 'game', transparent: true,")
rep("  scene: World\n});\n})();", "  scene: World\n})));\n})();")
rep("  create(data) {\n    GAME = this;", "  create(data) {\n    GAME = this;\n    FLR.init(this);")
# герой: собираем слои по надетому снаряжению
rep("""    const base = this.currentLook();
    h.tex = {};""", """    const base = this.currentLook();
    try {
      const co = this.lookOn('costume'), hd = this.lookOn('head'), wl0 = this.weaponLook(), ofit = co && OUTFITS[co.base];
      FLR.attachHero(this, h, FLR.heroSpec({ cls: save.cls || 'warrior', r: save.eq.armor ? save.eq.armor.rarity : 0, costume: co ? co.base : null, head: hd ? hd.base : null,
        weapon: wl0 ? wl0.base : (CLASSES[save.cls || 'warrior'] || CLASSES.warrior).starter, wr: wl0 ? wl0.r : 0, fem: !!save.fem, outfit: ofit ? (Array.isArray(ofit) ? ofit[0] : ofit).coat : null }));
    } catch (e) { console.warn('flare hero', e); }
    h.tex = {};""")
# монстры
rep("""    if (def.tint) { m.spr.setTint(def.tint); m.spr.baseTint = def.tint; }
    this.tweens.add({ targets: m.spr, alpha: 1, duration: 500 });""", """    if (def.tint) { m.spr.setTint(def.tint); m.spr.baseTint = def.tint; }
    FLR.attachMob(this, m, def.key);
    this.tweens.add({ targets: m.spr, alpha: 1, duration: 500 });""")
# другие игроки
rep("""  u.spr = S.add.image(0, 0, u.tex.idle).setOrigin(.5, HERO_FY / HERO_H).setScale(HERO_K / HRES);
  const wb = L.w && WGEO[L.w] ? L.w : (CLASSES[p.c] || CLASSES.warrior).starter;""", """  u.spr = S.add.image(0, 0, u.tex.idle).setOrigin(.5, HERO_FY / HERO_H).setScale(HERO_K / HRES);
  const wb = L.w && WGEO[L.w] ? L.w : (CLASSES[p.c] || CLASSES.warrior).starter;
  try { const of2 = L.co && OUTFITS[L.co]; FLR.attachHero(S, u, FLR.heroSpec({ cls: CLASSES[p.c] ? p.c : 'warrior', r: +L.r || 0, costume: L.co || null, head: L.hd || null, weapon: wb, wr: +L.wr || +L.r || 0, fem: !!L.fm, outfit: of2 ? (Array.isArray(of2) ? of2[0] : of2).coat : null })); } catch (e) {}""")
# соперник на арене
rep("""    const wb = CLASSES[f.c].starter; m.wspr = S.add.image(0, 0, S.weaponTexKey(wb, 2)).setOrigin(GRIP[0] / HERO_W, GRIP[1] / HERO_H).setScale(HERO_K / 4);""",
    """    const wb = CLASSES[f.c].starter; m.wspr = S.add.image(0, 0, S.weaponTexKey(wb, 2)).setOrigin(GRIP[0] / HERO_W, GRIP[1] / HERO_H).setScale(HERO_K / 4);
    FLR.attachHero(S, m, FLR.heroSpec({ cls: f.c, r: 2, weapon: wb }));""")
# рывок: призрак из слоёв
rep("""  sk_windstep(h) {
    const ghost = this.add.image(h.spr.x, h.spr.y, h.spr.texture.key)""", """  sk_windstep(h) {
    const ghost = FLR.ghost(this, h, 0x9fd6ff) ? { destroy() {} } : this.add.image(h.spr.x, h.spr.y, h.spr.texture.key)""")
rep("""    this.tweens.add({ targets: ghost, alpha: 0, duration: 400, onComplete: () => ghost.destroy() });
    const m = h.target && h.target.alive ? h.target : null;""", """    if (ghost.scene) this.tweens.add({ targets: ghost, alpha: 0, duration: 400, onComplete: () => ghost.destroy() });
    const m = h.target && h.target.alive ? h.target : null;""")
# окно персонажа
rep("""    if (mt && mfly !== 'stand') ctx.drawImage(src(h.tex ? h.tex.idle : h.spr.texture.key)""", """    const flDrawn = FLR.drawPanel(this, ctx, h, cx, FLR.ready(h) ? gy - 6 : fy, k / HERO_K * .8, t, !!mt);
    if (flDrawn) {} else if (mt && mfly !== 'stand') ctx.drawImage(src(h.tex ? h.tex.idle : h.spr.texture.key)""")
rep("""    if (mt) mDraw('front');
    const wlk = this.weaponLook();""", """    if (mt) mDraw('front');
    const wlk = flDrawn ? null : this.weaponLook();""")
# карточки выбора класса: картинка героя Flare
rep("""    if (GAME) { try { const im = mk('img'); const key = GAME.heroTexKey(""", """    if (GAME && FLR.portrait) { const im = mk('img'); im.alt = ''; b.appendChild(im); FLR.portrait(GAME, FLR.heroSpec({ cls: id, r: ({ warrior: 3, mage: 2, archer: 2, rogue: 2 })[id] || 1, weapon: c.starter, fem: !!save.fem }), u => { im.src = u; }); }
    else if (GAME) { try { const im = mk('img'); const key = GAME.heroTexKey(""")

rep(".cls img{width:48px;height:72px}", ".cls img{width:76px;height:96px;object-fit:contain}\n#classPick>.card.wide{max-width:980px}\n#classPick .classes{grid-template-columns:repeat(auto-fit,minmax(205px,1fr))}")
# --- карта ---
i0 = s.index("  // --- base colour per tile\n"); i1 = s.index("  // smooth ponds: muddy bank")
old = s[i0:i1]
s = s[:i0] + "  if (FLR.groundOk()) { x.save(); island(); x.clip(); FLR.paintGround(x, z.tiles, P, ti0, ti1, tj0, tj1, m, inView, tileRng, z); } else {\n" + old + "  }\n" + s[i1:]
rep("""    const sh = this.add.image(d.x, d.y, 'shadow').setDepth(-90000).setAlpha(.7).setScale(key.includes('rock') || key === 'bush' || key === 'stump' ? 1.1 : key === 'torii' || key === 'stall' || key.startsWith('house') ? 2.6 : 1.9, 1.5);
    const img = this.add.image(d.x, d.y, hk || key).setOrigin(.5, d.oy).setDepth(d.y);
    if (d.sc) img.setScale(d.sc); else if (hk) img.setScale(.5);""", """    const fimg = FLR.decoImage(this, key, this.zone.tiles, d.x, d.y);
    const sh = fimg ? null : this.add.image(d.x, d.y, 'shadow').setDepth(-90000).setAlpha(.7).setScale(key.includes('rock') || key === 'bush' || key === 'stump' ? 1.1 : key === 'torii' || key === 'stall' || key.startsWith('house') ? 2.6 : 1.9, 1.5);
    const img = fimg || this.add.image(d.x, d.y, hk || key).setOrigin(.5, d.oy).setDepth(d.y);
    if (!fimg) { if (d.sc) img.setScale(d.sc); else if (hk) img.setScale(.5); }""")
rep("    const out = [sh, img];\n    if (d.glow) {", "    const out = sh ? [sh, img] : [img];\n    if (d.glow) {")
rep("""    const putDeco = (key, p, oy) => {
      const hk = HI[key];""", """    const putDeco = (key, p, oy) => {
      const fimg = FLR.decoImage(this, key, z.tiles, p.x, p.y); if (fimg) return fimg;
      const hk = HI[key];""")
rep("      po.spr = this.add.image(p.x, p.y, 'portal3').setOrigin(.5, .97).setScale(.5).setDepth(p.y);", "      po.spr = FLR.decoImage(this, 'portal3', z.tiles, p.x, p.y) || this.add.image(p.x, p.y, 'portal3').setOrigin(.5, .97).setScale(.5).setDepth(p.y);")
rep("""        n.spr = this.add.image(0, 0, 'npc2' + d.key.slice(3)).setOrigin(.5, HERO_FY / HERO_H).setScale(HERO_K / 2).setFlipX(d.x > C);""", """        n.spr = this.add.image(0, 0, 'npc2' + d.key.slice(3)).setOrigin(.5, HERO_FY / HERO_H).setScale(HERO_K / 2).setFlipX(d.x > C);
        try { if (FLR.NPC[d.key]) FLR.attachHero(this, n, FLR.heroSpec(FLR.NPC[d.key])); } catch (e) {}""")

# --- деревня отдельно: Деревня Кумо (город), Окрестности (бывшая деревня), свой дом, сундуки ---
rep("for (const z of Object.values(ZONES)) z.size = z.dungeon || z.arena ? 44 : 150;", """Object.assign(ZONES, {
  town: { name: 'Деревня Кумо', seed: 13, tiles: 't', bg: '#0d1220', village: true, town: true, deco: 'town', ambient: 'fireflies', ponds: [], mobs: [], size: 32,
    portals: [{ to: 'village', x: 14.5, y: 27 }, { to: 'gate', x: 27, y: 14.5, gate: true }, { to: 'home', x: 14.5, y: 1 }] },
  home: { name: 'Ваш дом', seed: 17, tiles: 'k', bg: '#0e0a14', village: true, home: true, deco: 'none', ambient: 'none', ponds: [], mobs: [], size: 18,
    portals: [{ to: 'town', x: 14.5, y: 27 }] }
});
ZONES.village.village = false; ZONES.village.name = 'Окрестности деревни Кумо';
ZONES.village.portals = ZONES.village.portals.filter(p => !p.gate); ZONES.village.portals.unshift({ to: 'town', x: 14.5, y: 14.5 });
for (const [id, z] of Object.entries(ZONES)) if (z.dungeon || z.arena || ['ghall', 'tower', 'bg_field', 'arena_map'].includes(id)) for (const p of z.portals || []) if (p.to === 'village') p.to = 'town';
for (const z of Object.values(ZONES)) z.size = z.size || (z.dungeon || z.arena ? 44 : 150);""")
rep("if (!ZONES[save.zone]) save.zone = 'village';", "if (!ZONES[save.zone]) save.zone = 'town';")
rep("    this.zoneId = (data && data.zone) || save.zone || 'village';\n    if (!(data && data.zone) && ZONES[this.zoneId] && ZONES[this.zoneId].dungeon) this.zoneId = 'village';",
    "    this.zoneId = (data && data.zone) || save.zone || 'town';\n    if (!(data && data.zone) && ZONES[this.zoneId] && ZONES[this.zoneId].dungeon) this.zoneId = 'town';")
rep("this.zoneId === 'tower' ? 'tower:' + save.pid :", "this.zoneId === 'tower' ? 'tower:' + save.pid : this.zoneId === 'home' ? 'home:' + save.pid :")
rep("    if (this.tw) { this.travel({ to: 'village' }); return; }", "    if (this.tw) { this.travel({ to: 'town' }); return; }")
rep("setTimeout(() => S.travel({ to: 'village' }), 3000);", "setTimeout(() => S.travel({ to: 'town' }), 3000);")
rep("  if (!save.guild) { S.travel({ to: 'village' }); return; }", "  if (!save.guild) { S.travel({ to: 'town' }); return; }")
rep("S.time.delayedCall(300, () => S.travel({ to: 'village' }));", "S.time.delayedCall(300, () => S.travel({ to: 'town' }));")
rep("!ZONES[P.back].arena ? P.back : 'village' });", "!ZONES[P.back].arena ? P.back : 'town' });")
rep("  safeAt(x, y) {\n", "  safeAt(x, y) {\n    if (this.zone.town || this.zone.home) return true;\n")
# NPC: относительные координаты, привязка к зоне, сундуки
rep("""  { id: 'smith', name: 'Кузнец Тэцу', role: 'заточка', key: 'npc_smith', x: C - 2.3, y: C + 2.3 }
];""", """  { id: 'smith', name: 'Кузнец Тэцу', role: 'заточка', key: 'npc_smith', x: C - 2.3, y: C + 2.3 },
  { id: 'chest', name: 'Личный сундук', role: 'склад', key: 'obj_chest', obj: 'chest', x: C - 4.2, y: C - .6 },
  { id: 'gchest', name: 'Сундук гильдии', role: 'общий склад гильдии', key: 'obj_gchest', obj: 'gchest', x: C - .6, y: C - 4.2 },
  { id: 'chest', name: 'Сундук', role: 'склад', key: 'obj_chest', obj: 'chest', zone: 'home', x: C - 2.2, y: C - 3.2 },
  { id: 'board', name: 'Обустройство', role: 'дом, сад и трофеи', key: 'obj_board', obj: 'board', zone: 'home', x: C + 2.2, y: C - 3.2 }
];
NPCS.forEach(d => { d.dx = d.x - C; d.dy = d.y - C; });
const TOWN_K = 1.8; // город просторнее: всё убранство и жители дальше от центра""")
rep("""      for (const d of NPCS) {
        const n = Object.assign({}, d, { lungeT: -9, off: Math.random() * 6 });""", """      for (const d of NPCS) {
        if ((d.zone || 'town') !== this.zoneId) continue;
        const n = Object.assign({}, d, { x: C + d.dx * (d.zone ? 1 : TOWN_K), y: C + d.dy * (d.zone ? 1 : TOWN_K), lungeT: -9, off: Math.random() * 6 });""")
rep("""        n.spr = this.add.image(0, 0, 'npc2' + d.key.slice(3)).setOrigin(.5, HERO_FY / HERO_H).setScale(HERO_K / 2).setFlipX(d.x > C);""",
    """        n.spr = (d.obj && FLR.decoImage(this, d.obj, z.tiles, 0, 0)) || this.add.image(0, 0, 'npc2' + (d.obj ? '_master' : d.key.slice(3))).setOrigin(.5, HERO_FY / HERO_H).setScale(HERO_K / 2).setFlipX(n.x > C);
        if (d.obj) n.shadow.setVisible(false);""")
rep("    for (const n of this.npcs) this.placeUnit(n, Math.sin(this.now * 1.6 + n.off) * .8);", "    for (const n of this.npcs) this.placeUnit(n, n.obj ? 0 : Math.sin(this.now * 1.6 + n.off) * .8);")
# убранство: в доме — мебель вместо деревенских построек
rep("""    if (z.village) {
      place('torii', C, C + 4.3, .97);""", """    if (z.home) {
      for (const [k, x, y] of [['bed', C - 3.4, C + .2], ['table', C + 2.6, C + 1.2], ['throne', C + .2, C - 3.8], ['barrel', C + 3.8, C - 1.2], ['crate', C + 3.6, C - .2], ['statue', C - 3.8, C + 3.2]]) place(k, x, y, .9);
      for (const [x, y] of [[C - 2.4, C - 2.4], [C + 2.4, C - 2.4], [C + 2.4, C + 2.4], [C - 2.4, C + 2.4]]) lantern(x, y);
      // стены комнаты по двум дальним краям: камень, книжные шкафы, факелы, знамёна
      const WL = [64, 64, 100, 64, 102, 64, 106, 64], WR = [65, 65, 101, 65, 103, 65, 107, 65];
      for (let i = 0, t = .5; t < N; t += 1.39, i++) {
        let p = iso(t, -.5), w = FLR.tileImage(this, 'd' + WR[i % WR.length], p.x, p.y, .5); if (w) w.setDepth(p.y + 25);
        p = iso(-.5, t); w = FLR.tileImage(this, 'd' + WL[i % WL.length], p.x, p.y, .5); if (w) w.setDepth(p.y + 25);
      }
      const trophies = Object.keys((save.stats || {}).bossKinds || {}).slice(0, 6);
      trophies.forEach((k, i) => { const p = iso(C - 1 + i * .9, C + 4.2), t = this.add.text(p.x, p.y - 30, '★', { fontFamily: FONT, fontSize: '20px', color: '#ffd36a', stroke: '#000', strokeThickness: 3 }).setOrigin(.5).setDepth(p.y); });
    }
    if (z.village) {
      if (!z.home) {
      place('torii', C, C + 4.3, .97);""")
rep("""      place('anvil', C - 3.0, C + 2.9, .85);
      for (const d of NPCS) {""", """      place('anvil', C - 3.0, C + 2.9, .85);
      }
      for (const d of NPCS) {""")
rep("      else if (z.deco === 'arena') {", "      else if (z.deco === 'none') {}\n      else if (z.deco === 'town') { if (dc > 7.5) { if (r < .05) put('pine', .95); else if (r < .07) put('sakura', .95); else if (r < .09) put('bush', .82); else if (r < .1) put('rock', .82); } }\n      else if (z.deco === 'arena') {")
# диалоги сундуков
rep("    } else if (n.id === 'trader') {\n      txt.textContent = 'Колобки свежие", """    } else if (n.id === 'chest') {
      txt.textContent = this.zone.home ? 'Ваш домашний сундук. Здесь вещи в безопасности.' : 'Личный сундук. Внутри те же вещи, что и в сундуке у вас дома.';
      storeSection(body, this, () => this.renderDlg()); acts.append(close);
    } else if (n.id === 'gchest') {
      txt.textContent = 'Общий сундук гильдии: что положите вы, смогут взять соратники, и наоборот.';
      guildChestSection(body, this); acts.append(close);
    } else if (n.id === 'board') {
      txt.textContent = 'Здесь можно расширить дом, посадить травы и посмотреть трофеи.';
      renderHomeTab(body, this); acts.append(close);
    } else if (n.id === 'trader') {
      txt.textContent = 'Колобки свежие""")
rep("function storeSection(body, G) {", "function storeSection(body, G, after) {")
rep("G.selItem = null; G.renderInv(); renderDiary(); }; gB.appendChild(c); });", "G.selItem = null; G.renderInv(); (after || renderDiary)(); }; gB.appendChild(c); });")
rep("G.give(x, true); persist(); G.renderInv(); renderDiary(); }; gS.appendChild(c); });", """G.give(x, true); persist(); G.renderInv(); (after || renderDiary)(); }; gS.appendChild(c); });""")
rep("/* ---------- raid «Бездна Левиафана» for a party of up to 4 ---------- */", """/* ---------- сундук гильдии: общий склад через сервер (сохранённое сообщение) ---------- */
const GCH_MAX = 30;
let GCHEST = { key: null, st: null, waiting: false };
const gchestKey = () => 'gst/' + encodeURIComponent(String(save.guild && save.guild.n || '').toLowerCase()).slice(0, 80);
function gchestSync(G) {
  if (!save.guild || !netOk()) return;
  const key = gchestKey(); if (GCHEST.key === key) return;
  if (GCHEST.key && ROOM.unlisten) ROOM.unlisten(NET_NS + GCHEST.key);
  GCHEST = { key, st: null, waiting: true };
  const redraw = () => { if (G && G.dlgNpc && G.dlgNpc.id === 'gchest') G.renderDlg(); };
  ROOM.listen(NET_NS + key, d => { if (d && Array.isArray(d.items) && (!GCHEST.st || (+d.v || 0) >= (+GCHEST.st.v || 0))) { GCHEST.st = d; GCHEST.waiting = false; redraw(); } }, NET_NS + key);
  setTimeout(() => { if (GCHEST.key === key && !GCHEST.st) { GCHEST.st = { v: 0, items: [], log: [] }; GCHEST.waiting = false; redraw(); } }, 4000);
}
function gchestPush(st, line) {
  st = { v: (+GCHEST.st.v || 0) + 1, t: Date.now(), items: st.items, log: [line, ...(GCHEST.st.log || [])].slice(0, 20) };
  GCHEST.st = st; netSend(GCHEST.key, st, true);
}
function guildChestSection(body, G) {
  if (!save.guild) { body.appendChild(mk('div', 'ds', 'Сундук открывается только членам гильдии. Вступить или основать гильдию можно во вкладке «Мир» → «Гильдия».')); return; }
  if (!netOk()) { body.appendChild(mk('div', 'ds', 'Нет связи с игровым сервером — сундук гильдии сейчас недоступен.')); return; }
  gchestSync(G);
  if (!GCHEST.st) { body.appendChild(mk('div', 'ds', 'Открываем сундук…')); return; }
  const st = GCHEST.st, who = cleanText(save.name || 'Игрок');
  body.appendChild(mk('div', 'label', 'Сундук гильдии «' + save.guild.n + '» · ' + st.items.length + ' / ' + GCH_MAX));
  body.appendChild(mk('div', 'ds', 'Нажмите на вещь в сумке, чтобы положить её в сундук, и на вещь в сундуке, чтобы забрать.'));
  const wrap = mk('div', 'storewrap'), colB = mk('div', 'storecol'), colS = mk('div', 'storecol');
  colB.appendChild(mk('div', 'ss', 'Сумка · ' + save.inv.length + ' / ' + BAG)); colS.appendChild(mk('div', 'ss', 'Сундук гильдии'));
  const gB = mk('div', 'storegrid'), gS = mk('div', 'storegrid');
  save.inv.forEach((it, i) => { const c = cellFor(it, ''); c.title = itemName(it) + ' → в сундук гильдии'; c.onclick = () => {
    if (st.items.length >= GCH_MAX) { log('Сундук гильдии полон.', 'bad'); return; }
    const x = save.inv.splice(i, 1)[0]; gchestPush({ items: [...st.items, x] }, who + ' положил: ' + itemName(x)); persist(); G.selItem = null; G.renderInv(); G.renderDlg(); }; gB.appendChild(c); });
  st.items.forEach((it, i) => { const c = cellFor(it, ''); c.title = itemName(it) + ' → в сумку'; c.onclick = () => {
    if (save.inv.length >= BAG && !(it.kind && G.stack(it.kind))) { log('Сумка полна.', 'bad'); return; }
    const items = st.items.slice(), x = items.splice(i, 1)[0]; x.uid = uid(); gchestPush({ items }, who + ' взял: ' + itemName(x)); G.give(x, true); persist(); G.renderInv(); G.renderDlg(); }; gS.appendChild(c); });
  if (!st.items.length) gS.appendChild(mk('div', 'ds', 'Пусто.'));
  colB.appendChild(gB); colS.appendChild(gS); wrap.append(colB, colS); body.appendChild(wrap);
  if ((st.log || []).length) { body.appendChild(mk('div', 'label', 'Последние действия')); for (const l of st.log.slice(0, 6)) body.appendChild(mk('div', 'ds', cleanText(l))); }
}

/* ---------- raid «Бездна Левиафана» for a party of up to 4 ---------- */""")

rep("function holidayDecor(S) {\n  const id = holidayNow(); if (!id || S.zone.dungeon || S.zone.arena) return;", "function holidayDecor(S) {\n  const id = holidayNow(); if (!id || S.zone.dungeon || S.zone.arena || S.zone.home) return;")
rep("  if (!z || z.dungeon || z.arena) return 'clear';", "  if (!z || z.dungeon || z.arena || z.home) return 'clear';")
rep("if (S.zone.village) banner('Вторжение!'", "if (S.zone.town) banner('Вторжение!'")
rep("  if (st.phase !== 'live' || !S.zone.village || !S.hero || !invHost(S)) return;", "  if (st.phase !== 'live' || !S.zone.town || !S.hero || !invHost(S)) return;")
# --- питомцы, маунты, крылья, портреты ---
rep("    this.pet.label = this.add.text(0, 0, '', { fontFamily: FONT, fontSize: '11px', color: PETS[id].col", "    FLR.attachPet(this, this.pet);\n    this.pet.label = this.add.text(0, 0, '', { fontFamily: FONT, fontSize: '11px', color: PETS[id].col")
rep(" u.badge = remoteBadge(S, u, p); u.pet = remotePet(S, u, p);", " u.badge = remoteBadge(S, u, p); u.pet = remotePet(S, u, p); if (u.pet) FLR.attachPet(S, u.pet);")
rep("    const w = this.wingLook(), ws = S * WING_WORLD * .7, shY = fy + (bodyShoulder() - HERO_FY) * k;", "    const w = FLR.ready(h) ? null : this.wingLook(), ws = S * WING_WORLD * .7, shY = fy + (bodyShoulder() - HERO_FY) * k;")
rep("    if (mt) mDraw('back');", "    if (mt && !FLR.ready(h)) mDraw('back');")
rep("    if (mt) mDraw('front');\n    const wlk = flDrawn ? null : this.weaponLook();", "    if (mt && !FLR.ready(h)) mDraw('front');\n    const wlk = flDrawn ? null : this.weaponLook();")
rep("function portraitInto(cv, f) {\n  const G = GAME, x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height);", """function portraitInto(cv, f) {
  const G = GAME, x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height);
  try { const L = f.look || {}; if (FLR.portraitTo(G, cv, f.me ? G.hero : FLR.heroSpec({ cls: CLASSES[f.c] ? f.c : 'warrior', r: L.r == null ? 2 : +L.r, costume: L.co || null, weapon: L.w || (CLASSES[f.c] || CLASSES.warrior).starter, fem: !!L.fm }))) return; } catch (e) {}""")
# иероглифы → символы (вне кода движка)
KANJI = {'剣':'⚔','刀':'⚔','刃':'⚔','斬':'⚔','武':'⚔','闘':'⚔','術':'✧','技':'✧','弓':'➶','射':'➶','忍':'☾','月':'☾','影':'☾','旗':'⚑','盟':'⚑','冠':'♛','金':'◉','錢':'◉','市':'◉','宝':'◆','寶':'◆','秘':'◆','翼':'❦','羽':'❦','飯':'✚','癒':'✚','茶':'✚','巻':'✎','名':'✎','言':'✎','獄':'☠','鉱':'◇','皮':'▣','衣':'▣','魂':'✺','星':'★','隕':'★','日':'☀','自':'⟳','袋':'▤','運':'✦','祭':'✷','塔':'♜','頭':'☗','社':'❂','鍛':'⚒','輪':'◎','火':'✹','焔':'✹','氷':'❄','雪':'❄','雷':'⚡','風':'≋','雲':'☁','山':'▲','岩':'▲','崩':'▲','盾':'⛊','龍':'✷','淵':'◎'}
import re as _re
gi = s.index('<script>', s.index('</script>', s.index('Phaser v')) if 'Phaser v' in s else 0)
head, tail = s[:gi], s[gi:]
cnt = len(_re.findall(r'[\u3040-\u30ff\u4e00-\u9fff]', s))
head = _re.sub(r'[\u3040-\u30ff\u4e00-\u9fff]', lambda m: KANJI.get(m.group(0), '✦'), head[:head.index('<script')] ) + head[head.index('<script'):]
tail = _re.sub(r'[\u3040-\u30ff\u4e00-\u9fff]', lambda m: KANJI.get(m.group(0), '✦'), tail)
s = head + tail
print('иероглифов было', cnt, 'осталось', len(_re.findall(r'[\u3040-\u30ff\u4e00-\u9fff]', s)))
_l = [l for l in s.split('\n') if l.startswith('    for (let i = 0; i < 4; i++) { const w = 46 - i * 9,')][0]
rep(_l + "\n    ctx.fillRect(px - 1.5, py - 128, 3, 26);", """    // замок на холме вместо пагоды
    ctx.fillRect(px - 40, py - 66, 80, 66); ctx.fillRect(px - 56, py - 104, 20, 104); ctx.fillRect(px + 36, py - 96, 20, 96); ctx.fillRect(px - 10, py - 120, 20, 54);
    for (let k = 0; k < 4; k++) ctx.fillRect(px - 40 + k * 22, py - 76, 12, 10);
    for (const [tx, ty, tw] of [[px - 46, py - 104, 14], [px + 46, py - 96, 14], [px, py - 120, 14]]) { ctx.beginPath(); ctx.moveTo(tx - tw, ty); ctx.lineTo(tx, ty - 26); ctx.lineTo(tx + tw, ty); ctx.closePath(); ctx.fill(); }""")
# --- 4. союзники, колесо удачи, праздничные тыквы — в стиле Flare ---
rep("""      a.bar = this.add.graphics().setDepth(190000);
      this.drawBar(a);
      this.allies.push(a);""", """      a.bar = this.add.graphics().setDepth(190000);
      this.drawBar(a);
      try { FLR.attachHero(this, a, FLR.heroSpec(({ tank: { cls: 'warrior', r: 3, weapon: 'kanabo' }, heal: { cls: 'mage', r: 2, fem: true, weapon: 'bo' }, arch: { cls: 'archer', r: 2, fem: true, weapon: 'stormbow' } })[role])); } catch (e) {}
      this.allies.push(a);""")
rep("""    x.fillStyle = rare ? '#ffd36a' : '#ebe5d5';
    x.font = '24px serif'; x.fillText(WHEEL[i].glyph, R - 10, 8);""", """    x.fillStyle = rare ? '#ffd36a' : '#ebe5d5';
    const wi = wheelIcon(i); if (wi) x.drawImage(wi, R - 40, -15, 30, 30); else { x.font = '24px serif'; x.fillText(WHEEL[i].glyph, R - 10, 8); }""")
rep("function drawWheel() {", """const WHEEL_IC = [88, 20, 64, 161, 224, 216, 88, 98], WHEEL_IM = [];
function wheelIcon(i) { if (!WHEEL_IM[i] && typeof FST !== 'undefined') { const im = new Image(); im.src = FST.icon(WHEEL_IC[i]); WHEEL_IM[i] = im; } const im = WHEEL_IM[i]; return im && im.complete && im.naturalWidth ? im : null; }
function drawWheel() {""")
rep("x.beginPath(); x.arc(0, 0, R + 10, 0, Math.PI * 2); x.fillStyle = '#3a2a14'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#e0b04f'; x.stroke();",
    "x.beginPath(); x.arc(0, 0, R + 10, 0, Math.PI * 2); { const wg = x.createRadialGradient(0, 0, R - 4, 0, 0, R + 10); wg.addColorStop(0, '#5a3a1e'); wg.addColorStop(.5, '#7a5230'); wg.addColorStop(1, '#3a2412'); x.fillStyle = wg; } x.fill(); x.lineWidth = 3; x.strokeStyle = '#8a8f98'; x.stroke();")
_pl = [l for l in s.split('\n') if l.startswith("    if (!S.textures.exists(key)) S.canvasTex(key, 32, 32, c => { const g = c.createRadialGradient(14, 14, 2, 16, 18, 14);")][0]
rep(_pl, """    if (!S.textures.exists(key)) S.textures.addCanvas(key, (() => { // тыква с вырезанным лицом, нарисованная в духе Flare
      const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(32, 58, 24, 5, 0, 0, 6.29); c.fill();
      for (const [ox, w] of [[-14, 12], [14, 12], [-7, 13], [7, 13], [0, 13]]) { const g = c.createRadialGradient(32 + ox - 3, 30, 2, 32 + ox, 38, 22); g.addColorStop(0, '#ffb24a'); g.addColorStop(.6, '#d0661a'); g.addColorStop(1, '#6a2a08'); c.fillStyle = g; c.beginPath(); c.ellipse(32 + ox, 39, w, 17, 0, 0, 6.29); c.fill(); c.strokeStyle = 'rgba(60,20,4,.55)'; c.lineWidth = 1.2; c.stroke(); }
      c.fillStyle = '#4a5a22'; c.beginPath(); c.moveTo(29, 24); c.quadraticCurveTo(30, 14, 37, 11); c.lineTo(38, 14); c.quadraticCurveTo(34, 17, 34, 24); c.closePath(); c.fill();
      c.fillStyle = '#ffe27a'; c.shadowColor = '#ffb030'; c.shadowBlur = 6;
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(32 + sx * 5, 36); c.lineTo(32 + sx * 13, 36); c.lineTo(32 + sx * 9, 29); c.closePath(); c.fill(); }
      c.beginPath(); c.moveTo(19, 42); c.quadraticCurveTo(32, 54, 45, 42); c.lineTo(40, 44); c.lineTo(37, 41); c.lineTo(32, 45); c.lineTo(27, 41); c.lineTo(24, 44); c.closePath(); c.fill();
      return cv; })());""")
rep("S.add.image(p.x, p.y, key).setOrigin(.5, .9).setScale(WK * .8)", "S.add.image(p.x, p.y, key).setOrigin(.5, .9).setScale(WK * .42)")
rep("    const place = (key, x, y, oy) => { const p = iso(x, y); return putDeco(key, p, oy); };", "    const place = (key, x, y, oy) => { if (z.town) { x = C + (x - C) * TOWN_K; y = C + (y - C) * TOWN_K; } const p = iso(x, y); return putDeco(key, p, oy); };")
rep("      place('lantern', x, y, .95);\n      const p = iso(x, y);", "      place('lantern', x, y, .95);\n      const p = z.town ? iso(C + (x - C) * TOWN_K, C + (y - C) * TOWN_K) : iso(x, y);")
rep("    if (z.village) { if (dc < 3.6 || Math.abs(cx - C) < 1.01", "    if (z.village) { if (dc < 3.6 * (z.town ? TOWN_K : 1) || Math.abs(cx - C) < 1.01")
rep("      if (z.village ? dc < 5 : Math.hypot(cx - C, cy - C) < 3) continue;", "      if (z.village ? dc < 5 * (z.town ? TOWN_K : 1) : Math.hypot(cx - C, cy - C) < 3) continue;")
rep("    if (this.zone.village && Math.max(Math.abs(x - C), Math.abs(y - C)) < 4.2) return true;", "    if (this.zone.village && Math.max(Math.abs(x - C), Math.abs(y - C)) < 4.2 * (this.zone.town ? TOWN_K : 1)) return true;")
# --- 5. новые крылья и наряды (красивые, с плащами) ---
rep("WINGS.triumph = { name: 'Крылья Триумфа',", """Object.assign(WINGS, {
  aurora: { name: 'Крылья северного сияния', r: 2, price: 9500, pal: [0x30d0c0, 0x7a5aff, 0xe8fff8, 0x081028], fx: 'moon', style: 'butterfly', eye: 0x9affee, frame: 0xb8f0ff, gem: 0x6affe0, aura: 0x06204a },
  monarch: { name: 'Крылья королевской бабочки', r: 1, price: 4200, pal: [0xffb030, 0xe0601a, 0xffffff, 0x120a06], fx: 'sakura', style: 'butterfly', frame: 0xe0b04f, gem: 0xff8a2a, aura: 0x3a1804 },
  fairy: { name: 'Крылья лесной феи', r: 1, price: 3800, pal: [0xc8ffd8, 0x8ad8ff, 0xffffff, 0x2a5a6a], fx: 'jade', style: 'butterfly', eye: 0xffd0f0, frame: 0xd8f0e0, gem: 0x8affc0, aura: 0x06302a },
  phoenixlord: { name: 'Крылья Огненного феникса', r: 2, price: 12000, pal: [0xc0200a, 0xff7a1a, 0xfff0a0, 0x5a0a04], tip: 0xffe060, tipGlow: 0xff9a2a, energy: true, fx: 'flame', frame: 0xe0b04f, gem: 0xff4a1a, aura: 0x5a1000 },
  starnight: { name: 'Крылья звёздной ночи', r: 2, price: 10500, pal: [0x0a0c2a, 0x2a2e78, 0xc8d4ff, 0x04040e], stars: 0xe8f0ff, fx: 'void', frame: 0xb8c8e8, gem: 0x8ab0ff, aura: 0x04082a },
  eagle: { name: 'Крылья горного орла', r: 1, price: 3500, pal: [0x4a2e18, 0xc89a6a, 0xfff4e0, 0x1a0e06], bands: 0x2a1608, fx: 'jade', frame: 0xc8a070, gem: 0xffb040, aura: 0x2a1406 },
  archangel: { name: 'Крылья архангела', r: 2, price: 14000, pal: [0xf4efe4, 0xffffff, 0xffe8a0, 0xb08a3a], tip: 0xffd870, tipGlow: 0xfff0b0, fx: 'moon', frame: 0xe8b84a, gem: 0x6ab8ff, aura: 0x1a1a5a }
});
Object.assign(COSTUMES, {
  royalknight: { name: 'Латы королевского рыцаря', r: 2, price: 5000 },
  archmage: { name: 'Мантия архимага', r: 2, price: 5500 },
  elvenranger: { name: 'Наряд эльфийского следопыта', r: 1, price: 2400 },
  nightblade: { name: 'Облачение Ночного клинка', r: 2, price: 4800 },
  dragonlord: { name: 'Доспех Повелителя драконов', r: 2, price: 9000 },
  highpriestess: { name: 'Одеяние Верховной жрицы', r: 2, price: 6000 }
});
Object.assign(OUTFITS, {
  royalknight: { coat: 0xb8c0d0, inner: 0x1c3a8e, plates: true, sash: 0x1c3a8e, trim: 0xf0c050, cape: 0x1c3a8e },
  archmage: { coat: 0x3c1a7a, inner: 0x1a0a3a, pat: 'gold', patc: 0xe8c060, sash: 0xe8c060, trim: 0xe8c060, cape: 0x2a1060, glow: 0xb080ff },
  elvenranger: { coat: 0x2e6a3a, inner: 0x5e4630, sash: 0xd8c070, trim: 0xd8c070, cape: 0x24502c },
  nightblade: { coat: 0x16141c, inner: 0x0a080e, sash: 0xc01828, trim: 0xc01828, acc: 'ninja', cape: 0x0e0c12, glow: 0xff3040 },
  dragonlord: { coat: 0x26222e, inner: 0x6a0a08, plates: true, sash: 0x6a0a08, trim: 0xffb040, cape: 0x6a0a08, glow: 0xff7020, acc: 'kabuto' },
  highpriestess: { coat: 0xf4eee2, inner: 0xe8d8b0, pat: 'gold', patc: 0xd8a838, sash: 0xd8a838, trim: 0xd8a838, cape: 0xf4eee2, glow: 0xfff0b0 }
});
WINGS.triumph = { name: 'Крылья Триумфа',""")
_sl = [l for l in s.split('\n') if l.startswith("const SHOP_LOOKS = {")][0]
rep(_sl, _sl + "\nSHOP_LOOKS.costume.push('royalknight', 'archmage', 'elvenranger', 'nightblade', 'dragonlord', 'highpriestess'); SHOP_LOOKS.wings.push('aurora', 'monarch', 'fairy', 'phoenixlord', 'starnight', 'eagle', 'archangel');")
# старые перья-частицы от прежних крыльев не нужны: крылья рисует Flare
rep("      if (!WD.style && t > (this.orbT || 0)) {", "      if (!WD.style && !FLR.ready(h) && t > (this.orbT || 0)) {")
rep("        if (Math.random() < .6 && !WINGS[h.wingId].style) {", "        if (Math.random() < .6 && !WINGS[h.wingId].style && !FLR.ready(h)) {")
# --- 3. тестовая версия: своё сохранение, облако только на чтение ---
rep("const SAVE_KEY = 'oblachny-klinok-v2';", """const SAVE_KEY = 'oblachny-klinok-next';
try { if (!localStorage.getItem(SAVE_KEY) && localStorage.getItem('oblachny-klinok-v2')) localStorage.setItem(SAVE_KEY, localStorage.getItem('oblachny-klinok-v2')); } catch (e) {}""")
rep("async function cloudUpload(manual) {", "async function cloudUpload(manual) {\n  if (manual) log('Это тестовая версия: прогресс здесь не отправляется в облако и не трогает основную игру.', 'info');\n  return;")
rep("const GAME_VER = '55'", "const GAME_VER = '56'")
rep("<title>Облачный клинок</title>", "<title>Облачный клинок — тест графики Flare</title>")
import sys as _sys; _sys.path.insert(0, '/home/claude/work'); import rename as _rn
_i = s.index('<script>', s.index('</script>', s.index('Phaser v')))
s = _rn.apply(s[:s.index('<script')]) + s[s.index('<script'):_i] + _rn.apply(s[_i:])
left = [w for w in ['Кумо', 'Гэнсай', 'Оцуру', 'Тэцу', 'каппа', 'тэнгу', 'ронин', 'кицунэ', 'самура', 'катан', 'Катан', 'колоб', 'Хаори', 'Кимоно', 'цилин'] if w in s[_i:]]
print('остались японские слова:', left)
open(DST, 'w', encoding='utf-8').write(s)
print('ok', len(s))
