import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client bound to the request's cookies (@supabase/ssr).
//
// Unlike the module-level anon client in src/lib/supabase.js (public reads +
// generated inserts), this client carries the signed-in admin's session from the
// httpOnly auth cookies. That means its requests run as the AUTHENTICATED admin,
// so the RLS UPDATE/DELETE policies in supabase/admin.sql apply — privileged
// writes are possible ONLY when a valid admin session is present.
//
// Uses the same public URL + anon/publishable key as the browser client; access
// is still governed entirely by RLS. No service-role key is used anywhere.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  .replace(/\/+$/, "")
  .replace(/\/rest\/v1$/, "");

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
  );
}

// Async because next/headers cookies() is async in Next 16. Call from Server
// Components, Route Handlers, and Server Actions.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll can be called from a Server Component render, where cookies
          // are read-only. Safe to ignore — the middleware refreshes the session.
        }
      },
    },
  });
}
