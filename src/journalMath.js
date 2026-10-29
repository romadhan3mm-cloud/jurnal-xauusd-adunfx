// Fungsi murni (tanpa React): format uang/tanggal, hitung baris & statistik, rekomendasi lot.
export const MAX_ROWS = 500;

export function fmtMoney(n, opts = {}) {
  const v = Number(n) || 0;
  const sign = opts.forceNeg && v > 0 ? "-" : v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toFixed(2)}`;
}

export function formatMoneyInputValue(raw, prefix) {
  if (raw === "" || raw === null || raw === undefined) return "";
  const cleaned = String(raw).replace(/[^0-9.]/g, "");
  if (cleaned === "") return "";
  return `${prefix}${cleaned}`;
}

// Format input konsisten: titik (.) adalah satu-satunya pemisah desimal (koma otomatis jadi titik); tidak ada pemisah ribuan.
export function parseMoneyInputValue(text) {
  // Keyboard iPhone berbahasa Indonesia hanya punya koma: koma diperlakukan sebagai titik desimal.
  const raw = String(text ?? "").replace(/,/g, ".");
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDayKey(iso) {
  // Pakai komponen tanggal lokal (bukan toISOString/UTC) supaya tidak geser
  // sehari untuk zona waktu positif seperti WIB (UTC+7).
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export function monthKeyToLabel(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export function monthKeyToShortLabel(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export function todayMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Senin sebagai awal minggu
export function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
export function endOfWeek(d) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

// Persentase pertumbuhan dari start baris pertama ke end baris terakhir pada sekumpulan rows (sudah computeRows)
export function periodGrowthPercent(list) {
  if (!list.length) return null;
  const first = list[0];
  const last = list[list.length - 1];
  if (!first.start) return null;
  return ((last.end - first.start) / first.start) * 100;
}

// Menghasilkan array Date untuk setiap tanggal real pada bulan "YYYY-MM"
export function daysInMonthOf(key) {
  const [y, mo] = key.split("-").map(Number);
  const total = new Date(y, mo, 0).getDate();
  return Array.from({ length: total }, (_, idx) => new Date(y, mo - 1, idx + 1));
}

// Bulatkan ke 2 desimal (sen) — mencegah selisih float seperti 0.30000000000000004
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function computeRows(entries, initialBalance) {
  let bal = initialBalance;
  return entries.map((e) => {
    const start = bal;
    const target = start * 0.03;
    const lossLimit = start * -0.04;
    const end = round2(start + (Number(e.profit) || 0) - (Number(e.loss) || 0) - (Number(e.komisi) || 0) - (Number(e.withdraw) || 0));
    bal = end;
    return { ...e, start, target, lossLimit, end };
  });
}

// Risk Guard: menghitung kerugian bersih yang sudah tercatat untuk satu hari.
// Penarikan (withdraw) sengaja tidak dihitung sebagai kerugian trading.
export function computeDailyRiskGuard(entries, initialBalance, todayKey, riskPct = RISK_PCT_PER_DAY) {
  const rows = computeRows(entries || [], Number(initialBalance) || 0);
  const todayRows = rows.filter((row) => fmtDayKey(row.date) === todayKey);
  const priorRows = rows.filter((row) => fmtDayKey(row.date) < todayKey);
  const latestPrior = priorRows.length ? priorRows[priorRows.length - 1] : null;
  const todayStartBalance = todayRows.length
    ? todayRows[0].start
    : latestPrior
      ? latestPrior.end
      : (Number(initialBalance) || 0);
  const netPnl = round2(todayRows.reduce((sum, row) =>
    sum + (Number(row.profit) || 0) - (Number(row.loss) || 0) - (Number(row.komisi) || 0), 0));
  const lossUsed = round2(Math.max(0, -netPnl));
  const limit = round2(Math.max(0, todayStartBalance) * riskPct);
  const usedPct = limit > 0 ? (lossUsed / limit) * 100 : 0;
  const status = limit <= 0 ? "unavailable" : usedPct >= 100 ? "limit" : usedPct >= 75 ? "warning" : "safe";
  return { todayStartBalance, netPnl, lossUsed, limit, remaining: round2(Math.max(0, limit - lossUsed)), usedPct, status, tradeDaysLogged: todayRows.length };
}

export function computeStats(rows) {
  const totalProfit = round2(rows.reduce((s, r) => s + (Number(r.profit) || 0), 0));
  const totalLoss = round2(rows.reduce((s, r) => s + (Number(r.loss) || 0), 0));
  const totalKomisi = round2(rows.reduce((s, r) => s + (Number(r.komisi) || 0), 0));
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
export const RISK_PCT_PER_DAY = 0.04;
export const SL_DISTANCE_USD = 4;
export const TARGET_MAX_LAYERS = 4;
export const MIN_LOT = 0.01;
export const RISK_PER_MIN_LOT = SL_DISTANCE_USD * 1; // risiko $ untuk 0.01 lot dengan asumsi SL di atas

export function computeLotRecommendation(capital) {
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

export const CAPITAL_LOT_REF_TIERS = [75, 100, 200, 300, 500, 1000, 2000, 5000].map((capital) => ({
  capital,
  ...computeLotRecommendation(capital),
}));
