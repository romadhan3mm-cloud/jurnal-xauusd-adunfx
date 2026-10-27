import React, { useEffect, useRef } from "react";

// Widget Timeline Berita TradingView (gratis, resmi) — headline khusus XAUUSD.
export default function NewsTimeline({ theme = "dark" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    containerRef.current.appendChild(inner);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.text = JSON.stringify({
      feedMode: "symbol",
      symbol: "OANDA:XAUUSD",
      colorTheme: theme === "light" ? "light" : "dark",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      locale: "id",
    });
    containerRef.current.appendChild(script);
  }, [theme]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div className="tradingview-widget-container" ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
