"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import PromptCard from "@/components/PromptCard";
import { useRealtimePrompts } from "@/hooks/useRealtimePrompts";

// Client-side library: live search + category filtering over prompts seeded
// from the server. The list itself is live via Supabase Realtime, so newly
// generated/updated/deleted prompts appear without a refresh; filtering is a
// pure useMemo on top of that live list.
export default function PromptLibrary({ prompts: initialPrompts, categories }) {
  const prompts = useRealtimePrompts(initialPrompts);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((p) => {
      const matchesCategory = active === "all" || p.category === active;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [
        p.title,
        p.description,
        p.category,
        ...(p.tags ?? []),
        ...(p.models ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [prompts, query, active]);

  return (
    <div>
      {/* Search */}
      <div className="glass mx-auto flex max-w-xl items-center gap-3 rounded-full px-5 py-3">
        <Search className="h-5 w-5 shrink-0 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts, tags, or models…"
          aria-label="Search prompts"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="focus-accent shrink-0 rounded-full p-1 text-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
        <CategoryChip
          label="All"
          activeState={active === "all"}
          onClick={() => setActive("all")}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            label={`${c.emoji} ${c.label}`}
            activeState={active === c.id}
            onClick={() => setActive(c.id)}
          />
        ))}
      </div>

      {/* Results */}
      <p className="mt-8 text-center text-sm text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "prompt" : "prompts"}
      </p>

      <motion.div
        layout
        className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-muted">
          No prompts match “{query}”. Try a different search or category.
        </p>
      )}
    </div>
  );
}

function CategoryChip({ label, activeState, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-accent rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        activeState
          ? "bg-accent text-white"
          : "glass text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
