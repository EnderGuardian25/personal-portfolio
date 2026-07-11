"use client";
import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";

// Counter Preloader — a giant Syne counter jumps 0→27→58→83→100 in uneven
// eased bursts while mono log lines tick in. The preloader is built as two
// overflow-hidden halves each holding a full-stage copy of the same face, so
// when they slide apart the big number visibly tears in half over the hero.

const BURSTS = [27, 58, 83, 100];
const LOGS = [
  "boot: tokens mapped … ok",
  "fonts: syne + plex … ok",
  "images: 4 assets … ok",
  "route: /lab primed … ok",
];
const HERO = ["SITE", "LOADED"];

export default function CounterPreloader({ reducedMotion }) {
  const rootRef = useRef(null);
  const busyRef = useRef(false);
  const tlRef = useRef(null);

  const play = useCallback(() => {
    const root = rootRef.current;
    if (!root || busyRef.current) return;
    const halves = root.querySelectorAll("[data-half]");
    const counts = root.querySelectorAll("[data-count]");
    const heroLines = root.querySelectorAll("[data-hero-line]");
    const cnt = { v: 0 };
    const write = () => {
      const s = String(Math.round(cnt.v)).padStart(3, "0");
      counts.forEach((el) => (el.textContent = s));
    };

    if (reducedMotion) {
      // Settled destination: preloader parked open, hero standing.
      // y: 0 clears the JSX inline translateY(110%), which gsap parses from
      // the computed matrix as a PIXEL offset that otherwise sticks forever.
      gsap.set(halves, { yPercent: (i) => (i === 0 ? -101 : 101) });
      gsap.set(heroLines, { yPercent: 0, y: 0 });
      return;
    }

    busyRef.current = true;
    tlRef.current?.kill();
    const tl = gsap.timeline({ onComplete: () => (busyRef.current = false) });
    tlRef.current = tl;

    tl.set(halves, { yPercent: 0 })
      .set(heroLines, { yPercent: 110, y: 0 }) // y: 0 — see reducedMotion note
      .set(root.querySelectorAll("[data-log]"), { autoAlpha: 0, x: -8 })
      .add(write);

    // Uneven bursts — each jump eases hard, then holds like real network work.
    BURSTS.forEach((target, i) => {
      tl.to(
        cnt,
        {
          v: target,
          duration: 0.4 + i * 0.09,
          ease: i % 2 ? "power4.inOut" : "power3.out",
          onUpdate: write,
        },
        i === 0 ? "+=0.25" : `+=${0.28 + i * 0.12}`
      ).to(
        root.querySelectorAll(`[data-log="${i}"]`),
        { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out" },
        "<0.15"
      );
    });

    // 100 lands, breathe, then the screen splits open on the hero.
    tl.to({}, { duration: 0.45 })
      .to(halves[0], { yPercent: -101, duration: 1.05, ease: "power4.inOut" })
      .to(halves[1], { yPercent: 101, duration: 1.05, ease: "power4.inOut" }, "<")
      .fromTo(
        heroLines,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.1 },
        "-=0.45"
      );
  }, [reducedMotion]);

  useEffect(() => {
    const t = setTimeout(play, reducedMotion ? 0 : 250);
    return () => {
      clearTimeout(t);
      tlRef.current?.kill();
    };
  }, [play, reducedMotion]);

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-[#07070a]">
      {/* Destination hero — uncovered when the preloader splits */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-baseline justify-between font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          <span>Damian — folio</span>
          <span>v.03</span>
        </div>
        <div>
          {HERO.map((w, i) => (
            <div key={w} className="overflow-hidden">
              <div
                data-hero-line
                className={`font-lab-display font-extrabold leading-[0.92] tracking-tight ${
                  i === 1 ? "text-[#3b82f6]" : "text-lab-text"
                }`}
                style={{
                  fontSize: "clamp(1.8rem, 13cqw, 10rem)",
                  transform: "translateY(110%)",
                }}
              >
                {w}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between">
          <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            Splits open at 100
          </p>
          <button
            type="button"
            aria-label="Run the preloader again"
            onClick={play}
            className="border border-lab-line bg-black/40 px-3 py-1.5 font-lab-mono text-[10px] uppercase tracking-[0.25em] text-lab-dim transition-colors hover:border-white/40 hover:text-lab-text"
          >
            Run again ↻
          </button>
        </div>
      </div>

      {/* Preloader — two clipped halves, each holding a full-stage face so the
          counter tears apart along the horizontal seam. */}
      {[0, 1].map((h) => (
        <div
          key={h}
          data-half
          aria-hidden
          className={`absolute inset-x-0 z-10 h-1/2 overflow-hidden will-change-transform ${
            h === 0 ? "top-0" : "bottom-0"
          }`}
        >
          <div
            className={`absolute inset-x-0 h-[200%] bg-[#0a0a0e] ${
              h === 0 ? "top-0" : "bottom-0"
            }`}
          >
            <div className="relative h-full w-full">
              <div className="absolute left-6 top-6 space-y-1.5">
                {LOGS.map((line, i) => (
                  <p
                    key={line}
                    data-log={i}
                    className="font-lab-mono text-[10px] uppercase tracking-[0.2em] text-lab-dim"
                    style={{ opacity: 0 }}
                  >
                    {line}
                  </p>
                ))}
              </div>
              <div
                data-count
                className="absolute right-6 top-1/2 -translate-y-1/2 font-lab-display font-extrabold leading-none tracking-tight text-lab-text"
                style={{ fontSize: "clamp(3rem, 24cqw, 18rem)" }}
              >
                000
              </div>
              <p className="absolute bottom-6 left-6 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
                Loading — do not blink
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
