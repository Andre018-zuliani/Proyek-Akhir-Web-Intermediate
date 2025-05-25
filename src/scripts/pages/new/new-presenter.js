// src/scripts/pages/new/new-presenter.js
// import { reportMapper } from '../../data/api-mapper'; // reportMapper tidak lagi relevan di sini

export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  // Mengubah parameter postNewReport agar sesuai dengan API baru
  async postNewReport({ description, photo, latitude, longitude }) {
    // Mengubah title, damageLevel, evidenceImages
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        description: description,
        photo: photo, // 'photo' untuk file tunggal
        latitude: latitude,
        longitude: longitude,
      };
      // Menggunakan storeNewStory dari API yang sudah disesuaikan
      const response = await this.#model.storeNewStory(data);

      if (!response.ok) {
        console.error('postNewReport: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }

      this.#view.storeSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('postNewReport: error:', error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
