const CACHE_NAME = "acquasafe-v2";
const APP_FILES = [
  "./", "./index.html", "./login.html", "./cadastro.html",
  "./portal.html", "./patógenos.html", "./solucoes.html",
  "./periculosidade.html", "./portal.css", "./login.css",
  "./style.css", "./portal.js", "./patogenos.js", "./solucoes.js",
  "./supabase-client.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await Promise.allSettled(APP_FILES.map(file => cache.add(file)));
  }));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then(response => {
    const copy=response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request)));
});
