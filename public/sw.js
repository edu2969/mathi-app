const CACHE_NAME = "mathi-app-v1";
const APP_SHELL = [
  "/",
  "/login",
  "/niveles",
  "/ejercicio/sumas",
  "/manifest.webmanifest",
  "/bg-vertical.png",
  "/candado.png",
  "/desafio_back_vacio.png",
  "/estrella.png",
  "/flecha_derecha.png",
  "/flecha_izquierda.png",
  "/level_01.png",
  "/level_02.png",
  "/level_03.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  // Always fetch from network, never use cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match("/"))
  );
});