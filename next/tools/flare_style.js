/* ========== Интерфейс в стиле Flare: иконки предметов, навыков и кнопок ========== */
const FST = (() => {
  let IMG = null;
  const ready = new Promise(res => { const im = new Image(); im.onload = () => { IMG = im; res(); }; im.onerror = () => res(); im.src = 'flare/icons.webp'; setTimeout(res, 6000); });
  const cache = {};
  const hx = c => '#' + (c >>> 0 & 0xffffff).toString(16).padStart(6, '0');
  function draw(idx, opt) { // opt: { bg: [c0,c1], tint: 0xRRGGBB }
    const key = idx + '|' + JSON.stringify(opt || {}); if (cache[key]) return cache[key];
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d');
    if (opt && opt.bg) { const g = x.createRadialGradient(32, 28, 4, 32, 32, 46); g.addColorStop(0, opt.bg[0]); g.addColorStop(1, opt.bg[1]); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
    if (IMG) {
      const sx = (idx % 8) * 64, sy = Math.floor(idx / 8) * 64;
      if (opt && opt.tint) {
        const t = document.createElement('canvas'); t.width = t.height = 64; const tx = t.getContext('2d');
        tx.drawImage(IMG, sx, sy, 64, 64, 0, 0, 64, 64); tx.globalCompositeOperation = 'multiply'; tx.fillStyle = hx(opt.tint); tx.fillRect(0, 0, 64, 64);
        tx.globalCompositeOperation = 'destination-in'; tx.drawImage(IMG, sx, sy, 64, 64, 0, 0, 64, 64);
        x.drawImage(t, 0, 0);
      } else x.drawImage(IMG, sx, sy, 64, 64, 0, 0, 64, 64);
    }
    return (cache[key] = cv.toDataURL());
  }
  const lighten = (c, k) => { const r = c >> 16 & 255, g = c >> 8 & 255, b = c & 255; return (Math.round(r + (255 - r) * k) << 16) | (Math.round(g + (255 - g) * k) << 8) | Math.round(b + (255 - b) * k); };
  const hash = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
  const WICON = { dagger: 96, shortsword: 97, longsword: 98, greatsword: 99, zweihander: 100, smith_hammer: 101, war_hammer: 102, maul: 103, staff: 104, rod: 105, greatstaff: 106, wand: 107, club: 109, reinforced_club: 110, mace: 111, slingshot: 112, shortbow: 113, longbow: 114, greatbow: 115, hand_axe: 117, battle_axe: 118, infantry_axe: 119 };
  function itemIcon(it) {
    const b = it.base, s = it.slot, r = Math.max(0, Math.min(4, it.rarity || 0));
    if (b === 'rice') return 64; if (b === 'scroll') return 224;
    if (typeof GEM_REF === 'function' && GEM_REF(it)) return [68, 69, 70, 71][hash(b) % 4];
    if (typeof LIFE !== 'undefined' && LIFE[b]) return [80, 81, 82, 83, 84, 86][hash(b) % 6];
    if (s === 'pet' || s === 'mount' || (typeof MOUNTS !== 'undefined' && MOUNTS[b] && s !== 'wings')) return [216, 217, 218, 219][hash(b) % 4];
    if (s === 'wings' || s === 'wingskin' || (typeof WINGS !== 'undefined' && WINGS[b])) return 20;
    if (s === 'weapon' || s === 'wskin' || (typeof WEAPON_CLASS !== 'undefined' && WEAPON_CLASS[b])) return WICON[FLR.WEAP[b]] || 98;
    if (s === 'armor') return b === 'legarmor' ? 161 : [129, 145, 153, 161, 161][r];
    if (s === 'head') return [136, 144, 152, 160, 160][r];
    if (s === 'costume') return [137, 185, 193, 161, 161][r];
    if (s === 'charm') return b === 'beads' ? 208 : [212, 213, 214, 215, 215][r];
    if (s === 'ring' || s === 'ring2') return [198, 199, 200, 201, 207][r];
    if (s === 'earring') return [204, 205, 206, 203, 207][r];
    if (/^ev_/.test(b) || it.kind && /^ev_/.test(it.kind)) return 88;
    if (it.kind === 'key' || /key/.test(b)) return 226;
    return -1;
  }
  const SKICON = { whirl: 21, tea: 11, skyslash: 5, quake: 31, stance: 4, roar: 39, thousand: 40, windstep: 9, shadow: 41, storm: 45, hundred: 39, shield: 4, mountfall: 14, clone: 29, moonslash: 46,
    fireball: 34, heal: 11, frostnova: 24, firerain: 18, blizzard: 24, meteor: 37, powershot: 16, multishot: 8, poisonarrow: 27, arrowrain: 35, phoenixarrow: 34, dragonfang: 32, blackhole: 26, starfall: 20, deathlotus: 41 };
  const UTIL = { hero: 29, wheel: 88, bag: 30, rice: 64, target: 16, auto: 13 };
  const BTN = { skHero: 29, skWheel: 88, skTop: 69, skFb: 225, skWorld: 15, skForge: 101, skBook: 28, skDiary: 224, skMarket: 88, skBag: 30, skRice: 64, sk0: 16, skAuto: 13, skGuild: 44, skTower: 12, skArena: 1, skEvents: 20, skMail: 225 };
  function apply() {
    const _iconURL = iconURL;
    iconURL = function (it) { try { const i = itemIcon(it); if (i >= 0 && IMG) return draw(i, { bg: RBG[Math.max(0, Math.min(4, it.rarity || 0))] }); } catch (e) {} return _iconURL(it); };
    const _skill = skillIcon;
    skillIcon = function (id) { const i = SKICON[id]; if (i == null || !IMG) return _skill(id); return draw(i, { tint: lighten(SKILL_COL[id] || 0x9ab0d0, .35) }); };
    const _util = utilIcon;
    utilIcon = function (kind) { const i = UTIL[kind]; return i != null && IMG ? draw(i) : _util(kind); };
    if (typeof petIconURL === 'function') petIconURL = it => draw([216, 217, 218, 219][hash(it.base) % 4], { bg: RBG[Math.max(0, Math.min(4, it.rarity || 0))] });
    if (typeof petIcon === 'function') petIcon = () => draw(216, { bg: RBG[3] });
    for (const k in SKILLS) SKILLS[k].glyph = '✦';
    if (typeof petCanvas === 'function') { const _pc = petCanvas; petCanvas = (id, f) => { const S = GAME, pf = S && FLR.petFrame(S, id); if (!pf || !pf.f) return _pc(id, f);
      const cv = document.createElement('canvas'); cv.width = 156; cv.height = 132; const c = cv.getContext('2d'), fr = pf.f, k = Math.min(140 / fr.cutWidth, 120 / fr.cutHeight);
      c.drawImage(fr.source.image, fr.cutX, fr.cutY, fr.cutWidth, fr.cutHeight, 78 - fr.cutWidth * k / 2, 126 - fr.cutHeight * k, fr.cutWidth * k, fr.cutHeight * k); return cv; }; }
    for (const [id, i] of Object.entries(BTN)) { const el = document.getElementById(id); if (el && el.querySelector('.ic')) setIcon(el, draw(i)); }
    // кнопки, которые появляются позже: заменяем иероглифы на иконки
    const fix = root => { for (const ic of (root.querySelectorAll ? root.querySelectorAll('.skill .ic') : [])) { if (ic.classList.contains('img')) continue; const btn = ic.closest('.skill'); if (btn && BTN[btn.id] != null) setIcon(btn, draw(BTN[btn.id])); } };
    new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) fix(n.parentNode || n); }).observe(document.body, { childList: true, subtree: true });
    fix(document);
    try { if (save.cls) setupSkillButtons(); } catch (e) {}
  }
  ready.then(apply);
  return { ready, icon: draw };
})();
