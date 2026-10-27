import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

// Kartu "Fundamental & News": dua tab, Kalender ekonomi dan Berita emas.
// Daftar kalender dan berita memakai widget TradingView (gratis, resmi).
// Strip "Berikutnya" (hitung mundur) memakai feed jadwal mingguan gratis tidak
// resmi; kalau feed gagal dimuat (diblokir, offline), strip disembunyikan dan
// sisanya tetap jalan.

const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const OTHER_COUNTRIES = "us,eu,gb,jp,cn,de,au,ca,ch,nz";

const pad = (n) => String(n).padStart(2, "0");

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${days > 0 ? `${days} hari ` : ""}${pad(h)}:${pad(m)}:${pad(s)}`;
}

function TvEmbed({ src, config, height }) {
  const ref = useRef(null);
  const key = JSON.stringify(config);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    ref.current.appendChild(inner);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.async = true;
    script.text = key;
    ref.current.appendChild(script);
  }, [src, key]);
  return <div className="tradingview-widget-container" ref={ref} style={{ width: "100%", height }} />;
}

function chipStyle(on) {
  return {
    height: 26, padding: "0 11px", borderRadius: 999, fontSize: 12, cursor: "pointer",
    background: on ? "var(--gold)" : "transparent",
    color: on ? "#0A1628" : "var(--muted)",
    border: `1px solid ${on ? "var(--gold)" : "var(--border)"}`,
    fontWeight: on ? 700 : 400,
  };
}

export default function FundamentalCard({ theme = "dark" }) {
  const [tab, setTab] = useState("kalender");
  const [high, setHigh] = useState(true);
  const [medium, setMedium] = useState(false);
  const [usdOnly, setUsdOnly] = useState(true);
  const [events, setEvents] = useState(null); // null = belum / gagal dimuat
  const [now, setNow] = useState(() => Date.now());
  const isLight = theme === "light";

  // Ambil jadwal sekali; gagal = strip hitung mundur tidak ditampilkan
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(FEED_URL, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("feed"))))
      .then((list) => {
        if (!Array.isArray(list)) return;
        setEvents(
          list
            .map((e) => ({ title: e.title, country: e.country, impact: e.impact, t: Date.parse(e.date) }))
            .filter((e) => e.title && Number.isFinite(e.t))
        );
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleImpact = (which) => {
    const nextHigh = which === "high" ? !high : high;
    const nextMedium = which === "medium" ? !medium : medium;
    if (!nextHigh && !nextMedium) return; // minimal satu tingkat dampak aktif
    setHigh(nextHigh);
    setMedium(nextMedium);
  };

  const wanted = (e) =>
    ((high && e.impact === "High") || (medium && e.impact === "Medium")) && (!usdOnly || e.country === "USD");
  const next = events ? events.filter((e) => e.t > now && wanted(e)).sort((a, b) => a.t - b.t)[0] : null;

  const importance = [medium ? "0" : null, high ? "1" : null].filter(Boolean).join(",");

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ padding: 10 }}>
        <div role="tablist" style={{ display: "flex", gap: 3, padding: 3, borderRadius: 9, background: "var(--surface-raised)" }}>
          {[["kalender", "Kalender"], ["berita", "Berita emas"]].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, height: 30, borderRadius: 7, fontSize: 13, cursor: "pointer", border: "none",
                background: tab === id ? "var(--surface)" : "transparent",
                color: tab === id ? "var(--gold)" : "var(--muted)",
                fontWeight: tab === id ? 700 : 500,
                boxShadow: tab === id ? "0 0 0 1px var(--border)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "kalender" && (
        <>
          {next && (
            <div
              style={{
                margin: "0 10px 10px", padding: "9px 12px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                background: "color-mix(in srgb, var(--gold) 14%, transparent)", border: "1px solid var(--gold-dim)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, minWidth: 0 }}>
                <Clock size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
                <span style={{ color: "var(--muted)", flexShrink: 0 }}>Berikutnya</span>
                <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {usdOnly ? "" : `${next.country} `}{next.title}
                </span>
              </span>
              <span className="tj-mono" style={{ fontWeight: 600, color: "var(--gold)", fontSize: 13, flexShrink: 0 }}>{formatCountdown(next.t - now)}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 10px 10px" }}>
            <button type="button" style={chipStyle(high)} aria-pressed={high} onClick={() => toggleImpact("high")}>Dampak tinggi</button>
            <button type="button" style={chipStyle(medium)} aria-pressed={medium} onClick={() => toggleImpact("medium")}>Sedang</button>
            <button type="button" style={chipStyle(usdOnly)} aria-pressed={usdOnly} onClick={() => setUsdOnly((v) => !v)}>Hanya USD</button>
          </div>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <TvEmbed
              src="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
              height={460}
              config={{
                colorTheme: isLight ? "light" : "dark",
                isTransparent: true,
                width: "100%",
                height: "100%",
                locale: "id",
                importanceFilter: importance,
                countryFilter: usdOnly ? "us" : OTHER_COUNTRIES,
              }}
            />
          </div>
        </>
      )}

      {tab === "berita" && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          <TvEmbed
            src="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
            height={500}
            config={{
              feedMode: "symbol",
              symbol: "OANDA:XAUUSD",
              colorTheme: isLight ? "light" : "dark",
              isTransparent: true,
              displayMode: "regular",
              width: "100%",
              height: "100%",
              locale: "id",
            }}
          />
        </div>
      )}
    </div>
  );
}
