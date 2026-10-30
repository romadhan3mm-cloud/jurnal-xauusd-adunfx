# v1.9.68 — Grafik Profit vs Loss di kartu Statistik + tombol periode

Menyentuh `src/StatsCard.jsx` (grafik baru) dan `src/TradingJournal.jsx` (satu prop `periodRows` pada `<StatsCard>`), serta versi di `package.json`.

## Tampilan
- Di bawah baris Harian/Mingguan/Bulanan/Tahunan ditambah grafik kumulatif: area hijau = Profit, garis merah = Loss.
- Grid putus-putus biru, sumbu Y berformat $, sumbu X berisi tanggal entri (Start sampai entri terakhir, maksimal 5 label).
- Titik akhir profit diberi penanda bulat dengan lencana nilai total (mis. $30.52).
- Legenda Profit / Loss di bawah grafik. Sentuh grafik untuk melihat nilai per entri.
- Grafik hanya muncul jika sudah ada entri. Warna mengikuti tema terang/gelap lewat variabel tema.

## Tombol periode
Kotak HARIAN / MINGGUAN / BULANAN / TAHUNAN sekarang bisa diketuk dan mengganti periode grafik. Kotak terpilih ditandai warna emas + garis bawah. Default: Bulanan (sama seperti sebelumnya).
- Harian: entri hari ini; sumbu X jam 00:00-24:00 (memakai jam entri), garis datar sampai 24:00.
- Mingguan: entri pekan ini, sumbu X tanggal entri.
- Bulanan: entri bulan aktif, sumbu X tanggal entri.
- Tahunan: satu titik per bulan pada tahun aktif (total profit & loss bulanan, kumulatif).
- Periode tanpa entri menampilkan teks "Belum ada entri pada periode ini."
- Angka persentase di kotak tidak berubah. Datanya memakai himpunan baris yang sama dengan penghitung persentase.

## Data
Hanya menjumlahkan profit dan loss yang sudah ada di tiap entri (urutan sama dengan grafik Pertumbuhan Saldo). Nilai akhir sama dengan kartu Total Profit. Tidak ada perhitungan statistik yang diubah.

## Pengujian
Sintaks JSX dicek dengan esbuild. Belum diuji build Vite penuh dan perangkat nyata.
