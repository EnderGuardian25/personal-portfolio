"use client";
import { useEffect, useId, useRef } from "react";
import gsap from "gsap";

// Blueprint Hero — the hero drafts itself. Grid paper fades up, dashed
// dimension lines draw (a solid line inside an SVG mask animates
// stroke-dashoffset, so the dashes are revealed rather than marching),
// wireframe boxes sketch in via perimeter dashoffset, then the real
// typographic hero crossfades over the plan while the draft dims to a ghost.

// Percent-of-stage coords shared by the SVG plan and the HTML hero overlay.
const BOXES = [
  { x: 8, y: 22, w: 26, h: 5 }, // kicker
  { x: 8, y: 31, w: 66, h: 27 }, // headline
  { x: 8, y: 63, w: 40, h: 5 }, // subline
  { x: 80, y: 22, w: 12, h: 46 }, // side panel
];
const CROSSES = [
  [74, 31],
  [8, 58],
  [92, 68],
];

export default function BlueprintHero({ reducedMotion }) {
  const rootRef = useRef(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const plan = root.querySelectorAll("[data-plan]");

    if (reducedMotion) {
      // Settled end state: hero on top, draft dimmed to a ghost underneath.
      gsap.set(plan, { opacity: 0.22 });
      return;
    }

    const ctx = gsap.context(() => {
      const draw = (els) =>
        els.forEach((el) => {
          const L = el.getTotalLength();
          el.style.strokeDasharray = L;
          el.style.strokeDashoffset = L;
        });
      const masks = gsap.utils.toArray("[data-mask]", root);
      const boxes = gsap.utils.toArray("[data-box]", root);
      draw(masks);
      draw(boxes);

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-grid]", { opacity: 0, duration: 0.7, ease: "power1.inOut" })
        .to(masks, {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: "power2.inOut",
          stagger: 0.18,
        }, "-=0.25")
        .from("[data-tag]", { opacity: 0, y: 6, duration: 0.4, stagger: 0.09 }, "-=0.45")
        .to(boxes, {
          strokeDashoffset: 0,
          duration: 0.85,
          ease: "power2.inOut",
          stagger: 0.13,
        }, "-=0.2")
        .from("[data-hero]", {
          opacity: 0,
          y: 18,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.08,
        }, "+=0.2")
        .to(plan, { opacity: 0.22, duration: 0.9, ease: "power2.inOut" }, "<");
    }, root);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-lab-bg">
      {/* Grid paper */}
      <div
        data-plan
        data-grid
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* The plan: dimension lines + wireframe boxes */}
      <svg
        data-plan
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={`${uid}h`}>
            <line data-mask x1="8" y1="14" x2="74" y2="14" stroke="#fff" strokeWidth="6" />
          </mask>
          <mask id={`${uid}v`}>
            <line data-mask x1="4" y1="31" x2="4" y2="58" stroke="#fff" strokeWidth="6" />
          </mask>
        </defs>
        <g mask={`url(#${uid}h)`} stroke="#84848c" strokeOpacity="0.8" vectorEffect="non-scaling-stroke">
          <line x1="8" y1="14" x2="74" y2="14" strokeDasharray="1 0.9" vectorEffect="non-scaling-stroke" />
          <line x1="8" y1="12.4" x2="8" y2="15.6" vectorEffect="non-scaling-stroke" />
          <line x1="74" y1="12.4" x2="74" y2="15.6" vectorEffect="non-scaling-stroke" />
        </g>
        <g mask={`url(#${uid}v)`} stroke="#84848c" strokeOpacity="0.8">
          <line x1="4" y1="31" x2="4" y2="58" strokeDasharray="1 0.9" vectorEffect="non-scaling-stroke" />
          <line x1="2.6" y1="31" x2="5.4" y2="31" vectorEffect="non-scaling-stroke" />
          <line x1="2.6" y1="58" x2="5.4" y2="58" vectorEffect="non-scaling-stroke" />
        </g>
        <g fill="none" stroke="#3b82f6" strokeOpacity="0.55">
          {BOXES.map((b, i) => (
            <rect key={i} data-box x={b.x} y={b.y} width={b.w} height={b.h} vectorEffect="non-scaling-stroke" />
          ))}
          {CROSSES.map(([cx, cy], i) => (
            <path key={i} data-box d={`M${cx - 1.1} ${cy}h2.2M${cx} ${cy - 1.4}v2.8`} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>

      {/* Dimension / spec labels */}
      <div data-plan aria-hidden className="absolute inset-0 font-lab-mono text-[9px] uppercase tracking-[0.25em] text-lab-dim">
        <span data-tag className="absolute" style={{ left: "37%", top: "9%" }}>66cqw</span>
        <span data-tag className="absolute" style={{ left: "5.5%", top: "43%" }}>27cqh</span>
        <span data-tag className="absolute" style={{ left: "8%", top: "27.5%" }}>h1 / syne 800</span>
        <span data-tag className="absolute" style={{ left: "80%", top: "18.5%" }}>fig. 01</span>
      </div>

      {/* The real thing, laid over its own plan */}
      <div data-hero className="absolute font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim" style={{ left: "8%", top: "22%" }}>
        Portfolio — Vol. 03
      </div>
      <h2
        data-hero
        className="absolute font-lab-display font-extrabold leading-[0.95] tracking-tight text-lab-text"
        style={{ left: "8%", top: "31%", fontSize: "clamp(1.6rem, 10cqw, 9rem)" }}
      >
        DRAWN
        <br />
        TO SPEC
      </h2>
      <div data-hero className="absolute font-lab-mono text-[10px] uppercase tracking-[0.25em] text-lab-dim" style={{ left: "8%", top: "63.5%" }}>
        Grid 12 · Gutter 24 · Set in Syne
      </div>
      <div
        data-hero
        className="absolute flex items-end justify-center border border-lab-line bg-lab-panel/80 pb-3"
        style={{ left: "80%", top: "22%", width: "12%", height: "46%", borderTop: "1px solid rgba(59,130,246,0.6)" }}
      >
        <span className="font-lab-mono text-[9px] uppercase tracking-[0.25em] text-lab-dim" style={{ writingMode: "vertical-rl" }}>
          Elevation A
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        The hero drafts itself — replay to re-draft
      </div>
    </div>
  );
}
