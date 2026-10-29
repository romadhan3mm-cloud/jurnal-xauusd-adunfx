# v1.9.37 — AI News: perbaikan Calendar HTTP 429

Hanya menyentuh `worker/ai-news-worker.js` dan versi di `package.json`.

## Masalah
Cron memanggil XOOMAR setiap menit (sekitar 1.440 kali per hari), sehingga provider membalas HTTP 429 dan `lastRun` berstatus error.

## Perubahan
- Kalender disimpan di KV (`cache:calendar`) selama 10 menit. Cron dan `/api/ai-news/events` memakai salinan itu, sehingga XOOMAR hanya dipanggil sekitar sekali per 10 menit.
- Jika XOOMAR gagal (termasuk 429) tetapi ada salinan yang umurnya di bawah 6 jam, salinan lama dipakai. Status `lastRun` tetap `ok` dengan `calendar:"stale"` dan field `warning`.
- Penulisan `meta:last-run` dibatasi (maksimal sekali per 5 menit jika statusnya sama), agar tidak melewati batas 1.000 penulisan KV per hari pada paket gratis.
- Header `user-agent` ditambahkan pada permintaan ke XOOMAR.

## Pengujian lokal
429 tanpa cache tercatat sebagai error tanpa crash; error berulang hanya menulis last-run sekali; run berikutnya memakai cache (0 panggilan ke XOOMAR); 429 dengan cache lama memakai cache dan `/events` tidak 502. Seluruh pengujian Web Push sebelumnya tetap lulus.

## Belum terverifikasi
Apakah XOOMAR memblokir permintaan dari IP Cloudflare secara permanen. Jika 429 tetap muncul pada panggilan pertama setelah deploy, perlu sumber kalender alternatif.
