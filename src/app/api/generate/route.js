// POST /api/generate — turns the generator form inputs into a polished,
// structured prompt using Google Gemini (free tier). This runs ONLY on the
// server, so the GEMINI_API_KEY never reaches the browser.

export const runtime = "nodejs";

// Gemini's free tier. Override with GEMINI_MODEL if you like.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

// Guardrails so a caller can't push huge payloads at the AI service.
const MAX_LEN = 1000;
const clean = (v) => (typeof v === "string" ? v.trim().slice(0, MAX_LEN) : "");

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

  const system =
    "You are a world-class prompt engineer. You write clear, structured, " +
    "reusable prompts that get excellent results from AI models. You return " +
    "ONLY the finished prompt itself — no preamble, no explanation, no " +
    "markdown code fences. Use [SQUARE_BRACKET] placeholders for anything the " +
    "user should fill in.";

  const user =
    `Write an optimized prompt for ${model}.\n\n` +
    `Goal: ${task}\n` +
    (audience ? `Intended audience: ${audience}\n` : "") +
    `Desired tone: ${tone}\n` +
    `Preferred output format: ${format}\n\n` +
    `Make the prompt specific, include a clear role for the AI, and structure ` +
    `it so the result is high quality and consistent.`;

  try {
    const res = await fetch(GEMINI_URL(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.8 },
      }),
    });

    if (!res.ok) {
      // Surface a friendly message; log the detail server-side only.
      const detail = await res.text();
      console.error("Gemini error:", res.status, detail);
      return Response.json(
        { error: "The AI service returned an error. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const prompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!prompt) {
      return Response.json(
        { error: "No prompt was generated. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ prompt });
  } catch (err) {
    console.error("Generate route failed:", err);
    return Response.json(
      { error: "Could not reach the AI service. Please try again." },
      { status: 502 }
    );
  }
}
