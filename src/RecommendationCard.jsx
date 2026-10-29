import React from "react";
import { ChevronDown, ChevronUp, Calculator, Layers, ShieldAlert } from "lucide-react";
import { fmtMoney, SL_DISTANCE_USD, RISK_PCT_PER_DAY, TARGET_MAX_LAYERS, CAPITAL_LOT_REF_TIERS } from "./journalMath.js";
import { mix, s, INNER_BG, INNER_BORDER, CardShell, CardHeader, HeaderBadge } from "./CardHeader.jsx";

// Tampilan kartu Rekomendasi Lot (kartu berjudul standar, sama dengan Statistik & Input Transaksi).
// Komponen ini HANYA menampilkan hasil computeLotRecommendation yang sudah dihitung di TradingJournal;
// tidak ada perhitungan baru. Warna memakai variabel tema.

function Svg({ size = 20, children, color = "currentColor", stroke = 2 }) {
  return (
    <svg width={size} height={size} style={{ display: "block" }} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function IconBadge({ bg, children }) {
  return (
    <span style={{ width: s(40, 22), height: s(40, 22), borderRadius: "50%", background: bg, color: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 2px 6px rgba(0,0,0,.22)", flex: "0 0 auto" }}>
      {children}
    </span>
  );
}

// Kartu angka: ikon bulat di kiri, label di atas, nilai di bawahnya.
function RecoStat({ icon, bg, label, value, valueColor }) {
  return (
    <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: s(9, 4), borderRadius: s(14, 8), padding: `${s(11, 5)} ${s(10, 5)}`, background: INNER_BG, border: INNER_BORDER }}>
      <IconBadge bg={bg}>{icon}</IconBadge>
      <div style={{ minWidth: 0, flex: "1 1 0" }}>
        <div style={{ fontSize: s(13, 8), color: "var(--muted)", lineHeight: 1.2, overflowWrap: "anywhere" }}>{label}</div>
        <div className="tj-mono" style={{ fontSize: "max(10px, min(26px, 3.7cqw))", letterSpacing: "-.03em", fontWeight: 800, color: valueColor || "var(--text)", marginTop: s(3, 2), whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      </div>
    </div>
  );
}

export default function RecommendationCard({ rec, endBalance, showRef, onToggleRef }) {
  return (
    <CardShell ariaLabel="Rekomendasi Lot" marginBottom={0}>
      <CardHeader
        icon={
          <Svg size="52%" stroke={2.2}>
            <path d="M12 2.8 5 5.6v5.4c0 4.3 2.9 8 7 9.6 4.1-1.6 7-5.3 7-9.6V5.6L12 2.8Z" />
            <path d="M12 8.6v5.6M9.2 11.4h5.6" />
          </Svg>
        }
        title="Rekomendasi Lot"
        subtitle="Berdasarkan saldo saat ini dan manajemen risiko."
        badge={
          <HeaderBadge
            onClick={onToggleRef}
            active={showRef}
            ariaExpanded={showRef}
            ariaLabel="Tampilkan atau sembunyikan Capital Lot Reference"
            icon={<Calculator strokeWidth={2.2} style={{ width: s(18, 10), height: s(18, 10), display: "block" }} />}
            label="CAPITAL LOT REF"
          />
        }
      />

      {/* Tiga kartu angka */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: s(8, 4) }}>
        <RecoStat
          bg="linear-gradient(135deg,#2A7BFF,#1747B8)"
          icon={<Layers strokeWidth={2.2} style={{ width: "55%", height: "55%", display: "block" }} />}
          label="Lot / Layer"
          value={rec.lot}
        />
        <RecoStat
          bg="linear-gradient(135deg,#5A6CF0,#3446C2)"
          icon={<Layers strokeWidth={2.2} style={{ width: "55%", height: "55%", display: "block" }} />}
          label="Max Layer"
          value={rec.layers}
        />
        <RecoStat
          bg="linear-gradient(135deg,#FF4A5E,#D12038)"
          icon={<ShieldAlert strokeWidth={2.2} style={{ width: "55%", height: "55%", display: "block" }} />}
          label="Budget Rugi/Hari"
          value={fmtMoney(-rec.riskBudget)}
          valueColor="var(--red)"
        />
      </div>

      {rec.underMinimum && (
        <div style={{ fontSize: s(11.5, 8), color: "var(--red)", textAlign: "center", marginTop: s(10, 5), lineHeight: 1.4 }}>
          ⚠ Modal terlalu kecil untuk 1 layer penuh sesuai jatah rugi 4% — pakai 0.01 lot dengan ekstra hati-hati, atau pertimbangkan tunggu modal pulih dulu.
        </div>
      )}

      {/* Catatan asumsi */}
      <div style={{ display: "flex", alignItems: "center", gap: s(12, 6), marginTop: s(10, 5), borderRadius: s(14, 8), padding: `${s(10, 5)} ${s(12, 6)}`, background: INNER_BG, border: INNER_BORDER }}>
        <span style={{ flex: "0 0 auto", width: s(30, 18), height: s(30, 18), borderRadius: "50%", border: "2px solid #3AA0E0", color: "#3AA0E0", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Svg size="60%" stroke={2.4}><path d="M12 11v6M12 7.2v.1" /></Svg>
        </span>
        <div style={{ fontSize: s(11.5, 8), lineHeight: 1.4, color: "var(--muted)", minWidth: 0 }}>
          <span style={{ color: "#3AA0E0", fontWeight: 700 }}>Asumsi:</span> SL rata-rata ${SL_DISTANCE_USD}, jatah rugi {(RISK_PCT_PER_DAY * 100).toFixed(0)}%/hari, target maks {TARGET_MAX_LAYERS} layer, 0.01 lot ≈ $1 per $1 pergerakan harga. Sesuaikan lagi kalau beda dengan gaya trading/broker kamu.
        </div>
      </div>

      {/* Tombol Capital Lot Reference + tabel */}
      <button
        type="button"
        onClick={onToggleRef}
        aria-expanded={showRef}
        style={{ width: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginTop: s(10, 5), padding: `${s(11, 6)} ${s(40, 24)}`, borderRadius: 999, border: "1.5px solid var(--gold)", background: showRef ? mix("var(--gold)", 15) : "transparent", color: "var(--gold)", fontSize: s(15, 9.5), fontWeight: 800, letterSpacing: ".02em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}
      >
        <span>Capital Lot Reference</span>
        <span style={{ position: "absolute", right: s(16, 8), top: "50%", transform: "translateY(-50%)", display: "inline-flex" }}>
          {showRef ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {showRef && (
        <div style={{ marginTop: s(10, 5), borderRadius: s(14, 8), overflow: "hidden", background: INNER_BG, border: INNER_BORDER }}>
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
        </div>
      )}
    </CardShell>
  );
}
