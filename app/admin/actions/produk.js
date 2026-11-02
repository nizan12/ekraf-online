"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { ambilPengaturanAdmin, simpanPengaturanAdmin, catatLogAktivitas } from "@/lib/pengaturanAdmin";
import { unggahFotoLangsung } from "./upload";

async function cariAtauBuatKategoriId(sb, kat) {
  if (!kat) return null;
  if (!isNaN(Number(kat))) return Number(kat);
  const { data } = await sb.from("kategori").select("id").ilike("nama", kat).maybeSingle();
  if (data?.id) return data.id;
  const slug = kat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data: b } = await sb.from("kategori").insert({ nama: kat, slug, urutan: 99 }).select("id").single();
  return b?.id || null;
}

async function simpanVarian(sb, pid, json) {
  if (!json || !pid) return;
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return;
    await sb.from("varian").delete().eq("produk_id", Number(pid));
    const rows = arr.filter((v) => v?.nama?.trim()).map((v) => ({
      produk_id: Number(pid), nama: v.nama.trim(), harga_tambahan: Number(v.harga_tambahan) || 0,
      stok: v.stok !== "" && v.stok !== null && !isNaN(Number(v.stok)) ? Number(v.stok) : null,
    }));
    if (rows.length > 0) await sb.from("varian").insert(rows);
  } catch {}
}

function validasi(formData) {
  const nama = (formData.get("nama") || "").trim(), harga = parseInt(formData.get("harga"), 10), fieldErrors = {};
  if (!nama) fieldErrors.nama = "Nama produk wajib diisi.";
  else if (nama.length < 3) fieldErrors.nama = "Nama minimal 3 karakter.";
  if (isNaN(harga) || harga <= 0) fieldErrors.harga = "Harga harus berupa angka lebih besar dari 0.";
  return { nama, harga, valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

async function ekstrakPayload(formData) {
  const { nama, harga, valid, fieldErrors } = validasi(formData);
  if (!valid) {
    const values = {
      nama: formData.get("nama") || "", harga: formData.get("harga") || "",
      deskripsi: formData.get("deskripsi") || "", kategori: formData.get("kategori") || "",
      stok: formData.get("stok") || "", harga_coret: formData.get("harga_coret") || "",
      diskon_persen: formData.get("diskon_persen") || "", foto_url: formData.get("foto_url") || "",
    };
    return { valid: false, error: "Validasi gagal. Periksa kembali formulir.", fieldErrors, errors: fieldErrors, values, data: values };
  }
  let foto = (formData.get("foto_url") || "").trim() || "/images/placeholder.svg";
  const file = formData.get("file_gambar");
  if (file?.size > 0 && file.name) {
    const up = await unggahFotoLangsung(file);
    if (up?.url) foto = foto ? `${up.url}, ${foto}` : up.url;
  }
  const stok = parseInt(formData.get("stok") || "10", 10), coret = parseInt(formData.get("harga_coret") || "0", 10) || null, diskon = parseInt(formData.get("diskon_persen") || "0", 10) || null;
  const payload = {
    nama, harga, deskripsi: (formData.get("deskripsi") || "").trim(),
    foto_url: foto, image: foto, stok: isNaN(stok) ? 10 : stok,
    baru: formData.get("baru") === "on" || formData.get("baru") === "true",
    terlaris: formData.get("terlaris") === "on" || formData.get("terlaris") === "true",
  };
  if (coret) payload.harga_coret = coret;
  if (diskon) payload.diskon_persen = diskon;
  return { valid: true, payload, katInput: (formData.get("kategori") || "").trim(), nama };
}

export async function tambahProduk(prevState, formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return { error: "Sesi login berakhir. Silakan login kembali." };
  const parsed = await ekstrakPayload(formData);
  if (!parsed.valid) return parsed;
  const sbServer = buatClientServer();
  const kid = await cariAtauBuatKategoriId(sbServer, parsed.katInput);
  let newId = null;
  try {
    const { data } = await sbServer.from("produk").insert([{ ...parsed.payload, kategori_id: kid, aktif: true }]).select("id").single();
    newId = data?.id;
  } catch { return { error: "Gagal menyimpan produk ke database." }; }
  if (newId) await simpanVarian(sbServer, newId, formData.get("varian_json"));
  await catatLogAktivitas("Tambah Produk", `Menambahkan "${parsed.nama}"`);
  revalidatePath("/"); revalidatePath("/admin"); redirect("/admin");
}

export async function ubahProduk(prevState, formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return { error: "Sesi login berakhir. Silakan login kembali." };
  const id = formData.get("id");
  if (!id) return { error: "ID produk tidak valid." };
  const parsed = await ekstrakPayload(formData);
  if (!parsed.valid) return parsed;
  const sbServer = buatClientServer();
  const kid = await cariAtauBuatKategoriId(sbServer, parsed.katInput);
  try {
    await sbServer.from("produk").update({ ...parsed.payload, kategori_id: kid }).eq("id", id);
  } catch { return { error: "Gagal memperbarui produk di database." }; }
  await simpanVarian(sbServer, id, formData.get("varian_json"));
  await catatLogAktivitas("Ubah Produk", `Memperbarui produk ID #${id} (${parsed.nama})`);
  revalidatePath("/"); revalidatePath(`/produk/${id}`); revalidatePath("/admin"); redirect("/admin");
}

export async function hapusProduk(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");
  const id = formData.get("id");
  if (!id) return;
  const sb = buatClientServer();
  await sb.from("varian").delete().eq("produk_id", Number(id));
  await sb.from("produk").delete().eq("id", id);
  await catatLogAktivitas("Hapus Produk", `Menghapus produk ID #${id}`);
  revalidatePath("/"); revalidatePath("/admin");
}

export async function toggleStatusProduk(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return;
  const id = formData.get("id"), aktif = formData.get("aktif") === "true";
  const sb = buatClientServer();
  await sb.from("produk").update({ aktif }).eq("id", id);
  const conf = await ambilPengaturanAdmin();
  let nonaktif = (conf.nonaktifIds || []).map(String);
  if (aktif) nonaktif = nonaktif.filter((x) => x !== String(id));
  else if (!nonaktif.includes(String(id))) nonaktif.push(String(id));
  await simpanPengaturanAdmin({ ...conf, nonaktifIds: nonaktif });
  revalidatePath("/"); revalidatePath("/admin");
}

export const toggleProdukAktif = toggleStatusProduk;

export async function simpanUrutanProduk(daftarId) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user || !Array.isArray(daftarId)) return false;
  const sb = buatClientServer();
  for (let i = 0; i < daftarId.length; i++) await sb.from("produk").update({ urutan: i + 1 }).eq("id", daftarId[i]);
  revalidatePath("/"); revalidatePath("/admin");
  return true;
}

export async function geserUrutanProduk(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return;
  const id = Number(formData.get("id")), arah = formData.get("arah");
  if (!id || (arah !== "naik" && arah !== "turun")) return;
  const sb = buatClientServer();
  const { data: list } = await sb.from("produk").select("id, urutan").order("urutan", { ascending: true }).order("created_at", { ascending: false });
  if (!list || list.length <= 1) return;
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return;
  const targetIdx = arah === "naik" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= list.length) return;
  const cur = list[idx], target = list[targetIdx];
  const uCur = cur.urutan ?? (idx + 1), uTarget = target.urutan ?? (targetIdx + 1);
  const newCur = uCur === uTarget ? (arah === "naik" ? uTarget - 1 : uTarget + 1) : uTarget;
  await sb.from("produk").update({ urutan: newCur }).eq("id", cur.id);
  await sb.from("produk").update({ urutan: uCur }).eq("id", target.id);
  revalidatePath("/"); revalidatePath("/admin");
}

export async function tambahStokCepat(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return;
  const id = formData.get("id"), stok = parseInt(formData.get("stok"), 10);
  if (id && !isNaN(stok)) {
    const sb = buatClientServer();
    await sb.from("produk").update({ stok: Math.max(0, stok) }).eq("id", id);
    revalidatePath("/admin");
  }
}

export async function tambahVarian(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return;
  const pid = Number(formData.get("produkId")), nama = (formData.get("nama") || "").trim(), harga = Number(formData.get("harga")) || 0;
  if (pid && nama) {
    const sb = buatClientServer();
    await sb.from("varian").insert({ produk_id: pid, nama, harga_tambahan: harga });
    revalidatePath(`/admin/produk/${pid}/ubah`);
  }
}

export async function hapusVarian(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return;
  const id = Number(formData.get("id")), pid = formData.get("produkId");
  if (id) {
    const sb = buatClientServer();
    await sb.from("varian").delete().eq("id", id);
    if (pid) revalidatePath(`/admin/produk/${pid}/ubah`);
  }
}
