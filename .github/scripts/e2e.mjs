// Two real browsers open the published game file against the real public servers and report what each one sees.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const url = 'file://' + process.cwd() + '/index.html';
const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => fs.existsSync(p));
const b = await chromium.launch({ executablePath: exe, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const out = ['# Проверка двумя браузерами', '', 'Время: ' + new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' }), ''];
const pages = [];
for (const [k, cls] of [[0, 0], [1, 2]]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = await ctx.newPage();
  const log = [];
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') log.push(m.type() + ': ' + m.text().slice(0, 300)); });
  pg.on('pageerror', e => log.push('pageerror: ' + String(e).slice(0, 300)));
  pg.on('websocket', ws => { log.push('ws open ' + ws.url()); ws.on('close', () => log.push('ws close ' + ws.url())); ws.on('socketerror', e => log.push('ws error ' + ws.url() + ' ' + e)); let n = 0; ws.on('framesent', () => { n++; if (n === 1 || n === 5 || n === 20) log.push('ws sent ' + n + ' frames to ' + ws.url()); }); });
  await pg.goto(url); await pg.waitForTimeout(6000);
  await pg.evaluate(i => { const c = [...document.querySelectorAll('#classList .cls')][i]; if (c) { c.click(); c.click(); } }, cls);
  pages.push({ pg, log, k });
}
await pages[0].pg.waitForTimeout(40000);
for (const { pg, log, k } of pages) {
  await pg.evaluate(() => { const b = [...document.querySelectorAll('.skill')].find(e => e.textContent.includes('Мир')); if (b) b.click(); });
  await pg.waitForTimeout(1500);
  const sub = await pg.evaluate(() => document.getElementById('worldSub')?.textContent);
  const body = await pg.evaluate(() => document.getElementById('worldBody')?.innerText.slice(0, 600));
  const lg = await pg.evaluate(() => document.getElementById('log')?.innerText.slice(-600));
  await pg.screenshot({ path: 'e2e' + k + '.png' });
  out.push('## Браузер ' + (k + 1), '', '**Заголовок «Мир»:** ' + sub, '', '```', body, '```', '', '**Журнал игры:**', '```', lg, '```', '', '**Консоль и сеть:**', '```', ...log.slice(0, 60), '```', '');
}
fs.writeFileSync('e2e.md', out.join('\n'));
console.log(out.join('\n'));
await b.close();
