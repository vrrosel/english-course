// Service Worker — English Course PWA
// Guarda el curso en caché para funcionar sin internet

const CACHE_NAME = 'english-course-v1';
const ASSETS = [
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Al instalar: guarda en caché los archivos principales
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Al activar: limpia cachés antiguas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Al pedir un recurso: sirve desde caché si está disponible
// Si no hay internet, sirve la versión guardada
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                // Guarda en caché las fuentes de Google
                if (event.request.url.includes('fonts.googleapis') ||
                    event.request.url.includes('fonts.gstatic')) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                // Sin internet y sin caché: devuelve index.html como fallback
                return caches.match('./index.html');
            });
        })
    );
});
