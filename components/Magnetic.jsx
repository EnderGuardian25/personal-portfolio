"use client";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SPRING } from "@/lib/motion";

// Wraps a CTA so it subtly pulls toward the cursor while hovered and springs
// back on leave. Desktop-pointer only; renders an inert passthrough for
// touch/reduced-motion users (decided post-mount so SSR markup never differs).
// `className` replaces the default display class entirely (so callers can pass
// e.g. "hidden md:inline-block" without fighting a hardcoded inline-block).
export default function Magnetic({ children, strength = 0.3, className = "inline-block" }) {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const rect = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING.magnetic);
  const y = useSpring(rawY, SPRING.magnetic);

  useEffect(() => {
    setEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  if (reduce || !enabled) {
    return <div className={className}>{children}</div>;
  }

  const onPointerEnter = (e) => {
    rect.current = e.currentTarget.getBoundingClientRect();
  };
  const onPointerMove = (e) => {
    const r = rect.current;
    if (!r) return;
    rawX.set((e.clientX - (r.left + r.width / 2)) * strength);
    rawY.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onPointerLeave = () => {
    rect.current = null;
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      style={{ x, y }}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
