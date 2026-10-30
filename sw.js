// Fast start: show the cached game at once and refresh the cache in the background.
// Requests with ?v= or ?r= (update checks, "reload without cache") always go to the network.
const CACHE = 'okl-v2';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.json', 'icon-192.png', 'icon-512.png']).catch(() => {}))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.searchParams.has('v') || u.searchParams.has('r')) { e.respondWith(fetch(e.request).then(r => { if (r.ok && e.request.mode === 'navigate') { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./', copy)); } return r; }).catch(() => caches.match('./'))); return; }
  const key = e.request.mode === 'navigate' ? './' : e.request;
  e.respondWith(caches.open(CACHE).then(c => c.match(key).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  })));
});
