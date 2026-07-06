import { createClient } from "@supabase/supabase-js";

// Browser-safe Supabase client.
// Uses the PUBLIC anon key — safe to ship to the client because access is
// governed by Row Level Security (RLS) policies on the database.
//
// ⚠️ Never import a service-role key or the OPENAI_API_KEY here. Anything in
// this file can end up in the browser bundle. Privileged/server-only access
// (OpenAI, admin writes) belongs in a separate server-only client.

// Normalize the URL to the bare project origin. supabase-js appends the REST
// path itself, so a pasted value like ".../rest/v1/" or a trailing slash would
// otherwise produce ".../rest/v1//rest/v1/prompts" → PGRST125 "Invalid path".
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  .replace(/\/+$/, "")
  .replace(/\/rest\/v1$/, "");
// Accept either the legacy anon key or the newer "publishable" key
// (sb_publishable_...). Both are the browser-safe public key — Supabase renamed
// them, so we read whichever one is present.
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) " +
      "in .env.local."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
