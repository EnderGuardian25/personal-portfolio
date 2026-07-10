"use client";
import Image from "next/image";
import { motion } from "framer-motion";

// Split Panel — a choreographed hero entrance: two panels slide apart, the
// image de-masks, type staggers up. Pure Framer Motion; the Replay button in
// LabStage remounts the component so the whole sequence runs again.
const EASE = [0.22, 1, 0.36, 1];

export default function SplitPanelHero({ reducedMotion }) {
  const dur = (d) => (reducedMotion ? 0 : d);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#07070a]">
      {/* Curtain panels */}
      <motion.div
        aria-hidden
        className="absolute inset-y-0 left-0 z-20 w-1/2 bg-lab-panel"
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: dur(0.9), ease: EASE, delay: dur(0.25) }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-y-0 right-0 z-20 w-1/2 bg-lab-panel"
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ duration: dur(0.9), ease: EASE, delay: dur(0.25) }}
      />

      {/* Image side */}
      <div className="relative w-1/2">
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: "inset(12% 12% 12% 12%)", scale: 1.15 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
          transition={{ duration: dur(1.2), ease: EASE, delay: dur(0.55) }}
        >
          <Image
            src="/lab/photo-3.webp"
            alt=""
            fill
            sizes="(max-width: 1024px) 50vw, 40vw"
            className="object-cover"
            priority={false}
          />
        </motion.div>
      </div>

      {/* Type side */}
      <div className="flex w-1/2 flex-col justify-center gap-3 p-6 sm:p-10">
        {["A hero that", "builds itself", "every visit."].map((line, i) => (
          <div key={line} className="overflow-hidden">
            <motion.div
              className="font-lab-display font-bold leading-tight text-lab-text"
              style={{ fontSize: "clamp(1rem, 3.6cqw, 2.6rem)" }}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{
                duration: dur(0.8),
                ease: EASE,
                delay: dur(0.8 + i * 0.1),
              }}
            >
              {line}
            </motion.div>
          </div>
        ))}
        <motion.p
          className="mt-2 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur(0.6), delay: dur(1.3) }}
        >
          Choreography sells the first second — hit replay
        </motion.p>
      </div>
    </div>
  );
}
