"use client";
import { useEffect, useRef } from "react";

// Scramble Links — nav-style items that boil into glyph noise on hover and
// resolve left-to-right. Same character pool idea as GlitchField, applied to
// live text instead of a canvas backdrop.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>/[]{}=+";
const rnd = () => CHARS[(Math.random() * CHARS.length) | 0];

const ITEMS = [
  ["01", "MANIFESTO"],
  ["02", "SELECTED WORK"],
  ["03", "PROCESS"],
  ["04", "CONTACT"],
];

function Scramble({ label, reducedMotion }) {
  const ref = useRef(null);
  const state = useRef({ raf: null });

  useEffect(() => {
    const el = ref.current;
    const s = state.current;
    if (!el) return;

    const run = () => {
      if (reducedMotion) return;
      const startAt = performance.now();
      const dur = 260 + label.length * 34;
      cancelAnimationFrame(s.raf);
      const tick = (now) => {
        const p = Math.min(1, (now - startAt) / dur);
        const resolved = Math.floor(p * label.length);
        let out = "";
        for (let i = 0; i < label.length; i++) {
          const ch = label[i];
          out += i < resolved || ch === " " ? ch : rnd();
        }
        el.textContent = out;
        if (p < 1) s.raf = requestAnimationFrame(tick);
      };
      s.raf = requestAnimationFrame(tick);
    };

    const reset = () => {
      cancelAnimationFrame(s.raf);
      el.textContent = label;
    };

    const parent = el.closest("a");
    parent.addEventListener("pointerenter", run);
    parent.addEventListener("focus", run);
    parent.addEventListener("pointerleave", reset);
    parent.addEventListener("blur", reset);
    return () => {
      cancelAnimationFrame(s.raf);
      parent.removeEventListener("pointerenter", run);
      parent.removeEventListener("focus", run);
      parent.removeEventListener("pointerleave", reset);
      parent.removeEventListener("blur-sm", reset);
    };
  }, [label, reducedMotion]);

  return (
    <span aria-hidden ref={ref} className="tabular-nums">
      {label}
    </span>
  );
}

export default function ScrambleHover({ reducedMotion }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#07070a]">
      <nav className="w-full max-w-md px-8">
        <ul className="divide-y divide-lab-line border-y border-lab-line">
          {ITEMS.map(([n, label]) => (
            <li key={n}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label={label}
                className="group flex items-baseline justify-between py-5 font-lab-mono text-sm uppercase tracking-[0.22em] text-lab-dim transition-colors hover:text-lab-text focus-visible:text-lab-text"
              >
                <Scramble label={label} reducedMotion={reducedMotion} />
                <span className="text-[10px] text-lab-dim/60 transition-transform duration-300 group-hover:translate-x-1">
                  {n}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
