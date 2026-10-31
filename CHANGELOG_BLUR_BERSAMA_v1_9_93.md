# v1.9.93 — Satu pengaturan blur untuk kartu dan header

Menyentuh `src/tjStyles.js`, `src/CardHeader.jsx`, `src/TargetSimulator.jsx`, dan versi di `package.json`.

## Perubahan
- Variabel baru `--glass-blur: 6px` (di `tjStyles.js`) dipakai oleh blur kartu (`GlassLayer`), kotak error Simulasi, dan header. Cukup ubah satu angka untuk mengubah semuanya.
- Blur header turun dari 8px ke 6px agar sama dengan kartu.

## Tidak berubah
Blur kartu (tetap 6px), latar tint dan gradien header, perilaku header yang hanya buram saat halaman digulir, tab bar bawah (solid, tanpa blur), dan semua file lain.

## Pengujian
`npm test`: 30 tes lulus. Belum diuji tampilan di HP (terutama keterbacaan header saat isi bergulir di bawahnya).
