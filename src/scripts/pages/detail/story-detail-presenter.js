// src/scripts/pages/detail/story-detail-presenter.js
import { storyMapper } from '../../data/api-mapper'; // Perubahan di sini

export default class StoryDetailPresenter {
  #view;
  #apiModel;
  // #reportId; // Hapus baris ini
  #storyId;

  constructor({ view, apiModel, storyId }) { // Hapus reportId dari parameter constructor
    this.#view = view;
    this.#apiModel = apiModel;
    // this.#reportId = reportId; // Hapus baris ini
    this.#storyId = storyId;
  }

  async showStoryDetail() { // Ganti nama fungsi menjadi showStoryDetail
    console.log('showStoryDetail called'); // Tambahkan ini untuk debugging
    this.#view.showStoryDetailLoading(); // Ganti showReportDetailLoading
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId); // Ganti getReportById dan gunakan #storyId

      if (!response.ok) {
        console.error('showStoryDetail: response:', response); // Sesuaikan log
        this.#view.populateStoryDetailError(response.message); // Sesuaikan populateReportDetailError
        return;
      }

      const story = await storyMapper(response.story); // Ganti reportMapper dan gunakan response.story
      console.log('Mapped story:', story); // Log story setelah mapping
      this.#view.populateStoryDetailAndInitialMap(response.message, story); // Sesuaikan populateReportDetailAndInitialMap
    } catch (error) {
      console.error('showStoryDetail: error:', error); // Sesuaikan log
      this.#view.populateStoryDetailError(error.message); // Sesuaikan populateReportDetailError
    } finally {
      this.#view.hideStoryDetailLoading(); // Ganti hideReportDetailLoading
    }
  }
}