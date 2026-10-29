import React from "react";
import { fmtMoney } from "./journalMath.js";

// Tampilan Risk Guard. Komponen ini HANYA menampilkan data dari computeDailyRiskGuard; tidak ada perhitungan baru.
// Semua warna memakai variabel tema (--surface-soft, --border, --text, --muted, --green, --gold, --red, ...)
// sehingga kartu ikut berganti saat tema terang/gelap diganti, sama seperti kartu lain.

const mix = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

const TONES = {
  safe: { main: "var(--green)", from: "var(--green)", to: "color-mix(in srgb, var(--green) 65%, #38D6F0)", glow: mix("var(--green)", 40), label: "AMAN" },
  warning: { main: "var(--gold)", from: "var(--gold)", to: "color-mix(in srgb, var(--gold) 65%, #FFE08A)", glow: mix("var(--gold)", 40), label: "WASPADA" },
  limit: { main: "var(--red)", from: "var(--red)", to: "color-mix(in srgb, var(--red) 65%, #FF9A8A)", glow: mix("var(--red)", 40), label: "BATAS TERCAPAI" },
  unavailable: { main: "var(--muted)", from: "var(--muted)", to: "color-mix(in srgb, var(--muted) 65%, #9CC0F0)", glow: mix("var(--muted)", 30), label: "BELUM ADA MODAL" },
};

// Skala proporsional: ukuran mengikuti lebar kartu (container query unit `cqw`),
// acuan desain 560px. Tidak pernah lebih besar dari ukuran acuan, dan tidak lebih kecil dari `min`.
const s = (px, min) => {
  const v = `min(${px}px, ${((px / 560) * 100).toFixed(2)}cqw)`;
  return min ? `max(${min}px, ${v})` : v;
};

// Latar kotak dalam: sama-sama tipis (transparan) seperti kartu lain.
const INNER_BG = mix("var(--surface-raised)", 55);

function Svg({ size = 20, children, color = "currentColor", stroke = 2 }) {
  return (
    <svg width={size} height={size} style={{ display: "block" }} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function ShieldIcon({ status, size = s(40, 22) }) {
  const tone = TONES[status] || TONES.safe;
  return (
    <span style={{ display: "inline-flex", width: size, height: size, filter: `drop-shadow(0 0 6px ${tone.glow})`, color: tone.main, flex: "0 0 auto" }}>
      <Svg size="100%" stroke={1.8}>
        <path d="M12 2.5 4.5 5.6v5.7c0 4.6 3.1 8.5 7.5 10.2 4.4-1.7 7.5-5.6 7.5-10.2V5.6L12 2.5Z" style={{ fill: "color-mix(in srgb, currentColor 12%, transparent)" }} />
        {status === "limit" ? <path d="M12 8v5M12 16.2v.1" /> : status === "warning" ? <path d="M12 8v5M12 16.2v.1" /> : <path d="m8.6 12.2 2.4 2.4 4.4-4.8" />}
      </Svg>
    </span>
  );
}

function IconBadge({ bg, children }) {
  return (
    <span style={{ width: s(44, 24), height: s(44, 24), borderRadius: "50%", background: bg, color: "#EAF6FF", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 2px 6px rgba(0,0,0,.22)", flex: "0 0 auto" }}>
      {children}
    </span>
  );
}

// Isi tiga kartu angka dipusatkan: ikon, label, dan nilai.
function StatCard({ icon, bg, label, value, valueColor }) {
  return (
    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", borderRadius: s(14, 8), padding: `${s(12, 6)} ${s(9, 4)}`, background: INNER_BG, border: "1px solid var(--border-inner)" }}>
      <IconBadge bg={bg}>{icon}</IconBadge>
      <div style={{ fontSize: s(13, 8.5), lineHeight: 1.2, color: "var(--muted)", marginTop: s(9, 4), minHeight: "2.4em", overflowWrap: "anywhere", textAlign: "center" }}>{label}</div>
      <div className="tj-mono" style={{ fontSize: "max(9px, min(24px, 3.3cqw))", letterSpacing: "-.03em", fontWeight: 800, color: valueColor || "var(--text)", marginTop: s(3, 2), whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", textAlign: "center" }}>{value}</div>
    </div>
  );
}

function Ring({ riskGuard, tone }) {
  const size = 132; // koordinat viewBox; ukuran tampil diskalakan lewat CSS
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const hasLimit = riskGuard.limit > 0;
  const used = hasLimit ? Math.min(100, Math.max(0, riskGuard.usedPct)) : 0;
  const remainingFrac = hasLimit ? 1 - used / 100 : 0; // cincin menunjukkan sisa batas
  const shown = hasLimit ? `${Math.min(999, riskGuard.usedPct).toFixed(0)}%` : "—";
  const gid = `rg-ring-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div role="img" aria-label={hasLimit ? `${shown} dari batas rugi harian terpakai` : "Batas rugi harian belum tersedia"} style={{ position: "relative", width: s(140, 64), height: s(140, 64), flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: INNER_BG, border: "1px solid var(--border-inner)" }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "86%", height: "86%", transform: "rotate(-90deg)", filter: `drop-shadow(0 0 5px ${tone.glow})` }} aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: tone.from }} />
            <stop offset="100%" style={{ stopColor: tone.to }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: "var(--border)" }} strokeWidth={stroke} />
        {remainingFrac > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * remainingFrac} ${c}`} style={{ transition: "stroke-dasharray .4s ease" }} />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: s(30, 15), fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{shown}</div>
        <div style={{ fontSize: s(12.5, 8.5), color: "var(--muted)", marginTop: s(4, 2) }}>terpakai</div>
      </div>
    </div>
  );
}

export default function RiskGuardCard({ riskGuard }) {
  const status = riskGuard.status;
  const tone = TONES[status] || TONES.safe;
  const hasLimit = riskGuard.limit > 0;
  const used = hasLimit ? Math.min(100, Math.max(0, riskGuard.usedPct)) : 0;
  const pnlPositive = riskGuard.netPnl >= 0;
  const pnlText = `${pnlPositive ? "+" : "−"}${fmtMoney(Math.abs(riskGuard.netPnl)).slice(1)}`;
  const pnlColor = pnlPositive ? "var(--green)" : "var(--red)";

  return (
    <div style={{ containerType: "inline-size", marginBottom: 16 }}>
    <section
      aria-label="Risk Guard"
      style={{ position: "relative", borderRadius: s(20, 12), overflow: "hidden", padding: s(16, 8), color: "var(--text)", background: "var(--surface-soft)", border: `1.5px solid ${status === "limit" ? "var(--red)" : status === "warning" ? "var(--gold)" : status === "safe" ? "var(--green)" : "var(--border)"}` }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: s(10, 5), paddingBottom: s(12, 6), marginBottom: s(14, 7), borderBottom: "1px solid var(--border)" }}>
        <ShieldIcon status={status} />
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <div style={{ fontSize: s(22, 13), fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>Risk Guard</div>
          <div style={{ fontSize: s(11.5, 8), color: "var(--muted)", marginTop: 3, lineHeight: 1.25 }}>Kelola Risiko. Lindungi Modal. Konsisten di Pasar.</div>
        </div>
        <span style={{ flex: "0 0 auto", marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: s(8, 4), borderRadius: 999, padding: `${s(7, 3)} ${s(14, 7)}`, fontSize: s(13, 8.5), fontWeight: 800, letterSpacing: ".04em", whiteSpace: "nowrap", color: tone.main, background: mix(tone.main, 15), border: `1.5px solid ${tone.main}` }}>
          <span style={{ width: s(10, 6), height: s(10, 6), borderRadius: "50%", background: tone.main, boxShadow: `0 0 6px ${tone.glow}` }} />
          {tone.label}
        </span>
      </div>

      {/* Body: cincin + kartu angka */}
      <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", justifyContent: "center", gap: s(14, 6) }}>
        <Ring riskGuard={riskGuard} tone={tone} />
        <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: s(10, 5) }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: s(8, 4) }}>
            <StatCard
              bg="linear-gradient(135deg,#2A7BFF,#1747B8)"
              icon={<Svg size="55%"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" stroke="#EAF6FF" strokeWidth="2.4" /></Svg>}
              label="Batas rugi harian"
              value={hasLimit ? fmtMoney(riskGuard.limit) : "—"}
            />
            <StatCard
              bg="linear-gradient(135deg,#2FB5A5,#16756F)"
              icon={<Svg size="55%"><path d="M12 2.8 5 5.6v5.4c0 4.3 2.9 8 7 9.6 4.1-1.6 7-5.3 7-9.6V5.6L12 2.8Z" /><path d="m9.6 9.6 4.8 4.8M14.4 9.6l-4.8 4.8" /></Svg>}
              label="Kerugian bersih tercatat"
              value={riskGuard.lossUsed > 0 ? `-${fmtMoney(riskGuard.lossUsed).slice(1)}` : fmtMoney(0)}
              valueColor={riskGuard.lossUsed > 0 ? "var(--red)" : undefined}
            />
            <StatCard
              bg="linear-gradient(135deg,#5A6CF0,#3446C2)"
              icon={<Svg size="55%"><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></Svg>}
              label="Sisa batas"
              value={hasLimit ? fmtMoney(riskGuard.remaining) : "—"}
              valueColor={status === "limit" ? "var(--red)" : undefined}
            />
          </div>

          {/* P/L hari ini */}
          <div style={{ borderRadius: s(14, 8), padding: `${s(10, 5)} ${s(12, 6)}`, background: INNER_BG, border: "1px solid var(--border-inner)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: s(8, 4), fontSize: s(12.5, 8.5), color: "var(--muted)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: s(8, 4), minWidth: 0 }}>
                <span style={{ width: s(26, 16), height: s(26, 16), borderRadius: "50%", background: mix(pnlColor, 16), color: pnlColor, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
                  <Svg size="65%">{pnlPositive ? <path d="m3 17 6-6 4 4 8-8M15 7h6v6" /> : <path d="m3 7 6 6 4-4 8 8M15 17h6v-6" />}</Svg>
                </span>
                {riskGuard.tradeDaysLogged ? (
                  <span>P/L hari ini: <b className="tj-mono" style={{ color: pnlColor, fontSize: s(14, 9.5) }}>{pnlText}</b></span>
                ) : (
                  <span>Belum ada P/L tercatat hari ini</span>
                )}
              </span>
              <span className="tj-mono" style={{ flex: "0 0 auto", whiteSpace: "nowrap", fontSize: s(12, 8) }}>{hasLimit ? `${Math.min(999, riskGuard.usedPct).toFixed(0)}% terpakai` : "—"}</span>
            </div>
            <div style={{ height: s(10, 6), borderRadius: 999, overflow: "hidden", background: "var(--border)", marginTop: s(9, 5) }}>
              <div style={{ height: "100%", width: `${used}%`, borderRadius: 999, background: `linear-gradient(90deg, ${tone.from}, ${tone.to})`, transition: "width .3s ease" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Catatan */}
      <div style={{ display: "flex", alignItems: "center", gap: s(12, 6), marginTop: s(14, 7), borderRadius: s(14, 8), padding: `${s(10, 5)} ${s(12, 6)}`, background: INNER_BG, border: "1px solid var(--border-inner)" }}>
        <span style={{ flex: "0 0 auto", width: s(30, 18), height: s(30, 18), borderRadius: "50%", border: "2px solid #3AA0E0", color: "#3AA0E0", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Svg size="60%" stroke={2.4}><path d="M12 11v6M12 7.2v.1" /></Svg>
        </span>
        <div style={{ fontSize: s(11.5, 8), lineHeight: 1.4, color: "var(--muted)", minWidth: 0 }}>
          Menghitung profit, loss, dan komisi yang tercatat hari ini. Penarikan tidak dihitung sebagai kerugian trading. Floating P/L broker belum termasuk.
        </div>
      </div>
    </section>
    </div>
  );
}
