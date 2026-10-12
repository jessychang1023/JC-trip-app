const CACHE = "tripbook-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./firebase-config.js", "./icon.svg", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  const mine = u.origin === location.origin;
  const sdk = u.origin === "https://www.gstatic.com" && u.pathname.startsWith("/firebasejs/"); // Firebase 程式庫，快取後可離線載入
  if (e.request.method !== "GET" || !(mine || sdk)) return; // 天氣、匯率、Google、Firestore 連線一律不攔截
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request).then(m => m || (mine ? caches.match("./index.html") : Response.error())))
  );
});
