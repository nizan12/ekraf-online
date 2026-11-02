"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { tambahUlasanProduk, ubahStatusUlasan, hapusUlasanAdmin, catatLogAktivitas } from "@/lib/pengaturanAdmin";

export async function kirimUlasanAction(prevState, formData) {
  if (formData.get("website")) return { error: "Spam bot terdeteksi." };
  const produkId = formData.get("produkId"), nama = formData.get("nama")?.trim(), rating = parseInt(formData.get("rating") || "5", 10), komentar = formData.get("komentar")?.trim();
  if (!produkId) return { error: "ID produk tidak valid." };
  if (!nama || nama.length < 2 || nama.length > 60) return { error: "Nama pengulas wajib diisi (2–60 karakter)." };
  if (isNaN(rating) || rating < 1 || rating > 5) return { error: "Rating harus berupa angka bintang 1 sampai 5." };
  if (!komentar || komentar.length < 3 || komentar.length > 500) return { error: "Komentar ulasan wajib diisi (3–500 karakter)." };

  await tambahUlasanProduk({ produkId, nama, rating, komentar });
  revalidatePath(`/produk/${produkId}`); revalidatePath("/admin/ulasan");
  return { sukses: "Terima kasih! Ulasan dan rating Anda berhasil dikirim." };
}

export async function moderasiUlasanAction(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const id = formData.get("id") || formData.get("ulasanId"), aksi = formData.get("aksi") || formData.get("status");
  if (!id) return;

  const sb = buatClientServer();
  if (aksi === "hapus") {
    try { await sb.from("ulasan").delete().eq("id", Number(id)); } catch {}
    await hapusUlasanAdmin(String(id));
    await catatLogAktivitas("Hapus Ulasan", `Menghapus ulasan ID #${id}`);
    revalidatePath("/admin/ulasan"); revalidatePath("/");
    return;
  }

  const disetujui = aksi === "disetujui" || aksi === "tampilkan" || aksi === "true" || aksi === true;
  try { await sb.from("ulasan").update({ disetujui }).eq("id", Number(id)); } catch {}
  await ubahStatusUlasan(String(id), disetujui ? "disetujui" : "sembunyi");
  await catatLogAktivitas("Moderasi Ulasan", `Ulasan ID #${id} diubah menjadi ${disetujui ? "Disetujui" : "Disembunyikan"}`);
  revalidatePath("/admin/ulasan"); revalidatePath("/");
}

export async function hapusUlasanAction(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");
  const id = formData.get("id") || formData.get("ulasanId");
  if (!id) return;
  const sb = buatClientServer();
  try { await sb.from("ulasan").delete().eq("id", Number(id)); } catch {}
  await hapusUlasanAdmin(String(id));
  await catatLogAktivitas("Hapus Ulasan", `Menghapus ulasan ID #${id}`);
  revalidatePath("/admin/ulasan"); revalidatePath("/");
}
