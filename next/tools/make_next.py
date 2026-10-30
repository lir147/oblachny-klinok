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
rep("\nnew Phaser.Game({", "\n" + rig + "\nnew Phaser.Game({")
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
# --- 3. тестовая версия: своё сохранение, облако только на чтение ---
rep("const SAVE_KEY = 'oblachny-klinok-v2';", """const SAVE_KEY = 'oblachny-klinok-next';
try { if (!localStorage.getItem(SAVE_KEY) && localStorage.getItem('oblachny-klinok-v2')) localStorage.setItem(SAVE_KEY, localStorage.getItem('oblachny-klinok-v2')); } catch (e) {}""")
rep("async function cloudUpload(manual) {", "async function cloudUpload(manual) {\n  if (manual) log('Это тестовая версия: прогресс здесь не отправляется в облако и не трогает основную игру.', 'info');\n  return;")
rep("const GAME_VER = '55'", "const GAME_VER = '56'")
rep("<title>Облачный клинок</title>", "<title>Облачный клинок — тест графики Flare</title>")
open(DST, 'w', encoding='utf-8').write(s)
print('ok', len(s))
