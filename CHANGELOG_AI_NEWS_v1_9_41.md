# v1.9.41 — AI News: perbaikan VAPID (BadJwtToken dari Apple)

- Secret VAPID dibersihkan otomatis (spasi, baris baru, tanda kutip). Subject berupa email polos otomatis diberi `mailto:`.
- Validasi format sebelum kirim: public key 65 byte uncompressed, private key 32 byte, subject `mailto:`/`https:`. Masalah dilaporkan jelas, bukan HTTP 403 samar.
- `/health` menampilkan `vapid:{ok,problems,subjectScheme}` (tanpa membocorkan kunci).
- Pesan 403 dari layanan push menyertakan petunjuk pasangan kunci tidak cocok.
- Skrip `scripts-generate-vapid.mjs` untuk membuat pasangan kunci baru.
