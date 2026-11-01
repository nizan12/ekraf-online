import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { tambahBannerAdmin, ubahBannerAdmin, toggleStatusBannerAdmin, hapusBannerAdmin } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanKelolaBanner() {
  const sb = buatClientServer();
  let banners = [];
  try {
    const { data } = await sb.from("banner").select("*").order("id", { ascending: true });
    if (data?.length > 0) {
      banners = data.map((b) => ({
        id: b.id, judul: b.judul || "Promo", subjudul: b.subjudul || "", tag: b.tag || "Promo",
        tautan: b.tautan || "/#katalog-utama", gambar_url: b.gambar_url || "", aktif: b.aktif !== false,
      }));
    }
  } catch {}

  if (banners.length === 0) {
    const p = await ambilPengaturanAdmin();
    banners = p.banners || [];
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-teks">Banner Promo Beranda</h1>
        <Tombol href="/admin" varian="garis">← Kembali</Tombol>
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan p-5">
        <h2 className="text-base font-bold text-teks mb-3">Tambah Banner Promo</h2>
        <form action={tambahBannerAdmin} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" name="judul" required placeholder="Judul Promo" className="rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          <input type="text" name="tag" defaultValue="Promo Spesial" className="rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          <input type="text" name="subjudul" placeholder="Deskripsi singkat" className="sm:col-span-2 rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          <input type="text" name="tautan" defaultValue="/#katalog-utama" className="rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          <input type="url" name="gambar_url" placeholder="URL Foto Banner" className="rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          <div className="sm:col-span-2">
            <Tombol type="submit" varian="utama">+ Tambah Banner</Tombol>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {banners.map((b) => (
          <div key={b.id} className="rounded-2xl border border-garis bg-latar p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="rounded-full bg-utama/10 text-utama px-2.5 py-0.5 text-xs font-bold mr-2">{b.tag}</span>
              <span className="font-bold text-sm text-teks">{b.judul}</span>
              {b.subjudul && <p className="text-xs text-teks-lembut mt-0.5">{b.subjudul}</p>}
            </div>
            <div className="flex items-center gap-2">
              <form action={toggleStatusBannerAdmin}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="aktif" value={String(b.aktif)} />
                <button type="submit" className="rounded-lg border border-garis px-2.5 py-1 text-xs font-semibold cursor-pointer">
                  {b.aktif ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </form>
              <form action={hapusBannerAdmin}>
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 cursor-pointer">
                  Hapus
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
