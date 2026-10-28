# TraderLogs v1.9.34 — AI News integrated package

Paket ini menggabungkan halaman AI News, endpoint Worker, kalender dari XOOMAR, analisis fundamental menggunakan Cloudflare Workers AI, scheduler Cron H-30/H-5, penyimpanan idempotensi/subscription di KV, dan Web Push.

## Penting sebelum production deploy

ZIP berhasil dibuka bukan berarti fitur server aktif. Deployment production memerlukan konfigurasi Cloudflare satu kali:

1. Buat namespace KV bernama `ALERTS_KV` di akun Cloudflare.
2. Periksa `wrangler.jsonc`: pastikan `ALERTS_KV.id` adalah ID namespace yang benar dari akun Cloudflare target. Jangan mengganti ID yang sudah ada sebelum memverifikasinya; jika belum benar, ganti dengan ID namespace hasil pembuatan di akun target.
3. Pastikan Workers AI tersedia untuk akun dan binding `AI` diaktifkan.
4. Buat pasangan VAPID P-256 (public key 65-byte uncompressed dan private key 32-byte raw, keduanya base64url). Simpan sebagai Worker secrets `VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY`; jangan commit private key ke GitHub. Tambahkan secret `VAPID_SUBJECT` misalnya `mailto:alamat-email-yang-kamu-kontrol`.
5. Deploy Worker yang sama dengan static assets melalui konfigurasi `wrangler.jsonc`. Jika proyek Cloudflare yang terhubung ke GitHub saat ini tidak membaca konfigurasi Worker ini, build website bisa sukses tanpa scheduler berjalan; cek `/api/ai-news/health` setelah deploy.
6. Uji endpoint `/api/ai-news/health`. Harus menunjukkan `scheduler:true`, `ai:true`, dan `push:true`. Jika belum, jangan anggap scheduler/push aktif.
7. Untuk iPhone, iOS/iPadOS 16.4+ dan web app yang ditambahkan ke Home Screen diperlukan untuk Web Push. Buka TraderLogs dari ikon Home Screen, tekan Aktifkan Notifikasi, lalu izinkan.
8. Uji kegagalan push dan pastikan retry maksimal 3 kali bekerja; retry hanya dapat dilakukan selama pengingat masih dalam jendela pemulihan 5 menit. Perangkat yang sudah menerima push tidak dikirimi ulang saat perangkat lain gagal menerima notifikasi.

## Endpoint

- `GET /api/ai-news/health`
- `GET /api/ai-news/events`
- `POST /api/ai-news/analyze` dengan `{ "event": { ... } }`
- `GET /api/ai-news/push-key`
- `POST /api/ai-news/subscribe`
- `POST /api/ai-news/unsubscribe`
- `GET /api/ai-news/alerts`

## Keterbatasan / keselamatan

- Sumber kalender adalah XOOMAR. Integrasi ini tidak mengarang consensus forecast; bila provider tidak menyediakannya, analisis menyatakan tidak tersedia.
- Feed harga XAU/USD real-time tidak dihubungkan oleh paket ini, sehingga reaksi harga aktual akan dinyatakan tidak tersedia kecuali ada data dari sumber yang terhubung.
- AI bersifat edukatif dan tidak memberi sinyal BUY/SELL. Jangan gunakan output AI sebagai satu-satunya dasar trading.
- Worker menyimpan subscription push dan marker idempotensi di KV. Push endpoint yang sudah tidak valid dibersihkan saat pengiriman.
- Pengingat kalender dijalankan melalui Cron setiap menit; ketersediaan bergantung pada status Worker, KV, provider kalender, dan konfigurasi push.
- RiskGuard, journal math, dan skema Supabase tidak sengaja diubah.


### Pemeriksaan kesegaran data sumber
Endpoint AI News meneruskan `sourceUpdatedAt` dari provider (bukan menggantinya dengan waktu fetch). Jika sumber melaporkan pembaruan lebih lama dari 24 jam, halaman AI News menampilkan peringatan. Status ini hanya menilai timestamp yang disediakan provider; bukan jaminan bahwa seluruh nilai ekonomi telah diverifikasi secara independen.


## Status fitur pra-deploy
- **Analisis AI** memakai endpoint `/api/ai-news/analyze` dan membutuhkan binding Workers AI `AI`.
- **Pengingat berita** membutuhkan Cron Worker aktif, KV `ALERTS_KV`, dan secret VAPID. Periksa `lastRun` pada `/api/ai-news/health`; binding KV saja tidak membuktikan Cron sudah berjalan.
- **Risk Awareness** menggunakan jadwal rilis ekonomi untuk peringatan dan checklist risiko. Fitur ini bukan feed harga/spread real-time, bukan sinyal entry, dan tidak mengubah RiskGuard.
- Sebelum deploy production, jalankan `npm install` lalu `npm run build`; uji endpoint health/events/analyze, kemudian lakukan uji Web Push ke perangkat nyata.
