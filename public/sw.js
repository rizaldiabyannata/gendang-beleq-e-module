// Offline shell for the e-modul. The module makes no API calls, so everything it
// needs can live in the cache — but the strategy has to differ by request type:
//
//   navigations  -> network first. Cache-first on HTML serves a stale shell whose
//                   script tags point at chunk hashes that no longer exist, and the
//                   page then renders but never hydrates. Falls back to the cached
//                   shell only when the network is genuinely unavailable.
//   static assets -> cache first. Their URLs contain a content hash, so a cached
//                   copy is never stale.
const CACHE = 'gb-emodul-v4';
const SHELL = './';

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all([SHELL, './manifest.webmanifest', './icon.svg'].map((u) => c.add(u).catch(() => undefined)));
    // Precache the assets the shell actually references. Caching only the HTML left
    // an offline visitor with a page that rendered and never hydrated, because the
    // script chunks it points at had never been fetched through this worker.
    try {
      const html = await (await fetch(SHELL, { cache: 'reload' })).text();
      const urls = Array.from(html.matchAll(/(?:src|href)="([^"]+\.(?:js|css|woff2))"/g), (m) => m[1]);
      await Promise.all(urls.map((u) => c.add(u).catch(() => undefined)));
    } catch {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SHELL, copy));
          return res;
        })
        .catch(() => caches.match(SHELL).then((hit) => hit || Response.error()))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
