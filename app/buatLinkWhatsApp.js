import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

/**
 * US-03: Pesan via WhatsApp
 * Membuka WhatsApp ke nomor di lib/toko.js dengan pesan otomatis berisi nama dan harga produk.
 */
export function buatLinkWhatsApp(optionsOrNama, hargaProduk) {
  let nomor = toko.nomorWhatsApp;
  let namaProduk = "";
  let hargaTeks = "";
  let pesan = "";

  if (typeof optionsOrNama === "object" && optionsOrNama !== null) {
    nomor = optionsOrNama.nomor || toko.nomorWhatsApp;
    namaProduk = optionsOrNama.namaProduk || optionsOrNama.nama || "";
    const hargaNum = Number(optionsOrNama.harga) || 0;
    const jumlah = optionsOrNama.jumlah || 1;
    const varian = optionsOrNama.varian;
    hargaTeks = formatRupiah(hargaNum);
    const varianTeks = varian && varian !== "Regular" ? `\nVarian: ${varian}` : "";
    const jumlahTeks = jumlah > 1 ? `\nJumlah: ${jumlah}\nTotal: ${formatRupiah(hargaNum * jumlah)}` : "";
    pesan = `Halo ${optionsOrNama.namaToko || toko.nama}, saya ingin memesan:\n\n*${namaProduk}*${varianTeks}\nHarga: ${hargaTeks}${jumlahTeks}\n\nTerima kasih!`;
  } else {
    namaProduk = String(optionsOrNama || "");
    hargaTeks = typeof hargaProduk === "number" ? `Rp ${hargaProduk.toLocaleString("id-ID")}` : String(hargaProduk || "");
    pesan = `Halo, saya ingin memesan:\n\n*${namaProduk}*\nHarga: ${hargaTeks}\n\nTerima kasih!`;
  }

  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export { default as TombolWhatsApp } from "./produk/[id]/TombolWhatsApp";
