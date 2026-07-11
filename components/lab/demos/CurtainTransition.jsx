"use client";
import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";

// Curtain — five vertical panels ride the stage in one continuous direction
// (enter from below → full cover → exit through the top) on a tight power4
// stagger; the scene swaps behind them during the covered beat. A mono label
// literally rides the middle panel. The classic studio page-to-page curtain.

const PANELS = 5;
const SCENES = [
  { index: "01", word: "OVERVIEW", note: "Scene A — index" },
  { index: "02", word: "CASEWORK", note: "Scene B — detail" },
];

export default function CurtainTransition({ reducedMotion }) {
  const rootRef = useRef(null);
  const sceneRef = useRef(0); // which scene is on stage
  const busyRef = useRef(false);
  const tlRef = useRef(null);

  const run = useCallback(() => {
    const root = rootRef.current;
    if (!root || busyRef.current) return;
    const panels = root.querySelectorAll("[data-panel]");
    const scenes = root.querySelectorAll("[data-scene]");
    const from = sceneRef.current;
    const to = 1 - from;
    sceneRef.current = to;

    const swap = () => {
      gsap.set(scenes[from], { autoAlpha: 0 });
      gsap.set(scenes[to], { autoAlpha: 1 });
    };

    if (reducedMotion) {
      swap(); // settled destination, no sweep
      return;
    }

    busyRef.current = true;
    tlRef.current?.kill();
    const tl = gsap.timeline({ onComplete: () => (busyRef.current = false) });
    tlRef.current = tl;
    // y: 0 matters — gsap parses the JSX inline translateY(100%) from the
    // computed matrix as a PIXEL y (stage height), which would otherwise ride
    // along with every yPercent tween and shift the whole choreography one
    // stage-height down (cover happens off-screen, release parks covering).
    tl.set(panels, { y: 0, yPercent: 100 })
      .to(panels, {
        yPercent: 0,
        duration: 0.7,
        ease: "power4.inOut",
        stagger: 0.08,
      })
      .add(swap)
      .to({}, { duration: 0.22 }) // beat at full cover — let the dark land
      .to(panels, {
        yPercent: -100,
        duration: 0.85,
        ease: "power4.inOut",
        stagger: 0.08,
      });
  }, [reducedMotion]);

  useEffect(() => {
    const t = setTimeout(run, reducedMotion ? 0 : 300);
    return () => {
      clearTimeout(t);
      tlRef.current?.kill();
    };
  }, [run, reducedMotion]);

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-lab-bg">
      {SCENES.map((s, i) => (
        <div
          key={s.index}
          data-scene
          className="absolute inset-0 flex flex-col justify-between p-6"
          style={{
            opacity: i === 0 ? 1 : 0,
            visibility: i === 0 ? "visible" : "hidden",
            background: i === 0 ? "#0a0a0e" : "#0b0d12",
          }}
        >
          <div className="flex items-baseline justify-between font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            <span>{s.note}</span>
            <span>{s.index} / 02</span>
          </div>
          <div>
            <div
              className="font-lab-display font-extrabold leading-[0.9] tracking-tight text-lab-text"
              style={{ fontSize: "clamp(1.8rem, 12cqw, 9rem)" }}
            >
              {s.word}
            </div>
            <div className="mt-3 h-px w-full bg-lab-line" />
          </div>
        </div>
      ))}

      {/* Curtain panels — pointer-events-none so the button stays clickable */}
      <div className="pointer-events-none absolute inset-0 z-10 flex" aria-hidden>
        {Array.from({ length: PANELS }, (_, i) => (
          <div
            key={i}
            data-panel
            className={`relative h-full flex-1 will-change-transform ${
              i % 2 ? "bg-[#101015]" : "bg-[#0c0c10]"
            }`}
            style={{ transform: "translateY(100%)" }}
          >
            {i === 2 && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim [writing-mode:vertical-rl]">
                scene swap <span className="text-[#3b82f6]">●</span>
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="absolute bottom-4 left-6 z-20 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Panels cover · swap · release
      </p>
      <button
        type="button"
        aria-label="Run the curtain transition again"
        onClick={run}
        className="absolute bottom-3 right-4 z-20 border border-lab-line bg-black/40 px-3 py-1.5 font-lab-mono text-[10px] uppercase tracking-[0.25em] text-lab-dim backdrop-blur-sm transition-colors hover:border-white/40 hover:text-lab-text"
      >
        Run again ↻
      </button>
    </div>
  );
}
