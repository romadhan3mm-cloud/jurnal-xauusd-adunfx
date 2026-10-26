import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { LogoLockup, LIGHT_BASE } from "./Brand.jsx";

// Lama minimal splash tampil (ms). Progress bar mengikuti durasi ini.
export const SPLASH_MS = 2400;

// Splash polos: warna dasar tema terang + logo di tengah + progress bar.
// Warna sama dengan halaman di belakangnya, jadi bar status dan peralihan tetap menyatu.
const SPLASH_CSS = `
.sp-root {
  position: fixed; top: 0; left: 0; right: 0; bottom: calc(-1 * var(--vgap, 0px)); z-index: 9999;
  margin: 0; transform: none; overflow: hidden;
  background: ${LIGHT_BASE};
  display: flex; align-items: center; justify-content: center;
  opacity: 1; transition: opacity 0.45s ease;
}
.sp-root.sp-leaving { opacity: 0; pointer-events: none; }
.sp-foot { position: absolute; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 8%);
  display: flex; flex-direction: column; align-items: center; }
.sp-bar { width: min(34vw, 150px); height: 4px; border-radius: 4px; background: rgba(6, 43, 107, 0.12); overflow: hidden; }
.sp-bar > i { display: block; height: 100%; width: 0; border-radius: 4px; background: #F1AB08;
  animation: sp-fill ${SPLASH_MS - 200}ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
@keyframes sp-fill { to { width: 100%; } }
`;

export default function SplashScreen({ leaving = false }) {
  // Warnai html/body selama splash supaya area di luar viewport tidak menampilkan warna lain.
  useEffect(() => {
    const h = document.documentElement, b = document.body;
    h.style.background = b.style.background = LIGHT_BASE;
    return () => {
      const boot = document.getElementById("boot-bg");
      if (boot) boot.remove();
    };
  }, []);

  // Dirender langsung di <body> (portal) agar tidak terpengaruh wadah induk.
  return createPortal(
    <div className={`sp-root ${leaving ? "sp-leaving" : ""}`} role="status" aria-label="Memuat TraderLogs">
      <style>{SPLASH_CSS}</style>
      <LogoLockup size={64} />
      <div className="sp-foot"><div className="sp-bar"><i /></div></div>
    </div>,
    document.body
  );
}
