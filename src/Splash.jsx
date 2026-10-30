import React, { useEffect, useState } from "react";
import { LIGHT_BG_IMG, DARK_BG_IMG, LogoEmblem, TopFade } from "./Brand.jsx";

// Halaman splash TraderLogs: latar panah naik + garis diagonal, logo di tengah, kalimat ajakan,
// dan garis kuning yang bergerak. Warna mengikuti tema (light = terang, selain itu = gelap).
// Latar digambar sebagai SVG (bukan file gambar), jadi tajam di semua ukuran layar dan ikut tema.
const GOLD = "#FDB10A";
const SLOW_MS = 8000;

export default function Splash({ light = true, instant = false, message = "Mulai perjalanan trading yang lebih baik" }) {
  // Kalau memuat lebih dari SLOW_MS, tampilkan petunjuk koneksi lambat.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(t);
  }, []);
  const a = (delay) => (instant ? "none" : `tl-splash-up .6s ${delay}s ease-out both`);
  const bg0 = light ? "#FFFFFF" : "#071832";
  const bg1 = light ? "#DCE9FA" : "#0B2650";
  const shape = light ? "#B7D0F0" : "#3A6DB5";
  const shapeOp = light ? 0.55 : 0.28;
  const ink = light ? "#002453" : "#F2F5FA";
  const sub = light ? "#33507A" : "rgba(242,245,250,0.82)";
  const tag = light ? "#6B7C93" : "rgba(242,245,250,0.75)";

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
      <TopFade light={light} />

      <div
        style={{
          position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-54%)",
          display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px",
          boxSizing: "border-box", fontFamily: "'Inter',sans-serif",
        }}
      >
        {/* ikon bulat emas + panah (sama dengan ikon aplikasi) */}
        <LogoEmblem size={104} style={{ animation: a(0.1) }} />
        <img
          src={light ? "/logo-light.png" : "/logo-dark.png"} alt="TraderLogs"
          style={{ display: "block", width: "min(84vw, 460px)", height: "auto", marginTop: 22, animation: a(0.2) }}
        />
        {/* tagline di bawah logo */}
        <div style={{ marginTop: 14, fontSize: 13, letterSpacing: "0.05em", fontWeight: 500, color: tag, textAlign: "center", animation: a(0.3) }}>
          Disiplin · Evaluasi · Konsisten
        </div>
      </div>

      {/* kalimat + garis kuning bergerak di bagian bawah (di atas home bar iPhone) */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: "calc(max(var(--vgap, 0px), env(safe-area-inset-bottom, 0px)) + 56px)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "0 20px",
          boxSizing: "border-box", textAlign: "center", fontFamily: "'Inter',sans-serif",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "0.02em", color: sub, animation: a(0.4) }}>{message}</div>
        <div style={{ width: 120, height: 3, borderRadius: 3, overflow: "hidden", background: light ? "rgba(0,36,83,0.10)" : "rgba(255,255,255,0.14)", animation: a(0.5) }}>
          <div className="tl-splash-bar" />
        </div>
        <div aria-live="polite" style={{ minHeight: 18, marginTop: -4, fontSize: 13, color: tag, opacity: slow ? 1 : 0, transition: "opacity .4s" }}>
          {slow ? "Koneksi lambat, masih mencoba…" : ""}
        </div>
      </div>
    </div>
  );
}
