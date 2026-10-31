// Tes untuk perhitungan inti jurnal (src/journalMath.js). Jalankan: npm test
// Nilai yang diharapkan dihitung tangan, bukan disalin dari keluaran fungsi.
import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_ROWS, fmtMoney, formatMoneyInputValue, parseMoneyInputValue, round2, computeRows,
  computeStats, computeDailyRiskGuard, computeLotRecommendation, CAPITAL_LOT_REF_TIERS,
  periodGrowthPercent, daysInMonthOf, startOfWeek, endOfWeek, fmtDayKey, monthKeyToLabel, todayMonthKey,
} from "../src/journalMath.js";

const day = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0).toISOString(); // siang waktu lokal, aman dari geser zona waktu

test("fmtMoney: tanda minus, dua desimal, nilai tidak valid", () => {
  assert.equal(fmtMoney(5.5), "$5.50");
  assert.equal(fmtMoney(-5), "-$5.00");
  assert.equal(fmtMoney(5, { forceNeg: true }), "-$5.00");
  assert.equal(fmtMoney(0, { forceNeg: true }), "$0.00");
  assert.equal(fmtMoney(NaN), "$0.00");
  assert.equal(fmtMoney(undefined), "$0.00");
});

test("parseMoneyInputValue: koma jadi titik, hanya satu titik desimal", () => {
  assert.equal(parseMoneyInputValue("1,5"), "1.5");
  assert.equal(parseMoneyInputValue("$12.3.4"), "12.34");
  assert.equal(parseMoneyInputValue("abc"), "");
  assert.equal(parseMoneyInputValue(""), "");
  assert.equal(parseMoneyInputValue(null), "");
  assert.equal(parseMoneyInputValue("100"), "100");
});

test("formatMoneyInputValue: awalan hanya muncul kalau ada angka", () => {
  assert.equal(formatMoneyInputValue("12", "$"), "$12");
  assert.equal(formatMoneyInputValue("12.5", "-$"), "-$12.5");
  assert.equal(formatMoneyInputValue("", "$"), "");
  assert.equal(formatMoneyInputValue(null, "$"), "");
  assert.equal(formatMoneyInputValue("abc", "$"), "");
});

test("round2: mencegah selisih float", () => {
  assert.equal(round2(0.1 + 0.2), 0.3);
  assert.equal(round2(1.005), 1.01);
  assert.equal(round2("2.345"), 2.35);
});

test("computeRows: start, target 3%, batas loss -4%, end berantai", () => {
  const rows = computeRows([
    { profit: "10", loss: "", komisi: "1", withdraw: "" },
    { profit: 0, loss: 5, komisi: 0, withdraw: 0 },
  ], 500);
  assert.equal(rows[0].start, 500);
  assert.equal(rows[0].target, 15);
  assert.equal(rows[0].lossLimit, -20);
  assert.equal(rows[0].end, 509); // 500 + 10 - 1
  assert.equal(rows[1].start, 509); // start baris kedua = end baris pertama
  assert.equal(rows[1].end, 504); // 509 - 5
});

test("computeRows: penarikan (withdraw) mengurangi saldo; masukan kosong dianggap 0", () => {
  const rows = computeRows([{ profit: 20, loss: 0, komisi: 0, withdraw: 100 }, {}], 1000);
  assert.equal(rows[0].end, 920);
  assert.equal(rows[1].start, 920);
  assert.equal(rows[1].end, 920);
});

test("computeRows: daftar kosong dan tanpa mengubah data masukan", () => {
  assert.deepEqual(computeRows([], 500), []);
  const entries = [{ profit: 5 }];
  computeRows(entries, 100);
  assert.deepEqual(entries, [{ profit: 5 }]);
});

test("computeStats: total, winrate, dan RR", () => {
  const st = computeStats([
    { profit: 10, loss: 0, komisi: 1 },
    { profit: 0, loss: 5, komisi: 0 },
    { profit: 20, loss: 0, komisi: 0 },
  ]);
  assert.equal(st.totalProfit, 30);
  assert.equal(st.totalLoss, 5);
  assert.equal(st.totalKomisi, 1);
  assert.equal(st.winTrades, 2);
  assert.equal(st.lossTrades, 1);
  assert.ok(Math.abs(st.winrate - 2 / 3) < 1e-12);
  assert.equal(st.rr, 6);
});

test("computeStats: tanpa transaksi atau tanpa loss menghasilkan null", () => {
  const empty = computeStats([]);
  assert.equal(empty.winrate, null);
  assert.equal(empty.rr, null);
  const noLoss = computeStats([{ profit: 10, loss: 0, komisi: 0 }]);
  assert.equal(noLoss.winrate, 1);
  assert.equal(noLoss.rr, null);
});

test("periodGrowthPercent: persentase dari start pertama ke end terakhir", () => {
  assert.equal(periodGrowthPercent([]), null);
  assert.equal(periodGrowthPercent([{ start: 100, end: 110 }]), 10);
  assert.equal(periodGrowthPercent([{ start: 200, end: 210 }, { start: 210, end: 190 }]), -5);
  assert.equal(periodGrowthPercent([{ start: 0, end: 10 }]), null);
});

test("computeDailyRiskGuard: ambang safe / warning / limit dengan batas 4% dari 1000 ($40)", () => {
  const today = "2026-10-31";
  const mk = (loss) => [{ date: day(2026, 10, 31), profit: 0, loss, komisi: 0, withdraw: 0 }];
  const safe = computeDailyRiskGuard(mk(20), 1000, today);
  assert.equal(safe.limit, 40);
  assert.equal(safe.lossUsed, 20);
  assert.equal(safe.remaining, 20);
  assert.equal(safe.status, "safe");
  assert.equal(computeDailyRiskGuard(mk(30), 1000, today).status, "warning"); // tepat 75%
  assert.equal(computeDailyRiskGuard(mk(40), 1000, today).status, "limit"); // tepat 100%
  assert.equal(computeDailyRiskGuard(mk(55), 1000, today).remaining, 0);
});

test("computeDailyRiskGuard: profit, penarikan, komisi, dan modal 0", () => {
  const today = "2026-10-31";
  const profitOnly = computeDailyRiskGuard([{ date: day(2026, 10, 31), profit: 50, loss: 0, komisi: 0, withdraw: 0 }], 1000, today);
  assert.equal(profitOnly.lossUsed, 0);
  assert.equal(profitOnly.status, "safe");
  const withdrawOnly = computeDailyRiskGuard([{ date: day(2026, 10, 31), profit: 0, loss: 0, komisi: 0, withdraw: 300 }], 1000, today);
  assert.equal(withdrawOnly.netPnl, 0); // penarikan bukan kerugian trading
  const withCommission = computeDailyRiskGuard([{ date: day(2026, 10, 31), profit: 0, loss: 10, komisi: 2, withdraw: 0 }], 1000, today);
  assert.equal(withCommission.lossUsed, 12);
  assert.equal(computeDailyRiskGuard([], 0, today).status, "unavailable");
});

test("computeDailyRiskGuard: tanpa transaksi hari ini memakai saldo akhir hari sebelumnya", () => {
  const res = computeDailyRiskGuard([{ date: day(2026, 10, 30), profit: 100, loss: 0, komisi: 0, withdraw: 0 }], 1000, "2026-10-31");
  assert.equal(res.todayStartBalance, 1100);
  assert.equal(res.limit, 44);
  assert.equal(res.tradeDaysLogged, 0);
});

test("computeLotRecommendation: modal kecil menurunkan layer, modal besar menaikkan lot", () => {
  assert.deepEqual(computeLotRecommendation(75), { lot: "0.01", layers: 1, riskBudget: 3, underMinimum: true });
  const c100 = computeLotRecommendation(100);
  assert.equal(c100.lot, "0.01");
  assert.equal(c100.layers, 1);
  assert.equal(c100.underMinimum, false);
  const c500 = computeLotRecommendation(500);
  assert.equal(c500.layers, 4);
  assert.equal(c500.lot, "0.01");
  const c2000 = computeLotRecommendation(2000);
  assert.equal(c2000.layers, 4);
  assert.equal(c2000.lot, "0.05");
});

test("computeLotRecommendation: modal tidak valid", () => {
  for (const bad of [0, -5, undefined, null]) {
    assert.deepEqual(computeLotRecommendation(bad), { lot: "0.01", layers: 0, riskBudget: 0, underMinimum: true });
  }
});

test("CAPITAL_LOT_REF_TIERS: delapan tingkat modal berurutan", () => {
  assert.deepEqual(CAPITAL_LOT_REF_TIERS.map((t) => t.capital), [75, 100, 200, 300, 500, 1000, 2000, 5000]);
  for (const t of CAPITAL_LOT_REF_TIERS) assert.ok(t.layers >= 1 && Number(t.lot) >= 0.01);
});

test("tanggal: kunci hari lokal, jumlah hari, awal dan akhir minggu (Senin–Minggu)", () => {
  assert.equal(fmtDayKey(new Date(2026, 9, 31, 23, 30).toISOString()), "2026-10-31");
  assert.equal(daysInMonthOf("2024-02").length, 29);
  assert.equal(daysInMonthOf("2026-02").length, 28);
  assert.equal(daysInMonthOf("2026-10").length, 31);
  const wed = new Date(2026, 9, 28, 15, 0);
  const start = startOfWeek(wed);
  assert.equal(`${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`, "2026-10-26");
  const sun = new Date(2026, 10, 1, 9, 0);
  const startOfSun = startOfWeek(sun);
  assert.equal(`${startOfSun.getMonth() + 1}-${startOfSun.getDate()}`, "10-26"); // Minggu masuk minggu sebelumnya
  const end = endOfWeek(wed);
  assert.equal(`${end.getMonth() + 1}-${end.getDate()} ${end.getHours()}:${end.getMinutes()}`, "11-1 23:59");
});

test("label bulan dan konstanta", () => {
  assert.equal(monthKeyToLabel("2026-10"), "Oktober 2026");
  assert.match(todayMonthKey(), /^\d{4}-\d{2}$/);
  assert.equal(MAX_ROWS, 500);
});
