"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import TombolKeranjang from "@/components/TombolKeranjang";

/**
 * US-03: Pesan via WhatsApp
 * Membuka WhatsApp ke nomor di lib/toko.js dengan pesan otomatis berisi nama dan harga produk.
 * US-12 & US-48: Jumlah dan varian ikut tertulis di pesan WhatsApp.
 */
export function buatLinkWhatsApp(optionsOrNama, hargaProduk) {
  let nomor = toko.nomorWhatsApp;
  let namaProduk = "";
  let hargaTeks = "";
  let pesan = "";

  if (typeof optionsOrNama === "object" && optionsOrNama !== null) {
    nomor = optionsOrNama.nomor || toko.nomorWhatsApp;
    namaProduk = optionsOrNama.namaProduk || optionsOrNama.nama || "";
    const hargaNum = Number(optionsOrNama.harga) || 0;
    const jumlah = optionsOrNama.jumlah || 1;
    const varian = optionsOrNama.varian;
    hargaTeks = formatRupiah(hargaNum);
    const varianTeks = varian && varian !== "Regular" ? `\nVarian: ${varian}` : "";
    const jumlahTeks = jumlah > 1 ? `\nJumlah: ${jumlah}\nTotal: ${formatRupiah(hargaNum * jumlah)}` : "";
    pesan = `Halo ${optionsOrNama.namaToko || toko.nama}, saya ingin memesan:\n\n*${namaProduk}*${varianTeks}\nHarga: ${hargaTeks}${jumlahTeks}\n\nTerima kasih!`;
  } else {
    namaProduk = String(optionsOrNama || "");
    hargaTeks = typeof hargaProduk === "number" ? formatRupiah(hargaProduk) : String(hargaProduk || "");
    pesan = `Halo, saya ingin memesan:\n\n*${namaProduk}*\nHarga: ${hargaTeks}\n\nTerima kasih!`;
  }

  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export default function TombolWhatsApp({ produk, varianList = [], nomorWhatsApp = null, namaToko = null }) {
  const nomor = nomorWhatsApp || toko.nomorWhatsApp;
  const nama = namaToko || toko.nama;
  const varianTersedia = Array.isArray(varianList) && varianList.length > 0 ? varianList : [{ id: "reg", nama: "Regular", harga_tambahan: 0 }, { id: "lrg", nama: "Large", harga_tambahan: 4000 }];
  const [jumlah, setJumlah] = useState(1);
  const [varianAktif, setVarianAktif] = useState(varianTersedia[0]);

  const hargaSatuan = (Number(produk?.harga) || 0) + (Number(varianAktif?.harga_tambahan) || 0);
  const stokMaksimal = varianAktif?.stok ?? Number(produk?.stok) ?? 10;
  const total = hargaSatuan * jumlah;
  const namaProduk = varianAktif?.nama && varianAktif.nama !== "Regular" ? `${produk?.nama} (${varianAktif.nama})` : produk?.nama;
  const isHabis = produk?.stok === 0 || produk?.status_stok === "habis";

  // US-03, US-12, US-48: Link WhatsApp memuat nama produk, varian, dan jumlah
  const urlWhatsApp = buatLinkWhatsApp({ nomor, namaToko: nama, namaProduk, harga: hargaSatuan, jumlah, varian: varianAktif?.nama || "Regular" });

  function catatKlik() {
    try {
      const data = JSON.stringify({ produkId: produk?.id, nama: namaProduk, harga: hargaSatuan, jumlah });
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/analitik/klik", new Blob([data], { type: "application/json" }));
      } else if (typeof fetch !== "undefined") {
        fetch("/api/analitik/klik", { method: "POST", headers: { "Content-Type": "application/json" }, body: data, keepalive: true }).catch(() => {});
      }
    } catch {}
  }

  if (isHabis) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-700">Stok Habis (Pesan via WhatsApp Dinonaktifkan)</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* US-12 & US-48: Pilihan Varian */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-teks">Pilih Varian / Ukuran:</label>
        <div className="grid grid-cols-2 gap-2">
          {varianTersedia.map((v) => {
            const isSelected = (varianAktif?.id || varianAktif?.nama) === (v.id || v.nama);
            const extra = Number(v.harga_tambahan) || 0;
            return (
              <button
                key={v.id || v.nama}
                type="button"
                onClick={() => setVarianAktif(v)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${isSelected ? "border-utama bg-utama/10 text-utama font-bold" : "border-garis bg-permukaan text-teks-lembut hover:border-utama"}`}
              >
                <span>{v.nama}</span>
                <span>{extra > 0 ? `+${formatRupiah(extra)}` : "Standar"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* US-12: Pemilih Jumlah */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-garis bg-permukaan p-2.5">
        <span className="text-xs font-semibold text-teks">Jumlah:</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setJumlah((j) => Math.max(1, j - 1))} disabled={jumlah <= 1} className="flex h-7 w-7 items-center justify-center rounded-lg border border-garis bg-latar text-sm font-bold text-teks hover:border-utama disabled:opacity-40 cursor-pointer" aria-label="Kurangi jumlah">−</button>
          <span className="min-w-6 text-center text-xs font-bold text-teks">{jumlah}</span>
          <button type="button" onClick={() => setJumlah((j) => (stokMaksimal > 0 && j >= stokMaksimal ? j : j + 1))} disabled={stokMaksimal > 0 && jumlah >= stokMaksimal} className="flex h-7 w-7 items-center justify-center rounded-lg border border-garis bg-latar text-sm font-bold text-teks hover:border-utama disabled:opacity-40 cursor-pointer" aria-label="Tambah jumlah">+</button>
        </div>
        <span className="text-xs font-bold text-harga">Total: {formatRupiah(total)}</span>
      </div>

      {/* US-03, US-12, US-40: Tombol WhatsApp & Keranjang */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <a href={urlWhatsApp} target="_blank" rel="noopener noreferrer" onClick={catatKlik} className="inline-flex flex-1 items-center justify-center rounded-xl bg-utama px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-utama-gelap transition">
          Pesan via WhatsApp
        </a>
        <TombolKeranjang produk={{ ...produk, nama: namaProduk, harga: hargaSatuan, stok: stokMaksimal }} jumlah={jumlah} className="rounded-xl px-4 py-3 text-xs" teks="+ Keranjang" />
      </div>
    </div>
  );
}
