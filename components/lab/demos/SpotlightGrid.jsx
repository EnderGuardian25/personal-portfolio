"use client";
import { useEffect, useRef } from "react";

// Spotlight Grid — the board renders twice: a dim base layer and a full-color
// layer on top, masked to a radial spotlight that follows the cursor (CSS
// vars, no per-card JS). Cards also tilt gently toward the pointer.
const CARDS = [
  ["01", "Strategy", "Positioning, naming, tone"],
  ["02", "Identity", "Type, color, systems"],
  ["03", "Web", "Design + build, fast"],
  ["04", "Motion", "Interactions that sell"],
  ["05", "Content", "Copy that converts"],
  ["06", "Care", "Retainers, iteration"],
];

function CardGrid({ bright }) {
  return (
    <div className="grid h-full grid-cols-2 gap-3 p-6 sm:grid-cols-3 sm:p-8">
      {CARDS.map(([n, title, sub]) => (
        <div
          key={n}
          data-card
          className={`flex flex-col justify-between border p-4 transition-transform duration-300 ${
            bright
              ? "border-[#3b82f6]/60 bg-[#0b1226]"
              : "border-lab-line bg-lab-panel"
          }`}
        >
          <span
            className={`font-lab-mono text-[10px] tracking-[0.25em] ${
              bright ? "text-[#3b82f6]" : "text-lab-dim/60"
            }`}
          >
            {n}
          </span>
          <div>
            <p
              className={`font-lab-display text-base font-bold sm:text-lg ${
                bright ? "text-white" : "text-lab-dim"
              }`}
            >
              {title}
            </p>
            <p
              className={`mt-1 font-lab-mono text-[10px] tracking-wide ${
                bright ? "text-white/70" : "text-lab-dim/50"
              }`}
            >
              {sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SpotlightGrid({ reducedMotion }) {
  const wrapRef = useRef(null);
  const litRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const lit = litRef.current;
    if (!wrap || !lit) return;

    if (reducedMotion) {
      // Static: show the lit layer fully, no spotlight chase.
      lit.style.maskImage = "none";
      lit.style.webkitMaskImage = "none";
      return;
    }

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const mask = `radial-gradient(circle 170px at ${x}px ${y}px, black 35%, transparent 75%)`;
      lit.style.maskImage = mask;
      lit.style.webkitMaskImage = mask;

      // Subtle tilt on cards near the beam (base layer only — the lit clone
      // sits directly above and must transform identically to stay registered,
      // so tilt is applied to the shared parent instead).
      const rx = ((y / r.height) - 0.5) * -3;
      const ry = ((x / r.width) - 0.5) * 3;
      wrap.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const onLeave = () => {
      const mask = "radial-gradient(circle 0px at 50% 50%, black 0%, transparent 0%)";
      lit.style.maskImage = mask;
      lit.style.webkitMaskImage = mask;
      wrap.style.transform = "perspective(1100px)";
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    onLeave();
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#050507]">
      <div ref={wrapRef} className="relative h-full w-full will-change-transform">
        <CardGrid bright={false} />
        <div ref={litRef} aria-hidden className="absolute inset-0">
          <CardGrid bright />
        </div>
      </div>
    </div>
  );
}
