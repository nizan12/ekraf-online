import KartuProduk from "@/components/KartuProduk";
import FilterProduk from "@/components/FilterProduk";
import Paginasi from "@/components/Paginasi";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import BannerPromo from "@/components/BannerPromo";
import { toko } from "@/lib/toko";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";

const PRODUK_PER_HALAMAN = 6;

export default async function HalamanKatalog({ searchParams }) {
  const sp = (await searchParams) || {};
  const { kategori, cari, urutan, halaman, minHarga, maxHarga } = sp;

  let daftarProduk = [];
  let totalProduk = 0;
  let totalHalaman = 1;
  let halamanSekarang = Math.max(1, parseInt(halaman, 10) || 1);
  let kategoriList = [];
  let error = null;
  let pengaturan = null;

  try {
    const supabase = buatClientServer();

    const [hasilPengaturan, katRes] = await Promise.all([
      ambilPengaturanPublik(),
      supabase.from("kategori").select("id, nama").order("urutan", { ascending: true }),
    ]);
    pengaturan = hasilPengaturan;

    const nonaktifIds = pengaturan?.nonaktifIds || [];
    const daftarKategori = katRes.data || [];
    kategoriList = daftarKategori.map((k) => k.nama).filter(Boolean);

    let query = supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)", { count: "exact" });

    // US-32: Sembunyikan nonaktif
    if (nonaktifIds.length > 0) {
      query = query.not("id", "in", `(${nonaktifIds.join(",")})`);
    }

    // US-11: Filter kategori
    if (kategori) {
      const katCocok = daftarKategori.find(
        (k) => k.nama.toLowerCase() === kategori.toLowerCase()
      );
      if (katCocok?.id) query = query.eq("kategori_id", katCocok.id);
    }

    // US-11: Pencarian nama
    if (cari) {
      query = query.ilike("nama", `%${cari}%`);
    }

    // Rentang harga
    if (minHarga && !isNaN(Number(minHarga))) query = query.gte("harga", Number(minHarga));
    if (maxHarga && !isNaN(Number(maxHarga))) query = query.lte("harga", Number(maxHarga));

    // US-15: Pengurutan
    if (urutan === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (urutan === "termahal") {
      query = query.order("harga", { ascending: false });
    } else if (urutan === "nama") {
      query = query.order("nama", { ascending: true });
    } else {
      query = query.order("urutan", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
    }

    // US-16: Paginasi
    const awal = (halamanSekarang - 1) * PRODUK_PER_HALAMAN;
    const akhir = awal + PRODUK_PER_HALAMAN - 1;
    query = query.range(awal, akhir);

    const { data: hasilProduk, count, error: queryError } = await query;
    if (queryError) throw queryError;

    daftarProduk = normalisasiDaftarProduk(hasilProduk ?? []);
    totalProduk = typeof count === "number" ? count : daftarProduk.length;
    totalHalaman = Math.max(1, Math.ceil(totalProduk / PRODUK_PER_HALAMAN));
    if (halamanSekarang > totalHalaman) halamanSekarang = totalHalaman;
  } catch {
    error = "Gagal memuat produk dari database.";
  }

  // US-42: Banner Promo aktif dari database
  let daftarBanner = [];
  try {
    const supabase = buatClientServer();
    const { data: bannerData } = await supabase
      .from("banner")
      .select("*")
      .eq("aktif", true)
      .order("id", { ascending: true });
    if (bannerData && bannerData.length > 0) daftarBanner = bannerData;
  } catch {}

  const tokoAktif = pengaturan?.tokoInfo || toko;

  return (
    <>
      <section className="py-8 sm:py-12">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {tokoAktif.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{tokoAktif.tagline}</p>
        <p className="mt-2 text-sm text-teks-lembut">{tokoAktif.jamBuka}</p>
      </section>

      {/* US-42: Banner Promo */}
      <BannerPromo slides={daftarBanner} />

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {!error && <FilterProduk kategoriList={kategoriList} />}

        {error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700 text-sm">
            {error}
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="py-12 text-center text-teks-lembut">Belum ada produk</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((p) => (
                <KartuProduk key={p.id} produk={p} />
              ))}
            </div>

            <Paginasi
              halamanSekarang={halamanSekarang}
              totalHalaman={totalHalaman}
              totalProduk={totalProduk}
              itemPerHalaman={PRODUK_PER_HALAMAN}
              params={{ kategori, cari, urutan }}
            />
          </>
        )}
      </section>

      {/* US-36: Terakhir Dilihat */}
      <TerakhirDilihat />
    </>
  );
}
