import React, { useState, useEffect, useMemo } from "react";
import { Download, ChevronDown, ChevronUp, RotateCcw, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import * as XLSX from "xlsx";

// Simulasi target profit harian: modal awal -> target rupiah.
// Semua angka dihitung ulang otomatis saat input diubah, pengaturan disimpan
// per akun lewat window.storage (key "sim-settings").

const STORAGE_KEY = "sim-settings";
const PROGRESS_KEY = "sim-progress"; // centang pencapaian & catatan per hari
const MAX_DAYS = 1000; // batas baris tabel harian
const DAYS_PER_MONTH = 21; // hari trading (Senin-Jumat)
const DAYS_PER_YEAR = 260;
const MIN_LOT = 0.01;

const pad = (n) => String(n).padStart(2, "0");
const toInputDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function nextMonday() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return toInputDate(d);
}

const DEFAULTS = {
  capital: "100",
  targetRp: "1000000000",
  rate: "17900",
  targetPct: "3",
  lossPct: "4",
  startDate: nextMonday(),
  sl: "4",
  maxLayers: "4",
};

const num = (s) => {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : NaN;
};

const fmtUsd = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtRp = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
const fmtDate = (d) =>
  d.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12);
}

// Hari trading ke-n (Senin-Jumat). Hari ke-1 = hari kerja pertama pada/setelah tanggal mulai.
function addWorkdays(start, n) {
  const d = new Date(start.getTime());
  d.setDate(d.getDate() - 1);
  let c = 0;
  while (c < n) {
    d.setDate(d.getDate() + 1);
    const w = d.getDay();
    if (w !== 0 && w !== 6) c++;
  }
  return d;
}

function daysNeeded(growth, from, to) {
  if (!(growth > 0) || !(from > 0) || to <= from) return 0;
  return Math.ceil(Math.log(to / from) / Math.log(1 + growth) - 1e-9);
}

// Rekomendasi lot - rumus yang sama dengan rekomendasi lot di tab Jurnal.
function lotFor(balance, lossRatio, sl, maxLayers) {
  const riskBudget = balance * lossRatio;
  const perLayer = riskBudget / maxLayers;
  if (perLayer >= sl) {
    const lot = Math.max(MIN_LOT, Math.round(perLayer / sl) * MIN_LOT);
    return { lot, layers: maxLayers };
  }
  return { lot: MIN_LOT, layers: Math.max(1, Math.floor(riskBudget / sl)) };
}

const card = {
  background: "var(--surface-soft)",
  borderRadius: 10,
  padding: 12,
  marginBottom: 14,
  textAlign: "center",
};
const sectionTitle = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--gold)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  paddingBottom: 8,
  marginBottom: 12,
  borderBottom: "1px solid var(--border)",
  textAlign: "center",
};
const th = {
  padding: "7px 10px",
  fontSize: 11,
  color: "var(--muted)",
  fontWeight: 800,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};
const td = {
  padding: "7px 10px",
  fontSize: 13,
  textAlign: "center",
  borderTop: "none",
  whiteSpace: "nowrap",
};

function Field({ label, hint, value, onChange, type = "number", suffix }) {
  return (
    <div style={{ flex: "0 1 210px", minWidth: 150, padding: "0 12px 20px", boxSizing: "border-box" }}>
    <label style={{ display: "block", minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {label}
      </div>
      <div style={{ position: "relative" }}>
        <input
          className="tj-input tj-mono tj-sim-input"
          type={type}
          inputMode={type === "number" ? "decimal" : undefined}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ boxSizing: "border-box", textAlign: "center", ...(suffix ? { paddingLeft: 28, paddingRight: 28 } : null) }}
        />
        {suffix && (
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: "var(--muted)",
              pointerEvents: "none",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, textAlign: "center" }}>{hint}</div>}
    </label>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [monthKey, setMonthKey] = useState(() => (value || toInputDate(new Date())).slice(0, 7));
  const [year, month] = monthKey.split("-").map(Number);
  const first = new Date(year, month - 1, 1, 12);
  const count = new Date(year, month, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1;
    return day < 1 || day > count ? null : `${monthKey}-${pad(day)}`;
  });
  const moveMonth = (delta) => {
    const d = new Date(year, month - 1 + delta, 1, 12);
    setMonthKey(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };
  const today = toInputDate(new Date());
  return (
    <div style={{ flex: "0 1 210px", minWidth: 150, padding: "0 12px 20px", boxSizing: "border-box" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8, textAlign: "center" }}>{label}</div>
      <div style={{ position: "relative" }}>
        <button type="button" onClick={() => { setMonthKey((value || today).slice(0, 7)); setOpen((v) => !v); }} aria-label="Pilih tanggal mulai" aria-expanded={open}
          style={{ width: "100%", minHeight: 38, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8px 38px 8px 12px", border: open ? "1px solid var(--gold)" : "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", cursor: "pointer", fontSize: 13 }}>
          <span>{value ? new Date(`${value}T12:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Pilih tanggal"}</span>
          <CalendarDays size={16} style={{ position: "absolute", right: 11, color: "var(--gold)" }} />
        </button>
        {open && <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 39 }} />
          <div role="dialog" aria-label="Kalender tanggal mulai" style={{ position: "fixed", top: "50%", left: "50%", right: "auto", transform: "translate(-50%, -50%)", width: "min(340px, calc(100vw - 24px))", maxWidth: "calc(100vw - 24px)", boxSizing: "border-box", zIndex: 40, padding: 10, borderRadius: 12, background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)", boxShadow: "0 14px 35px rgba(0,0,0,.22)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 9 }}>
              <button type="button" onClick={() => moveMonth(-1)} aria-label="Bulan sebelumnya" style={{ width: 28, height: 28, display: "grid", placeItems: "center", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-soft)", color: "var(--text)", cursor: "pointer" }}><ChevronLeft size={15} /></button>
              <strong style={{ fontSize: 12, color: "var(--text)" }}>{first.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</strong>
              <button type="button" onClick={() => moveMonth(1)} aria-label="Bulan berikutnya" style={{ width: 28, height: 28, display: "grid", placeItems: "center", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-soft)", color: "var(--text)", cursor: "pointer" }}><ChevronRight size={15} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4, marginBottom: 5 }}>
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d, index) => <div key={d} style={{ textAlign: "center", fontSize: 10, color: index >= 5 ? "#A33A3A" : "var(--muted)", fontWeight: 700, padding: 3 }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
              {cells.map((key, i) => key ? (() => { const weekday = new Date(`${key}T12:00:00`).getDay(); const isWeekend = weekday === 0 || weekday === 6; return <button key={key} type="button" onClick={() => { onChange(key); setOpen(false); }} aria-pressed={key === value}
                style={{ minWidth: 0, minHeight: 42, border: key === value ? "1px solid var(--gold)" : key === today ? "1px solid var(--gold-dim)" : "1px solid var(--border)", borderRadius: 8, background: key === value ? "var(--gold-grad)" : "var(--surface)", color: key === value ? "#0A1628" : isWeekend ? "#A33A3A" : "var(--text)", fontSize: 11, fontWeight: key === value ? 800 : 600, cursor: "pointer", padding: 0 }}>{Number(key.slice(-2))}</button>; })() : <span key={`empty-${i}`} />)}
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div
        className="tj-mono"
        style={{ fontSize: 15, fontWeight: 600, color: accent ? "var(--gold)" : "var(--text)" }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function TargetSimulator({ theme = "dark" }) {
  const [form, setForm] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [logScale, setLogScale] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [progress, setProgress] = useState({ done: {}, notDone: {}, notes: {} });
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Muat pengaturan tersimpan
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = window.storage ? await window.storage.get(STORAGE_KEY) : null;
        if (alive && r?.value) {
          const saved = typeof r.value === "string" ? JSON.parse(r.value) : r.value;
          setForm((f) => ({ ...f, ...saved }));
        }
      } catch {
        /* abaikan: pakai nilai default */
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Muat centang & catatan
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = window.storage ? await window.storage.get(PROGRESS_KEY) : null;
        if (alive && r?.value) {
          const saved = typeof r.value === "string" ? JSON.parse(r.value) : r.value;
          setProgress({ done: saved.done || {}, notDone: saved.notDone || {}, notes: saved.notes || {} });
        }
      } catch {
        /* abaikan */
      } finally {
        if (alive) setProgressLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!progressLoaded || !window.storage) return;
    const t = setTimeout(() => {
      window.storage.set(PROGRESS_KEY, JSON.stringify(progress)).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [progress, progressLoaded]);

  const toggleDone = (day) =>
    setProgress((p) => {
      const done = { ...p.done };
      const notDone = { ...p.notDone };
      if (done[day]) delete done[day];
      else { done[day] = true; delete notDone[day]; }
      return { ...p, done, notDone };
    });
  const toggleNotDone = (day) =>
    setProgress((p) => {
      const done = { ...p.done };
      const notDone = { ...p.notDone };
      if (notDone[day]) delete notDone[day];
      else { notDone[day] = true; delete done[day]; }
      return { ...p, done, notDone };
    });
  const setNote = (day, text) =>
    setProgress((p) => {
      const notes = { ...p.notes };
      if (text) notes[day] = text;
      else delete notes[day];
      return { ...p, notes };
    });

  // Simpan pengaturan (ditunda sebentar supaya tidak menyimpan tiap ketikan)
  useEffect(() => {
    if (!loaded || !window.storage) return;
    const t = setTimeout(() => {
      window.storage.set(STORAGE_KEY, JSON.stringify(form)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [form, loaded]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const sim = useMemo(() => {
    const capital = num(form.capital);
    const targetRp = num(form.targetRp);
    const rate = num(form.rate);
    const g = num(form.targetPct) / 100;
    const L = num(form.lossPct) / 100;
    const sl = num(form.sl);
    const maxLayers = Math.max(1, Math.round(num(form.maxLayers)));
    const start = form.startDate ? parseDate(form.startDate) : null;

    const errors = [];
    if (!(capital > 0)) errors.push("Modal awal harus lebih dari 0.");
    if (!(targetRp > 0)) errors.push("Target rupiah harus lebih dari 0.");
    if (!(rate > 0)) errors.push("Kurs harus lebih dari 0.");
    if (!(g > 0)) errors.push("Target harian harus lebih dari 0%.");
    if (!(L >= 0 && L < 1)) errors.push("Batas loss harian harus antara 0% dan 100%.");
    if (!(sl > 0)) errors.push("Jarak SL harus lebih dari 0.");
    if (!start || isNaN(start.getTime())) errors.push("Tanggal mulai tidak valid.");
    if (errors.length) return { errors };

    const targetUsd = targetRp / rate;
    if (targetUsd <= capital) {
      return { errors: ["Target sudah tercapai oleh modal awal. Naikkan target rupiah atau turunkan modal."] };
    }

    // Tabel harian
    const rows = [];
    const cursor = new Date(start.getTime());
    cursor.setDate(cursor.getDate() - 1);
    let bal = capital;
    for (let i = 1; i <= MAX_DAYS; i++) {
      do {
        cursor.setDate(cursor.getDate() + 1);
      } while (cursor.getDay() === 0 || cursor.getDay() === 6);
      const target = bal * g;
      const end = bal + target;
      const { lot, layers } = lotFor(bal, L, sl, maxLayers);
      rows.push({
        day: i,
        date: new Date(cursor.getTime()),
        start: bal,
        target,
        loss: bal * L,
        end,
        endRp: end * rate,
        lot,
        layers,
      });
      bal = end;
      if (end >= targetUsd - 1e-9) break;
    }
    const reached = rows[rows.length - 1].end >= targetUsd - 1e-9;

    const dayCount = daysNeeded(g, capital, targetUsd);
    const dateOf = (n) => (n > 0 && n <= 20000 ? addWorkdays(start, n) : start);

    const scenarios = [0.01, 0.02, 0.03, 0.04, 0.05].map((gr) => {
      const d = daysNeeded(gr, capital, targetUsd);
      return { pct: gr, days: d, months: d / DAYS_PER_MONTH, date: dateOf(d) };
    });

    const milestones = [5e6, 1e7, 5e7, 1e8, 5e8, targetRp].map((rp) => {
      const usd = rp / rate;
      const d = usd <= capital ? 0 : daysNeeded(g, capital, usd);
      return { rp, usd, days: d, date: d === 0 ? start : dateOf(d) };
    });

    const reality = [0.6, 0.7, 0.8, 0.9, 1].map((p) => {
      const gl = p * Math.log(1 + g) + (1 - p) * Math.log(1 - L);
      if (!(gl > 0)) return { p, days: null };
      const d = Math.ceil(Math.log(targetUsd / capital) / gl - 1e-9);
      return { p, days: d, years: d / DAYS_PER_YEAR };
    });

    return {
      errors: [],
      capital, targetRp, rate, g, L, targetUsd, rows, reached,
      dayCount, scenarios, milestones, reality,
      endDate: dateOf(dayCount),
    };
  }, [form]);

  const exportExcel = () => {
    if (sim.errors.length) return;
    const wb = XLSX.utils.book_new();
    const summary = [
      ["Simulasi Target Profit Harian"],
      [],
      ["Modal awal ($)", sim.capital],
      ["Target (Rp)", sim.targetRp],
      ["Kurs USD/IDR", sim.rate],
      ["Target harian (%)", sim.g * 100],
      ["Batas loss harian (%)", sim.L * 100],
      ["Tanggal mulai", form.startDate],
      [],
      ["Target dalam dolar ($)", Number(sim.targetUsd.toFixed(2))],
      ["Hari trading dibutuhkan", sim.dayCount],
      ["Perkiraan tanggal tercapai", toInputDate(sim.endDate)],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Ringkasan");
    const head = ["Hari ke", "Tanggal", "Saldo Awal ($)", "Target Profit ($)", "Batas Loss ($)", "Saldo Akhir ($)", "Saldo Akhir (Rp)", "Lot/Layer", "Max Layer", "Tercapai", "Tidak tercapai", "Catatan"];
    const body = sim.rows.map((r) => [
      r.day,
      toInputDate(r.date),
      Number(r.start.toFixed(2)),
      Number(r.target.toFixed(2)),
      Number((-r.loss).toFixed(2)),
      Number(r.end.toFixed(2)),
      Math.round(r.endRp),
      r.lot,
      r.layers,
      progress.done[r.day] ? "Ya" : "",
      progress.notDone[r.day] ? "Ya" : "",
      progress.notes[r.day] || "",
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([head, ...body]), "Simulasi");
    XLSX.writeFile(wb, "simulasi-target.xlsx");
  };

  const visibleRows = sim.errors?.length ? [] : showAll ? sim.rows : sim.rows.slice(0, 30);
  const axisColor = theme === "light" ? "#6B7C93" : "#8A9BB5";

  return (
    <div>
      {/* Input - gaya mengikuti panel Tambah Entry di tab Jurnal */}
      <div style={card}>
        <div style={sectionTitle}>Asumsi simulasi</div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 14,
            marginBottom: 2,
          }}
        >
          <DateField label="Tanggal mulai" value={form.startDate} onChange={set("startDate")} />
          <Field label="Modal awal ($)" value={form.capital} onChange={set("capital")} />
          <Field label="Target (Rp)" value={form.targetRp} onChange={set("targetRp")} />
          <Field label="Kurs USD/IDR (Rp)" value={form.rate} onChange={set("rate")} />
          {/* Pemisah baris: baris 2 selalu mulai dari Target profit harian (di bawah Tanggal mulai), disusul Batas loss harian */}
          <div style={{ flexBasis: "100%", height: 0 }} />
          <Field label="Target profit harian" value={form.targetPct} onChange={set("targetPct")} suffix="%" />
          <Field label="Batas loss harian" value={form.lossPct} onChange={set("lossPct")} suffix="%" />
          <Field label="Jarak SL rata-rata ($)" value={form.sl} onChange={set("sl")} />
          <Field label="Max layer" value={form.maxLayers} onChange={set("maxLayers")} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={exportExcel}
            disabled={!!sim.errors.length}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "transparent", border: "1px solid var(--gold-dim)", color: "var(--gold)",
              fontSize: 13, padding: "8px 14px", borderRadius: 8,
              cursor: sim.errors.length ? "not-allowed" : "pointer", opacity: sim.errors.length ? 0.5 : 1,
            }}
          >
            <Download size={14} /> Download Excel
          </button>
          <button
            onClick={() => setForm({ ...DEFAULTS, startDate: nextMonday() })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "transparent", border: "1px solid var(--border)", color: "var(--muted)",
              fontSize: 13, padding: "8px 14px", borderRadius: 8, cursor: "pointer",
            }}
          >
            <RotateCcw size={14} /> Reset ke default
          </button>
        </div>
      </div>

      {sim.errors.length > 0 ? (
        <div style={{ ...card, border: "1px solid var(--red)", color: "var(--red)", fontSize: 13, lineHeight: 1.5, textAlign: "center" }}>
          {sim.errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      ) : (
        <>
          {/* Hasil */}
          <div style={card}>
            <div style={sectionTitle}>Hasil (semua hari profit)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              <Stat label="Target dalam dolar" value={fmtUsd(sim.targetUsd)} sub={`${(sim.targetUsd / sim.capital).toLocaleString("id-ID", { maximumFractionDigits: 0 })}x modal`} />
              <Stat accent label="Hari trading" value={sim.dayCount.toLocaleString("id-ID")} sub={`≈ ${(sim.dayCount / DAYS_PER_MONTH).toFixed(1)} bulan`} />
              <Stat label="Perkiraan tercapai" value={fmtDate(sim.endDate)} />
              <Stat label="Target profit hari ke-1" value={fmtUsd(sim.rows[0].target)} sub={fmtRp(sim.rows[0].target * sim.rate)} />
            </div>
            {!sim.reached && (
              <div style={{ fontSize: 11, color: "var(--red)", marginTop: 10, textAlign: "center" }}>
                Tabel harian dibatasi {MAX_DAYS} hari dan target belum tercapai di dalamnya.
              </div>
            )}
          </div>

          {/* Grafik */}
          <div style={card}>
            <div style={sectionTitle}>Pertumbuhan saldo ($)</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <button
                onClick={() => setLogScale((v) => !v)}
                style={{
                  background: logScale ? "rgba(237,165,36,0.1)" : "var(--surface-raised)",
                  border: `1px solid ${logScale ? "var(--gold-dim)" : "var(--border)"}`,
                  color: logScale ? "var(--gold)" : "var(--muted)",
                  borderRadius: 6, padding: "4px 12px", fontSize: 11, cursor: "pointer",
                }}
              >
                Skala log
              </button>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={sim.rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: axisColor }} stroke="var(--border)" />
                  <YAxis
                    scale={logScale ? "log" : "linear"}
                    domain={logScale ? ["auto", "auto"] : [0, "auto"]}
                    allowDataOverflow
                    tick={{ fontSize: 11, fill: axisColor }}
                    stroke="var(--border)"
                    width={52}
                    tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v))}
                  />
                  <Tooltip
                    contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                    labelFormatter={(d) => `Hari ke-${d}`}
                    formatter={(v) => [fmtUsd(v), "Saldo akhir"]}
                  />
                  <ReferenceLine y={sim.targetUsd} stroke="var(--green)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="end" stroke="var(--gold)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skenario + milestone */}
          <div style={card}>
            <div style={sectionTitle}>Skenario target harian</div>
            <div className="tj-scrollbar" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Target/hari", "Hari trading", "≈ Bulan", "Tercapai"].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sim.scenarios.map((s) => (
                    <tr key={s.pct}>
                      <td className="tj-mono" style={td}>{(s.pct * 100).toFixed(0)}%</td>
                      <td className="tj-mono" style={td}>{s.days.toLocaleString("id-ID")}</td>
                      <td className="tj-mono" style={td}>{s.months.toFixed(1)}</td>
                      <td className="tj-mono" style={td}>{fmtDate(s.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Milestone (dengan target harian di atas)</div>
            <div className="tj-scrollbar" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Saldo (Rp)", "Saldo ($)", "Hari ke-", "Tanggal"].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sim.milestones.map((m, i) => (
                    <tr key={i}>
                      <td className="tj-mono" style={td}>{fmtRp(m.rp)}</td>
                      <td className="tj-mono" style={td}>{fmtUsd(m.usd)}</td>
                      <td className="tj-mono" style={td}>{m.days.toLocaleString("id-ID")}</td>
                      <td className="tj-mono" style={td}>{fmtDate(m.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Cek realita: kalau tidak semua hari profit</div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginBottom: 10, textAlign: "center" }}>
              Hari rugi dianggap kena batas loss penuh, hari profit tepat di target. Persentase hari profit di bawah hanya contoh, bukan data trading kamu.
            </div>
            <div className="tj-scrollbar" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Hari profit", "Hari trading", "≈ Tahun"].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sim.reality.map((r) => (
                    <tr key={r.p}>
                      <td className="tj-mono" style={td}>{(r.p * 100).toFixed(0)}%</td>
                      <td className="tj-mono" style={td}>{r.days === null ? "Tidak tercapai" : r.days.toLocaleString("id-ID")}</td>
                      <td className="tj-mono" style={td}>{r.days === null ? "-" : r.years.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel harian */}
          <div style={card}>
            <div style={sectionTitle}>Tabel harian</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, textAlign: "center" }}>
              Tercapai:{" "}
              <span className="tj-mono" style={{ color: "var(--gold)", fontWeight: 600 }}>
                {sim.rows.filter((r) => progress.done[r.day]).length} / {sim.rows.length}
              </span>{" "}
              hari. Centang dan catatan tersimpan otomatis per nomor hari.
            </div>
            <div className="tj-scrollbar" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Hari", "Tanggal", "Saldo awal", "Target", "Batas loss", "Saldo akhir", "Saldo akhir (Rp)", "Lot × layer"].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                    <th colSpan={2} style={th}>STATUS TARGET</th>
                    <th style={th}>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((r) => {
                    const last = r.end >= sim.targetUsd - 1e-9;
                    const done = !!progress.done[r.day];
                    return (
                      <tr
                        key={r.day}
                        style={last ? { background: "rgba(63,195,126,0.12)" } : done ? { background: "rgba(63,195,126,0.07)" } : progress.notDone[r.day] ? { background: "rgba(239,91,80,0.07)" } : undefined}
                      >
                        <td className="tj-mono" style={td}>{r.day}</td>
                        <td className="tj-mono" style={td}>{fmtDate(r.date)}</td>
                        <td className="tj-mono" style={td}>{fmtUsd(r.start)}</td>
                        <td className="tj-mono" style={{ ...td, color: "var(--green)" }}>{fmtUsd(r.target)}</td>
                        <td className="tj-mono" style={{ ...td, color: "var(--red)" }}>-{fmtUsd(r.loss)}</td>
                        <td className="tj-mono" style={td}>{fmtUsd(r.end)}</td>
                        <td className="tj-mono" style={td}>{fmtRp(r.endRp)}</td>
                        <td className="tj-mono" style={td}>{r.lot.toFixed(2)} × {r.layers}</td>
                        <td style={{ ...td, padding: "7px 3px", width: 28 }}>
                          <input type="checkbox" checked={done} onChange={() => toggleDone(r.day)} aria-label={`Hari ke-${r.day} tercapai`}
                            style={{ width: 17, height: 17, accentColor: "var(--green)", cursor: "pointer", verticalAlign: "middle" }} />
                        </td>
                        <td style={{ ...td, padding: "7px 3px", width: 28 }}>
                          <input type="checkbox" checked={!!progress.notDone[r.day]} onChange={() => toggleNotDone(r.day)} aria-label={`Hari ke-${r.day} tidak tercapai`}
                            style={{ width: 17, height: 17, accentColor: "var(--red)", cursor: "pointer", verticalAlign: "middle" }} />
                        </td>
                        <td style={{ ...td, minWidth: 170 }}>
                          <input
                            className="tj-input"
                            type="text"
                            maxLength={200}
                            value={progress.notes[r.day] || ""}
                            onChange={(e) => setNote(r.day, e.target.value)}
                            style={{ boxSizing: "border-box", textAlign: "center" }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {sim.rows.length > 30 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  width: "100%", marginTop: 10, padding: "8px 12px", borderRadius: 8, fontSize: 13,
                  fontWeight: 600, border: "1px solid var(--border)", background: "var(--surface-raised)",
                  color: "var(--muted)", cursor: "pointer",
                }}
              >
                {showAll ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {showAll ? "Tampilkan 30 hari pertama" : `Tampilkan semua ${sim.rows.length} hari`}
              </button>
            )}
          </div>

          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, opacity: 0.85, marginBottom: 8, textAlign: "center" }}>
            Model compounding murni: tanpa withdraw, komisi, spread, atau slippage. Trading Senin–Jumat, libur bursa tidak dihitung. Lot per layer memakai rumus yang sama dengan rekomendasi lot di tab Jurnal.
          </div>
        </>
      )}
    </div>
  );
}
