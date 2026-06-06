"use client";
import { MotionConfig } from "framer-motion";

// reducedMotion="user" makes every Framer Motion component automatically
// drop transform/layout animations (x, y, scale, rotate) when the OS
// "reduce motion" setting is on, while keeping opacity fades. One wrapper
// covers the whole tree — Hero word reveals, scroll indicator, etc.
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
