"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

// Parallax Scene — one sticky scene, five absolutely-placed layers, each with
// a depth multiplier read from data-range. Smoothed scroll progress translates
// every layer by its own range (in cqw — the stage is an inline-size container,
// so cqh would fall back to viewport units) so near layers race past far ones;
// blur / saturation / opacity are graded statically by depth.

const TALL = 3;

export default function ParallaxScene({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const sceneRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const scene = sceneRef.current;
    if (!scroller || !scene) return;

    const layers = Array.from(scene.querySelectorAll("[data-range]")).map((el) => ({
      el,
      range: parseFloat(el.dataset.range),
    }));

    const apply = (q) => {
      // Centered mapping: the scene reads as "composed" at half progress,
      // layers fan out above/below it toward either end of the scroll.
      for (const { el, range } of layers) {
        el.style.transform = `translate3d(0, ${((0.5 - q) * range).toFixed(3)}cqw, 0)`;
      }
      hintRef.current.style.opacity = (1 - Math.min(1, q * 5)).toFixed(3);
    };

    if (reducedMotion) {
      apply(0.6); // near-composed static state, no scrub
      return;
    }
    apply(0);

    let target = 0;
    let p = 0;
    let raf = null;
    const tick = () => {
      p += (target - p) * 0.12; // exponential settle — depth lags the finger
      if (Math.abs(target - p) < 0.0004) {
        p = target;
        apply(p);
        raf = null;
        return;
      }
      apply(p);
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      target = max > 0 ? scroller.scrollTop / max : 0;
      if (raf == null) raf = requestAnimationFrame(tick);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-y-auto bg-[#07070a]">
      <div style={{ height: reducedMotion ? "100%" : `${TALL * 100}%` }}>
        <div
          ref={sceneRef}
          className="sticky top-0 overflow-hidden"
          style={{ height: reducedMotion ? "100%" : `${100 / TALL}%` }}
        >
          <h2 className="sr-only">Parallax scene — layers slide at different depths</h2>

          {/* Far field: giant soft type, barely moves */}
          <div
            data-range="8"
            aria-hidden
            className="absolute inset-0 flex items-center justify-center will-change-transform"
            style={{ filter: "blur(3px) saturate(0.55)", opacity: 0.3 }}
          >
            <span className="font-lab-display text-[19cqw] font-extrabold leading-none tracking-tight text-lab-text">
              DEPTH
            </span>
          </div>

          {/* Mid-far photo: soft, desaturated */}
          <div
            data-range="20"
            aria-hidden
            className="absolute left-[7%] top-[14%] h-[38%] w-[30cqw] overflow-hidden will-change-transform"
            style={{ filter: "blur(1.6px) saturate(0.6)", opacity: 0.75 }}
          >
            <Image src="/lab/photo-4.webp" alt="" fill sizes="40vw" className="object-cover" draggable={false} />
          </div>

          {/* Mid photo */}
          <div
            data-range="38"
            aria-hidden
            className="absolute right-[8%] top-[24%] h-[44%] w-[36cqw] overflow-hidden will-change-transform"
            style={{ filter: "blur(0.5px) saturate(0.85)" }}
          >
            <Image src="/lab/photo-1.webp" alt="" fill sizes="50vw" className="object-cover" draggable={false} />
          </div>

          {/* Near photo: sharp, fast */}
          <div
            data-range="58"
            aria-hidden
            className="absolute bottom-[10%] left-[22%] h-[40%] w-[28cqw] overflow-hidden border border-lab-line will-change-transform"
          >
            <Image src="/lab/photo-2.webp" alt="" fill sizes="40vw" className="object-cover" draggable={false} />
          </div>

          {/* Nearest field: sharp chrome card, fastest */}
          <div
            data-range="80"
            className="absolute bottom-[18%] right-[10%] border border-lab-line bg-lab-panel px-4 py-3 will-change-transform"
          >
            <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-[#3b82f6]">Near field</p>
            <p className="mt-1 font-lab-mono text-[10px] tracking-[0.2em] text-lab-dim">layer 05 · ×80</p>
          </div>

          <p
            ref={hintRef}
            className="absolute bottom-4 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim"
          >
            Scroll ↓ — depths divide
          </p>
        </div>
      </div>
    </div>
  );
}
