// Central site config, reused by metadata, sitemap, robots, and JSON-LD.
// Set NEXT_PUBLIC_SITE_URL in production (e.g. https://prompthub.com); falls
// back to localhost for local dev so absolute OG/canonical URLs still resolve.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const siteName = "AI Prompt Hub";

export const siteDescription =
  "A curated hub of high-quality AI prompts plus a free generator for ChatGPT, Claude, and Midjourney.";
