"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import CopyButton from "@/components/CopyButton";

// A single glassmorphism prompt card. Used in the library grid and featured
// section. `layout` lets Framer Motion animate re-flow when the grid filters.
export default function PromptCard({ prompt }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="glass group flex flex-col rounded-[--radius-apple] p-5 transition-shadow hover:shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-black/[.05] px-2.5 py-1 text-xs font-medium capitalize text-muted dark:bg-white/[.08]">
          {prompt.category}
        </span>
        <div className="flex gap-1.5">
          {prompt.models.map((m) => (
            <span
              key={m}
              className="rounded-full border border-[--card-border] px-2 py-0.5 text-[11px] font-medium text-muted"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <Link
        href={`/prompts/${prompt.slug}`}
        className="focus-accent flex items-start justify-between gap-2"
      >
        <h3 className="text-lg font-semibold leading-tight tracking-tight">
          {prompt.title}
        </h3>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>

      <p className="mt-2 flex-1 text-sm leading-6 text-muted">
        {prompt.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-[--card-border] pt-3">
        <Link
          href={`/prompts/${prompt.slug}`}
          className="focus-accent text-sm font-medium text-accent hover:underline"
        >
          View prompt
        </Link>
        <CopyButton
          text={prompt.content}
          className="text-muted hover:bg-black/[.05] dark:hover:bg-white/[.08]"
        />
      </div>
    </motion.article>
  );
}
