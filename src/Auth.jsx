import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, X, Info, Mail, Lock, User, LogIn } from "lucide-react";
import { AUTH_CSS } from "./authStyles.js";
import { LogoLockup } from "./Brand.jsx";

// Sama seperti di TradingJournal.jsx — otomatis ikut package.json (lihat vite.config.js)
const APP_VERSION = __APP_VERSION__;
const APP_CREATED_YEAR = 2026;

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;

const isStandaloneDisplay = () =>
  (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
  window.navigator.standalone === true;

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [exitHint, setExitHint] = useState(false);

  const resetMessages = () => {
    setError("");
    setInfo("");
  };

  // Tutup aplikasi lewat tombol X.
  // - Android (APK/TWA yang dibuat lewat "Tambah ke Layar Utama" hasil bubblewrap):
  //   berjalan di atas Chrome, jadi window.close() bekerja normal selama tab ini
  //   belum punya banyak riwayat navigasi (app ini murni SPA tanpa router, jadi aman).
  // - iOS "Tambah ke Layar Utama": Safari standalone TIDAK punya API untuk menutup
  //   diri sendiri dari JavaScript sama sekali — window.close() akan diam-diam gagal.
  //   Daripada tombolnya terasa tidak berfungsi, langsung tampilkan cara manual.
  const handleExitApp = () => {
    if (isIOS() && isStandaloneDisplay()) {
      setExitHint(true);
      return;
    }
    try {
      window.close();
    } catch {
      // ignore
    }
    // Fallback: kalau browser/APK menahan window.close() (mis. ada riwayat
    // navigasi lebih dari satu langkah), beri tahu cara menutup manual
    // alih-alih tombolnya terlihat tidak merespons sama sekali.
    window.setTimeout(() => {
      if (!document.hidden) setExitHint(true);
    }, 300);
  };

  const switchMode = (next) => {
    setMode(next);
    resetMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (err) throw err;
        setInfo("Link reset password sudah dikirim ke email kamu. Cek inbox (dan folder spam), lalu klik link-nya.");
      } else if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) throw err;
        setInfo("Akun berhasil dibuat. Jika konfirmasi email diaktifkan, cek inbox kamu dulu sebelum login.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const heading =
    mode === "forgot" ? "Lupa Password" : mode === "login" ? "Selamat Datang" : "Buat Akun Baru";
  const subtitle =
    mode === "forgot"
      ? "Masukkan email akun Anda, kami kirim link untuk reset password."
      : mode === "login"
      ? "Masuk ke akun Anda untuk melanjutkan"
      : "Daftar untuk mulai mencatat jurnal trading Anda";

  return (
    <div className="auth-root">
      <style>{AUTH_CSS}</style>

      <div className="auth-topbar">
        <button
          type="button"
          className="auth-close-btn"
          onClick={handleExitApp}
          title="Keluar aplikasi"
          aria-label="Keluar aplikasi"
        >
          <X size={17} />
        </button>
      </div>

      <div className="auth-content">
        <div className="auth-brand">
          <LogoLockup size={44} ink="#0B3B5C" tagline />
        </div>

        <div className="auth-card">
          {mode === "forgot" && (
            <button type="button" className="auth-back" onClick={() => switchMode("login")}>
              <ArrowLeft size={15} /> Kembali ke login
            </button>
          )}

          <h1 className="auth-title">{heading}</h1>
          <p className="auth-sub">{subtitle}</p>

          {error && <div className="auth-error">{error}</div>}
          {info && (
            <div className="auth-info" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <Mail className="auth-field-icon" size={21} strokeWidth={1.8} />
              <input
                className="auth-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div className="auth-field">
                <Lock className="auth-field-icon" size={21} strokeWidth={1.8} />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min. 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={22} strokeWidth={1.8} /> : <Eye size={22} strokeWidth={1.8} />}
                </button>
              </div>
            )}

            {mode === "login" && (
              <div className="auth-link-row">
                <button type="button" onClick={() => switchMode("forgot")}>
                  Lupa password?
                </button>
              </div>
            )}
            {mode !== "login" && <div style={{ height: 8 }} />}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading && <Loader2 size={16} className="auth-spin" />}
              {mode === "forgot" ? "Kirim Link Reset" : mode === "login" ? "Masuk" : "Daftar"}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="auth-divider">atau</div>
              <button
                type="button"
                className="auth-btn-outline"
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? <User size={20} strokeWidth={1.8} /> : <LogIn size={20} strokeWidth={1.8} />}
                {mode === "login" ? "Daftar Akun" : "Masuk ke Akun"}
              </button>
            </>
          )}
        </div>

        <div className="auth-footer">
          © {APP_CREATED_YEAR} adunfx <span style={{ opacity: 0.5, margin: "0 4px" }}>·</span> v{APP_VERSION}
        </div>
      </div>

      {exitHint && (
        <div className="auth-exit-hint" role="status">
          <Info size={15} style={{ flexShrink: 0, marginTop: 1, color: "#EDA524" }} />
          <div style={{ flex: 1 }}>
            {isIOS() ? (
              <>Di iPhone/iPad, app "Tambah ke Layar Utama" tidak bisa ditutup lewat tombol dalam app (batasan iOS). Tutup lewat multitasking: geser dari bawah layar lalu geser app ini ke atas.</>
            ) : (
              <>Tidak bisa menutup otomatis dari sini. Gunakan tombol Back atau tombol Home di perangkat kamu untuk keluar.</>
            )}
          </div>
          <button
            type="button"
            className="auth-exit-hint-close"
            onClick={() => setExitHint(false)}
            aria-label="Tutup pesan"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
