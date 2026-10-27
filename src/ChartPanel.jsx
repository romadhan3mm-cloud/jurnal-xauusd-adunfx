import React, { useState } from "react";
import { LineChart as ChartIcon, CalendarClock, Newspaper } from "lucide-react";
import TradingViewChart from "./TradingViewChart.jsx";
import EconomicCalendar from "./EconomicCalendar.jsx";
import NewsTimeline from "./NewsTimeline.jsx";

const TABS = [
  ["chart", "Chart", ChartIcon],
  ["kalender", "Kalender", CalendarClock],
  ["berita", "Berita", Newspaper],
];

// Satu kartu: tab Chart | Kalender | Berita. Chart dibiarkan tetap terpasang
// (hanya disembunyikan) supaya garis analisa yang digambar tidak hilang saat pindah tab.
// Kalender & Berita baru dimuat saat tab-nya pertama kali dibuka.
export default function ChartPanel({ theme = "dark" }) {
  const [tab, setTab] = useState("chart");
  const [opened, setOpened] = useState({ chart: true });

  const pick = (k) => {
    setTab(k);
    setOpened((o) => (o[k] ? o : { ...o, [k]: true }));
  };

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", background: "var(--surface-soft)" }}>
      <div style={{ display: "flex", gap: 4, padding: 6, background: "transparent" }}>
        {TABS.map(([k, label, Ic]) => {
          const active = tab === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => pick(k)}
              aria-pressed={active}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 6px",
                borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: active ? "color-mix(in srgb, var(--surface-raised) 60%, transparent)" : "transparent",
                color: active ? "var(--gold)" : "var(--muted)",
                boxShadow: "none",
              }}
            >
              <Ic size={14} /> {label}
            </button>
          );
        })}
      </div>

      <div style={{ height: "70vh", minHeight: 440, maxHeight: 780, position: "relative" }}>
        <div style={{ display: tab === "chart" ? "block" : "none", height: "100%" }}>
          <TradingViewChart theme={theme} />
        </div>
        {opened.kalender && (
          <div style={{ display: tab === "kalender" ? "block" : "none", height: "100%" }}>
            <EconomicCalendar theme={theme} />
          </div>
        )}
        {opened.berita && (
          <div style={{ display: tab === "berita" ? "block" : "none", height: "100%" }}>
            <NewsTimeline theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}
