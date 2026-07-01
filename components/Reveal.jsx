"use client";
import { motion } from "framer-motion";

export default function Reveal({ children, delay = 0, y = 30, className = "", as = "div" }) {
  // `as` lets callers render the reveal wrapper as a semantic element (e.g. an
  // <li> inside an <ol>) instead of a div, without losing the animation.
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
