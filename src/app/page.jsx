import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/Hero";
import FeaturedPrompts from "@/components/FeaturedPrompts";
import StructuredData from "@/components/StructuredData";
import { getFeaturedPrompts } from "@/lib/prompts";
import { siteUrl, siteName, siteDescription } from "@/lib/site";

// Render featured prompts from live Supabase data at request time (not baked in
// at build), so the home page never shows a stale/empty list after deploy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await getFeaturedPrompts();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/library?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <StructuredData data={websiteSchema} />
      <Hero />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Featured prompts
            </h2>
            <p className="mt-1 text-muted">
              Hand-picked, ready to copy and use today.
            </p>
          </div>
          <Link
            href="/library"
            className="focus-accent hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <FeaturedPrompts prompts={featured} />
      </section>

      {/* Generator CTA */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="glass flex flex-col items-center gap-5 rounded-[--radius-apple] px-8 py-14 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Need something custom? Generate a prompt in seconds.
          </h2>
          <p className="max-w-xl text-muted">
            Describe your goal, pick a model and tone, and get a structured,
            reusable prompt built for ChatGPT, Claude, or Midjourney.
          </p>
          <Link
            href="/generator"
            className="focus-accent group flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-base font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            Open the generator
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
