"use server";

import { redirect } from "next/navigation";
import { buatClientSesi } from "@/lib/supabase";
import { catatLogAktivitas } from "@/lib/pengaturanAdmin";

const rateLimitMap = new Map();

export async function loginAdmin(prevState, formData) {
  const email = formData.get("email")?.toLowerCase()?.trim();
  const password = formData.get("password");
  if (!email || !password) return { error: "Email dan password wajib diisi." };

  const now = Date.now();
  const att = rateLimitMap.get(email) || { count: 0, lockUntil: 0 };
  if (att.lockUntil > now) {
    const sisa = Math.ceil((att.lockUntil - now) / 60000);
    return { error: `Terlalu banyak percobaan gagal. Silakan coba ${sisa} menit lagi.` };
  }

  const sb = await buatClientSesi();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    const nc = att.count + 1;
    if (nc >= 5) {
      rateLimitMap.set(email, { count: nc, lockUntil: now + 10 * 60 * 1000 });
      return { error: "Terlalu banyak percobaan gagal. Akun dibatasi sementara 10 menit." };
    }
    rateLimitMap.set(email, { count: nc, lockUntil: 0 });
    return { error: `Email atau password salah. (Sisa: ${5 - nc})` };
  }

  rateLimitMap.delete(email);
  await catatLogAktivitas("Login Admin", `Admin ${email} login.`);
  redirect("/admin");
}

export async function logoutAdmin() {
  const sb = await buatClientSesi();
  await catatLogAktivitas("Logout Admin", "Admin keluar sesi.");
  await sb.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasi = formData.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasi) return { error: "Semua field wajib diisi." };
  if (passwordBaru.length < 8) return { error: "Password baru minimal 8 karakter." };
  if (passwordBaru !== konfirmasi) return { error: "Password baru dan konfirmasi tidak sama." };

  const sb = await buatClientSesi();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Sesi login berakhir. Silakan login kembali." };

  const { error } = await sb.auth.updateUser({ password: passwordBaru });
  if (error) return { error: "Gagal mengganti password." };

  await catatLogAktivitas("Ganti Password", "Admin memperbarui password.");
  return { sukses: "Password berhasil diganti." };
}
