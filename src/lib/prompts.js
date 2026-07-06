// Data-access layer for prompts — now backed by Supabase.
//
// Every read/write goes through the anon client (src/lib/supabase.js). Reads are
// public (RLS SELECT policy); inserts are restricted to generated prompts by the
// RLS INSERT policy. These helpers run in Server Components and the /api/generate
// route, so data never round-trips through the browser unnecessarily.
//
// The category taxonomy is a small fixed set, so it stays in code (no DB call).

import { supabase } from "@/lib/supabase";
import { categories } from "@/data/prompts";

export async function getAllPrompts() {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getAllPrompts failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getFeaturedPrompts() {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getFeaturedPrompts failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPromptBySlug(slug) {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("getPromptBySlug failed:", error.message);
    return null;
  }
  return data ?? null;
}

// Dedup lookup for the generator: has an identical request already been saved?
export async function getPromptByInputHash(inputHash) {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("input_hash", inputHash)
    .maybeSingle();
  if (error) {
    console.error("getPromptByInputHash failed:", error.message);
    return null;
  }
  return data ?? null;
}

// Persist a freshly generated prompt. Returns the inserted row (or an existing
// row if a concurrent request already inserted the same input_hash).
export async function createGeneratedPrompt(row) {
  const { data, error } = await supabase
    .from("prompts")
    .insert({ ...row, source: "generated", featured: false })
    .select("*")
    .single();

  if (error) {
    // Unique violation on input_hash/slug → someone beat us to it; return theirs.
    if (error.code === "23505") {
      const existing = await getPromptByInputHash(row.input_hash);
      if (existing) return existing;
    }
    console.error("createGeneratedPrompt failed:", error.message);
    return null;
  }
  return data;
}

export async function getCategories() {
  return categories;
}

// List of slugs for generateStaticParams / sitemap. Async now (DB-backed).
export async function getAllSlugs() {
  const { data, error } = await supabase.from("prompts").select("slug");
  if (error) {
    console.error("getAllSlugs failed:", error.message);
    return [];
  }
  return (data ?? []).map((p) => p.slug);
}
