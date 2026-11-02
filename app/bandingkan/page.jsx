import Link from "next/link";
import { buatClientServer, normalisasiProduk } from "@/lib/supabase";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import TombolWhatsApp from "./TombolWhatsApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandingkan Menu Produk",
  description: "Bandingkan 2 pilihan menu kopi atau camilan sebelum memesan.",
};

const tdLbl = "px-3 py-2 font-semibold text-teks-lembut";
const selCls = "w-full rounded-lg border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks";

export default async function HalamanBandingkan({ searchParams }) {
  const sp = (await searchParams) || {};
  let rawIds = [];
  if (sp.ids) rawIds = sp.ids.split(",").map((s) => s.trim()).filter(Boolean);
  else {
    if (sp.id1) rawIds.push(String(sp.id1).trim());
    if (sp.id2) rawIds.push(String(sp.id2).trim());
  }

  const melebihiBatas = rawIds.length > 2;
  const targetIds = rawIds.slice(0, 2);

  const sb = buatClientServer();
  const { data: allProdukRaw } = await sb.from("produk").select("id, nama, harga").eq("aktif", true).order("nama");
  const allProduk = allProdukRaw || [];

  let produkBanding = [];
  if (targetIds.length > 0) {
    const { data: produkRaw } = await sb.from("produk").select("*, kategori_rel:kategori_id(id, nama)").in("id", targetIds).eq("aktif", true);
    produkBanding = (produkRaw || []).map(normalisasiProduk);
  }

  return (
    <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className="text-xs text-teks-lembut underline hover:text-utama">← Kembali ke Katalog</Link>
        <h1 className="text-2xl font-extrabold text-teks">Bandingkan Produk</h1>
        <p className="text-xs text-teks-lembut">Pilih 2 produk untuk melihat perbandingan berdampingan.</p>
      </div>

      {melebihiBatas && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
          Maksimal 2 produk yang dapat dibandingkan sekaligus.
        </div>
      )}

      <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl border border-garis bg-permukaan text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-teks-lembut mb-0.5">Produk 1:</label>
          <select name="id1" defaultValue={targetIds[0] || ""} className={selCls}>
            <option value="">Pilih Produk Pertama…</option>
            {allProduk.map((p) => <option key={p.id} value={p.id}>{p.nama} ({formatRupiah(p.harga)})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-teks-lembut mb-0.5">Produk 2:</label>
          <select name="id2" defaultValue={targetIds[1] || ""} className={selCls}>
            <option value="">Pilih Produk Kedua…</option>
            {allProduk.map((p) => <option key={p.id} value={p.id}>{p.nama} ({formatRupiah(p.harga)})</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" className="rounded-lg bg-utama px-3.5 py-1.5 text-xs font-bold text-white hover:bg-utama-gelap cursor-pointer">Bandingkan Sekarang</button>
        </div>
      </form>

      {produkBanding.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-garis bg-permukaan">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-garis bg-latar">
              <tr>
                <th className="px-3 py-2.5 font-semibold text-teks-lembut w-1/4">Spesifikasi</th>
                {produkBanding.map((p) => (
                  <th key={p.id} className="px-3 py-2.5 font-bold text-teks w-3/8">
                    <div className="flex flex-col gap-1.5 items-center text-center">
                      <img src={ambilFotoUtama(p)} alt={p.nama} className="h-20 w-20 rounded-xl object-cover bg-permukaan" />
                      <span className="font-bold text-xs">{p.nama}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              <tr>
                <td className={tdLbl}>Harga</td>
                {produkBanding.map((p) => <td key={p.id} className="px-3 py-2 font-bold text-utama text-xs">{formatRupiah(p.harga)}</td>)}
              </tr>
              <tr>
                <td className={tdLbl}>Kategori</td>
                {produkBanding.map((p) => <td key={p.id} className="px-3 py-2 text-teks">{p.kategori || "—"}</td>)}
              </tr>
              <tr>
                <td className={tdLbl}>Deskripsi</td>
                {produkBanding.map((p) => <td key={p.id} className="px-3 py-2 text-teks-lembut leading-relaxed">{p.deskripsi || "—"}</td>)}
              </tr>
              <tr>
                <td className={tdLbl}>Pesan</td>
                {produkBanding.map((p) => <td key={p.id} className="px-3 py-2"><TombolWhatsApp produk={p} /></td>)}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-garis bg-permukaan p-6 text-center text-xs text-teks-lembut">Pilih 2 produk di atas untuk melihat perbandingan.</div>
      )}
    </div>
  );
}
