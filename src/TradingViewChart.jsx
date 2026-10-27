import React, { useEffect, useRef, useState, useId } from "react";
import { Pencil } from "lucide-react";

// Chart TradingView asli (gratis, resmi) dibungkus kartu supaya nyatu dengan
// halaman: sudut membulat, garis tepi dan warna latar sama seperti kartu lain.
// Simbol default XAUUSD, timeframe M15. Toolbar alat gambar di kiri
// disembunyikan dulu; tombol "Alat gambar" membuka-tutupnya. Widget dibuat
// ulang saat tombol itu ditekan (batasan TradingView), jadi gambar yang belum
// disimpan di chart ikut hilang.
export default function TradingViewChart({ theme = "dark" }) {
  const containerRef = useRef(null);
  const widgetId = useId().replace(/:/g, "");
  const [sideTools, setSideTools] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    containerRef.current.innerHTML = "";
    let cancelled = false;

    const scriptExisting = document.getElementById("tv-widget-script");

    const createWidget = () => {
      if (cancelled || !window.TradingView || !containerRef.current) return;

      const isLight = theme === "light";
      const gridColor = "rgba(0,0,0,0)"; // grid disembunyikan (transparan)
      const surface = isLight ? "#FFFFFF" : "#0F2038"; // sama dengan --surface

      // eslint-disable-next-line no-new
      new window.TradingView.widget({
        autosize: true,
        symbol: "OANDA:XAUUSD",
        interval: "15",
        timezone: "Etc/UTC",
        theme: isLight ? "light" : "dark",
        style: "1",
        locale: "id",
        toolbar_bg: surface,
        enable_publishing: false,
        allow_symbol_change: true,

        hide_top_toolbar: false,
        hide_legend: false,
        hide_side_toolbar: !sideTools,
        withdateranges: true,
        details: false,
        hotlist: false,
        calendar: false,
        show_popup_button: false,
        save_image: true,

        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#26A69A",
          "mainSeriesProperties.candleStyle.downColor": "#EF5350",
          "mainSeriesProperties.candleStyle.borderUpColor": "#26A69A",
          "mainSeriesProperties.candleStyle.borderDownColor": "#EF5350",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26A69A",
          "mainSeriesProperties.candleStyle.wickDownColor": "#EF5350",
          "mainSeriesProperties.candleStyle.drawWick": true,
          "mainSeriesProperties.candleStyle.drawBorder": true,

          "paneProperties.vertGridProperties.color": gridColor,
          "paneProperties.horzGridProperties.color": gridColor,
          "paneProperties.background": surface,
          "paneProperties.backgroundType": "solid",

          "scalesProperties.textColor": isLight ? "#6B7C93" : "#8A9BB5",
          "scalesProperties.lineColor": isLight ? "#DCE3EE" : "#223A5E",
        },

        container_id: `tv-chart-${widgetId}`,
      });
    };

    if (window.TradingView) {
      createWidget();
    } else if (scriptExisting) {
      scriptExisting.addEventListener("load", createWidget, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = "tv-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.addEventListener("load", createWidget, { once: true });
      document.body.appendChild(script);
    }
    return () => { cancelled = true; };
    // Widget TIDAK dibuat ulang saat tema aplikasi berubah, supaya gambar di
    // chart tidak hilang. Hanya dibuat ulang saat tombol "Alat gambar" ditekan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sideTools]);

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>XAUUSD</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Emas</span>
        </div>
        <button
          type="button"
          onClick={() => setSideTools((v) => !v)}
          aria-pressed={sideTools}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px", borderRadius: 999, fontSize: 12, cursor: "pointer",
            background: sideTools ? "var(--gold)" : "transparent",
            color: sideTools ? "#0A1628" : "var(--muted)",
            border: `1px solid ${sideTools ? "var(--gold)" : "var(--border)"}`,
          }}
        >
          <Pencil size={13} /> Alat gambar
        </button>
      </div>
      <div style={{ width: "100%", height: "66vh", minHeight: 400 }}>
        <div id={`tv-chart-${widgetId}`} ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
