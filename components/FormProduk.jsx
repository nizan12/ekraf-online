"use client";

import { useState, useActionState } from "react";
import { buatDeskripsiAI } from "@/app/admin/actions";

export default function FormProduk({
  produk = {},
  varianAwal = [],
  kategoriList = [],
  labelTombol = "Simpan Produk",
  action,
}) {
  const [state, formAction, pending] = useActionState(action, null);

  const [nama, setNama] = useState(produk.nama || "");
  const [harga, setHarga] = useState(produk.harga || "");
  const [hargaCoret, setHargaCoret] = useState(produk.harga_coret || "");
  const [diskonPersen, setDiskonPersen] = useState(produk.diskon_persen || "");
  const [isBaru, setIsBaru] = useState(produk.baru || produk.is_baru || false);
  const [isTerlaris, setIsTerlaris] = useState(produk.terlaris || produk.is_terlaris || false);
  const [stok, setStok] = useState(produk.stok ?? 10);
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [fotoUrl, setFotoUrl] = useState(produk.foto_url || produk.image || "");

  const [daftarVarian, setDaftarVarian] = useState(
    Array.isArray(varianAwal) && varianAwal.length > 0
      ? varianAwal.map((v) => ({ nama: v.nama || "", harga_tambahan: Number(v.harga_tambahan) || 0 }))
      : []
  );

  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);

  // US-14: Deskripsi AI
  async function handleBuatDeskripsiAI() {
    if (!nama.trim()) { setPesanAI({ error: "Isi nama menu terlebih dahulu." }); return; }
    setLoadingAI(true);
    setPesanAI(null);
    try {
      const h = await buatDeskripsiAI({ nama, kategori });
      if (h?.error) setPesanAI({ error: h.error });
      else if (h?.deskripsi) { setDeskripsi(h.deskripsi); setPesanAI({ sukses: "Deskripsi berhasil dibuat AI!" }); }
    } catch { setPesanAI({ error: "Gagal membuat deskripsi." }); }
    finally { setLoadingAI(false); }
  }

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}
      <input type="hidden" name="foto_url" value={fotoUrl} />
      <input type="hidden" name="varian_json" value={JSON.stringify(daftarVarian)} />

      <div className="rounded-2xl border border-garis bg-permukaan p-4 flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-teks-lembut mb-1">Nama Menu</label>
          <input
            type="text" name="nama" value={nama} onChange={(e) => setNama(e.target.value)} required
            placeholder="Contoh: Es Kopi Susu Aren" className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks"
          />
          {(state?.fieldErrors?.nama || state?.errors?.nama) && (
            <p className="text-[11px] text-red-500 mt-0.5">{state.fieldErrors?.nama || state.errors?.nama}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-teks-lembut mb-1">Kategori</label>
          <select
            name="kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}
            className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks"
          >
            <option value="">Pilih Kategori…</option>
            {kategoriList.map((k) => <option key={k.id || k.nama} value={k.nama}>{k.nama}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-teks-lembut mb-1">Harga (Rp)</label>
            <input
              type="number" name="harga" value={harga} onChange={(e) => setHarga(e.target.value)} required
              placeholder="25000" className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks"
            />
            {(state?.fieldErrors?.harga || state?.errors?.harga) && (
              <p className="text-[11px] text-red-500 mt-0.5">{state.fieldErrors?.harga || state.errors?.harga}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-teks-lembut mb-1">Harga Coret (Rp)</label>
            <input
              type="number" name="harga_coret" value={hargaCoret} onChange={(e) => setHargaCoret(e.target.value)}
              placeholder="30000" className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-teks-lembut mb-1">Stok</label>
            <input
              type="number" name="stok" value={stok} onChange={(e) => setStok(e.target.value)}
              placeholder="10" className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-teks-lembut mb-1">Diskon (%)</label>
            <input
              type="number" name="diskon_persen" value={diskonPersen} onChange={(e) => setDiskonPersen(e.target.value)}
              placeholder="15" className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks"
            />
          </div>
        </div>

        {/* US-20: Badge Baru / Terlaris */}
        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-1.5 text-xs text-teks cursor-pointer">
            <input type="checkbox" name="baru" checked={isBaru} onChange={(e) => setIsBaru(e.target.checked)} />
            <span>Badge Baru</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-teks cursor-pointer">
            <input type="checkbox" name="terlaris" checked={isTerlaris} onChange={(e) => setIsTerlaris(e.target.checked)} />
            <span>Badge Terlaris</span>
          </label>
        </div>

        {/* US-12 & US-48: Varian Menu */}
        <div className="border-t border-garis pt-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-teks">Varian Ukuran / Rasa</span>
            <button
              type="button" onClick={() => setDaftarVarian([...daftarVarian, { nama: "", harga_tambahan: 0 }])}
              className="text-xs text-utama hover:underline cursor-pointer"
            >
              + Tambah
            </button>
          </div>
          {daftarVarian.map((v, i) => (
            <div key={i} className="flex gap-1.5 mb-1.5">
              <input
                type="text" placeholder="Nama varian" value={v.nama}
                onChange={(e) => { const c = [...daftarVarian]; c[i].nama = e.target.value; setDaftarVarian(c); }}
                className="flex-1 rounded border border-garis bg-latar px-2 py-1 text-xs text-teks"
              />
              <input
                type="number" placeholder="+Harga" value={v.harga_tambahan}
                onChange={(e) => { const c = [...daftarVarian]; c[i].harga_tambahan = Number(e.target.value); setDaftarVarian(c); }}
                className="w-20 rounded border border-garis bg-latar px-2 py-1 text-xs text-teks"
              />
              <button
                type="button" onClick={() => setDaftarVarian(daftarVarian.filter((_, idx) => idx !== i))}
                className="text-red-500 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan p-4 flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-teks-lembut mb-1">URL Foto (pisahkan koma untuk galeri)</label>
          <input
            type="text" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)}
            placeholder="https://...foto1.jpg, https://...foto2.jpg"
            className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-teks-lembut mb-1">Unggah File (Supabase Storage)</label>
          <input
            type="file" name="file_gambar" accept="image/jpeg,image/png,image/webp,image/gif"
            className="w-full rounded-xl border border-garis bg-latar px-3 py-1.5 text-xs text-teks file:mr-2 file:border-0 file:bg-utama/10 file:px-2.5 file:py-0.5 file:text-xs file:font-bold file:text-utama"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-teks-lembut">Deskripsi Produk</label>
            <button
              type="button" onClick={handleBuatDeskripsiAI} disabled={loadingAI}
              className="text-xs text-utama hover:underline cursor-pointer"
            >
              {loadingAI ? "Menulis…" : "✨ Buat AI"}
            </button>
          </div>
          {pesanAI?.sukses && <p className="text-[11px] text-emerald-600 mb-1">{pesanAI.sukses}</p>}
          {pesanAI?.error && <p className="text-[11px] text-red-500 mb-1">{pesanAI.error}</p>}
          <textarea
            name="deskripsi" rows={4} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi menu…" className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks"
          />
          {(state?.fieldErrors?.deskripsi || state?.errors?.deskripsi) && (
            <p className="text-[11px] text-red-500 mt-0.5">{state.fieldErrors?.deskripsi || state.errors?.deskripsi}</p>
          )}
        </div>

        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

        <button
          type="submit" disabled={pending}
          className="w-full rounded-xl bg-utama py-2.5 text-xs font-bold text-white hover:bg-utama-gelap disabled:opacity-40 cursor-pointer"
        >
          {pending ? "Menyimpan…" : labelTombol}
        </button>
      </div>
    </form>
  );
}
