"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import TombolKeranjang from "@/components/TombolKeranjang";

export function buatLinkWhatsApp(optionsOrNama, hargaProduk) {
  let nomor = toko.nomorWhatsApp, namaProduk = "", hargaTeks = "", pesan = "";
  if (typeof optionsOrNama === "object" && optionsOrNama !== null) {
    nomor = optionsOrNama.nomor || optionsOrNama.nomorWhatsApp || optionsOrNama.toko?.nomorWhatsApp || toko.nomorWhatsApp;
    namaProduk = optionsOrNama.namaProduk || optionsOrNama.nama || "";
    const hargaNum = Number(optionsOrNama.harga) || 0, jumlah = optionsOrNama.jumlah || 1, varian = optionsOrNama.varian;
    hargaTeks = formatRupiah(hargaNum);
    const varianTeks = varian && varian !== "Regular" ? `\nVarian: ${varian}` : "";
    const jumlahTeks = jumlah > 1 ? `\nJumlah: ${jumlah}\nTotal: ${formatRupiah(hargaNum * jumlah)}` : "";
    const namaToko = optionsOrNama.namaToko || optionsOrNama.toko?.nama || toko.nama;
    pesan = `Halo ${namaToko}, saya ingin memesan:\n\n*${namaProduk}*${varianTeks}\nHarga: ${hargaTeks}${jumlahTeks}\n\nTerima kasih!`;
  } else {
    namaProduk = String(optionsOrNama || "");
    hargaTeks = typeof hargaProduk === "number" ? formatRupiah(hargaProduk) : String(hargaProduk || "");
    pesan = `Halo, saya ingin memesan:\n\n*${namaProduk}*\nHarga: ${hargaTeks}\n\nTerima kasih!`;
  }
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export default function TombolWhatsApp({ produk, varianList = [], nomorWhatsApp = null, namaToko = null, toko: tokoProp = null }) {
  const activeToko = tokoProp || {};
  const nomor = activeToko.nomorWhatsApp || nomorWhatsApp || toko.nomorWhatsApp;
  const nama = activeToko.nama || namaToko || toko.nama;
  const varianTersedia = Array.isArray(varianList) && varianList.length > 0 ? varianList : [{ id: "reg", nama: "Regular", harga_tambahan: 0 }, { id: "lrg", nama: "Large", harga_tambahan: 4000 }];
  const [jumlah, setJumlah] = useState(1);
  const [varianAktif, setVarianAktif] = useState(varianTersedia[0]);

  const hargaSatuan = (Number(produk?.harga) || 0) + (Number(varianAktif?.harga_tambahan) || 0);
  const total = hargaSatuan * jumlah;
  const namaProduk = varianAktif?.nama && varianAktif.nama !== "Regular" ? `${produk?.nama} (${varianAktif.nama})` : produk?.nama;
  const isHabis = produk?.stok === 0 || produk?.status_stok === "habis";
  const urlWhatsApp = buatLinkWhatsApp({ nomor, namaToko: nama, namaProduk, harga: hargaSatuan, jumlah, varian: varianAktif?.nama || "Regular", toko: { nama, nomorWhatsApp: nomor } });

  function catatKlik() {
    try {
      const data = JSON.stringify({ produkId: produk?.id, nama: namaProduk, harga: hargaSatuan, jumlah });
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/analitik/klik", new Blob([data], { type: "application/json" }));
      }
    } catch {}
  }

  if (isHabis) return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-700">Stok Habis (Pesan via WhatsApp Dinonaktifkan)</div>;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-teks">Pilih Varian:</label>
        <div className="grid grid-cols-2 gap-1.5">
          {varianTersedia.map((v) => {
            const isSelected = (varianAktif?.id || varianAktif?.nama) === (v.id || v.nama);
            const extra = Number(v.harga_tambahan) || 0;
            return (
              <button key={v.id || v.nama} type="button" onClick={() => setVarianAktif(v)} className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs transition cursor-pointer ${isSelected ? "border-utama bg-utama/10 text-utama font-bold" : "border-garis bg-permukaan text-teks-lembut hover:border-utama"}`}>
                <span>{v.nama}</span><span>{extra > 0 ? `+${formatRupiah(extra)}` : "Standar"}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-garis bg-permukaan p-2">
        <span className="text-xs font-semibold text-teks">Jumlah:</span>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setJumlah((j) => Math.max(1, j - 1))} disabled={jumlah <= 1} className="flex h-6 w-6 items-center justify-center rounded border border-garis text-xs font-bold hover:border-utama disabled:opacity-40 cursor-pointer">−</button>
          <span className="w-6 text-center text-xs font-bold text-teks">{jumlah}</span>
          <button type="button" onClick={() => setJumlah((j) => Math.min(Number(produk?.stok || 99), j + 1))} className="flex h-6 w-6 items-center justify-center rounded border border-garis text-xs font-bold hover:border-utama cursor-pointer">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs font-semibold border-t border-garis pt-2">
        <span className="text-teks-lembut">Total Pesanan:</span>
        <span className="text-sm font-extrabold text-harga">{formatRupiah(total)}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <a href={urlWhatsApp} target="_blank" rel="noopener noreferrer" onClick={catatKlik} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-sm">
          <span>💬</span><span>Pesan via WhatsApp</span>
        </a>
        <TombolKeranjang produk={{ ...produk, harga: hargaSatuan, nama: namaProduk }} jumlah={jumlah} varian={varianAktif?.nama} className="py-2.5 text-xs" />
      </div>
    </div>
  );
}
