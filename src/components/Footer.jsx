import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[--card-border] py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-accent" />
          AI Prompt Hub
        </Link>
        <nav className="flex gap-6 text-sm text-muted">
          <Link href="/library" className="hover:text-foreground">
            Library
          </Link>
          <Link href="/generator" className="hover:text-foreground">
            Generator
          </Link>
        </nav>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} AI Prompt Hub
        </p>
      </div>
    </footer>
  );
}
