// src/scripts/pages/bookmark/bookmark-page.js
import {
  generateStoriesListEmptyTemplate, //
  generateStoriesListErrorTemplate, //
  generateLoaderAbsoluteTemplate, //
  generateStoryItemTemplate, //
} from '../../templates';
import { storyMapper } from '../../data/api-mapper'; //
import Map from '../../utils/map'; //
// Impor fungsi IndexedDB
import { getAllStoriesFromDB } from '../../data/indexeddb-manager';

export default class BookmarkPage {
  #map = null; //

  async render() {
    // <--- METHOD RENDER ADA DI SINI
    return `
      <section>
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Story Tersimpan</h1>

        <div class="stories-list__container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // ... (kode afterRender Anda) ...
  }

  // ... (method lainnya seperti populateStoriesList, initialMap, showLoading, dll. ada di sini) ...
  // Pastikan method-method ini juga terdefinisi dengan benar di file Anda.
  // Misalnya:
  populateStoriesList(stories) {
    if (stories.length === 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      if (
        this.#map &&
        story.location &&
        typeof story.location.latitude === 'number' &&
        typeof story.location.longitude === 'number'
      ) {
        const coordinate = [story.location.latitude, story.location.longitude];
        const markerOptions = { alt: story.description };
        // Pastikan story.description ada, atau gunakan fallback
        const popupContent = story.description || 'Story';
        const popupOptions = { content: popupContent };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateStoryItemTemplate({
          id: story.id,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          location: story.location,
        }),
      );
    }, '');

    const storiesListElement = document.getElementById('stories-list');
    if (storiesListElement) {
      storiesListElement.innerHTML = `<div class="stories-list">${html}</div>`;
    }
  }

  populateStoriesListEmpty() {
    const storiesListElement = document.getElementById('stories-list');
    if (storiesListElement) {
      storiesListElement.innerHTML = generateStoriesListEmptyTemplate();
    }
  }

  populateStoriesListError(message) {
    const storiesListElement = document.getElementById('stories-list');
    if (storiesListElement) {
      storiesListElement.innerHTML = generateStoriesListErrorTemplate(message);
    }
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {
    const mapLoadingContainer = document.getElementById('map-loading-container');
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideMapLoading() {
    const mapLoadingContainer = document.getElementById('map-loading-container');
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = '';
    }
  }

  showLoading() {
    const loadingContainer = document.getElementById('stories-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById('stories-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = '';
    }
  }
}
