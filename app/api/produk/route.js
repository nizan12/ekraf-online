import { NextResponse } from "next/server";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const urutan = searchParams.get("urutan") || "";
    const cari = searchParams.get("cari") || "";
    const kategori = searchParams.get("kategori") || "";
    const halaman = Math.max(1, parseInt(searchParams.get("halaman") || searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || searchParams.get("per_page") || "100", 10));

    const supabase = buatClientServer();
    let query = supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)", { count: "exact" });

    // US-11: Filter pencarian nama dan kategori
    if (cari) {
      query = query.ilike("nama", `%${cari}%`);
    }
    if (kategori) {
      try {
        query = query.ilike("kategori", `%${kategori}%`);
      } catch {}
    }

    // US-15: Pengurutan
    if (urutan === "termurah" || urutan === "harga-asc") {
      query = query.order("harga", { ascending: true });
    } else if (urutan === "termahal" || urutan === "harga-desc") {
      query = query.order("harga", { ascending: false });
    } else if (urutan === "terbaru") {
      query = query.order("created_at", { ascending: false });
    } else if (urutan === "nama") {
      query = query.order("nama", { ascending: true });
    } else {
      query = query.order("urutan", { ascending: true, nullsFirst: false }).order("nama", { ascending: true });
    }

    // US-16: Paginasi
    if (searchParams.has("halaman") || searchParams.has("page")) {
      const awal = (halaman - 1) * limit;
      const akhir = awal + limit - 1;
      query = query.range(awal, akhir);
    }

    const { data: rawProduk, count, error } = await query;
    if (error) {
      return NextResponse.json({ error: "Gagal memuat produk." }, { status: 500 });
    }

    const config = await ambilPengaturanAdmin();
    const nonaktifIds = config.nonaktifIds || [];
    const normalized = normalisasiDaftarProduk(rawProduk || []);
    const produkAktif = normalized.filter((p) => !nonaktifIds.includes(p.id) && p.aktif !== false);

    return NextResponse.json({
      produk: produkAktif,
      total: count ?? produkAktif.length,
      halaman,
      limit,
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
