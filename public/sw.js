/* StreamList basic service worker – app shell + runtime caching */
const CACHE_NAME = "streamlist-app-shell-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

// Install: pre-cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // SPA navigations -> network-first with "/" fallback when offline
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/", { ignoreSearch: true })));
    return;
  }

  // Images -> cache-first
  if (req.destination === "image") {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        });
      })
    );
    return;
  }

  // Everything else -> stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
