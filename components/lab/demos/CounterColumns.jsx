"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

// Counter Columns — an internal scroller drives a sticky scene where two card
// columns slide in opposition: left rises, right sinks. Progress is read in a
// scroll listener, exponentially smoothed and applied in rAF via direct
// transforms; both columns align at p = 0.5 and the center seam flares.

const LEFT = [
  { n: "01", img: "/lab/photo-1.webp" },
  { n: "02", word: "RISE" },
  { n: "03", img: "/lab/photo-2.webp" },
  { n: "04", word: "DRIFT" },
  { n: "05", img: "/lab/photo-3.webp" },
];
const RIGHT = [
  { n: "05", word: "SINK" },
  { n: "04", img: "/lab/photo-4.webp" },
  { n: "03", word: "MEET" },
  { n: "02", img: "/lab/photo-1.webp" },
  { n: "01", word: "FALL" },
];

function Card({ item, side }) {
  return (
    <div
      className="relative w-full flex-none overflow-hidden border border-lab-line bg-lab-panel"
      style={{ height: "45%" }}
    >
      {item.img ? (
        <Image
          src={item.img}
          alt=""
          fill
          sizes="(min-width: 640px) 30vw, 45vw"
          className="object-cover opacity-80"
          draggable={false}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="font-lab-display text-[6.5cqw] font-extrabold tracking-tight text-lab-text/90">
            {item.word}
          </span>
        </div>
      )}
      <span
        className={`absolute top-2 font-lab-mono text-[9px] tracking-[0.3em] text-lab-dim ${
          side === "l" ? "left-2" : "right-2"
        }`}
      >
        {side === "l" ? "▲" : "▼"} {item.n}
      </span>
    </div>
  );
}

export default function CounterColumns({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const seamRef = useRef(null);
  const badgeRef = useRef(null);
  const readoutRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const seam = seamRef.current;
    const badge = badgeRef.current;
    const readout = readoutRef.current;
    if (!scroller || !left || !right) return;

    let sceneH = scroller.clientHeight;

    const apply = (p) => {
      const travel = sceneH; // opposed shift, meets at p = 0.5
      left.style.transform = `translate3d(0, ${(0.5 - p) * travel}px, 0)`;
      right.style.transform = `translate3d(0, ${(p - 0.5) * travel}px, 0)`;
      const meet = Math.exp(-((p - 0.5) ** 2) / (2 * 0.055 * 0.055));
      seam.style.opacity = String(0.12 + meet * 0.88);
      seam.style.boxShadow = `0 0 ${22 * meet}px 1px rgba(59,130,246,${0.9 * meet})`;
      badge.style.opacity = String(meet * meet);
      readout.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
      if (hintRef.current) hintRef.current.style.opacity = p < 0.03 ? "1" : "0";
    };

    if (reducedMotion) {
      apply(0.6); // static ~60% progress, no scrub
      return;
    }

    // Scroll writes only the target; rAF eases the applied value toward it.
    let cur = 0;
    let tgt = 0;
    let raf = null;
    const tick = () => {
      cur += (tgt - cur) * 0.16;
      if (Math.abs(tgt - cur) < 0.0005) {
        cur = tgt;
        apply(cur);
        raf = null;
        return;
      }
      apply(cur);
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      tgt = max > 0 ? scroller.scrollTop / max : 0;
      if (raf == null) raf = requestAnimationFrame(tick);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      sceneH = scroller.clientHeight;
      apply(cur);
    });
    ro.observe(scroller);
    apply(0);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-y-auto bg-[#050507]">
      <div style={{ height: reducedMotion ? "100%" : "300%" }}>
        {/* Sticky scene — exactly one scroller-height tall (track is 300%). */}
        <div
          className="sticky top-0 overflow-hidden"
          style={{ height: reducedMotion ? "100%" : `${100 / 3}%` }}
        >
          <div className="relative h-full w-full px-5 pb-10 pt-10 sm:px-8">
            <div className="grid h-full grid-cols-2 gap-4 sm:gap-6">
              <div
                ref={leftRef}
                className="flex h-full flex-col justify-center gap-2.5 will-change-transform sm:gap-3"
              >
                {LEFT.map((item) => (
                  <Card key={`l${item.n}`} item={item} side="l" />
                ))}
              </div>
              <div
                ref={rightRef}
                className="flex h-full flex-col justify-center gap-2.5 will-change-transform sm:gap-3"
              >
                {RIGHT.map((item) => (
                  <Card key={`r${item.n}`} item={item} side="r" />
                ))}
              </div>
            </div>

            {/* Center seam — flares when the columns align at p = 0.5. */}
            <div
              ref={seamRef}
              aria-hidden
              className="pointer-events-none absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-[#3b82f6]"
              style={{ opacity: 0.12 }}
            />
            <div
              ref={badgeRef}
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#3b82f6]/60 bg-[#050507]/90 px-2 py-1 font-lab-mono text-[9px] uppercase tracking-[0.3em] text-[#3b82f6]"
              style={{ opacity: 0 }}
            >
              Meet
            </div>

            <span className="absolute left-5 top-3.5 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim sm:left-8">
              Counter columns
            </span>
            <span
              ref={readoutRef}
              className="absolute right-5 top-3.5 font-lab-mono text-[10px] tracking-[0.25em] text-lab-dim sm:right-8"
            >
              000%
            </span>
            {!reducedMotion && (
              <p
                ref={hintRef}
                className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim transition-opacity duration-500"
              >
                Scroll ↓
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
