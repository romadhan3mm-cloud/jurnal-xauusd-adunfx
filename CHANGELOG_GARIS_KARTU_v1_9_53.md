# v1.9.53 — Garis pembatas tipis di semua kartu Jurnal & Simulasi

Menyentuh `src/TradingJournal.jsx`, `src/TargetSimulator.jsx`, `src/StatsCard.jsx`, dan versi di `package.json`.

## Perubahan
- Setiap kartu di menu Jurnal (perbandingan antar bulan, arsip, bulan baru, input & tabel entri, pertumbuhan saldo, referensi lot modal) dan menu Simulasi (konstanta `card`) kini punya garis 1px `var(--border-inner)`, sama seperti kotak di dalam Risk Guard.
- Kartu Statistik (v1.9.52) dinetralkan: garis biru dan glow diganti garis tipis netral, termasuk kotak-kotak di dalamnya.
- Garis berwarna (hijau/kuning/merah) tetap hanya milik Risk Guard. Kartu galat merah di Simulasi tetap merah karena itu penanda error.

## Tidak berubah
Semua perhitungan, Risk Guard, menu pop-up/modal, tombol, dan menu lain (Chart, AI News).
