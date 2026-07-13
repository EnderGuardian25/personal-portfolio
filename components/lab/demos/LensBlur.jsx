"use client";
import { useEffect, useRef, useCallback } from "react";

// Lens Blur — a rack-focus scene swap: the outgoing scene defocuses (blur
// 0→20px) with a brightness bloom and a slight scale-up while the incoming
// scene starts blurred/bloomed and racks in sharp, opacities overlapping in
// the middle so it reads as a refocus, not a cut. One rAF drives an expo-out
// eased 0..1 that all channels derive from — the crossfade burns early, then
// the long tail is spent landing the incoming focus. Auto-advances every
// ~4.5s like the sibling transitions; a real Cut button retriggers. Gotcha:
// filters are cleared to "none" when done — a lingering blur(0px) still
// forces the layer through the rasterizer every frame.

const DUR = 1100;
const SCENES = [
  { src: "/lab/photo-1.webp", cap: "Take 01 — 35mm · f/1.4", title: ["First", "Light"] },
  { src: "/lab/photo-4.webp", cap: "Take 02 — 85mm · f/2.0", title: ["After", "Rain"] },
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export default function LensBlur({ reducedMotion }) {
  const sceneRefs = useRef([]);
  const s = useRef({ index: 0, busy: false, raf: 0, timer: 0 });

  const run = useCallback(() => {
    const st = s.current;
    if (st.busy) return;
    clearTimeout(st.timer);
    const out = sceneRefs.current[st.index];
    const inn = sceneRefs.current[1 - st.index];
    if (!out || !inn) return;
    st.index = 1 - st.index;

    if (reducedMotion) {
      // Fast plain crossfade — no filters, no loop.
      out.style.opacity = "0";
      out.style.visibility = "hidden";
      inn.style.visibility = "visible";
      inn.style.opacity = "1";
      inn.style.filter = "none";
      inn.style.transform = "none";
      return;
    }

    st.busy = true;
    inn.style.visibility = "visible";
    out.style.zIndex = "1";
    inn.style.zIndex = "2";
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / DUR);
      const e = 1 - Math.pow(2, -8 * t); // expo-out — fast throw, soft landing
      // Outgoing: defocus + bloom + swell, fading through the mid window.
      out.style.filter = `blur(${(20 * e).toFixed(2)}px) brightness(${(1 + 0.6 * e).toFixed(3)})`;
      out.style.transform = `scale(${(1 + 0.06 * e).toFixed(4)})`;
      out.style.opacity = (1 - clamp01((e - 0.32) / 0.42)).toFixed(3);
      // Incoming: the mirror rack — blur/bloom collapse as it sharpens.
      const r = 1 - e;
      inn.style.filter = `blur(${(18 * r).toFixed(2)}px) brightness(${(1 + 0.55 * r).toFixed(3)})`;
      inn.style.transform = `scale(${(1 + 0.05 * r).toFixed(4)})`;
      inn.style.opacity = clamp01((e - 0.12) / 0.42).toFixed(3);

      if (t < 1) {
        st.raf = requestAnimationFrame(step);
        return;
      }
      out.style.visibility = "hidden";
      out.style.opacity = "0";
      inn.style.filter = "none";
      inn.style.transform = "none";
      st.busy = false;
      st.timer = setTimeout(run, 4500); // auto-rack, sibling convention
    };
    st.raf = requestAnimationFrame(step);
  }, [reducedMotion]);

  useEffect(() => {
    const st = s.current;
    if (reducedMotion) {
      // Settle on the destination scene like the sibling transitions.
      st.index = 1;
      const [a, b] = sceneRefs.current;
      if (a) {
        a.style.visibility = "hidden";
        a.style.opacity = "0";
      }
      if (b) {
        b.style.visibility = "visible";
        b.style.opacity = "1";
      }
      return;
    }
    st.timer = setTimeout(run, 1400); // entrance: first rack plays on mount
    return () => {
      clearTimeout(st.timer);
      cancelAnimationFrame(st.raf);
      st.busy = false;
    };
  }, [run, reducedMotion]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-lab-bg">
      {SCENES.map((sc, i) => (
        <div
          key={sc.src}
          ref={(el) => (sceneRefs.current[i] = el)}
          className="absolute inset-0 will-change-[filter,transform,opacity]"
          style={i === 1 ? { visibility: "hidden", opacity: 0 } : undefined}
        >
          <img src={sc.src} draggable={false} alt="" className="h-full w-full object-cover" />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/30"
          />
          <p className="absolute left-[5cqw] top-[4cqw] font-lab-mono text-[10px] uppercase tracking-[0.3em] text-white/80">
            {sc.cap}
          </p>
          <h3 className="absolute bottom-[4cqw] left-[5cqw] font-lab-display text-[10cqw] font-extrabold uppercase leading-[0.95] tracking-tight text-lab-text">
            {sc.title[0]}
            <br />
            {sc.title[1]}
          </h3>
        </div>
      ))}

      <button
        type="button"
        onClick={run}
        className="absolute bottom-4 right-4 z-10 border border-lab-line bg-lab-panel/70 px-4 py-2 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim transition-colors hover:border-lab-text hover:text-lab-text"
      >
        Cut ↻
      </button>
      <p className="pointer-events-none absolute bottom-4 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Rack focus · auto every 4.5s
      </p>
    </div>
  );
}
