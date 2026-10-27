import React from "react";
import EconomicCalendar from "./EconomicCalendar.jsx";
import { Newspaper, CalendarClock, BrainCircuit, BellRing, ShieldCheck, ExternalLink, Info } from "lucide-react";

const cardStyle = {
  border: "1px solid var(--border)",
  borderRadius: 12,
  background: "var(--surface)",
  padding: 14,
  minWidth: 0,
};

function FeatureCard({ icon: Icon, title, status, children }) {
  return (
    <section style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--surface-raised)", color: "var(--gold)", flex: "none" }}>
          <Icon size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{title}</div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{status}</div>
        </div>
      </div>
      <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.55 }}>{children}</div>
    </section>
  );
}

export default function AINews({ theme }) {
  return (
    <main aria-label="AI News XAU/USD" style={{ color: "var(--text)", paddingBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 14px" }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-raised)", color: "var(--gold)", border: "1px solid var(--border)" }}>
          <Newspaper size={22} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 20, margin: 0, fontWeight: 850, letterSpacing: "-0.03em" }}>AI News <span style={{ color: "var(--gold)" }}>XAU/USD</span></h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 12 }}>Berita ekonomi, reaksi pasar, dan kesadaran risiko.</p>
        </div>
      </div>

      <section style={{ ...cardStyle, marginBottom: 12, borderColor: "var(--gold-dim, var(--border))", background: "var(--surface-soft)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
          <Info size={18} style={{ color: "var(--gold)", flex: "none", marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 5 }}>Kalender ekonomi sudah dihubungkan</div>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>
              Kalender di bawah menggunakan sumber XOOMAR yang juga dipakai pada Chart → Berita. Data jadwal diperbarui saat halaman terbuka; ini belum merupakan pengingat server-side. Analisis AI dan push notification masih belum aktif.
            </p>
          </div>
        </div>
      </section>

      <section style={{ ...cardStyle, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <CalendarClock size={17} style={{ color: "var(--gold)" }} />
          <div style={{ fontSize: 13, fontWeight: 800 }}>Kalender ekonomi AS · waktu WIB</div>
        </div>
        <EconomicCalendar theme={theme} />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 10 }}>
        <FeatureCard icon={CalendarClock} title="Kalender ekonomi" status="Terhubung · refresh saat halaman terbuka">
          Fokus pengembangan tetap CPI/PCE, NFP dan data tenaga kerja penting, serta keputusan dan pernyataan The Fed. Sumber saat ini belum menyediakan forecast konsensus.
        </FeatureCard>
        <FeatureCard icon={BrainCircuit} title="Analisis AI" status="Belum aktif">
          Rencana analisis: konteks fundamental, aktual dibanding perkiraan bila tersedia, reaksi emas dan indikator pendukung, serta risiko pembalikan. Bukan sinyal BUY/SELL.
        </FeatureCard>
        <FeatureCard icon={BellRing} title="Pengingat berita" status="Belum aktif">
          Target pengingat 30 menit dan 5 menit sebelum rilis, dengan pemeriksaan jadwal dan pencegahan notifikasi ganda di server.
        </FeatureCard>
        <FeatureCard icon={ShieldCheck} title="Risk Awareness" status="Panduan saja — tidak mengubah transaksi">
          Pengingat untuk meninjau lot rencana, SL, spread, dan slippage. Batas risiko 4%, asumsi SL $4, dan maksimal 4 layer pada Risk Guard tidak diubah oleh halaman ini.
        </FeatureCard>
      </div>

      <section style={{ ...cardStyle, marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 7 }}>Prinsip analisis</div>
        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)", fontSize: 12, lineHeight: 1.75 }}>
          <li>Memisahkan fakta sumber, interpretasi fundamental, dan reaksi pasar aktual.</li>
          <li>Menampilkan waktu pembaruan dan tautan sumber jika data sudah terhubung.</li>
          <li>Jika data aktual, konsensus, atau harga tidak tersedia, sistem harus menyatakannya — bukan menebak.</li>
          <li>Jika layanan AI gagal atau kuota habis, kalender dan pengingat dirancang tetap berjalan secara terpisah.</li>
        </ul>
      </section>
      <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5, textAlign: "center", margin: "12px 8px 0" }}>
        {theme === "light" ? "Mode terang" : "Mode gelap"} · Tahap 2: kalender terhubung · AI dan push belum aktif
      </p>
    </main>
  );
}
