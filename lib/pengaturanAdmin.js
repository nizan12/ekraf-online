import { buatClientServer } from "@/lib/supabase";
import { toko as defaultToko } from "@/lib/toko";

const CFG = "pengaturan.json";

export async function ambilPengaturanPublik() {
  const sb = buatClientServer();
  let tokoInfo = defaultToko, nonaktifIds = [];
  try {
    const { data: d } = await sb.from("pengaturan_toko").select("*").limit(1).maybeSingle();
    if (d) tokoInfo = { nama: d.nama || defaultToko.nama, nomorWhatsApp: d.nomor_whatsapp || defaultToko.nomorWhatsApp, alamat: d.alamat || defaultToko.alamat, jamBuka: d.jam_buka || defaultToko.jamBuka, tagline: d.tagline || defaultToko.tagline || "", deskripsi: d.deskripsi || "" };
  } catch {}
  try {
    const { data } = await sb.storage.from("image").download(CFG);
    if (data) {
      const p = JSON.parse(await data.text());
      nonaktifIds = Array.isArray(p.nonaktifIds) ? p.nonaktifIds : [];
    }
  } catch {}
  return { nonaktifIds, urutanIds: [], tokoInfo };
}

export async function ambilPengaturanAdmin() {
  const sb = buatClientServer();
  let tokoInfo = defaultToko, kategoriList = [], auditLog = [], analitikKlik = {}, ulasanList = [], nonaktifIds = [];
  const [tokoRes, katRes, logRes, analitikRes, ulasanRes, stRes] = await Promise.allSettled([
    sb.from("pengaturan_toko").select("*").limit(1).maybeSingle(),
    sb.from("kategori").select("nama").order("urutan", { ascending: true }),
    sb.from("log_aktivitas").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("klik_whatsapp_per_produk").select("*"),
    sb.from("ulasan").select("*, produk:produk_id(id, nama)").order("created_at", { ascending: false }),
    sb.storage.from("image").download(CFG),
  ]);

  if (tokoRes.status === "fulfilled" && tokoRes.value.data) {
    const d = tokoRes.value.data;
    tokoInfo = { nama: d.nama || defaultToko.nama, nomorWhatsApp: d.nomor_whatsapp || defaultToko.nomorWhatsApp, alamat: d.alamat || defaultToko.alamat, jamBuka: d.jam_buka || defaultToko.jamBuka, tagline: d.tagline || defaultToko.tagline || "", deskripsi: d.deskripsi || "" };
  }
  if (katRes.status === "fulfilled" && Array.isArray(katRes.value.data)) kategoriList = katRes.value.data.map((k) => k.nama);
  if (logRes.status === "fulfilled" && Array.isArray(logRes.value.data)) {
    auditLog = logRes.value.data.map((l) => ({ id: String(l.id), timestamp: l.created_at, user: l.admin_email || "Admin", aksi: l.aksi, rincian: l.rincian || "" }));
  }
  if (analitikRes.status === "fulfilled" && Array.isArray(analitikRes.value.data)) {
    analitikRes.value.data.forEach((r) => { analitikKlik[r.produk_id] = { id: r.produk_id, nama: r.nama_produk || "Produk", totalKlik: Number(r.total_klik) || 0 }; });
  }
  if (ulasanRes.status === "fulfilled" && Array.isArray(ulasanRes.value.data)) {
    ulasanList = ulasanRes.value.data.map((u) => ({
      id: String(u.id), produkId: String(u.produk_id), namaProduk: u.produk?.nama || `Produk #${u.produk_id}`,
      nama: u.nama, rating: u.rating, komentar: u.komentar, status: u.disetujui ? "disetujui" : "tertunda", tanggal: u.created_at,
    }));
  }
  if (stRes.status === "fulfilled" && stRes.value.data) {
    try {
      const p = JSON.parse(await stRes.value.data.text());
      if (Array.isArray(p.nonaktifIds)) nonaktifIds = p.nonaktifIds;
      if (auditLog.length === 0 && Array.isArray(p.auditLog)) auditLog = p.auditLog;
    } catch {}
  }
  return { nonaktifIds, urutanIds: [], kategoriList, tokoInfo, analitikKlik, auditLog, ulasanList };
}

export async function simpanPengaturanAdmin(cfg) {
  const sb = buatClientServer();
  try {
    await sb.storage.from("image").upload(CFG, JSON.stringify(cfg), { upsert: true, contentType: "application/json" });
    return true;
  } catch { return false; }
}

export async function catatKlikProduk({ produkId, nama, harga = 0, jumlah = 1 }) {
  const sb = buatClientServer();
  try {
    await sb.from("klik_whatsapp").insert({
      produk_id: Number(produkId) || null, nama_produk: String(nama || "Produk").slice(0, 100),
      harga: Number(harga) || 0, jumlah: Number(jumlah) || 1, sumber: "detail", created_at: new Date().toISOString(),
    });
  } catch {}
}

export async function catatLogAktivitas(aksi, rincian = "") {
  const sb = buatClientServer();
  try {
    await sb.from("log_aktivitas").insert({ aksi, rincian, admin_email: "Admin", created_at: new Date().toISOString() });
  } catch {}
}

export async function ambilUlasanProduk(pid) {
  const sb = buatClientServer();
  try {
    const { data } = await sb.from("ulasan").select("*").eq("produk_id", Number(pid) || pid).eq("disetujui", true).order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function tambahUlasanProduk({ produkId, nama, rating, komentar }) {
  const sb = buatClientServer();
  try {
    const { data, error } = await sb.from("ulasan").insert({
      produk_id: Number(produkId) || null, nama: String(nama).slice(0, 100),
      rating: Math.max(1, Math.min(5, Number(rating) || 5)), komentar: String(komentar).slice(0, 500), disetujui: true,
    }).select().single();
    return { sukses: !error, data };
  } catch { return { sukses: false }; }
}

export async function ubahStatusUlasan(id, statusBaru) {
  const sb = buatClientServer();
  try {
    const disetujui = statusBaru === "disetujui" || statusBaru === "tampilkan";
    await sb.from("ulasan").update({ disetujui }).eq("id", id);
    return true;
  } catch { return false; }
}

export async function hapusUlasanAdmin(id) {
  const sb = buatClientServer();
  try {
    await sb.from("ulasan").delete().eq("id", id);
    return true;
  } catch { return false; }
}
