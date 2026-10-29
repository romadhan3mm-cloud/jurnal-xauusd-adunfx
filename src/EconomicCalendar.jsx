import React, { useCallback, useEffect, useState } from "react";

const WORKER_URL = "/api/ai-news/events";
const XOOMAR_URL = "https://xoomar.com/api/markets/calendar";
const REFRESH_MS = 15 * 60 * 1000;
const ZONE = "Asia/Jakarta";

function formatEventTime(value) {
  if (!value) return "Waktu belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Waktu belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace("pukul", "");
}

function FFTag() {
  return <span title="Sumber: Forex Factory" style={{ marginLeft: 4, fontSize: 8, fontWeight: 800, opacity: 0.65 }}>FF</span>;
}

// Prefer the Worker (merged XOOMAR + Forex Factory, cached, API key). Fall back to XOOMAR directly.
async function loadPayload() {
  try {
    const viaWorker = await fetch(WORKER_URL);
    if (viaWorker.ok) {
      const body = await viaWorker.json();
      if (Array.isArray(body?.events)) return { data: body.events, updatedAt: body.updatedAt, enrichment: body.enrichment || null };
    }
  } catch (err) { /* fall through to the direct source */ }
  const response = await fetch(XOOMAR_URL);
  if (!response.ok) throw new Error(response.status === 429 ? "Batas permintaan kalender tercapai. Coba lagi beberapa menit." : `Kalender gagal dimuat (HTTP ${response.status}).`);
  const payload = await response.json();
  return { data: payload?.data, updatedAt: payload?.updatedAt, enrichment: null };
}

function formatFigure(value, unit) {
  if (value === null || value === undefined || value === "") return "—";
  // Keep the provider's decimal point and never add a thousands separator.
  return `${String(value)}${unit ? ` ${unit}` : ""}`;
}

function normalizedImpact(value) {
  const level = String(value || "").trim().toLowerCase();
  if (level === "high" || level.includes("high impact")) return "high";
  if (["med", "medium", "moderate"].includes(level) || level.includes("medium impact")) return "medium";
  return "low";
}

function importanceLabel(value) {
  const level = normalizedImpact(value);
  if (level === "high") return { label: "HIGH IMPACT", color: "#EF5B50", bg: "rgba(239,91,80,.12)" };
  if (level === "medium") return { label: "MEDIUM IMPACT", color: "#D99A20", bg: "rgba(217,154,32,.13)" };
  return { label: "LOW IMPACT", color: "#3F9B78", bg: "rgba(63,155,120,.12)" };
}

export default function EconomicCalendar({ theme = "dark" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [filter, setFilter] = useState("all");
  const [enrichment, setEnrichment] = useState(null);
  const isLight = theme === "light";
  const colors = {
    panel: isLight ? "#FFFFFF" : "#10213B",
    panelAlt: isLight ? "#F5F8FC" : "#142945",
    border: isLight ? "#DCE5F0" : "#263D5D",
    text: isLight ? "#193452" : "#EDF4FF",
    muted: isLight ? "#718198" : "#9CAEC6",
  };

  const loadCalendar = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const payload = await loadPayload();
      if (!Array.isArray(payload?.data)) throw new Error("Format data kalender tidak dikenali.");
      setEvents(payload.data
        .filter((event) => normalizedImpact(event.importance) !== "low")
        .slice()
        .sort((a, b) => {
          const impactOrder = (normalizedImpact(a.importance) === "high" ? 0 : 1) - (normalizedImpact(b.importance) === "high" ? 0 : 1);
          return impactOrder || (new Date(a.scheduledAt) - new Date(b.scheduledAt));
        }));
      setUpdatedAt(payload.updatedAt || new Date().toISOString());
      setEnrichment(payload.enrichment || null);
    } catch (err) {
      setError(err?.message || "Tidak dapat memuat kalender ekonomi. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
    const timer = window.setInterval(() => loadCalendar(true), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadCalendar]);

  const visibleEvents = events.filter((event) => {
    if (normalizedImpact(event.importance) === "low") return false;
    if (filter === "upcoming") return new Date(event.scheduledAt).getTime() >= Date.now();
    if (filter === "past") return new Date(event.scheduledAt).getTime() < Date.now();
    return true;
  }).slice().sort((a, b) => {
    const impactOrder = (normalizedImpact(a.importance) === "high" ? 0 : 1) - (normalizedImpact(b.importance) === "high" ? 0 : 1);
    return impactOrder || (new Date(a.scheduledAt) - new Date(b.scheduledAt));
  });

  return (
    <div style={{ width: "100%", color: colors.text, fontFamily: "inherit", paddingBottom: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 2px 12px" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Kalender Ekonomi AS</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 3 }}>Jadwal rilis data penting untuk XAU/USD · WIB</div>
        </div>
        <button type="button" onClick={() => loadCalendar()} disabled={loading} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, background: colors.panelAlt, color: colors.text, padding: "7px 10px", fontSize: 11, fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? .65 : 1 }}>
          {loading ? "Memuat…" : "Muat ulang"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, paddingBottom: 12, flexWrap: "wrap" }}>
        {[{ id: "all", label: "Semua jadwal" }, { id: "upcoming", label: "Akan datang" }, { id: "past", label: "Sudah rilis" }].map((item) => (
          <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} style={{ border: `1px solid ${filter === item.id ? (isLight ? "#18395F" : "#6686B3") : colors.border}`, borderRadius: 999, background: filter === item.id ? (isLight ? "#18395F" : "#263D5D") : "transparent", color: filter === item.id ? "#FFFFFF" : colors.muted, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{item.label}</button>
        ))}
      </div>

      {error && (
        <div role="alert" style={{ border: `1px solid ${colors.border}`, borderRadius: 10, background: colors.panelAlt, padding: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5 }}>Kalender belum tersedia</div>
          <div style={{ fontSize: 11, lineHeight: 1.5, color: colors.muted, marginBottom: 10 }}>{error}</div>
          <button type="button" onClick={() => loadCalendar()} style={{ border: 0, borderRadius: 7, background: isLight ? "#18395F" : "#E8F1FF", color: isLight ? "#FFFFFF" : "#18395F", padding: "8px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Coba lagi</button>
        </div>
      )}

      {loading && events.length === 0 && !error && <div style={{ padding: "36px 12px", textAlign: "center", color: colors.muted, fontSize: 12 }}>Memuat jadwal rilis data ekonomi…</div>}

      {!loading && !error && visibleEvents.length === 0 && (
        <div style={{ padding: "32px 12px", textAlign: "center", color: colors.muted, fontSize: 12 }}>Tidak ada rilis untuk filter ini pada rentang data yang tersedia.</div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {visibleEvents.map((event, index) => {
          const impact = importanceLabel(event.importance);
          const isReleased = Boolean(event.actual !== null && event.actual !== undefined && event.actual !== "");
          return (
            <article key={`${event.source || "us"}-${event.scheduledAt}-${event.eventName}-${index}`} style={{ border: `1px solid ${colors.border}`, borderRadius: 11, background: colors.panel, padding: "11px 12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, overflowWrap: "anywhere" }}>{event.eventName || "Rilis ekonomi AS"}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>{formatEventTime(event.scheduledAt)} WIB</div>
                  {event.periodLabel && <div style={{ fontSize: 10, color: colors.muted, marginTop: 3 }}>Periode: {event.periodLabel}</div>}
                </div>
                <span style={{ flexShrink: 0, borderRadius: 999, background: impact.bg, color: impact.color, padding: "4px 7px", fontSize: 9, fontWeight: 800 }}>{impact.label}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginTop: 11 }}>
                <div style={{ borderRadius: 8, padding: "8px 7px", background: colors.panelAlt, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: colors.muted, marginBottom: 4 }}>PREVIOUS</div>
                  <div style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{formatFigure(event.previous, event.previousSource ? "" : event.unit)}{event.previousSource && <FFTag />}</div>
                </div>
                <div style={{ borderRadius: 8, padding: "8px 7px", background: colors.panelAlt, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: colors.muted, marginBottom: 4 }}>FORECAST</div>
                  <div style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{formatFigure(event.forecast ?? event.consensus ?? event.estimate, event.forecastSource ? "" : event.unit)}{event.forecastSource && <FFTag />}</div>
                </div>
                <div style={{ borderRadius: 8, padding: "8px 7px", background: colors.panelAlt, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: colors.muted, marginBottom: 4 }}>ACTUAL {isReleased ? "· DIRILIS" : "· MENUNGGU"}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isReleased ? impact.color : colors.text, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{formatFigure(event.actual, event.actualSource ? "" : event.unit)}{event.actualSource && <FFTag />}</div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "12px 2px 0", fontSize: 9, color: colors.muted }}>
        <span>Data: <a href="https://xoomar.com/markets/api/calendar" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>XOOMAR</a> · jadwal sumber resmi AS</span>
        <span>{updatedAt ? `Diperbarui ${formatEventTime(updatedAt)}` : ""}</span>
      </div>
      <div style={{ fontSize: 9, color: colors.muted, lineHeight: 1.45, padding: "6px 2px 0" }}>Hanya High dan Medium Impact ditampilkan. Forecast dan Previous yang kosong dari XOOMAR dilengkapi dari Forex Factory bila tersedia (ditandai FF); Actual muncul setelah rilis. Nilai yang tidak tersedia ditandai —. {enrichment?.status === "unavailable" ? "Forex Factory sedang tidak tersedia, jadi Forecast bisa kosong. " : ""}Waktu ditampilkan dalam WIB dan jadwal dapat berubah mengikuti pengumuman lembaga resmi.</div>
    </div>
  );
}
