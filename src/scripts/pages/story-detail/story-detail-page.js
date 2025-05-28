// src/scripts/pages/story-detail/story-detail-page.js
import {
  generateStoryDetailTemplate, //
  generateSaveStoryButtonTemplate, //
  generateRemoveStoryButtonTemplate, //
  generateLoaderAbsoluteTemplate, //
} from '../../templates';
import StoryDetailPresenter from './story-detail-presenter'; //
import { parseActivePathname } from '../../routes/url-parser'; //
import * as StoriesAPI from '../../data/api'; //
import Map from '../../utils/map'; //
import showNotification from '../../utils/notification-handler'; //
// Impor model database Anda jika Presenter tidak mengelolanya secara langsung
// import StoryAppDB from '../../data/indexeddb-manager'; // // Tidak perlu jika presenter sudah handle

export default class StoryDetailPage {
  #presenter = null;
  #storyData = null;
  #map = null;
  #storyId = null;

  async render() {
    return `
      <article id="report-detail" class="report-detail">
        ${generateLoaderAbsoluteTemplate()}
      </article>
    `;
  }

  async afterRender() {
    this.#storyId = parseActivePathname().id; //
    this.#presenter = new StoryDetailPresenter({
      //
      view: this,
      apiModel: StoriesAPI, //
      storyId: this.#storyId,
    });

    await this.#presenter.showStoryDetail(); // Ini akan mengambil data dari API dan juga memanggil showSaveButton()
  }

  // Fungsi ini dipanggil oleh Presenter setelah data API didapatkan
  async populateStoryDetailAndInitialMap(message, story) {
    //
    this.#storyData = story;
    const storyDetailContainer = document.getElementById('report-detail');
    if (storyDetailContainer) {
      storyDetailContainer.innerHTML = generateStoryDetailTemplate(story); //

      // Inisialisasi peta jika ada data lokasi
      if (
        story.location &&
        typeof story.location.latitude === 'number' &&
        typeof story.location.longitude === 'number'
      ) {
        await this.initialMap(story.location.latitude, story.location.longitude, story.description);
      }
      // Tombol save/remove akan dirender oleh showSaveButton() yang dipanggil presenter
    } else {
      console.error('Element with id "report-detail" not found.');
    }
  }

  populateStoryDetailError(message) {
    //
    const storyDetailContainer = document.getElementById('report-detail');
    if (storyDetailContainer) {
      // Anda mungkin ingin template error khusus untuk ini
      storyDetailContainer.innerHTML = `<p class="error-message">Gagal memuat cerita: ${message}</p>`;
    }
  }

  async initialMap(latitude, longitude, popupContent) {
    //
    const mapContainer = document.getElementById('map');
    const mapLoadingContainer = document.getElementById('map-loading-container');

    if (mapContainer && mapLoadingContainer) {
      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate(); //
      try {
        this.#map = await Map.build('#map', {
          //
          center: [latitude, longitude],
          zoom: 15,
        });
        this.#map.addMarker([latitude, longitude], {}, { content: popupContent });
      } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = '<p>Gagal memuat peta.</p>';
      } finally {
        mapLoadingContainer.innerHTML = '';
      }
    }
  }

  // Dipanggil oleh Presenter
  renderSaveButton() {
    const saveActionsContainer = document.getElementById('save-actions-container');
    if (saveActionsContainer) {
      saveActionsContainer.innerHTML = generateSaveStoryButtonTemplate(); //
      const saveButton = document.getElementById('story-detail-save');
      if (saveButton) {
        saveButton.addEventListener('click', async () => {
          if (this.#storyData) {
            // Pastikan #storyData ada
            await this.#presenter.saveStoryToBookmark(this.#storyData);
          } else {
            showNotification('Data cerita belum dimuat untuk disimpan.'); //
          }
        });
      }
    }
  }

  // Dipanggil oleh Presenter
  renderRemoveButton() {
    const saveActionsContainer = document.getElementById('save-actions-container');
    if (saveActionsContainer) {
      saveActionsContainer.innerHTML = generateRemoveStoryButtonTemplate(); //
      const removeButton = document.getElementById('story-detail-remove');
      if (removeButton) {
        removeButton.addEventListener('click', async () => {
          await this.#presenter.removeStoryFromBookmark();
        });
      }
    }
  }

  // Metode loading (Anda sudah punya ini, pastikan digunakan jika perlu)
  showStoryDetailLoading() {
    const storyDetailContainer = document.getElementById('report-detail');
    if (storyDetailContainer) {
      storyDetailContainer.innerHTML = generateLoaderAbsoluteTemplate(); //
    }
  }

  hideStoryDetailLoading() {
    // Konten akan diganti oleh populateStoryDetailAndInitialMap atau populateStoryDetailError
  }

  // Event listener untuk tombol notifikasi (jika masih relevan)
  addNotifyMeEventListener() {
    //
    const notifyButton = document.getElementById('report-detail-notify-me');
    if (notifyButton) {
      notifyButton.addEventListener('click', () => {
        showNotification('Fitur notifikasi detail cerita akan segera hadir!'); //
      });
    }
  }
}
