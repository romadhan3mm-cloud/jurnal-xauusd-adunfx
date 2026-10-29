# v1.9.46 — Tampilan Risk Guard baru

Dibangun di atas v1.9.45 (termasuk perbaikan AI News/Forex Factory di dalamnya).

## Perubahan
- File baru `src/RiskGuardCard.jsx`: kartu Risk Guard bergaya biru-navy dengan cincin indikator, tiga kartu angka (Batas rugi harian, Kerugian bersih tercatat, Sisa batas), baris P/L hari ini dengan bilah progres, dan catatan di bawah.
- `src/TradingJournal.jsx`: blok Risk Guard lama diganti `<RiskGuardCard riskGuard={riskGuard} />` plus satu baris import.

## Tidak berubah
`computeDailyRiskGuard`, batas 4%, dan semua angka. `src/journalMath.js` identik dengan versi sebelumnya. Hanya tampilan yang berganti.

## Perilaku tampilan
- Cincin menunjukkan SISA batas: penuh saat 0% terpakai, mengecil saat rugi bertambah, kosong saat batas tercapai.
- Warna mengikuti status: AMAN hijau, WASPADA (>=75%) kuning, BATAS TERCAPAI (>=100%) merah, BELUM ADA MODAL abu-biru.
- Responsif: di HP cincin berada di atas kartu angka; di layar lebar cincin di kiri seperti gambar acuan.
- Kartu selalu berlatar biru-navy (tidak berubah mengikuti tema terang/gelap).

## Yang sengaja tidak dibawa dari gambar acuan
- Tombol "..." di kanan atas (tidak punya fungsi di aplikasi).
- Tulisan "· 4%" pada label Batas rugi harian (gambar acuan tidak memilikinya).

## Pengujian
Dirender dengan data dari fungsi hitung yang asli untuk lima kondisi (aman, waspada, batas tercapai, belum ada transaksi, belum ada modal) pada lebar 320/360/390/1000 px; tidak ada overflow horizontal.
Belum diuji: build Vite penuh dan tampilan di perangkat nyata.
