// src/scripts/data/api.js
import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  MY_USER_INFO: `${BASE_URL}/users/me`, // Not directly in new API, but keep for now if used elsewhere

  // Stories
  STORIES_LIST: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  STORE_NEW_STORY: `${BASE_URL}/stories`,
  STORE_NEW_STORY_GUEST: `${BASE_URL}/stories/guest`, // New endpoint for guest stories

  // Story Comment - These endpoints are not in the new API, will be removed or commented out later if unused
  STORY_COMMENTS_LIST: (storyId) => `${BASE_URL}/stories/${storyId}/comments`,
  STORE_NEW_STORY_COMMENT: (storyId) => `${BASE_URL}/stories/${storyId}/comments`,

  // Notification (jika ingin diganti juga)
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  SEND_STORY_TO_ME: (storyId) => `${BASE_URL}/stories/${storyId}/notify-me`, // Not in new API
  SEND_STORY_TO_USER: (storyId) => `${BASE_URL}/stories/${storyId}/notify`, // Not in new API
  SEND_STORY_TO_ALL_USER: (storyId) => `${BASE_URL}/stories/${storyId}/notify-all`, // Not in new API
  SEND_COMMENT_TO_STORY_OWNER: (storyId, commentId) =>
    `${BASE_URL}/stories/${storyId}/comments/${commentId}/notify`, // Not in new API
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getMyUserInfo() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories(page = 1, size = 10, location = 0) {
  // Menambahkan parameter page, size, location
  const accessToken = getAccessToken();
  const url = new URL(ENDPOINTS.STORIES_LIST);
  url.searchParams.set('page', page);
  url.searchParams.set('size', size);
  url.searchParams.set('location', location); // 1 for stories with location, 0 for all

  const fetchResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getStoryById(id) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function storeNewStory({
  description, // Mengubah dari title, damageLevel, description, evidenceImages
  photo, // Mengubah dari evidenceImages
  latitude, // Mengubah dari latitude
  longitude, // Mengubah dari longitude
}) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.set('description', description);
  formData.append('photo', photo); // 'photo' for single file, not 'evidenceImages'
  if (latitude !== undefined && latitude !== null) {
    // Add lat and lon if provided
    formData.set('lat', latitude);
  }
  if (longitude !== undefined && longitude !== null) {
    // Add lat and lon if provided
    formData.set('lon', longitude);
  }

  const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_STORY, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

// Menambahkan fungsi untuk Add New Story with Guest Account
export async function storeNewStoryGuest({ description, photo, latitude, longitude }) {
  const formData = new FormData();
  formData.set('description', description);
  formData.append('photo', photo);
  if (latitude !== undefined && latitude !== null) {
    formData.set('lat', latitude);
  }
  if (longitude !== undefined && longitude !== null) {
    formData.set('lon', longitude);
  }

  const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_STORY_GUEST, {
    method: 'POST',
    body: formData,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

// Fungsi-fungsi terkait komentar dan notifikasi (kecuali subscribe/unsubscribe)
// tidak ada di API baru, jadi kita bisa mengomentarinya atau menghapusnya jika tidak digunakan.
// Untuk saat ini, saya akan mengomentari yang tidak ada di API baru.

/*
export async function getAllCommentsByStoryId(storyId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.STORY_COMMENTS_LIST(storyId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function storeNewCommentByStoryId(storyId, { body }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ body });

  const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_STORY_COMMENT(storyId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
*/

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
  });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
