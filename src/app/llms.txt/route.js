// GET /llms.txt — the emerging llms.txt standard (AEO/GEO/LLMS).
// A plain-text map of the site + every prompt so LLMs and answer engines can
// discover, understand, and cite this content. Regenerated from the DB, so it
// always includes freshly generated prompts.

import { getAllPrompts } from "@/lib/prompts";
import { siteUrl, siteName, siteDescription } from "@/lib/site";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  const prompts = await getAllPrompts();

  const lines = [
    `# ${siteName}`,
    "",
    `> ${siteDescription}`,
    "",
    "AI Prompt Hub is a dynamic, continuously growing library of curated and",
    "AI-generated prompts for ChatGPT, Claude, and Midjourney. Every prompt has",
    "its own page and is free to copy and reuse.",
    "",
    "## Key pages",
    `- [Home](${siteUrl}/): featured prompts and overview`,
    `- [Prompt Library](${siteUrl}/library): browse & search all prompts`,
    `- [Prompt Generator](${siteUrl}/generator): create a new structured prompt`,
    "",
    `## Prompts (${prompts.length})`,
    ...prompts.map(
      (p) =>
        `- [${p.title}](${siteUrl}/prompts/${p.slug}): ${p.description}` +
        (p.category ? ` (category: ${p.category})` : "")
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
