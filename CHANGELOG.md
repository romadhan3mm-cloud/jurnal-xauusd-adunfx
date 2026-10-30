# CHANGELOG TraderLogs
Satu file untuk semua catatan perubahan. Entri terbaru di atas; entri tahap awal AI News (tanpa nomor versi) ada di bagian paling bawah.
Aturan: perubahan baru ditambahkan di sini (bagian atas), bukan sebagai file terpisah.

---

## v1.9.83 — Glow cincin Risk Guard menyesuaikan status

Menyentuh `src/RiskGuardCard.jsx`, `src/tjStyles.js` (satu aturan CSS), dan versi di `package.json`.

### Perubahan
- Cincin sebelumnya sudah punya glow tetap (5px, 40%). Kini kekuatannya mengikuti status:
  AMAN tetap seperti semula, WASPADA lebih terang (7px, 55%), BATAS TERCAPAI paling kuat (9px, 65%), BELUM ADA MODAL tetap.
- Tema terang: glow cincin dibuat lebih tipis (3px) lewat `.tj-rg-ring` di `tjStyles.js`.

### Tidak berubah
Glow perisai dan titik status, gradasi cincin dan bar, garis luar kartu, perhitungan, props, dan semua file lain. Latar kartu tidak diberi gradasi.

### Pengujian
Sintaks JSX dicek dengan tsc. Belum diuji build Vite penuh dan tampilan di HP.

---

## v1.9.82 — Ikon tema terang/gelap pindah ke header

Hanya menyentuh `src/TradingJournal.jsx` (tampilan) dan versi di `package.json`.

### Perubahan
- Ikon matahari/bulan dipindah dari baris End Balance ke header, tepat di bawah tombol titik tiga (rata kanan, ukuran dan gaya sama dengan titik tiga: 28px, ikon 16).
- Ikon tema tetap tampil walau tombol menu (titik tiga) tidak ada.
- Baris End Balance kini hanya berisi label dan angka.

### Tidak berubah
Fungsi `toggleTheme`, penyimpanan tema, menu titik tiga dan isinya, tinggi header, dan semua file lain. Kelas CSS `.tj-bal-theme` di `tjStyles.js` dibiarkan (tidak lagi dipakai).

### Pengujian
Belum diuji build Vite penuh dan tampilan di HP. Perlu dicek: menu titik tiga yang terbuka menutupi ikon tema (wajar), dan ikon tidak bertabrakan dengan logo di layar sempit.

---

## v1.9.81 — Keseragaman font, warna, radius; header dan tab dalam satu kartu

Hanya tampilan. Perhitungan, state, penyimpanan, fetch, dan struktur komponen tidak diubah.
Menyentuh `CardHeader.jsx`, `TabSwitch.jsx`, `AINews.jsx`, `EconomicCalendar.jsx`, `TradingViewChart.jsx`, `authStyles.js`, `Splash.jsx`, dan versi di `package.json`.

### 1. Ukuran font AI News, Kalender, Chart
- 8, 9, 10px menjadi 11px (keterangan); 12px menjadi 13px (teks isi). Sama dengan standar Jurnal (v1.9.76).
- Memakai angka tetap 11/13px, bukan `s()`: `s(13, 10)` di HP menjadi 10px sehingga teks bacaan malah mengecil dari 12px.
- Label PREVIOUS/FORECAST/ACTUAL kini 11px; "ACTUAL · MENUNGGU" bisa turun ke dua baris di HP sempit.

### 2. Ketebalan font
- 850 menjadi 800 dan 750 menjadi 700 (AI News). Google Fonts hanya memuat 400-800.

### 3. Palet warna
- `EconomicCalendar`, `TradingViewChart`, `TabSwitch`: palet salinan diganti `var(--surface)`, `--surface-raised`, `--border`, `--text`, `--muted` (ikut tema).
- Merah HIGH IMPACT memakai `var(--red)`.
- Tidak diubah: warna candle widget TradingView (`#26A69A`, `#EF5350`, perlu hex asli), merah Sabtu/Minggu kalender (`#A33A3A`), amber MEDIUM IMPACT, warna tombol aktif (`#18395F` / `#E8F1FF`).

### 4. Radius
- Token baru `BOX_RADIUS` (= `s(10, 6)`) di `CardHeader.jsx` untuk kotak dalam.
- AI News, Kalender, Chart, TabSwitch: tombol memakai `BTN_RADIUS`, kotak dalam `BOX_RADIUS`, pil tetap 999. Total 14 nilai berbeda di file-file ini menjadi 3 token.
- Belum diubah: radius 6/7/8/9px di Jurnal lama (`TradingJournal.jsx`, `tjStyles.js`, `journalWidgets.jsx`) karena sebagian untuk elemen kecil/bulat dan perlu dicek di perangkat.

### 5. Font layar login dan Splash
- 12.5px menjadi 13px, 12px menjadi 13px, 10.5px dan 10px menjadi 11px (`authStyles.js`, `Splash.jsx`). Input 16px (anti zoom iOS) tidak diubah.

### 6. Header dan tab dalam satu kartu
- AI News: tombol Kalender / Analisis AI / Info masuk ke kartu "AI News XAU/USD" (kepala kini memakai garis pembatas biru standar). Isi tab tetap kartu sendiri.
- Chart: tombol Chart | Berita masuk ke kartu XAU/USD (tab Chart) dan ke kartu Kalender Ekonomi (tab Berita).
- Tambahan kecil tanpa mengubah perilaku: `TabSwitch` punya prop `marginBottom` (default 12), `EconomicCalendar` punya prop `afterHeader` (default kosong).
- Pesan error AI News kini tampil di bawah kartu tab, bukan di antara header dan tab.

### Pengujian
Sintaks JSX dicek dengan tsc (lolos). Build Vite penuh dan tampilan di HP belum diuji.

---

## v1.9.80 — AI News memakai tab seperti menu Chart

Hanya tampilan; logic AI News tidak diubah.

- Tab baru di AI News (gaya sama dengan Chart | Berita): Kalender, Analisis AI, Info. Hanya satu bagian tampil sekaligus supaya halaman tidak perlu digulir jauh.
- Kalender: kartu Kalender Ekonomi. Analisis AI: kartu Analisis fundamental AI. Info: Pengingat otomatis & iPhone dan Catatan penting.
- Bagian yang tidak aktif hanya disembunyikan (tidak dilepas), jadi filter kalender dan hasil analisis tidak hilang saat pindah tab dan kalender tidak dimuat ulang.
- Judul AI News dan pesan error tetap di atas semua tab.
- Komponen tab dipisah ke `src/TabSwitch.jsx` dan dipakai juga oleh menu Chart (tampilan Chart tidak berubah).

### Pengujian
Sintaks JSX dicek dengan tsc. Build Vite penuh dan tampilan di HP belum diuji.

---

## v1.9.79 — Perapian: baris Input Transaksi, sumbu grafik saldo, judul Simulasi, halaman AI News

Hanya tampilan. Perhitungan, state, penyimpanan, dan fitur tidak diubah.

- Input Transaksi: garis tipis di bawah tiap baris dihapus (baris polos, tanpa kartu).
- Pertumbuhan Saldo (menu Jurnal): garis vertikal ditambahkan di sumbu skala untuk tampilan Garis, Batang, dan Area.
- Milestone dan Cek Realita (Simulasi): judul dipendekkan dan keterangannya dipindah ke subjudul supaya tidak bertumpuk di HP.
- AI News dirapikan. Urutan sekarang: judul, pesan error (jika ada), Kalender Ekonomi, Analisis fundamental AI, Pengingat otomatis & iPhone, lalu satu kartu Catatan penting. Status layanan, Kalender dan jadwal, dan Risk awareness digabung jadi tiga baris di kartu Catatan penting karena hanya berupa informasi, bukan menu.

### Tidak berubah
Logic AI News (muat data, analisis, notifikasi), tombol Pengingat otomatis, dan semua file lain.

### Pengujian
Sintaks JSX dicek dengan tsc. Build Vite penuh dan tampilan di HP belum diuji.

---

## v1.9.78 — Keseragaman: bentuk tombol, kepala kartu standar, lebar kartu, baris Input Transaksi

Hanya tampilan. Perhitungan, state, penyimpanan, ekspor, dan fitur tidak diubah.

### 1. Bentuk tombol
- Tombol aksi memakai persegi bulat (`BTN_RADIUS` di `CardHeader.jsx`, nilainya sama dengan tombol Tambah Transaksi).
- Download Excel dan Reset ke default (Simulasi): dari pil menjadi persegi bulat.
- Tombol filter Kalender Ekonomi (Semua jadwal / Akan datang / Sudah rilis): dari pil menjadi persegi bulat.
- Tetap pil: lencana kepala kartu (PERFORMA, GRAFIK, MUAT ULANG), lencana status (Risk Guard, HIGH/MEDIUM IMPACT), dan tombol di halaman login.

### 2. Kepala kartu standar (ikon bulat, judul, garis biru)
- AI News: judul halaman, Status layanan, Analisis fundamental AI, Pengingat otomatis & iPhone, Kalender & jadwal, Risk Awareness.
- Kalender Ekonomi: kepala standar dengan lencana MUAT ULANG. Kepala ganda di AI News dan di tab Berita (Chart) dihapus.
- Chart: kartu XAU/USD memakai kepala standar; tombol timeframe dan widget TradingView tidak diubah.

### 3. Lebar kartu
- Padding halaman kiri-kanan 28px menjadi 16px di `TradingJournal.jsx`. Kartu bertambah lebar sekitar 24px di semua menu.
- Header yang menempel (`.tj-hdr`) dan tombol aksi header di `tjStyles.js` ikut 16px supaya tetap sejajar dengan kartu.

### 4. Baris Input Transaksi
- Ikon tanggal di kolom Tanggal dihapus (hanya hiasan, bukan tombol; kalender tetap dibuka lewat tombol bulan aktif).
- Baris tidak lagi berbentuk kartu: tanpa latar dan sudut bulat, hanya garis pemisah tipis di bawah tiap baris.

### Tidak berubah
Logic, state, penyimpanan, kolom isian (72px, 16px di HP), tinggi tombol, menu titik tiga, kartu Statistik, Risk Guard, Rekomendasi Lot, dan semua file lain.

### Pengujian
Sintaks JSX dicek dengan tsc (lolos). Build Vite penuh dan tampilan di HP belum diuji.

---

## v1.9.77 — Input Transaksi: font dan jarak ikut lebar kartu (seperti tabel Simulasi)

Hanya menyentuh `src/TradingJournal.jsx` (bagian kartu Input Transaksi) dan versi di `package.json`.

### Perubahan
- Tabel entri: font isi 13px menjadi `s(13, 10)` (±10px di HP), jarak sel `s(10, 5)` atas-bawah dan `s(6, 3)` kiri-kanan (sebelumnya 10px), jarak sel isian `s(8, 4)` dan `s(3, 2)`.
- Judul kolom: `s(12, 9.5)` dan berwarna biru, sama dengan tabel Simulasi.
- Batas lebar minimum tabel 780px dihapus; tabel kini selebar isinya dan hanya bergeser jika benar-benar tidak muat.
- Lingkaran ikon kalender di kolom Tanggal mengikuti lebar kartu.
- Tombol bulan aktif, Bulan Baru, Tambah Transaksi, keterangan tanggal, dan teks "Belum ada entry" memakai skala yang sama.

### Tidak berubah
Kolom isian (lebar 72px dan font 16px di HP supaya iOS tidak zoom saat mengetik), tinggi tombol (42px), menu titik tiga, perhitungan, state, penyimpanan, dan semua file lain.

### Pengujian
Sintaks JSX dicek dengan tsc. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.76 — Ukuran font Jurnal dirapikan ke 13px dan 11px

Hanya menyentuh `src/TradingJournal.jsx` (tampilan) dan versi di `package.json`.

### Hasil pemeriksaan
Ukuran font tetap di `TradingJournal.jsx` sudah hampir seragam: 13px (teks isi, 46 tempat) dan 11px (keterangan, 35 tempat). Yang menyimpang hanya 12.5px (4 tempat) dan 11.5px (3 tempat).

### Perubahan
- 12.5px menjadi 13px (baris ringkasan Import, label dan tombol Urungkan).
- 11.5px menjadi 11px (keterangan Export dan keterangan pesan).

### Tidak berubah
Ukuran lain (judul dialog 15px, judul kalender 14px, 12px, 10px), perhitungan, state, dan semua file lain. Ukuran kecil di `EconomicCalendar.jsx` (8px dan 9px) belum disentuh dan menunggu keputusan.

### Pengujian
Sintaks JSX dicek dengan tsc. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.75 — Risk Guard dan Rekomendasi Lot disamakan dengan standar kartu

Menyentuh `src/CardHeader.jsx`, `src/RiskGuardCard.jsx`, `src/RecommendationCard.jsx`, dan versi di `package.json`.

### Perubahan
- Risk Guard: garis kotak dalam (3 kartu angka, cincin, kotak P/L, catatan) kini biru standar (`INNER_BORDER`), sebelumnya abu-biru netral (`--border-inner`).
- Risk Guard: garis pembatas kepala kini biru; judul 24px (sebelumnya 22px); subjudul 13px (sebelumnya 11.5px); ikon perisai sama besar dengan ikon kepala kartu lain; ukuran dan jarak lencana status mengikuti lencana kepala kartu lain.
- Risk Guard: lencana ikon pakai `IconBadge` bersama (ukuran 40, ikon putih; sebelumnya 44 dan putih kebiruan).
- Biru dan indigo di Risk Guard dan Rekomendasi Lot kini memakai palet `GRAD`; teal (Kerugian bersih tercatat) masuk palet sebagai `GRAD.teal`.

### Tidak berubah
Garis luar kartu Risk Guard yang berganti hijau/kuning/merah menurut status, warna perisai, cincin, perhitungan, props, dan semua file lain. Variabel `--border-inner` di `tjStyles.js` dibiarkan (tidak lagi dipakai).

### Pengujian
Sintaks JSX dicek dengan tsc. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.74 — Keseragaman kode kartu (tanpa perubahan tampilan)

Menyentuh `src/CardHeader.jsx`, `src/StatsCard.jsx`, `src/RecommendationCard.jsx`, `src/TargetSimulator.jsx`, `src/RiskGuardCard.jsx`, dan versi di `package.json`.

### Perubahan
- `CardHeader.jsx` kini menyimpan satu `IconBadge` (lencana ikon bulat) dan palet `GRAD` (biru, hijau, ungu, merah, indigo) untuk dipakai semua kartu.
- Salinan `IconBadge` di Statistik, Rekomendasi Lot, dan Simulasi dihapus; semuanya memakai yang bersama. Teks gradien yang sama persis diganti `GRAD.*`.
- Risk Guard tidak lagi punya salinan `mix`, `s()`, dan `INNER_BG`; memakai yang dari `CardHeader.jsx`.

### Tidak berubah
Tampilan (hasil render sama persis), perhitungan, state, props, dan semua file lain. `IconBadge` dan gradien Risk Guard sengaja dibiarkan karena ukurannya/warnanya berbeda dan perlu keputusan.

### Pengujian
Sintaks JSX dicek dengan tsc. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.73 — Perbaikan gagal build Cloudflare (rollup)

Hanya menyentuh `package.json`. Tidak ada file kode yang berubah.

### Masalah
Build Cloudflare gagal pada `vite build`: modul `@rollup/rollup-linux-x64-gnu` tidak ditemukan. Penyebabnya `bun install` memilih rollup 4.67.2 yang paket Linux-nya dijawab 404 oleh registry npm, sehingga tidak terpasang. Tidak terkait perubahan kartu v1.9.72.

### Perbaikan
- Menambah `overrides` dan `resolutions` yang mengunci `rollup` ke 4.34.8 (versi lama yang stabil; dipakai Vite 5 lewat `^4.20.0`). `overrides` dibaca npm dan bun, `resolutions` dibaca bun.
- Versi aplikasi naik ke 1.9.73.

### Tidak berubah
Semua kode aplikasi dan versi paket lain.

### Catatan
Kalau repo GitHub sudah punya `bun.lock` atau `package-lock.json`, hapus file itu lalu commit supaya terpasang ulang sesuai kunci baru.

---

## v1.9.72 — Kartu tab Simulasi memakai standar kartu Statistik

Hanya menyentuh `src/TargetSimulator.jsx` (tampilan) dan versi di `package.json`.

### Perubahan
- Enam kartu di tab Simulasi kini memakai `CardShell` + `CardHeader` (ikon bulat, judul, garis pembatas biru) seperti Statistik: Hasil (Semua Hari Profit), Pertumbuhan Saldo ($), Skenario Target Harian, Milestone, Cek Realita, dan Tabel Harian.
- Hasil: empat kartu angka 2 x 2 bergaya kartu angka Statistik (ikon berwarna, label, nilai, keterangan).
- Pertumbuhan Saldo: tombol Skala log bergaya tombol periode (emas saat aktif); garis grid dan sumbu grafik berwarna biru.
- Tabel: judul kolom biru, ukuran huruf dan jarak ikut lebar kartu sehingga Milestone muat di layar HP tanpa terpotong. Tabel Harian tetap bisa digeser ke samping.
- Tombol "Tampilkan semua hari" bergaya tombol kartu dalam.

### Tidak berubah
Perhitungan simulasi, state, penyimpanan, centang status/catatan, ekspor Excel, kartu Pengaturan Asumsi, kotak error, dan semua file lain.

### Pengujian
Lihat catatan pengujian di balasan. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.71 — Capital Lot Reference: satu kartu dengan tabel, tombol persegi

Hanya menyentuh `src/RecommendationCard.jsx` (tampilan) dan versi di `package.json`.

### Perubahan
- Tombol CAPITAL LOT REFERENCE dan tabel (Capital, Lot Size, Max Layers) kini berada dalam satu kartu dalam (garis biru, sudut membulat), tetap di dalam kartu utama Rekomendasi Lot — pola yang sama seperti tombol periode + grafik di Statistik.
- Tabel tidak lagi punya kotak sendiri; langsung di bawah tombol dalam kartu yang sama.
- Bentuk tombol dari pil penuh menjadi persegi bersudut membulat (radius sama dengan tombol periode Statistik). Panah ChevronUp/ChevronDown tetap.

### Tidak berubah
Perhitungan, props, state `showRef`/`onToggleRef`, `CAPITAL_LOT_REF_TIERS`, tiga kartu angka, catatan asumsi, aturan sorot baris, dan semua file lain.

### Pengujian
Sintaks JSX dicek dengan esbuild dan komponen dirender di Chromium (lebar HP, tema gelap). Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.70 — Tombol periode Statistik: kotak emas, tanpa garis pembatas

Hanya menyentuh `src/StatsCard.jsx` (tampilan) dan versi di `package.json`.

### Perubahan
- Tombol periode terpilih (HARIAN / MINGGUAN / BULANAN / TAHUNAN) kini kotak emas: garis emas, latar emas transparan, cahaya tipis, label emas. Warna persentase tetap hijau/merah menurut untung-rugi.
- Garis pembatas vertikal antar tombol dihapus.

### Tidak berubah
Perhitungan, data grafik, state periode, prop, kartu angka, cincin winrate, dan semua file lain.

### Pengujian
Sintaks JSX dicek dengan esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.69 — Tombol periode + grafik Statistik jadi satu kartu

Hanya menyentuh `src/StatsCard.jsx` (tampilan) dan versi di `package.json`.

### Perubahan
- Baris tombol HARIAN / MINGGUAN / BULANAN / TAHUNAN dan grafik Profit vs Loss kini berada dalam satu kartu dalam (garis biru, sudut membulat) di dalam kartu utama Statistik.
- Tombol terpilih ditandai kotak hijau transparan dengan garis dan cahaya hijau (sebelumnya emas + garis bawah), seperti gambar acuan.
- Garis pemisah antar tombol disembunyikan di samping tombol terpilih.

### Tidak berubah
Perhitungan, data grafik, state periode, prop, kartu angka, cincin winrate, dan semua file lain.

### Pengujian
Sintaks JSX dicek dengan esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.68 — Grafik Profit vs Loss di kartu Statistik + tombol periode

Menyentuh `src/StatsCard.jsx` (grafik baru) dan `src/TradingJournal.jsx` (satu prop `periodRows` pada `<StatsCard>`), serta versi di `package.json`.

### Tampilan
- Di bawah baris Harian/Mingguan/Bulanan/Tahunan ditambah grafik kumulatif: area hijau = Profit, garis merah = Loss.
- Grid putus-putus biru, sumbu Y berformat $, sumbu X berisi tanggal entri (Start sampai entri terakhir, maksimal 5 label).
- Titik akhir profit diberi penanda bulat dengan lencana nilai total (mis. $30.52).
- Legenda Profit / Loss di bawah grafik. Sentuh grafik untuk melihat nilai per entri.
- Grafik hanya muncul jika sudah ada entri. Warna mengikuti tema terang/gelap lewat variabel tema.

### Tombol periode
Kotak HARIAN / MINGGUAN / BULANAN / TAHUNAN sekarang bisa diketuk dan mengganti periode grafik. Kotak terpilih ditandai warna emas + garis bawah. Default: Bulanan (sama seperti sebelumnya).
- Harian: entri hari ini; sumbu X jam 00:00-24:00 (memakai jam entri), garis datar sampai 24:00.
- Mingguan: entri pekan ini, sumbu X tanggal entri.
- Bulanan: entri bulan aktif, sumbu X tanggal entri.
- Tahunan: satu titik per bulan pada tahun aktif (total profit & loss bulanan, kumulatif).
- Periode tanpa entri menampilkan teks "Belum ada entri pada periode ini."
- Angka persentase di kotak tidak berubah. Datanya memakai himpunan baris yang sama dengan penghitung persentase.

### Data
Hanya menjumlahkan profit dan loss yang sudah ada di tiap entri (urutan sama dengan grafik Pertumbuhan Saldo). Nilai akhir sama dengan kartu Total Profit. Tidak ada perhitungan statistik yang diubah.

### Pengujian
Sintaks JSX dicek dengan esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.66 — Perbaikan pita gelap di bawah tab bar (iPhone, setelah mengetik)

Hanya menyentuh `src/viewportGap.js` dan versi di `package.json`.

### Gejala
Setelah mengetik di kolom input lalu keyboard ditutup, tab bar naik dan muncul pita gelap (warna --bg) di bawahnya.

### Penyebab (dari hasil ukur warna pada tangkapan layar)
Pita itu berwarna --bg (#0A1628), bukan --surface. Padahal celah bawah biasanya diisi bayangan tab bar berwarna --surface setinggi `--vgap`. Jadi `--vgap` tertinggal 0: dihitung saat keyboard terbuka (selisih tinggi > 120 → 0) dan tidak dihitung ulang karena iOS tidak mengirim event resize saat keyboard ditutup.

### Perbaikan
- `--vgap` dihitung ulang 4 kali (100/400/900/1600 ms) setelah kolom input kehilangan fokus.
- `--vgap` juga dihitung ulang saat `visualViewport` berubah ukuran.
- Rumus dan variabel lain tidak diubah.

### Pengujian
Sintaks dicek dengan esbuild. Belum diuji di perangkat iPhone nyata.

---

## v1.9.65 — Kartu Asumsi Simulasi mengikuti standar kartu + input bisa titik (.)

Menyentuh `src/TargetSimulator.jsx` (bagian kartu Asumsi), `src/journalMath.js` (satu baris di `parseMoneyInputValue`), dan versi di `package.json`.

### Perubahan tampilan
- Kartu Asumsi Simulasi kini memakai `CardShell` + `CardHeader` + `HeaderBadge` (sama dengan Statistik / Input Transaksi): latar `--surface-soft` 50% transparan, garis `--border`, kepala berikon bulat, judul 24px, subjudul `--muted`, garis pembatas judul biru.
- Judul "Pengaturan Asumsi Simulasi" dan subjudul "Atur parameter simulasi sesuai strategi Anda." Tanpa lencana di kanan.
- 8 kolom jadi kotak 2 kolom bersusun vertikal rata tengah (seperti kartu angka Statistik): ikon di atas, label di bawah ikon, nilai di paling bawah, satuan ($, Rp, %, x) di kanan nilai. Latar/garis kotak memakai INNER_BG / INNER_BORDER.
- Kotak catatan (ikon info) dan dua tombol pil (Download Excel emas, Reset ke default biru) mengikuti gaya kartu Rekomendasi Lot.
- Kalender pilih tanggal dirender di `.tj-root` (portal) supaya tidak terpotong kartu; isi dan perilakunya sama.

### Perubahan input
- Semua kolom `type="text"` dengan `inputMode="decimal"` (keypad iPhone berbahasa Indonesia punya tombol koma). Koma yang diketik otomatis jadi titik.
- Kolom desimal (Modal Awal, Target Profit Harian, Batas Loss Harian, Jarak SL, Max Layer): titik = desimal, koma otomatis jadi titik, hanya satu titik.
- Kolom ribuan (Target, Kurs): koma/titik yang diketik diterima lalu diformat otomatis jadi 18.000.000; nilai tersimpan tetap angka murni.

### Perbaikan tambahan
- Kotak Tanggal Mulai kini selebar dan setinggi kotak lain (sebelumnya menciut mengikuti isi).
- Kartu Input Transaksi, kolom Profit / Loss / Komisi / WD: koma dari keyboard iPhone kini otomatis jadi titik (`parseMoneyInputValue` mengubah "," jadi "." sebelum membersihkan). Sebelumnya koma dibuang sehingga tidak ada yang muncul.

### Tidak berubah
Perhitungan simulasi, penyimpanan `sim-settings`, DEFAULTS, ekspor Excel, kartu Hasil/Grafik/Tabel, dan semua file lain.

### Pengujian
Sintaks JSX lolos dicek dengan esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.63 — Lencana saldo di Rekomendasi Lot + 3 kartu angka vertikal

Hanya menyentuh `src/RecommendationCard.jsx` dan versi di `package.json`.

### Perubahan
- Lencana kanan atas kartu Rekomendasi Lot: tombol CAPITAL LOT REF diganti lencana emas berisi saldo saat ini (ikon dompet + angka). Hanya tampilan, bukan tombol. Tombol Capital Lot Reference di bawah tetap membuka/menutup tabel.
- Kartu Lot / Layer, Max Layer, dan Budget Rugi/Hari: susunan vertikal rata tengah (ikon di atas, label di bawah ikon, angka di paling bawah), sama seperti kartu di Statistik dan Risk Guard. Angka di ketiga kartu sejajar di bawah walau label turun ke dua baris.

### Tidak berubah
Perhitungan, tabel referensi, kotak Asumsi, peringatan modal kecil, kartu Pertumbuhan Saldo, dan semua file lain.

### Pengujian
Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.62 — Kartu Pertumbuhan Saldo dan Rekomendasi Lot mengikuti standar kartu berjudul

Menyentuh `src/TradingJournal.jsx`, `src/RecommendationCard.jsx` (baru), dan versi di `package.json`.

### Perubahan
- Pertumbuhan Saldo: memakai CardShell + CardHeader yang sama dengan Statistik dan Input Transaksi (kartu luar, ikon bulat, judul + subjudul, garis pembatas biru). Lencana emas GRAFIK di kanan membuka menu tampilan grafik (Garis / Batang / Area) yang sama seperti sebelumnya; menu titik tiga lama dihapus.
- Rekomendasi Lot: kartu baru `RecommendationCard.jsx` dengan header standar, lencana CAPITAL LOT REF, tiga kartu angka (Lot / Layer, Max Layer, Budget Rugi/Hari), kotak catatan Asumsi, dan tombol emas Capital Lot Reference. Lencana dan tombol sama-sama membuka/menutup tabel referensi.

### Tidak berubah
Isi dan perhitungan grafik (tipe garis/batang/area, data, tooltip), computeLotRecommendation, isi tabel Capital Lot Reference, peringatan modal terlalu kecil, serta kartu lain.

### Catatan
Saldo saat ini tidak lagi tampil di judul kartu Rekomendasi (mengikuti gambar acuan).

### Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.61 — Tabel harian (Simulasi) sinkron dengan transaksi di Jurnal

Menyentuh `src/TradingJournal.jsx`, `src/TargetSimulator.jsx`, dan versi di `package.json`.

### Perubahan
- Status target di Tabel harian (tab Simulasi) terisi otomatis dari transaksi di Jurnal, dicocokkan lewat tanggal.
  - Hasil harian = profit - loss - komisi (withdraw tidak dihitung), dibandingkan dengan kolom Target 3% pada baris Jurnal tanggal itu.
  - Hasil >= target: tercapai (lingkaran hijau, centang).
  - Hasil di bawah target pada tanggal yang sudah lewat: tidak tercapai (lingkaran merah, X).
  - Tanggal hari ini yang belum capai target dibiarkan kosong karena hari belum selesai.
  - Transaksi dihapus atau berubah: status otomatis ikut berubah.
- Koreksi manual tetap bisa dilakukan. Status otomatis hanya diterapkan ulang kalau hasil Jurnal untuk tanggal itu berubah.
- Kolom "tidak tercapai" kini memakai tanda X merah (bukan kotak centang). Kolom tercapai memakai centang hijau.
- Teks keterangan di atas tabel diperbarui.

### Tidak berubah
Perhitungan simulasi, tabel Jurnal, Statistik, Risk Guard, format penyimpanan lama (`sim-progress` hanya ditambah field `auto`).

### Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.60 — Cincin winrate jadi hijau dan merah

Hanya menyentuh `src/StatsCard.jsx` dan versi di `package.json`.

### Perubahan
- Cincin winrate: busur porsi menang kini hijau (`--green`), sisa cincin (porsi kalah) merah (`--red`). Sebelumnya emas dan biru.
- Cahaya (glow) di sekeliling cincin ikut hijau.

### Tidak berubah
Teks tengah (persen, winrate, 14W - 16L), ukuran cincin, perhitungan, 4 kartu angka, baris persentase, dan semua file lain.

### Pengujian
Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.59 — 4 kartu angka Statistik disusun vertikal seperti Risk Guard

Hanya menyentuh `src/StatsCard.jsx` dan versi di `package.json`.

### Perubahan
- Kartu Total Profit, Total Loss, Komisi, dan RR: susunan kini vertikal (ikon di atas, label di bawah ikon, angka di paling bawah), semuanya rata tengah, sama seperti 3 kartu Risk Guard.
- Angka di tiap baris kartu sejajar di bawah, walau label salah satu kartu turun ke dua baris.

### Tidak berubah
Ukuran ikon dan angka, warna, garis, cincin winrate, baris persentase, dan semua file lain.

### Pengujian
Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.58 — Garis pemisah bulan aktif diberi jarak dari garis tepi

Hanya menyentuh `src/TradingJournal.jsx` dan versi di `package.json`.

### Perubahan
- Garis vertikal di tombol terbagi bulan aktif kini garis tersendiri (1px, biru 45%) dengan jarak 9px dari garis tepi atas dan bawah, tidak lagi menyentuh bingkai emas.

### Tidak berubah
Fungsi sisi kiri (kalender) dan sisi kanan (daftar bulan + arsip), serta semua hal lain.

---

## v1.9.57 — Isi 4 kartu angka Statistik dipusatkan

Hanya menyentuh `src/StatsCard.jsx` dan versi di `package.json`.

### Perubahan
- Kartu Total Profit, Total Loss, Komisi, dan RR: ikon + label dan nilai angka kini rata tengah (sama seperti 3 kartu Risk Guard).

### Tidak berubah
Ukuran, warna, garis, cincin winrate, baris persentase, dan semua file lain.

---

## v1.9.56 — Bulan aktif jadi tombol terbagi (kalender | daftar bulan + arsip)

Menyentuh `src/TradingJournal.jsx` dan versi di `package.json`.

### Perubahan
- Bulan aktif kini tombol terbagi berbingkai emas, dipisah garis vertikal biru tipis (sama dengan pemisah Harian/Mingguan/Bulanan/Tahunan di Statistik).
  - Sisi kiri (ikon kalender + nama bulan): buka/tutup kalender bulan aktif.
  - Sisi kanan (panah): buka daftar bulan.
- Daftar bulan punya dua bagian: bulan aktif (pilih untuk pindah dan buka kalendernya, titik tiga Arsipkan/Hapus Permanen) dan ARSIP (n) dengan tombol Aktifkan dan Hapus per bulan.
- Tombol "Arsip (n)" dan panel arsip lama di atas kartu dihapus karena sudah pindah ke daftar ini.
- Jika semua bulan terarsip (belum ada bulan aktif), daftar arsip tampil di kotak kosong supaya masih bisa diaktifkan kembali.

### Tidak berubah
Perhitungan, penyimpanan, kalender, Statistik, Perbandingan Antar Bulan, tabel transaksi.

### Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.55 — Bulan aktif (dropdown) dan Bulan Baru pindah ke kartu Input Transaksi

Menyentuh `src/TradingJournal.jsx` dan versi di `package.json`.

### Perubahan
- Tab bulan di luar kartu dihapus. Di dalam kartu Input Transaksi, di atas tombol Tambah Transaksi, kini ada satu baris: bulan aktif (dropdown, kiri) dan "+ Bulan Baru" (kanan).
- Bulan aktif: tombol berbingkai emas dengan ikon kalender dan panah. Klik membuka daftar bulan; pilih bulan untuk mengaktifkannya dan kalendernya langsung muncul. Menu titik tiga (Arsipkan / Hapus Permanen) ada di tiap baris daftar.
- Tambah Transaksi kembali berisi emas penuh, jadi berbeda dari bulan aktif yang berbingkai emas.
- Form "Start Balance" untuk bulan baru kini muncul di dalam kartu, tepat di bawah baris bulan. Saat belum ada bulan sama sekali, tombol "+ Bulan Baru" tampil di kotak kosong.

### Dikembalikan seperti semula
- "+ Bulan Baru" (garis putus-putus abu, teks abu).
- Warna judul kolom dan isi tabel (No, Tanggal, Start, Target, Loss, End Balance).
- Tombol titik tiga dan menunya.

### Tidak berubah
Perhitungan, penyimpanan, kalender, Risk Guard, Statistik, Perbandingan Antar Bulan.

### Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.54 — Kartu berjudul distandarkan (ikut Statistik) + kalender dari klik bulan

Menyentuh `src/CardHeader.jsx`, `src/StatsCard.jsx`, `src/TradingJournal.jsx`, dan versi di `package.json`.

### Standar kartu berjudul (acuan: kartu Statistik)
- `CardHeader.jsx` kini memegang gaya Statistik: kartu luar (garis `--border` 1px, latar `--surface-soft`), ikon bulat, ukuran judul/subjudul/ikon (skala `cqw`), lencana kanan berbingkai emas, dan garis pembatas judul biru.
- Dipakai oleh Statistik (tampilan tidak berubah), Perbandingan Antar Bulan, dan Input Transaksi.
- Perbandingan Antar Bulan: tombol GRAFIK memakai gaya lencana PERFORMA; saat terlipat, kepala tanpa garis pembatas.

### Kalender dari klik bulan
- Klik nama bulan di tab bulan: bulan itu jadi aktif dan kalendernya muncul. Pilih tanggal untuk menentukan tanggal transaksi.
- Pemilih tanggal dan kalender dihapus dari kartu Input Transaksi. Di bawah tombol Tambah Transaksi tampil teks "Tanggal dipilih: ...".
- Pesan "Belum ada jurnal untuk bulan ini" kini juga tampil di dalam kalender.

### Tidak berubah
Perhitungan, penyimpanan, menu titik tiga (Export/Backup/Import), kolom isian, Risk Guard.

### Pengujian
Sintaks JSX lolos esbuild. Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.53 — Tampilan Perbandingan Antar Bulan & Input Transaksi

Menyentuh `src/CardHeader.jsx` (baru), `src/TradingJournal.jsx`, dan versi di `package.json`.

### Perubahan
- Perbandingan Antar Bulan: kartu bulat dengan garis biru + kilau, ikon bulat, judul, subjudul biru, dan tombol GRAFIK (garis emas) untuk buka/tutup grafik dan tabel.
- Tab bulan: bulan aktif berbingkai emas dengan ikon kalender; "+ Bulan Baru" garis putus-putus biru.
- Input Transaksi: kepala kartu (ikon daftar, judul, subjudul), tombol titik tiga bulat, tombol "Tambah Transaksi" selebar kartu berbingkai emas.
- Tabel transaksi: tiap baris jadi kartu bulat berbingkai biru, tanggal dengan ikon kalender, judul kolom biru.

### Tidak berubah
Semua perhitungan, penyimpanan, menu titik tiga (Export/Backup/Import), kalender pilih tanggal, kolom isian, Risk Guard, Statistik.
Catatan: sel Tanggal tidak lagi digabung (rowSpan); tanggal tampil di setiap baris.

### Pengujian
Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.52 — Tampilan Statistik baru

Menyentuh `src/StatsCard.jsx` (baru), `src/TradingJournal.jsx`, dan versi di `package.json`.

### Perubahan
- Kartu Statistik diganti mengikuti gambar acuan: header (ikon, judul, subjudul, lencana PERFORMA), cincin winrate (busur emas = porsi menang, sisa biru) dengan 14W - 16L di tengah, empat kartu angka (Total Profit, Total Loss, Komisi, RR), dan baris persentase Harian/Mingguan/Bulanan/Tahunan.
- Ukuran mengikuti lebar kartu (`cqw`), sama seperti Risk Guard. Teks dan latar memakai variabel tema.
- Di `TradingJournal.jsx`, blok Statistik lama (2 mode) diganti satu baris `<StatsCard stats=... growth=... />` plus satu baris import.

### Tidak berubah
`computeStats`, perhitungan persentase periode, `journalMath.js`, Risk Guard, dan semua file lain. State/penyimpanan `tj-stats-style` tidak disentuh (tidak lagi dipakai tampilan).

### Pengujian
Lihat catatan di pesan serah-terima.

---

## v1.9.51 — Garis kotak dalam Risk Guard lebih tegas di tema terang

Menyentuh `src/RiskGuardCard.jsx`, `src/tjStyles.js`, dan versi di `package.json`.

### Perubahan
- Variabel baru `--border-inner` untuk garis kotak dalam (3 kartu angka, cincin, kotak P/L, catatan).
- Tema terang: `--border-inner` = 20% warna teks dicampur ke `--border` (abu-biru sedikit lebih gelap, tetap netral). Ketebalan tetap 1px.
- Tema gelap: `--border-inner` = `--border`, tampilan tidak berubah.

### Tidak berubah
Garis kuning/hijau/merah kartu luar, garis pemisah header, jalur cincin dan bilah, `computeDailyRiskGuard`, dan semua file lain.

### Pengujian
Belum diuji build Vite penuh dan perangkat nyata.

---

## v1.9.50 — Lencana status Risk Guard: isi 15%, garis 1.5px

Hanya menyentuh `src/RiskGuardCard.jsx` dan versi di `package.json`.

### Perubahan
- Lencana status: isi 15% (sebelumnya 18%), garis kembali 1.5px (sebelumnya 2px) supaya sama dengan garis kartu.

### Tidak berubah
Garis kartu hijau/kuning/merah (1.5px) dan semua hal lain.

---

## v1.9.49 — Garis status hijau Risk Guard lebih terlihat

Hanya menyentuh `src/RiskGuardCard.jsx` dan versi di `package.json`.

### Perubahan
- Status AMAN: garis kartu kini hijau (sebelumnya abu `--border`), tebal 1.5px, sama seperti WASPADA (kuning) dan BATAS TERCAPAI (merah). BELUM ADA MODAL tetap garis biasa.
- Lencana status: garis 2px (sebelumnya 1.5px) dan isi sedikit lebih pekat (18%).

### Tidak berubah
Semua hal lain.

---

## v1.9.48 — Risk Guard ikut tema, latar tipis, isi 3 kartu di tengah

Hanya menyentuh `src/RiskGuardCard.jsx` dan versi di `package.json`.

### Perubahan
- Latar kartu kini `var(--surface-soft)` (50% transparan), sama seperti kartu lain. Kotak-kotak di dalamnya juga tipis (`--surface-raised` 55%).
- Semua warna (teks, garis, cincin, bilah, lencana status) memakai variabel tema, jadi kartu berganti terang/gelap bersama aplikasi. Tidak lagi navy tetap.
- Isi tiga kartu angka (Batas rugi harian, Kerugian bersih tercatat, Sisa batas): ikon, label, dan nilai dipusatkan.

### Tidak berubah
`computeDailyRiskGuard`, batas 4%, semua angka, susunan horizontal di HP, ukuran berbasis `cqw`, dan file lain.

### Pengujian
Belum diuji build Vite penuh dan perangkat nyata. `color-mix` sudah dipakai di bagian lain aplikasi (Safari iOS 16.2+ / Chrome 111+).

---

## v1.9.47 — Risk Guard tetap horizontal di HP

Hanya menyentuh `src/RiskGuardCard.jsx` dan versi di `package.json`.

### Perubahan
- Susunan kartu kini sama di semua lebar layar: cincin di kiri, tiga kartu angka di kanan, baris P/L di bawahnya, lalu catatan. Sebelumnya di HP cincin pindah ke atas dan kartu angka turun.
- Semua ukuran (font, ikon, cincin, padding) mengikuti lebar kartu lewat container query unit `cqw`, dengan batas atas = ukuran lama dan batas bawah supaya teks tetap terbaca.
- Header (judul + lencana status) tetap satu baris.

### Tidak berubah
`computeDailyRiskGuard`, batas 4%, semua angka, warna status, dan file lain.

### Pengujian
Dirender dengan data untuk empat kondisi (aman, waspada, batas tercapai, belum ada modal) pada lebar 320/360/390/1000 px: tidak ada overflow horizontal dan angka tidak terpotong.
Belum diuji: build Vite penuh dan perangkat nyata. `cqw` butuh Chrome/Android WebView 105+ atau Safari iOS 16+.

---

## v1.9.46 — Tampilan Risk Guard baru

Dibangun di atas v1.9.45 (termasuk perbaikan AI News/Forex Factory di dalamnya).

### Perubahan
- File baru `src/RiskGuardCard.jsx`: kartu Risk Guard bergaya biru-navy dengan cincin indikator, tiga kartu angka (Batas rugi harian, Kerugian bersih tercatat, Sisa batas), baris P/L hari ini dengan bilah progres, dan catatan di bawah.
- `src/TradingJournal.jsx`: blok Risk Guard lama diganti `<RiskGuardCard riskGuard={riskGuard} />` plus satu baris import.

### Tidak berubah
`computeDailyRiskGuard`, batas 4%, dan semua angka. `src/journalMath.js` identik dengan versi sebelumnya. Hanya tampilan yang berganti.

### Perilaku tampilan
- Cincin menunjukkan SISA batas: penuh saat 0% terpakai, mengecil saat rugi bertambah, kosong saat batas tercapai.
- Warna mengikuti status: AMAN hijau, WASPADA (>=75%) kuning, BATAS TERCAPAI (>=100%) merah, BELUM ADA MODAL abu-biru.
- Responsif: di HP cincin berada di atas kartu angka; di layar lebar cincin di kiri seperti gambar acuan.
- Kartu selalu berlatar biru-navy (tidak berubah mengikuti tema terang/gelap).

### Yang sengaja tidak dibawa dari gambar acuan
- Tombol "..." di kanan atas (tidak punya fungsi di aplikasi).
- Tulisan "· 4%" pada label Batas rugi harian (gambar acuan tidak memilikinya).

### Pengujian
Dirender dengan data dari fungsi hitung yang asli untuk lima kondisi (aman, waspada, batas tercapai, belum ada transaksi, belum ada modal) pada lebar 320/360/390/1000 px; tidak ada overflow horizontal.
Belum diuji: build Vite penuh dan tampilan di perangkat nyata.

---

## v1.9.45 — AI News: tahan terhadap HTTP 429 dari Forex Factory

Menyentuh `worker/ai-news-worker.js`, `src/EconomicCalendar.jsx` (satu catatan kaki), dan versi di `package.json`.

### Temuan
`nfs.faireconomy.media` hidup tetapi membalas HTTP 429 (pembatasan per IP) ke Worker; `cdn-nfs.faireconomy.media` mati (1016).

### Perubahan
- Setelah 429, Worker menunggu 15 menit (bukan 2 menit) sebelum mencoba lagi dan tidak lagi mencoba alamat kedua pada putaran yang sama.
- Salinan terakhir yang berhasil dipakai hingga 3 hari (sebelumnya 12 jam); `enrichment.fetchedAt` menunjukkan umurnya dan kalender memberi catatan jika angka FF berasal dari salinan lama.
- Perilaku lain tidak berubah.

### Belum terverifikasi
Apakah pembatasan 429 hanya sementara. Jika 429 terus berulang, sumber ini tidak bisa dipakai dari Cloudflare Worker.

---

## v1.9.44 — AI News: beberapa alamat feed Forex Factory

Hanya `worker/ai-news-worker.js` dan versi di `package.json`.

### Masalah
Alamat feed `cdn-nfs.faireconomy.media` membalas HTTP 530 (error 1016: origin DNS tidak ditemukan), sehingga Forecast/Previous tidak pernah terisi.

### Perubahan
- Worker mencoba beberapa alamat berurutan (`nfs.faireconomy.media`, lalu `cdn-nfs.faireconomy.media`) untuk tiap file minggu ini dan minggu depan.
- Jika semua gagal, `enrichment.warning` memuat alasan tiap alamat; `enrichment.host` menunjukkan alamat yang berhasil.
- Perilaku lain tidak berubah.

### Belum terverifikasi
Apakah `nfs.faireconomy.media` aktif dan menerima permintaan dari Cloudflare Worker.

---

## v1.9.43 — AI News: alasan kegagalan Forex Factory terlihat

Hanya `worker/ai-news-worker.js` dan versi di `package.json`.

### Masalah
Saat Forex Factory gagal, `enrichment.warning` hanya berisi pesan jeda, sehingga penyebab asli (mis. HTTP 403/429) tidak terlihat.

### Perubahan
- Alasan kegagalan asli (status HTTP dan potongan isi balasan hingga 120 karakter) disimpan bersama jeda 2 menit dan ditampilkan di `enrichment.warning`.
- Perilaku lain tidak berubah.

---

## v1.9.42 — AI News: Forecast & Previous dari Forex Factory

Menyentuh: `worker/ai-news-worker.js`, `src/EconomicCalendar.jsx`, `src/AINews.jsx`, versi di `package.json`.
Tidak menyentuh jurnal, RiskGuard, lot sizing, Supabase, atau secret.

### Latar belakang
Data XOOMAR untuk event seperti Nonfarm Payrolls berisi `previous`, `forecast`, dan `actual` bernilai `null` (sumber `bls` = jadwal resmi, bukan konsensus). Tampilan "—" benar; sumbernya yang kosong.

### Perubahan
- Worker mengambil feed JSON gratis Forex Factory (USD saja), menyimpannya di KV (`cache:ff`, segar 30 menit, dipakai hingga 12 jam jika sumber gagal), dan menjeda 2 menit setelah kegagalan agar tidak membanjiri sumber.
- Event dicocokkan lewat waktu (±10 menit) dan nama (token yang dinormalkan: NFP, CPI, PCE, m/m, y/y, Core). Jika ada dua kandidat setara, tidak ada yang dipilih (lebih aman kosong daripada salah).
- Hanya nilai yang kosong dari XOOMAR yang diisi. Nilai dari Forex Factory ditandai "FF" dan ditampilkan apa adanya (mis. "200K"), tanpa dikarang atau dihitung ulang.
- Actual tetap dari XOOMAR (feed mingguan Forex Factory tidak memuat actual). Jika suatu saat feed memuatnya, nilai itu dipakai hanya bila XOOMAR kosong.
- `/api/ai-news/events` menambah field `enrichment` (status, jumlah cocok, daftar event yang tidak cocok).
- Kalender kini membaca dari Worker; jika Worker gagal, kembali ke XOOMAR langsung seperti sebelumnya.
- Daftar Analisis menampilkan baris "Prev · Fcst · Act" per rilis. Forecast dan Previous ikut dikirim ke AI.

### Batasan
- Feed Forex Factory hanya mencakup minggu berjalan (minggu depan dicoba, belum terverifikasi). Event yang masih jauh tetap "—" sampai minggunya tiba.
- Feed tidak resmi dan dibatasi per IP; jika menolak alamat Cloudflare, Forecast kosong dan kalender tetap berjalan.

### Pengujian lokal (data tiruan)
NFP terisi 200K/236K, CPI m/m tidak tertukar dengan y/y, Core CPI cocok, nama ambigu dibiarkan kosong, baris EUR diabaikan, cache tidak memanggil ulang, 429 + cache lama memakai angka lama, tanpa cache kalender tetap tampil. Pengujian Web Push, cache kalender, dan kunci API tetap lulus.

### Belum terverifikasi
Feed Forex Factory nyata dari Cloudflare, dan seberapa banyak nama event XOOMAR yang cocok dengan nama Forex Factory (lihat `enrichment.unmatched`).

---

## v1.9.41 — AI News: kalender ringkas dan analisis inline

- Kalender ekonomi hanya menampilkan High Impact dan Medium Impact.
- Urutan konsisten: High Impact terlebih dahulu, kemudian Medium Impact; masing-masing diurutkan menurut waktu rilis.
- Kartu kalender menampilkan Previous, Forecast, dan Actual. Forecast hanya diisi jika disediakan sumber; nilai yang tidak tersedia tetap ditampilkan sebagai tanda pisah.
- Analisis fundamental terbuka tepat di bawah kartu rilis yang dipilih dan dapat ditutup kembali.
- Daftar analisis hanya menampilkan rilis High dan Medium Impact, dengan High di atas Medium.
- Tidak mengubah rumus RiskGuard, jurnal, lot sizing, atau pengaturan backend secrets.

---

## v1.9.40 — AI News: diagnostik tes notifikasi

- `/test-push` kini mengembalikan `providerStatus`, `providerHost`, dan isi error dari layanan push; tag notifikasi tes unik agar tidak digabung dengan tes sebelumnya.
- Tombol tes menampilkan ringkasan diagnostik: izin notifikasi, mode standalone, status service worker, host langganan.

---

## v1.9.39 — AI News: tombol tes notifikasi

Menyentuh `worker/ai-news-worker.js`, `src/AINews.jsx`, versi di `package.json`.

### Perubahan
- Endpoint baru `POST /api/ai-news/test-push`: mengirim satu push tes hanya ke perangkat pemanggil (berdasarkan endpoint langganannya). Hanya POST, jadi membuka alamatnya di browser tetap "Not found".
- Cooldown 1 menit per perangkat (kunci KV `cooldown:test:*`). Langganan kedaluwarsa (404/410) dihapus otomatis.
- Tombol "Kirim notifikasi tes" muncul di UI setelah perangkat terdaftar.

### Belum terverifikasi
Pengiriman nyata ke perangkat (perlu deploy dan HP).

---

## v1.9.38 — AI News: dukungan kunci API XOOMAR

Hanya menyentuh `worker/ai-news-worker.js` dan versi di `package.json`.

### Masalah
Tanpa kunci, XOOMAR membatasi 30 permintaan per menit per IP. Worker Cloudflare keluar lewat IP bersama, sehingga permintaan kalender bisa ditolak dengan HTTP 429. Kunci gratis menaikkan batas menjadi 120 per menit.

### Perubahan
- Worker membaca secret opsional `XOOMAR_API_KEY` dan mengirimnya ke XOOMAR.
- Cara pengiriman diatur lewat variabel opsional `XOOMAR_KEY_MODE` (tanpa ubah kode):
  - kosong atau `x-api-key` (bawaan): header `x-api-key`
  - `Bearer`: header `Authorization: Bearer ...`
  - `query:NAMA`: parameter di alamat, mis. `query:api_key`
  - nama header lain, mis. `X-Xoomar-Key`
- `/api/ai-news/health` menampilkan `calendarKey:true/false` (kunci tidak pernah ditampilkan).
- Jika XOOMAR membalas 401/403, pesan error menyarankan memeriksa `XOOMAR_API_KEY` dan `XOOMAR_KEY_MODE`.

### Belum terverifikasi
Format pengiriman kunci yang diterima XOOMAR (dokumentasi tidak dapat dibuka dari lingkungan kerja). Bawaan `x-api-key` adalah tebakan paling umum; jika ditolak, ubah `XOOMAR_KEY_MODE`.

---

## v1.9.37 — AI News: perbaikan Calendar HTTP 429

Hanya menyentuh `worker/ai-news-worker.js` dan versi di `package.json`.

### Masalah
Cron memanggil XOOMAR setiap menit (sekitar 1.440 kali per hari), sehingga provider membalas HTTP 429 dan `lastRun` berstatus error.

### Perubahan
- Kalender disimpan di KV (`cache:calendar`) selama 10 menit. Cron dan `/api/ai-news/events` memakai salinan itu, sehingga XOOMAR hanya dipanggil sekitar sekali per 10 menit.
- Jika XOOMAR gagal (termasuk 429) tetapi ada salinan yang umurnya di bawah 6 jam, salinan lama dipakai. Status `lastRun` tetap `ok` dengan `calendar:"stale"` dan field `warning`.
- Penulisan `meta:last-run` dibatasi (maksimal sekali per 5 menit jika statusnya sama), agar tidak melewati batas 1.000 penulisan KV per hari pada paket gratis.
- Header `user-agent` ditambahkan pada permintaan ke XOOMAR.

### Pengujian lokal
429 tanpa cache tercatat sebagai error tanpa crash; error berulang hanya menulis last-run sekali; run berikutnya memakai cache (0 panggilan ke XOOMAR); 429 dengan cache lama memakai cache dan `/events` tidak 502. Seluruh pengujian Web Push sebelumnya tetap lulus.

### Belum terverifikasi
Apakah XOOMAR memblokir permintaan dari IP Cloudflare secara permanen. Jika 429 tetap muncul pada panggilan pertama setelah deploy, perlu sumber kalender alternatif.

---

## v1.9.36 — AI News hardening (dari v1.9.35 PATCH2)

Hanya menyentuh AI News: `worker/ai-news-worker.js`, `wrangler.jsonc`, `package.json` (versi). Journal, RiskGuard, Supabase, dan UI lain tidak diubah.

### Perubahan
- `wrangler.jsonc`: tambah `run_worker_first: ["/api/*"]` agar `/api/ai-news/*` selalu dijawab Worker. Tanpa ini, membuka `/api/ai-news/health` di browser bisa menampilkan halaman SPA, bukan JSON.
- `VAPID_SUBJECT` sekarang wajib (tidak ada lagi fallback `mailto:admin@example.com`, yang bisa ditolak Apple). `/health` melaporkan `push:true` hanya jika ketiga secret VAPID ada.
- `/subscribe` hanya menerima endpoint dari layanan push resmi (Google/FCM, Mozilla, Apple, Windows) dan menolak Origin asing pada request POST. CORS `*` dihapus karena aplikasi dan API satu origin.
- `/alerts` membaca satu indeks ringkas (`meta:recent`, maks 30) alih-alih membaca hingga 1000 key KV, agar tidak kena batas subrequest.
- Teks pengingat memakai sisa menit yang sebenarnya jika terkirim terlambat (jendela pemulihan 5 menit).
- Pemeriksaan dampak tinggi dibuat eksplisit (`high`/`3`).

### Pengujian lokal (Node 22, mock KV dan mock fetch)
Subscribe valid/invalid, Origin asing ditolak, VAPID JWT terverifikasi, payload Web Push (aes128gcm) berhasil didekripsi seperti browser, cron mengirim 1 push, run kedua tidak duplikat, event dampak rendah diabaikan.

### Belum diverifikasi (butuh akun Cloudflare dan perangkat)
Build Vite penuh, Workers AI nyata, KV nyata, pengiriman ke iPhone, dan payload asli XOOMAR (tidak ada field negara, jadi alert dampak tinggi bisa mencakup non-AS).

### Deploy
1. Secret: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mis. `mailto:emailanda@domain.com`).
2. Pastikan ID KV di `wrangler.jsonc` benar dan Workers AI aktif.
3. Setelah deploy, buka `/api/ai-news/health`: harus `scheduler:true`, `ai:true`, `push:true`.
4. Di iPhone: buka dari ikon Home Screen, tekan "Aktifkan notifikasi".

---

## Tahap awal AI News (tanpa nomor versi)

### v1.9.34 — AI News integrated package

- Added a Worker entrypoint to the same Wrangler static-assets project so frontend routes and backend APIs can share one deployment when the Cloudflare Git integration honors `wrangler.jsonc`.
- Added health/events/analysis/push subscription/alerts endpoints.
- Added Workers AI analysis endpoint with explicit anti-hallucination constraints and no invented consensus or live gold reaction.
- Added Cron scheduler for H-30 and H-5 reminders and KV-based idempotency markers.
- Added Web Push subscription UI and service worker notification/click handlers.
- Kept the existing XOOMAR calendar view and RiskGuard/journal math intact.

Validation status:
- Source/ZIP integrity and Worker JavaScript syntax can be checked locally.
- A full Vite production build and real Cloudflare/AI/KV/Web Push end-to-end test are not claimed unless separately run with dependencies, account bindings, and real device.
- Production requires a real KV namespace ID and VAPID secrets. Do not commit private keys.

#### AI News reliability patch (pre-deployment)
- Scheduler retries failed/incomplete push deliveries for up to 3 attempts while the event reminder remains within a 5-minute recovery window.
- Successfully delivered subscriptions are recorded per reminder and skipped on retries, avoiding duplicate push messages to devices that already received them.
- The event eligibility window now permits recovery for up to 5 minutes after the scheduled event time, matching the documented recovery window.
- Successfully processed reminders remain idempotent and are not sent again by Cron retries.
- This patch is limited to `worker/ai-news-worker.js`; journal, RiskGuard, Supabase schema, and unrelated UI logic are unchanged.
- Validation performed: Node syntax checks for the Worker and service worker, plus ZIP integrity. Live XOOMAR, Cloudflare KV/Workers AI, Web Push, and production build remain unverified until network/dependencies and account configuration are available.

### TraderLogs v1.9.29 — AI News Stage 1

#### Added
- Added an isolated AI News XAU/USD page and a new bottom navigation item.
- Added clear, non-live status cards describing planned calendar, AI analysis, push notifications, and Risk Awareness capabilities.
- Documented that the AI News page is a foundation only; it does not claim to fetch live news, run AI analysis, or send notifications yet.

#### Preserved
- Existing journal, simulator, chart, and embedded economic calendar components.
- Existing Risk Guard calculation logic and settings. `src/journalMath.js` was not changed.
- Existing Supabase storage and authentication implementation.

#### Not included yet
- No server-side scheduler or push-notification backend.
- No AI provider integration or API keys.
- No new Supabase tables or schema changes.

#### Validation
- Source changes were inspected and the Risk Guard math file was left unchanged.
- A production build could not be run in this environment because `npm install` timed out before Vite dependencies were available. Run `npm install` and `npm run build` locally before deployment.

### TraderLogs v1.9.30 — AI News Stage 2

#### Perubahan
- Menghubungkan komponen kalender ekonomi yang sudah ada ke halaman AI News.
- Mempertahankan kalender lama di Chart → Berita.
- Menjelaskan bahwa kalender memperbarui data ketika halaman terbuka, bukan melalui scheduler server.
- Mempertahankan penjelasan bahwa analisis AI dan push notification belum aktif.
- Tidak mengubah `src/journalMath.js` atau skema Supabase.

#### Batasan yang diketahui
- Sumber kalender: XOOMAR (`https://xoomar.com/api/markets/calendar`).
- Sumber ini tidak menyediakan forecast konsensus pada integrasi yang ada. Jangan menyimpulkan actual-vs-forecast jika forecast tidak tersedia.
- Refresh berkala masih bergantung pada halaman browser yang terbuka. Pengingat saat aplikasi tertutup membutuhkan layanan server-side terpisah pada tahap berikutnya.

#### Pemeriksaan
- ZIP integrity: akan diperiksa setelah arsip dibuat.
- Build produksi: belum diverifikasi bila dependensi npm tidak tersedia dalam lingkungan kerja.

### TraderLogs AI News — Stage 3 (Scheduler foundation)

#### Included
- Separate Cloudflare Worker entrypoint at `worker/ai-news-worker.js`.
- Cron Trigger configured for once per minute.
- Fetches the existing XOOMAR calendar source from the server, not from the user's open browser.
- Filters high-impact events and a focused list of gold-relevant US releases.
- Queues reminder records for 30 minutes and 5 minutes before release.
- Uses KV idempotency keys to avoid duplicate queued reminders.
- Read-only endpoints: `/health`, `/api/status`, `/api/alerts?limit=20`.
- Keeps the main TraderLogs `wrangler.jsonc`, journal math, and Supabase schema unchanged.

#### Important Stage 3 boundary
This stage queues reminder records only. It does **not** send push notifications to phones yet; push subscription and delivery are Stage 4. The worker must be deployed separately and configured with a real KV namespace ID and the exact deployed TraderLogs origin before it can run.

#### Deployment
1. Install project dependencies in the extracted project folder: `npm install`.
2. Create a KV namespace: `npx wrangler kv namespace create ALERTS_KV`.
3. Copy the returned namespace ID into `wrangler.ai-news.jsonc` replacing `REPLACE_WITH_KV_NAMESPACE_ID`.
4. Replace `https://REPLACE_WITH_YOUR_TRADERLOGS_DOMAIN` with the exact production origin (scheme + host, no trailing slash).
5. Deploy from the project folder: `npx wrangler deploy --config wrangler.ai-news.jsonc`.
6. Open the Worker URL plus `/health`; then `/api/status`. The first Cron run can take up to about a minute.
7. Do not call the stage complete until the health endpoint, successful Cron run, and queued reminder test are verified.

#### Limits and safety
- Provider event names/importance values may change; inspect live provider payloads before relying on filtering.
- Provider schedules can be corrected or cancelled. This stage does not yet reconcile previously queued alerts after schedule changes; improve this before push delivery.
- Calendar provider is external and may be stale or unavailable.
- No consensus forecast is fabricated. AI analysis is not part of this stage.
- No trades, lot sizes, stop loss, daily risk cap, or journal entries are modified.
- Do not put API keys, Supabase service-role keys, or other secrets in frontend files or this config.
