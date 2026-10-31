# v1.9.94 — Tepi bawah header memudar lebih halus

- Tinggi fade tepi bawah header: 12 px menjadi 32 px.
- Gradasi dibuat bertahap (9 titik, melambat di ujung) supaya tidak ada garis tegas.
- Blur (`--glass-blur`), warna, logic, dan struktur tidak diubah.
- Satu-satunya perubahan kode: `.tj-hdr::before` di `src/tjStyles.js`.
