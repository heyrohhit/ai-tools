// TEMPORARY diagnostic endpoint — surfaces the real server-side Supabase state
// on Vercel (env presence + exact query error). Remove after debugging.
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  let result = { rowCount: 0, error: null, threw: null };
  try {
    const { data, error } = await supabase
      .from("prompts")
      .select("id,title")
      .limit(5);
    result.rowCount = data?.length ?? 0;
    result.sample = (data ?? []).map((r) => r.title);
    result.error = error
      ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        }
      : null;
  } catch (e) {
    result.threw = String(e?.message || e);
  }

  return Response.json({
    env: {
      urlPresent: !!url,
      url,
      keyPresent: !!key,
      keyPrefix: key.slice(0, 18),
      keyLen: key.length,
    },
    ...result,
  });
}
