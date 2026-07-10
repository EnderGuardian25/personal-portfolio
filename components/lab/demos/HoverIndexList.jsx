"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

// Hover Index — editorial index rows with a bottom-up inverted fill on hover.
// A floating preview frame chases the cursor on a lerped rAF loop, tilting
// with its own horizontal velocity; per-row photos crossfade inside it via
// direct opacity writes (CSS transitions), never React state per frame.

const ROWS = [
  { title: "Fieldwork", meta: "Photography — 2024", src: "/lab/photo-1.webp" },
  { title: "Tidelines", meta: "Direction — 2024", src: "/lab/photo-2.webp" },
  { title: "Signal Grid", meta: "Interactive — 2025", src: "/lab/photo-3.webp" },
  { title: "Night Survey", meta: "Film — 2026", src: "/lab/photo-4.webp" },
];

export default function HoverIndexList({ reducedMotion }) {
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const previewRef = useRef(null);
  const imgRefs = useRef([]);
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0 }).current;

  // Entrance: rows rise in on a stagger (gsap sets "from" at runtime, so the
  // no-motion default markup is already the settled state).
  useEffect(() => {
    if (reducedMotion || !listRef.current) return;
    const tween = gsap.fromTo(
      listRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.07, delay: 0.1 }
    );
    return () => tween.kill();
  }, [reducedMotion]);

  // Preview chase loop.
  useEffect(() => {
    const el = wrapRef.current;
    const pv = previewRef.current;
    if (!el || !pv) return;

    if (reducedMotion) {
      // Settled state: preview parked top-right; hover still crossfades it in.
      pv.style.left = "auto";
      pv.style.right = "24px";
      pv.style.top = "24px";
      pv.style.transform = "none";
      return;
    }

    // Seed the chase at a sane spot so keyboard focus (no pointer yet)
    // doesn't grow the preview out of the top-left corner.
    state.x = state.tx = el.clientWidth * 0.68;
    state.y = state.ty = el.clientHeight * 0.42;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      state.tx = e.clientX - r.left;
      state.ty = e.clientY - r.top;
    };
    el.addEventListener("pointermove", onMove);

    let raf;
    const tick = () => {
      const px = state.x;
      state.x += (state.tx - state.x) * 0.14;
      state.y += (state.ty - state.y) * 0.14;
      state.s += (state.ts - state.s) * 0.16;
      // Tilt follows the frame's own velocity — it banks into turns.
      const tilt = Math.max(-10, Math.min(10, (state.x - px) * 0.55));
      pv.style.transform = `translate3d(${state.x + 24}px, ${state.y - 76}px, 0) rotate(${tilt}deg) scale(${Math.max(0, state.s)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, state]);

  // Direct style writes on hover — crossfade the stacked photos, show/scale
  // the frame. No per-frame React state.
  const setRow = (i) => {
    state.ts = i == null ? 0 : 1;
    imgRefs.current.forEach((img, j) => {
      if (img) img.style.opacity = i === j ? "1" : "0";
    });
    if (previewRef.current) previewRef.current.style.opacity = i == null ? "0" : "1";
  };

  return (
    <div
      ref={wrapRef}
      className="relative flex h-full w-full flex-col justify-center overflow-hidden bg-[#07070a] px-6 sm:px-10"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">Index / 04</p>
        <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">Selected work</p>
      </div>

      <div ref={listRef} className="flex w-full flex-col" onPointerLeave={() => setRow(null)}>
        {ROWS.map((row, i) => (
          <button
            key={row.title}
            type="button"
            aria-label={`${row.title} — ${row.meta}`}
            onPointerEnter={() => setRow(i)}
            onFocus={() => setRow(i)}
            onBlur={() => setRow(null)}
            className="group relative overflow-hidden border-t border-lab-line text-left last:border-b"
          >
            <span
              className="absolute inset-0 origin-bottom scale-y-0 bg-lab-text transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
              aria-hidden
            />
            <span className="relative z-10 grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 px-1 py-[3cqw] sm:grid-cols-[3.5rem_1fr_auto]">
              <span className="font-lab-mono text-[10px] tracking-[0.25em] text-lab-dim transition-colors duration-300 group-hover:text-[#3b82f6]">
                0{i + 1}
              </span>
              <span
                className="font-lab-display font-bold uppercase leading-none tracking-tight text-lab-text transition-colors duration-300 group-hover:text-[#0a0a0c]"
                style={{ fontSize: "min(6.5cqw, 84px)" }}
              >
                {row.title}
              </span>
              <span className="font-lab-mono text-[10px] uppercase tracking-[0.2em] text-lab-dim transition-colors duration-300 group-hover:text-[#3f3f46]">
                {row.meta}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Floating preview — transform is owned by the rAF loop, opacity by CSS. */}
      <div
        ref={previewRef}
        className="pointer-events-none absolute left-0 top-0 z-20 h-32 w-48 overflow-hidden border border-lab-line opacity-0 transition-opacity duration-300 will-change-transform"
        aria-hidden
      >
        {ROWS.map((row, i) => (
          <div
            key={row.src + i}
            ref={(n) => (imgRefs.current[i] = n)}
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: 0 }}
          >
            <Image src={row.src} alt="" fill sizes="240px" className="object-cover" draggable={false} />
          </div>
        ))}
      </div>

      <p className="mt-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Hover a row — the preview gives chase
      </p>
    </div>
  );
}
