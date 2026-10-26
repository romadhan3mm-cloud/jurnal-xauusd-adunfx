import React, { useEffect } from "react";
import { BAR_FADE_BG, BAR_FADE_H } from "./viewportGap.js";

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

// Emblem bulat emas + panah naik (vektor SVG): tajam di ukuran apa pun, tanpa file gambar.
// Bentuk panah, ekor yang terpotong tepi lingkaran, dan gradasi emas mengikuti gambar contoh ikon aplikasi.
export function LogoEmblem({ size = 104, style, className }) {
  return (
    <svg className={className} viewBox="0 0 360 360" width={size} height={size} aria-hidden="true" focusable="false" style={{ display: "block", ...style }}>
      <defs>
      <radialGradient id="tlE-c" cx="0.25" cy="0.17" r="1.1">
      <stop offset="0" stopColor="#FFE300"/>
      <stop offset="0.3" stopColor="#FFC50C"/>
      <stop offset="0.55" stopColor="#FBA805"/>
      <stop offset="0.8" stopColor="#F38D02"/>
      <stop offset="1" stopColor="#EE7A01"/>
      </radialGradient>
      <radialGradient id="tlE-g" cx="0.56" cy="0.76" r="0.3">
      <stop offset="0" stopColor="#FDB10A" stopOpacity="0.85"/>
      <stop offset="1" stopColor="#FDB10A" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="tlE-d" cx="0.9" cy="0.86" r="0.52">
      <stop offset="0" stopColor="#E56D00" stopOpacity="0.62"/>
      <stop offset="1" stopColor="#E56D00" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="tlE-a" gradientUnits="userSpaceOnUse" x1="300" y1="60" x2="30" y2="270">
      <stop offset="0" stopColor="#FBFCFE"/>
      <stop offset="0.55" stopColor="#F3F8FE"/>
      <stop offset="1" stopColor="#E8F2FD"/>
      </linearGradient>
      <clipPath id="tlE-k"><circle cx="180" cy="180" r="178"/></clipPath>
      </defs>
      <circle cx="180" cy="180" r="178" fill="url(#tlE-c)"/>
      <circle cx="180" cy="180" r="178" fill="url(#tlE-g)"/>
      <circle cx="180" cy="180" r="178" fill="url(#tlE-d)"/>
      <path clipPath="url(#tlE-k)" d="M307.4 76.5 L210.7 94.9 L239.1 118.9 L169.8 193.2 L127.4 153.3 L24.2 263.5 L-3.7 293.9 L23.7 331.8 L51.7 300.9 L128.4 218.6 L171.3 259.0 L272.5 150.3 L297.5 177.2 Z" fill="url(#tlE-a)"/>
    </svg>
  );
}

// Latar satu layar penuh (login, reset password, dan seluruh isi jurnal).
// Kedua tema memakai gambar latar yang sama (gradasi biru + panah naik) yang menutupi seluruh layar:
// terang = /bg-light.svg, gelap = /bg-dark.svg (versi navy; keduanya vektor, tajam di layar apa pun). DARK_BASE / LIGHT_BASE jadi warna cadangan selama gambar dimuat.
// Posisinya fixed di belakang konten, jadi tetap diam saat halaman di-scroll.
export const DARK_BASE = "#071832"; // tema gelap: warna cadangan di bawah gambar latar
export const LIGHT_BASE = "#EBF2FB"; // tema terang: warna cadangan di bawah gambar latar
export const LIGHT_BG_IMG = "/bg-light.svg?v=2";
export const DARK_BG_IMG = "/bg-dark.svg?v=2";

export function PageBackdrop({ light = false }) {
  // html/body ikut warna tema, supaya area di luar viewport (home bar iOS, celah bar browser)
  // tidak memperlihatkan warna putih.
  useEffect(() => {
    const c = light ? LIGHT_BASE : DARK_BASE;
    document.documentElement.style.background = c;
    document.body.style.background = c;
    document.documentElement.style.colorScheme = light ? "light" : "dark";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", c);
    // Bar status iOS: tema gelap = menyatu dengan latar gelap (teks putih); tema terang = bar terang (teks gelap).
    // (iOS umumnya baru menerapkan perubahan ini saat aplikasi dibuka ulang.)
    const sb = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (sb) sb.setAttribute("content", light ? "default" : "black-translucent");
  }, [light]);
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: "calc(-1 * var(--vgap, 0px))",
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: light
          ? `${LIGHT_BASE} url(${LIGHT_BG_IMG}) center top / cover no-repeat`
          : `${DARK_BASE} url(${DARK_BG_IMG}) center top / cover no-repeat`,
      }}
    >
      {/* Pemudaran dari bar status putih hanya di tema terang; tema gelap gelap penuh sampai tepi atas. */}
      {light && (
        <>
          <style>{`
            .tl-bar-fade { display: none; position: absolute; left: 0; right: 0; top: 0; height: ${BAR_FADE_H}px; background: ${BAR_FADE_BG}; pointer-events: none; }
            .tl-ios .tl-bar-fade { display: block; }
          `}</style>
          <div className="tl-bar-fade" />
        </>
      )}
    </div>
  );
}

// Tema (gelap/terang) disimpan juga di perangkat, supaya halaman login & reset password
// (yang tampil sebelum data user termuat) memakai latar yang sama dengan jurnal.
// Tampilan baru (v101) bawaannya TERANG. Sekali saja, pengguna lama yang masih tersimpan
// "gelap" dikembalikan ke terang (penanda "tl-look"); setelah itu pilihan mereka dihormati.
const THEME_LOCAL_KEY = "tl-theme";
const LOOK_KEY = "tl-look";
const LOOK_VER = "2";
export function needsLookReset() {
  try { return localStorage.getItem(LOOK_KEY) !== LOOK_VER; } catch { return false; }
}
// Apakah perangkat ini sudah punya pilihan tema yang tersimpan (bukan sekadar bawaan)?
export function hasThemeLocal() {
  try { return !needsLookReset() && localStorage.getItem(THEME_LOCAL_KEY) !== null; } catch { return false; }
}
export function saveThemeLocal(value) {
  try {
    localStorage.setItem(THEME_LOCAL_KEY, value);
    localStorage.setItem(LOOK_KEY, LOOK_VER);
  } catch { /* abaikan */ }
}
export function getThemeLocal() {
  try {
    if (needsLookReset()) return "light";
    return localStorage.getItem(THEME_LOCAL_KEY) === "dark" ? "dark" : "light";
  } catch { return "light"; }
}
