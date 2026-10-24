import React from "react";
import { LogoMark, Wordmark } from "./Brand.jsx";

// Lama minimal splash tampil (ms). Progress bar mengikuti durasi ini.
export const SPLASH_MS = 2400;

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

const SPLASH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;800&display=swap');

.sp-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  font-family: 'Lato', 'Inter', sans-serif;
  color: #F3EEDF;
  background:
    radial-gradient(62% 34% at 50% 24%, rgba(104, 78, 20, 0.55), rgba(104, 78, 20, 0) 72%),
    linear-gradient(180deg, #080705 0%, #0C0A06 45%, #1B1409 100%);
  opacity: 1;
  transition: opacity 0.45s ease;
}
.sp-root.sp-leaving { opacity: 0; pointer-events: none; }

.sp-brand {
  padding-top: 22vh;
  text-align: center;
  animation: sp-rise 0.8s ease both;
}
.sp-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 3.4vw;
  filter: drop-shadow(0 0 26px rgba(212, 175, 95, 0.32));
}
@media (min-width: 600px) { .sp-logo-wrap { margin-bottom: 20px; } }

.sp-chart {
  position: absolute;
  left: 0;
  width: 100%;
  top: 49%;
  height: 37%;
  pointer-events: none;
}

.sp-foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 6%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10%;
  box-sizing: border-box;
  animation: sp-rise 0.8s 0.2s ease both;
}
.sp-msg { font-size: clamp(13px, 3.7vw, 17px); color: rgba(243, 238, 223, 0.92); text-align: center; }
.sp-bar {
  width: 100%;
  max-width: 440px;
  height: 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-top: 22px;
}
.sp-bar > i {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 4px;
  background: linear-gradient(90deg, #B98A35, #F3D98B);
  animation: sp-fill ${SPLASH_MS - 200}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes sp-fill { to { width: 100%; } }
@keyframes sp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
`;

export default function SplashScreen({ leaving = false }) {
  return (
    <div className={`sp-root ${leaving ? "sp-leaving" : ""}`} role="status" aria-label="Memuat TradeJournal">
      <style>{SPLASH_CSS}</style>

      {/* Latar: candle & garis tren samar */}
      <svg className="sp-chart" viewBox="0 830 780 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="sp-line" x1="0" y1="0" x2="1" y2="0">
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
          stroke="url(#sp-line)"
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

      <div className="sp-brand">
        <div className="sp-logo-wrap">
          <LogoMark size="clamp(120px, 34.6vw, 190px)" />
        </div>
        <Wordmark size="clamp(34px, 10.8vw, 56px)" tagline taglineSize="clamp(13px, 3.7vw, 18px)" />
      </div>

      <div className="sp-foot">
        <div className="sp-msg">Mulai perjalanan trading yang lebih baik</div>
        <div className="sp-bar">
          <i />
        </div>
      </div>
    </div>
  );
}
