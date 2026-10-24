export const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;800&display=swap');

.auth-root {
  font-family: 'Lato', 'Inter', sans-serif;
  color: #F3EEDF;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  background:
    radial-gradient(70% 30% at 50% 0%, rgba(96, 72, 18, 0.42), rgba(96, 72, 18, 0) 75%),
    linear-gradient(180deg, #0A0905 0%, #050504 38%, #050504 100%);
}

/* Tombol keluar: kecil dan samar di pojok kanan atas */
.auth-topbar {
  position: absolute;
  top: max(12px, env(safe-area-inset-top));
  right: max(14px, env(safe-area-inset-right));
  z-index: 2;
}
.auth-close-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid #2B2719;
  border-radius: 9px;
  color: #918B78;
  cursor: pointer;
}
.auth-close-btn:hover { color: #F3EEDF; border-color: #4A4126; }

.auth-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 28px;
  padding-top: max(28px, env(safe-area-inset-top));
  box-sizing: border-box;
}
.auth-brand {
  margin-top: clamp(28px, 7vh, 72px);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.auth-brand-logo { margin-bottom: 18px; filter: drop-shadow(0 0 18px rgba(212, 175, 95, 0.22)); }

.auth-card { margin-top: clamp(34px, 6.5vh, 64px); }
.auth-title { font-size: 26px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.01em; color: #F3EEDF; text-align: left; }
.auth-sub { font-size: 14.5px; color: #D5CFBB; margin: 0 0 26px; line-height: 1.45; text-align: left; }

.auth-field { position: relative; margin-bottom: 14px; }
.auth-field-icon {
  position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
  color: #EDE7D4; pointer-events: none;
}
.auth-input {
  width: 100%;
  height: 54px;
  box-sizing: border-box;
  background: #12100B;
  border: 1px solid #2B2719;
  color: #F3EEDF;
  border-radius: 14px;
  padding: 0 52px 0 54px;
  font-family: inherit;
  font-size: 16px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.auth-input::placeholder { color: #8D8670; }
.auth-input:focus { border-color: #B8923F; box-shadow: 0 0 0 3px rgba(212, 175, 95, 0.12); }
.auth-pass-toggle {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px;
  background: none; border: none; color: #EDE7D4; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.auth-pass-toggle:hover { color: #D4AF5F; }

.auth-link-row { display: flex; justify-content: flex-end; margin: 4px 0 22px; }
.auth-link-row button {
  background: none; border: none; cursor: pointer; padding: 4px 0;
  color: #E5B84C; font-family: inherit; font-size: 14.5px; font-weight: 700;
}
.auth-link-row button:hover { color: #F3D98B; }

.auth-btn {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-family: inherit; font-size: 17px; font-weight: 800;
  color: #17120A;
  background: linear-gradient(180deg, #EFD68F 0%, #CFA84F 100%);
  box-shadow: 0 6px 26px rgba(212, 175, 95, 0.22);
  transition: filter 0.15s, transform 0.05s;
}
.auth-btn:hover { filter: brightness(1.05); }
.auth-btn:active { transform: translateY(1px); }
.auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.auth-divider {
  display: flex; align-items: center; gap: 14px;
  margin: 22px 0;
  color: #9B9680; font-size: 14px;
}
.auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: #2B2719; }

.auth-btn-outline {
  width: 100%;
  height: 54px;
  box-sizing: border-box;
  border-radius: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  font-family: inherit; font-size: 16.5px; font-weight: 800;
  color: #F3EEDF;
  background: transparent;
  border: 1.5px solid #B8923F;
  transition: background 0.15s;
}
.auth-btn-outline:hover { background: rgba(212, 175, 95, 0.08); }

.auth-back {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; color: #D4AF5F; cursor: pointer;
  font-family: inherit; font-size: 14px; font-weight: 700; padding: 0; margin-bottom: 18px;
}

.auth-footer {
  margin-top: auto;
  padding: 28px 0 max(22px, env(safe-area-inset-bottom));
  text-align: center;
  font-size: 13.5px;
  color: #8D8670;
  letter-spacing: 0.02em;
}

.auth-error { background: rgba(239,91,80,0.1); border: 1px solid rgba(239,91,80,0.3); color: #EF7A70; font-size: 13px; padding: 10px 12px; border-radius: 10px; margin-bottom: 14px; line-height: 1.4; }
.auth-info { background: rgba(63,195,126,0.1); border: 1px solid rgba(63,195,126,0.3); color: #3FC37E; font-size: 13px; padding: 10px 12px; border-radius: 10px; margin-bottom: 14px; line-height: 1.4; }
.auth-spin { animation: auth-spin-kf 1s linear infinite; }
@keyframes auth-spin-kf { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Petunjuk keluar — muncul kalau app tidak bisa ditutup otomatis lewat JS
   (khususnya iOS "Tambah ke Layar Utama", yang memang tidak punya API untuk ini) */
.auth-exit-hint {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: max(16px, env(safe-area-inset-bottom));
  z-index: 60;
  background: #1A1710;
  border: 1px solid #2B2719;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 12.5px;
  line-height: 1.5;
  color: #F3EEDF;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.auth-exit-hint-close { background: none; border: none; color: #918B78; cursor: pointer; flex-shrink: 0; padding: 2px; }
`;
