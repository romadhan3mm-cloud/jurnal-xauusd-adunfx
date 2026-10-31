# v1.9.90 — Tes otomatis, pembatas permintaan Worker, dan pemisahan TradingJournal

## 1. Tes otomatis (tanpa dependensi tambahan)
- `npm test` menjalankan 27 tes dengan test runner bawaan Node (`node --test`).
- `tests/journalMath.test.mjs` (18 tes): fmtMoney, parse/format isian uang, round2, computeRows (start, target 3%, batas loss -4%, saldo berantai, withdraw), computeStats (winrate, RR, kasus kosong), periodGrowthPercent, computeDailyRiskGuard (ambang safe 75% / warning / limit 100%, penarikan bukan kerugian, komisi, modal 0, memakai saldo hari sebelumnya), computeLotRecommendation, tingkat modal referensi, dan fungsi tanggal (hari lokal, Senin sebagai awal minggu).
- `tests/worker.test.mjs` (9 tes): pembatas permintaan, penolakan Origin lintas asal, validasi host push, rute statis, dan 404.
- Nilai harapan dihitung tangan. Diuji dengan merusak kode sengaja (target 5%, ambang warning 80%, batas analyze 1000): tiga tes yang relevan gagal, jadi tes benar-benar menjaga angka.

## 2. Build lebih stabil
- `package.json`: `engines.node >= 20`, skrip `test`. Penguncian rollup 4.34.8 dari v1.9.73 tetap.
- Lockfile belum bisa dibuat di sini (tanpa jaringan). Lihat langkah di balasan: jalankan `npm install` di komputer Anda lalu commit `package-lock.json`, dan hapus lockfile lain bila ada.

## 3. Worker
- Pembatas permintaan per IP (best-effort lewat KV): `/api/ai-news/analyze` maksimal 10 per 10 menit, `/api/ai-news/subscribe` maksimal 20 per jam. Lewat batas dijawab 429 dengan pesan Indonesia. Bila KV tidak ada atau gagal, permintaan tetap dilayani (fitur tidak terganggu).
- Pemeriksaan yang sudah ada tidak diubah: penolakan POST lintas asal, daftar host push, batas panjang endpoint, jeda 1 menit tes push, pembersihan teks.
- Perlu deploy ulang Worker agar aktif.

## 4. Pemisahan TradingJournal.jsx (1.893 menjadi 1.774 baris)
- Dipindah apa adanya ke file sendiri: `CalendarPopover.jsx`, `MonthActionMenu.jsx`, `MonthDropdown.jsx`. Kondisi tampil tetap di induk; semua state dan fungsi dikirim lewat props.
- Diperiksa dengan tsc: tidak ada nama yang hilang di semua komponen. Belum diuji di aplikasi berjalan.

## 5. Sinkronisasi dua perangkat
- Diperiksa, tidak diubah. Penyimpanan jurnal sudah memakai penulisan bersyarat (`setIfMatch` dengan `updated_at`), deteksi konflik, dan tidak menimpa diam-diam; data gagal simpan ditahan untuk dicoba ulang.

## Tidak berubah
Tampilan, perhitungan, struktur data, dan semua file lain.
