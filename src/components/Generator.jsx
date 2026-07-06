"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wand2, Loader2, AlertCircle, ArrowUpRight, Check } from "lucide-react";
import CopyButton from "@/components/CopyButton";

const MODELS = ["ChatGPT", "Claude", "Midjourney"];
const TONES = ["Professional", "Friendly", "Persuasive", "Technical", "Playful"];
const FORMATS = [
  "Step-by-step instructions",
  "A structured template with placeholders",
  "A single paragraph",
  "A checklist",
];

export default function Generator() {
  const [task, setTask] = useState("");
  const [audience, setAudience] = useState("");
  const [model, setModel] = useState("ChatGPT");
  const [tone, setTone] = useState("Professional");
  const [format, setFormat] = useState(FORMATS[0]);

  const [result, setResult] = useState("");
  const [slug, setSlug] = useState(null);
  const [reused, setReused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!task.trim()) {
      setError("Describe what you want the prompt to do first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult("");
    setSlug(null);
    setReused(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, audience, model, tone, format }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Try again.");
      }
      setResult(data.prompt);
      setSlug(data.slug ?? null);
      setReused(Boolean(data.reused));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-6 lg:grid-cols-2">
      {/* Form */}
      <form onSubmit={handleSubmit} className="glass rounded-[--radius-apple] p-6">
        <Field label="What should the prompt do?">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            rows={3}
            placeholder="e.g. Write a product launch announcement for a new app"
            className="focus-accent w-full resize-none rounded-xl border border-[--card-border] bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-muted"
          />
        </Field>

        <Field label="Target audience (optional)">
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. busy startup founders"
            className="focus-accent w-full rounded-xl border border-[--card-border] bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-muted"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Target model">
            <Select value={model} onChange={setModel} options={MODELS} />
          </Field>
          <Field label="Tone">
            <Select value={tone} onChange={setTone} options={TONES} />
          </Field>
        </div>

        <Field label="Output format">
          <Select value={format} onChange={setFormat} options={FORMATS} />
        </Field>

        {error && (
          <p className="mb-4 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="focus-accent flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-medium text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate prompt
            </>
          )}
        </button>
      </form>

      {/* Output */}
      <div className="glass flex flex-col rounded-[--radius-apple] p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Generated prompt
          </h2>
          {result && (
            <CopyButton
              text={result}
              className="text-muted hover:bg-black/[.05] dark:hover:bg-white/[.08]"
            />
          )}
        </div>

        {result ? (
          <>
            <motion.pre
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 whitespace-pre-wrap break-words font-sans text-sm leading-6"
            >
              {result}
            </motion.pre>

            {slug && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 border-t border-[--card-border] pt-4"
              >
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <Check className="h-3.5 w-3.5 text-accent" />
                  {reused
                    ? "This prompt already existed — reusing the saved version."
                    : "Saved to the public library so anyone can reuse it."}
                </p>
                <Link
                  href={`/prompts/${slug}`}
                  className="focus-accent mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  View &amp; share this prompt
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-muted">
            {loading
              ? "Crafting your structured prompt…"
              : "Your generated prompt will appear here."}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="focus-accent w-full rounded-xl border border-[--card-border] bg-background px-3.5 py-2.5 text-sm outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
