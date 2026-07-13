"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Floating Panels — fake UI cards parked at different translateZ depths inside
// one perspective scene. The scene yaws/pitches toward the smoothed pointer
// POSITION (springs hold the lean while the cursor rests — never velocity),
// and each card also slides laterally in proportion to its `near` factor so
// close panels overtake far ones. Layer order per card: entrance wrapper
// (spring rise, staggered) → parallax wrapper (pointer x/y + z) → bob wrapper
// (infinite offset-phase float) — three separate elements so the transforms
// never fight. Every wrapper keeps transformStyle: preserve-3d or the
// translateZ depths flatten silently.

const ACCENT = "#3b82f6";

function Panel({ sx, sy, z, near, delay, bobDur, bobDelay, reducedMotion, className, children }) {
  // near ∈ [-0.15, 1]: how far this card shifts with the pointer (depth cue).
  const x = useTransform(sx, [0, 1], reducedMotion ? [0, 0] : [-24 * near, 24 * near]);
  const y = useTransform(sy, [0, 1], reducedMotion ? [0, 0] : [-16 * near, 16 * near]);
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={reducedMotion ? false : { opacity: 0, y: 44 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: { type: "spring", stiffness: 120, damping: 17, delay },
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div style={{ x, y, z, transformStyle: "preserve-3d" }}>
        <motion.div
          animate={reducedMotion ? undefined : { y: [0, -7, 0] }}
          transition={
            reducedMotion
              ? undefined
              : { duration: bobDur, delay: bobDelay, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function FloatingPanelsHero({ reducedMotion }) {
  const wrapRef = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 55, damping: 15 });
  const sy = useSpring(my, { stiffness: 55, damping: 15 });
  // Same tilt convention as SpotlightGrid: pointer right → positive rotateY.
  const rotX = useTransform(sy, [0, 1], reducedMotion ? [0, 0] : [6, -6]);
  const rotY = useTransform(sx, [0, 1], reducedMotion ? [0, 0] : [-8, 8]);

  const onMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={reducedMotion ? undefined : onMove}
      onPointerLeave={reducedMotion ? undefined : onLeave}
      className="relative h-full w-full overflow-hidden bg-[#07070a]"
      style={{ perspective: 1100 }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      >
        {/* Backdrop word — deepest plane, so the lean parallaxes it for free */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "translateZ(-90px)" }}
        >
          <span
            className="font-lab-display font-extrabold tracking-tight text-lab-text/[0.06]"
            style={{ fontSize: "clamp(3rem, 22cqw, 15rem)" }}
          >
            FLOAT
          </span>
        </div>

        {/* Nav pill */}
        <Panel sx={sx} sy={sy} z={55} near={0.7} delay={0.1} bobDur={4.6} bobDelay={0}
          reducedMotion={reducedMotion} className="left-[8%] top-[14%]">
          <div className="flex items-center gap-3 rounded-full border border-lab-line bg-lab-panel/90 py-2 pl-3 pr-4 font-lab-mono text-[9px] uppercase tracking-[0.2em] text-lab-dim shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]">
            <span className="h-2 w-2 rounded-full" style={{ background: ACCENT }} />
            <span className="text-lab-text">studio</span>
            <span>work</span>
            <span>lab</span>
            <span>contact</span>
          </div>
        </Panel>

        {/* Chart card */}
        <Panel sx={sx} sy={sy} z={30} near={0.45} delay={0.22} bobDur={5.4} bobDelay={0.8}
          reducedMotion={reducedMotion} className="left-[54%] top-[18%]">
          <div className="w-[28cqw] border border-lab-line bg-lab-panel/95 p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
            <div className="flex items-baseline justify-between font-lab-mono text-[9px] uppercase tracking-[0.22em]">
              <span className="text-lab-dim">Velocity</span>
              <span style={{ color: ACCENT }}>+38%</span>
            </div>
            <svg viewBox="0 0 100 30" className="mt-3 w-full" aria-hidden>
              <polyline
                points="0,25 13,21 26,23 39,15 52,17 65,9 78,12 91,6 100,3"
                fill="none" stroke={ACCENT} strokeWidth="1.5"
                strokeLinejoin="round" strokeLinecap="round"
              />
              <circle cx="100" cy="3" r="2" fill={ACCENT} />
            </svg>
            <p className="mt-3 font-lab-display text-xl font-bold text-lab-text">128ms</p>
          </div>
        </Panel>

        {/* Message bubble — nearest plane, moves the most */}
        <Panel sx={sx} sy={sy} z={85} near={1} delay={0.34} bobDur={5} bobDelay={1.6}
          reducedMotion={reducedMotion} className="left-[12%] top-[56%]">
          <div className="flex w-[30cqw] items-start gap-3 border border-lab-line bg-lab-panel/95 p-4 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.95)]">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-lab-line bg-[#101a33] font-lab-mono text-[9px]"
              style={{ color: ACCENT }}
            >
              D
            </span>
            <div>
              <p className="font-lab-mono text-[10px] leading-relaxed text-lab-text">
                New brief just landed — you in?
              </p>
              <p className="mt-1 font-lab-mono text-[9px] text-lab-dim">now · unread</p>
            </div>
          </div>
        </Panel>

        {/* Stat chip — farthest card, barely drifts */}
        <Panel sx={sx} sy={sy} z={10} near={0.3} delay={0.46} bobDur={5.8} bobDelay={2.4}
          reducedMotion={reducedMotion} className="left-[62%] top-[62%]">
          <div className="border border-lab-line bg-lab-panel/95 px-4 py-3 text-center shadow-[0_20px_50px_-26px_rgba(0,0,0,0.9)]">
            <p className="font-lab-display text-lg font-bold text-lab-text">99.98%</p>
            <p className="mt-1 font-lab-mono text-[9px] uppercase tracking-[0.22em] text-lab-dim">
              uptime
            </p>
          </div>
        </Panel>
      </motion.div>

      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        The scene leans with you — near cards travel further
      </p>
    </div>
  );
}
