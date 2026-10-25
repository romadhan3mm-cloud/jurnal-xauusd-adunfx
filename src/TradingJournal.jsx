import React, { useState, useEffect, useCallback, useRef } from "react";
// Jurnal Trading XAUUSD — versi dengan perbandingan bulan
import { Plus, Download, Upload, Trash2, ChevronDown, ChevronUp, MoreVertical, MoreHorizontal, Check, Archive, ArchiveRestore, X, TrendingUp, TrendingDown, Sun, Moon, LogOut, LineChart as ChartIcon, BookOpen, CalendarClock, RefreshCw, Smartphone, Target as TargetIcon } from "lucide-react";
import TradingViewChart from "./TradingViewChart.jsx";
import EconomicCalendar from "./EconomicCalendar.jsx";
import TargetSimulator from "./TargetSimulator.jsx";
import { LogoLockup, PageBackdrop } from "./Brand.jsx";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import * as XLSX from "xlsx";

// Info versi & tahun pembuatan
// APP_VERSION otomatis diambil dari package.json (lihat vite.config.js) —
// jadi cukup ubah versi di package.json saja, tidak perlu diubah manual di sini.
const APP_VERSION = __APP_VERSION__;
const APP_CREATED_YEAR = 2026;

const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;800&family=Poppins:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

html, body { overflow-x: clip; -webkit-text-size-adjust: 100%; touch-action: manipulation; }
.tj-root {
  --bg: #0A1628;
  --surface: #0F2038;
  --surface-raised: #162A47;
  --border: #223A5E;
  --text: #F2F5FA;
  --muted: #8A9BB5;
  --gold: #EDA524;
  --gold-dim: #9A6F1C;
  --green: #3FC37E;
  --red: #EF5B50;
  --gold-grad: linear-gradient(180deg, #F7C766 0%, #E39A12 100%);
  font-family: 'Lato', 'Inter', sans-serif;
  background: radial-gradient(70% 260px at 50% 0%, rgba(30, 70, 120, 0.30), rgba(30, 70, 120, 0) 100%), var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  box-sizing: border-box;
}
.tj-mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
.tj-display { font-family: 'Lato', 'Inter', sans-serif; }
.tj-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.tj-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
.tj-input {
  background: var(--surface-raised);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.tj-input:focus { border-color: var(--gold-dim); }
.tj-input::-webkit-outer-spin-button, .tj-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
/* Kolom panel Simulasi: ukuran seragam, termasuk input tanggal di iOS/Android */
.tj-sim-input {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: 36px;
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
  line-height: 1.2;
}
.tj-sim-input::-webkit-date-and-time-value { text-align: center; min-height: 1.2em; }
.tj-sim-input::-webkit-datetime-edit { text-align: center; }
@media (max-width: 600px) {
  .tj-input, select.tj-input, textarea.tj-input { font-size: 16px; }
}

.tj-root.tj-light {
  background: var(--bg);
  --gold-grad: linear-gradient(180deg, #EDA524 0%, #C98708 100%);
  --bg: #F4F6FA;
  --surface: #FFFFFF;
  --surface-raised: #EDF1F7;
  --border: #DCE3EE;
  --text: #0F2A47;
  --muted: #6B7C93;
  --gold: #C98708;
  --gold-dim: #EDA524;
  --green: #1E8E56;
  --red: #C63B2E;
}
.tj-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tj-theme-toggle:hover { color: var(--gold); border-color: var(--gold-dim); }
.tj-install-btn { color: var(--gold); border-color: var(--gold-dim); }
.tj-install-btn:hover { background: rgba(201,135,8,0.12); }
.tj-hero { position: relative; padding: 18px 16px 16px; text-align: center; }
.tj-hero-brand { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.tj-bar-actions { position: absolute; top: calc(10px + env(safe-area-inset-top, 0px)); right: 28px; z-index: 30; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.tj-bar-row { display: flex; align-items: center; gap: 8px; }
.tj-bar-actions .tj-theme-toggle { width: 28px; height: 28px; }
.tj-hdr { position: sticky; top: 0; z-index: 25; margin: calc(-1 * env(safe-area-inset-top, 0px)) -28px 0; padding: env(safe-area-inset-top, 0px) 28px 0; background: transparent; border-bottom: none; transition: background 0.2s, box-shadow 0.2s; }
.tj-hdr.tj-pinned { background: rgba(10, 22, 40, 0.55); background: radial-gradient(70% 260px at 50% 0%, rgba(30, 70, 120, 0.20), rgba(30, 70, 120, 0) 100%), color-mix(in srgb, var(--bg) 52%, transparent); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.tj-root.tj-light .tj-hdr.tj-pinned { background: rgba(244, 246, 250, 0.6); background: color-mix(in srgb, var(--bg) 55%, transparent); }
.tj-bal { padding: 4px 0 6px; }
.tj-balcard { display: flex; align-items: baseline; justify-content: center; gap: 8px; padding: 2px 0; }
.tj-brandrow { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 0 6px; text-align: center; }
.tj-bar { display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 0 10px; }
.tj-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; background: var(--surface); border-top: 1px solid var(--border); padding-bottom: env(safe-area-inset-bottom, 0px); box-shadow: 0 -6px 14px rgba(0,0,0,0.25); }
.tj-tabbar-in { max-width: 1180px; margin: 0 auto; display: flex; }
.tj-tabbar button { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 9px 0 8px; background: none; border: none; border-top: 2px solid transparent; color: var(--muted); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; }
.tj-tabbar button.on { color: var(--gold); border-top-color: var(--gold); }
.tj-slide-next { animation: tj-slide-r 0.28s ease-out; overflow-x: clip; }
.tj-slide-prev { animation: tj-slide-l 0.28s ease-out; overflow-x: clip; }
@keyframes tj-slide-r { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
@keyframes tj-slide-l { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }
.tj-title { text-align: center; font-size: 10.5px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold); padding-bottom: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--border); }
.tj-footer { text-align: center; font-size: 11px; color: var(--muted); opacity: 0.75; letter-spacing: 0.04em; padding: 30px 0 10px; }
.tj-watermark { text-align: left; font-size: 10.5px; color: var(--muted); opacity: 0.6; letter-spacing: 0.04em; display: flex; align-items: center; gap: 4px; margin: 4px 0 0; }
.tj-user-wrap { position: relative; }
.tj-user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; z-index: 30; max-height: 70vh; overflow-y: auto; background: var(--surface-raised); border: 1px solid var(--border); border-radius: 9px; padding: 10px; min-width: 190px; box-shadow: 0 10px 24px rgba(0,0,0,0.35); }
.tj-user-email { font-size: 11.5px; color: var(--text); word-break: break-all; padding: 4px 6px 10px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
.tj-user-logout-btn { width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 6px; background: none; border: none; color: var(--red); font-size: 12.5px; cursor: pointer; text-align: left; border-radius: 6px; }
.tj-user-logout-btn:hover { background: rgba(239,91,80,0.1); }

.flex { display: flex; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 8px; }
.gap-8 { gap: 32px; }
.animate-spin { animation: tj-spin 1s linear infinite; }
@keyframes tj-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.tj-skel {
  background: linear-gradient(90deg, var(--surface) 25%, var(--surface-raised) 37%, var(--surface) 63%);
  background-size: 400% 100%;
  animation: tj-shimmer 1.4s ease infinite;
  border-radius: 8px;
}
@keyframes tj-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

const MAX_ROWS = 500;

function fmtMoney(n, opts = {}) {
  const v = Number(n) || 0;
  const sign = opts.forceNeg && v > 0 ? "-" : v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatMoneyInputValue(raw, prefix) {
  if (raw === "" || raw === null || raw === undefined) return "";
  const cleaned = String(raw).replace(/[^0-9.]/g, "");
  if (cleaned === "") return "";
  return `${prefix}${cleaned}`;
}

function parseMoneyInputValue(text) {
  // Keyboard numerik iOS (lokal Indonesia) cuma nampilin tanda koma (,) untuk desimal,
  // bukan titik (.) — jadi koma diterima juga di sini dan dianggap sama seperti titik.
  const normalized = text.replace(/,/g, ".");
  const cleaned = normalized.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDayKey(iso) {
  // Pakai komponen tanggal lokal (bukan toISOString/UTC) supaya tidak geser
  // sehari untuk zona waktu positif seperti WIB (UTC+7).
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function monthKeyToLabel(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function monthKeyToShortLabel(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

function todayMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Senin sebagai awal minggu
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function endOfWeek(d) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

// Persentase pertumbuhan dari start baris pertama ke end baris terakhir pada sekumpulan rows (sudah computeRows)
function periodGrowthPercent(list) {
  if (!list.length) return null;
  const first = list[0];
  const last = list[list.length - 1];
  if (!first.start) return null;
  return ((last.end - first.start) / first.start) * 100;
}

// Menghasilkan array Date untuk setiap tanggal real pada bulan "YYYY-MM"
function daysInMonthOf(key) {
  const [y, mo] = key.split("-").map(Number);
  const total = new Date(y, mo, 0).getDate();
  return Array.from({ length: total }, (_, idx) => new Date(y, mo - 1, idx + 1));
}

function computeRows(entries, initialBalance) {
  let bal = initialBalance;
  return entries.map((e) => {
    const start = bal;
    const target = start * 0.03;
    const lossLimit = start * -0.04;
    const end = start + (Number(e.profit) || 0) - (Number(e.loss) || 0) - (Number(e.komisi) || 0) - (Number(e.withdraw) || 0);
    bal = end;
    return { ...e, start, target, lossLimit, end };
  });
}

function computeStats(rows) {
  const totalProfit = rows.reduce((s, r) => s + (Number(r.profit) || 0), 0);
  const totalLoss = rows.reduce((s, r) => s + (Number(r.loss) || 0), 0);
  const totalKomisi = rows.reduce((s, r) => s + (Number(r.komisi) || 0), 0);
  const winTrades = rows.filter((r) => Number(r.profit) > 0).length;
  const lossTrades = rows.filter((r) => Number(r.loss) > 0).length;
  const winrate = winTrades + lossTrades > 0 ? winTrades / (winTrades + lossTrades) : null;
  const rr = totalLoss > 0 ? Math.abs(totalProfit / totalLoss) : null;
  return { totalProfit, totalLoss, totalKomisi, winTrades, lossTrades, winrate, rr };
}

// Asumsi manajemen risiko untuk rekomendasi lot & layer (bisa disesuaikan):
// - Jatah rugi harian: 4% dari modal (sinkron dengan aturan Loss -4% yang sudah ada)
// - Jarak SL rata-rata: $4 (titik tengah dari kebiasaan $3-$5)
// - Target maksimal: 4 layer saat modal masih mencukupi
// - Konversi lot standar gold: 0.01 lot ≈ $1 P/L per $1 pergerakan harga (kontrak 100oz/lot)
const RISK_PCT_PER_DAY = 0.04;
const SL_DISTANCE_USD = 4;
const TARGET_MAX_LAYERS = 4;
const MIN_LOT = 0.01;
const RISK_PER_MIN_LOT = SL_DISTANCE_USD * 1; // risiko $ untuk 0.01 lot dengan asumsi SL di atas

function computeLotRecommendation(capital) {
  if (!capital || capital <= 0) return { lot: "0.01", layers: 0, riskBudget: 0, underMinimum: true };
  const riskBudget = capital * RISK_PCT_PER_DAY;
  const perLayerBudgetAtTarget = riskBudget / TARGET_MAX_LAYERS;
  let layers, lot;
  if (perLayerBudgetAtTarget >= RISK_PER_MIN_LOT) {
    // Modal cukup besar: pertahankan 4 layer, lot yang menyesuaikan naik
    layers = TARGET_MAX_LAYERS;
    const rawLot = MIN_LOT * (perLayerBudgetAtTarget / RISK_PER_MIN_LOT);
    lot = Math.round(rawLot / MIN_LOT) * MIN_LOT;
    if (lot < MIN_LOT) lot = MIN_LOT;
  } else {
    // Modal kecil: lot tetap minimum, layer yang menyesuaikan turun
    lot = MIN_LOT;
    layers = Math.floor(riskBudget / RISK_PER_MIN_LOT);
  }
  const underMinimum = layers < 1;
  if (layers < 1) layers = 1;
  return { lot: lot.toFixed(2), layers, riskBudget, underMinimum };
}

const CAPITAL_LOT_REF_TIERS = [75, 100, 200, 300, 500, 1000, 2000, 5000].map((capital) => ({
  capital,
  ...computeLotRecommendation(capital),
}));

// Ring persentase: bagian terisi = fill, sisanya = track. center = teks di tengah, sub = label kecil.
function StatRing({ pct, center, sub, fill = "var(--green)", track = "var(--red)", centerColor = "var(--text)", size = 88, subNode = null }) {
  const p = pct === null || pct === undefined ? 0 : Math.max(0, Math.min(100, pct));
  const empty = pct === null || pct === undefined;
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
        background: empty ? "var(--border)" : `conic-gradient(${fill} ${p}%, ${track} 0)`,
      }}
    >
      <div style={{ position: "absolute", inset: Math.round(size * 0.1), borderRadius: "50%", background: "var(--surface)" }} />
      <div style={{ position: "relative", textAlign: "center", lineHeight: 1.15 }}>
        <div className="tj-mono" style={{ fontSize: size > 100 ? 24 : 17, fontWeight: 600, color: centerColor }}>{center}</div>
        <div style={{ fontSize: 8.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{sub}</div>
        {subNode}
      </div>
    </div>
  );
}

function StatRowList({ items }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
      {items.map(([label, val, color], i) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, paddingBottom: i < items.length - 1 ? 6 : 0, borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
          <span style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
          <span className="tj-mono" style={{ fontSize: 14, fontWeight: 600, color }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

// Teks tagline yang bisa diklik untuk diubah. Enter / klik di luar = simpan, Esc = batal.
const TAGLINE_MAX_CHARS = 120;
const TAGLINE_MAX_LINES = 3;
function cleanTagline(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .split("\n")
    .slice(0, TAGLINE_MAX_LINES)
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .slice(0, TAGLINE_MAX_CHARS);
}
function EditableTagline({ value, onSave, small = false }) {
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

export default function TradingJournalApp({ userEmail, onLogout } = {}) {
  const [months, setMonths] = useState(null); // { [key]: { initialBalance, entries: [] } }
  const [order, setOrder] = useState([]);
  const [activeMonth, setActiveMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCapitalRef, setShowCapitalRef] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [confirmDeleteFor, setConfirmDeleteFor] = useState(null);
  const [newMonthOpen, setNewMonthOpen] = useState(false);
  const [newMonthBalance, setNewMonthBalance] = useState("100");
  const [selectedDate, setSelectedDate] = useState(() => fmtDayKey(new Date().toISOString()));
  const [theme, setTheme] = useState("dark");
  const [activeView, setActiveView] = useState("journal"); // "journal" | "chart" | "simulasi"
  const [chartMounted, setChartMounted] = useState(false);
  // Header menempel: bayangan saat mulai tergulir, ringkas saat sudah jauh
  const [hdrPinned, setHdrPinned] = useState(false);
  const hdrRef = useRef(null);
  const slideRef = useRef(null);
  const slideDirRef = useRef("next");
  const slideFirstRef = useRef(true);
  const swipeRef = useRef(null);
  useEffect(() => {
    // "Menempel" = bar End Balance sudah menyentuh batas atas layar (setelah area status bar)
    const onScroll = () => {
      const bar = hdrRef.current;
      if (!bar) return;
      setHdrPinned(bar.getBoundingClientRect().top <= 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  useEffect(() => {
    if (slideFirstRef.current) { slideFirstRef.current = false; return; }
    const el = slideRef.current;
    if (!el) return;
    el.classList.remove("tj-slide-next", "tj-slide-prev");
    void el.offsetWidth;
    el.classList.add(slideDirRef.current === "next" ? "tj-slide-next" : "tj-slide-prev");
  }, [activeView]);
  const [fundamentalOpen, setFundamentalOpen] = useState(false);
  const [customTagline, setCustomTagline] = useState("");
  const [addNote, setAddNote] = useState("");
  const [statsMenuOpen, setStatsMenuOpen] = useState(false);
  const [statsStyle, setStatsStyle] = useState("grup"); // "grup" (grup berlabel + ring) | "ring" (ring winrate besar)
  const [balanceChartType, setBalanceChartType] = useState("line"); // "line" | "bar" | "area"
  const [balanceMenuOpen, setBalanceMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [pendingImport, setPendingImport] = useState(null); // { months, order } menunggu konfirmasi
  const [importError, setImportError] = useState("");
  const importFileRef = useRef(null);
  const saveTimer = useRef(null);

  // Deteksi apakah app bisa/sudah di-install (PWA)
  useEffect(() => {
    const standaloneMql = window.matchMedia && window.matchMedia("(display-mode: standalone)");
    const checkStandalone = () =>
      (standaloneMql && standaloneMql.matches) || window.navigator.standalone === true;
    setIsInstalled(checkStandalone());

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    try {
      await installPrompt.userChoice;
    } catch {}
    setInstallPrompt(null);
  };

  // Selalu pastikan tanggal terpilih ada di dalam bulan aktif
  useEffect(() => {
    if (!activeMonth) return;
    const todayKeyNow = fmtDayKey(new Date().toISOString());
    const inActiveMonth = selectedDate && selectedDate.slice(0, 7) === activeMonth;
    if (inActiveMonth) return;
    if (todayKeyNow.slice(0, 7) === activeMonth) {
      setSelectedDate(todayKeyNow);
    } else {
      setSelectedDate(`${activeMonth}-01`);
    }
  }, [activeMonth]);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("journal-data");
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setMonths(parsed.months || {});
          setOrder(parsed.order || []);
          setActiveMonth(parsed.order?.[parsed.order.length - 1] || null);
        } else {
          setMonths({});
          setOrder([]);
        }
      } catch (e) {
        setMonths({});
        setOrder([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load theme preference
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("tj-theme");
        if (result && result.value) setTheme(result.value);
      } catch (e) {
        // no preference saved yet, keep default
      }
    })();
  }, []);

  // Tagline tambahan (bebas diisi sendiri), tampil di bawah "Disiplin · Evaluasi · Konsisten"
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("tj-tagline");
        if (result && typeof result.value === "string") setCustomTagline(result.value);
      } catch (e) {
        // belum ada tagline tersimpan
      }
    })();
  }, []);

  // Pilihan model tampilan statistik
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("tj-stats-style");
        if (result && (result.value === "grup" || result.value === "ring")) setStatsStyle(result.value);
      } catch (e) {
        // belum ada pilihan tersimpan
      }
    })();
  }, []);

  const changeStatsStyle = (next) => {
    setStatsStyle(next);
    setStatsMenuOpen(false);
    window.storage.set("tj-stats-style", next).catch(() => {});
  };

  const saveCustomTagline = (text) => {
    const next = cleanTagline(text.trim());
    setCustomTagline(next);
    window.storage.set("tj-tagline", next).catch(() => {});
  };

  const VIEW_ORDER = ["journal", "simulasi", "chart"];
  const goView = (v) => {
    if (v === activeView) return;
    slideDirRef.current = VIEW_ORDER.indexOf(v) > VIEW_ORDER.indexOf(activeView) ? "next" : "prev";
    if (v === "chart") setChartMounted(true);
    setActiveView(v);
  };
  // Geser kiri/kanan untuk pindah menu — diabaikan kalau sentuhan dimulai di area yang bisa digulir ke samping
  const startsInHScroll = (node) => {
    let el = node;
    while (el && el !== document.body) {
      if (el.nodeType === 1) {
        const tag = el.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
        const ox = window.getComputedStyle(el).overflowX;
        if ((ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth + 2) return true;
      }
      el = el.parentNode;
    }
    return false;
  };
  const onSwipeStart = (e) => {
    if (e.touches.length !== 1) { swipeRef.current = null; return; }
    const t = e.touches[0];
    swipeRef.current = { x: t.clientX, y: t.clientY, blocked: startsInHScroll(e.target) };
  };
  const onSwipeEnd = (e) => {
    const st = swipeRef.current;
    swipeRef.current = null;
    if (!st || st.blocked) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - st.x;
    const dy = t.clientY - st.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    const i = VIEW_ORDER.indexOf(activeView);
    const n = dx < 0 ? i + 1 : i - 1;
    if (n < 0 || n >= VIEW_ORDER.length) return;
    goView(VIEW_ORDER[n]);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.storage.set("tj-theme", next).catch(() => {});
      return next;
    });
  };

  // Ambil ulang data jurnal terbaru dari storage (Supabase), tanpa reload halaman
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const result = await window.storage.get("journal-data");
      if (result && result.value) {
        const parsed = JSON.parse(result.value);
        setMonths(parsed.months || {});
        setOrder(parsed.order || []);
        setActiveMonth((prevActive) => {
          const nextOrder = parsed.order || [];
          return nextOrder.includes(prevActive) ? prevActive : nextOrder[nextOrder.length - 1] || null;
        });
      } else {
        setMonths({});
        setOrder([]);
        setActiveMonth(null);
      }
    } catch (e) {
      console.error("Gagal refresh data:", e);
    } finally {
      // beri jeda singkat supaya animasi ikon terlihat, bukan cuma kedip
      setTimeout(() => setRefreshing(false), 400);
    }
  }, [refreshing]);

  const persist = useCallback((nextMonths, nextOrder) => {
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(
          "journal-data",
          JSON.stringify({ months: nextMonths, order: nextOrder })
        );
      } catch (e) {
        console.error("Gagal menyimpan:", e);
      } finally {
        setSaving(false);
      }
    }, 300);
  }, []);

  // ===== Backup Data (JSON) — untuk jaga-jaga (ganti versi, bug, anomali dll) =====

  // Export seluruh data jurnal (semua bulan) ke file .json yang bisa di-import lagi
  const handleBackupExport = useCallback(() => {
    const payload = {
      app: "Jurnal Trading XAUUSD",
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      months: months || {},
      order: order || [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `jurnal-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [months, order]);

  // User pilih file backup .json — validasi dulu, baru minta konfirmasi (belum langsung menimpa data)
  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset supaya file yang sama bisa dipilih lagi nanti
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed.months !== "object" || !Array.isArray(parsed.order)) {
          setImportError("File tidak valid — bukan file backup Jurnal Trading XAUUSD.");
          return;
        }
        setPendingImport({ months: parsed.months || {}, order: parsed.order || [] });
      } catch (err) {
        setImportError("Gagal membaca file. Pastikan file .json belum rusak/berubah.");
      }
    };
    reader.onerror = () => setImportError("Gagal membaca file.");
    reader.readAsText(file);
  };

  // Konfirmasi diklik — GABUNGKAN isi file backup dengan data yang sudah ada
  // (tidak menimpa/menghapus data sekarang). Bulan yang belum ada akan
  // ditambahkan; bulan yang sudah ada akan digabung entrinya (entri yang
  // sama, dikenali lewat id, tidak diduplikasi).
  const confirmImport = () => {
    if (!pendingImport) return;
    const { months: importedMonths } = pendingImport;

    const mergedMonths = { ...months };
    const mergedOrder = [...order];

    Object.keys(importedMonths).forEach((key) => {
      const imp = importedMonths[key] || {};
      if (mergedMonths[key]) {
        // Bulan sudah ada — gabungkan entri baru saja, data yang sudah ada tetap dipertahankan
        const existingIds = new Set((mergedMonths[key].entries || []).map((e) => e.id));
        const newEntries = (imp.entries || []).filter((e) => !existingIds.has(e.id));
        mergedMonths[key] = {
          ...mergedMonths[key],
          entries: [...(mergedMonths[key].entries || []), ...newEntries],
        };
      } else {
        // Bulan baru dari file backup — tambahkan sebagai bulan baru
        mergedMonths[key] = imp;
        mergedOrder.push(key);
      }
    });

    setMonths(mergedMonths);
    setOrder(mergedOrder);
    setActiveMonth((prev) => (prev && mergedMonths[prev] ? prev : mergedOrder[mergedOrder.length - 1] || null));
    persist(mergedMonths, mergedOrder);
    setPendingImport(null);
    setUserMenuOpen(false);
  };

  const updateMonths = (updater) => {
    setMonths((prev) => {
      const next = updater(prev);
      persist(next, order);
      return next;
    });
  };

  const createMonth = () => {
    const key = todayMonthKey();
    let finalKey = key;
    let n = 2;
    while (months[finalKey]) {
      finalKey = `${key}-${n}`;
      n++;
    }
    const bal = Number(newMonthBalance) || 0;
    const next = { ...months, [finalKey]: { initialBalance: bal, entries: [], archived: false } };
    const nextOrder = [...order, finalKey];
    setMonths(next);
    setOrder(nextOrder);
    setActiveMonth(finalKey);
    persist(next, nextOrder);
    setNewMonthOpen(false);
    setNewMonthBalance("100");
  };

  const addEntry = () => {
    if (!activeMonth || !selectedDate) return;
    const m = months[activeMonth];
    if (m.entries.length >= MAX_ROWS) return;
    // Satu entry per tanggal. Kalau tanggal terpilih sudah punya entry,
    // entry baru otomatis dibuat di tanggal berikutnya yang masih kosong
    // (berguna untuk mencoba grafik & statistik dengan cepat).
    const taken = new Set(m.entries.map((e) => fmtDayKey(e.date)));
    const dayKeys = daysInMonthOf(activeMonth).map((d) => fmtDayKey(d.toISOString()));
    let targetKey = selectedDate;
    if (taken.has(targetKey)) {
      const startIdx = dayKeys.indexOf(selectedDate);
      targetKey = dayKeys.slice(startIdx + 1).find((k) => !taken.has(k));
      if (!targetKey) {
        setAddNote("Sudah sampai akhir bulan — tidak ada tanggal kosong berikutnya.");
        return;
      }
    }
    setAddNote("");
    const now = new Date();
    const [y, mo, d] = targetKey.split("-").map(Number);
    const entryDate = new Date(y, mo - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: entryDate.toISOString(),
      profit: "",
      loss: "",
      komisi: "",
      withdraw: "",
    };
    updateMonths((prev) => ({
      ...prev,
      [activeMonth]: { ...m, entries: [...m.entries, entry] },
    }));
    setSelectedDate(targetKey);
  };

  const updateEntry = (id, field, value) => {
    if (!activeMonth) return;
    const m = months[activeMonth];
    updateMonths((prev) => ({
      ...prev,
      [activeMonth]: {
        ...m,
        entries: m.entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      },
    }));
  };

  const deleteEntry = (id) => {
    if (!activeMonth) return;
    const m = months[activeMonth];
    updateMonths((prev) => ({
      ...prev,
      [activeMonth]: { ...m, entries: m.entries.filter((e) => e.id !== id) },
    }));
  };

  const archiveMonth = (key) => {
    const next = { ...months, [key]: { ...months[key], archived: true } };
    setMonths(next);
    persist(next, order);
    setMenuOpenFor(null);
    if (activeMonth === key) {
      const stillActive = order.filter((k) => k !== key && !next[k]?.archived);
      setActiveMonth(stillActive.length ? stillActive[stillActive.length - 1] : null);
    }
  };

  const restoreMonth = (key) => {
    const next = { ...months, [key]: { ...months[key], archived: false } };
    setMonths(next);
    persist(next, order);
    setActiveMonth(key);
  };

  const deleteMonthPermanent = (key) => {
    const next = { ...months };
    delete next[key];
    const nextOrder = order.filter((k) => k !== key);
    setMonths(next);
    setOrder(nextOrder);
    persist(next, nextOrder);
    setMenuOpenFor(null);
    setConfirmDeleteFor(null);
    if (activeMonth === key) {
      const stillActive = nextOrder.filter((k) => !next[k]?.archived);
      setActiveMonth(stillActive.length ? stillActive[stillActive.length - 1] : null);
    }
  };

  const exportToExcel = async () => {
    if (!activeMonth || !months[activeMonth]) return;
    const m = months[activeMonth];
    const rows = computeRows(m.entries, m.initialBalance);
    const stats = computeStats(rows);

    const header = [
      "No", "Tanggal", "Start Balance ($)", "Target 3% ($)", "Loss -4% ($)",
      "Profit ($)", "Loss -($)", "Komisi -($)", "Withdraw ($)", "End Balance ($)",
    ];
    const data = rows.map((r, i) => [
      i + 1,
      fmtDate(r.date),
      Number(r.start.toFixed(2)),
      Number(r.target.toFixed(2)),
      Number(r.lossLimit.toFixed(2)),
      Number(r.profit) || 0,
      -(Number(r.loss) || 0),
      -(Number(r.komisi) || 0),
      Number(r.withdraw) || 0,
      Number(r.end.toFixed(2)),
    ]);

    const statsBlock = [
      ["Statistics", ""],
      ["Total Profit", Number(stats.totalProfit.toFixed(2))],
      ["Total Loss", -Number(stats.totalLoss.toFixed(2))],
      ["Total Komisi", -Number(stats.totalKomisi.toFixed(2))],
      ["Win Trades", stats.winTrades],
      ["Loss Trades", stats.lossTrades],
      ["Winrate", stats.winrate === null ? "N/A" : `${(stats.winrate * 100).toFixed(1)}%`],
      ["RR", stats.rr === null ? "N/A" : stats.rr.toFixed(2)],
      ["End Balance", Number((rows.length ? rows[rows.length - 1].end : m.initialBalance).toFixed(2))],
    ];

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    XLSX.utils.sheet_add_aoa(ws, statsBlock, { origin: "L1" });
    ws["!cols"] = header.map(() => ({ wch: 16 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, monthKeyToLabel(activeMonth).slice(0, 31));

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const dataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    const opened = window.open(dataUri, "_blank");
    if (!opened) {
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = dataUri;
      a.download = `Jurnal_Trading_${activeMonth}_${dateStr}.xlsx`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading) {
    return (
      <div className={`tj-root ${theme === "light" ? "tj-light" : ""}`}>
        <style>{FONTS_CSS}</style>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "68px 28px 60px" }}>
          {/* Header skeleton */}
          <div className="flex items-start justify-between" style={{ marginBottom: 18 }}>
            <div>
              <div className="tj-skel" style={{ width: 180, height: 21, marginBottom: 8 }} />
              <div className="tj-skel" style={{ width: 70, height: 11 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="tj-skel" style={{ width: 30, height: 30 }} />
              <div className="tj-skel" style={{ width: 30, height: 30 }} />
              <div className="tj-skel" style={{ width: 30, height: 30 }} />
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
            <div className="tj-skel" style={{ width: 90, height: 30 }} />
            <div className="tj-skel" style={{ width: 90, height: 30 }} />
          </div>

          {/* Month tabs skeleton */}
          <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
            <div className="tj-skel" style={{ width: 110, height: 32 }} />
            <div className="tj-skel" style={{ width: 110, height: 32 }} />
            <div className="tj-skel" style={{ width: 100, height: 32 }} />
          </div>

          {/* Summary cards skeleton */}
          <div className="flex items-center gap-2" style={{ marginBottom: 16, flexWrap: "wrap" }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="tj-skel" style={{ flex: "1 1 200px", height: 78 }} />
            ))}
          </div>

          {/* Table skeleton */}
          <div className="tj-skel" style={{ width: "100%", height: 280 }} />
        </div>
      </div>
    );
  }

  const m = activeMonth ? months[activeMonth] : null;
  const rows = m ? computeRows(m.entries, m.initialBalance) : [];
  const stats = m ? computeStats(rows) : null;
  const endBalance = rows.length ? rows[rows.length - 1].end : m ? m.initialBalance : 0;

  const todayKey = fmtDayKey(new Date().toISOString());
  const monthDateOptions = activeMonth ? daysInMonthOf(activeMonth) : [];
  const selectedDateHasEntry = rows.some((r) => fmtDayKey(r.date) === selectedDate);
  const selectedDateIsWeekend = (() => {
    if (!selectedDate) return false;
    const [sy, smo, sd] = selectedDate.split("-").map(Number);
    const dow = new Date(sy, smo - 1, sd).getDay();
    return dow === 0 || dow === 6;
  })();

  // Cross-month comparison data (chronological by key)
  const compareData = [...order]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const mm = months[key];
      if (!mm) return null;
      const mRows = computeRows(mm.entries, mm.initialBalance);
      const mStats = computeStats(mRows);
      const end = mRows.length ? mRows[mRows.length - 1].end : mm.initialBalance;
      const growth = mm.initialBalance !== 0 ? ((end - mm.initialBalance) / mm.initialBalance) * 100 : 0;
      return {
        key,
        label: monthKeyToShortLabel(key),
        fullLabel: monthKeyToLabel(key),
        start: mm.initialBalance,
        end,
        growth,
        profit: mStats.totalProfit,
        loss: mStats.totalLoss,
        winrate: mStats.winrate,
        archived: !!mm.archived,
      };
    })
    .filter(Boolean);

  // Statistik persentase harian / mingguan / bulanan / tahunan
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const dailyRowsForStats = rows.filter((r) => fmtDayKey(r.date) === todayKey);
  const weeklyRowsForStats = rows.filter((r) => {
    const d = new Date(r.date);
    return d >= weekStart && d <= weekEnd;
  });
  const dailyGrowthPct = periodGrowthPercent(dailyRowsForStats);
  const weeklyGrowthPct = periodGrowthPercent(weeklyRowsForStats);
  const monthlyGrowthPct = m && m.initialBalance ? ((endBalance - m.initialBalance) / m.initialBalance) * 100 : null;
  const currentYearPrefix = activeMonth ? activeMonth.split("-")[0] : String(now.getFullYear());
  const yearMonthsForStats = compareData
    .filter((cd) => cd.key.startsWith(`${currentYearPrefix}-`))
    .sort((a, b) => a.key.localeCompare(b.key));
  const yearlyGrowthPct = yearMonthsForStats.length && yearMonthsForStats[0].start
    ? ((yearMonthsForStats[yearMonthsForStats.length - 1].end - yearMonthsForStats[0].start) / yearMonthsForStats[0].start) * 100
    : null;

  const chartColors = theme === "light"
    ? { grid: "#DCE3EE", tick: "#6B7C93", tooltipBg: "#FFFFFF", tooltipBorder: "#DCE3EE", tooltipLabel: "#6B7C93", dotFill: "#F4F6FA", refLine: "#6B7C93" }
    : { grid: "#223A5E", tick: "#8A9BB5", tooltipBg: "#162A47", tooltipBorder: "#223A5E", tooltipLabel: "#8A9BB5", dotFill: "#0A1628", refLine: "#8A9BB5" };

  return (
    <div className={`tj-root ${theme === "light" ? "tj-light" : ""}`}>
      <style>{FONTS_CSS}</style>
      <PageBackdrop light={theme === "light"} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", padding: "12px 28px 110px" }}>
        {/* Header + tab menu + End Balance: menempel di atas saat halaman di-scroll */}
        {/* Header menempel: logo + tagline, lalu End Balance + tombol aksi — ukurannya tetap, tidak berubah saat di-scroll */}
        <div ref={hdrRef} className={`tj-hdr ${hdrPinned ? "tj-pinned" : ""}`}>
          <div className="tj-brandrow">
            <LogoLockup size={46} dark={theme !== "light"} tagline>
              <EditableTagline value={customTagline} onSave={saveCustomTagline} small />
            </LogoLockup>
          </div>
          <div className="tj-bar-actions">
            <div className="tj-bar-row">
            {saving && <span style={{ fontSize: 10, color: "var(--muted)" }}>Menyimpan…</span>}
            {installPrompt && !isInstalled && (
              <button
                className="tj-theme-toggle tj-install-btn"
                onClick={handleInstallClick}
                title="Unduh / install aplikasi"
                aria-label="Unduh aplikasi"
              >
                <Download size={15} />
              </button>
            )}
            {onLogout && (
              <div className="tj-user-wrap">
                <button
                  className="tj-theme-toggle"
                  onClick={() => { setUserMenuOpen((v) => !v); setConfirmLogout(false); }}
                  title="Menu"
                  aria-label="Menu"
                >
                  <MoreVertical size={16} />
                </button>
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".json,application/json"
                  style={{ display: "none" }}
                  onChange={handleImportFileChange}
                />
                {userMenuOpen && (
                  <>
                    <div onClick={() => { setUserMenuOpen(false); setConfirmLogout(false); }} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
                    <div className="tj-user-dropdown">
                      {userEmail && <div className="tj-user-email tj-mono">{userEmail}</div>}
                      {!confirmLogout && (
                        <>
                          <button
                            className="tj-user-logout-btn"
                            style={{ color: "var(--text)" }}
                            onClick={() => { toggleTheme(); setUserMenuOpen(false); }}
                          >
                            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />} {theme === "dark" ? "Tema Terang" : "Tema Gelap"}
                          </button>
                          <button
                            className="tj-user-logout-btn"
                            style={{ color: "var(--text)" }}
                            onClick={handleBackupExport}
                          >
                            <Download size={13} /> Backup Data (.json)
                          </button>
                          <button
                            className="tj-user-logout-btn"
                            style={{ color: "var(--text)" }}
                            onClick={() => importFileRef.current?.click()}
                          >
                            <Upload size={13} /> Import Backup
                          </button>
                          {importError && (
                            <div style={{ fontSize: 10.5, color: "var(--red)", padding: "2px 6px 6px" }}>{importError}</div>
                          )}
                          <a
                            href="/downloads/jurnal-xauusd.apk"
                            download
                            className="tj-user-logout-btn"
                            style={{ color: "var(--text)", textDecoration: "none" }}
                          >
                            <Smartphone size={13} /> Unduh APK Android
                          </a>
                          <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                        </>
                      )}
                      {confirmLogout ? (
                        <div>
                          <div style={{ fontSize: 11.5, color: "var(--text)", padding: "2px 6px 8px" }}>
                            Yakin mau keluar dari akun ini?
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={onLogout}
                              style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 6, padding: "7px 0", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}
                            >
                              Ya, Keluar
                            </button>
                            <button
                              onClick={() => setConfirmLogout(false)}
                              style={{ flex: 1, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 0", fontSize: 11.5, cursor: "pointer" }}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="tj-user-logout-btn" onClick={() => setConfirmLogout(true)}>
                          <LogOut size={13} /> Keluar
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            </div>
            <button
              className="tj-theme-toggle"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Muat ulang data jurnal"
              aria-label="Refresh data"
              style={refreshing ? { cursor: "default", opacity: 0.6 } : undefined}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* End Balance: di luar header, ikut tergulir; tampil di setiap menu (Jurnal / Simulasi / Chart) */}
        {m && (
          <div className="tj-bal">
            <div className="tj-balcard">
              <div style={{ fontSize: 11.5, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>End Balance</div>
              <div className="tj-mono" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.15, color: "var(--gold)", background: "linear-gradient(90deg, var(--gold), #F7C766)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {fmtMoney(endBalance)}
              </div>
            </div>
          </div>
        )}

        <div ref={slideRef} onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd} style={{ minHeight: "55vh", paddingTop: 16 }}>
        {activeView === "simulasi" && <TargetSimulator theme={theme} />}

        {chartMounted && (
          <div style={{ display: activeView === "chart" ? "block" : "none" }}>
            <TradingViewChart theme={theme} />
            <button
              onClick={() => setFundamentalOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                marginTop: 14,
                padding: "9px 14px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              <CalendarClock size={14} />
              Fundamental &amp; News
              <ChevronDown
                size={15}
                style={{
                  transition: "transform 0.2s",
                  transform: fundamentalOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {fundamentalOpen && (
              <div style={{ marginTop: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <EconomicCalendar theme={theme} />
              </div>
            )}
          </div>
        )}

        {activeView === "journal" && (
        <>
        {/* Month tabs */}
        <div className="flex items-center gap-2 tj-scrollbar" style={{ overflowX: "auto", paddingBottom: 8, marginBottom: 6 }}>
          {order.filter((key) => !months[key]?.archived).map((key) => (
            <div key={key} style={{ position: "relative", display: "flex", alignItems: "stretch" }}>
              <button
                onClick={() => setActiveMonth(key)}
                className="tj-mono"
                style={{
                  whiteSpace: "nowrap",
                  padding: "7px 10px 7px 14px",
                  borderRadius: "8px 0 0 8px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  border: `1px solid ${activeMonth === key ? "var(--gold-dim)" : "var(--border)"}`,
                  borderRight: "none",
                  background: activeMonth === key ? "rgba(237,165,36,0.1)" : "var(--surface)",
                  color: activeMonth === key ? "var(--gold)" : "var(--muted)",
                  cursor: "pointer",
                }}
              >
                {monthKeyToLabel(key)}
              </button>
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuPos({ top: rect.bottom + 6, left: rect.left });
                  setMenuOpenFor(menuOpenFor === key ? null : key);
                  setConfirmDeleteFor(null);
                }}
                style={{
                  padding: "7px 10px",
                  borderRadius: "0 8px 8px 0",
                  border: `1px solid ${activeMonth === key ? "var(--gold-dim)" : "var(--border)"}`,
                  background: activeMonth === key ? "rgba(237,165,36,0.1)" : "var(--surface)",
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MoreVertical size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setNewMonthOpen((v) => !v)}
            style={{
              whiteSpace: "nowrap",
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: "1px dashed var(--border)",
              background: "transparent",
              color: "var(--muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={14} /> Bulan Baru
          </button>
        </div>

        {menuOpenFor && menuPos && (
          <>
            <div
              onClick={() => { setMenuOpenFor(null); setConfirmDeleteFor(null); }}
              style={{ position: "fixed", inset: 0, zIndex: 40 }}
            />
            <div
              style={{
                position: "fixed",
                top: menuPos.top,
                left: menuPos.left,
                zIndex: 41,
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
                minWidth: 180,
                boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
              }}
            >
              {confirmDeleteFor === menuOpenFor ? (
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 11.5, color: "var(--text)", marginBottom: 8 }}>Hapus permanen? Data tidak bisa dikembalikan.</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => deleteMonthPermanent(menuOpenFor)} style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 0", fontSize: 11.5, cursor: "pointer" }}>Ya, Hapus</button>
                    <button onClick={() => setConfirmDeleteFor(null)} style={{ flex: 1, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 0", fontSize: 11.5, cursor: "pointer" }}>Batal</button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => archiveMonth(menuOpenFor)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "none", border: "none", color: "var(--text)", fontSize: 12.5, cursor: "pointer", textAlign: "left" }}
                  >
                    <Archive size={13} /> Arsipkan
                  </button>
                  <button
                    onClick={() => setConfirmDeleteFor(menuOpenFor)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "none", border: "none", color: "var(--red)", fontSize: 12.5, cursor: "pointer", textAlign: "left", borderTop: "1px solid var(--border)" }}
                  >
                    <Trash2 size={13} /> Hapus Permanen
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {order.some((key) => months[key]?.archived) && (
          <button
            onClick={() => setShowArchive((v) => !v)}
            style={{ fontSize: 11, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 14, padding: 0 }}
          >
            <Archive size={11} /> Arsip ({order.filter((k) => months[k]?.archived).length}) {showArchive ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        )}

        {showArchive && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
            {Object.entries(
              order
                .filter((key) => months[key]?.archived)
                .reduce((groups, key) => {
                  const year = key.split("-")[0];
                  (groups[year] = groups[year] || []).push(key);
                  return groups;
                }, {})
            )
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([year, keys], gi, garr) => (
                <div key={year} style={{ borderBottom: gi < garr.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ padding: "8px 14px", background: "var(--surface)", fontSize: 10.5, color: "var(--gold)", letterSpacing: "0.05em", fontWeight: 600 }}>
                    {year} <span style={{ color: "var(--muted)", fontWeight: 400 }}>({keys.length} bulan)</span>
                  </div>
                  {keys
                    .sort((a, b) => a.localeCompare(b))
                    .map((key, i, arr) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
                        <span className="tj-mono" style={{ fontSize: 12.5, color: "var(--muted)" }}>{monthKeyToLabel(key)}</span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={() => restoreMonth(key)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--gold)", fontSize: 11.5, cursor: "pointer" }}>
                            <ArchiveRestore size={12} /> Aktifkan
                          </button>
                          <button onClick={() => setConfirmDeleteFor(confirmDeleteFor === key ? null : key)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--red)", fontSize: 11.5, cursor: "pointer" }}>
                            <Trash2 size={12} /> Hapus
                          </button>
                        </div>
                        {confirmDeleteFor === key && (
                          <div style={{ position: "absolute", marginTop: 30, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, zIndex: 10 }}>
                            <div style={{ fontSize: 11.5, marginBottom: 8 }}>Hapus permanen?</div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => deleteMonthPermanent(key)} style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>Ya</button>
                              <button onClick={() => setConfirmDeleteFor(null)} style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>Batal</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        )}

        {newMonthOpen && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Start Balance ($)</span>
            <input
              type="number"
              className="tj-input tj-mono"
              style={{ width: 100 }}
              value={newMonthBalance}
              onChange={(e) => setNewMonthBalance(e.target.value)}
            />
            <button
              onClick={createMonth}
              style={{ background: "var(--gold-grad)", color: "#0A1628", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer" }}
            >
              Buat Bulan Ini
            </button>
          </div>
        )}

        {/* Cross-month comparison */}
        {compareData.length > 1 && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 16, background: "var(--surface)" }}>
            <button
              onClick={() => setShowCompare((v) => !v)}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--surface)", border: "none", borderBottom: showCompare ? "1px solid var(--border)" : "none", color: "var(--gold)", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={13} color="var(--gold)" /> Perbandingan Antar Bulan
              </span>
              {showCompare ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showCompare && (
              <div style={{ padding: "12px 10px 4px" }}>
                <div className="tj-title" style={{ margin: "0 8px 12px" }}>
                  Growth % per Bulan
                </div>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={compareData} margin={{ top: 6, right: 14, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                    <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                    <ReferenceLine y={0} stroke={chartColors.refLine} strokeOpacity={0.6} />
                    <Tooltip
                      contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: chartColors.tooltipLabel, fontSize: 10.5 }}
                      formatter={(v) => [`${Number(v).toFixed(2)}%`, "Growth"]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label}
                    />
                    <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                      {compareData.map((d) => (
                        <Cell key={d.key} fill={d.growth >= 0 ? "#3FC37E" : "#EF5B50"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="tj-scrollbar" style={{ overflowX: "auto", marginTop: 10 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                    <thead>
                      <tr>
                        {["Bulan", "Start", "End Balance", "Growth", "Profit", "Loss", "Winrate"].map((h) => (
                          <th key={h} style={{ padding: "7px 10px", fontSize: 10, fontWeight: 800, color: "var(--muted)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.04em", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {compareData.map((d) => (
                        <tr key={d.key} style={{ opacity: d.key === activeMonth ? 1 : d.archived ? 0.55 : 0.85, background: d.key === activeMonth ? "rgba(237,165,36,0.12)" : "transparent", fontWeight: d.key === activeMonth ? 700 : 400 }}>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--text)", fontWeight: d.key === activeMonth ? 700 : 400, background: d.key === activeMonth ? "rgba(237,165,36,0.12)" : "transparent" }}>
                            {d.fullLabel}
                          </td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{fmtMoney(d.start)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, textAlign: "center", borderBottom: "1px solid var(--border)" }}>{fmtMoney(d.end)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, textAlign: "center", borderBottom: "1px solid var(--border)", color: d.growth >= 0 ? "var(--green)" : "var(--red)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              {d.growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {d.growth.toFixed(2)}%
                            </span>
                          </td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--green)" }}>{fmtMoney(d.profit)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--red)" }}>{d.loss > 0 ? `-${fmtMoney(d.loss).slice(1)}` : fmtMoney(0)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, textAlign: "center", borderBottom: "1px solid var(--border)" }}>{d.winrate === null ? "—" : `${(d.winrate * 100).toFixed(0)}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!m && (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 12 }}>
            Belum ada jurnal bulan. Klik "+ Bulan Baru" untuk mulai.
          </div>
        )}

        {m && (
          <>
            {/* Input entry (1 baris per tanggal) + tabel entries — di atas statistik */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface)", marginBottom: 20 }}>
              <div style={{ padding: 12, background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <div className="tj-title">
                  Input Transaksi
                </div>
                <select
                  className="tj-input tj-mono"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ marginBottom: 12, color: selectedDateIsWeekend ? "#EF5B50" : undefined }}
                >
                  {monthDateOptions.map((d) => {
                    const key = fmtDayKey(d.toISOString());
                    const dow = d.getDay(); // 0 = Minggu, 6 = Sabtu
                    const isWeekend = dow === 0 || dow === 6;
                    return (
                      <option key={key} value={key} style={{ color: isWeekend ? "#EF5B50" : undefined }}>
                        {d.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                        {key === todayKey ? " (hari ini)" : ""}
                      </option>
                    );
                  })}
                </select>

                <div className="flex items-center gap-8" style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={addEntry}
                    title={selectedDateHasEntry ? "Tanggal ini sudah punya transaksi — transaksi baru dibuat di tanggal berikutnya" : "Tambah transaksi untuk tanggal ini"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--gold-grad)",
                      border: "1px solid var(--gold)",
                      color: "#0A1628",
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: "8px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} /> Tambah Transaksi
                  </button>
                  {(addNote || selectedDateHasEntry) && (
                    <span style={{ fontSize: 11.5, color: "var(--muted)", alignSelf: "center" }}>
                      {addNote || "Tanggal ini sudah ada transaksinya — klik Tambah Transaksi untuk lanjut ke tanggal berikutnya."}
                    </span>
                  )}
                  <button
                    onClick={exportToExcel}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid var(--gold-dim)", color: "var(--gold)", fontSize: 12.5, padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}
                  >
                    <Download size={14} /> Export Excel
                  </button>
                </div>
              </div>

              {/* Entries table */}
              <div className="tj-scrollbar" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
                  <thead>
                    <tr style={{ background: "var(--surface)" }}>
                      {["No", "Tanggal", "Start", "Target 3%", "Loss -4%", "Profit ($)", "Loss ($)", "Komisi ($)", "WD ($)", "End Balance", ""].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", fontSize: 10.5, color: "var(--muted)", textAlign: "center", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const dayKey = fmtDayKey(r.date);
                      const prevDayKey = i > 0 ? fmtDayKey(rows[i - 1].date) : null;
                      const isFirstOfDateGroup = dayKey !== prevDayKey;
                      let dateSpan = 1;
                      if (isFirstOfDateGroup) {
                        for (let j = i + 1; j < rows.length && fmtDayKey(rows[j].date) === dayKey; j++) dateSpan++;
                      }
                      return (
                      <tr key={r.id} style={{ borderTop: isFirstOfDateGroup && i > 0 ? "1px solid var(--border)" : "none", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>{i + 1}</td>
                        {isFirstOfDateGroup && (
                          <td className="tj-mono" rowSpan={dateSpan} style={{ padding: "8px 10px", fontSize: 12, whiteSpace: "nowrap", textAlign: "center", verticalAlign: "middle", borderLeft: dateSpan > 1 ? "2px solid var(--gold-dim)" : "none", color: [0, 6].includes(new Date(r.date).getDay()) ? "var(--red)" : undefined }}>{fmtDate(r.date)}</td>
                        )}
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>{fmtMoney(r.start)}</td>
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 12, color: "var(--green)", opacity: 0.85, textAlign: "center" }}>{fmtMoney(r.target)}</td>
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 12, color: "var(--red)", opacity: 0.85, textAlign: "center" }}>{fmtMoney(r.lossLimit)}</td>
                        <td style={{ padding: "8px 6px", textAlign: "center" }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="tj-input tj-mono"
                            placeholder="0"
                            value={formatMoneyInputValue(r.profit, "$")}
                            onChange={(e) => updateEntry(r.id, "profit", parseMoneyInputValue(e.target.value))}
                            style={{ color: "var(--green)", width: 72, textAlign: "center" }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "center" }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="tj-input tj-mono"
                            placeholder="0"
                            value={formatMoneyInputValue(r.loss, "-$")}
                            onChange={(e) => updateEntry(r.id, "loss", parseMoneyInputValue(e.target.value))}
                            style={{ color: "var(--red)", width: 72, textAlign: "center" }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "center" }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="tj-input tj-mono"
                            placeholder="0"
                            value={formatMoneyInputValue(r.komisi, "-$")}
                            onChange={(e) => updateEntry(r.id, "komisi", parseMoneyInputValue(e.target.value))}
                            style={{ color: "var(--red)", width: 72, textAlign: "center" }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "center" }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="tj-input tj-mono"
                            placeholder="0"
                            value={formatMoneyInputValue(r.withdraw, "$")}
                            onChange={(e) => updateEntry(r.id, "withdraw", parseMoneyInputValue(e.target.value))}
                            style={{ width: 72, textAlign: "center" }}
                          />
                        </td>
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 12, fontWeight: 600, textAlign: "center" }}>{fmtMoney(r.end)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <button onClick={() => deleteEntry(r.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "inline-flex" }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={12} style={{ padding: "24px 10px", textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
                          Belum ada entry. Tambahkan trade pertama.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statistik: satu kartu, 2 mode (Grup berlabel / Ring winrate); menu titik tiga di judul untuk ganti mode */}
            {(() => {
              const pctColor = (p) => (p === null ? "var(--muted)" : p >= 0 ? "var(--green)" : "var(--red)");
              const pctText = (p) => (p === null ? "—" : `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`);

              // Porsi profit = profit / (profit + loss)
              const gross = stats.totalProfit + stats.totalLoss;
              const profitShare = gross > 0 ? (stats.totalProfit / gross) * 100 : null;
              const winrateText = stats.winrate === null ? "—" : `${(stats.winrate * 100).toFixed(0)}%`;
              const winratePct = stats.winrate === null ? null : stats.winrate * 100;
              const lossText = stats.totalLoss > 0 ? `-${fmtMoney(stats.totalLoss).slice(1)}` : fmtMoney(0);
              const komisiText = stats.totalKomisi > 0 ? `-${fmtMoney(stats.totalKomisi).slice(1)}` : fmtMoney(0);
              const rrText = stats.rr === null ? "—" : `${stats.rr.toFixed(2)}x`;

              const growthItems = [
                ["Harian", dailyGrowthPct],
                ["Mingguan", weeklyGrowthPct],
                ["Bulanan", monthlyGrowthPct],
                ["Tahunan", yearlyGrowthPct],
              ];

              const growthGrid = (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 8px", textAlign: "center" }}>
                  {growthItems.map(([label, pct]) => (
                    <div key={label}>
                      <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                      <div className="tj-mono" style={{ fontSize: 14, fontWeight: 600, color: pctColor(pct) }}>{pctText(pct)}</div>
                    </div>
                  ))}
                </div>
              );

              const sectionTitle = (text) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold)" }}>
                  {text}
                  <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>
              );

              return (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px 16px", marginBottom: 20 }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 22, paddingBottom: 8, marginBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold)" }}>Statistik</span>
                    <button
                      onClick={() => setStatsMenuOpen((v) => !v)}
                      title="Ubah tampilan statistik"
                      aria-label="Ubah tampilan statistik"
                      aria-haspopup="menu"
                      aria-expanded={statsMenuOpen}
                      style={{ position: "absolute", right: 0, top: "calc(50% - 4px)", transform: "translateY(-50%)", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 22, background: "none", border: "none", borderRadius: 6, color: "var(--muted)", opacity: 0.7, cursor: "pointer", padding: 0 }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {statsMenuOpen && (
                      <>
                        <div onClick={() => setStatsMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
                        <div role="menu" style={{ position: "absolute", right: 0, top: "100%", zIndex: 30, minWidth: 170, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 9, padding: 4, boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
                          <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 10px 4px" }}>Tampilan statistik</div>
                          {[["grup", "Grup berlabel"], ["ring", "Ring winrate"]].map(([key, label]) => (
                            <button
                              key={key}
                              role="menuitemradio"
                              aria-checked={statsStyle === key}
                              onClick={() => changeStatsStyle(key)}
                              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", background: statsStyle === key ? "rgba(237,165,36,0.1)" : "none", border: "none", borderRadius: 6, color: statsStyle === key ? "var(--gold)" : "var(--text)", fontSize: 12.5, cursor: "pointer", textAlign: "left" }}
                            >
                              {label}
                              {statsStyle === key && <Check size={13} />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {statsStyle === "ring" ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <StatRing
                          size={118}
                          pct={winratePct}
                          center={winrateText}
                          sub="Winrate"
                          subNode={
                            <div className="tj-mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                              <span style={{ color: "var(--green)" }}>{stats.winTrades}W</span> · <span style={{ color: "var(--red)" }}>{stats.lossTrades}L</span>
                            </div>
                          }
                        />
                        <StatRowList
                          items={[
                            ["Profit", fmtMoney(stats.totalProfit), "var(--green)"],
                            ["Loss", lossText, "var(--red)"],
                            ["Komisi", komisiText, "var(--red)"],
                            ["RR", rrText, "var(--text)"],
                          ]}
                        />
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>{growthGrid}</div>
                    </>
                  ) : (
                    <>
                      <div>
                        {sectionTitle("Hasil")}
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <StatRing pct={profitShare} center={profitShare === null ? "—" : `${profitShare.toFixed(0)}%`} sub="Porsi profit" centerColor="var(--green)" />
                          <StatRowList
                            items={[
                              ["Profit", fmtMoney(stats.totalProfit), "var(--green)"],
                              ["Loss", lossText, "var(--red)"],
                              ["Komisi", komisiText, "var(--red)"],
                            ]}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                        {sectionTitle("Performa")}
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <StatRing pct={winratePct} center={winrateText} sub="Winrate" />
                          <StatRowList
                            items={[
                              ["Win", stats.winTrades, "var(--green)"],
                              ["Loss", stats.lossTrades, "var(--red)"],
                              ["RR", rrText, "var(--text)"],
                            ]}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>{growthGrid}</div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Balance growth chart */}
            {rows.length > 0 && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", padding: "10px 14px 8px", marginBottom: 20 }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 22, paddingBottom: 8, marginBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold)" }}>Pertumbuhan Saldo</span>
                  <button
                    onClick={() => setBalanceMenuOpen((v) => !v)}
                    title="Ubah tampilan grafik"
                    aria-label="Ubah tampilan grafik"
                    aria-haspopup="menu"
                    aria-expanded={balanceMenuOpen}
                    style={{ position: "absolute", right: 0, top: "calc(50% - 4px)", transform: "translateY(-50%)", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 22, background: "none", border: "none", borderRadius: 6, color: "var(--muted)", opacity: 0.7, cursor: "pointer", padding: 0 }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {balanceMenuOpen && (
                    <>
                      <div onClick={() => setBalanceMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
                      <div role="menu" style={{ position: "absolute", right: 0, top: "100%", zIndex: 30, minWidth: 170, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 9, padding: 4, boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
                        <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 10px 4px" }}>Tampilan grafik</div>
                        {[["line", "Garis"], ["bar", "Batang"], ["area", "Area"]].map(([key, label]) => (
                          <button
                            key={key}
                            role="menuitemradio"
                            aria-checked={balanceChartType === key}
                            onClick={() => { setBalanceChartType(key); setBalanceMenuOpen(false); }}
                            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", background: balanceChartType === key ? "rgba(237,165,36,0.1)" : "none", border: "none", borderRadius: 6, color: balanceChartType === key ? "var(--gold)" : "var(--text)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                          >
                            {label}
                            {balanceChartType === key && <Check size={13} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  {balanceChartType === "bar" ? (
                    <BarChart
                      data={[
                        { label: "Start", balance: m.initialBalance },
                        ...rows.map((r, i) => ({ label: `#${i + 1}`, balance: r.end, date: fmtDate(r.date) })),
                      ]}
                      margin={{ top: 6, right: 14, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid stroke={chartColors.grid} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                      <ReferenceLine y={m.initialBalance} stroke={chartColors.refLine} strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: chartColors.tooltipLabel, fontSize: 10.5 }}
                        itemStyle={{ color: "#EDA524" }}
                        formatter={(v) => [`$${Number(v).toFixed(2)}`, "Balance"]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                      />
                      <Bar dataKey="balance" fill="#EDA524" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  ) : balanceChartType === "area" ? (
                    <AreaChart
                      data={[
                        { label: "Start", balance: m.initialBalance },
                        ...rows.map((r, i) => ({ label: `#${i + 1}`, balance: r.end, date: fmtDate(r.date) })),
                      ]}
                      margin={{ top: 6, right: 14, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="balanceAreaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EDA524" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#EDA524" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={chartColors.grid} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                      <ReferenceLine y={m.initialBalance} stroke={chartColors.refLine} strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: chartColors.tooltipLabel, fontSize: 10.5 }}
                        itemStyle={{ color: "#EDA524" }}
                        formatter={(v) => [`$${Number(v).toFixed(2)}`, "Balance"]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                      />
                      <Area type="monotone" dataKey="balance" stroke="#EDA524" strokeWidth={2} fill="url(#balanceAreaFill)" dot={{ r: 3, fill: chartColors.dotFill, stroke: "#EDA524", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  ) : (
                    <LineChart
                      data={[
                        { label: "Start", balance: m.initialBalance },
                        ...rows.map((r, i) => ({ label: `#${i + 1}`, balance: r.end, date: fmtDate(r.date) })),
                      ]}
                      margin={{ top: 6, right: 14, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid stroke={chartColors.grid} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                      <ReferenceLine y={m.initialBalance} stroke={chartColors.refLine} strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: chartColors.tooltipLabel, fontSize: 10.5 }}
                        itemStyle={{ color: "#EDA524" }}
                        formatter={(v) => [`$${Number(v).toFixed(2)}`, "Balance"]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                      />
                      <Line type="monotone" dataKey="balance" stroke="#EDA524" strokeWidth={2} dot={{ r: 3, fill: chartColors.dotFill, stroke: "#EDA524", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {/* Capital lot reference */}
            <div style={{ marginTop: 16, border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface)" }}>
              {/* Rekomendasi live berdasarkan saldo berjalan saat ini */}
              {(() => {
                const rec = computeLotRecommendation(endBalance);
                return (
                  <div style={{ padding: "12px 14px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                    <div className="tj-title">
                      Rekomendasi Untuk Saldo Saat Ini · {fmtMoney(endBalance)}
                    </div>
                    <div style={{ display: "flex", gap: 0 }}>
                      <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9.5, color: "var(--muted)", marginBottom: 3 }}>Lot / Layer</div>
                        <div className="tj-mono" style={{ fontSize: 15, fontWeight: 600 }}>{rec.lot}</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9.5, color: "var(--muted)", marginBottom: 3 }}>Max Layer</div>
                        <div className="tj-mono" style={{ fontSize: 15, fontWeight: 600 }}>{rec.layers}</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 9.5, color: "var(--muted)", marginBottom: 3 }}>Budget Rugi/Hari</div>
                        <div className="tj-mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--red)" }}>{fmtMoney(-rec.riskBudget)}</div>
                      </div>
                    </div>
                    {rec.underMinimum && (
                      <div style={{ fontSize: 10.5, color: "var(--red)", textAlign: "center", marginTop: 8 }}>
                        ⚠ Modal terlalu kecil untuk 1 layer penuh sesuai jatah rugi 4% — pakai 0.01 lot dengan ekstra hati-hati, atau pertimbangkan tunggu modal pulih dulu.
                      </div>
                    )}
                    <div style={{ fontSize: 9.5, color: "var(--muted)", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
                      Asumsi: SL rata-rata ${SL_DISTANCE_USD}, jatah rugi {(RISK_PCT_PER_DAY * 100).toFixed(0)}%/hari, target maks {TARGET_MAX_LAYERS} layer, 0.01 lot ≈ $1 per $1 pergerakan harga. Sesuaikan lagi kalau beda dengan gaya trading/broker kamu.
                    </div>
                  </div>
                );
              })()}
              <button
                onClick={() => setShowCapitalRef((v) => !v)}
                style={{ width: "100%", position: "relative", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 14px", background: "var(--surface)", border: "none", color: "var(--gold)", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
              >
                <span>Capital Lot Reference</span>
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", display: "inline-flex" }}>
                  {showCapitalRef ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>
              {showCapitalRef && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Capital ($)", "Lot Size", "Max Layers"].map((h) => (
                        <th key={h} style={{ padding: "7px 12px", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center", borderTop: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CAPITAL_LOT_REF_TIERS.map((row) => (
                      <tr key={row.capital} className="tj-mono" style={{ background: Math.abs(row.capital - endBalance) < 50 ? "rgba(237,165,36,0.18)" : "transparent" }}>
                        <td style={{ padding: "7px 12px", fontSize: 12, borderTop: "1px solid var(--border)", textAlign: "center" }}>${row.capital}</td>
                        <td style={{ padding: "7px 12px", fontSize: 12, borderTop: "1px solid var(--border)", textAlign: "center" }}>{row.lot}</td>
                        <td style={{ padding: "7px 12px", fontSize: 12, borderTop: "1px solid var(--border)", textAlign: "center" }}>{row.layers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
        </>
        )}

        </div>

        {/* Footer: hak cipta & versi, di bawah dan rata tengah (tampil di semua tab) */}
        <div className="tj-footer">
          © {APP_CREATED_YEAR} adunfx <span style={{ opacity: 0.5, margin: "0 4px" }}>·</span>
          <span className="tj-mono">v{APP_VERSION}</span>
        </div>
      </div>

      {/* Menu bawah (tetap): Jurnal / Simulasi / Chart */}
      <nav className="tj-tabbar" role="tablist" aria-label="Menu utama">
        <div className="tj-tabbar-in">
          {[["journal", "Jurnal", BookOpen], ["simulasi", "Simulasi", TargetIcon], ["chart", "Chart", ChartIcon]].map(([k, label, Ic]) => (
            <button key={k} role="tab" aria-selected={activeView === k} className={activeView === k ? "on" : ""} onClick={() => goView(k)}>
              <Ic size={20} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Modal konfirmasi Import Backup — muncul setelah file .json dipilih & valid */}
      {pendingImport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 22,
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Upload size={16} color="var(--gold)" />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Import Data Backup</h3>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.5, margin: "0 0 6px" }}>
              File ini berisi <strong>{Object.keys(pendingImport.months || {}).length} bulan</strong> data jurnal.
            </p>
            <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 16px" }}>
              Data dari file ini akan <strong style={{ color: "var(--text)" }}>digabungkan</strong> dengan data jurnal yang sudah ada sekarang (tabel, grafik, statistik) — bulan yang sudah ada tidak akan hilang atau tertimpa, entri yang sama tidak akan dobel.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={confirmImport}
                style={{ flex: 1, background: "var(--gold-grad)", color: "#0A1628", border: "none", borderRadius: 7, padding: "9px 0", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
              >
                Ya, Gabungkan & Import
              </button>
              <button
                onClick={() => setPendingImport(null)}
                style={{ flex: 1, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 0", fontSize: 12.5, cursor: "pointer" }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
