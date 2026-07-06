"use client";

import PromptCard from "@/components/PromptCard";
import { useRealtimePrompts } from "@/hooks/useRealtimePrompts";

// Live featured grid for the home page. Seeds from the server-fetched featured
// list and stays in sync via Supabase Realtime (featured rows only).
export default function FeaturedPrompts({ prompts }) {
  const featured = useRealtimePrompts(prompts, { featuredOnly: true });

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((p) => (
        <PromptCard key={p.id} prompt={p} />
      ))}
    </div>
  );
}
