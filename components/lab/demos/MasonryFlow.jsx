"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

// Masonry Flow — JS masonry, no CSS columns: each visible tile is dealt into
// the currently-shortest column and absolutely positioned, with the whole
// wall scaled to fit the stage height. Framer springs on x/y/height make
// survivors glide on every filter; entrants pop in staggered and leavers
// shrink out through AnimatePresence.

const ITEMS = [
  { id: "a1", kind: "a", src: "/lab/photo-1.webp", r: 0.7 },
  { id: "b1", kind: "b", word: "FLOW", r: 0.46 },
  { id: "a2", kind: "a", src: "/lab/photo-2.webp", r: 0.94 },
  { id: "a3", kind: "a", src: "/lab/photo-3.webp", r: 0.62 },
  { id: "b2", kind: "b", word: "SORT", r: 0.72 },
  { id: "a4", kind: "a", src: "/lab/photo-4.webp", r: 0.8 },
  { id: "b3", kind: "b", word: "GLIDE", r: 0.52 },
  { id: "a5", kind: "a", src: "/lab/photo-2.webp", r: 0.58 },
  { id: "b4", kind: "b", word: "HOME", r: 0.64 },
];
const FILTERS = [
  { id: "all", label: "All" },
  { id: "a", label: "Type A" },
  { id: "b", label: "Type B" },
];
const GAP = 10;

export default function MasonryFlow({ reducedMotion }) {
  const wallRef = useRef(null);
  const prevIds = useRef(null); // ids placed last render — distinguishes entrants
  const [filter, setFilter] = useState("all");
  const [size, setSize] = useState(null);

  useEffect(() => {
    const el = wallRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Shortest-column placement, then a uniform vertical scale so the tallest
  // column fills (and never overflows) the stage.
  const visible = ITEMS.filter((it) => filter === "all" || it.kind === filter);
  let placed = [];
  if (size && size.w > 0) {
    const cols = size.w < 420 ? 2 : 3;
    const colW = (size.w - (cols - 1) * GAP) / cols;
    const hts = new Array(cols).fill(0);
    const raw = visible.map((it) => {
      const c = hts.indexOf(Math.min(...hts));
      const h = colW * it.r;
      const p = { it, x: c * (colW + GAP), y: hts[c], h };
      hts[c] += h + GAP;
      return p;
    });
    const total = Math.max(...hts) - GAP;
    const s = Math.min(1.6, Math.max(0.55, size.h / total));
    placed = raw.map((p) => ({ ...p, y: p.y * s, w: colW, h: p.h * s }));
  }

  useEffect(() => {
    prevIds.current = new Set(placed.map((p) => p.it.id));
  });

  let enterCount = 0;
  const springT = (delay) =>
    reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30, delay };

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden bg-[#07070a] p-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`border px-3 py-1.5 font-lab-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 ${
                filter === f.id
                  ? "border-lab-text bg-lab-text text-[#0a0a0c]"
                  : "border-lab-line text-lab-dim hover:text-lab-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="font-lab-mono text-[10px] tracking-[0.25em] text-lab-dim">
          <span className="text-[#3b82f6]">{visible.length}</span> / {ITEMS.length}
        </p>
      </div>

      <div ref={wallRef} className="relative min-h-0 flex-1">
        <AnimatePresence>
          {placed.map((p) => {
            const isNew = !prevIds.current || !prevIds.current.has(p.it.id);
            const delay = isNew ? enterCount++ * 0.055 : 0;
            return (
              <motion.div
                key={p.it.id}
                className="absolute left-0 top-0 overflow-hidden border border-lab-line"
                initial={{ opacity: 0, scale: 0.7, x: p.x, y: p.y, width: p.w, height: p.h }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: p.x,
                  y: p.y,
                  width: p.w,
                  height: p.h,
                  transition: springT(delay),
                }}
                exit={{
                  opacity: 0,
                  scale: 0.6,
                  transition: reducedMotion ? { duration: 0 } : { duration: 0.26, ease: [0.32, 0, 0.67, 0] },
                }}
              >
                {p.it.src ? (
                  <>
                    <Image src={p.it.src} alt="" fill sizes="300px" className="object-cover" draggable={false} />
                    <span className="absolute bottom-1.5 left-2 font-lab-mono text-[9px] tracking-[0.25em] text-white/70">
                      A·{p.it.id.slice(1)}
                    </span>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col justify-between bg-lab-panel p-3">
                    <span className="font-lab-mono text-[9px] tracking-[0.25em] text-lab-dim">TYPE B</span>
                    <span
                      className="font-lab-display font-bold uppercase leading-none tracking-tight text-lab-text"
                      style={{ fontSize: p.w * 0.18 }}
                    >
                      {p.it.word}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Filter the wall — survivors glide to new homes
      </p>
    </div>
  );
}
