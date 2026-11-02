"use client";

import { useState } from "react";

export default function KotakTanyaProdukAI({ produk }) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [error, setError] = useState("");

  const saranTanya = [`Rasa & aroma ${produk?.nama} seperti apa?`, `Cocok dipasangkan dengan makanan apa?`];

  async function handleKirim(teksTanya) {
    const q = (teksTanya || pertanyaan).trim();
    if (!q || memuat) return;
    setMemuat(true); setError(""); setJawaban("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: `Pertanyaan tentang "${produk.nama}": ${q}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      setJawaban((data.jawaban || "").replace(/\[REKOMENDASI:.*?\]/g, "").trim());
      setPertanyaan("");
    } catch {
      setError("Terjadi kesalahan, silakan coba lagi.");
    } finally { setMemuat(false); }
  }

  return (
    <div className="mt-8 rounded-2xl border border-utama/30 bg-permukaan/60 p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-utama shrink-0">
          <path d="M12 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.166 5.106a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061L6.165 6.167a.75.75 0 0 1 0-1.06ZM17.834 5.106a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM2.25 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75ZM19.5 11.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5ZM5.25 14.25A3.75 3.75 0 0 1 9 10.5h6a3.75 3.75 0 0 1 3.75 3.75v1.5a3.75 3.75 0 0 1-3.75 3.75H9a3.75 3.75 0 0 1-3.75-3.75v-1.5Z" />
        </svg>
        <div>
          <h3 className="text-sm font-bold text-teks">Tanya Barista AI tentang {produk.nama}</h3>
          <p className="text-xs text-teks-lembut">Tanyakan rasa, tingkat manis, atau rekomendasi camilan pendamping.</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {saranTanya.map((s, idx) => (
          <button key={idx} type="button" onClick={() => { setPertanyaan(s); handleKirim(s); }} disabled={memuat} className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-[11px] font-semibold text-teks hover:border-utama cursor-pointer">
            &quot;{s}&quot;
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleKirim(); }} className="mt-3 flex gap-2">
        <input type="text" value={pertanyaan} onChange={(e) => setPertanyaan(e.target.value)} maxLength={300} placeholder={`Tanya seputar ${produk.nama}…`} disabled={memuat} className="flex-1 rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs text-teks focus:border-utama focus:outline-none" />
        <button type="submit" disabled={memuat || !pertanyaan.trim()} className="rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap disabled:opacity-40 cursor-pointer">
          {memuat ? "…" : "Tanya AI"}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {jawaban && (
        <div className="mt-3 rounded-xl border border-utama/20 bg-utama/5 p-3 text-xs text-teks leading-relaxed">
          <p className="font-bold text-utama mb-0.5">Barista Virtual:</p>
          <p className="whitespace-pre-line">{jawaban}</p>
        </div>
      )}
    </div>
  );
}
