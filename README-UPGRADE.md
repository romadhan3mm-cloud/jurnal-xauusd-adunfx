# TradeJournal XAUUSD — Premium UI Upgrade v1.4.0

## Yang diperbarui
- Refresh tema premium gelap dengan aksen emas, permukaan kartu lebih rapi, dan fokus input yang jelas.
- Peningkatan kenyamanan sentuhan di layar mobile dan dukungan safe-area.
- Penyesuaian tampilan grafik, scrollbar, dropdown akun, dan form.
- Menghormati preferensi reduced motion perangkat.
- Versi aplikasi dinaikkan ke 1.4.0.

## Yang tidak diubah
Logika jurnal, transaksi, kalkulasi, autentikasi Supabase, ekspor/impor, chart TradingView, dan penyimpanan tetap dipertahankan.

## Deploy ke GitHub / Netlify
1. Ekstrak ZIP ini.
2. Upload seluruh isi folder ke repository GitHub (bukan folder ZIP di dalam repository).
3. Pastikan konfigurasi environment Supabase yang sudah dipakai proyek tetap tersedia di pengaturan deploy.
4. Jalankan `npm install` lalu `npm run build` untuk memeriksa build.
5. Deploy seperti biasa melalui Netlify.

Catatan: ini adalah penyegaran UI berbasis CSS; tidak mengubah struktur fitur utama agar risiko regresi lebih kecil.
