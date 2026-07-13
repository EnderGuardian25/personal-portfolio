"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatest } from "../hooks";

// Ken Burns — full-bleed slides crossfading on a timer; inside every frame the
// image slowly zooms and drifts (pure CSS keyframes, alternating pan
// directions via per-slide custom properties resolved inside @keyframes). A
// thin SVG ring drains over the interval — driven by strokeDashoffset writes
// inside rAF. While the pointer rests on the stage the loop parks entirely
// (pointermove sets the flag, the next tick bails and drops the rAF;
// pointerleave clears it and restarts — leave also fires after touch end).
// Gotchas: a slide's zoom restarts by remounting its <img> (per-slide run
// counter as the key) ONLY when it becomes active — remounting on deactivation
// would snap its transform back mid-crossfade, so the outgoing slide keeps its
// animation (fill: both holds the end pose if the 5s run out).
const SLIDES = [
  "/lab/photo-1.webp",
  "/lab/photo-2.webp",
  "/lab/photo-3.webp",
  "/lab/photo-4.webp",
];
// [x-from, y-from, x-to, y-to] — pan direction alternates slide to slide
const DIRS = [
  ["-2%", "-1.2%", "2%", "1.2%"],
  ["2%", "1.2%", "-2%", "-1.2%"],
  ["-2%", "1.2%", "2%", "-1.2%"],
  ["2%", "-1.2%", "-2%", "1.2%"],
];
const DUR = 5; // seconds per slide
const C = 2 * Math.PI * 9; // ring circumference (r=9)

export default function KenBurns({ reducedMotion }) {
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const hoverRef = useRef(false);
  const elapsedRef = useRef(0);
  const indexRef = useRef(0); // mirrors `index` — goTo must stay pure for StrictMode
  const [index, setIndex] = useState(0);
  const [prevIdx, setPrevIdx] = useState(-1);
  // Per-slide activation counters — keying the img restarts its CSS animation.
  const [runs, setRuns] = useState(SLIDES.map(() => 0));

  const goTo = useCallback((dir) => {
    elapsedRef.current = 0;
    // The rAF loop parks while hovered — sync the drained ring here so a
    // button press during hover doesn't leave stale progress showing.
    if (ringRef.current) ringRef.current.style.strokeDashoffset = "0";
    const cur = indexRef.current;
    const next = (cur + dir + SLIDES.length) % SLIDES.length;
    indexRef.current = next;
    setPrevIdx(cur);
    setIndex(next);
    setRuns((r) => r.map((v, i) => (i === next ? v + 1 : v)));
  }, []);
  const goToRef = useLatest(goTo);

  // Timer + progress ring. Hover pauses both; the crossfade itself is CSS.
  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    let raf = null;
    let last = 0;

    const tick = (now) => {
      if (hoverRef.current) {
        raf = null; // park — no elapsed, no writes; onLeave restarts
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsedRef.current += dt;
      if (elapsedRef.current >= DUR) {
        elapsedRef.current = 0;
        goToRef.current(1);
      }
      if (ringRef.current) {
        const p = Math.min(1, elapsedRef.current / DUR);
        ringRef.current.style.strokeDashoffset = String(C * p);
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf == null) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    start();

    const onMove = () => {
      hoverRef.current = true; // next tick parks the loop
      root?.style.setProperty("--kb-ring", "0.45"); // dim ring = paused cue
    };
    const onLeave = () => {
      hoverRef.current = false;
      root?.style.setProperty("--kb-ring", "1");
      start();
    };
    root?.addEventListener("pointermove", onMove);
    root?.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      root?.removeEventListener("pointermove", onMove);
      root?.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, goToRef]);

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden bg-[#07070a]"
      style={{ "--kb-ring": 1 }}
    >
      {SLIDES.map((src, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 overflow-hidden ${
            reducedMotion ? "" : "transition-opacity duration-[900ms] ease-out"
          }`}
          style={{
            opacity: i === index ? 1 : 0,
            zIndex: i === index ? 2 : i === prevIdx ? 1 : 0,
          }}
        >
          <img
            key={runs[i]}
            src={src}
            alt=""
            draggable={false}
            className={`absolute -inset-[4%] h-[108%] w-[108%] object-cover ${
              reducedMotion ? "" : "kb-img"
            }`}
            style={{
              "--kx0": DIRS[i][0],
              "--ky0": DIRS[i][1],
              "--kx1": DIRS[i][2],
              "--ky1": DIRS[i][3],
            }}
          />
        </div>
      ))}

      {/* scrim for chrome legibility */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-3 h-20 bg-linear-to-t from-black/60 to-transparent"
      />

      <div className="absolute bottom-4 left-4 z-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => goTo(1)}
          className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-80"
        >
          {/* paused-cue dim lives on the svg so the button's own hover
              opacity still registers (multiplies rather than being defeated
              by an inline value) — and works under reduced motion too. */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-6 w-6 -rotate-90 transition-opacity"
            style={{ opacity: "var(--kb-ring)" }}
          >
            <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <circle
              ref={ringRef}
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset="0"
            />
          </svg>
        </button>
        <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em]">
          <span className="text-white/90">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-white/45"> / {String(SLIDES.length).padStart(2, "0")}</span>
          <span className="ml-4 hidden text-white/45 sm:inline">hover to hold the frame</span>
        </p>
      </div>

      <div className="absolute right-4 top-4 z-4 flex gap-2">
        {[
          ["Previous slide", "←", -1],
          ["Next slide", "→", 1],
        ].map(([label, glyph, dir]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => goTo(dir)}
            className="border border-white/25 bg-black/30 px-3 py-1.5 font-lab-mono text-sm text-white/85 backdrop-blur-xs transition-colors hover:border-white/60 hover:text-white"
          >
            {glyph}
          </button>
        ))}
      </div>

      <style jsx>{`
        /* var() inside @keyframes resolves per element — one keyframe set,
           four pan directions. fill both keeps the outgoing slide's pose. */
        .kb-img {
          animation: kb-drift ${DUR + 1.2}s linear both;
        }
        @keyframes kb-drift {
          from {
            transform: scale(1.06) translate(var(--kx0), var(--ky0));
          }
          to {
            transform: scale(1.16) translate(var(--kx1), var(--ky1));
          }
        }
      `}</style>
    </div>
  );
}
