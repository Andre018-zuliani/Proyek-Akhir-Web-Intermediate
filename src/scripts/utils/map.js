import { map, tileLayer, Icon, icon, marker, popup, latLng, control } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MAP_SERVICE_API_KEY } from '../config';

export default class Map {
  #zoom = 5;
  #map = null;
  #baseLayers = {};

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }

  static async getPlaceNameByCoordinate(latitude, longitude) {
    // Menghapus pengecekan 'YOUR_KEY' di sini. Sekarang, selalu coba panggil API.
    // Jika MAP_SERVICE_API_KEY tidak valid, error 403 atau SyntaxError akan muncul lagi.
    try {
      const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
      url.searchParams.set('key', MAP_SERVICE_API_KEY);
      url.searchParams.set('language', 'id');
      url.searchParams.set('limit', '1');
      const response = await fetch(url);

      // Periksa status respons sebelum mencoba parsing JSON
      if (!response.ok) {
        const errorText = await response.text(); // Ambil teks error jika tidak OK
        console.error(
          `MapTiler Geocoding API returned an error: ${response.status} ${response.statusText} - ${errorText}`,
        );
        throw new Error(`MapTiler Geocoding API error: ${response.status}`);
      }

      const json = await response.json();
      if (json.features && json.features.length > 0) {
        const place = json.features[0].place_name.split(', ');
        return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
      }
      return `${latitude}, ${longitude}`; // Fallback jika tidak ada fitur yang ditemukan
    } catch (error) {
      console.error('getPlaceNameByCoordinate: error:', error);
      // Fallback jika ada error fetch atau parsing
      return `${latitude}, ${longitude}`;
    }
  }

  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API unsupported');
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async build(selector, options = {}) {
    if ('center' in options && options.center) {
      return new Map(selector, options);
    }

    const jakartaCoordinate = [-6.2, 106.816666];

    if ('locate' in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [position.coords.latitude, position.coords.longitude];

        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        console.error('build: error:', error);

        return new Map(selector, {
          ...options,
          center: jakartaCoordinate,
        });
      }
    }

    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;

    const osmTileLayer = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    const stadiaAlidadeSmoothDark = tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    );

    this.#map = map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [osmTileLayer],
      ...options,
    });

    this.#baseLayers = {
      'OpenStreetMap': osmTileLayer,
      'Stadia Alidade Smooth Dark': stadiaAlidadeSmoothDark,
    };

    control.layers(this.#baseLayers).addTo(this.#map);
  }

  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(latLng(coordinate), this.#zoom);
      return;
    }
    this.#map.setView(latLng(coordinate), zoomLevel);
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions must be an object');
    }
    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });
    if (popupOptions) {
      if (typeof popupOptions !== 'object') {
        throw new Error('popupOptions must be an object');
      }
      if (!('content' in popupOptions)) {
        throw new Error('popupOptions must include `content` property.');
      }
      const newPopup = popup(coordinates, popupOptions);
      newMarker.bindPopup(newPopup);
    }
    newMarker.addTo(this.#map);
    return newMarker;
  }
}
