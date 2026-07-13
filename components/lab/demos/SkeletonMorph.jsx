"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

// Skeleton Morph — the loading skeleton never vanishes: every shimmer bar IS
// the element it stood for. The real content mounts underneath from frame one
// (opacity 0), so layout is already final when the fake 1.4s load resolves;
// then each bar eases from its "guessed" width to hug the content box, flashes
// the accent once as it hands off, and fades while the content rises in — a
// staggered morph, not a swap. The shimmer sweep reuses lab.css's global
// `lab-shimmer` keyframes (demos only ever render inside the lab layout, so
// the name is always defined). Replay = remount: `done` re-arms from false.

const LOAD_MS = 1400;

const HEADLINE = ["Bones", "To Body"];
const LINES = [
  { text: "Loading, done honestly,", bar: "92%" },
  { text: "is choreography — every", bar: "78%" },
  { text: "bar knows its words.", bar: "60%" },
];

// One morphing slot. `bar` is the skeleton's resting width as a fraction of
// the content box — skeletons never guess copy width right, so the ease to
// 100% is part of the read. `block` slots (avatar / image) keep the overlay
// full-size and simply dissolve it in place.
function Slot({
  done,
  snap,
  delay,
  bar = "80%",
  block = false,
  round = false,
  className = "",
  children,
}) {
  return (
    <div className={`relative ${block ? "" : "w-fit max-w-full"} ${className}`}>
      <motion.div
        initial={false}
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 4 }}
        transition={snap ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: delay + 0.18 }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
      {/* Skeleton overlay — width/opacity/color are the morph; keyframe arrays
          hold the bar solid through the accent flash, then let it dissolve. */}
      <motion.span
        aria-hidden
        initial={false}
        animate={
          done
            ? { width: "100%", opacity: [1, 1, 0], backgroundColor: ["#26262c", "#3b82f6", "#3b82f6"] }
            : { width: block ? "100%" : bar, opacity: 1, backgroundColor: "#26262c" }
        }
        transition={snap ? { duration: 0 } : { duration: 0.6, ease: EASE, delay }}
        className={`absolute inset-y-0 left-0 ${round ? "rounded-full" : "rounded-[2px]"}`}
        style={
          done
            ? { pointerEvents: "none" }
            : {
                backgroundImage:
                  "linear-gradient(100deg, transparent 40%, rgba(232,232,230,0.09) 50%, transparent 60%)",
                backgroundSize: "200% 100%",
                animation: "lab-shimmer 1.4s linear infinite",
              }
        }
      />
    </div>
  );
}

export default function SkeletonMorph({ reducedMotion }) {
  // Reduced motion: final content immediately — no shimmer phase at all.
  const [done, setDone] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setDone(true), LOAD_MS);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  const S = { done, snap: reducedMotion };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#07070a]">
      <article className="w-[64cqw] max-w-[560px] border border-lab-line bg-lab-panel p-[2.6cqw]">
        {/* byline — avatar circle + name/meta lines */}
        <div className="flex items-center gap-[1.6cqw]">
          <Slot {...S} delay={0} block round className="h-[4.6cqw] min-h-8 w-[4.6cqw] min-w-8 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full border border-[#3b82f6]/50 bg-[#0d1220] font-lab-mono text-[10px] text-[#3b82f6]">
              DD
            </div>
          </Slot>
          <div className="min-w-0 space-y-1">
            <Slot {...S} delay={0.08} bar="64%">
              <p className="truncate font-lab-mono text-[10px] uppercase tracking-[0.2em] text-lab-text">
                Damian De Cruz
              </p>
            </Slot>
            <Slot {...S} delay={0.14} bar="90%">
              <p className="truncate font-lab-mono text-[9px] uppercase tracking-[0.2em] text-lab-dim">
                Motion notes · 4 min read
              </p>
            </Slot>
          </div>
        </div>

        {/* headline bars → Syne headline (clamped — 800 runs wide) */}
        <div className="mt-[2cqw] space-y-[0.8cqw]">
          {HEADLINE.map((word, i) => (
            <Slot key={word} {...S} delay={0.24 + i * 0.08} bar={i === 0 ? "88%" : "70%"}>
              <h3
                className="whitespace-nowrap font-lab-display font-extrabold uppercase leading-[0.95] tracking-tight text-lab-text"
                style={{ fontSize: "min(5cqw, 44px)" }}
              >
                {word}
              </h3>
            </Slot>
          ))}
        </div>

        {/* image block dissolves into the photo */}
        <Slot {...S} delay={0.42} block className="mt-[2cqw] h-[14cqw] min-h-16 w-full">
          <div className="relative h-full w-full overflow-hidden">
            <img
              src="/lab/photo-1.webp"
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
        </Slot>

        {/* body lines — truncate keeps every bar single-line at any card size */}
        <div className="mt-[2cqw] space-y-[1cqw]">
          {LINES.map((line, i) => (
            <Slot key={line.text} {...S} delay={0.54 + i * 0.07} bar={line.bar}>
              <p className="truncate text-[11px] leading-snug text-lab-dim">{line.text}</p>
            </Slot>
          ))}
        </div>
      </article>

      <p className="absolute left-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Skeleton / hand-off
      </p>
      <p className="absolute right-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        {done ? <span className="text-[#3b82f6]">Rendered</span> : "Fetching…"}
      </p>
      <p className="absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Bars morph into what they stood for · Replay ↻
      </p>
    </div>
  );
}
