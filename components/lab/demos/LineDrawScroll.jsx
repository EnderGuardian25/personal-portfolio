"use client";
import { useEffect, useRef } from "react";

// Line Draw — an internal scroller with real flowing content: a curvy SVG
// path (viewBox 0-100, preserveAspectRatio="none", non-scaling stroke) draws
// down the column via stroke-dashoffset mapped to scroll progress. Each
// milestone's arc-fraction is pre-sampled with getPointAtLength, so its node
// pops (overshoot scale + accent ring, CSS transition) the moment the line
// head reaches it — and un-pops if you scroll back above it.

const STOPS = [
  { x: 30, y: 14, n: "01", title: "Brief" },
  { x: 68, y: 31, n: "02", title: "Sketch" },
  { x: 30, y: 48, n: "03", title: "Prototype" },
  { x: 70, y: 65, n: "04", title: "Break it" },
  { x: 50, y: 86, n: "05", title: "Ship" },
];

const PATH =
  "M 50 2 C 50 8 30 8 30 14 C 30 20 68 24 68 31 C 68 38 30 41 30 48 " +
  "C 30 55 70 58 70 65 C 70 72 50 78 50 86 C 50 91 50 95 50 98";

export default function LineDrawScroll({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const drawRef = useRef(null);
  const headRef = useRef(null);
  const nodeRefs = useRef([]);
  const pctRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const draw = drawRef.current;
    if (!scroller || !draw) return;

    // Everything is measured in SCREEN space, not viewBox units. With
    // vector-effect: non-scaling-stroke, browsers compute the dash pattern in
    // screen space — a dasharray of getTotalLength() (user units, ~197) over
    // a ~3200px rendered path repeats its on/off pattern ~8 times, scattering
    // stroke segments across the "undrawn" route. preserveAspectRatio="none"
    // also scales x and y unevenly, so no single factor converts user length
    // to screen length; sample the path and integrate instead.
    const SAMPLES = 400;
    const L = draw.getTotalLength();
    const pts = []; // user-space sample points (head positioning, in %)
    const cum = new Float32Array(SAMPLES + 1); // cumulative SCREEN length
    let S = 0; // total screen length
    let fracs = STOPS.map(() => 0); // milestone fractions of S

    const measure = () => {
      const r = draw.closest("svg").getBoundingClientRect();
      const sx = r.width / 100;
      const sy = r.height / 100;
      pts.length = 0;
      for (let i = 0; i <= SAMPLES; i++) {
        const pt = draw.getPointAtLength((i / SAMPLES) * L);
        pts.push(pt);
        if (i > 0) {
          const prev = pts[i - 1];
          cum[i] =
            cum[i - 1] +
            Math.hypot((pt.x - prev.x) * sx, (pt.y - prev.y) * sy);
        }
      }
      S = cum[SAMPLES];
      // Each milestone's share of the screen length — nodes must pop exactly
      // when the drawn tip reaches them, so they use the same space the dash
      // reveal lives in.
      fracs = STOPS.map((s) => {
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i <= SAMPLES; i++) {
          const d = Math.hypot(pts[i].x - s.x, pts[i].y - s.y);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        return cum[best] / S;
      });
      draw.style.strokeDasharray = `${S}`;
      draw.style.opacity = "1"; // hidden until dash config lands — no full-line flash
    };
    measure();

    const apply = (p) => {
      draw.style.strokeDashoffset = `${(S * (1 - p)).toFixed(2)}`;
      const head = headRef.current;
      if (head) {
        // The drawn tip sits at screen length S*p — find that sample so the
        // bead rides the tip (user-space L*p drifts off it where x/y scales
        // differ).
        const target = S * p;
        let lo = 0;
        let hi = SAMPLES;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (cum[mid] < target) lo = mid + 1;
          else hi = mid;
        }
        head.style.left = `${pts[lo].x}%`;
        head.style.top = `${pts[lo].y}%`;
        head.style.opacity = p > 0.002 && p < 0.995 ? "1" : "0";
      }
      for (let i = 0; i < STOPS.length; i++) {
        const el = nodeRefs.current[i];
        if (el) el.classList.toggle("hit", p >= fracs[i] - 0.004);
      }
      if (pctRef.current)
        pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
      if (hintRef.current)
        hintRef.current.style.opacity = Math.max(0, 1 - p * 8).toFixed(2);
    };

    if (reducedMotion) {
      // Static ~60% drawn — three milestones lit. No scrub.
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) * 0.6;
      apply(0.6);
      const ro = new ResizeObserver(() => {
        measure();
        apply(0.6);
      });
      ro.observe(scroller);
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
    const ro = new ResizeObserver(() => {
      measure();
      apply(progress);
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
    <div ref={scrollerRef} className="line-draw h-full w-full overflow-y-auto bg-lab-bg">
      <div className="relative" style={{ height: "300%" }}>
        {/* Zero-height sticky chrome (inside the tall containing block so it
            pins for the whole range) — hint and readout ride the top edge. */}
        <div className="sticky top-0 z-10 h-0">
          <div
            ref={hintRef}
            className="pointer-events-none absolute left-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80"
          >
            Scroll ↓ to draw the line
          </div>
          <div className="pointer-events-none absolute right-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            Line draw — <span ref={pctRef}>000%</span>
          </div>
        </div>
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Ghost of the full route beneath the drawn stroke. */}
          <path
            d={PATH}
            fill="none"
            stroke="rgb(38 38 44)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <path
            ref={drawRef}
            d={PATH}
            fill="none"
            stroke="rgb(232 232 230)"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: 0 }}
          />
        </svg>

        {/* Line head — accent bead riding the drawn tip. */}
        <div
          ref={headRef}
          aria-hidden
          className="absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b82f6] opacity-0 shadow-[0_0_16px_rgba(59,130,246,0.8)]"
        />

        {STOPS.map((s, i) => (
          <div
            key={s.n}
            ref={(el) => (nodeRefs.current[i] = el)}
            className="node absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <span className="dot" aria-hidden />
            <span className="ring" aria-hidden />
            <div className={`entry ${s.x > 50 ? "flip" : ""}`}>
              <span className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
                {s.n}
              </span>
              <span className="title block font-lab-display text-[4.6cqw] font-bold leading-none tracking-tight">
                {s.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .node .dot {
          position: absolute;
          left: 0;
          top: 0;
          width: 11px;
          height: 11px;
          transform: translate(-50%, -50%) scale(0.55);
          border-radius: 50%;
          background: rgb(8 8 10);
          border: 1px solid rgb(132 132 140);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .node .ring {
          position: absolute;
          left: 0;
          top: 0;
          width: 30px;
          height: 30px;
          transform: translate(-50%, -50%) scale(0.3);
          border-radius: 50%;
          border: 1px solid rgb(59 130 246 / 0.7);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .node .entry {
          position: absolute;
          left: 26px;
          top: 0;
          transform: translateY(-50%) translateX(-8px);
          opacity: 0.35;
          transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
        }
        .node .entry.flip {
          left: auto;
          right: 26px;
          text-align: right;
          transform: translateY(-50%) translateX(8px);
        }
        .node .title {
          color: rgb(132 132 140);
          transition: color 0.45s ease;
        }
        .node.hit .dot {
          transform: translate(-50%, -50%) scale(1);
          background: rgb(59 130 246);
          border-color: rgb(59 130 246);
        }
        .node.hit .ring {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        .node.hit .entry {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
        .node.hit .title {
          color: rgb(232 232 230);
        }
      `}</style>
    </div>
  );
}
