"use client";

import { formatRupiah } from "@/lib/format";

export default function PilihVarianJumlah({ varianTersedia = [], varianAktif, onPilihVarian, jumlah, onUbahJumlah, total }) {
  return (
    <div className="flex flex-col gap-2 text-xs">
      {varianTersedia.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {varianTersedia.map((v) => (
            <button
              key={v.id || v.nama}
              type="button"
              onClick={() => onPilihVarian?.(v)}
              className={`rounded-lg border px-2 py-1 ${(varianAktif?.nama === v.nama) ? "border-utama text-utama font-bold" : "border-garis text-teks-lembut"}`}
            >
              {v.nama} {Number(v.harga_tambahan) > 0 ? `(+${formatRupiah(v.harga_tambahan)})` : ""}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <span>Jumlah:</span>
        <button type="button" onClick={() => onUbahJumlah?.(Math.max(1, jumlah - 1))} className="px-2 py-0.5 border border-garis rounded">−</button>
        <span className="font-bold">{jumlah}</span>
        <button type="button" onClick={() => onUbahJumlah?.(jumlah + 1)} className="px-2 py-0.5 border border-garis rounded">+</button>
        <span className="ml-auto font-bold text-utama">{formatRupiah(total)}</span>
      </div>
    </div>
  );
}
