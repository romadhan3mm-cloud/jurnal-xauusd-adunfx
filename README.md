# TraderLogs — Jurnal Trading XAUUSD

Aplikasi jurnal trading mandiri (standalone), bisa diakses dari perangkat mana saja (HP, tablet, laptop), dengan sistem **login per user** — setiap orang punya akun dan datanya sendiri, tersimpan di cloud lewat **Supabase**.

## Cara kerja singkat

- **Auth (login/daftar)**: pakai Supabase Authentication (email + password)
- **Data jurnal**: tersimpan di database Supabase, dikunci per user lewat Row Level Security — user A tidak bisa lihat data user B
- **Frontend**: React + Vite, di-deploy ke Cloudflare (Workers) supaya punya URL sendiri

---

## Langkah 1 — Buat project Supabase (gratis)

1. Buka https://supabase.com, daftar/login (bisa pakai akun GitHub)
2. Klik **New Project**, isi nama project dan password database (simpan baik-baik, tapi tidak akan dipakai langsung di kode)
3. Tunggu 1-2 menit sampai project selesai di-provision

## Langkah 2 — Ambil API key

1. Di dashboard project, buka **Project Settings > API**
2. Catat dua nilai ini:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon public key** (key panjang, aman dipakai di frontend)

## Langkah 3 — Buat tabel database

1. Di dashboard, buka **SQL Editor > New query**
2. Buka file `supabase-setup.sql` yang ada di project ini, copy semua isinya
3. Paste ke SQL Editor, klik **Run**
4. Ini akan membuat tabel `storage_kv` + aturan keamanan (Row Level Security) supaya data tiap user terpisah otomatis

## Langkah 4 — Atur konfirmasi email (opsional, untuk testing lebih cepat)

Secara default, Supabase mengirim email konfirmasi saat user daftar. Untuk testing cepat tanpa perlu cek email:

1. Buka **Authentication > Providers > Email**
2. Matikan **"Confirm email"**

(Untuk aplikasi produksi/publik, sebaiknya biarkan aktif demi keamanan.)

## Langkah 4.5 — Aktifkan URL redirect (wajib untuk reset password)

1. Di dashboard Supabase, buka **Authentication > URL Configuration**
2. Isi **Site URL** dengan URL app kamu, misal `https://traderlogs.<akun-kamu>.workers.dev` (atau domain kamu sendiri)
3. Di **Redirect URLs**, tambahkan juga:
   - `https://traderlogs.<akun-kamu>.workers.dev` (atau domain kamu sendiri)
   - `http://localhost:5173` (kalau mau tes dari laptop/komputer)

Tanpa ini, link reset password akan mengarah ke tempat yang salah setelah user klik.

## Langkah 5 — Isi kredensial di project

1. Copy file `.env.example` jadi `.env`
2. Isi dengan Project URL dan anon key dari Langkah 2:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=key-panjang-kamu
   ```

## Langkah 6 — Coba jalankan di komputer/laptop dulu (opsional)

Butuh [Node.js](https://nodejs.org) versi 18+.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` — coba daftar akun, login, isi jurnal.

---

## Langkah 7 — Deploy supaya bisa diakses dari semua perangkat

1. **Upload project ke GitHub**
   - Buat repository baru, misal `traderlogs`
   - Upload semua file project ini (file `.env` **jangan** ikut di-upload — sudah otomatis diabaikan lewat `.gitignore`)

2. **Deploy ke Cloudflare Workers**
   - Buka https://dash.cloudflare.com, login, lalu masuk ke **Workers & Pages**
   - **Create** → **Import a repository** → pilih repository `traderlogs`
   - Pengaturan build:
     - Build command: `npm run build`
     - Deploy command: `npx wrangler deploy` (konfigurasi ada di `wrangler.jsonc`, folder hasil build `dist`)
   - Buka bagian **Variables and Secrets** (variabel build), tambahkan:
     - `VITE_SUPABASE_URL` → isi dengan Project URL kamu
     - `VITE_SUPABASE_ANON_KEY` → isi dengan anon key kamu
   - Klik **Save and Deploy**

3. **Selesai** — Cloudflare kasih URL `traderlogs.<akun-kamu>.workers.dev`. Buka dari tablet, HP, atau laptop mana saja, tiap orang tinggal daftar akun sendiri untuk mulai pakai.

   > Kalau mau ganti nama atau pakai domain sendiri, buka project di dashboard Cloudflare → **Settings > Domains & Routes**. Setelah URL berubah, perbarui juga **Site URL** dan **Redirect URLs** di Supabase (Langkah 4.5).

   Di tablet/HP, buka URL tersebut di browser lalu pilih **"Add to Home Screen"** biar terasa seperti aplikasi asli.

---

## Struktur project

```
traderlogs/
├── index.html
├── package.json
├── vite.config.js
├── wrangler.jsonc         (konfigurasi deploy Cloudflare Workers)
├── supabase-setup.sql     (jalankan sekali di Supabase SQL Editor)
├── .env.example            (contoh format file .env)
├── public/                 (ikon aplikasi, logo-dark/light.png, manifest.json, assetlinks.json untuk APK)
└── src/
    ├── main.jsx             (entry point)
    ├── App.jsx              (cek status login, tampilkan Auth/ResetPassword/Jurnal)
    ├── Auth.jsx             (login, daftar, lupa password)
    ├── ResetPassword.jsx    (form set password baru dari link email)
    ├── authStyles.js        (CSS bersama untuk halaman-halaman auth)
    ├── supabaseClient.js    (koneksi ke Supabase)
    ├── storageShim.js       (window.storage → dipetakan ke tabel Supabase)
    ├── TradingJournal.jsx   (komponen utama jurnal trading)
    ├── journalMath.js       (fungsi murni: format, hitung baris/statistik, rekomendasi lot)
    ├── journalWidgets.jsx   (StatRing, StatRowList, EditableTagline)
    ├── tjStyles.js          (CSS utama jurnal)
    ├── TradingViewChart.jsx (widget chart XAUUSD dari TradingView)
    ├── TargetSimulator.jsx  (tab Simulasi: target profit harian modal → target rupiah)
    ├── backupUtils.js       (validasi, merge & unduh file backup/import)
    ├── Brand.jsx            (logo, wordmark & tampilan merek TraderLogs)
    ├── SplashScreen.jsx     (splash screen saat aplikasi dibuka)
    └── EconomicCalendar.jsx (widget kalender fundamental/ekonomi dari TradingView)
```

## Fitur login yang tersedia

- **Email + password** — cara login utama, seperti biasa
- **Lupa password** — klik "Lupa password?" di form login, masukkan email, ikuti link yang dikirim ke inbox

## Langkah 8 — Naikkan limit email (opsional, buat pemakaian pribadi/testing intensif)

Secara default, Supabase cuma boleh kirim maksimal ~2-4 email autentikasi per jam (daftar, lupa password digabung jadi satu jatah). Kalau kena pesan **"email rate limit exceeded"**, artinya jatah itu habis. Untuk pemakaian pribadi (cuma kamu sendiri yang pakai), naikkan limitnya pakai Resend — gratis, tanpa perlu beli domain:

1. Daftar di https://resend.com pakai **email yang sama** dengan email akun jurnal trading kamu (tanpa domain sendiri, Resend cuma boleh kirim ke email yang sama persis dengan email pendaftaran Resend)
2. Di dashboard Resend, buka **API Keys > Create API Key**, pilih permission "Sending access", copy API key-nya
3. Di Supabase Dashboard, buka **Authentication > Emails > SMTP Settings**, aktifkan **Enable Custom SMTP**, isi:
   - Sender email: `onboarding@resend.dev`
   - Sender name: `TraderLogs`
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: (API key dari langkah 2)
4. Save — sekarang limitnya naik jadi 100 email/hari

> Kalau nanti aplikasi ini dipakai banyak orang (bukan cuma kamu), perlu domain sendiri supaya Resend bisa kirim ke sembarang alamat email penerima.

## Catatan keamanan & biaya

- Tier gratis Supabase cukup untuk pemakaian pribadi/kelompok kecil (500MB database, 50.000 monthly active users)
- Data terisolasi otomatis per user lewat Row Level Security — tidak perlu kode tambahan untuk itu
- Login dengan reset password sudah aktif langsung, tidak perlu setup tambahan apa pun

## Backup, Import & Export

Menu titik tiga di pojok kanan kartu **Input Transaksi**:

- **Export Excel** — pilih *Bulan ini saja* atau *Semua bulan* (satu sheet per bulan), dengan opsi *Sertakan bulan arsip*. Kalau baru ada satu bulan, langsung terunduh.
- **Backup Data (.json)** — unduh seluruh jurnal (semua bulan, termasuk arsip).
- **Import Backup (.json)** — pilih file backup; app membersihkan data rusak, menampilkan ringkasan, lalu menggabungkan tanpa menghapus atau menimpa data yang ada. Setelah import ada tombol **Urungkan**.

Nama file Excel: `Jurnal Trading_<jenis>_<dd-mm-yyyy tanggal unduh>.xlsx`, jenis = `Bulan ini saja (Oktober 2026)` / `Semua bulan` / `Semua bulan (arsip)`.

## Pengaman data (v78)

- Kalau jurnal gagal dimuat dari server, app menampilkan layar "Jurnal gagal dimuat" dan **mengunci penyimpanan** — edit tidak akan menimpa data di server dengan data kosong.
- Perubahan dikirim langsung saat app disembunyikan/ditutup. Kalau gagal simpan, muncul tombol "Gagal menyimpan · Coba lagi", dan otomatis dicoba ulang saat online/app aktif lagi.
- Refresh tidak menimpa perubahan lokal yang belum terkirim.

## Dua perangkat sekaligus (v79)

- Setiap penyimpanan memakai cek versi (`updated_at`): app hanya menulis kalau server belum berubah sejak terakhir dimuat.
- Kalau perangkat lain sudah menyimpan lebih dulu, muncul pilihan: **Gabungkan** (data server diutamakan), **Pakai versi server**, atau **Timpa dengan versi saya**. Tidak ada yang tertimpa diam-diam.
- Saat app kembali aktif dan tidak ada perubahan tertunda, versi server yang lebih baru dimuat otomatis.
