"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

// Rag-doll Type — every letter is its own framer-motion drag target. Pick one
// up and it lifts (scale + shadow + a random held tilt); let go and
// dragSnapToOrigin feeds the release velocity into the inertia spring, so a
// hard fling overshoots in the throw direction, tumbles (low-damping rotate
// spring back to 0), and settles home. Layout is plain inline flow: each glyph
// animates x/y around its natural slot, so the sentence never reflows.
// Gotchas: entrance (delayed y/opacity) lives on an OUTER span — putting it on
// the drag target would replay the delay every time `held` re-renders the
// animate prop. zIndex goes on the outer span too: every entrance-transformed
// wrapper is its own stacking context, so a held letter needs its wrapper
// raised, not just the glyph.
const SENTENCE = "Grab a letter, throw it.";

function Letter({ ch, i, stageRef, reducedMotion }) {
  const [held, setHeld] = useState(false);
  const tiltRef = useRef(0); // random held tilt, picked fresh each grab

  if (reducedMotion) return <span className="inline-block">{ch}</span>;

  return (
    <motion.span
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.15 + i * 0.03 }}
      className="relative inline-block"
      style={{ zIndex: held ? 20 : undefined }}
    >
      <motion.span
        drag
        dragConstraints={stageRef} // flights stay inside the stage
        dragElastic={0.2}
        dragSnapToOrigin // throw momentum carries, then springs back to the slot
        dragTransition={{ bounceStiffness: 170, bounceDamping: 13 }}
        onDragStart={() => {
          tiltRef.current = (Math.random() - 0.5) * 26;
          setHeld(true);
        }}
        onDragEnd={() => setHeld(false)}
        animate={{
          scale: held ? 1.22 : 1,
          rotate: held ? tiltRef.current : 0,
          textShadow: held
            ? "0 18px 28px rgba(0,0,0,0.6)"
            : "0 0px 0px rgba(0,0,0,0)",
        }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 20,
          // underdamped → the letter wobbles upright as it lands (the tumble)
          rotate: { type: "spring", stiffness: 210, damping: 9 },
          textShadow: { duration: 0.25 },
        }}
        className="inline-block cursor-grab touch-none active:cursor-grabbing"
      >
        {ch}
      </motion.span>
    </motion.span>
  );
}

export default function RagDollType({ reducedMotion }) {
  const stageRef = useRef(null);

  // Precompute each word's starting char index so the stagger runs across the
  // whole sentence, not per word.
  let idx = 0;
  const words = SENTENCE.split(" ").map((w) => {
    const start = idx;
    idx += w.length;
    return { w, start };
  });

  return (
    <div
      ref={stageRef}
      className="relative flex h-full w-full select-none items-center justify-center overflow-hidden bg-[#07070a] px-8"
    >
      <p
        className="max-w-[14ch] text-center font-lab-display font-extrabold leading-[1.15] text-lab-text"
        style={{ fontSize: "clamp(1.4rem, 8cqw, 4.2rem)" }}
      >
        {words.map(({ w, start }, wi) => (
          <span key={wi}>
            <span className="inline-block whitespace-nowrap">
              {w.split("").map((ch, ci) => (
                <Letter
                  key={ci}
                  ch={ch}
                  i={start + ci}
                  stageRef={stageRef}
                  reducedMotion={reducedMotion}
                />
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ))}
      </p>
      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        grab a letter · fling it — it finds its way home
      </p>
    </div>
  );
}
