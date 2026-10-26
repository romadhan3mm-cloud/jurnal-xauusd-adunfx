import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import { setStorageUser } from "./storageShim.js";
import Auth from "./Auth.jsx";
import ResetPassword from "./ResetPassword.jsx";
import TradingJournalApp from "./TradingJournal.jsx";
import { PageBackdrop, getThemeLocal } from "./Brand.jsx";
import Splash from "./Splash.jsx";

// Splash tampil minimal sekian ms setiap aplikasi dibuka (juga selama cek sesi).
const SPLASH_MIN_MS = 1800;

export default function App() {
  // undefined = masih cek sesi, null = belum login, object = sudah login
  const [session, setSession] = useState(undefined);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

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
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Splash dulu (minimal SPLASH_MIN_MS dan sampai sesi selesai dicek), lalu form login atau jurnal.
  if (!splashDone || session === undefined) {
    return <Splash light={getThemeLocal() !== "dark"} />;
  }
  // Muncul saat user klik link reset password dari email — tampilkan
  // form set password baru dulu, terlepas dari status sesi normal.
  if (recoveryMode) return <ResetPassword onDone={() => setRecoveryMode(false)} />;
  if (!session) return <Auth initialMode="login" />;
  return (
    <TradingJournalApp
      userEmail={session.user.email}
      onLogout={() => supabase.auth.signOut()}
    />
  );
}
