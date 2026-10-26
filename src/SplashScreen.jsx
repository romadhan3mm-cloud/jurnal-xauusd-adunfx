import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { barFadeBg, BAR_FADE_H } from "./viewportGap.js";

// Lama minimal splash tampil (ms). Progress bar mengikuti durasi ini.
export const SPLASH_MS = 2400;

// Warna dasar = rata-rata warna gambar splash; tampil sesaat sebelum gambar termuat
const BASE = "#EBF2FB";
// Warna rata-rata tepi atas gambar splash; dipakai untuk bar status (meta theme-color)
const SPLASH_TOP = "#F1F6FC";

// Gambar /bg-splash.jpg (logo sudah menyatu di dalam gambar) dipakai persis sama dengan
// gambar peluncuran iOS di public/splash/, jadi peralihan dari layar iOS ke splash ini mulus.
const SPLASH_CSS = `
.sp-root {
  position: fixed; top: 0; left: 0; right: 0; bottom: calc(-1 * var(--vgap, 0px)); z-index: 9999;
  margin: 0; transform: none; overflow: hidden;
  background: ${BASE} url('/bg-splash.jpg') center / cover no-repeat;
  opacity: 1; transition: opacity 0.45s ease;
}
.sp-root::before { content: ""; display: none; position: absolute; left: 0; right: 0; top: 0; height: ${BAR_FADE_H}px; background: ${barFadeBg(SPLASH_TOP)}; pointer-events: none; }
.tl-sa .sp-root::before { display: block; }
.sp-root.sp-leaving { opacity: 0; pointer-events: none; }
.sp-foot { position: absolute; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 8%);
  display: flex; flex-direction: column; align-items: center; }
.sp-bar { width: min(34vw, 150px); height: 4px; border-radius: 4px; background: rgba(6, 43, 107, 0.12); overflow: hidden; }
.sp-bar > i { display: block; height: 100%; width: 0; border-radius: 4px; background: #F1AB08;
  animation: sp-fill ${SPLASH_MS - 200}ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
@keyframes sp-fill { to { width: 100%; } }
`;

export default function SplashScreen({ leaving = false }) {
  // Warnai html/body selama splash supaya area di luar viewport (status bar, home bar,
  // celah saat bar browser berubah) tidak menampilkan warna lain. Dikembalikan setelah splash hilang.
  useEffect(() => {
    const h = document.documentElement, b = document.body;
    h.style.background = b.style.background = BASE;
    const meta0 = document.querySelector('meta[name="theme-color"]');
    const prevTheme = meta0 ? meta0.getAttribute("content") : null;
    if (meta0) meta0.setAttribute("content", SPLASH_TOP);
    return () => {
      if (meta0 && prevTheme !== null && meta0.getAttribute("content") === SPLASH_TOP) meta0.setAttribute("content", prevTheme);
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
      <div className="sp-foot"><div className="sp-bar"><i /></div></div>
    </div>,
    document.body
  );
}
