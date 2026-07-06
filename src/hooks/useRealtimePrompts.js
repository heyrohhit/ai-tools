"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Live-updating prompt list.
//
// Seeds from `initial` (the rows fetched on the server, so the first paint is
// instant and SSR-friendly), then subscribes to Postgres changes on the
// `prompts` table. INSERT / UPDATE / DELETE from anywhere — the generator, the
// SQL editor, another browser tab — are merged into state in real time without
// a page refresh.
//
// Requires Realtime to be enabled for public.prompts (see supabase/schema.sql:
// `alter publication supabase_realtime add table public.prompts`).
export function useRealtimePrompts(initial = [], { featuredOnly = false } = {}) {
  const [prompts, setPrompts] = useState(initial);

  // Reset to the server list when it changes (e.g. after ISR revalidate). This
  // is React's "adjust state during render" pattern — cheaper and lint-clean vs.
  // syncing in an effect. `initial` only gets a new reference on a real refetch.
  const [seenInitial, setSeenInitial] = useState(initial);
  if (initial !== seenInitial) {
    setSeenInitial(initial);
    setPrompts(initial);
  }

  useEffect(() => {
    const keep = (row) => !featuredOnly || row.featured === true;
    // Newest first, matching the server-side ordering (created_at desc).
    const sort = (list) =>
      [...list].sort(
        (a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0)
      );

    const channel = supabase
      .channel("prompts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prompts" },
        (payload) => {
          setPrompts((current) => {
            if (payload.eventType === "INSERT") {
              if (!keep(payload.new)) return current;
              if (current.some((p) => p.id === payload.new.id)) return current;
              return sort([payload.new, ...current]);
            }
            if (payload.eventType === "UPDATE") {
              const exists = current.some((p) => p.id === payload.new.id);
              // A row may drop in/out of a filtered view when `featured` flips.
              if (!keep(payload.new)) {
                return current.filter((p) => p.id !== payload.new.id);
              }
              const next = exists
                ? current.map((p) =>
                    p.id === payload.new.id ? payload.new : p
                  )
                : [payload.new, ...current];
              return sort(next);
            }
            if (payload.eventType === "DELETE") {
              return current.filter((p) => p.id !== payload.old.id);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [featuredOnly]);

  return prompts;
}
