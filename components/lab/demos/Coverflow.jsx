"use client";
import { useEffect, useRef } from "react";

// Coverflow — the classic 3D fan. A single continuous position value drives
// every cover's transform inside rAF (direct style writes, zero React state):
// center cover faces front, sides fold to rotateY(±48°) and push back on
// translateZ, overlapping. Reflection is a scaleY(-1) copy with a gradient
// mask fade. Drag scrubs the position (momentum → snap to nearest index on
// release); clicking a side cover centers it; arrow keys step when focused.
// Gotchas: all translate distances are in cqw so transforms scale with the
// container for free — no ResizeObserver needed. Drag listeners go on window
// (NOT setPointerCapture — capture retargets the pointer stream to the root,
// which would swallow the covers' click events); the click a real drag-release
// generates is suppressed per-gesture (flag cleared on a timeout so later
// keyboard clicks never inherit it).
const FILTERS = [
  "saturate(0.9)",
  "contrast(1.06) saturate(0.75)",
  "saturate(1.15) brightness(0.96)",
  "sepia(0.18) saturate(0.85)",
];
const COVERS = [1, 2, 3, 4, 1, 2, 3, 4].map((n, i) => ({
  src: `/lab/photo-${n}.webp`,
  filter: FILTERS[i % FILTERS.length],
}));
const CENTER = 3; // resting index after the entrance glide
const START = CENTER + 3.2; // entrance glide begins here (off-center)

// Pure fan pose for cover i at position p — used by the rAF apply() AND baked
// into each cover's JSX so a (re)mount never paints stacked untransformed
// covers before the first effect runs.
const fanStyle = (i, p) => {
  const off = i - p;
  const abs = Math.abs(off);
  const side = Math.min(abs, 1); // 0 at center → 1 once fully aside
  const sign = off < 0 ? -1 : 1;
  // first neighbor steps out 17cqw, the rest stack tighter (overlap)
  const x = sign * (side * 17 + Math.max(0, abs - 1) * 8.5);
  const z = -(side * 14 + Math.max(0, abs - 1) * 2);
  const ry = -sign * side * 48;
  return {
    transform: `translate(-50%, -50%) translateX(${x.toFixed(3)}cqw) translateZ(${z.toFixed(3)}cqw) rotateY(${ry.toFixed(2)}deg)`,
    zIndex: String(100 - Math.round(abs * 2)),
    filter: `brightness(${(1 - side * 0.35 - Math.max(0, abs - 1) * 0.08).toFixed(3)})`,
  };
};

export default function Coverflow({ reducedMotion }) {
  const rootRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const covers = Array.from(root.querySelectorAll("[data-cover]"));
    const N = covers.length;
    const clampIdx = (v) => Math.min(N - 1, Math.max(0, v));

    let pos = CENTER;
    let target = CENTER;
    let shownIdx = -1;

    const apply = (p) => {
      for (let i = 0; i < N; i++) {
        const s = fanStyle(i, p);
        covers[i].style.transform = s.transform;
        covers[i].style.zIndex = s.zIndex;
        covers[i].style.filter = s.filter;
      }
      const idx = clampIdx(Math.round(p));
      if (idx !== shownIdx) {
        shownIdx = idx;
        if (counterRef.current)
          counterRef.current.textContent = String(idx + 1).padStart(2, "0");
      }
    };

    if (reducedMotion) {
      // Settled arrangement; cover clicks / arrows reposition instantly.
      pos = target = CENTER;
      apply(pos);
      const clicks = covers.map((el, i) => {
        const fn = () => {
          pos = target = i;
          apply(pos);
        };
        el.addEventListener("click", fn);
        return fn;
      });
      const onKey = (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        pos = target = clampIdx(target + (e.key === "ArrowRight" ? 1 : -1));
        apply(pos);
      };
      root.addEventListener("keydown", onKey);
      return () => {
        covers.forEach((el, i) => el.removeEventListener("click", clicks[i]));
        root.removeEventListener("keydown", onKey);
      };
    }

    let raf = null;
    let prevT = 0;
    let dragging = false;
    let moved = 0; // px travelled this gesture — >6 marks it a drag on release
    let suppressClick = false; // eat only the click THIS release generates
    let lastX = 0;
    let lastT = 0;
    let vel = 0; // px/ms, exponentially smoothed
    const unit = () => root.clientWidth * 0.17; // px per index ≈ the 17cqw step

    const tick = (now) => {
      const dt = Math.min(0.05, (now - prevT) / 1000);
      prevT = now;
      // eager while scrubbing, softer for the magnetic snap
      const tau = dragging ? 0.07 : 0.2;
      pos += (target - pos) * (1 - Math.exp(-dt / tau));
      if (!dragging && Math.abs(target - pos) < 0.0015) {
        pos = target;
        apply(pos);
        raf = null;
        return;
      }
      apply(pos);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf == null) {
        prevT = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onWinMove = (e) => {
      const dx = e.clientX - lastX;
      const dtm = Math.max(1, e.timeStamp - lastT);
      vel = 0.75 * vel + 0.25 * (dx / dtm);
      lastX = e.clientX;
      lastT = e.timeStamp;
      moved += Math.abs(dx);
      target = Math.min(N - 0.6, Math.max(-0.4, target - dx / unit()));
      start();
    };
    const onUp = () => {
      dragging = false;
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      // A real drag's release fires a click before the timeout runs — eat that
      // one only. The flag then clears, so keyboard clicks (which fire with no
      // pointerdown) are never poisoned by a stale gesture.
      suppressClick = moved > 6;
      moved = 0;
      if (suppressClick) setTimeout(() => (suppressClick = false), 0);
      // project ~220ms of throw velocity, then snap to the nearest cover
      target = clampIdx(Math.round(pos - (vel * 220) / unit()));
      start();
    };
    const onDown = (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      dragging = true;
      moved = 0;
      vel = 0;
      lastX = e.clientX;
      lastT = e.timeStamp;
      window.addEventListener("pointermove", onWinMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };
    root.addEventListener("pointerdown", onDown);

    const clicks = covers.map((el, i) => {
      const fn = () => {
        if (suppressClick) return; // it was a drag-release, not a click
        target = i;
        start();
      };
      el.addEventListener("click", fn);
      return fn;
    });
    const onKey = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      target = clampIdx(Math.round(target) + (e.key === "ArrowRight" ? 1 : -1));
      start();
    };
    root.addEventListener("keydown", onKey);

    // Entrance: fan glides in from three covers off-center and settles.
    pos = START;
    apply(pos);
    start();

    return () => {
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      covers.forEach((el, i) => el.removeEventListener("click", clicks[i]));
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      aria-label="Coverflow carousel — drag, click a cover, or use arrow keys"
      className="relative h-full w-full cursor-grab select-none overflow-hidden bg-[#07070a] outline-hidden [touch-action:pan-y] active:cursor-grabbing"
    >
      <div className="absolute inset-0" style={{ perspective: "1100px" }}>
        {COVERS.map((c, i) => (
          <button
            key={i}
            type="button"
            data-cover
            aria-label={`Center cover ${i + 1}`}
            className="absolute left-1/2 top-[42%] w-[24cqw] will-change-transform"
            // Bake the first-frame pose (entrance start, or the settled fan
            // under reduced motion) so paint-before-effect never shows the
            // covers stacked untransformed. apply() overwrites these inline.
            style={{
              transformStyle: "preserve-3d",
              ...fanStyle(i, reducedMotion ? CENTER : START),
            }}
          >
            <span className="block aspect-square overflow-hidden border border-white/10 bg-lab-panel">
              <img
                src={c.src}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
                style={{ filter: c.filter }}
              />
            </span>
            {/* floor reflection: flipped copy; mask designed in local (unflipped)
                coords — bottom-opaque reads as top-bright once scaleY(-1) runs */}
            <span
              aria-hidden
              className="absolute left-0 top-full mt-[0.6cqw] block aspect-square w-full overflow-hidden opacity-40 [transform:scaleY(-1)]"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.55) 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.55) 100%)",
              }}
            >
              <img
                src={c.src}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
                style={{ filter: c.filter }}
              />
            </span>
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-101 font-lab-mono text-[10px] uppercase tracking-[0.3em]">
        <span ref={counterRef} className="text-lab-text">
          {String(CENTER + 1).padStart(2, "0")}
        </span>
        <span className="text-lab-dim"> / {String(COVERS.length).padStart(2, "0")}</span>
        <span className="ml-4 text-lab-dim">drag · click a cover · ← →</span>
      </div>
    </div>
  );
}
