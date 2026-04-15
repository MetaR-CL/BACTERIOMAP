const CACHE = 'bacteriomap-v2';
const FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './data/zones.json',
  './data/bacteries.json',
  './data/quiz.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-first for JSON data so admin edits via CMS propagate quickly.
  if (url.pathname.endsWith('.json') && url.pathname.includes('/data/')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache-first for static shell.
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
