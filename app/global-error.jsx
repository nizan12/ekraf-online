"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center text-center p-4 bg-latar text-teks font-sans">
        <h1 className="text-2xl font-bold">Terjadi Kendala Sistem</h1>
        <p className="mt-2 text-xs text-teks-lembut max-w-sm">Maaf, sistem mengalami kesalahan kritis. Silakan coba kembali.</p>
        <button type="button" onClick={() => reset()} className="mt-6 rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap cursor-pointer">
          Coba Lagi
        </button>
      </body>
    </html>
  );
}
