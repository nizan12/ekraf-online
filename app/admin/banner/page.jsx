import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { tambahBannerAdmin, ubahBannerAdmin, toggleStatusBannerAdmin, hapusBannerAdmin } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

// US-42: Pengelolaan Banner Promo Beranda di Admin
export default async function HalamanKelolaBanner() {
  const sb = buatClientServer();
  let banners = [];
  try {
    const { data } = await sb.from("banner").select("*").order("id", { ascending: true });
    if (data?.length > 0) {
      banners = data.map((b) => ({
        id: b.id,
        judul: b.judul || "Promo",
        subjudul: b.subjudul || b.deskripsi || "",
        deskripsi: b.deskripsi || b.subjudul || "",
        badge: b.badge || b.tag || "PROMO SPESIAL",
        tag: b.badge || b.tag || "PROMO SPESIAL",
        tombol_teks: b.tombol_teks || b.cta || "Lihat Promo",
        link_url: b.link_url || b.tautan || "/#katalog-utama",
        tautan: b.link_url || b.tautan || "/#katalog-utama",
        foto_url: b.foto_url || b.gambar_url || "",
        gambar_url: b.foto_url || b.gambar_url || "",
        aktif: b.aktif !== false,
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

      {/* Form Tambah Banner Promo */}
      <div className="rounded-2xl border border-garis bg-permukaan p-5">
        <h2 className="text-base font-bold text-teks mb-3">Tambah Banner Promo</h2>
        <form action={tambahBannerAdmin} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-teks mb-1">Judul Promo:</label>
            <input type="text" name="judul" required placeholder="Contoh: Diskon 20% Aneka Kopi" className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-teks mb-1">Badge / Tag Promo:</label>
            <input type="text" name="badge" defaultValue="PROMO SPESIAL" placeholder="PROMO SPESIAL" className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-teks mb-1">Teks / Deskripsi Promo:</label>
            <input type="text" name="subjudul" placeholder="Teks penjelas promo yang tampil di banner" className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-teks mb-1">Gambar / Foto URL:</label>
            <input type="url" name="foto_url" placeholder="https://..." className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-teks mb-1">Tautan / Link URL:</label>
            <input type="text" name="link_url" defaultValue="/#katalog-utama" placeholder="/#katalog-utama atau wa.me/..." className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks" />
          </div>
          <div className="sm:col-span-2 pt-1">
            <Tombol type="submit" varian="utama">+ Tambah Banner</Tombol>
          </div>
        </form>
      </div>

      {/* Daftar & Form Ubah Banner Promo */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-teks">Daftar Banner Aktif & Pengaturan</h2>
        {banners.map((b) => (
          <div key={b.id} className="rounded-2xl border border-garis bg-latar p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="rounded-full bg-utama/10 text-utama px-2.5 py-0.5 text-xs font-bold mr-2">{b.badge || b.tag}</span>
                <span className="font-bold text-sm text-teks">{b.judul}</span>
                {b.subjudul && <p className="text-xs text-teks-lembut mt-0.5">{b.subjudul}</p>}
                {b.link_url && <p className="text-[11px] text-teks-lembut/70 mt-0.5">Tautan: {b.link_url}</p>}
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleStatusBannerAdmin}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="aktif" value={String(b.aktif)} />
                  <button type="submit" className={`rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer ${b.aktif ? "border-garis text-teks" : "border-stone-300 bg-stone-100 text-stone-500"}`}>
                    {b.aktif ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </form>
                <form action={hapusBannerAdmin}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 cursor-pointer">
                    Hapus
                  </button>
                </form>
              </div>
            </div>

            {/* US-42: Form Ubah Banner Promo (judul, teks/deskripsi, gambar, tautan) */}
            <details className="w-full border-t border-garis pt-2">
              <summary className="cursor-pointer text-xs font-semibold text-utama hover:underline">
                ✏️ Ubah Judul, Teks, Gambar, dan Tautan Banner
              </summary>
              <form action={ubahBannerAdmin} className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-permukaan p-4 rounded-xl border border-garis">
                <input type="hidden" name="id" value={b.id} />
                <div>
                  <label className="block text-[11px] font-semibold text-teks mb-1">Judul Banner:</label>
                  <input type="text" name="judul" defaultValue={b.judul} required className="w-full rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs text-teks" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-teks mb-1">Badge / Tag Promo:</label>
                  <input type="text" name="badge" defaultValue={b.badge || b.tag} className="w-full rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs text-teks" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-teks mb-1">Teks / Deskripsi:</label>
                  <input type="text" name="subjudul" defaultValue={b.subjudul || b.deskripsi || ""} placeholder="Teks promo" className="w-full rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs text-teks" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-teks mb-1">Gambar / Foto URL:</label>
                  <input type="url" name="foto_url" defaultValue={b.foto_url || b.gambar_url || ""} placeholder="https://..." className="w-full rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs text-teks" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-teks mb-1">Tautan / Link URL:</label>
                  <input type="text" name="link_url" defaultValue={b.link_url || b.tautan || "/#katalog-utama"} className="w-full rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs text-teks" />
                </div>
                <div className="sm:col-span-2 flex justify-end pt-1">
                  <button type="submit" className="rounded-lg bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap cursor-pointer">
                    Simpan Perubahan Banner
                  </button>
                </div>
              </form>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
