import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { tambahKategoriAdmin, ubahKategoriAdmin, hapusKategoriAdmin } from "@/app/admin/actions";

export const metadata = { title: "Kelola Kategori - Admin" };
export const dynamic = "force-dynamic";

export default async function HalamanKelolaKategori() {
  const supabase = buatClientServer();
  let listKategori = [];

  try {
    const { data: dbKategori } = await supabase
      .from("kategori")
      .select("*")
      .order("id", { ascending: true });
    if (dbKategori && dbKategori.length > 0) listKategori = dbKategori;
  } catch {}

  if (listKategori.length === 0) {
    const pengaturan = await ambilPengaturanAdmin();
    listKategori = (pengaturan.kategoriList || []).map((nama, idx) => ({ id: idx + 1, nama }));
  }

  let produk = [];
  try {
    const { data: dbProduk } = await supabase
      .from("produk")
      .select("id, kategori_id, kategori_rel:kategori_id(id, nama)");
    if (dbProduk) produk = dbProduk;
  } catch {}

  const hitungById = {};
  const hitungByNama = {};
  (produk || []).forEach((p) => {
    if (p.kategori_id) hitungById[p.kategori_id] = (hitungById[p.kategori_id] || 0) + 1;
    const relNama = p.kategori_rel?.nama;
    if (relNama) hitungByNama[relNama] = (hitungByNama[relNama] || 0) + 1;
  });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Kelola Kategori</h1>
          <p className="mt-1 text-sm text-teks-lembut">Tambah, ubah, dan kelola kategori produk.</p>
        </div>
        <Tombol href="/admin" varian="garis">← Kembali</Tombol>
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan p-5">
        <h2 className="text-base font-bold text-teks">Tambah Kategori Baru</h2>
        <form action={tambahKategoriAdmin} className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            name="nama"
            required
            placeholder="Contoh: Kopi Dingin, Pastry…"
            className="flex-1 min-w-[200px] rounded-lg border border-garis bg-latar px-3.5 py-2 text-sm text-teks"
          />
          <Tombol type="submit" varian="utama">+ Tambah Kategori</Tombol>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
        <table className="w-full text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-5 py-3 font-semibold">Nama Kategori</th>
              <th className="px-5 py-3 font-semibold">Jumlah Produk</th>
              <th className="px-5 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {listKategori.map((kat) => {
              const totalItem = (kat.id ? hitungById[kat.id] : undefined) ?? hitungByNama[kat.nama] ?? 0;
              return (
                <tr key={kat.id || kat.nama} className="border-t border-garis">
                  <td className="px-5 py-3">
                    <form action={ubahKategoriAdmin} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={kat.id || ""} />
                      <input type="hidden" name="namaLama" value={kat.nama} />
                      <input type="hidden" name="nama_lama" value={kat.nama} />
                      <input
                        type="text"
                        name="namaBaru"
                        defaultValue={kat.nama}
                        required
                        className="rounded border border-garis bg-latar px-2.5 py-1 text-sm font-semibold text-teks"
                      />
                      <button type="submit" className="rounded bg-permukaan px-2.5 py-1 text-xs font-medium text-teks hover:bg-garis cursor-pointer">
                        Simpan
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-utama/10 px-2.5 py-0.5 text-xs font-semibold text-utama">
                      {totalItem} produk
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {totalItem > 0 ? (
                      <span className="text-xs text-teks-lembut">Sedang digunakan</span>
                    ) : (
                      <form action={hapusKategoriAdmin} className="inline">
                        <input type="hidden" name="nama" value={kat.nama} />
                        <input type="hidden" name="id" value={kat.id || ""} />
                        <button type="submit" className="text-xs text-red-600 hover:underline cursor-pointer">
                          Hapus
                        </button>
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
