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
      {aktif ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-red-500">
          <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      )}
      {!ikonOnly && <span className="ml-1 text-[11px] font-semibold">{aktif ? "Tersimpan" : "Favorit"}</span>}
    </button>
  );
}
