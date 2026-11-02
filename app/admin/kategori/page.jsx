import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { tambahKategoriAdmin, ubahKategoriAdmin, hapusKategoriAdmin } from "@/app/admin/actions";

export const metadata = { title: "Kelola Kategori - Admin" };
export const dynamic = "force-dynamic";

export default async function HalamanKelolaKategori() {
  const sb = buatClientServer();
  let listKategori = [];
  try {
    const { data } = await sb.from("kategori").select("*").order("id", { ascending: true });
    if (data?.length > 0) listKategori = data;
  } catch {}
  if (listKategori.length === 0) {
    const p = await ambilPengaturanAdmin();
    listKategori = (p.kategoriList || []).map((nama, idx) => ({ id: idx + 1, nama }));
  }

  let produk = [];
  try {
    const { data } = await sb.from("produk").select("id, kategori_id, kategori_rel:kategori_id(id, nama)");
    if (data) produk = data;
  } catch {}

  const hitungById = {}, hitungByNama = {};
  produk.forEach((p) => {
    if (p.kategori_id) hitungById[p.kategori_id] = (hitungById[p.kategori_id] || 0) + 1;
    if (p.kategori_rel?.nama) hitungByNama[p.kategori_rel.nama] = (hitungByNama[p.kategori_rel.nama] || 0) + 1;
  });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Kelola Kategori</h1>
          <p className="mt-1 text-xs text-teks-lembut">Tambah, ubah, dan kelola kategori produk.</p>
        </div>
        <Tombol href="/admin" varian="garis">← Kembali</Tombol>
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan p-4">
        <h2 className="text-sm font-bold text-teks mb-2">Tambah Kategori Baru</h2>
        <form action={tambahKategoriAdmin} className="flex flex-wrap gap-2">
          <input type="text" name="nama" required placeholder="Contoh: Kopi Dingin, Pastry…" className="flex-1 min-w-[200px] rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs text-teks" />
          <Tombol type="submit" varian="utama">+ Tambah Kategori</Tombol>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
        <table className="w-full text-left text-xs">
          <thead className="bg-permukaan text-teks-lembut border-b border-garis">
            <tr><th className="px-4 py-2.5 font-semibold">Nama Kategori</th><th className="px-4 py-2.5 font-semibold">Jumlah Produk</th><th className="px-4 py-2.5 text-right font-semibold">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-garis">
            {listKategori.map((kat) => {
              const total = (kat.id ? hitungById[kat.id] : undefined) ?? hitungByNama[kat.nama] ?? 0;
              return (
                <tr key={kat.id || kat.nama} className="hover:bg-permukaan/50">
                  <td className="px-4 py-2.5">
                    <form action={ubahKategoriAdmin} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={kat.id || ""} />
                      <input type="hidden" name="namaLama" value={kat.nama} />
                      <input type="hidden" name="nama_lama" value={kat.nama} />
                      <input type="text" name="namaBaru" defaultValue={kat.nama} required className="rounded border border-garis bg-latar px-2 py-1 text-xs font-semibold text-teks" />
                      <button type="submit" className="rounded bg-permukaan border border-garis px-2 py-1 text-[11px] font-medium text-teks hover:border-utama cursor-pointer">Simpan</button>
                    </form>
                  </td>
                  <td className="px-4 py-2.5"><span className="rounded-full bg-utama/10 px-2 py-0.5 text-[11px] font-semibold text-utama">{total} produk</span></td>
                  <td className="px-4 py-2.5 text-right">
                    {total > 0 ? (
                      <span className="text-[11px] text-teks-lembut">Sedang digunakan</span>
                    ) : (
                      <form action={hapusKategoriAdmin} className="inline">
                        <input type="hidden" name="nama" value={kat.nama} />
                        <input type="hidden" name="id" value={kat.id || ""} />
                        <button type="submit" className="text-xs text-red-600 hover:underline cursor-pointer">Hapus</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
