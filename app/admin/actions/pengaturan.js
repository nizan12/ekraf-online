"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { simpanPengaturanAdmin, catatLogAktivitas } from "@/lib/pengaturanAdmin";

export async function simpanPengaturanToko(prevState, formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const nama = formData.get("nama")?.trim();
  const nomorWhatsApp = formData.get("nomorWhatsApp")?.trim();
  const alamat = formData.get("alamat")?.trim();
  const jamBuka = formData.get("jamBuka")?.trim();
  const tagline = formData.get("tagline")?.trim() || "";

  if (!nama || nama.length < 2) return { error: "Nama toko minimal 2 karakter." };
  if (!nomorWhatsApp || !/^\d{9,16}$/.test(nomorWhatsApp.replace(/[^0-9]/g, ""))) {
    return { error: "Nomor WhatsApp wajib berupa angka valid." };
  }
  if (!alamat || alamat.length < 5) return { error: "Alamat minimal 5 karakter." };
  if (!jamBuka) return { error: "Jam buka wajib diisi." };

  const cleanWA = nomorWhatsApp.replace(/[^0-9]/g, "");
  const sbServer = buatClientServer();
  try {
    await sbServer.from("pengaturan_toko").upsert({ id: 1, nama, nomor_whatsapp: cleanWA, alamat, jam_buka: jamBuka, tagline });
  } catch {}

  await simpanPengaturanAdmin({ tokoInfo: { nama, nomorWhatsApp: cleanWA, alamat, jamBuka, tagline } });
  await catatLogAktivitas("Ubah Pengaturan Toko", `${nama} (${cleanWA})`);
  revalidatePath("/");
  revalidatePath("/tentang");
  revalidatePath("/admin/pengaturan");
  return { sukses: "Pengaturan profil toko berhasil diperbarui!" };
}

export async function tambahAdmin(prevState, formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const email = formData.get("email")?.trim();
  const password = formData.get("password")?.trim();
  if (!email?.includes("@")) return { error: "Email tidak valid." };
  if (!password || password.length < 8) return { error: "Password minimal 8 karakter." };

  try {
    const sbServer = buatClientServer();
    const { error } = await sbServer.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) return { error: "Gagal membuat akun admin." };
    await catatLogAktivitas("Tambah Admin", email);
    revalidatePath("/admin/pengguna");
    return { sukses: `Akun admin ${email} berhasil dibuat!` };
  } catch {
    return { error: "Terjadi kesalahan saat membuat akun admin." };
  }
}

export async function hapusAdmin(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user: cur } } = await sbSesi.auth.getUser();
  if (!cur) redirect("/admin/login");

  const id = formData.get("id");
  if (!id || id === cur.id) return;
  try {
    const sbServer = buatClientServer();
    await sbServer.auth.admin.deleteUser(id);
    await catatLogAktivitas("Hapus Admin", `User #${id}`);
    revalidatePath("/admin/pengguna");
  } catch {}
}
