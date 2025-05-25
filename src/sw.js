// src/sw.js
/* eslint-disable no-restricted-globals */

self.addEventListener('install', () => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker: Activated');
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  const notificationData = event.data.json();

  const title = notificationData.title || 'StoryApp Notification';
  const options = {
    body: notificationData.options.body || 'You have a new notification!',
    icon: notificationData.options.icon || 'images/logo.png', // Ganti dengan path ikon Anda
    badge: notificationData.options.badge || 'images/logo.png', // Ganti dengan path ikon badge Anda
    data: notificationData.options.data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.');
  event.notification.close();

  if (event.action === 'explore') {
    // Handle specific action if needed
  }

  // Jika ada URL di data, buka URL tersebut
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else {
    // Fallback: buka halaman utama aplikasi
    event.waitUntil(clients.openWindow('/'));
  }
});
