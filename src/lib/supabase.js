import { createClient } from "@supabase/supabase-js";

// Browser-safe Supabase client.
// Uses the PUBLIC anon key — safe to ship to the client because access is
// governed by Row Level Security (RLS) policies on the database.
//
// ⚠️ Never import a service-role key or the OPENAI_API_KEY here. Anything in
// this file can end up in the browser bundle. Privileged/server-only access
// (OpenAI, admin writes) belongs in a separate server-only client.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
