import React from "react";

// Halaman splash TraderLogs: latar panah naik + garis diagonal, logo di tengah, kalimat ajakan,
// dan garis kuning yang bergerak. Warna mengikuti tema (light = terang, selain itu = gelap).
// Latar digambar sebagai SVG (bukan file gambar), jadi tajam di semua ukuran layar dan ikut tema.
const GOLD = "#FDB10A";

export default function Splash({ light = true }) {
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
        animation: "tl-splash-in .35s ease-out both",
      }}
    >
      <style>{`
        @keyframes tl-splash-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tl-splash-run { 0% { transform: translateX(-110%) } 100% { transform: translateX(310%) } }
        @keyframes tl-splash-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        .tl-splash-bar { width: 38%; height: 100%; border-radius: 3px; background: ${GOLD}; animation: tl-splash-run 1.15s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .tl-splash-bar { animation-duration: 2.4s } }
      `}</style>

      <svg
        viewBox="0 0 852 1846" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="tl-sp-bg" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor={bg0} />
            <stop offset="0.5" stopColor={light ? "#F4F8FE" : "#0A2043"} />
            <stop offset="1" stopColor={bg1} />
          </linearGradient>
        </defs>
        <rect width="852" height="1846" fill="url(#tl-sp-bg)" />
        <g fill={shape} stroke={shape} fillOpacity={shapeOp} strokeOpacity={shapeOp}>
          {/* panah naik besar */}
          <polygon points="40,800 393,455 513,552 670,372 628,338 808,237 780,437 735,405 525,655 402,560 150,790" stroke="none" />
          {/* garis diagonal kiri atas */}
          <polygon points="0,0 175,0 0,170" stroke="none" />
          <polygon points="205,0 258,0 0,262 0,208" stroke="none" fillOpacity={shapeOp * 0.8} />
          {/* kiri bawah */}
          <line x1="0" y1="1135" x2="124" y2="1298" strokeWidth="40" strokeLinecap="round" fill="none" />
          <line x1="0" y1="1000" x2="100" y2="1205" strokeWidth="3" fill="none" />
          {/* kanan bawah */}
          <line x1="678" y1="1448" x2="852" y2="1262" strokeWidth="26" strokeLinecap="round" fill="none" />
          <line x1="615" y1="1600" x2="852" y2="1368" strokeWidth="3" fill="none" />
          <polygon points="400,1846 852,1410 852,1846" stroke="none" fillOpacity={shapeOp * 0.7} />
        </g>
      </svg>

      <div
        style={{
          position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-54%)",
          display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px",
          boxSizing: "border-box", fontFamily: "'Poppins','Lato','Inter',sans-serif",
        }}
      >
        {/* ikon bulat emas + panah */}
        <svg viewBox="0 0 200 200" width="104" height="104" aria-hidden="true" style={{ display: "block", animation: "tl-splash-up .6s .1s ease-out both" }}>
          <circle cx="100" cy="100" r="98" fill={GOLD} />
          <polyline points="38,150 82,98 108,122 154,68" fill="none" stroke="#fff" strokeWidth="22" strokeLinejoin="miter" />
          <polygon points="112,60 168,46 160,104" fill="#fff" />
        </svg>
        <img
          src={light ? "/logo-light.png" : "/logo-dark.png"} alt="TraderLogs"
          style={{ display: "block", width: "min(84vw, 460px)", height: "auto", marginTop: 22, animation: "tl-splash-up .6s .2s ease-out both" }}
        />
        <div style={{ marginTop: 44, fontSize: 15, fontWeight: 500, letterSpacing: "0.02em", color: light ? ink : ink, textAlign: "center", animation: "tl-splash-up .6s .35s ease-out both" }}>
          <span style={{ color: sub }}>Mulai perjalanan trading yang lebih baik</span>
        </div>
        {/* garis kuning bergerak */}
        <div style={{ marginTop: 18, width: 120, height: 3, borderRadius: 3, overflow: "hidden", background: light ? "rgba(0,36,83,0.10)" : "rgba(255,255,255,0.14)", animation: "tl-splash-up .6s .45s ease-out both" }}>
          <div className="tl-splash-bar" />
        </div>
      </div>
    </div>
  );
}
