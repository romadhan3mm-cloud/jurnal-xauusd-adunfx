# TradeJournal Premium UI v1.4.1 — Full Background Upgrade

## Perubahan
- Background gelap premium kini diterapkan ke seluruh halaman dan viewport, bukan hanya area header/atas.
- Lapisan cahaya emas dan aksen gelap menyebar halus ke seluruh layar.
- Latar belakang tetap menyatu saat halaman digulir.
- Panel hero dibuat lebih transparan agar tidak terlihat seperti kolom terpisah.
- Logika transaksi, jurnal, perhitungan, dan penyimpanan tidak sengaja diubah.

## Upload ke GitHub
1. Backup repository saat ini.
2. Ekstrak ZIP ini.
3. Unggah seluruh isi folder ke root repository GitHub (termasuk folder `src` dan `public`).
4. Pastikan environment variables Netlify/Supabase lama tetap tersedia.
5. Deploy ulang di Netlify.

Build belum dijalankan di lingkungan ini; jalankan `npm install` lalu `npm run build` untuk verifikasi.
