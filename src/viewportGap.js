// iPhone: kadang area tampil halaman (layout viewport) berhenti ~48pt di atas tepi bawah layar,
// sehingga tersisa celah putih/polos di bawah. Selisihnya diukur dan disimpan di CSS variable
// --vgap; latar dan tab bar memakainya untuk menjulur sampai tepi layar.
export function installViewportGap() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const update = () => {
    let gap = 0;
    try {
      const touch = (navigator.maxTouchPoints || 0) > 1;
      const portrait = window.innerHeight >= window.innerWidth;
      if (touch && portrait) {
        const full = Math.max(window.screen.height, window.screen.width);
        gap = Math.round(full - window.innerHeight);
        if (gap < 0 || gap > 120) gap = 0;
      }
    } catch { gap = 0; }
    root.style.setProperty("--vgap", gap + "px");
  };
  update();
  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", () => setTimeout(update, 250));
  window.addEventListener("pageshow", update);
  document.addEventListener("visibilitychange", update);
  setTimeout(update, 300);
  setTimeout(update, 1200);
}
