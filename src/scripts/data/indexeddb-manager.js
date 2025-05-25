// src/scripts/data/indexeddb-manager.js

const DB_NAME = 'storyapp-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'bookmarked-stories';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.errorCode);
      reject(new Error(`IndexedDB error: ${event.target.errorCode}`));
    };

    request.onsuccess = (event) => {
      console.log('Database opened successfully');
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('Upgrading database...');
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        // 'id' akan menjadi keyPath, yang berarti setiap story harus memiliki ID unik.
        // API Anda sudah menyediakan 'id' untuk setiap story.
        const objectStore = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        // Anda bisa menambahkan index jika perlu, misalnya berdasarkan 'createdAt'
        // objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log(`Object store "${OBJECT_STORE_NAME}" created.`);
      }
    };
  });
}

export default openDB;

// src/scripts/data/indexeddb-manager.js (lanjutan)

export async function addStoryToDB(storyData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    // Pastikan storyData memiliki properti 'id'
    if (!storyData || typeof storyData.id === 'undefined') {
      console.error('addStoryToDB: storyData is invalid or missing an id.', storyData);
      return reject(new Error('Story data is invalid or missing an id.'));
    }

    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    // Cek apakah story sudah ada
    const getRequest = objectStore.get(storyData.id);
    getRequest.onsuccess = () => {
      if (getRequest.result) {
        console.log(`Story with id ${storyData.id} already exists in IndexedDB.`);
        // Anda bisa memilih untuk mengupdate atau tidak melakukan apa-apa
        // Untuk contoh ini, kita anggap tidak melakukan apa-apa jika sudah ada
        resolve({ message: 'Story already exists.', alreadyExists: true });
      } else {
        // Jika belum ada, tambahkan
        const addRequest = objectStore.add(storyData);
        addRequest.onsuccess = () => {
          console.log('Story added to IndexedDB:', storyData);
          resolve({ message: 'Story added successfully.', data: addRequest.result });
        };
        addRequest.onerror = (event) => {
          console.error('Error adding story to IndexedDB:', event.target.error);
          reject(new Error(`Error adding story: ${event.target.error}`));
        };
      }
    };
    getRequest.onerror = (event) => {
      console.error('Error checking if story exists in IndexedDB:', event.target.error);
      reject(new Error(`Error checking story: ${event.target.error}`));
    };

    transaction.oncomplete = () => {
      console.log('Add transaction completed.');
    };
    transaction.onerror = (event) => {
      console.error('Add transaction error:', event.target.error);
      reject(new Error(`Transaction error: ${event.target.error}`));
    };
  });
}

// src/scripts/data/indexeddb-manager.js (lanjutan)

export async function getAllStoriesFromDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.getAll(); // Mengambil semua data dari object store

    request.onsuccess = (event) => {
      resolve(event.target.result || []); // Kembalikan array kosong jika tidak ada data
    };

    request.onerror = (event) => {
      console.error('Error getting all stories from IndexedDB:', event.target.error);
      reject(new Error(`Error getting stories: ${event.target.error}`));
    };
  });
}

// Fungsi untuk mengambil satu story berdasarkan ID (opsional, tapi berguna)
export async function getStoryByIdFromDB(storyId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.get(storyId);

    request.onsuccess = (event) => {
      resolve(event.target.result); // Akan undefined jika tidak ditemukan
    };

    request.onerror = (event) => {
      console.error(`Error getting story with id ${storyId} from IndexedDB:`, event.target.error);
      reject(new Error(`Error getting story: ${event.target.error}`));
    };
  });
}

// src/scripts/data/indexeddb-manager.js (lanjutan)

export async function deleteStoryFromDB(storyId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.delete(storyId);

    request.onsuccess = () => {
      console.log(`Story with id ${storyId} deleted from IndexedDB.`);
      resolve({ message: 'Story deleted successfully.' });
    };

    request.onerror = (event) => {
      console.error(`Error deleting story with id ${storyId} from IndexedDB:`, event.target.error);
      reject(new Error(`Error deleting story: ${event.target.error}`));
    };

    transaction.oncomplete = () => {
      console.log('Delete transaction completed.');
    };
    transaction.onerror = (event) => {
      console.error('Delete transaction error:', event.target.error);
      reject(new Error(`Transaction error: ${event.target.error}`));
    };
  });
}
