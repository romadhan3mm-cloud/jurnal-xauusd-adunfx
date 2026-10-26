import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { LogoLockup, GoldBadge } from "./Brand.jsx";

// Lama minimal splash tampil (ms). Progress bar mengikuti durasi ini.
export const SPLASH_MS = 2400;

const SPLASH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.sp-root {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;
    margin: 0; transform: none;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-family: 'Poppins', 'Lato', sans-serif;
  color: #F2F5FA;
  background: #071832;
  opacity: 1; transition: opacity 0.45s ease;
}
/* Latar dijulurkan 100px ke atas & bawah, supaya tidak ada celah di iPhone */
.sp-root::before { content: ""; position: absolute; left: 0; right: 0; top: -100px; bottom: 0; z-index: 0;
  background: #071832 url('/bg-app.jpg') center bottom / 100% auto no-repeat; pointer-events: none; }
@media (min-aspect-ratio: 1/1) { .sp-root::before { background-size: cover; } }
.sp-root.sp-leaving { opacity: 0; pointer-events: none; }
.sp-brand { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 22px; animation: sp-rise 0.8s ease both; }
.sp-chart { position: absolute; right: 0; bottom: 8%; width: 100%; height: 42%; pointer-events: none; opacity: 0.55;
  -webkit-mask-image: linear-gradient(90deg, transparent 20%, #000 100%); mask-image: linear-gradient(90deg, transparent 20%, #000 100%); }
.sp-foot { position: absolute; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 5%);
  display: flex; flex-direction: column; align-items: center; padding: 0 10%; box-sizing: border-box; animation: sp-rise 0.8s 0.2s ease both; }
.sp-msg { font-size: clamp(12px, 3.4vw, 15px); color: rgba(242,245,250,0.8); text-align: center; }
.sp-bar { width: min(34vw, 150px); height: 4px; border-radius: 4px; background: rgba(255,255,255,0.14); overflow: hidden; margin-top: 16px; }
.sp-bar > i { display: block; height: 100%; width: 0; border-radius: 4px; background: #EDA524;
  animation: sp-fill ${SPLASH_MS - 200}ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
@keyframes sp-fill { to { width: 100%; } }
@keyframes sp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
`;

export default function SplashScreen({ leaving = false }) {
  // Warnai html/body gelap selama splash supaya area di luar viewport (status bar, home bar,
  // celah saat bar browser berubah) tidak menampilkan warna lain. Dikembalikan setelah splash hilang.
  useEffect(() => {
    const h = document.documentElement, b = document.body;
    h.style.background = b.style.background = "#071832";
    return () => {
      // kembalikan ke warna tema yang diset halaman di belakangnya (meta theme-color)
      const m = document.querySelector('meta[name="theme-color"]');
      const c = (m && m.getAttribute("content")) || "";
      h.style.background = c;
      b.style.background = c;
      const boot = document.getElementById("boot-bg");
      if (boot) boot.remove();
    };
  }, []);

  // Dirender langsung di <body> (portal) agar tidak terpengaruh wadah induk.
  return createPortal(
    <div className={`sp-root ${leaving ? "sp-leaving" : ""}`} role="status" aria-label="Memuat TraderLogs">
      <style>{SPLASH_CSS}</style>
      <div className="sp-brand"><GoldBadge size={104} /><LogoLockup size={84} dark tagline /></div>
      <div className="sp-foot">
        <div className="sp-msg">Mulai perjalanan trading yang lebih baik</div>
        <div className="sp-bar"><i /></div>
      </div>
    </div>,
    document.body
  );
}
