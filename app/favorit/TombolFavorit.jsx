"use client";

import { useEffect, useState } from "react";
import { isFavorit, toggleFavorit, ambilFavorit, simpanFavorit } from "@/lib/favorit";
export { ambilFavorit, simpanFavorit, isFavorit, toggleFavorit };

export default function TombolFavorit({ produk, className = "", ikonOnly = false }) {
  const [aktif, setAktif] = useState(false);

  useEffect(() => {
    setAktif(isFavorit(produk.id));
    const handleUpdate = () => setAktif(isFavorit(produk.id));
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
    setAktif(status);
  }

  return (
    <button
      type="button" onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-xl p-1.5 transition cursor-pointer ${
        aktif ? "text-red-500 bg-red-50 dark:bg-red-950/40" : "text-teks-lembut hover:text-red-500 bg-permukaan border border-garis"
      } ${className}`}
      aria-label={aktif ? "Hapus dari favorit" : "Tambah ke favorit"}
      title={aktif ? "Disukai" : "Favorit"}
    >
      <span className="text-sm">{aktif ? "❤️" : "🤍"}</span>
      {!ikonOnly && <span className="ml-1 text-[11px] font-semibold">{aktif ? "Tersimpan" : "Favorit"}</span>}
    </button>
  );
}
