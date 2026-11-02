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

const tdLbl = "px-3 py-2 font-semibold text-teks-lembut";
const selCls = "w-full rounded-lg border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks";

export default async function HalamanBandingkan({ searchParams }) {
  const sp = (await searchParams) || {};
  let rawIds = [];

  if (sp.ids) {
    rawIds = String(sp.ids).split(",").map((s) => s.trim()).filter(Boolean);
  } else if (sp.id) {
    rawIds = String(sp.id).split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    const id1 = sp.id1 || sp.produk1;
    const id2 = sp.id2 || sp.produk2;
    if (id1) rawIds.push(String(id1).trim());
    if (id2) rawIds.push(String(id2).trim());
  }

  const melebihiBatas = rawIds.length > 2;
  const targetIds = rawIds.slice(0, 2);

  const sb = buatClientServer();
  const { data: allProdukRaw } = await sb.from("produk").select("id, nama, harga").eq("aktif", true).order("nama");
  const allProduk = allProdukRaw || [];

  let produkBanding = [];
  let idTidakDitemukan = [];

  if (targetIds.length > 0) {
    const { data: produkRaw } = await sb.from("produk").select("*, kategori_rel:kategori_id(id, nama)").in("id", targetIds).eq("aktif", true);
    produkBanding = (produkRaw || []).map(normalisasiProduk);

    // Penanganan ID tidak ada: periksa kecocokan ID yang diminta vs yang ditemukan di database
    const idDitemukan = new Set(produkBanding.map((p) => String(p.id)));
    idTidakDitemukan = targetIds.filter((id) => !idDitemukan.has(String(id)));
  }

  const adaIdTidakDitemukan = idTidakDitemukan.length > 0;
  const semuaIdTidakDitemukan = targetIds.length > 0 && produkBanding.length === 0;

  // Penanganan tidak ditemukan jika diminta mode strict / notFound
  if ((sp.notFound === "1" || sp.notFound === "true" || sp.status === "404") && semuaIdTidakDitemukan) {
    notFound();
  }

  return (
    <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/" className="text-xs text-teks-lembut underline hover:text-utama">← Kembali ke Katalog</Link>
        <h1 className="text-2xl font-extrabold text-teks">Bandingkan Produk</h1>
        <p className="text-xs text-teks-lembut">Pilih 2 produk untuk melihat perbandingan spesifikasi dan harga berdampingan.</p>
      </div>

      {melebihiBatas && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
          Maksimal 2 produk yang dapat dibandingkan sekaligus.
        </div>
      )}

      {/* Penanganan dan pesan jelas jika ada ID produk yang tidak ditemukan */}
      {adaIdTidakDitemukan && produkBanding.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 font-medium" role="alert">
          <span className="font-bold">Produk Tidak Ditemukan:</span> Produk dengan ID (
          <span className="font-mono font-semibold">{idTidakDitemukan.join(", ")}</span>
          ) tidak ditemukan di database atau sudah tidak aktif. Menampilkan perbandingan produk yang tersedia.
        </div>
      )}

      {semuaIdTidakDitemukan && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-6 text-center text-xs text-rose-800" role="alert">
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-sm">
            !
          </div>
          <p className="font-bold text-sm text-rose-900 mb-1">Produk Tidak Ditemukan</p>
          <p className="text-rose-700">
            Produk dengan ID (<span className="font-mono font-semibold">{idTidakDitemukan.join(", ")}</span>) tidak ditemukan dalam database katalog atau sudah tidak aktif.
          </p>
          <p className="mt-2 text-teks-lembut">Silakan pilih produk yang tersedia dari daftar pilihan di bawah.</p>
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
        <div className="sm:col-span-2 flex justify-between items-center pt-1">
          {targetIds.length > 0 ? (
            <Link href="/bandingkan" className="text-[11px] text-teks-lembut hover:text-utama underline">Reset Pilihan</Link>
          ) : <span />}
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
                      <Link href={`/produk/${p.id}`} className="font-bold text-xs hover:text-utama">{p.nama}</Link>
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
        !semuaIdTidakDitemukan && (
          <div className="rounded-2xl border border-garis bg-permukaan p-6 text-center text-xs text-teks-lembut">
            Pilih 2 produk di atas untuk melihat perbandingan.
          </div>
        )
      )}
    </div>
  );
}
