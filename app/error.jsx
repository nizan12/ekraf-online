"use client";

import Link from "next/link";

export default function Error({ reset }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center py-12">
      <h1 className="text-xl font-bold text-teks">Terjadi Kendala Sistem</h1>
      <p className="mt-2 text-xs text-teks-lembut max-w-sm">Maaf, layanan sedang mengalami gangguan sementara. Silakan coba kembali.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => reset()} className="rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap cursor-pointer">
          Coba Lagi
        </button>
        <Link href="/" className="rounded-xl border border-garis bg-permukaan px-4 py-2 text-xs font-semibold text-teks hover:border-utama">
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
