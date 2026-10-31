import React from "react";
import { Archive, Trash2 } from "lucide-react";
import { BOX_RADIUS, BTN_RADIUS } from "./CardHeader.jsx";

// Menu aksi bulan (Arsipkan / Hapus Permanen) — dipisah dari TradingJournal.jsx.
// Semua state dan fungsi diterima lewat props; kondisi tampil (`menuOpenFor && menuPos`) tetap di induk.
export default function MonthActionMenu({ archiveMonth, confirmDeleteFor, deleteMonthPermanent, menuOpenFor, menuPos, setConfirmDeleteFor, setMenuOpenFor, setMonthDdOpen }) {
  return (
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
                borderRadius: BOX_RADIUS,
                overflow: "hidden",
                minWidth: 180,
                boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
              }}
            >
              {confirmDeleteFor === menuOpenFor ? (
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text)", marginBottom: 8 }}>Hapus permanen? Data tidak bisa dikembalikan.</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { deleteMonthPermanent(menuOpenFor); setMonthDdOpen(false); }} style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: BTN_RADIUS, padding: "6px 0", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Ya, Hapus</button>
                    <button onClick={() => setConfirmDeleteFor(null)} style={{ flex: 1, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: BTN_RADIUS, padding: "6px 0", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Batal</button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { archiveMonth(menuOpenFor); setMonthDdOpen(false); }}
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
  );
}
