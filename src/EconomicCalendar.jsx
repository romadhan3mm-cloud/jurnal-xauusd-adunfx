import React, { useEffect, useRef } from "react";

// Widget kalender ekonomi TradingView (gratis, resmi, real-time).
// isTransparent:true supaya background-nya nyatu langsung dengan
// latar halaman, bukan kotak terpisah.
export default function EconomicCalendar({ theme = "dark" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const widgetInner = document.createElement("div");
    widgetInner.className = "tradingview-widget-container__widget";
    containerRef.current.appendChild(widgetInner);

    const isLight = theme === "light";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.text = JSON.stringify({
      colorTheme: isLight ? "light" : "dark",
      isTransparent: true,
      width: "100%",
      height: "100%",
      locale: "id",
      importanceFilter: "-1,0,1",
      countryFilter: "us",
    });

    containerRef.current.appendChild(script);
  }, [theme]);

  return (
    <div
      style={{ width: "100%", height: "78vh", minHeight: 480 }}
    >
      <div className="tradingview-widget-container" ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}


