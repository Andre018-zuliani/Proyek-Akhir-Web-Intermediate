// src/scripts/templates.js
import { showFormattedDate } from './utils';

export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateMainNavigationListTemplate() {
  return `
    <li><a id="report-list-button" class="report-list-button" href="#/">Daftar Story</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Story Tersimpan</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

// HANYA SATU DEFINISI INI:
// Ini adalah versi yang dimodifikasi agar tombol subscribe/unsubscribe bisa diletakkan di samping "Buat Story"
export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li class="nav-item-group">
      <a id="new-report-button" class="btn new-report-button" href="#/new">Buat Story <i class="fas fa-plus"></i></a>
      <span id="push-notification-button-container"></span>
    </li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateStoriesListEmptyTemplate() {
  // ... (sisa fungsi tetap sama)
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>Tidak ada story yang tersedia</h2>
      <p>Saat ini, tidak ada story yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  // ... (sisa fungsi tetap sama)
  return `
    <div id="stories-list-error" class="stories-list__error">
      <h2>Terjadi kesalahan pengambilan daftar story</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function generateStoryDetailErrorTemplate(message) {
  // ... (sisa fungsi tetap sama)
  return `
    <div id="story-detail-error" class="reports-detail__error">
      <h2>Terjadi kesalahan pengambilan detail story</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function generateStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  location,
}) {
  // ... (sisa fungsi tetap sama)
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img class="story-item__image" src="${photoUrl}" alt="${description}">
      <div class="story-item__body">
        <div class="story-item__main">
          <h2 class="story-item__title">${description}</h2>
          <div class="story-item__more-info">
            <div class="story-item__createdat">
              <i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, 'id-ID')}
            </div>
            <div class="story-item__location">
              <i class="fas fa-map"></i> ${location.placeName || `${location.latitude}, ${location.longitude}`}
            </div>
          </div>
        </div>
        <div class="story-item__author">
          Dibuat oleh: ${name}
        </div>
        <a class="btn story-item__read-more" href="#/stories/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function generateStoryDetailTemplate({
  id,
  name,
  description,
  photoUrl,
  location,
  createdAt,
}) {
  // ... (sisa fungsi tetap sama)
  const createdAtFormatted = showFormattedDate(createdAt, 'id-ID');

  return `
       <div class="report-detail__header">
      <h1 id="title" class="report-detail__title">${description}</h1>
 
      <div class="report-detail__more-info">
        <div class="report-detail__more-info__inline">
          <div id="createdat" class="report-detail__createdat" data-value="${createdAtFormatted}"><i class="fas fa-calendar-alt"></i></div>
          <div id="location-place-name" class="report-detail__location__place-name" data-value="${location.placeName}"><i class="fas fa-map"></i></div>
        </div>
        <div class="report-detail__more-info__inline">
          <div id="location-latitude" class="report-detail__location__latitude" data-value="${location.latitude}">Latitude:</div>
          <div id="location-longitude" class="report-detail__location__longitude" data-value="${location.longitude}">Longitude:</div>
        </div>
        <div id="author" class="report-detail__author" data-value="${name}">Dibuat oleh:</div>
      </div>
 
      </div>

    <div class="container">
      <div class="report-detail__images__container">
        <div id="images" class="report-detail__images">
          <img class="report-detail__image" src="${photoUrl}" alt="${description}">
        </div>
      </div>
    </div>

    <div class="container">
      <div class="report-detail__body">
        <div class="report-detail__body__description__container">
          <h2 class="report-detail__description__title">Informasi Lengkap</h2>
          <div id="description" class="report-detail__description__body">
            ${description}
          </div>
        </div>
        <div class="report-detail__body__map__container">
          <h2 class="report-detail__map__title">Peta Lokasi</h2>
          <div class="report-detail__map__container">
            <div id="map" class="report-detail__map"></div>
            <div id="map-loading-container"></div>
          </div>
        </div>
  
        <hr>
  
        <div class="report-detail__body__actions__container">
          <h2>Aksi</h2>
          <div class="report-detail__actions__buttons">
            <div id="save-actions-container"></div>
            <div id="notify-me-actions-container">
              <button id="report-detail-notify-me" class="btn btn-transparent">
                Coba Notifikasi <i class="far fa-bell"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function generateSubscribeButtonTemplate() {
  // ... (sisa fungsi tetap sama)
  return `
    <button id="subscribe-button" class="btn btn-outline subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  // ... (sisa fungsi tetap sama)
  return `
    <button id="unsubscribe-button" class="btn btn-outline unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveStoryButtonTemplate() {
  // ... (sisa fungsi tetap sama)
  return `
    <button id="story-detail-save" class="btn btn-transparent">
      Simpan story <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateRemoveStoryButtonTemplate() {
  // ... (sisa fungsi tetap sama)
  return `
    <button id="story-detail-remove" class="btn btn-transparent">
      Buang story <i class="fas fa-bookmark"></i>
    </button>
  `;
}
