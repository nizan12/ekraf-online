import Link from "next/link";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";
import { hapusProduk, toggleStatusProduk, geserUrutanProduk } from "@/app/admin/actions";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";

export default function TabelProduk({ produkList = [], produk = [], nonaktifIds = [] }) {
  const list = produkList.length > 0 ? produkList : produk;
  if (!list || list.length === 0) return <div className="rounded-2xl border border-garis bg-permukaan p-8 text-center text-xs text-teks-lembut">Belum ada produk.</div>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis bg-permukaan">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-garis bg-latar text-teks-lembut">
          <tr>
            <th className="px-3 py-2 font-semibold">Urutan</th>
            <th className="px-3 py-2 font-semibold">Foto &amp; Nama</th>
            <th className="px-3 py-2 font-semibold">Kategori</th>
            <th className="px-3 py-2 font-semibold">Harga</th>
            <th className="px-3 py-2 font-semibold">Stok</th>
            <th className="px-3 py-2 font-semibold">Status</th>
            <th className="px-3 py-2 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {list.map((p, idx) => {
            const isNonaktif = p.aktif === false || nonaktifIds.includes(String(p.id)) || nonaktifIds.includes(Number(p.id));
            const isHabis = p.stok === 0 || p.status_stok === "habis";
            return (
              <tr key={p.id} className="hover:bg-latar/50 transition">
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1">
                    <span className="w-4 text-center font-bold text-teks-lembut">{p.urutan ?? idx + 1}</span>
                    <form action={geserUrutanProduk} className="inline"><input type="hidden" name="id" value={p.id} /><input type="hidden" name="arah" value="naik" /><button type="submit" disabled={idx === 0} className="px-1 py-0.5 rounded border border-garis text-[10px] font-semibold hover:border-utama disabled:opacity-30 cursor-pointer">▲ Naik</button></form>
                    <form action={geserUrutanProduk} className="inline"><input type="hidden" name="id" value={p.id} /><input type="hidden" name="arah" value="turun" /><button type="submit" disabled={idx === list.length - 1} className="px-1 py-0.5 rounded border border-garis text-[10px] font-semibold hover:border-utama disabled:opacity-30 cursor-pointer">▼ Turun</button></form>
                  </div>
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <img src={ambilFotoUtama(p)} alt={p.nama} className="h-8 w-8 rounded-lg object-cover bg-latar shrink-0" />
                    <div><span className="font-bold text-teks line-clamp-1">{p.nama}</span>{p.terlaris && <span className="text-[9px] text-amber-600 font-semibold mr-1">Terlaris</span>}{p.baru && <span className="text-[9px] text-emerald-600 font-semibold">Baru</span>}</div>
                  </div>
                </td>
                <td className="px-3 py-1.5 text-teks-lembut">{p.kategori || "—"}</td>
                <td className="px-3 py-1.5 font-bold text-harga">{formatRupiah(p.harga)}</td>
                <td className="px-3 py-1.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isHabis ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>{isHabis ? "Habis" : p.stok}</span></td>
                <td className="px-3 py-1.5">
                  <form action={toggleStatusProduk} className="inline"><input type="hidden" name="id" value={p.id} /><input type="hidden" name="aktif" value={String(isNonaktif)} /><button type="submit" className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${isNonaktif ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{isNonaktif ? "Nonaktif" : "Aktif"}</button></form>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/produk/${p.id}/ubah`} className="px-2 py-0.5 rounded-lg border border-garis font-semibold text-teks hover:border-utama text-[11px]">Ubah</Link>
                    <form action={hapusProduk} className="inline"><input type="hidden" name="id" value={p.id} /><TombolHapusKonfirmasi pesan={`Hapus "${p.nama}"?`} label="Hapus" className="px-2 py-0.5 text-[11px]" /></form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
