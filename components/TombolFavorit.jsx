"use client";

import { useEffect, useState } from "react";
import { isFavorit, toggleFavorit } from "@/lib/favorit";

export default function TombolFavorit({ produk, className = "", ikonOnly = true }) {
  const [favorit, setFavorit] = useState(false);

  useEffect(() => {
    setFavorit(isFavorit(produk.id));

    function handleUpdate() {
      setFavorit(isFavorit(produk.id));
    }

    window.addEventListener("favorit-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("favorit-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [produk.id]);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const status = toggleFavorit(produk);
    setFavorit(status);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-xl border border-garis bg-permukaan p-2 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition cursor-pointer ${
        favorit ? "text-red-500 border-red-200 bg-red-50" : "text-teks-lembut"
      } ${className}`}
      aria-label={favorit ? "Hapus dari favorit" : "Tambah ke favorit"}
      title={favorit ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={favorit ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={favorit ? 0 : 1.8}
        className={`h-4 w-4 ${favorit ? "text-red-500" : ""}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
      {!ikonOnly && <span className="ml-1.5">{favorit ? "Tersimpan" : "Favorit"}</span>}
    </button>
  );
}
