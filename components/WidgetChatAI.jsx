"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";

const SUGGESTIONS = [
  "Rekomendasi kopi manis dan legit",
  "Menu kopi yang segar dingin",
  "Camilan apa yang cocok sama kopi?",
];

export default function WidgetChatAI() {
  const [buka, setBuka] = useState(false);
  const [pesan, setPesan] = useState("");
  const [riwayat, setRiwayat] = useState([
    {
      sender: "bot",
      text: "Halo! Saya Barista Virtual Nuran Coffee. Ada rasa kopi atau camilan yang sedang kamu cari hari ini?",
    },
  ]);
  const [memuat, setMemuat] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [riwayat, memuat]);

  async function kirim(input) {
    const q = (input || pesan).trim();
    if (!q || memuat) return;
    setPesan("");
    setRiwayat((prev) => [...prev, { sender: "user", text: q }]);
    setMemuat(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: q, riwayat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghubungi AI");
      setRiwayat((prev) => [
        ...prev,
        {
          sender: "bot",
          text: (data.jawaban || "").replace(/\[REKOMENDASI:.*?\]/g, "").trim(),
          rekomendasi: data.produkRekomendasi || [],
        },
      ]);
    } catch {
      setRiwayat((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Maaf, terjadi gangguan jaringan. Silakan hubungi kami langsung via WhatsApp untuk rekomendasi menu.",
        },
      ]);
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!buka && (
        <button
          type="button"
          onClick={() => setBuka(true)}
          className="flex items-center gap-2 rounded-full bg-utama px-4 py-3 text-xs font-bold text-white shadow-lg hover:bg-utama-gelap transition cursor-pointer"
        >
          <span>☕</span>
          <span>Tanya Barista AI</span>
        </button>
      )}

      {buka && (
        <div className="flex h-[450px] w-[320px] sm:w-[360px] flex-col rounded-3xl border border-garis bg-permukaan shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-garis bg-utama px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-base">☕</span>
              <span className="font-bold text-xs sm:text-sm">Barista AI Nuran</span>
            </div>
            <button
              type="button"
              onClick={() => setBuka(false)}
              className="text-white/80 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 text-xs">
            {riwayat.map((r, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1.5 max-w-[85%] ${
                  r.sender === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2 leading-relaxed ${
                    r.sender === "user"
                      ? "bg-utama text-white rounded-br-xs"
                      : "bg-latar border border-garis text-teks rounded-bl-xs"
                  }`}
                >
                  {r.text}
                </div>
                {Array.isArray(r.rekomendasi) && r.rekomendasi.length > 0 && (
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    {r.rekomendasi.map((p) => (
                      <Link
                        key={p.id}
                        href={`/produk/${p.id}`}
                        className="flex items-center gap-2 rounded-xl border border-garis bg-latar p-1.5 hover:border-utama transition"
                      >
                        <img
                          src={ambilFotoUtama(p)}
                          alt={p.nama}
                          className="h-9 w-9 rounded-lg object-cover bg-permukaan shrink-0"
                        />
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
            {memuat && (
              <div className="self-start rounded-2xl bg-latar border border-garis px-3 py-1.5 text-xs text-teks-lembut">
                Barista sedang mengetik…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-garis p-2 bg-latar">
            <div className="flex gap-1 overflow-x-auto pb-1.5">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => kirim(s)}
                  className="rounded-full border border-garis bg-permukaan px-2.5 py-0.5 text-[10px] text-teks-lembut hover:border-utama shrink-0 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                kirim();
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Tanya rekomendasi kopi…"
                maxLength={500}
                className="flex-1 rounded-xl border border-garis bg-permukaan px-3 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
              />
              <button
                type="submit"
                disabled={memuat || !pesan.trim()}
                className="rounded-xl bg-utama px-3 py-1.5 text-xs font-bold text-white hover:bg-utama-gelap disabled:opacity-40 cursor-pointer"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
