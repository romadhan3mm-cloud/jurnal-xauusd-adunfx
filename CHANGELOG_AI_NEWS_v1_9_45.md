# v1.9.45 — AI News: tahan terhadap HTTP 429 dari Forex Factory

Menyentuh `worker/ai-news-worker.js`, `src/EconomicCalendar.jsx` (satu catatan kaki), dan versi di `package.json`.

## Temuan
`nfs.faireconomy.media` hidup tetapi membalas HTTP 429 (pembatasan per IP) ke Worker; `cdn-nfs.faireconomy.media` mati (1016).

## Perubahan
- Setelah 429, Worker menunggu 15 menit (bukan 2 menit) sebelum mencoba lagi dan tidak lagi mencoba alamat kedua pada putaran yang sama.
- Salinan terakhir yang berhasil dipakai hingga 3 hari (sebelumnya 12 jam); `enrichment.fetchedAt` menunjukkan umurnya dan kalender memberi catatan jika angka FF berasal dari salinan lama.
- Perilaku lain tidak berubah.

## Belum terverifikasi
Apakah pembatasan 429 hanya sementara. Jika 429 terus berulang, sumber ini tidak bisa dipakai dari Cloudflare Worker.
