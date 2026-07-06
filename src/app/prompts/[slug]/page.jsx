import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import StructuredData from "@/components/StructuredData";
import { getPromptBySlug, getAllSlugs } from "@/lib/prompts";
import { siteUrl, siteName } from "@/lib/site";

// Pre-render known prompt pages at build time (SSG) for speed + SEO. New,
// runtime-generated prompts are rendered on-demand (dynamicParams) and then
// cached; revalidate keeps content fresh.
export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return { title: "Prompt not found" };

  return {
    title: prompt.title,
    description: prompt.description,
    alternates: { canonical: `/prompts/${prompt.slug}` },
    openGraph: {
      title: `${prompt.title} | ${siteName}`,
      description: prompt.description,
      type: "article",
      url: `${siteUrl}/prompts/${prompt.slug}`,
    },
  };
}

export default async function PromptPage({ params }) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) notFound();

  const url = `${siteUrl}/prompts/${prompt.slug}`;

  // CreativeWork describes the prompt itself (AEO/GEO — answer & generative
  // engines read this to understand and cite the content).
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: prompt.title,
    headline: prompt.title,
    description: prompt.description,
    url,
    keywords: prompt.tags.join(", "),
    genre: prompt.category,
    text: prompt.content,
    inLanguage: "en",
    isAccessibleForFree: true,
    ...(prompt.created_at ? { datePublished: prompt.created_at } : {}),
    publisher: { "@type": "Organization", name: siteName },
  };

  // Breadcrumb helps search engines render a rich navigation trail.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Library", item: `${siteUrl}/library` },
      { "@type": "ListItem", position: 3, name: prompt.title, item: url },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-6 pt-36 pb-12">
      <StructuredData data={creativeWorkSchema} />
      <StructuredData data={breadcrumbSchema} />

      <Link
        href="/library"
        className="focus-accent mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-black/[.05] px-2.5 py-1 text-xs font-medium capitalize text-muted dark:bg-white/[.08]">
          {prompt.category}
        </span>
        {prompt.models.map((m) => (
          <span
            key={m}
            className="rounded-full border border-[--card-border] px-2 py-0.5 text-[11px] font-medium text-muted"
          >
            {m}
          </span>
        ))}
      </div>

      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {prompt.title}
      </h1>
      <p className="mt-4 text-lg text-muted">{prompt.description}</p>

      <div className="glass mt-8 rounded-[--radius-apple] p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            The prompt
          </h2>
          <CopyButton
            text={prompt.content}
            label="Copy prompt"
            className="text-accent hover:bg-black/[.05] dark:hover:bg-white/[.08]"
          />
        </div>
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6">
          {prompt.content}
        </pre>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {prompt.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-black/[.04] px-3 py-1 text-xs text-muted dark:bg-white/[.06]"
          >
            #{t}
          </span>
        ))}
      </div>
    </article>
  );
}
