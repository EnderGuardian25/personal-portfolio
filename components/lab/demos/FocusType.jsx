"use client";
import { useEffect, useRef } from "react";

// Focus Pull — the sentence splits into per-word spans; a rAF loop maps each
// word's distance-to-pointer through a gaussian and eases blur / opacity /
// scale toward the result (direct style writes, time-based smoothing:
// k = 1 − exp(−dt/τ), never a fixed per-frame lerp). Purely position-driven,
// so a stationary pointer keeps its word racked sharp. Emphasis is a
// TRANSFORM scale, never variable weight — animating "wght" changes glyph
// advance widths, which re-wraps the lines and makes the sentence jump
// around under the pointer (browser-verified defect).
// With no pointer the whole line relaxes to a uniform soft-focus resting
// state — the same targets the mount entrance converges into from a heavy
// defocus, so the entrance costs nothing extra. The loop parks once settled.
// Reduced motion: everything sharp, no listeners, no loop.

const TEXT = "Focus is a decision. Everything else is just bokeh.";
const RADIUS = 150; // px — gaussian sigma around the pointer
const REST = { blur: 1.8, alpha: 0.55, scale: 1 }; // idle soft-focus

export default function FocusType({ reducedMotion }) {
  const wrapRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const line = lineRef.current;
    if (!wrap || !line || reducedMotion) return;

    const els = Array.from(line.querySelectorAll("[data-word]"));
    // Start from the entrance's heavy defocus; the loop converges to REST.
    const state = els.map(() => ({ blur: 9, alpha: 0, scale: 0.96 }));
    let centers = [];
    let pointer = null;
    let raf = null;
    let prev = performance.now();

    const measure = () => {
      const wr = wrap.getBoundingClientRect();
      centers = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
      });
    };
    measure();
    document.fonts?.ready?.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);

    const apply = (el, s) => {
      el.style.filter = s.blur > 0.03 ? `blur(${s.blur.toFixed(2)}px)` : "none";
      el.style.opacity = s.alpha.toFixed(3);
      el.style.transform = `scale(${s.scale.toFixed(4)})`;
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const k = 1 - Math.exp(-dt / 0.12);
      let delta = 0;
      for (let i = 0; i < els.length; i++) {
        const s = state[i];
        let tb = REST.blur;
        let ta = REST.alpha;
        let ts = REST.scale;
        if (pointer) {
          const dx = centers[i].x - pointer.x;
          const dy = centers[i].y - pointer.y;
          const f = Math.exp(-(dx * dx + dy * dy) / (2 * RADIUS * RADIUS));
          tb = 3.6 * (1 - f); // nearest word → blur(0)
          ta = 0.3 + 0.7 * f;
          ts = 1 + 0.06 * f; // slight lift on the sharp word — no reflow
        }
        s.blur += (tb - s.blur) * k;
        s.alpha += (ta - s.alpha) * k;
        s.scale += (ts - s.scale) * k;
        // Normalize the three channels into one settle metric.
        delta += Math.abs(tb - s.blur) + Math.abs(ta - s.alpha) * 4 + Math.abs(ts - s.scale) * 20;
        apply(els[i], s);
      }
      // Park purely on convergence — a resting pointer's targets can't change
      // (gaussians depend on position only), converged styles persist in the
      // DOM, and onMove's start() revives the loop the moment they can.
      raf = delta > 0.05 ? requestAnimationFrame(tick) : null;
    };
    const start = () => {
      if (raf == null) {
        prev = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    start(); // entrance: defocused → resting soft focus

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      start();
    };
    const onLeave = () => {
      pointer = null;
      start(); // keep ticking until the line settles back to REST
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const words = TEXT.split(" ");
  // Weight is FIXED (600) in both modes — see header comment.
  const base = reducedMotion
    ? { fontVariationSettings: '"wght" 600' }
    : {
        filter: "blur(9px)",
        opacity: 0,
        transform: "scale(0.96)",
        fontVariationSettings: '"wght" 600',
      };

  return (
    <div
      ref={wrapRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#07070a] px-[6cqw]"
    >
      <p
        ref={lineRef}
        className="max-w-[18ch] text-center font-lab-display font-bold leading-[1.14] tracking-tight text-lab-text"
        style={{ fontSize: "clamp(1.3rem, 6.2cqw, 4.2rem)" }}
      >
        {words.map((w, i) => (
          <span key={i}>
            <span data-word className="inline-block will-change-[filter,opacity,transform]" style={base}>
              {w}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </p>
      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Rack focus — rest on any word
      </p>
    </div>
  );
}
