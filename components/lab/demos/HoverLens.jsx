"use client";
import { useEffect, useRef } from "react";

// Hover Lens — a circular lens glides over a board of type, showing a
// magnified, color-inverted copy of whatever sits beneath it. The lens holds
// a scaled clone of the board, counter-translated every frame so the point
// under the cursor stays registered between the two layers.
const LENS = 190; // px diameter
const ZOOM = 1.7;

function Board() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-4 px-8 sm:px-14">
      <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        № 15 — Optics
      </p>
      <p
        className="font-lab-display font-bold leading-[1.05] text-lab-text"
        style={{ fontSize: "clamp(1.2rem, 5cqw, 3.4rem)" }}
      >
        Look closer. The lens inverts everything it touches — type, texture,
        <span className="text-[#3b82f6]"> intent.</span>
      </p>
      <p className="max-w-sm font-lab-mono text-[11px] leading-relaxed tracking-wide text-lab-dim">
        A reading instrument as a hover state: magnify the sentence a visitor
        is about to read, and they will read it.
      </p>
    </div>
  );
}

export default function HoverLens({ reducedMotion }) {
  const wrapRef = useRef(null);
  const lensRef = useRef(null);
  const cloneRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const lens = lensRef.current;
    const clone = cloneRef.current;
    if (!wrap || !lens || !clone || reducedMotion) return;

    let raf = null;
    let target = null;
    let cur = { x: -LENS, y: -LENS };

    const apply = () => {
      lens.style.transform = `translate(${cur.x - LENS / 2}px, ${cur.y - LENS / 2}px)`;
      // Keep the magnified clone registered to the point under the cursor.
      clone.style.transform = `translate(${LENS / 2 - cur.x * ZOOM}px, ${LENS / 2 - cur.y * ZOOM}px) scale(${ZOOM})`;
    };

    const tick = () => {
      if (!target) {
        raf = null;
        return;
      }
      cur.x += (target.x - cur.x) * 0.22;
      cur.y += (target.y - cur.y) * 0.22;
      apply();
      raf =
        Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.3 || target
          ? requestAnimationFrame(tick)
          : null;
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      target = { x: e.clientX - r.left, y: e.clientY - r.top };
      lens.style.opacity = "1";
      if (raf == null) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      target = null;
      lens.style.opacity = "0";
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    // The clone must match the board's size for registration to hold.
    const size = () => {
      clone.style.width = `${wrap.clientWidth}px`;
      clone.style.height = `${wrap.clientHeight}px`;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

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
      className="relative h-full w-full cursor-none overflow-hidden bg-[#07070a]"
    >
      <Board />
      {/* The lens: circular window onto an inverted, magnified board clone. */}
      <div
        ref={lensRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 overflow-hidden rounded-full border border-lab-text/40 opacity-0 shadow-[0_0_60px_rgba(59,130,246,0.25)] transition-opacity duration-200"
        style={{ width: LENS, height: LENS }}
      >
        <div
          ref={cloneRef}
          className="origin-top-left bg-[#07070a]"
          style={{ filter: "invert(1) hue-rotate(180deg)" }}
        >
          <Board />
        </div>
      </div>
    </div>
  );
}
