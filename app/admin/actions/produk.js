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
      produk_id: Number(pid),
      nama: v.nama.trim(),
      harga_tambahan: Number(v.harga_tambahan) || 0,
      stok: v.stok !== "" && v.stok !== null && !isNaN(Number(v.stok)) ? Number(v.stok) : null,
    }));
    if (rows.length > 0) await sb.from("varian").insert(rows);
  } catch {}
}

function validasi(formData) {
  const nama = (formData.get("nama") || "").trim();
  const harga = parseInt(formData.get("harga"), 10);
  const fieldErrors = {};
  if (!nama) fieldErrors.nama = "Nama produk wajib diisi.";
  else if (nama.length < 3) fieldErrors.nama = "Nama minimal 3 karakter.";
  if (isNaN(harga) || harga <= 0) fieldErrors.harga = "Harga harus berupa angka lebih besar dari 0.";
  return { nama, harga, valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

export async function tambahProduk(prevState, formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return { error: "Sesi login berakhir. Silakan login kembali." };

  const { nama, harga, valid, fieldErrors } = validasi(formData);
  if (!valid) return { error: "Validasi gagal.", fieldErrors, errors: fieldErrors };

  const deskripsi = (formData.get("deskripsi") || "").trim();
  const katInput = (formData.get("kategori") || "").trim();
  const stok = parseInt(formData.get("stok") || "10", 10);
  const coret = parseInt(formData.get("harga_coret") || "0", 10) || null;
  const diskon = parseInt(formData.get("diskon_persen") || "0", 10) || null;
  const baru = formData.get("baru") === "on" || formData.get("baru") === "true";
  const terlaris = formData.get("terlaris") === "on" || formData.get("terlaris") === "true";

  let foto = (formData.get("foto_url") || "").trim() || "/images/placeholder.svg";
  const file = formData.get("file_gambar");
  if (file && file.size > 0 && file.name) {
    const up = await unggahFotoLangsung(file);
    if (up?.url) foto = foto ? `${up.url}, ${foto}` : up.url;
  }

  const sbServer = buatClientServer();
  const kid = await cariAtauBuatKategoriId(sbServer, katInput);

  let newId = null;
  try {
    const payload = { nama, harga, deskripsi, foto_url: foto, image: foto, kategori_id: kid, stok: isNaN(stok) ? 10 : stok, aktif: true };
    if (coret) payload.harga_coret = coret;
    if (diskon) payload.diskon_persen = diskon;
    if (baru) payload.baru = true;
    if (terlaris) payload.terlaris = true;

    const { data, error } = await sbServer.from("produk").insert([payload]).select("id").single();
    if (error) {
      const fallback = { nama, harga, deskripsi, foto_url: foto, image: foto, kategori_id: kid, stok: isNaN(stok) ? 10 : stok, aktif: true };
      const { data: fbData, error: fbErr } = await sbServer.from("produk").insert([fallback]).select("id").single();
      if (fbErr) throw fbErr;
      newId = fbData?.id;
    } else {
      newId = data?.id;
    }
  } catch {
    return { error: "Gagal menyimpan produk ke database." };
  }

  if (newId) await simpanVarian(sbServer, newId, formData.get("varian_json"));
  await catatLogAktivitas("Tambah Produk", `Menambahkan "${nama}"`);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(prevState, formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return { error: "Sesi login berakhir. Silakan login kembali." };

  const id = formData.get("id");
  if (!id) return { error: "ID produk tidak valid." };

  const { nama, harga, valid, fieldErrors } = validasi(formData);
  if (!valid) return { error: "Validasi gagal.", fieldErrors, errors: fieldErrors };

  const deskripsi = (formData.get("deskripsi") || "").trim();
  const katInput = (formData.get("kategori") || "").trim();
  const stok = parseInt(formData.get("stok") || "10", 10);
  const coret = parseInt(formData.get("harga_coret") || "0", 10) || null;
  const diskon = parseInt(formData.get("diskon_persen") || "0", 10) || null;
  const baru = formData.get("baru") === "on" || formData.get("baru") === "true";
  const terlaris = formData.get("terlaris") === "on" || formData.get("terlaris") === "true";

  let foto = (formData.get("foto_url") || "").trim() || "/images/placeholder.svg";
  const file = formData.get("file_gambar");
  if (file && file.size > 0 && file.name) {
    const up = await unggahFotoLangsung(file);
    if (up?.url) foto = foto ? `${up.url}, ${foto}` : up.url;
  }

  const sbServer = buatClientServer();
  const kid = await cariAtauBuatKategoriId(sbServer, katInput);

  try {
    const payload = { nama, harga, deskripsi, foto_url: foto, image: foto, kategori_id: kid, stok: isNaN(stok) ? 10 : stok };
    if (coret) payload.harga_coret = coret;
    if (diskon) payload.diskon_persen = diskon;
    payload.baru = baru;
    payload.terlaris = terlaris;

    const { error } = await sbServer.from("produk").update(payload).eq("id", id);
    if (error) {
      const fb = { nama, harga, deskripsi, foto_url: foto, image: foto, kategori_id: kid, stok: isNaN(stok) ? 10 : stok };
      await sbServer.from("produk").update(fb).eq("id", id);
    }
  } catch {
    return { error: "Gagal memperbarui produk di database." };
  }

  await simpanVarian(sbServer, id, formData.get("varian_json"));
  await catatLogAktivitas("Ubah Produk", `Memperbarui produk ID #${id} (${nama})`);
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
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
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleStatusProduk(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return;

  const id = formData.get("id");
  const aktif = formData.get("aktif") === "true";
  const sb = buatClientServer();
  await sb.from("produk").update({ aktif }).eq("id", id);

  const conf = await ambilPengaturanAdmin();
  let nonaktif = (conf.nonaktifIds || []).map(String);
  if (aktif) nonaktif = nonaktif.filter((x) => x !== String(id));
  else if (!nonaktif.includes(String(id))) nonaktif.push(String(id));
  await simpanPengaturanAdmin({ ...conf, nonaktifIds: nonaktif });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function simpanUrutanProduk(daftarId) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user || !Array.isArray(daftarId)) return false;
  const sb = buatClientServer();
  for (let i = 0; i < daftarId.length; i++) {
    await sb.from("produk").update({ urutan: i + 1 }).eq("id", daftarId[i]);
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return true;
}

export async function geserUrutanProduk(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return;

  const id = Number(formData.get("id"));
  const arah = formData.get("arah");
  if (!id || (arah !== "naik" && arah !== "turun")) return;

  const sb = buatClientServer();
  const { data: list } = await sb.from("produk").select("id, urutan").order("urutan", { ascending: true }).order("created_at", { ascending: false });
  if (!list || list.length <= 1) return;

  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return;
  const targetIdx = arah === "naik" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= list.length) return;

  const cur = list[idx];
  const target = list[targetIdx];
  const uCur = cur.urutan ?? (idx + 1);
  const uTarget = target.urutan ?? (targetIdx + 1);
  const newCur = uCur === uTarget ? (arah === "naik" ? uTarget - 1 : uTarget + 1) : uTarget;

  await sb.from("produk").update({ urutan: newCur }).eq("id", cur.id);
  await sb.from("produk").update({ urutan: uCur }).eq("id", target.id);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function tambahStokCepat(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return;
  const id = formData.get("id");
  const stok = parseInt(formData.get("stok"), 10);
  if (id && !isNaN(stok)) {
    const sb = buatClientServer();
    await sb.from("produk").update({ stok: Math.max(0, stok) }).eq("id", id);
    revalidatePath("/admin");
  }
}
