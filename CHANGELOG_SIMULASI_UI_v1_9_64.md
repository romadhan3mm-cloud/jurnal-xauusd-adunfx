# v1.9.64 — Kartu Asumsi Simulasi mengikuti standar kartu + input bisa titik (.)

Hanya menyentuh `src/TargetSimulator.jsx` (bagian kartu Asumsi) dan versi di `package.json`.

## Perubahan tampilan
- Kartu Asumsi Simulasi kini memakai `CardShell` + `CardHeader` + `HeaderBadge` (sama dengan Statistik / Input Transaksi): latar `--surface-soft` 50% transparan, garis `--border`, kepala berikon bulat, judul 24px, subjudul `--muted`, garis pembatas judul biru.
- Judul "Pengaturan Asumsi Simulasi" dan subjudul "Atur parameter simulasi sesuai strategi Anda." Tanpa lencana di kanan.
- 8 kolom jadi kotak 2 kolom bersusun vertikal rata tengah (seperti kartu angka Statistik): ikon di atas, label di bawah ikon, nilai di paling bawah, satuan ($, Rp, %, x) di kanan nilai. Latar/garis kotak memakai INNER_BG / INNER_BORDER.
- Kotak catatan (ikon info) dan dua tombol pil (Download Excel emas, Reset ke default biru) mengikuti gaya kartu Rekomendasi Lot.
- Kalender pilih tanggal dirender di `.tj-root` (portal) supaya tidak terpotong kartu; isi dan perilakunya sama.

## Perubahan input
- Semua kolom `type="text"` dengan `inputMode="decimal"` (keypad iPhone berbahasa Indonesia punya tombol koma). Koma yang diketik otomatis jadi titik.
- Kolom desimal (Modal Awal, Target Profit Harian, Batas Loss Harian, Jarak SL, Max Layer): titik = desimal, koma otomatis jadi titik, hanya satu titik.
- Kolom ribuan (Target, Kurs): koma/titik yang diketik diterima lalu diformat otomatis jadi 18.000.000; nilai tersimpan tetap angka murni.

## Tidak berubah
Perhitungan simulasi, penyimpanan `sim-settings`, DEFAULTS, ekspor Excel, kartu Hasil/Grafik/Tabel, dan semua file lain.

## Pengujian
Sintaks JSX lolos dicek dengan esbuild. Belum diuji build Vite penuh dan perangkat nyata.
