// Seed prompt data for the AI Prompt Hub.
//
// This is the single source of truth today. It is shaped to match a future
// Supabase `prompts` table 1:1 (see supabase/schema.sql), so migrating to the
// database later is a drop-in swap inside src/lib/prompts.js — no shape changes
// needed in the UI.
//
// Prompt shape:
//   id          number  — stable identifier
//   slug        string  — URL segment (/prompts/<slug>), unique
//   title       string  — short human title
//   description string  — one-line summary (used in cards + meta descriptions)
//   content     string  — the actual prompt body users copy
//   category    string  — must match one of `categories` below (.id)
//   tags        string[] — searchable keywords
//   models      string[] — target models this prompt is tuned for
//   featured    boolean — surfaced on the home page

export const categories = [
  { id: "writing", label: "Writing", emoji: "✍️" },
  { id: "coding", label: "Coding", emoji: "💻" },
  { id: "marketing", label: "Marketing", emoji: "📣" },
  { id: "business", label: "Business", emoji: "📊" },
  { id: "image", label: "Image", emoji: "🎨" },
  { id: "productivity", label: "Productivity", emoji: "⚡" },
];

export const prompts = [
  {
    id: 1,
    slug: "blog-post-outline",
    title: "SEO Blog Post Outline",
    description:
      "Generate a structured, search-optimized blog outline for any topic.",
    content:
      "You are an expert SEO content strategist. Create a detailed blog post outline for the topic: \"[TOPIC]\".\n\nInclude:\n- An H1 title (under 60 characters, includes the primary keyword)\n- A one-sentence meta description (under 155 characters)\n- 5–7 H2 sections with 2–3 bullet points each\n- A suggested list of 5 related long-tail keywords\n- A short FAQ section (3 questions) targeting \"People Also Ask\"\n\nWrite in a clear, authoritative tone aimed at [AUDIENCE].",
    category: "writing",
    tags: ["blog", "seo", "content", "outline", "writing"],
    models: ["ChatGPT", "Claude"],
    featured: true,
  },
  {
    id: 2,
    slug: "code-reviewer",
    title: "Senior Code Reviewer",
    description:
      "Get a rigorous, actionable code review with severity-ranked findings.",
    content:
      "You are a senior software engineer performing a thorough code review. Review the following code:\n\n```\n[PASTE CODE]\n```\n\nFor each issue, provide:\n1. Severity (Critical / High / Medium / Low)\n2. The exact location (function or line)\n3. Why it's a problem\n4. A concrete fix (with a code snippet)\n\nCover correctness bugs, security, performance, and readability. End with the single highest-impact change to make first.",
    category: "coding",
    tags: ["code review", "engineering", "bugs", "refactor", "coding"],
    models: ["Claude", "ChatGPT"],
    featured: true,
  },
  {
    id: 3,
    slug: "cold-email-writer",
    title: "High-Converting Cold Email",
    description:
      "Write a concise, personalized cold outreach email that gets replies.",
    content:
      "You are a B2B sales copywriter. Write a cold email to [PROSPECT ROLE] at [COMPANY].\n\nContext about my product: [PRODUCT DESCRIPTION]\nThe specific pain point I solve: [PAIN POINT]\n\nRules:\n- Under 120 words\n- A personalized first line referencing [SPECIFIC DETAIL]\n- One clear value proposition\n- A single, low-friction call to action (a question, not a meeting demand)\n- No buzzwords, no \"I hope this email finds you well\"\n\nProvide 2 subject line options.",
    category: "marketing",
    tags: ["email", "sales", "outreach", "copywriting", "marketing"],
    models: ["ChatGPT", "Claude"],
    featured: true,
  },
  {
    id: 4,
    slug: "midjourney-product-shot",
    title: "Midjourney Product Photography",
    description:
      "Craft a detailed Midjourney prompt for a studio-quality product shot.",
    content:
      "A professional studio product photograph of [PRODUCT], centered on a [SURFACE/BACKGROUND], soft diffused lighting from the left, subtle reflections, shallow depth of field, ultra-detailed, commercial advertising style, shot on a 85mm lens --ar 4:5 --style raw --v 6",
    category: "image",
    tags: ["midjourney", "image", "product", "photography", "design"],
    models: ["Midjourney"],
    featured: false,
  },
  {
    id: 5,
    slug: "meeting-summarizer",
    title: "Meeting Notes → Action Items",
    description:
      "Turn messy meeting notes into a clean summary with owners and deadlines.",
    content:
      "You are an executive assistant. Turn the following raw meeting notes into a structured summary:\n\n[PASTE NOTES]\n\nOutput exactly these sections:\n1. **TL;DR** — 2 sentences\n2. **Key Decisions** — bulleted\n3. **Action Items** — a table with columns: Task | Owner | Due Date\n4. **Open Questions** — bulleted\n\nIf an owner or due date is unknown, write \"TBD\".",
    category: "productivity",
    tags: ["meeting", "summary", "notes", "action items", "productivity"],
    models: ["ChatGPT", "Claude"],
    featured: true,
  },
  {
    id: 6,
    slug: "business-plan-lean",
    title: "Lean One-Page Business Plan",
    description:
      "Draft a focused one-page business plan from a single idea sentence.",
    content:
      "You are a startup advisor. Turn this idea into a one-page lean business plan:\n\nIdea: [ONE SENTENCE IDEA]\n\nUse the lean canvas structure:\n- Problem\n- Customer Segments\n- Unique Value Proposition\n- Solution\n- Channels\n- Revenue Streams\n- Cost Structure\n- Key Metrics\n- Unfair Advantage\n\nKeep each section to 2–3 bullet points. Be specific and realistic, not generic.",
    category: "business",
    tags: ["startup", "business plan", "strategy", "lean canvas", "business"],
    models: ["ChatGPT", "Claude"],
    featured: false,
  },
  {
    id: 7,
    slug: "explain-like-expert",
    title: "Explain Anything, Two Levels",
    description:
      "Explain any concept simply, then at an expert level — great for learning.",
    content:
      "Explain the concept of \"[CONCEPT]\" twice:\n\n1. **Like I'm 12** — a simple analogy anyone can grasp, no jargon.\n2. **Like I'm an expert** — precise, technical, with the key terms and the one common misconception people get wrong.\n\nEnd with a 3-item \"What to learn next\" list.",
    category: "productivity",
    tags: ["learning", "explain", "education", "teaching", "productivity"],
    models: ["ChatGPT", "Claude"],
    featured: false,
  },
  {
    id: 8,
    slug: "react-component-builder",
    title: "Production React Component",
    description:
      "Generate a clean, accessible React component to a precise spec.",
    content:
      "You are a senior React engineer. Build a component to this spec:\n\nComponent: [NAME]\nProps: [LIST PROPS + TYPES]\nBehavior: [DESCRIBE BEHAVIOR]\n\nRequirements:\n- Functional component with hooks\n- Accessible (proper ARIA, keyboard support)\n- Tailwind CSS for styling\n- Handle loading and empty states\n- No external dependencies unless necessary\n\nReturn only the component code, then a 2-line usage example.",
    category: "coding",
    tags: ["react", "component", "frontend", "tailwind", "coding"],
    models: ["Claude", "ChatGPT"],
    featured: false,
  },
  {
    id: 9,
    slug: "twitter-thread",
    title: "Viral Twitter/X Thread",
    description:
      "Turn one idea into an engaging, well-structured X thread.",
    content:
      "You are a social media ghostwriter. Write a Twitter/X thread about: [TOPIC].\n\nStructure:\n- Hook tweet (bold claim or surprising fact, under 200 chars)\n- 5–8 body tweets, each one standalone-valuable\n- A closing tweet with a soft CTA to follow/reply\n\nUse short lines, no hashtags, and one concrete example or number per tweet. Number the tweets.",
    category: "marketing",
    tags: ["twitter", "x", "thread", "social media", "marketing"],
    models: ["ChatGPT", "Claude"],
    featured: false,
  },
  {
    id: 10,
    slug: "logo-concept",
    title: "Minimalist Logo Concept",
    description:
      "Generate a clean vector-style logo concept prompt for any brand.",
    content:
      "Minimalist vector logo for \"[BRAND NAME]\", a [INDUSTRY] company. Simple geometric mark, [COLOR] on white background, flat design, negative space, memorable and scalable, no text, no gradients, centered --v 6 --style raw",
    category: "image",
    tags: ["logo", "branding", "design", "vector", "midjourney"],
    models: ["Midjourney"],
    featured: false,
  },
  {
    id: 11,
    slug: "competitor-analysis",
    title: "Competitor Analysis Matrix",
    description:
      "Produce a structured competitor comparison for a market or product.",
    content:
      "You are a market analyst. Build a competitor analysis for [MY PRODUCT/COMPANY] in the [MARKET] space.\n\nCompare against these competitors: [LIST 3–5].\n\nOutput a markdown table with rows for: Pricing, Target Customer, Core Strength, Core Weakness, Key Differentiator.\n\nThen write a short \"Where we can win\" paragraph identifying the clearest gap in the market.",
    category: "business",
    tags: ["competitor", "analysis", "market research", "strategy", "business"],
    models: ["ChatGPT", "Claude"],
    featured: false,
  },
  {
    id: 12,
    slug: "story-continuation",
    title: "Fiction Co-Writer",
    description:
      "Continue a story in a consistent voice with vivid, controlled pacing.",
    content:
      "You are a fiction co-writer. Continue the following story, matching its tone, tense, and point of view exactly:\n\n[PASTE STORY SO FAR]\n\nWrite the next [N] paragraphs. Advance the plot with one concrete new development, show don't tell, and end on a subtle hook. Do not summarize what came before.",
    category: "writing",
    tags: ["fiction", "story", "creative writing", "narrative", "writing"],
    models: ["Claude", "ChatGPT"],
    featured: false,
  },
];
