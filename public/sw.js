/* 이 파일은 서비스워커 담당 — 앱을 오프라인에서도 열리게 하고, 홈 화면 설치를 가능하게 함 */
/* 캐시 전략:
   - 페이지(HTML): 네트워크 우선 → 새 배포가 바로 반영됨. 오프라인일 때만 캐시 사용.
   - 자산(JS/CSS/아이콘): 캐시 우선 → 파일명에 해시가 붙어 있어 내용이 바뀌면 이름도 바뀌므로 안전. */

const CACHE = 'lifesystem-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', './manifest.webmanifest'])),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 페이지 이동: 네트워크 우선 (성공하면 캐시 갱신, 실패하면 캐시로 오프라인 대응)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('./', copy))
          return response
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  // 자산: 캐시 우선 (없으면 받아서 캐시에 저장)
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
