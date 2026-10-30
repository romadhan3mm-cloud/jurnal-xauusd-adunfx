# v1.9.77 — Input Transaksi: font dan jarak ikut lebar kartu (seperti tabel Simulasi)

Hanya menyentuh `src/TradingJournal.jsx` (bagian kartu Input Transaksi) dan versi di `package.json`.

## Perubahan
- Tabel entri: font isi 13px menjadi `s(13, 10)` (±10px di HP), jarak sel `s(10, 5)` atas-bawah dan `s(6, 3)` kiri-kanan (sebelumnya 10px), jarak sel isian `s(8, 4)` dan `s(3, 2)`.
- Judul kolom: `s(12, 9.5)` dan berwarna biru, sama dengan tabel Simulasi.
- Batas lebar minimum tabel 780px dihapus; tabel kini selebar isinya dan hanya bergeser jika benar-benar tidak muat.
- Lingkaran ikon kalender di kolom Tanggal mengikuti lebar kartu.
- Tombol bulan aktif, Bulan Baru, Tambah Transaksi, keterangan tanggal, dan teks "Belum ada entry" memakai skala yang sama.

## Tidak berubah
Kolom isian (lebar 72px dan font 16px di HP supaya iOS tidak zoom saat mengetik), tinggi tombol (42px), menu titik tiga, perhitungan, state, penyimpanan, dan semua file lain.

## Pengujian
Sintaks JSX dicek dengan tsc. Belum diuji build Vite penuh dan perangkat nyata.
