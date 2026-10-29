# v1.9.43 — AI News: alasan kegagalan Forex Factory terlihat

Hanya `worker/ai-news-worker.js` dan versi di `package.json`.

## Masalah
Saat Forex Factory gagal, `enrichment.warning` hanya berisi pesan jeda, sehingga penyebab asli (mis. HTTP 403/429) tidak terlihat.

## Perubahan
- Alasan kegagalan asli (status HTTP dan potongan isi balasan hingga 120 karakter) disimpan bersama jeda 2 menit dan ditampilkan di `enrichment.warning`.
- Perilaku lain tidak berubah.
