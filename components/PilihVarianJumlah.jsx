"use client";

import { formatRupiah } from "@/lib/format";

export default function PilihVarianJumlah({
  varianTersedia = [],
  varianAktif,
  onPilihVarian,
  jumlah,
  onUbahJumlah,
  stokMaksimal,
  total,
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {varianTersedia.length > 1 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-teks-lembut">Pilihan Varian / Ukuran:</span>
          <div className="flex flex-wrap gap-1.5">
            {varianTersedia.map((v) => {
              const sel = varianAktif?.nama === v.nama;
              const extra = Number(v.harga_tambahan) || 0;
              return (
                <button
                  key={v.id || v.nama}
                  type="button"
                  onClick={() => onPilihVarian(v)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    sel ? "border-utama bg-utama/10 text-utama font-bold" : "border-garis bg-permukaan text-teks-lembut hover:border-utama"
                  }`}
                >
                  {v.nama} {extra > 0 ? `(+${formatRupiah(extra)})` : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs">
        <span className="font-semibold text-teks">Jumlah:</span>
        <div className="inline-flex items-center rounded-lg border border-garis bg-latar">
          <button
            type="button"
            onClick={() => onUbahJumlah(Math.max(1, jumlah - 1))}
            disabled={jumlah <= 1}
            className="px-2.5 py-1 font-bold text-teks hover:bg-permukaan disabled:opacity-30 cursor-pointer"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center font-bold text-teks">{jumlah}</span>
          <button
            type="button"
            onClick={() => onUbahJumlah(Math.min(stokMaksimal, jumlah + 1))}
            disabled={stokMaksimal > 0 && jumlah >= stokMaksimal}
            className="px-2.5 py-1 font-bold text-teks hover:bg-permukaan disabled:opacity-30 cursor-pointer"
          >
            +
          </button>
        </div>
        <span className="text-teks-lembut ml-auto">
          Total: <strong className="text-utama text-sm">{formatRupiah(total)}</strong>
        </span>
      </div>
    </div>
  );
}
