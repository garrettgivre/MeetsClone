// Service worker. Two jobs:
//
// 1. Keep the game up to date. Every file is asked for from the network first,
//    skipping the browser's own cache, so a new release shows as soon as it is
//    published (see src/update.js for the check at start-up). The last good
//    copy of each file is kept, and only used when there is no connection, so
//    the game still opens offline.
// 2. Care alerts (see src/notify.js): phones need a service worker to display
//    notifications, and it brings the game forward when one is tapped.

const CACHE = 'meetsclone-offline';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      // 'no-cache' still lets the server answer "not changed", so this is cheap
      const fresh = await fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' });
      if (fresh.ok && !url.search) {
        const copy = fresh.clone();
        e.waitUntil(caches.open(CACHE).then((c) => c.put(url.pathname, copy)).catch(() => {}));
      }
      return fresh;
    } catch (err) {
      const kept = await caches.match(url.pathname);
      if (kept) return kept;
      throw err;
    }
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
