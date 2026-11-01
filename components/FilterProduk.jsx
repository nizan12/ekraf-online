"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FilterProduk({ kategoriList = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kategoriAktif = searchParams.get("kategori") || "";
  const pencarianAktif = searchParams.get("cari") || "";
  const urutanAktif = searchParams.get("urutan") || "";
  const [cari, setCari] = useState(pencarianAktif);

  function updateParams(params) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("halaman");
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    router.push(`/?${sp.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* US-11: Pencarian Produk */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ cari: cari.trim() });
          }}
          className="flex gap-2"
        >
          <input
            type="search"
            placeholder="Cari produk…"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full sm:w-52 rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs text-teks focus:border-utama focus:outline-none"
          />
          <button type="submit" className="rounded-xl bg-utama px-3.5 py-2 text-xs font-bold text-white hover:bg-utama-gelap cursor-pointer">
            Cari
          </button>
        </form>

        {/* US-15: Dropdown Urutkan */}
        <div className="flex items-center gap-2">
          <label htmlFor="pilih-urutan" className="text-xs text-teks-lembut">Urutkan:</label>
          <select
            id="pilih-urutan"
            value={urutanAktif}
            onChange={(e) => updateParams({ urutan: e.target.value })}
            className="rounded-xl border border-garis bg-latar px-3 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Pilihan Utama</option>
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Termurah</option>
            <option value="termahal">Termahal</option>
            <option value="nama">Nama (A-Z)</option>
          </select>
        </div>
      </div>

      {/* US-11: Chip Kategori */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => updateParams({ kategori: "", cari: "" })}
          className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
            !kategoriAktif && !pencarianAktif ? "bg-utama text-white" : "border border-garis bg-permukaan text-teks"
          }`}
        >
          Semua
        </button>
        {kategoriList.map((kat) => (
          <button
            key={kat}
            type="button"
            onClick={() => updateParams({ kategori: kat })}
            className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
              kategoriAktif === kat ? "bg-utama text-white" : "border border-garis bg-permukaan text-teks"
            }`}
          >
            {kat}
          </button>
        ))}
      </div>
    </div>
  );
}
