import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { tambahBannerAdmin, ubahBannerAdmin, toggleStatusBannerAdmin, hapusBannerAdmin } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const inp = "w-full rounded border border-garis bg-latar px-2 py-1 text-xs text-teks";
const lbl = "block text-[10px] font-semibold text-teks mb-0.5";

export default async function HalamanKelolaBanner() {
  const sb = buatClientServer();
  let banners = [];
  try {
    const { data } = await sb.from("banner").select("*").order("id", { ascending: true });
    if (data?.length > 0) banners = data;
  } catch {}
  if (banners.length === 0) { const p = await ambilPengaturanAdmin(); banners = p.banners || []; }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-teks">Banner Promo Beranda</h1>
        <Tombol href="/admin" varian="garis">← Kembali</Tombol>
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan p-4">
        <h2 className="text-sm font-bold text-teks mb-2">Tambah Banner Promo</h2>
        <form action={tambahBannerAdmin} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div><label className={lbl}>Judul Promo:</label><input type="text" name="judul" required placeholder="Diskon 20%" className={inp} /></div>
          <div><label className={lbl}>Badge:</label><input type="text" name="badge" defaultValue="PROMO SPESIAL" className={inp} /></div>
          <div className="sm:col-span-2"><label className={lbl}>Teks:</label><input type="text" name="subjudul" placeholder="Teks promo" className={inp} /></div>
          <div><label className={lbl}>Foto URL:</label><input type="url" name="foto_url" placeholder="https://..." className={inp} /></div>
          <div><label className={lbl}>Tautan:</label><input type="text" name="link_url" defaultValue="/#katalog-utama" className={inp} /></div>
          <div className="sm:col-span-2 pt-1"><Tombol type="submit" varian="utama">+ Tambah Banner</Tombol></div>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-teks">Daftar Banner Promo</h2>
        {banners.map((b) => (
          <div key={b.id} className="rounded-2xl border border-garis bg-latar p-3 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="rounded-full bg-utama/10 text-utama px-2 py-0.5 text-[11px] font-bold mr-1.5">{b.badge || b.tag || "PROMO"}</span>
                <span className="font-bold text-xs text-teks">{b.judul}</span>
                {(b.subjudul || b.deskripsi) && <p className="text-[11px] text-teks-lembut mt-0.5">{b.subjudul || b.deskripsi}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <form action={toggleStatusBannerAdmin}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="aktif" value={String(b.aktif !== false)} />
                  <button type="submit" className={`rounded border px-2 py-0.5 text-[11px] font-semibold cursor-pointer ${b.aktif !== false ? "border-garis text-teks" : "border-stone-300 bg-stone-100 text-stone-500"}`}>{b.aktif !== false ? "Nonaktifkan" : "Aktifkan"}</button>
                </form>
                <form action={hapusBannerAdmin}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="rounded border border-red-200 px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-50 cursor-pointer">Hapus</button>
                </form>
              </div>
            </div>

            <details className="w-full border-t border-garis pt-1.5">
              <summary className="cursor-pointer text-[11px] font-semibold text-utama hover:underline">✏️ Ubah Judul, Teks, Gambar, dan Tautan Banner</summary>
              <form action={ubahBannerAdmin} className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-permukaan p-2.5 rounded-xl border border-garis text-xs">
                <input type="hidden" name="id" value={b.id} />
                <div><label className={lbl}>Judul:</label><input type="text" name="judul" defaultValue={b.judul} required className={inp} /></div>
                <div><label className={lbl}>Badge:</label><input type="text" name="badge" defaultValue={b.badge || b.tag || "PROMO"} className={inp} /></div>
                <div className="sm:col-span-2"><label className={lbl}>Teks / Deskripsi:</label><input type="text" name="subjudul" defaultValue={b.subjudul || b.deskripsi || ""} className={inp} /></div>
                <div><label className={lbl}>Gambar URL:</label><input type="url" name="foto_url" defaultValue={b.foto_url || b.gambar_url || ""} className={inp} /></div>
                <div><label className={lbl}>Tautan URL:</label><input type="text" name="link_url" defaultValue={b.link_url || b.tautan || "/#katalog-utama"} className={inp} /></div>
                <div className="sm:col-span-2 flex justify-end"><button type="submit" className="rounded bg-utama px-3 py-1 text-xs font-bold text-white hover:bg-utama-gelap cursor-pointer">Simpan Perubahan Banner</button></div>
              </form>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
