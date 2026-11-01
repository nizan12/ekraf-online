"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { catatLogAktivitas } from "@/lib/pengaturanAdmin";

export async function tambahBannerAdmin(arg1, arg2) {
  const formData = arg2 && typeof arg2.get === "function" ? arg2 : arg1;
  if (!formData) return { error: "Data form tidak valid." };

  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const judul = formData.get("judul")?.trim();
  const subjudul = formData.get("subjudul")?.trim() || null;
  const tag = formData.get("tag")?.trim() || "Promo Spesial";
  const cta = formData.get("cta")?.trim() || "Lihat Promo";
  const tautan = formData.get("tautan")?.trim() || "/#katalog-utama";
  const gambar_url = formData.get("gambar_url")?.trim() || null;

  if (!judul || judul.length < 3) return { error: "Judul minimal 3 karakter." };

  const sbServer = buatClientServer();
  await sbServer.from("banner").insert({
    judul, subjudul, tag, cta, tautan, gambar_url, aktif: true, urutan: 1,
  });

  await catatLogAktivitas("Tambah Banner", `Menambahkan banner "${judul}"`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { sukses: "Banner berhasil ditambahkan." };
}

export async function ubahBannerAdmin(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const id = formData.get("id");
  const judul = formData.get("judul")?.trim();
  const subjudul = formData.get("subjudul")?.trim() || null;
  const tautan = formData.get("tautan")?.trim() || "/#katalog-utama";
  const gambar_url = formData.get("gambar_url")?.trim() || null;

  const sbServer = buatClientServer();
  await sbServer.from("banner").update({ judul, subjudul, tautan, gambar_url }).eq("id", Number(id));
  await catatLogAktivitas("Ubah Banner", `Mengubah banner #${id}`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { sukses: "Banner diperbarui." };
}

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
