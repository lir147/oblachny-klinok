"""Collect player feedback that the game publishes (retained) on public MQTT brokers,
store it in reviews.json / reviews.md and open a GitHub issue for every new message."""
import json, os, socket, time, urllib.request
from datetime import datetime, timezone, timedelta

NS = 'oblklinok/v2/fb/'
BROKERS = [b.split(':') for b in os.environ.get('MQTT_BROKERS', 'public.cloud.shiftr.io:1883:public:public,broker.emqx.io:1883,broker.hivemq.com:1883').split(',') if b]
KINDS = {'bug': 'Ошибка', 'idea': 'Идея', 'review': 'Отзыв'}
CLASSES = {'warrior': 'Воин', 'mage': 'Маг', 'archer': 'Лучник'}
TZ = timezone(timedelta(hours=5))
MAX_ISSUES = 25


def s16(s):
    b = s.encode()
    return bytes([len(b) >> 8, len(b) & 255]) + b


def packet(head, body):
    n, ln = len(body), []
    while True:
        d, n = n % 128, n // 128
        ln.append(d | (128 if n else 0))
        if not n:
            break
    return bytes([head] + ln) + body


def collect(host, port, user=None, pw=None, secs=15):
    got = {}
    s = socket.create_connection((host, int(port)), timeout=10)
    flags = 2 | (0x80 if user else 0) | (0x40 if pw else 0)
    body = s16('MQTT') + bytes([4, flags, 0, 60]) + s16('okl-collector-%d' % int(time.time() * 1000))
    if user: body += s16(user)
    if pw: body += s16(pw)
    s.sendall(packet(0x10, body))
    buf, end, subscribed = b'', time.time() + secs, False
    s.settimeout(1)
    while time.time() < end:
        try:
            chunk = s.recv(65536)
            if not chunk:
                break
            buf += chunk
        except socket.timeout:
            pass
        while len(buf) >= 2:
            mul, ln, i = 1, 0, 1
            while True:
                if i >= len(buf):
                    break
                b = buf[i]; i += 1
                ln += (b & 127) * mul; mul *= 128
                if not b & 128:
                    break
            else:
                break
            if len(buf) < i + ln:
                break
            typ, flags, p = buf[0] >> 4, buf[0] & 15, buf[i:i + ln]
            buf = buf[i + ln:]
            if typ == 2 and not subscribed:
                if p[1] != 0:
                    raise RuntimeError('connack %d' % p[1])
                s.sendall(packet(0x82, bytes([0, 1]) + s16(NS + '+') + bytes([0])))
                subscribed = True
            elif typ == 3:
                tl = (p[0] << 8) | p[1]
                topic = p[2:2 + tl].decode('utf-8', 'replace')
                body = p[2 + tl + (2 if (flags >> 1) & 3 else 0):]
                try:
                    d = json.loads(body.decode('utf-8'))
                except Exception:
                    continue
                if isinstance(d, dict) and d.get('k') == topic[len(NS):] and isinstance(d.get('s'), str):
                    got[d['k']] = d
    try:
        s.sendall(bytes([0xe0, 0])); s.close()
    except Exception:
        pass
    return got


def clean(x, n):
    return ''.join(ch for ch in str(x or '') if ch >= ' ' or ch == '\n')[:n].strip()


def norm(d):
    kind = d.get('kind') if d.get('kind') in KINDS else 'review'
    errs = d.get('err') if isinstance(d.get('err'), list) else []
    return {'k': clean(d['k'], 40), 'kind': kind, 'n': clean(d.get('n'), 20) or 'Игрок', 'c': CLASSES.get(d.get('c'), '?'),
            'lv': int(d.get('lv') or 1) if str(d.get('lv') or '1').isdigit() else 1, 'st': max(0, min(5, int(d.get('st') or 0))) if str(d.get('st') or '0').isdigit() else 0,
            's': clean(d.get('s'), 600), 't': int(d.get('t') or 0) if str(d.get('t') or '0').isdigit() else 0,
            'v': clean(d.get('v'), 10), 'z': clean(d.get('z'), 30), 'ua': clean(d.get('ua'), 160), 'scr': clean(d.get('scr'), 20),
            'err': [clean(e, 200) for e in errs[:5]]}


def when(r):
    return datetime.fromtimestamp(r['t'] / 1000, TZ).strftime('%d.%m.%Y %H:%M') if r['t'] else '?'


def issue_body(r):
    lines = [r['s'].replace('@', '@​'), '', '---',
             '**Игрок:** %s · %s · ур. %d' % (r['n'], r['c'], r['lv'])]
    if r['st']:
        lines.append('**Оценка:** ' + '★' * r['st'] + '☆' * (5 - r['st']))
    lines += ['**Когда:** %s (Екб)' % when(r), '**Версия игры:** %s · **зона:** %s' % (r['v'] or '?', r['z'] or '?'),
              '**Браузер:** `%s` · экран %s' % (r['ua'] or '?', r['scr'] or '?')]
    if r['err']:
        lines += ['', '**Ошибки скрипта перед отправкой:**', '```'] + r['err'] + ['```']
    lines += ['', '<sub>id: %s · собрано автоматически из игры</sub>' % r['k'], '', 'cc @lir147']
    return '\n'.join(lines)


def open_issue(r):
    repo, tok = os.environ.get('GITHUB_REPOSITORY'), os.environ.get('GITHUB_TOKEN')
    if not repo or not tok:
        return None
    title = '[%s] %s' % (KINDS[r['kind']], r['s'].replace('\n', ' ')[:70])
    req = urllib.request.Request('https://api.github.com/repos/%s/issues' % repo, method='POST',
                                 data=json.dumps({'title': title, 'body': issue_body(r)}).encode(),
                                 headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read()).get('number')


def main():
    path = 'reviews.json'
    known = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    got, status = {}, []
    for b in BROKERS:
        host, port = b[0], b[1]
        try:
            g = collect(host, port, *(b[2:4]))
            print('%s: %d messages' % (host, len(g))); status.append('%s — связь есть, сообщений %d' % (host, len(g)))
            got.update(g)
        except Exception as e:
            print('%s: failed (%s)' % (host, e)); status.append('%s — нет связи (%s)' % (host, e))
    new = [norm(d) for k, d in got.items() if k not in known]
    new = [r for r in new if r['s']]
    new.sort(key=lambda r: r['t'])
    print('new:', len(new))
    for i, r in enumerate(new):
        if i < MAX_ISSUES:
            try:
                r['issue'] = open_issue(r)
            except Exception as e:
                print('issue failed:', e)
        known[r['k']] = r
    json.dump(known, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    rows = sorted(known.values(), key=lambda r: -r['t'])
    md = ['# Отзывы игроков', '', 'Собираются из игры автоматически каждые 30 минут. Всего: %d.' % len(rows), '']
    for r in rows:
        head = '### %s · %s · %s, ур. %d · %s' % (KINDS.get(r['kind'], 'Отзыв'), r['n'], r['c'], r['lv'], when(r))
        if r.get('st'):
            head += ' · ' + '★' * r['st']
        if r.get('issue'):
            head += ' · #%s' % r['issue']
        md += [head, '', r['s'], '']
    open('reviews.md', 'w', encoding='utf-8').write('\n'.join(md))
    open('status.md', 'w', encoding='utf-8').write('Последняя проверка: %s (Екб)\n\n' % datetime.now(TZ).strftime('%d.%m.%Y %H:%M') + '\n'.join('- ' + x for x in status) + '\n')


if __name__ == '__main__':
    main()
