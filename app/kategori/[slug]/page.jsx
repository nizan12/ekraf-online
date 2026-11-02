import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

function slugify(text) {
  return String(text || "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const namaKategori = decodeURIComponent(slug).replace(/-/g, " ");
  return {
    title: `Kategori ${namaKategori} - ${toko.nama}`,
    description: `Daftar aneka pilihan menu ${namaKategori} di ${toko.nama}.`,
  };
}

export default async function HalamanKategori({ params, searchParams }) {
  const { slug } = await params;
  const sp = (await searchParams) || {};
  const urutan = sp.urutan || "";
  const decodedSlug = decodeURIComponent(slug);

  const sb = buatClientServer();
  let query = sb.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)");
  if (urutan === "termurah") query = query.order("harga", { ascending: true });
  else if (urutan === "termahal") query = query.order("harga", { ascending: false });
  else if (urutan === "terbaru") query = query.order("created_at", { ascending: false });
  else query = query.order("urutan", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });

  const [produkRes, pengaturan] = await Promise.all([query, ambilPengaturanPublik()]);
  if (produkRes.error || !produkRes.data) notFound();

  const nonaktifIds = (pengaturan?.nonaktifIds || []).map(Number);
  const semuaProduk = normalisasiDaftarProduk(produkRes.data).filter((p) => !nonaktifIds.includes(p.id) && p.aktif !== false);
  const produkKategori = semuaProduk.filter((p) => {
    const slugP = p.kategori_slug || slugify(p.kategori || "");
    const slugDecoded = slugify(decodedSlug);
    return slugP === slugDecoded || (p.kategori && p.kategori.toLowerCase() === decodedSlug.toLowerCase());
  });

  if (produkKategori.length === 0) notFound();

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <Link href="/" className="text-xs text-teks-lembut underline hover:text-utama">← Kembali ke katalog</Link>
        <h1 className="text-3xl font-extrabold capitalize text-teks mt-2">Kategori: {decodedSlug.replace(/-/g, " ")}</h1>
        <p className="text-xs text-teks-lembut mt-1">Ditemukan {produkKategori.length} menu pilihan.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {produkKategori.map((p) => <KartuProduk key={p.id} produk={p} />)}
      </div>
    </div>
  );
}
