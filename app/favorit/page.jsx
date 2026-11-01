"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ambilFavorit, simpanFavorit } from "@/lib/favorit";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import TombolKeranjang from "@/components/TombolKeranjang";

export default function HalamanFavorit() {
  const [daftarFavorit, setDaftarFavorit] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDaftarFavorit(ambilFavorit());

    function handleUpdate() {
      setDaftarFavorit(ambilFavorit());
    }

    window.addEventListener("favorit-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("favorit-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  function handleHapus(id, e) {
    e.preventDefault();
    e.stopPropagation();
    const updated = daftarFavorit.filter((p) => p.id !== id);
    setDaftarFavorit(updated);
    simpanFavorit(updated);
  }

  if (!mounted) {
    return <div className="py-12 text-center text-sm text-teks-lembut">Memuat produk favorit…</div>;
  }

  return (
    <div className="py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-garis pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Menu Favorit Saya</h1>
          <p className="text-xs text-teks-lembut mt-0.5">Daftar menu tersimpan di browser Anda ({daftarFavorit.length})</p>
        </div>
        <Link href="/" className="text-xs font-semibold text-utama hover:underline">← Katalog</Link>
      </div>

      {daftarFavorit.length === 0 ? (
        <div className="py-16 text-center text-sm text-teks-lembut">
          Belum ada produk favorit yang disimpan. Tandai ikon hati di kartu produk!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {daftarFavorit.map((p) => (
            <div key={p.id} className="rounded-2xl border border-garis bg-permukaan overflow-hidden p-3 flex flex-col gap-2">
              <Link href={`/produk/${p.id}`} className="aspect-square rounded-xl overflow-hidden bg-latar block">
                <img src={ambilFotoUtama(p)} alt={p.nama} className="h-full w-full object-cover" />
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teks-lembut">{p.kategori}</span>
                <button
                  type="button"
                  onClick={(e) => handleHapus(p.id, e)}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Hapus
                </button>
              </div>
              <Link href={`/produk/${p.id}`} className="font-bold text-sm text-teks hover:text-utama truncate">
                {p.nama}
              </Link>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="font-extrabold text-xs text-harga">{formatRupiah(p.harga)}</span>
                <TombolKeranjang produk={p} className="h-8 px-2.5 text-xs" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
