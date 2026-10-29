// Checks the game's own MQTT client (extracted from index.html) against every server,
// then listens for players online and for their connection diagnostics.
import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const a = html.indexOf('const MQ_TE'), b = html.indexOf('async function mqttRoom');
const NS = (html.match(/const NET_NS = '([^']+)'/) || [])[1];
const servers = [...html.slice(html.indexOf('const NET_SERVERS'), a).matchAll(/'(wss?:\/\/[^']+)'/g)].map(m => m[1]);
const lib = new Function(html.slice(a, b) + '\nreturn { mqConnect };')();
const out = ['# Проверка связи', '', 'Время: ' + new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' }) + ' (Екб)', '', '## Серверы (с серверов GitHub, не из России)', ''];
const wait = ms => new Promise(r => setTimeout(r, ms));
const peers = {}, diag = {};
const listeners = [];
for (const url of servers) {
  const t0 = Date.now();
  const A = await lib.mqConnect(url, 'chkA' + Date.now(), null, 15000);
  const B = A && await lib.mqConnect(url, 'chkB' + Date.now(), null, 15000);
  const tc = Date.now() - t0;
  if (!A || !B) { out.push(`- ${url} — **не подключается**`); continue; }
  let got = false; const topic = NS + 'check/' + Date.now();
  A.onmsg = t => { if (t === topic) got = true; }; A.sub(topic); await wait(1500); B.pub(topic, 'ping'); await wait(3000);
  out.push(`- ${url} — подключение двух клиентов ${tc} мс, пересылка сообщений: ${got ? 'работает' : '**не работает**'}`);
  B.close();
  A.onmsg = (t, body) => {
    try {
      const d = JSON.parse(body);
      if (t.startsWith(NS + 'p/') && d && d.pr) { const q = d.pr.ok || d.pr; (peers[t.slice(NS.length + 2)] ||= { n: q.n, lv: q.lv, z: q.z, via: new Set() }).via.add(url.replace(/^wss:\/\//, '').replace(/[:/].*/, '')); }
      if (t.startsWith(NS + 'diag/') && d) diag[d.pid] = d;
    } catch (e) {}
  };
  A.sub(NS + 'p/+'); A.sub(NS + 'diag/+'); listeners.push(A);
}
await wait(60000);
out.push('', '## Игроки в сети за последнюю минуту', '');
const pl = Object.entries(peers);
out.push(pl.length ? pl.map(([id, p]) => `- ${p.n} (ур. ${p.lv}, зона ${p.z}) — виден через: ${[...p.via].join(', ')}`).join('\n') : 'Никого.');
out.push('', '## Отчёты игроков о связи (последний вход каждого)', '');
const dl = Object.values(diag).sort((x, y) => y.t - x.t).slice(0, 40);
out.push(dl.length ? dl.map(d => `- ${d.n} · версия ${d.v} · ${new Date(d.t).toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' })} — на связи: ${(d.ok || []).join(', ') || 'нет'}; не удалось: ${Object.keys(d.fail || {}).join(', ') || 'нет'}; видит игроков: ${d.peers ?? '?'}; зависаний: ${d.stall ?? '?'}, замен: ${d.rot ?? '?'}, получено чужих сигналов: ${d.rx ?? '?'} · ${String(d.ua || '').slice(0, 90)}`).join('\n') : 'Пока нет.');
for (const c of listeners) c.close();
fs.writeFileSync('netcheck.md', out.join('\n') + '\n');
console.log(out.join('\n'));
process.exit(0);
