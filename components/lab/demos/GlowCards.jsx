"use client";
import { useEffect, useRef } from "react";

// Glow Cards — the Linear/Vercel-style glow-border card. NO tilt: one grid
// listener feeds every card two CSS vars (--mx/--my = pointer coords in the
// card's local space, allowed to be OUTSIDE the card) plus a --glow intensity.
// The border glow is a radial-gradient at the pointer masked to a 1px ring
// (padding-box / mask-composite: exclude); a second layer is a faint interior
// wash. Because gradient centers may sit outside a card, neighbours light the
// edge NEAREST the pointer with a distance-falloff intensity.
// Stationary rule: intensity targets derive purely from pointer POSITION, so a
// resting pointer holds the glow at full strength; targets ease in/out through
// time-based smoothing (1 − exp(−dt/τ)) in a rAF loop that parks once settled.
// Reduced motion: still tracks (position-driven) but writes are applied
// directly in the pointer handlers — no loop, near-instant ease.
const CARDS = [
  { label: "Uptime", stat: "99.98%", delta: "+0.02", pts: "0,13 8,12 16,12.5 24,11 32,11.5 40,10 48,10.5 56,9" },
  { label: "Latency p95", stat: "212ms", delta: "−14ms", pts: "0,6 8,9 16,7 24,11 32,10 40,13 48,12 56,14" },
  { label: "Deploys", stat: "1,284", delta: "+96", pts: "0,14 8,13 16,10 24,11 32,8 40,9 48,5 56,4" },
  { label: "Error rate", stat: "0.14%", delta: "−0.03", pts: "0,5 8,7 16,6 24,9 32,8 40,11 48,12 56,13" },
  { label: "Throughput", stat: "8.2k/s", delta: "+412", pts: "0,12 8,10 16,11 24,8 32,9 40,6 48,7 56,4" },
  { label: "Build time", stat: "46s", delta: "−9s", pts: "0,7 8,8 16,6 24,7 32,10 40,9 48,12 56,11" },
];
const FALLOFF = 150; // px — how far past a card's edge the neighbour glow reaches

export default function GlowCards({ reducedMotion }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll("[data-card]"));
    const glow = cards.map(() => 0);
    let rects = [];

    const measure = () => {
      const rr = root.getBoundingClientRect();
      rects = cards.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    // Pointer position → per-card target intensity: 1 inside a card, falling
    // off with distance from its nearest edge. Purely positional.
    const targetFor = (c, p) => {
      const dx = Math.max(c.x - p.x, 0, p.x - c.x - c.w);
      const dy = Math.max(c.y - p.y, 0, p.y - c.y - c.h);
      return Math.max(0, 1 - Math.hypot(dx, dy) / FALLOFF);
    };
    const writeVars = (c, p, g) => {
      c.el.style.setProperty("--mx", `${(p.x - c.x).toFixed(1)}px`);
      c.el.style.setProperty("--my", `${(p.y - c.y).toFixed(1)}px`);
      c.el.style.setProperty("--glow", g.toFixed(3));
    };

    let pointer = null;

    if (reducedMotion) {
      // Position-driven, no animation: apply directly per event.
      const onMove = (e) => {
        const rr = root.getBoundingClientRect();
        const p = { x: e.clientX - rr.left, y: e.clientY - rr.top };
        rects.forEach((c) => writeVars(c, p, targetFor(c, p)));
      };
      const onLeave = () => {
        rects.forEach((c) => c.el.style.setProperty("--glow", "0"));
      };
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
      return () => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
        ro.disconnect();
      };
    }

    let raf = null;
    let prev = 0;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      let settled = true;
      rects.forEach((c, i) => {
        const t = pointer ? targetFor(c, pointer) : 0;
        // ease in briskly, linger on the way out
        const tau = t > glow[i] ? 0.12 : 0.28;
        glow[i] += (t - glow[i]) * (1 - Math.exp(-dt / tau));
        if (Math.abs(t - glow[i]) > 0.003) settled = false;
        if (pointer) writeVars(c, pointer, glow[i]);
        else c.el.style.setProperty("--glow", glow[i].toFixed(3));
      });
      if (pointer == null && settled) {
        rects.forEach((c, i) => {
          glow[i] = 0;
          c.el.style.setProperty("--glow", "0");
        });
        raf = null; // fully faded — park
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf == null) {
        prev = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e) => {
      const rr = root.getBoundingClientRect();
      pointer = { x: e.clientX - rr.left, y: e.clientY - rr.top };
      start();
    };
    const onLeave = () => {
      pointer = null;
      start(); // run the ease-out to zero
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="flex h-full w-full flex-col overflow-hidden bg-[#050508] p-4 sm:p-6"
    >
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
        {CARDS.map((c, i) => (
          <div
            key={c.label}
            data-card
            style={{ "--mx": "50%", "--my": "50%", "--glow": 0, "--i": i }}
            className="gc-card relative flex flex-col justify-between gap-2 border border-lab-line bg-lab-panel p-3 sm:p-4"
          >
            {/* border glow: gradient at the pointer, masked to a 1px ring */}
            <div aria-hidden className="gc-ring" />
            {/* faint interior wash at the pointer */}
            <div aria-hidden className="gc-wash" />

            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate font-lab-mono text-[9px] uppercase tracking-[0.25em] text-lab-dim">
                {c.label}
              </span>
              <span className="font-lab-mono text-[9px] text-lab-dim/60">
                {c.delta}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="font-lab-mono text-sm text-lab-text sm:text-lg">
                {c.stat}
              </span>
              <svg
                aria-hidden
                viewBox="0 0 56 18"
                className="h-4 w-14 shrink-0 text-lab-dim/50"
              >
                <polyline
                  points={c.pts}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <p className="pointer-events-none mt-3 shrink-0 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        rest anywhere — the border holds its glow
      </p>

      <style jsx>{`
        .gc-card {
          animation: gc-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i) * 60ms);
        }
        @keyframes gc-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
        }
        /* 1px ring: paint a pointer-centred radial gradient, then knock out
           everything except the outer 1px via padding-box mask composite. */
        .gc-ring {
          position: absolute;
          inset: 0;
          padding: 1px;
          pointer-events: none;
          background: radial-gradient(
            200px circle at var(--mx) var(--my),
            rgb(139 92 246 / calc(var(--glow) * 0.95)),
            rgb(139 92 246 / calc(var(--glow) * 0.15)) 55%,
            transparent 75%
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
        }
        .gc-wash {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            240px circle at var(--mx) var(--my),
            rgb(139 92 246 / calc(var(--glow) * 0.09)),
            transparent 70%
          );
        }
      `}</style>
    </div>
  );
}
