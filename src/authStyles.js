export const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

html, body { overflow-x: clip; -webkit-text-size-adjust: 100%; touch-action: manipulation; }
.auth-root {
  font-family: 'Inter', 'Lato', sans-serif; color: #0B1B33;
  min-height: 100vh; min-height: 100dvh;
  display: flex; flex-direction: column; align-items: center; box-sizing: border-box; position: relative;
  background: #F7F9FC;
}
.auth-topbar { position: absolute; top: max(12px, env(safe-area-inset-top)); right: max(14px, env(safe-area-inset-right)); z-index: 2; }
.auth-close-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid #DDE4EE; border-radius: 9px; color: #7A8798; cursor: pointer; }
.auth-close-btn:hover { color: #0B1B33; border-color: #B8C3D4; }

.auth-content { position: relative; z-index: 1; width: 100%; max-width: 420px; box-sizing: border-box; padding: calc(env(safe-area-inset-top, 0px) + 56px) 24px calc(env(safe-area-inset-bottom, 0px) + 24px); display: flex; flex-direction: column; flex: 1; }
.auth-brand { display: flex; justify-content: center; margin-bottom: 32px; }
.auth-card { width: 100%; }
.auth-back { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; padding: 0; margin-bottom: 16px; font: inherit; font-size: 13px; color: #5B6B82; cursor: pointer; }
.auth-title { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 600; color: #0B1B33; margin: 0 0 8px; letter-spacing: -0.01em; }
.auth-sub { font-size: 14px; line-height: 1.5; color: #5B6B82; margin: 0 0 24px; }

.auth-field { position: relative; margin-bottom: 14px; }
.auth-field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #5B6B82; pointer-events: none; }
.auth-input { width: 100%; box-sizing: border-box; height: 50px; padding: 0 46px 0 46px; background: #fff; border: 1px solid #DDE4EE; border-radius: 10px; font-family: inherit; font-size: 16px; color: #0B1B33; outline: none; transition: border-color .15s, box-shadow .15s; }
.auth-input::placeholder { color: #98A5B8; }
.auth-input:focus { border-color: #0B1F3A; box-shadow: 0 0 0 3px rgba(11,31,58,0.08); }
.auth-pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #33445E; cursor: pointer; padding: 4px; display: flex; }

.auth-link-row { display: flex; justify-content: flex-end; margin: 2px 0 18px; }
.auth-link-row button { background: none; border: none; padding: 0; font: inherit; font-size: 13px; color: #E39A12; cursor: pointer; }

.auth-btn { position: relative; width: 100%; height: 52px; border: none; border-radius: 10px; background: #0B1F3A; color: #fff; font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.auth-btn::after { content: "→"; position: absolute; right: 18px; font-size: 18px; font-weight: 400; }
.auth-btn:disabled { opacity: 0.7; cursor: default; }
.auth-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; font-size: 12.5px; color: #7A8798; }
.auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: #DDE4EE; }
.auth-btn-outline { width: 100%; height: 50px; border-radius: 10px; background: #fff; border: 1px solid #DDE4EE; color: #0B1B33; font-family: inherit; font-size: 14.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }

.auth-error { background: #FDECEA; color: #B3261E; border-radius: 8px; padding: 10px 12px; font-size: 13px; margin-bottom: 14px; }
.auth-info { background: #E9F6EF; color: #17714A; border-radius: 8px; padding: 10px 12px; font-size: 13px; margin-bottom: 14px; }
.auth-footer { margin-top: auto; padding-top: 28px; text-align: center; font-size: 11.5px; color: #8A97AB; }

.auth-exit-hint { position: fixed; left: 16px; right: 16px; bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); z-index: 10; display: flex; gap: 8px; align-items: flex-start; background: #fff; border: 1px solid #DDE4EE; border-radius: 10px; padding: 12px; font-size: 12.5px; line-height: 1.45; color: #33445E; box-shadow: 0 8px 24px rgba(11,27,51,0.15); }
.auth-exit-hint-close { background: none; border: none; color: #7A8798; cursor: pointer; padding: 2px; display: flex; }
.auth-spin { animation: auth-spin 1s linear infinite; }
@keyframes auth-spin { to { transform: rotate(360deg); } }
`;
