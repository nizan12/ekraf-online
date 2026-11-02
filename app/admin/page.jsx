import Link from "next/link";
import Tombol from "@/components/Tombol";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "./TabelProduk";
import FormImporCSV from "@/components/admin/FormImporCSV";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";
const LIMIT = 8;
const boxCls = "rounded-xl border border-garis bg-permukaan p-4";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const cari = (params?.cari || "").trim();
  const halaman = Math.max(1, parseInt(params?.halaman || "1", 10) || 1);

  const sb = buatClientServer();
  const config = await ambilPengaturanAdmin();

  const { data: semuaRaw } = await sb.from("produk").select("id, nama, kategori_id, harga, stok, aktif, kategori_rel:kategori_id(id, nama, slug)");
  const semua = normalisasiDaftarProduk(semuaRaw || []);

  let query = sb.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)", { count: "exact" }).order("urutan", { ascending: true }).order("created_at", { ascending: false });
  if (cari) query = query.ilike("nama", `%${cari}%`);

  const dari = (halaman - 1) * LIMIT;
  const { data: pRaw, count: totalHasil, error } = await query.range(dari, dari + LIMIT - 1);
  const produk = normalisasiDaftarProduk(pRaw || []);
  const totalHalaman = Math.max(1, Math.ceil((totalHasil || 0) / LIMIT));

  const totalProduk = semua.length;
  const nonaktifSet = new Set((config.nonaktifIds || []).map(String));
  const aktifCount = semua.filter((p) => p.aktif !== false && !nonaktifSet.has(String(p.id))).length;

  const perKategori = semua.reduce((acc, p) => { const k = p.kategori || "Lainnya"; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const listKat = Object.entries(perKategori);

  const petaKlik = { ...(config.klikWhatsapp || {}) };
  try {
    const { data: rows } = await sb.from("klik_whatsapp").select("nama_produk");
    if (rows) rows.forEach((r) => { if (r.nama_produk) petaKlik[r.nama_produk] = (petaKlik[r.nama_produk] || 0) + 1; });
  } catch {}

  const topKlik = Object.entries(petaKlik).map(([nama, jml]) => ({ nama, jumlah: Number(jml) || 0 })).filter((x) => x.jumlah > 0).sort((a, b) => b.jumlah - a.jumlah).slice(0, 5);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Dashboard &amp; Kelola Produk</h1>
          <p className="text-xs text-teks-lembut">Ringkasan katalog produk toko.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/admin/ekspor-csv" className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-xs font-semibold text-teks hover:border-utama">⬇ Ekspor CSV</a>
          <FormImporCSV />
          <Tombol href="/admin/produk/baru" varian="utama">+ Tambah Produk</Tombol>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={boxCls}>
          <p className="text-xs text-teks-lembut uppercase font-semibold">Total Produk</p>
          <p className="text-2xl font-extrabold text-teks mt-1">{totalProduk}</p>
        </div>
        <div className={boxCls}>
          <p className="text-xs text-teks-lembut uppercase font-semibold">Produk Aktif</p>
          <p className="text-2xl font-extrabold text-utama mt-1">{aktifCount}</p>
        </div>
        <div className={boxCls}>
          <p className="text-xs text-teks-lembut uppercase font-semibold">Kategori ({listKat.length})</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {listKat.map(([k, n]) => <span key={k} className="rounded bg-latar border border-garis px-1.5 py-0.5 text-[10px] text-teks-lembut">{k}: <strong className="text-teks">{n}</strong></span>)}
          </div>
        </div>
      </div>

      <div className={boxCls}>
        <h2 className="text-xs font-bold text-teks mb-2">5 Produk Terlaris (Klik Pesan WhatsApp)</h2>
        {topKlik.length === 0 ? (
          <p className="text-xs text-teks-lembut">Belum ada data klik pemesanan.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {topKlik.map((t, idx) => (
              <div key={t.nama} className="rounded-lg border border-garis bg-latar p-2 text-xs">
                <span className="font-bold text-utama">#{idx + 1}</span> {t.jumlah} klik
                <p className="truncate font-semibold text-teks mt-0.5">{t.nama}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form method="GET" action="/admin" className="flex gap-2">
        <input type="text" name="cari" defaultValue={cari} placeholder="Cari nama produk…" className="flex-1 rounded-xl border border-garis bg-permukaan px-3.5 py-2 text-xs text-teks focus:border-utama focus:outline-none" />
        <Tombol type="submit" varian="utama">Cari</Tombol>
        {cari && <Tombol href="/admin" varian="garis">Reset</Tombol>}
      </form>

      {error && <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">Gagal memuat produk.</div>}

      <TabelProduk produk={produk} nonaktifIds={config.nonaktifIds || []} />

      {totalHalaman > 1 && (
        <div className="flex items-center justify-between border-t border-garis pt-3 text-xs text-teks-lembut">
          <p>Halaman {halaman} dari {totalHalaman} ({totalHasil} produk)</p>
          <div className="flex gap-2">
            {halaman > 1 && <Link href={`/admin?${new URLSearchParams({ ...(cari ? { cari } : {}), halaman: String(halaman - 1) })}`} className="rounded border border-garis px-2.5 py-1 text-teks">← Sebelumnya</Link>}
            {halaman < totalHalaman && <Link href={`/admin?${new URLSearchParams({ ...(cari ? { cari } : {}), halaman: String(halaman + 1) })}`} className="rounded border border-garis px-2.5 py-1 text-teks">Selanjutnya →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
