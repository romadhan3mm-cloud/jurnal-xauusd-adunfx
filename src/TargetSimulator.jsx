import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Download, ChevronDown, ChevronUp, RotateCcw, CalendarDays, ChevronLeft, ChevronRight, Check, X, Settings, Coins, Target, Percent, TrendingUp, ShieldAlert, ArrowLeftRight, Layers, Info, BarChart3, FileText, Flag, DollarSign } from "lucide-react";
import { CardShell, CardHeader, BLUE, mix, s, INNER_BG, INNER_BORDER, IconBadge, GRAD, BTN_RADIUS } from "./CardHeader.jsx";
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
  "$" + Number(n || 0).toFixed(2);
const fmtRp = (n) => "Rp " + Math.round(Number(n) || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
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
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 12,
  marginBottom: 14,
  textAlign: "center",
};
const th = {
  padding: `${s(7, 4)} ${s(6, 3)}`,
  fontSize: s(12, 9.5),
  color: "color-mix(in srgb, #2A7BFF 72%, var(--text))",
  fontWeight: 800,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};
const td = {
  padding: `${s(7, 4)} ${s(6, 3)}`,
  fontSize: s(13, 10),
  textAlign: "center",
  borderTop: "none",
  whiteSpace: "nowrap",
};

// Input desimal: titik (.) boleh diketik; koma (,) otomatis jadi titik; hanya satu titik desimal.
function sanitizeDecimal(raw) {
  const cleaned = String(raw ?? "").replace(/,/g, ".").replace(/[^\d.]/g, "");
  const i = cleaned.indexOf(".");
  return i === -1 ? cleaned : cleaned.slice(0, i + 1) + cleaned.slice(i + 1).replace(/\./g, "");
}

// Input ribuan: titik yang diketik diterima lalu diformat ulang otomatis (nilai tersimpan hanya angka).
function formatThousandsInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

const tileIcon = { width: "55%", height: "55%", display: "block" };
const tileLabel = { fontSize: s(13, 8.5), color: "var(--muted)", lineHeight: 1.2, minWidth: 0, overflowWrap: "anywhere", textAlign: "center" };
const tileValue = { fontSize: s(22, 16), fontWeight: 800, letterSpacing: "-.03em", color: "var(--text)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", textAlign: "center" };

// Kotak isian vertikal (seperti kartu angka di Statistik): ikon di atas, label di bawah ikon, nilai di paling bawah; semua rata tengah.
function Tile({ icon, bg, label, suffix, focused, as: Tag = "label", children }) {
  return (
    <Tag style={{ flex: "1 1 0", width: "100%", minWidth: 0, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", borderRadius: s(14, 8), padding: `${s(12, 6)} ${s(10, 5)}`, background: INNER_BG, border: focused ? "1px solid var(--gold)" : INNER_BORDER }}>
      <IconBadge bg={bg}>{icon}</IconBadge>
      <span style={{ ...tileLabel, marginTop: s(8, 4) }}>{label}</span>
      <span style={{ position: "relative", display: "block", width: "100%", minWidth: 0, marginTop: "auto", paddingTop: s(5, 3) }}>
        {children}
        {suffix && <span style={{ position: "absolute", right: s(4, 2), bottom: s(2, 1), fontSize: s(14, 9), fontWeight: 700, color: "var(--muted)", lineHeight: 1.2, pointerEvents: "none" }}>{suffix}</span>}
      </span>
    </Tag>
  );
}

function Field({ label, value, onChange, suffix, formatThousands = false, icon, bg }) {
  const [focused, setFocused] = useState(false);
  const displayValue = formatThousands ? formatThousandsInput(value) : value;
  const handleChange = (event) => {
    const nextValue = event.target.value;
    onChange(formatThousands ? nextValue.replace(/\D/g, "") : sanitizeDecimal(nextValue));
  };
  return (
    <Tile icon={icon} bg={bg} label={label} suffix={suffix} focused={focused}>
      <input
        className="tj-input tj-mono tj-sim-input"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        style={{ ...tileValue, width: "100%", boxSizing: "border-box", height: "auto", padding: `0 ${s(20, 12)}`, border: "none", borderRadius: 0, background: "transparent" }}
      />
    </Tile>
  );
}

function DateField({ label, value, onChange, icon, bg }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
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
  const popup = open ? (
    <>
      <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 39 }} />
      <div role="dialog" aria-label="Kalender tanggal mulai" style={{ position: "fixed", top: "50%", left: "50%", right: "auto", transform: "translate(-50%, -50%)", width: "min(340px, calc(100vw - 24px))", maxWidth: "calc(100vw - 24px)", boxSizing: "border-box", zIndex: 40, padding: 10, borderRadius: 12, background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)", boxShadow: "0 14px 35px rgba(0,0,0,.22)", color: "var(--text)", fontFamily: "'Inter', sans-serif" }}>
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
    </>
  ) : null;
  // Popup dirender di .tj-root (bukan di dalam kartu) supaya tidak terpotong overflow kartu; variabel tema tetap berlaku.
  const portalTarget = open ? anchorRef.current?.closest(".tj-root") : null;
  return (
    <div ref={anchorRef} style={{ minWidth: 0, display: "flex" }}>
      <Tile as="div" icon={icon} bg={bg} label={label} focused={open}>
        <button type="button" onClick={() => { setMonthKey((value || today).slice(0, 7)); setOpen((v) => !v); }} aria-label="Pilih tanggal mulai" aria-expanded={open}
          style={{ ...tileValue, width: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: `0 ${s(20, 12)}`, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", boxSizing: "border-box" }}>
          <span>{value ? new Date(`${value}T12:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Pilih tanggal"}</span>
          <CalendarDays style={{ position: "absolute", right: s(4, 2), width: s(16, 10), height: s(16, 10), color: "var(--gold)" }} />
        </button>
      </Tile>
      {popup && (portalTarget ? createPortal(popup, portalTarget) : popup)}
    </div>
  );
}

// Tanda status harian: lingkaran hijau dengan centang (tercapai) atau lingkaran merah dengan X (tidak tercapai).
function StatusMark({ kind, active, onClick, label }) {
  const color = kind === "done" ? "var(--green)" : "var(--red)";
  const Icon = kind === "done" ? Check : X;
  return (
    <button type="button" role="checkbox" aria-checked={active} aria-label={label} onClick={onClick}
      style={{ width: 22, height: 22, padding: 0, borderRadius: "50%", display: "inline-grid", placeItems: "center", verticalAlign: "middle", cursor: "pointer", border: `1.5px solid ${active ? color : "var(--border)"}`, background: active ? color : "transparent", color: active ? "#FFFFFF" : "transparent" }}>
      <Icon size={14} strokeWidth={3} />
    </button>
  );
}

// Kartu angka hasil (gaya kartu angka Statistik): ikon di atas, label, nilai, keterangan; semua rata tengah.
function ResultTile({ icon, bg, label, value, sub, valueSize }) {
  return (
    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", borderRadius: s(14, 8), padding: `${s(12, 6)} ${s(10, 5)}`, background: INNER_BG, border: INNER_BORDER }}>
      <IconBadge bg={bg}>{icon}</IconBadge>
      <div style={{ ...tileLabel, marginTop: s(8, 4) }}>{label}</div>
      <div className="tj-mono" style={{ ...tileValue, fontSize: valueSize || s(24, 14), marginTop: "auto", paddingTop: s(5, 3) }}>{value}</div>
      {sub && <div style={{ fontSize: s(13, 8.5), color: "var(--muted)", lineHeight: 1.2, marginTop: s(3, 2), whiteSpace: "nowrap" }}>{sub}</div>}
    </div>
  );
}

export default function TargetSimulator({ theme = "dark", journalDays = {} }) {
  const [form, setForm] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [logScale, setLogScale] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [progress, setProgress] = useState({ done: {}, notDone: {}, notes: {}, auto: {} });
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
          setProgress({ done: saved.done || {}, notDone: saved.notDone || {}, notes: saved.notes || {}, auto: saved.auto || {} });
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

  // Sinkron dari Jurnal: cocokkan tanggal baris simulasi dengan transaksi di Jurnal.
  // - net harian (profit - loss - komisi) >= Target 3% baris Jurnal itu -> tercapai (centang hijau)
  // - net di bawah target pada tanggal yang sudah lewat -> tidak tercapai (X merah)
  // - tanggal hari ini yang belum capai target dibiarkan kosong (hari belum selesai)
  // Hanya berubah saat hasil Jurnal untuk tanggal itu berubah, jadi koreksi manual tidak ditimpa.
  const journalSig = JSON.stringify(journalDays || {});
  useEffect(() => {
    if (!progressLoaded || !sim.rows) return;
    const todayKey = toInputDate(new Date());
    setProgress((p) => {
      const done = { ...p.done };
      const notDone = { ...p.notDone };
      const auto = { ...(p.auto || {}) };
      let changed = false;
      sim.rows.forEach((r) => {
        const key = toInputDate(r.date);
        const j = journalDays[key];
        let status = null;
        if (j) {
          if (j.net + 1e-9 >= j.target) status = "done";
          else if (key < todayKey) status = "notDone";
        }
        if ((auto[key] || null) === status) return;
        delete done[r.day];
        delete notDone[r.day];
        if (status === "done") done[r.day] = true;
        if (status === "notDone") notDone[r.day] = true;
        if (status) auto[key] = status;
        else delete auto[key];
        changed = true;
      });
      return changed ? { ...p, done, notDone, auto } : p;
    });
  }, [journalSig, sim.rows, progressLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* Kartu Asumsi Simulasi - memakai standar kartu berjudul (sama dengan Statistik / Input Transaksi) */}
      <CardShell ariaLabel="Pengaturan Asumsi Simulasi" marginBottom={14}>
        <CardHeader
          icon={<Settings size="52%" strokeWidth={2.2} style={{ display: "block" }} />}
          title="Pengaturan Asumsi Simulasi"
          subtitle="Atur parameter simulasi sesuai strategi Anda."
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: s(10, 4) }}>
          <DateField label="Tanggal Mulai" value={form.startDate} onChange={set("startDate")}
            bg={GRAD.blue} icon={<CalendarDays strokeWidth={2.2} style={tileIcon} />} />
          <Field label="Modal Awal" value={form.capital} onChange={set("capital")} suffix="$"
            bg={GRAD.green} icon={<Coins strokeWidth={2.2} style={tileIcon} />} />
          <Field label="Target" value={form.targetRp} onChange={set("targetRp")} suffix="Rp" formatThousands
            bg={GRAD.purple} icon={<Target strokeWidth={2.2} style={tileIcon} />} />
          <Field label="Kurs USD/IDR" value={form.rate} onChange={set("rate")} suffix="Rp" formatThousands
            bg={GRAD.blue} icon={<Percent strokeWidth={2.2} style={tileIcon} />} />
          <Field label="Target Profit Harian" value={form.targetPct} onChange={set("targetPct")} suffix="%"
            bg={GRAD.blue} icon={<TrendingUp strokeWidth={2.2} style={tileIcon} />} />
          <Field label="Batas Loss Harian" value={form.lossPct} onChange={set("lossPct")} suffix="%"
            bg={GRAD.red} icon={<ShieldAlert strokeWidth={2.2} style={tileIcon} />} />
          <Field label="Jarak SL Rata-Rata" value={form.sl} onChange={set("sl")} suffix="$"
            bg={GRAD.blue} icon={<ArrowLeftRight strokeWidth={2.2} style={tileIcon} />} />
          <Field label="Max Layer" value={form.maxLayers} onChange={set("maxLayers")} suffix="x"
            bg={GRAD.indigo} icon={<Layers strokeWidth={2.2} style={tileIcon} />} />
        </div>

        {/* Catatan */}
        <div style={{ display: "flex", alignItems: "center", gap: s(12, 6), marginTop: s(10, 5), borderRadius: s(14, 8), padding: `${s(10, 5)} ${s(12, 6)}`, background: INNER_BG, border: INNER_BORDER }}>
          <span style={{ flex: "0 0 auto", width: s(30, 18), height: s(30, 18), borderRadius: "50%", border: "2px solid #3AA0E0", color: "#3AA0E0", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Info strokeWidth={2.4} style={{ width: "60%", height: "60%", display: "block" }} />
          </span>
          <div style={{ fontSize: s(11.5, 8), lineHeight: 1.4, color: "var(--muted)", minWidth: 0, textAlign: "left" }}>
            Gunakan asumsi yang realistis agar hasil simulasi lebih mendekati kondisi pasar sebenarnya.
          </div>
        </div>

        {/* Tombol aksi */}
        <div style={{ display: "flex", gap: s(10, 4), marginTop: s(10, 5) }}>
          <button
            onClick={exportExcel}
            disabled={!!sim.errors.length}
            style={{
              flex: "1 1 0", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: s(7, 3),
              background: "transparent", border: "1.5px solid var(--gold)", color: "var(--gold)", borderRadius: BTN_RADIUS,
              fontSize: s(14, 9), fontWeight: 800, fontFamily: "inherit", padding: `${s(10, 5)} ${s(8, 4)}`, whiteSpace: "nowrap",
              cursor: sim.errors.length ? "not-allowed" : "pointer", opacity: sim.errors.length ? 0.5 : 1,
            }}
          >
            <Download style={{ width: s(17, 10), height: s(17, 10), flex: "0 0 auto" }} /> Download Excel
          </button>
          <button
            onClick={() => setForm({ ...DEFAULTS, startDate: nextMonday() })}
            style={{
              flex: "1 1 0", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: s(7, 3),
              background: "transparent", border: `1.5px solid ${mix(BLUE, 60)}`, color: "var(--text)", borderRadius: BTN_RADIUS,
              fontSize: s(14, 9), fontWeight: 800, fontFamily: "inherit", padding: `${s(10, 5)} ${s(8, 4)}`, whiteSpace: "nowrap", cursor: "pointer",
            }}
          >
            <RotateCcw style={{ width: s(17, 10), height: s(17, 10), flex: "0 0 auto" }} /> Reset ke default
          </button>
        </div>
      </CardShell>

      {sim.errors.length > 0 ? (
        <div style={{ ...card, border: "1px solid var(--red)", color: "var(--red)", fontSize: 13, lineHeight: 1.5, textAlign: "center" }}>
          {sim.errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      ) : (
        <>
          {/* Hasil */}
          <CardShell ariaLabel="Hasil simulasi" marginBottom={14}>
            <CardHeader icon={<BarChart3 size="52%" strokeWidth={2.2} style={{ display: "block" }} />} title="Hasil (Semua Hari Profit)" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: s(10, 4) }}>
              <ResultTile bg={GRAD.blue} icon={<DollarSign strokeWidth={2.2} style={tileIcon} />} label="Target dalam dolar" value={fmtUsd(sim.targetUsd)} sub={`${String(Math.round(sim.targetUsd / sim.capital))}x modal`} />
              <ResultTile bg={GRAD.green} icon={<CalendarDays strokeWidth={2.2} style={tileIcon} />} label="Hari trading" value={String(sim.dayCount)} sub={`≈ ${(sim.dayCount / DAYS_PER_MONTH).toFixed(1)} bulan`} />
              <ResultTile bg={GRAD.purple} icon={<Target strokeWidth={2.2} style={tileIcon} />} label="Perkiraan tercapai" value={fmtDate(sim.endDate)} valueSize={s(18, 11)} />
              <ResultTile bg={GRAD.blue} icon={<TrendingUp strokeWidth={2.2} style={tileIcon} />} label="Target profit hari ke-1" value={fmtUsd(sim.rows[0].target)} sub={fmtRp(sim.rows[0].target * sim.rate)} />
            </div>
            {!sim.reached && (
              <div style={{ fontSize: s(12, 9), color: "var(--red)", marginTop: s(10, 5), textAlign: "center" }}>
                Tabel harian dibatasi {MAX_DAYS} hari dan target belum tercapai di dalamnya.
              </div>
            )}
          </CardShell>

          {/* Grafik */}
          <CardShell ariaLabel="Pertumbuhan saldo" marginBottom={14}>
            <CardHeader icon={<BarChart3 size="52%" strokeWidth={2.2} style={{ display: "block" }} />} title="Pertumbuhan Saldo ($)" />
            <div style={{ display: "flex", justifyContent: "center", marginBottom: s(10, 5) }}>
              <button
                onClick={() => setLogScale((v) => !v)}
                style={{
                  background: logScale ? mix("var(--gold)", 14) : INNER_BG,
                  border: logScale ? "1px solid var(--gold)" : INNER_BORDER,
                  color: logScale ? "var(--gold)" : "var(--muted)",
                  borderRadius: s(10, 6), padding: `${s(6, 3)} ${s(22, 10)}`, fontSize: s(14, 9.5), fontFamily: "inherit", cursor: "pointer",
                }}
              >
                Skala log
              </button>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={sim.rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={mix(BLUE, 45)} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: axisColor }} stroke={mix(BLUE, 70)} />
                  <YAxis
                    scale={logScale ? "log" : "linear"}
                    domain={logScale ? ["auto", "auto"] : [0, "auto"]}
                    allowDataOverflow
                    tick={{ fontSize: 11, fill: axisColor }}
                    stroke={mix(BLUE, 70)}
                    width={52}
                    tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v))}
                  />
                  <Tooltip
                    contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                    labelFormatter={(d) => `Hari ke-${d}`}
                    formatter={(v) => [fmtUsd(v), "Saldo akhir"]}
                  />
                  <ReferenceLine y={sim.targetUsd} stroke="var(--green)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="end" stroke="var(--gold)" strokeWidth={2.4} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardShell>

          {/* Skenario */}
          <CardShell ariaLabel="Skenario target harian" marginBottom={14}>
            <CardHeader icon={<FileText size="52%" strokeWidth={2.2} style={{ display: "block" }} />} title="Skenario Target Harian" />
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
                      <td className="tj-mono" style={td}>{String(s.days)}</td>
                      <td className="tj-mono" style={td}>{s.months.toFixed(1)}</td>
                      <td className="tj-mono" style={td}>{fmtDate(s.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardShell>

          {/* Milestone */}
          <CardShell ariaLabel="Milestone" marginBottom={14}>
            <CardHeader icon={<Flag size="52%" strokeWidth={2.2} style={{ display: "block" }} />} title="Milestone" subtitle="Dengan target harian di atas." />
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
                      <td className="tj-mono" style={td}>{String(m.days)}</td>
                      <td className="tj-mono" style={td}>{fmtDate(m.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardShell>

          {/* Cek realita */}
          <CardShell ariaLabel="Cek realita" marginBottom={14}>
            <CardHeader icon={<BarChart3 size="52%" strokeWidth={2.2} style={{ display: "block" }} />} title="Cek Realita" subtitle="Kalau tidak semua hari profit." />
            <div style={{ fontSize: s(13, 9), color: "var(--muted)", lineHeight: 1.5, marginBottom: s(10, 5), textAlign: "center" }}>
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
                      <td className="tj-mono" style={td}>{r.days === null ? "Tidak tercapai" : String(r.days)}</td>
                      <td className="tj-mono" style={td}>{r.days === null ? "-" : r.years.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardShell>

          {/* Tabel harian */}
          <CardShell ariaLabel="Tabel harian" marginBottom={14}>
            <CardHeader icon={<CalendarDays size="52%" strokeWidth={2.2} style={{ display: "block" }} />} title="Tabel Harian" />
            <div style={{ fontSize: s(13, 9), color: "var(--muted)", lineHeight: 1.5, marginBottom: s(10, 5), textAlign: "center" }}>
              Tercapai:{" "}
              <span className="tj-mono" style={{ color: "var(--gold)", fontWeight: 600 }}>
                {sim.rows.filter((r) => progress.done[r.day]).length} / {sim.rows.length}
              </span>{" "}
              hari. Status terisi otomatis dari transaksi di Jurnal (sesuai tanggal) dan tetap bisa diubah manual. Status dan catatan tersimpan otomatis.
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
                        <td style={{ ...td, padding: "7px 3px", width: 34 }}>
                          <StatusMark kind="done" active={done} onClick={() => toggleDone(r.day)} label={`Hari ke-${r.day} tercapai`} />
                        </td>
                        <td style={{ ...td, padding: "7px 3px", width: 34 }}>
                          <StatusMark kind="notDone" active={!!progress.notDone[r.day]} onClick={() => toggleNotDone(r.day)} label={`Hari ke-${r.day} tidak tercapai`} />
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
                  width: "100%", marginTop: s(10, 5), padding: `${s(8, 5)} ${s(12, 6)}`, borderRadius: s(10, 6), fontSize: s(13, 10),
                  fontWeight: 600, border: INNER_BORDER, background: INNER_BG, fontFamily: "inherit",
                  color: "var(--muted)", cursor: "pointer",
                }}
              >
                {showAll ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {showAll ? "Tampilkan 30 hari pertama" : `Tampilkan semua ${sim.rows.length} hari`}
              </button>
            )}
          </CardShell>

          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, opacity: 0.85, marginBottom: 8, textAlign: "center" }}>
            Model compounding murni: tanpa withdraw, komisi, spread, atau slippage. Trading Senin–Jumat, libur bursa tidak dihitung. Lot per layer memakai rumus yang sama dengan rekomendasi lot di tab Jurnal.
          </div>
        </>
      )}
    </div>
  );
}
