export const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

html, body { overflow-x: clip; -webkit-text-size-adjust: 100%; touch-action: manipulation; }
.auth-root {
  --bg: #0A1628; --surface: #0F2038; --surface-raised: #162A47; --border: #223A5E;
  --text: #F2F5FA; --muted: #8A9BB5; --placeholder: #6F819C; --gold: #EDA524; --gold-dim: #9A6F1C;
  --btn-bg: linear-gradient(180deg, #F7C766 0%, #E39A12 100%); --btn-text: #0A1628;
  --err-bg: rgba(239,91,80,0.14); --err-text: #FF8A80; --ok-bg: rgba(63,195,126,0.14); --ok-text: #5FD89B;
  font-family: 'Inter', 'Lato', sans-serif; color: var(--text);
  min-height: 100vh; min-height: 100dvh;
  display: flex; flex-direction: column; align-items: center; box-sizing: border-box; position: relative;
  background: radial-gradient(70% 260px at 50% 0%, rgba(30, 70, 120, 0.30), rgba(30, 70, 120, 0) 100%), var(--bg);
}
.auth-root.auth-light {
  --bg: #F4F6FA; --surface: #FFFFFF; --surface-raised: #FFFFFF; --border: #DCE3EE;
  --text: #0F2A47; --muted: #6B7C93; --placeholder: #98A5B8; --gold: #C98708; --gold-dim: #EDA524;
  --btn-bg: #0B1F3A; --btn-text: #FFFFFF;
  --err-bg: #FDECEA; --err-text: #B3261E; --ok-bg: #E9F6EF; --ok-text: #17714A;
  background: var(--bg);
}
.auth-topbar { display: flex; align-items: center; gap: 8px; position: absolute; top: max(12px, env(safe-area-inset-top)); right: max(14px, env(safe-area-inset-right)); z-index: 2; }
.auth-close-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid var(--border); border-radius: 9px; color: var(--muted); cursor: pointer; }
.auth-apk-btn { width: auto; height: 26px; padding: 0 8px; gap: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.03em; border-radius: 8px; text-decoration: none; color: var(--gold); border-color: var(--gold-dim); box-sizing: border-box; }
.auth-close-btn:hover { color: var(--gold); border-color: var(--gold-dim); }
.auth-theme-btn { width: 26px; height: 26px; border-radius: 8px; box-sizing: border-box; }

.auth-content { position: relative; z-index: 1; width: 100%; max-width: 420px; box-sizing: border-box; padding: calc(env(safe-area-inset-top, 0px) + 56px) 24px calc(env(safe-area-inset-bottom, 0px) + 24px); display: flex; flex-direction: column; flex: 1; }
.auth-brand { display: flex; justify-content: center; margin-bottom: 32px; }
.auth-card { width: 100%; margin: auto 0; }
.auth-back { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; padding: 0; margin-bottom: 16px; font: inherit; font-size: 12px; color: var(--muted); cursor: pointer; }
.auth-title { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 600; color: var(--text); margin: 0 0 6px; letter-spacing: -0.01em; }
.auth-sub { font-size: 12px; line-height: 1.5; color: var(--muted); margin: 0 0 24px; }

.auth-field { position: relative; margin-bottom: 14px; }
.auth-field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
.auth-input { width: 100%; box-sizing: border-box; height: 50px; padding: 0 46px 0 46px; background: var(--surface-raised); border: 1px solid var(--border); border-radius: 10px; font-family: inherit; font-size: 16px; color: var(--text); outline: none; transition: border-color .15s, box-shadow .15s; }
.auth-input::placeholder { color: var(--placeholder); }
.auth-input:focus { border-color: var(--gold-dim); box-shadow: 0 0 0 3px rgba(237,165,36,0.14); }
.auth-pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; display: flex; }

.auth-link-row { display: flex; justify-content: flex-end; margin: 2px 0 18px; }
.auth-link-row button { background: none; border: none; padding: 0; font: inherit; font-size: 12px; color: var(--gold); cursor: pointer; }

.auth-btn { position: relative; width: 100%; height: 52px; border: none; border-radius: 10px; background: var(--btn-bg); color: var(--btn-text); font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.auth-btn::after { content: "→"; position: absolute; right: 18px; font-size: 18px; font-weight: 400; }
.auth-btn:disabled { opacity: 0.7; cursor: default; }
.auth-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; font-size: 12px; color: var(--muted); }
.auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: var(--border); }
.auth-btn-outline { width: 100%; height: 50px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-family: inherit; font-size: 12.5px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }

.auth-error { background: var(--err-bg); color: var(--err-text); border-radius: 8px; padding: 10px 12px; font-size: 12px; margin-bottom: 14px; }
.auth-info { background: var(--ok-bg); color: var(--ok-text); border-radius: 8px; padding: 10px 12px; font-size: 12px; margin-bottom: 14px; }
.auth-footer { margin-top: 0; padding-top: 28px; text-align: center; font-size: 10.5px; color: var(--muted); opacity: 0.8; }

.auth-exit-hint { position: fixed; left: 16px; right: 16px; bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); z-index: 10; display: flex; gap: 8px; align-items: flex-start; background: var(--surface-raised); border: 1px solid var(--border); border-radius: 10px; padding: 12px; font-size: 12px; line-height: 1.45; color: var(--text); box-shadow: 0 8px 24px rgba(11,27,51,0.15); }
.auth-exit-hint-close { background: none; border: none; color: var(--muted); cursor: pointer; padding: 2px; display: flex; }
.auth-spin { animation: auth-spin 1s linear infinite; }
@keyframes auth-spin { to { transform: rotate(360deg); } }
`;
