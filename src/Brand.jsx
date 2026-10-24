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
export function Wordmark({ size = 28, tagline = false, taglineSize = 13, align = "center", tradeColor = "#F3EEDF" }) {
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
        <div style={{ fontSize: taglineSize, color: "rgba(243,238,223,0.88)", marginTop: 8, letterSpacing: "0.01em", fontWeight: 400 }}>
          Disiplin · Evaluasi · Konsisten
        </div>
      )}
    </div>
  );
}
