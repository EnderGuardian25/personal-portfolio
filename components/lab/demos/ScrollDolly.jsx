"use client";
import { useEffect, useRef } from "react";

// Scroll Dolly — the internal scroller drives a camera push THROUGH five
// stacked planes. Each plane wrapper covers the stage and scales about the
// stage center by exp((p − depth) · k), so approaching planes grow along a
// true perspective curve, hit "the glass" at p = depth, then blow past the
// frame edges while an opacity window fades them out. Distant planes sit
// faint until the camera nears them. Progress comes from a passive scroll
// listener, applied via refs in rAF with TIME-BASED exponential smoothing
// (fixed lerp factors run fast on 144Hz). A mono HUD counts depth in meters.

const TALL = 3.4; // scroll runway = 340% of the stage
const GROW = 2.4; // exponential dolly rate

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export default function ScrollDolly({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const sceneRef = useRef(null);
  const hudRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const scene = sceneRef.current;
    if (!scroller || !scene) return;

    const layers = Array.from(scene.querySelectorAll("[data-depth]")).map(
      (el) => ({ el, d: parseFloat(el.dataset.depth) })
    );

    const apply = (p) => {
      for (const { el, d } of layers) {
        const a = p - d; // signed distance camera→plane, in progress units
        const s = Math.exp(a * GROW);
        // Fade in while approaching from the deep, fade fast once blown past.
        const op =
          clamp01((a + 1.2) / 0.8) * (1 - clamp01((a - 0.16) / 0.34));
        el.style.transform = `scale(${s.toFixed(4)})`;
        el.style.opacity = op.toFixed(3);
        el.style.visibility = op <= 0 ? "hidden" : "visible";
      }
      if (hudRef.current)
        hudRef.current.textContent = `z ${(p * 8).toFixed(1).padStart(4, "0")}m`;
      if (hintRef.current)
        hintRef.current.style.opacity = Math.max(0, 1 - p * 6).toFixed(2);
    };

    if (reducedMotion) {
      apply(0.6); // mid-push static frame, no scrub
      return;
    }
    apply(0);

    let target = 0;
    let p = 0;
    let raf = null;
    let last = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      p += (target - p) * (1 - Math.exp(-dt / 0.12)); // camera inertia
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
      if (raf == null) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
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
          <h2 className="sr-only">Scroll dolly — scrolling pushes the camera through five planes</h2>

          {/* Plane 01 — outline type gate, met immediately */}
          <div
            data-depth="0.02"
            aria-hidden
            className="absolute inset-0 flex items-center justify-center will-change-transform"
          >
            <span
              className="font-lab-display text-[15cqw] font-extrabold uppercase leading-none tracking-tight text-transparent"
              style={{ WebkitTextStroke: "1.5px rgb(232 232 230 / 0.5)" }}
            >
              Dolly
            </span>
          </div>

          {/* Plane 02 — framed photo, house left */}
          <div data-depth="0.28" aria-hidden className="absolute inset-0 will-change-transform">
            <div className="absolute left-[13%] top-[20%] h-[42%] w-[28cqw] border border-lab-line bg-lab-panel p-[0.8cqw]">
              <img src="/lab/photo-1.webp" draggable={false} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Plane 03 — hairline ring checkpoint at the midpoint */}
          <div
            data-depth="0.52"
            aria-hidden
            className="absolute inset-0 flex items-center justify-center will-change-transform"
          >
            <div className="flex h-[34cqw] w-[34cqw] items-center justify-center rounded-full border border-lab-dim/50">
              <span className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
                Checkpoint 03
              </span>
            </div>
          </div>

          {/* Plane 04 — framed photo, house right */}
          <div data-depth="0.76" aria-hidden className="absolute inset-0 will-change-transform">
            <div className="absolute right-[12%] top-[26%] h-[40%] w-[30cqw] border border-lab-line bg-lab-panel p-[0.8cqw]">
              <img src="/lab/photo-3.webp" draggable={false} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Plane 05 — arrival slab at full depth */}
          <div
            data-depth="1"
            aria-hidden
            className="absolute inset-0 flex flex-col items-center justify-center gap-[1.5cqw] will-change-transform"
          >
            <span className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
              End of track
            </span>
            <span className="font-lab-display text-[11cqw] font-extrabold uppercase leading-none tracking-tight text-lab-text">
              Arrive
            </span>
            <span className="h-[2px] w-[10cqw] bg-[#3b82f6]" />
          </div>

          {/* Edge vignette sells the tunnel — planes blow past into shadow. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          <p className="pointer-events-none absolute left-4 top-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            Dolly forward
          </p>
          <span ref={hudRef} className="pointer-events-none absolute right-4 top-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            z 00.0m
          </span>
          <p
            ref={hintRef}
            className="pointer-events-none absolute bottom-4 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80"
          >
            Scroll ↓ — push in
          </p>
        </div>
      </div>
    </div>
  );
}
