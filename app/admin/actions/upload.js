"use server";

import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { toko } from "@/lib/toko";

export async function unggahFotoLangsung(formData) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return { error: "Sesi login berakhir." };

  const file = formData.get ? (formData.get("file") || formData.get("file_gambar")) : formData;
  if (!file || typeof file !== "object" || file.size === 0) return { error: "File foto tidak ditemukan." };
  if (file.size > 5 * 1024 * 1024) return { error: "Ukuran foto maksimal 5 MB." };

  const tipeValid = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!tipeValid.includes(file.type)) return { error: "Format foto harus JPG, PNG, WEBP, atau GIF." };

  const sbServer = buatClientServer();
  const ext = file.name?.split(".").pop() || "jpg";
  const namaFile = `produk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error } = await sbServer.storage.from("image").upload(namaFile, buf, { contentType: file.type || "image/jpeg", upsert: true });
  if (error) return { error: "Gagal mengunggah foto." };

  const { data: { publicUrl } } = sbServer.storage.from("image").getPublicUrl(namaFile);
  return { sukses: true, url: publicUrl };
}

export async function buatDeskripsiAI(arg1, arg2) {
  const sbSesi = await buatClientSesi();
  const { data: { user } } = await sbSesi.auth.getUser();
  if (!user) return { error: "Sesi login berakhir." };

  let nama = typeof arg1 === "object" ? arg1?.nama : arg1;
  let kategori = typeof arg1 === "object" ? arg1?.kategori : (arg2 || "");
  nama = (nama || "").trim();
  if (!nama) return { error: "Nama produk harus diisi." };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { deskripsi: `${nama} adalah racikan ${kategori || "spesial"} khas ${toko.nama} dengan bahan pilihan dan cita rasa istimewa.` };

  const prompt = `Buatkan deskripsi produk singkat (2 kalimat) tanpa emoji untuk "${toko.nama}". Menu: ${nama}, Kategori: ${kategori}. Bahasa Indonesia.`;
  try {
    const ctrl = new AbortController(), tm = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });
    clearTimeout(tm);
    const j = await res.json();
    const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (txt) return { deskripsi: txt.replace(/[*#_~`]/g, "").trim() };
  } catch {}

  return { deskripsi: `${nama} merupakan menu andalan ${toko.nama} dengan cita rasa nikmat dan aroma segar yang pas dinikmati kapan saja.` };
}
