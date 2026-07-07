// ARTIVERGES NEXT — minimal service worker for PWA installability.
//
// This app is data-driven (Supabase auth + Prisma) and every page requires a
// fresh session check, so we deliberately do NOT cache HTML/RSC/API
// responses — caching those could serve stale/authenticated content to the
// wrong user or break Server Actions. We only cache immutable static assets
// (icons, manifest) so the app installs and the icon/manifest load offline;
// everything else always goes to the network.

const CACHE = "artiverges-static-v1";
const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/icons/") ||
      url.pathname === "/manifest.json" ||
      url.pathname === "/favicon.ico" ||
      url.pathname === "/apple-touch-icon.png");

  if (!isStaticAsset) return; // let the browser handle everything else normally

  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
    )
  );
});
