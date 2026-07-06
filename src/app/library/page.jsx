import PromptLibrary from "@/components/PromptLibrary";
import StructuredData from "@/components/StructuredData";
import { getAllPrompts, getCategories } from "@/lib/prompts";
import { siteUrl } from "@/lib/site";

// ISR: the library reflects newly generated prompts within a minute.
export const revalidate = 60;

export const metadata = {
  title: "Prompt Library — Browse & Search AI Prompts",
  description:
    "Browse and search a curated library of AI prompts for writing, coding, marketing, business, and image generation. Filter by category and copy instantly.",
  alternates: { canonical: "/library" },
};

export default async function LibraryPage() {
  const [prompts, categories] = await Promise.all([
    getAllPrompts(),
    getCategories(),
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI Prompt Library",
    numberOfItems: prompts.length,
    itemListElement: prompts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/prompts/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pt-36 pb-12">
      <StructuredData data={itemListSchema} />

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Prompt Library
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          {prompts.length} curated prompts. Search, filter by category, and copy
          any prompt in one click.
        </p>
      </header>

      <PromptLibrary prompts={prompts} categories={categories} />
    </div>
  );
}
