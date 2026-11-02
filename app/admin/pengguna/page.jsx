import NavAdmin from "@/components/NavAdmin";
import FormTambahAdmin from "./FormTambahAdmin";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { hapusAdmin } from "@/app/admin/actions";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";

export const metadata = { title: "Kelola Akun Admin - Admin" };

export default async function HalamanKelolaPengguna() {
  const sbSesi = await buatClientSesi();
  const { data: { user: currentUser } } = await sbSesi.auth.getUser();

  let daftarUser = [];
  try {
    const sb = buatClientServer();
    const { data } = await sb.auth.admin.listUsers();
    if (data?.users) daftarUser = data.users;
  } catch {}

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold text-teks">Kelola Akun Admin</h1>
        <p className="mt-1 text-xs text-teks-lembut">Tambah dan kelola akun admin yang memiliki akses ke dashboard.</p>
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan p-5">
        <h2 className="text-sm font-bold text-teks mb-3">Tambah Admin Baru</h2>
        <FormTambahAdmin />
      </div>

      <div className="rounded-2xl border border-garis bg-latar overflow-hidden">
        <div className="border-b border-garis bg-permukaan px-5 py-3">
          <h2 className="text-sm font-bold text-teks">Daftar Admin Aktif ({daftarUser.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-permukaan text-teks-lembut border-b border-garis">
              <tr><th className="px-5 py-2.5">Email</th><th className="px-5 py-2.5">Tanggal Dibuat</th><th className="px-5 py-2.5 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {daftarUser.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td className="px-5 py-2.5 font-semibold text-teks">{u.email} {isSelf && <span className="ml-1 text-[11px] text-utama">(Akun Anda)</span>}</td>
                    <td className="px-5 py-2.5 text-teks-lembut">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                    <td className="px-5 py-2.5 text-right">
                      {!isSelf && (
                        <form action={hapusAdmin} className="inline">
                          <input type="hidden" name="id" value={u.id} />
                          <TombolHapusKonfirmasi pesan={`Hapus admin ${u.email}?`} label="Hapus" className="px-2 py-0.5 text-xs" />
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
    </div>
  );
}
