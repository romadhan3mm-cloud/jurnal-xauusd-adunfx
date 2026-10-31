import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { s, BOX_RADIUS } from "./CardHeader.jsx";

// Kalender pilih tanggal (popover tengah layar) — dipisah dari TradingJournal.jsx, tampilan dan perilaku sama.
// Semua state dan fungsi diterima lewat props; kondisi tampil (`calendarOpen`) tetap di induk.
export default function CalendarPopover({ addNote, calendarCells, calendarFirstDay, changeCalendarMonth, chooseCalendarDate, selectedDate, setCalendarOpen, todayKey, transactionDateKeys }) {
  return (
<>
        <div onClick={() => setCalendarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 39 }} />
        <div role="dialog" aria-label="Kalender pilih tanggal" style={{ position: "fixed", top: "50%", left: "50%", right: "auto", transform: "translate(-50%, -50%)", width: "min(360px, calc(100vw - 24px))", maxWidth: "calc(100vw - 24px)", boxSizing: "border-box", zIndex: 40, padding: 12, borderRadius: s(20, 12), background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)", boxShadow: "0 14px 35px rgba(0,0,0,.22)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
            <button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="Bulan sebelumnya" style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "1px solid var(--border)", borderRadius: BOX_RADIUS, background: "var(--surface-soft)", color: "var(--text)", cursor: "pointer" }}><ChevronLeft size={17} /></button>
            <strong style={{ fontSize: 13, color: "var(--text)" }}>{calendarFirstDay.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</strong>
            <button type="button" onClick={() => changeCalendarMonth(1)} aria-label="Bulan berikutnya" style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "1px solid var(--border)", borderRadius: BOX_RADIUS, background: "var(--surface-soft)", color: "var(--text)", cursor: "pointer" }}><ChevronRight size={17} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4, marginBottom: 5 }}>
            {["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"].map((day, index) => <div key={day} style={{ textAlign: "center", padding: "5px 0", color: index >= 5 ? "var(--weekend)" : "var(--muted)", fontSize: 11, fontWeight: 700 }}>{day}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 3 }}>
            {calendarCells.map((key, i) => {
              if (!key) return <div key={`empty-${i}`} style={{ minHeight: 35 }} />;
              const isSelected = key === selectedDate;
              const hasEntry = transactionDateKeys.has(key);
              const isToday = key === todayKey;
              const dayNum = Number(key.slice(-2));
              const weekday = new Date(`${key}T12:00:00`).getDay();
              const isWeekend = weekday === 0 || weekday === 6;
              return <button key={key} type="button" onClick={() => chooseCalendarDate(key)} aria-label={`${dayNum} ${calendarFirstDay.toLocaleDateString("id-ID", { month: "long" })}`} aria-pressed={isSelected} style={{ minWidth: 0, minHeight: 42, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: isSelected ? "1px solid var(--gold)" : isToday ? "1px solid var(--gold-dim)" : "1px solid var(--border)", borderRadius: BOX_RADIUS, background: isSelected ? "var(--gold-grad)" : "var(--surface)", color: isSelected ? "#0A1628" : isWeekend ? "var(--weekend)" : "var(--text)", fontSize: 13, fontWeight: isSelected ? 800 : 700, cursor: "pointer", padding: 0 }}>
                {dayNum}<span style={{ width: 4, height: 4, borderRadius: "50%", background: hasEntry ? (isSelected ? "#686868" : "#8B8B85") : "transparent" }} />
              </button>;
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)", color: "var(--muted)", fontSize: 11 }}><span><span style={{ color: "#8B8B85" }}>●</span> sudah ada transaksi</span><span>▢ terpilih = emas</span></div>
          {addNote && <div style={{ marginTop: 8, textAlign: "center", color: "var(--muted)", fontSize: 11 }}>{addNote}</div>}
        </div>
</>
  );
}
