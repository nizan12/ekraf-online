"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import {
  tambahUlasanProduk,
  ubahStatusUlasan,
  hapusUlasanAdmin,
  catatLogAktivitas,
} from "@/lib/pengaturanAdmin";

/**
 * US-38: Kirim ulasan dan rating pembeli (dengan honeypot anti-spam)
 */
export async function kirimUlasanAction(prevState, formData) {
  const website = formData.get("website");
  if (website) {
    return { error: "Spam bot terdeteksi." };
  }

  const produkId = formData.get("produkId");
  const nama = formData.get("nama")?.trim();
  const rating = parseInt(formData.get("rating") || "5", 10);
  const komentar = formData.get("komentar")?.trim();

  if (!produkId) return { error: "ID produk tidak valid." };
  if (!nama || nama.length < 2 || nama.length > 60) {
    return { error: "Nama pengulas wajib diisi (2–60 karakter)." };
  }
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating harus berupa angka bintang 1 sampai 5." };
  }
  if (!komentar || komentar.length < 3 || komentar.length > 500) {
    return { error: "Komentar ulasan wajib diisi (3–500 karakter)." };
  }

  await tambahUlasanProduk({ produkId, nama, rating, komentar });

  revalidatePath(`/produk/${produkId}`);
  revalidatePath("/admin/ulasan");
  return {
    sukses: "Terima kasih! Ulasan dan rating Anda berhasil dikirim.",
  };
}

/**
 * US-39: Moderasi ulasan di admin (setujui / sembunyikan dari publik)
 */
export async function moderasiUlasanAction(formData) {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const id = formData.get("id");
  const statusBaru = formData.get("status"); // "disetujui" atau "sembunyi"
  if (!id || !statusBaru) return;

  const disetujui = statusBaru === "disetujui" || statusBaru === "true";
  const supabaseServer = buatClientServer();
  try {
    await supabaseServer
      .from("ulasan")
      .update({ disetujui })
      .eq("id", Number(id));
  } catch {}

  await ubahStatusUlasan(String(id), disetujui ? "disetujui" : "sembunyi");
  await catatLogAktivitas(
    "Moderasi Ulasan",
    `Ulasan ID #${id} diubah menjadi ${disetujui ? "Disetujui" : "Disembunyikan"}`
  );
  revalidatePath("/admin/ulasan");
  revalidatePath("/");
}

/**
 * US-39: Hapus ulasan permanen di admin
 */
export async function hapusUlasanAction(formData) {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const id = formData.get("id");
  if (!id) return;

  const supabaseServer = buatClientServer();
  try {
    await supabaseServer.from("ulasan").delete().eq("id", Number(id));
  } catch {}

  await hapusUlasanAdmin(String(id));
  await catatLogAktivitas("Hapus Ulasan", `Menghapus ulasan ID #${id}`);
  revalidatePath("/admin/ulasan");
  revalidatePath("/");
}
