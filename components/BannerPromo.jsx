"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toko } from "@/lib/toko";

const PROMO_DEFAULT = [
  {
    id: 1,
    tag: "PROMO SPESIAL",
    judul: "Diskon 20% Aneka Kopi Robusta & Arabika",
    subjudul: "Biji kopi pilihan sangrai nusantara, siap dipesan langsung dan diantar segar.",
    cta: "Pesan via WhatsApp",
    tautan: `https://wa.me/${toko.nomorWhatsApp}?text=Halo%20${encodeURIComponent(toko.nama)}%2C%20saya%20tertarik%20dengan%20promo%20kopi.`,
  },
  {
    id: 2,
    tag: "MENU BARU",
    judul: "Es Kopi Susu Aren Gula Melaka",
    subjudul: "Perpaduan espresso mantap, susu creamy, dan manis legit gula aren murni.",
    cta: "Lihat Menu Minuman",
    tautan: "/?kategori=Minuman",
  },
];

export default function BannerPromo({ slides = [] }) {
  const activeSlides = (Array.isArray(slides) && slides.length > 0)
    ? slides.filter((s) => s.aktif !== false)
    : PROMO_DEFAULT;

  const [indeks, setIndeks] = useState(0);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setIndeks((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  if (activeSlides.length === 0) return null;
  const slide = activeSlides[indeks] || activeSlides[0];
  const isExternal = slide.tautan?.startsWith("http");

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-garis bg-gradient-to-r from-emerald-950 via-utama-gelap to-utama p-6 sm:p-10 text-white shadow-sm">
      <div className="max-w-xl">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold tracking-wider backdrop-blur-xs">
          {slide.tag || slide.badge || "PROMO"}
        </span>
        <h3 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl text-white">
          {slide.judul}
        </h3>
        {(slide.subjudul || slide.deskripsi) && (
          <p className="mt-2 text-sm text-white/85 sm:text-base leading-relaxed">
            {slide.subjudul || slide.deskripsi}
          </p>
        )}
        <div className="mt-5">
          {isExternal ? (
            <a
              href={slide.tautan}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-utama hover:bg-neutral-100 transition shadow-sm"
            >
              {slide.cta || "Lihat Promo"} →
            </a>
          ) : (
            <Link
              href={slide.tautan || "/"}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-utama hover:bg-neutral-100 transition shadow-sm"
            >
              {slide.cta || "Lihat Promo"} →
            </Link>
          )}
        </div>
      </div>

      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndeks(i)}
              className={`h-2 rounded-full transition-all ${
                i === indeks ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Pindah ke banner promo ke-${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
