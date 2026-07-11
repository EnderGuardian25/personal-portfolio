"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Slice Hero — one Syne display word is duplicated into N overflow-hidden
// horizontal strips (each strip shows only its band of a full-height clone).
// Strips shear in from alternating sides with an expo stagger; after settle,
// pointer-x velocity drives a lean — per-strip translateX offsets stepped
// top-to-bottom plus a shared skew — written straight to styles inside rAF.

const WORD = "VELOCITY";
const STRIPS = 7;
const ACCENT = 4; // one blue band through the word

export default function SliceHero({ reducedMotion }) {
  const rootRef = useRef(null);
  const shearRefs = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reducedMotion) return; // JSX is authored in the settled end state

    const strips = root.querySelectorAll("[data-strip]");
    const shears = shearRefs.current.filter(Boolean);
    let settled = false;
    let raf = null;
    let lean = 0;
    let target = 0;
    let lastX = null;
    let lastT = 0;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        strips,
        { xPercent: (i) => (i % 2 ? 130 : -130) },
        {
          xPercent: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          delay: 0.12,
          onComplete: () => {
            settled = true;
          },
        }
      );
    }, root);

    const onMove = (e) => {
      const now = performance.now();
      if (lastX !== null) {
        const dt = Math.max(8, now - lastT);
        const vx = ((e.clientX - lastX) / dt) * 1000; // px/s
        target = gsap.utils.clamp(-54, 54, vx / 26);
      }
      lastX = e.clientX;
      lastT = now;
    };
    const onLeave = () => {
      lastX = null;
    };

    const c = (STRIPS - 1) / 2;
    const tick = () => {
      lean += (target - lean) * 0.14;
      target *= 0.9; // decays when the pointer stops feeding velocity
      if (settled && Math.abs(lean) > 0.01) {
        for (let i = 0; i < shears.length; i++) {
          shears[i].style.transform = `translateX(${((c - i) / c) * lean * 0.9}px) skewX(${
            lean * 0.22
          }deg)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#07070a]"
    >
      <h2 className="sr-only">{WORD}</h2>
      <div
        aria-hidden
        className="relative font-lab-display font-extrabold leading-none tracking-tight"
        // 11cqw — WORD is 8 wide Syne-800 caps (~8.3em incl. tracking); 15cqw
        // ran past the stage and clipped the V and Y at both edges.
        style={{ fontSize: "clamp(2rem, 11cqw, 12rem)" }}
      >
        {/* Invisible sizer gives the block the word's intrinsic box */}
        <div className="whitespace-nowrap opacity-0">{WORD}</div>
        {Array.from({ length: STRIPS }, (_, i) => (
          <div
            key={i}
            data-strip
            className="absolute left-0 w-full overflow-hidden will-change-transform"
            style={{ top: `${(i * 100) / STRIPS}%`, height: `${100 / STRIPS}%` }}
          >
            <div
              ref={(el) => (shearRefs.current[i] = el)}
              className="absolute left-0 flex w-full items-center justify-center will-change-transform"
              style={{ top: `${-i * 100}%`, height: `${STRIPS * 100}%` }}
            >
              <div
                className={`whitespace-nowrap ${
                  i === ACCENT ? "text-[#3b82f6]" : "text-lab-text"
                }`}
              >
                {WORD}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Sweep the cursor fast — the slices lean with your speed
      </div>
    </div>
  );
}
