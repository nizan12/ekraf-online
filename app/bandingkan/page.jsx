import Link from "next/link";
import { notFound } from "next/navigation";
import { buatClientServer, normalisasiProduk } from "@/lib/supabase";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import TombolWhatsApp from "./TombolWhatsApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandingkan Menu Produk",
  description: "Bandingkan 2 pilihan menu kopi atau camilan sebelum memesan.",
};

export default async function HalamanBandingkan({ searchParams }) {
  const sp = (await searchParams) || {};
  let rawIds = [];

  if (sp.ids) {
    rawIds = sp.ids.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    if (sp.id1) rawIds.push(String(sp.id1).trim());
    if (sp.id2) rawIds.push(String(sp.id2).trim());
  }

  // US-37: Pesan bila >2 dan slice 2
  const melebihiBatas = rawIds.length > 2;
  const pesanBatas = melebihiBatas
    ? `Perhatian: Perbandingan dibatasi maksimal 2 produk. Anda memilih ${rawIds.length} produk, menampilkan 2 produk pertama.`
    : null;

  const ids = rawIds.slice(0, 2);
  const supabase = buatClientServer();
  let produkBandingkan = [];

  const { data: semuaData } = await supabase
    .from("produk")
    .select("id, nama, harga, kategori")
    .order("nama", { ascending: true });
  const semuaProduk = semuaData || [];

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)")
      .in("id", ids);

    // US-37: notFound bila produk tidak ada
    if (error || !data || data.length === 0) {
      notFound();
    }
    produkBandingkan = data.map(normalisasiProduk);
  }

  return (
    <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <Link href="/" className="text-xs text-teks-lembut hover:text-utama">← Kembali ke katalog</Link>
        <h1 className="text-2xl font-extrabold text-teks mt-1">Bandingkan 2 Menu</h1>
        <p className="text-xs text-teks-lembut mt-0.5">Pilih 2 produk untuk melihat perbandingan rasa, harga, dan porsi.</p>
      </div>

      {pesanBatas && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          {pesanBatas}
        </div>
      )}

      {/* Pemilih 2 Produk (US-37) */}
      <form method="GET" action="/bandingkan" className="rounded-2xl border border-garis bg-permukaan p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-teks-lembut mb-1">Produk 1</label>
          <select name="id1" defaultValue={ids[0] || ""} className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks">
            <option value="">Pilih menu pertama…</option>
            {semuaProduk.map((p) => (
              <option key={p.id} value={p.id}>{p.nama} ({formatRupiah(p.harga)})</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-teks-lembut mb-1">Produk 2</label>
          <select name="id2" defaultValue={ids[1] || ""} className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks">
            <option value="">Pilih menu kedua…</option>
            {semuaProduk.map((p) => (
              <option key={p.id} value={p.id}>{p.nama} ({formatRupiah(p.harga)})</option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap cursor-pointer">
          Bandingkan
        </button>
      </form>

      {/* Tabel Komparasi Berdampingan (US-37: foto, kategori, harga, deskripsi) */}
      {produkBandingkan.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
          <table className="w-full text-left text-sm">
            <thead className="bg-permukaan border-b border-garis text-xs text-teks-lembut">
              <tr>
                <th className="px-4 py-3 w-1/4">Kriteria</th>
                {produkBandingkan.map((p) => (
                  <th key={p.id} className="px-4 py-3 font-bold text-teks w-3/8">{p.nama}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-garis text-xs">
              <tr>
                <td className="px-4 py-3 font-semibold text-teks-lembut">Foto</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="px-4 py-3">
                    <img src={ambilFotoUtama(p)} alt={p.nama} className="h-24 w-24 rounded-xl object-cover bg-permukaan" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-teks-lembut">Kategori</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-teks font-medium">{p.kategori || "—"}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-teks-lembut">Harga</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="px-4 py-3 font-bold text-utama text-sm">{formatRupiah(p.harga)}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-teks-lembut">Deskripsi</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-teks-lembut leading-relaxed">{p.deskripsi || "—"}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-teks-lembut">Pesan</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="px-4 py-3">
                    <TombolWhatsApp produk={p} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-garis bg-permukaan p-8 text-center text-xs text-teks-lembut">
          Pilih 2 produk pada form di atas untuk memulai perbandingan.
        </div>
      )}
    </div>
  );
}
