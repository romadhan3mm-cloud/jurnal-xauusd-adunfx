import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { BAR_FADE_BG, BAR_FADE_H } from "./viewportGap.js";
import { LogoLockup, getThemeLocal, DARK_BASE, LIGHT_BASE } from "./Brand.jsx";

// Lama minimal splash tampil (ms). Progress bar mengikuti durasi ini.
export const SPLASH_MS = 2400;

// Splash polos tanpa gambar latar: warna dasar mengikuti tema (gelap = gelap penuh), logo di tengah.
const SPLASH_CSS = `
.sp-root {
  position: fixed; top: 0; left: 0; right: 0; bottom: calc(-1 * var(--vgap, 0px)); z-index: 9999;
  margin: 0; transform: none; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  opacity: 1; transition: opacity 0.45s ease;
}
.sp-root::before { content: ""; display: none; position: absolute; left: 0; right: 0; top: 0; height: ${BAR_FADE_H}px; background: ${BAR_FADE_BG}; pointer-events: none; }
.tl-sa .sp-root.sp-light::before { display: block; }
.sp-root.sp-leaving { opacity: 0; pointer-events: none; }
.sp-foot { position: absolute; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 8%);
  display: flex; flex-direction: column; align-items: center; }
.sp-bar { width: min(34vw, 150px); height: 4px; border-radius: 4px; background: rgba(6, 43, 107, 0.12); overflow: hidden; }
.sp-dark .sp-bar { background: rgba(255, 255, 255, 0.14); }
.sp-bar > i { display: block; height: 100%; width: 0; border-radius: 4px; background: #F1AB08;
  animation: sp-fill ${SPLASH_MS - 200}ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
@keyframes sp-fill { to { width: 100%; } }
`;

export default function SplashScreen({ leaving = false }) {
  const light = getThemeLocal() !== "dark";
  const base = light ? LIGHT_BASE : DARK_BASE;

  // Warnai html/body selama splash supaya area di luar viewport (status bar, home bar,
  // celah saat bar browser berubah) tidak menampilkan warna lain. Dikembalikan setelah splash hilang.
  useEffect(() => {
    const h = document.documentElement, b = document.body;
    h.style.background = b.style.background = base;
    return () => {
      // kembalikan ke warna tema yang diset halaman di belakangnya (meta theme-color)
      const m = document.querySelector('meta[name="theme-color"]');
      const c = (m && m.getAttribute("content")) || "";
      h.style.background = c;
      b.style.background = c;
      const boot = document.getElementById("boot-bg");
      if (boot) boot.remove();
    };
  }, [base]);

  // Dirender langsung di <body> (portal) agar tidak terpengaruh wadah induk.
  return createPortal(
    <div
      className={`sp-root ${light ? "sp-light" : "sp-dark"} ${leaving ? "sp-leaving" : ""}`}
      style={{ background: base }}
      role="status"
      aria-label="Memuat TraderLogs"
    >
      <style>{SPLASH_CSS}</style>
      <LogoLockup size={56} dark={!light} tagline />
      <div className="sp-foot"><div className="sp-bar"><i /></div></div>
    </div>,
    document.body
  );
}
