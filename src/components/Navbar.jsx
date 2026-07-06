"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/generator", label: "Generator" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div className="glass-nav flex items-center gap-1 rounded-full py-2 pl-4 pr-2">
        <Link
          href="/"
          className="focus-accent mr-1 flex items-center gap-1.5 rounded-full pr-2 text-sm font-semibold tracking-tight"
        >
          <Sparkles className="h-4 w-4 text-accent" strokeWidth={2.2} />
          <span>Prompt Hub</span>
        </Link>

        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="focus-accent relative rounded-full px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-black/[.06] dark:bg-white/[.1]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 ${active ? "text-foreground" : ""}`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
