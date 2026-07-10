"use client";
import { useEffect, useRef } from "react";

// Ripple Swap (signature). Two sentences occupy the same char cells; a per-cell
// energy field driven by the pointer's recent path decides which sentence each
// cell shows. Two forces feed the field: a direct streak along the swept path,
// and a ripple ring expanding outward from every path point (distance ÷ speed
// = delay, so the swap propagates instead of popping). Energy decays each
// frame, so the line heals back to sentence A. All per-frame work is direct
// class/style mutation via refs — the Marquee.jsx pattern — zero React state.

const A = "The details are the design.";
const B = "The surface hides a system.";

const RIPPLE_SPEED = 640; // px/s wavefront
const RING_WIDTH = 42; // px ripple thickness
const STREAK_RADIUS = 54; // px direct-path glow
const POINT_LIFE = 900; // ms a path point keeps emitting
const DECAY = 0.93; // per-frame energy retention

export default function RippleSwap({ reducedMotion }) {
  const wrapRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return; // CSS hover crossfade handles it (see styles)

    const wrap = wrapRef.current;
    const line = lineRef.current;
    if (!wrap || !line) return;

    const cells = Array.from(line.children);
    let centers = [];
    const energy = new Float32Array(cells.length);
    const on = new Uint8Array(cells.length);
    const points = []; // recent pointer path {x, y, t}
    let raf = null;

    const measure = () => {
      // Shrink-to-fit the single line, then cache cell centers.
      line.style.fontSize = "100px";
      const natural = line.scrollWidth;
      const target = wrap.clientWidth * 0.92;
      line.style.fontSize = `${Math.max(18, Math.min(100 * (target / natural), wrap.clientHeight * 0.38))}px`;
      const wr = wrap.getBoundingClientRect();
      centers = cells.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    document.fonts?.ready?.then(measure);

    const onPointerMove = (e) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const last = points[points.length - 1];
      if (!last || Math.hypot(x - last.x, y - last.y) > 8) {
        points.push({ x, y, t: performance.now() });
        if (points.length > 40) points.shift();
      }
      start();
    };
    wrap.addEventListener("pointermove", onPointerMove);

    const tick = () => {
      const now = performance.now();
      while (points.length && now - points[0].t > POINT_LIFE) points.shift();

      let alive = points.length > 0;
      for (let i = 0; i < cells.length; i++) {
        let target = 0;
        for (let p = 0; p < points.length; p++) {
          const pt = points[p];
          const age = now - pt.t;
          const d = Math.hypot(centers[i].x - pt.x, centers[i].y - pt.y);
          const fade = 1 - age / POINT_LIFE;
          // Direct streak under the swept path.
          const streak = Math.exp((-d * d) / (2 * STREAK_RADIUS * STREAK_RADIUS)) * fade;
          // Expanding ripple ring: cells farther away light up later.
          const front = (age / 1000) * RIPPLE_SPEED;
          const off = d - front;
          const ring = Math.exp((-off * off) / (2 * RING_WIDTH * RING_WIDTH)) * fade * 0.9;
          const v = Math.max(streak, ring);
          if (v > target) target = v;
        }
        const e = Math.max(energy[i] * DECAY, target);
        energy[i] = e;
        if (e > 0.005) alive = true;
        // Hysteresis so cells don't flicker at the threshold.
        if (!on[i] && e > 0.5) {
          on[i] = 1;
          cells[i].classList.add("on");
        } else if (on[i] && e < 0.28) {
          on[i] = 0;
          cells[i].classList.remove("on");
        }
      }

      raf = alive ? requestAnimationFrame(tick) : null;
      if (!alive) {
        // Field fully decayed — make sure everything healed back to A.
        for (let i = 0; i < cells.length; i++) {
          if (on[i]) {
            on[i] = 0;
            cells[i].classList.remove("on");
          }
          energy[i] = 0;
        }
      }
    };
    const start = () => {
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    return () => {
      wrap.removeEventListener("pointermove", onPointerMove);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const len = Math.max(A.length, B.length);
  const pairs = Array.from({ length: len }, (_, i) => [
    A[i] ?? " ",
    B[i] ?? " ",
  ]);

  return (
    <div
      ref={wrapRef}
      className={`ripple-swap flex h-full w-full items-center justify-center ${
        reducedMotion ? "reduced" : ""
      }`}
    >
      {/* The real sentence for AT; the animated cells are decoration. */}
      <span className="sr-only">{A}</span>
      <div
        ref={lineRef}
        aria-hidden
        className="whitespace-nowrap font-lab-display font-bold leading-none tracking-tight"
      >
        {/* Spaces render as literal NBSP (U+00A0) inside the ternaries below —
            whitespace-only text nodes don't generate grid items and would
            collapse the cell to zero width. Don't "fix" them to plain spaces. */}
        {pairs.map(([a, b], i) => (
          <span key={i} className="cell">
            <span className="glyph-a">{a === " " ? " " : a}</span>
            <span className="glyph-b">{b === " " ? " " : b}</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .cell {
          display: inline-grid;
          perspective: 400px;
        }
        .cell > span {
          grid-area: 1 / 1;
          backface-visibility: hidden;
          transition:
            transform 0.32s cubic-bezier(0.3, 0.9, 0.3, 1),
            opacity 0.26s ease;
        }
        .glyph-a {
          color: rgb(232 232 230);
          transform: rotateX(0deg);
          opacity: 1;
        }
        .glyph-b {
          color: rgb(59 130 246);
          transform: rotateX(88deg);
          opacity: 0;
        }
        .cell.on .glyph-a {
          transform: rotateX(-88deg);
          opacity: 0;
        }
        .cell.on .glyph-b {
          transform: rotateX(0deg);
          opacity: 1;
        }
        /* Reduced motion: plain crossfade of the whole line on hover. */
        .reduced .glyph-a,
        .reduced .glyph-b {
          transition: opacity 0.2s ease;
          transform: none;
        }
        .reduced:hover .glyph-a {
          opacity: 0;
        }
        .reduced:hover .glyph-b {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
