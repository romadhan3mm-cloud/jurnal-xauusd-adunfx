# TraderLogs v1.9.30 — AI News Stage 2

## Perubahan
- Menghubungkan komponen kalender ekonomi yang sudah ada ke halaman AI News.
- Mempertahankan kalender lama di Chart → Berita.
- Menjelaskan bahwa kalender memperbarui data ketika halaman terbuka, bukan melalui scheduler server.
- Mempertahankan penjelasan bahwa analisis AI dan push notification belum aktif.
- Tidak mengubah `src/journalMath.js` atau skema Supabase.

## Batasan yang diketahui
- Sumber kalender: XOOMAR (`https://xoomar.com/api/markets/calendar`).
- Sumber ini tidak menyediakan forecast konsensus pada integrasi yang ada. Jangan menyimpulkan actual-vs-forecast jika forecast tidak tersedia.
- Refresh berkala masih bergantung pada halaman browser yang terbuka. Pengingat saat aplikasi tertutup membutuhkan layanan server-side terpisah pada tahap berikutnya.

## Pemeriksaan
- ZIP integrity: akan diperiksa setelah arsip dibuat.
- Build produksi: belum diverifikasi bila dependensi npm tidak tersedia dalam lingkungan kerja.
