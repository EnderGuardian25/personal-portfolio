"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const links = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#timeline", label: "Timeline" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
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

          {/* Desktop nav */}
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

          <span className="hidden md:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
            Available · 2026
          </span>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 relative z-50"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <motion.span
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px w-full bg-ink origin-center"
            />
            <motion.span
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block h-px w-full bg-ink"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px w-full bg-ink origin-center"
            />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ivory/95 backdrop-blur-sm flex flex-col items-start justify-center px-8 md:hidden"
          >
            <nav className="flex flex-col gap-8">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setOpen(false)}
                  className="font-display text-5xl italic text-ink hover:text-electric transition-colors duration-300"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-16 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
              Available · 2026
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
