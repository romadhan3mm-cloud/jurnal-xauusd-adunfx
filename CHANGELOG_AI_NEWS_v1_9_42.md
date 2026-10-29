# v1.9.42 — AI News: Forecast & Previous dari Forex Factory

Menyentuh: `worker/ai-news-worker.js`, `src/EconomicCalendar.jsx`, `src/AINews.jsx`, versi di `package.json`.
Tidak menyentuh jurnal, RiskGuard, lot sizing, Supabase, atau secret.

## Latar belakang
Data XOOMAR untuk event seperti Nonfarm Payrolls berisi `previous`, `forecast`, dan `actual` bernilai `null` (sumber `bls` = jadwal resmi, bukan konsensus). Tampilan "—" benar; sumbernya yang kosong.

## Perubahan
- Worker mengambil feed JSON gratis Forex Factory (USD saja), menyimpannya di KV (`cache:ff`, segar 30 menit, dipakai hingga 12 jam jika sumber gagal), dan menjeda 2 menit setelah kegagalan agar tidak membanjiri sumber.
- Event dicocokkan lewat waktu (±10 menit) dan nama (token yang dinormalkan: NFP, CPI, PCE, m/m, y/y, Core). Jika ada dua kandidat setara, tidak ada yang dipilih (lebih aman kosong daripada salah).
- Hanya nilai yang kosong dari XOOMAR yang diisi. Nilai dari Forex Factory ditandai "FF" dan ditampilkan apa adanya (mis. "200K"), tanpa dikarang atau dihitung ulang.
- Actual tetap dari XOOMAR (feed mingguan Forex Factory tidak memuat actual). Jika suatu saat feed memuatnya, nilai itu dipakai hanya bila XOOMAR kosong.
- `/api/ai-news/events` menambah field `enrichment` (status, jumlah cocok, daftar event yang tidak cocok).
- Kalender kini membaca dari Worker; jika Worker gagal, kembali ke XOOMAR langsung seperti sebelumnya.
- Daftar Analisis menampilkan baris "Prev · Fcst · Act" per rilis. Forecast dan Previous ikut dikirim ke AI.

## Batasan
- Feed Forex Factory hanya mencakup minggu berjalan (minggu depan dicoba, belum terverifikasi). Event yang masih jauh tetap "—" sampai minggunya tiba.
- Feed tidak resmi dan dibatasi per IP; jika menolak alamat Cloudflare, Forecast kosong dan kalender tetap berjalan.

## Pengujian lokal (data tiruan)
NFP terisi 200K/236K, CPI m/m tidak tertukar dengan y/y, Core CPI cocok, nama ambigu dibiarkan kosong, baris EUR diabaikan, cache tidak memanggil ulang, 429 + cache lama memakai angka lama, tanpa cache kalender tetap tampil. Pengujian Web Push, cache kalender, dan kunci API tetap lulus.

## Belum terverifikasi
Feed Forex Factory nyata dari Cloudflare, dan seberapa banyak nama event XOOMAR yang cocok dengan nama Forex Factory (lihat `enrichment.unmatched`).
