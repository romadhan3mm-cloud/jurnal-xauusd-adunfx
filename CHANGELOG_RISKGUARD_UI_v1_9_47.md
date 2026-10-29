# v1.9.47 — Risk Guard tetap horizontal di HP

Hanya menyentuh `src/RiskGuardCard.jsx` dan versi di `package.json`.

## Perubahan
- Susunan kartu kini sama di semua lebar layar: cincin di kiri, tiga kartu angka di kanan, baris P/L di bawahnya, lalu catatan. Sebelumnya di HP cincin pindah ke atas dan kartu angka turun.
- Semua ukuran (font, ikon, cincin, padding) mengikuti lebar kartu lewat container query unit `cqw`, dengan batas atas = ukuran lama dan batas bawah supaya teks tetap terbaca.
- Header (judul + lencana status) tetap satu baris.

## Tidak berubah
`computeDailyRiskGuard`, batas 4%, semua angka, warna status, dan file lain.

## Pengujian
Dirender dengan data untuk empat kondisi (aman, waspada, batas tercapai, belum ada modal) pada lebar 320/360/390/1000 px: tidak ada overflow horizontal dan angka tidak terpotong.
Belum diuji: build Vite penuh dan perangkat nyata. `cqw` butuh Chrome/Android WebView 105+ atau Safari iOS 16+.
