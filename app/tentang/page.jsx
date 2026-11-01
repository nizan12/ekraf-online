import Link from "next/link";
import { toko as defaultToko } from "@/lib/toko";
import { buatClientServer } from "@/lib/supabase";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Tentang Kami - ${defaultToko.nama}`,
  description: `Profil, jam operasional, dan lokasi ${defaultToko.nama}.`,
};

export default async function HalamanTentang() {
  const supabase = buatClientServer();
  let toko = defaultToko;

  try {
    const { data: dbToko } = await supabase
      .from("pengaturan_toko")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (dbToko) {
      toko = {
        nama: dbToko.nama || defaultToko.nama,
        nomorWhatsApp: dbToko.nomor_whatsapp || defaultToko.nomorWhatsApp,
        alamat: dbToko.alamat || defaultToko.alamat,
        jamBuka: dbToko.jam_buka || defaultToko.jamBuka,
        tagline: dbToko.tagline || defaultToko.tagline || "",
        deskripsi: dbToko.deskripsi || defaultToko.deskripsi || "",
      };
    } else {
      const config = await ambilPengaturanPublik();
      if (config?.tokoInfo) toko = config.tokoInfo;
    }
  } catch {
    const config = await ambilPengaturanPublik();
    if (config?.tokoInfo) toko = config.tokoInfo;
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${toko.nama} ${toko.alamat}`
  )}`;

  const waUrl = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(
    `Halo ${toko.nama}, saya ingin bertanya seputar menu dan pemesanan kopi.`
  )}`;

  return (
    <div className="py-8 md:py-12">
      <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
        ← Kembali ke katalog
      </Link>

      <section className="mt-6 rounded-2xl border border-garis bg-permukaan p-6 sm:p-10 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-teks sm:text-4xl">
            Tentang {toko.nama}
          </h1>
          <p className="mt-2 text-base font-semibold text-utama">{toko.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-teks-lembut">
            {toko.deskripsi} Kami menghadirkan seduhan biji kopi Nusantara pilihan, racikan minuman signature istimewa, serta pastry panggang segar yang siap menemani setiap momen santaimu.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Jam Buka */}
          <div className="rounded-xl border border-garis bg-latar p-4">
            <h2 className="text-sm font-bold text-teks">Jam Operasional</h2>
            <p className="mt-2 text-sm text-teks font-semibold">{toko.jamBuka}</p>
            <p className="mt-1 text-xs text-teks-lembut">Buka setiap hari melayani seduhan terbaik.</p>
          </div>

          {/* Alamat */}
          <div className="rounded-xl border border-garis bg-latar p-4">
            <h2 className="text-sm font-bold text-teks">Alamat &amp; Lokasi</h2>
            <p className="mt-2 text-sm text-teks font-semibold">{toko.alamat}</p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-utama hover:underline"
            >
              Buka di Google Maps ↗
            </a>
          </div>
        </div>

        {/* Kontak Toko */}
        <div className="rounded-xl border border-garis bg-latar p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-teks">Kontak &amp; Pemesanan Langsung</h2>
            <p className="mt-1 text-xs text-teks-lembut">
              Nomor WhatsApp resmi: <strong>+{toko.nomorWhatsApp}</strong>
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-utama px-5 py-2.5 text-xs font-bold text-white hover:bg-utama-gelap transition"
          >
            Hubungi via WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
