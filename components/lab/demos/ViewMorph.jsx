"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

// View Morph — one set of items, two shapes. The List | Grid toggle swaps the
// container's layout classes and framer's `layout` prop FLIPs every item and
// its parts between row form and tile form: the thumb grows from row-thumb to
// tile-cover, the text block folds from a baseline row into a stacked footer.
// Item identity never changes (same keys, same DOM order in both views), so
// nothing cuts — it's pure bounds animation with a per-item stagger delay.
// Text spans use layout="position" so glyphs translate instead of being
// scale-squashed mid-flight. Hover highlights are plain :hover — they hold
// while the pointer rests.

const ITEMS = [
  { n: "01", title: "Fieldwork", meta: "Photo · 2024", src: "/lab/photo-1.webp" },
  { n: "02", title: "Tidelines", meta: "Film · 2024", src: "/lab/photo-2.webp" },
  { n: "03", title: "Signal", meta: "Web · 2025", src: "/lab/photo-3.webp" },
  { n: "04", title: "Survey", meta: "Study · 2025", src: "/lab/photo-4.webp" },
  { n: "05", title: "Grainbook", meta: "Print · 2026", src: "/lab/photo-2.webp" },
  { n: "06", title: "Nightset", meta: "Live · 2026", src: "/lab/photo-3.webp" },
];

export default function ViewMorph({ reducedMotion }) {
  const [view, setView] = useState("list");
  const grid = view === "grid";

  // Per-item layout spring with a slight stagger — duration 0 collapses the
  // morph to an instant swap under reduced motion.
  const lt = (i) =>
    reducedMotion
      ? { duration: 0 }
      : { type: "spring", stiffness: 420, damping: 36, delay: i * 0.04 };

  return (
    <div
      // Vertical rhythm in cqw (capped for the fullscreen stage): fixed px
      // paddings made 6 rows outgrow the small card, and the list's
      // justify-center then spilled the top rows up over the header.
      className="relative flex h-full w-full flex-col overflow-hidden bg-[#07070a] p-[min(2.5cqw,24px)]"
    >
      <div className="mb-[min(1.5cqw,12px)] flex items-center justify-between">
        <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          Index / 06
        </p>
        <div className="flex border border-lab-line" role="group" aria-label="View mode">
          {["list", "grid"].map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 font-lab-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 ${
                view === v
                  ? "bg-lab-text text-[#0a0a0c]"
                  : "text-lab-dim hover:text-lab-text"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div
        className={
          grid
            ? "grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-2.5"
            : // overflow-hidden is the belt: if rows ever outgrow the card
              // again they clip inside this box instead of bleeding over
              // the header above it.
              "flex min-h-0 flex-1 flex-col justify-center overflow-hidden"
        }
      >
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.n}
            layout
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...(reducedMotion
                ? { duration: 0 }
                : { duration: 0.45, ease: EASE, delay: 0.05 + i * 0.05 }),
              layout: lt(i),
            }}
            className={
              grid
                ? "group relative flex min-h-0 flex-col overflow-hidden border border-lab-line bg-lab-panel transition-colors duration-300 hover:border-white/30"
                : "group flex items-center gap-3 border-t border-lab-line px-1 py-[1.1cqw] transition-colors duration-300 last:border-b hover:bg-white/[0.04]"
            }
          >
            {/* thumb → cover */}
            <motion.div
              layout
              transition={{ layout: lt(i) }}
              className={
                grid
                  ? "relative min-h-0 w-full flex-1 overflow-hidden"
                  : "relative h-[3.4cqw] min-h-5 w-[5.5cqw] min-w-9 shrink-0 overflow-hidden"
              }
            >
              <img
                src={it.src}
                alt=""
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </motion.div>

            {/* text block: baseline row ↔ stacked footer */}
            <motion.div
              layout
              transition={{ layout: lt(i) }}
              className={
                grid
                  ? "flex shrink-0 flex-col gap-0.5 p-2.5"
                  : "flex min-w-0 flex-1 items-baseline gap-3"
              }
            >
              <motion.span
                layout="position"
                transition={{ layout: lt(i) }}
                className="font-lab-mono text-[10px] tracking-[0.25em] text-[#3b82f6]"
              >
                {it.n}
              </motion.span>
              <motion.h3
                layout="position"
                transition={{ layout: lt(i) }}
                className="truncate font-lab-display font-bold uppercase leading-none tracking-tight text-lab-text"
                style={{ fontSize: "clamp(12px, 2.6cqw, 20px)" }}
              >
                {it.title}
              </motion.h3>
              <motion.span
                layout="position"
                transition={{ layout: lt(i) }}
                className={`font-lab-mono text-[9px] uppercase tracking-[0.2em] text-lab-dim ${
                  grid ? "" : "ml-auto shrink-0"
                }`}
              >
                {it.meta}
              </motion.span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <p className="mt-[min(1.5cqw,12px)] font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Toggle the view — every part morphs, nothing cuts
      </p>
    </div>
  );
}
