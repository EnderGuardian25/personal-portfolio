"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE, shouldPlayIntro } from "@/lib/motion";

// First-visit-only intro: the name + coordinates resolve out of glitch
// characters (same visual language as GlitchField), then the ivory curtain
// wipes upward into the hero entrance. Session-gated + reduced-motion-gated
// via shouldPlayIntro(); Hero shifts its delays by INTRO_OFFSET on the same
// decision. pointer-events-none — it can never trap a click.

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*+=<>/";
const LINES = ["DAMIAN DE CRUZ", "N 6.9271° / E 79.8612°"];
const RESOLVE_MS = 650;
const HOLD_MS = 250;

function scramble(line, progress) {
  const resolved = Math.floor(line.length * progress);
  let out = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    out += i < resolved || c === " " ? c : CHARS[(Math.random() * CHARS.length) | 0];
  }
  return out;
}

export default function IntroStamp() {
  const [active, setActive] = useState(false);
  const [display, setDisplay] = useState(LINES);

  useEffect(() => {
    if (!shouldPlayIntro()) return;
    setDisplay(LINES.map((l) => scramble(l, 0)));
    setActive(true);
    const start = performance.now();
    const id = setInterval(() => {
      const t = performance.now() - start;
      if (t >= RESOLVE_MS + HOLD_MS) {
        clearInterval(id);
        setActive(false);
        return;
      }
      const p = Math.min(1, t / RESOLVE_MS);
      setDisplay(LINES.map((l) => scramble(l, p)));
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden="true"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-0 z-[65] bg-ivory pointer-events-none grid place-items-center"
          style={{ clipPath: "inset(0 0 0% 0)" }}
        >
          <div className="text-center font-mono uppercase">
            <div className="text-[13px] md:text-[15px] tracking-[0.3em] text-ink">
              {display[0]}
            </div>
            <div className="mt-3 text-[10px] md:text-[11px] tracking-[0.24em] text-ink-faint">
              {display[1]}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
