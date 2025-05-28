// src/scripts/pages/app.js
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from '../templates';
import { setupSkipToContent, transitionHelper } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import { routes } from '../routes/routes';
import showNotification from '../utils/notification-handler';
import NotificationInitiator from '../utils/notification-initiator';
import NotFoundPage from './not-found-page'; // Impor halaman 404

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    // Pastikan elemen DOM penting ada sebelum melanjutkan inisialisasi
    if (!this.#content || !this.#drawerButton || !this.#drawerNavigation) {
      console.error('[App.js] CRITICAL: Missing essential DOM elements for App initialization.', {
        content: this.#content,
        drawerButton: this.#drawerButton,
        drawerNavigation: this.#drawerNavigation,
      });
      // Anda bisa menghentikan eksekusi lebih lanjut atau menampilkan pesan error ke pengguna
      // Untuk saat ini, kita biarkan #init() dipanggil, namun error akan tetap terjadi jika elemen null.
    }

    this.#init();
  }

  #init() {
    // setupSkipToContent akan menangani jika this.#skipLinkButton adalah null
    setupSkipToContent(this.#skipLinkButton, this.#content);

    // Pastikan drawerButton dan drawerNavigation ada sebelum menambahkan event listener
    if (this.#drawerButton && this.#drawerNavigation) {
      this.#setupDrawer();
    } else {
      console.warn(
        '[App.js] Drawer button or navigation element not found, skipping drawer setup.',
      );
    }
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      // Pastikan drawerNavigation masih ada (misalnya tidak dihapus oleh HMR)
      if (!this.#drawerNavigation) return;

      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton && this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove('open');
      }

      this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove('open');
        }
      });
    });
  }

  async #setupNavigationList() {
    // Pastikan drawerNavigation ada sebelum memanipulasinya
    if (!this.#drawerNavigation) {
      console.warn('[App.js] Drawer navigation element not found, skipping navigation list setup.');
      return;
    }

    const isLogin = !!getAccessToken();
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
    const navList = this.#drawerNavigation.children.namedItem('navlist');

    // Pastikan navListMain dan navList ada
    if (!navListMain || !navList) {
      console.warn(
        '[App.js] Navigation list containers (navlist-main or navlist) not found in drawer.',
      );
      return;
    }

    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      const pushNotificationButtonContainer = document.getElementById(
        'push-notification-button-container',
      );
      if (pushNotificationButtonContainer) {
        pushNotificationButtonContainer.innerHTML = '';
      }
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (confirm('Apakah Anda yakin ingin keluar?')) {
          getLogout();
          showNotification('Anda telah berhasil keluar!');
          location.hash = '/login';
        }
      });
    }

    const pushNotificationButtonContainer = document.getElementById(
      'push-notification-button-container',
    );
    if (pushNotificationButtonContainer) {
      try {
        const isSubscribed = await NotificationInitiator.getSubscriptionStatus();
        if (isSubscribed) {
          pushNotificationButtonContainer.innerHTML = generateUnsubscribeButtonTemplate();
          const unsubscribeButton = document.getElementById('unsubscribe-button');
          if (unsubscribeButton) {
            unsubscribeButton.addEventListener('click', async () => {
              await NotificationInitiator.unsubscribe();
              await this.#setupNavigationList(); // Refresh tombol
            });
          }
        } else {
          pushNotificationButtonContainer.innerHTML = generateSubscribeButtonTemplate();
          const subscribeButton = document.getElementById('subscribe-button');
          if (subscribeButton) {
            subscribeButton.addEventListener('click', async () => {
              await NotificationInitiator.subscribe();
              await this.#setupNavigationList(); // Refresh tombol
            });
          }
        }
      } catch (error) {
        console.error('[App.js] Error setting up push notification button:', error);
        showNotification('Gagal memeriksa status langganan notifikasi.');
      }
    }
  }

  // Menggabungkan dua deklarasi renderPage menjadi satu yang lebih robust.
  async renderPage() {
    // Pastikan #content ada
    if (!this.#content) {
      console.error('[App.js] CRITICAL: Main content element not found. Cannot render page.');
      document.body.innerHTML = '<h2>Kesalahan Kritis: Elemen konten utama tidak ditemukan.</h2>';
      return;
    }

    const url = getActiveRoute();
    console.log('[App.js] Current URL for routing:', url);

    const routeFunction = routes[url];
    console.log('[App.js] Selected route function:', routeFunction);

    if (typeof routeFunction !== 'function') {
      console.error(`[App.js] Error: No route function found for URL "${url}".`);
      const notFoundPage = new NotFoundPage();
      this.#content.innerHTML = await notFoundPage.render();
      await notFoundPage.afterRender();
      await this.#setupNavigationList();
      return;
    }

    let page;
    try {
      page = routeFunction();
    } catch (error) {
      console.error(`[App.js] Error executing route function for URL "${url}":`, error);
      this.#content.innerHTML = '<h2>Terjadi kesalahan saat memproses rute halaman.</h2>';
      await this.#setupNavigationList(); // Tetap setup navigasi
      return;
    }

    console.log('[App.js] Page instance/object from route:', page);
    console.log('[App.js] Type of page:', typeof page);
    if (page) {
      console.log('[App.js] Does page have render method?', typeof page.render === 'function');
      console.log(
        '[App.js] Does page have afterRender method?',
        typeof page.afterRender === 'function',
      );
    }

    if (!page || typeof page.render !== 'function' || typeof page.afterRender !== 'function') {
      console.error(
        '[App.js] Error: The resolved page object is invalid or missing render/afterRender methods.',
        page,
      );
      this.#content.innerHTML =
        '<h2>Gagal memuat konten halaman karena objek halaman tidak valid.</h2>';
      await this.#setupNavigationList(); // Tetap setup navigasi
      return;
    }

    try {
      const transition = transitionHelper({
        updateDOM: async () => {
          console.log('[App.js] Attempting to call page.render() for URL:', url);
          this.#content.innerHTML = await page.render();
          console.log('[App.js] page.render() called. Attempting page.afterRender()');
          await page.afterRender();
        },
      });

      // transition.ready bisa di-await jika ingin menunggu animasi selesai,
      // atau .catch() jika hanya ingin menangani errornya.
      await transition.ready.catch((error) => {
        // View transitions bisa di-skip (AbortError), ini bukan error aplikasi yang fatal.
        if (error.name !== 'AbortError') {
          console.error('[App.js] View Transition ready error:', error);
        }
      });

      // transition.finished adalah promise yang resolve setelah transisi selesai.
      // updateCallbackDone adalah promise yang resolve setelah updateDOM selesai.
      await transition.updateCallbackDone; // Tunggu DOM diperbarui
      scrollTo({ top: 0, behavior: 'instant' });
      await this.#setupNavigationList(); // Panggil setelah DOM dan konten halaman dirender
    } catch (error) {
      console.error(`[App.js] Error during page rendering or transition for URL "${url}":`, error);
      this.#content.innerHTML = `<h2>Terjadi kesalahan saat merender halaman ${url}.</h2>`;
      // Coba setup navigasi lagi jika terjadi error saat rendering.
      await this.#setupNavigationList();
    }
  }
}
