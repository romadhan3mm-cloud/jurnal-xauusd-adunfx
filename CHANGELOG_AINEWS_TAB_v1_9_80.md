# v1.9.80 — AI News memakai tab seperti menu Chart

Hanya tampilan; logic AI News tidak diubah.

- Tab baru di AI News (gaya sama dengan Chart | Berita): Kalender, Analisis AI, Info. Hanya satu bagian tampil sekaligus supaya halaman tidak perlu digulir jauh.
- Kalender: kartu Kalender Ekonomi. Analisis AI: kartu Analisis fundamental AI. Info: Pengingat otomatis & iPhone dan Catatan penting.
- Bagian yang tidak aktif hanya disembunyikan (tidak dilepas), jadi filter kalender dan hasil analisis tidak hilang saat pindah tab dan kalender tidak dimuat ulang.
- Judul AI News dan pesan error tetap di atas semua tab.
- Komponen tab dipisah ke `src/TabSwitch.jsx` dan dipakai juga oleh menu Chart (tampilan Chart tidak berubah).

## Pengujian
Sintaks JSX dicek dengan tsc. Build Vite penuh dan tampilan di HP belum diuji.
