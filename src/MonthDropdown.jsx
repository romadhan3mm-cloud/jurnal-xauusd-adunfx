import React from "react";
import { Archive, CalendarDays, Check, MoreVertical } from "lucide-react";
import { mix, BOX_RADIUS } from "./CardHeader.jsx";
import { monthKeyToLabel } from "./journalMath.js";

// Dropdown bulan aktif (daftar bulan dan arsip) — dipisah dari TradingJournal.jsx.
// Semua state dan fungsi diterima lewat props; kondisi tampil (`monthDdOpen && monthDdPos`) tetap di induk.
export default function MonthDropdown({ activeMonth, archiveItems, archivedKeys, menuOpenFor, monthDdPos, months, order, setActiveMonth, setCalendarMonth, setCalendarOpen, setConfirmDeleteFor, setMenuOpenFor, setMenuPos, setMonthDdOpen }) {
  return (
          <>
            <div onClick={() => setMonthDdOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 36 }} />
            <div
              role="listbox"
              aria-label="Pilih bulan"
              style={{ position: "fixed", top: monthDdPos.top, left: monthDdPos.left, minWidth: Math.max(monthDdPos.width, 260), maxWidth: "calc(100vw - 24px)", maxHeight: "50vh", overflowY: "auto", zIndex: 37, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: BOX_RADIUS, boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}
            >
              {order.filter((key) => !months[key]?.archived).map((key) => {
                const isActive = activeMonth === key;
                return (
                  <div key={key} style={{ display: "flex", alignItems: "stretch", background: isActive ? mix("var(--gold)", 10) : "transparent" }}>
                    <button
                      role="option"
                      aria-selected={isActive}
                      onClick={() => { setActiveMonth(key); setCalendarMonth(key); setCalendarOpen(true); setMonthDdOpen(false); }}
                      className="tj-mono"
                      style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "11px 12px", background: "none", border: "none", color: isActive ? "var(--gold)" : "var(--text)", fontSize: 13, fontWeight: isActive ? 800 : 700, cursor: "pointer", textAlign: "left", whiteSpace: "nowrap" }}
                    >
                      <CalendarDays size={15} />
                      {monthKeyToLabel(key)}
                      {isActive && <Check size={14} style={{ marginLeft: "auto" }} />}
                    </button>
                    <button
                      aria-label={`Menu ${monthKeyToLabel(key)}`}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({ top: rect.bottom + 6, left: Math.max(12, rect.right - 180) });
                        setMenuOpenFor(menuOpenFor === key ? null : key);
                        setConfirmDeleteFor(null);
                      }}
                      style={{ padding: "0 12px", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                );
              })}
              {archivedKeys.length > 0 && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px 2px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted)" }}>
                    <Archive size={11} /> Arsip ({archivedKeys.length})
                  </div>
                  {archiveItems}
                </div>
              )}
            </div>
          </>
  );
}
