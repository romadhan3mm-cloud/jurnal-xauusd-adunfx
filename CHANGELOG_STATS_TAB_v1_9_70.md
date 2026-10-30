# v1.9.70 — Tombol periode Statistik: kotak emas, tanpa garis pembatas

Hanya menyentuh `src/StatsCard.jsx` (tampilan) dan versi di `package.json`.

## Perubahan
- Tombol periode terpilih (HARIAN / MINGGUAN / BULANAN / TAHUNAN) kini kotak emas: garis emas, latar emas transparan, cahaya tipis, label emas. Warna persentase tetap hijau/merah menurut untung-rugi.
- Garis pembatas vertikal antar tombol dihapus.

## Tidak berubah
Perhitungan, data grafik, state periode, prop, kartu angka, cincin winrate, dan semua file lain.

## Pengujian
Sintaks JSX dicek dengan esbuild. Belum diuji build Vite penuh dan perangkat nyata.
