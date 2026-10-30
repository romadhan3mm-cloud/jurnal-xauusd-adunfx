# v1.9.73 — Perbaikan gagal build Cloudflare (rollup)

Hanya menyentuh `package.json`. Tidak ada file kode yang berubah.

## Masalah
Build Cloudflare gagal pada `vite build`: modul `@rollup/rollup-linux-x64-gnu` tidak ditemukan. Penyebabnya `bun install` memilih rollup 4.67.2 yang paket Linux-nya dijawab 404 oleh registry npm, sehingga tidak terpasang. Tidak terkait perubahan kartu v1.9.72.

## Perbaikan
- Menambah `overrides` dan `resolutions` yang mengunci `rollup` ke 4.34.8 (versi lama yang stabil; dipakai Vite 5 lewat `^4.20.0`). `overrides` dibaca npm dan bun, `resolutions` dibaca bun.
- Versi aplikasi naik ke 1.9.73.

## Tidak berubah
Semua kode aplikasi dan versi paket lain.

## Catatan
Kalau repo GitHub sudah punya `bun.lock` atau `package-lock.json`, hapus file itu lalu commit supaya terpasang ulang sesuai kunci baru.
