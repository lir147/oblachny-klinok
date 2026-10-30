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
rep("\nnew Phaser.Game({\n  type: Phaser.AUTO, parent: 'game', transparent: true,", "\n" + rig + "\nFLR.whenTiles(() => new Phaser.Game({\n  type: Phaser.AUTO, parent: 'game', transparent: true,")
rep("  scene: World\n});\n})();", "  scene: World\n}));\n})();")
rep("  create(data) {\n    GAME = this;", "  create(data) {\n    GAME = this;\n    FLR.init(this);")
# герой: собираем слои по надетому снаряжению
rep("""    const base = this.currentLook();
    h.tex = {};""", """    const base = this.currentLook();
    try {
      const co = this.lookOn('costume'), hd = this.lookOn('head'), wl0 = this.weaponLook(), ofit = co && OUTFITS[co.base];
      FLR.attachHero(this, h, FLR.heroSpec({ cls: save.cls || 'warrior', r: save.eq.armor ? save.eq.armor.rarity : 0, costume: co ? co.base : null, head: hd ? hd.base : null,
        weapon: wl0 ? wl0.base : (CLASSES[save.cls || 'warrior'] || CLASSES.warrior).starter, fem: !!save.fem, outfit: ofit ? (Array.isArray(ofit) ? ofit[0] : ofit).coat : null }));
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
  try { const of2 = L.co && OUTFITS[L.co]; FLR.attachHero(S, u, FLR.heroSpec({ cls: CLASSES[p.c] ? p.c : 'warrior', r: +L.r || 0, costume: L.co || null, head: L.hd || null, weapon: wb, fem: !!L.fm, outfit: of2 ? (Array.isArray(of2) ? of2[0] : of2).coat : null })); } catch (e) {}""")
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
rep("""    if (mt && mfly !== 'stand') ctx.drawImage(src(h.tex ? h.tex.idle : h.spr.texture.key)""", """    const flDrawn = FLR.drawPanel(this, ctx, h, cx, fy, k / HERO_K, t, mt && mfly !== 'stand');
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
NPCS.forEach(d => { d.dx = d.x - C; d.dy = d.y - C; });""")
rep("""      for (const d of NPCS) {
        const n = Object.assign({}, d, { lungeT: -9, off: Math.random() * 6 });""", """      for (const d of NPCS) {
        if ((d.zone || 'town') !== this.zoneId) continue;
        const n = Object.assign({}, d, { x: C + d.dx, y: C + d.dy, lungeT: -9, off: Math.random() * 6 });""")
rep("""        n.spr = this.add.image(0, 0, 'npc2' + d.key.slice(3)).setOrigin(.5, HERO_FY / HERO_H).setScale(HERO_K / 2).setFlipX(d.x > C);""",
    """        n.spr = (d.obj && FLR.decoImage(this, d.obj, z.tiles, 0, 0)) || this.add.image(0, 0, 'npc2' + (d.obj ? '_master' : d.key.slice(3))).setOrigin(.5, HERO_FY / HERO_H).setScale(HERO_K / 2).setFlipX(n.x > C);
        if (d.obj) n.shadow.setVisible(false);""")
rep("    for (const n of this.npcs) this.placeUnit(n, Math.sin(this.now * 1.6 + n.off) * .8);", "    for (const n of this.npcs) this.placeUnit(n, n.obj ? 0 : Math.sin(this.now * 1.6 + n.off) * .8);")
# убранство: в доме — мебель вместо деревенских построек
rep("""    if (z.village) {
      place('torii', C, C + 4.3, .97);""", """    if (z.home) {
      for (const [k, x, y] of [['bed', C - 3.4, C + .2], ['table', C + 2.6, C + 1.2], ['books', C - 3.6, C - 3.6], ['books', C - 1.4, C - 4.4], ['throne', C + .2, C - 3.8], ['barrel', C + 3.8, C - 1.2], ['crate', C + 3.6, C - .2], ['statue', C - 3.8, C + 3.2]]) place(k, x, y, .9);
      for (const [x, y] of [[C - 2.4, C - 2.4], [C + 2.4, C - 2.4], [C + 2.4, C + 2.4], [C - 2.4, C + 2.4]]) lantern(x, y);
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
# --- 3. тестовая версия: своё сохранение, облако только на чтение ---
rep("const SAVE_KEY = 'oblachny-klinok-v2';", """const SAVE_KEY = 'oblachny-klinok-next';
try { if (!localStorage.getItem(SAVE_KEY) && localStorage.getItem('oblachny-klinok-v2')) localStorage.setItem(SAVE_KEY, localStorage.getItem('oblachny-klinok-v2')); } catch (e) {}""")
rep("async function cloudUpload(manual) {", "async function cloudUpload(manual) {\n  if (manual) log('Это тестовая версия: прогресс здесь не отправляется в облако и не трогает основную игру.', 'info');\n  return;")
rep("const GAME_VER = '55'", "const GAME_VER = '56'")
rep("<title>Облачный клинок</title>", "<title>Облачный клинок — тест графики Flare</title>")
open(DST, 'w', encoding='utf-8').write(s)
print('ok', len(s))
