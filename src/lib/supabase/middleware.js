import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Session refresh + admin route guard for Next middleware.
//
// @supabase/ssr stores the auth session in httpOnly cookies. Access tokens are
// short-lived, so on every request we (a) let supabase-js refresh the token if
// needed and (b) write the refreshed cookies onto the outgoing response. Without
// this, a Server Component could read a stale/expired session.
//
// It also gates /admin: anyone without a valid session bound to ADMIN_EMAIL is
// bounced to /admin/login before the protected page ever renders. This is a
// convenience redirect — the real enforcement is the RLS policy in admin.sql,
// which rejects privileged writes at the database layer regardless of the app.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  .replace(/\/+$/, "")
  .replace(/\/rest\/v1$/, "");

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)?.trim();

export async function updateSession(request) {
  // Missing env → don't crash every request; just pass through untouched.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: getUser() validates the JWT with Supabase and triggers the token
  // refresh that writes cookies via setAll above. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = Boolean(
    user && adminEmail && user.email?.toLowerCase() === adminEmail
  );

  // Protect everything under /admin except the login page itself.
  const isAdminArea =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminArea && !isLoginPage && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in? Skip the login page, go straight to the dashboard.
  if (isLoginPage && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
