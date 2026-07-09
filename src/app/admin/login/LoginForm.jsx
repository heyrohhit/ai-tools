"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { signInAdmin } from "@/app/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-accent flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-medium text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in…
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Sign in
        </>
      )}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(signInAdmin, {});
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  return (
    <form action={formAction} className="glass rounded-[--radius-apple] p-7">
      <input type="hidden" name="redirect" value={redirectTo} />

      <label className="mb-4 block">
        <span className="mb-1.5 block text-sm font-medium">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          placeholder="admin@example.com"
          className="focus-accent w-full rounded-xl border border-[--card-border] bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-muted"
        />
      </label>

      <label className="mb-5 block">
        <span className="mb-1.5 block text-sm font-medium">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="focus-accent w-full rounded-xl border border-[--card-border] bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-muted"
        />
      </label>

      {state?.error && (
        <p className="mb-4 flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
