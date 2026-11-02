"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";

const SUGGESTIONS = ["Rekomendasi kopi manis", "Menu kopi yang segar dingin", "Camilan yang cocok"];

export default function WidgetChatAI() {
  const [buka, setBuka] = useState(false);
  const [pesan, setPesan] = useState("");
  const [riwayat, setRiwayat] = useState([{ sender: "bot", text: "Halo! Saya Barista Virtual Nuran Coffee. Ada rasa kopi atau camilan yang sedang kamu cari hari ini?" }]);
  const [memuat, setMemuat] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [riwayat, memuat]);

  async function kirim(input) {
    const q = (input || pesan).trim();
    if (!q || memuat) return;
    setPesan("");
    setRiwayat((p) => [...p, { sender: "user", text: q }]);
    setMemuat(true);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pesan: q, riwayat }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      setRiwayat((p) => [...p, { sender: "bot", text: (data.jawaban || "").replace(/\[REKOMENDASI:.*?\]/g, "").trim(), rekomendasi: data.produkRekomendasi || [] }]);
    } catch {
      setRiwayat((p) => [...p, { sender: "bot", text: "Maaf, terjadi gangguan. Silakan hubungi kami via WhatsApp untuk rekomendasi menu." }]);
    } finally { setMemuat(false); }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!buka ? (
        <button type="button" onClick={() => setBuka(true)} className="flex items-center gap-2 rounded-full bg-utama px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-utama-gelap cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
            <path d="M12 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.166 5.106a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061L6.165 6.167a.75.75 0 0 1 0-1.06ZM17.834 5.106a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM2.25 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75ZM19.5 11.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5ZM5.25 14.25A3.75 3.75 0 0 1 9 10.5h6a3.75 3.75 0 0 1 3.75 3.75v1.5a3.75 3.75 0 0 1-3.75 3.75H9a3.75 3.75 0 0 1-3.75-3.75v-1.5Z" />
          </svg>
          <span>Tanya Barista AI</span>
        </button>
      ) : (
        <div className="flex h-[420px] w-[310px] sm:w-[350px] flex-col rounded-3xl border border-garis bg-permukaan shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-garis bg-utama px-3.5 py-2.5 text-white">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              <span className="font-bold text-xs">Barista AI Nuran</span>
            </div>
            <button type="button" onClick={() => setBuka(false)} className="text-white/80 hover:text-white text-xs cursor-pointer">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 text-xs">
            {riwayat.map((r, i) => (
              <div key={i} className={`flex flex-col gap-1 max-w-[85%] ${r.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
                <div className={`rounded-2xl px-3 py-1.5 leading-relaxed ${r.sender === "user" ? "bg-utama text-white rounded-br-xs" : "bg-latar border border-garis text-teks rounded-bl-xs"}`}>
                  {r.text}
                </div>
                {Array.isArray(r.rekomendasi) && r.rekomendasi.length > 0 && (
                  <div className="flex flex-col gap-1 w-full mt-0.5">
                    {r.rekomendasi.map((p) => (
                      <Link key={p.id} href={`/produk/${p.id}`} className="flex items-center gap-2 rounded-xl border border-garis bg-latar p-1.5 hover:border-utama transition">
                        <img src={ambilFotoUtama(p)} alt={p.nama} className="h-8 w-8 rounded-lg object-cover bg-permukaan shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-[11px] text-teks">{p.nama}</p>
                          <p className="text-[10px] text-utama font-bold">{formatRupiah(p.harga)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {memuat && <div className="self-start rounded-2xl bg-latar border border-garis px-2.5 py-1 text-[11px] text-teks-lembut">Barista sedang mengetik…</div>}
            <div ref={endRef} />
          </div>
          <div className="border-t border-garis p-2 bg-latar">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {SUGGESTIONS.map((s, idx) => (
                <button key={idx} type="button" onClick={() => kirim(s)} className="rounded-full border border-garis bg-permukaan px-2 py-0.5 text-[9px] text-teks-lembut hover:border-utama shrink-0 cursor-pointer">{s}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); kirim(); }} className="flex gap-1.5 pt-1">
              <input type="text" value={pesan} onChange={(e) => setPesan(e.target.value)} placeholder="Tanya rekomendasi kopi…" maxLength={500} className="flex-1 rounded-xl border border-garis bg-permukaan px-2.5 py-1 text-xs text-teks focus:border-utama focus:outline-none" />
              <button type="submit" disabled={memuat || !pesan.trim()} className="rounded-xl bg-utama px-3 py-1 text-xs font-bold text-white hover:bg-utama-gelap disabled:opacity-40 cursor-pointer">Kirim</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
