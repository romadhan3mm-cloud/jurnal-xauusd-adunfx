# v1.9.74 — Keseragaman kode kartu (tanpa perubahan tampilan)

Menyentuh `src/CardHeader.jsx`, `src/StatsCard.jsx`, `src/RecommendationCard.jsx`, `src/TargetSimulator.jsx`, `src/RiskGuardCard.jsx`, dan versi di `package.json`.

## Perubahan
- `CardHeader.jsx` kini menyimpan satu `IconBadge` (lencana ikon bulat) dan palet `GRAD` (biru, hijau, ungu, merah, indigo) untuk dipakai semua kartu.
- Salinan `IconBadge` di Statistik, Rekomendasi Lot, dan Simulasi dihapus; semuanya memakai yang bersama. Teks gradien yang sama persis diganti `GRAD.*`.
- Risk Guard tidak lagi punya salinan `mix`, `s()`, dan `INNER_BG`; memakai yang dari `CardHeader.jsx`.

## Tidak berubah
Tampilan (hasil render sama persis), perhitungan, state, props, dan semua file lain. `IconBadge` dan gradien Risk Guard sengaja dibiarkan karena ukurannya/warnanya berbeda dan perlu keputusan.

## Pengujian
Sintaks JSX dicek dengan tsc. Belum diuji build Vite penuh dan perangkat nyata.
