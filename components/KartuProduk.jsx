import Link from "next/link";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import TombolKeranjang from "@/components/TombolKeranjang";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";

export default function KartuProduk({ produk }) {
  const isHabis = produk.stok === 0 || produk.status_stok === "habis";
  const adaDiskon = produk.harga_coret && Number(produk.harga_coret) > Number(produk.harga);
  const diskonPersen = adaDiskon ? Math.round((1 - Number(produk.harga) / Number(produk.harga_coret)) * 100) : 0;
  const isBaru = produk.baru || produk.is_baru || (produk.created_at && Date.now() - new Date(produk.created_at).getTime() < 30 * 24 * 60 * 60 * 1000);
  const isTerlaris = produk.terlaris || produk.is_terlaris;

  const slug = produk.kategori_slug || (typeof produk.kategori === "string" ? produk.kategori.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "menu");

  return (
    <div className="group relative flex flex-col rounded-2xl border border-garis bg-latar overflow-hidden hover:border-utama/50 transition">
      <Link href={`/produk/${produk.id}`} className="relative aspect-square w-full bg-permukaan block overflow-hidden">
        <img
          src={ambilFotoUtama(produk)} alt={produk.nama} loading="lazy"
          className={`h-full w-full object-cover group-hover:scale-105 transition duration-300 ${isHabis ? "opacity-60 grayscale" : ""}`}
        />

        {/* US-20: Badge Diskon, Terlaris, Baru */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 items-start z-10">
          {adaDiskon && <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Hemat {diskonPersen}%</span>}
          {isTerlaris && <span className="rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Terlaris</span>}
          {isBaru && !isTerlaris && <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Baru</span>}
        </div>

        {/* US-19: Status Stok */}
        <span className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${isHabis ? "bg-red-600/90" : "bg-emerald-600/85"}`}>
          {isHabis ? "Stok Habis" : `Stok: ${produk.stok}`}
        </span>

        {/* US-24 & US-37: Tombol Favorit & Bandingkan */}
        <div className="absolute bottom-2 right-2 flex gap-1 z-10">
          <TombolBandingkan produk={produk} ikonOnly />
          <TombolFavorit produk={produk} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-3 gap-1.5">
        <div>
          {/* US-49: Link Kategori */}
          <Link href={`/kategori/${slug}`} className="text-[11px] font-semibold text-teks-lembut hover:text-utama truncate block">
            {produk.kategori}
          </Link>
          <Link href={`/produk/${produk.id}`} className="font-bold text-xs sm:text-sm text-teks hover:text-utama line-clamp-2 block mt-0.5">
            {produk.nama}
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between gap-1 pt-1">
          <div>
            <span className="block text-xs sm:text-sm font-extrabold text-harga">{formatRupiah(produk.harga)}</span>
            {adaDiskon && <del className="block text-[10px] text-red-500 line-through">{formatRupiah(produk.harga_coret)}</del>}
          </div>
          {isHabis ? (
            <span className="rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-400 text-[10px] font-semibold px-2 py-1">Habis</span>
          ) : (
            <TombolKeranjang produk={produk} className="h-7 px-2 text-[11px]" />
          )}
        </div>
      </div>
    </div>
  );
}
