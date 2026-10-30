# v1.9.78 — Keseragaman: bentuk tombol, kepala kartu standar, lebar kartu, baris Input Transaksi

Hanya tampilan. Perhitungan, state, penyimpanan, ekspor, dan fitur tidak diubah.

## 1. Bentuk tombol
- Tombol aksi memakai persegi bulat (`BTN_RADIUS` di `CardHeader.jsx`, nilainya sama dengan tombol Tambah Transaksi).
- Download Excel dan Reset ke default (Simulasi): dari pil menjadi persegi bulat.
- Tombol filter Kalender Ekonomi (Semua jadwal / Akan datang / Sudah rilis): dari pil menjadi persegi bulat.
- Tetap pil: lencana kepala kartu (PERFORMA, GRAFIK, MUAT ULANG), lencana status (Risk Guard, HIGH/MEDIUM IMPACT), dan tombol di halaman login.

## 2. Kepala kartu standar (ikon bulat, judul, garis biru)
- AI News: judul halaman, Status layanan, Analisis fundamental AI, Pengingat otomatis & iPhone, Kalender & jadwal, Risk Awareness.
- Kalender Ekonomi: kepala standar dengan lencana MUAT ULANG. Kepala ganda di AI News dan di tab Berita (Chart) dihapus.
- Chart: kartu XAU/USD memakai kepala standar; tombol timeframe dan widget TradingView tidak diubah.

## 3. Lebar kartu
- Padding halaman kiri-kanan 28px menjadi 16px di `TradingJournal.jsx`. Kartu bertambah lebar sekitar 24px di semua menu.
- Header yang menempel (`.tj-hdr`) dan tombol aksi header di `tjStyles.js` ikut 16px supaya tetap sejajar dengan kartu.

## 4. Baris Input Transaksi
- Ikon tanggal di kolom Tanggal dihapus (hanya hiasan, bukan tombol; kalender tetap dibuka lewat tombol bulan aktif).
- Baris tidak lagi berbentuk kartu: tanpa latar dan sudut bulat, hanya garis pemisah tipis di bawah tiap baris.

## Tidak berubah
Logic, state, penyimpanan, kolom isian (72px, 16px di HP), tinggi tombol, menu titik tiga, kartu Statistik, Risk Guard, Rekomendasi Lot, dan semua file lain.

## Pengujian
Sintaks JSX dicek dengan tsc (lolos). Build Vite penuh dan tampilan di HP belum diuji.
