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
      type="button"
      onClick={handleToggleTema}
      suppressHydrationWarning
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-garis bg-permukaan text-teks transition-all hover:border-utama hover:text-utama cursor-pointer"
      aria-label="Tombol toggle terang/gelap"
      title="Tombol toggle terang/gelap"
    >
      <span className="sr-only">Tombol toggle terang/gelap</span>
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-400">
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-teks-lembut">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

export default function Header({ toko = null, namaToko = null }) {
  const displayNama = toko?.nama || namaToko || defaultToko.nama;

  return (
    <header className="border-b border-garis bg-latar sticky top-0 z-40 backdrop-blur-md bg-latar/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {displayNama}
        </Link>
        <nav className="flex items-center gap-2.5 sm:gap-4 text-sm font-medium">
          <Link href="/" className="text-teks hover:text-utama hidden xs:inline">
            Katalog
          </Link>
          <Link href="/favorit" className="text-teks-lembut hover:text-utama">
            Favorit
          </Link>
          <Link href="/keranjang" className="text-teks-lembut hover:text-utama">
            Keranjang
          </Link>
          <Link href="/bandingkan" className="text-teks-lembut hover:text-utama hidden sm:inline">
            Bandingkan
          </Link>
          <Link href="/tentang" className="text-teks-lembut hover:text-utama hidden sm:inline">
            Tentang Toko
          </Link>
          <TombolToggleTema />
        </nav>
      </div>
    </header>
  );
}
