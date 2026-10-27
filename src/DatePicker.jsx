import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { monthKeyToLabel } from "./journalMath.js";

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const pad = (n) => String(n).padStart(2, "0");

// Kalender pilih tanggal untuk Input Transaksi.
// - monthKey: "YYYY-MM" bulan jurnal aktif
// - value: "YYYY-MM-DD" tanggal terpilih
// - takenKeys: Set tanggal yang sudah punya transaksi (diberi titik)
// - onPrev / onNext: pindah bulan jurnal (null = tidak ada bulan di arah itu)
export default function DatePicker({ monthKey, value, takenKeys, todayKey, onSelect, onPrev, onNext, weekendRed, compact, onOpenChange }) {
  const [open, setOpenState] = useState(false);
  const setOpen = (fn) => {
    setOpenState((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      if (onOpenChange && next !== prev) setTimeout(() => onOpenChange(next), 0);
      return next;
    });
  };
  const [y, mo] = monthKey.split("-").map(Number);
  const total = new Date(y, mo, 0).getDate();
  // getDay(): 0 = Minggu. Senin sebagai awal minggu.
  const lead = (new Date(y, mo - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  const [vy, vmo, vd] = (value || "").split("-").map(Number);
  const valueLabel = value
    ? new Date(vy, vmo - 1, vd).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    : "Pilih tanggal";

  const navBtn = (enabled) => ({
    display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32,
    background: "none", border: "none", color: "var(--muted)", cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.25, borderRadius: 8, padding: 0,
  });

  return (
    <div style={{ marginBottom: compact ? 0 : 12 }}>
      <button
        type="button"
        className="tj-input tj-mono"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          ...(compact ? { height: 36, boxSizing: "border-box", fontSize: 13, padding: "0 28px" } : null),
          cursor: "pointer", position: "relative", color: weekendRed ? "#EF5B50" : undefined,
        }}
      >
        {valueLabel}
        {value === todayKey ? " (hari ini)" : ""}
        <ChevronDown
          size={14}
          style={{ position: "absolute", right: 12, color: "var(--muted)", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div style={{ marginTop: 8, padding: "10px 10px 12px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <button type="button" aria-label="Bulan sebelumnya" disabled={!onPrev} onClick={() => onPrev && onPrev()} style={navBtn(!!onPrev)}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{monthKeyToLabel(monthKey)}</div>
            <button type="button" aria-label="Bulan berikutnya" disabled={!onNext} onClick={() => onNext && onNext()} style={navBtn(!!onNext)}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {DAY_NAMES.map((n, i) => (
              <div key={n} style={{ textAlign: "center", fontSize: 11, padding: "4px 0", color: i >= 5 ? "var(--red)" : "var(--muted)" }}>{n}</div>
            ))}
            {cells.map((d, idx) => {
              if (d === null) return <div key={`b${idx}`} />;
              const key = `${y}-${pad(mo)}-${pad(d)}`;
              const isWeekend = (idx % 7) >= 5;
              const selected = key === value;
              const isToday = key === todayKey;
              const taken = takenKeys.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { onSelect(key); setOpen(false); }}
                  className="tj-mono"
                  style={{
                    position: "relative", height: 38, borderRadius: 10, cursor: "pointer", fontSize: 13, padding: 0,
                    border: selected ? "1.5px solid var(--gold)" : isToday ? "1px solid var(--gold-dim)" : "1px solid var(--border)",
                    background: selected ? "color-mix(in srgb, var(--gold) 16%, transparent)" : "transparent",
                    color: isWeekend ? "var(--red)" : "var(--text)",
                    fontWeight: selected ? 700 : 400,
                  }}
                >
                  {d}
                  {taken && (
                    <span style={{ position: "absolute", left: "50%", bottom: 5, width: 4, height: 4, marginLeft: -2, borderRadius: "50%", background: "var(--muted)" }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10, fontSize: 11, color: "var(--muted)", justifyContent: "center" }}>
            {takenKeys.size > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--muted)" }} /> Sudah ada transaksi
              </span>
            )}
            <span><span style={{ color: "var(--red)" }}>Merah</span> = Sabtu, Minggu</span>
          </div>
        </div>
      )}
    </div>
  );
}
