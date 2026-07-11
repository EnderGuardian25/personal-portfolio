"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

// Horizontal Journey — vertical scroll in an internal scroller drives a sticky
// scene sideways: progress (read on scroll, exponentially smoothed in rAF)
// maps to the track's translateX while a bottom rail fills and its stop dots
// light as each panel is passed. Photos drift inside their crops en route.

const TALL = 4;
const PANELS = [
  { kind: "type", word: "DEPART" },
  { kind: "photo", src: "/lab/photo-1.webp" },
  { kind: "type", word: "TRANSIT" },
  { kind: "photo", src: "/lab/photo-3.webp" },
  { kind: "type", word: "ARRIVE" },
];
const N = PANELS.length;

export default function HorizontalJourney({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const sceneRef = useRef(null);
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const counterRef = useRef(null);
  const hintRef = useRef(null);
  const dotRefs = useRef([]);
  const innerRefs = useRef([]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const scene = sceneRef.current;
    const track = trackRef.current;
    if (!scroller || !scene || !track) return;

    let maxX = 0;
    const measure = () => {
      maxX = Math.max(0, track.scrollWidth - scene.clientWidth);
    };

    let lit = -2; // last painted stop index; -2 forces the first paint
    const apply = (q) => {
      track.style.transform = `translate3d(${(-maxX * q).toFixed(2)}px,0,0)`;
      fillRef.current.style.transform = `scaleX(${q.toFixed(4)})`;
      hintRef.current.style.opacity = (1 - Math.min(1, q * 6)).toFixed(3);
      // Photos counter-drift inside their crops as the row travels.
      innerRefs.current.forEach((el, i) => {
        if (!el) return;
        const c = i / (N - 1);
        el.style.transform = `translateX(${(Math.max(-1, Math.min(1, q - c)) * 6).toFixed(3)}cqw)`;
      });
      const stop = Math.min(N - 1, Math.floor(q * (N - 1) + 0.04));
      if (stop !== lit) {
        lit = stop;
        dotRefs.current.forEach((d, i) => {
          if (!d) return;
          const passed = i <= stop;
          d.style.background = passed ? "#3b82f6" : "rgb(38 38 44)";
          d.style.boxShadow = passed ? "0 0 8px rgba(59,130,246,0.65)" : "none";
        });
        counterRef.current.textContent = `${String(stop + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
      }
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      apply(p);
    });
    ro.observe(scene);

    let target = reducedMotion ? 0.6 : 0;
    let p = target;
    apply(p);
    if (reducedMotion) return () => ro.disconnect(); // static ~60% state, no scrub

    let raf = null;
    const tick = () => {
      p += (target - p) * 0.1; // glide — the journey eases into each stop
      if (Math.abs(target - p) < 0.0004) {
        p = target;
        apply(p);
        raf = null;
        return;
      }
      apply(p);
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      target = max > 0 ? scroller.scrollTop / max : 0;
      if (raf == null) raf = requestAnimationFrame(tick);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-y-auto bg-[#07070a]">
      <div style={{ height: reducedMotion ? "100%" : `${TALL * 100}%` }}>
        <div
          ref={sceneRef}
          className="sticky top-0 overflow-hidden"
          style={{ height: reducedMotion ? "100%" : `${100 / TALL}%` }}
        >
          <h2 className="sr-only">Horizontal journey — scroll drives a sideways trip through five panels</h2>

          <div
            ref={trackRef}
            className="flex h-full w-max items-center gap-[5cqw] px-[12cqw] will-change-transform"
          >
            {PANELS.map((panel, i) => (
              <div
                key={i}
                className="relative h-[62%] w-[52cqw] shrink-0 overflow-hidden border border-lab-line bg-lab-panel"
              >
                {panel.kind === "photo" ? (
                  <div
                    ref={(el) => (innerRefs.current[i] = el)}
                    className="absolute inset-x-[-8cqw] inset-y-0 will-change-transform"
                  >
                    <Image
                      src={panel.src}
                      alt=""
                      fill
                      sizes="60vw"
                      className="object-cover"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-between p-[3cqw]">
                    <span className="font-lab-mono text-[10px] tracking-[0.3em] text-lab-dim">
                      STOP
                    </span>
                    <span className="font-lab-display text-[6.5cqw] font-extrabold leading-none tracking-tight text-lab-text">
                      {panel.word}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-2 left-3 font-lab-mono text-[10px] tracking-[0.25em] text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>

          {/* Progress rail with stop dots */}
          <div aria-hidden className="absolute bottom-[18px] left-6 right-6 h-[2px] bg-lab-line/60">
            <div ref={fillRef} className="absolute inset-0 origin-left bg-[#3b82f6]" style={{ transform: "scaleX(0)" }} />
            {PANELS.map((_, i) => (
              <span
                key={i}
                ref={(el) => (dotRefs.current[i] = el)}
                className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300"
                style={{ left: `${(i / (N - 1)) * 100}%`, background: "rgb(38 38 44)" }}
              />
            ))}
          </div>

          <span ref={counterRef} className="absolute right-4 top-4 font-lab-mono text-[10px] tracking-[0.3em] text-lab-dim">
            01 / 05
          </span>
          <p ref={hintRef} className="absolute left-4 top-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            Scroll ↓ — travel sideways
          </p>
        </div>
      </div>
    </div>
  );
}
