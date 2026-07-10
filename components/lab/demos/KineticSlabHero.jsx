"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Kinetic Slab — oversized display type rises through line masks on mount,
// then the whole slab leans and shears with the pointer's velocity. GSAP
// quickTo drives the lean so fast pointer moves never queue tweens.
const LINES = ["DESIGN", "IN", "MOTION"];

export default function KineticSlabHero({ reducedMotion }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const lines = root.querySelectorAll("[data-line]");
    const slab = root.querySelector("[data-slab]");

    if (reducedMotion) {
      gsap.set(lines, { yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.12,
          delay: 0.15,
        }
      );

      const skewTo = gsap.quickTo(slab, "skewX", {
        duration: 0.6,
        ease: "power3.out",
      });
      const rotTo = gsap.quickTo(slab, "rotation", {
        duration: 0.8,
        ease: "power3.out",
      });
      const xTo = gsap.quickTo(slab, "x", {
        duration: 0.9,
        ease: "power3.out",
      });

      let lastX = null;
      let lastT = 0;
      const onMove = (e) => {
        const now = performance.now();
        if (lastX !== null) {
          const dt = Math.max(8, now - lastT);
          const vx = ((e.clientX - lastX) / dt) * 1000; // px/s
          const lean = gsap.utils.clamp(-14, 14, vx / 90);
          skewTo(-lean);
          rotTo(lean * 0.18);
          xTo(gsap.utils.clamp(-40, 40, vx / 40));
        }
        lastX = e.clientX;
        lastT = now;
      };
      const onLeave = () => {
        skewTo(0);
        rotTo(0);
        xTo(0);
        lastX = null;
      };
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
      return () => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      };
    }, root);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="flex h-full w-full items-center justify-center overflow-hidden bg-[#07070a]"
    >
      <div data-slab className="will-change-transform">
        <h2 className="sr-only">Design in motion</h2>
        {LINES.map((line, i) => (
          <div key={line} className="overflow-hidden">
            <div
              data-line
              aria-hidden
              className={`font-lab-display font-extrabold leading-[0.92] tracking-tight ${
                i === 1 ? "text-[#3b82f6]" : "text-lab-text"
              }`}
              style={{ fontSize: "clamp(2rem, 11cqw, 8rem)" }}
            >
              {line}
            </div>
          </div>
        ))}
        <p className="mt-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          Move the cursor fast — the slab leans into it
        </p>
      </div>
    </div>
  );
}
