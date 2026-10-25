import React, { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
// Komponen kecil untuk tampilan jurnal: ring statistik, daftar baris statistik, tagline yang bisa diedit.

// Ring persentase: bagian terisi = fill, sisanya = track. center = teks di tengah, sub = label kecil.
export function StatRing({ pct, center, sub, fill = "var(--green)", track = "var(--red)", centerColor = "var(--text)", size = 88, subNode = null }) {
  const p = pct === null || pct === undefined ? 0 : Math.max(0, Math.min(100, pct));
  const empty = pct === null || pct === undefined;
  // Lubang ring dibuat dengan mask (bukan lingkaran berwarna) supaya tetap tembus pandang
  // walau kartu di belakangnya dibuat transparan.
  const thickness = Math.round(size * 0.1);
  const holeMask = `radial-gradient(farthest-side, transparent calc(100% - ${thickness - 0.5}px), #000 calc(100% - ${thickness - 1}px))`;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: empty ? "var(--border)" : `conic-gradient(${fill} ${p}%, ${track} 0)`,
          WebkitMaskImage: holeMask,
          maskImage: holeMask,
        }}
      />
      {/* Konten dibatasi ke lebar bagian dalam lingkaran supaya teks tidak menabrak ring; label panjang (mis. "Porsi profit") turun ke baris kedua */}
      <div style={{ position: "relative", textAlign: "center", lineHeight: 1.15, maxWidth: Math.round(size * 0.64) }}>
        <div className="tj-mono" style={{ fontSize: size > 100 ? 24 : 17, fontWeight: 600, color: centerColor }}>{center}</div>
        <div style={{ fontSize: size > 100 ? 11 : 9.5, lineHeight: 1.2, color: "var(--muted)", textTransform: "uppercase", letterSpacing: size > 100 ? "0.04em" : "0.02em", marginTop: 2, overflowWrap: "break-word" }}>{sub}</div>
        {subNode}
      </div>
    </div>
  );
}

export function StatRowList({ items }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
      {items.map(([label, val, color], i) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, paddingBottom: i < items.length - 1 ? 6 : 0, borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
          <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
          <span className="tj-mono" style={{ fontSize: 15, fontWeight: 600, color }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

// Teks tagline yang bisa diklik untuk diubah. Enter / klik di luar = simpan, Esc = batal.
export const TAGLINE_MAX_CHARS = 120;
export const TAGLINE_MAX_LINES = 3;
export function cleanTagline(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .split("\n")
    .slice(0, TAGLINE_MAX_LINES)
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .slice(0, TAGLINE_MAX_CHARS);
}
export function EditableTagline({ value, onSave, small = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const start = () => { setDraft(value); setEditing(true); };
  const commit = () => { setEditing(false); if (draft.trim() !== value) onSave(draft); };
  const common = { fontSize: small ? 11.5 : 13, marginTop: small ? 2 : 6, fontFamily: "inherit", letterSpacing: "0.01em" };
  // Di layar sentuh (HP) tombol Enter = baris baru, simpan lewat tombol centang / ketuk di luar.
  const isTouch = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(pointer: coarse)").matches : false;

  if (editing) {
    const lines = Math.min(TAGLINE_MAX_LINES, Math.max(1, draft.split("\n").length));
    return (
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 6, marginTop: 4 }}>
        <textarea
          autoFocus
          rows={lines}
          value={draft}
          placeholder="Tulis tagline kamu…"
          onChange={(e) => setDraft(e.target.value.replace(/\r/g, "").split("\n").slice(0, TAGLINE_MAX_LINES).join("\n").slice(0, TAGLINE_MAX_CHARS))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isTouch) { e.preventDefault(); e.currentTarget.blur(); }
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
          style={{
            ...common,
            marginTop: 0,
            width: "min(300px, 70vw)",
            textAlign: "center",
            color: "var(--text)",
            background: "var(--surface-raised)",
            border: "1px solid var(--gold-dim)",
            borderRadius: 6,
            padding: "5px 8px",
            outline: "none",
            boxSizing: "border-box",
            fontSize: 16,
            lineHeight: 1.35,
            resize: "none",
            overflow: "hidden",
          }}
        />
        {isTouch && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onClick={commit}
            aria-label="Simpan tagline"
            style={{ width: 32, height: 32, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gold-grad)", color: "#0A1628", border: "none", borderRadius: 7, cursor: "pointer" }}
          >
            <Check size={16} />
          </button>
        )}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={start}
      title="Klik untuk ubah tagline"
      style={{
        ...common,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        padding: small ? "1px 6px" : "2px 6px",
        cursor: "pointer",
        color: value ? "var(--gold)" : "var(--muted)",
        opacity: value ? 1 : 0.7,
        fontStyle: value ? "normal" : "italic",
        whiteSpace: "pre-line",
        textAlign: "center",
        lineHeight: 1.35,
      }}
    >
      {value || "Tulis tagline kamu…"}
    </button>
  );
}

// Avatar bulat berisi huruf awal akun (dari email). Warna emas sesuai merek TraderLogs.
export function avatarInitial(email) {
  const m = String(email || "").match(/[A-Za-z0-9]/);
  return m ? m[0].toUpperCase() : "?";
}
export function UserAvatar({ email, size = 32 }) {
  return (
    <span
      className="tj-user-avatar"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      {avatarInitial(email)}
    </span>
  );
}
