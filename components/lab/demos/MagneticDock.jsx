"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Magnetic Dock — buttons that reach toward the cursor inside their magnetic
// radius and snap back on springs, plus a soft cursor blob that glides between
// them and swells over whichever button it's feeding on.
const ITEMS = ["WORK", "ABOUT", "LAB", "CONTACT"];
const RADIUS = 90;

function MagneticButton({ label, reducedMotion }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 16 });

  const onMove = (e) => {
    if (reducedMotion) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    const pull = Math.max(0, 1 - d / RADIUS);
    x.set(dx * pull * 0.45);
    y.set(dy * pull * 0.45);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href="#"
      onClick={(e) => e.preventDefault()}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className="relative z-10 border border-lab-line px-6 py-3 font-lab-mono text-xs uppercase tracking-[0.25em] text-lab-dim transition-colors hover:border-lab-text hover:text-lab-text"
    >
      {label}
    </motion.a>
  );
}

export default function MagneticDock({ reducedMotion }) {
  const wrapRef = useRef(null);
  const bx = useSpring(useMotionValue(-100), { stiffness: 55, damping: 13 });
  const by = useSpring(useMotionValue(-100), { stiffness: 55, damping: 13 });
  const scale = useSpring(useMotionValue(0), { stiffness: 120, damping: 15 });

  const onMove = (e) => {
    if (reducedMotion) return;
    const r = wrapRef.current.getBoundingClientRect();
    bx.set(e.clientX - r.left);
    by.set(e.clientY - r.top);
    const overButton = e.target.closest?.("a") != null;
    scale.set(overButton ? 2.4 : 1);
  };
  const onLeave = () => scale.set(0);

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#07070a]"
    >
      {/* Cursor blob — swells behind the hovered button. */}
      {/* Anchored at the container origin (left-0 top-0) so the x/y motion
          values — cursor coords relative to the container — land the blob
          under the pointer; -m-4 self-centers the 32px blob. translateX/Y
          props would alias-collide with x/y in framer, hence margins. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-0 -ml-4 -mt-4 h-8 w-8 rounded-full bg-[#3b82f6]/60 blur-md"
        style={{ x: bx, y: by, scale }}
      />
      <nav className="z-10 flex flex-wrap items-center justify-center gap-4 px-6">
        {ITEMS.map((label) => (
          <MagneticButton
            key={label}
            label={label}
            reducedMotion={reducedMotion}
          />
        ))}
      </nav>
    </div>
  );
}
