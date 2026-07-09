"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  Loader2,
  AlertCircle,
  Check,
  LayoutGrid,
  FileText,
  Sparkles,
  Filter,
} from "lucide-react";
import { updatePrompt, deletePrompt, toggleFeatured } from "./actions";

export default function AdminDashboard({ prompts, categories }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [isPending, startTransition] = useTransition();

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = prompts.length;
    const featured = prompts.filter((p) => p.featured).length;
    const categoriesCount = new Set(prompts.map((p) => p.category)).size;
    const generated = prompts.filter((p) => p.source === "generated").length;
    const curated = total - generated;
    return { total, featured, categoriesCount, generated, curated };
  }, [prompts]);

  const categoryLabel = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]));
    return (id) => map.get(id)?.label || id;
  }, [categories]);

  const categoryEmoji = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]));
    return (id) => map.get(id)?.emoji || "📄";
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [prompts, query, categoryFilter]);

  function flash(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function handleToggleFeatured(prompt) {
    setPendingId(prompt.id);
    startTransition(async () => {
      const res = await toggleFeatured(prompt.id, !prompt.featured);
      setPendingId(null);
      if (res?.error) return flash("error", res.error);
      flash(
        "success",
        !prompt.featured ? "Marked as featured." : "Removed from featured."
      );
      router.refresh();
    });
  }

  function handleDelete(prompt) {
    setPendingId(prompt.id);
    startTransition(async () => {
      const res = await deletePrompt(prompt.id);
      setPendingId(null);
      setConfirmDelete(null);
      if (res?.error) return flash("error", res.error);
      flash("success", "Prompt deleted.");
      router.refresh();
    });
  }

  return (
    <div>
      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total Prompts"
          value={stats.total}
          color="text-accent"
          bg="bg-accent/10"
        />
        <StatCard
          icon={Star}
          label="Featured"
          value={stats.featured}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatCard
          icon={LayoutGrid}
          label="Categories"
          value={stats.categoriesCount}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatCard
          icon={Sparkles}
          label="AI Generated"
          value={stats.generated}
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
      </div>

      {/* ── Controls ───────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, slug, description, or tag…"
            className="focus-accent w-full rounded-full border border-[--card-border] bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted"
          />
        </div>

        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="focus-accent appearance-none rounded-full border border-[--card-border] bg-background py-2.5 pl-8 pr-8 text-sm outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-4 text-xs font-medium text-muted">
        Showing <span className="text-foreground">{filtered.length}</span> of{" "}
        <span className="text-foreground">{prompts.length}</span> prompts
        {categoryFilter !== "all" && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
            {categoryEmoji(categoryFilter)} {categoryLabel(categoryFilter)}
            <button
              onClick={() => setCategoryFilter("all")}
              className="ml-0.5 rounded-full hover:bg-accent/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </p>

      {/* ── Prompt List ────────────────────────────────────────────────── */}
      <div className="glass overflow-hidden rounded-[--radius-apple]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/[.05] dark:bg-white/[.08]">
              <Search className="h-5 w-5 text-muted" />
            </div>
            <p className="text-sm font-medium text-muted">
              No prompts match your filters.
            </p>
            <p className="mt-1 text-xs text-muted">
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[--card-border]">
            {filtered.map((p) => {
              const busy = pendingId === p.id && isPending;
              return (
                <li
                  key={p.id}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-black/[.02] dark:hover:bg-white/[.02] sm:px-5"
                >
                  {/* Category emoji */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[.04] text-base dark:bg-white/[.06]">
                    {categoryEmoji(p.category)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {p.title}
                      </span>
                      {p.featured && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                      {p.source === "generated" && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                          <Sparkles className="h-3 w-3" />
                          AI
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <span className="rounded-md bg-black/[.05] px-1.5 py-0.5 dark:bg-white/[.08]">
                        {categoryLabel(p.category)}
                      </span>
                      <span className="truncate">/{p.slug}</span>
                      {p.tags?.length > 0 && (
                        <span className="hidden truncate sm:inline">
                          · {p.tags.slice(0, 3).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                    {busy && (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin text-muted" />
                    )}
                    <IconButton
                      title={p.featured ? "Unfeature" : "Feature"}
                      onClick={() => handleToggleFeatured(p)}
                      disabled={busy}
                      active={p.featured}
                      activeColor="text-amber-500"
                    >
                      <Star
                        className={`h-4 w-4 ${p.featured ? "fill-current" : ""}`}
                      />
                    </IconButton>
                    <Link
                      href={`/prompts/${p.slug}`}
                      target="_blank"
                      className="focus-accent rounded-lg p-2 text-muted transition-colors hover:bg-black/[.05] hover:text-foreground dark:hover:bg-white/[.08]"
                      title="View public page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <IconButton
                      title="Edit"
                      onClick={() => setEditing(p)}
                      disabled={busy}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      title="Delete"
                      onClick={() => setConfirmDelete(p)}
                      disabled={busy}
                      danger
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────── */}
      {editing && (
        <EditModal
          prompt={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            flash("success", msg);
            router.refresh();
          }}
          onError={(msg) => flash("error", msg)}
        />
      )}

      {/* ── Delete Confirm ─────────────────────────────────────────────── */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete this prompt?"
          body={
            <>
              <span className="font-medium text-foreground">
                {confirmDelete.title}
              </span>{" "}
              will be permanently removed from the library. This can&apos;t be
              undone.
            </>
          }
          confirmLabel="Delete"
          busy={pendingId === confirmDelete.id && isPending}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`glass fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium shadow-lg ${
            toast.type === "error" ? "text-red-500" : "text-foreground"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="glass flex items-center gap-3 rounded-[--radius-apple] p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}
      >
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

// ── Icon Button ────────────────────────────────────────────────────────────
function IconButton({ children, onClick, disabled, title, danger, active, activeColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`focus-accent rounded-lg p-2 transition-colors disabled:opacity-40 ${
        danger
          ? "text-muted hover:bg-red-500/10 hover:text-red-500"
          : active
          ? activeColor || "text-accent"
          : "text-muted hover:bg-black/[.05] hover:text-foreground dark:hover:bg-white/[.08]"
      }`}
    >
      {children}
    </button>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ prompt, categories, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    title: prompt.title || "",
    slug: prompt.slug || "",
    description: prompt.description || "",
    content: prompt.content || "",
    category: prompt.category || categories[0]?.id || "",
    tags: (prompt.tags || []).join(", "),
    models: (prompt.models || []).join(", "),
    featured: Boolean(prompt.featured),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await updatePrompt(prompt.id, form);
    setSaving(false);
    if (res?.error) {
      setError(res.error);
      onError?.(res.error);
      return;
    }
    onSaved?.("Changes saved.");
  }

  return (
    <Overlay onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[--radius-apple] p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Edit prompt</h2>
            <p className="mt-0.5 text-xs text-muted">/{prompt.slug}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-accent rounded-lg p-1.5 text-muted hover:bg-black/[.05] dark:hover:bg-white/[.08]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Slug">
            <input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={`${inputCls} bg-background`}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description" className="sm:col-span-2">
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Content" className="sm:col-span-2">
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={8}
              className={`${inputCls} resize-y font-mono text-[13px] leading-6`}
            />
          </Field>

          <Field label="Tags (comma-separated)">
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="seo, blog, content"
              className={inputCls}
            />
          </Field>

          <Field label="Models (comma-separated)">
            <input
              value={form.models}
              onChange={(e) => set("models", e.target.value)}
              placeholder="ChatGPT, Claude"
              className={inputCls}
            />
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            Featured on the home page
          </span>
        </label>

        {error && (
          <p className="mt-4 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="focus-accent rounded-full border border-[--card-border] px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="focus-accent inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}) {
  return (
    <Overlay onClose={onCancel}>
      <div className="glass w-full max-w-md rounded-[--radius-apple] p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="focus-accent rounded-full border border-[--card-border] px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="focus-accent inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Overlay ────────────────────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────
function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "focus-accent w-full rounded-xl border border-[--card-border] bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-muted";
