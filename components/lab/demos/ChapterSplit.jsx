"use client";
import { useEffect, useRef } from "react";

// Chapter Split — a sticky split scene in an internal scroller: the left
// column pins chapter copy, the right column is an image panel. Progress maps
// to a continuous chapter coordinate u = p·3 and every chapter's copy/image
// gets a triangular presence around its integer stop, so crossings read as
// overlapping crossfades (copy slides through, images settle from a slight
// scale) rather than hard swaps. A thin vertical rail fills with p and lights
// a dot per stop. Gotcha: copy blocks are centered by a static flex wrapper —
// never by translate(-50%) on the same element the rAF loop transforms.

const TALL = 3.6;
const CHAPTERS = [
  { n: "01", t: "Collect", line: "Field notes, stray light, screenshots — nothing is precious yet.", src: "/lab/photo-1.webp" },
  { n: "02", t: "Reduce", line: "Cut every idea down to the one gesture that earns its place.", src: "/lab/photo-2.webp" },
  { n: "03", t: "Compose", line: "Type, image and motion rehearse until the timing feels inevitable.", src: "/lab/photo-3.webp" },
  { n: "04", t: "Release", line: "Ship it quiet, watch it live, start collecting again.", src: "/lab/photo-4.webp" },
];
const N = CHAPTERS.length;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function ChapterSplit({ reducedMotion }) {
  const scrollerRef = useRef(null);
  const copyRefs = useRef([]);
  const imgRefs = useRef([]);
  const dotRefs = useRef([]);
  const markerRef = useRef(null);
  const fillRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let lit = -1; // last painted stop — dots/marker only repaint on change
    const apply = (p) => {
      const u = p * (N - 1); // continuous chapter coordinate, 0..3
      for (let i = 0; i < N; i++) {
        const a = u - i; // signed distance to this chapter's stop
        const pres = clamp((0.78 - Math.abs(a)) / 0.36, 0, 1);
        const copy = copyRefs.current[i];
        const img = imgRefs.current[i];
        if (copy) {
          copy.style.opacity = pres.toFixed(3);
          // Enter from below, exit upward — clamped so far chapters don't drift.
          copy.style.transform = `translate3d(0, ${(clamp(a, -1.2, 1.2) * -26).toFixed(2)}px, 0)`;
        }
        if (img) {
          img.style.opacity = pres.toFixed(3);
          // Slight scale that settles to 1 exactly at the stop.
          img.style.transform = `scale(${(1 + Math.min(1, Math.abs(a)) * 0.05).toFixed(4)})`;
        }
      }
      const stop = clamp(Math.round(u), 0, N - 1);
      if (stop !== lit) {
        lit = stop;
        if (markerRef.current)
          markerRef.current.textContent = `CH 0${stop + 1} / 0${N}`;
        dotRefs.current.forEach((d, i) => {
          if (!d) return;
          d.style.background = i <= stop ? "#3b82f6" : "rgb(38 38 44)";
          d.style.boxShadow = i <= stop ? "0 0 8px rgba(59,130,246,0.6)" : "none";
        });
      }
      if (fillRef.current)
        fillRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
      if (hintRef.current)
        hintRef.current.style.opacity = Math.max(0, 1 - p * 6).toFixed(2);
    };

    if (reducedMotion) {
      apply(2 / 3); // u = 2 → chapter 3 held static, no scrub
      return;
    }
    apply(0);

    let target = 0;
    let p = 0;
    let raf = null;
    let last = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      p += (target - p) * (1 - Math.exp(-dt / 0.1)); // time-based settle
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
      if (raf == null) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
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
          className="sticky top-0 grid grid-cols-[5fr_6fr] overflow-hidden"
          style={{ height: reducedMotion ? "100%" : `${100 / TALL}%` }}
        >
          <h2 className="sr-only">Chapter split — scroll steps through four pinned chapters</h2>

          {/* LEFT — pinned copy + rail */}
          <div className="relative">
            {/* Progress rail with a stop per chapter */}
            <div aria-hidden className="absolute bottom-[16%] left-[3.2cqw] top-[16%] w-px bg-lab-line/70">
              <div
                ref={fillRef}
                className="absolute inset-0 origin-top bg-[#3b82f6]"
                style={{ transform: "scaleY(0)" }}
              />
              {CHAPTERS.map((_, i) => (
                <span
                  key={i}
                  ref={(el) => (dotRefs.current[i] = el)}
                  className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300"
                  style={{ top: `${(i / (N - 1)) * 100}%`, background: "rgb(38 38 44)" }}
                />
              ))}
            </div>

            <span
              ref={markerRef}
              className="absolute left-[7cqw] top-[4cqw] font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim"
            >
              CH 01 / 04
            </span>

            {/* Stacked chapter copy — static wrappers center, refs animate. */}
            {CHAPTERS.map((c, i) => (
              <div key={c.n} className="absolute inset-0 flex items-center pl-[7cqw] pr-[3cqw]">
                <div
                  ref={(el) => (copyRefs.current[i] = el)}
                  className="will-change-transform"
                  style={{ opacity: 0 }}
                >
                  <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-[#3b82f6]">
                    {c.n}
                  </p>
                  {/* 3.9cqw: usable column ≈ 45cqw−10cqw padding ≈ 35cqw, and
                      Syne 800 uppercase runs ~1.25em/char (browser-measured) —
                      "COMPOSE" needs ~8.8em, so 6.5cqw clipped the edge. */}
                  <h3 className="mt-[1.5cqw] font-lab-display text-[3.9cqw] font-extrabold uppercase leading-none tracking-tight text-lab-text">
                    {c.t}
                  </h3>
                  <p className="mt-[1.8cqw] max-w-[30cqw] font-lab-mono text-[11px] leading-relaxed text-lab-dim">
                    {c.line}
                  </p>
                </div>
              </div>
            ))}

            <p
              ref={hintRef}
              className="absolute bottom-[3cqw] left-[7cqw] font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80"
            >
              Scroll ↓ — four chapters
            </p>
          </div>

          {/* RIGHT — image panel, one photo per chapter, crossfaded */}
          <div className="relative overflow-hidden border-l border-lab-line" aria-hidden>
            {CHAPTERS.map((c, i) => (
              <div
                key={c.src}
                ref={(el) => (imgRefs.current[i] = el)}
                className="absolute inset-0 will-change-transform"
                style={{ opacity: 0 }}
              >
                <img src={c.src} draggable={false} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 right-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
                  fig. {c.n}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
