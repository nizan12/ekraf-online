import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "./TombolWhatsApp";
import { toko } from "@/lib/toko";

/**
 * US-03: Pesan via WhatsApp
 * Membuka WhatsApp ke nomor di lib/toko.js dengan pesan otomatis berisi nama dan harga produk.
 */
export function buatLinkWhatsApp(namaProduk, hargaProduk) {
  const nomor = toko.nomorWhatsApp;
  const hargaTeks = typeof hargaProduk === "number" ? `Rp ${hargaProduk.toLocaleString("id-ID")}` : String(hargaProduk || "");
  const pesan = `Halo, saya ingin memesan:\n\n*${namaProduk}*\nHarga: ${hargaTeks}\n\nTerima kasih!`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}
import TombolBagikan from "./TombolBagikan";
import TombolFavorit from "@/components/TombolFavorit";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import GaleriFoto from "@/components/GaleriFoto";
import KartuProduk from "@/components/KartuProduk";
import BagianUlasan from "@/components/BagianUlasan";
import KotakTanyaProdukAI from "@/components/KotakTanyaProdukAI";
import { buatClientServer, normalisasiProduk, normalisasiDaftarProduk } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";

// US-26: Metadata SEO dan Open Graph
export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = buatClientServer();
  const [{ data: rawProduk }, { data: dbToko }] = await Promise.all([
    supabase.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)").eq("id", id).single(),
    supabase.from("pengaturan_toko").select("*").limit(1).maybeSingle(),
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
  const supabase = buatClientServer();

  const [pengaturan, { data: rawProduk, error }, { data: dbToko }] = await Promise.all([
    ambilPengaturanPublik(),
    supabase.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)").eq("id", id).single(),
    supabase.from("pengaturan_toko").select("*").limit(1).maybeSingle(),
  ]);

  const nonaktifIds = pengaturan?.nonaktifIds || [];
  const produk = normalisasiProduk(rawProduk);

  // US-32: Sembunyikan produk nonaktif (404)
  if (error || !produk || nonaktifIds.includes(Number(id)) || produk.aktif === false) {
    notFound();
  }

  const tokoAktif = dbToko ? {
    nama: dbToko.nama || toko.nama,
    nomorWhatsApp: dbToko.nomor_whatsapp || toko.nomorWhatsApp,
    alamat: dbToko.alamat || toko.alamat,
    jamBuka: dbToko.jam_buka || toko.jamBuka,
  } : (pengaturan?.tokoInfo || toko);

  // US-38 & US-39: Ambil ulasan disetujui
  let ulasanList = [];
  try {
    const { data: dbUlasan } = await supabase
      .from("ulasan")
      .select("*")
      .eq("produk_id", Number(id) || id)
      .eq("disetujui", true)
      .order("created_at", { ascending: false });
    if (dbUlasan) ulasanList = dbUlasan;
  } catch {}

  const rataRataRating =
    ulasanList.length > 0
      ? (ulasanList.reduce((sum, u) => sum + (Number(u.rating) || 5), 0) / ulasanList.length).toFixed(1)
      : null;

  // US-12 & US-48: Varian produk
  let varianList = [];
  try {
    const { data: dbVarian } = await supabase
      .from("varian")
      .select("*")
      .eq("produk_id", id)
      .order("id", { ascending: true });
    if (dbVarian) varianList = dbVarian;
  } catch {}

  // US-17: Produk terkait di kategori yang sama
  let relasiQuery = supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)")
    .neq("id", id);
  if (produk.kategori_id) relasiQuery = relasiQuery.eq("kategori_id", produk.kategori_id);
  else if (produk.kategori) relasiQuery = relasiQuery.eq("kategori", produk.kategori);
  if (nonaktifIds.length > 0) relasiQuery = relasiQuery.not("id", "in", `(${nonaktifIds.join(",")})`);
  const { data: terkaitRaw } = await relasiQuery.limit(3);
  const produkTerkait = normalisasiDaftarProduk(terkaitRaw || []);

  const isHabis = produk.stok === 0 || produk.status_stok === "habis";
  const adaDiskon = produk.harga_coret && Number(produk.harga_coret) > Number(produk.harga);
  const diskonPersen = adaDiskon
    ? Math.round((1 - Number(produk.harga) / Number(produk.harga_coret)) * 100)
    : 0;

  // US-18: Galeri multi-foto
  const semuaFoto = [produk.foto_url, produk.image]
    .filter(Boolean)
    .flatMap((f) => (typeof f === "string" ? f.split(",").map((s) => s.trim()) : [f]))
    .filter(Boolean);
  const daftarFotoUnik = [...new Set(semuaFoto)];

  const slugKategori =
    produk.kategori_slug ||
    produk.kategori?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    "menu";

  return (
    <div className="py-8 md:py-12">
      <article className="grid gap-8 md:grid-cols-2">
        {/* US-18: Galeri Foto */}
        <section aria-label="Galeri Foto Produk">
          <GaleriFoto
            fotoUtama={daftarFotoUnik[0] || "/images/placeholder.svg"}
            fotoList={daftarFotoUnik}
            nama={produk.nama}
          />
        </section>

        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            ← Kembali ke katalog
          </Link>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* US-49: Link Kategori */}
              <Link
                href={`/kategori/${slugKategori}`}
                className="text-sm font-semibold text-teks-lembut hover:text-utama hover:underline"
              >
                {produk.kategori}
              </Link>
              {/* US-19: Status Stok */}
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isHabis ? "bg-red-100 text-red-600" : "bg-utama/10 text-utama"
                }`}
              >
                {isHabis ? "Stok Habis" : `Tersedia (${produk.stok} porsi)`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <TombolBagikan namaProduk={produk.nama} />
              <TombolFavorit produk={produk} ikonOnly />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-teks">{produk.nama}</h1>
            {rataRataRating && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                ⭐ {rataRataRating} / 5 ({ulasanList.length} ulasan)
              </span>
            )}
          </div>

          {/* US-20: Harga, Diskon Coret, Badge Baru/Terlaris */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-md bg-harga-latar px-3 py-1 text-2xl font-bold text-harga">
              {formatRupiah(produk.harga)}
            </p>
            {adaDiskon && (
              <>
                <del className="text-base text-red-500 line-through font-semibold">
                  {formatRupiah(produk.harga_coret)}
                </del>
                <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  Hemat {diskonPersen}%
                </span>
              </>
            )}
            {(produk.terlaris || produk.is_terlaris) && (
              <span className="rounded-md bg-amber-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Terlaris
              </span>
            )}
            {(produk.baru || produk.is_baru) && (
              <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Baru
              </span>
            )}
          </div>

          <p className="leading-relaxed text-teks-lembut text-sm">{produk.deskripsi}</p>

          {/* US-03, US-12, US-40, US-48: Tombol WhatsApp */}
          <div className="pt-2">
            {isHabis ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-700">
                Stok Habis (Pesan via WhatsApp Dinonaktifkan)
              </div>
            ) : (
              <TombolWhatsApp
                produk={produk}
                varianList={varianList}
                nomorWhatsApp={tokoAktif?.nomorWhatsApp || toko.nomorWhatsApp}
                namaToko={tokoAktif?.nama || toko.nama}
              />
            )}
          </div>
        </div>
      </article>

      {/* US-50: Kotak Tanya AI */}
      <KotakTanyaProdukAI produk={produk} />

      {/* US-38: Ulasan & Rating */}
      <BagianUlasan produkId={id} ulasanAwal={ulasanList} />

      {/* US-17: Produk Terkait */}
      {produkTerkait.length > 0 && (
        <section aria-labelledby="judul-terkait" className="mt-14 border-t border-garis pt-8">
          <h2 id="judul-terkait" className="text-xl font-bold text-teks">
            Produk terkait di kategori {produk.kategori}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}

      {/* US-36: Terakhir Dilihat */}
      <TerakhirDilihat produkSaatIni={produk} />
    </div>
  );
}
