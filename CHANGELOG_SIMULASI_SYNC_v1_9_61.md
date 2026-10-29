# v1.9.61 — Tabel harian (Simulasi) sinkron dengan transaksi di Jurnal

Menyentuh `src/TradingJournal.jsx`, `src/TargetSimulator.jsx`, dan versi di `package.json`.

## Perubahan
- Status target di Tabel harian (tab Simulasi) terisi otomatis dari transaksi di Jurnal, dicocokkan lewat tanggal.
  - Hasil harian = profit - loss - komisi (withdraw tidak dihitung), dibandingkan dengan kolom Target 3% pada baris Jurnal tanggal itu.
  - Hasil >= target: tercapai (lingkaran hijau, centang).
  - Hasil di bawah target pada tanggal yang sudah lewat: tidak tercapai (lingkaran merah, X).
  - Tanggal hari ini yang belum capai target dibiarkan kosong karena hari belum selesai.
  - Transaksi dihapus atau berubah: status otomatis ikut berubah.
- Koreksi manual tetap bisa dilakukan. Status otomatis hanya diterapkan ulang kalau hasil Jurnal untuk tanggal itu berubah.
- Kolom "tidak tercapai" kini memakai tanda X merah (bukan kotak centang). Kolom tercapai memakai centang hijau.
- Teks keterangan di atas tabel diperbarui.

## Tidak berubah
Perhitungan simulasi, tabel Jurnal, Statistik, Risk Guard, format penyimpanan lama (`sim-progress` hanya ditambah field `auto`).

## Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.
