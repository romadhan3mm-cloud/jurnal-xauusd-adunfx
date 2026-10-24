import React, { useEffect, useRef, useId } from "react";

// Widget chart TradingView asli (gratis, resmi) — lengkap dengan indikator
// dan tools gambar bawaan TradingView. Simbol default XAUUSD, timeframe M15.
export default function TradingViewChart({ theme = "dark" }) {
  const containerRef = useRef(null);
  const widgetId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const scriptExisting = document.getElementById("tv-widget-script");

    const createWidget = () => {
      if (!window.TradingView || !containerRef.current) return;

      const isLight = theme === "light";
      const gridColor = "rgba(0,0,0,0)"; // grid disembunyikan (transparan)

      // eslint-disable-next-line no-new
      new window.TradingView.widget({
        autosize: true,
        symbol: "OANDA:XAUUSD",
        interval: "15",
        timezone: "Etc/UTC",
        theme: isLight ? "light" : "dark",
        style: "1",
        locale: "id",
        toolbar_bg: isLight ? "#F6F4EF" : "#12161C",
        enable_publishing: false,
        allow_symbol_change: true,

        // === Toolbar & fitur lengkap (search simbol, timeframe, tipe chart,
        // indikator, alert, replay, undo/redo, screenshot, fullscreen, dll) ===
        hide_top_toolbar: false,
        hide_legend: false,
        hide_side_toolbar: false, // toolbar tools gambar di kiri
        withdateranges: true,
        details: true,
        hotlist: true,
        calendar: false,
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        save_image: true,

        // === Warna candle (standar TradingView) & garis grid disembunyikan ===
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
          "paneProperties.background": isLight ? "#FFFFFF" : "#12161C",
          "paneProperties.backgroundType": "solid",

          "scalesProperties.textColor": isLight ? "#837C6E" : "#7C828C",
          "scalesProperties.lineColor": isLight ? "#DDD7C9" : "#232A34",
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
    // Sengaja hanya jalan sekali saat komponen pertama kali dipasang (mount).
    // Widget TIDAK dibuat ulang saat tema aplikasi berubah, supaya analisa/garis
    // gambar yang sudah dibuat pengguna di chart tidak ikut hilang/reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "72vh",
        minHeight: 420,
      }}
    >
      <div id={`tv-chart-${widgetId}`} ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
