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
  const sb = buatClientServer();
  let toko = defaultToko;

  try {
    const { data: dbToko } = await sb.from("pengaturan_toko").select("*").limit(1).maybeSingle();
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

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${toko.nama} ${toko.alamat}`)}`;
  const waUrl = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(`Halo ${toko.nama}, saya ingin bertanya seputar menu.`)}`;

  return (
    <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/" className="text-xs text-teks-lembut underline hover:text-utama">← Kembali ke katalog</Link>
      <section className="rounded-2xl border border-garis bg-permukaan p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-teks">Tentang {toko.nama}</h1>
          <p className="mt-1 text-sm font-semibold text-utama">{toko.tagline}</p>
          <p className="mt-2 text-xs sm:text-sm text-teks-lembut leading-relaxed">{toko.deskripsi}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-garis bg-latar p-4">
            <h2 className="text-xs font-bold text-teks">Jam Operasional</h2>
            <p className="mt-1 text-xs font-semibold text-teks">{toko.jamBuka}</p>
            <p className="mt-0.5 text-[11px] text-teks-lembut">Buka setiap hari melayani seduhan terbaik.</p>
          </div>
          <div className="rounded-xl border border-garis bg-latar p-4">
            <h2 className="text-xs font-bold text-teks">Alamat &amp; Lokasi</h2>
            <p className="mt-1 text-xs font-semibold text-teks">{toko.alamat}</p>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold text-utama hover:underline">Buka di Google Maps ↗</a>
          </div>
        </div>
        <div className="rounded-xl border border-garis bg-latar p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-teks">Hubungi Kami via WhatsApp</h2>
            <p className="mt-0.5 text-xs text-teks-lembut">Konsultasi menu, pesanan acara, dan pertanyaan lain.</p>
          </div>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">Chat WhatsApp: {toko.nomorWhatsApp}</a>
        </div>
      </section>
    </div>
  );
}
