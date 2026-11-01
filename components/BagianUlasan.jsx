"use client";

import { useState, useActionState } from "react";
import { kirimUlasanAction } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";

export default function BagianUlasan({ produkId, ulasanAwal = [] }) {
  const [daftarUlasan, setDaftarUlasan] = useState(ulasanAwal);
  const [ratingInput, setRatingInput] = useState(5);
  const [bukaForm, setBukaForm] = useState(true);

  const [state, formAction, pending] = useActionState(async (prev, formData) => {
    const res = await kirimUlasanAction(prev, formData);
    if (res?.sukses) {
      const nama = formData.get("nama")?.trim();
      const rating = parseInt(formData.get("rating") || "5", 10);
      const komentar = formData.get("komentar")?.trim();
      const ulasanBaru = {
        id: Date.now().toString(),
        produkId,
        nama: nama || "Pelanggan",
        rating,
        komentar,
        disetujui: true,
        tanggal: new Date().toISOString(),
      };
      setDaftarUlasan((prevList) => [ulasanBaru, ...prevList]);
    }
    return res;
  }, null);

  const ulasanDisetujui = daftarUlasan.filter(
    (u) => u.disetujui !== false && u.status !== "sembunyi"
  );
  const rataRata =
    ulasanDisetujui.length > 0
      ? (
          ulasanDisetujui.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0) /
          ulasanDisetujui.length
        ).toFixed(1)
      : null;

  return (
    <section aria-labelledby="judul-ulasan" className="mt-14 border-t border-garis pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 id="judul-ulasan" className="text-xl font-bold text-teks">
            Ulasan &amp; Rating Pembeli
          </h2>
          <p className="text-xs text-teks-lembut mt-0.5">
            {ulasanDisetujui.length > 0
              ? `Rata-rata ⭐ ${rataRata} / 5 dari ${ulasanDisetujui.length} ulasan`
              : "Belum ada ulasan untuk menu ini. Jadilah yang pertama memberi ulasan!"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBukaForm(!bukaForm)}
          className="rounded-xl border border-garis bg-permukaan px-3.5 py-2 text-xs font-semibold text-teks hover:border-utama cursor-pointer"
        >
          {bukaForm ? "Tutup Form Ulasan" : "+ Tulis Ulasan"}
        </button>
      </div>

      {bukaForm && (
        <form action={formAction} className="rounded-2xl border border-garis bg-permukaan p-5 mb-8 flex flex-col gap-4">
          <input type="hidden" name="produkId" value={produkId} />
          <input type="hidden" name="rating" value={ratingInput} />
          {/* Honeypot field (US-38) */}
          <input type="text" name="website" tabIndex="-1" autoComplete="off" className="hidden" aria-hidden="true" />

          <h3 className="text-sm font-bold text-teks">Bagikan Pengalaman Rasamu</h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-teks-lembut">Beri Bintang:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingInput(star)}
                  className="cursor-pointer text-lg text-amber-500 hover:scale-125 transition"
                >
                  {star <= ratingInput ? "★" : "☆"}
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-500">({ratingInput} dari 5)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                name="nama"
                required
                placeholder="Nama kamu (cth: Rian)"
                className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2 text-sm text-teks focus:border-utama focus:outline-none"
              />
              {state?.errors?.nama && <p className="text-xs text-red-500 mt-1">{state.errors.nama}</p>}
            </div>
          </div>

          <div>
            <textarea
              name="komentar"
              rows={3}
              required
              placeholder="Ceritakan rasa kopi, aroma, atau tekstur menu ini…"
              className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2 text-sm text-teks focus:border-utama focus:outline-none"
            />
            {state?.errors?.komentar && <p className="text-xs text-red-500 mt-1">{state.errors.komentar}</p>}
          </div>

          {state?.sukses && (
            <p className="text-xs text-emerald-600 font-semibold">{state.sukses}</p>
          )}

          <div>
            <Tombol type="submit" varian="utama" disabled={pending}>
              {pending ? "Mengirimkan…" : "Kirim Ulasan"}
            </Tombol>
          </div>
        </form>
      )}

      {ulasanDisetujui.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ulasanDisetujui.map((u) => (
            <div key={u.id} className="rounded-2xl border border-garis bg-latar p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-teks">{u.nama}</span>
                <span className="text-xs text-amber-500 font-bold">
                  {"★".repeat(u.rating)}{"☆".repeat(Math.max(0, 5 - u.rating))}
                </span>
              </div>
              <p className="text-xs text-teks-lembut leading-relaxed">{u.komentar}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
