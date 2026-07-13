"use client";
import { useEffect, useRef } from "react";

// Aurora Veil — three pre-blurred radial-gradient blobs (screen-blended; no
// filter: blur, so compositing stays cheap) drift on slow sine orbits behind a
// frosted-glass pane (backdrop-filter: blur + saturate). The pointer POSITION
// is smoothed and then biases every blob's orbit toward the cursor and tilts
// the pane a few degrees — position-driven, so the pull and tilt hold while
// the pointer rests (stationary-hover rule). Entrance: blobs bloom and the
// pane rises via CSS transitions on OUTER wrappers, so they never fight the
// per-frame transforms written to the inner elements.

const BLOBS = [
  // size/orbit/pull are % of stage size; fx/fy are rad/s (periods ~20–35s)
  { c: "rgba(59,130,246,0.50)", size: 100, x: 30, y: 34, fx: 0.29, fy: 0.21, ph: 0.0, orbit: 7, pull: 20 },
  { c: "rgba(34,211,238,0.34)", size: 84, x: 70, y: 26, fx: 0.22, fy: 0.31, ph: 2.1, orbit: 9, pull: 30 },
  { c: "rgba(139,92,246,0.38)", size: 94, x: 54, y: 76, fx: 0.17, fy: 0.26, ph: 4.4, orbit: 8, pull: 25 },
];

export default function AuroraVeilHero({ reducedMotion }) {
  const wrapRef = useRef(null);
  const paneRef = useRef(null); // inner pane — per-frame tilt
  const liftRef = useRef(null); // outer pane wrapper — entrance rise
  const blobRefs = useRef([]); // outer blob els — per-frame drift
  const bloomRefs = useRef([]); // inner blob els — entrance bloom

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reducedMotion) return;

    // Entrance — double rAF so the hidden inline styles paint first.
    const entry = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        bloomRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.transition = `opacity 1.4s ease ${i * 180}ms, transform 1.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 180}ms`;
          el.style.opacity = "1";
          el.style.transform = "scale(1)";
        });
        const lift = liftRef.current;
        if (lift) {
          lift.style.transition =
            "opacity 0.8s ease 0.3s, transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s";
          lift.style.opacity = "1";
          lift.style.transform = "translateY(0)";
        }
      })
    );

    // Cache stage size — no getBoundingClientRect inside the frame loop.
    let w = wrap.clientWidth;
    let h = wrap.clientHeight;
    const ro = new ResizeObserver(() => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
    });
    ro.observe(wrap);

    const target = { x: 0.5, y: 0.5 };
    const p = { x: 0.5, y: 0.5 };
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
    };
    const onLeave = () => {
      target.x = 0.5;
      target.y = 0.5;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    let raf = null;
    let prev = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const k = 1 - Math.exp(-dt / 0.4); // lazy, glassy chase
      p.x += (target.x - p.x) * k;
      p.y += (target.y - p.y) * k;
      const t = now / 1000;

      blobRefs.current.forEach((el, i) => {
        if (!el) return;
        const b = BLOBS[i];
        // Slow orbit + sustained attraction toward the (resting) pointer.
        const dx = (Math.sin(t * b.fx + b.ph) * b.orbit + (p.x - 0.5) * b.pull) * (w / 100);
        const dy = (Math.cos(t * b.fy + b.ph * 1.7) * b.orbit * 0.7 + (p.y - 0.5) * b.pull * 0.7) * (h / 100);
        el.style.transform = `translate(-50%, -50%) translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });

      const pane = paneRef.current;
      if (pane) {
        const rx = (0.5 - p.y) * 5;
        const ry = (p.x - 0.5) * 7;
        pane.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(entry);
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  const hiddenBloom = reducedMotion ? undefined : { opacity: 0, transform: "scale(0.55)" };
  const hiddenPane = reducedMotion ? undefined : { opacity: 0, transform: "translateY(30px)" };

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-[#050508]">
      {/* Aurora field */}
      <div aria-hidden className="absolute inset-0">
        {BLOBS.map((b, i) => (
          <div
            key={i}
            ref={(el) => (blobRefs.current[i] = el)}
            className="absolute will-change-transform"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}cqw`,
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              ref={(el) => (bloomRefs.current[i] = el)}
              className="h-full w-full"
              style={{
                background: `radial-gradient(circle, ${b.c} 0%, transparent 66%)`,
                mixBlendMode: "screen",
                ...hiddenBloom,
              }}
            />
          </div>
        ))}
      </div>

      {/* Frosted pane */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        <div ref={liftRef} className="will-change-transform" style={hiddenPane}>
          <div
            ref={paneRef}
            className="border border-lab-line px-[5cqw] py-[4cqw] will-change-transform"
            style={{
              background: "rgba(255,255,255,0.045)",
              backdropFilter: "blur(16px) saturate(1.6)",
              WebkitBackdropFilter: "blur(16px) saturate(1.6)",
              boxShadow: "0 24px 70px -32px rgba(0,0,0,0.85)",
            }}
          >
            <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
              Aurora — no shader
            </p>
            <h2
              className="mt-3 font-lab-display font-extrabold leading-[1.05] tracking-tight text-lab-text"
              style={{ fontSize: "clamp(1.2rem, 5.5cqw, 3.6rem)" }}
            >
              Borrowed light,
              <br />
              held behind glass.
            </h2>
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Rest anywhere — the light leans in
      </p>
    </div>
  );
}
