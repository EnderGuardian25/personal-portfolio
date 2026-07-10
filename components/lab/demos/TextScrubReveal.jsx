"use client";
import { useEffect, useRef } from "react";

// Scrub Reveal — internal scroller + sticky scene. Scroll progress
// (scrollTop / range) sweeps a brightness threshold across the paragraph:
// each word interpolates dim → lit through a soft leading edge (a partial
// band, not a binary flip) with a faint accent flash mid-transition. Progress
// is read in the scroll listener and applied inside rAF via direct refs.

const TEXT =
  "The page is a timeline. Every turn of the wheel is a frame, and this sentence only exists as far as you have scrolled. Ease back, and the light retreats with you.";

const DIM = [62, 62, 68]; // settled-dark word color
const LIT = [232, 232, 230]; // lab-text
const ACC = [59, 130, 246]; // electric blue, flashes at the leading edge
const EDGE = 0.14; // soft-edge width, in progress units

export default function TextScrubReveal({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const paraRef = useRef(null);
  const pctRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const para = paraRef.current;
    if (!scroller || !para) return;

    const words = Array.from(para.children);
    const n = words.length;

    const apply = (p) => {
      const sweep = p * (1 + EDGE); // overshoot so p=1 fully lights the last word
      for (let i = 0; i < n; i++) {
        const pos = i / (n - 1);
        const v = Math.min(1, Math.max(0, (sweep - pos) / EDGE));
        const flash = v * (1 - v) * 4 * 0.7; // peaks mid-edge, 0 at both ends
        const r = DIM[0] + (LIT[0] - DIM[0]) * v;
        const g = DIM[1] + (LIT[1] - DIM[1]) * v;
        const b = DIM[2] + (LIT[2] - DIM[2]) * v;
        const s = words[i].style;
        s.color = `rgb(${(r + (ACC[0] - r) * flash) | 0} ${(g + (ACC[1] - g) * flash) | 0} ${(b + (ACC[2] - b) * flash) | 0})`;
        s.opacity = (0.4 + 0.6 * v).toFixed(3);
        s.transform = `translateY(${((1 - v) * 0.22).toFixed(3)}em)`;
      }
      if (pctRef.current)
        pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")} / 100`;
      if (hintRef.current)
        hintRef.current.style.opacity = Math.max(0, 1 - p * 7).toFixed(2);
    };

    if (reducedMotion) {
      // Static ~60% state, no scrub.
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) * 0.6;
      apply(0.6);
      return;
    }

    let raf = null;
    let progress = 0;
    const tick = () => {
      raf = null;
      apply(progress);
    };
    const onScroll = () => {
      const range = scroller.scrollHeight - scroller.clientHeight;
      progress = range > 0 ? scroller.scrollTop / range : 0;
      if (raf == null) raf = requestAnimationFrame(tick);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    apply(0); // entrance: everything dim, waiting to be read in

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-y-auto bg-lab-bg">
      {/* Tall wrapper = the sticky containing block; the scene is exactly one
          stage-height tall (100% / 3.4), so it pins for 240% of runway. */}
      <div style={{ height: "340%" }}>
        <div
          className="sticky top-0 flex w-full items-center overflow-hidden px-[8cqw]"
          style={{ height: "calc(100% / 3.4)" }}
        >
        <p className="sr-only">{TEXT}</p>
        <p
          ref={paraRef}
          aria-hidden
          className="max-w-[70cqw] font-lab-display text-[5.4cqw] font-semibold leading-[1.35] tracking-tight"
        >
          {/* Each word carries a trailing literal NBSP (U+00A0) — JSX strips
              the newline whitespace between spans, and NBSP never collapses,
              so it provides the visible inter-word gap while the atomic
              inline-block boxes still wrap. Don't normalize it to a space. */}
          {TEXT.split(" ").map((w, i) => (
            <span key={i} className="inline-block will-change-transform">
              {w}
              {" "}
            </span>
          ))}
        </p>

        <div className="pointer-events-none absolute left-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          Scrub reveal
        </div>
        <div className="pointer-events-none absolute right-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          <span ref={pctRef}>000 / 100</span>
        </div>
        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80"
        >
          Scroll ↓ to read it in
        </div>
        </div>
      </div>
    </div>
  );
}
