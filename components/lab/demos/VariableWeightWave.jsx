"use client";
import { useEffect, useRef } from "react";

// Weight Wave — Syne is a variable font (wght 400–800), so each character's
// weight can follow a gaussian of its distance to the cursor. Weights spring
// toward their target every frame and relax back to 400 when the pointer
// leaves. Direct style writes via refs; the loop suspends once settled.
const TEXT = "Weight is a dimension.";
const MIN_W = 400;
const MAX_W = 800;
const RADIUS = 110; // px influence radius

export default function VariableWeightWave({ reducedMotion }) {
  const wrapRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const line = lineRef.current;
    if (!wrap || !line || reducedMotion) return;

    const chars = Array.from(line.children);
    const weights = new Float32Array(chars.length).fill(MIN_W);
    let centers = [];
    let pointer = null;
    let raf = null;

    const measure = () => {
      const wr = wrap.getBoundingClientRect();
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    document.fonts?.ready?.then(measure);

    const tick = () => {
      let moving = false;
      for (let i = 0; i < chars.length; i++) {
        let target = MIN_W;
        if (pointer) {
          const d = Math.hypot(centers[i].x - pointer.x, centers[i].y - pointer.y);
          target = MIN_W + (MAX_W - MIN_W) * Math.exp((-d * d) / (2 * RADIUS * RADIUS));
        }
        const w = weights[i] + (target - weights[i]) * 0.16;
        if (Math.abs(w - weights[i]) > 0.3) moving = true;
        weights[i] = w;
        chars[i].style.fontVariationSettings = `"wght" ${w.toFixed(1)}`;
        chars[i].style.transform = `translateY(${((w - MIN_W) / (MAX_W - MIN_W)) * -6}%)`;
      }
      raf = moving || pointer ? requestAnimationFrame(tick) : null;
    };
    const start = () => {
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      start();
    };
    const onLeave = () => {
      pointer = null;
      start(); // keep ticking until every weight relaxes back
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

  return (
    <div
      ref={wrapRef}
      className="flex h-full w-full items-center justify-center bg-[#07070a] px-6"
    >
      <span className="sr-only">{TEXT}</span>
      <div
        ref={lineRef}
        aria-hidden
        className="whitespace-nowrap font-lab-display leading-none text-lab-text"
        style={{
          fontVariationSettings: '"wght" 400',
          fontSize: "clamp(1.1rem, 6.5cqw, 4rem)",
        }}
      >
        {/* Space chars are rendered as literal NBSP (U+00A0) — plain spaces
            collapse inside inline-block spans. Don't normalize them. */}
        {TEXT.split("").map((ch, i) => (
          <span key={i} className="inline-block will-change-transform">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>
    </div>
  );
}
