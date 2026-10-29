import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const a = html.indexOf('const MQ_TE'), b = html.indexOf('async function mqttRoom');
const lib = new Function(html.slice(a, b) + '\nreturn { mqConnect };')();
const C = (process.env.PROBE || '').split(',').filter(Boolean);
const wait = ms => new Promise(r => setTimeout(r, ms));
const out = ['# Проба серверов на 443', ''];
for (const url of C) {
  const t0 = Date.now();
  const A = await lib.mqConnect(url, 'pa' + Date.now(), null, 12000), B = A && await lib.mqConnect(url, 'pb' + Date.now(), null, 12000);
  if (!A || !B) { out.push(`- ${url.replace(/\/\/[^@]*@/, '//')} — нет подключения`); continue; }
  let got = 0, big = 0; const topic = 'oblklinok/v2/probe/' + Date.now();
  A.onmsg = (t, body) => { if (t === topic) { got++; if (body.length > 2000) big++; } }; A.sub(topic); await wait(1500);
  for (let i = 0; i < 6; i++) { B.pub(topic, i % 2 ? 'x'.repeat(3000) : 'ping'); await wait(300); }
  await wait(3000);
  out.push(`- ${url.replace(/\/\/[^@]*@/, '//')} — подключение ${Date.now() - t0 - 6300} мс, получено ${got}/6 (крупных ${big}/3)`);
  const rt = 'oblklinok/v2/probe-ret/' + Date.now(); B.pub(rt, 'kept', true); await wait(1500);
  const C2 = await lib.mqConnect(url, 'pc' + Date.now(), null, 12000); let kept = false;
  if (C2) { C2.onmsg = t => { if (t === rt) kept = true; }; C2.sub(rt); await wait(3000); B.pub(rt, '', true); C2.close(); }
  out.push(`  - отложенные (retained) сообщения: ${kept ? 'хранятся' : 'НЕ хранятся'}`);
  A.close(); B.close();
}
fs.writeFileSync('probe.md', out.join('\n') + '\n'); console.log(out.join('\n')); process.exit(0);
