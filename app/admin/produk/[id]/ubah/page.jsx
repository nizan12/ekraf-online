import Link from "next/link";
import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";
import { buatClientServer, normalisasiProduk } from "@/lib/supabase";
import { ubahProduk, hapusProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const supabase = buatClientServer();

  const { data: rawProduk, error } = await supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)")
    .eq("id", id)
    .single();

  const produk = normalisasiProduk(rawProduk);
  if (error || !produk) notFound();

  const { data: varianList } = await supabase
    .from("varian")
    .select("*")
    .eq("produk_id", id)
    .order("id", { ascending: true });

  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("id, nama")
    .order("urutan", { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-6 max-w-5xl mx-auto">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Ubah Produk #{id}</h1>
          <p className="text-xs text-teks-lembut mt-1">
            Perbarui informasi, galeri foto, harga diskon, atau varian produk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/produk/${id}`} className="rounded-xl border border-garis bg-latar px-3 py-2 text-xs font-semibold text-teks hover:border-utama">
            Lihat di Toko
          </Link>
          <form action={hapusProduk}>
            <input type="hidden" name="id" value={id} />
            <TombolHapusKonfirmasi
              pesan={`Yakin ingin menghapus produk "${produk.nama}"?`}
              label="Hapus Produk"
              varian="bahaya"
              className="py-2 px-3 text-xs rounded-xl"
            />
          </form>
          <Link href="/admin" className="rounded-xl border border-garis bg-permukaan px-3 py-2 text-xs font-semibold text-teks">
            ← Kembali
          </Link>
        </div>
      </div>

      <FormProduk
        produk={produk}
        varianAwal={varianList || []}
        kategoriList={kategoriList || []}
        labelTombol="Simpan Perubahan"
        action={ubahProduk}
      />
    </div>
  );
}
