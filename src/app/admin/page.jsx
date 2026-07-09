import { redirect } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { getAdminUser } from "@/lib/admin";
import { getAllPrompts, getCategories } from "@/lib/prompts";
import { signOutAdmin } from "./actions";
import AdminDashboard from "./AdminDashboard";

// Never cache the admin dashboard — it must always reflect the live DB, and it's
// gated per-request by the session anyway.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Middleware already guards this route, but re-check here so the page never
  // renders admin data without a verified admin session (defense in depth).
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  const [prompts, categories] = await Promise.all([
    getAllPrompts(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 text-accent">
            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Admin
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Manage prompts
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Signed in as {admin.email}
          </p>
        </div>

        <form action={signOutAdmin}>
          <button
            type="submit"
            className="focus-accent inline-flex items-center gap-2 rounded-full border border-[--card-border] px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </header>

      <AdminDashboard prompts={prompts} categories={categories} />
    </div>
  );
}
