// Data-access layer for prompts.
//
// Today these read from the local seed (src/data/prompts.js). Each function is
// written so that swapping to Supabase later is a one-line change — the return
// shape already matches the `prompts` table in supabase/schema.sql.
//
// To migrate, replace the seed reads with the commented Supabase queries. The
// browser anon client already lives in src/lib/supabase.js. These helpers run
// in Server Components, so the data never round-trips through the client.

import { prompts, categories } from "@/data/prompts";
// import { supabase } from "@/lib/supabase"; // uncomment when migrating to DB

export async function getAllPrompts() {
  // Supabase:
  // const { data } = await supabase.from("prompts").select("*").order("id");
  // return data ?? [];
  return prompts;
}

export async function getFeaturedPrompts() {
  // Supabase:
  // const { data } = await supabase.from("prompts").select("*").eq("featured", true);
  // return data ?? [];
  return prompts.filter((p) => p.featured);
}

export async function getPromptBySlug(slug) {
  // Supabase:
  // const { data } = await supabase.from("prompts").select("*").eq("slug", slug).single();
  // return data ?? null;
  return prompts.find((p) => p.slug === slug) ?? null;
}

export async function getCategories() {
  // Categories are a small fixed taxonomy; no DB round-trip needed.
  return categories;
}

// Synchronous helpers for build-time use (generateStaticParams / sitemap),
// where we just need the list of slugs without an async DB call.
export function getAllSlugs() {
  return prompts.map((p) => p.slug);
}
