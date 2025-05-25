// src/scripts/pages/app.js
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate, // Import
  generateUnsubscribeButtonTemplate, // Import
} from '../templates';
import { setupSkipToContent, transitionHelper } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import { routes } from '../routes/routes';
import showNotification from '../utils/notification-handler';
import NotificationInitiator from '../utils/notification-initiator'; // Import

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
    setupSkipToContent(this.#skipLinkButton, this.#content);
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
    // Ubah jadi async
    const isLogin = !!getAccessToken();
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
    const navList = this.#drawerNavigation.children.namedItem('navlist');
    const pushNotificationTools = document.getElementById('push-notification-tools'); // Ambil elemennya

    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      // Untuk pengguna yang tidak login, sembunyikan atau biarkan kosong area notifikasi
      if (pushNotificationTools) {
        pushNotificationTools.innerHTML = ''; // Pastikan tidak ada konten notifikasi saat tidak login
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

    // Logic untuk tombol push notification
    if (pushNotificationTools) {
      const isSubscribed = await NotificationInitiator.getSubscriptionStatus();
      if (isSubscribed) {
        pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
        const unsubscribeButton = document.getElementById('unsubscribe-button');
        if (unsubscribeButton) {
          unsubscribeButton.addEventListener('click', async () => {
            await NotificationInitiator.unsubscribe();
            this.#setupNavigationList(); // Refresh tombol setelah unsubscribe
          });
        }
      } else {
        pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
        const subscribeButton = document.getElementById('subscribe-button');
        if (subscribeButton) {
          subscribeButton.addEventListener('click', async () => {
            await NotificationInitiator.subscribe();
            this.#setupNavigationList(); // Refresh tombol setelah subscribe
          });
        }
      }
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];

    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList(); // Panggil async ini setelah DOM dirender
    });
  }
}
