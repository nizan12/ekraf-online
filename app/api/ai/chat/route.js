import { NextResponse } from "next/server";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { toko } from "@/lib/toko";

const rateLimitMap = new Map();

function periksaRateLimit(ip) {
  const sekarang = Date.now();
  const riwayat = rateLimitMap.get(ip) || [];
  const riwayatAktif = riwayat.filter((waktu) => sekarang - waktu < 60000);
  if (riwayatAktif.length >= 20) return false;
  riwayatAktif.push(sekarang);
  rateLimitMap.set(ip, riwayatAktif);
  return true;
}

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!periksaRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan tanya AI. Silakan tunggu 1 menit lagi." },
        { status: 429 }
      );
    }

    const { pesan, riwayat = [] } = await request.json();

    if (!pesan || !pesan.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }
    if (pesan.length > 500) {
      return NextResponse.json(
        { error: "Pesan terlalu panjang (maksimal 500 karakter)." },
        { status: 400 }
      );
    }

    const supabase = buatClientServer();
    const { data: rawProduk } = await supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)")
      .order("created_at", { ascending: false });

    const config = await ambilPengaturanAdmin();
    const nonaktifIds = config.nonaktifIds || [];
    const daftarNormal = normalisasiDaftarProduk(rawProduk || []);
    const produkAktif = daftarNormal.filter((p) => !nonaktifIds.includes(p.id) && p.aktif !== false);

    const ringkasanMenu = produkAktif
      .map((p) => `- ID #${p.id}: ${p.nama} (${p.kategori || "Umum"}) - Rp ${Number(p.harga).toLocaleString("id-ID")}. ${p.deskripsi || ""}`)
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        jawaban: `Halo! Selamat datang di ${toko.nama}. Kami menyediakan aneka pilihan kopi dan pastry segar. Ada menu favorit yang sedang kamu cari?`,
        produkRekomendasi: produkAktif.slice(0, 2),
      });
    }

    const systemPrompt = `Kamu adalah Barista Virtual kedai "${toko.nama}".
Jam Buka: ${toko.jamBuka}, Alamat: ${toko.alamat}, WA: ${toko.nomorWhatsApp}.
Menu:
${ringkasanMenu}
Aturan:
1. Hanya jawab topik seputar menu dan kedai kami. Tolak santun pertanyaan umum lainnya.
2. Jawab ramah dan santun bahasa Indonesia (maks 2 paragraf).
3. JANGAN PERNAH MENGGUNAKAN EMOJI APAPUN.
4. Cantumkan [REKOMENDASI: id1, id2] di baris terakhir jika ada produk yang disarankan.`;

    const contents = [{ role: "user", parts: [{ text: pesan.trim() }] }];
    const models = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-flash-latest"];
    let jawaban = "";

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents,
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            jawaban = text
              .replace(/[\p{Extended_Pictographic}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
              .trim();
            break;
          }
        }
      } catch {}
    }

    let produkRekomendasi = [];
    const tagMatch = jawaban.match(/\[REKOMENDASI:\s*([0-9,\s]+)\]/i);
    if (tagMatch) {
      const ids = tagMatch[1].split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
      produkRekomendasi = ids.map((id) => produkAktif.find((p) => p.id === id)).filter(Boolean);
      jawaban = jawaban.replace(tagMatch[0], "").trim();
    }

    if (!jawaban) {
      const kopi = produkAktif[0];
      jawaban = `Untuk pilihan kopi terbaik hari ini, kami merekomendasikan ${kopi?.nama || "Kopi Spesial Nuran"}. Silakan tanyakan jika ingin tahu varian rasa lainnya!`;
      produkRekomendasi = [kopi].filter(Boolean);
    }

    return NextResponse.json({ jawaban, produkRekomendasi });
  } catch {
    return NextResponse.json({ error: "Gagal memproses pesan AI." }, { status: 500 });
  }
}
