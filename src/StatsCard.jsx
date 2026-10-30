import React from "react";
import { ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot } from "recharts";
import { fmtMoney } from "./journalMath.js";
import { BLUE, mix, s, INNER_BG, INNER_BORDER, CardShell, CardHeader, HeaderBadge } from "./CardHeader.jsx";

// Tampilan kartu Statistik. Komponen ini HANYA menampilkan angka yang sudah dihitung di TradingJournal
// (stats + persentase harian/mingguan/bulanan/tahunan); tidak ada perhitungan baru.
// Warna teks/latar/garis memakai variabel tema supaya ikut tema terang/gelap seperti kartu lain.

function Svg({ size = 20, children, color = "currentColor", stroke = 2 }) {
  return (
    <svg width={size} height={size} style={{ display: "block" }} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function IconBadge({ bg, children }) {
  return (
    <span style={{ width: s(40, 22), height: s(40, 22), borderRadius: "50%", background: bg, color: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 2px 6px rgba(0,0,0,.22)", flex: "0 0 auto" }}>
      {children}
    </span>
  );
}

function MetricCard({ icon, bg, label, value, valueColor }) {
  // Susunan vertikal seperti kartu Risk Guard: ikon di atas, label di bawahnya, angka di paling bawah; semua rata tengah.
  return (
    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", borderRadius: s(14, 8), padding: `${s(12, 6)} ${s(10, 5)}`, background: INNER_BG, border: INNER_BORDER }}>
      <IconBadge bg={bg}>{icon}</IconBadge>
      <div style={{ fontSize: s(14, 8.5), color: "var(--muted)", lineHeight: 1.2, marginTop: s(8, 4), minWidth: 0, overflowWrap: "anywhere", textAlign: "center" }}>{label}</div>
      <div className="tj-mono" style={{ fontSize: "max(10px, min(30px, 5cqw))", letterSpacing: "-.03em", fontWeight: 800, color: valueColor || "var(--text)", marginTop: "auto", paddingTop: s(5, 3), whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", textAlign: "center" }}>{value}</div>
    </div>
  );
}

// Cincin winrate: busur hijau = porsi menang (mulai dari atas, searah jarum jam), sisanya merah (porsi kalah).
function WinRing({ winratePct, winrateText, winTrades, lossTrades }) {
  const size = 132; // koordinat viewBox; ukuran tampil diskalakan lewat CSS
  const stroke = 15;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const has = winratePct !== null && winratePct !== undefined;
  const frac = has ? Math.max(0, Math.min(100, winratePct)) / 100 : 0;
  const gid = `st-ring-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div role="img" aria-label={has ? `Winrate ${winrateText}, ${winTrades} menang ${lossTrades} kalah` : "Winrate belum tersedia"} style={{ position: "relative", width: s(170, 80), height: s(170, 80), flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "100%", transform: "rotate(-90deg)", filter: `drop-shadow(0 0 6px ${mix("var(--green)", 35)})` }} aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--green)" }} />
            <stop offset="100%" style={{ stopColor: "color-mix(in srgb, var(--green) 75%, #38D6F0)" }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={has ? "var(--red)" : "var(--border)"} strokeWidth={stroke} />
        {frac > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap={frac >= 1 ? "butt" : "round"} strokeDasharray={`${c * frac} ${c}`} />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.1 }}>
        <div style={{ fontSize: s(40, 18), fontWeight: 800, color: "var(--text)", letterSpacing: "-.02em" }}>{winrateText}</div>
        <div style={{ fontSize: s(17, 9), color: "var(--muted)", marginTop: s(3, 1) }}>winrate</div>
        <div className="tj-mono" style={{ fontSize: s(15, 8.5), fontWeight: 800, marginTop: s(4, 2), whiteSpace: "nowrap" }}>
          <span style={{ color: "var(--green)" }}>{winTrades}W</span>
          <span style={{ color: "var(--text)" }}> - </span>
          <span style={{ color: "var(--red)" }}>{lossTrades}L</span>
        </div>
      </div>
    </div>
  );
}

// ---- Grafik Profit vs Loss (kumulatif) ----
// Hanya menjumlahkan profit & loss yang sudah ada di setiap entri (urutan entri sama seperti grafik Pertumbuhan Saldo).
function shortDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

const pad2 = (n) => String(n).padStart(2, "0");

// Menyusun titik grafik kumulatif untuk periode terpilih.
// Harian: sumbu X = jam (00:00-24:00) memakai jam entri; Tahunan: satu titik per bulan; lainnya: satu titik per entri.
function buildSeries(period, list) {
  const src = list || [];
  let p = 0;
  let l = 0;
  const r2 = (n) => Math.round(n * 100) / 100;
  if (period === "Tahunan") {
    const pts = [{ x: 0, profit: 0, loss: 0, label: "Start" }];
    src.forEach((mo, i) => {
      p += Number(mo.profit) || 0;
      l += Number(mo.loss) || 0;
      pts.push({ x: i + 1, profit: r2(p), loss: r2(l), label: mo.fullLabel || mo.label || `#${i + 1}` });
    });
    return { pts, kind: "index", empty: src.length === 0 };
  }
  const sorted = period === "Bulanan" ? src : [...src].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (period === "Harian") {
    const pts = [{ x: 0, profit: 0, loss: 0, label: "00:00" }];
    sorted.forEach((r) => {
      const d = new Date(r.date);
      p += Number(r.profit) || 0;
      l += Number(r.loss) || 0;
      pts.push({ x: d.getHours() + d.getMinutes() / 60, profit: r2(p), loss: r2(l), label: `${pad2(d.getHours())}:${pad2(d.getMinutes())}` });
    });
    pts.push({ x: 24, profit: r2(p), loss: r2(l), label: "24:00" });
    return { pts, kind: "hour", empty: src.length === 0 };
  }
  const pts = [{ x: 0, profit: 0, loss: 0, label: "Start" }];
  sorted.forEach((r, i) => {
    p += Number(r.profit) || 0;
    l += Number(r.loss) || 0;
    pts.push({ x: i + 1, profit: r2(p), loss: r2(l), label: shortDate(r.date) || `#${i + 1}` });
  });
  return { pts, kind: "index", empty: src.length === 0 };
}

// Maksimal 5 label sumbu-X, tersebar rata dan selalu memuat titik awal & akhir.
function pickTicks(n) {
  if (n <= 4) return Array.from({ length: n + 1 }, (_, i) => i);
  const set = new Set([0, n]);
  for (let k = 1; k < 4; k++) set.add(Math.round((n * k) / 4));
  return [...set].sort((a, b) => a - b);
}

const moneyTick = (v) => (Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`);

// Titik akhir profit + lencana nilai total (mis. $30.52) di atasnya, rata kanan agar tidak terpotong.
function EndMarker({ cx, cy, text }) {
  if (cx == null || cy == null) return null;
  const w = text.length * 7.4 + 18;
  const h = 22;
  const bx = cx - w + 12;
  const by = cy - h - 12;
  return (
    <g>
      <rect x={bx} y={by} width={w} height={h} rx={7} style={{ fill: "color-mix(in srgb, var(--green) 18%, var(--surface))", stroke: "var(--green)", strokeWidth: 1.2 }} />
      <text x={bx + w / 2} y={by + h / 2} textAnchor="middle" dominantBaseline="central" style={{ fill: "var(--green)", fontSize: 12, fontWeight: 800 }}>{text}</text>
      <circle cx={cx} cy={cy} r={6.5} style={{ fill: "var(--green)", stroke: "#FFFFFF", strokeWidth: 2 }} />
    </g>
  );
}

const CHART_OPTIONS = [
  { id: "area", label: "Area" },
  { id: "combo", label: "Garis + Batang" },
];

// Menu titik 3: memilih jenis grafik. Hanya mengganti tampilan; data yang dipakai sama.
function ChartMenu({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const size = s(28, 22);
  return (
    <div ref={ref} style={{ position: "absolute", top: s(7, 3), left: s(6, 3), zIndex: 30 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Pilih jenis grafik"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: `1px solid ${open ? "var(--gold)" : mix(BLUE, 45)}`, background: open ? mix("var(--gold)", 16) : INNER_BG, color: open ? "var(--gold)" : "var(--muted)", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
      >
        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="5" cy="12" r="2.2" /><circle cx="12" cy="12" r="2.2" /><circle cx="19" cy="12" r="2.2" /></svg>
      </button>
      {open && (
        <div role="menu" style={{ position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 30, minWidth: 170, background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)", borderRadius: 9, padding: 4, boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 10px 4px" }}>Tampilan grafik</div>
          {CHART_OPTIONS.map((o) => {
            const on = o.id === value;
            return (
              <button key={o.id} type="button" role="menuitemradio" aria-checked={on} onClick={() => { onChange(o.id); setOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", background: on ? "rgba(237,165,36,0.1)" : "none", border: "none", borderRadius: 6, color: on ? "var(--gold)" : "var(--text)", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                {o.label}
                {on && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Data untuk grafik "Garis + Batang": batang = profit & loss per titik (selisih dari titik sebelumnya),
// garis = profit kumulatif. Titik awal buatan (Start / 00:00 / 24:00) dibuang agar batang tepat di tengah label.
function buildComboData(pts, kind) {
  const r2 = (n) => Math.round(n * 100) / 100;
  const core = kind === "hour" ? pts.slice(1, -1) : pts.slice(1);
  let pp = 0;
  let pl = 0;
  return core.map((d, i) => {
    const row = { k: i, label: d.label, cum: d.profit, dProfit: Math.max(0, r2(d.profit - pp)), dLoss: Math.max(0, r2(d.loss - pl)) };
    pp = d.profit;
    pl = d.loss;
    return row;
  });
}

function ProfitLossChart({ period, list, variant = "area" }) {
  const gid = `st-area-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { pts: data, kind, empty } = buildSeries(period, list);
  const last = data[data.length - 1];
  const totalProfit = last.profit;
  const isHour = kind === "hour";
  const ticks = isHour ? [0, 4, 8, 12, 16, 20, 24] : pickTicks(last.x);
  const labelOf = isHour ? (x) => `${pad2(x)}:00` : (x) => (data[x] ? data[x].label : "");
  const grid = mix(BLUE, 35);
  if (empty) {
    return (
      <div style={{ marginTop: s(14, 7), height: 230, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: s(14, 9.5), color: "var(--muted)" }}>
        Belum ada entri pada periode {period.toLowerCase()} ini.
      </div>
    );
  }
  if (variant === "combo") {
    const cd = buildComboData(data, kind);
    if (cd.length > 0) {
      const lastRow = cd[cd.length - 1];
      const axis = { stroke: mix(BLUE, 70) };
      return (
        <div style={{ marginTop: s(14, 7) }}>
          <div role="img" aria-label={`Grafik garis dan batang ${period.toLowerCase()}. Total profit ${fmtMoney(totalProfit)}.`}>
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={cd} margin={{ top: 32, right: 14, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`${gid}-c`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: "var(--green)", stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: "var(--green)", stopOpacity: 0.03 }} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={grid} strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="k" type="category" interval="preserveStartEnd" minTickGap={6} tickFormatter={(k) => (cd[k] ? cd[k].label : "")} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={axis} tickLine={axis} />
                <YAxis type="number" domain={[0, "auto"]} tickFormatter={moneyTick} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={axis} tickLine={axis} width={44} />
                <Tooltip
                  cursor={{ fill: mix(BLUE, 12) }}
                  contentStyle={{ background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "var(--muted)", fontSize: 11 }}
                  formatter={(v, name) => [fmtMoney(Number(v)), name]}
                  labelFormatter={(k) => (cd[k] ? cd[k].label : "")}
                />
                <Bar dataKey="dProfit" name="Profit" fill="var(--green)" fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
                <Bar dataKey="dLoss" name="Loss" fill="var(--red)" fillOpacity={0.9} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
                <Area type="monotone" dataKey="cum" name="Total Profit" stroke="var(--green)" strokeWidth={2.6} fill={`url(#${gid}-c)`} dot={{ r: 4, fill: "#FFFFFF", stroke: "var(--green)", strokeWidth: 1 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                <ReferenceDot x={lastRow.k} y={lastRow.cum} ifOverflow="visible" shape={<EndMarker text={fmtMoney(totalProfit)} />} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: s(22, 12), marginTop: s(4, 2), fontSize: s(15, 9.5), color: "var(--muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: s(7, 4) }}><span style={{ width: s(14, 9), height: s(14, 9), borderRadius: "50%", background: "var(--green)" }} />Profit</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: s(7, 4) }}><span style={{ width: s(14, 9), height: s(14, 9), borderRadius: "50%", background: "var(--red)" }} />Loss</span>
          </div>
        </div>
      );
    }
  }
  return (
    <div style={{ marginTop: s(14, 7) }}>
      <div role="img" aria-label={`Grafik profit dan loss kumulatif ${period.toLowerCase()}. Total profit ${fmtMoney(totalProfit)}.`}>
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={data} margin={{ top: 32, right: 14, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--green)", stopOpacity: 0.55 }} />
                <stop offset="100%" style={{ stopColor: "var(--green)", stopOpacity: 0.04 }} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={grid} strokeDasharray="3 4" />
            <XAxis dataKey="x" type="number" domain={[0, last.x]} ticks={ticks} tickFormatter={labelOf} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={{ stroke: mix(BLUE, 70) }} tickLine={{ stroke: mix(BLUE, 70) }} />
            <YAxis type="number" domain={[0, "auto"]} tickFormatter={moneyTick} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={{ stroke: mix(BLUE, 70) }} tickLine={{ stroke: mix(BLUE, 70) }} width={44} />
            <Tooltip
              contentStyle={{ background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--muted)", fontSize: 11 }}
              formatter={(v, name) => [fmtMoney(Number(v)), name]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
            />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="var(--green)" strokeWidth={2.2} fill={`url(#${gid})`} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="loss" name="Loss" stroke="var(--red)" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            <ReferenceDot x={last.x} y={last.profit} ifOverflow="visible" shape={<EndMarker text={fmtMoney(totalProfit)} />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: s(22, 12), marginTop: s(4, 2), fontSize: s(15, 9.5), color: "var(--muted)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: s(7, 4) }}><span style={{ width: s(14, 9), height: s(14, 9), borderRadius: "50%", background: "var(--green)" }} />Profit</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: s(7, 4) }}><span style={{ width: s(14, 9), height: s(14, 9), borderRadius: "50%", background: "var(--red)" }} />Loss</span>
      </div>
    </div>
  );
}

export default function StatsCard({ stats, growth, periodRows = {} }) {
  const [period, setPeriod] = React.useState("Bulanan"); // grafik default = bulan aktif (sama seperti sebelumnya)
  const [chartType, setChartType] = React.useState("area"); // jenis grafik: "area" (bawaan) atau "combo" (garis + batang)
  const winrateText = stats.winrate === null ? "—" : `${(stats.winrate * 100).toFixed(0)}%`;
  const winratePct = stats.winrate === null ? null : stats.winrate * 100;
  const lossText = stats.totalLoss > 0 ? `-${fmtMoney(stats.totalLoss)}` : fmtMoney(0);
  const rrText = stats.rr === null ? "—" : `${stats.rr.toFixed(2)}x`;
  const pctColor = (p) => (p === null ? "var(--muted)" : p >= 0 ? "var(--green)" : "var(--red)");
  const pctText = (p) => (p === null ? "—" : `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`);

  return (
    <CardShell ariaLabel="Statistik">
        <CardHeader
          icon={
            <Svg size="52%" stroke={0}>
              <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" />
              <rect x="10" y="7" width="4" height="13" rx="1" fill="currentColor" />
              <rect x="16" y="3" width="4" height="17" rx="1" fill="currentColor" />
            </Svg>
          }
          title="Statistik"
          subtitle="Ringkasan performa trading Anda."
          badge={<HeaderBadge icon={<Svg size={s(18, 10)} stroke={2.4}><path d="m3 17 6-6 4 4 8-8M15 7h6v6" /></Svg>} label="PERFORMA" />}
        />

        {/* Body: cincin winrate + 4 kartu angka */}
        <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", justifyContent: "center", gap: s(12, 5) }}>
          <WinRing winratePct={winratePct} winrateText={winrateText} winTrades={stats.winTrades} lossTrades={stats.lossTrades} />
          <div style={{ flex: "1 1 0", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: s(10, 4) }}>
            <MetricCard
              bg="linear-gradient(135deg,#19D39A,#0EA574)"
              icon={<Svg size="55%" stroke={2.4}><path d="m3 17 6-6 4 4 8-8M15 7h6v6" /></Svg>}
              label="Total Profit"
              value={fmtMoney(stats.totalProfit)}
            />
            <MetricCard
              bg="linear-gradient(135deg,#FF4A5E,#D12038)"
              icon={<Svg size="55%" stroke={2.4}><path d="m3 7 6 6 4-4 8 8M15 17h6v-6" /></Svg>}
              label="Total Loss"
              value={lossText}
              valueColor={stats.totalLoss > 0 ? "var(--red)" : undefined}
            />
            <MetricCard
              bg="linear-gradient(135deg,#7A6BF5,#5340D6)"
              icon={<Svg size="55%" stroke={2.4}><circle cx="7.5" cy="7.5" r="2.2" /><circle cx="16.5" cy="16.5" r="2.2" /><path d="M18 5.5 6 18.5" /></Svg>}
              label="Komisi"
              value={fmtMoney(stats.totalKomisi)}
            />
            <MetricCard
              bg="linear-gradient(135deg,#2A8CFF,#1560D6)"
              icon={<Svg size="55%" stroke={2.2}><path d="M4 9h13l-3-3M20 15H7l3 3" /></Svg>}
              label="RR (Risk Reward)"
              value={rrText}
            />
          </div>
        </div>

        {/* Satu kartu dalam: tombol periode + grafik profit & loss */}
        <div style={{ marginTop: s(14, 7), borderRadius: s(20, 12), padding: s(10, 5), background: INNER_BG, border: INNER_BORDER }}>

        {/* Persentase harian / mingguan / bulanan / tahunan */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", borderRadius: s(14, 8), padding: `${s(4, 2)} ${s(3, 2)}`, background: "transparent", border: INNER_BORDER }}>
          {growth.map(([label, pct]) => {
            const active = label === period;
            return (
              <div key={label} style={{ textAlign: "center", minWidth: 0, padding: `0 ${s(4, 2)}` }}>
                <button
                  type="button"
                  onClick={() => setPeriod(label)}
                  aria-pressed={active}
                  aria-label={`Tampilkan grafik ${label.toLowerCase()}`}
                  style={{ width: "100%", minWidth: 0, display: "block", padding: `${s(5, 3)} ${s(2, 1)}`, border: active ? "1.5px solid var(--gold)" : "1.5px solid transparent", borderRadius: s(10, 6), background: active ? mix("var(--gold)", 16) : "transparent", boxShadow: active ? `0 0 8px ${mix("var(--gold)", 30)}` : "none", fontFamily: "inherit", cursor: "pointer", textAlign: "center" }}
                >
                  <div style={{ fontSize: s(13, 7.5), color: active ? "var(--gold)" : "var(--muted)", fontWeight: active ? 700 : 400, textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</div>
                  <div className="tj-mono" style={{ fontSize: s(21, 9.5), fontWeight: 800, color: pctColor(pct), marginTop: s(3, 2), whiteSpace: "nowrap", letterSpacing: "-.03em" }}>{pctText(pct)}</div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Grafik profit & loss kumulatif untuk periode yang dipilih (tap Harian / Mingguan / Bulanan / Tahunan) */}
        {Object.values(periodRows).some((l) => l && l.length > 0) && (
          <div style={{ position: "relative", display: "flow-root" }}>
            <ChartMenu value={chartType} onChange={setChartType} />
            <ProfitLossChart period={period} list={periodRows[period]} variant={chartType} />
          </div>
        )}
        </div>
    </CardShell>
  );
}
