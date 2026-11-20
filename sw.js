/* LearnFlix service worker: เปิดได้เร็วขึ้น และเปิดหน้าแอปได้แม้สัญญาณอ่อน */
const CACHE = "learnflix-v2";
const CORE = ["./", "index.html", "css/style.css", "js/courses.js", "js/app.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  /* ดึงของใหม่ก่อนเสมอ (ครูแก้ไฟล์แล้วผู้เรียนเห็นทันที) ถ้าไม่มีเน็ตค่อยใช้ของที่เก็บไว้ */
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
