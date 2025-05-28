// src/scripts/pages/bookmark/bookmark-presenter.js
import StoryAppDB from '../../data/indexeddb-manager'; //
// import { storyMapper } from '../../data/api-mapper'; // Tidak perlu storyMapper jika data sudah dalam format yang benar di DB

export default class BookmarkPresenter {
  #view;
  #dbModel;

  constructor({ view }) {
    this.#view = view;
    this.#dbModel = StoryAppDB;
  }

  async initialGalleryAndMap() {
    this.#view.showLoading(); // Anda sudah punya ini di bookmark-page.js
    this.#view.showMapLoading(); // Anda sudah punya ini di bookmark-page.js

    try {
      await this.#view.initialMap(); // Panggil initialMap dari view

      const stories = await this.#dbModel.getAllStories();
      // Jika data di DB belum melalui storyMapper (misalnya dari API langsung),
      // Anda mungkin perlu mapping di sini. Namun, jika saat menyimpan sudah di-map, tidak perlu lagi.
      // const mappedStories = await Promise.all(stories.map(storyMapper)); // Opsional

      // Jika tidak ada cerita, populateStoriesList akan menampilkan pesan kosong
      this.#view.populateStoriesList(stories); // (gunakan stories langsung jika sudah di-map saat menyimpan)
    } catch (error) {
      console.error('initialGalleryAndMap (Bookmark): error:', error);
      this.#view.populateStoriesListError(error.message); //
    } finally {
      this.#view.hideLoading(); //
      this.#view.hideMapLoading(); //
    }
  }
}
