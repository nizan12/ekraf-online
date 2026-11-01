import NavAdmin from "@/components/NavAdmin";
import { buatClientServer } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { kosongkanLogAktivitas } from "@/app/admin/actions";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log Aktivitas Admin - Admin" };

export default async function HalamanLogAktivitas() {
  const supabase = buatClientServer();
  let logs = [];

  try {
    const { data } = await supabase
      .from("log_aktivitas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      logs = data.map((l) => ({
        id: String(l.id),
        timestamp: l.created_at,
        user: l.admin_email || "Admin",
        aksi: l.aksi,
        rincian: l.rincian || "",
      }));
    }
  } catch {}

  if (logs.length === 0) {
    const config = await ambilPengaturanAdmin();
    if (Array.isArray(config.auditLog)) logs = config.auditLog.slice(0, 50);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Log Aktivitas Admin</h1>
          <p className="mt-1 text-xs text-teks-lembut">
            Rekam jejak 50 aktivitas terbaru admin.
          </p>
        </div>
        {logs.length > 0 && (
          <form action={kosongkanLogAktivitas}>
            <TombolHapusKonfirmasi
              pesan="Bersihkan seluruh riwayat log aktivitas?"
              label="Bersihkan Log"
              varian="garis"
              className="py-2 px-3.5 text-xs text-red-600"
            />
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-garis bg-latar overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-10 text-center text-sm text-teks-lembut">Belum ada aktivitas tercatat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-permukaan text-xs font-semibold text-teks-lembut border-b border-garis">
                <tr>
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-5 py-3">Admin</th>
                  <th className="px-5 py-3">Jenis Aksi</th>
                  <th className="px-5 py-3">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-3 text-xs text-teks-lembut whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold text-teks">{log.user}</td>
                    <td className="px-5 py-3 text-xs font-bold text-utama">{log.aksi}</td>
                    <td className="px-5 py-3 text-xs text-teks-lembut">{log.rincian || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
