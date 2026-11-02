"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";

export const STORAGE_KEY = "nuran_terakhir_dilihat_v1";
export const BATAS_JUMLAH = 6;

export default function TerakhirDilihat({ produkSaatIni = null }) {
  const [mounted, setMounted] = useState(false);
  const [daftar, setDaftar] = useState([]);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    if (produkSaatIni?.id) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const filtered = list.filter((i) => String(i.id) !== String(produkSaatIni.id));
        const updated = [{
          id: produkSaatIni.id, nama: produkSaatIni.nama, harga: Number(produkSaatIni.harga) || 0,
          image: produkSaatIni.image || produkSaatIni.foto_url || "/images/placeholder.svg",
          kategori: produkSaatIni.kategori || "", harga_coret: produkSaatIni.harga_coret || null, stok: produkSaatIni.stok,
        }, ...filtered].slice(0, BATAS_JUMLAH);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const hasil = produkSaatIni?.id ? list.filter((i) => String(i.id) !== String(produkSaatIni.id)) : list;
      setDaftar(hasil.slice(0, BATAS_JUMLAH));
    } catch { setDaftar([]); }
  }, [produkSaatIni?.id]);

  if (!mounted || daftar.length === 0) return null;

  return (
    <section aria-labelledby="judul-terakhir-dilihat" className="mt-10 border-t border-garis pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 id="judul-terakhir-dilihat" className="text-xl font-bold text-teks">Terakhir Dilihat</h2>
        <span className="text-xs text-teks-lembut">Riwayat browser</span>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {daftar.slice(0, BATAS_JUMLAH).map((item) => <KartuProduk key={item.id} produk={item} />)}
      </div>
    </section>
  );
}
