const CACHE_NAME = "qing-ledger-cache-v37";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./ui-tuner.html",
  "./styles.css?v=37",
  "./app.js?v=37",
  "./vendor/hammer.min.js",
  "./manifest.webmanifest?v=30",
  "./assets/app-icon-180.png?v=30",
  "./assets/app-icon-192.png?v=30",
  "./assets/app-icon-512.png?v=30"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
