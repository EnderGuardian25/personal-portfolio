"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

// Tilt & Glare — three cards under per-card perspective. Pointer position maps
// to rotateX/rotateY + lift targets that a shared rAF loop lerps toward, while
// a holographic sheen (hue-rotating gradient, screen-blended) tracks the
// pointer across the face. Entrance rises on an outer wrapper so its CSS
// transition never fights the per-frame tilt transform on the inner card.
const CARDS = [
  { src: "/lab/photo-1.webp", n: "01", name: "Halide" },
  { src: "/lab/photo-2.webp", n: "02", name: "Iridesce" },
  { src: "/lab/photo-3.webp", n: "03", name: "Prism" },
];
const IDLE_GLARE =
  "linear-gradient(115deg, transparent 40%, hsla(210,90%,72%,0.12) 58%, transparent 76%)";

export default function TiltGlareCards({ reducedMotion }) {
  const liftRefs = useRef([]); // entrance wrappers
  const cardRefs = useRef([]); // tilting faces
  const glareRefs = useRef([]);
  const states = useRef(
    CARDS.map(() => ({
      rx: 0, ry: 0, gx: 50, gy: 50, hue: 210, lift: 0,
      t: { rx: 0, ry: 0, gx: 50, gy: 50, hue: 210, lift: 0 },
    }))
  );
  const rafRef = useRef(null);

  const run = () => {
    if (rafRef.current != null) return;
    let prev = performance.now();
    const tick = (now) => {
      const dt = Math.min(2.5, (now - prev) / 16.7);
      prev = now;
      const k = 1 - Math.pow(0.86, dt); // exponential chase
      let energy = 0;
      states.current.forEach((s, i) => {
        const card = cardRefs.current[i];
        const glare = glareRefs.current[i];
        if (!card || !glare) return;
        for (const key of ["rx", "ry", "gx", "gy", "hue", "lift"]) {
          s[key] += (s.t[key] - s[key]) * k;
          energy += Math.abs(s.t[key] - s[key]);
        }
        card.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) translateY(${(-7 * s.lift).toFixed(2)}px) scale(${(1 + 0.025 * s.lift).toFixed(3)})`;
        card.style.boxShadow = `0 ${8 + 26 * s.lift}px ${24 + 38 * s.lift}px -12px rgba(0,0,0,${0.4 + 0.3 * s.lift}), 0 0 ${44 * s.lift}px rgba(59,130,246,${(0.14 * s.lift).toFixed(3)})`;
        glare.style.background = `linear-gradient(${100 + (s.gx - 50) * 0.5}deg, transparent ${s.gx - 26}%, hsla(${s.hue},95%,72%,${(0.08 + 0.22 * s.lift).toFixed(3)}) ${s.gx}%, hsla(${s.hue + 70},95%,70%,${(0.05 + 0.14 * s.lift).toFixed(3)}) ${s.gx + 10}%, transparent ${s.gx + 30}%), radial-gradient(circle at ${s.gx}% ${s.gy}%, hsla(${s.hue},100%,80%,${(0.16 * s.lift).toFixed(3)}), transparent 55%)`;
      });
      rafRef.current = energy > 0.05 ? requestAnimationFrame(tick) : null;
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const aim = (i, e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const t = states.current[i].t;
    t.rx = (0.5 - py) * 16;
    t.ry = (px - 0.5) * 18;
    t.gx = px * 100;
    t.gy = py * 100;
    t.hue = 170 + px * 150; // cyan → magenta sweep across the face
    t.lift = 1;
    run();
  };
  const rest = (i) => {
    const t = states.current[i].t;
    t.rx = 0; t.ry = 0; t.gx = 50; t.gy = 50; t.hue = 210; t.lift = 0;
    run();
  };

  useEffect(() => {
    if (reducedMotion) return;
    // Entrance: staggered rise + un-tilt on the wrappers (CSS transition).
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        liftRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.transition = `opacity 0.55s ease ${i * 110}ms, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${i * 110}ms`;
          el.style.opacity = "1";
          el.style.transform = "translateY(0) rotateX(0deg)";
        });
      })
    );
    return () => {
      cancelAnimationFrame(raf);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [reducedMotion]);

  const hidden = reducedMotion
    ? undefined
    : { opacity: 0, transform: "translateY(34px) rotateX(14deg)" };

  return (
    <div className="relative flex h-full w-full items-center justify-center gap-[4cqw] overflow-hidden bg-[#050507] px-[6cqw]">
      {CARDS.map((c, i) => (
        <div
          key={c.n}
          ref={(el) => (liftRefs.current[i] = el)}
          className="w-[24cqw] will-change-transform"
          style={{ perspective: "900px", ...hidden }}
        >
          <div
            ref={(el) => (cardRefs.current[i] = el)}
            onPointerMove={reducedMotion ? undefined : (e) => aim(i, e)}
            onPointerLeave={reducedMotion ? undefined : () => rest(i)}
            className="relative aspect-[3/4] overflow-hidden rounded-md border border-lab-line bg-lab-panel will-change-transform"
            style={{ boxShadow: "0 8px 24px -12px rgba(0,0,0,0.4)" }}
          >
            <Image
              src={c.src}
              alt=""
              fill
              sizes="(max-width: 640px) 30vw, 320px"
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div
              ref={(el) => (glareRefs.current[i] = el)}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: IDLE_GLARE, mixBlendMode: "screen" }}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-between p-3">
              <span className="font-lab-display text-sm font-bold tracking-[0.15em] text-white/90">
                {c.name}
              </span>
              <span className="font-lab-mono text-[10px] tracking-[0.25em] text-[#3b82f6]">
                {c.n}
              </span>
            </div>
          </div>
        </div>
      ))}
      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Hover a card — the sheen follows
      </p>
    </div>
  );
}
