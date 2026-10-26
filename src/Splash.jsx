import React from "react";
import { LIGHT_BG_IMG, DARK_BG_IMG, LogoEmblem } from "./Brand.jsx";

// Halaman splash TraderLogs: latar panah naik + garis diagonal, logo di tengah, kalimat ajakan,
// dan garis kuning yang bergerak. Warna mengikuti tema (light = terang, selain itu = gelap).
// Latar digambar sebagai SVG (bukan file gambar), jadi tajam di semua ukuran layar dan ikut tema.
const GOLD = "#FDB10A";

export default function Splash({ light = true, instant = false }) {
  const a = (delay) => (instant ? "none" : `tl-splash-up .6s ${delay}s ease-out both`);
  const bg0 = light ? "#FFFFFF" : "#071832";
  const bg1 = light ? "#DCE9FA" : "#0B2650";
  const shape = light ? "#B7D0F0" : "#3A6DB5";
  const shapeOp = light ? 0.55 : 0.28;
  const ink = light ? "#002453" : "#F2F5FA";
  const sub = light ? "#33507A" : "rgba(242,245,250,0.82)";

  return (
    <div
      role="status"
      aria-label="Memuat TraderLogs"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: "calc(-1 * var(--vgap, 0px))",
        zIndex: 9999, overflow: "hidden", background: light ? "#EBF2FB" : "#071832",
      }}
    >
      <style>{`
        @keyframes tl-splash-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tl-splash-run { 0% { transform: translateX(-110%) } 100% { transform: translateX(310%) } }
        @keyframes tl-splash-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        .tl-splash-bar { width: 38%; height: 100%; border-radius: 3px; background: ${GOLD}; animation: tl-splash-run 1.15s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .tl-splash-bar { animation-duration: 2.4s } }
      `}</style>

      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `url(${light ? LIGHT_BG_IMG : DARK_BG_IMG}) center top / cover no-repeat` }} />

      <div
        style={{
          position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-54%)",
          display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px",
          boxSizing: "border-box", fontFamily: "'Poppins','Lato','Inter',sans-serif",
        }}
      >
        {/* ikon bulat emas + panah (sama dengan ikon aplikasi) */}
        <LogoEmblem size={104} style={{ animation: a(0.1) }} />
        <img
          src={light ? "/logo-light.png" : "/logo-dark.png"} alt="TraderLogs"
          style={{ display: "block", width: "min(84vw, 460px)", height: "auto", marginTop: 22, animation: a(0.2) }}
        />
        <div style={{ marginTop: 44, fontSize: 15, fontWeight: 500, letterSpacing: "0.02em", textAlign: "center", animation: a(0.35) }}>
          <span style={{ color: sub }}>Mulai perjalanan trading yang lebih baik</span>
        </div>
        {/* garis kuning bergerak */}
        <div style={{ marginTop: 18, width: 120, height: 3, borderRadius: 3, overflow: "hidden", background: light ? "rgba(0,36,83,0.10)" : "rgba(255,255,255,0.14)", animation: a(0.45) }}>
          <div className="tl-splash-bar" />
        </div>
      </div>
    </div>
  );
}
