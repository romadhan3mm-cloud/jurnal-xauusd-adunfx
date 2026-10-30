# v1.9.75 — Risk Guard dan Rekomendasi Lot disamakan dengan standar kartu

Menyentuh `src/CardHeader.jsx`, `src/RiskGuardCard.jsx`, `src/RecommendationCard.jsx`, dan versi di `package.json`.

## Perubahan
- Risk Guard: garis kotak dalam (3 kartu angka, cincin, kotak P/L, catatan) kini biru standar (`INNER_BORDER`), sebelumnya abu-biru netral (`--border-inner`).
- Risk Guard: garis pembatas kepala kini biru; judul 24px (sebelumnya 22px); subjudul 13px (sebelumnya 11.5px); ikon perisai sama besar dengan ikon kepala kartu lain; ukuran dan jarak lencana status mengikuti lencana kepala kartu lain.
- Risk Guard: lencana ikon pakai `IconBadge` bersama (ukuran 40, ikon putih; sebelumnya 44 dan putih kebiruan).
- Biru dan indigo di Risk Guard dan Rekomendasi Lot kini memakai palet `GRAD`; teal (Kerugian bersih tercatat) masuk palet sebagai `GRAD.teal`.

## Tidak berubah
Garis luar kartu Risk Guard yang berganti hijau/kuning/merah menurut status, warna perisai, cincin, perhitungan, props, dan semua file lain. Variabel `--border-inner` di `tjStyles.js` dibiarkan (tidak lagi dipakai).

## Pengujian
Sintaks JSX dicek dengan tsc. Belum diuji build Vite penuh dan perangkat nyata.
