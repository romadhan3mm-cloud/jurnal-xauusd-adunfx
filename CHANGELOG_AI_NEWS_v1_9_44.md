# v1.9.44 — AI News: beberapa alamat feed Forex Factory

Hanya `worker/ai-news-worker.js` dan versi di `package.json`.

## Masalah
Alamat feed `cdn-nfs.faireconomy.media` membalas HTTP 530 (error 1016: origin DNS tidak ditemukan), sehingga Forecast/Previous tidak pernah terisi.

## Perubahan
- Worker mencoba beberapa alamat berurutan (`nfs.faireconomy.media`, lalu `cdn-nfs.faireconomy.media`) untuk tiap file minggu ini dan minggu depan.
- Jika semua gagal, `enrichment.warning` memuat alasan tiap alamat; `enrichment.host` menunjukkan alamat yang berhasil.
- Perilaku lain tidak berubah.

## Belum terverifikasi
Apakah `nfs.faireconomy.media` aktif dan menerima permintaan dari Cloudflare Worker.
