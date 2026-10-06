'use strict';
// Bump VERSION after changing any cached asset. Keep each repository's cache isolated.
const VERSION = 'v2.0.0';
const PREFIX = 'sentechtipsvn-webclip-' + encodeURIComponent(new URL(self.registration.scope).pathname) + '-';
const CACHE = PREFIX + VERSION;
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './modules/config.js', './modules/validation.js', './modules/profile.js', './modules/icons.js', './modules/shortcuts.js', './modules/platform.js', './icons/default-webclip.png', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  // A new version waits until old windows close, avoiding mixed versions during file export.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (request.mode === 'navigate') {
    const base = new URL(self.registration.scope);
    const isApp = url.pathname === base.pathname || url.pathname === base.pathname + 'index.html';
    if (!isApp) return;
    // Match shell and versioned scripts; browser checks sw.js itself for updates.
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(new URL('./index.html', self.registration.scope))) || fetch(request)));
    return;
  }
  // Only serve our known static assets; never cache user URLs, blob files or profile contents.
  const known = ASSETS.some(asset => new URL(asset, self.registration.scope).pathname === url.pathname);
  if (!known) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(url.href, {ignoreSearch:true})) || fetch(request)));
});
