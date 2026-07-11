"use client";
import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// Glitch Cut — the scene swap itself is one hard cut; everything else is
// dressing. For ~420ms, band copies of the scene are clipped with inset() and
// shoved sideways, two full copies get an R/C channel tint (multiply core
// inside a screen-blended layer), and a tiny pixelated canvas paints static.
// All offsets come from a seeded mulberry32 PRNG, reseeded per run.

const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const NW = 120;
const NH = 80;
const DUR = 420;

// Both scenes, stacked. Visibility of [data-a]/[data-b] is toggled across every
// copy at once (base + slices + channel layers) so the glitch shows "now".
function Pair() {
  return (
    <>
      <div
        data-a
        className="absolute inset-0 flex flex-col justify-between bg-[#0b0b10] px-[7cqw] py-[6cqw]"
      >
        <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          Sig 01 — Type
        </p>
        <h3 className="font-lab-display text-[13cqw] font-extrabold uppercase leading-[0.95] text-lab-text">
          Broad
          <br />
          cast
        </h3>
        <div className="flex justify-between font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          <span>REC ●</span>
          <span>00:00:00</span>
        </div>
      </div>
      <div data-b className="absolute inset-0" style={{ visibility: "hidden" }}>
        <Image
          src="/lab/photo-3.webp"
          alt="Monsoon light photo scene"
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-end bg-linear-to-t from-black/70 to-transparent px-[7cqw] pb-[6cqw] pt-16">
          <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-white/80">
            Sig 02 — Photo
          </p>
        </div>
      </div>
    </>
  );
}

export default function GlitchTransition({ reducedMotion }) {
  const rootRef = useRef(null);
  const fxRef = useRef(null);
  const sliceRefs = useRef([]);
  const rgbRefs = useRef([]);
  const noiseRef = useRef(null);
  const s = useRef({ scene: 0, running: false, raf: 0, timer: 0, runs: 0 });

  const showScene = useCallback((idx) => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll("[data-a]").forEach(
      (el) => (el.style.visibility = idx === 0 ? "visible" : "hidden")
    );
    root.querySelectorAll("[data-b]").forEach(
      (el) => (el.style.visibility = idx === 1 ? "visible" : "hidden")
    );
    s.current.scene = idx;
  }, []);

  const run = useCallback(() => {
    const st = s.current;
    const root = rootRef.current;
    const fx = fxRef.current;
    if (!root || st.running) return;
    if (reducedMotion) {
      showScene(1 - st.scene); // hard cut, no dressing
      return;
    }
    clearTimeout(st.timer);
    st.running = true;
    const rnd = mulberry32(0x9e3779b9 ^ (st.runs++ * 2654435761));
    const ctx = noiseRef.current.getContext("2d");
    const w = root.clientWidth;
    fx.style.display = "block";
    const start = performance.now();
    let swapped = false;
    let lastFrame = -1;

    const step = (now) => {
      const t = (now - start) / DUR;
      if (t >= 1) {
        fx.style.display = "none";
        st.running = false;
        st.timer = setTimeout(run, 4200); // loop with a generous pause
        return;
      }
      if (!swapped && t > 0.42) {
        showScene(1 - st.scene); // the actual cut, buried mid-chaos
        swapped = true;
      }
      const frame = Math.floor(t * 9); // ~9 discrete chaos frames, not smooth
      if (frame !== lastFrame) {
        lastFrame = frame;
        const amp = 1 - Math.abs(t * 2 - 1) * 0.55; // peaks at the cut
        sliceRefs.current.forEach((el) => {
          const top = rnd() * 82;
          const hgt = 4 + rnd() * 15;
          el.style.clipPath = `inset(${top}% 0 ${Math.max(0, 100 - top - hgt)}% 0)`;
          el.style.transform = `translateX(${(rnd() * 2 - 1) * 0.09 * w * amp}px)`;
        });
        rgbRefs.current.forEach((el) => {
          el.style.transform = `translate(${(rnd() * 2 - 1) * 12 * amp}px, ${
            (rnd() * 2 - 1) * 3
          }px)`;
        });
        const img = ctx.createImageData(NW, NH);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = d[i + 1] = d[i + 2] = (rnd() * 255) | 0;
          d[i + 3] = rnd() < 0.5 ? 30 : 0;
        }
        ctx.putImageData(img, 0, 0);
      }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }, [reducedMotion, showScene]);

  useEffect(() => {
    const st = s.current;
    if (reducedMotion) {
      showScene(1); // settled destination scene
      if (fxRef.current) fxRef.current.style.display = "none";
      return;
    }
    st.timer = setTimeout(run, 700);
    return () => {
      clearTimeout(st.timer);
      cancelAnimationFrame(st.raf);
      st.running = false;
    };
  }, [run, showScene, reducedMotion]);

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label="Play glitch cut transition"
      onPointerDown={run}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          run();
        }
      }}
      className="relative h-full w-full cursor-pointer overflow-hidden bg-lab-bg outline-hidden"
    >
      {/* base scene pair */}
      <div className="absolute inset-0">
        <Pair />
      </div>

      {/* glitch dressing — only displayed during the ~420ms window */}
      <div
        ref={fxRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ display: "none" }}
      >
        {[
          ["#ff2b2b", -1],
          ["#26f0ff", 1],
        ].map(([tint, side], i) => (
          <div
            key={tint}
            ref={(el) => (rgbRefs.current[i] = el)}
            className="absolute inset-0 opacity-70 will-change-transform"
            style={{ mixBlendMode: "screen", transform: `translateX(${side * 6}px)` }}
          >
            <Pair />
            <div
              className="absolute inset-0"
              style={{ background: tint, mixBlendMode: "multiply" }}
            />
          </div>
        ))}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => (sliceRefs.current[i] = el)}
            className="absolute inset-0 will-change-transform"
            style={{ clipPath: "inset(100% 0 0 0)" }}
          >
            <Pair />
          </div>
        ))}
        <canvas
          ref={noiseRef}
          width={NW}
          height={NH}
          className="absolute inset-0 h-full w-full"
          style={{ imageRendering: "pixelated", mixBlendMode: "screen" }}
        />
      </div>

      <p className="pointer-events-none absolute bottom-3 left-4 z-20 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Click to cut ↻ · loops
      </p>
    </div>
  );
}
