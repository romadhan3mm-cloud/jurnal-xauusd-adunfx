import React from "react";

// Splash TraderLogs: latar polos mengikuti tema (terang/gelap), logo di tengah, kalimat ajakan,
// dan garis kuning yang bergerak. Tanpa gambar latar.
const GOLD = "#FDB10A";

export default function Splash({ light = true, instant = false }) {
  const sub = light ? "#33507A" : "rgba(242,245,250,0.82)";
  const a = (delay) => (instant ? "none" : `tl-splash-up .6s ${delay}s ease-out both`);

  return (
    <div
      role="status"
      aria-label="Memuat TraderLogs"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: "calc(-1 * var(--vgap, 0px))",
        zIndex: 9999, overflow: "hidden",
        // terang: putih di tepi atas (menyatu dengan bar status) memudar ke warna latar; gelap: polos
        background: light ? "linear-gradient(180deg, #FFFFFF 0%, #EBF2FB 30%)" : "#071832",
        animation: instant ? "none" : "tl-splash-in .35s ease-out both",
      }}
    >
      <style>{`
        @keyframes tl-splash-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tl-splash-run { 0% { transform: translateX(-110%) } 100% { transform: translateX(310%) } }
        @keyframes tl-splash-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        .tl-splash-bar { width: 38%; height: 100%; border-radius: 3px; background: ${GOLD}; animation: tl-splash-run 1.15s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .tl-splash-bar { animation-duration: 2.4s } }
      `}</style>

      <div
        style={{
          position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-54%)",
          display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px",
          boxSizing: "border-box", fontFamily: "'Poppins','Lato','Inter',sans-serif",
        }}
      >
        {/* ikon bulat emas + panah */}
        <svg viewBox="0 0 200 200" width="104" height="104" aria-hidden="true" style={{ display: "block", animation: a(0.1) }}>
          <circle cx="100" cy="100" r="98" fill={GOLD} />
          <polyline points="38,150 82,98 108,122 154,68" fill="none" stroke="#fff" strokeWidth="22" strokeLinejoin="miter" />
          <polygon points="112,60 168,46 160,104" fill="#fff" />
        </svg>
        <img
          src={light ? "/logo-light.png" : "/logo-dark.png"} alt="TraderLogs"
          style={{ display: "block", width: "min(84vw, 460px)", height: "auto", marginTop: 22, animation: a(0.2) }}
        />
        <div style={{ marginTop: 44, fontSize: 15, fontWeight: 500, letterSpacing: "0.02em", textAlign: "center", color: sub, animation: a(0.35) }}>
          Mulai perjalanan trading yang lebih baik
        </div>
        {/* garis kuning bergerak */}
        <div style={{ marginTop: 18, width: 120, height: 3, borderRadius: 3, overflow: "hidden", background: light ? "rgba(0,36,83,0.10)" : "rgba(255,255,255,0.14)", animation: a(0.45) }}>
          <div className="tl-splash-bar" />
        </div>
      </div>
    </div>
  );
}
