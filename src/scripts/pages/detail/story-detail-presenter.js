// src/scripts/pages/story-detail/story-detail-presenter.js
import { storyMapper } from '../../data/api-mapper';
import StoryAppDB from '../../data/indexeddb-manager';
import showNotification from '../../utils/notification-handler';

export default class StoryDetailPresenter {
  #view;
  #apiModel;
  #storyId;
  #dbModel;

  constructor({ view, apiModel, storyId }) {
    this.#view = view;
    this.#apiModel = apiModel; // Ini adalah StoriesAPI dari StoryDetailPage
    this.#storyId = storyId;
    this.#dbModel = StoryAppDB;
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading(); // Tampilkan loader di view
    try {
      if (!this.#storyId) {
        console.error('[StoryDetailPresenter] Story ID is missing.');
        this.#view.populateStoryDetailError('ID cerita tidak valid.');
        return;
      }

      console.log(`[StoryDetailPresenter] Fetching story with ID: ${this.#storyId}`);
      const response = await this.#apiModel.getStoryById(this.#storyId); // Panggil API untuk detail

      if (!response.ok || !response.story) {
        // Periksa apakah response.story ada
        console.error(
          '[StoryDetailPresenter] Failed to fetch story or story data missing:',
          response,
        );
        this.#view.populateStoryDetailError(response.message || 'Data cerita tidak ditemukan.');
        return;
      }

      const story = await storyMapper(response.story); // Map data
      console.log('[StoryDetailPresenter] Mapped story:', story);

      // Panggil view untuk mengisi konten dengan data yang sudah di-map
      this.#view.populateStoryDetailAndInitialMap(response.message, story);

      // Setelah konten utama dimuat, baru tampilkan tombol save/remove yang sesuai
      await this.showSaveButton();
    } catch (error) {
      console.error('[StoryDetailPresenter] showStoryDetail error:', error);
      this.#view.populateStoryDetailError(error.message || 'Terjadi kesalahan saat memuat cerita.');
    } finally {
      // Pastikan ada cara untuk menyembunyikan loader utama jika tidak ada konten yang dirender
      // Namun, jika populateStoryDetailAndInitialMap atau populateStoryDetailError mengganti innerHTML,
      // maka hideStoryDetailLoading() di view mungkin tidak diperlukan secara eksplisit di sini,
      // karena loader sudah tergantikan.
      // Jika populateStoryDetailError hanya menambahkan pesan error tanpa mengganti loader,
      // maka Anda perlu cara untuk menyembunyikan loader tersebut.
      // Untuk saat ini, kita asumsikan populateStoryDetailAndInitialMap dan populateStoryDetailError
      // akan menggantikan konten #report-detail, termasuk loader.
    }
  }

  async #isStorySaved() {
    if (!this.#storyId) return false;
    const story = await this.#dbModel.getStoryById(this.#storyId);
    return !!story;
  }

  async showSaveButton() {
    const isSaved = await this.#isStorySaved();
    if (isSaved) {
      this.#view.renderRemoveButton();
    } else {
      this.#view.renderSaveButton();
    }
  }

  async saveStoryToBookmark(storyData) {
    if (!storyData || !storyData.id) {
      showNotification('Data cerita tidak lengkap untuk disimpan.');
      return;
    }
    try {
      await this.#dbModel.putStory(storyData);
      showNotification('Cerita berhasil disimpan ke bookmark!');
      await this.showSaveButton();
    } catch (error) {
      console.error('saveStoryToBookmark: error:', error);
      showNotification(`Gagal menyimpan cerita: ${error.message}`);
    }
  }

  async removeStoryFromBookmark() {
    if (!this.#storyId) {
      showNotification('ID Cerita tidak ditemukan untuk dihapus.');
      return;
    }
    try {
      await this.#dbModel.deleteStory(this.#storyId);
      showNotification('Cerita berhasil dihapus dari bookmark!');
      await this.showSaveButton();
    } catch (error) {
      console.error('removeStoryFromBookmark: error:', error);
      showNotification(`Gagal menghapus cerita: ${error.message}`);
    }
  }
}
