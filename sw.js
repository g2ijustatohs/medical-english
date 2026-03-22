const CACHE = 'medical-en-v21';

// ネットワーク優先（常に最新を取得）するファイル
const NETWORK_FIRST = ['./words.js', './index.html'];

// キャッシュするスタティックアセット
const STATIC_ASSETS = [
  './',
  './index.html',
  './words.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isNetworkFirst = NETWORK_FIRST.some(p => url.pathname.endsWith(p.replace('./', '/')));

  if (isNetworkFirst) {
    // ネットワーク優先：取得成功したらキャッシュも更新、失敗時はキャッシュから返す
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // キャッシュ優先：フォントなどの静的リソース
    e.respondWith(
      caches.match(e.request)
        .then(cached => cached || fetch(e.request)
          .catch(() => caches.match('./index.html'))
        )
    );
  }
});
