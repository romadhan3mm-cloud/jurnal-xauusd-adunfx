import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AUTH_CSS } from "./authStyles.js";

export default function ResetPassword({ onDone }) {
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
    <div className="auth-root">
      <style>{AUTH_CSS}</style>
      <div className="auth-topbar" aria-hidden="true" />
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Atur Password Baru</h1>
            <div className="auth-watermark">
              <span style={{ fontSize: 13 }}>©</span> adunfx
            </div>
            <p className="auth-sub">
              {done ? "Password kamu berhasil diperbarui." : "Masukkan password baru untuk akun kamu."}
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {done ? (
            <>
              <div className="auth-info" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={15} />
                Password berhasil diganti. Lanjut ke jurnal kamu.
              </div>
              <button className="auth-btn" type="button" onClick={onDone}>
                Lanjut ke Jurnal
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-pass-wrap">
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading && <Loader2 size={14} className="auth-spin" />}
                Simpan Password Baru
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
