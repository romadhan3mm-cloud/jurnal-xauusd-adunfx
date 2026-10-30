# v1.9.69 — Tombol periode + grafik Statistik jadi satu kartu

Hanya menyentuh `src/StatsCard.jsx` (tampilan) dan versi di `package.json`.

## Perubahan
- Baris tombol HARIAN / MINGGUAN / BULANAN / TAHUNAN dan grafik Profit vs Loss kini berada dalam satu kartu dalam (garis biru, sudut membulat) di dalam kartu utama Statistik.
- Tombol terpilih ditandai kotak hijau transparan dengan garis dan cahaya hijau (sebelumnya emas + garis bawah), seperti gambar acuan.
- Garis pemisah antar tombol disembunyikan di samping tombol terpilih.

## Tidak berubah
Perhitungan, data grafik, state periode, prop, kartu angka, cincin winrate, dan semua file lain.

## Pengujian
Sintaks JSX dicek dengan esbuild. Belum diuji build Vite penuh dan perangkat nyata.
