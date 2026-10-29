# v1.9.38 — AI News: dukungan kunci API XOOMAR

Hanya menyentuh `worker/ai-news-worker.js` dan versi di `package.json`.

## Masalah
Tanpa kunci, XOOMAR membatasi 30 permintaan per menit per IP. Worker Cloudflare keluar lewat IP bersama, sehingga permintaan kalender bisa ditolak dengan HTTP 429. Kunci gratis menaikkan batas menjadi 120 per menit.

## Perubahan
- Worker membaca secret opsional `XOOMAR_API_KEY` dan mengirimnya ke XOOMAR.
- Cara pengiriman diatur lewat variabel opsional `XOOMAR_KEY_MODE` (tanpa ubah kode):
  - kosong atau `x-api-key` (bawaan): header `x-api-key`
  - `Bearer`: header `Authorization: Bearer ...`
  - `query:NAMA`: parameter di alamat, mis. `query:api_key`
  - nama header lain, mis. `X-Xoomar-Key`
- `/api/ai-news/health` menampilkan `calendarKey:true/false` (kunci tidak pernah ditampilkan).
- Jika XOOMAR membalas 401/403, pesan error menyarankan memeriksa `XOOMAR_API_KEY` dan `XOOMAR_KEY_MODE`.

## Belum terverifikasi
Format pengiriman kunci yang diterima XOOMAR (dokumentasi tidak dapat dibuka dari lingkungan kerja). Bawaan `x-api-key` adalah tebakan paling umum; jika ditolak, ubah `XOOMAR_KEY_MODE`.
