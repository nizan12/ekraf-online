import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase";
import { moderasiUlasanAction, hapusUlasanAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanModerasiUlasan() {
  const sb = buatClientServer();
  let semuaUlasan = [];
  try {
    const { data } = await sb.from("ulasan").select("*, produk:produk_id(id, nama)").order("created_at", { ascending: false });
    if (data?.length > 0) {
      semuaUlasan = data.map((u) => ({
        id: String(u.id), produkId: String(u.produk_id), namaProduk: u.produk?.nama || `Produk #${u.produk_id}`,
        nama: u.nama, rating: u.rating, komentar: u.komentar, disetujui: u.disetujui !== false,
      }));
    }
  } catch {}

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-teks">Moderasi Ulasan Pembeli</h1>
        <Tombol href="/admin" varian="garis">← Kembali</Tombol>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
        <table className="w-full text-left text-xs">
          <thead className="bg-permukaan text-teks-lembut border-b border-garis">
            <tr><th className="px-3 py-2.5">Produk</th><th className="px-3 py-2.5">Pembeli</th><th className="px-3 py-2.5">Rating</th><th className="px-3 py-2.5">Komentar</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5 text-right">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-garis">
            {semuaUlasan.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-teks-lembut">Belum ada ulasan.</td></tr>
            ) : (
              semuaUlasan.map((u) => (
                <tr key={`${u.produkId}-${u.id}`}>
                  <td className="px-3 py-2 font-semibold text-teks">{u.namaProduk}</td>
                  <td className="px-3 py-2 text-teks">{u.nama}</td>
                  <td className="px-3 py-2 text-amber-500 font-bold">{"★".repeat(u.rating)}</td>
                  <td className="px-3 py-2 text-teks-lembut">{u.komentar}</td>
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${u.disetujui ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>{u.disetujui ? "Tampil" : "Disembunyikan"}</span></td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <form action={moderasiUlasanAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="ulasanId" value={u.id} />
                        <input type="hidden" name="produkId" value={u.produkId} />
                        <input type="hidden" name="status" value={u.disetujui ? "sembunyi" : "disetujui"} />
                        <input type="hidden" name="aksi" value={u.disetujui ? "sembunyikan" : "tampilkan"} />
                        <button type="submit" className="text-xs text-utama hover:underline cursor-pointer">{u.disetujui ? "Sembunyikan" : "Tampilkan"}</button>
                      </form>
                      <form action={hapusUlasanAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="ulasanId" value={u.id} />
                        <input type="hidden" name="produkId" value={u.produkId} />
                        <input type="hidden" name="aksi" value="hapus" />
                        <button type="submit" className="text-xs text-red-600 hover:underline cursor-pointer">Hapus</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
