"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Copy-to-clipboard button with transient "Copied" state. Shared by the prompt
// cards, the detail page, and the generator output.
export default function CopyButton({ text, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure context / permissions). Fail quietly.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : label}
      className={`focus-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
