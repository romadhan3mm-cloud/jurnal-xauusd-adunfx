import React, { useEffect } from "react";

// Identitas visual TraderLogs: ikon dokumen + candle (navy & emas), pembatas vertikal, wordmark.
const GOLD = "#F1AB08";
const NAVY = "#002453";

// ink = warna garis ikon & teks "Trader" (default mengikuti tema aplikasi)
export function LogoMark({ size = 72, ink = `var(--text, ${NAVY})`, style, className }) {
  const s = { fill: "none", stroke: ink, strokeWidth: 5.5, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg className={className} viewBox="0 0 120 120" style={{ display: "block", width: size, height: size, ...style }} aria-hidden="true">
      <path d="M26 30 L16 31 Q11 32 12 37 L24 100 Q25 105 30 104.500 L62 99" {...s} />
      <path d="M44 12 H80 L100 32 V96 Q100 104 92 104 H44 Q36 104 36 96 V20 Q36 12 44 12 Z" {...s} />
      <path d="M80 12 V24 Q80 32 88 32 H100" {...s} strokeWidth={4.5} />
      <g fill={GOLD} stroke={GOLD} strokeLinecap="round">
        <line x1="49" y1="42" x2="49" y2="68" strokeWidth="2.600" /><rect x="45" y="48" width="8" height="14" rx="1.800" stroke="none" />
        <line x1="62" y1="38" x2="62" y2="62" strokeWidth="2.600" /><rect x="58" y="42" width="8" height="15" rx="1.800" stroke="none" />
        <line x1="76" y1="26" x2="76" y2="58" strokeWidth="2.600" /><rect x="71" y="32" width="10" height="20" rx="1.800" stroke="none" />
        <line x1="90" y1="38" x2="90" y2="54" strokeWidth="2.600" /><rect x="87" y="41" width="7" height="9" rx="1.800" stroke="none" />
      </g>
      <g stroke={ink} strokeWidth="4" strokeLinecap="round">
        <line x1="48" y1="80" x2="90" y2="80" /><line x1="48" y1="91" x2="90" y2="91" />
      </g>
    </svg>
  );
}

// "Trader" + "Logs" (emas). tradeColor default mengikuti tema.
export function Wordmark({ size = 28, tagline = false, taglineSize = 13, taglineGap = 8, align = "center", tradeColor = `var(--text, ${NAVY})`, taglineColor = "var(--muted, #6B7C93)", children }) {
  return (
    <div style={{ textAlign: align, fontFamily: "'Poppins', 'Lato', 'Inter', sans-serif" }}>
      <div style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        <span style={{ color: tradeColor }}>Trader</span>
        <span style={{ color: GOLD }}>Logs</span>
      </div>
      {tagline && (
        <div style={{ fontSize: taglineSize, color: taglineColor, marginTop: taglineGap, letterSpacing: "0.04em", fontWeight: 400 }}>
          Disiplin · Evaluasi · Konsisten
        </div>
      )}
      {children}
    </div>
  );
}

// Logo TraderLogs (gambar wordmark). dark = versi untuk latar gelap ("TRADER" putih).
// size = patokan ukuran (lebar logo ≈ size × 4.6 px, maksimal 80% lebar layar).
export function LogoLockup({ size = 56, dark = false, tagline = true, children }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", maxWidth: "80vw" }}>
      <img
        src={dark ? "/logo-dark.png" : "/logo-light.png"}
        alt="TraderLogs"
        style={{ display: "block", width: Math.round(size * 4.6), maxWidth: "80vw", height: "auto" }}
      />
      {tagline && (
        <div style={{ fontFamily: "'Poppins','Lato',sans-serif", fontSize: Math.max(10, size * 0.2), marginTop: size * 0.12, letterSpacing: "0.04em", color: dark ? "rgba(242,245,250,0.75)" : "var(--muted, #6B7C93)" }}>
          Disiplin · Evaluasi · Konsisten
        </div>
      )}
      {children}
    </div>
  );
}

// Ikon bulat emas dengan panah naik (dipakai di splash). Gambar: /badge.png
export function GoldBadge({ size = 104, style }) {
  return (
    <img
      src="/badge.png"
      alt=""
      aria-hidden="true"
      style={{ display: "block", width: size, height: size, borderRadius: "50%", filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))", ...style }}
    />
  );
}

// Candle latar: [x tengah, badan atas, badan bawah, sumbu atas, sumbu bawah] (koordinat viewBox 780 x 620, mulai y=830)
const CANDLES = [
  [38, 916, 1078, 888, 1105],
  [94, 876, 968, 848, 996],
  [150, 1026, 1130, 998, 1158],
  [206, 948, 1156, 920, 1184],
  [262, 1054, 1244, 1026, 1272],
  [318, 1122, 1224, 1094, 1252],
  [374, 902, 1192, 874, 1220],
  [430, 1160, 1400, 1132, 1428],
  [486, 1134, 1228, 1106, 1256],
  [542, 952, 1044, 924, 1072],
  [598, 908, 1206, 880, 1234],
  [654, 1116, 1232, 1088, 1260],
  [710, 1126, 1284, 1098, 1312],
  [766, 894, 1018, 866, 1046],
];


// Latar candle + garis tren samar (dipakai splash dan header jurnal).
export function ChartBackdrop({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 830 780 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="tjb-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7FA3D6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7FA3D6" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {CANDLES.map(([cx, bt, bb, wt, wb]) => (
        <g key={cx}>
          <line x1={cx} y1={wt} x2={cx} y2={wb} stroke="#7FA3D6" strokeOpacity="0.2" strokeWidth="3" />
          <rect x={cx - 14} y={bt} width="28" height={bb - bt} rx="3" fill="#7FA3D6" fillOpacity="0.17" />
        </g>
      ))}
      <polyline
        points="10,1190 140,1080 240,1132 400,940 500,1012 620,840 770,985"
        fill="none"
        stroke="url(#tjb-line)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <polyline
        points="20,1265 160,1180 280,1223 440,1060 580,1140 770,1048"
        fill="none"
        stroke="#7FA3D6"
        strokeOpacity="0.32"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Latar satu layar penuh (login, reset password, dan seluruh isi jurnal).
// Posisinya fixed di belakang konten, jadi tetap diam saat halaman di-scroll.
export function PageBackdrop({ light = false, image = false }) {
  // html/body ikut warna tema, supaya area di luar viewport (home bar iOS, celah bar browser)
  // tidak memperlihatkan warna putih.
  useEffect(() => {
    const c = light ? "#F4F6FA" : "#04183A";
    document.documentElement.style.background = c;
    document.body.style.background = c;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", c);
  }, [light]);
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        height: "100lvh", minHeight: "100%",
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {image && !light && (
        <div
          className="tl-bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#04183A",
            backgroundImage: "linear-gradient(180deg, rgba(10,22,40,0.30), rgba(10,22,40,0.55)), url('/bg-app.jpg')",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      <style>{`
        .tl-bg-img { background-size: 100% 100%, 100% auto; background-position: center, center bottom; }
        @media (min-aspect-ratio: 1/1) { .tl-bg-img { background-size: 100% 100%, cover; background-position: center, center bottom; } }
      `}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: light
            ? "radial-gradient(70% 38% at 50% 0%, rgba(60, 110, 180, 0.20), rgba(60, 110, 180, 0) 75%)"
            : "radial-gradient(70% 38% at 50% 0%, rgba(60, 110, 180, 0.16), rgba(60, 110, 180, 0) 75%)",
        }}
      />
    </div>
  );
}

// Tema (gelap/terang) disimpan juga di perangkat, supaya halaman login & reset password
// (yang tampil sebelum data user termuat) memakai latar yang sama dengan jurnal.
const THEME_LOCAL_KEY = "tl-theme";
export function saveThemeLocal(value) {
  try { localStorage.setItem(THEME_LOCAL_KEY, value); } catch { /* abaikan */ }
}
export function getThemeLocal() {
  try { return localStorage.getItem(THEME_LOCAL_KEY) === "light" ? "light" : "dark"; } catch { return "dark"; }
}
