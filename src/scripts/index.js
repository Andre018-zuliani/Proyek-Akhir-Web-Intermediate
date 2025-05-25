// src/scripts/index.js
// CSS imports
import '../styles/styles.css';
import '../styles/responsives.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

// Components
import App from './pages/app';
import Camera from './utils/camera';

// Tambahkan ini untuk Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Pastikan nama file Service Worker cocok dengan output webpack Anda
      await navigator.serviceWorker.register('./sw.bundle.js');
      console.log('Service Worker registered successfully.');
    } catch (error) {
      console.error('Failed to register Service Worker:', error);
    }
  }
};

async function safeRenderPage(app) {
  try {
    await app.renderPage();
  } catch (error) {
    console.error('Render page error:', error);
    document.getElementById('main-content').innerHTML =
      '<h2>Terjadi kesalahan saat memuat halaman.</h2>';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  await safeRenderPage(app);

  // Panggil pendaftaran Service Worker saat DOMContentLoaded
  await registerServiceWorker();

  window.addEventListener('hashchange', async () => {
    await safeRenderPage(app);

    // Stop all active media
    Camera.stopAllStreams();
  });
});
