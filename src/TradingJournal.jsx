import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
// TraderLogs — jurnal trading XAUUSD, versi dengan perbandingan bulan
import { Plus, Download, Upload, Trash2, ChevronDown, ChevronUp, MoreVertical, MoreHorizontal, Check, Archive, ArchiveRestore, X, TrendingUp, TrendingDown, Sun, Moon, LogOut, LineChart as ChartIcon, BookOpen, RefreshCw, Target as TargetIcon, ChevronLeft, ChevronRight, CalendarDays, ShieldCheck, ShieldAlert, AlertTriangle, Newspaper } from "lucide-react";
import TradingViewChart from "./TradingViewChart.jsx";
import AINews from "./AINews.jsx";
import TargetSimulator from "./TargetSimulator.jsx";
import Splash from "./Splash.jsx";
import { LogoLockup, PageBackdrop, saveThemeLocal, getThemeLocal, hasThemeLocal, needsLookReset } from "./Brand.jsx";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import * as XLSX from "xlsx";
import { MAX_IMPORT_BYTES, parseBackupText, mergeJournals, sanitizeJournal, buildBackupPayload, downloadBlob, timestampForFile, dateForFile } from "./backupUtils.js";

// Info versi & tahun pembuatan
// APP_VERSION otomatis diambil dari package.json (lihat vite.config.js) —
// jadi cukup ubah versi di package.json saja, tidak perlu diubah manual di sini.
const APP_VERSION = __APP_VERSION__;
const APP_CREATED_YEAR = 2026;

import { FONTS_CSS } from "./tjStyles.js";
import {
  MAX_ROWS, RISK_PCT_PER_DAY, SL_DISTANCE_USD, TARGET_MAX_LAYERS, CAPITAL_LOT_REF_TIERS,
  fmtMoney, formatMoneyInputValue, parseMoneyInputValue, fmtDate, fmtDayKey,
  monthKeyToLabel, monthKeyToShortLabel, todayMonthKey, startOfWeek, endOfWeek,
  periodGrowthPercent, daysInMonthOf, computeRows, computeStats, computeLotRecommendation, computeDailyRiskGuard,
} from "./journalMath.js";
import { StatRing, StatRowList, EditableTagline, cleanTagline, UserAvatar } from "./journalWidgets.jsx";

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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => todayMonthKey());
  const [theme, setTheme] = useState(getThemeLocal()); // "dark" | "light"
  const [activeView, setActiveView] = useState("journal"); // "journal" | "chart" | "simulasi" | "ai-news"
  const [chartMounted, setChartMounted] = useState(false);
  // Header menempel: bayangan saat mulai tergulir, ringkas saat sudah jauh
  const [hdrPinned, setHdrPinned] = useState(false);
  const hdrRef = useRef(null);
  const slideRef = useRef(null);
  const slideDirRef = useRef("next");
  const slideFirstRef = useRef(true);
  const swipeRef = useRef(null);
  useEffect(() => {
    // Header terkunci (position: fixed) di tepi atas; latar blur-nya muncul begitu halaman mulai tergulir
    const onScroll = () => setHdrPinned(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Header fixed keluar dari alur halaman, jadi tingginya diukur untuk spacer di bawahnya
  const [hdrH, setHdrH] = useState(96);
  useLayoutEffect(() => {
    const el = hdrRef.current;
    if (!el) return undefined;
    const upd = () => setHdrH(el.offsetHeight || 96);
    upd();
    let ro = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(upd); ro.observe(el); }
    window.addEventListener("resize", upd);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", upd); };
  }, [loading]);
  useEffect(() => {
    if (slideFirstRef.current) { slideFirstRef.current = false; return; }
    const el = slideRef.current;
    if (!el) return;
    el.classList.remove("tj-slide-next", "tj-slide-prev");
    void el.offsetWidth;
    el.classList.add(slideDirRef.current === "next" ? "tj-slide-next" : "tj-slide-prev");
  }, [activeView]);
  const [customTagline, setCustomTagline] = useState("");
  const [addNote, setAddNote] = useState("");
  const [statsMenuOpen, setStatsMenuOpen] = useState(false);
  const [statsStyle, setStatsStyle] = useState("grup"); // "grup" (grup berlabel + ring) | "ring" (ring winrate besar)
  const [balanceChartType, setBalanceChartType] = useState("line"); // "line" | "bar" | "area"
  const [balanceMenuOpen, setBalanceMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutUnsaved, setLogoutUnsaved] = useState(false); // ada perubahan yang belum terkirim saat mau keluar
  const [loggingOut, setLoggingOut] = useState(false);
  const [mergeNotice, setMergeNotice] = useState(null);      // ringkasan bagian yang tidak ikut saat "Gabungkan"
  const [pendingImport, setPendingImport] = useState(null); // { months, order } menunggu konfirmasi
  const [importError, setImportError] = useState("");
  const [importUndo, setImportUndo] = useState(null); // snapshot sebelum import terakhir, untuk Urungkan
  const [saveError, setSaveError] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [exportDialog, setExportDialog] = useState(null); // { scope: "month" | "all", includeArchived }
  const [conflict, setConflict] = useState(false);   // data di server berubah dari perangkat lain saat kita punya perubahan belum tersimpan
  const [resolving, setResolving] = useState(false);
  const conflictRef = useRef(false);
  const serverStampRef = useRef(null);               // updated_at terakhir yang kita lihat di server
  const canSaveRef = useRef(false);        // false sampai jurnal berhasil dimuat
  const pendingSaveRef = useRef(null);     // perubahan yang belum terkirim: { months, order }
  const inFlightRef = useRef(false);       // sedang menulis ke server (hindari tulis tumpang-tindih)
  const journalRef = useRef({ months: null, order: [] }); // data terbaru, selalu segar (anti closure basi)
  const importFileRef = useRef(null);
  const [txMenuOpen, setTxMenuOpen] = useState(false); // menu titik tiga di kartu Input Transaksi
  const saveTimer = useRef(null);

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

  // Muat jurnal dari storage. PENTING: kalau gagal (bukan sekadar belum ada data), JANGAN
  // anggap jurnal kosong — penyimpanan dikunci supaya edit berikutnya tidak menimpa data asli di server.
  const loadJournal = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await window.storage.getWithMeta("journal-data");
      serverStampRef.current = result ? result.updatedAt : null;
      if (result && result.value) {
        const parsed = JSON.parse(result.value);
        setMonths(parsed.months || {});
        setOrder(parsed.order || []);
        setActiveMonth(parsed.order?.[parsed.order.length - 1] || null);
      } else {
        // Benar-benar belum ada data (akun baru) — aman untuk mulai menyimpan
        setMonths({});
        setOrder([]);
      }
      canSaveRef.current = true;
    } catch (e) {
      console.error("Gagal memuat jurnal:", e);
      canSaveRef.current = false;
      setLoadError(e?.message || "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJournal(); }, [loadJournal]);

  // Load theme preference
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("tj-theme");
        if (needsLookReset()) {
          // Tampilan baru: sekali saja kembali ke tema terang, lalu pilihan user dihormati lagi
          setTheme("light");
          saveThemeLocal("light");
          window.storage.set("tj-theme", "light").catch(() => {});
        } else if (hasThemeLocal()) {
          // Pilihan di perangkat ini (termasuk yang dipilih di halaman login) jadi acuan,
          // supaya tema di luar dan di dalam aplikasi selalu sama. Server ikut disamakan.
          const local = getThemeLocal();
          setTheme(local);
          if (!result || result.value !== local) window.storage.set("tj-theme", local).catch(() => {});
        } else if (result && result.value) {
          // Perangkat baru tanpa pilihan tersimpan: ikuti pilihan dari server
          setTheme(result.value);
          saveThemeLocal(result.value);
        }
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

  const VIEW_ORDER = ["journal", "simulasi", "chart", "ai-news"];
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
      saveThemeLocal(next);
      return next;
    });
  };

  // Terapkan data jurnal dari server ke tampilan, tetap di bulan aktif bila masih ada
  const applyServerResult = useCallback((result) => {
    serverStampRef.current = result ? result.updatedAt : null;
    if (result && result.value) {
      const parsed = JSON.parse(result.value);
      const nextOrder = parsed.order || [];
      setMonths(parsed.months || {});
      setOrder(nextOrder);
      setActiveMonth((prevActive) => (nextOrder.includes(prevActive) ? prevActive : nextOrder[nextOrder.length - 1] || null));
    } else {
      setMonths({});
      setOrder([]);
      setActiveMonth(null);
    }
  }, []);

  // Ambil ulang data jurnal terbaru dari storage (Supabase), tanpa reload halaman
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      // Jangan timpa perubahan lokal yang belum tersimpan: kirim dulu, dan batalkan refresh kalau gagal/bentrok
      if (pendingSaveRef.current) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        await writeNowRef.current();
        if (pendingSaveRef.current) return;
      }
      applyServerResult(await window.storage.getWithMeta("journal-data"));
    } catch (e) {
      console.error("Gagal refresh data:", e);
    } finally {
      // beri jeda singkat supaya animasi ikon terlihat, bukan cuma kedip
      setTimeout(() => setRefreshing(false), 400);
    }
  }, [refreshing, applyServerResult]);

  // Tulis perubahan tertunda ke server. Satu tulisan pada satu waktu (berurutan), dan kalau gagal
  // datanya DISIMPAN untuk dicoba lagi (saat online lagi, app dibuka lagi, atau tombol "Coba lagi").
  const writeNow = useCallback(async () => {
    if (inFlightRef.current || conflictRef.current) return;
    inFlightRef.current = true;
    try {
      while (pendingSaveRef.current) {
        const payload = pendingSaveRef.current;
        pendingSaveRef.current = null;
        try {
          const res = await window.storage.setIfMatch("journal-data", JSON.stringify(payload), serverStampRef.current);
          if (!res.ok) {
            // Perangkat lain sudah menyimpan versi yang lebih baru — jangan menimpa diam-diam
            if (!pendingSaveRef.current) pendingSaveRef.current = payload;
            conflictRef.current = true;
            setConflict(true);
            break;
          }
          serverStampRef.current = res.updatedAt;
          setSaveError(false);
        } catch (e) {
          console.error("Gagal menyimpan:", e);
          if (!pendingSaveRef.current) pendingSaveRef.current = payload;
          setSaveError(true);
          break;
        }
      }
    } finally {
      inFlightRef.current = false;
      setSaving(false);
    }
  }, []);
  const writeNowRef = useRef(writeNow);
  writeNowRef.current = writeNow;

  const persist = useCallback((nextMonths, nextOrder) => {
    if (!canSaveRef.current) return; // jurnal belum berhasil dimuat — jangan menulis apa pun
    pendingSaveRef.current = { months: nextMonths, order: nextOrder };
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (conflictRef.current) return; // tunggu user memilih cara menyelesaikan bentrok
    saveTimer.current = setTimeout(() => writeNowRef.current(), 300);
  }, []);

  const flushSave = useCallback(() => {
    if (!pendingSaveRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    writeNowRef.current();
  }, []);

  // Pilihan user saat terjadi bentrok antar-perangkat
  const resolveConflict = useCallback(async (choice) => {
    setResolving(true);
    try {
      const server = await window.storage.getWithMeta("journal-data");
      const local = pendingSaveRef.current;
      if (choice === "server") {
        // Buang perubahan lokal, pakai versi server
        pendingSaveRef.current = null;
        applyServerResult(server);
      } else if (choice === "merge") {
        // Versi server diutamakan; entri/bulan yang hanya ada di perangkat ini ditambahkan
        let base = { months: {}, order: [] };
        if (server && server.value) {
          const p = JSON.parse(server.value);
          base = { months: p.months || {}, order: p.order || [] };
        }
        const localClean = local ? sanitizeJournal(local.months, local.order) : { months: {}, order: [], skipped: { months: 0, entries: 0 } };
        const merged = mergeJournals(base.months, base.order, localClean);
        if (merged.summary.changedEntries > 0 || merged.summary.dateConflicts > 0) setMergeNotice(merged.summary);
        serverStampRef.current = server ? server.updatedAt : null;
        setMonths(merged.months);
        setOrder(merged.order);
        setActiveMonth((prev) => (prev && merged.months[prev] ? prev : merged.order[merged.order.length - 1] || null));
        journalRef.current = { months: merged.months, order: merged.order };
        pendingSaveRef.current = { months: merged.months, order: merged.order };
      } else {
        // "mine": timpa server dengan versi di perangkat ini
        serverStampRef.current = server ? server.updatedAt : null;
      }
      conflictRef.current = false;
      setConflict(false);
      if (pendingSaveRef.current) { setSaving(true); await writeNowRef.current(); }
    } catch (e) {
      console.error("Gagal menyelesaikan bentrok:", e);
    } finally {
      setResolving(false);
    }
  }, [applyServerResult]);

  // Keluar akun dengan aman: kirim dulu perubahan yang tertunda. Kalau masih ada yang gagal terkirim
  // (offline / bentrok), jangan keluar diam-diam — beri peringatan, user yang memutuskan.
  const handleLogout = useCallback(async (force = false) => {
    if (!force && pendingSaveRef.current) {
      setLoggingOut(true);
      try {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        for (let i = 0; i < 20 && inFlightRef.current; i++) await new Promise((r) => setTimeout(r, 150));
        if (pendingSaveRef.current) await writeNowRef.current();
      } catch (e) {
        console.error("Gagal menyimpan sebelum keluar:", e);
      }
      setLoggingOut(false);
      if (pendingSaveRef.current) { setLogoutUnsaved(true); return; }
    }
    if (onLogout) onLogout();
  }, [onLogout]);

  // Saat app kembali aktif: kalau tidak ada perubahan lokal yang tertunda dan versi server lebih baru
  // (mis. kamu mengisi jurnal dari HP lalu membuka laptop), muat otomatis supaya tidak bekerja di data basi.
  const lastRemoteCheckRef = useRef(0);
  const checkRemote = useCallback(async () => {
    if (!canSaveRef.current || pendingSaveRef.current || inFlightRef.current || conflictRef.current) return;
    const nowMs = Date.now();
    if (nowMs - lastRemoteCheckRef.current < 5000) return;
    lastRemoteCheckRef.current = nowMs;
    try {
      const stamp = await window.storage.peekUpdatedAt("journal-data");
      if (!stamp || stamp === serverStampRef.current) return;
      if (pendingSaveRef.current || inFlightRef.current) return;
      const server = await window.storage.getWithMeta("journal-data");
      if (pendingSaveRef.current || inFlightRef.current) return; // user keburu mengedit — biar alur bentrok yang menangani
      applyServerResult(server);
    } catch (e) {
      console.error("Gagal cek versi server:", e);
    }
  }, [applyServerResult]);

  // Kirim langsung saat app disembunyikan/ditutup (jangan menunggu jeda 300 ms), dan coba lagi saat kembali aktif/online
  useEffect(() => {
    const onVisibility = () => {
      flushSave(); // disembunyikan: kirim sekarang; kembali aktif: coba ulang bila ada yang tertunda
      if (document.visibilityState === "visible") checkRemote();
    };
    const onFocus = () => checkRemote();
    const onBeforeUnload = (e) => {
      if (pendingSaveRef.current) { flushSave(); e.preventDefault(); e.returnValue = ""; }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushSave);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", flushSave);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushSave);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", flushSave);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [flushSave, checkRemote]);

  // Simpan salinan data terbaru di ref (dibaca oleh updateMonths dll supaya tidak memakai data basi)
  useEffect(() => { journalRef.current = { months, order }; }, [months, order]);

  // ===== Backup Data (JSON) — untuk jaga-jaga (ganti versi, bug, anomali dll) =====

  // Export seluruh data jurnal (semua bulan) ke file .json yang bisa di-import lagi
  const handleBackupExport = useCallback(() => {
    if (!months || !order.length) {
      setImportError("Belum ada data untuk di-backup.");
      return;
    }
    setImportError("");
    const payload = buildBackupPayload(APP_VERSION, months, order);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    downloadBlob(blob, `traderlogs-backup-${timestampForFile()}.json`);
    setUserMenuOpen(false);
  }, [months, order]);

  // User pilih file backup .json — validasi & bersihkan dulu, tampilkan ringkasan, baru minta konfirmasi
  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset supaya file yang sama bisa dipilih lagi nanti
    if (!file) return;
    setImportError("");
    if (file.size > MAX_IMPORT_BYTES) {
      setImportError("File terlalu besar untuk file backup TraderLogs.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseBackupText(String(reader.result));
        const { summary } = mergeJournals(months || {}, order, imported);
        setPendingImport({ imported, summary, fileName: file.name });
        setTxMenuOpen(false);
      } catch (err) {
        setImportError(err.message || "Gagal membaca file.");
      }
    };
    reader.onerror = () => setImportError("Gagal membaca file.");
    reader.readAsText(file);
  };

  // Konfirmasi diklik — GABUNGKAN isi file backup dengan data yang sudah ada
  // (tidak menimpa/menghapus data sekarang). Snapshot data sebelum import
  // disimpan supaya bisa di-Urungkan.
  const confirmImport = () => {
    if (!pendingImport) return;
    const { months: mergedMonths, order: mergedOrder, summary } = mergeJournals(months || {}, order, pendingImport.imported);
    setImportUndo({ months, order, activeMonth, summary });
    setMonths(mergedMonths);
    setOrder(mergedOrder);
    setActiveMonth((prev) => (prev && mergedMonths[prev] ? prev : mergedOrder[mergedOrder.length - 1] || null));
    persist(mergedMonths, mergedOrder);
    journalRef.current = { months: mergedMonths, order: mergedOrder };
    setPendingImport(null);
    setUserMenuOpen(false);
  };

  const undoImport = () => {
    if (!importUndo) return;
    setMonths(importUndo.months);
    setOrder(importUndo.order);
    setActiveMonth(importUndo.activeMonth);
    persist(importUndo.months, importUndo.order);
    setImportUndo(null);
  };

  // Selalu bekerja dari data TERBARU (journalRef), bukan dari closure render lama, dan memanggil
  // persist di luar updater React (side effect tidak boleh di dalam updater).
  const updateMonths = (updater) => {
    const prev = journalRef.current.months || {};
    const next = updater(prev);
    if (next === prev) return;
    journalRef.current = { ...journalRef.current, months: next };
    setMonths(next);
    persist(next, journalRef.current.order);
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
    const m = (journalRef.current.months || months)[activeMonth];
    if (!m || m.entries.length >= MAX_ROWS) return;
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
    updateMonths((prev) => {
      const pm = prev[activeMonth];
      if (!pm) return prev;
      return { ...prev, [activeMonth]: { ...pm, entries: [...pm.entries, entry] } };
    });
    setSelectedDate(targetKey);
  };

  const updateEntry = (id, field, value) => {
    if (!activeMonth) return;
    updateMonths((prev) => {
      const pm = prev[activeMonth];
      if (!pm) return prev;
      return { ...prev, [activeMonth]: { ...pm, entries: pm.entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)) } };
    });
  };

  const deleteEntry = (id) => {
    if (!activeMonth) return;
    updateMonths((prev) => {
      const pm = prev[activeMonth];
      if (!pm) return prev;
      return { ...prev, [activeMonth]: { ...pm, entries: pm.entries.filter((e) => e.id !== id) } };
    });
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

  // Bangun satu sheet Excel dari satu bulan
  const buildMonthSheet = (m) => {
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
    return ws;
  };

  // Nama sheet Excel: maks 31 karakter, tanpa []:*?/\ dan harus unik
  const safeSheetName = (label, used) => {
    const base = label.replace(/[\[\]:*?/\\]/g, " ").trim().slice(0, 28) || "Bulan";
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) { name = `${base} (${n++})`; }
    used.add(name.toLowerCase());
    return name;
  };

  // Tulis workbook sebagai file (Blob → unduh). Sebelumnya memakai data-URI di window.open,
  // yang diblokir Chrome dan bisa membuka tab kosong — Blob jauh lebih andal.
  const saveWorkbook = (wb, filename) => {
    const arr = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    downloadBlob(blob, filename);
  };

  // Nama file: "Jurnal Trading_<jenis>_<tanggal unduh dd-mm-yyyy>.xlsx"
  //   Jurnal Trading_Bulan ini saja (Oktober 2026)_26-10-2026.xlsx
  //   Jurnal Trading_Semua bulan_26-10-2026.xlsx
  //   Jurnal Trading_Semua bulan (arsip)_26-10-2026.xlsx   ← bulan arsip ikut
  const exportToExcel = () => {
    if (!activeMonth || !months[activeMonth]) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, buildMonthSheet(months[activeMonth]), safeSheetName(monthKeyToLabel(activeMonth), new Set()));
    saveWorkbook(wb, `Jurnal Trading_Bulan ini saja (${monthKeyToLabel(activeMonth)})_${dateForFile()}.xlsx`);
  };

  // Export semua bulan (satu sheet per bulan) dalam satu file
  // Export beberapa bulan sekaligus (satu sheet per bulan). Bulan arsip hanya ikut kalau dipilih.
  const exportAllToExcel = (includeArchived) => {
    const keys = order.filter((k) => months && months[k] && (includeArchived || !months[k].archived));
    if (!keys.length) return;
    const wb = XLSX.utils.book_new();
    const used = new Set();
    keys.forEach((key) => {
      XLSX.utils.book_append_sheet(wb, buildMonthSheet(months[key]), safeSheetName(monthKeyToLabel(key), used));
    });
    saveWorkbook(wb, `Jurnal Trading_Semua bulan${includeArchived ? " (arsip)" : ""}_${dateForFile()}.xlsx`);
  };

  // Satu pintu Export Excel: kalau cuma ada satu bulan langsung unduh, kalau lebih tampilkan pilihan
  const openExport = () => {
    if (!months || !order.length) return;
    if (order.length <= 1) { exportToExcel(); return; }
    setExportDialog({ scope: "month", includeArchived: false });
  };

  const confirmExport = () => {
    if (!exportDialog) return;
    if (exportDialog.scope === "month") exportToExcel();
    else exportAllToExcel(exportDialog.includeArchived);
    setExportDialog(null);
  };

  if (!loading && loadError) {
    return (
      <div className={`tj-root ${theme === "light" ? "tj-light" : ""}`}>
        <style>{FONTS_CSS}</style>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, color: "var(--text)" }}>Jurnal gagal dimuat</h2>
          <p style={{ margin: "0 0 6px", fontSize: 13, lineHeight: 1.55, color: "var(--muted)" }}>
            Data kamu aman di server — tidak ada yang diubah atau dihapus. Penyimpanan dikunci sampai jurnal berhasil dimuat.
          </p>
          <p className="tj-mono" style={{ margin: "0 0 20px", fontSize: 11, color: "var(--red)", wordBreak: "break-word" }}>{loadError}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={loadJournal}
              style={{ background: "var(--gold-grad)", color: "#0A1628", border: "none", borderRadius: 7, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Coba lagi
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 22px", fontSize: 13, cursor: "pointer" }}
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    // Sambungan dari splash di App.jsx: tampilan sama persis, jadi hanya terlihat satu splash.
    return <Splash light={getThemeLocal() !== "dark"} instant message="Memuat jurnal…" />;
  }

  const m = activeMonth ? months[activeMonth] : null;
  const rows = m ? computeRows(m.entries, m.initialBalance) : [];
  const stats = m ? computeStats(rows) : null;
  const endBalance = rows.length ? rows[rows.length - 1].end : m ? m.initialBalance : 0;

  const todayKey = fmtDayKey(new Date().toISOString());
  const currentMonthData = (months || {})[todayMonthKey()] || null;
  const riskGuard = currentMonthData
    ? computeDailyRiskGuard(currentMonthData.entries, currentMonthData.initialBalance, todayKey, RISK_PCT_PER_DAY)
    : { todayStartBalance: 0, netPnl: 0, lossUsed: 0, limit: 0, remaining: 0, usedPct: 0, status: "unavailable", tradeDaysLogged: 0 };
  const monthDateOptions = activeMonth ? daysInMonthOf(activeMonth) : [];
  const calendarMonthKey = calendarMonth || activeMonth || todayMonthKey();
  const [calYear, calMonthNum] = calendarMonthKey.split("-").map(Number);
  const calendarFirstDay = new Date(calYear, calMonthNum - 1, 1);
  const calendarDaysCount = new Date(calYear, calMonthNum, 0).getDate();
  const calendarOffset = (calendarFirstDay.getDay() + 6) % 7; // Senin sebagai kolom pertama
  const calendarCells = Array.from({ length: Math.ceil((calendarOffset + calendarDaysCount) / 7) * 7 }, (_, i) => {
    const day = i - calendarOffset + 1;
    return day < 1 || day > calendarDaysCount ? null : `${calendarMonthKey}-${String(day).padStart(2, "0")}`;
  });
  const transactionDateKeys = new Set(Object.values(months || {}).flatMap((monthData) => (monthData?.entries || []).map((entry) => fmtDayKey(entry.date))));
  const changeCalendarMonth = (delta) => {
    const d = new Date(calYear, calMonthNum - 1 + delta, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const chooseCalendarDate = (key) => {
    const monthKey = key.slice(0, 7);
    if (months?.[monthKey]) {
      setActiveMonth(monthKey);
      setSelectedDate(key);
      setCalendarOpen(false);
    } else {
      setAddNote("Belum ada jurnal untuk bulan ini. Pilih bulan yang sudah tersedia terlebih dahulu.");
    }
  };
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
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", padding: "0 28px 48px" }}>
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
            {saving && <span style={{ fontSize: 11, color: "var(--muted)" }}>Menyimpan…</span>}
            {!saving && saveError && (
              <button
                onClick={() => { setSaving(true); writeNow(); }}
                style={{ fontSize: 11, color: "var(--red)", background: "none", border: "1px solid var(--red)", borderRadius: 6, padding: "2px 7px", cursor: "pointer" }}
                title="Perubahan terakhir belum tersimpan ke server. Ketuk untuk mencoba lagi."
              >
                Gagal menyimpan · Coba lagi
              </button>
            )}
            {onLogout && (
              <div className="tj-user-wrap">
                <button
                  className="tj-theme-toggle"
                  onClick={() => { setUserMenuOpen((v) => !v); setConfirmLogout(false); setLogoutUnsaved(false); }}
                  title="Menu"
                  aria-label="Menu"
                >
                  <MoreVertical size={16} />
                </button>
                {userMenuOpen && (
                  <>
                    <div onClick={() => { setUserMenuOpen(false); setConfirmLogout(false); setLogoutUnsaved(false); }} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
                    <div className="tj-user-dropdown">
                      {userEmail && (
                        <div className="tj-user-email">
                          <UserAvatar email={userEmail} />
                          <span className="tj-mono tj-user-email-text">{String(userEmail).split("@")[0]}</span>
                        </div>
                      )}
                      {confirmLogout ? (
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text)", padding: "2px 6px 8px" }}>
                            {logoutUnsaved
                              ? "Ada perubahan yang belum tersimpan ke server. Kalau keluar sekarang, perubahan itu akan hilang."
                              : "Yakin mau keluar dari akun ini?"}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              disabled={loggingOut}
                              onClick={() => handleLogout(logoutUnsaved)}
                              style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 6, padding: "7px 0", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: loggingOut ? 0.6 : 1 }}
                            >
                              {loggingOut ? "Menyimpan…" : logoutUnsaved ? "Tetap keluar" : "Ya, Keluar"}
                            </button>
                            <button
                              onClick={() => { setConfirmLogout(false); setLogoutUnsaved(false); }}
                              style={{ flex: 1, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 0", fontSize: 11, cursor: "pointer" }}
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
        </div>

        {/* Pengganti tinggi header yang fixed, supaya isi halaman tidak tertutup */}
        <div aria-hidden="true" style={{ height: hdrH, marginTop: "calc(-1 * env(safe-area-inset-top, 0px))" }} />

        {/* End Balance: di luar header, ikut tergulir; tampil di setiap menu (Jurnal / Simulasi / Chart).
            Ikon tema terang/gelap ada di kanan baris ini. */}
        <div className="tj-bal">
          <div className="tj-balcard">
            {m && (
              <>
                <span className="tj-bal-label">End Balance</span>
                <span className="tj-mono tj-bal-value">{fmtMoney(endBalance)}</span>
              </>
            )}
            <button
              type="button"
              className="tj-bal-theme"
              onClick={toggleTheme}
              title={theme === "dark" ? "Tema Terang" : "Tema Gelap"}
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        <div ref={slideRef} onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd} style={{ paddingTop: 4 }}>
        {activeView === "simulasi" && <TargetSimulator theme={theme} />}

        {activeView === "ai-news" && <AINews theme={theme} />}

        {chartMounted && (
          <div style={{ display: activeView === "chart" ? "block" : "none" }}>
<TradingViewChart theme={theme} />
          </div>
        )}

        {activeView === "journal" && (
        <>
        {/* Risk Guard: pemantauan P/L harian yang sudah tercatat, memakai batas existing 4%. */}
        <section aria-label="Risk Guard" style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16, padding: 14, background: "var(--surface-soft)", border: `1px solid ${riskGuard.status === "limit" ? "var(--red)" : riskGuard.status === "warning" ? "var(--gold)" : "var(--border)"}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)", fontWeight: 800, fontSize: 13 }}>
              {riskGuard.status === "limit" ? <ShieldAlert size={17} color="var(--red)" /> : riskGuard.status === "warning" ? <AlertTriangle size={17} color="var(--gold)" /> : <ShieldCheck size={17} color="var(--green)" />}
              Risk Guard
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".04em", borderRadius: 20, padding: "4px 8px", color: riskGuard.status === "limit" ? "var(--red)" : riskGuard.status === "warning" ? "var(--gold)" : "var(--green)", background: "var(--surface-raised)" }}>
              {riskGuard.status === "limit" ? "BATAS TERCAPAI" : riskGuard.status === "warning" ? "WASPADA" : riskGuard.status === "unavailable" ? "BELUM ADA MODAL" : "AMAN"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            <div><div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Batas rugi harian · 4%</div><div className="tj-mono" style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>{riskGuard.limit > 0 ? fmtMoney(riskGuard.limit) : "—"}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Kerugian bersih tercatat</div><div className="tj-mono" style={{ fontSize: 17, fontWeight: 800, color: riskGuard.lossUsed > 0 ? "var(--red)" : "var(--text)" }}>{riskGuard.lossUsed > 0 ? `-${fmtMoney(riskGuard.lossUsed).slice(1)}` : fmtMoney(0)}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Sisa batas</div><div className="tj-mono" style={{ fontSize: 17, fontWeight: 800, color: riskGuard.status === "limit" ? "var(--red)" : "var(--text)" }}>{riskGuard.limit > 0 ? fmtMoney(riskGuard.remaining) : "—"}</div></div>
          </div>
          <div style={{ height: 6, borderRadius: 10, overflow: "hidden", background: "var(--border)", marginTop: 12 }}>
            <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, riskGuard.usedPct))}%`, borderRadius: 10, background: riskGuard.status === "limit" ? "var(--red)" : riskGuard.status === "warning" ? "var(--gold)" : "var(--green)", transition: "width .2s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 7, color: "var(--muted)", fontSize: 11 }}>
            <span>{riskGuard.tradeDaysLogged ? `P/L hari ini: ${riskGuard.netPnl >= 0 ? "+" : "−"}${fmtMoney(Math.abs(riskGuard.netPnl)).slice(1)}` : "Belum ada P/L tercatat hari ini"}</span>
            <span className="tj-mono">{riskGuard.limit > 0 ? `${Math.min(999, riskGuard.usedPct).toFixed(0)}% terpakai` : "—"}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>Menghitung profit, loss, dan komisi yang tercatat hari ini. Penarikan tidak dihitung sebagai kerugian trading. Floating P/L broker belum termasuk.</div>
        </section>
        {/* Cross-month comparison */}
        {(
          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 16, background: "var(--surface-soft)" }}>
            <button
              onClick={() => setShowCompare((v) => !v)}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "transparent", border: "none", borderBottom: showCompare ? "1px solid var(--border)" : "none", color: "var(--gold)", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={13} color="var(--gold)" /> Perbandingan Antar Bulan
              </span>
              {showCompare ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showCompare && compareData.length === 0 && (
              <div style={{ padding: "22px 14px", textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
                Belum ada data bulan. Perbandingan akan muncul setelah bulan pertama dibuat.
              </div>
            )}
            {showCompare && compareData.length > 0 && (
              <div style={{ padding: "12px 10px 4px" }}>
                <div className="tj-title" style={{ margin: "0 8px 12px", color: "var(--muted)", borderBottom: "none", paddingBottom: 0 }}>
                  Growth % per Bulan
                </div>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={compareData} margin={{ top: 6, right: 14, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                    <YAxis tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                    <ReferenceLine y={0} stroke={chartColors.refLine} strokeDasharray="3 3" strokeOpacity={0.6} />
                    <Tooltip
                      contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 13 }}
                      labelStyle={{ color: chartColors.tooltipLabel, fontSize: 11 }}
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
                          <th key={h} style={{ padding: "7px 10px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {compareData.map((d) => (
                        <tr key={d.key} style={{ opacity: d.key === activeMonth ? 1 : d.archived ? 0.55 : 0.85, background: d.key === activeMonth ? "rgba(237,165,36,0.12)" : "transparent", fontWeight: d.key === activeMonth ? 700 : 400 }}>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 13, textAlign: "center", borderBottom: "none", color: "var(--text)", fontWeight: d.key === activeMonth ? 700 : 400, background: d.key === activeMonth ? "rgba(237,165,36,0.12)" : "transparent" }}>
                            {d.fullLabel}
                          </td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 13, textAlign: "center", borderBottom: "none", color: "var(--muted)" }}>{fmtMoney(d.start)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 13, textAlign: "center", borderBottom: "none" }}>{fmtMoney(d.end)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 13, textAlign: "center", borderBottom: "none", color: d.growth >= 0 ? "var(--green)" : "var(--red)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              {d.growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {d.growth.toFixed(2)}%
                            </span>
                          </td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 13, textAlign: "center", borderBottom: "none", color: "var(--green)" }}>{fmtMoney(d.profit)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 13, textAlign: "center", borderBottom: "none", color: "var(--red)" }}>{d.loss > 0 ? `-${fmtMoney(d.loss).slice(1)}` : fmtMoney(0)}</td>
                          <td className="tj-mono" style={{ padding: "7px 10px", fontSize: 13, textAlign: "center", borderBottom: "none" }}>{d.winrate === null ? "—" : `${(d.winrate * 100).toFixed(0)}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

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
                  fontSize: 13,
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
              fontSize: 13,
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
                  <div style={{ fontSize: 11, color: "var(--text)", marginBottom: 8 }}>Hapus permanen? Data tidak bisa dikembalikan.</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => deleteMonthPermanent(menuOpenFor)} style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 0", fontSize: 11, cursor: "pointer" }}>Ya, Hapus</button>
                    <button onClick={() => setConfirmDeleteFor(null)} style={{ flex: 1, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 0", fontSize: 11, cursor: "pointer" }}>Batal</button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => archiveMonth(menuOpenFor)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "none", border: "none", color: "var(--text)", fontSize: 13, cursor: "pointer", textAlign: "left" }}
                  >
                    <Archive size={13} /> Arsipkan
                  </button>
                  <button
                    onClick={() => setConfirmDeleteFor(menuOpenFor)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "none", border: "none", color: "var(--red)", fontSize: 13, cursor: "pointer", textAlign: "left", borderTop: "1px solid var(--border)" }}
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
          <div style={{ background: "var(--surface-soft)", borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
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
                <div key={year} style={{ borderBottom: gi < garr.length - 1 ? "none" : "none" }}>
                  <div style={{ padding: "8px 14px", background: "transparent", fontSize: 11, color: "var(--gold)", letterSpacing: "0.05em", fontWeight: 600 }}>
                    {year} <span style={{ color: "var(--muted)", fontWeight: 400 }}>({keys.length} bulan)</span>
                  </div>
                  {keys
                    .sort((a, b) => a.localeCompare(b))
                    .map((key, i, arr) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderTop: "none" }}>
                        <span className="tj-mono" style={{ fontSize: 13, color: "var(--muted)" }}>{monthKeyToLabel(key)}</span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={() => restoreMonth(key)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--gold)", fontSize: 11, cursor: "pointer" }}>
                            <ArchiveRestore size={12} /> Aktifkan
                          </button>
                          <button onClick={() => setConfirmDeleteFor(confirmDeleteFor === key ? null : key)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--red)", fontSize: 11, cursor: "pointer" }}>
                            <Trash2 size={12} /> Hapus
                          </button>
                        </div>
                        {confirmDeleteFor === key && (
                          <div style={{ position: "absolute", marginTop: 30, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, zIndex: 10 }}>
                            <div style={{ fontSize: 11, marginBottom: 8 }}>Hapus permanen?</div>
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
          <div style={{ background: "var(--surface-soft)", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Start Balance ($)</span>
            <input
              type="number"
              className="tj-input tj-mono"
              style={{ width: 100 }}
              value={newMonthBalance}
              onChange={(e) => setNewMonthBalance(e.target.value)}
            />
            <button
              onClick={createMonth}
              style={{ background: "var(--gold-grad)", color: "#0A1628", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer" }}
            >
              Buat Bulan Ini
            </button>
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
            <div style={{ borderRadius: 10, overflow: "hidden", background: "var(--surface-soft)", marginBottom: 20 }}>
              <div style={{ padding: 12, background: "transparent", position: "relative" }}>
                {/* Judul + menu titik tiga (gaya sama dengan kartu Statistik): Export Excel, Backup Data (.json), Import Backup (.json) */}
                <div style={{ position: "relative" }}>
                  <div className="tj-title">
                    Input Transaksi
                  </div>
                  <button
                    onClick={() => { setTxMenuOpen((v) => !v); setImportError(""); }}
                    title="Export & Backup"
                    aria-label="Export dan Backup"
                    aria-haspopup="menu"
                    aria-expanded={txMenuOpen}
                    style={{ position: "absolute", right: 0, top: "calc(50% - 4px)", transform: "translateY(-50%)", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 22, background: "none", border: "none", borderRadius: 6, color: "var(--muted)", opacity: 0.7, cursor: "pointer", padding: 0 }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json,application/json"
                    style={{ display: "none" }}
                    onChange={handleImportFileChange}
                  />
                  {txMenuOpen && (
                    <>
                      <div onClick={() => setTxMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
                      <div role="menu" style={{ position: "absolute", right: 0, top: "100%", zIndex: 30, minWidth: 190, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 9, padding: 4, boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
                        {[
                          [Download, "Export Excel", () => { setTxMenuOpen(false); openExport(); }],
                          [Download, "Backup Data (.json)", () => { setTxMenuOpen(false); handleBackupExport(); }],
                          [Upload, "Import Backup (.json)", () => importFileRef.current?.click()],
                        ].map(([Icon, label, onClick]) => (
                          <button
                            key={label}
                            role="menuitem"
                            onClick={onClick}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "none", border: "none", borderRadius: 6, color: "var(--text)", fontSize: 13, cursor: "pointer", textAlign: "left" }}
                          >
                            <Icon size={13} /> {label}
                          </button>
                        ))}
                        {importError && (
                          <div style={{ fontSize: 11, color: "var(--red)", padding: "2px 10px 6px" }}>{importError}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <button
                    type="button"
                    className="tj-input tj-mono"
                    onClick={() => { setCalendarMonth(activeMonth || selectedDate.slice(0, 7)); setCalendarOpen((open) => !open); }}
                    aria-label="Pilih tanggal transaksi"
                    aria-expanded={calendarOpen}
                    style={{ width: "100%", minHeight: 42, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center", cursor: "pointer", border: calendarOpen ? "1px solid var(--gold)" : undefined, color: selectedDateIsWeekend ? "#EF5B50" : "var(--text)", position: "relative" }}
                  >
                    <span>{selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Pilih tanggal"}</span>
                    <CalendarDays size={17} style={{ flexShrink: 0, color: "var(--gold)", position: "absolute", right: 12 }} />
                  </button>
                  {calendarOpen && <>
                    <div onClick={() => setCalendarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 39 }} />
                    <div role="dialog" aria-label="Kalender pilih tanggal" style={{ position: "fixed", top: "50%", left: "50%", right: "auto", transform: "translate(-50%, -50%)", width: "min(360px, calc(100vw - 24px))", maxWidth: "calc(100vw - 24px)", boxSizing: "border-box", zIndex: 40, padding: 12, borderRadius: 16, background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)", boxShadow: "0 14px 35px rgba(0,0,0,.22)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                        <button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="Bulan sebelumnya" style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface-soft)", color: "var(--text)", cursor: "pointer" }}><ChevronLeft size={17} /></button>
                        <strong style={{ fontSize: 14, color: "var(--text)" }}>{calendarFirstDay.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</strong>
                        <button type="button" onClick={() => changeCalendarMonth(1)} aria-label="Bulan berikutnya" style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface-soft)", color: "var(--text)", cursor: "pointer" }}><ChevronRight size={17} /></button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4, marginBottom: 5 }}>
                        {["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"].map((day, index) => <div key={day} style={{ textAlign: "center", padding: "5px 0", color: index >= 5 ? "#A33A3A" : "var(--muted)", fontSize: 10, fontWeight: 700 }}>{day}</div>)}
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
                          return <button key={key} type="button" onClick={() => chooseCalendarDate(key)} aria-label={`${dayNum} ${calendarFirstDay.toLocaleDateString("id-ID", { month: "long" })}`} aria-pressed={isSelected} style={{ minWidth: 0, minHeight: 42, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: isSelected ? "1px solid var(--gold)" : isToday ? "1px solid var(--gold-dim)" : "1px solid var(--border)", borderRadius: 9, background: isSelected ? "var(--gold-grad)" : "var(--surface)", color: isSelected ? "#0A1628" : isWeekend ? "#A33A3A" : "var(--text)", fontSize: 12, fontWeight: isSelected ? 800 : 600, cursor: "pointer", padding: 0 }}>
                            {dayNum}<span style={{ width: 4, height: 4, borderRadius: "50%", background: hasEntry ? (isSelected ? "#686868" : "#8B8B85") : "transparent" }} />
                          </button>;
                        })}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)", color: "var(--muted)", fontSize: 10 }}><span><span style={{ color: "#8B8B85" }}>●</span> sudah ada transaksi</span><span>▢ terpilih = emas</span></div>
                    </div>
                  </>}
                </div>

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
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 7,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={12} /> Tambah Transaksi
                  </button>
                  {addNote && (
                    <span style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>{addNote}</span>
                  )}
                </div>
              </div>

              {/* Entries table */}
              <div className="tj-scrollbar" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
                  <thead>
                    <tr style={{ background: "transparent" }}>
                      {["No", "Tanggal", "Start", "Target 3%", "Loss -4%", "Profit ($)", "Loss ($)", "Komisi ($)", "WD ($)", "End Balance", ""].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", fontSize: 11, color: "var(--muted)", textAlign: "center", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
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
                      <tr key={r.id}>
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>{i + 1}</td>
                        {isFirstOfDateGroup && (
                          <td className="tj-mono" rowSpan={dateSpan} style={{ padding: "8px 10px", fontSize: 13, whiteSpace: "nowrap", textAlign: "center", verticalAlign: "middle", borderLeft: dateSpan > 1 ? "2px solid var(--gold-dim)" : "none", color: [0, 6].includes(new Date(r.date).getDay()) ? "var(--red)" : undefined }}>{fmtDate(r.date)}</td>
                        )}
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>{fmtMoney(r.start)}</td>
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 13, color: "var(--green)", opacity: 0.85, textAlign: "center" }}>{fmtMoney(r.target)}</td>
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 13, color: "var(--red)", opacity: 0.85, textAlign: "center", whiteSpace: "nowrap" }}>{fmtMoney(r.lossLimit)}</td>
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
                        <td className="tj-mono" style={{ padding: "8px 10px", fontSize: 13, fontWeight: 600, textAlign: "center" }}>{fmtMoney(r.end)}</td>
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
                        <td colSpan={12} style={{ padding: "24px 10px", textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
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
                      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                      <div className="tj-mono" style={{ fontSize: 15, fontWeight: 600, color: pctColor(pct) }}>{pctText(pct)}</div>
                    </div>
                  ))}
                </div>
              );

              const sectionTitle = (text) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: ["Hasil", "Performa"].includes(text) ? "var(--muted)" : "var(--gold)" }}>
                  {text}
                  <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>
              );

              return (
                <div style={{ background: "var(--surface-soft)", borderRadius: 12, padding: "10px 14px 16px", marginBottom: 20 }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 22, paddingBottom: 8, marginBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold)" }}>Statistik</span>
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
                          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 10px 4px" }}>Tampilan statistik</div>
                          {[["grup", "Grup berlabel"], ["ring", "Ring winrate"]].map(([key, label]) => (
                            <button
                              key={key}
                              role="menuitemradio"
                              aria-checked={statsStyle === key}
                              onClick={() => changeStatsStyle(key)}
                              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", background: statsStyle === key ? "rgba(237,165,36,0.1)" : "none", border: "none", borderRadius: 6, color: statsStyle === key ? "var(--gold)" : "var(--text)", fontSize: 13, cursor: "pointer", textAlign: "left" }}
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
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "none" }}>{growthGrid}</div>
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
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "none" }}>
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
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "none" }}>{growthGrid}</div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Balance growth chart */}
            {rows.length > 0 && (
              <div style={{ borderRadius: 12, background: "var(--surface-soft)", padding: "10px 14px 8px", marginBottom: 20 }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 22, paddingBottom: 8, marginBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold)" }}>Pertumbuhan Saldo</span>
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
                        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 10px 4px" }}>Tampilan grafik</div>
                        {[["line", "Garis"], ["bar", "Batang"], ["area", "Area"]].map(([key, label]) => (
                          <button
                            key={key}
                            role="menuitemradio"
                            aria-checked={balanceChartType === key}
                            onClick={() => { setBalanceChartType(key); setBalanceMenuOpen(false); }}
                            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", background: balanceChartType === key ? "rgba(237,165,36,0.1)" : "none", border: "none", borderRadius: 6, color: balanceChartType === key ? "var(--gold)" : "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}
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
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                      <ReferenceLine y={m.initialBalance} stroke={chartColors.refLine} strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 13 }}
                        labelStyle={{ color: chartColors.tooltipLabel, fontSize: 11 }}
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
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                      <ReferenceLine y={m.initialBalance} stroke={chartColors.refLine} strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 13 }}
                        labelStyle={{ color: chartColors.tooltipLabel, fontSize: 11 }}
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
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                      <ReferenceLine y={m.initialBalance} stroke={chartColors.refLine} strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 13 }}
                        labelStyle={{ color: chartColors.tooltipLabel, fontSize: 11 }}
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
            <div style={{ marginTop: 16, borderRadius: 10, overflow: "hidden", background: "var(--surface-soft)" }}>
              {/* Rekomendasi live berdasarkan saldo berjalan saat ini */}
              {(() => {
                const rec = computeLotRecommendation(endBalance);
                return (
                  <div style={{ padding: "12px 14px", background: "transparent" }}>
                    <div className="tj-title">
                      Rekomendasi Untuk Saldo Saat Ini · {fmtMoney(endBalance)}
                    </div>
                    <div style={{ display: "flex", gap: 0 }}>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>Lot / Layer</div>
                        <div className="tj-mono" style={{ fontSize: 15, fontWeight: 600 }}>{rec.lot}</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>Max Layer</div>
                        <div className="tj-mono" style={{ fontSize: 15, fontWeight: 600 }}>{rec.layers}</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>Budget Rugi/Hari</div>
                        <div className="tj-mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--red)" }}>{fmtMoney(-rec.riskBudget)}</div>
                      </div>
                    </div>
                    {rec.underMinimum && (
                      <div style={{ fontSize: 11, color: "var(--red)", textAlign: "center", marginTop: 8 }}>
                        ⚠ Modal terlalu kecil untuk 1 layer penuh sesuai jatah rugi 4% — pakai 0.01 lot dengan ekstra hati-hati, atau pertimbangkan tunggu modal pulih dulu.
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
                      Asumsi: SL rata-rata ${SL_DISTANCE_USD}, jatah rugi {(RISK_PCT_PER_DAY * 100).toFixed(0)}%/hari, target maks {TARGET_MAX_LAYERS} layer, 0.01 lot ≈ $1 per $1 pergerakan harga. Sesuaikan lagi kalau beda dengan gaya trading/broker kamu.
                    </div>
                  </div>
                );
              })()}
              <button
                onClick={() => setShowCapitalRef((v) => !v)}
                style={{ width: "100%", position: "relative", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 14px", background: "transparent", border: "none", color: "var(--gold)", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
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
                        <th key={h} style={{ padding: "7px 12px", fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CAPITAL_LOT_REF_TIERS.map((row) => (
                      <tr key={row.capital} className="tj-mono" style={{ background: Math.abs(row.capital - endBalance) < 50 ? "rgba(237,165,36,0.18)" : "transparent" }}>
                        <td style={{ padding: "7px 12px", fontSize: 13, borderTop: "none", textAlign: "center" }}>${row.capital}</td>
                        <td style={{ padding: "7px 12px", fontSize: 13, borderTop: "none", textAlign: "center" }}>{row.lot}</td>
                        <td style={{ padding: "7px 12px", fontSize: 13, borderTop: "none", textAlign: "center" }}>{row.layers}</td>
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

      {/* Menu bawah: menu lama dipertahankan, AI News ditambahkan */}
      <nav className="tj-tabbar" role="tablist" aria-label="Menu utama">
        <div className="tj-tabbar-in">
          {[["journal", "Jurnal", BookOpen], ["simulasi", "Simulasi", TargetIcon], ["chart", "Chart", ChartIcon], ["ai-news", "AI News", Newspaper]].map(([k, label, Ic]) => (
            <button key={k} role="tab" aria-selected={activeView === k} className={activeView === k ? "on" : ""} onClick={() => goView(k)}>
              <Ic size={20} />
              {label}
            </button>
          ))}
          <button
            className="tj-tab-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Muat ulang data jurnal"
            aria-label="Refresh data"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
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
            {(() => {
              const sm = pendingImport.summary;
              const imp = pendingImport.imported;
              const nothingNew = sm.newEntries === 0 && sm.newMonths === 0;
              const rowStyle = { display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" };
              return (
                <>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 10px", wordBreak: "break-all" }}>
                    {pendingImport.fileName}
                    {imp.exportedAt ? ` · dibuat ${new Date(imp.exportedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
                  </p>
                  <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", marginBottom: 12 }}>
                    <div style={rowStyle}><span style={{ color: "var(--muted)" }}>Bulan baru</span><strong style={{ color: "var(--text)" }}>{sm.newMonths}</strong></div>
                    <div style={rowStyle}><span style={{ color: "var(--muted)" }}>Bulan yang ditambah entri</span><strong style={{ color: "var(--text)" }}>{sm.mergedMonths}</strong></div>
                    <div style={rowStyle}><span style={{ color: "var(--muted)" }}>Entri baru ditambahkan</span><strong style={{ color: "var(--green)" }}>{sm.newEntries}</strong></div>
                    <div style={rowStyle}><span style={{ color: "var(--muted)" }}>Entri sudah ada (dilewati)</span><strong style={{ color: "var(--text)" }}>{sm.duplicateEntries}</strong></div>
                    {sm.dateConflicts > 0 && (
                      <div style={rowStyle}><span style={{ color: "var(--muted)" }}>Tanggal sudah terisi (dilewati)</span><strong style={{ color: "var(--gold)" }}>{sm.dateConflicts}</strong></div>
                    )}
                    {(imp.skipped.months > 0 || imp.skipped.entries > 0) && (
                      <div style={rowStyle}><span style={{ color: "var(--muted)" }}>Data rusak (dibuang)</span><strong style={{ color: "var(--red)" }}>{imp.skipped.months} bulan, {imp.skipped.entries} entri</strong></div>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 16px" }}>
                    {nothingNew
                      ? "Tidak ada data baru di file ini — semuanya sudah ada di jurnal kamu."
                      : <>Data digabungkan dengan jurnal sekarang — <strong style={{ color: "var(--text)" }}>tidak ada yang dihapus atau ditimpa</strong>. Setelah import kamu bisa menekan Urungkan.</>}
                  </p>
                </>
              );
            })()}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={confirmImport}
                disabled={pendingImport.summary.newEntries === 0 && pendingImport.summary.newMonths === 0}
                style={{ flex: 1, background: "var(--gold-grad)", color: "#0A1628", border: "none", borderRadius: 7, padding: "9px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: pendingImport.summary.newEntries === 0 && pendingImport.summary.newMonths === 0 ? 0.4 : 1 }}
              >
                Ya, Gabungkan & Import
              </button>
              <button
                onClick={() => setPendingImport(null)}
                style={{ flex: 1, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 0", fontSize: 13, cursor: "pointer" }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pilihan Export Excel: bulan ini saja atau semua bulan (+ opsi bulan arsip) */}
      {exportDialog && (() => {
        const archivedCount = order.filter((k) => months?.[k]?.archived).length;
        const activeCount = order.length - archivedCount;
        const allCount = exportDialog.includeArchived ? order.length : activeCount;
        const canExport = exportDialog.scope === "month" || allCount > 0;
        const optStyle = (on) => ({ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: on ? "rgba(237,165,36,0.1)" : "var(--surface)", border: `1px solid ${on ? "var(--gold-dim)" : "var(--border)"}`, borderRadius: 8, padding: "10px 12px", marginBottom: 8, cursor: "pointer", color: "var(--text)" });
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setExportDialog(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: 380, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Download size={16} color="var(--gold)" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Export Excel</h3>
              </div>
              <button style={optStyle(exportDialog.scope === "month")} onClick={() => setExportDialog({ ...exportDialog, scope: "month" })}>
                <span style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Bulan ini saja</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{activeMonth ? monthKeyToLabel(activeMonth) : ""} · 1 sheet</div>
                </span>
                {exportDialog.scope === "month" && <Check size={14} color="var(--gold)" />}
              </button>
              <button style={optStyle(exportDialog.scope === "all")} onClick={() => setExportDialog({ ...exportDialog, scope: "all" })}>
                <span style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Semua bulan</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{allCount} bulan · 1 sheet per bulan</div>
                </span>
                {exportDialog.scope === "all" && <Check size={14} color="var(--gold)" />}
              </button>
              {exportDialog.scope === "all" && archivedCount > 0 && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text)", margin: "4px 2px 12px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={exportDialog.includeArchived}
                    onChange={(e) => setExportDialog({ ...exportDialog, includeArchived: e.target.checked })}
                  />
                  Sertakan bulan arsip ({archivedCount})
                </label>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  onClick={confirmExport}
                  disabled={!canExport}
                  style={{ flex: 1, background: "var(--gold-grad)", color: "#0A1628", border: "none", borderRadius: 7, padding: "9px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: canExport ? 1 : 0.4 }}
                >
                  Export
                </button>
                <button
                  onClick={() => setExportDialog(null)}
                  style={{ flex: 1, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 0", fontSize: 13, cursor: "pointer" }}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bentrok antar-perangkat: versi di server lebih baru daripada yang kita lihat */}
      {conflict && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: 400, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Data berubah di perangkat lain</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 14px" }}>
              Jurnal ini sudah disimpan dari perangkat lain setelah terakhir kamu muat, jadi perubahan di sini belum dikirim supaya tidak saling menimpa. Pilih cara menyelesaikannya:
            </p>
            {[
              ["merge", "Gabungkan (disarankan)", "Data server diutamakan, entri/bulan yang hanya ada di sini ditambahkan.", "var(--gold-grad)", "#0A1628", "none"],
              ["server", "Pakai versi server", "Buang perubahan di perangkat ini.", "var(--surface)", "var(--text)", "1px solid var(--border)"],
              ["mine", "Timpa dengan versi saya", "Versi di server diganti dengan yang ada di sini.", "var(--surface)", "var(--red)", "1px solid var(--border)"],
            ].map(([key, label, hint, bg, color, border]) => (
              <button
                key={key}
                disabled={resolving}
                onClick={() => resolveConflict(key)}
                style={{ width: "100%", textAlign: "left", background: bg, color, border, borderRadius: 8, padding: "10px 12px", marginBottom: 8, cursor: "pointer", opacity: resolving ? 0.6 : 1 }}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 2 }}>{hint}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ringkasan setelah "Gabungkan": bagian dari perangkat ini yang tidak ikut digabung */}
      {mergeNotice && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: 400, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Penggabungan selesai</h3>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              {mergeNotice.newEntries > 0 && <p style={{ margin: "0 0 8px" }}>{mergeNotice.newEntries} entri dari perangkat ini ditambahkan.</p>}
              {mergeNotice.dateConflicts > 0 && (
                <p style={{ margin: "0 0 8px" }}>
                  {mergeNotice.dateConflicts} entri dari perangkat ini tidak ikut karena tanggalnya sudah terisi di server
                  {mergeNotice.skippedDays.length > 0 && ` (${mergeNotice.skippedDays.slice(0, 6).map((d) => fmtDate(`${d}T12:00:00`)).join(", ")}${mergeNotice.skippedDays.length > 6 ? ", dst." : ""})`}.
                </p>
              )}
              {mergeNotice.changedEntries > 0 && (
                <p style={{ margin: "0 0 8px" }}>{mergeNotice.changedEntries} entri yang kamu ubah di sini tidak dipakai, karena versi server diutamakan.</p>
              )}
              <p style={{ margin: "0 0 14px" }}>Cek tanggal tersebut dan isi ulang kalau perlu.</p>
            </div>
            <button
              onClick={() => setMergeNotice(null)}
              style={{ width: "100%", background: "var(--gold-grad)", color: "#0A1628", border: "none", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Notifikasi Import berhasil + tombol Urungkan */}
      {importUndo && (
        <div
          style={{
            position: "fixed", left: 12, right: 12, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 90,
            maxWidth: 420, margin: "0 auto", background: "var(--surface-raised)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          }}
        >
          <Check size={16} color="var(--green)" />
          <span style={{ flex: 1, fontSize: 12.5, color: "var(--text)" }}>
            Import selesai: {importUndo.summary.newEntries} entri baru
            {importUndo.summary.newMonths > 0 ? `, ${importUndo.summary.newMonths} bulan baru` : ""}.
          </span>
          <button onClick={undoImport} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Urungkan</button>
          <button onClick={() => setImportUndo(null)} aria-label="Tutup" style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
