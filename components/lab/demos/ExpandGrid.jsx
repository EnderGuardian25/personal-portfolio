"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

// Expand Grid — framer-motion shared-element FLIP. Tile and detail panel
// share a layoutId (card + inner image), so clicking unmounts the tile and
// mounts the panel while framer animates the bounds between them; the
// remaining tiles dim and recede, and step back in staggered on close.

const TILES = [
  { src: "/lab/photo-1.webp", title: "Isle", meta: "01 · Field study", blurb: "Shot on the northern headland an hour before the storm made landfall." },
  { src: "/lab/photo-2.webp", title: "Shore", meta: "02 · Longform", blurb: "The tide keeps its own ledger — every retreat leaves a line in the sand." },
  { src: "/lab/photo-3.webp", title: "Storm", meta: "03 · Series", blurb: "Weather fronts read like typography if you squint hard enough." },
  { src: "/lab/photo-4.webp", title: "Grid", meta: "04 · Study", blurb: "Structure first: the frame decides what the light is allowed to do." },
];

export default function ExpandGrid({ reducedMotion }) {
  const [open, setOpen] = useState(null);
  // Entrance stagger only on first mount — remounting tiles after a close
  // must not replay "hidden" or they'd fight the layoutId handoff.
  const introDone = useRef(false);
  useEffect(() => {
    introDone.current = true;
  }, []);

  const t = reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 };
  const variants = {
    hidden: { opacity: 0, y: 26, scale: 1 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 300, damping: 26, delay: i * 0.07 },
    }),
    dim: { opacity: 0.25, y: 0, scale: 0.95, transition: t },
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07070a] p-4 sm:p-6">
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
        {TILES.map((tile, i) => (
          <div key={tile.title} className="relative">
            {open !== i && (
              <motion.button
                type="button"
                layoutId={`eg-card-${i}`}
                aria-label={`Expand ${tile.title}`}
                onClick={() => setOpen(i)}
                custom={i}
                variants={variants}
                initial={introDone.current ? false : "hidden"}
                animate={open === null || open === i ? "show" : "dim"}
                transition={t}
                className="relative block h-full w-full overflow-hidden border border-lab-line text-left"
              >
                <motion.div layoutId={`eg-img-${i}`} transition={t} className="absolute inset-0">
                  <Image src={tile.src} alt="" fill sizes="50vw" className="object-cover" draggable={false} />
                </motion.div>
                <span className="absolute bottom-2 left-2 z-10 font-lab-mono text-[10px] uppercase tracking-[0.25em] text-white/75">
                  {tile.meta}
                </span>
              </motion.button>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            key="scrim"
            className="absolute inset-0 z-[9] bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            onClick={() => setOpen(null)}
            aria-hidden
          />
        )}
        {open !== null && (
          <motion.div
            key={`panel-${open}`}
            layoutId={`eg-card-${open}`}
            transition={t}
            className="absolute inset-3 z-10 flex flex-col overflow-hidden border border-lab-line bg-lab-panel sm:inset-6 sm:flex-row"
          >
            <motion.div layoutId={`eg-img-${open}`} transition={t} className="relative min-h-0 flex-1">
              <Image src={TILES[open].src} alt="" fill sizes="80vw" className="object-cover" draggable={false} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: reducedMotion ? { duration: 0 } : { delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              }}
              exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.12 } }}
              className="flex w-full shrink-0 flex-col justify-between gap-3 p-4 sm:w-56 sm:p-5"
            >
              <div>
                <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">{TILES[open].meta}</p>
                <h3
                  className="mt-2 font-lab-display font-extrabold uppercase leading-none tracking-tight text-lab-text"
                  // caps at 38px — the panel is w-56 (~204px inner); 52px Syne
                  // 800 caps ran ~220px for "STORM"/"SHORE" and clipped
                  style={{ fontSize: "min(6cqw, 38px)" }}
                >
                  {TILES[open].title}
                </h3>
                <p className="mt-3 text-[12px] leading-relaxed text-lab-dim">{TILES[open].blurb}</p>
              </div>
              <span className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-[#3b82f6]">Open study →</span>
            </motion.div>
            <motion.button
              type="button"
              aria-label="Close detail"
              onClick={() => setOpen(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: reducedMotion ? 0 : 0.2 } }}
              exit={{ opacity: 0 }}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-lab-line bg-black/50 font-lab-mono text-[12px] text-lab-text"
            >
              ✕
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="pointer-events-none absolute bottom-4 left-5 z-[5] font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Tap a tile — shared-element handoff
      </p>
    </div>
  );
}
