# v1.9.60 — Cincin winrate jadi hijau dan merah

Hanya menyentuh `src/StatsCard.jsx` dan versi di `package.json`.

## Perubahan
- Cincin winrate: busur porsi menang kini hijau (`--green`), sisa cincin (porsi kalah) merah (`--red`). Sebelumnya emas dan biru.
- Cahaya (glow) di sekeliling cincin ikut hijau.

## Tidak berubah
Teks tengah (persen, winrate, 14W - 16L), ukuran cincin, perhitungan, 4 kartu angka, baris persentase, dan semua file lain.

## Pengujian
Belum diuji build Vite penuh dan perangkat nyata.
