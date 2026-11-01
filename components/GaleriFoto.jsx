"use client";

import { useState } from "react";

export default function GaleriFoto({ fotoUtama, fotoList = [], nama = "Produk" }) {
  const daftarSemuaFoto = [fotoUtama, ...(Array.isArray(fotoList) ? fotoList : [])].filter(Boolean);
  const fotoTersedia = [
    ...new Set(
      daftarSemuaFoto.flatMap((item) =>
        typeof item === "string" && item.includes(",")
          ? item.split(",").map((s) => s.trim())
          : item
      )
    ),
  ].filter(Boolean);

  const [indeksAktif, setIndeksAktif] = useState(0);
  const fotoAktif = fotoTersedia[indeksAktif] || fotoUtama || "/images/placeholder.svg";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-garis bg-permukaan">
        <img
          src={fotoAktif}
          alt={`${nama} - Foto ${indeksAktif + 1}`}
          className="h-full w-full object-cover transition-transform duration-300"
        />
        {fotoTersedia.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
            {indeksAktif + 1} / {fotoTersedia.length}
          </div>
        )}
      </div>

      {fotoTersedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotoTersedia.map((foto, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndeksAktif(idx)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                idx === indeksAktif ? "border-utama ring-2 ring-utama/20" : "border-garis opacity-70 hover:opacity-100"
              }`}
            >
              <img src={foto} alt={`${nama} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
