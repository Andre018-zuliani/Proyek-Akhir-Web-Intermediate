// src/scripts/pages/story-detail/story-detail-presenter.js
import { storyMapper } from '../../data/api-mapper';

export default class StoryDetailPresenter {
  #view;
  #apiModel;
  #storyId;

  constructor({ view, apiModel, storyId }) {
    this.#view = view;
    this.#apiModel = apiModel;
    this.#storyId = storyId;
  }

  async showStoryDetail() {
    console.log('showStoryDetail called'); // Tambahkan ini untuk debugging
    this.#view.showStoryDetailLoading();
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);

      if (!response.ok) {
        console.error('showStoryDetail: response:', response);
        this.#view.populateStoryDetailError(response.message); // Memanggil populateStoryDetailError
        return;
      }

      const story = await storyMapper(response.story);
      console.log('Mapped story:', story); // Log story setelah mapping

      this.#view.populateStoryDetailAndInitialMap(response.message, story);
    } catch (error) {
      console.error('showStoryDetail: error:', error);
      this.#view.populateStoryDetailError(error.message); // Memanggil populateStoryDetailError
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }
}
