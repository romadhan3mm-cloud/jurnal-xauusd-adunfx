import React from "react";

// Identitas visual TradeJournal: logo (kotak emas + candle + panah naik) dan wordmark.
// Dipakai di splash, halaman login, dan header jurnal.

export function LogoMark({ size = 72, style, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      style={{ display: "block", width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tjl-border" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6DC91" />
          <stop offset="0.5" stopColor="#D4AF5F" />
          <stop offset="1" stopColor="#B98A35" />
        </linearGradient>
        <linearGradient id="tjl-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F1B11" />
          <stop offset="1" stopColor="#0B0A06" />
        </linearGradient>
        <linearGradient id="tjl-candle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2D07C" />
          <stop offset="1" stopColor="#A57B2E" />
        </linearGradient>
        <linearGradient id="tjl-arrow" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#C9962F" />
          <stop offset="1" stopColor="#FFF2BF" />
        </linearGradient>
        <filter id="tjl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="3" y="3" width="114" height="114" rx="30" fill="url(#tjl-bg)" stroke="url(#tjl-border)" strokeWidth="5" />
      <rect x="10" y="10" width="100" height="100" rx="24" fill="none" stroke="#D4AF5F" strokeOpacity="0.22" strokeWidth="1" />

      {/* candle: wick + body */}
      <g stroke="#D4AF5F" strokeWidth="2" strokeLinecap="round">
        <line x1="30" y1="60" x2="30" y2="94" />
        <line x1="47" y1="54" x2="47" y2="90" />
        <line x1="65" y1="40" x2="65" y2="80" />
        <line x1="83" y1="38" x2="83" y2="72" />
      </g>
      <g fill="url(#tjl-candle)">
        <rect x="25.5" y="66" width="9" height="20" rx="2" />
        <rect x="42.5" y="60" width="9" height="22" rx="2" />
        <rect x="60.5" y="46" width="9" height="26" rx="2" />
        <rect x="78.5" y="44" width="9" height="20" rx="2" />
      </g>

      {/* garis naik + panah */}
      <g filter="url(#tjl-glow)">
        <path
          d="M16 85 L42 62 L56 74 L82 43 L92 29"
          fill="none"
          stroke="url(#tjl-arrow)"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="98,21 96.5,33.5 86.5,26" fill="#FFF2BF" />
      </g>
    </svg>
  );
}

// "Trade" krem + "Journal" emas. size boleh angka (px) atau string CSS (mis. clamp()).
export function Wordmark({ size = 28, tagline = false, taglineSize = 13, align = "center", tradeColor = "#F3EEDF", taglineColor = "rgba(243,238,223,0.88)" }) {
  return (
    <div style={{ textAlign: align, fontFamily: "'Lato', 'Inter', sans-serif" }}>
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        <span style={{ color: tradeColor }}>Trade</span>
        <span
          style={{
            color: "#D4AF5F",
            background: "linear-gradient(180deg, #EBCB7A 10%, #C99A3C 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Journal
        </span>
      </div>
      {tagline && (
        <div style={{ fontSize: taglineSize, color: taglineColor, marginTop: 8, letterSpacing: "0.01em", fontWeight: 400 }}>
          Disiplin · Evaluasi · Konsisten
        </div>
      )}
    </div>
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
          <stop offset="0" stopColor="#D4AF5F" stopOpacity="0.35" />
          <stop offset="1" stopColor="#E6C778" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {CANDLES.map(([cx, bt, bb, wt, wb]) => (
        <g key={cx}>
          <line x1={cx} y1={wt} x2={cx} y2={wb} stroke="#D4AF5F" strokeOpacity="0.2" strokeWidth="3" />
          <rect x={cx - 14} y={bt} width="28" height={bb - bt} rx="3" fill="#D4AF5F" fillOpacity="0.17" />
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
        stroke="#D4AF5F"
        strokeOpacity="0.32"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
