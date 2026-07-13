"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Terminal Boot — a mono terminal types a FIXED script (no randomness, so
// Replay is deterministic) via a gsap counter tween per line writing
// textContent substrings. One caret span per line (visibility-toggled by the
// timeline; a single shared opacity tween blinks whichever is visible) keeps
// the panel height stable from frame one. When the prompt finishes, the
// terminal dims/recedes and oversized Syne display type scale-stamps over it.
// Reduced motion: the JSX itself renders the settled end state — completed
// prompt, dimmed panel, stamp at identity — and no timeline runs.

const SCRIPT = [
  "$ ddc init --motion",
  "› brief parsed .......... ok",
  "› syne 800 loaded ....... ok",
  "› springs armed ......... ok",
  "✓ ready — take the wheel",
];
const STAMP = ["MAKE IT", "MOVE"];
const CPS = 30; // typing speed, chars/second

export default function TerminalHero({ reducedMotion }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    const texts = root.querySelectorAll("[data-line-text]");
    const carets = root.querySelectorAll("[data-caret]");
    const term = root.querySelector("[data-term]");
    const stamps = root.querySelectorAll("[data-stamp]");

    // Steady blink on every caret — only the `visible` one actually shows.
    const blink = gsap.to(carets, {
      opacity: 0,
      duration: 0.45,
      ease: "steps(1)",
      repeat: -1,
      yoyo: true,
    });

    const tl = gsap.timeline({ delay: 0.3 });

    SCRIPT.forEach((line, i) => {
      const s = { n: 0 };
      tl.set(carets[i], { visibility: "visible" }, i === 0 ? undefined : "+=0.2");
      if (i > 0) tl.set(carets[i - 1], { visibility: "hidden" }, "<");
      tl.to(s, {
        n: line.length,
        duration: line.length / CPS,
        ease: "none",
        onUpdate: () => {
          texts[i].textContent = line.slice(0, Math.round(s.n));
        },
      });
    });

    // The finished prompt breathes for a beat, then recedes under the stamp.
    tl.to(
      term,
      { opacity: 0.16, scale: 0.96, filter: "blur(2px)", duration: 0.8, ease: "power2.inOut" },
      "+=0.8"
    ).fromTo(
      stamps,
      { opacity: 0, scale: 1.5 },
      { opacity: 1, scale: 1, duration: 0.55, ease: "power4.out", stagger: 0.14 },
      "-=0.35"
    );

    return () => {
      tl.kill();
      blink.kill();
      // Revert gsap's inline caret styles — React skips the value-identical
      // style prop on re-render, so a mid-boot reduced-motion toggle would
      // otherwise leave a gsap-shown caret stuck visible. (clearProps on
      // visibility would fall back to the stylesheet's `visible`, not the
      // JSX `hidden`, so re-assert hidden explicitly.)
      gsap.set(carets, { clearProps: "opacity" });
      gsap.set(carets, { visibility: "hidden" });
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#07070a]"
    >
      <div
        data-term
        className="w-[72cqw] max-w-xl border border-lab-line bg-[#0a0a0e] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] will-change-transform"
        style={
          reducedMotion
            ? { opacity: 0.16, transform: "scale(0.96)", filter: "blur(2px)" }
            : undefined
        }
      >
        <div className="flex items-center gap-1.5 border-b border-lab-line px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-lab-line" />
          <span className="h-2 w-2 rounded-full bg-lab-line" />
          <span className="h-2 w-2 rounded-full bg-lab-line" />
          <span className="ml-2 font-lab-mono text-[9px] uppercase tracking-[0.25em] text-lab-dim">
            ddc — boot
          </span>
        </div>
        <div className="space-y-1.5 px-4 py-4 font-lab-mono text-[clamp(9px,1.7cqw,13px)] leading-relaxed">
          {SCRIPT.map((line, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-lab-text"
                  : i === SCRIPT.length - 1
                    ? "text-[#3b82f6]"
                    : "text-lab-dim"
              }
            >
              <span data-line-text>{reducedMotion ? line : ""}</span>
              {/* visibility (not display) keeps each row's height reserved */}
              <span
                data-caret
                aria-hidden
                className="inline-block w-[0.6em] text-lab-text"
                style={{ visibility: "hidden" }}
              >
                ▍
              </span>
            </p>
          ))}
        </div>
      </div>

      {/* Stamp overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {STAMP.map((w, i) => (
          <div
            key={w}
            data-stamp
            className={`font-lab-display font-extrabold leading-[0.95] tracking-tight will-change-transform ${
              i === 1 ? "text-[#3b82f6]" : "text-lab-text"
            }`}
            style={{
              fontSize: "clamp(2rem, 14cqw, 10rem)",
              opacity: reducedMotion ? 1 : 0,
            }}
          >
            {w}
          </div>
        ))}
      </div>

      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Boot sequence — replay to rerun
      </p>
    </div>
  );
}
