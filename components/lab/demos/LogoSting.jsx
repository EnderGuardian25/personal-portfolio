"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Logo Sting — an SVG monogram "D" built from three strokes draws itself via
// stroke-dashoffset, a filled slab (evenodd counter) wipes up under the
// strokes via clip-path, the mark pops with back.out overshoot + one blue
// echo flash, then a FLIP-style measured tween (function-based x/y/scale,
// tl.invalidate() on replay) slides it into the header slot as the page fades in.

const STEM = "M34 12 V88";
const BOWL = "M34 12 H50 C74 12 86 28 86 50 C86 72 74 88 50 88 H34";
const COUNTER = "M48 30 H52 C66 30 72 38 72 50 C72 62 66 70 52 70 H48 Z";
const FILL = "M34 12 H50 C74 12 86 28 86 50 C86 72 74 88 50 88 H34 Z " + COUNTER;

export default function LogoSting({ reducedMotion }) {
  const rootRef = useRef(null);
  const logoRef = useRef(null);
  const slotRef = useRef(null);
  const headerRef = useRef(null);
  const tlRef = useRef(null);
  const replayRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return; // static settled scene is rendered directly
    const logo = logoRef.current;
    const slot = slotRef.current;
    const header = headerRef.current;
    const strokes = logo.querySelectorAll("[data-stroke]");
    const fillWrap = logo.querySelector("[data-fill]");
    const flash = logo.querySelector("[data-flash]");
    const bits = header.querySelectorAll("[data-h]");
    const riseBits = [...bits].filter((b) => b !== slot);
    const lens = [...strokes].map((p) => p.getTotalLength());

    const center = (r) => [r.left + r.width / 2, r.top + r.height / 2];

    // Build a FRESH timeline per run. Replaying the old one via
    // invalidate().restart() re-measured the FLIP hand-off while the logo was
    // still parked in the slot (the backward jump initializes late tweens
    // first), so the slide targeted garbage. A new timeline initializes each
    // tween forward, at the moment it plays, with the logo where it should be.
    const build = () => {
      // Reset every actor synchronously so the previous run's end state never
      // flashes during the 0.35s lead-in.
      strokes.forEach((p, i) =>
        gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i] })
      );
      gsap.set(fillWrap, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(flash, { autoAlpha: 0 });
      gsap.set(header, { autoAlpha: 0 });
      // The slot must NOT ride the y:16 rise — the FLIP measures it while the
      // header is still hidden, and a translated slot lands the mark 16px low.
      gsap.set(riseBits, { autoAlpha: 0, y: 16 });
      gsap.set(slot, { autoAlpha: 0 });
      gsap.set(logo, { x: 0, y: 0, scale: 1, autoAlpha: 1 });

      const tl = gsap.timeline({ delay: 0.35 });
      tl
        // 1 — strokes draw in sequence: stem, bowl, counter
        .to(strokes[0], { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" })
        .to(strokes[1], { strokeDashoffset: 0, duration: 0.7, ease: "power3.inOut" }, "-=0.22")
        .to(strokes[2], { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, "-=0.3")
        // 2 — fill wipes up under the strokes
        .to(fillWrap, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.38, ease: "power4.inOut" }, "-=0.1")
        // 3 — pop with overshoot + one accent flash
        .to(flash, { autoAlpha: 0.85, duration: 0.07, ease: "power1.in" })
        .to(flash, { autoAlpha: 0, duration: 0.28, ease: "power2.out" })
        .to(logo, { scale: 1.1, duration: 0.14, ease: "power2.in" }, "<-0.05")
        .to(logo, { scale: 1, duration: 0.55, ease: "back.out(2.6)" })
        // 4 — hand-off: measured slide/scale into the header slot
        .to(
          logo,
          {
            x: () => center(slot.getBoundingClientRect())[0] - center(logo.getBoundingClientRect())[0],
            y: () => center(slot.getBoundingClientRect())[1] - center(logo.getBoundingClientRect())[1],
            scale: () => (slot.getBoundingClientRect().width * 0.72) / logo.getBoundingClientRect().width,
            duration: 0.85,
            ease: "power4.inOut",
          },
          "+=0.35"
        )
        .to(header, { autoAlpha: 1, duration: 0.01 }, "<0.2")
        .to(slot, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "<")
        .to(riseBits, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, "<");
      return tl;
    };

    tlRef.current = build();
    replayRef.current = () => {
      tlRef.current?.kill();
      tlRef.current = build();
    };

    return () => {
      tlRef.current?.kill();
      // drop gsap's inline styles so a reducedMotion flip shows the settled scene
      gsap.set([header, logo, fillWrap, flash, ...strokes, ...bits], { clearProps: "all" });
      tlRef.current = null;
      replayRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-lab-bg">
      {/* destination scene — header + headline block */}
      <div
        ref={headerRef}
        className="absolute inset-0 flex flex-col px-[6cqw] py-[5cqw]"
        style={{ opacity: reducedMotion ? 1 : 0 }}
      >
        <div className="flex items-center justify-between">
          <div
            ref={slotRef}
            data-h
            className="flex h-10 w-10 items-center justify-center border border-lab-line"
          >
            {reducedMotion && (
              <svg viewBox="0 0 100 100" className="h-7 w-7" aria-hidden>
                <path d={FILL} fill="rgb(232 232 230)" fillRule="evenodd" />
              </svg>
            )}
          </div>
          <nav data-h className="flex gap-6 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            <span>Work</span>
            <span>About</span>
            <span>Contact</span>
          </nav>
        </div>
        <div className="mt-auto">
          <p data-h className="mb-[2cqw] font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            Studio — Colombo
          </p>
          <h3 data-h className="font-lab-display text-[9cqw] font-extrabold uppercase leading-none text-lab-text">
            De Cruz
            <br />
            Studio
          </h3>
          <div data-h className="mt-[3cqw] h-px w-full bg-lab-line" />
        </div>
      </div>

      {/* the sting mark — drawn centered, then handed off to the slot */}
      {!reducedMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div ref={logoRef} className="relative aspect-square w-[26cqw]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              {[STEM, BOWL, COUNTER].map((d) => (
                <path
                  key={d}
                  data-stroke
                  d={d}
                  fill="none"
                  stroke="rgb(232 232 230)"
                  strokeWidth="5"
                  strokeLinecap="square"
                />
              ))}
            </svg>
            <div data-fill className="absolute inset-0" style={{ clipPath: "inset(100% 0% 0% 0%)" }}>
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <path d={FILL} fill="rgb(232 232 230)" fillRule="evenodd" />
              </svg>
            </div>
            <svg data-flash viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-0">
              <path d={FILL} fill="#3b82f6" fillRule="evenodd" transform="translate(2 -2)" />
            </svg>
          </div>
        </div>
      )}

      {!reducedMotion && (
        <button
          type="button"
          aria-label="Replay logo sting"
          onClick={() => replayRef.current?.()}
          className="absolute bottom-3 right-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim transition-colors hover:text-lab-text"
        >
          Run again ↻
        </button>
      )}
      <p className="pointer-events-none absolute bottom-3 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Brand intro sting
      </p>
    </div>
  );
}
