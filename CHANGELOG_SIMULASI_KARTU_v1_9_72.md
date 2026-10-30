# v1.9.72 — Kartu tab Simulasi memakai standar kartu Statistik

Hanya menyentuh `src/TargetSimulator.jsx` (tampilan) dan versi di `package.json`.

## Perubahan
- Enam kartu di tab Simulasi kini memakai `CardShell` + `CardHeader` (ikon bulat, judul, garis pembatas biru) seperti Statistik: Hasil (Semua Hari Profit), Pertumbuhan Saldo ($), Skenario Target Harian, Milestone, Cek Realita, dan Tabel Harian.
- Hasil: empat kartu angka 2 x 2 bergaya kartu angka Statistik (ikon berwarna, label, nilai, keterangan).
- Pertumbuhan Saldo: tombol Skala log bergaya tombol periode (emas saat aktif); garis grid dan sumbu grafik berwarna biru.
- Tabel: judul kolom biru, ukuran huruf dan jarak ikut lebar kartu sehingga Milestone muat di layar HP tanpa terpotong. Tabel Harian tetap bisa digeser ke samping.
- Tombol "Tampilkan semua hari" bergaya tombol kartu dalam.

## Tidak berubah
Perhitungan simulasi, state, penyimpanan, centang status/catatan, ekspor Excel, kartu Pengaturan Asumsi, kotak error, dan semua file lain.

## Pengujian
Lihat catatan pengujian di balasan. Belum diuji build Vite penuh dan perangkat nyata.
