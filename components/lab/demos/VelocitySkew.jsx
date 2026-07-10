"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

// Velocity Skew — this one scrolls real content, no sticky scene. A rAF loop
// derives per-frame scroll velocity from scrollTop deltas, smooths it
// exponentially, and maps it to skewY plus a touch of blur and letter-spacing
// on the column; everything decays back upright when the scroll stops.

const ROWS = [
  { n: "01", t: "Velocity" },
  { n: "02", t: "is a", img: "/lab/photo-1.webp" },
  { n: "03", t: "material" },
  { n: "04", t: "you can" },
  { n: "05", t: "shape —", img: "/lab/photo-3.webp" },
  { n: "06", t: "flick" },
  { n: "07", t: "the page" },
  { n: "08", t: "and rows", img: "/lab/photo-4.webp" },
  { n: "09", t: "lean, then" },
  { n: "10", t: "settle." },
];

export default function VelocitySkew({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const colRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return; // static upright column; native scroll only

    const scroller = scrollerRef.current;
    const col = colRef.current;
    if (!scroller || !col) return;

    let raf = null;
    let vel = 0;
    let lastY = scroller.scrollTop;
    let calm = 0;
    let hinted = false;

    const settle = () => {
      vel = 0;
      col.style.transform = "skewY(0deg)";
      col.style.filter = "none";
      col.style.setProperty("--vs-ls", "0em");
    };

    const tick = () => {
      const y = scroller.scrollTop;
      const dv = y - lastY; // px moved since last frame
      lastY = y;
      vel += (dv - vel) * 0.14; // smoothed velocity → shear that decays

      const skew = Math.max(-8, Math.min(8, vel * 0.32));
      const blur = Math.min(Math.abs(vel) * 0.045, 2.5);
      col.style.transform = `skewY(${skew.toFixed(3)}deg)`;
      col.style.filter = blur > 0.08 ? `blur(${blur.toFixed(2)}px)` : "none";
      col.style.setProperty("--vs-ls", `${(Math.abs(skew) * 0.011).toFixed(4)}em`);

      calm = Math.abs(dv) < 0.5 && Math.abs(vel) < 0.05 ? calm + 1 : 0;
      if (calm > 10) {
        settle(); // stood back up — park the loop until the next scroll
        raf = null;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!hinted) {
        hinted = true;
        hintRef.current.style.opacity = "0";
      }
      if (raf == null) raf = requestAnimationFrame(tick);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07070a]">
      <div ref={scrollerRef} className="h-full w-full overflow-y-auto">
        <div ref={colRef} className="px-[8cqw] py-[7cqw] will-change-[transform,filter]">
          {ROWS.map((row) => (
            <div key={row.n} className="border-t border-lab-line py-[3cqw]">
              <div className="flex items-baseline gap-4">
                <span className="font-lab-mono text-[10px] tracking-[0.3em] text-lab-dim">
                  {row.n}
                </span>
                <span
                  className="font-lab-display text-[7cqw] font-bold leading-none tracking-tight text-lab-text"
                  style={{ letterSpacing: "calc(-0.01em + var(--vs-ls, 0em))" }}
                >
                  {row.t}
                </span>
              </div>
              {row.img && (
                <div className="relative mt-[2cqw] h-[16cqw] w-[62%] overflow-hidden">
                  <Image
                    src={row.img}
                    alt=""
                    fill
                    sizes="50vw"
                    className="object-cover"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          ))}
          <p className="border-t border-lab-line pt-[3cqw] font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
            End of feed — <span className="text-[#3b82f6]">shear settles to zero</span>
          </p>
        </div>
      </div>

      <p
        ref={hintRef}
        className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim transition-opacity duration-500"
      >
        Scroll ↓ — flick it hard
      </p>
    </div>
  );
}
