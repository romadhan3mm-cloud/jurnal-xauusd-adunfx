# v1.9.81 — Keseragaman font, warna, radius; header dan tab dalam satu kartu

Hanya tampilan. Perhitungan, state, penyimpanan, fetch, dan struktur komponen tidak diubah.
Menyentuh `CardHeader.jsx`, `TabSwitch.jsx`, `AINews.jsx`, `EconomicCalendar.jsx`, `TradingViewChart.jsx`, `authStyles.js`, `Splash.jsx`, dan versi di `package.json`.

## 1. Ukuran font AI News, Kalender, Chart
- 8, 9, 10px menjadi 11px (keterangan); 12px menjadi 13px (teks isi). Sama dengan standar Jurnal (v1.9.76).
- Memakai angka tetap 11/13px, bukan `s()`: `s(13, 10)` di HP menjadi 10px sehingga teks bacaan malah mengecil dari 12px.
- Label PREVIOUS/FORECAST/ACTUAL kini 11px; "ACTUAL · MENUNGGU" bisa turun ke dua baris di HP sempit.

## 2. Ketebalan font
- 850 menjadi 800 dan 750 menjadi 700 (AI News). Google Fonts hanya memuat 400-800.

## 3. Palet warna
- `EconomicCalendar`, `TradingViewChart`, `TabSwitch`: palet salinan diganti `var(--surface)`, `--surface-raised`, `--border`, `--text`, `--muted` (ikut tema).
- Merah HIGH IMPACT memakai `var(--red)`.
- Tidak diubah: warna candle widget TradingView (`#26A69A`, `#EF5350`, perlu hex asli), merah Sabtu/Minggu kalender (`#A33A3A`), amber MEDIUM IMPACT, warna tombol aktif (`#18395F` / `#E8F1FF`).

## 4. Radius
- Token baru `BOX_RADIUS` (= `s(10, 6)`) di `CardHeader.jsx` untuk kotak dalam.
- AI News, Kalender, Chart, TabSwitch: tombol memakai `BTN_RADIUS`, kotak dalam `BOX_RADIUS`, pil tetap 999. Total 14 nilai berbeda di file-file ini menjadi 3 token.
- Belum diubah: radius 6/7/8/9px di Jurnal lama (`TradingJournal.jsx`, `tjStyles.js`, `journalWidgets.jsx`) karena sebagian untuk elemen kecil/bulat dan perlu dicek di perangkat.

## 5. Font layar login dan Splash
- 12.5px menjadi 13px, 12px menjadi 13px, 10.5px dan 10px menjadi 11px (`authStyles.js`, `Splash.jsx`). Input 16px (anti zoom iOS) tidak diubah.

## 6. Header dan tab dalam satu kartu
- AI News: tombol Kalender / Analisis AI / Info masuk ke kartu "AI News XAU/USD" (kepala kini memakai garis pembatas biru standar). Isi tab tetap kartu sendiri.
- Chart: tombol Chart | Berita masuk ke kartu XAU/USD (tab Chart) dan ke kartu Kalender Ekonomi (tab Berita).
- Tambahan kecil tanpa mengubah perilaku: `TabSwitch` punya prop `marginBottom` (default 12), `EconomicCalendar` punya prop `afterHeader` (default kosong).
- Pesan error AI News kini tampil di bawah kartu tab, bukan di antara header dan tab.

## Pengujian
Sintaks JSX dicek dengan tsc (lolos). Build Vite penuh dan tampilan di HP belum diuji.
