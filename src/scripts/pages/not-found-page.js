// src/scripts/pages/not-found-page.js
export default class NotFoundPage {
  async render() {
    return `
      <section class="container text-center">
        <h1>404 - Halaman Tidak Ditemukan</h1>
        <p>Maaf, halaman yang Anda cari tidak ada.</p>
        <a href="#/" class="btn">Kembali ke Beranda</a>
      </section>
    `;
  }

  async afterRender() {
    // Tidak ada aksi khusus setelah render untuk halaman ini
  }
}
