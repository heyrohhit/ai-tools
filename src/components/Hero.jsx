"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wand2 } from "lucide-react";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { y: 24, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 220, damping: 26 },
  },
};

export default function Hero() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-40 pb-16 text-center"
    >
      <motion.span
        variants={item}
        className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-muted"
      >
        <Wand2 className="h-3.5 w-3.5 text-accent" />
        Prompts that actually work
      </motion.span>

      <motion.h1
        variants={item}
        className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent sm:text-7xl"
      >
        The AI Prompt Hub
        <br />& Generator.
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-6 max-w-xl text-lg leading-8 text-muted sm:text-xl"
      >
        Browse a curated library of battle-tested prompts, or generate a
        structured one for ChatGPT, Claude, and Midjourney in seconds.
      </motion.p>

      <motion.div
        variants={item}
        className="mt-9 flex flex-col gap-3 sm:flex-row"
      >
        <Link
          href="/generator"
          className="focus-accent group flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-base font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
        >
          Generate a prompt
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/library"
          className="focus-accent glass flex h-12 items-center justify-center rounded-full px-7 text-base font-medium transition-transform hover:scale-[1.03] active:scale-95"
        >
          Explore the library
        </Link>
      </motion.div>
    </motion.section>
  );
}
