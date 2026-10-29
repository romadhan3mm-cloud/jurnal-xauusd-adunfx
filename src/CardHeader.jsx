import React from "react";

// Standar kartu berjudul TraderLogs. Gaya diambil persis dari kartu Statistik:
// kartu luar (garis --border 1px, latar --surface-soft), kepala (ikon bulat, judul,
// subjudul, lencana kanan) dan garis pembatas judul biru. Dipakai oleh Statistik,
// Perbandingan Antar Bulan, dan Input Transaksi. Hanya tampilan.
export const BLUE = "#2A7BFF";
export const mix = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

// Skala proporsional: ukuran mengikuti lebar kartu (container query unit `cqw`), acuan desain 560px.
export const s = (px, min) => {
  const v = `min(${px}px, ${((px / 560) * 100).toFixed(2)}cqw)`;
  return min ? `max(${min}px, ${v})` : v;
};

export const INNER_BG = mix("var(--surface-raised)", 55);
export const INNER_BORDER = `1px solid ${mix(BLUE, 45)}`;
export const INNER_LINE = INNER_BORDER;

export function CardShell({ ariaLabel, children, marginBottom = 20 }) {
  return (
    <div style={{ containerType: "inline-size", marginBottom }}>
      <section
        aria-label={ariaLabel}
        style={{ position: "relative", borderRadius: s(20, 12), overflow: "hidden", padding: s(16, 8), color: "var(--text)", background: "var(--surface-soft)", border: "1px solid var(--border)" }}
      >
        {children}
      </section>
    </div>
  );
}

// divider=false: kepala tanpa garis pembatas dan tanpa jarak bawah (dipakai saat kartu terlipat).
export function CardHeader({ icon, title, subtitle, badge, divider = true }) {
  return (
    <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: s(10, 5), ...(divider ? { paddingBottom: s(12, 6), marginBottom: s(14, 7), borderBottom: `1px solid ${mix(BLUE, 55)}` } : {}) }}>
      <span style={{ width: s(46, 24), height: s(46, 24), borderRadius: "50%", flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text)", background: mix(BLUE, 14), border: `1.5px solid ${mix(BLUE, 60)}` }}>
        {icon}
      </span>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <div style={{ fontSize: s(24, 13), fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: s(13, 8), color: "var(--muted)", marginTop: 3, lineHeight: 1.25 }}>{subtitle}</div>
      </div>
      {badge}
    </div>
  );
}

// Lencana kanan berbingkai emas (seperti PERFORMA). Dengan onClick jadi tombol.
export function HeaderBadge({ icon, label, onClick, active, ariaLabel, ariaExpanded }) {
  const style = { flex: "0 0 auto", marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: s(7, 3), borderRadius: 999, padding: `${s(8, 3)} ${s(16, 7)}`, fontSize: s(14, 8.5), fontWeight: 800, letterSpacing: ".03em", whiteSpace: "nowrap", color: "var(--gold)", border: "1.5px solid var(--gold)" };
  if (!onClick) return <span style={style}>{icon}{label}</span>;
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} aria-expanded={ariaExpanded} style={{ ...style, background: active ? mix("var(--gold)", 15) : "transparent", cursor: "pointer", fontFamily: "inherit" }}>
      {icon}{label}
    </button>
  );
}
