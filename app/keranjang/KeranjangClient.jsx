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
    <div className="flex flex-col gap-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-garis pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Keranjang Belanja</h1>
          <p className="text-xs text-teks-lembut mt-0.5">{totalItem} menu siap dipesan via WhatsApp</p>
        </div>
        <button type="button" onClick={() => { kosongkanKeranjang(); setItems([]); }} className="text-xs text-red-500 hover:underline cursor-pointer">Kosongkan</button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={`${item.id}-${item.nama}`} className="flex items-center gap-3 rounded-2xl border border-garis bg-permukaan p-3">
            <img src={ambilFotoUtama(item)} alt={item.nama} className="h-16 w-16 rounded-xl object-cover bg-latar shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-teks truncate">{item.nama}</h3>
              <p className="text-xs font-bold text-harga">{formatRupiah(item.harga)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => perbaruiJumlah(item.id, Math.max(1, (Number(item.jumlah) || 1) - 1))} className="h-7 w-7 rounded-lg border border-garis text-xs font-bold hover:border-utama cursor-pointer">−</button>
              <span className="min-w-6 text-center text-xs font-bold">{item.jumlah}</span>
              <button type="button" onClick={() => perbaruiJumlah(item.id, (Number(item.jumlah) || 1) + 1)} className="h-7 w-7 rounded-lg border border-garis text-xs font-bold hover:border-utama cursor-pointer">+</button>
            </div>
            <button type="button" onClick={() => hapusDariKeranjang(item.id)} className="text-red-500 hover:text-red-700 p-1 text-xs cursor-pointer ml-1" title="Hapus">✕</button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm font-bold text-teks">
          <span>Total Belanja:</span>
          <span className="text-base text-harga">{formatRupiah(totalHarga)}</span>
        </div>
        <button type="button" onClick={handleCheckoutWhatsApp} className="w-full rounded-xl bg-utama py-3 text-xs sm:text-sm font-bold text-white hover:bg-utama-gelap transition cursor-pointer">
          Pesan Semua via WhatsApp ({items.length} Menu)
        </button>
      </div>
    </div>
  );
}
