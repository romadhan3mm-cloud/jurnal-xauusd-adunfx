# v1.9.48 — Risk Guard ikut tema, latar tipis, isi 3 kartu di tengah

Hanya menyentuh `src/RiskGuardCard.jsx` dan versi di `package.json`.

## Perubahan
- Latar kartu kini `var(--surface-soft)` (50% transparan), sama seperti kartu lain. Kotak-kotak di dalamnya juga tipis (`--surface-raised` 55%).
- Semua warna (teks, garis, cincin, bilah, lencana status) memakai variabel tema, jadi kartu berganti terang/gelap bersama aplikasi. Tidak lagi navy tetap.
- Isi tiga kartu angka (Batas rugi harian, Kerugian bersih tercatat, Sisa batas): ikon, label, dan nilai dipusatkan.

## Tidak berubah
`computeDailyRiskGuard`, batas 4%, semua angka, susunan horizontal di HP, ukuran berbasis `cqw`, dan file lain.

## Pengujian
Belum diuji build Vite penuh dan perangkat nyata. `color-mix` sudah dipakai di bagian lain aplikasi (Safari iOS 16.2+ / Chrome 111+).
