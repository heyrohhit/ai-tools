import { updateSession } from "@/lib/supabase/middleware";

// Next 16 "proxy" convention (formerly middleware.js). Runs on every matched
// request: refreshes the Supabase auth session cookies and guards the /admin
// area (see src/lib/supabase/middleware.js).
export async function proxy(request) {
  return updateSession(request);
}

export const config = {
  // Only run where it matters: the admin area (auth guard) and the bare /admin
  // route. Public pages and static assets are excluded so we add no latency
  // outside the admin panel.
  matcher: ["/admin/:path*", "/admin"],
};
