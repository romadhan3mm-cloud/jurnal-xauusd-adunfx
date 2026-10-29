# v1.9.62 — Kartu Pertumbuhan Saldo dan Rekomendasi Lot mengikuti standar kartu berjudul

Menyentuh `src/TradingJournal.jsx`, `src/RecommendationCard.jsx` (baru), dan versi di `package.json`.

## Perubahan
- Pertumbuhan Saldo: memakai CardShell + CardHeader yang sama dengan Statistik dan Input Transaksi (kartu luar, ikon bulat, judul + subjudul, garis pembatas biru). Lencana emas GRAFIK di kanan membuka menu tampilan grafik (Garis / Batang / Area) yang sama seperti sebelumnya; menu titik tiga lama dihapus.
- Rekomendasi Lot: kartu baru `RecommendationCard.jsx` dengan header standar, lencana CAPITAL LOT REF, tiga kartu angka (Lot / Layer, Max Layer, Budget Rugi/Hari), kotak catatan Asumsi, dan tombol emas Capital Lot Reference. Lencana dan tombol sama-sama membuka/menutup tabel referensi.

## Tidak berubah
Isi dan perhitungan grafik (tipe garis/batang/area, data, tooltip), computeLotRecommendation, isi tabel Capital Lot Reference, peringatan modal terlalu kecil, serta kartu lain.

## Catatan
Saldo saat ini tidak lagi tampil di judul kartu Rekomendasi (mengikuti gambar acuan).

## Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.
