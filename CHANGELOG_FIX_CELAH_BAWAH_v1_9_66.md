# v1.9.66 — Perbaikan pita gelap di bawah tab bar (iPhone, setelah mengetik)

Hanya menyentuh `src/viewportGap.js` dan versi di `package.json`.

## Gejala
Setelah mengetik di kolom input lalu keyboard ditutup, tab bar naik dan muncul pita gelap (warna --bg) di bawahnya.

## Penyebab (dari hasil ukur warna pada tangkapan layar)
Pita itu berwarna --bg (#0A1628), bukan --surface. Padahal celah bawah biasanya diisi bayangan tab bar berwarna --surface setinggi `--vgap`. Jadi `--vgap` tertinggal 0: dihitung saat keyboard terbuka (selisih tinggi > 120 → 0) dan tidak dihitung ulang karena iOS tidak mengirim event resize saat keyboard ditutup.

## Perbaikan
- `--vgap` dihitung ulang 4 kali (100/400/900/1600 ms) setelah kolom input kehilangan fokus.
- `--vgap` juga dihitung ulang saat `visualViewport` berubah ukuran.
- Rumus dan variabel lain tidak diubah.

## Pengujian
Sintaks dicek dengan esbuild. Belum diuji di perangkat iPhone nyata.
