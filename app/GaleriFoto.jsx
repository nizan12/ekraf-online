"use client";

import { useState } from "react";

export default function GaleriFoto({ fotoUtama, fotoList = [], nama = "Produk" }) {
  const daftar = [fotoUtama, ...(Array.isArray(fotoList) ? fotoList : [])].filter(Boolean);
  const fotoTersedia = [...new Set(daftar.flatMap((item) => typeof item === "string" && item.includes(",") ? item.split(",").map((s) => s.trim()) : item))].filter(Boolean);

  const [indeksAktif, setIndeksAktif] = useState(0);
  const fotoAktif = fotoTersedia[indeksAktif] || fotoUtama || "/images/placeholder.svg";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-garis bg-permukaan">
        <img src={fotoAktif} alt={`${nama} - Foto ${indeksAktif + 1}`} className="h-full w-full object-cover transition-transform duration-300" />
        {fotoTersedia.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            {indeksAktif + 1}/{fotoTersedia.length}
          </div>
        )}
      </div>
      {fotoTersedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotoTersedia.map((f, idx) => (
            <button key={idx} type="button" onClick={() => setIndeksAktif(idx)} className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${idx === indeksAktif ? "border-utama ring-1 ring-utama/30" : "border-garis opacity-70 hover:opacity-100"}`}>
              <img src={f} alt={`${nama} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
