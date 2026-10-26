// CSS utama TraderLogs (jurnal). Dipisah dari TradingJournal.jsx.
export const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;800&family=Poppins:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

html, body { overscroll-behavior: none; overflow-x: clip; -webkit-text-size-adjust: 100%; touch-action: manipulation; }
.tj-root {
  --bg: #0A1628;
  --surface: #0F2038;
  --surface-raised: #162A47;
  --surface-soft: color-mix(in srgb, var(--surface) 50%, transparent); /* latar kartu 50% transparan */
  --border: #223A5E;
  --text: #F2F5FA;
  --muted: #8A9BB5;
  --gold: #EDA524;
  --gold-dim: #9A6F1C;
  --green: #3FC37E;
  --red: #EF5B50;
  --gold-grad: linear-gradient(180deg, #F7C766 0%, #E39A12 100%);
  font-family: 'Lato', 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  box-sizing: border-box;
}
.tj-mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
.tj-display { font-family: 'Lato', 'Inter', sans-serif; }
.tj-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.tj-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
.tj-input {
  background: var(--surface-raised);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.tj-input:focus { border-color: var(--gold-dim); }
.tj-input::-webkit-outer-spin-button, .tj-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
/* Kolom panel Simulasi: ukuran seragam, termasuk input tanggal di iOS/Android */
.tj-sim-input {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: 36px;
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
  line-height: 1.2;
}
.tj-sim-input::-webkit-date-and-time-value { text-align: center; min-height: 1.2em; }
.tj-sim-input::-webkit-datetime-edit { text-align: center; }
@media (max-width: 600px) {
  .tj-input, select.tj-input, textarea.tj-input { font-size: 16px; }
}

.tj-root.tj-light {
  background: var(--bg);
  --gold-grad: linear-gradient(180deg, #EDA524 0%, #C98708 100%);
  --bg: #EBF2FB;
  --surface: #FFFFFF;
  --surface-raised: #EDF1F7;
  --border: #DCE3EE;
  --text: #0F2A47;
  --muted: #6B7C93;
  --gold: #C98708;
  --gold-dim: #EDA524;
  --green: #1E8E56;
  --red: #C63B2E;
}
.tj-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tj-theme-toggle:hover { color: var(--gold); border-color: var(--gold-dim); }
.tj-hero { position: relative; padding: 18px 16px 16px; text-align: center; }
.tj-hero-brand { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.tj-bar-actions { position: absolute; top: env(safe-area-inset-top, 0px); bottom: 0; justify-content: center; right: 28px; z-index: 30; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.tj-bar-row { display: flex; align-items: center; gap: 8px; }
.tj-bar-actions .tj-theme-toggle { width: 28px; height: 28px; border: none; background: transparent; }
.tj-bar-actions .tj-theme-toggle:hover { border-color: transparent; background: transparent; }
.tj-hdr { position: fixed; top: 0; left: 0; right: 0; max-width: 1180px; margin: 0 auto; box-sizing: border-box; z-index: 25; padding: calc(env(safe-area-inset-top, 0px) + 16px) 28px 16px; background: transparent; border-bottom: none; }
.tj-hdr::before { content: ""; position: absolute; z-index: -1; top: 0; bottom: -16px; -webkit-mask-image: linear-gradient(180deg, #000 0, #000 calc(100% - 16px), transparent 100%); mask-image: linear-gradient(180deg, #000 0, #000 calc(100% - 16px), transparent 100%); left: 50%; width: 100vw; transform: translateX(-50%); background: transparent; pointer-events: none; transition: background 0.2s; }
.tj-hdr.tj-pinned::before { background: rgba(10, 22, 40, 0.55); background: linear-gradient(180deg, rgb(7, 24, 50) 0, rgba(7, 24, 50, 0) 26px), color-mix(in srgb, var(--bg) 52%, transparent); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.tj-root.tj-light .tj-hdr.tj-pinned::before { background: rgba(235, 242, 251, 0.6); background: linear-gradient(180deg, rgb(235, 242, 251) 0, rgba(235, 242, 251, 0) 26px), color-mix(in srgb, var(--bg) 55%, transparent); }
.tj-bal { padding: 22px 0 0; }
.tj-balcard { display: flex; align-items: baseline; justify-content: flex-start; gap: 8px; padding: 2px 2px; }
.tj-bal-label { font-size: 11px; color: var(--muted); letter-spacing: 0.05em; text-transform: uppercase; }
.tj-bal-value { font-size: 18px; font-weight: 600; line-height: 1.15; color: var(--gold); background: linear-gradient(90deg, var(--gold), #F7C766); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.tj-bal-theme { margin-left: auto; align-self: center; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; border: none; background: transparent; color: var(--muted); cursor: pointer; transition: color 0.15s; }
.tj-bal-theme:hover { color: var(--gold); }
.tj-brandrow { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0; text-align: center; }
.tj-bar { display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 0 10px; }
.tj-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; background: var(--surface); border-top: 1px solid var(--border); padding-bottom: env(safe-area-inset-bottom, 0px); box-shadow: 0 -6px 14px rgba(0,0,0,0.25), 0 var(--vgap, 0px) 0 0 var(--surface); }
.tj-tabbar-in { max-width: 1180px; margin: 0 auto; display: flex; }
.tj-tabbar button { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0 5px; background: none; border: none; border-top: 2px solid transparent; color: var(--muted); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; }
.tj-tabbar button.on { color: var(--gold); border-top-color: var(--gold); }
.tj-tabbar button.tj-tab-refresh:disabled { cursor: default; opacity: 0.6; }
.tj-slide-next { animation: tj-slide-r 0.28s ease-out; overflow-x: clip; }
.tj-slide-prev { animation: tj-slide-l 0.28s ease-out; overflow-x: clip; }
@keyframes tj-slide-r { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
@keyframes tj-slide-l { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }
.tj-title { text-align: center; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold); padding-bottom: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--border); }
.tj-export-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: 1px solid var(--gold-dim); color: var(--gold); font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 7px; cursor: pointer; }
.tj-export-btn:active { opacity: 0.7; }
.tj-export-toggle { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: transparent; border: none; color: var(--muted); border-radius: 7px; cursor: pointer; }
.tj-export-toggle:active { opacity: 0.6; }
.tj-footer { text-align: center; font-size: 11px; color: var(--muted); opacity: 0.75; letter-spacing: 0.04em; padding: 8px 0 4px; }
.tj-watermark { text-align: left; font-size: 11px; color: var(--muted); opacity: 0.6; letter-spacing: 0.04em; display: flex; align-items: center; gap: 4px; margin: 4px 0 0; }
.tj-user-wrap { position: relative; }
.tj-user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; z-index: 30; max-height: 70vh; overflow-y: auto; background: var(--surface-raised); border: 1px solid var(--border); border-radius: 9px; padding: 10px; min-width: 190px; box-shadow: 0 10px 24px rgba(0,0,0,0.35); }
.tj-user-email { display: flex; align-items: center; gap: 10px; padding: 4px 6px 10px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
.tj-user-email-text { flex: 1; min-width: 0; font-size: 11px; color: var(--text); word-break: break-all; }
.tj-user-avatar { flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--gold-grad); color: #0A1628; font-size: 13px; font-weight: 700; line-height: 1; user-select: none; }
.tj-user-logout-btn { width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 6px; background: none; border: none; color: var(--red); font-size: 13px; cursor: pointer; text-align: left; border-radius: 6px; }
.tj-user-logout-btn:hover { background: rgba(239,91,80,0.1); }

.flex { display: flex; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 8px; }
.gap-8 { gap: 32px; }
.animate-spin { animation: tj-spin 1s linear infinite; }
@keyframes tj-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.tj-skel {
  background: linear-gradient(90deg, var(--surface) 25%, var(--surface-raised) 37%, var(--surface) 63%);
  background-size: 400% 100%;
  animation: tj-shimmer 1.4s ease infinite;
  border-radius: 8px;
}
@keyframes tj-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;
