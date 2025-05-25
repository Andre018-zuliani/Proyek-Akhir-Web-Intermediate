# StoryApp - Aplikasi Berbagi Cerita

## Pengantar

Proyek ini adalah aplikasi web "StoryApp" yang memungkinkan pengguna untuk berbagi cerita mereka, lengkap dengan deskripsi, foto, dan lokasi. Aplikasi ini dibangun sebagai bagian dari pembelajaran pengembangan web.

## Fitur Utama

* **Autentikasi Pengguna:**
    * Registrasi pengguna baru.
    * Login untuk pengguna yang sudah terdaftar.
    * Logout.
* **Manajemen Story:**
    * Menampilkan daftar semua cerita dari pengguna.
    * Membuat story baru dengan deskripsi, foto (bisa dari unggahan atau kamera), dan lokasi (dipilih dari peta).
    * Melihat detail masing-masing story, termasuk peta lokasi.
* **Penyimpanan Lokal (Bookmark):**
    * Menyimpan cerita favorit ke IndexedDB untuk dilihat secara offline.
    * Menampilkan daftar cerita yang sudah di-bookmark.
* **Notifikasi Push:**
    * Pengguna dapat subscribe dan unsubscribe dari notifikasi push.
* **PWA (Progressive Web App):**
    * Dapat diinstal di perangkat (manifest.json dan service worker).
    * Caching aset dan permintaan API untuk fungsionalitas offline.
* **Fitur Tambahan:**
    * Integrasi peta Leaflet untuk menampilkan lokasi cerita dan memilih lokasi saat membuat cerita baru.
    * Carousel gambar menggunakan Tiny Slider (kemungkinan untuk detail cerita jika ada multiple gambar, atau fitur lain).
    * Skip link untuk aksesibilitas.
    * Animasi transisi halaman.

## Teknologi yang Digunakan

* HTML, CSS, JavaScript
* Webpack sebagai module bundler dan build tool.
* Babel untuk transpiling JavaScript.
* LeafletJS untuk peta interaktif.
* Tiny Slider untuk carousel.
* IndexedDB untuk penyimpanan sisi klien.
* Service Worker untuk PWA dan caching.
* API dari `story-api.dicoding.dev`.

## Prasyarat

* Node.js (disarankan versi terbaru)
* npm atau yarn

## Instalasi

1.  Clone repository ini:
    ```bash
    git clone <URL_REPOSITORY_ANDA>
    cd <NAMA_DIREKTORI_PROYEK>
    ```
2.  Pasang seluruh dependensi:
    ```bash
    npm install
    ```

## Scripts yang Tersedia

Di dalam `package.json`, Anda akan menemukan beberapa skrip:

* `npm run build`: Membuat build produksi menggunakan Webpack.
* `npm run start-dev`: Menjalankan server development menggunakan Webpack Dev Server.
* `npm run serve`: Menjalankan server HTTP untuk build yang sudah dibuat (menggunakan `http-server`).
* `npm run prettier`: Memeriksa format kode menggunakan Prettier.
* `npm run prettier:write`: Memformat ulang kode menggunakan Prettier.
* `npm run deploy`: (Jika Anda menambahkannya) Untuk men-deploy aplikasi ke GitHub Pages.

## Struktur Proyek

(Anda bisa menyalin struktur proyek dari README yang lama jika masih relevan, atau menyesuaikannya)
Contoh:
```plaintext
storyapp/
├── package.json            # Informasi dependensi proyek
├── webpack.common.js       # Konfigurasi Webpack (umum)
├── webpack.dev.js          # Konfigurasi Webpack (development)
├── webpack.prod.js         # Konfigurasi Webpack (production)
├── src/                    # Direktori utama untuk kode sumber
│   ├── index.html          # Berkas HTML utama
│   ├── public/             # Direktori aset publik (gambar, manifest, dll.)
│   ├── scripts/            # Direktori untuk kode JavaScript
│   │   ├── data/           # API, IndexedDB, mapper
│   │   ├── pages/          # Komponen halaman (App, Home, Login, dll.)
│   │   ├── routes/         # Logika routing
│   │   ├── utils/          # Utilitas (auth, map, camera, dll.)
│   │   ├── config.js       # Konfigurasi aplikasi
│   │   ├── index.js        # Entry point JavaScript utama
│   │   └── templates.js    # Template HTML dinamis
│   ├── styles/             # File CSS
│   └── sw.js               # Service Worker
└── dist/                   # Direktori output build (dihasilkan oleh webpack)
