// src/scripts/pages/home/home-presenter.js
import { storyMapper } from '../../data/api-mapper';

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    // Constructor yang menerima objek { view, model }
    this.#view = view;
    this.#model = model;
  }

  async showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoriesListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showStoriesListMap(); // Peta diinisialisasi duluan

      const response = await this.#model.getAllStories();

      if (!response.ok) {
        console.error('initialGalleryAndMap: response:', response);
        this.#view.populateStoriesListError(response.message);
        return;
      }

      const stories = await Promise.all(
        (response.listStory || []).map(async (rawStory) => {
          if (!rawStory) {
            console.warn('Skipping null/undefined raw story in list:', rawStory);
            return {
              id: 'unknown-id',
              name: 'Tidak Diketahui',
              description: 'Data cerita tidak lengkap atau rusak.',
              photoUrl: 'images/placeholder-image.jpg',
              createdAt: new Date().toISOString(),
              location: { latitude: null, longitude: null, placeName: 'Lokasi tidak tersedia' },
            };
          }

          if (typeof rawStory.lat === 'number' && typeof rawStory.lon === 'number') {
            return await storyMapper(rawStory);
          }
          return {
            ...rawStory,
            location: {
              latitude: null,
              longitude: null,
              placeName: 'Lokasi tidak tersedia',
            },
          };
        }),
      );

      this.#view.populateStoriesList(response.message, stories);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
