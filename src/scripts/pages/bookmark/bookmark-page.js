// src/scripts/pages/bookmark/bookmark-page.js
import {
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
} from '../../templates';
import { storyMapper } from '../../data/api-mapper';
import Map from '../../utils/map'; // Import Map class

export default class BookmarkPage {
  #map = null; // Properti untuk menyimpan instance peta

  async render() {
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
    this.showLoading();
    try {
      await this.initialMap(); // Panggil initialMap di sini untuk BookmarkPage

      const bookmarkedStoriesRaw = JSON.parse(localStorage.getItem('bookmarkedStories')) || [];
      const bookmarkedStories = await Promise.all(
        bookmarkedStoriesRaw.map(async (story) => {
          // Karena data yang disimpan adalah raw story dari API,
          // kita perlu me-map-nya lagi dengan storyMapper untuk mendapatkan placeName
          if (typeof story.lat === 'number' && typeof story.lon === 'number') {
            return await storyMapper(story);
          }
          return {
            ...story,
            location: {
              latitude: null,
              longitude: null,
              placeName: 'Lokasi tidak tersedia', // Pesan default jika lokasi tidak ada
            },
          };
        }),
      );

      this.populateStoriesList(bookmarkedStories);
    } catch (error) {
      console.error('Error loading bookmarked stories:', error);
      this.populateStoriesListError('Terjadi kesalahan saat memuat story tersimpan.');
    } finally {
      this.hideLoading();
    }
  }

  populateStoriesList(stories) {
    if (stories.length === 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      // Pastikan #map sudah terinisialisasi dan koordinat berupa angka sebelum menambahkan marker
      if (
        this.#map &&
        typeof story.location.latitude === 'number' &&
        typeof story.location.longitude === 'number'
      ) {
        const coordinate = [story.location.latitude, story.location.longitude];
        const markerOptions = { alt: story.description };
        const popupOptions = { content: story.description };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateStoryItemTemplate({
          id: story.id,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          location: story.location, // Ini akan menampilkan 'Lokasi tidak tersedia' jika placeName tidak ada
        }),
      );
    }, '');

    document.getElementById('stories-list').innerHTML = `
      <div class="stories-list">${html}</div>
    `;
  }

  populateStoriesListEmpty() {
    document.getElementById('stories-list').innerHTML = generateStoriesListEmptyTemplate();
  }

  populateStoriesListError(message) {
    document.getElementById('stories-list').innerHTML = generateStoriesListErrorTemplate(message);
  }

  async initialMap() {
    // Fungsi ini dipanggil dari afterRender untuk BookmarkPage
    // untuk menginisialisasi peta.
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true, // Akan mencoba menemukan lokasi pengguna sebagai center awal
    });
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('stories-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = '';
  }
}
