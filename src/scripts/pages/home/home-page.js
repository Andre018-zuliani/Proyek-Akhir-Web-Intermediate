// src/scripts/pages/home/home-page.js
import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from '../../templates';
import HomePresenter from './home-presenter';
import * as StoriesAPI from '../../data/api';
import Map from '../../utils/map'; // Import Map class

export default class HomePage {
  #presenter = null;
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
        <h1 class="section-title">Daftar Cerita</h1>

        <div class="stories-list__container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoriesAPI,
    });

    // initialGalleryAndMap akan memanggil initialMap() melalui presenter
    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(message, stories) {
    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    console.log('Stories passed to populateStoriesList:', stories);

    const html = stories.reduce((accumulator, story) => {
      // Pengecekan ekstra untuk story dan story.location
      if (
        !story ||
        !story.location ||
        typeof story.location.latitude === 'undefined' ||
        typeof story.location.longitude === 'undefined'
      ) {
        console.warn(
          'Skipping story due to missing location data or malformed story object:',
          story,
        );
        return accumulator.concat(
          generateStoryItemTemplate({
            id: story?.id || 'unknown',
            name: story?.name || 'Unknown User',
            description: story?.description || 'Cerita ini tidak memiliki deskripsi lengkap.',
            photoUrl: story?.photoUrl || 'images/placeholder-image.jpg',
            createdAt: story?.createdAt || new Date().toISOString(),
            location: { latitude: null, longitude: null, placeName: 'Lokasi tidak tersedia' },
          }),
        );
      }

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
          location: story.location, // Menggunakan objek location yang sudah diproses storyMapper
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
    // Fungsi ini dipanggil dari HomePresenter.showStoriesListMap()
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

  viewStoryDetail() {
    // Fungsi ini mungkin tidak digunakan langsung di Home, tapi ada untuk konsistensi
    this.#presenter.showStoryDetail();
  }
}
