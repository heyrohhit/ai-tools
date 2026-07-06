import Generator from "@/components/Generator";
import StructuredData from "@/components/StructuredData";

export const metadata = {
  title: "AI Prompt Generator — Build Prompts for ChatGPT, Claude & Midjourney",
  description:
    "Generate structured, high-quality AI prompts in seconds. Describe your goal, pick a model and tone, and get a reusable prompt built for ChatGPT, Claude, or Midjourney.",
  alternates: { canonical: "/generator" },
};

const faqs = [
  {
    q: "What is an AI prompt generator?",
    a: "An AI prompt generator turns a short description of your goal into a detailed, structured prompt. It adds a clear role, context, and output format so the AI model returns better, more consistent results.",
  },
  {
    q: "Which AI models does it support?",
    a: "You can generate prompts optimized for ChatGPT, Claude, and Midjourney. The generator tailors the structure and phrasing to the model you choose.",
  },
  {
    q: "Is the AI prompt generator free to use?",
    a: "Yes. Describe your task, pick a model and tone, and generate a ready-to-use prompt at no cost. You can then copy it directly into your AI tool of choice.",
  },
  {
    q: "How do I write a good AI prompt?",
    a: "Give the AI a clear role, specific context, and a defined output format. Use placeholders for variable details, and state the tone and audience. The generator applies all of these best practices automatically.",
  },
];

export default function GeneratorPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pt-36 pb-12">
      <StructuredData data={faqSchema} />

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          AI Prompt Generator
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Describe your goal and get a structured, reusable prompt for ChatGPT,
          Claude, or Midjourney — in seconds.
        </p>
      </header>

      <Generator />

      {/* Human-readable FAQ (mirrors the FAQPage schema above for SEO/AEO) */}
      <section className="mx-auto mt-24 max-w-3xl px-6">
        <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="glass group rounded-2xl p-5 [&_summary]:cursor-pointer"
            >
              <summary className="focus-accent flex list-none items-center justify-between font-medium">
                {f.q}
                <span className="text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
