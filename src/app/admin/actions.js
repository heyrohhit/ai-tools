"use server";

// Server Actions for the admin panel.
//
// These run only on the server. Sign-in/ou
// \t drive Supabase Auth (cookies set via
// the SSR client); the write actions (update/delete/feature) run as the signed-in
// admin, so the RLS policies in supabase/admin.sql authorize them at the DB layer.
// Every write also re-checks getAdminUser() first — belt and suspenders.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { categories } from "@/data/prompts";

const CATEGORY_IDS = categories.map((c) => c.id);

// Re-freshen every surface that renders prompt data. Optionally include specific
// prompt detail pages (old + new slug when a slug changes).
function revalidatePrompts(...slugs) {
  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/admin");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/prompts/${slug}`);
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────

// useActionState-compatible: (prevState, formData) → { error } on failure.
// On success it redirects (which throws NEXT_REDIRECT), so it never returns.
export async function signInAdmin(prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirect") || "/admin");

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email || !password) {
    return { error: "Enter both email and password." };
  }
  // Reject non-admin emails before hitting Supabase — only one account is admin.
  if (!adminEmail || email.toLowerCase() !== adminEmail) {
    return { error: "These credentials aren't authorized for the admin panel." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  // Only redirect to internal paths to avoid open-redirect abuse.
  const safePath =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/admin";
  redirect(safePath);
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ── Writes (admin-only) ───────────────────────────────────────────────────────

export async function updatePrompt(id, fields) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorized." };
  if (!id) return { error: "Missing prompt id." };

  const title = String(fields.title || "").trim();
  const description = String(fields.description || "").trim();
  const content = String(fields.content || "").trim();
  const slug = String(fields.slug || "").trim();
  const category = String(fields.category || "").trim();

  if (!title) return { error: "Title is required." };
  if (!content) return { error: "Content is required." };
  if (!slug) return { error: "Slug is required." };
  if (!CATEGORY_IDS.includes(category)) {
    return { error: "Pick a valid category." };
  }

  // tags/models arrive as comma-separated strings or arrays from the client.
  const toArray = (v) =>
    Array.isArray(v)
      ? v.map((s) => String(s).trim()).filter(Boolean)
      : String(v || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

  const update = {
    title: title.slice(0, 200),
    description: description.slice(0, 300),
    content: content.slice(0, 20000),
    slug: slug.slice(0, 200),
    category,
    tags: toArray(fields.tags).slice(0, 12),
    models: toArray(fields.models).slice(0, 8),
    featured: Boolean(fields.featured),
  };

  const supabase = await createSupabaseServerClient();

  // Grab the current slug so we can revalidate the old detail URL too.
  const { data: existing } = await supabase
    .from("prompts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("prompts")
    .update(update)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already in use. Choose a different one." };
    }
    console.error("updatePrompt failed:", error.message);
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePrompts(existing?.slug, update.slug);
  return { ok: true };
}

export async function deletePrompt(id) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorized." };
  if (!id) return { error: "Missing prompt id." };

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("prompts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("prompts").delete().eq("id", id);

  if (error) {
    console.error("deletePrompt failed:", error.message);
    return { error: "Could not delete this prompt. Please try again." };
  }

  revalidatePrompts(existing?.slug);
  return { ok: true };
}

export async function toggleFeatured(id, featured) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorized." };
  if (!id) return { error: "Missing prompt id." };

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("prompts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("prompts")
    .update({ featured: Boolean(featured) })
    .eq("id", id);

  if (error) {
    console.error("toggleFeatured failed:", error.message);
    return { error: "Could not update the featured flag." };
  }

  revalidatePrompts(existing?.slug);
  return { ok: true };
}
