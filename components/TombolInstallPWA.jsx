"use client";

import { useState, useEffect } from "react";

export default function TombolInstallPWA() {
  const [promptInstall, setPromptInstall] = useState(null);
  const [bisaInstall, setBisaInstall] = useState(false);
  const [tertutup, setTertutup] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isStandalone) return;
    const handler = (e) => { e.preventDefault(); setPromptInstall(e); setBisaInstall(true); };
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
      alert("Untuk memasang aplikasi, buka menu browser dan pilih 'Tambahkan ke Layar Utama'.");
    }
  }

  if (!bisaInstall || tertutup) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-1.5">
      <button type="button" onClick={handleInstall} className="flex items-center gap-2 rounded-full bg-utama px-4 py-2.5 text-xs font-semibold text-white shadow-xl hover:bg-utama-gelap transition cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
          <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
          <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
        </svg>
        <span>Pasang Aplikasi</span>
      </button>
      <button type="button" onClick={() => setTertutup(true)} aria-label="Tutup" className="flex h-7 w-7 items-center justify-center rounded-full border border-garis bg-latar text-teks-lembut shadow-md hover:bg-permukaan cursor-pointer text-xs">
        ✕
      </button>
    </div>
  );
}
