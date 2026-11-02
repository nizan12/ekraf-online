import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp, { buatLinkWhatsApp } from "@/app/TombolWhatsApp";
export { buatLinkWhatsApp };
import TombolBagikan from "./TombolBagikan";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import GaleriFoto from "@/components/GaleriFoto";
import KartuProduk from "@/components/KartuProduk";
import BagianUlasan from "@/components/BagianUlasan";
import KotakTanyaProdukAI from "@/components/KotakTanyaProdukAI";
import { buatClientServer, normalisasiProduk, normalisasiDaftarProduk } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const sb = buatClientServer();
  const [{ data: rawProduk }, { data: dbToko }] = await Promise.all([
    sb.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)").eq("id", id).single(),
    sb.from("pengaturan_toko").select("*").limit(1).maybeSingle(),
  ]);
  const produk = normalisasiProduk(rawProduk);
  if (!produk || produk.aktif === false) notFound();
  const namaToko = dbToko?.nama || toko.nama;
  const gambar = produk.image || produk.foto_url;
  return {
    title: `${produk.nama} - ${formatRupiah(produk.harga)}`,
    description: produk.deskripsi || `Beli ${produk.nama} di ${namaToko}. Harga ${formatRupiah(produk.harga)}. Siap dipesan via WhatsApp.`,
    openGraph: {
      title: `${produk.nama} - ${formatRupiah(produk.harga)}`,
      description: produk.deskripsi || `Beli ${produk.nama} di ${namaToko}. Siap dipesan via WhatsApp.`,
      type: "article",
      images: gambar ? [{ url: gambar }] : [],
    },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const sb = buatClientServer();

  const [pengaturan, { data: rawProduk, error }, { data: dbToko }] = await Promise.all([
    ambilPengaturanPublik(),
    sb.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)").eq("id", id).single(),
    sb.from("pengaturan_toko").select("*").limit(1).maybeSingle(),
  ]);

  const nonaktifIds = pengaturan?.nonaktifIds || [];
  const produk = normalisasiProduk(rawProduk);
  if (error || !produk || nonaktifIds.includes(Number(id)) || produk.aktif === false) notFound();

  const tokoAktif = dbToko ? {
    nama: dbToko.nama || toko.nama,
    nomorWhatsApp: dbToko.nomor_whatsapp || toko.nomorWhatsApp,
    alamat: dbToko.alamat || toko.alamat,
    jamBuka: dbToko.jam_buka || toko.jamBuka,
  } : (pengaturan?.tokoInfo || toko);

  let ulasanList = [];
  try {
    const { data: dbUlasan } = await sb.from("ulasan").select("*").eq("produk_id", Number(id) || id).eq("disetujui", true).order("created_at", { ascending: false });
    if (dbUlasan) ulasanList = dbUlasan;
  } catch {}
  const rataRataRating = ulasanList.length > 0 ? (ulasanList.reduce((sum, u) => sum + (Number(u.rating) || 5), 0) / ulasanList.length).toFixed(1) : null;

  let varianList = [];
  try {
    const { data: dbVarian } = await sb.from("varian").select("*").eq("produk_id", id).order("id", { ascending: true });
    if (dbVarian) varianList = dbVarian;
  } catch {}

  let relasiQuery = sb.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)").neq("id", id).eq("aktif", true);
  if (produk.kategori_id) relasiQuery = relasiQuery.eq("kategori_id", produk.kategori_id);
  else if (produk.kategori) relasiQuery = relasiQuery.eq("kategori", produk.kategori);
  if (nonaktifIds.length > 0) relasiQuery = relasiQuery.not("id", "in", `(${nonaktifIds.join(",")})`);
  const { data: terkaitRaw } = await relasiQuery.limit(3);
  const produkTerkait = normalisasiDaftarProduk(terkaitRaw || []);

  const isHabis = produk.stok === 0 || produk.status_stok === "habis";
  const adaDiskon = produk.harga_coret && Number(produk.harga_coret) > Number(produk.harga);
  const diskonPersen = adaDiskon ? Math.round((1 - Number(produk.harga) / Number(produk.harga_coret)) * 100) : 0;
  const semuaFoto = [produk.foto_url, produk.image].filter(Boolean).flatMap((f) => (typeof f === "string" ? f.split(",").map((s) => s.trim()) : [f])).filter(Boolean);
  const slugKategori = produk.kategori_slug || (typeof produk.kategori === "string" ? produk.kategori.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "menu");

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto">
      <article className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <GaleriFoto fotoUtama={produk.image || produk.foto_url} fotoList={semuaFoto} nama={produk.nama} />
        <div className="flex flex-col gap-3">
          <Link href="/" className="text-xs text-teks-lembut underline hover:text-utama">← Kembali ke katalog</Link>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link href={`/kategori/${slugKategori}`} className="text-xs font-semibold text-teks-lembut hover:text-utama">{produk.kategori}</Link>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isHabis ? "bg-red-100 text-red-600" : "bg-utama/10 text-utama"}`}>{isHabis ? "Stok Habis" : `Tersedia (${produk.stok} porsi)`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TombolBandingkan produk={produk} />
              <TombolBagikan namaProduk={produk.nama} />
              <TombolFavorit produk={produk} ikonOnly />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-teks">{produk.nama}</h1>
            {rataRataRating && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-amber-500 shrink-0">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                </svg>
                <span>{rataRataRating}/5 ({ulasanList.length} ulasan)</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="rounded-md bg-harga-latar px-2.5 py-1 text-xl font-bold text-harga">{formatRupiah(produk.harga)}</p>
            {adaDiskon && (
              <>
                <del className="text-sm text-red-500 line-through font-semibold">{formatRupiah(produk.harga_coret)}</del>
                <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Hemat {diskonPersen}%</span>
              </>
            )}
            {(produk.terlaris || produk.is_terlaris) && <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">Terlaris</span>}
            {(produk.baru || produk.is_baru) && <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">Baru</span>}
          </div>
          <p className="leading-relaxed text-teks-lembut text-xs sm:text-sm">{produk.deskripsi}</p>
          <div className="pt-1">
            {isHabis ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-center text-xs font-semibold text-red-700">Stok Habis (Pesan via WhatsApp Dinonaktifkan)</div>
            ) : (
              <TombolWhatsApp produk={produk} varianList={varianList} toko={tokoAktif} nomorWhatsApp={tokoAktif?.nomorWhatsApp || toko.nomorWhatsApp} namaToko={tokoAktif?.nama || toko.nama} />
            )}
          </div>
        </div>
      </article>

      <KotakTanyaProdukAI produk={produk} />
      <BagianUlasan produkId={id} namaProduk={produk.nama} ulasanListAwal={ulasanList} />

      {produkTerkait.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-garis pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-teks">Menu Terkait di Kategori Ini</h2>
            <Link href={`/kategori/${slugKategori}`} className="text-xs font-semibold text-utama hover:underline">Lihat Semua →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {produkTerkait.map((item) => <KartuProduk key={item.id} produk={item} />)}
          </div>
        </section>
      )}

      <TerakhirDilihat produkSaatIni={produk} />
    </div>
  );
}
