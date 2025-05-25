// src/scripts/utils/notification-initiator.js
import { VAPID_PUBLIC_KEY } from '../config';
import * as StoriesAPI from '../data/api';
import showNotification from './notification-handler';

const subscribe = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported.');
    showNotification('Notifikasi tidak didukung oleh browser Anda.');
    return;
  }

  if (!('PushManager' in window)) {
    console.warn('Push API not supported.');
    showNotification('Notifikasi tidak didukung oleh browser Anda.');
    return;
  }

  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
    if (!serviceWorkerRegistration) {
      console.warn('Service Worker not registered.');
      showNotification('Service Worker belum terdaftar.');
      return;
    }

    const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('Push subscription:', pushSubscription);

    const response = await StoriesAPI.subscribePushNotification(pushSubscription.toJSON());

    if (response.ok) {
      showNotification('Berhasil subscribe notifikasi!');
    } else {
      showNotification(`Gagal subscribe notifikasi: ${response.message}`);
      await pushSubscription.unsubscribe(); // Unsubscribe if backend fails
    }
  } catch (error) {
    console.error('Error subscribing to push notification:', error);
    showNotification(
      'Gagal subscribe notifikasi. Pastikan Anda online dan berikan izin notifikasi.',
    );
  }
};

const unsubscribe = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported.');
    return;
  }

  const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
  if (!serviceWorkerRegistration) {
    console.warn('Service Worker not registered.');
    return;
  }

  try {
    const pushSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

    if (pushSubscription) {
      await pushSubscription.unsubscribe();
      const response = await StoriesAPI.unsubscribePushNotification(pushSubscription.toJSON());

      if (response.ok) {
        showNotification('Berhasil unsubscribe notifikasi.');
      } else {
        showNotification(`Gagal unsubscribe notifikasi: ${response.message}`);
      }
    } else {
      showNotification('Anda belum terdaftar untuk notifikasi.');
    }
  } catch (error) {
    console.error('Error unsubscribing from push notification:', error);
    showNotification('Gagal unsubscribe notifikasi.');
  }
};

const getSubscriptionStatus = async () => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
  if (!serviceWorkerRegistration) {
    return false;
  }
  const pushSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
  return !!pushSubscription;
};

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationInitiator = {
  subscribe,
  unsubscribe,
  getSubscriptionStatus,
};

export default NotificationInitiator;
