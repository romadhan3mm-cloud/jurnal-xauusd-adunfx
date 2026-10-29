# v1.9.52 — Tampilan Statistik baru

Menyentuh `src/StatsCard.jsx` (baru), `src/TradingJournal.jsx`, dan versi di `package.json`.

## Perubahan
- Kartu Statistik diganti mengikuti gambar acuan: header (ikon, judul, subjudul, lencana PERFORMA), cincin winrate (busur emas = porsi menang, sisa biru) dengan 14W - 16L di tengah, empat kartu angka (Total Profit, Total Loss, Komisi, RR), dan baris persentase Harian/Mingguan/Bulanan/Tahunan.
- Ukuran mengikuti lebar kartu (`cqw`), sama seperti Risk Guard. Teks dan latar memakai variabel tema.
- Di `TradingJournal.jsx`, blok Statistik lama (2 mode) diganti satu baris `<StatsCard stats=... growth=... />` plus satu baris import.

## Tidak berubah
`computeStats`, perhitungan persentase periode, `journalMath.js`, Risk Guard, dan semua file lain. State/penyimpanan `tj-stats-style` tidak disentuh (tidak lagi dipakai tampilan).

## Pengujian
Lihat catatan di pesan serah-terima.
