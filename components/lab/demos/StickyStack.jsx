"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

// Sticky Stack — four full-stage cards, each `position: sticky; top: 0`,
// inside an internal scroller. CSS does the pinning; JS does the press-down:
// scroll progress is split into three hand-off segments, and while card i+1
// slides over, card i scales toward 0.92, dims under a veil, and rounds its
// corners — read in the scroll listener, written in rAF via refs.

const CARDS = [
  { src: "/lab/photo-1.webp", title: "Field" },
  { src: "/lab/photo-2.webp", title: "Form" },
  { src: "/lab/photo-3.webp", title: "Light" },
  { src: "/lab/photo-4.webp", title: "Noise" },
];

export default function StickyStack({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);
  const veilRefs = useRef([]);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const segs = CARDS.length - 1; // hand-offs between consecutive cards

    const apply = (p) => {
      for (let i = 0; i < segs; i++) {
        const t = Math.min(1, Math.max(0, p * segs - i));
        const e = t * t * (3 - 2 * t); // smoothstep — soft catch, firm press
        const card = cardRefs.current[i];
        const veil = veilRefs.current[i];
        if (!card) continue;
        card.style.transform = `scale(${(1 - 0.08 * e).toFixed(4)})`;
        card.style.borderRadius = `${(e * 22).toFixed(1)}px`;
        if (veil) veil.style.opacity = (0.55 * e).toFixed(3);
      }
      if (hintRef.current)
        hintRef.current.style.opacity = Math.max(0, 1 - p * 8).toFixed(2);
    };

    if (reducedMotion) {
      // Static ~60% state: card 1 fully pressed, card 2 mid-press. No scrub.
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
    apply(0);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-y-auto bg-lab-bg">
      {/* Tall wrapper = the sticky containing block. Each card is 25% of it
          (= one stage height), pins at the top, and stays pinned to the end
          of the wrapper while later siblings paint over it. */}
      <div style={{ height: "400%" }}>
      {CARDS.map((c, i) => (
        <div key={c.src} className="sticky top-0 w-full" style={{ height: "25%" }}>
          <div
            ref={(el) => (cardRefs.current[i] = el)}
            className="relative h-full w-full overflow-hidden bg-lab-panel will-change-transform"
            style={{ transformOrigin: "50% 18%" }}
          >
            <Image
              src={c.src}
              alt={`${c.title} — stacked card ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={i === 0}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"
            />
            {/* Press veil — dims the card as the next one slides over it. */}
            <div
              ref={(el) => (veilRefs.current[i] = el)}
              aria-hidden
              className="absolute inset-0 bg-black opacity-0"
            />
            <div className="pointer-events-none absolute left-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80">
              Sticky stack — {String(i + 1).padStart(2, "0")} /{" "}
              {String(CARDS.length).padStart(2, "0")}
            </div>
            <div className="pointer-events-none absolute bottom-[4cqw] left-[4cqw] flex items-baseline gap-[2cqw]">
              <span className="font-lab-display text-[11cqw] font-bold leading-none text-lab-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-lab-display text-[4cqw] font-medium tracking-tight text-lab-text/70">
                {c.title}
              </span>
            </div>
            {i === CARDS.length - 1 && (
              <div className="pointer-events-none absolute bottom-4 right-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-[#3b82f6]">
                End of stack
              </div>
            )}
            {i === 0 && (
              <div
                ref={hintRef}
                className="pointer-events-none absolute bottom-4 right-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80"
              >
                Scroll ↓ to press the stack
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
