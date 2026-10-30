# v1.9.71 — Capital Lot Reference: satu kartu dengan tabel, tombol persegi

Hanya menyentuh `src/RecommendationCard.jsx` (tampilan) dan versi di `package.json`.

## Perubahan
- Tombol CAPITAL LOT REFERENCE dan tabel (Capital, Lot Size, Max Layers) kini berada dalam satu kartu dalam (garis biru, sudut membulat), tetap di dalam kartu utama Rekomendasi Lot — pola yang sama seperti tombol periode + grafik di Statistik.
- Tabel tidak lagi punya kotak sendiri; langsung di bawah tombol dalam kartu yang sama.
- Bentuk tombol dari pil penuh menjadi persegi bersudut membulat (radius sama dengan tombol periode Statistik). Panah ChevronUp/ChevronDown tetap.

## Tidak berubah
Perhitungan, props, state `showRef`/`onToggleRef`, `CAPITAL_LOT_REF_TIERS`, tiga kartu angka, catatan asumsi, aturan sorot baris, dan semua file lain.

## Pengujian
Sintaks JSX dicek dengan esbuild dan komponen dirender di Chromium (lebar HP, tema gelap). Belum diuji build Vite penuh dan perangkat nyata.
