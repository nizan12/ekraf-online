"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { simpanPengaturanAdmin, catatLogAktivitas } from "@/lib/pengaturanAdmin";

export async function imporProdukCSV(prevState, formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const file = formData.get("file_csv") || formData.get("file");
  if (!file || typeof file !== "object" || file.size === 0) return { error: "Pilih file CSV terlebih dahulu." };

  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) return { error: "File CSV kosong atau hanya header." };

    const dataBaris = lines.slice(1);
    let totalBerhasil = 0, totalGagal = 0;
    const barisGagal = [], rowsToInsert = [];

    dataBaris.forEach((line, index) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const [nama, hargaStr, , deskripsi, foto_url] = cols;
      const harga = parseInt(hargaStr, 10);
      if (!nama || nama.length < 3 || isNaN(harga) || harga < 100) {
        totalGagal += 1;
        barisGagal.push(index + 2);
        return;
      }
      totalBerhasil += 1;
      rowsToInsert.push({ nama, harga, deskripsi: deskripsi || "", foto_url: foto_url || "/images/placeholder.svg", stok: 10, urutan: 99 });
    });

    if (totalBerhasil > 0) {
      const sbServer = buatClientServer();
      await sbServer.from("produk").insert(rowsToInsert);
      await catatLogAktivitas("Impor CSV", `Berhasil mengimpor ${totalBerhasil} produk.`);
      revalidatePath("/admin"); revalidatePath("/");
    }

    return {
      sukses: `Berhasil ${totalBerhasil} produk, Gagal ${totalGagal} baris${totalGagal > 0 ? ` (Baris: ${barisGagal.join(", ")})` : ""}.`,
      ringkasan: { berhasil: totalBerhasil, gagal: totalGagal, barisGagal },
    };
  } catch {
    return { error: "Gagal memproses file CSV." };
  }
}

export async function kosongkanLogAktivitas() {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");
  try {
    const sb = buatClientServer();
    await sb.from("log_aktivitas").delete().neq("id", 0);
  } catch {}
  await simpanPengaturanAdmin({ auditLog: [] });
  revalidatePath("/admin/aktivitas");
}
