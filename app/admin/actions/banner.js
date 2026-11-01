"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { catatLogAktivitas } from "@/lib/pengaturanAdmin";

// US-42: Tambah banner promo baru
export async function tambahBannerAdmin(arg1, arg2) {
  const formData = arg2 && typeof arg2.get === "function" ? arg2 : arg1;
  if (!formData) return { error: "Data form tidak valid." };

  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const judul = formData.get("judul")?.trim();
  const subjudul = formData.get("subjudul")?.trim() || formData.get("teks")?.trim() || null;
  const deskripsi = formData.get("deskripsi")?.trim() || subjudul || null;
  const badge = formData.get("badge")?.trim() || formData.get("tag")?.trim() || "PROMO SPESIAL";
  const tombol_teks = formData.get("tombol_teks")?.trim() || formData.get("cta")?.trim() || "Lihat Promo";
  const link_url = formData.get("link_url")?.trim() || formData.get("tautan")?.trim() || "/#katalog-utama";
  const foto_url = formData.get("foto_url")?.trim() || formData.get("gambar_url")?.trim() || formData.get("gambar")?.trim() || null;

  if (!judul || judul.length < 3) return { error: "Judul minimal 3 karakter." };

  const sbServer = buatClientServer();
  await sbServer.from("banner").insert({
    judul, subjudul, deskripsi, badge, tombol_teks, link_url, foto_url, aktif: true, urutan: 1,
  });

  await catatLogAktivitas("Tambah Banner", `Menambahkan banner "${judul}"`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { sukses: "Banner berhasil ditambahkan." };
}

// US-42: Ubah banner promo (judul, teks/deskripsi, gambar, tautan)
export async function ubahBannerAdmin(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const id = formData.get("id");
  if (!id) return { error: "ID tidak valid." };

  const judul = formData.get("judul")?.trim();
  const subjudul = formData.get("subjudul")?.trim() || formData.get("teks")?.trim() || null;
  const deskripsi = formData.get("deskripsi")?.trim() || subjudul || null;
  const badge = formData.get("badge")?.trim() || formData.get("tag")?.trim() || "PROMO SPESIAL";
  const tombol_teks = formData.get("tombol_teks")?.trim() || formData.get("cta")?.trim() || "Lihat Promo";
  const link_url = formData.get("link_url")?.trim() || formData.get("tautan")?.trim() || "/#katalog-utama";
  const foto_url = formData.get("foto_url")?.trim() || formData.get("gambar_url")?.trim() || formData.get("gambar")?.trim() || null;

  const sbServer = buatClientServer();
  await sbServer.from("banner").update({
    judul, subjudul, deskripsi, badge, tombol_teks, link_url, foto_url,
  }).eq("id", Number(id));

  await catatLogAktivitas("Ubah Banner", `Mengubah banner #${id} (${judul})`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { sukses: "Banner diperbarui." };
}

// US-42: Toggle status aktif banner
export async function toggleStatusBannerAdmin(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const id = formData.get("id");
  const aktif = formData.get("aktif") === "true";
  const sbServer = buatClientServer();
  await sbServer.from("banner").update({ aktif }).eq("id", Number(id));
  await catatLogAktivitas("Ubah Status Banner", `Banner #${id} diubah aktif=${aktif}`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
}

// US-42: Hapus banner promo
export async function hapusBannerAdmin(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const id = formData.get("id");
  const sbServer = buatClientServer();
  await sbServer.from("banner").delete().eq("id", Number(id));
  await catatLogAktivitas("Hapus Banner", `Menghapus banner #${id}`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
}
