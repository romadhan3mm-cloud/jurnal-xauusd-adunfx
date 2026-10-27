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
  setTimeout(update, 300);
  setTimeout(update, 1200);
}

// Mode diagnosis: tampilkan ukuran layar/viewport + garis merah di tepi bawah area tampil halaman.
// Cara buka: tambahkan ?debug=1 di alamat, ATAU ketuk teks versi/hak cipta di bagian bawah 5 kali
// (berguna di aplikasi dari ikon layar utama yang tidak punya kolom alamat). Ketuk 5 kali lagi untuk menutup.
let dbg = null;
let testState = 0;
const TEST_LABELS = [
  "mati (normal)",
  "html+body = MAGENTA",
  "theme-color = MAGENTA",
  "garis cyan top:0 + magenta top:-48",
];
function buildDebug() {
  const root0 = document.documentElement, body0 = document.body;
  const saved = { h: root0.style.background, b: body0.style.background };
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const savedTheme = themeMeta ? themeMeta.getAttribute("content") : null;
  const strips = [];
  const clearTest = () => {
    root0.style.background = saved.h; body0.style.background = saved.b;
    if (themeMeta && savedTheme !== null) themeMeta.setAttribute("content", savedTheme);
    strips.splice(0).forEach((n) => n.remove());
  };
  const applyTest = () => {
    clearTest();
    if (testState === 1) { root0.style.background = "#FF00E5"; body0.style.background = "#FF00E5"; }
    if (testState === 2 && themeMeta) themeMeta.setAttribute("content", "#FF00E5");
    if (testState === 3) {
      const a = document.createElement("div");
      a.style.cssText = "position:fixed;left:0;right:0;top:0;height:12px;background:#00E5FF;z-index:2147483646;pointer-events:none";
      const b = document.createElement("div");
      b.style.cssText = "position:fixed;left:0;right:0;top:-48px;height:48px;background:#FF00E5;z-index:2147483646;pointer-events:none";
      document.body.append(a, b); strips.push(a, b);
    }
  };
  const btn = document.createElement("button");
  btn.textContent = "UJI ATAS";
  btn.style.cssText = "position:fixed;top:calc(env(safe-area-inset-top,0px) + 70px);right:6px;z-index:2147483647;background:#ff9d00;color:#000;font:700 12px monospace;border:0;border-radius:6px;padding:8px 10px;pointer-events:auto";
  btn.addEventListener("click", (e) => { e.stopPropagation(); testState = (testState + 1) % TEST_LABELS.length; applyTest(); });
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;top:calc(env(safe-area-inset-top,0px) + 70px);left:6px;z-index:2147483647;background:rgba(0,0,0,.78);color:#7CFC9A;font:11px/1.35 monospace;padding:6px 8px;border-radius:6px;white-space:pre;pointer-events:none";
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;padding-bottom:env(safe-area-inset-bottom,0px);padding-top:env(safe-area-inset-top,0px);visibility:hidden";
  const line = document.createElement("div");
  line.style.cssText = "position:fixed;left:0;right:0;bottom:0;height:3px;background:#ff2d2d;z-index:2147483647;pointer-events:none";
  const line2 = document.createElement("div");
  line2.style.cssText = "position:fixed;left:0;right:0;top:100%;height:3px;background:#2d8bff;z-index:2147483647;pointer-events:none";
  document.body.append(box, probe, line, line2, btn);
  const upd = () => {
    const cs = getComputedStyle(probe);
    const vv = window.visualViewport;
    const rs = getComputedStyle(document.documentElement);
    box.textContent = [
      "inner  " + innerWidth + " x " + innerHeight,
      "screen " + screen.width + " x " + screen.height,
      "client " + document.documentElement.clientWidth + " x " + document.documentElement.clientHeight,
      "visVP  " + (vv ? Math.round(vv.width) + " x " + Math.round(vv.height) + " top " + Math.round(vv.offsetTop) : "-"),
      "safe   top " + cs.paddingTop + " bot " + cs.paddingBottom,
      "standalone " + (navigator.standalone === true) + " / " + matchMedia("(display-mode: standalone)").matches,
      "vgap " + rs.getPropertyValue("--vgap") + " app-h " + rs.getPropertyValue("--app-h"),
      "pageTop " + (vv ? Math.round(vv.pageTop) : "-") + " scrollY " + Math.round(window.scrollY),
      "meta bar: " + ((document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') || {}).content || "-"),
      "meta theme: " + ((document.querySelector('meta[name="theme-color"]') || {}).content || "-"),
      "html bg: " + document.documentElement.style.background + " | body bg: " + document.body.style.background,
      "UJI ATAS #" + testState + ": " + TEST_LABELS[testState],
      "merah=bawah viewport, biru=100% top",
    ].join("\n");
  };
  upd();
  const t = setInterval(upd, 500);
  return () => { clearInterval(t); testState = 0; clearTest(); [box, probe, line, line2, btn].forEach((n) => n.remove()); };
}
function toggleDebug() {
  if (dbg) { dbg(); dbg = null; } else { dbg = buildDebug(); }
}
export function installDebugOverlay() {
  if (typeof window === "undefined") return;
  if (/[?&]debug\b/.test(window.location.search)) toggleDebug();
  let taps = 0, last = 0;
  document.addEventListener("click", (e) => {
    const el = e.target && e.target.closest ? e.target.closest(".auth-footer, .tj-footer, .wl-footer") : null;
    if (!el) return;
    const now = Date.now();
    taps = now - last < 1200 ? taps + 1 : 1;
    last = now;
    if (taps >= 5) { taps = 0; toggleDebug(); }
  });
}
