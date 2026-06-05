"use client";
import { motion } from "framer-motion";

const links = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#timeline", label: "Timeline" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 mix-blend-multiply"
    >
      <div className="px-6 md:px-10 py-6 flex items-center justify-between">
        <a href="#top" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
          <span className="opacity-50">DDC</span> / <span>Portfolio &rsquo;26</span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink link-line"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="hidden md:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
          Available · 2026
        </a>
      </div>
    </motion.header>
  );
}
