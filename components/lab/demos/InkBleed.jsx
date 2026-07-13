"use client";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

// Ink Bleed — scene B soaks in through an expanding circular wipe whose edge
// is torn organic by an SVG feTurbulence → feDisplacementMap filter. Two-copy
// reveal keeps it GPU-sane and the photo crisp: a FILTERED copy of the
// incoming scene clipped at radius r draws the bleeding rim, and an UNFILTERED
// copy clipped at r − BAND caps the interior — displacement only ever shows in
// a thin wet ring. Gotchas: filter and clip-path on the SAME element apply in
// the wrong order (clip after filter = clean edge), so the filter lives on a
// wrapper around the clipped layer; and the swap-then-reset of the clips must
// happen in useLayoutEffect — React won't rewrite an unchanged style prop, so
// the manual full-cover clip would otherwise stick across the scene flip.

const SCENES = [
  { index: "01", word: "GRAIN", note: "Scene A — dry paper", src: "/lab/photo-3.webp" },
  { index: "02", word: "WASH", note: "Scene B — ink laid", src: "/lab/photo-1.webp" },
];
const ORIGINS = [
  { x: 0.16, y: 0.24 },
  { x: 0.84, y: 0.7 },
];
const DUR = 1.5; // wipe duration (s)
const HOLD = 2600; // ms on the settled scene before auto-advance
const BAND = 90; // clean-cap inset — must exceed the displacement excursion

function Scene({ s }) {
  return (
    <div className="absolute inset-0 bg-[#0a0a0e]">
      <img src={s.src} alt="" draggable={false} className="h-full w-full object-cover opacity-80" />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-black/40" />
      <div className="absolute inset-x-0 top-0 flex items-baseline justify-between p-5 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-white/80">
        <span>{s.note}</span>
        <span>{s.index} / 02</span>
      </div>
      <div
        className="absolute bottom-10 left-5 font-lab-display font-extrabold uppercase leading-[0.9] tracking-tight text-lab-text"
        style={{ fontSize: "clamp(1.6rem, 12cqw, 9rem)" }}
      >
        {s.word}
      </div>
    </div>
  );
}

export default function InkBleed({ reducedMotion }) {
  const hostRef = useRef(null);
  const edgeRef = useRef(null); // filtered rim copy (clipped at r)
  const capRef = useRef(null); // clean interior copy (clipped at r − BAND)
  const sceneRef = useRef(0); // source of truth; `cur` mirrors it for render
  const busyRef = useRef(false);
  const runsRef = useRef(0);
  const rafRef = useRef(0);
  const timerRef = useRef(null);
  const [cur, setCur] = useState(0);
  // useId emits ":r1:" — invalid inside url(#…), so strip to safe chars.
  const fid = `ink-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // After the scene flip the incoming layers show the NEW next scene — reset
  // their clips to zero before paint so nothing flashes.
  useLayoutEffect(() => {
    const zero = "circle(0px at 50% 50%)";
    if (edgeRef.current) edgeRef.current.style.clipPath = zero;
    if (capRef.current) capRef.current.style.clipPath = zero;
  }, [cur]);

  const run = useCallback(() => {
    const host = hostRef.current;
    if (!host || busyRef.current) return;
    const next = 1 - sceneRef.current;

    if (reducedMotion) {
      sceneRef.current = next; // instant swap, no wipe, no auto-advance
      setCur(next);
      return;
    }

    busyRef.current = true;
    clearTimeout(timerRef.current);
    const { width: w, height: h } = host.getBoundingClientRect();
    const o = ORIGINS[runsRef.current++ % ORIGINS.length];
    const ox = o.x * w;
    const oy = o.y * h;
    // Cover radius: farthest corner + band + displacement margin.
    const far = Math.max(
      Math.hypot(ox, oy),
      Math.hypot(w - ox, oy),
      Math.hypot(ox, h - oy),
      Math.hypot(w - ox, h - oy)
    );
    const coverR = far + BAND + 80;

    let p = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      p = Math.min(1, p + dt / DUR);
      const r = (1 - Math.pow(1 - p, 3)) * coverR; // outCubic — fast soak, slow settle
      edgeRef.current.style.clipPath = `circle(${r.toFixed(1)}px at ${ox}px ${oy}px)`;
      capRef.current.style.clipPath = `circle(${Math.max(0, r - BAND).toFixed(1)}px at ${ox}px ${oy}px)`;
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        sceneRef.current = next;
        setCur(next); // layout effect zeroes the clips under full cover
        busyRef.current = false;
        timerRef.current = setTimeout(run, HOLD); // auto-advance
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [reducedMotion]);

  useEffect(() => {
    if (!reducedMotion) timerRef.current = setTimeout(run, 800);
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [run, reducedMotion]);

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden bg-[#07070a]">
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          {/* Region widened so the displaced rim isn't cropped at stage edges. */}
          <filter id={fid} x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="3" seed="7" result="noise" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="soft" />
            <feDisplacementMap in="soft" in2="noise" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* settled base scene */}
      <Scene s={SCENES[cur]} />

      {/* bleeding rim — filter on the WRAPPER, clip on the child (order matters) */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ filter: `url(#${fid})` }}>
        <div ref={edgeRef} className="absolute inset-0" style={{ clipPath: "circle(0px at 50% 50%)" }}>
          <Scene s={SCENES[1 - cur]} />
        </div>
      </div>
      {/* clean interior cap — same scene, no filter, BAND behind the rim */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div ref={capRef} className="absolute inset-0" style={{ clipPath: "circle(0px at 50% 50%)" }}>
          <Scene s={SCENES[1 - cur]} />
        </div>
      </div>

      <p className="absolute bottom-4 left-5 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Edge torn by turbulence · auto-soaks
      </p>
      <button
        type="button"
        aria-label="Run the ink bleed transition again"
        onClick={run}
        className="absolute bottom-3 right-4 z-10 border border-lab-line bg-black/40 px-3 py-1.5 font-lab-mono text-[10px] uppercase tracking-[0.25em] text-lab-dim backdrop-blur-xs transition-colors hover:border-white/40 hover:text-lab-text"
      >
        Bleed ↻
      </button>
    </div>
  );
}
