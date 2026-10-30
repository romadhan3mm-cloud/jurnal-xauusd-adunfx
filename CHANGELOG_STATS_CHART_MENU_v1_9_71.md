# v1.9.71 — Pilihan jenis grafik Statistik (menu titik 3)

Hanya menyentuh `src/StatsCard.jsx` (tampilan) dan versi di `package.json`.

## Perubahan
- Tombol titik 3 di kartu dalam Statistik, di bawah tombol HARIAN dan di atas angka skala ($32 dst.).
- Dua pilihan: "Area Profit & Loss" (bawaan, tampilan lama) dan "Garis + Batang" (garis profit kumulatif dengan titik putih, batang profit hijau dan loss merah per titik, lencana total di ujung).
- Pilihan berlaku untuk semua periode (Harian/Mingguan/Bulanan/Tahunan).

## Tidak berubah
Perhitungan, data periode, prop, kartu angka, cincin winrate, tombol periode. Batang memakai selisih dari data kumulatif yang sudah ada.

## Pengujian
Belum diuji build Vite dan perangkat nyata.
