import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TombolInstallPWA from "@/components/TombolInstallPWA";
import WidgetChatAI from "@/components/WidgetChatAI";
import { buatClientServer } from "@/lib/supabase";
import { toko as defaultToko } from "@/lib/toko";

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://nuran-coffee.vercel.app"),
  title: { default: `${defaultToko.nama} - Katalog & Pesan Kopi`, template: `%s | ${defaultToko.nama}` },
  description: defaultToko.tagline,
  openGraph: { title: `${defaultToko.nama} - Katalog & Pesan Kopi`, description: defaultToko.tagline, siteName: defaultToko.nama, locale: "id_ID", type: "website" },
  twitter: { card: "summary_large_image", title: defaultToko.nama, description: defaultToko.tagline },
  appleWebApp: { capable: true, statusBarStyle: "default", title: defaultToko.nama },
  icons: { icon: "/icons/icon-192.svg", apple: "/icons/icon-192.png" },
};

export const viewport = { themeColor: "#1f6b4f" };

export default async function RootLayout({ children }) {
  let toko = defaultToko;
  try {
    const sb = buatClientServer();
    const { data: db } = await sb.from("pengaturan_toko").select("*").limit(1).maybeSingle();
    if (db) {
      toko = { nama: db.nama || defaultToko.nama, nomorWhatsApp: db.nomor_whatsapp || defaultToko.nomorWhatsApp, alamat: db.alamat || defaultToko.alamat, jamBuka: db.jam_buka || defaultToko.jamBuka, tagline: db.tagline || defaultToko.tagline || "", deskripsi: db.deskripsi || "" };
    }
  } catch {}

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script src="/theme-init.js"></script>
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased" suppressHydrationWarning>
        <Header toko={toko} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
        <Footer toko={toko} />
        <WidgetChatAI />
        <TombolInstallPWA />
      </body>
    </html>
  );
}
