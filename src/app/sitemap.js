import { getAllSlugs } from "@/lib/prompts";
import { siteUrl } from "@/lib/site";

export default function sitemap() {
  const staticRoutes = ["", "/library", "/generator"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const promptRoutes = getAllSlugs().map((slug) => ({
    url: `${siteUrl}/prompts/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...promptRoutes];
}
