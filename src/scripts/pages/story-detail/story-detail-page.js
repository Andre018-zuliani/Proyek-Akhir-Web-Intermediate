// src/scripts/pages/story-detail/story-detail-page.js
import {
  // ... (impor lainnya)
  generateSaveStoryButtonTemplate,
  generateRemoveStoryButtonTemplate,
} from '../../templates';
import StoryDetailPresenter from './story-detail-presenter'; //
import { parseActivePathname } from '../../routes/url-parser'; //
import * as StoriesAPI from '../../data/api'; //
import Map from '../../utils/map'; //
import showNotification from '../../utils/notification-handler'; //
// Impor fungsi IndexedDB
import { addStoryToDB, getStoryByIdFromDB, deleteStoryFromDB } from '../../data/indexeddb-manager';

export default class StoryDetailPage {
  #presenter = null;
  #storyData = null; // Untuk menyimpan data story yang sedang ditampilkan
  #map = null; //
  #storyId = null; //

  // ... (render, afterRender seperti sebelumnya) ...

  async afterRender() {
    //
    this.#storyId = parseActivePathname().id; //
    this.#presenter = new StoryDetailPresenter({
      //
      view: this,
      apiModel: StoriesAPI, //
      storyId: this.#storyId,
    });
    // Hapus #setupForm() jika tidak lagi relevan atau sesuaikan
    // this.#setupForm();

    await this.#presenter.showStoryDetail();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    //
    this.#storyData = story; // Simpan data story
    // ... (sisa kode rendering template detail story) ...
    document.getElementById('report-detail').innerHTML = generateStoryDetailTemplate({
      /* ...story data... */
    }); //

    // ... (logika peta) ...
    if (
      story.location &&
      typeof story.location.latitude === 'number' &&
      typeof story.location.longitude === 'number'
    ) {
      // ...
      await this.initialMap(); //
      // ...
    }

    await this.renderSaveButton(story.id); // Ubah jadi async
    this.addNotifyMeEventListener(); //
  }

  // ... (populateStoryDetailError, initialMap, loading functions, addNotifyMeEventListener seperti sebelumnya) ...

  async renderSaveButton(storyId) {
    // Ubah jadi async
    // Cek apakah story sudah ada di IndexedDB
    const bookmarkedStory = await getStoryByIdFromDB(storyId);
    const isBookmarked = !!bookmarkedStory;

    if (isBookmarked) {
      document.getElementById('save-actions-container').innerHTML =
        generateRemoveStoryButtonTemplate(); //
      document.getElementById('story-detail-remove').addEventListener('click', async () => {
        await this.removeStoryFromBookmark(storyId);
      });
    } else {
      document.getElementById('save-actions-container').innerHTML =
        generateSaveStoryButtonTemplate(); //
      document.getElementById('story-detail-save').addEventListener('click', async () => {
        // Pastikan #storyData ada sebelum menyimpan
        if (this.#storyData) {
          await this.saveStoryToBookmark(this.#storyData); // Kirim seluruh objek story
        } else {
          showNotification('Data story tidak tersedia untuk disimpan.'); //
        }
      });
    }
  }

  async saveStoryToBookmark(storyToSave) {
    // Terima objek story
    try {
      // Tidak perlu fetch lagi dari API karena kita sudah punya #storyData
      // Data story yang disimpan harus berupa objek JavaScript biasa,
      // bukan respons API mentah jika sebelumnya Anda menyimpannya demikian.
      // Pastikan storyToSave adalah objek yang bersih.
      await addStoryToDB(storyToSave);
      showNotification('Story berhasil disimpan ke IndexedDB!'); //
      await this.renderSaveButton(storyToSave.id);
    } catch (error) {
      console.error('Error saving story to IndexedDB:', error);
      showNotification(`Terjadi kesalahan saat menyimpan story: ${error.message}`); //
    }
  }

  async removeStoryFromBookmark(storyId) {
    try {
      await deleteStoryFromDB(storyId);
      showNotification('Story berhasil dibuang dari IndexedDB!'); //
      await this.renderSaveButton(storyId);
    } catch (error) {
      console.error('Error removing story from IndexedDB:', error);
      showNotification(`Gagal membuang story: ${error.message}`);
    }
  }
}
