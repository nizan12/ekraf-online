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
      {tersalin ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-emerald-600">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
        </svg>
      )}
      <span>{tersalin ? "Link tersalin" : "Bagikan"}</span>
    </button>
  );
}
