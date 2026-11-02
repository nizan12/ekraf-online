"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toko as defaultToko } from "@/lib/toko";

function TombolToggleTema() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function handleToggleTema() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      type="button" onClick={handleToggleTema} suppressHydrationWarning
      className="flex h-8 w-8 items-center justify-center rounded-xl border border-garis bg-permukaan text-teks hover:border-utama cursor-pointer"
      aria-label="Tombol toggle terang/gelap" title="Tombol toggle terang/gelap"
    >
      <span className="text-xs">{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}

export default function Header({ toko = null, namaToko = null }) {
  const displayNama = toko?.nama || namaToko || defaultToko.nama;

  return (
    <header className="border-b border-garis bg-latar sticky top-0 z-40 backdrop-blur-md bg-latar/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">{displayNama}</Link>
        <nav className="flex items-center gap-2.5 sm:gap-4 text-xs sm:text-sm font-medium">
          <Link href="/" className="text-teks hover:text-utama hidden xs:inline">Katalog</Link>
          <Link href="/favorit" className="text-teks hover:text-utama">Favorit</Link>
          <Link href="/keranjang" className="text-teks hover:text-utama">Keranjang</Link>
          <Link href="/tentang" className="text-teks hover:text-utama">Tentang</Link>
          <TombolToggleTema />
        </nav>
      </div>
    </header>
  );
}
