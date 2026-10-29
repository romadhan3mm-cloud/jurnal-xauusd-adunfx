import React from "react";
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
  return (
    <div style={{ minWidth: 0, borderRadius: s(14, 8), padding: `${s(10, 5)} ${s(12, 6)}`, background: INNER_BG, border: INNER_BORDER }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: s(9, 4) }}>
        <IconBadge bg={bg}>{icon}</IconBadge>
        <span style={{ fontSize: s(14, 8.5), color: "var(--muted)", lineHeight: 1.15, minWidth: 0, overflowWrap: "anywhere", textAlign: "center" }}>{label}</span>
      </div>
      <div className="tj-mono" style={{ fontSize: "max(10px, min(30px, 5cqw))", letterSpacing: "-.03em", fontWeight: 800, color: valueColor || "var(--text)", marginTop: s(6, 3), whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", textAlign: "center" }}>{value}</div>
    </div>
  );
}

// Cincin winrate: busur emas = porsi menang (mulai dari atas, searah jarum jam), sisanya biru.
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
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "100%", transform: "rotate(-90deg)", filter: `drop-shadow(0 0 6px ${mix("var(--gold)", 35)})` }} aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--gold)" }} />
            <stop offset="100%" style={{ stopColor: "color-mix(in srgb, var(--gold) 70%, #FFD23F)" }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={has ? BLUE : "var(--border)"} strokeWidth={stroke} />
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

export default function StatsCard({ stats, growth }) {
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

        {/* Persentase harian / mingguan / bulanan / tahunan */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginTop: s(14, 7), borderRadius: s(14, 8), padding: `${s(12, 6)} 0`, background: INNER_BG, border: INNER_BORDER }}>
          {growth.map(([label, pct], i) => (
            <div key={label} style={{ textAlign: "center", minWidth: 0, padding: `0 ${s(4, 2)}`, borderLeft: i === 0 ? "none" : `1px solid ${mix(BLUE, 45)}` }}>
              <div style={{ fontSize: s(13, 7.5), color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</div>
              <div className="tj-mono" style={{ fontSize: s(21, 9.5), fontWeight: 800, color: pctColor(pct), marginTop: s(3, 2), whiteSpace: "nowrap", letterSpacing: "-.03em" }}>{pctText(pct)}</div>
            </div>
          ))}
        </div>
    </CardShell>
  );
}
