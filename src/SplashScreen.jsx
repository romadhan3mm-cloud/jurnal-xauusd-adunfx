import React from "react";
import { LogoMark, Wordmark, ChartBackdrop } from "./Brand.jsx";

// Lama minimal splash tampil (ms). Progress bar mengikuti durasi ini.
export const SPLASH_MS = 2400;

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
      <ChartBackdrop className="sp-chart" />

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
