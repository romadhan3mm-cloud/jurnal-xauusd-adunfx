# v1.9.51 — Garis kotak dalam Risk Guard lebih tegas di tema terang

Menyentuh `src/RiskGuardCard.jsx`, `src/tjStyles.js`, dan versi di `package.json`.

## Perubahan
- Variabel baru `--border-inner` untuk garis kotak dalam (3 kartu angka, cincin, kotak P/L, catatan).
- Tema terang: `--border-inner` = 20% warna teks dicampur ke `--border` (abu-biru sedikit lebih gelap, tetap netral). Ketebalan tetap 1px.
- Tema gelap: `--border-inner` = `--border`, tampilan tidak berubah.

## Tidak berubah
Garis kuning/hijau/merah kartu luar, garis pemisah header, jalur cincin dan bilah, `computeDailyRiskGuard`, dan semua file lain.

## Pengujian
Belum diuji build Vite penuh dan perangkat nyata.
