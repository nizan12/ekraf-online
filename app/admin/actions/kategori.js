"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { ambilPengaturanAdmin, simpanPengaturanAdmin, catatLogAktivitas } from "@/lib/pengaturanAdmin";

export async function tambahKategoriAdmin(arg1, arg2) {
  const formData = arg2 && typeof arg2.get === "function" ? arg2 : arg1;
  if (!formData) return { error: "Form data tidak valid." };

  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const nama = formData.get("nama")?.trim();
  if (!nama || nama.length < 2) return { error: "Nama minimal 2 karakter." };

  const slug = nama.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const sbServer = buatClientServer();
  await sbServer.from("kategori").insert({ nama, slug, urutan: 1 });

  const conf = await ambilPengaturanAdmin();
  const list = Array.isArray(conf.kategoriList) ? [...conf.kategoriList] : [];
  if (!list.includes(nama)) {
    list.push(nama);
    await simpanPengaturanAdmin({ ...conf, kategoriList: list });
  }

  await catatLogAktivitas("Tambah Kategori", `Menambahkan "${nama}"`);
  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  return { sukses: "Kategori ditambahkan." };
}

export async function ubahKategoriAdmin(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const id = formData.get("id");
  const namaBaru = (formData.get("namaBaru") || formData.get("nama"))?.trim();
  const oldKat = (formData.get("nama_lama") || formData.get("namaLama"))?.trim();
  if (!namaBaru || namaBaru.length < 2) return { error: "Nama minimal 2 karakter." };

  const slug = namaBaru.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const sbServer = buatClientServer();
  if (id) await sbServer.from("kategori").update({ nama: namaBaru, slug }).eq("id", Number(id));
  else if (oldKat) await sbServer.from("kategori").update({ nama: namaBaru, slug }).eq("nama", oldKat);

  const conf = await ambilPengaturanAdmin();
  const list = (conf.kategoriList || []).map((k) => (k === oldKat ? namaBaru : k));
  await simpanPengaturanAdmin({ ...conf, kategoriList: list });

  await catatLogAktivitas("Ubah Kategori", `Mengubah "${oldKat || id}" menjadi "${namaBaru}"`);
  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
  return { sukses: "Kategori diperbarui." };
}

export async function hapusKategoriAdmin(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) redirect("/admin/login");

  const nama = formData.get("nama");
  const id = formData.get("id");
  if (!nama && !id) return;

  const sbServer = buatClientServer();
  const queryCek = id
    ? sbServer.from("produk").select("id", { count: "exact", head: true }).eq("kategori_id", Number(id))
    : sbServer.from("produk").select("id", { count: "exact", head: true }).eq("kategori", nama);

  const { count } = await queryCek;
  if (count && count > 0) {
    return { error: `Kategori sedang digunakan oleh ${count} produk.` };
  }

  if (id) await sbServer.from("kategori").delete().eq("id", Number(id));
  else await sbServer.from("kategori").delete().eq("nama", nama);

  const conf = await ambilPengaturanAdmin();
  const list = (conf.kategoriList || []).filter((k) => k !== nama);
  await simpanPengaturanAdmin({ ...conf, kategoriList: list });

  await catatLogAktivitas("Hapus Kategori", `Menghapus "${nama}"`);
  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
}
