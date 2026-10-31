# v1.9.89 — Latar kartu sedikit ngeblur + garis bawah grafik Pertumbuhan Saldo diperjelas

Menyentuh `src/CardHeader.jsx`, `src/RiskGuardCard.jsx`, `src/TargetSimulator.jsx`, `src/TradingJournal.jsx`, dan versi di `package.json`.

## Perubahan
- Semua kartu (CardShell, Risk Guard, kotak error Simulasi) kini punya blur halus (6px) pada latar di belakangnya. Warna latar kartu (`--surface-soft`) tidak diubah.
- Blur dipasang lewat lapisan `GlassLayer` di belakang isi kartu, bukan filter pada kartunya, supaya menu dan elemen fixed/absolute di dalam kartu tidak berubah perilaku. Kartu pemakainya diberi `isolation: isolate`.
- Grafik Pertumbuhan Saldo (tampilan Garis, Batang, dan Area): garis sumbu horizontal bawah kini sama jelasnya dengan garis sumbu vertikal (warna `tick`, opacity 0.45), sebelumnya memakai warna grid yang samar.

## Tidak berubah
Perhitungan, state, data grafik, grid, dan grafik lain (Perbandingan Bulan, Statistik, Simulasi), serta semua file lain.

## Pengujian
Efek blur diuji di Chromium dengan struktur yang sama (container-type, isolation, lapisan blur): latar tersamarkan, teks tetap tajam. Sintaks JSX dicek dengan tsc. Belum diuji di iPhone (Safari) maupun build Vite penuh.
