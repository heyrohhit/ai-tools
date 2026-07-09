import { createSupabaseServerClient } from "@/lib/supabase/server";

// Server-only admin identity check.
//
// Returns the authenticated Supabase user ONLY when a valid session is present
// AND its email matches ADMIN_EMAIL. Any other case (no session, wrong user)
// returns null. Use this in Server Components and Server Actions to gate the
// admin UI; the database still enforces the same email via RLS (admin.sql), so
// this is defense-in-depth, not the sole line of defense.

export async function getAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== adminEmail) return null;
  return user;
}

export async function isAdmin() {
  return (await getAdminUser()) !== null;
}
