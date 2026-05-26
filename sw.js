/* DIF Aarhus — minimal service worker, offline-first for static assets */
const CACHE = "dif-v3";
const PRECACHE = [
  "/",
  "/om-foreningen.html",
  "/aktiviteter.html",
  "/medlemskab.html",
  "/fakta.html",
  "/foreninger.html",
  "/links.html",
  "/aktuelt.html",
  "/kultur.html",
  "/danske-joeder.html",
  "/oktober-43.html",
  "/stoet-israel.html",
  "/kontakt.html",
  "/en/",
  "/en/news.html",
  "/en/about.html",
  "/en/events.html",
  "/en/membership.html",
  "/en/culture.html",
  "/en/danish-jews.html",
  "/en/october-43.html",
  "/en/support-israel.html",
  "/en/contact.html",
  "/assets/css/styles.css",
  "/assets/js/site.js",
  "/assets/js/data-maps.js",
  "/assets/js/data-orgs.js",
  "/assets/js/data-people.js",
  "/assets/img/favicon.svg",
  "/assets/img/israel_flag.gif",
  "/assets/img/venskabsflagdkisrael.jpg",
  "/assets/search.json",
  "/assets/search-en.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Network-first for HTML so updates show fast; cache fallback offline
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((m) => m || caches.match("/")))
    );
    return;
  }

  // Cache-first for assets
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => cached))
  );
});
