import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import { setStorageUser } from "./storageShim.js";
import Auth from "./Auth.jsx";
import ResetPassword from "./ResetPassword.jsx";
import TradingJournalApp from "./TradingJournal.jsx";
import { PageBackdrop, getThemeLocal } from "./Brand.jsx";

export default function App() {
  // undefined = masih cek sesi, null = belum login, object = sudah login
  const [session, setSession] = useState(undefined);
  const [recoveryMode, setRecoveryMode] = useState(false);

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

  // Tidak ada splash maupun layar sambutan: aplikasi langsung ke form login (belum masuk) atau jurnal.
  if (session === undefined) {
    // Selama cek sesi: polos, warnanya mengikuti tema tersimpan.
    return <PageBackdrop light={getThemeLocal() !== "dark"} />;
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
