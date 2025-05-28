// src/scripts/data/indexeddb-manager.js

import { openDB } from 'idb';

// Pastikan konstanta ini didefinisikan di sini dan tidak dikomentari
const DATABASE_NAME = 'storyapp-db'; // Atau nama yang Anda inginkan
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'bookmarked-stories'; // Atau nama yang Anda inginkan

// Hapus impor yang gagal dari config.js untuk konstanta ini jika Anda memilih opsi ini
// import { DATABASE_NAME, DATABASE_VERSION, OBJECT_STORE_NAME } from '../config'; // HAPUS BARIS INI

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      database.createObjectStore(OBJECT_STORE_NAME, {
        keyPath: 'id',
      });
      console.log(`Object store "${OBJECT_STORE_NAME}" created.`); // Sekarang ini akan log nama yang benar
    }
  },
});

const StoryAppDB = {
  async getStoryById(id) {
    if (!id) {
      return undefined;
    }
    // Pastikan OBJECT_STORE_NAME di sini juga menggunakan konstanta yang sudah didefinisikan dengan benar
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async putStory(story) {
    if (!story || typeof story.id === 'undefined') {
      throw new Error('`id` is required to save the story.');
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    if (!id) {
      return 0;
    }
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default StoryAppDB;
