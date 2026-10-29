# v1.9.53 — Tampilan Perbandingan Antar Bulan & Input Transaksi

Menyentuh `src/CardHeader.jsx` (baru), `src/TradingJournal.jsx`, dan versi di `package.json`.

## Perubahan
- Perbandingan Antar Bulan: kartu bulat dengan garis biru + kilau, ikon bulat, judul, subjudul biru, dan tombol GRAFIK (garis emas) untuk buka/tutup grafik dan tabel.
- Tab bulan: bulan aktif berbingkai emas dengan ikon kalender; "+ Bulan Baru" garis putus-putus biru.
- Input Transaksi: kepala kartu (ikon daftar, judul, subjudul), tombol titik tiga bulat, tombol "Tambah Transaksi" selebar kartu berbingkai emas.
- Tabel transaksi: tiap baris jadi kartu bulat berbingkai biru, tanggal dengan ikon kalender, judul kolom biru.

## Tidak berubah
Semua perhitungan, penyimpanan, menu titik tiga (Export/Backup/Import), kalender pilih tanggal, kolom isian, Risk Guard, Statistik.
Catatan: sel Tanggal tidak lagi digabung (rowSpan); tanggal tampil di setiap baris.

## Pengujian
Belum diuji build Vite penuh dan perangkat nyata.
