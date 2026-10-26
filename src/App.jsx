import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import { setStorageUser } from "./storageShim.js";
import Auth from "./Auth.jsx";
import Welcome from "./Welcome.jsx";
import ResetPassword from "./ResetPassword.jsx";
import TradingJournalApp from "./TradingJournal.jsx";
import SplashScreen, { SPLASH_MS } from "./SplashScreen.jsx";

export default function App() {
  // undefined = masih cek sesi, null = belum login, object = sudah login
  const [session, setSession] = useState(undefined);
  const [recoveryMode, setRecoveryMode] = useState(false);
  // Belum login: null = layar sambutan, "login" / "signup" = form masuk/daftar
  const [authView, setAuthView] = useState(null);
  // Splash tampil minimal SPLASH_MS dan menunggu cek sesi selesai, lalu memudar
  const [minElapsed, setMinElapsed] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  const splashLeaving = session !== undefined && minElapsed;
  useEffect(() => {
    if (!splashLeaving) return;
    const t = setTimeout(() => setSplashGone(true), 500);
    return () => clearTimeout(t);
  }, [splashLeaving]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setStorageUser(data.session?.user?.id || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
      setSession(nextSession);
      setStorageUser(nextSession?.user?.id || null);
      if (nextSession) setAuthView(null); // setelah keluar akun, kembali ke layar sambutan
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  let content;
  // Muncul saat user klik link reset password dari email — tampilkan
  // form set password baru dulu, terlepas dari status sesi normal.
  if (session === undefined) {
    content = <div style={{ minHeight: "100vh", background: "#EBF2FB" }} />;
  } else if (recoveryMode) {
    content = <ResetPassword onDone={() => setRecoveryMode(false)} />;
  } else if (!session) {
    content = authView ? (
      <Auth initialMode={authView} onBack={() => setAuthView(null)} />
    ) : (
      <Welcome onLogin={() => setAuthView("login")} onRegister={() => setAuthView("signup")} />
    );
  } else {
    content = (
      <TradingJournalApp
        userEmail={session.user.email}
        onLogout={() => supabase.auth.signOut()}
      />
    );
  }

  return (
    <>
      {content}
      {!splashGone && <SplashScreen leaving={splashLeaving} />}
    </>
  );
}
