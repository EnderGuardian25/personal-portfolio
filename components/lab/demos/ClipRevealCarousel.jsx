"use client";
import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";

// Clip Reveal — slides stacked absolutely; the incoming slide wipes in through
// an animated clip-path inset while its image de-scales. GSAP timeline per
// transition, keyboard arrows supported, index counter + progress hairline.
const SLIDES = [
  { src: "/lab/photo-1.webp", caption: "Fine art, shot on a phone" },
  { src: "/lab/photo-2.webp", caption: "Golden hour, Galle Face" },
  { src: "/lab/photo-3.webp", caption: "Monsoon light study" },
  { src: "/lab/photo-4.webp", caption: "Street geometry" },
];

export default function ClipRevealCarousel({ reducedMotion }) {
  const rootRef = useRef(null);
  const indexRef = useRef(0);
  const busyRef = useRef(false);

  const goTo = useCallback(
    (dir) => {
      const root = rootRef.current;
      if (!root || busyRef.current) return;
      const slides = root.querySelectorAll("[data-slide]");
      const counter = root.querySelector("[data-counter]");
      const bar = root.querySelector("[data-bar]");
      const from = indexRef.current;
      const to = (from + dir + SLIDES.length) % SLIDES.length;
      indexRef.current = to;

      counter.textContent = String(to + 1).padStart(2, "0");
      const setBar = () =>
        gsap.set(bar, { scaleX: (to + 1) / SLIDES.length });

      if (reducedMotion) {
        gsap.set(slides[from], { autoAlpha: 0 });
        gsap.set(slides[to], {
          autoAlpha: 1,
          clipPath: "inset(0% 0% 0% 0%)",
        });
        setBar();
        return;
      }

      busyRef.current = true;
      const incoming = slides[to];
      const img = incoming.querySelector("img");
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(slides[from], { autoAlpha: 0 });
          busyRef.current = false;
        },
      });
      tl.set(incoming, {
        autoAlpha: 1,
        zIndex: 2,
        clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
      })
        .set(slides[from], { zIndex: 1 })
        .fromTo(
          incoming,
          { clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            ease: "power3.inOut",
          }
        )
        .fromTo(
          img,
          { scale: 1.25 },
          { scale: 1, duration: 1.1, ease: "power3.out" },
          "<"
        )
        .add(setBar, "<0.2");
    },
    [reducedMotion]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goTo(1);
      if (e.key === "ArrowLeft") goTo(-1);
    };
    const root = rootRef.current;
    root?.addEventListener("keydown", onKey);
    return () => root?.removeEventListener("keydown", onKey);
  }, [goTo]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      aria-label="Image carousel — use arrow keys or the buttons to change slides"
      className="relative h-full w-full overflow-hidden outline-none"
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.src + i}
          data-slide
          className="absolute inset-0"
          style={{
            visibility: i === 0 ? "visible" : "hidden",
            opacity: i === 0 ? 1 : 0,
            clipPath: "inset(0% 0% 0% 0%)",
          }}
        >
          <Image
            src={s.src}
            alt={s.caption}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            draggable={false}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
            <p className="font-lab-mono text-[11px] uppercase tracking-[0.22em] text-white/85">
              {s.caption}
            </p>
          </div>
        </div>
      ))}

      <div className="absolute left-4 top-4 z-10 flex items-baseline gap-1 font-lab-mono text-lab-text">
        <span data-counter className="text-xl">
          01
        </span>
        <span className="text-[10px] text-lab-text/50">
          / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      <div className="absolute inset-x-4 bottom-16 z-10 h-px bg-white/20">
        <div
          data-bar
          className="h-full origin-left bg-white"
          style={{ transform: `scaleX(${1 / SLIDES.length})` }}
        />
      </div>

      <div className="absolute right-4 top-4 z-10 flex gap-2">
        {[
          ["Previous slide", "←", -1],
          ["Next slide", "→", 1],
        ].map(([label, glyph, dir]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => goTo(dir)}
            className="border border-white/25 bg-black/30 px-3 py-1.5 font-lab-mono text-sm text-white/85 backdrop-blur-sm transition-colors hover:border-white/60 hover:text-white"
          >
            {glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
