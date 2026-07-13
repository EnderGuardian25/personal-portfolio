"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LAB_PHOTOS } from "@/lib/lab";

// Shared Frame — clicking a thumbnail MORPHS it into the main frame via a
// framer-motion layoutId FLIP (nested card + img ids, the ExpandGrid pattern),
// while the previous main image recedes underneath (dim + slight scale-down,
// removed once covered). The vacated rail slot shows a dim placeholder
// outline.
// Gotcha: layoutIds carry a per-image GENERATION suffix. When an image leaves
// the main frame its generation bumps, so its returning thumbnail mounts under
// a fresh id and simply fades in — with a stable id framer would fly the old
// main image back down into the rail (a reverse morph) instead of the quiet
// crossfade recede, and a recycled id would also morph from a stale snapshot.
const IMAGES = LAB_PHOTOS; // shared photo list — see lib/lab.js

export default function SharedFrame({ reducedMotion }) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null); // index receding under the arrival
  const gens = useRef(IMAGES.map(() => 0));
  // Entrance stagger only on first mount — remounted thumbs after a swap must
  // not replay it (they'd fight the layoutId handoff).
  const introDone = useRef(false);
  useEffect(() => {
    introDone.current = true;
  }, []);

  // Drop the receding copy once the morph has covered it.
  useEffect(() => {
    if (prev == null) return;
    const t = setTimeout(() => setPrev(null), 700);
    return () => clearTimeout(t);
  }, [prev]);

  const t = reducedMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 300, damping: 32 };

  const select = (i) => {
    if (i === active) return;
    gens.current[active] += 1; // fresh id for the returning thumb — no reverse morph
    if (!reducedMotion) setPrev(active);
    setActive(i);
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-hidden bg-[#07070a] p-4 sm:p-5">
      {/* main frame */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {prev != null && (
          <motion.div
            key={`recede-${prev}-${gens.current[prev]}`}
            aria-hidden
            className="absolute inset-0 z-0"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0.4, scale: 0.965 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <img
              src={IMAGES[prev].src}
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          </motion.div>
        )}
        <motion.div
          key={`main-${active}`}
          layoutId={`sf-card-${active}-${gens.current[active]}`}
          transition={t}
          initial={introDone.current ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 overflow-hidden border border-lab-line"
        >
          <motion.div
            layoutId={`sf-img-${active}-${gens.current[active]}`}
            transition={t}
            className="absolute inset-0"
          >
            <img
              src={IMAGES[active].src}
              alt={IMAGES[active].caption}
              draggable={false}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* caption row */}
      <div className="flex shrink-0 items-center justify-between font-lab-mono text-[10px] uppercase tracking-[0.25em]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
            className="truncate text-lab-text"
          >
            {IMAGES[active].caption}
          </motion.span>
        </AnimatePresence>
        <span className="text-lab-dim">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(IMAGES.length).padStart(2, "0")}
        </span>
      </div>

      {/* thumbnail rail */}
      <div className="grid h-[13cqw] min-h-[52px] shrink-0 grid-cols-4 gap-2">
        {IMAGES.map((img, i) =>
          i === active ? (
            // dim placeholder outline where the promoted thumb used to sit
            <div
              key={`slot-${i}`}
              className="flex items-center justify-center border border-dashed border-lab-line/70"
            >
              <span className="font-lab-mono text-[9px] tracking-[0.25em] text-lab-dim/60">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ) : (
            <motion.button
              key={`thumb-${i}-${gens.current[i]}`}
              type="button"
              aria-label={`Show ${img.caption}`}
              onClick={() => select(i)}
              layoutId={`sf-card-${i}-${gens.current[i]}`}
              // returning thumb waits a beat so it appears as the morph departs;
              // first mount staggers the rail in. Delay rides on the button's own
              // transition only — the morph itself uses the main frame's `t`.
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { ...t, delay: introDone.current ? 0.15 : 0.1 + i * 0.06 }
              }
              initial={{ opacity: 0, y: introDone.current ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden border border-lab-line p-0"
            >
              <motion.div
                layoutId={`sf-img-${i}-${gens.current[i]}`}
                transition={t}
                className="absolute inset-0"
              >
                <img
                  src={img.src}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover opacity-80 transition-opacity hover:opacity-100"
                />
              </motion.div>
              <span className="absolute left-1.5 top-1.5 z-10 font-lab-mono text-[9px] tracking-[0.2em] text-white/70">
                {String(i + 1).padStart(2, "0")}
              </span>
            </motion.button>
          )
        )}
      </div>
    </div>
  );
}
