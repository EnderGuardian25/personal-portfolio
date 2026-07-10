"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

// Pin Morph (signature). The root is an internal scroller; the scene is a
// sticky frame pinned while ~3.4 stage-heights of runway scroll beneath it.
// Progress is read in the scroll listener, exponentially smoothed in rAF, and
// each element remaps it through its own offset gsap ease — the photo's
// clip-path blooms to full bleed while the caption halves outrun its edges.

const TALL = 3.4;
const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export default function PinMorphScroll({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const labelARef = useRef(null);
  const labelBRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Staggered easing windows: the split leads, the bloom follows, the
    // counter swaps only once the photo owns most of the frame.
    const easeGrow = gsap.parseEase("power3.inOut");
    const easeSplit = gsap.parseEase("power4.inOut");
    const easeSwap = gsap.parseEase("power2.inOut");

    const apply = (p) => {
      const grow = easeGrow(seg(p, 0.06, 0.8));
      const split = easeSplit(seg(p, 0, 0.72));
      const swap = easeSwap(seg(p, 0.52, 0.8));
      frameRef.current.style.clipPath = `inset(${(36 * (1 - grow)).toFixed(3)}% ${(40 * (1 - grow)).toFixed(3)}% round ${(1.6 * (1 - grow)).toFixed(3)}cqw)`;
      imgRef.current.style.transform = `scale(${(1.35 - 0.35 * grow).toFixed(4)})`;
      leftRef.current.style.transform = `translateX(${(-46 * split).toFixed(3)}cqw)`;
      rightRef.current.style.transform = `translateX(${(46 * split).toFixed(3)}cqw)`;
      labelARef.current.style.opacity = (1 - swap).toFixed(3);
      labelARef.current.style.transform = `translateY(${(-10 * swap).toFixed(2)}px)`;
      labelBRef.current.style.opacity = swap.toFixed(3);
      labelBRef.current.style.transform = `translateY(${(10 * (1 - swap)).toFixed(2)}px)`;
      hintRef.current.style.opacity = (1 - seg(p, 0.02, 0.16)).toFixed(3);
    };

    if (reducedMotion) {
      apply(0.6); // settled mid-bloom state, no scrub
      return;
    }
    apply(0);

    let target = 0;
    let p = 0;
    let raf = null;
    const tick = () => {
      p += (target - p) * 0.14; // exponential settle toward the scroll target
      if (Math.abs(target - p) < 0.0004) {
        p = target;
        apply(p);
        raf = null;
        return;
      }
      apply(p);
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      target = max > 0 ? scroller.scrollTop / max : 0;
      if (raf == null) raf = requestAnimationFrame(tick);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-y-auto bg-[#07070a]">
      <div style={{ height: reducedMotion ? "100%" : `${TALL * 100}%` }}>
        <div
          className="sticky top-0 overflow-hidden"
          style={{ height: reducedMotion ? "100%" : `${100 / TALL}%` }}
        >
          <h2 className="sr-only">Pin morph — a pinned photo grows to full bleed</h2>

          {/* Caption halves — they split apart as the photo grows between them */}
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center gap-[26cqw] font-lab-display font-extrabold leading-none tracking-tight text-lab-text"
            style={{ fontSize: "10cqw" }}
          >
            <span ref={leftRef} className="will-change-transform">PIN</span>
            <span ref={rightRef} className="will-change-transform">MORPH</span>
          </div>

          {/* Photo frame — clip-path inset keeps the image full-res while small */}
          <div
            ref={frameRef}
            aria-hidden
            className="absolute inset-0 z-10 will-change-[clip-path]"
            style={{ clipPath: "inset(36% 40% round 1.6cqw)" }}
          >
            <div ref={imgRef} className="absolute inset-0 will-change-transform">
              <Image
                src="/lab/photo-2.webp"
                alt=""
                fill
                sizes="90vw"
                className="object-cover"
                draggable={false}
              />
            </div>
          </div>

          {/* Counter crossfade */}
          <div className="absolute bottom-4 right-4 z-20 grid justify-items-end font-lab-mono text-[10px] uppercase tracking-[0.3em]">
            <span ref={labelARef} className="col-start-1 row-start-1 text-lab-dim">
              01 — Detail
            </span>
            <span
              ref={labelBRef}
              className="col-start-1 row-start-1 text-[#3b82f6]"
              style={{ opacity: 0 }}
            >
              02 — Full bleed
            </span>
          </div>

          <p
            ref={hintRef}
            className="absolute bottom-4 left-4 z-20 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim"
          >
            Scroll ↓ — the frame blooms
          </p>
        </div>
      </div>
    </div>
  );
}
