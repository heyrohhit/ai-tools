import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import LoginForm from "./LoginForm";

// The middleware already redirects a signed-in admin away from here, and blocks
// unauthenticated access to the rest of /admin. This page just renders the form.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 pt-28 pb-12">
      <header className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 text-accent">
          <Sparkles className="h-5 w-5" strokeWidth={2.2} />
          <span className="text-sm font-semibold tracking-tight">
            Prompt Hub Admin
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
          Restricted area. Only the site administrator can manage prompts here.
        </p>
      </header>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
