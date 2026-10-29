import React from "react";

// Gaya kepala kartu (ikon bulat + judul + subjudul + slot kanan) untuk
// "Perbandingan Antar Bulan" dan "Input Transaksi". Hanya tampilan.
// Warna teks/latar memakai variabel tema; biru aksen sama dengan kartu Statistik.
export const BLUE = "#2A7BFF";
export const mix = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

// Garis dan kilau kartu luar (biru), garis kotak dalam, serta latar baris.
export const CARD_BORDER = `1.5px solid ${mix(BLUE, 70)}`;
export const CARD_GLOW = `0 0 16px ${mix(BLUE, 22)}`;
export const INNER_LINE = `1px solid ${mix(BLUE, 45)}`;
export const INNER_BG = mix("var(--surface-raised)", 55);

export function CardHeader({ icon, title, subtitle, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <span
        style={{ width: 40, height: 40, borderRadius: "50%", flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", color: BLUE, background: mix(BLUE, 14), border: `1.5px solid ${mix(BLUE, 60)}`, boxShadow: `0 0 10px ${mix(BLUE, 25)}` }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: BLUE, marginTop: 2, lineHeight: 1.3 }}>{subtitle}</div>
      </div>
      {right}
    </div>
  );
}
