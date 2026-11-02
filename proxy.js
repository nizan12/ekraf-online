import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/produk/")) {
    const parts = pathname.split("/").filter(Boolean), id = parts[1];
    if (id) {
      const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
      if (url && key) {
        try {
          const res = await fetch(`${url}/rest/v1/produk?id=eq.${encodeURIComponent(id)}&select=id,aktif`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0 || data[0]?.aktif === false) {
              return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
            }
          } else if (res.status === 400 || res.status === 404) {
            return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
          }
        } catch {}
      }
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) return NextResponse.next();

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/admin/login", request.url));

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    return res;
  }

  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/produk/:path*"],
};
