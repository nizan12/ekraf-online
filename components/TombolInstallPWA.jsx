"use client";

import { useState, useEffect } from "react";

export default function TombolInstallPWA() {
  const [promptInstall, setPromptInstall] = useState(null);
  const [bisaInstall, setBisaInstall] = useState(false);
  const [tertutup, setTertutup] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setPromptInstall(e);
      setBisaInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    setBisaInstall(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (promptInstall) {
      promptInstall.prompt();
      const choice = await promptInstall.userChoice;
      if (choice.outcome === "accepted") setBisaInstall(false);
      setPromptInstall(null);
    } else {
      alert("Untuk memasang aplikasi, buka menu browser dan pilih 'Tambahkan ke Layar Utama' (Add to Home screen).");
    }
  }

  if (!bisaInstall || tertutup) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleInstall}
        className="flex items-center gap-2 rounded-full bg-utama px-4 py-2.5 text-xs font-semibold text-white shadow-xl hover:bg-utama-gelap transition cursor-pointer"
      >
        <span>📱 Pasang Aplikasi</span>
      </button>
      <button
        type="button"
        onClick={() => setTertutup(true)}
        aria-label="Tutup"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-garis bg-latar text-teks-lembut shadow-md hover:bg-permukaan cursor-pointer text-xs"
      >
        ✕
      </button>
    </div>
  );
}
