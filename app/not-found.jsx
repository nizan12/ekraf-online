import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center py-12">
      <span className="text-4xl font-extrabold text-utama">404</span>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-teks">Halaman Tidak Ditemukan</h1>
      <p className="mt-2 text-xs text-teks-lembut max-w-sm">Halaman yang Anda tuju mungkin sudah dipindahkan atau dinonaktifkan.</p>
      <Link href="/" className="mt-6 rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap transition">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
