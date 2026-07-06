// POST /api/generate — turns the generator form inputs into a polished,
// structured prompt using Google Gemini, then PERSISTS it to Supabase so the
// prompt becomes a public, reusable, SEO-indexed page (/prompts/<slug>).
//
// Dedup: identical inputs map to a deterministic hash. If a prompt with that
// hash already exists we return it instantly — no AI call, no duplicate row.
//
// This runs ONLY on the server, so GEMINI_API_KEY never reaches the browser.
// Writes use the anon client and are allowed by the RLS "generated" insert
// policy (see supabase/schema.sql).

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { categories } from "@/data/prompts";
import {
  getPromptByInputHash,
  createGeneratedPrompt,
} from "@/lib/prompts";

export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

const MAX_LEN = 1000;
const clean = (v) => (typeof v === "string" ? v.trim().slice(0, MAX_LEN) : "");

const CATEGORY_IDS = categories.map((c) => c.id);

// Deterministic hash of the normalized inputs. Lowercased + collapsed whitespace
// so trivial formatting differences still dedup to the same stored prompt.
function inputHash({ task, audience, model, tone, format }) {
  const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const key = [task, audience, model, tone, format].map(norm).join("|");
  return createHash("sha256").update(key).digest("hex");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "The generator isn't configured. Missing GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const task = clean(body.task);
  if (!task) {
    return Response.json(
      { error: "Please describe what the prompt should do." },
      { status: 400 }
    );
  }

  const audience = clean(body.audience);
  const model = clean(body.model) || "ChatGPT";
  const tone = clean(body.tone) || "Professional";
  const format = clean(body.format) || "Step-by-step instructions";

  const hash = inputHash({ task, audience, model, tone, format });

  // 1) Reuse: if this exact request was already generated, return it as-is.
  const existing = await getPromptByInputHash(hash);
  if (existing) {
    return Response.json({
      prompt: existing.content,
      slug: existing.slug,
      reused: true,
    });
  }

  // 2) Generate. Ask Gemini for the prompt AND its library metadata as JSON so
  //    every generation becomes a well-formed, categorized, tagged library page.
  const system =
    "You are a world-class prompt engineer and SEO editor. You write clear, " +
    "structured, reusable prompts and concise metadata for a public prompt " +
    "library. Use [SQUARE_BRACKET] placeholders inside prompts for anything the " +
    "user should fill in. Return ONLY valid JSON — no markdown, no code fences.";

  const user =
    `Create an optimized prompt for ${model} and its library metadata.\n\n` +
    `Goal: ${task}\n` +
    (audience ? `Intended audience: ${audience}\n` : "") +
    `Desired tone: ${tone}\n` +
    `Preferred output format: ${format}\n\n` +
    `Return a JSON object with EXACTLY these keys:\n` +
    `- "prompt": the finished prompt (string, no preamble, no code fences)\n` +
    `- "title": a short, specific title, max 60 characters\n` +
    `- "description": a one-sentence summary, max 155 characters\n` +
    `- "category": one of ${JSON.stringify(CATEGORY_IDS)}\n` +
    `- "tags": an array of 3-6 lowercase keyword strings`;

  let generated;
  try {
    const res = await fetch(GEMINI_URL(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Gemini error:", res.status, detail);
      return Response.json(
        { error: "The AI service returned an error. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) throw new Error("empty response");
    generated = JSON.parse(raw);
  } catch (err) {
    console.error("Generate route failed:", err);
    return Response.json(
      { error: "Could not generate a prompt. Please try again." },
      { status: 502 }
    );
  }

  const promptText = clean(generated.prompt);
  if (!promptText) {
    return Response.json(
      { error: "No prompt was generated. Please try again." },
      { status: 502 }
    );
  }

  // Normalize / validate the model-provided metadata before it hits the DB.
  const title = (clean(generated.title) || task).slice(0, 90);
  const description =
    (clean(generated.description) || `A ${tone.toLowerCase()} prompt for ${model}.`).slice(0, 155);
  const category = CATEGORY_IDS.includes(generated.category)
    ? generated.category
    : model.toLowerCase() === "midjourney"
    ? "image"
    : "productivity";
  const tags = Array.isArray(generated.tags)
    ? generated.tags
        .filter((t) => typeof t === "string")
        .map((t) => t.toLowerCase().trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];

  // Slug must be unique; suffix with a short hash slice so distinct requests
  // with similar titles never collide.
  const slug = `${slugify(title) || "prompt"}-${hash.slice(0, 8)}`;

  const row = {
    slug,
    title,
    description,
    content: promptText,
    category,
    tags,
    models: [model],
    input_hash: hash,
  };

  const saved = await createGeneratedPrompt(row);

  // If the save failed, still return the prompt so the user isn't blocked.
  if (!saved) {
    return Response.json({ prompt: promptText, slug: null, saved: false });
  }

  // Refresh the dynamic listings so the new prompt shows up immediately.
  revalidatePath("/library");
  revalidatePath("/");
  revalidatePath(`/prompts/${saved.slug}`);

  return Response.json({
    prompt: saved.content,
    slug: saved.slug,
    reused: false,
    saved: true,
  });
}
