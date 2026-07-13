"use client";
import { useEffect, useRef } from "react";

// Morph Cursor — the native cursor is hidden inside the stage (cursor:none on
// the root only) and replaced by a blend-difference blob driven in one rAF
// loop. Position follows a damped spring whose velocity doubles as the stretch
// signal: fast travel rotates the blob to its heading and stretches it along
// that axis; at rest the spring converges and the blob relaxes to a circle
// parked exactly under the pointer — so a stationary hover still shows the
// effect. Over a [data-pill] the box targets swap to the measured rect and the
// blob melts into a rounded rect wrapping the label, inverted by
// mix-blend-difference. Gotcha (from MagneticDock): never self-center with a
// translate(-50%) alongside animated translate — the box computes its own
// top-left from center − size/2 every frame instead.

const PILLS = ["WORK", "PLAY", "LAB", "INFO"];
const DOT = 26; // free-roam blob diameter
const STIFF = 380; // spring stiffness toward target
const DAMP = 27; // ~critical damping — tiny overshoot, no ringing

const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a)); // shortest arc

export default function MorphCursor({ reducedMotion }) {
  const rootRef = useRef(null);
  const blobRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const blob = blobRef.current;
    if (!root || !blob || reducedMotion) return;

    const st = {
      x: 0, y: 0, vx: 0, vy: 0, // spring state — blob center
      px: 0, py: 0, // raw pointer (stage coords)
      w: DOT, h: DOT, br: DOT, rot: 0, str: 1,
      pres: 0, tPres: 0, // presence 0..1 — continuous, not a binary flip
      hitEl: null, lock: null, // hovered pill + its measured rect
      raf: null, last: 0,
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - st.last) / 1000 || 0.016);
      st.last = now;
      const k = 1 - Math.exp(-dt / 0.08); // time-based — Hz-independent

      // Spring toward the pointer, or the locked pill's center.
      const tx = st.lock ? st.lock.x : st.px;
      const ty = st.lock ? st.lock.y : st.py;
      st.vx += ((tx - st.x) * STIFF - st.vx * DAMP) * dt;
      st.vy += ((ty - st.y) * STIFF - st.vy * DAMP) * dt;
      st.x += st.vx * dt;
      st.y += st.vy * dt;

      // Box morph: circle in free roam, the pill's rect when locked.
      st.w += ((st.lock ? st.lock.w : DOT) - st.w) * k;
      st.h += ((st.lock ? st.lock.h : DOT) - st.h) * k;
      st.br += ((st.lock ? 12 : DOT) - st.br) * k;

      // Stretch along the heading, from spring velocity — decays to 1 at rest.
      const speed = Math.hypot(st.vx, st.vy);
      st.str += ((st.lock ? 1 : 1 + Math.min(0.5, speed / 1600)) - st.str) * k;
      const tRot = !st.lock && speed > 40 ? Math.atan2(st.vy, st.vx) : 0;
      st.rot += wrapAngle(tRot - st.rot) * k;

      st.pres += (st.tPres - st.pres) * (1 - Math.exp(-dt / 0.12));

      blob.style.width = `${st.w.toFixed(2)}px`;
      blob.style.height = `${st.h.toFixed(2)}px`;
      blob.style.borderRadius = `${st.br.toFixed(1)}px`;
      // scaleY = 1/str preserves area so the stretch reads as a smear, not a swell.
      blob.style.transform = `translate3d(${(st.x - st.w / 2).toFixed(2)}px, ${(
        st.y - st.h / 2
      ).toFixed(2)}px, 0) rotate(${st.rot.toFixed(3)}rad) scale(${(
        st.pres * st.str
      ).toFixed(3)}, ${(st.pres / st.str).toFixed(3)})`;

      if (st.tPres === 0 && st.pres < 0.003) {
        st.raf = null; // shrunk away — idle until the pointer returns
        return;
      }
      st.raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (st.raf == null) {
        st.last = performance.now();
        st.raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e) => {
      const rr = root.getBoundingClientRect();
      st.px = e.clientX - rr.left;
      st.py = e.clientY - rr.top;
      if (st.pres < 0.01) {
        // Re-entry: pop in at the pointer instead of flying across the stage.
        st.x = st.px;
        st.y = st.py;
        st.vx = st.vy = 0;
      }
      st.tPres = 1;
      const hit = e.target.closest?.("[data-pill]");
      if (hit !== st.hitEl) {
        st.hitEl = hit;
        if (hit) {
          const r = hit.getBoundingClientRect();
          st.lock = {
            x: r.left - rr.left + r.width / 2,
            y: r.top - rr.top + r.height / 2,
            w: r.width,
            h: r.height,
          };
        } else {
          st.lock = null;
        }
      }
      start();
    };
    const onLeave = () => {
      st.tPres = 0; // blob shrinks away; native cursor is back outside the root
      st.hitEl = null;
      st.lock = null;
      start();
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (st.raf != null) cancelAnimationFrame(st.raf);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`relative flex h-full w-full flex-col items-center justify-center gap-[4cqw] overflow-hidden bg-[#07070a] ${
        reducedMotion ? "" : "cursor-none"
      }`}
    >
      <h3 className="font-lab-display text-[7cqw] font-bold uppercase leading-none tracking-tight text-lab-text">
        Soft pointer
      </h3>

      <nav className="z-10 flex flex-wrap items-center justify-center gap-3 px-6">
        {PILLS.map((label) => (
          <button
            key={label}
            type="button"
            data-pill
            // Plain hover styles carry the reduced-motion path; with the blob
            // live they're invisible under the difference inversion.
            className="rounded-full border border-lab-line px-5 py-2.5 font-lab-mono text-[11px] uppercase tracking-[0.25em] text-lab-dim transition-colors hover:border-lab-text hover:text-lab-text"
          >
            {label}
          </button>
        ))}
      </nav>

      {/* The cursor blob — above the pills, inverting whatever it covers. */}
      {!reducedMotion && (
        <div
          ref={blobRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 bg-white mix-blend-difference will-change-transform"
          style={{ width: DOT, height: DOT, borderRadius: DOT, transform: "scale(0)" }}
        />
      )}

      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        The blob is the cursor · park it on a pill
      </p>
    </div>
  );
}
