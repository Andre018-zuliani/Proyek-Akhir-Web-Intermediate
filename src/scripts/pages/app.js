// src/scripts/pages/app.js
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from '../templates'; //
import { setupSkipToContent, transitionHelper } from '../utils'; //
import { getAccessToken, getLogout } from '../utils/auth'; //
import { routes } from '../routes/routes'; //
import showNotification from '../utils/notification-handler'; //
import NotificationInitiator from '../utils/notification-initiator'; //

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

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content); //
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

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
    const isLogin = !!getAccessToken(); //
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
    const navList = this.#drawerNavigation.children.namedItem('navlist');
    // Hapus 'pushNotificationTools' yang lama karena kita pindahkan
    // const pushNotificationTools = document.getElementById('push-notification-tools');

    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate(); //
      // Kosongkan kontainer tombol notifikasi jika ada (meskipun seharusnya tidak dirender saat tidak login)
      const pushNotificationButtonContainer = document.getElementById(
        'push-notification-button-container',
      );
      if (pushNotificationButtonContainer) {
        pushNotificationButtonContainer.innerHTML = '';
      }
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate(); //
    navList.innerHTML = generateAuthenticatedNavigationListTemplate(); //

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (confirm('Apakah Anda yakin ingin keluar?')) {
          getLogout(); //
          showNotification('Anda telah berhasil keluar!'); //
          location.hash = '/login';
        }
      });
    }

    // Logic untuk tombol push notification
    // Targetkan kontainer baru
    const pushNotificationButtonContainer = document.getElementById(
      'push-notification-button-container',
    );
    if (pushNotificationButtonContainer) {
      const isSubscribed = await NotificationInitiator.getSubscriptionStatus(); //
      if (isSubscribed) {
        pushNotificationButtonContainer.innerHTML = generateUnsubscribeButtonTemplate(); //
        const unsubscribeButton = document.getElementById('unsubscribe-button');
        if (unsubscribeButton) {
          unsubscribeButton.addEventListener('click', async () => {
            await NotificationInitiator.unsubscribe(); //
            // Panggil #setupNavigationList lagi untuk merefresh tombol
            // Kita harus memastikan ini tidak menyebabkan loop tak terbatas jika ada masalah
            // Untuk kasus sederhana ini, seharusnya aman.
            await this.#setupNavigationList();
          });
        }
      } else {
        pushNotificationButtonContainer.innerHTML = generateSubscribeButtonTemplate(); //
        const subscribeButton = document.getElementById('subscribe-button');
        if (subscribeButton) {
          subscribeButton.addEventListener('click', async () => {
            await NotificationInitiator.subscribe(); //
            await this.#setupNavigationList();
          });
        }
      }
    }
  }

  async renderPage() {
    const url = getActiveRoute(); //
    const route = routes[url]; //

    const page = route();

    const transition = transitionHelper({
      //
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender(); // Pastikan afterRender juga di-await jika async
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(async () => {
      // Tambahkan async di sini
      scrollTo({ top: 0, behavior: 'instant' });
      await this.#setupNavigationList(); // Panggil async ini setelah DOM dirender
    });
  }

  // src/scripts/pages/app.js
  async renderPage() {
    const url = getActiveRoute();
    console.log('[App.js] Current URL for routing:', url); // LOG 1

    const routeFunction = routes[url]; // Ganti nama variabel agar lebih jelas
    console.log('[App.js] Selected route function:', routeFunction); // LOG 2

    if (typeof routeFunction !== 'function') {
      console.error(`[App.js] Error: No route function found for URL "${url}".`);
      this.#content.innerHTML = '<h2>Halaman tidak ditemukan (404)</h2>'; // Contoh penanganan
      return;
    }

    const page = routeFunction(); // Panggil fungsi untuk mendapatkan instance/objek page
    console.log('[App.js] Page instance/object from route:', page); // LOG 3
    console.log('[App.js] Type of page:', typeof page); // LOG 4
    if (page) {
      console.log('[App.js] Does page have render method?', typeof page.render === 'function'); // LOG 5
    }

    if (!page || typeof page.render !== 'function') {
      // Pengecekan yang lebih ketat
      console.error(
        '[App.js] Error: The resolved page object is invalid or does not have a render method.',
        page,
      );
      this.#content.innerHTML =
        '<h2>Gagal memuat konten halaman karena objek halaman tidak valid.</h2>';
      return;
    }

    const transition = transitionHelper({
      updateDOM: async () => {
        console.log('[App.js] Attempting to call page.render() for URL:', url); // LOG SEBELUM RENDER
        this.#content.innerHTML = await page.render();
        console.log('[App.js] page.render() called. Attempting page.afterRender()'); // LOG SETELAH RENDER
        await page.afterRender();
      },
    });

    transition.ready.catch((error) => {
      console.error('[App.js] View Transition ready error:', error);
    });
    transition.updateCallbackDone
      .then(async () => {
        scrollTo({ top: 0, behavior: 'instant' });
        await this.#setupNavigationList();
      })
      .catch((error) => {
        console.error('[App.js] View Transition updateCallbackDone or finished error:', error);
      });
  }
}
