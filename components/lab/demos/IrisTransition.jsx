"use client";
import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";

// Iris — a scene transition that opens a `circle()` clip-path from the exact
// pointer point, easing the radius out to the farthest corner so the wipe
// always completes edge-to-edge. A hairline ring div leads the clip edge
// (radius slightly ahead, fading as it nears full bleed). Alternates a type
// slab and a photo scene; auto-runs once from center on mount.

export default function IrisTransition({ reducedMotion }) {
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const scenesRef = useRef([]);
  const s = useRef({ index: 0, busy: false, tween: null, timer: null });

  const run = useCallback(
    (x, y) => {
      const root = rootRef.current;
      const st = s.current;
      if (!root || st.busy) return;
      const outEl = scenesRef.current[st.index];
      const inEl = scenesRef.current[1 - st.index];
      st.index = 1 - st.index;

      if (reducedMotion) {
        outEl.style.visibility = "hidden";
        inEl.style.clipPath = "none";
        inEl.style.visibility = "visible";
        return;
      }

      const w = root.clientWidth;
      const h = root.clientHeight;
      // farthest corner from the origin = radius that guarantees full cover
      const maxR = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
      const ring = ringRef.current;
      st.busy = true;
      outEl.style.zIndex = "1";
      inEl.style.zIndex = "2";
      inEl.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      inEl.style.visibility = "visible";
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;

      const proxy = { r: 0 };
      st.tween = gsap.to(proxy, {
        r: maxR,
        duration: 1.05,
        ease: "expo.inOut",
        onUpdate: () => {
          inEl.style.clipPath = `circle(${proxy.r}px at ${x}px ${y}px)`;
          const lead = proxy.r * 1.02 + 12; // ring runs just ahead of the edge
          ring.style.width = `${lead * 2}px`;
          ring.style.height = `${lead * 2}px`;
          ring.style.opacity = Math.min(1, (maxR - proxy.r) / (maxR * 0.3)).toFixed(3);
        },
        onComplete: () => {
          outEl.style.visibility = "hidden";
          inEl.style.clipPath = "none";
          ring.style.opacity = "0";
          st.busy = false;
        },
      });
    },
    [reducedMotion]
  );

  useEffect(() => {
    const st = s.current;
    const root = rootRef.current;
    if (reducedMotion) {
      // settle on the destination scene, wherever a killed tween left things
      st.index = 1;
      const [a, b] = scenesRef.current;
      a.style.visibility = "hidden";
      b.style.clipPath = "none";
      b.style.visibility = "visible";
    } else {
      st.timer = setTimeout(
        () => root && run(root.clientWidth / 2, root.clientHeight / 2),
        550
      );
    }
    return () => {
      clearTimeout(st.timer);
      st.tween?.kill();
      st.busy = false;
    };
  }, [run, reducedMotion]);

  const onPointerDown = (e) => {
    const rect = rootRef.current.getBoundingClientRect();
    run(e.clientX - rect.left, e.clientY - rect.top);
  };
  const onKeyDown = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const root = rootRef.current;
    run(root.clientWidth / 2, root.clientHeight / 2);
  };

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label="Play iris transition from a point"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="relative h-full w-full cursor-crosshair overflow-hidden bg-lab-bg outline-hidden"
    >
      {/* scene 0 — type slab */}
      <div
        ref={(el) => (scenesRef.current[0] = el)}
        className="absolute inset-0 flex flex-col justify-between bg-[#0b0b10] px-[7cqw] py-[6cqw]"
      >
        <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          Scene 01 — Type
        </p>
        <h3 className="font-lab-display text-[12cqw] font-extrabold uppercase leading-[0.95] text-lab-text">
          Night
          <br />
          Signal
        </h3>
        <div className="flex justify-between font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          <span>DCRZ · Cut A</span>
          <span>00:01</span>
        </div>
      </div>

      {/* scene 1 — photo */}
      <div
        ref={(el) => (scenesRef.current[1] = el)}
        className="absolute inset-0"
        style={{ visibility: "hidden" }}
      >
        <Image
          src="/lab/photo-2.webp"
          alt="Golden hour photo scene"
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-end bg-linear-to-t from-black/70 to-transparent px-[7cqw] pb-[6cqw] pt-16">
          <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-white/80">
            Scene 02 — Photo · Cut B
          </p>
        </div>
      </div>

      {/* hairline ring leading the clip edge — the one blue accent */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none absolute z-3 rounded-full border border-white/80 opacity-0"
        style={{
          transform: "translate(-50%, -50%)",
          boxShadow:
            "0 0 28px rgba(59,130,246,0.35), inset 0 0 18px rgba(59,130,246,0.18)",
        }}
      />

      <p className="pointer-events-none absolute bottom-3 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Click anywhere ↻
      </p>
    </div>
  );
}
