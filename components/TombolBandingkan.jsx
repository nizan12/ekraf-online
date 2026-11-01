"use client";

import { useEffect, useState } from "react";
import { isBandingkan, toggleBandingkan } from "@/lib/pembanding";

export default function TombolBandingkan({ produk, className = "", ikonOnly = false }) {
  const [aktif, setAktif] = useState(false);

  useEffect(() => {
    setAktif(isBandingkan(produk.id));

    function handleUpdate() {
      setAktif(isBandingkan(produk.id));
    }

    window.addEventListener("bandingkan-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("bandingkan-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [produk.id]);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    setAktif(toggleBandingkan(produk));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-xl border border-garis bg-permukaan p-2 text-xs font-semibold hover:border-utama hover:text-utama transition cursor-pointer ${
        aktif ? "border-utama text-utama bg-utama/10" : "text-teks-lembut"
      } ${className}`}
      aria-label={aktif ? "Keluarkan dari perbandingan" : "Bandingkan produk ini"}
      title={aktif ? "Terpilih di perbandingan" : "Bandingkan"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path fillRule="evenodd" d="M1 4.75C1 3.784 1.784 3 2.75 3h14.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 17.25 17H2.75A1.75 1.75 0 0 1 1 15.25V4.75ZM2.75 4.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h6.5v-11h-6.5Zm8 0v11h6.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25h-6.5Z" clipRule="evenodd" />
      </svg>
      {!ikonOnly && <span className="ml-1">{aktif ? "Terpilih" : "Bandingkan"}</span>}
    </button>
  );
}
