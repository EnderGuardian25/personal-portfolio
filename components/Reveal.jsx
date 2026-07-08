"use client";
import { motion } from "framer-motion";
import { EASE, VIEWPORT } from "@/lib/motion";

export default function Reveal({ children, delay = 0, y = 30, className = "", as = "div", margin }) {
  // `as` lets callers render the reveal wrapper as a semantic element (e.g. an
  // <li> inside an <ol>) instead of a div, without losing the animation.
  // `margin` overrides the viewport margin — elements flush with the page
  // bottom (footer) can never scroll 80px past the fold, so they pass "0px".
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={margin !== undefined ? { ...VIEWPORT, margin } : VIEWPORT}
      transition={{ duration: 1, ease: EASE, delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
