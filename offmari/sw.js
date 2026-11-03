// Service Worker: 一度開いたらオフラインでも動くようにファイルをキャッシュする
const CACHE = 'pixel-hero-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // 1ファイル失敗しても全体が失敗しないよう個別に保存(HTTPキャッシュは無視して最新を取得)
    const results = await Promise.all(ASSETS.map(async (u) => {
      try {
        const res = await fetch(new Request(u, { cache: 'reload' }));
        if (!res.ok) throw new Error(res.status);
        await c.put(u, res);
        return true;
      } catch (err) { return false; }
    }));
    // 本体(index.html)が保存できなかった時だけインストール失敗にする
    if (!results[1]) throw new Error('index.html をキャッシュできませんでした');
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // ページ本体(ナビゲーション): キャッシュ優先。無ければネット、ネットも駄目なら index.html
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html'));
      if (hit) {
        // 裏で最新版に更新(失敗しても無視)
        e.waitUntil(fetch(new Request('./index.html', { cache: 'reload' }))
          .then((r) => r.ok && cache.put('./index.html', r)).catch(() => {}));
        return hit;
      }
      try { return await fetch(req); }
      catch (err) { return (await cache.match('./index.html')) || Response.error(); }
    })());
    return;
  }

  // その他のファイル: キャッシュ優先、無ければネット(取れたら保存)
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) { return Response.error(); }
  })());
});
