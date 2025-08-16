const CACHE = 'moo-trainer-v6';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=6',
  './app.js?v=6',
  './manifest.json?v=6',
  './icons/logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE?caches.delete(k):null)))
  );
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(r=> r || fetch(e.request))
  );
});
