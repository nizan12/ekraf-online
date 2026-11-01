import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  const supabase = buatClientServer();
  let query = supabase.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)");

  if (urutan === "termurah") {
    query = query.order("harga", { ascending: true });
  } else if (urutan === "termahal") {
    query = query.order("harga", { ascending: false });
  } else if (urutan === "terbaru") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("urutan", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
  }

  const [produkRes, pengaturan] = await Promise.all([query, ambilPengaturanPublik()]);
  if (produkRes.error || !produkRes.data) notFound();

  const nonaktifIds = (pengaturan?.nonaktifIds || []).map(Number);
  const semuaProduk = normalisasiDaftarProduk(produkRes.data).filter(
    (p) => !nonaktifIds.includes(p.id) && p.aktif !== false
  );

  const produkKategori = semuaProduk.filter((p) => {
    const slugP = p.kategori_slug || slugify(p.kategori || "");
    const slugDecoded = slugify(decodedSlug);
    return slugP === slugDecoded || (p.kategori && p.kategori.toLowerCase() === decodedSlug.toLowerCase());
  });

  if (produkKategori.length === 0) notFound();
  const namaKategori = produkKategori[0]?.kategori || decodedSlug;

  return (
    <div className="py-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis pb-4">
        <div>
          <Link href="/" className="text-xs text-teks-lembut hover:text-utama">← Kembali ke katalog</Link>
          <h1 className="text-2xl font-extrabold text-teks mt-1">Kategori: {namaKategori}</h1>
          <p className="text-xs text-teks-lembut mt-0.5">Menampilkan {produkKategori.length} menu pilihan</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-teks-lembut">Urutkan:</span>
          <Link href={`/kategori/${slug}?urutan=termurah`} className={`rounded-lg px-2.5 py-1 border border-garis ${urutan === "termurah" ? "bg-utama text-white" : "bg-permukaan"}`}>Termurah</Link>
          <Link href={`/kategori/${slug}?urutan=termahal`} className={`rounded-lg px-2.5 py-1 border border-garis ${urutan === "termahal" ? "bg-utama text-white" : "bg-permukaan"}`}>Termahal</Link>
          <Link href={`/kategori/${slug}?urutan=terbaru`} className={`rounded-lg px-2.5 py-1 border border-garis ${urutan === "terbaru" ? "bg-utama text-white" : "bg-permukaan"}`}>Terbaru</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {produkKategori.map((p) => (
          <KartuProduk key={p.id} produk={p} />
        ))}
      </div>
    </div>
  );
}
