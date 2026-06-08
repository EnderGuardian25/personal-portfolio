"use client";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { SHORT_YEAR } from "@/lib/site";

// Dedicated navbar for the /services route. The homepage nav's in-page scroll
// anchors (About, Work, Timeline…) are meaningless here, so instead of carrying
// them over, this nav mirrors the homepage's hero "Services" button — a single
// electric "Portfolio" button that links back to the homepage.
export default function ServicesNav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 mix-blend-multiply dark:mix-blend-screen"
    >
      <div className="px-6 md:px-10 py-6 flex items-center justify-between">
        {/* Left: logo — scrolls back to the top of the services page */}
        <a href="#top" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
          <span className="opacity-50">DDC</span> / <span>Services &rsquo;{SHORT_YEAR}</span>
        </a>

        {/* Right: theme toggle + Portfolio button (mirrors the hero Services button) */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="/"
            data-hover
            className="group inline-flex items-center gap-2 bg-electric text-ivory hover:bg-electric/90 dark:bg-ink dark:text-ivory dark:hover:bg-ink/90 mix-blend-normal isolate px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300"
          >
            Portfolio
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
