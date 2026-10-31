# v1.9.92 — Grafik Growth % per Bulan disamakan dengan Pertumbuhan Saldo

Hanya menyentuh `src/TradingJournal.jsx` (grafik Growth % per Bulan di kartu Perbandingan) dan versi di `package.json`.

## Perubahan
- Ditambah garis vertikal (sumbu Y) yang jelas, sama dengan grafik Pertumbuhan Saldo (sebelumnya tidak ada).
- Garis horizontal paling bawah (sumbu X) kini solid dan sama jelasnya; garis grid putus-putus paling bawah tidak digambar lagi (memakai `gridWithoutBottom` dari v1.9.91).
- Garis acuan 0% kini solid dengan warna sumbu (sebelumnya putus-putus). Bila semua bulan positif, garis ini berimpit dengan sumbu bawah sehingga tidak terlihat putus-putus; bila ada bulan negatif, ia menjadi garis dasar 0%.

## Tidak berubah
Data, batang dan warnanya, tooltip, grid horizontal lain (tetap putus-putus), dan semua file lain.

## Pengujian
`npm test`: 30 tes lulus. Sintaks JSX dicek dengan tsc. Belum diuji tampilan di HP.
