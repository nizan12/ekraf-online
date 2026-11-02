import { ambilFotoUtama } from "@/lib/format";

const KEY = "nuran_keranjang_v1";

export function ambilKeranjang() {
  if (typeof window === "undefined") return [];
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) : [];
  } catch { return []; }
}

export function simpanKeranjang(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("keranjang-updated", { detail: items }));
  } catch {}
}

export function tambahKeKeranjang(p, qty = 1) {
  const items = ambilKeranjang();
  const max = p.stok !== undefined && p.stok !== null ? Number(p.stok) : 999;
  const idx = items.findIndex((i) => i.id === p.id);
  if (idx >= 0) {
    const s = items[idx].stok ?? max;
    items[idx].jumlah = Math.min(items[idx].jumlah + qty, s);
    items[idx].stok = s;
  } else {
    items.push({ id: p.id, nama: p.nama, harga: Number(p.harga) || 0, image: ambilFotoUtama(p), jumlah: Math.min(qty, max), stok: max });
  }
  simpanKeranjang(items);
}

export function ubahJumlahItem(id, qty) {
  let items = ambilKeranjang();
  if (qty <= 0) items = items.filter((i) => i.id !== id);
  else items = items.map((i) => i.id === id ? { ...i, jumlah: Math.min(qty, i.stok ?? 999) } : i);
  simpanKeranjang(items);
}

export const perbaruiJumlah = ubahJumlahItem;

export function hapusDariKeranjang(id) {
  simpanKeranjang(ambilKeranjang().filter((i) => i.id !== id));
}

export function kosongkanKeranjang() {
  simpanKeranjang([]);
}
