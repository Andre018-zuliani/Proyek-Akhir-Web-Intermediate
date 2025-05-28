// src/scripts/pages/bookmark/bookmark-page.js
import {
  generateLoaderAbsoluteTemplate, //
  generateStoryItemTemplate, //
  generateStoriesListEmptyTemplate, //
  generateStoriesListErrorTemplate, //
} from '../../templates';
import BookmarkPresenter from './bookmark-presenter'; // Impor presenter baru
import Map from '../../utils/map'; //
// Hapus import StoryAppDB jika presenter yang akan mengelolanya
// import StoryAppDB from '../../data/indexeddb-manager'; //

export default class BookmarkPage {
  #presenter = null; // Tambahkan presenter
  #map = null;

  async render() {
    //
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
    this.#presenter = new BookmarkPresenter({
      // Inisialisasi presenter
      view: this,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(stories) {
    //
    const storiesListElement = document.getElementById('stories-list');
    if (!storiesListElement) return;

    if (!stories || stories.length === 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      // Pastikan story dan story.location ada dan valid sebelum menambahkan marker
      if (
        this.#map &&
        story &&
        story.location &&
        typeof story.location.latitude === 'number' &&
        typeof story.location.longitude === 'number'
      ) {
        const coordinate = [story.location.latitude, story.location.longitude];
        const markerOptions = { alt: story.description || 'Story' };
        const popupOptions = { content: story.description || 'Story Detail' };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateStoryItemTemplate({
          //
          // Pastikan semua properti yang dibutuhkan oleh template tersedia di objek 'story' dari DB
          id: story.id,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          location: story.location,
        }),
      );
    }, '');

    storiesListElement.innerHTML = `<div class="stories-list">${html}</div>`;
  }

  populateStoriesListEmpty() {
    //
    const storiesListElement = document.getElementById('stories-list');
    if (storiesListElement) {
      storiesListElement.innerHTML = generateStoriesListEmptyTemplate(); //
    }
  }

  populateStoriesListError(message) {
    //
    const storiesListElement = document.getElementById('stories-list');
    if (storiesListElement) {
      storiesListElement.innerHTML = generateStoriesListErrorTemplate(message); //
    }
  }

  async initialMap() {
    //
    this.#map = await Map.build('#map', {
      //
      zoom: 5, // Zoom awal bisa disesuaikan
      // Tidak menggunakan locate: true agar peta terpusat pada story yang ada,
      // atau Anda bisa menyesuaikan logic untuk memusatkan peta berdasarkan story.
      center: [-2.548926, 118.0148634], // Contoh: tengah Indonesia
    });
  }

  showMapLoading() {
    //
    const mapLoadingContainer = document.getElementById('map-loading-container');
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate(); //
    }
  }

  hideMapLoading() {
    //
    const mapLoadingContainer = document.getElementById('map-loading-container');
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = '';
    }
  }

  showLoading() {
    //
    const loadingContainer = document.getElementById('stories-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate(); //
    }
  }

  hideLoading() {
    //
    const loadingContainer = document.getElementById('stories-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = '';
    }
  }
}
