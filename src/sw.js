// src/sw.js
// ... (CACHE_NAME, urlsToCache, API_CACHE_NAME, event 'install' dan 'activate' tetap sama seperti saran PWA saya sebelumnya) ...

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const dicodingApiBaseUrl = 'https://story-api.dicoding.dev/v1/'; // Definisikan base URL API di sini

  // Strategi untuk API (Network first, then cache)
  if (requestUrl.href.startsWith(dicodingApiBaseUrl)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Jika berhasil, simpan ke cache API
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Jika network gagal, coba ambil dari cache API
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Jika tidak ada di cache dan network gagal, kirim response error JSON
            return new Response(
              JSON.stringify({ error: true, message: 'Offline: Could not fetch data from API.' }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503, // Service Unavailable
              },
            );
          });
        }),
    );
    return;
  }

  // Strategi untuk App Shell dan aset lainnya (Cache first, then network)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Opsional: Cache aset non-API lainnya yang baru diambil
          // const clonedResponseForAppShell = networkResponse.clone();
          // caches.open(CACHE_NAME).then((cache) => {
          //   cache.put(event.request, clonedResponseForAppShell);
          // });
          return networkResponse;
        })
        .catch(() => {
          // Fallback jika network gagal untuk aset non-API
          // Anda bisa menambahkan logika fallback yang lebih baik di sini jika diperlukan
          // (misalnya, halaman offline.html atau gambar placeholder)
          console.warn(`Failed to fetch: ${event.request.url}. Serving basic offline response.`);
          return new Response('You are offline and the requested resource is not cached.', {
            status: 404,
            statusText: 'Resource not found or offline',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    }),
  );
});

// ... (listener 'push' dan 'notificationclick' tetap sama) ...
