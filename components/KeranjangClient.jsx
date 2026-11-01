"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import { toko as defaultToko } from "@/lib/toko";
import { ambilKeranjang, perbaruiJumlah, hapusDariKeranjang, kosongkanKeranjang } from "@/lib/keranjang";

export default function KeranjangClient({ toko = null }) {
  const [items, setItems] = useState([]);
  const [dimuat, setDimuat] = useState(false);
  const info = toko || defaultToko;

  useEffect(() => {
    setItems(ambilKeranjang());
    setDimuat(true);
    const update = () => setItems(ambilKeranjang());
    window.addEventListener("keranjang-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("keranjang-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const totalHarga = items.reduce((tot, i) => tot + (Number(i.harga) || 0) * (Number(i.jumlah) || 1), 0);
  const totalItem = items.reduce((tot, i) => tot + (Number(i.jumlah) || 1), 0);

  function handleCheckoutWhatsApp() {
    if (items.length === 0) return;
    let pesan = `Halo ${info.nama}, saya ingin memesan menu berikut:\n\n`;
    items.forEach((item, idx) => {
      const subtotal = (Number(item.harga) || 0) * (Number(item.jumlah) || 1);
      pesan += `${idx + 1}. *${item.nama}* x${item.jumlah} = ${formatRupiah(subtotal)}\n`;
    });
    pesan += `\n*Total Belanja:* ${formatRupiah(totalHarga)}\n\nTerima kasih!`;

    const nomorWA = info?.nomorWhatsApp || defaultToko.nomorWhatsApp;
    const urlWA = `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`;

    try {
      const payload = JSON.stringify({ produkId: items[0]?.id || 1, nama: `Keranjang (${items.length} menu)`, harga: totalHarga, jumlah: totalItem });
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/analitik/klik", new Blob([payload], { type: "application/json" }));
      }
    } catch {}

    window.open(urlWA, "_blank", "noopener,noreferrer");
  }

  if (!dimuat) return <div className="py-12 text-center text-xs text-teks-lembut">Memuat keranjang…</div>;
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-teks">Keranjang Kosong</h2>
        <p className="text-xs text-teks-lembut mt-1">Kamu belum memasukkan menu ke keranjang.</p>
        <Link href="/" className="mt-4 inline-block rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white">Lihat Katalog</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 flex flex-col gap-3">
        <div className="flex justify-between items-center pb-2 border-b border-garis">
          <span className="text-xs font-bold text-teks">Menu Dipilih ({totalItem} porsi)</span>
          <button type="button" onClick={kosongkanKeranjang} className="text-xs text-red-500 hover:underline cursor-pointer">Kosongkan</button>
        </div>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-garis bg-permukaan p-3">
            <img src={ambilFotoUtama(item)} alt={item.nama} className="h-14 w-14 rounded-xl object-cover bg-latar shrink-0" />
            <div className="flex-1 min-w-0">
              <Link href={`/produk/${item.id}`} className="font-bold text-xs text-teks hover:text-utama truncate block">{item.nama}</Link>
              <p className="text-[11px] text-teks-lembut">{formatRupiah(item.harga)}</p>
              <p className="text-xs font-bold text-utama mt-0.5">{formatRupiah((item.harga || 0) * (item.jumlah || 1))}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-garis bg-latar text-xs">
                <button type="button" onClick={() => perbaruiJumlah(item.id, Math.max(1, item.jumlah - 1))} className="px-2 py-0.5 font-bold cursor-pointer">-</button>
                <span className="px-1.5 font-bold">{item.jumlah}</span>
                <button type="button" onClick={() => perbaruiJumlah(item.id, item.jumlah + 1)} className="px-2 py-0.5 font-bold cursor-pointer">+</button>
              </div>
              <button type="button" onClick={() => hapusDariKeranjang(item.id)} className="text-xs text-red-500 p-1 cursor-pointer">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-4 rounded-2xl border border-garis bg-permukaan p-4 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-teks">Total Belanja</h2>
        <div className="flex justify-between text-xs">
          <span className="text-teks-lembut">Total Menu</span>
          <span className="font-bold text-teks">{totalItem} porsi</span>
        </div>
        <div className="flex justify-between text-sm font-extrabold border-t border-garis pt-2">
          <span>Total</span>
          <span className="text-utama">{formatRupiah(totalHarga)}</span>
        </div>
        <button
          type="button" onClick={handleCheckoutWhatsApp}
          className="w-full rounded-xl bg-utama py-2.5 text-xs font-bold text-white hover:bg-utama-gelap transition cursor-pointer"
        >
          Pesan Semua via WhatsApp
        </button>
      </div>
    </div>
  );
}
