import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";

// Pemilih tanggal Input Transaksi: kolom bergaya sama seperti "Tanggal mulai"
// di Asumsi simulasi (label kecil di atas, isi di tengah, font mono), kalau
// diketuk membuka kalender satu bulan penuh. Hanya menampilkan bulan aktif
// jurnal. Sabtu dan Minggu merah, hari ini diberi cincin, titik kecil berarti
// tanggal itu sudah punya transaksi.

const pad = (n) => String(n).padStart(2, "0");
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function DateField({ value, onChange, monthKey, todayKey, markedKeys, note }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Tutup kalender kalau mengetuk di luar komponen
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  if (!monthKey) return null;
  const [y, mo] = monthKey.split("-").map(Number);
  const total = new Date(y, mo, 0).getDate();
  const lead = (new Date(y, mo - 1, 1).getDay() + 6) % 7; // awal pekan = Senin
  const keyOf = (d) => `${y}-${pad(mo)}-${pad(d)}`;

  const selDate = value ? new Date(`${value}T12:00:00`) : null;
  const selLabel = selDate && !Number.isNaN(selDate.getTime())
    ? selDate.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    : "Pilih tanggal";
  const selDow = selDate ? selDate.getDay() : 1;
  const selIsWeekend = selDow === 0 || selDow === 6;
  const monthTitle = new Date(y, mo - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(<div key={`b${i}`} />);
  for (let d = 1; d <= total; d++) {
    const key = keyOf(d);
    const col = (lead + d - 1) % 7;
    const weekend = col >= 5;
    const selected = key === value;
    const isToday = key === todayKey;
    const marked = markedKeys && markedKeys.has(key);
    cells.push(
      <button
        key={key}
        type="button"
        onClick={() => { onChange(key); setOpen(false); }}
        aria-label={`${d} ${monthTitle}${isToday ? ", hari ini" : ""}${marked ? ", sudah ada transaksi" : ""}`}
        aria-pressed={selected}
        className="tj-mono"
        style={{
          position: "relative", height: 34, padding: 0, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13,
          background: selected ? "var(--gold)" : "transparent",
          color: selected ? "#0A1628" : weekend ? "var(--red)" : "var(--text)",
          fontWeight: selected ? 700 : 400,
          boxShadow: isToday && !selected ? "inset 0 0 0 1px var(--gold-dim)" : "none",
        }}
      >
        {d}
        {marked && (
          <span
            aria-hidden="true"
            style={{ position: "absolute", bottom: 3, left: "50%", marginLeft: -2, width: 4, height: 4, borderRadius: "50%", background: selected ? "#0A1628" : "var(--muted)" }}
          />
        )}
      </button>
    );
  }

  return (
    <div ref={wrapRef} style={{ marginBottom: 12 }}>
      <div style={{ maxWidth: 230, margin: "0 auto" }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginBottom: 6, letterSpacing: "0.04em" }}>
          Tanggal transaksi
        </div>
        <button
          type="button"
          className="tj-input tj-mono"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
          style={{
            position: "relative", height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            textAlign: "center", cursor: "pointer", paddingRight: 30, paddingLeft: 30,
            color: selIsWeekend ? "var(--red)" : undefined,
          }}
        >
          <span>{selLabel}{value === todayKey ? " (hari ini)" : ""}</span>
          <Calendar size={15} aria-hidden="true" style={{ position: "absolute", right: 10, color: "var(--muted)" }} />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label={`Pilih tanggal, ${monthTitle}`}
          style={{ marginTop: 10, padding: 10, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-raised)" }}
        >
          <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, marginBottom: 8, textTransform: "capitalize" }}>{monthTitle}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", textAlign: "center", fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>
            {WEEKDAYS.map((w, i) => (
              <div key={w} style={{ color: i > 4 ? "var(--red)" : undefined }}>{w}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 2 }}>{cells}</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 11, color: "var(--muted)" }}>
            <span>
              <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--muted)", marginRight: 5, verticalAlign: "middle" }} />
              Sudah ada transaksi
            </span>
            <span><span style={{ color: "var(--red)" }}>Merah</span> = Sabtu, Minggu</span>
          </div>
        </div>
      )}
      {note && <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>{note}</div>}
    </div>
  );
}
