"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Odometer Roll — each character column is a vertical strip of that column's
// glyph across every word, masked to one line-height. GSAP rolls the strips to
// the next row with a per-column stagger and a back-eased settle; a duplicate
// first row lets the last→first wrap keep rolling in the same direction.
const WORDS = ["MOTION", "SPRING", "GLYPHS", "CANVAS"]; // equal lengths
const COLS = WORDS[0].length;
const ROWS = [...WORDS, WORDS[0]]; // + duplicate for seamless wrap
const STEP = 100 / ROWS.length; // yPercent per row
const PAUSE = 1.5;

export default function OdometerRoll({ reducedMotion }) {
  const lineRef = useRef(null);
  const liveRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const line = lineRef.current;
    const live = liveRef.current;
    if (!line) return;

    const strips = Array.from(line.querySelectorAll("[data-strip]"));
    let index = 0;
    let busy = false;
    let call = null;

    if (reducedMotion) {
      // Settled end state; retrigger swaps words instantly, no tween.
      apiRef.current = () => {
        index = (index + 1) % WORDS.length;
        gsap.set(strips, { yPercent: -STEP * index });
        if (live) live.textContent = WORDS[index];
      };
      return () => gsap.killTweensOf(strips);
    }

    const roll = (next) => {
      if (busy) return;
      busy = true;
      call?.kill();
      // Wrapping to word 0 targets the duplicate bottom row, then snaps back.
      const row = next === 0 ? WORDS.length : next;
      if (live) live.textContent = WORDS[next];
      gsap.to(strips, {
        yPercent: -STEP * row,
        duration: 0.9,
        ease: "back.out(1.7)",
        stagger: 0.06,
        overwrite: true,
        onComplete: () => {
          if (row === WORDS.length) gsap.set(strips, { yPercent: 0 });
          index = next;
          busy = false;
          call = gsap.delayedCall(PAUSE, () => roll((index + 1) % WORDS.length));
        },
      });
    };
    apiRef.current = () => roll((index + 1) % WORDS.length);

    // Entrance: mount on the last word and immediately roll it into the first.
    index = WORDS.length - 1;
    gsap.set(strips, { yPercent: -STEP * index });
    call = gsap.delayedCall(0.2, () => roll(0));

    return () => {
      call?.kill();
      gsap.killTweensOf(strips);
      apiRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <button
      type="button"
      aria-label="Roll to the next word"
      onClick={() => apiRef.current?.()}
      onPointerEnter={() => apiRef.current?.()}
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-5 bg-[#07070a]"
    >
      <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Currently rolling
      </p>
      <div
        ref={lineRef}
        aria-hidden
        className="flex h-[1em] overflow-hidden font-lab-display font-bold leading-none text-lab-text"
        style={{ fontSize: "clamp(2rem, 13cqw, 7.5rem)" }}
      >
        {Array.from({ length: COLS }).map((_, c) => (
          <span key={c} className="inline-block">
            <span data-strip className="flex flex-col items-center will-change-transform">
              {ROWS.map((w, r) => (
                <span key={r} className="flex h-[1em] items-center justify-center">
                  {w[c]}
                </span>
              ))}
            </span>
          </span>
        ))}
      </div>
      <span ref={liveRef} className="sr-only" aria-live="polite">
        {WORDS[0]}
      </span>
      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Hover / click to roll
      </p>
    </button>
  );
}
