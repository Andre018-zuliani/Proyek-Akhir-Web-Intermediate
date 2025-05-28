// src/scripts/pages/story-detail/story-detail-presenter.js
import { storyMapper } from '../../data/api-mapper'; //
// Impor model database Anda
import StoryAppDB from '../../data/indexeddb-manager'; //
import showNotification from '../../utils/notification-handler'; //

export default class StoryDetailPresenter {
  #view;
  #apiModel;
  #storyId;
  #dbModel; // Tambahkan dbModel

  constructor({ view, apiModel, storyId }) {
    this.#view = view;
    this.#apiModel = apiModel;
    this.#storyId = storyId;
    this.#dbModel = StoryAppDB; // Inisialisasi dbModel
  }

  async showStoryDetail() {
    // ... (kode Anda yang sudah ada untuk menampilkan detail dari API) ...
    // Setelah detail dari API berhasil dimuat dan story tersedia:
    // this.#view.populateStoryDetailAndInitialMap(response.message, story);
    // Tambahkan pemanggilan untuk menampilkan tombol save/remove yang sesuai
    await this.showSaveButton();
  }

  async #isStorySaved() {
    // Cek apakah cerita sudah ada di IndexedDB
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
    // storyData seharusnya adalah data cerita yang sudah lengkap (misalnya dari API atau state)
    if (!storyData || !storyData.id) {
      showNotification('Data cerita tidak lengkap untuk disimpan.'); //
      return;
    }
    try {
      await this.#dbModel.putStory(storyData);
      showNotification('Cerita berhasil disimpan ke bookmark!'); //
      await this.showSaveButton(); // Update tombol
    } catch (error) {
      console.error('saveStoryToBookmark: error:', error);
      showNotification(`Gagal menyimpan cerita: ${error.message}`); //
    }
  }

  async removeStoryFromBookmark() {
    if (!this.#storyId) {
      showNotification('ID Cerita tidak ditemukan untuk dihapus.'); //
      return;
    }
    try {
      await this.#dbModel.deleteStory(this.#storyId);
      showNotification('Cerita berhasil dihapus dari bookmark!'); //
      await this.showSaveButton(); // Update tombol
    } catch (error) {
      console.error('removeStoryFromBookmark: error:', error);
      showNotification(`Gagal menghapus cerita: ${error.message}`); //
    }
  }
}
