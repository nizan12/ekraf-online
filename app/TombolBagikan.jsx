"use client";

import { useState } from "react";

export default function TombolBagikan({ namaProduk, className = "" }) {
  const [tersalin, setTersalin] = useState(false);

  async function handleBagikan() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: namaProduk, text: `Cek ${namaProduk} di katalog toko kami:`, url });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setTersalin(true);
        setTimeout(() => setTersalin(false), 2500);
      }
    } catch {}
  }

  return (
    <button
      type="button" onClick={handleBagikan}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-garis bg-permukaan px-3 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition cursor-pointer ${tersalin ? "border-emerald-500 text-emerald-600 bg-emerald-50" : ""} ${className}`}
      aria-label={tersalin ? "Link tersalin" : "Bagikan atau salin link produk"}
      title={tersalin ? "Link tersalin" : "Bagikan / Salin Link"}
    >
      <span>🔗</span>
      <span>{tersalin ? "Link tersalin" : "Bagikan"}</span>
    </button>
  );
}
