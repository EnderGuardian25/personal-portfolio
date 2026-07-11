"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Bento Cascade — a mixed-span bento board dealt in on mount with a framer
// stagger (y + scale + blur), then every cell runs its own micro-interaction:
// a rAF count-up stat, a looping mini marquee, a hover-zoom photo, a spring
// toggle and a live clock. Hovering a cell triggers only that cell's move.

const board = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};
const cell = {
  hidden: { opacity: 0, y: 30, scale: 0.92, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 26,
      filter: { duration: 0.5, ease: [0.22, 0.8, 0.25, 1] },
      opacity: { duration: 0.35, ease: "easeOut" },
    },
  },
};
const MARQUEE = "SHIP DAILY · STAY CURIOUS · MAKE IT MOVE · ";

export default function BentoCascade({ reducedMotion }) {
  const statRef = useRef(null);
  const [on, setOn] = useState(true);
  const [time, setTime] = useState("--:--:--");
  const hov = (v) => (reducedMotion ? undefined : v);

  // Stat count-up — rAF + ref textContent (easeOutExpo), timed to land just
  // after its cell finishes dealing in.
  useEffect(() => {
    const el = statRef.current;
    if (!el) return;
    if (reducedMotion) {
      el.textContent = "248";
      return;
    }
    let raf = null;
    const t0 = performance.now() + 420;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / 1500));
      const eased = 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(248 * eased)).padStart(3, "0");
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  // Live clock — 1 Hz state tick (never per-frame); static under reduced motion.
  useEffect(() => {
    const set = () =>
      setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    set();
    if (reducedMotion) return;
    const id = setInterval(set, 1000);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050507]">
      <motion.div
        variants={board}
        initial={reducedMotion ? false : "hidden"}
        animate="show"
        className="grid h-full grid-cols-4 grid-rows-[1.1fr_1.1fr_0.5fr] gap-2.5 p-4 pb-9 sm:gap-3 sm:p-6 sm:pb-10"
      >
        {/* 01 — stat count-up; hover leans the whole cell and blues the digits */}
        <motion.div
          variants={cell}
          whileHover={hov({ scale: 1.02, rotate: -1.2 })}
          className="group col-span-2 row-span-2 flex flex-col justify-between overflow-hidden border border-lab-line bg-lab-panel p-4"
        >
          <span className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            Experiments
          </span>
          <span
            ref={statRef}
            className="font-lab-display text-[15cqw] font-extrabold leading-none tracking-tight text-lab-text transition-colors duration-300 group-hover:text-[#3b82f6] sm:text-[12cqw]"
          >
            000
          </span>
          <span className="font-lab-mono text-[10px] tracking-[0.2em] text-lab-dim/70">
            SHIPPED THIS YEAR
          </span>
        </motion.div>

        {/* 02 — photo; hover zooms the image and lifts its caption */}
        <motion.div
          variants={cell}
          className="group relative col-span-2 overflow-hidden border border-lab-line"
        >
          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-110">
            <Image
              src="/lab/photo-2.webp"
              alt=""
              fill
              sizes="(min-width: 640px) 40vw, 60vw"
              className="object-cover"
              draggable={false}
            />
          </div>
          <span className="absolute bottom-2 left-3 translate-y-1 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-white/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Shore / 02
          </span>
        </motion.div>

        {/* 03 — toggle with a spring knob */}
        <motion.div
          variants={cell}
          whileHover={hov({ y: -3 })}
          className="col-span-1 flex flex-col justify-between border border-lab-line bg-lab-panel p-3"
        >
          <span className="font-lab-mono text-[9px] uppercase tracking-[0.25em] text-lab-dim">
            Focus
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Toggle focus mode"
            onClick={() => setOn((v) => !v)}
            className={`flex h-6 w-11 items-center rounded-full border px-0.5 transition-colors ${
              on
                ? "border-[#3b82f6]/70 bg-[#3b82f6]/25"
                : "border-lab-line bg-black/40"
            }`}
          >
            <motion.span
              aria-hidden
              animate={{ x: on ? 18 : 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 560, damping: 24 }
              }
              className={`block h-4 w-4 rounded-full ${
                on ? "bg-[#3b82f6]" : "bg-lab-dim"
              }`}
            />
          </button>
          <span className="font-lab-mono text-[9px] tracking-[0.25em] text-lab-dim/70">
            {on ? "ON" : "OFF"}
          </span>
        </motion.div>

        {/* 04 — live clock with a breathing pulse dot */}
        <motion.div
          variants={cell}
          whileHover={hov({ y: -3 })}
          className="col-span-1 flex flex-col justify-between border border-lab-line bg-lab-panel p-3"
        >
          <span className="flex items-center gap-1.5 font-lab-mono text-[9px] uppercase tracking-[0.25em] text-lab-dim">
            <motion.span
              aria-hidden
              animate={
                reducedMotion
                  ? undefined
                  : { opacity: [1, 0.25, 1], scale: [1, 1.5, 1] }
              }
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]"
            />
            Live
          </span>
          <span className="font-lab-mono text-xs tabular-nums text-lab-text sm:text-sm">
            {time}
          </span>
          <span className="font-lab-mono text-[9px] tracking-[0.25em] text-lab-dim/70">
            COLOMBO
          </span>
        </motion.div>

        {/* 05 — mini marquee strip; hover skews the whole lane */}
        <motion.div
          variants={cell}
          whileHover={hov({ skewX: -6 })}
          className="col-span-4 flex items-center overflow-hidden border border-lab-line bg-lab-panel"
        >
          <motion.div
            aria-hidden
            animate={reducedMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 16, ease: "linear", repeat: Infinity }}
            className="flex whitespace-nowrap font-lab-display text-[3.2cqw] font-bold uppercase -tracking-tightest text-lab-dim"
          >
            <span>{MARQUEE.repeat(3)}</span>
            <span>{MARQUEE.repeat(3)}</span>
          </motion.div>
        </motion.div>
      </motion.div>

      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Deals in on mount · every cell has its own hover move
      </p>
    </div>
  );
}
