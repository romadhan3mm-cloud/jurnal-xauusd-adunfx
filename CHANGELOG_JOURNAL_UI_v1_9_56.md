# v1.9.56 — Bulan aktif jadi tombol terbagi (kalender | daftar bulan + arsip)

Menyentuh `src/TradingJournal.jsx` dan versi di `package.json`.

## Perubahan
- Bulan aktif kini tombol terbagi berbingkai emas, dipisah garis vertikal biru tipis (sama dengan pemisah Harian/Mingguan/Bulanan/Tahunan di Statistik).
  - Sisi kiri (ikon kalender + nama bulan): buka/tutup kalender bulan aktif.
  - Sisi kanan (panah): buka daftar bulan.
- Daftar bulan punya dua bagian: bulan aktif (pilih untuk pindah dan buka kalendernya, titik tiga Arsipkan/Hapus Permanen) dan ARSIP (n) dengan tombol Aktifkan dan Hapus per bulan.
- Tombol "Arsip (n)" dan panel arsip lama di atas kartu dihapus karena sudah pindah ke daftar ini.
- Jika semua bulan terarsip (belum ada bulan aktif), daftar arsip tampil di kotak kosong supaya masih bisa diaktifkan kembali.

## Tidak berubah
Perhitungan, penyimpanan, kalender, Statistik, Perbandingan Antar Bulan, tabel transaksi.

## Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.
