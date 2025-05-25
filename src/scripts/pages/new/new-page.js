// src/scripts/pages/new/new-page.js
import NewPresenter from './new-presenter';
import { convertBase64ToBlob } from '../../utils';
import * as StoriesAPI from '../../data/api';
import { generateLoaderAbsoluteTemplate } from '../../templates';
import Camera from '../../utils/camera';
import Map from '../../utils/map';
import showNotification from '../../utils/notification-handler';

const MAX_FILE_SIZE = 1000000; // 1 MB dalam byte

export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenDocumentation = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="new-report__header">
          <div class="container">
            <h1 class="new-report__header__title">Buat Story Baru</h1>
            <p class="new-report__header__description">
              Silakan lengkapi formulir di bawah untuk membuat Story baru.<br>
              Pastikan Story yang dibuat adalah valid.
            </p>
          </div>
        </div>
      </section>
  
      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Keterangan Story</label>
  
              <div class="new-form__description__container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Masukkan keterangan lengkap Stories. Anda dapat menjelaskan apa kejadiannya, dimana, kapan, dll."
                ></textarea>
              </div>
            </div>
            <div class="form-control">
              <label for="documentations-input" class="new-form__documentations__title">Foto Story</label>
              <div id="documentations-more-info">Anda dapat menyertakan satu foto sebagai dokumentasi.</div>
  
              <div class="new-form__documentations__container">
                <div class="new-form__documentations__buttons">
                  <button id="documentations-input-button" class="btn btn-outline" type="button">
                    Unggah Gambar
                  </button>
                  <input
                    id="documentations-input"
                    name="documentation"
                    type="file"
                    accept="image/*"
                    hidden="hidden"
                    aria-describedby="documentations-more-info"
                  >
                  <button id="open-documentations-camera-button" class="btn btn-outline" type="button">
                    Buka Kamera
                  </button>
                </div>
                <div id="camera-container" class="new-form__camera__container">
                  <video id="camera-video" class="new-form__camera__video">
                    Video stream not available.
                  </video>
                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
  
                  <div class="new-form__camera__tools">
                    <select id="camera-select"></select>
                    <div class="new-form__camera__tools_buttons">
                      <button id="camera-take-button" class="btn" type="button">
                        Ambil Gambar
                      </button>
                    </div>
                  </div>
                </div>
                <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
              </div>
            </div>
    <section class="container">
      <div class="new-form__container">
        <form id="new-form" class="new-form">
          <div class="form-control">
            <div class="new-form__location__title">Lokasi</div>
 
            <div class="new-form__location__container">
              <div class="new-form__location__map__container">
                <div id="map" class="new-form__location__map"></div>
                <div id="map-loading-container"></div>
              </div>
              <div class="new-form__location__lat-lng">
                <input type="number" name="latitude" value="-6.175389" disabled>
                <input type="number" name="longitude" value="106.827139" disabled>
              </div>
            </div>
          </div>
          <div class="form-buttons">
            <span id="submit-button-container">
              <button class="btn" type="submit">Buat Story</button>
            </span>
            <a class="btn btn-outline" href="#/">Batal</a>
          </div>
        </form>
      </div>
    </section>
  `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoriesAPI,
    });
    this.#takenDocumentation = null;

    this.#setupForm(); // <--- Pindahkan pemanggilan #setupForm() ke sini!

    await this.#presenter.showNewFormMap(); // Sekarang ini akan dipanggil setelah #form diinisialisasi
  }

  #setupForm() {
    this.#form = document.getElementById('new-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        description: this.#form.elements.namedItem('description').value,
        photo: this.#takenDocumentation ? this.#takenDocumentation.blob : null,
        latitude: this.#form.elements.namedItem('latitude').value,
        longitude: this.#form.elements.namedItem('longitude').value,
      };

      if (!data.photo) {
        showNotification('Mohon sertakan foto untuk story Anda.');
        return;
      }

      if (data.photo.size > MAX_FILE_SIZE) {
        showNotification(`Ukuran gambar terlalu besar. Maksimal ${MAX_FILE_SIZE / 1000000} MB.`);
        return;
      }

      await this.#presenter.postNewReport(data);
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          showNotification(`Ukuran gambar terlalu besar. Maksimal ${MAX_FILE_SIZE / 1000000} MB.`);
          event.target.value = '';
          this.#takenDocumentation = null;
          await this.#populateTakenPictures();
          return;
        }

        await this.#addTakenPicture(file);
        await this.#populateTakenPictures();
      }
    });

    document.getElementById('documentations-input-button').addEventListener('click', () => {
      this.#form.elements.namedItem('documentation').click();
    });

    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');
        this.#isCameraOpen = cameraContainer.classList.contains('open');

        if (this.#isCameraOpen) {
          event.currentTarget.textContent = 'Tutup Kamera';
          this.#setupCamera();
          await this.#camera.launch();

          return;
        }

        event.currentTarget.textContent = 'Buka Kamera';
        this.#camera.stop();
      });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });

    const centerCoordinate = this.#map.getCenter();
    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: true },
    );

    this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);

    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);
      event.sourceTarget.flyTo(event.latlng);
      this.#updateLatLngInput(event.latlng.lat, event.latlng.lng);
    });
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem('latitude').value = latitude;
    this.#form.elements.namedItem('longitude').value = longitude;
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();

      if (image && image.size > MAX_FILE_SIZE) {
        showNotification(`Ukuran gambar terlalu besar. Maksimal ${MAX_FILE_SIZE / 1000000} MB.`);
        this.#takenDocumentation = null;
        await this.#populateTakenPictures();
        return;
      }

      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    this.#takenDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
  }

  async #populateTakenPictures() {
    const outputsList = document.getElementById('documentations-taken-list');
    outputsList.innerHTML = '';

    if (this.#takenDocumentation) {
      const picture = this.#takenDocumentation;
      const imageUrl = URL.createObjectURL(picture.blob);
      const html = `
        <li class="new-form__documentations__outputs-item">
          <button type="button" data-deletepictureid="${picture.id}" class="new-form__documentations__outputs-item__delete-btn">
            <img src="${imageUrl}" alt="Foto Story">
          </button>
        </li>
      `;
      outputsList.innerHTML = html;

      document
        .querySelector(`button[data-deletepictureid="${picture.id}"]`)
        .addEventListener('click', () => {
          this.#removePicture(picture.id);
          this.#populateTakenPictures();
        });
    }
  }

  #removePicture(id) {
    if (this.#takenDocumentation && this.#takenDocumentation.id === id) {
      this.#takenDocumentation = null;
      return true;
    }
    return false;
  }

  storeSuccessfully(message) {
    console.log(message);
    showNotification('Story berhasil dibuat!');
    this.clearForm();
    this.#takenDocumentation = null;
    this.#populateTakenPictures();
    if (this.#isCameraOpen) {
      this.#camera.stop();
      document.getElementById('camera-container').classList.remove('open');
      document.getElementById('open-documentations-camera-button').textContent = 'Buka Kamera';
      this.#isCameraOpen = false;
    }

    location.hash = '/';
  }

  storeFailed(message) {
    showNotification(`Gagal membuat story: ${message}`);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Buat Story
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Buat Story</button>
    `;
  }
}
