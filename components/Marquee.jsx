"use client";
import { useEffect, useRef } from "react";

const words = [
  "Creative Technologist",
  "✦",
  "Code",
  "✦",
  "Design",
  "✦",
  "Curiosity",
  "✦",
  "Colombo · Sri Lanka",
  "✦",
  "Portfolio Vol. 02",
  "✦",
];

// Seconds for one full copy of the ribbon to pass — matches the old CSS feel.
const LOOP_SECONDS = 38;
// How quickly a flick decays / the ribbon eases back to its baseline speed.
// Larger = slower, more languid settle.
const SETTLE_TAU = 0.9;

export default function Marquee() {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- live state (refs so frames don't trigger React re-renders) ---
    let offset = 0;            // current translateX in px
    let velocity = 0;          // px/sec
    let single = 0;            // width of one copy of the ribbon
    let baseline = 0;          // resting auto-scroll speed (negative = leftward)

    let dragging = false;
    let lastPointerX = 0;
    let lastMoveT = 0;

    const measure = () => {
      single = track.scrollWidth / 2; // two identical copies are rendered
      baseline = reduce ? 0 : -single / LOOP_SECONDS;
    };
    measure();
    // Width shifts once the display font swaps in — remeasure then.
    if (document.fonts?.ready) document.fonts.ready.then(measure);

    // Seed the flow so it isn't static on first paint (skipped for reduced motion).
    velocity = baseline;

    const wrap = () => {
      if (single <= 0) return;
      // Keep offset within (-single, 0] for a seamless loop in both directions.
      offset = ((offset % single) + single) % single - single;
    };

    let raf = null;
    let running = false;
    let lastFrame = 0;

    const frame = (now) => {
      const dt = Math.min((now - lastFrame) / 1000 || 0, 0.05); // clamp tab-switch jumps
      lastFrame = now;

      if (!dragging) {
        // Exponential blend of velocity toward baseline: decays a flick and,
        // for a stopped ribbon, ramps it back up to the normal rotation.
        const k = 1 - Math.exp(-dt / SETTLE_TAU);
        velocity += (baseline - velocity) * k;
        offset += velocity * dt;
        wrap();
      }

      track.style.transform = `translate3d(${offset}px,0,0)`;

      // Idle-suspend only matters when there's nothing to animate toward
      // (reduced motion: baseline 0). Otherwise keep the loop alive.
      const settled = !dragging && baseline === 0 && Math.abs(velocity) < 0.05;
      if (settled) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // --- pointer drag ---
    const onPointerDown = (e) => {
      dragging = true;
      velocity = 0;
      lastPointerX = e.clientX;
      lastMoveT = performance.now();
      try { section.setPointerCapture?.(e.pointerId); } catch {}
      section.style.cursor = "grabbing";
      start();
    };

    const onPointerMove = (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastPointerX;
      const dt = (now - lastMoveT) / 1000;
      offset += dx;
      wrap();
      track.style.transform = `translate3d(${offset}px,0,0)`;
      // Smooth the throw velocity so a jittery last frame doesn't dominate.
      if (dt > 0) {
        const inst = dx / dt;
        velocity = velocity * 0.7 + inst * 0.3;
      }
      lastPointerX = e.clientX;
      lastMoveT = now;
    };

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      section.style.cursor = "grab";
      if (e?.pointerId != null) { try { section.releasePointerCapture?.(e.pointerId); } catch {} }
      // velocity carries the flick; the frame loop blends it back to baseline.
      start();
    };

    section.style.cursor = "grab";
    section.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    const onResize = () => {
      measure();
      wrap();
      if (!running) start();
    };
    window.addEventListener("resize", onResize);

    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      section.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-hidden
      data-hover
      className="relative border-y border-rule bg-paper py-6 md:py-8 overflow-hidden select-none touch-pan-y"
    >
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-12 pr-12">
            {words.map((w, j) => (
              <span
                key={`${i}-${j}`}
                className={`font-display ${w === "✦" ? "text-electric text-3xl" : "italic text-ink"} text-3xl md:text-5xl leading-none`}
              >
                {w}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
