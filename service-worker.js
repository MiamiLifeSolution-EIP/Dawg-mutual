// DAWGCHECK Training Simulator – Service Worker with Auto Cache Clearing
const CACHE = 'dawgcheck-cache-v6';
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

// Core files that should always be fresh (network first)
const ALWAYS_FRESH = [
  './index.html',
  './app.js',
  './styles.css'
];

self.addEventListener('install', (event)=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event)=>{
  if (event.request.method!=='GET') return;
  
  const url = new URL(event.request.url);
  const isLocal = url.origin === location.origin;
  const isAlwaysFresh = ALWAYS_FRESH.some(asset => url.pathname.endsWith(asset.replace('./', '')));
  
  // For core application files, use network-first strategy (always try fresh content)
  if (isLocal && isAlwaysFresh) {
    event.respondWith(
      fetch(event.request).then(resp => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => caches.match(event.request))
    );
  } else {
    // For other assets (images, icons), use cache-first strategy
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(resp => {
          const copy = resp.clone();
          if (resp.ok && isLocal) {
            caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
          }
          return resp;
        }).catch(() => caches.match('./index.html'));
      })
    );
  }
});

// Message handler for manual cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(keys => 
        Promise.all(keys.map(key => caches.delete(key)))
      ).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});