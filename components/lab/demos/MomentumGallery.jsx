"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";

// Momentum Gallery — a Framer drag="x" row with real inertia; each image
// counter-translates inside its frame, so a throw parallaxes the photos
// against their crops while the row glides to a stop.
const IMAGES = [
  "/lab/photo-1.webp",
  "/lab/photo-2.webp",
  "/lab/photo-3.webp",
  "/lab/photo-4.webp",
  "/lab/photo-1.webp",
  "/lab/photo-2.webp",
];

function Card({ src, x, i }) {
  // Inner image drifts against the row's motion for parallax-within-frame.
  const inner = useTransform(x, (v) => v * -0.08);
  return (
    <div className="relative h-56 w-44 shrink-0 overflow-hidden sm:h-72 sm:w-56">
      <motion.div style={{ x: inner }} className="absolute -inset-x-8 inset-y-0">
        <Image
          src={src}
          alt=""
          fill
          sizes="300px"
          className="object-cover"
          draggable={false}
        />
      </motion.div>
      <span className="absolute bottom-2 left-2 font-lab-mono text-[10px] tracking-[0.25em] text-white/70">
        {String(i + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function MomentumGallery({ reducedMotion }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const x = useMotionValue(0);
  const [bound, setBound] = useState(0);

  useEffect(() => {
    const measure = () => {
      const vp = viewportRef.current;
      const track = trackRef.current;
      if (!vp || !track) return;
      setBound(Math.max(0, track.scrollWidth - vp.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    viewportRef.current && ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex h-full w-full items-center overflow-hidden bg-[#07070a]">
      <div ref={viewportRef} className="w-full overflow-hidden px-6">
        <motion.div
          ref={trackRef}
          drag="x"
          style={{ x }}
          dragConstraints={{ left: -bound, right: 0 }}
          dragElastic={0.12}
          dragTransition={
            reducedMotion
              ? { power: 0, timeConstant: 0 }
              : { power: 0.8, timeConstant: 320 }
          }
          className="flex cursor-grab gap-4 active:cursor-grabbing"
        >
          {IMAGES.map((src, i) => (
            <Card key={i} src={src} x={x} i={i} />
          ))}
        </motion.div>
        <p className="mt-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          Drag the row — photos parallax inside their frames
        </p>
      </div>
    </div>
  );
}
