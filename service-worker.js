const CACHE_NAME = "recitation-central-bulk-deduction-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./view.html",
  "./firebase-index.html",
  "./scanner-firebase.html",
  "./watch-scanner.html",
  "./view-firebase.html",
  "./admin-firebase.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (
    url.hostname === "script.google.com" ||
    url.hostname === "script.googleusercontent.com" ||
    url.hostname.endsWith(".google.com") ||
    url.hostname.endsWith(".googleusercontent.com")
  ) {
    event.respondWith(fetch(request));
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchAndCache = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });

      return cached || fetchAndCache;
    }).catch(() => caches.match("./firebase-index.html"))
  );
});
