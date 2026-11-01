import { buatClientServer } from "@/lib/supabase";
import { toko as defaultToko } from "@/lib/toko";

const CONFIG_FILE = "pengaturan.json";

export async function ambilPengaturanPublik() {
  const supabase = buatClientServer();
  let tokoInfo = defaultToko;

  try {
    const { data: dbToko } = await supabase
      .from("pengaturan_toko")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (dbToko) {
      tokoInfo = {
        nama: dbToko.nama || defaultToko.nama,
        nomorWhatsApp: dbToko.nomor_whatsapp || defaultToko.nomorWhatsApp,
        alamat: dbToko.alamat || defaultToko.alamat,
        jamBuka: dbToko.jam_buka || defaultToko.jamBuka,
        tagline: dbToko.tagline || defaultToko.tagline || "",
        deskripsi: dbToko.deskripsi || "",
      };
    }
  } catch {}

  let nonaktifIds = [];
  try {
    const { data } = await supabase.storage.from("image").download(CONFIG_FILE);
    if (data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      nonaktifIds = Array.isArray(parsed.nonaktifIds) ? parsed.nonaktifIds : [];
    }
  } catch {}

  return { nonaktifIds, urutanIds: [], tokoInfo };
}

export async function ambilPengaturanAdmin() {
  const supabase = buatClientServer();
  let tokoInfo = defaultToko;
  let kategoriList = [];
  let auditLog = [];
  let analitikKlik = {};
  let ulasanList = [];
  let nonaktifIds = [];

  const [tokoRes, katRes, logRes, analitikRes, ulasanRes, storageRes] = await Promise.allSettled([
    supabase.from("pengaturan_toko").select("*").limit(1).maybeSingle(),
    supabase.from("kategori").select("nama").order("urutan", { ascending: true }),
    supabase.from("log_aktivitas").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("klik_whatsapp_per_produk").select("*"),
    supabase.from("ulasan").select("*, produk:produk_id(id, nama)").order("created_at", { ascending: false }),
    supabase.storage.from("image").download(CONFIG_FILE),
  ]);

  if (tokoRes.status === "fulfilled" && tokoRes.value.data) {
    const d = tokoRes.value.data;
    tokoInfo = {
      nama: d.nama || defaultToko.nama,
      nomorWhatsApp: d.nomor_whatsapp || defaultToko.nomorWhatsApp,
      alamat: d.alamat || defaultToko.alamat,
      jamBuka: d.jam_buka || defaultToko.jamBuka,
      tagline: d.tagline || defaultToko.tagline || "",
      deskripsi: d.deskripsi || "",
    };
  }

  if (katRes.status === "fulfilled" && Array.isArray(katRes.value.data)) {
    kategoriList = katRes.value.data.map((k) => k.nama);
  }

  if (logRes.status === "fulfilled" && Array.isArray(logRes.value.data)) {
    auditLog = logRes.value.data.map((l) => ({
      id: String(l.id),
      timestamp: l.created_at,
      user: l.admin_email || "Admin",
      aksi: l.aksi,
      rincian: l.rincian || "",
    }));
  }

  if (analitikRes.status === "fulfilled" && Array.isArray(analitikRes.value.data)) {
    analitikRes.value.data.forEach((row) => {
      analitikKlik[row.produk_id] = {
        id: row.produk_id,
        nama: row.nama_produk || "Produk",
        totalKlik: Number(row.total_klik) || 0,
      };
    });
  }

  if (ulasanRes.status === "fulfilled" && Array.isArray(ulasanRes.value.data)) {
    ulasanList = ulasanRes.value.data.map((u) => ({
      id: String(u.id),
      produkId: String(u.produk_id),
      namaProduk: u.produk?.nama || `Produk #${u.produk_id}`,
      nama: u.nama,
      rating: u.rating,
      komentar: u.komentar,
      status: u.disetujui ? "disetujui" : "tertunda",
      tanggal: u.created_at,
    }));
  }

  if (storageRes.status === "fulfilled" && storageRes.value.data) {
    try {
      const text = await storageRes.value.data.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.nonaktifIds)) nonaktifIds = parsed.nonaktifIds;
      if (auditLog.length === 0 && Array.isArray(parsed.auditLog)) auditLog = parsed.auditLog;
    } catch {}
  }

  return { nonaktifIds, urutanIds: [], kategoriList, tokoInfo, analitikKlik, auditLog, ulasanList };
}

export async function simpanPengaturanAdmin(pengaturan) {
  const supabase = buatClientServer();
  try {
    const json = JSON.stringify(pengaturan, null, 2);
    await supabase.storage.from("image").upload(CONFIG_FILE, json, {
      upsert: true,
      contentType: "application/json",
    });
    return true;
  } catch {
    return false;
  }
}

export async function catatKlikProduk({ produkId, nama, harga = 0, jumlah = 1 }) {
  const supabase = buatClientServer();
  try {
    await supabase.from("klik_whatsapp").insert({
      produk_id: Number(produkId) || null,
      nama_produk: String(nama || "Produk").slice(0, 100),
      harga: Number(harga) || 0,
      jumlah: Number(jumlah) || 1,
      sumber: "detail",
      created_at: new Date().toISOString(),
    });
  } catch {}
}

export async function catatLogAktivitas(aksi, rincian = "") {
  const supabase = buatClientServer();
  try {
    await supabase.from("log_aktivitas").insert({
      aksi,
      rincian,
      admin_email: "Admin",
      created_at: new Date().toISOString(),
    });
  } catch {}
}

export async function ambilUlasanProduk(produkId) {
  const supabase = buatClientServer();
  try {
    const { data } = await supabase
      .from("ulasan")
      .select("*")
      .eq("produk_id", Number(produkId) || produkId)
      .eq("disetujui", true)
      .order("created_at", { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export async function tambahUlasanProduk({ produkId, nama, rating, komentar }) {
  const supabase = buatClientServer();
  try {
    const { data, error } = await supabase
      .from("ulasan")
      .insert({
        produk_id: Number(produkId) || null,
        nama: String(nama).slice(0, 100),
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        komentar: String(komentar).slice(0, 500),
        disetujui: true,
      })
      .select()
      .single();
    return { sukses: !error, data };
  } catch {
    return { sukses: false };
  }
}

export async function ubahStatusUlasan(id, statusBaru) {
  const supabase = buatClientServer();
  try {
    const disetujui = statusBaru === "disetujui" || statusBaru === "tampilkan";
    await supabase.from("ulasan").update({ disetujui }).eq("id", id);
    return true;
  } catch {
    return false;
  }
}

export async function hapusUlasanAdmin(id) {
  const supabase = buatClientServer();
  try {
    await supabase.from("ulasan").delete().eq("id", id);
    return true;
  } catch {
    return false;
  }
}
