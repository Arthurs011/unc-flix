// Bump version to force old caches to be cleared
const CACHE = "aplmov-v4";
const PRECACHE = ["/manifest.json", "/favicon.svg", "/icon-192.svg", "/icon-512.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Allow page to trigger immediate activation of a new SW
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Cross-origin (TMDB, embeds, images): network only, never cache
  if (url.hostname !== self.location.hostname) {
    return; // let the browser handle it
  }

  // The worker script and manifest must never be served from cache. Caching
  // /sw.js means a returning client never receives an updated worker, so it
  // stays stuck on whatever logic it installed first.
  if (url.pathname === "/sw.js" || url.pathname === "/manifest.json") {
    return;
  }

  // Every document request is network-first, whatever the path. This is a
  // client-side-routed SPA: /watchlist and /account return the same index.html
  // as /, so treating them as cacheable pages pinned a stale bundle per route
  // and mobile clients kept loading old code long after a deploy.
  const isDocument =
    e.request.mode === "navigate" ||
    e.request.destination === "document";

  if (isDocument) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((r) => r || caches.match("/"))
        )
    );
    return;
  }

  // Hashed build assets (/assets/*): cache-first. The filename changes with
  // content, so a cached hit is always the right build.
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Remaining same-origin static files (icons, fonts): stale-while-revalidate
  // so a deploy is picked up on the next load without blocking this one.
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fresh = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
