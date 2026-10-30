import React, { useEffect, useRef, useState } from "react";
import EconomicCalendar from "./EconomicCalendar.jsx";
import { LineChart as ChartIcon } from "lucide-react";
import { CardShell, CardHeader, BTN_RADIUS, BOX_RADIUS } from "./CardHeader.jsx";
import TabSwitch from "./TabSwitch.jsx";

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
    panel: "var(--surface)",
    panelAlt: "var(--surface-raised)",
    border: "var(--border)",
    text: "var(--text)",
    muted: "var(--muted)",
  };

  const tabSwitch = <TabSwitch tabs={[{ id: "chart", label: "Chart" }, { id: "news", label: "Berita" }]} value={activeTab} onChange={setActiveTab} theme={theme} ariaLabel="Pilih tampilan" />;

  return (
    <section style={{ width: "100%", color: colors.text }}>
      {activeTab === "chart" ? (
        <CardShell ariaLabel="Chart XAU/USD" marginBottom={14}>
          <CardHeader
            icon={<ChartIcon size="52%" strokeWidth={2.2} style={{ display: "block" }} />}
            title="XAU/USD"
            subtitle="Emas · OANDA"
          />
          {tabSwitch}
        <div style={{ borderRadius: BOX_RADIUS, overflow: "hidden", background: colors.panel, border: `1px solid ${colors.border}` }}>
          <div style={{ padding: "12px 12px 9px", background: colors.panel }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {TIMEFRAMES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTimeframe(item.value)}
                  aria-pressed={timeframe === item.value}
                  style={{ minWidth: 34, padding: "6px 9px", border: "none", borderRadius: BTN_RADIUS, background: timeframe === item.value ? "var(--navy-btn-bg)" : "transparent", color: timeframe === item.value ? "var(--navy-btn-text)" : colors.muted, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
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
              style={{ position: "absolute", zIndex: 5, left: 0, top: "50%", transform: "translateY(-50%)", width: 24, height: 54, padding: 0, border: `1px solid ${colors.border}`, borderLeft: 0, borderRadius: `0 ${BTN_RADIUS} ${BTN_RADIUS} 0`, background: showDrawingTools ? (isLight ? "#E8F1FF" : "#263D5D") : colors.panelAlt, color: colors.text, fontSize: 20, lineHeight: 1, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.14)" }}
            >
              {showDrawingTools ? "‹" : "›"}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "9px 12px", borderTop: `1px solid ${colors.border}`, color: colors.muted, fontSize: 11, fontWeight: 700 }}>
            <span>Zona waktu: UTC</span>
            <span>Didukung TradingView</span>
          </div>
        </div>
        </CardShell>
      ) : (
        <EconomicCalendar theme={theme} afterHeader={tabSwitch} />
      )}
    </section>
  );
}
