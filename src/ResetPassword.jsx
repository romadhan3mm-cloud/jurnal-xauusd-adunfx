import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";
import { Loader2, Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";
import { AUTH_CSS } from "./authStyles.js";
import { LogoLockup, PageBackdrop, getThemeLocal } from "./Brand.jsx";

export default function ResetPassword({ onDone }) {
  const light = getThemeLocal() === "light";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
    } catch (err) {
      setError(err.message || "Gagal mengubah password, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-root ${light ? "auth-light" : ""}`}>
      <style>{AUTH_CSS}</style>
      <PageBackdrop light={light} image />
      <div className="auth-content">
        <div className="auth-brand">
          <LogoLockup size={44} dark={!light} tagline />
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Atur Password Baru</h1>
          <p className="auth-sub">
            {done ? "Password Anda berhasil diperbarui." : "Masukkan password baru untuk akun Anda."}
          </p>

          {error && <div className="auth-error">{error}</div>}

          {done ? (
            <>
              <div className="auth-info" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                Password berhasil diganti. Lanjut ke jurnal Anda.
              </div>
              <button className="auth-btn" type="button" onClick={onDone}>
                Lanjut ke Jurnal
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <Lock className="auth-field-icon" size={21} strokeWidth={1.8} />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password baru (min. 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={22} strokeWidth={1.8} /> : <Eye size={22} strokeWidth={1.8} />}
                </button>
              </div>
              <div className="auth-field" style={{ marginBottom: 22 }}>
                <Lock className="auth-field-icon" size={21} strokeWidth={1.8} />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ulangi password baru"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading && <Loader2 size={16} className="auth-spin" />}
                Simpan Password Baru
              </button>
            </form>
          )}
        </div>

        <div className="auth-footer">© 2026 adunfx</div>
      </div>
    </div>
  );
}
