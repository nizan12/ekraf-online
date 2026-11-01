"use client";

/**
 * Global Error Handler (US-28 & K-9)
 * Menangkap error level root layout dan menyajikan pesan aman tanpa membocorkan stack trace.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-sans bg-[#FBF9F5] text-[#2C1810]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Terjadi Kendala Sistem</h2>
        <p className="text-sm text-[#6F4E37] mb-6 max-w-md leading-relaxed">
          Sistem mengalami gangguan teknis sementara. Data Anda tetap aman. Silakan muat ulang halaman.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-[#6F4E37] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#5A3E2D] transition shadow-sm cursor-pointer"
        >
          Muat Ulang Halaman
        </button>
      </body>
    </html>
  );
}
