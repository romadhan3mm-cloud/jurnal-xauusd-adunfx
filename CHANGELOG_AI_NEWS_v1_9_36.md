# v1.9.36 — AI News hardening (dari v1.9.35 PATCH2)

Hanya menyentuh AI News: `worker/ai-news-worker.js`, `wrangler.jsonc`, `package.json` (versi). Journal, RiskGuard, Supabase, dan UI lain tidak diubah.

## Perubahan
- `wrangler.jsonc`: tambah `run_worker_first: ["/api/*"]` agar `/api/ai-news/*` selalu dijawab Worker. Tanpa ini, membuka `/api/ai-news/health` di browser bisa menampilkan halaman SPA, bukan JSON.
- `VAPID_SUBJECT` sekarang wajib (tidak ada lagi fallback `mailto:admin@example.com`, yang bisa ditolak Apple). `/health` melaporkan `push:true` hanya jika ketiga secret VAPID ada.
- `/subscribe` hanya menerima endpoint dari layanan push resmi (Google/FCM, Mozilla, Apple, Windows) dan menolak Origin asing pada request POST. CORS `*` dihapus karena aplikasi dan API satu origin.
- `/alerts` membaca satu indeks ringkas (`meta:recent`, maks 30) alih-alih membaca hingga 1000 key KV, agar tidak kena batas subrequest.
- Teks pengingat memakai sisa menit yang sebenarnya jika terkirim terlambat (jendela pemulihan 5 menit).
- Pemeriksaan dampak tinggi dibuat eksplisit (`high`/`3`).

## Pengujian lokal (Node 22, mock KV dan mock fetch)
Subscribe valid/invalid, Origin asing ditolak, VAPID JWT terverifikasi, payload Web Push (aes128gcm) berhasil didekripsi seperti browser, cron mengirim 1 push, run kedua tidak duplikat, event dampak rendah diabaikan.

## Belum diverifikasi (butuh akun Cloudflare dan perangkat)
Build Vite penuh, Workers AI nyata, KV nyata, pengiriman ke iPhone, dan payload asli XOOMAR (tidak ada field negara, jadi alert dampak tinggi bisa mencakup non-AS).

## Deploy
1. Secret: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mis. `mailto:emailanda@domain.com`).
2. Pastikan ID KV di `wrangler.jsonc` benar dan Workers AI aktif.
3. Setelah deploy, buka `/api/ai-news/health`: harus `scheduler:true`, `ai:true`, `push:true`.
4. Di iPhone: buka dari ikon Home Screen, tekan "Aktifkan notifikasi".
