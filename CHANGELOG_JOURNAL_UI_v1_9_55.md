# v1.9.55 — Bulan aktif (dropdown) dan Bulan Baru pindah ke kartu Input Transaksi

Menyentuh `src/TradingJournal.jsx` dan versi di `package.json`.

## Perubahan
- Tab bulan di luar kartu dihapus. Di dalam kartu Input Transaksi, di atas tombol Tambah Transaksi, kini ada satu baris: bulan aktif (dropdown, kiri) dan "+ Bulan Baru" (kanan).
- Bulan aktif: tombol berbingkai emas dengan ikon kalender dan panah. Klik membuka daftar bulan; pilih bulan untuk mengaktifkannya dan kalendernya langsung muncul. Menu titik tiga (Arsipkan / Hapus Permanen) ada di tiap baris daftar.
- Tambah Transaksi kembali berisi emas penuh, jadi berbeda dari bulan aktif yang berbingkai emas.
- Form "Start Balance" untuk bulan baru kini muncul di dalam kartu, tepat di bawah baris bulan. Saat belum ada bulan sama sekali, tombol "+ Bulan Baru" tampil di kotak kosong.

## Dikembalikan seperti semula
- "+ Bulan Baru" (garis putus-putus abu, teks abu).
- Warna judul kolom dan isi tabel (No, Tanggal, Start, Target, Loss, End Balance).
- Tombol titik tiga dan menunya.

## Tidak berubah
Perhitungan, penyimpanan, kalender, Risk Guard, Statistik, Perbandingan Antar Bulan.

## Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.
