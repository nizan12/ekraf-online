"use client";

import { useState } from "react";

export default function TombolBagikan({ namaProduk, className = "", ikonOnly = false }) {
  const [tersalin, setTersalin] = useState(false);

  async function handleBagikan() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: namaProduk,
          text: `Cek ${namaProduk} di katalog toko kami:`,
          url,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
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
      type="button"
      onClick={handleBagikan}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-garis bg-permukaan px-3 py-2 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition cursor-pointer ${
        tersalin ? "border-emerald-500 text-emerald-600 bg-emerald-50" : ""
      } ${className}`}
      aria-label={tersalin ? "Link tersalin" : "Bagikan atau salin link produk"}
      title={tersalin ? "Link tersalin" : "Bagikan / Salin Link"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
      </svg>
      <span>{tersalin ? "Link tersalin" : "Bagikan"}</span>
    </button>
  );
}
