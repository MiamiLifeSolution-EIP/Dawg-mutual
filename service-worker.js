// DAWGCHECK Training Simulator – Service Worker (fixed asset names)
const CACHE = 'dawgcheck-cache-v5';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/dawgcheck-logo.png'
];

self.addEventListener('install', (event)=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))
  self.clients.claim();
});
self.addEventListener('fetch', (event)=>{
  if (event.request.method!=='GET') return;
  event.respondWith(
    caches.match(event.request).then(cached=>{
      if (cached) return cached;
      return fetch(event.request).then(resp=>{
        const copy = resp.clone();
        if (resp.ok && new URL(event.request.url).origin === location.origin) {
          caches.open(CACHE).then(c=>c.put(event.request, copy)).catch(()=>{});
        }
        return resp;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});