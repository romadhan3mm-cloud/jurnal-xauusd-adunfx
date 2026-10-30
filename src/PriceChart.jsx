import React, { useCallback, useEffect, useRef, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Chart harga XAUUSD sederhana (garis/area, gaya sama seperti chart lain di aplikasi).
// Data diambil dari Worker (/api/ai-news/price) yang meneruskan data Yahoo Finance tanpa API key.
// Sumber ini tidak resmi dan bisa tertunda; bukan untuk eksekusi order.

const API = "/api/ai-news/price";
const REFRESH_MS = 30000;
const FRAMES = [
  { label: "5M", interval: "5m", range: "1d", hint: "1 hari" },
  { label: "15M", interval: "15m", range: "5d", hint: "5 hari" },
  { label: "1J", interval: "60m", range: "1mo", hint: "1 bulan" },
  { label: "1H", interval: "1d", range: "6mo", hint: "6 bulan" },
];

const pad2 = (n) => String(n).padStart(2, "0");
const money = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function labelFor(tsSec, interval) {
  const d = new Date(tsSec * 1000);
  if (interval === "1d") return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  if (interval === "60m") return `${d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function pickTicks(n) {
  if (n <= 4) return Array.from({ length: n + 1 }, (_, i) => i);
  const set = new Set([0, n]);
  for (let k = 1; k < 4; k++) set.add(Math.round((n * k) / 4));
  return [...set].sort((a, b) => a - b);
}

export default function PriceChart({ colors, isLight }) {
  const [frame, setFrame] = useState(FRAMES[0]);
  const [state, setState] = useState({ status: "loading", data: null, error: "" });
  const reqId = useRef(0);

  const load = useCallback(async (f, silent) => {
    const id = ++reqId.current;
    if (!silent) setState((prev) => ({ status: "loading", data: prev.data && prev.data.interval === f.interval ? prev.data : null, error: "" }));
    try {
      const res = await fetch(`${API}?interval=${f.interval}&range=${f.range}`, { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body || !Array.isArray(body.points)) throw new Error(body?.error || `Gagal memuat harga (HTTP ${res.status})`);
      if (id === reqId.current) setState({ status: "ok", data: body, error: "" });
    } catch (e) {
      if (id !== reqId.current) return;
      // Saat refresh otomatis gagal, tetap tampilkan data terakhir.
      setState((prev) => (silent && prev.data ? prev : { status: "error", data: null, error: String(e?.message || e) }));
    }
  }, []);

  useEffect(() => {
    load(frame, false);
    const timer = setInterval(() => { if (document.visibilityState === "visible") load(frame, true); }, REFRESH_MS);
    const onVisible = () => { if (document.visibilityState === "visible") load(frame, true); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); reqId.current++; };
  }, [frame, load]);

  const { status, data, error } = state;
  const points = data ? data.points.map(([t, c], i) => ({ x: i, price: c, label: labelFor(t, data.interval) })) : [];
  const first = points.length ? points[0].price : null;
  const last = points.length ? points[points.length - 1].price : null;
  const change = first !== null ? last - first : 0;
  const changePct = first ? (change / first) * 100 : 0;
  const up = change >= 0;
  const lineColor = up ? "#19D39A" : "#FF4A5E";
  const prices = points.map((p) => p.price);
  const lo = prices.length ? Math.min(...prices) : 0;
  const hi = prices.length ? Math.max(...prices) : 0;
  const padY = Math.max((hi - lo) * 0.12, 0.5);
  const gid = `pc-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const grid = isLight ? "#DCE5F0" : "#263D5D";

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: colors.panel, border: `1px solid ${colors.border}`, boxShadow: "0 5px 18px rgba(0,0,0,.07)" }}>
      <div style={{ padding: "12px 12px 4px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.3 }}>XAU/USD</div>
            <div style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Emas · {data?.symbol === "GC=F" ? "Futures (GC=F)" : "Spot"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="tj-mono" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.1 }}>{last !== null ? money(last) : "—"}</div>
            {last !== null && (
              <div className="tj-mono" style={{ fontSize: 12, fontWeight: 700, color: lineColor, marginTop: 3 }}>
                {up ? "+" : "-"}{money(Math.abs(change))} ({up ? "+" : "-"}{Math.abs(changePct).toFixed(2)}%)
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {FRAMES.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFrame(f)}
              aria-pressed={frame.label === f.label}
              style={{ minWidth: 34, padding: "6px 9px", border: "none", borderRadius: 7, background: frame.label === f.label ? (isLight ? "#18395F" : "#E8F1FF") : "transparent", color: frame.label === f.label ? (isLight ? "#FFFFFF" : "#10213B") : colors.muted, fontSize: 12, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
            >
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", color: colors.muted, fontSize: 10 }}>{frame.hint}</span>
        </div>
      </div>

      <div style={{ height: 300, padding: "6px 4px 0 0", position: "relative" }}>
        {status === "error" && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center", padding: "0 24px", color: colors.muted, fontSize: 12, lineHeight: 1.5 }}>
            <div>{error || "Harga belum bisa dimuat."}</div>
            <button type="button" onClick={() => load(frame, false)} style={{ padding: "7px 16px", borderRadius: 999, border: "1.5px solid var(--gold, #EDA524)", background: "transparent", color: "var(--gold, #EDA524)", fontSize: 12, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>Coba lagi</button>
          </div>
        )}
        {status === "loading" && !data && (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: colors.muted, fontSize: 12 }}>Memuat harga…</div>
        )}
        {data && points.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={grid} strokeDasharray="3 4" />
              <XAxis dataKey="x" type="number" domain={[0, points.length - 1]} ticks={pickTicks(points.length - 1)} tickFormatter={(x) => points[x]?.label || ""} tick={{ fill: colors.muted, fontSize: 10 }} axisLine={{ stroke: grid }} tickLine={false} interval="preserveStartEnd" />
              <YAxis orientation="right" type="number" domain={[lo - padY, hi + padY]} tickFormatter={(v) => v.toFixed(0)} tick={{ fill: colors.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={44} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: colors.panelAlt, border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: colors.muted, fontSize: 11 }}
                itemStyle={{ color: lineColor }}
                formatter={(v) => [money(v), "Harga"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
              />
              <Area type="monotone" dataKey="price" stroke={lineColor} strokeWidth={2} fill={`url(#${gid})`} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "9px 12px", borderTop: `1px solid ${colors.border}`, color: colors.muted, fontSize: 9, fontWeight: 600 }}>
        <span>Zona waktu: perangkat · refresh 30 dtk</span>
        <span>Yahoo Finance (bisa tertunda)</span>
      </div>
    </div>
  );
}
