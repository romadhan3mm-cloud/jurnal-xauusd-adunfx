# v1.9.91 — Garis paling bawah grafik Pertumbuhan Saldo tidak putus-putus

Menyentuh `src/TradingJournal.jsx`, `src/chartUtils.js` (baru), `tests/chartUtils.test.mjs` (baru), dan versi di `package.json`.

## Masalah
Garis grid horizontal paling bawah berimpit dengan sumbu X. Grid berupa garis putus-putus, sehingga garis bawah terlihat putus-putus walau sumbu X sudah solid.

## Perubahan
- Pada ketiga tampilan grafik Pertumbuhan Saldo (Garis, Batang, Area), garis grid paling bawah tidak digambar lagi; yang terlihat hanya sumbu X yang solid, sama seperti sumbu Y.
- Penentuan "garis paling bawah" ada di `isBottomGridLine` (`src/chartUtils.js`, fungsi murni, 3 tes baru). Bila data dari recharts tidak lengkap, garis tetap digambar seperti sebelumnya.

## Tidak berubah
Garis grid lain (tetap putus-putus), data grafik, grafik Perbandingan Bulan, dan semua file lain.

## Pengujian
`npm test`: 30 tes lulus. Sintaks JSX dicek dengan tsc. Belum diuji tampilan di HP (recharts tidak terpasang di lingkungan ini).
