// iPhone (app dari ikon layar utama dengan bar status "black-translucent"): iOS menaruh area tampil
// halaman setinggi layar dikurangi bar status, sehingga ~48pt di tepi bawah layar tidak tercakup
// halaman sama sekali (hasil ukur: inner 848 dari screen 896, celah = safe-area atas = 48).
// Selisihnya disimpan di CSS variable --vgap. Bila bar status TIDAK translucent (gaya "default"),
// area tampil mulai di bawah bar status dan tidak ada celah, jadi --vgap dibuat 0.
// Tepi atas (iPhone): tema terang memakai bar status gaya "default" (putih, teks gelap), tema gelap memakai
// "black-translucent" (gelap penuh sampai tepi atas). Di tema terang tepi atas latar dibuat memudar dari
// putih (warna bar) ke warna latar, tanpa warna lain, supaya jam dan latar menyatu tanpa pembatas.
// Hanya aktif di aplikasi dari ikon layar utama (class "tl-ios" di <html>).
// Pemudaran tepi atas (v121): area bar status iPhone/Android berwarna datar (warna dasar tema), sedangkan
// gambar latar mulai tepat di bawahnya, sehingga ada garis potong tegas. Lapisan ini memudar dari warna
// dasar tema (solid di tepi atas) ke transparan, jadi gambar latar muncul pelan dari bawah bar status.
// Warna dasar harus sama dengan DARK_BASE / LIGHT_BASE di Brand.jsx.
export function barFadeBg(light) {
  const [r, g, b] = light ? [235, 242, 251] : [7, 24, 50];
  const a = (o) => `rgba(${r},${g},${b},${o})`;
  return `linear-gradient(180deg, ${a(1)} 0%, ${a(0.92)} 16%, ${a(0.7)} 38%, ${a(0.38)} 62%, ${a(0.12)} 84%, ${a(0)} 100%)`;
}
export const BAR_FADE_H = 40;

export function installViewportGap() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  try {
    const sa = navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
    root.classList.toggle("tl-sa", !!sa);
    // Pemudaran atas hanya dibutuhkan di iPhone/iPad (bar status putih); Android memakai warna theme-color.
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    root.classList.toggle("tl-ios", !!sa && ios);
  } catch { /* abaikan */ }
  const safeTopPx = () => {
    const p = document.createElement("div");
    p.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top,0px)";
    root.appendChild(p);
    const v = parseFloat(getComputedStyle(p).paddingTop) || 0;
    p.remove();
    return v;
  };
  const update = () => {
    let gap = 0;
    try {
      const touch = (navigator.maxTouchPoints || 0) > 1;
      const portrait = window.innerHeight >= window.innerWidth;
      if (touch && portrait && safeTopPx() > 0) {
        const full = Math.max(window.screen.height, window.screen.width);
        gap = Math.round(full - window.innerHeight);
        if (gap < 0 || gap > 120) gap = 0;
      }
    } catch { gap = 0; }
    root.style.setProperty("--vgap", gap + "px");
    // tinggi area tampil yang sebenarnya (menggantikan 100vh/100dvh yang bisa meleset di iPhone)
    if (window.innerHeight > 0) root.style.setProperty("--app-h", window.innerHeight + "px");
  };
  update();
  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", () => setTimeout(update, 250));
  window.addEventListener("pageshow", update);
  document.addEventListener("visibilitychange", update);
  // iPhone: setelah keyboard ditutup (mis. habis mengetik di kolom input), iOS kadang tidak mengirim
  // event resize sehingga --vgap tertinggal 0 dan muncul pita gelap di bawah tab bar. Hitung ulang
  // beberapa kali setelah kolom input kehilangan fokus dan saat visual viewport berubah.
  window.addEventListener("focusout", () => { [100, 400, 900, 1600].forEach((ms) => setTimeout(update, ms)); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", update);
  setTimeout(update, 300);
  setTimeout(update, 1200);
}
