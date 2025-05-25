// src/scripts/index.js
import '../styles/styles.css';
import '../styles/responsives.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import Camera from './utils/camera'; // Pastikan path ini benar jika Camera.js ada di utils

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Pastikan nama file Service Worker cocok dengan output webpack Anda
      // dari webpack.common.js, outputnya adalah sw.bundle.js
      await navigator.serviceWorker.register('./sw.bundle.js'); // Gunakan path relatif dari root
      console.log('Service Worker registered successfully.');
    } catch (error) {
      console.error('Failed to register Service Worker:', error);
    }
  }
};

async function safeRenderPage(appInstance) {
  // Ganti nama parameter agar tidak bentrok dengan kelas App
  try {
    await appInstance.renderPage();
  } catch (error) {
    console.error('Render page error:', error);
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = '<h2>Terjadi kesalahan saat memuat halaman.</h2>';
    } else {
      document.body.innerHTML = '<h2>Terjadi kesalahan fatal saat memuat halaman.</h2>';
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded fired.');
  // Pastikan document.body sudah ada
  if (document.body) {
    console.log('Current document.body.innerHTML:', document.body.innerHTML);
  } else {
    console.error('CRITICAL: document.body is null or undefined at DOMContentLoaded!');
    return; // Hentikan jika body tidak ada
  }

  // 1. Deklarasikan SEMUA variabel elemen DOM terlebih dahulu
  const mainContentElement = document.getElementById('main-content');
  const drawerButtonElement = document.getElementById('drawer-button');
  const navigationDrawerElement = document.getElementById('navigation-drawer');
  const skipLinkButtonElement = document.getElementById('skip-link');

  // (Opsional) Log untuk masing-masing elemen setelah getElementById
  if (!mainContentElement) console.error("Log dari skrip: Element 'main-content' tidak ditemukan!");
  if (!drawerButtonElement)
    console.error("Log dari skrip: Element 'drawer-button' tidak ditemukan!");
  if (!navigationDrawerElement)
    console.error("Log dari skrip: Element 'navigation-drawer' tidak ditemukan!");
  if (!skipLinkButtonElement) console.error("Log dari skrip: Element 'skip-link' tidak ditemukan!");

  // 2. BARU gunakan variabel tersebut untuk membuat instance App
  // Baris berikut ini (atau di mana Anda menggunakan mainContentElement, dll.)
  // adalah tempat error terjadi jika deklarasi di atas belum dilakukan.
  // Pastikan baris ke-28 Anda (sesuai pesan error) tidak mencoba menggunakan
  // variabel ini sebelum dideklarasikan seperti di atas.
  const app = new App({
    content: mainContentElement,
    drawerButton: drawerButtonElement,
    drawerNavigation: navigationDrawerElement,
    skipLinkButton: skipLinkButtonElement,
  });

  await safeRenderPage(app);
  await registerServiceWorker();

  window.addEventListener('hashchange', async () => {
    // Periksa apakah 'app' sudah terdefinisi sebelum digunakan di sini juga
    if (app) {
      await safeRenderPage(app);
      Camera.stopAllStreams();
    }
  });
});
