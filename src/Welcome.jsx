import React from "react";
import { Download } from "lucide-react";
import { PageBackdrop } from "./Brand.jsx";

// Otomatis ikut package.json (lihat vite.config.js)
const APP_VERSION = __APP_VERSION__;
const APP_CREATED_YEAR = 2026;

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;

const isStandaloneDisplay = () =>
  (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
  window.navigator.standalone === true;

const WELCOME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

html, body { overscroll-behavior: none; overflow-x: clip; -webkit-text-size-adjust: 100%; touch-action: manipulation; }
.wl-root {
  position: relative; min-height: 100vh; min-height: 100dvh; box-sizing: border-box;
  display: flex; justify-content: center;
  font-family: 'Poppins', 'Inter', 'Lato', sans-serif; color: #062B6B; background: #EBF2FB;
}
.wl-content {
  position: relative; z-index: 1; width: 100%; max-width: 420px; box-sizing: border-box;
  min-height: 100vh; min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 7vh) 28px calc(env(safe-area-inset-bottom, 0px) + 20px);
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.wl-logo { display: block; width: min(300px, 74vw); height: auto; }
.wl-hero { display: block; width: auto; max-width: min(340px, 84vw); max-height: 34vh; height: auto; margin: 4.5vh 0 1vh; }
.wl-title { margin: 2vh 0 8px; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; color: #062B6B; }
.wl-sub { margin: 0; max-width: 280px; font-size: 15px; line-height: 1.5; font-weight: 400; color: #5F7392; }
.wl-actions { width: 100%; margin-top: auto; padding-top: 28px; display: flex; flex-direction: column; gap: 12px; }
.wl-btn { width: 100%; height: 54px; border-radius: 999px; font-family: inherit; font-size: 16px; font-weight: 600; cursor: pointer; }
.wl-btn-primary { border: none; background: #062B6B; color: #FFFFFF; box-shadow: 0 8px 20px rgba(6, 43, 107, 0.22); }
.wl-btn-outline { border: 1.5px solid #062B6B; background: rgba(255, 255, 255, 0.7); color: #062B6B; }
.wl-btn:active { transform: scale(0.99); }
.wl-footer { margin-top: 18px; font-size: 10.5px; color: #5F7392; opacity: 0.85; }
.wl-apk {
  position: absolute; z-index: 2; top: max(12px, env(safe-area-inset-top)); right: max(14px, env(safe-area-inset-right));
  display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 8px; box-sizing: border-box;
  font-size: 10px; font-weight: 700; letter-spacing: 0.03em; text-decoration: none;
  color: #C98708; border: 1px solid #EDA524; border-radius: 8px; background: rgba(255, 255, 255, 0.6);
}
`;

// Layar sambutan (sebelum login). Selalu tema terang.
export default function Welcome({ onLogin, onRegister }) {
  return (
    <div className="wl-root">
      <style>{WELCOME_CSS}</style>
      <PageBackdrop light />

      {/* Unduh APK Android — disembunyikan di iPhone/iPad dan di dalam aplikasi yang sudah terpasang */}
      {!isIOS() && !isStandaloneDisplay() && (
        <a className="wl-apk" href="/downloads/traderlogs.apk" download title="Unduh aplikasi Android (APK)" aria-label="Unduh aplikasi Android (APK)">
          <Download size={12} />
          <span>APK</span>
        </a>
      )}

      <div className="wl-content">
        <img className="wl-logo" src="/logo-light.png" alt="TraderLogs" />
        <h1 className="wl-title">Selamat Datang</h1>
        <p className="wl-sub">Mulai perjalanan trading Anda bersama TRADERLOGS</p>

        <div className="wl-actions">
          <button type="button" className="wl-btn wl-btn-primary" onClick={onLogin}>Login</button>
          <button type="button" className="wl-btn wl-btn-outline" onClick={onRegister}>Daftar</button>
          <div className="wl-footer">
            © {APP_CREATED_YEAR} adunfx <span style={{ opacity: 0.5, margin: "0 4px" }}>·</span> v{APP_VERSION}
          </div>
        </div>
      </div>
    </div>
  );
}
