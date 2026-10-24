export const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');

/* Full-screen, satu halaman utuh — bukan kartu mengambang di tengah overlay */
.auth-root {
  font-family: 'Inter', sans-serif;
  background: #0A0D10;
  color: #ECE9E2;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Topbar menyatu dengan halaman (bukan tombol X mengambang terpisah) */
.auth-topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: max(14px, env(safe-area-inset-top)) 16px 10px;
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  flex-shrink: 0;
}
.auth-close-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid #232A34;
  border-radius: 8px;
  color: #7C828C;
  cursor: pointer;
  flex-shrink: 0;
}
.auth-close-btn:hover { color: #ECE9E2; border-color: #3A4148; }
.auth-close-btn:active { background: #171D25; }

/* Konten mengisi sisa layar, halaman terasa satu kesatuan (tanpa border/panel terpisah) */
.auth-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.auth-card {
  width: 100%;
  max-width: 360px;
  box-sizing: border-box;
}
.auth-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; margin: 0 0 4px; }
.auth-brandmark { display: block; margin: 0 auto 12px; }
.auth-header { text-align: center; }
.auth-header .auth-watermark { justify-content: center; }
.auth-watermark { font-size: 11px; color: #4A5158; letter-spacing: 0.04em; display: flex; align-items: center; gap: 5px; margin: 0 0 14px; }
.auth-sub { font-size: 12px; color: #7C828C; margin: 0 0 22px; }
.auth-input { width: 100%; background: #12161C; border: 1px solid #232A34; color: #ECE9E2; border-radius: 8px; padding: 11px 12px; font-size: 13px; outline: none; margin-bottom: 10px; box-sizing: border-box; }
.auth-input:focus { border-color: #8A7240; }
.auth-pass-wrap { position: relative; margin-bottom: 10px; }
.auth-pass-wrap .auth-input { margin-bottom: 0; padding-right: 38px; }
.auth-pass-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #7C828C; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; }
.auth-pass-toggle:hover { color: #C6A15B; }
.auth-btn { width: 100%; background: #C6A15B; color: #0A0D10; font-weight: 600; font-size: 13px; padding: 11px 0; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.auth-switch { text-align: center; font-size: 12px; color: #7C828C; margin-top: 16px; }
.auth-switch button { background: none; border: none; color: #C6A15B; cursor: pointer; font-size: 12px; padding: 0; margin-left: 4px; }
.auth-error { background: rgba(239,91,80,0.1); border: 1px solid rgba(239,91,80,0.3); color: #EF5B50; font-size: 12px; padding: 8px 10px; border-radius: 6px; margin-bottom: 12px; }
.auth-info { background: rgba(63,195,126,0.1); border: 1px solid rgba(63,195,126,0.3); color: #3FC37E; font-size: 12px; padding: 8px 10px; border-radius: 6px; margin-bottom: 12px; }
.auth-spin { animation: auth-spin-kf 1s linear infinite; }
@keyframes auth-spin-kf { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.auth-link-row { display: flex; justify-content: flex-end; margin: -4px 0 14px; }
.auth-link-row button { background: none; border: none; color: #8A7240; cursor: pointer; font-size: 11.5px; padding: 0; }
.auth-link-row button:hover { color: #C6A15B; }
.auth-back { display: flex; align-items: center; gap: 4px; background: none; border: none; color: #7C828C; cursor: pointer; font-size: 12px; padding: 0; margin-bottom: 14px; }
.auth-back:hover { color: #C6A15B; }
.auth-method-toggle { text-align: center; font-size: 11.5px; color: #7C828C; margin-top: 10px; }
.auth-method-toggle button { background: none; border: none; color: #8A7240; cursor: pointer; font-size: 11.5px; padding: 0; margin-left: 4px; }
.auth-method-toggle button:hover { color: #C6A15B; }

/* Petunjuk keluar — muncul kalau app tidak bisa ditutup otomatis lewat JS
   (khususnya iOS "Tambah ke Layar Utama", yang memang tidak punya API untuk ini) */
.auth-exit-hint {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: max(16px, env(safe-area-inset-bottom));
  z-index: 60;
  background: #171D25;
  border: 1px solid #232A34;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.5;
  color: #ECE9E2;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.auth-exit-hint-close { background: none; border: none; color: #7C828C; cursor: pointer; flex-shrink: 0; padding: 2px; }

@media (max-width: 600px) {
  .auth-input { font-size: 16px; }
}
`;
