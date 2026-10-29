# v1.9.54 — Kartu berjudul distandarkan (ikut Statistik) + kalender dari klik bulan

Menyentuh `src/CardHeader.jsx`, `src/StatsCard.jsx`, `src/TradingJournal.jsx`, dan versi di `package.json`.

## Standar kartu berjudul (acuan: kartu Statistik)
- `CardHeader.jsx` kini memegang gaya Statistik: kartu luar (garis `--border` 1px, latar `--surface-soft`), ikon bulat, ukuran judul/subjudul/ikon (skala `cqw`), lencana kanan berbingkai emas, dan garis pembatas judul biru.
- Dipakai oleh Statistik (tampilan tidak berubah), Perbandingan Antar Bulan, dan Input Transaksi.
- Perbandingan Antar Bulan: tombol GRAFIK memakai gaya lencana PERFORMA; saat terlipat, kepala tanpa garis pembatas.

## Kalender dari klik bulan
- Klik nama bulan di tab bulan: bulan itu jadi aktif dan kalendernya muncul. Pilih tanggal untuk menentukan tanggal transaksi.
- Pemilih tanggal dan kalender dihapus dari kartu Input Transaksi. Di bawah tombol Tambah Transaksi tampil teks "Tanggal dipilih: ...".
- Pesan "Belum ada jurnal untuk bulan ini" kini juga tampil di dalam kalender.

## Tidak berubah
Perhitungan, penyimpanan, menu titik tiga (Export/Backup/Import), kolom isian, Risk Guard.

## Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.
