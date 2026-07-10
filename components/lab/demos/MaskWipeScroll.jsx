"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

// Mask Wipe — sticky scene inside an internal scroller. Scene B (photo) sits
// on top of scene A (type panel) behind a `clip-path: circle()` whose radius
// eases from 0 to exactly the farthest-corner distance, so at p=1 the circle
// swallows the frame with no dead travel. The center drifts toward middle as
// it opens; a hairline accent ring and a live radius readout track the edge.

export default function MaskWipeScroll({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const sceneRef = useRef(null);
  const maskRef = useRef(null);
  const ringRef = useRef(null);
  const radiusRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const scene = sceneRef.current;
    const mask = maskRef.current;
    if (!scroller || !scene || !mask) return;

    let w = scene.clientWidth;
    let h = scene.clientHeight;
    let lastP = 0;

    const apply = (p) => {
      lastP = p;
      const e = p * p * (3 - 2 * p); // smoothstep — slow crack open, fast swallow
      // Aperture center drifts from upper-right third toward dead center.
      const cx = 66 - 16 * e;
      const cy = 38 + 12 * e;
      // Radius that exactly covers the frame from the CURRENT center.
      const reachX = Math.max(cx, 100 - cx) * 0.01 * w;
      const reachY = Math.max(cy, 100 - cy) * 0.01 * h;
      const r = e * Math.hypot(reachX, reachY);
      mask.style.clipPath = `circle(${r.toFixed(1)}px at ${cx.toFixed(2)}% ${cy.toFixed(2)}%)`;

      const ring = ringRef.current;
      if (ring) {
        ring.style.width = ring.style.height = `${(r * 2).toFixed(1)}px`;
        ring.style.left = `${cx.toFixed(2)}%`;
        ring.style.top = `${cy.toFixed(2)}%`;
        ring.style.opacity = Math.min(1, p * (1 - p) * 5).toFixed(3);
      }
      if (radiusRef.current)
        radiusRef.current.textContent = `R ${String(Math.round(r)).padStart(4, "0")}px`;
      if (hintRef.current)
        hintRef.current.style.opacity = Math.max(0, 1 - p * 7).toFixed(2);
    };

    const ro = new ResizeObserver(() => {
      w = scene.clientWidth;
      h = scene.clientHeight;
      apply(lastP);
    });
    ro.observe(scene);

    if (reducedMotion) {
      // Static ~60% open — the wipe caught mid-swallow. No scrub.
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) * 0.6;
      apply(0.6);
      return () => ro.disconnect();
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
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-y-auto bg-lab-bg">
      {/* Tall wrapper = the sticky containing block; the scene is exactly one
          stage-height tall (100% / 3.2), so it pins for 220% of runway. */}
      <div style={{ height: "320%" }}>
        <div
          ref={sceneRef}
          className="sticky top-0 w-full overflow-hidden"
          style={{ height: "calc(100% / 3.2)" }}
        >
        {/* Scene A — the type panel being swallowed. */}
        <div className="absolute inset-0 flex flex-col items-start justify-center bg-lab-bg px-[8cqw]">
          <span className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            Scene A — type panel
          </span>
          <h3 className="mt-[2cqw] font-lab-display text-[12cqw] font-bold leading-[0.95] tracking-tight text-lab-text">
            APER—
            <br />
            TURE
          </h3>
        </div>

        {/* Scene B — revealed through the circular window. */}
        <div ref={maskRef} className="absolute inset-0 will-change-[clip-path]">
          <Image
            src="/lab/photo-2.webp"
            alt="Scene revealed through the widening aperture"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
          />
          <span className="absolute bottom-4 right-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80">
            Scene B — photo 02
          </span>
        </div>

        {/* Accent ring riding the aperture edge. */}
        <div
          ref={ringRef}
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3b82f6] opacity-0 shadow-[0_0_24px_rgba(59,130,246,0.35)]"
        />

        <div className="pointer-events-none absolute left-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          Mask wipe
        </div>
        <div className="pointer-events-none absolute right-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          <span ref={radiusRef}>R 0000px</span>
        </div>
        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80"
        >
          Scroll ↓ to open the aperture
        </div>
        </div>
      </div>
    </div>
  );
}
