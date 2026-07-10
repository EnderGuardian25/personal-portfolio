"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Depth Stack — cards layered in real 3D (translateZ + rotateY). The whole
// deck yaws toward the cursor on springs; clicking a card promotes it to the
// front with a spring re-layout of every offset.
const CARDS = [
  { src: "/lab/photo-1.webp", label: "ISLE" },
  { src: "/lab/photo-2.webp", label: "SHORE" },
  { src: "/lab/photo-3.webp", label: "STORM" },
  { src: "/lab/photo-4.webp", label: "GRID" },
];

export default function DepthStack({ reducedMotion }) {
  const wrapRef = useRef(null);
  // order[0] is the front card; clicking rotates the clicked card to front.
  const [order, setOrder] = useState(CARDS.map((_, i) => i));

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 60, damping: 14 });
  const sy = useSpring(my, { stiffness: 60, damping: 14 });
  const yaw = useTransform(sx, [0, 1], reducedMotion ? [0, 0] : [16, -16]);
  const pitch = useTransform(sy, [0, 1], reducedMotion ? [0, 0] : [-8, 8]);

  const onMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const promote = (cardIdx) => {
    setOrder((prev) => [cardIdx, ...prev.filter((i) => i !== cardIdx)]);
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      className="flex h-full w-full items-center justify-center bg-[#07070a]"
      style={{ perspective: 900 }}
    >
      <motion.div
        className="relative h-64 w-48 sm:h-80 sm:w-60"
        style={{
          rotateY: yaw,
          rotateX: pitch,
          transformStyle: "preserve-3d",
        }}
      >
        {CARDS.map((card, cardIdx) => {
          const depth = order.indexOf(cardIdx); // 0 = front
          return (
            <motion.button
              key={card.src}
              type="button"
              aria-label={`Bring ${card.label} to the front`}
              onClick={() => promote(cardIdx)}
              className="absolute inset-0 overflow-hidden border border-white/15 text-left"
              animate={{
                z: -depth * 55,
                x: depth * 26,
                y: -depth * 10,
                rotateY: -depth * 4,
                filter: `brightness(${1 - depth * 0.18})`,
              }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 260, damping: 26 }
              }
              style={{
                transformStyle: "preserve-3d",
                zIndex: CARDS.length - depth,
              }}
            >
              <Image
                src={card.src}
                alt=""
                fill
                sizes="300px"
                className="object-cover"
                draggable={false}
              />
              <span className="absolute bottom-2 left-2 font-lab-display text-sm font-bold tracking-[0.2em] text-white/90">
                {card.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
      <p className="pointer-events-none absolute bottom-5 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Move to fan the deck · click a card to promote it
      </p>
    </div>
  );
}
