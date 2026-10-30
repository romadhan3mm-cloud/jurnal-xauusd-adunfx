import React from "react";

// Pilihan tab bergaya Chart | Berita. Dipakai di menu Chart dan AI News supaya tampilannya sama.
// Hanya tampilan: parent yang memegang state tab.
export default function TabSwitch({ tabs, value, onChange, theme = "dark", ariaLabel }) {
  const isLight = theme === "light";
  const colors = {
    panel: isLight ? "#FFFFFF" : "#10213B",
    panelAlt: isLight ? "#F5F8FC" : "#142945",
    border: isLight ? "#DCE5F0" : "#263D5D",
    text: isLight ? "#193452" : "#EDF4FF",
    muted: isLight ? "#718198" : "#9CAEC6",
  };
  return (
    <div role="group" aria-label={ariaLabel} style={{ display: "grid", gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, gap: 8, padding: 5, borderRadius: 13, background: colors.panelAlt, border: `1px solid ${colors.border}`, marginBottom: 12 }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-pressed={value === tab.id}
          style={{ padding: "10px 12px", border: `1px solid ${value === tab.id ? colors.border : "transparent"}`, borderRadius: 9, background: value === tab.id ? colors.panel : "transparent", color: value === tab.id ? colors.text : colors.muted, fontWeight: 700, fontSize: 13, boxShadow: value === tab.id ? "0 2px 7px rgba(0,0,0,.06)" : "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
