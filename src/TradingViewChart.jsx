import React, { useEffect, useRef, useState } from "react";
import EconomicCalendar from "./EconomicCalendar.jsx";
import PriceChart from "./PriceChart.jsx";

const TIMEFRAMES = [
  { label: "M5", value: "5" },
  { label: "M15", value: "15" },
  { label: "H1", value: "60" },
  { label: "H4", value: "240" },
  { label: "D1", value: "D" },
];

// Tampilan Chart mengikuti desain kartu yang ringkas; data candlestick tetap
// berasal dari widget TradingView resmi. Tab Berita memakai kalender ekonomi live.
export default function TradingViewChart({ theme = "dark" }) {
  const containerRef = useRef(null);
  const [timeframe, setTimeframe] = useState("15");
  const [activeTab, setActiveTab] = useState("chart");
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const widgetId = "tv-chart-main";
  const isLight = theme === "light";

  useEffect(() => {
    if (activeTab !== "chart" || !containerRef.current) return undefined;
    const container = containerRef.current;
    container.innerHTML = "";

    let cancelled = false;
    const createWidget = () => {
      if (cancelled || !window.TradingView || !containerRef.current) return;
      container.innerHTML = "";
      // eslint-disable-next-line no-new
      new window.TradingView.widget({
        autosize: true,
        symbol: "OANDA:XAUUSD",
        interval: timeframe,
        timezone: "Etc/UTC",
        theme: isLight ? "light" : "dark",
        style: "1",
        locale: "id",
        toolbar_bg: isLight ? "#F4F7FC" : "#10213B",
        enable_publishing: false,
        allow_symbol_change: false,
        // Aktifkan toolbar chart agar pengguna bisa membuka indikator dan alat gambar.
        hide_top_toolbar: false,
        hide_legend: true,
        hide_side_toolbar: !showDrawingTools,
        hide_volume: true,
        withdateranges: false,
        details: false,
        hotlist: false,
        calendar: false,
        save_image: false,
        // Chart tetap bersih tanpa indikator bawaan.
        studies: [],
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#26A69A",
          "mainSeriesProperties.candleStyle.downColor": "#EF5350",
          "mainSeriesProperties.candleStyle.borderUpColor": "#26A69A",
          "mainSeriesProperties.candleStyle.borderDownColor": "#EF5350",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26A69A",
          "mainSeriesProperties.candleStyle.wickDownColor": "#EF5350",
          "mainSeriesProperties.candleStyle.drawWick": true,
          "mainSeriesProperties.candleStyle.drawBorder": true,
          "paneProperties.vertGridProperties.color": "rgba(0,0,0,0)",
          "paneProperties.horzGridProperties.color": "rgba(0,0,0,0)",
          "paneProperties.background": isLight ? "#FFFFFF" : "#10213B",
          "paneProperties.backgroundType": "solid",
          "scalesProperties.textColor": isLight ? "#6B7C93" : "#8A9BB5",
          "scalesProperties.lineColor": isLight ? "#DCE3EE" : "#263D5D",
        },
        container_id: widgetId,
      });
    };

    const existingScript = document.getElementById("tv-widget-script");
    if (window.TradingView) {
      createWidget();
    } else if (existingScript) {
      existingScript.addEventListener("load", createWidget, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = "tv-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.addEventListener("load", createWidget, { once: true });
      document.body.appendChild(script);
    }

    return () => { cancelled = true; };
  }, [timeframe, activeTab, isLight, showDrawingTools]);

  const colors = {
    panel: isLight ? "#FFFFFF" : "#10213B",
    panelAlt: isLight ? "#F5F8FC" : "#142945",
    border: isLight ? "#DCE5F0" : "#263D5D",
    text: isLight ? "#193452" : "#EDF4FF",
    muted: isLight ? "#718198" : "#9CAEC6",
  };

  return (
    <section style={{ width: "100%", color: colors.text }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: 5, borderRadius: 13, background: colors.panelAlt, border: `1px solid ${colors.border}`, marginBottom: 12 }}>
        {[{ id: "chart", label: "Chart" }, { id: "price", label: "Harga" }, { id: "news", label: "Berita" }].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            style={{ padding: "10px 12px", border: `1px solid ${activeTab === tab.id ? colors.border : "transparent"}`, borderRadius: 9, background: activeTab === tab.id ? colors.panel : "transparent", color: activeTab === tab.id ? colors.text : colors.muted, fontWeight: 700, fontSize: 13, boxShadow: activeTab === tab.id ? "0 2px 7px rgba(0,0,0,.06)" : "none", cursor: "pointer" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "price" ? (
        <PriceChart colors={colors} isLight={isLight} />
      ) : activeTab === "chart" ? (
        <div style={{ borderRadius: 16, overflow: "hidden", background: colors.panel, border: `1px solid ${colors.border}`, boxShadow: "0 5px 18px rgba(0,0,0,.07)" }}>
          <div style={{ padding: "12px 12px 9px", background: colors.panel }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.3 }}>XAU/USD</div>
                <div style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Emas · OANDA</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {TIMEFRAMES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTimeframe(item.value)}
                  aria-pressed={timeframe === item.value}
                  style={{ minWidth: 34, padding: "6px 9px", border: "none", borderRadius: 7, background: timeframe === item.value ? (isLight ? "#18395F" : "#E8F1FF") : "transparent", color: timeframe === item.value ? (isLight ? "#FFFFFF" : "#18395F") : colors.muted, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          </div>
          <div style={{ height: "min(56vh, 500px)", minHeight: 320, width: "100%", background: colors.panel, position: "relative" }}>
            <div id={widgetId} ref={containerRef} style={{ width: "100%", height: "100%" }} />
            <button
              type="button"
              onClick={() => setShowDrawingTools((value) => !value)}
              aria-label={showDrawingTools ? "Sembunyikan alat gambar" : "Tampilkan alat gambar"}
              aria-pressed={showDrawingTools}
              title={showDrawingTools ? "Sembunyikan alat gambar" : "Tampilkan alat gambar"}
              style={{ position: "absolute", zIndex: 5, left: 0, top: "50%", transform: "translateY(-50%)", width: 24, height: 54, padding: 0, border: `1px solid ${colors.border}`, borderLeft: 0, borderRadius: "0 9px 9px 0", background: showDrawingTools ? (isLight ? "#E8F1FF" : "#263D5D") : colors.panelAlt, color: colors.text, fontSize: 20, lineHeight: 1, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.14)" }}
            >
              {showDrawingTools ? "‹" : "›"}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "9px 12px", borderTop: `1px solid ${colors.border}`, color: colors.muted, fontSize: 9, fontWeight: 600 }}>
            <span>Zona waktu: UTC</span>
            <span>Didukung TradingView</span>
          </div>
        </div>
      ) : (
        <div style={{ borderRadius: 14, overflow: "hidden", background: colors.panel, border: `1px solid ${colors.border}`, padding: "8px 10px 0" }}>
          <div style={{ padding: "8px 4px 10px", fontSize: 12, fontWeight: 800 }}>Kalender ekonomi</div>
          <EconomicCalendar theme={theme} />
        </div>
      )}
    </section>
  );
}
