// Service Worker for Police n Thief PWA
const CACHE_NAME = 'policenthief-v1';
const RUNTIME_CACHE = 'policenthief-runtime-v1';

// 캐시할 정적 파일들
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// 설치 이벤트: 정적 파일 캐싱
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache addAll failed:', error);
      })
  );
  // 새 Service Worker를 즉시 활성화
  self.skipWaiting();
});

// 활성화 이벤트: 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // 즉시 모든 클라이언트에 대해 컨트롤 획득
  return self.clients.claim();
});

// Fetch 이벤트: Network-First with Cache Fallback 전략
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Firebase 요청은 캐싱하지 않음 (실시간 데이터)
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    event.respondWith(fetch(request));
    return;
  }

  // API 요청도 캐싱하지 않음
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // 정적 파일과 페이지: Network-First 전략
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 성공적인 응답만 캐싱 (200-299)
        if (response && response.status >= 200 && response.status < 300) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 응답
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
          }
          
          // 캐시에도 없으면 기본 오프라인 페이지 (향후 추가 가능)
          if (request.destination === 'document') {
            return caches.match('/');
          }
          
          // 그 외에는 실패
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// 푸시 알림 (향후 추가 가능)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Police n Thief';
  const options = {
    body: data.body || '새로운 알림이 있습니다',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// 백그라운드 동기화 (향후 추가 가능)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  if (event.tag === 'sync-locations') {
    event.waitUntil(
      // 오프라인 중 저장된 위치 동기화
      console.log('[SW] Syncing offline locations')
    );
  }
});
