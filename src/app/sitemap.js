import { getAllSlugs } from "@/lib/prompts";
import { siteUrl } from "@/lib/site";

// Re-crawl the sitemap hourly so newly generated prompts get indexed.
export const revalidate = 3600;

export default async function sitemap() {
  const staticRoutes = ["", "/library", "/generator"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const slugs = await getAllSlugs();
  const promptRoutes = slugs.map((slug) => ({
    url: `${siteUrl}/prompts/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...promptRoutes];
}
