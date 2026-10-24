import React, { useState, useEffect, useCallback, useRef } from "react";
// Jurnal Trading XAUUSD — versi dengan sesi trading & perbandingan bulan
import { Plus, Download, Upload, Trash2, ChevronDown, ChevronUp, MoreVertical, Archive, ArchiveRestore, X, Check, TrendingUp, TrendingDown, Lock, Sun, Moon, LogOut, LineChart as ChartIcon, BookOpen, CalendarClock, RefreshCw, Smartphone, Target as TargetIcon } from "lucide-react";
import TradingViewChart from "./TradingViewChart.jsx";
import EconomicCalendar from "./EconomicCalendar.jsx";
import TargetSimulator from "./TargetSimulator.jsx";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import * as XLSX from "xlsx";

// Info versi & tahun pembuatan
// APP_VERSION otomatis diambil dari package.json (lihat vite.config.js) —
// jadi cukup ubah versi di package.json saja, tidak perlu diubah manual di sini.
const APP_VERSION = __APP_VERSION__;
const APP_CREATED_YEAR = 2026;

const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');

.tj-root {
  --bg: #0A0D10;
  --surface: #12161C;
  --surface-raised: #171D25;
  --border: #232A34;
  --text: #ECE9E2;
  --muted: #7C828C;
  --gold: #C6A15B;
  --gold-dim: #8A7240;
  --green: #3FC37E;
  --red: #EF5B50;
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  box-sizing: border-box;
}
.tj-mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
.tj-display { font-family: 'Space Grotesk', sans-serif; }
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
  --bg: #F6F4EF;
  --surface: #FFFFFF;
  --surface-raised: #EFEBE2;
  --border: #DDD7C9;
  --text: #201C15;
  --muted: #837C6E;
  --gold: #A9793A;
  --gold-dim: #C6A15B;
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
.tj-install-btn:hover { background: rgba(169,121,58,0.12); }
.tj-watermark { text-align: left; font-size: 10.5px; color: var(--muted); opacity: 0.6; letter-spacing: 0.04em; display: flex; align-items: center; gap: 4px; margin: 4px 0 0; }
.tj-user-wrap { position: relative; }
.tj-user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; z-index: 30; background: var(--surface-raised); border: 1px solid var(--border); border-radius: 9px; padding: 10px; min-width: 190px; box-shadow: 0 10px 24px rgba(0,0,0,0.35); }
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

const SESSIONS = [
  { id: "asia", label: "Asia" },
  { id: "london", label: "London" },
  { id: "newyork", label: "New York" },
];

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

function sessionLabel(id) {
  return SESSIONS.find((s) => s.id === id)?.label || "-";
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
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => fmtDayKey(new Date().toISOString()));
  const [theme, setTheme] = useState("dark");
  const [activeView, setActiveView] = useState("journal"); // "journal" | "chart" | "simulasi"
  const [chartMounted, setChartMounted] = useState(false);
  const [fundamentalOpen, setFundamentalOpen] = useState(false);
  const [showPercentStats, setShowPercentStats] = useState(true);
  const [balanceChartType, setBalanceChartType] = useState("line"); // "line" | "bar" | "area"
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
    setSelectedSession(null);
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
    if (!activeMonth || !selectedSession || !selectedDate) return;
    const m = months[activeMonth];
    if (m.entries.length >= MAX_ROWS) return;
    const usedForDate = m.entries.filter((e) => fmtDayKey(e.date) === selectedDate).map((e) => e.session);
    if (usedForDate.includes(selectedSession)) return;
    // Jam saat ini dipakai supaya urutan antar sesi di tanggal yang sama tetap konsisten,
    // tanpa mengubah tanggal kalendernya (tetap tanggal yang dipilih di dropdown).
    const now = new Date();
    const [y, mo, d] = selectedDate.split("-").map(Number);
    const entryDate = new Date(y, mo - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: entryDate.toISOString(),
      session: selectedSession,
      profit: "",
      loss: "",
      komisi: "",
      withdraw: "",
    };
    updateMonths((prev) => ({
      ...prev,
      [activeMonth]: { ...m, entries: [...m.entries, entry] },
    }));
    setSelectedSession(null);
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
      "No", "Tanggal", "Sesi", "Start Balance ($)", "Target 3% ($)", "Loss -4% ($)",
      "Profit ($)", "Loss -($)", "Komisi -($)", "Withdraw ($)", "End Balance ($)",
    ];
    const data = rows.map((r, i) => [
      i + 1,
      fmtDate(r.date),
      sessionLabel(r.session),
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
  const usedSessionsForSelectedDate = m
    ? m.entries.filter((e) => fmtDayKey(e.date) === selectedDate).map((e) => e.session)
    : [];
  const sessionsExhausted = usedSessionsForSelectedDate.length >= SESSIONS.length;
  const monthDateOptions = activeMonth ? daysInMonthOf(activeMonth) : [];
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
    ? { grid: "#DDD7C9", tick: "#837C6E", tooltipBg: "#FFFFFF", tooltipBorder: "#DDD7C9", tooltipLabel: "#837C6E", dotFill: "#F6F4EF", refLine: "#837C6E" }
    : { grid: "#232A34", tick: "#7C828C", tooltipBg: "#171D25", tooltipBorder: "#232A34", tooltipLabel: "#7C828C", dotFill: "#0A0D10", refLine: "#7C828C" };

  return (
    <div className={`tj-root ${theme === "light" ? "tj-light" : ""}`}>
      <style>{FONTS_CSS}</style>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "68px 28px 60px" }}>
        {/* Header */}
        <div className="flex items-start justify-between" style={{ marginBottom: 18 }}>
          <div>
            <h1 className="tj-display" style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 }}>
              Jurnal Trading <span style={{ color: "var(--gold)" }}>XAUUSD</span>
            </h1>
            <div className="tj-watermark">
              <span style={{ fontSize: 12 }}>©</span> {APP_CREATED_YEAR} adunfx
              <span style={{ opacity: 0.5, margin: "0 2px" }}>·</span>
              <span className="tj-mono">v{APP_VERSION}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            <button
              className="tj-theme-toggle"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Muat ulang data jurnal"
              aria-label="Refresh data"
              style={refreshing ? { cursor: "default", opacity: 0.6 } : undefined}
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              className="tj-theme-toggle"
              onClick={toggleTheme}
              title={theme === "dark" ? "Tukar ke tema terang" : "Tukar ke tema gelap"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {onLogout && (
              <div className="tj-user-wrap">
                <button
                  className="tj-theme-toggle"
                  onClick={() => { setUserMenuOpen((v) => !v); setConfirmLogout(false); }}
                  title="Akun"
                  aria-label="Akun"
                >
                  <LogOut size={15} />
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
        </div>

        {/* View tabs: Jurnal / Chart / Simulasi */}
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <button
            onClick={() => setActiveView("journal")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: `1px solid ${activeView === "journal" ? "var(--gold-dim)" : "var(--border)"}`,
              background: activeView === "journal" ? "rgba(198,161,91,0.1)" : "var(--surface)",
              color: activeView === "journal" ? "var(--gold)" : "var(--muted)",
              cursor: "pointer",
            }}
          >
            <BookOpen size={14} /> Jurnal
          </button>
          <button
            onClick={() => { setActiveView("chart"); setChartMounted(true); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: `1px solid ${activeView === "chart" ? "var(--gold-dim)" : "var(--border)"}`,
              background: activeView === "chart" ? "rgba(198,161,91,0.1)" : "var(--surface)",
              color: activeView === "chart" ? "var(--gold)" : "var(--muted)",
              cursor: "pointer",
            }}
          >
            <ChartIcon size={14} /> Chart
          </button>
          <button
            onClick={() => setActiveView("simulasi")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: `1px solid ${activeView === "simulasi" ? "var(--gold-dim)" : "var(--border)"}`,
              background: activeView === "simulasi" ? "rgba(198,161,91,0.1)" : "var(--surface)",
              color: activeView === "simulasi" ? "var(--gold)" : "var(--muted)",
              cursor: "pointer",
            }}
          >
            <TargetIcon size={14} /> Simulasi
          </button>
        </div>

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
              <div style={{ marginTop: 10 }}>
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
                  background: activeMonth === key ? "rgba(198,161,91,0.1)" : "var(--surface)",
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
                  background: activeMonth === key ? "rgba(198,161,91,0.1)" : "var(--surface)",
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
              style={{ background: "var(--gold)", color: "#0A0D10", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer" }}
            >
              Buat Bulan Ini
            </button>
          </div>
        )}

        {/* Cross-month comparison */}
        {compareData.length > 1 && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
            <button
              onClick={() => setShowCompare((v) => !v)}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--surface)", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={13} color="var(--gold)" /> Perbandingan Antar Bulan
              </span>
              {showCompare ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showCompare && (
              <div style={{ padding: "12px 10px 4px" }}>
                <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "0 8px 10px" }}>
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
                          <th key={h} style={{ padding: "7px 10px", fontSize: 10, color: "var(--muted)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.03em", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {compareData.map((d) => (
                        <tr key={d.key} style={{ opacity: d.key === activeMonth ? 1 : d.archived ? 0.55 : 0.85 }}>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, borderBottom: "1px solid var(--border)", color: d.key === activeMonth ? "var(--gold)" : "var(--text)" }}>
                            {d.fullLabel}
                          </td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{fmtMoney(d.start)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, borderBottom: "1px solid var(--border)" }}>{fmtMoney(d.end)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, borderBottom: "1px solid var(--border)", color: d.growth >= 0 ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
                            {d.growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {d.growth.toFixed(2)}%
                          </td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, borderBottom: "1px solid var(--border)", color: "var(--green)" }}>{fmtMoney(d.profit)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, borderBottom: "1px solid var(--border)", color: "var(--red)" }}>{d.loss > 0 ? `-${fmtMoney(d.loss).slice(1)}` : fmtMoney(0)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 12, borderBottom: "1px solid var(--border)" }}>{d.winrate === null ? "—" : `${(d.winrate * 100).toFixed(0)}%`}</td>
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
            {/* End balance hero */}
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>End Balance</div>
              <div className="tj-mono" style={{ fontSize: 34, fontWeight: 600, color: "var(--gold)", background: "linear-gradient(90deg, var(--gold), #E8CE94)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {fmtMoney(endBalance)}
              </div>
            </div>

            {/* Stats strip */}
            <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", marginBottom: 8 }}>
              Statistik
            </div>
            <div className="tj-scrollbar" style={{ display: "flex", gap: 0, overflowX: "auto", marginBottom: 20, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)" }}>
              {[
                ["Total Profit", fmtMoney(stats.totalProfit), "var(--green)"],
                ["Total Loss", stats.totalLoss > 0 ? `-${fmtMoney(stats.totalLoss).slice(1)}` : fmtMoney(0), "var(--red)"],
                ["Total Komisi", stats.totalKomisi > 0 ? `-${fmtMoney(stats.totalKomisi).slice(1)}` : fmtMoney(0), "var(--red)"],
                ["Win", stats.winTrades, "var(--text)"],
                ["Loss", stats.lossTrades, "var(--text)"],
                ["Winrate", stats.winrate === null ? "—" : `${(stats.winrate * 100).toFixed(0)}%`, "var(--text)"],
                ["RR", stats.rr === null ? "—" : `${stats.rr.toFixed(2)}x`, "var(--text)"],
              ].map(([label, val, color], i) => (
                <div key={label} style={{ flex: "1 0 90px", padding: "10px 12px", borderRight: i < 6 ? "1px solid var(--border)" : "none", textAlign: "center" }}>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3, textAlign: "center" }}>{label}</div>
                  <div className="tj-mono" style={{ fontSize: 14, fontWeight: 600, color, textAlign: "center" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Statistik persentase periode */}
            <button
              onClick={() => setShowPercentStats((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>
                Statistik Persentase
              </span>
              {showPercentStats ? <ChevronUp size={13} color="var(--muted)" /> : <ChevronDown size={13} color="var(--muted)" />}
            </button>
            {showPercentStats && (
              <div className="tj-scrollbar" style={{ display: "flex", gap: 0, overflowX: "auto", marginBottom: 20, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)" }}>
                {[
                  ["Harian", dailyGrowthPct],
                  ["Mingguan", weeklyGrowthPct],
                  ["Bulanan", monthlyGrowthPct],
                  ["Tahunan", yearlyGrowthPct],
                ].map(([label, pct], i) => (
                  <div key={label} style={{ flex: "1 0 90px", padding: "10px 12px", borderRight: i < 3 ? "1px solid var(--border)" : "none", textAlign: "center" }}>
                    <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3, textAlign: "center" }}>{label}</div>
                    <div className="tj-mono" style={{ fontSize: 14, fontWeight: 600, color: pct === null ? "var(--muted)" : pct >= 0 ? "var(--green)" : "var(--red)", textAlign: "center" }}>
                      {pct === null ? "—" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Balance growth chart */}
            {rows.length > 0 && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", padding: "14px 10px 6px", marginBottom: 20 }}>
                <div className="flex items-center justify-between" style={{ padding: "0 8px 10px" }}>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Pertumbuhan Saldo
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[
                      ["line", "Garis"],
                      ["bar", "Batang"],
                      ["area", "Area"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setBalanceChartType(key)}
                        style={{
                          padding: "3px 9px",
                          borderRadius: 6,
                          fontSize: 10.5,
                          fontWeight: 600,
                          border: `1px solid ${balanceChartType === key ? "var(--gold-dim)" : "var(--border)"}`,
                          background: balanceChartType === key ? "rgba(198,161,91,0.1)" : "transparent",
                          color: balanceChartType === key ? "var(--gold)" : "var(--muted)",
                          cursor: "pointer",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
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
                        itemStyle={{ color: "#C6A15B" }}
                        formatter={(v) => [`$${Number(v).toFixed(2)}`, "Balance"]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                      />
                      <Bar dataKey="balance" fill="#C6A15B" radius={[3, 3, 0, 0]} />
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
                          <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#C6A15B" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={chartColors.grid} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                      <ReferenceLine y={m.initialBalance} stroke={chartColors.refLine} strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: chartColors.tooltipLabel, fontSize: 10.5 }}
                        itemStyle={{ color: "#C6A15B" }}
                        formatter={(v) => [`$${Number(v).toFixed(2)}`, "Balance"]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                      />
                      <Area type="monotone" dataKey="balance" stroke="#C6A15B" strokeWidth={2} fill="url(#balanceAreaFill)" dot={{ r: 3, fill: chartColors.dotFill, stroke: "#C6A15B", strokeWidth: 2 }} activeDot={{ r: 5 }} />
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
                        itemStyle={{ color: "#C6A15B" }}
                        formatter={(v) => [`$${Number(v).toFixed(2)}`, "Balance"]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                      />
                      <Line type="monotone" dataKey="balance" stroke="#C6A15B" strokeWidth={2} dot={{ r: 3, fill: chartColors.dotFill, stroke: "#C6A15B", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {/* Tanggal Entry + Sesi + tabel entries — digabung jadi satu panel, input di atas */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: 12, background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                  Tanggal Entry
                </div>
                <select
                  className="tj-input tj-mono"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedSession(null); }}
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

                <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                  Sesi {sessionsExhausted && <span style={{ color: "var(--red)" }}>· jatah 3x untuk tanggal ini sudah habis</span>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SESSIONS.map((s) => {
                    const used = usedSessionsForSelectedDate.includes(s.id);
                    const active = selectedSession === s.id;
                    return (
                      <button
                        key={s.id}
                        disabled={used}
                        onClick={() => setSelectedSession(active ? null : s.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          flex: "1 1 0",
                          minWidth: 110,
                          padding: "7px 12px",
                          borderRadius: 7,
                          fontSize: 12.5,
                          textAlign: "center",
                          cursor: used ? "not-allowed" : "pointer",
                          border: `1px solid ${active ? "var(--gold)" : used ? "var(--border)" : "var(--border)"}`,
                          background: active ? "rgba(198,161,91,0.14)" : used ? "var(--surface-raised)" : "transparent",
                          color: used ? "var(--muted)" : active ? "var(--gold)" : "var(--text)",
                          opacity: used ? 0.55 : 1,
                        }}
                      >
                        {used ? <Lock size={12} /> : active ? <Check size={12} /> : <span style={{ width: 12, height: 12, borderRadius: 3, border: "1px solid var(--muted)", display: "inline-block" }} />}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-8" style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={addEntry}
                    disabled={!selectedSession}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: selectedSession ? "var(--gold)" : "var(--surface-raised)",
                      border: `1px solid ${selectedSession ? "var(--gold)" : "var(--border)"}`,
                      color: selectedSession ? "#0A0D10" : "var(--muted)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: "8px 14px",
                      borderRadius: 8,
                      cursor: selectedSession ? "pointer" : "not-allowed",
                    }}
                  >
                    <Plus size={14} /> Tambah Entry
                  </button>
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
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                  <thead>
                    <tr style={{ background: "var(--surface)" }}>
                      {["No", "Tanggal", "Sesi", "Start", "Target 3%", "Loss -4%", "Profit ($)", "Loss ($)", "Komisi ($)", "WD ($)", "End Balance", ""].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", fontSize: 10.5, color: "var(--muted)", textAlign: "center", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
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
                        <td style={{ padding: "8px 10px", fontSize: 11, whiteSpace: "nowrap", textAlign: "center" }}>
                          <span style={{ display: "inline-block", width: 72, background: "rgba(198,161,91,0.12)", color: "var(--gold)", padding: "3px 0", borderRadius: 5, fontSize: 10.5, textAlign: "center" }}>
                            {sessionLabel(r.session)}
                          </span>
                        </td>
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


            {/* Capital lot reference */}
            <div style={{ marginTop: 16, border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              {/* Rekomendasi live berdasarkan saldo berjalan saat ini */}
              {(() => {
                const rec = computeLotRecommendation(endBalance);
                return (
                  <div style={{ padding: "12px 14px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", marginBottom: 8 }}>
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
                style={{ width: "100%", position: "relative", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 14px", background: "var(--surface)", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}
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
                        <th key={h} style={{ padding: "7px 12px", fontSize: 10.5, color: "var(--muted)", textAlign: "center", borderTop: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CAPITAL_LOT_REF_TIERS.map((row) => (
                      <tr key={row.capital} className="tj-mono" style={{ background: Math.abs(row.capital - endBalance) < 50 ? "var(--gold-dim)" : "transparent" }}>
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
                style={{ flex: 1, background: "var(--gold)", color: "#0A0D10", border: "none", borderRadius: 7, padding: "9px 0", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
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
