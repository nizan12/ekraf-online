"use client";

import { useState } from "react";
import { tambahKeKeranjang } from "@/lib/keranjang";

export default function TombolKeranjang({ produk, jumlah = 1, className = "", teks = "+ Keranjang" }) {
  const [ditambahkan, setDitambahkan] = useState(false);

  const isHabis = produk.stok === 0 || produk.status_stok === "habis";
  if (isHabis) return null;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    tambahKeKeranjang(produk, jumlah);
    setDitambahkan(true);
    setTimeout(() => setDitambahkan(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`shrink-0 inline-flex items-center justify-center gap-1 rounded-xl font-bold text-xs px-3 py-1.5 transition cursor-pointer ${
        ditambahkan ? "bg-emerald-600 text-white" : "bg-utama text-white hover:bg-utama-gelap"
      } ${className}`}
      title="Tambahkan ke Keranjang Belanja"
    >
      <span>{ditambahkan ? "✓ Masuk" : teks}</span>
    </button>
  );
}
