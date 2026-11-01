"use client";

import Link from "next/link";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";
import { hapusProduk, toggleStatusProduk, geserUrutanProduk } from "@/app/admin/actions";

// US-07, US-19, US-32, US-47: Tabel Pengelolaan Produk Admin
export default function TabelProduk({ produk = [], nonaktifIds = [] }) {
  const nonaktifSet = new Set((nonaktifIds || []).map(String));

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
      <table className="w-full text-left text-xs">
        <thead className="bg-permukaan font-semibold text-teks-lembut border-b border-garis">
          <tr>
            <th className="px-3 py-2.5">Urutan</th>
            <th className="px-3 py-2.5">Menu</th>
            <th className="px-3 py-2.5">Kategori</th>
            <th className="px-3 py-2.5">Harga</th>
            <th className="px-3 py-2.5">Stok</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {produk.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-teks-lembut">
                Belum ada produk.
              </td>
            </tr>
          ) : (
            produk.map((item, idx) => {
              const isNonaktif = item.aktif === false || nonaktifSet.has(String(item.id));
              const isHabis = item.stok === 0 || item.status_stok === "habis";

              return (
                <tr key={item.id} className="hover:bg-permukaan/30">
                  {/* US-47: Atur Urutan Tampil Produk dengan teks Naik dan Turun */}
                  <td className="px-3 py-2">
                    <form action={geserUrutanProduk} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        name="arah"
                        value="naik"
                        title="Naikkan urutan"
                        className="inline-flex items-center gap-0.5 rounded border border-garis px-1.5 py-0.5 text-[10px] font-semibold text-teks hover:border-utama hover:text-utama cursor-pointer"
                      >
                        ▲ Naik
                      </button>
                      <button
                        type="submit"
                        name="arah"
                        value="turun"
                        title="Turunkan urutan"
                        className="inline-flex items-center gap-0.5 rounded border border-garis px-1.5 py-0.5 text-[10px] font-semibold text-teks hover:border-utama hover:text-utama cursor-pointer"
                      >
                        ▼ Turun
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={ambilFotoUtama(item)}
                        alt={item.nama}
                        className="h-8 w-8 rounded-lg object-cover bg-permukaan shrink-0"
                      />
                      <div>
                        <Link
                          href={`/admin/produk/${item.id}/ubah`}
                          className="font-bold text-teks hover:text-utama"
                        >
                          {item.nama}
                        </Link>
                        {item.harga_coret && (
                          <div className="text-[10px] text-red-500 line-through">
                            {formatRupiah(item.harga_coret)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-teks-lembut">{item.kategori || "—"}</td>
                  <td className="px-3 py-2 font-bold text-teks">{formatRupiah(item.harga)}</td>
                  {/* US-19: Status Stok */}
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isHabis ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isHabis ? "Habis" : `${item.stok} porsi`}
                    </span>
                  </td>
                  {/* US-32: Aktif / Nonaktif */}
                  <td className="px-3 py-2">
                    <form action={toggleStatusProduk}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="aktif" value={String(isNonaktif)} />
                      <button
                        type="submit"
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          isNonaktif ? "bg-stone-200 text-stone-600" : "bg-utama/10 text-utama"
                        }`}
                      >
                        {isNonaktif ? "Nonaktif" : "Aktif"}
                      </button>
                    </form>
                  </td>
                  {/* US-09 & US-10: Ubah & Hapus */}
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/produk/${item.id}/ubah`}
                        className="rounded border border-garis px-2 py-0.5 text-xs text-teks hover:border-utama"
                      >
                        Ubah
                      </Link>
                      <form action={hapusProduk}>
                        <input type="hidden" name="id" value={item.id} />
                        <TombolHapusKonfirmasi
                          pesan={`Hapus "${item.nama}"?`}
                          label="Hapus"
                          varian="bahaya"
                          className="py-0.5 px-2 text-xs rounded"
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
