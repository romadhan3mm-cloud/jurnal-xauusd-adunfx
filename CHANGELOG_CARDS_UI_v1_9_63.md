# v1.9.63 — Lencana saldo di Rekomendasi Lot + 3 kartu angka vertikal

Hanya menyentuh `src/RecommendationCard.jsx` dan versi di `package.json`.

## Perubahan
- Lencana kanan atas kartu Rekomendasi Lot: tombol CAPITAL LOT REF diganti lencana emas berisi saldo saat ini (ikon dompet + angka). Hanya tampilan, bukan tombol. Tombol Capital Lot Reference di bawah tetap membuka/menutup tabel.
- Kartu Lot / Layer, Max Layer, dan Budget Rugi/Hari: susunan vertikal rata tengah (ikon di atas, label di bawah ikon, angka di paling bawah), sama seperti kartu di Statistik dan Risk Guard. Angka di ketiga kartu sejajar di bawah walau label turun ke dua baris.

## Tidak berubah
Perhitungan, tabel referensi, kotak Asumsi, peringatan modal kecil, kartu Pertumbuhan Saldo, dan semua file lain.

## Pengujian
Belum diuji build Vite penuh dan perangkat nyata.
