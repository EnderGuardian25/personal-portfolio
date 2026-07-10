"use client";
import { useEffect, useRef } from "react";

// Path Text — a sentence rides an SVG <textPath> in an endless loop: rAF
// advances startOffset modulo one sentence-length (negative offset, so the
// rail never shows a gap). The pointer's y bends the cubic's control points
// into an S-curve (rewritten into `d` each frame) and x throttles the speed.
const SENTENCE = "TYPE THAT TRAVELS · BEND THE RAIL · ";
const COPIES = 4;
const MID = 310; // rail resting height in viewBox units

export default function PathText({ reducedMotion }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const tpRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    const tp = tpRef.current;
    if (!wrap || !path || !tp) return;

    if (reducedMotion) {
      // Settled end state: a gently bent rail, sentence parked mid-run.
      path.setAttribute("d", `M -80 ${MID} C 260 ${MID - 105} 740 ${MID + 105} 1080 ${MID}`);
      tp.setAttribute("startOffset", "-40");
      return;
    }

    // One sentence-copy's length along the path — the loop's modulo period.
    let unit = 900;
    const measure = () => {
      try {
        const u = tp.getSubStringLength(0, SENTENCE.length);
        if (u > 0) unit = u;
      } catch {}
    };
    measure();
    document.fonts?.ready?.then(measure);

    // Entrance: flat rail + hot speed; both relax toward the ambient targets.
    const cur = { c1: MID, c2: MID, speed: 3.4, off: 0 };
    const ptr = { x: null, y: null };
    let raf = null;
    let prev = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const t = now / 1000;

      let c1t, c2t, spdT;
      if (ptr.x == null) {
        // Ambient: the rail breathes on its own (touch users still see life).
        c1t = MID - Math.sin(t * 0.5) * 150;
        c2t = MID + Math.sin(t * 0.5 + 0.9) * 150;
        spdT = 1;
      } else {
        const dy = ptr.y - 0.5;
        c1t = MID + dy * 560;
        c2t = MID - dy * 560;
        spdT = 0.35 + ptr.x * 2.1;
      }
      cur.c1 += (c1t - cur.c1) * 0.06;
      cur.c2 += (c2t - cur.c2) * 0.06;
      cur.speed += (spdT - cur.speed) * 0.045;
      cur.off += 150 * cur.speed * dt;

      path.setAttribute(
        "d",
        `M -80 ${MID} C 260 ${cur.c1.toFixed(1)} 740 ${cur.c2.toFixed(1)} 1080 ${MID}`
      );
      tp.setAttribute("startOffset", (-(cur.off % unit)).toFixed(1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      ptr.x = (e.clientX - r.left) / r.width;
      ptr.y = (e.clientY - r.top) / r.height;
    };
    const onLeave = () => {
      ptr.x = null;
      ptr.y = null;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-[#07070a]">
      <span className="sr-only">{SENTENCE}</span>
      <svg
        aria-hidden
        className="h-full w-full text-lab-text"
        viewBox="0 0 1000 620"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          ref={pathRef}
          id="pt-rail"
          d={`M -80 ${MID} C 260 ${MID} 740 ${MID} 1080 ${MID}`}
          fill="none"
          stroke="rgb(232 232 230 / 0.1)"
          strokeWidth="1"
        />
        <text
          fill="currentColor"
          className="font-lab-display"
          style={{ fontSize: 56, fontWeight: 700, letterSpacing: "0.05em" }}
        >
          <textPath ref={tpRef} href="#pt-rail" startOffset="0">
            {SENTENCE.repeat(COPIES)}
          </textPath>
        </text>
      </svg>
      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        &#8597; bends the rail &middot; &#8596; drives speed
      </p>
    </div>
  );
}
