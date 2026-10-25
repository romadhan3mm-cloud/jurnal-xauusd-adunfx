// Utilitas backup / import / export TraderLogs.
// Dipisah dari TradingJournal.jsx supaya logikanya mudah dites dan tidak
// bercampur dengan UI.

export const BACKUP_SCHEMA = 1;
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB — jurnal asli jauh lebih kecil dari ini

const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])(-\d{1,3})?$/;
const MONEY_FIELDS = ["profit", "loss", "komisi", "withdraw"];

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function dayKeyOf(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Nilai uang disimpan app sebagai string ("12.5") atau "" — normalkan, buang yang bukan angka.
function cleanMoney(v) {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return "";
  return String(v).trim();
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Bersihkan & validasi satu entri. Return null kalau tidak bisa dipakai.
function sanitizeEntry(raw) {
  if (!isPlainObject(raw)) return null;
  const date = new Date(raw.date);
  if (!raw.date || Number.isNaN(date.getTime())) return null;
  const entry = {
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    date: date.toISOString(),
  };
  MONEY_FIELDS.forEach((f) => { entry[f] = cleanMoney(raw[f]); });
  // Field tambahan yang mungkin ada di versi lain (catatan dll) ikut dipertahankan bila berupa teks pendek.
  Object.keys(raw).forEach((k) => {
    if (k in entry || k === "__proto__" || k === "constructor" || k === "prototype") return;
    if (typeof raw[k] === "string" && raw[k].length <= 500) entry[k] = raw[k];
  });
  return entry;
}

// Bersihkan seluruh isi backup. Tidak pernah melempar error untuk data yang
// "aneh" — bagian yang rusak dibuang dan dicatat di `skipped`.
export function sanitizeJournal(rawMonths, rawOrder) {
  const months = {};
  const skipped = { months: 0, entries: 0 };
  if (!isPlainObject(rawMonths)) return { months, order: [], skipped };

  Object.keys(rawMonths).forEach((key) => {
    const m = rawMonths[key];
    if (!MONTH_KEY_RE.test(key) || !isPlainObject(m)) { skipped.months++; return; }
    const bal = Number(m.initialBalance);
    const seen = new Set();
    const entries = [];
    (Array.isArray(m.entries) ? m.entries : []).forEach((e) => {
      const clean = sanitizeEntry(e);
      if (!clean || seen.has(clean.id)) { skipped.entries++; return; }
      seen.add(clean.id);
      entries.push(clean);
    });
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    months[key] = {
      initialBalance: Number.isFinite(bal) && bal >= 0 ? bal : 0,
      entries,
      archived: m.archived === true,
    };
  });

  // Urutan: ikuti `order` dari file bila valid, sisanya (yang tidak tercantum) ditambahkan terurut.
  const fromFile = (Array.isArray(rawOrder) ? rawOrder : []).filter((k, i, arr) => months[k] && arr.indexOf(k) === i);
  const rest = Object.keys(months).filter((k) => !fromFile.includes(k)).sort();
  return { months, order: [...fromFile, ...rest], skipped };
}

// Baca teks file backup → data bersih. Melempar Error dengan pesan siap tampil.
export function parseBackupText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gagal membaca file. Pastikan file .json belum rusak atau diubah.");
  }
  if (!isPlainObject(parsed) || !isPlainObject(parsed.months)) {
    throw new Error("File tidak valid — bukan file backup TraderLogs.");
  }
  if (typeof parsed.schema === "number" && parsed.schema > BACKUP_SCHEMA) {
    throw new Error("File backup berasal dari versi aplikasi yang lebih baru. Perbarui aplikasi dulu.");
  }
  const clean = sanitizeJournal(parsed.months, parsed.order);
  if (!clean.order.length) {
    throw new Error("File backup tidak berisi bulan yang valid.");
  }
  return { ...clean, exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : null, sourceVersion: parsed.version || null };
}

// Gabungkan data impor ke data sekarang. Data yang sudah ada TIDAK diubah/dihapus.
//  - bulan baru → ditambahkan
//  - bulan sudah ada → hanya entri baru (id belum ada, tanggal belum terisi) yang ditambahkan
// Return juga ringkasan untuk ditampilkan sebelum user konfirmasi.
export function mergeJournals(currentMonths, currentOrder, imported) {
  const months = { ...(currentMonths || {}) };
  const order = [...(currentOrder || [])];
  const summary = { newMonths: 0, mergedMonths: 0, newEntries: 0, duplicateEntries: 0, dateConflicts: 0 };

  imported.order.forEach((key) => {
    const imp = imported.months[key];
    const existing = months[key];
    if (!existing) {
      months[key] = imp;
      if (!order.includes(key)) order.push(key);
      summary.newMonths++;
      summary.newEntries += imp.entries.length;
      return;
    }
    const ids = new Set((existing.entries || []).map((e) => e.id));
    const days = new Set((existing.entries || []).map((e) => dayKeyOf(e.date)));
    const added = [];
    imp.entries.forEach((e) => {
      if (ids.has(e.id)) { summary.duplicateEntries++; return; }
      const dk = dayKeyOf(e.date);
      if (days.has(dk)) { summary.dateConflicts++; return; } // app hanya mengizinkan satu entri per tanggal
      ids.add(e.id);
      days.add(dk);
      added.push(e);
    });
    if (added.length) {
      months[key] = {
        ...existing,
        entries: [...(existing.entries || []), ...added].sort((a, b) => new Date(a.date) - new Date(b.date)),
      };
      summary.mergedMonths++;
      summary.newEntries += added.length;
    }
  });

  // Jaga urutan kronologis supaya bulan impor tidak nyasar di belakang.
  order.sort();
  return { months, order, summary };
}

export function buildBackupPayload(appVersion, months, order) {
  const entryCount = Object.values(months || {}).reduce((s, m) => s + (m.entries?.length || 0), 0);
  return {
    app: "TraderLogs",
    schema: BACKUP_SCHEMA,
    version: appVersion,
    exportedAt: new Date().toISOString(),
    counts: { months: (order || []).length, entries: entryCount },
    months: months || {},
    order: order || [],
  };
}

// Unduh Blob sebagai file. Pakai <a download> (jalan di Chrome/Android/iOS Safari modern);
// URL dilepas agak telat supaya unduhan di HP sempat dimulai.
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function timestampForFile(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}
