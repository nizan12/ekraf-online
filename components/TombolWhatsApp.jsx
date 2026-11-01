"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import TombolKeranjang from "@/components/TombolKeranjang";
import PilihVarianJumlah from "@/components/PilihVarianJumlah";

export function buatLinkWhatsApp({ nomor, namaToko, namaProduk, harga, jumlah = 1, varian = "Regular" }) {
  const pesan =
    `Halo ${namaToko}, saya ingin memesan:\n\n` +
    `*${namaProduk}*\n` +
    `Varian: ${varian}\n` +
    `Harga: ${formatRupiah(harga)}\n` +
    `Jumlah: ${jumlah}\n` +
    `Total: ${formatRupiah(harga * jumlah)}\n\n` +
    `Terima kasih!`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export default function TombolWhatsApp({ produk, varianList = [], nomorWhatsApp = null, namaToko = null }) {
  const nomor = nomorWhatsApp || toko.nomorWhatsApp;
  const nama = namaToko || toko.nama;

  const varianTersedia = Array.isArray(varianList) && varianList.length > 0
    ? varianList
    : [{ id: "reg", nama: "Regular", harga_tambahan: 0 }];

  const [jumlah, setJumlah] = useState(1);
  const [varianAktif, setVarianAktif] = useState(varianTersedia[0]);

  const hargaSatuan = (Number(produk.harga) || 0) + (Number(varianAktif?.harga_tambahan) || 0);
  const stokMaksimal = varianAktif?.stok ?? Number(produk.stok) ?? 10;
  const namaProduk = varianAktif?.nama && varianAktif.nama !== "Regular" ? `${produk.nama} (${varianAktif.nama})` : produk.nama;
  const isHabis = produk.stok === 0 || produk.status_stok === "habis";

  const urlWhatsApp = buatLinkWhatsApp({
    nomor,
    namaToko: nama,
    namaProduk,
    harga: hargaSatuan,
    jumlah,
    varian: varianAktif?.nama || "Regular",
  });

  function catatKlik() {
    try {
      const data = JSON.stringify({ produkId: produk.id, nama: namaProduk, harga: hargaSatuan, jumlah });
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/analitik/klik", new Blob([data], { type: "application/json" }));
      } else if (typeof fetch !== "undefined") {
        fetch("/api/analitik/klik", { method: "POST", headers: { "Content-Type": "application/json" }, body: data, keepalive: true }).catch(() => {});
      }
    } catch {}
  }

  if (isHabis) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-700">
        Stok Habis
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <PilihVarianJumlah
        varianTersedia={varianTersedia}
        varianAktif={varianAktif}
        onPilihVarian={(v) => {
          setVarianAktif(v);
          const b = v.stok ?? Number(produk.stok) ?? 10;
          if (b > 0 && jumlah > b) setJumlah(b);
        }}
        jumlah={jumlah}
        onUbahJumlah={setJumlah}
        stokMaksimal={stokMaksimal}
        total={hargaSatuan * jumlah}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={catatKlik}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-utama px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-utama-gelap transition"
        >
          Pesan via WhatsApp
        </a>
        <TombolKeranjang
          produk={{ ...produk, nama: namaProduk, harga: hargaSatuan, stok: stokMaksimal }}
          jumlah={jumlah}
          className="rounded-xl px-4 py-3 text-xs"
          teks="+ Keranjang"
        />
      </div>
    </div>
  );
}
