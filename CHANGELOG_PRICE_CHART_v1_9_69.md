# v1.9.69 — Chart harga XAUUSD sederhana (tab "Harga")

## Yang ditambah
- Tab baru **Harga** di halaman Chart (di samping Chart dan Berita). TradingView dan Kalender tidak diubah.
- `src/PriceChart.jsx`: chart area/garis (Recharts, gaya sama seperti chart lain). Harga terakhir besar di kanan atas, perubahan dari awal periode (hijau/merah), tombol 5M / 15M / 1J / 1H, tooltip saat disentuh, refresh otomatis tiap 30 detik saat halaman terbuka, tombol "Coba lagi" bila gagal.
- `worker/ai-news-worker.js`: endpoint `GET /api/ai-news/price?interval=5m&range=1d`. Mengambil data dari Yahoo Finance tanpa API key (simbol `XAUUSD=X`, cadangan `GC=F`), membuang titik kosong, cache edge 20 detik. Kombinasi interval/range dibatasi (5m/15m/60m/1d) dan hanya metode GET.

## Catatan
- Sumber Yahoo tidak resmi: bisa tertunda, terkadang menolak permintaan, dan kosong saat pasar tutup. Bukan untuk eksekusi order.
- Worker perlu dideploy ulang agar endpoint aktif. Saat `vite dev` lokal endpoint tidak ada, chart menampilkan pesan error.
- Tidak ada library baru dan tidak ada kunci/secret baru.

## Pengujian
Sintaks JSX dan Worker dicek dengan esbuild; logika `fetchPrice` dites dengan respons tiruan (fallback simbol, titik kosong, validasi range, error). Belum dites dengan Yahoo sungguhan, build Vite penuh, atau perangkat nyata.
