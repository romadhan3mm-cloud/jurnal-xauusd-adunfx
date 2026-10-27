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
    ├── Splash.jsx           (halaman splash: latar panah SVG, logo, kalimat ajakan, garis kuning bergerak)
    ├── Brand.jsx            (logo, wordmark & tampilan merek TraderLogs)
    ├── viewportGap.js       (mengukur celah bawah layar HP → variabel CSS --vgap)
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

## Keluar akun & penggabungan (v100)

- **Keluar akun** mengirim dulu perubahan yang tertunda. Kalau masih ada yang gagal terkirim (offline/bentrok), muncul peringatan dan pilihan **Tetap keluar** atau **Batal**.
- Setelah **Gabungkan** di dialog bentrok, muncul ringkasan: berapa entri yang ditambahkan, yang tidak ikut karena tanggalnya sudah terisi di server (lengkap dengan tanggalnya), dan yang hasil editannya tidak dipakai karena server diutamakan.
- **Paste angka berformat ribuan** ("1,250.50" atau "1.250,50") sekarang terbaca benar. Mengetik biasa tidak berubah.

## Tampilan terang baru (v101)

- **Tema terang jadi bawaan.** Sekali saja, pengguna lama yang tersimpan tema gelap dikembalikan ke terang (penanda `tl-look` di perangkat); setelah itu pilihan mereka dihormati. Tema gelap tetap ada lewat tombol matahari/bulan.
- **Aset gambar** (`public/`; `bg-light.svg` & `bg-dark.svg` = latar vektor sejak v114): icon aplikasi `icon-*.png`, `apple-touch-icon.png`, `favicon*.png`. (`bg-app.jpg` lama sudah dihapus.)
- **Alur sebelum login**: tanpa splash dan tanpa layar sambutan; aplikasi langsung membuka form login (daftar & lupa password dari form yang sama). Setelah keluar akun kembali ke form login.
- **Bar status iOS**: tema terang memakai gaya `default` (teks gelap), tema gelap memakai `black-translucent` supaya bagian atas gelap penuh menyatu dengan latar. `index.html` dan `PageBackdrop` mengaturnya sesuai tema tersimpan; iOS biasanya baru menerapkannya setelah aplikasi dibuka ulang. Pemudaran putih di tepi atas hanya dipakai di tema terang.
- Icon di APK Android (TWA) **tidak** ikut berubah dari zip ini; perlu dibuat ulang lewat Bubblewrap/PWABuilder dengan `icon-512.png`.

## Uji celah bawah iPhone (v108)

- Hasil uji di iPhone 11 (app dari layar utama, bar status translucent): `inner 414×848`, `screen 414×896`, safe-area atas 48 → area tampil halaman berhenti 48pt di atas tepi bawah layar, dan 48pt itu di luar area halaman (tidak bisa dilukis CSS; hanya warna `html`/`body` yang tampil di sana).
- Bar status iOS sekarang gaya `default` (area tampil mulai di bawah bar status, jadi tidak ada celah). `--vgap` otomatis 0 bila safe-area atas 0.
- Mode diagnosis: buka dengan `?debug=1` atau ketuk teks versi di bawah 5 kali (login atau jurnal).

## Splash & tepi atas (v111–v112)

- **Satu splash saja** (`Splash.jsx`): tampil setiap aplikasi dibuka (minimal 1,8 detik, dan sampai sesi login selesai dicek). Layar "memuat jurnal" setelah login memakai splash yang sama (`instant`, tanpa animasi masuk ulang), jadi tidak ada layar kerangka yang terlihat seperti splash kedua.
- Latar panah naik + garis diagonal digambar sebagai SVG (bukan file gambar) dan **mengikuti tema tersimpan**: terang = putih ke biru muda dengan logo terang; gelap = navy dengan logo gelap. Di bawah logo ada "Mulai perjalanan trading yang lebih baik" dan garis kuning yang bergerak.
- **Tepi atas**: tema terang tanpa warna lain (hanya putih memudar ke warna latar), tema gelap gelap penuh. Bar status iOS: terang `default`, gelap `black-translucent` (sama seperti v108–v110).
- Splash bawaan sistem (layar yang muncul sebelum app membuka, mis. splash APK Android) tidak bisa diubah dari kode web.

## Latar bergambar (v113)

- **Kedua tema** memakai gambar latar yang sama (gradasi biru + panah naik + garis diagonal) di **semua halaman**: login, reset password, seluruh isi jurnal (semua tab), dan splash. Terang = `public/bg-light.svg`, gelap = `public/bg-dark.svg` (versi navy dari desain yang sama).
- Dipasang lewat `PageBackdrop` (`Brand.jsx`, posisi fixed, `cover`) sehingga diam saat halaman di-scroll dan memenuhi layar sampai tepi bawah. Splash memakai gambar yang sama sesuai tema.
- Ganti latar: timpa file SVG di `public/` (viewBox 852×1846, `preserveAspectRatio="xMidYMin slice"`) dan naikkan angka `?v=` pada `LIGHT_BG_IMG` / `DARK_BG_IMG` di `Brand.jsx` serta `index.html` supaya cache perangkat ikut ter-refresh.
- Logo bulat di splash memakai komponen `LogoEmblem` (`Brand.jsx`, SVG vektor); sejak v114 menggantikan `logo-mark.png`.

## Tampilan vektor tajam (v114)

- **Latar** `bg-light.svg` / `bg-dark.svg` menggantikan `bg-light.jpg` / `bg-dark.jpg` (JPEG 852×1846 yang bisa pecah/berbintik di layar HP beresolusi tinggi). Desain sama (gradasi biru, panah naik, garis diagonal), digambar ulang sebagai vektor: tajam di ukuran layar apa pun, tanpa artefak kompresi, dan file hanya ±5 KB.
- **Ikon bulat di splash** kini komponen `LogoEmblem` (SVG inline) menggantikan `logo-mark.png`. Bentuk panah mengikuti ikon aplikasi, ekor panah utuh di dalam lingkaran (tidak terpotong tepi lingkaran).
- `logo-mark.png`, `bg-light.jpg`, `bg-dark.jpg` dihapus dari `public/`. Wordmark `logo-light.png` / `logo-dark.png` dan ikon aplikasi tidak diubah.
- Icon di APK Android (TWA) tidak ikut berubah dari zip ini.

## Tema sinkron & header terkunci (v115)

- **Tema luar dan dalam selalu sama.** Tema yang tampil di halaman login (atau yang dipilih lewat tombol matahari/bulan di sana) langsung disimpan sebagai pilihan perangkat. Setelah masuk, jurnal memakai pilihan perangkat itu dan menyamakan salinan di server (`tj-theme`), bukan sebaliknya. Server hanya dipakai di perangkat baru yang belum punya pilihan tersimpan. Berlaku untuk dua arah (terang→gelap dan gelap→terang).
- **Header terkunci di tepi atas.** `.tj-hdr` kini `position: fixed` (bukan sticky), menempel ke tepi atas tanpa celah, jadi tidak ikut memantul saat halaman ditarik/di-scroll di iPhone. Isi halaman diberi spacer setinggi header (diukur otomatis). Latar blur header muncul begitu halaman mulai tergulir.

## Emblem splash sesuai ikon asli (v116)

- `LogoEmblem` (`Brand.jsx`) digambar ulang dari gambar contoh ikon: panah lebih ramping dengan kepala lebih kecil, ekor memanjang sampai terpotong rapi oleh tepi lingkaran (`clipPath`), dan gradasi emas (kuning kiri atas, oranye pekat kanan bawah). Tetap vektor SVG, tajam di ukuran apa pun.
- Ikon aplikasi sudah diganti di v124 (panah baru).

## Header seimbang & warna awal sesuai tema (v117)

- **Header**: logo + tagline kini punya jarak yang sama dengan tepi atas (di bawah area aman iOS) dan tepi bawah header, jadi berada di tengah area header. Tombol menu kanan ikut diturunkan sejajar.
- **Kilatan sebelum splash**: `index.html` kini punya warna dasar paling awal (ikut tema sistem) yang langsung ditimpa script boot dengan tema tersimpan (`tl-theme`); `color-scheme` html juga disamakan. Animasi fade-in splash dihapus supaya tidak ada transisi dari warna dasar. Di `PageBackdrop` `color-scheme` ikut berganti saat tema diubah.
- Layar bawaan sistem sebelum web dimuat (splash APK Android memakai `background_color` di `manifest.json`; iOS memakai layar putih bawaan) tidak bisa mengikuti tema dari kode web.

## Header lebih lega, saldo lebih besar, pesan sinyal lambat (v118)

- **Header** dilebarkan sedikit ke bawah (jarak atas & bawah 16px, di luar area aman iOS). Logo + tagline di tengah vertikal area header; tombol menu kanan juga dipusatkan vertikal terhadap header.
- **End Balance**: angka saldo diperbesar (13px → 18px).
- **Splash**: kalau memuat lebih dari 8 detik, muncul tulisan "Koneksi lambat, masih mencoba…" di bawah garis kuning (`Splash.jsx`). Berlaku di splash awal maupun layar memuat jurnal.

## Tepi bawah header memudar (v119)

- Latar blur header yang muncul saat halaman digulir kini memudar halus di tepi bawahnya (16px sejak v120, semula 28px, `mask-image` pada `.tj-hdr::before`), jadi isi halaman yang lewat di bawah header tidak terlihat terpotong garis tegas.

## Tepi atas menyatu dengan bar status (v121)

- Di aplikasi dari layar utama, bar status (jam/baterai) berwarna datar sesuai tema (`#EBF2FB` terang, `#071832` gelap) sementara gambar latar mulai tepat di bawahnya, sehingga ada garis potong tegas (di tema gelap segitiga/garis biru terpotong, di tema terang putih bertemu biru muda).
- Komponen `TopFade` (`Brand.jsx`): lapisan setinggi 56px yang memudar dari warna dasar tema ke transparan, dipasang di `PageBackdrop` (login, reset password, jurnal) dan `Splash`, aktif saat class `tl-sa` (aplikasi terpasang). Menggantikan pemudaran putih lama yang hanya untuk tema terang.

## Header kembali terkunci di tepi (v122)

- v121 sempat membuat latar blur header memudar di tepi atasnya (mask), akibatnya isi halaman terlihat tembus di 18px teratas dan header terasa tidak menempel. Mask atas dihapus (kembali seperti v120).
- Sebagai gantinya, saat digulir latar blur header diberi lapisan warna dasar tema yang solid di tepi atas dan memudar ke bawah (26px), jadi tepi atas tetap tertutup penuh dan menyatu dengan warna bar status tanpa garis.

## Pemudaran & transparansi header lebih tipis (v123)

- Pemudaran tepi bawah header 16px → 12px; lapisan warna di tepi atas header 26px → 16px; `TopFade` di bawah bar status 56px → 40px.
- Latar blur header dibuat lebih tipis: tint warna 52%/55% → 40%/42% (gelap/terang) dan blur 10px → 8px.

## Ikon baru (v124)

- `icon-192/512(.maskable).png`, `apple-touch-icon.png`, `favicon*.png` digambar ulang dengan emblem v116 (panah ramping, gradasi emas) di atas latar biru muda bergaris diagonal. Versi maskable memakai komposisi sama (lingkaran emas masih di dalam zona aman).
- Parameter cache ikon `?v=9` → `?v=10` di `index.html` dan `manifest.json`.
- Ikon di APK Android (TWA) tertanam di file APK: buat ulang APK lewat PWABuilder memakai `icon-512.png` ini, tanda tangani dengan kunci yang sama seperti APK lama, lalu ganti `public/downloads/traderlogs.apk`.

## APK baru (v124)

- `public/downloads/traderlogs.apk` diganti dengan APK hasil PWABuilder terbaru: package `dev.workers.adunfx.traderlogs.twa`, versionCode 2, versionName 1.9.23, ditandatangani kunci yang sama dengan APK sebelumnya (sidik jari SHA-256 `CB:79:87:08:...:33:96`), sehingga bisa memperbarui di atas APK lama.
- `public/well-known/assetlinks.json` tidak diubah (sidik jari sama, dan masih memuat entri paket lama `com.adunfx.jurnal_xauusd.twa`).

## Tata letak splash baru (v125)

- Tengah layar: emblem, logo TRADERLOGS, lalu tagline "Disiplin · Evaluasi · Konsisten" tepat di bawah logo.
- Bagian bawah: kalimat dan garis kuning bergerak, di atas area home bar iPhone (`max(--vgap, safe-area-bawah) + 56px`).
- Splash awal memakai kalimat "Mulai perjalanan trading yang lebih baik". Saat masih menunggu cek sesi setelah waktu minimum (1,8 detik) dan pada layar memuat jurnal setelah login, kalimatnya berganti "Memuat jurnal…" (prop `message` di `Splash.jsx`). Pesan "Koneksi lambat, masih mencoba…" tetap muncul setelah 8 detik, di bawah garis kuning.
- Tanpa perubahan untuk APK Android (splash bawaan APK tetap tampil lebih dulu).
