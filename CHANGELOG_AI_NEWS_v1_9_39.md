# v1.9.39 — AI News: tombol tes notifikasi

Menyentuh `worker/ai-news-worker.js`, `src/AINews.jsx`, versi di `package.json`.

## Perubahan
- Endpoint baru `POST /api/ai-news/test-push`: mengirim satu push tes hanya ke perangkat pemanggil (berdasarkan endpoint langganannya). Hanya POST, jadi membuka alamatnya di browser tetap "Not found".
- Cooldown 1 menit per perangkat (kunci KV `cooldown:test:*`). Langganan kedaluwarsa (404/410) dihapus otomatis.
- Tombol "Kirim notifikasi tes" muncul di UI setelah perangkat terdaftar.

## Belum terverifikasi
Pengiriman nyata ke perangkat (perlu deploy dan HP).
