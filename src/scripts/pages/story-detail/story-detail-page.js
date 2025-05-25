// src/scripts/pages/story-detail/story-detail-page.js
import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailErrorTemplate, // Pastikan ini diimport
  generateStoryDetailTemplate, // Pastikan ini diimport
  generateSaveStoryButtonTemplate,
  generateRemoveStoryButtonTemplate,
} from '../../templates';
import StoryDetailPresenter from './story-detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import * as StoriesAPI from '../../data/api';
import Map from '../../utils/map';
import showNotification from '../../utils/notification-handler';

export default class StoryDetailPage {
  #presenter = null;
  #form = null;
  #map = null;
  #storyId = null;

  async render() {
    return `
      <section>
        <div class="report-detail__container">
          <div id="report-detail" class="report-detail"></div>
          <div id="report-detail-loading-container"></div>
        </div>
      </section>
      
      `;
  }

  async afterRender() {
    this.#storyId = parseActivePathname().id;
    this.#presenter = new StoryDetailPresenter({
      view: this,
      apiModel: StoriesAPI,
      storyId: this.#storyId,
    });

    this.#setupForm();

    await this.#presenter.showStoryDetail();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    document.getElementById('report-detail').innerHTML = generateStoryDetailTemplate({
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      location: story.location,
      createdAt: story.createdAt,
    });

    const mapContainer = document.getElementById('map');
    const mapParentContainer = mapContainer.closest('.report-detail__body__map__container');

    if (
      story.location &&
      typeof story.location.latitude === 'number' &&
      typeof story.location.longitude === 'number'
    ) {
      if (mapParentContainer) {
        mapParentContainer.style.display = 'block';
      }
      await this.initialMap();
      if (this.#map) {
        const storyCoordinate = [story.location.latitude, story.location.longitude];
        const markerOptions = { alt: story.description };
        const popupOptions = { content: story.description };
        this.#map.changeCamera(storyCoordinate);
        this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
      }
    } else {
      if (mapParentContainer) {
        mapParentContainer.style.display = 'none';
      }
    }

    this.renderSaveButton(story.id);
    this.addNotifyMeEventListener();
  }

  populateStoryDetailError(message) {
    document.getElementById('report-detail').innerHTML = generateStoryDetailErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
    });
  }

  #setupForm() {
    const commentsFormContainer = document.querySelector('.report-detail__comments__container');
    if (commentsFormContainer) {
      commentsFormContainer.style.display = 'none';
    }
  }

  clearForm() {
    if (this.#form) {
      this.#form.reset();
    }
  }

  // --- Perbaikan untuk fungsi loading ---
  showStoryDetailLoading() { // Perubahan nama fungsi
    document.getElementById('report-detail-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() { // Perubahan nama fungsi
    document.getElementById('report-detail-loading-container').innerHTML = '';
  }
  // --- Akhir perbaikan untuk fungsi loading ---

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  // Fitur Simpan Story
  renderSaveButton(storyId) {
    const bookmarkedStories = JSON.parse(localStorage.getItem('bookmarkedStories')) || [];
    const isBookmarked = bookmarkedStories.some((story) => story.id === storyId);

    if (isBookmarked) {
      document.getElementById('save-actions-container').innerHTML =
        generateRemoveStoryButtonTemplate();
      document.getElementById('story-detail-remove').addEventListener('click', () => {
        this.removeStoryFromBookmark(storyId);
      });
    } else {
      document.getElementById('save-actions-container').innerHTML =
        generateSaveStoryButtonTemplate();
      document.getElementById('story-detail-save').addEventListener('click', () => {
        this.saveStoryToBookmark(storyId);
      });
    }
  }

  async saveStoryToBookmark(storyId) {
    try {
      const response = await StoriesAPI.getStoryById(storyId);
      if (!response.ok) {
        showNotification('Gagal mendapatkan detail story untuk disimpan.');
        return;
      }
      const storyToSave = response.story;

      const bookmarkedStories = JSON.parse(localStorage.getItem('bookmarkedStories')) || [];
      if (!bookmarkedStories.some((story) => story.id === storyToSave.id)) {
        bookmarkedStories.push(storyToSave);
        localStorage.setItem('bookmarkedStories', JSON.stringify(bookmarkedStories));
        showNotification('Story berhasil disimpan!');
        this.renderSaveButton(storyId);
      } else {
        showNotification('Story sudah ada di daftar simpanan.');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      showNotification('Terjadi kesalahan saat menyimpan story.');
    }
  }

  removeStoryFromBookmark(storyId) {
    let bookmarkedStories = JSON.parse(localStorage.getItem('bookmarkedStories')) || [];
    bookmarkedStories = bookmarkedStories.filter((story) => story.id !== storyId);
    localStorage.setItem('bookmarkedStories', JSON.stringify(bookmarkedStories));
    showNotification('Story berhasil dibuang dari daftar simpanan!');
    this.renderSaveButton(storyId);
  }

  addNotifyMeEventListener() {
    document.getElementById('report-detail-notify-me').addEventListener('click', () => {
      showNotification('Fitur notifikasi story akan segera hadir!');
    });
  }
}