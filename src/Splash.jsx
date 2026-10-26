import React from "react";

// Splash TraderLogs: memakai gambar splash buatan sendiri (public/splash-light.jpg & splash-dark.jpg,
// 852×1846, logo di tengah), lalu kalimat ajakan dan garis kuning yang bergerak di bawah logo.
// Terang/gelap mengikuti tema tersimpan (prop light).
//
// Gambar ditampilkan "cover" di dalam panggung (stage) berukuran sama dengan hasil cover, sehingga
// kalimat & garis selalu tepat di bawah logo di ukuran layar apa pun (posisi dihitung dari panggung).
const GOLD = "#FDB10A";
const RATIO = 852 / 1846;
// lebar panggung = yang lebih besar antara lebar layar dan tinggi layar × rasio gambar
const STAGE_W = `max(100vw, calc(100vh * ${RATIO}))`;

export default function Splash({ light = true, instant = false }) {
  const src = light ? "/splash-light.jpg" : "/splash-dark.jpg";
  const textColor = light ? "#33507A" : "rgba(242,245,250,0.88)";
  const trackColor = light ? "rgba(0,36,83,0.10)" : "rgba(255,255,255,0.16)";
  const rise = (delay) => (instant ? "none" : `tl-splash-up .6s ${delay}s ease-out both`);

  return (
    <div
      role="status"
      aria-label="Memuat TraderLogs"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: "calc(-1 * var(--vgap, 0px))",
        zIndex: 9999, overflow: "hidden", background: light ? "#EBF2FB" : "#071832",
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

      {/* panggung: ukuran = hasil "cover" gambar, dipusatkan di layar */}
      <div
        style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          width: STAGE_W, height: `calc(${STAGE_W} / ${RATIO})`,
        }}
      >
        <img
          src={src} alt="" draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", userSelect: "none" }}
        />
        {/* kalimat + garis kuning: tepat di bawah wordmark (wordmark berakhir ± 51% tinggi gambar) */}
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: "56%",
            display: "flex", flexDirection: "column", alignItems: "center",
            fontFamily: "'Poppins','Lato','Inter',sans-serif",
          }}
        >
          <div
            style={{
              fontSize: `calc(${STAGE_W} * 0.036)`, fontWeight: 500, letterSpacing: "0.02em",
              color: textColor, textAlign: "center", whiteSpace: "nowrap", animation: rise(0.25),
            }}
          >
            Mulai perjalanan trading yang lebih baik
          </div>
          <div
            style={{
              marginTop: `calc(${STAGE_W} * 0.03)`, width: `calc(${STAGE_W} * 0.15)`, height: 3, borderRadius: 3,
              overflow: "hidden", background: trackColor, animation: rise(0.4),
            }}
          >
            <div className="tl-splash-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
