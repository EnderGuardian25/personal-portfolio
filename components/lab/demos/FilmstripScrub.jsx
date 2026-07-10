"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

// Filmstrip Scrub — pointer-x over the stage maps DIRECTLY to the strip's
// translation (no click, no drag): sweep across to scrub. Position chases the
// target through an exponential lerp inside rAF; on leave/release the target
// becomes the nearest frame center, so the strip settles magnetically onto a
// frame. All per-frame work is direct style mutation via refs — no React state.
const FRAMES = [1, 2, 3, 4, 1, 2, 3, 4].map((n) => `/lab/photo-${n}.webp`);

export default function FilmstripScrub({ reducedMotion }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    const frames = Array.from(track.children);
    let cur = 0;
    let target = 0;
    let raf = null;
    let range = 0;
    let centers = [];
    let active = -1;
    let scrubbing = false;

    const measure = () => {
      range = Math.max(0, track.scrollWidth - root.clientWidth);
      centers = frames.map((f) => f.offsetLeft + f.offsetWidth / 2);
    };
    const nearest = (pos) => {
      const mid = root.clientWidth / 2 - pos; // strip-space point under stage centre
      let best = 0;
      let bd = Infinity;
      centers.forEach((c, i) => {
        const d = Math.abs(c - mid);
        if (d < bd) (bd = d), (best = i);
      });
      return best;
    };
    const setActive = (i) => {
      if (i === active) return;
      frames[active]?.classList.remove("fs-on");
      frames[i]?.classList.add("fs-on");
      active = i;
      if (counterRef.current)
        counterRef.current.textContent = String(i + 1).padStart(2, "0");
    };
    const apply = () => {
      track.style.transform = `translate3d(${cur}px,0,0)`;
    };

    measure();

    if (reducedMotion) {
      // Settled end-state: strip parked mid-scrub, one frame active. No loop.
      const park = () => {
        measure();
        cur = target = -range * 0.4;
        apply();
        setActive(nearest(cur));
      };
      park();
      const ro = new ResizeObserver(park);
      ro.observe(root);
      return () => ro.disconnect();
    }

    const tick = () => {
      // live scrub is eager; the magnetic settle is softer
      cur += (target - cur) * (scrubbing ? 0.16 : 0.09);
      apply();
      setActive(nearest(cur));
      if (Math.abs(target - cur) > 0.35) raf = requestAnimationFrame(tick);
      else {
        cur = target;
        apply();
        raf = null;
      }
    };
    const start = () => {
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      scrubbing = true;
      target = -p * range;
      start();
    };
    const snap = () => {
      scrubbing = false;
      const i = nearest(cur);
      target = Math.min(0, Math.max(-range, root.clientWidth / 2 - centers[i]));
      start();
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", snap);
    root.addEventListener("pointerup", snap);
    const ro = new ResizeObserver(() => {
      measure();
      snap();
    });
    ro.observe(root);

    // Entrance: the whole strip sweeps in from the far end, counter ticking
    // through the frames, then settles on 01.
    cur = -range;
    apply();
    target = 0;
    start();

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", snap);
      root.removeEventListener("pointerup", snap);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full items-center overflow-hidden bg-[#07070a] [touch-action:pan-y]"
    >
      {/* sprocket rows, purely decorative filmstrip chrome */}
      <div aria-hidden className="fs-sprocket absolute inset-x-0 top-[calc(50%-14cqw-5px)]" />
      <div aria-hidden className="fs-sprocket absolute inset-x-0 top-[calc(50%+14cqw)]" />

      <div ref={trackRef} className="flex gap-[2cqw] px-[6cqw] will-change-transform">
        {FRAMES.map((src, i) => (
          <div
            key={i}
            style={{ "--i": i }}
            className="fs-frame relative h-[21cqw] w-[30cqw] shrink-0 overflow-hidden border border-lab-line bg-lab-panel"
          >
            <Image src={src} alt="" fill sizes="360px" className="object-cover" draggable={false} />
            <span className="absolute left-1.5 top-1.5 font-lab-mono text-[9px] tracking-[0.2em] text-white/60">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em]">
        <span ref={counterRef} className="text-lab-text">01</span>
        <span className="text-lab-dim"> / {String(FRAMES.length).padStart(2, "0")}</span>
        <span className="ml-4 text-lab-dim">sweep to scrub · release to snap</span>
      </div>

      <style jsx>{`
        .fs-frame {
          animation: fs-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i) * 55ms);
          transition:
            transform 0.5s cubic-bezier(0.3, 1.45, 0.45, 1),
            border-color 0.35s ease;
        }
        @keyframes fs-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
        }
        .fs-frame :global(img) {
          transition: filter 0.4s ease;
          filter: saturate(0.5) brightness(0.7);
        }
        .fs-frame.fs-on {
          z-index: 1;
          border-color: rgb(59 130 246 / 0.8);
          transform: scale(1.08);
        }
        .fs-frame.fs-on :global(img) {
          filter: none;
        }
        .fs-sprocket {
          height: 5px;
          background-image: repeating-linear-gradient(
            90deg,
            rgb(var(--lab-line)) 0 6px,
            transparent 6px 18px
          );
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
